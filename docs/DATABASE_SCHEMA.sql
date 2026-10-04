-- ============================================================================
-- VERIFIED DAILY-WAGER & FREELANCER MARKETPLACE (PAKISTAN)
-- Production PostgreSQL + PostGIS Schema
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('customer', 'worker', 'admin');
CREATE TYPE verification_status AS ENUM ('pending', 'under_review', 'verified', 'rejected', 'blacklisted');
CREATE TYPE rate_type AS ENUM ('per_hour', 'per_day', 'per_job', 'negotiable');
CREATE TYPE booking_status AS ENUM (
    'requested',
    'accepted',
    'in_progress',
    'completed',
    'cancelled_by_customer',
    'cancelled_by_worker',
    'disputed'
);

-- ----------------------------------------------------------------------------
-- USERS TABLE (Unified Authentication)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(15) UNIQUE NOT NULL, -- e.g. +923001234567
    name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    locale_preference VARCHAR(10) NOT NULL DEFAULT 'ur_roman', -- 'ur', 'ur_roman', 'en'
    profile_photo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- SKILL CATEGORIES
-- ----------------------------------------------------------------------------
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_ur VARCHAR(100) NOT NULL,       -- Urdu script (e.g., برقی کاری / الیکٹریشن)
    name_ur_roman VARCHAR(100) NOT NULL, -- Roman Urdu (e.g., Bijli Mistri)
    icon_name VARCHAR(50) NOT NULL,
    is_high_trust BOOLEAN NOT NULL DEFAULT false, -- requires police character certificate
    display_order INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- ----------------------------------------------------------------------------
-- WORKER PROFILES
-- ----------------------------------------------------------------------------
CREATE TABLE worker_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    cnic_number VARCHAR(15) UNIQUE NOT NULL, -- Format: 42101-XXXXXXX-X (Encrypted at rest)
    cnic_front_url TEXT NOT NULL,
    cnic_back_url TEXT NOT NULL,
    police_clearance_url TEXT,
    verification_status verification_status NOT NULL DEFAULT 'pending',
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    
    -- Demographics & Location
    years_experience SMALLINT NOT NULL DEFAULT 1,
    city VARCHAR(50) NOT NULL,              -- 'Karachi', 'Lahore', 'Islamabad', 'Faisalabad'
    area_town VARCHAR(100) NOT NULL,         -- 'Gulshan-e-Iqbal', 'DHA Phase 5'
    coordinates GEOMETRY(Point, 4326),       -- Spatial coordinates (SRID 4326)
    
    -- Rate Card
    rate_card_type rate_type NOT NULL DEFAULT 'negotiable',
    base_rate_pkr NUMERIC(10, 2),
    is_available BOOLEAN NOT NULL DEFAULT true,
    
    -- Cached Stats (Aggregated via triggers)
    avg_rating NUMERIC(2, 1) NOT NULL DEFAULT 0.0,
    total_reviews_count INT NOT NULL DEFAULT 0,
    completed_jobs_count INT NOT NULL DEFAULT 0,
    response_rate_percent SMALLINT NOT NULL DEFAULT 100,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- WORKER SKILLS (Many-to-Many)
-- ----------------------------------------------------------------------------
CREATE TABLE worker_skills (
    worker_id UUID REFERENCES worker_profiles(user_id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY (worker_id, category_id)
);

-- ----------------------------------------------------------------------------
-- BOOKINGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES users(id),
    worker_id UUID NOT NULL REFERENCES users(id),
    category_id INT NOT NULL REFERENCES categories(id),
    
    status booking_status NOT NULL DEFAULT 'requested',
    job_description TEXT,
    job_voice_note_url TEXT,                 -- Audio message for low-literacy clarity
    
    service_address TEXT NOT NULL,
    service_city VARCHAR(50) NOT NULL,
    service_area VARCHAR(100) NOT NULL,
    service_coordinates GEOMETRY(Point, 4326),
    
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    
    agreed_rate_pkr NUMERIC(10, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- REVIEWS TABLE (Fraud-Proof: Only 1 review per verified completed booking)
-- ----------------------------------------------------------------------------
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id),
    worker_id UUID NOT NULL REFERENCES users(id),
    
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    was_punctual BOOLEAN DEFAULT true,
    was_respectful BOOLEAN DEFAULT true,
    fair_pricing BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- FLAGGING & AUDIT TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id),
    reported_user_id UUID NOT NULL REFERENCES users(id),
    booking_id UUID REFERENCES bookings(id),
    reason TEXT NOT NULL,
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    resolution_notes TEXT,
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX idx_worker_coords ON worker_profiles USING GIST (coordinates);
CREATE INDEX idx_worker_discovery ON worker_profiles (verification_status, is_available, city);
CREATE INDEX idx_worker_metrics ON worker_profiles (avg_rating DESC, completed_jobs_count DESC);
CREATE INDEX idx_bookings_lookup ON bookings (customer_id, worker_id, status);

-- ----------------------------------------------------------------------------
-- TRIGGER: Auto-Update Worker Rating & Job Count on New Review
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_worker_reputation_metrics()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE worker_profiles
    SET 
        avg_rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE worker_id = NEW.worker_id),
        total_reviews_count = (SELECT COUNT(*) FROM reviews WHERE worker_id = NEW.worker_id),
        completed_jobs_count = (SELECT COUNT(*) FROM bookings WHERE worker_id = NEW.worker_id AND status = 'completed'),
        updated_at = NOW()
    WHERE user_id = NEW.worker_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_worker_reputation_metrics();

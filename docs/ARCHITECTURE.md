# Technical Architecture & Systems Specification
## Verified Daily-Wager & Skilled Freelancer Marketplace (Pakistan)

---

### 1. Architectural Overview & Context

In Pakistan, finding reliable home-service professionals (electricians, plumbers, carpenters, painters, maids, mechanics) currently relies on word-of-mouth or roadside contractor stands ("Chowk / Adda"). This traditional model has critical pitfalls:
- Zero background verification or safety assurances for urban families.
- Inconsistent, arbitrary pricing.
- No reputation history or accountability for shoddy work.
- Extreme difficulty for honest, hardworking daily wagers to expand their clientele beyond their immediate mohalla (neighborhood).

This platform bridges this divide by providing:
1. **CNIC & Identity Verification:** Verifying physical National Identity Cards (CNIC) with optional police clearance character certificates for domestic staff (maids, babysitters).
2. **Accessible, Low-Literacy Experience:** Designed for daily wagers using low-cost Android phones (Infinix, Tecno, Redmi) with high-contrast icons, audio voice note prompts, and authentic Urdu / Roman Urdu interfaces.
3. **Hyperlocal PostGIS Matching:** Fast geo-radius queries connecting urban households with workers in their immediate 2km–10km radius.
4. **Verified-Only Reputation System:** Reviews can only be submitted after a verified booking status lifecycle is completed.

---

### 2. Multi-Tier System Topology

```
[ Client Apps ]
  ├─ Customer App (Flutter Android/iOS & Web PWA)
  ├─ Worker App (Flutter Android, Optimized for low-RAM)
  └─ Admin Portal (React / TypeScript Web)
         │
         ▼  (HTTPS / WSS)
[ Cloudflare Edge ]
  ├─ Web Application Firewall (WAF) & Rate Limiting
  ├─ Pakistani Edge POPs (Karachi / Lahore / Islamabad via PTCL / Telenor peering)
  └─ Cloudflare R2 Object Storage (Private Signed URLs for CNICs)
         │
         ▼
[ API Gateway & Backend Services (NestJS / Node.js) ]
  ├─ Auth Service (Phone OTP + JWT + Device Fingerprint)
  ├─ Worker Engine (Profiles, Skill taxonomies, Availability)
  ├─ Discovery & Geo Engine (PostGIS Spatial Queries)
  ├─ Booking State Machine (FSM: Requested ➔ Accepted ➔ Active ➔ Completed)
  ├─ Voice & Media Service (Audio transcoding & compression)
  └─ Review & Trust Aggregator
         │
         ├─── PostgreSQL + PostGIS (Persistent Records)
         ├─── Redis (Sessions, OTP Limits, Radius Geo-cache)
         └─── Pakistani SMS & Voice IVR Gateway (Brandverse / Zong / Telenor Direct API)
```

---

### 3. Identity Verification & CNIC Security

CNIC data in Pakistan is sensitive. The storage pipeline implements strict privacy controls:

1. **Storage Isolation:**
   - CNIC front and back photos are uploaded via pre-signed, short-lived URLs directly to a **private** S3/Cloudflare R2 bucket (`market-identity-private`).
   - Photos are never publicly accessible via direct URLs.
2. **Encryption:**
   - CNIC numbers (e.g., `42101-1234567-1`) are stored using AES-256 field-level encryption with a rotating KMS key.
3. **Admin Verification Workflow:**
   - The admin portal generates 5-minute pre-signed viewing tokens for administrative audits.
   - Once verified, the worker gets a permanent `is_verified` cryptographic badge token.
   - High-trust categories (such as domestic helpers or tutors) require an additional Police Khidmat Markaz Character Certificate.

---

### 4. Hyperlocal PostGIS Query Model

To find verified electricians within 7km of a customer's location in Karachi (e.g. DHA Phase 6):

```sql
SELECT 
    w.user_id,
    u.name,
    u.profile_photo_url,
    w.city,
    w.area_town,
    w.avg_rating,
    w.completed_jobs_count,
    w.base_rate_pkr,
    w.rate_card_type,
    ROUND((ST_Distance(w.coordinates, ST_SetSRID(ST_MakePoint(67.0645, 24.8138), 4326)::geography) / 1000)::numeric, 1) AS distance_km
FROM worker_profiles w
JOIN users u ON w.user_id = u.id
JOIN worker_skills ws ON ws.worker_id = w.user_id
JOIN categories c ON c.id = ws.category_id
WHERE c.slug = 'electrician'
  AND w.verification_status = 'verified'
  AND w.is_available = true
  AND ST_DWithin(
      w.coordinates, 
      ST_SetSRID(ST_MakePoint(67.0645, 24.8138), 4326)::geography, 
      7000 -- 7km radius in meters
  )
ORDER BY distance_km ASC, w.avg_rating DESC
LIMIT 20;
```

---

### 5. Localization & Low-Bandwidth Optimizations

1. **Urdu / Roman Urdu Translation:**
   - Full bilingual / trilingual taxonomy.
   - Nastaliq font rendering support (`Noto Nastaliq Urdu`) with RTL layouts.
   - Roman Urdu for quick text comprehension (*"Naya Kaam Aya Hai"*, *"Kaam Shuru Karein"*).
2. **Voice Memos:**
   - Low-literacy customers and workers can record a 15-second compressed voice note (Opus format, ~20KB) explaining the fault or address.
3. **Data Compression:**
   - WebP image assets compressed to <50KB.
   - Offline-first cache for worker schedules and emergency contact numbers.

---

### 6. Phased Evolution Roadmap

- **Phase 1 (MVP - Built Here):**
  - Worker signup with CNIC upload.
  - Customer search & filter by skill, area, rating, and distance.
  - Booking request FSM (Requested ➔ Accepted ➔ In Progress ➔ Completed).
  - Verified post-job star rating & feedback.
  - Multi-language toggle (Urdu / Roman Urdu / English).
  - Admin verification toggle desk.
- **Phase 2:**
  - Real-time in-app chat & voice notes.
  - JazzCash & Easypaisa automated payment escrow.
  - Automated NADRA Verisys OCR check.
- **Phase 3:**
  - Corporate maintenance contracts (B2B societies & offices).
  - Dispute resolution escalation desks.
  - Worker health micro-insurance & tools financing.

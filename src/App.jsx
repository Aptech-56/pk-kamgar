import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Star,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Mic,
  Square,
  Play,
  Pause,
  Search,
  SlidersHorizontal,
  RotateCcw,
  Volume2,
  Briefcase,
  Calendar,
  Zap,
  Wrench,
  Hammer,
  Paintbrush,
  Wind,
  Sparkles,
  Cog,
  BookOpen,
  UserCheck,
  AlertTriangle,
  Check,
  X,
  Send,
  MessageSquare,
  ArrowRight,
  ArrowUpRight,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe
} from 'lucide-react';

import { translations } from './locales';
import { initialCategories, initialWorkers, initialBookings } from './mockData';
import './App.css';

export default function App() {
  // Locale State: 'ur_roman', 'ur', 'en'
  const [lang, setLang] = useState('ur_roman');
  const t = translations[lang] || translations.en;

  // Active Role: 'customer', 'worker', 'admin'
  const [role, setRole] = useState('customer');

  // Core Data States
  const [workers, setWorkers] = useState(initialWorkers);
  const [bookings, setBookings] = useState(initialBookings);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyPoliceCleared, setOnlyPoliceCleared] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [maxRate, setMaxRate] = useState(3000);
  const [sortBy, setSortBy] = useState('nearest'); // 'nearest', 'rating', 'completed'

  // Modals & Drawers
  const [inspectWorker, setInspectWorker] = useState(null);
  const [bookingWorker, setBookingWorker] = useState(null);
  const [ratingBooking, setRatingBooking] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  // Audio / Voice Note Simulation
  const [isRecording, setIsRecording] = useState(false);
  const [voiceRecorded, setVoiceRecorded] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [demoAudioPlaying, setDemoAudioPlaying] = useState(false);

  // Worker Mode (Current Logged-in Karigar Simulator: w-101 Tariq Mahmood)
  const currentWorkerId = 'w-101';
  const activeWorkerData = workers.find((w) => w.id === currentWorkerId) || workers[0];

  // Helper for showing temporary toast notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync body direction for Urdu RTL
  useEffect(() => {
    document.body.dir = t.dir;
    if (lang === 'ur') {
      document.body.classList.add('lang-ur');
    } else {
      document.body.classList.remove('lang-ur');
    }
  }, [lang, t.dir]);

  // Audio simulation voice synthesizer for low-literacy users
  const playAudioInstruction = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ur' ? 'ur-PK' : 'en-US';
      utterance.rate = 0.9;
      setDemoAudioPlaying(true);
      utterance.onend = () => setDemoAudioPlaying(false);
      utterance.onerror = () => setDemoAudioPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      showToast('🔊 ' + text);
    }
  };

  // Horizontal Scrollable Header Navigation State & Logic
  const headerRef = useRef(null);
  const [canScrollHeaderLeft, setCanScrollHeaderLeft] = useState(false);
  const [canScrollHeaderRight, setCanScrollHeaderRight] = useState(false);

  const checkHeaderScroll = useCallback(() => {
    const el = headerRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth + 4;
    setCanScrollHeaderLeft(hasOverflow && el.scrollLeft > 6);
    setCanScrollHeaderRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    checkHeaderScroll();
    window.addEventListener('resize', checkHeaderScroll);

    // Mouse Wheel: Translate vertical wheel into horizontal scroll when hovering on header and header overflows
    const onWheel = (e) => {
      if (el.scrollWidth > el.clientWidth) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          const canScrollL = el.scrollLeft > 0;
          const canScrollR = el.scrollLeft < el.scrollWidth - el.clientWidth - 1;
          if ((e.deltaY > 0 && canScrollR) || (e.deltaY < 0 && canScrollL)) {
            e.preventDefault();
            el.scrollLeft += e.deltaY;
            checkHeaderScroll();
          }
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('scroll', checkHeaderScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', checkHeaderScroll);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('scroll', checkHeaderScroll);
    };
  }, [checkHeaderScroll]);

  const scrollHeader = (direction) => {
    const el = headerRef.current;
    if (!el) return;
    const isRtl = document.documentElement.getAttribute('dir') === 'rtl' || document.body.classList.contains('lang-ur');
    let distance = direction === 'left' ? -280 : 280;
    if (isRtl) {
      distance = -distance;
    }
    el.scrollBy({ left: distance, behavior: 'smooth' });
    setTimeout(checkHeaderScroll, 320);
  };

  // Filtered & Sorted Workers List
  const filteredWorkers = useMemo(() => {
    return workers
      .filter((w) => {
        // Search query match
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = w.name.toLowerCase().includes(q);
          const matchSkill = w.primarySkill.toLowerCase().includes(q);
          const matchSub = w.subSkills.some((s) => s.toLowerCase().includes(q));
          const matchArea = w.area.toLowerCase().includes(q);
          if (!matchName && !matchSkill && !matchSub && !matchArea) return false;
        }

        // Category
        if (selectedCategory !== 'all' && w.primarySkill !== selectedCategory) return false;

        // City
        if (selectedCity !== 'all' && w.city !== selectedCity) return false;

        // Verified Filter
        if (onlyVerified && w.verificationStatus !== 'verified') return false;

        // Police Clearance Filter
        if (onlyPoliceCleared && !w.hasPoliceClearance) return false;

        // Availability Filter
        if (onlyAvailable && !w.isAvailable) return false;

        // Price Filter
        if (w.rateType === 'per_hour' && w.ratePkr > maxRate) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'nearest') return a.distanceKm - b.distanceKm;
        if (sortBy === 'rating') return b.avgRating - a.avgRating;
        if (sortBy === 'completed') return b.completedJobs - a.completedJobs;
        return 0;
      });
  }, [workers, searchQuery, selectedCategory, selectedCity, onlyVerified, onlyPoliceCleared, onlyAvailable, maxRate, sortBy]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCity('all');
    setOnlyVerified(false);
    setOnlyPoliceCleared(false);
    setOnlyAvailable(false);
    setMaxRate(3000);
    setSortBy('nearest');
  };

  // Smooth scroll to an element ID
  const scrollToId = (id) => {
    if (role !== 'customer') {
      setRole('customer');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Booking Form Submission Handler
  const handleCreateBooking = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newBooking = {
      id: `bk-${Date.now()}`,
      workerId: bookingWorker.id,
      customerName: formData.get('customerName') || 'Fatima Ahmed',
      customerPhone: formData.get('customerPhone') || '+92 300 9876543',
      serviceTitle: `${bookingWorker.primarySkill.toUpperCase()} - ${formData.get('description')?.slice(0, 30) || 'Home Service'}`,
      categoryKey: bookingWorker.primarySkill,
      address: formData.get('address'),
      scheduledTime: formData.get('scheduledTime') || 'Today ASAP',
      status: 'requested',
      hasVoiceNote: voiceRecorded,
      voiceDurationSec: voiceRecorded ? 12 : 0,
      description: formData.get('description') || 'Audio Voice Memo Provided',
      agreedRatePkr: bookingWorker.ratePkr || 800,
      createdAt: 'Just now'
    };

    setBookings([newBooking, ...bookings]);
    setBookingWorker(null);
    setVoiceRecorded(false);
    setIsRecording(false);
    showToast(t.bookingSuccess);
  };

  // Worker updates job status
  const handleUpdateJobStatus = (bookingId, newStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
    showToast(`Status updated to: ${newStatus.toUpperCase()}`);
  };

  // Admin Verification Toggle
  const handleAdminVerifyWorker = (workerId, newStatus) => {
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === workerId
          ? {
              ...w,
              verificationStatus: newStatus,
              hasPoliceClearance: newStatus === 'verified' ? true : w.hasPoliceClearance
            }
          : w
      )
    );
    showToast(newStatus === 'verified' ? 'Worker CNIC Approved & Verified!' : 'Worker Application Rejected');
  };

  // Worker Toggles Online/Offline
  const handleToggleWorkerOnline = () => {
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === currentWorkerId ? { ...w, isAvailable: !w.isAvailable } : w
      )
    );
    showToast(activeWorkerData.isAvailable ? 'Status set to OFFLINE' : 'Status set to ONLINE');
  };

  // Rating Submission Handler
  const handleSubmitRating = (ratingScore, feedbackText, tags) => {
    if (!ratingBooking) return;
    const workerId = ratingBooking.workerId;

    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          const newTotalReviews = w.totalReviews + 1;
          const newAvg = (
            (w.avgRating * w.totalReviews + ratingScore) /
            newTotalReviews
          ).toFixed(1);
          const newReviewObj = {
            id: `rev-${Date.now()}`,
            customerName: ratingBooking.customerName,
            rating: ratingScore,
            date: 'Abhi (Just now)',
            comment: feedbackText || 'Verified completion review.',
            tags: tags
          };
          return {
            ...w,
            avgRating: parseFloat(newAvg),
            totalReviews: newTotalReviews,
            completedJobs: w.completedJobs + 1,
            reviews: [newReviewObj, ...w.reviews]
          };
        }
        return w;
      })
    );

    setRatingBooking(null);
    showToast(t.ratingSuccess);
  };

  // Category Icon Component
  const renderCategoryIcon = (iconName, size = 20) => {
    switch (iconName) {
      case 'Zap': return <Zap size={size} />;
      case 'Wrench': return <Wrench size={size} />;
      case 'Hammer': return <Hammer size={size} />;
      case 'Paintbrush': return <Paintbrush size={size} />;
      case 'Wind': return <Wind size={size} />;
      case 'Sparkles': return <Sparkles size={size} />;
      case 'Cog': return <Cog size={size} />;
      case 'BookOpen': return <BookOpen size={size} />;
      default: return <Briefcase size={size} />;
    }
  };

  return (
    <div className="app-container">
      {/* Lightspark NavEdgeBlur Multi-layer Strip */}
      <div className="nav-edge-blur" aria-hidden="true">
        <div className="nav-edge-layer"></div>
      </div>

      {/* Lightspark Sticky Header Wrapper with Horizontal Scroll Support */}
      <header className="ls-header-wrapper">
        {canScrollHeaderLeft && <div className="ls-header-fade-left" aria-hidden="true" />}
        {canScrollHeaderLeft && (
          <button
            className="ls-header-scroll-arrow left"
            onClick={() => scrollHeader('left')}
            aria-label="Scroll navigation left"
            title="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        <div className="ls-header" ref={headerRef}>
          <div className="ls-header-inner">
            {/* Logo Mark */}
            <a
              href="#"
              className="ls-logo"
              onClick={(e) => {
                e.preventDefault();
                setRole('customer');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <div className="ls-logo-icon">
                <Zap size={18} strokeWidth={2.6} />
              </div>
              <div className="ls-logo-text">
                KAMGAR
              </div>
            </a>

            {/* Navigation Links */}
            <nav className="ls-nav">
              <span className="ls-nav-link" onClick={() => scrollToId('trades')}>
                {t.navTrades}
              </span>
              <span className="ls-nav-link" onClick={() => scrollToId('what-we-do')}>
                {t.navWhatWeDo}
              </span>
              <span className="ls-nav-link" onClick={() => scrollToId('nadra-shield')}>
                {t.navSafety}
              </span>
              <span className="ls-nav-link" onClick={() => scrollToId('how-it-works')}>
                {t.navHowItWorks}
              </span>
              <span
                className="ls-nav-link"
                onClick={() => showToast('Covering 25+ cities: Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Peshawar...')}
              >
                {t.navCoverage}
              </span>
            </nav>

            {/* Header Controls */}
            <div className="ls-header-actions">
              {/* Role Switcher Pill */}
              <div className="ls-role-pill">
                <button
                  className={`ls-role-btn ${role === 'customer' ? 'active' : ''}`}
                  onClick={() => setRole('customer')}
                  title="Customer View"
                >
                  <Search size={13} />
                  <span>{t.customerMode.split(' ')[0]}</span>
                </button>
                <button
                  className={`ls-role-btn ${role === 'worker' ? 'active' : ''}`}
                  onClick={() => setRole('worker')}
                  title="Karigar Dashboard"
                >
                  <Hammer size={13} />
                  <span>{t.workerMode.split(' ')[0]}</span>
                </button>
                <button
                  className={`ls-role-btn ${role === 'admin' ? 'active admin-active' : ''}`}
                  onClick={() => setRole('admin')}
                  title="NADRA Desk"
                >
                  <UserCheck size={13} />
                  <span>{t.adminMode.split(' ')[0]}</span>
                </button>
              </div>

              {/* Compact Language Selector Button */}
              <button
                className="ls-lang-pill-btn"
                onClick={() => setIsLangModalOpen(true)}
                title="Select Language / اپنی زبان منتخب کریں"
              >
                <Globe size={14} color="var(--ls-green)" />
                <span>{lang === 'ur' ? 'اردو' : lang === 'ur_roman' ? 'Roman Urdu' : 'English'}</span>
                <ChevronDown size={12} />
              </button>

              {/* Primary Action Button */}
              <button
                className="ls-btn-header-cta"
                onClick={() => scrollToId('trades')}
              >
                <span>{t.findWorkersBtn}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {canScrollHeaderRight && <div className="ls-header-fade-right" aria-hidden="true" />}
        {canScrollHeaderRight && (
          <button
            className="ls-header-scroll-arrow right"
            onClick={() => scrollHeader('right')}
            aria-label="Scroll navigation right"
            title="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </header>

      {/* ==================================================================== */}
      {/* ROLE 1: CUSTOMER VIEW (LIGHTSPARK REDESIGNED EXPERIENCE)             */}
      {/* ==================================================================== */}
      {role === 'customer' && (
        <main>
          {/* ================= HERO SECTION ================= */}
          {/* ================= PROOFMODE EDITORIAL HERO ================= */}
          <section className="ls-hero" aria-label="Hero">
            {/* Top Proofmode Tag Capsule */}
            <div className="proofmode-tag" style={{ margin: '0 auto 18px', backgroundColor: 'var(--pm-white)' }}>
              <span className="status-dot-green"></span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.04em' }}>
                {t.heroBadge || 'VERIFIED SKILLED LABOR INFRASTRUCTURE'}
              </span>
              <span style={{ color: 'var(--pm-gray-4)' }}>•</span>
              <span style={{ color: 'var(--pm-green-800)', fontWeight: 700 }}>25+ CITIES</span>
            </div>

            {/* Proofmode Subhead as Main Heading */}
            <h1 className="ls-hero-subhead" style={{ marginTop: '16px', fontWeight: 500 }}>
              {t.heroSubtitle || 'Capture, dispatch, and hire verified mistris with open, decentralized, and NADRA-certified trust across Pakistan.'}
            </h1>

            {/* Proofmode Capsule CTAs */}
            <div className="ls-hero-ctas" style={{ marginTop: '24px' }}>
              <button
                className="proofmode-btn proofmode-btn-dark"
                onClick={() => scrollToId('trades')}
              >
                <span>{t.heroCtaPrimary}</span>
                <ArrowRight size={15} />
              </button>

              <button
                className="proofmode-btn proofmode-btn-gradient"
                onClick={() => {
                  setRole('worker');
                  showToast('Switched to Worker Dashboard (Ustaad Mode)');
                }}
              >
                <span>{t.heroCtaSecondary}</span>
                <Hammer size={15} />
              </button>

              <button
                className="proofmode-btn proofmode-btn-outline"
                onClick={() =>
                  playAudioInstruction(
                    lang === 'ur'
                      ? 'کامگار پاکستان میں خوش آمدید۔ تمام کاریگر نادرا شناختی کارڈ اور پولیس سے تصدیق شدہ ہیں۔ اپنا مطلوبہ ہنر منتخب کریں۔'
                      : 'Kamgar Pakistan: Apnay mohallay ke verified bijli, nalka aur AC mistri direct call karein.'
                  )
                }
              >
                <Volume2 size={15} />
                <span>{t.heroAudioGuide}</span>
                {demoAudioPlaying && (
                  <span style={{ display: 'inline-flex', gap: '2px', marginLeft: '4px' }}>
                    <span className="soundwave-bar"></span>
                    <span className="soundwave-bar"></span>
                    <span className="soundwave-bar"></span>
                  </span>
                )}
              </button>
            </div>

            {/* Proofmode Floating Search Capsule */}
            <div className="ls-hero-search" style={{ margin: '30px auto 0' }}>
              <Search size={18} className="ls-search-icon" />
              <input
                type="text"
                className="ls-search-input"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <select
                className="ls-search-select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="all">{t.allCities}</option>
                <option value="Karachi">Karachi (کراچی)</option>
                <option value="Lahore">Lahore (لاہور)</option>
                <option value="Islamabad">Islamabad (اسلام آباد)</option>
              </select>

              <button
                className="ls-search-btn"
                onClick={() => {
                  scrollToId('trades');
                  showToast(`Showing ${filteredWorkers.length} Karigars`);
                }}
              >
                <span>{t.findWorkersBtn}</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Proofmode Signature Hero Proof Strip with Floating Metadata Tags */}
            <div className="pm-hero-proof-strip">
              {/* Photo Card 1: Electrician Tariq */}
              <div className="pm-proof-card">
                <img
                  src="/images/hero_electrician_tariq.jpg"
                  alt="Verified Electrician Tariq"
                />
                <div className="pm-proof-tags-overlay">
                  <div className="proofmode-tag">
                    <MapPin size={13} color="var(--pm-forest)" />
                    <span>Karachi, DHA Phase 5</span>
                  </div>
                  <div className="proofmode-tag">
                    <ShieldCheck size={13} color="var(--pm-forest)" />
                    <span>NADRA CNIC Cleared</span>
                    <span className="proofmode-tag proofmode-tag-green" style={{ minHeight: '22px', padding: '2px 8px' }}>YES</span>
                  </div>
                  <div className="proofmode-tag">
                    <Clock size={13} color="var(--pm-forest)" />
                    <span>Arrival: 18 mins</span>
                  </div>
                </div>
              </div>

              {/* Photo Card 2: AC Tech Muhammad */}
              <div className="pm-proof-card" style={{ height: '360px' }}>
                <img
                  src="/images/hero_ac_tech_muhammad.jpg"
                  alt="Verified AC Tech Muhammad"
                />
                <div className="pm-proof-tags-overlay">
                  <div className="proofmode-tag">
                    <MapPin size={13} color="var(--pm-forest)" />
                    <span>Lahore, Gulberg III</span>
                  </div>
                  <div className="proofmode-tag">
                    <CheckCircle size={13} color="var(--pm-forest)" />
                    <span>Police Cleared</span>
                    <span className="proofmode-tag proofmode-tag-green" style={{ minHeight: '22px', padding: '2px 8px' }}>YES</span>
                  </div>
                  <div className="proofmode-tag">
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                    <span>Rating: 4.95 (48 jobs)</span>
                  </div>
                </div>
              </div>

              {/* Photo Card 3: Plumber Kamran */}
              <div className="pm-proof-card">
                <img
                  src="/images/hero_plumber_kamran.jpg"
                  alt="Verified Plumber Kamran"
                />
                <div className="pm-proof-tags-overlay">
                  <div className="proofmode-tag">
                    <MapPin size={13} color="var(--pm-forest)" />
                    <span>Islamabad, F-7/2</span>
                  </div>
                  <div className="proofmode-tag">
                    <ShieldCheck size={13} color="var(--pm-forest)" />
                    <span>Biometric Match</span>
                    <span className="proofmode-tag proofmode-tag-green" style={{ minHeight: '22px', padding: '2px 8px' }}>99.8%</span>
                  </div>
                  <div className="proofmode-tag">
                    <span>Rate: Rs 750 / hr</span>
                  </div>
                </div>
              </div>

              {/* Photo Card 4: Carpenter Bilal */}
              <div className="pm-proof-card" style={{ height: '340px' }}>
                <img
                  src="/images/hero_carpenter_bilal.jpg"
                  alt="Verified Carpenter Bilal"
                />
                <div className="pm-proof-tags-overlay">
                  <div className="proofmode-tag">
                    <MapPin size={13} color="var(--pm-forest)" />
                    <span>Rawalpindi, Saddar</span>
                  </div>
                  <div className="proofmode-tag">
                    <Zap size={13} color="var(--pm-forest)" />
                    <span>Direct Settlement</span>
                    <span className="proofmode-tag proofmode-tag-green" style={{ minHeight: '22px', padding: '2px 8px' }}>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= PROOFMODE STEPPED PIXEL CORE GREEN SECTION ================= */}
          <section className="pm-stepped-section" id="what-we-do" aria-label="Ecosystem Capabilities">
            <div className="pm-stepped-inner">
              <h2 className="pm-stepped-heading">
                Meet Kamgar's open verification ecosystem for skilled labor
              </h2>

              <ul className="pm-check-badges-row">
                <li className="pm-check-badge-item">
                  <span className="pm-check-circle"><Check size={15} /></span>
                  <span>Prove Chain of Trust (NADRA)</span>
                </li>
                <li className="pm-check-badge-item">
                  <span className="pm-check-circle"><Check size={15} /></span>
                  <span>100% Direct Earnings</span>
                </li>
                <li className="pm-check-badge-item">
                  <span className="pm-check-circle"><Check size={15} /></span>
                  <span>Police Record Cleared</span>
                </li>
                <li className="pm-check-badge-item">
                  <span className="pm-check-circle"><Check size={15} /></span>
                  <span>Low-Literacy Voice Memos</span>
                </li>
              </ul>

              {/* Proofmode 40px Rounded Feature Blocks (.proofmode-block-gradient) */}
              <div className="pm-blocks-grid">
                {/* Block 1: 01 Capture & Dispatch */}
                <div className="pm-block-card col-6">
                  <div>
                    <h3 className="pm-block-subtitle">Proofmode Dispatch</h3>
                    <h4 className="pm-block-title">01 Instant Karigar Dispatch</h4>
                    <p className="pm-block-desc">{t.stage1Desc}</p>
                  </div>
                  <div className="pm-block-action" onClick={() => scrollToId('trades')}>
                    <span className="pm-block-tag-btn">Find Workers</span>
                    <span className="pm-block-arrow-btn"><ArrowRight size={16} /></span>
                  </div>
                </div>

                {/* Block 2: 02 NADRA Shield */}
                <div className="pm-block-card col-6" id="nadra-shield">
                  <div>
                    <h3 className="pm-block-subtitle">Government Grade</h3>
                    <h4 className="pm-block-title">02 NADRA Biometric Shield</h4>
                    <p className="pm-block-desc">{t.stage2Desc}</p>
                  </div>
                  <div
                    className="pm-block-action"
                    onClick={() => {
                      setOnlyVerified(true);
                      scrollToId('trades');
                      showToast('Filtered: Showing only 100% CNIC Verified Karigars');
                    }}
                  >
                    <span className="pm-block-tag-btn">Verify CNIC</span>
                    <span className="pm-block-arrow-btn"><ShieldCheck size={16} /></span>
                  </div>
                </div>

                {/* Block 3: 03 Voice Memos */}
                <div className="pm-block-card col-6">
                  <div>
                    <h3 className="pm-block-subtitle">Accessible Audio AI</h3>
                    <h4 className="pm-block-title">03 Voice-First Memos</h4>
                    <p className="pm-block-desc">{t.stage3Desc}</p>
                  </div>
                  <div
                    className="pm-block-action"
                    onClick={() => {
                      playAudioInstruction(
                        lang === 'ur'
                          ? 'استاد جی! گھر کا مین بریکر ٹرپ ہو رہا ہے۔ فوری تشریف لائیں۔'
                          : 'Ustaad ji! Main switch board mein short circuit hai, fori aakar check karein.'
                      );
                    }}
                  >
                    <span className="pm-block-tag-btn">Play Voice Memo</span>
                    <span className="pm-block-arrow-btn"><Volume2 size={16} /></span>
                  </div>
                </div>

                {/* Block 4: 04 Direct Economics */}
                <div className="pm-block-card col-6">
                  <div>
                    <h3 className="pm-block-subtitle">Fair Economics</h3>
                    <h4 className="pm-block-title">04 100% Direct Settlement</h4>
                    <p className="pm-block-desc">{t.stage4Desc}</p>
                  </div>
                  <div
                    className="pm-block-action"
                    onClick={() => showToast('Zero Commission: 100% direct to Karigars')}
                  >
                    <span className="pm-block-tag-btn">Direct Pay</span>
                    <span className="pm-block-arrow-btn"><ArrowRight size={16} /></span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= PARTNER MARQUEE (PROOFMODE "WE SUPPORT") ================= */}
          <section className="ls-marquee-wrapper" aria-label="Trusted Clearances">
            <div className="pm-marquee-header">WE SUPPORT & PARTNER WITH</div>
            <div className="ls-marquee-track">
              {/* First Set of Items */}
              <div className="ls-marquee-item">
                <ShieldCheck size={16} color="var(--pm-green-800)" />
                <span>NADRA Verisys Biometric</span>
              </div>
              <div className="ls-marquee-item">
                <ShieldCheck size={16} color="var(--pm-forest)" />
                <span>Punjab Police Khidmat Markaz</span>
              </div>
              <div className="ls-marquee-item">
                <CheckCircle size={16} color="var(--pm-green-700)" />
                <span>Sindh Police Character Cleared</span>
              </div>
              <div className="ls-marquee-item">
                <CheckCircle size={16} color="var(--pm-forest)" />
                <span>KP Police Verification Desk</span>
              </div>
              <div className="ls-marquee-item">
                <Sparkles size={16} color="#d97706" />
                <span>Saylani Welfare Trust Partner</span>
              </div>
              <div className="ls-marquee-item">
                <Zap size={16} color="#ca8a04" />
                <span>JazzCash Direct Pay</span>
              </div>
              <div className="ls-marquee-item">
                <Lock size={16} color="var(--pm-green-700)" />
                <span>Easypaisa Instant Settlement</span>
              </div>

              {/* Duplicated Set for Smooth Loop */}
              <div className="ls-marquee-item">
                <ShieldCheck size={16} color="var(--pm-green-800)" />
                <span>NADRA Verisys Biometric</span>
              </div>
              <div className="ls-marquee-item">
                <ShieldCheck size={16} color="var(--pm-forest)" />
                <span>Punjab Police Khidmat Markaz</span>
              </div>
              <div className="ls-marquee-item">
                <CheckCircle size={16} color="var(--pm-green-700)" />
                <span>Sindh Police Character Cleared</span>
              </div>
              <div className="ls-marquee-item">
                <CheckCircle size={16} color="var(--pm-forest)" />
                <span>KP Police Verification Desk</span>
              </div>
              <div className="ls-marquee-item">
                <Sparkles size={16} color="#d97706" />
                <span>Saylani Welfare Trust Partner</span>
              </div>
              <div className="ls-marquee-item">
                <Zap size={16} color="#ca8a04" />
                <span>JazzCash Direct Pay</span>
              </div>
              <div className="ls-marquee-item">
                <Lock size={16} color="var(--pm-green-700)" />
                <span>Easypaisa Instant Settlement</span>
              </div>
            </div>
          </section>

          {/* ================= INTERACTIVE MARKETPLACE / DIRECTORY ================= */}
          <section id="trades" className="ls-marketplace-section" aria-label="Karigar Directory">
            <div className="ls-section-header">
              <span className="ls-section-tag">DIRECTORY</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <h2 className="ls-section-title">
                  {t.categoriesTitle} ({filteredWorkers.length})
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--ls-text-dim)' }}>
                  <span className="status-dot-green"></span>
                  <span>{filteredWorkers.filter((w) => w.isAvailable).length} Available Right Now</span>
                </div>
              </div>
            </div>

            {/* Category Selector Rail */}
            <div className="ls-category-rail">
              <button
                className={`ls-cat-pill ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                <span>{t.allCategories}</span>
                <span className="ls-cat-pill-count">{workers.length}</span>
              </button>

              {initialCategories.map((cat) => {
                const count = workers.filter((w) => w.primarySkill === cat.slug).length;
                const isSelected = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    className={`ls-cat-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(isSelected ? 'all' : cat.slug)}
                  >
                    <span>{renderCategoryIcon(cat.iconName, 15)}</span>
                    <span>{t[cat.nameKey]}</span>
                    <span className="ls-cat-pill-count">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Filter Bar Controls */}
            <div className="ls-controls-bar">
              <div className="ls-controls-left">
                {/* Verified Filter Chip */}
                <div
                  className={`ls-toggle-chip ${onlyVerified ? 'active' : ''}`}
                  onClick={() => setOnlyVerified(!onlyVerified)}
                >
                  <ShieldCheck size={14} />
                  <span>{t.verifiedOnly}</span>
                </div>

                {/* Police Clearance Chip */}
                <div
                  className={`ls-toggle-chip ${onlyPoliceCleared ? 'active-cyan' : ''}`}
                  onClick={() => setOnlyPoliceCleared(!onlyPoliceCleared)}
                >
                  <CheckCircle size={14} />
                  <span>{t.policeClearedOnly}</span>
                </div>

                {/* Online Availability Chip */}
                <div
                  className={`ls-toggle-chip ${onlyAvailable ? 'active' : ''}`}
                  onClick={() => setOnlyAvailable(!onlyAvailable)}
                >
                  <span className="status-dot-green"></span>
                  <span>{t.availableNow}</span>
                </div>
              </div>

              <div className="ls-controls-right">
                {/* Max Hourly Rate Slider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--ls-text-muted)' }}>
                  <span>Max: Rs {maxRate}</span>
                  <input
                    type="range"
                    min="400"
                    max="3000"
                    step="100"
                    value={maxRate}
                    onChange={(e) => setMaxRate(Number(e.target.value))}
                    style={{ accentColor: 'var(--ls-green)', cursor: 'pointer', width: '90px' }}
                  />
                </div>

                {/* Sort Dropdown */}
                <select
                  className="ls-sort-dropdown"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="nearest">{t.sortNearest}</option>
                  <option value="rating">{t.sortRating}</option>
                  <option value="completed">{t.sortCompleted}</option>
                </select>

                {/* Reset Filters */}
                <button
                  onClick={handleResetFilters}
                  style={{
                    color: 'var(--ls-text-dim)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem'
                  }}
                  title="Reset Filters"
                >
                  <RotateCcw size={13} />
                  <span>{t.resetFilters}</span>
                </button>
              </div>
            </div>

            {/* Workers Cards Grid */}
            <div className="ls-workers-grid">
              {filteredWorkers.map((worker) => (
                <div key={worker.id} className="ls-worker-card">
                  <div>
                    {/* Top Row: Avatar & Bio */}
                    <div className="ls-worker-top">
                      <div className="ls-worker-avatar-wrap">
                        <img
                          src={worker.photoUrl}
                          alt={worker.name}
                          className="ls-worker-avatar"
                          loading="lazy"
                        />
                        <div
                          className={`ls-worker-online-badge ${worker.isAvailable ? 'online' : 'offline'}`}
                          title={worker.isAvailable ? 'Online' : 'Offline'}
                        ></div>
                      </div>

                      <div className="ls-worker-meta">
                        <h4 className="ls-worker-name">{worker.name}</h4>
                        <div className="ls-worker-area">
                          <MapPin size={13} color="var(--ls-text-dim)" />
                          <span>
                            {worker.area}, {worker.city} • {worker.distanceKm} km {t.away}
                          </span>
                        </div>

                        <div className="ls-worker-badges-row">
                          {worker.verificationStatus === 'verified' && (
                            <span className="ls-badge-verified">
                              <ShieldCheck size={11} />
                              {t.verifiedBadge}
                            </span>
                          )}
                          {worker.hasPoliceClearance && (
                            <span className="ls-badge-police">
                              <CheckCircle size={11} />
                              {t.policeBadge}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Subskills Chips */}
                    <div className="ls-worker-subskills" style={{ marginTop: '14px' }}>
                      {worker.subSkills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="ls-subskill-tag">
                          {skill}
                        </span>
                      ))}
                      {worker.subSkills.length > 3 && (
                        <span className="ls-subskill-tag" style={{ color: 'var(--ls-text-dim)' }}>
                          +{worker.subSkills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    {/* Metrics Box */}
                    <div className="ls-worker-metrics">
                      <div className="ls-metric-item">
                        <span className="ls-metric-val">
                          <Star size={13} fill="var(--ls-amber)" color="var(--ls-amber)" />
                          {worker.avgRating}
                        </span>
                        <span className="ls-metric-lbl">({worker.totalReviews}) reviews</span>
                      </div>

                      <div className="ls-metric-item">
                        <span className="ls-metric-val">{worker.completedJobs}</span>
                        <span className="ls-metric-lbl">{t.jobsDone}</span>
                      </div>

                      <div className="ls-metric-item">
                        <span className="ls-metric-val" style={{ color: 'var(--ls-green)' }}>
                          {worker.responseRate}%
                        </span>
                        <span className="ls-metric-lbl">{t.responseRate}</span>
                      </div>
                    </div>

                    {/* Price & Audio Bio Row */}
                    <div className="ls-worker-price-row" style={{ marginTop: '16px' }}>
                      <div>
                        <span className="ls-rate-amount">Rs {worker.ratePkr}</span>
                        <span className="ls-rate-unit">/{t.perHour}</span>
                      </div>

                      <button
                        className="ls-btn-bio-audio"
                        onClick={() =>
                          playAudioInstruction(
                            lang === 'ur'
                              ? `${worker.name}۔ ${worker.bioUrdu}`
                              : `${worker.name}. ${worker.bioRoman}`
                          )
                        }
                        title="Listen to Worker Voice Bio"
                      >
                        <Volume2 size={13} />
                        <span>{t.listenBio}</span>
                      </button>
                    </div>

                    {/* Actions Row */}
                    <div className="ls-worker-actions" style={{ marginTop: '16px' }}>
                      {/* Direct Phone Dial */}
                      <a
                        href={`tel:${worker.phone}`}
                        className="ls-btn-icon-action phone"
                        title={t.callNow}
                      >
                        <Phone size={15} />
                      </a>

                      {/* Direct WhatsApp */}
                      <a
                        href={`https://wa.me/${worker.whatsapp}?text=Salam%20Ustaad%20Ji%2C%20Kamgar%20se%20rabta%20kiya%20hai`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ls-btn-icon-action whatsapp"
                        title={t.whatsAppNow}
                      >
                        <MessageSquare size={15} />
                      </a>

                      {/* View Details Profile */}
                      <button
                        className="ls-btn-secondary"
                        style={{ padding: '8px 12px', fontSize: '0.8rem', justifyContent: 'center' }}
                        onClick={() => setInspectWorker(worker)}
                      >
                        <span>{t.viewProfile}</span>
                      </button>

                      {/* Instant Book */}
                      <button
                        className="ls-btn-card-book"
                        onClick={() => setBookingWorker(worker)}
                      >
                        <span>{t.bookNow}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredWorkers.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '80px 20px',
                  background: 'var(--pm-white)',
                  borderRadius: '28px',
                  border: '1.5px solid var(--pm-gray-3)',
                  boxShadow: 'var(--shadow-card)',
                  marginTop: '24px'
                }}
              >
                <AlertTriangle size={36} color="var(--pm-forest)" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '1.3rem', color: 'var(--pm-forest)', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
                  No Karigars Found Matching Criteria
                </h3>
                <p style={{ color: 'var(--pm-gray-5)', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Try resetting the filters or switching city/trade.
                </p>
                <button className="ls-btn-secondary" onClick={handleResetFilters}>
                  <RotateCcw size={14} />
                  <span>{t.resetFilters}</span>
                </button>
              </div>
            )}
          </section>

          {/* ================= TESTIMONIALS SECTION ================= */}
          <section className="ls-testimonials-section" aria-label="Customer Testimonials">
            <div className="ls-testimonials-inner">
              <div className="ls-section-header">
                <span className="ls-section-tag">VERIFIED PROOF</span>
                <h2 className="ls-section-title">{t.testimonialsTitle}</h2>
              </div>

              <div className="ls-testimonials-grid">
                {/* Review 1 */}
                <div className="ls-testimonial-card">
                  <div className="ls-stars-row">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>
                  <p className="ls-testimonial-quote">
                    "Finding a reliable electrician in DHA was a nightmare. Through Kamgar, Tariq bhai arrived in 18 minutes with full toolset and fixed our tripping inverter wiring without unnecessary excuses."
                  </p>
                  <div className="ls-testimonial-author">
                    <span className="ls-author-name">Zubair Farooq</span>
                    <span className="ls-author-loc">DHA Phase 5, Karachi</span>
                  </div>
                </div>

                {/* Review 2 */}
                <div className="ls-testimonial-card">
                  <div className="ls-stars-row">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>
                  <p className="ls-testimonial-quote">
                    "The CNIC check gives tremendous peace of mind. As a woman managing house maintenance alone, knowing the worker's police record is pre-cleared made all the difference."
                  </p>
                  <div className="ls-testimonial-author">
                    <span className="ls-author-name">Dr. Ayesha Malik</span>
                    <span className="ls-author-loc">Gulberg III, Lahore</span>
                  </div>
                </div>

                {/* Review 3 */}
                <div className="ls-testimonial-card">
                  <div className="ls-stars-row">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>
                  <p className="ls-testimonial-quote">
                    "Sent a 15-second voice note in Urdu describing our AC leak. The technician arrived with the exact pipe connectors needed. No back-and-forth haggling. 10/10 service."
                  </p>
                  <div className="ls-testimonial-author">
                    <span className="ls-author-name">Bilal Mansoor</span>
                    <span className="ls-author-loc">F-7/2, Islamabad</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ==================================================================== */}
      {/* ROLE 2: WORKER MODE (USTAAD / KARIGAR DASHBOARD)                     */}
      {/* ==================================================================== */}
      {role === 'worker' && (
        <main className="ls-dashboard-wrapper">
          {/* Header Banner */}
          <div className="ls-dash-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <img
                src={activeWorkerData.photoUrl}
                alt={activeWorkerData.name}
                style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-lg)', objectFit: 'cover' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '1.4rem', color: 'var(--pm-forest)', fontFamily: 'var(--font-serif)' }}>{activeWorkerData.name}</h2>
                  <span className="ls-badge-verified">
                    <ShieldCheck size={12} />
                    {t.verifiedBadge}
                  </span>
                </div>
                <p style={{ color: 'var(--pm-gray-5)', fontSize: '0.85rem', marginTop: '4px' }}>
                  {activeWorkerData.primarySkill.toUpperCase()} • {activeWorkerData.area}, {activeWorkerData.city}
                </p>
              </div>
            </div>

            {/* Online Toggle Switch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--pm-gray-5)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  {t.onlineStatus}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: activeWorkerData.isAvailable ? 'var(--pm-green-700)' : 'var(--pm-gray-5)' }}>
                  {activeWorkerData.isAvailable ? t.statusOnline : t.statusOffline}
                </span>
              </div>
              <button
                className={`ls-btn-${activeWorkerData.isAvailable ? 'primary' : 'secondary'}`}
                style={{ padding: '10px 20px' }}
                onClick={handleToggleWorkerOnline}
              >
                {activeWorkerData.isAvailable ? 'Go Offline' : 'Go Online'}
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="ls-dash-stats-grid">
            <div className="ls-dash-stat-card">
              <span className="ls-stat-label">{t.newRequestsCount}</span>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--pm-green-700)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
                {bookings.filter((b) => b.workerId === currentWorkerId && b.status === 'requested').length}
              </div>
            </div>

            <div className="ls-dash-stat-card">
              <span className="ls-stat-label">{t.activeJobsCount}</span>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--pm-cyan)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
                {bookings.filter((b) => b.workerId === currentWorkerId && (b.status === 'accepted' || b.status === 'in_progress')).length}
              </div>
            </div>

            <div className="ls-dash-stat-card">
              <span className="ls-stat-label">{t.completedJobsCount}</span>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--pm-forest)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
                {activeWorkerData.completedJobs}
              </div>
            </div>
          </div>

          {/* Bookings Queue */}
          <div className="ls-section-header">
            <span className="ls-section-tag">JOB QUEUE</span>
            <h3 className="ls-section-title">{t.incomingRequests}</h3>
          </div>

          <div>
            {bookings
              .filter((b) => b.workerId === currentWorkerId)
              .map((job) => (
                <div key={job.id} className="ls-booking-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--pm-black)', fontFamily: 'var(--font-serif)' }}>
                          {job.customerName}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            background:
                              job.status === 'requested'
                                ? 'rgba(234, 179, 8, 0.15)'
                                : job.status === 'accepted' || job.status === 'in_progress'
                                ? 'rgba(56, 189, 248, 0.15)'
                                : 'var(--pm-green-100)',
                            color:
                              job.status === 'requested'
                                ? '#b45309'
                                : job.status === 'accepted' || job.status === 'in_progress'
                                ? '#0284c7'
                                : 'var(--pm-green-900)',
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)'
                          }}
                        >
                          {job.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--pm-gray-5)', marginTop: '4px' }}>
                        <MapPin size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                        {job.address}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--pm-forest)', fontFamily: 'var(--font-mono)' }}>
                        Rs {job.agreedRatePkr}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--pm-gray-5)', display: 'block' }}>
                        {job.scheduledTime}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--pm-forest)', background: 'var(--pm-gray-1)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--pm-gray-3)' }}>
                    "{job.description}"
                  </p>

                  {job.hasVoiceNote && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        className="ls-btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                        onClick={() =>
                          playAudioInstruction(
                            lang === 'ur'
                              ? 'گاہک کی آواز: برائے مہربانی جلدی آئیں، کام فوری نوعیت کا ہے۔'
                              : 'Customer Voice Note: Baraye meherbani jaldi aaiye, emergency kaam hai.'
                          )
                        }
                      >
                        <Volume2 size={14} color="var(--ls-green)" />
                        <span>{t.listenVoiceMemo}</span>
                      </button>
                    </div>
                  )}

                  {/* State Action Transitions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                    {job.status === 'requested' && (
                      <>
                        <button
                          className="ls-btn-primary"
                          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                          onClick={() => handleUpdateJobStatus(job.id, 'accepted')}
                        >
                          <Check size={14} />
                          <span>{t.acceptJob}</span>
                        </button>
                        <button
                          className="ls-btn-secondary"
                          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                          onClick={() => handleUpdateJobStatus(job.id, 'cancelled')}
                        >
                          <X size={14} />
                          <span>{t.declineJob}</span>
                        </button>
                      </>
                    )}

                    {job.status === 'accepted' && (
                      <button
                        className="ls-btn-primary"
                        style={{ padding: '8px 18px', fontSize: '0.85rem', background: 'var(--ls-cyan)' }}
                        onClick={() => handleUpdateJobStatus(job.id, 'in_progress')}
                      >
                        <Hammer size={14} />
                        <span>{t.startJob}</span>
                      </button>
                    )}

                    {job.status === 'in_progress' && (
                      <button
                        className="ls-btn-primary"
                        style={{ padding: '8px 18px', fontSize: '0.85rem', background: 'var(--ls-green)' }}
                        onClick={() => {
                          handleUpdateJobStatus(job.id, 'completed');
                          setRatingBooking(job);
                        }}
                      >
                        <CheckCircle size={14} />
                        <span>{t.completeJob}</span>
                      </button>
                    )}

                    {job.status === 'completed' && (
                      <span style={{ fontSize: '0.82rem', color: 'var(--ls-green)', fontWeight: 600 }}>
                        ✓ Job Successfully Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </main>
      )}

      {/* ==================================================================== */}
      {/* ROLE 3: ADMIN MODE (NADRA & POLICE VERIFICATION DESK)                */}
      {/* ==================================================================== */}
      {role === 'admin' && (
        <main className="ls-dashboard-wrapper">
          <div className="ls-section-header">
            <span className="ls-section-tag">NADRA & POLICE AUDIT DESK</span>
            <h2 className="ls-section-title">{t.adminTitle}</h2>
            <p style={{ color: 'var(--ls-text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
              {t.adminSubtitle}
            </p>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            {workers.map((w) => (
              <div
                key={w.id}
                style={{
                  background: 'var(--pm-white)',
                  border: '1.5px solid var(--pm-gray-3)',
                  borderRadius: '24px',
                  padding: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '20px',
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <img
                    src={w.photoUrl}
                    alt={w.name}
                    style={{ width: '64px', height: '64px', borderRadius: '18px', objectFit: 'cover', border: '1px solid var(--pm-gray-3)' }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--pm-black)', fontFamily: 'var(--font-serif)' }}>{w.name}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--pm-gray-5)', marginTop: '4px' }}>
                      CNIC: <span style={{ color: 'var(--pm-forest)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{w.cnicNumber}</span> • {w.city} ({w.area})
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <span className="ls-badge-verified">
                        Status: {w.verificationStatus.toUpperCase()}
                      </span>
                      <span className="ls-badge-police">
                        Police Record: {w.hasPoliceClearance ? 'CLEAR' : 'PENDING'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {w.verificationStatus !== 'verified' ? (
                    <button
                      className="ls-btn-primary"
                      onClick={() => handleAdminVerifyWorker(w.id, 'verified')}
                    >
                      <ShieldCheck size={16} />
                      <span>{t.approveBtn}</span>
                    </button>
                  ) : (
                    <button
                      className="ls-btn-secondary"
                      style={{ color: 'var(--ls-danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      onClick={() => handleAdminVerifyWorker(w.id, 'unverified')}
                    >
                      <XCircle size={16} />
                      <span>Revoke Verification</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ==================================================================== */}
      {/* MODALS & DRAWERS (LIGHTSPARK OBSIDIAN GLASS)                         */}
      {/* ==================================================================== */}

      {/* 1. Worker Profile Modal */}
      {inspectWorker && (
        <div className="ls-modal-backdrop" onClick={() => setInspectWorker(null)}>
          <div className="ls-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="ls-modal-close-btn" onClick={() => setInspectWorker(null)}>
              <X size={18} />
            </button>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '24px' }}>
              <img
                src={inspectWorker.photoUrl}
                alt={inspectWorker.name}
                style={{ width: '80px', height: '80px', borderRadius: '22px', objectFit: 'cover', border: '1px solid var(--pm-gray-3)' }}
              />
              <div>
                <h3 style={{ fontSize: '1.45rem', color: 'var(--pm-forest)', fontFamily: 'var(--font-serif)' }}>{inspectWorker.name}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--pm-gray-5)', marginTop: '4px' }}>
                  {inspectWorker.primarySkill.toUpperCase()} • {inspectWorker.area}, {inspectWorker.city}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <span className="ls-badge-verified">
                    <ShieldCheck size={12} />
                    {t.verifiedBadge}
                  </span>
                  <span className="ls-badge-police">
                    <CheckCircle size={12} />
                    {t.policeBadge}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <span className="ls-form-label">Biography</span>
              <p style={{ fontSize: '0.92rem', color: 'var(--pm-forest)', lineHeight: 1.6 }}>
                {lang === 'ur' ? inspectWorker.bioUrdu : inspectWorker.bioRoman}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <span className="ls-form-label">Specialized Skills</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {inspectWorker.subSkills.map((s, idx) => (
                  <span key={idx} className="ls-subskill-tag" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <span className="ls-form-label">Verified Customer Reviews ({inspectWorker.reviews.length})</span>
              <div style={{ display: 'grid', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                {inspectWorker.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{ background: 'var(--pm-gray-1)', padding: '12px 16px', borderRadius: '16px', border: '1px solid var(--pm-gray-3)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--pm-black)', fontFamily: 'var(--font-serif)' }}>
                        {rev.customerName}
                      </span>
                      <div className="ls-stars-row">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={11} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--pm-gray-5)', marginTop: '4px' }}>
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <a
                href={`tel:${inspectWorker.phone}`}
                className="ls-btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Phone size={14} />
                <span>{t.callNow}</span>
              </a>
              <button
                className="proofmode-btn proofmode-btn-gradient"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  setBookingWorker(inspectWorker);
                  setInspectWorker(null);
                }}
              >
                <span>{t.bookNow}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Instant Booking Modal with Voice Memo Simulator */}
      {bookingWorker && (
        <div className="ls-modal-backdrop" onClick={() => setBookingWorker(null)}>
          <div className="ls-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="ls-modal-close-btn" onClick={() => setBookingWorker(null)}>
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.35rem', color: 'var(--pm-forest)', fontFamily: 'var(--font-serif)', marginBottom: '6px' }}>
              {t.bookTitle} {bookingWorker.name}
            </h3>
            <p style={{ color: 'var(--pm-gray-5)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Rate: Rs {bookingWorker.ratePkr} / {t.perHour} • Direct settlement
            </p>

            <form onSubmit={handleCreateBooking}>
              <div className="ls-form-group">
                <label className="ls-form-label">{t.customerName}</label>
                <input
                  type="text"
                  name="customerName"
                  className="ls-form-input"
                  defaultValue="Farhan Qureshi"
                  required
                />
              </div>

              <div className="ls-form-group">
                <label className="ls-form-label">{t.customerPhone}</label>
                <input
                  type="tel"
                  name="customerPhone"
                  className="ls-form-input"
                  defaultValue="+92 321 8765432"
                  required
                />
              </div>

              <div className="ls-form-group">
                <label className="ls-form-label">{t.yourAddress}</label>
                <input
                  type="text"
                  name="address"
                  className="ls-form-input"
                  placeholder={t.addressPlaceholder}
                  defaultValue="House 42, Street 8, Phase 2, DHA"
                  required
                />
              </div>

              <div className="ls-form-group">
                <label className="ls-form-label">{t.preferredTime}</label>
                <input
                  type="text"
                  name="scheduledTime"
                  className="ls-form-input"
                  defaultValue="Today within 1 hour (Urgent)"
                  required
                />
              </div>

              {/* Voice Memo Audio Note Option */}
              <div
                style={{
                  background: 'var(--pm-gray-1)',
                  border: '1.5px solid var(--pm-gray-3)',
                  borderRadius: '20px',
                  padding: '16px',
                  marginBottom: '20px'
                }}
              >
                <span className="ls-form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--pm-forest)' }}>
                  <Mic size={15} color="var(--pm-green-700)" />
                  {t.voiceNoteTitle}
                </span>
                <p style={{ fontSize: '0.82rem', color: 'var(--pm-gray-5)', marginBottom: '12px' }}>
                  {t.voiceNoteDesc}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {!voiceRecorded ? (
                    <button
                      type="button"
                      className="ls-btn-secondary"
                      style={{
                        padding: '8px 16px',
                        fontSize: '0.82rem',
                        borderColor: isRecording ? 'var(--ls-danger)' : 'var(--pm-gray-3)',
                        color: isRecording ? 'var(--ls-danger)' : 'var(--pm-forest)'
                      }}
                      onClick={() => {
                        if (!isRecording) {
                          setIsRecording(true);
                          setTimeout(() => {
                            setIsRecording(false);
                            setVoiceRecorded(true);
                            showToast('Voice memo recorded: 12 seconds');
                          }, 3000);
                        }
                      }}
                    >
                      <Mic size={14} />
                      <span>{isRecording ? t.recording : t.recordAudio}</span>
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        className="proofmode-btn proofmode-btn-gradient"
                        style={{ padding: '6px 16px', fontSize: '0.8rem' }}
                        onClick={() => {
                          playAudioInstruction('Audio memo: Ghar ka switchboard aur circuit breaker short hai.');
                        }}
                      >
                        <Play size={13} fill="currentColor" />
                        <span>{t.playVoiceNote} (12s)</span>
                      </button>
                      <button
                        type="button"
                        style={{ color: 'var(--pm-gray-5)', fontSize: '0.78rem' }}
                        onClick={() => setVoiceRecorded(false)}
                      >
                        {t.deleteVoiceNote}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="ls-form-group">
                <label className="ls-form-label">{t.describeJob}</label>
                <textarea
                  name="description"
                  className="ls-form-textarea"
                  rows="3"
                  placeholder={t.describePlaceholder}
                ></textarea>
              </div>

              <button
                type="submit"
                className="proofmode-btn proofmode-btn-dark"
                style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
              >
                <span>{t.submitBooking}</span>
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Rating & Review Modal */}
      {ratingBooking && (
        <div className="ls-modal-backdrop" onClick={() => setRatingBooking(null)}>
          <div className="ls-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="ls-modal-close-btn" onClick={() => setRatingBooking(null)}>
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.35rem', color: 'var(--pm-forest)', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
              {t.ratingTitle}
            </h3>
            <p style={{ color: 'var(--pm-gray-5)', fontSize: '0.85rem', marginBottom: '24px' }}>
              {t.starRatingPrompt}
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
              {[1, 2, 3, 4, 5].map((starNum) => (
                <button
                  key={starNum}
                  type="button"
                  style={{ color: '#f59e0b', padding: '6px', background: 'none' }}
                  onClick={() => handleSubmitRating(starNum, 'Great job done!', ['Punctual', 'Respectful'])}
                >
                  <Star size={32} fill="currentColor" />
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
              <span className="ls-subskill-tag">{t.wasPunctual}</span>
              <span className="ls-subskill-tag">{t.wasRespectful}</span>
              <span className="ls-subskill-tag">{t.fairPrice}</span>
            </div>

            <button
              className="proofmode-btn proofmode-btn-dark"
              style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
              onClick={() => handleSubmitRating(5, 'Excellent service and verified behavior.', ['Punctual', 'Fair Price'])}
            >
              <span>{t.submitRating}</span>
              <CheckCircle size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Language Quick-Switcher Pill (Always Accessible) */}
      <button
        className="ls-floating-lang-btn"
        onClick={() => setIsLangModalOpen(true)}
        title="Select Language / اپنی زبان منتخب کریں"
      >
        <Globe size={15} color="var(--pm-green-700)" />
        <span>{lang === 'ur' ? 'اردو' : lang === 'ur_roman' ? 'Roman Urdu' : 'English'}</span>
        <ChevronDown size={13} />
      </button>

      {/* Dedicated Language Selection Modal */}
      {isLangModalOpen && (
        <div className="ls-modal-backdrop" onClick={() => setIsLangModalOpen(false)}>
          <div className="ls-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <button className="ls-modal-close-btn" onClick={() => setIsLangModalOpen(false)}>
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Globe size={22} color="var(--pm-forest)" />
              <h3 style={{ fontSize: '1.4rem', color: 'var(--pm-forest)', fontFamily: 'var(--font-serif)' }}>
                {t.languageSectionTitle || 'Select Your Language'}
              </h3>
            </div>
            <p style={{ color: 'var(--pm-gray-5)', fontSize: '0.88rem', marginBottom: '24px' }}>
              {t.languageSectionSubtitle || 'Choose how you want to experience Kamgar.'}
            </p>

            <div style={{ display: 'grid', gap: '14px' }}>
              {/* Option 1: Roman Urdu */}
              <div
                className={`ls-lang-card ${lang === 'ur_roman' ? 'active' : ''}`}
                style={{ padding: '20px' }}
                onClick={() => {
                  setLang('ur_roman');
                  setIsLangModalOpen(false);
                  showToast('Language: Roman Urdu (رومن اردو)');
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--pm-black)', fontFamily: 'var(--font-serif)' }}>
                        Roman Urdu (رومن اردو)
                      </span>
                      <span className="ls-lang-card-badge">{t.langRomanTag}</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--pm-gray-5)', marginTop: '4px' }}>
                      {t.langRomanDesc}
                    </p>
                  </div>
                  {lang === 'ur_roman' && (
                    <CheckCircle size={20} color="var(--pm-green-700)" />
                  )}
                </div>
              </div>

              {/* Option 2: Urdu Nastaliq */}
              <div
                className={`ls-lang-card ${lang === 'ur' ? 'active' : ''}`}
                style={{ padding: '20px' }}
                onClick={() => {
                  setLang('ur');
                  setIsLangModalOpen(false);
                  showToast('زبان تبدیل ہو گئی: اردو (نستعلیق رسم الخط)');
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--pm-black)', fontFamily: 'var(--font-serif)' }}>
                        اردو (نستعلیق خط)
                      </span>
                      <span className="ls-lang-card-badge">{t.langUrduTag}</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--pm-gray-5)', marginTop: '4px' }}>
                      {t.langUrduDesc}
                    </p>
                  </div>
                  {lang === 'ur' && (
                    <CheckCircle size={20} color="var(--pm-green-700)" />
                  )}
                </div>
              </div>

              {/* Option 3: English */}
              <div
                className={`ls-lang-card ${lang === 'en' ? 'active' : ''}`}
                style={{ padding: '20px' }}
                onClick={() => {
                  setLang('en');
                  setIsLangModalOpen(false);
                  showToast('Language changed to: English');
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--pm-black)', fontFamily: 'var(--font-serif)' }}>
                        English
                      </span>
                      <span className="ls-lang-card-badge">{t.langEnTag}</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--pm-gray-5)', marginTop: '4px' }}>
                      {t.langEnDesc}
                    </p>
                  </div>
                  {lang === 'en' && (
                    <CheckCircle size={20} color="var(--pm-green-700)" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="ls-toast">
          <CheckCircle size={16} color="var(--ls-green)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* FOOTER (PROOFMODE EDITORIAL SPLIT FOOTER)                            */}
      {/* ==================================================================== */}
      <footer className="ls-footer">
        {/* Proofmode Signature Purple Banner Block */}
        <div style={{ padding: '60px 24px 0' }}>
          <div className="pm-footer-banner">
            <div>
              <div className="proofmode-tag" style={{ background: 'var(--pm-white)', marginBottom: '16px', color: 'var(--pm-forest)' }}>
                <span className="status-dot-green"></span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.78rem' }}>
                  BASELINE | A LABOR EMPOWERMENT INITIATIVE
                </span>
              </div>
              <h2 className="pm-footer-banner-title">
                Help us empower the skilled daily-wagers of Pakistan.
              </h2>
              <p style={{ marginTop: '12px', fontSize: '0.95rem', color: 'var(--pm-forest)', opacity: 0.9, maxWidth: '580px', lineHeight: 1.6 }}>
                Built upon open verification, NADRA biometric standards, character clearances, and decentralized zero-commission dispatch.
              </p>
            </div>

            <div className="pm-footer-banner-action">
              <button
                className="proofmode-btn proofmode-btn-dark"
                onClick={() => {
                  setRole('worker');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  showToast('Switched to Karigar Portal');
                }}
              >
                <span>Join as a Verified Karigar</span>
                <ArrowRight size={16} />
              </button>

              <button
                className="proofmode-btn proofmode-btn-outline"
                style={{ background: 'rgba(255,255,255,0.85)', borderColor: 'var(--pm-forest)', color: 'var(--pm-forest)' }}
                onClick={() => {
                  scrollToId('trades');
                }}
              >
                <span>Hire a Mistri Now</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="ls-footer-inner">
          <div className="ls-footer-top">
            <div className="ls-footer-brand-col">
              <div className="ls-logo">
                <div className="ls-logo-icon">
                  <Zap size={18} strokeWidth={2.6} />
                </div>
                <div className="ls-logo-text">
                  KAMGAR
                </div>
              </div>
              <p className="ls-footer-tagline">{t.footerTagline}</p>
              <div className="ls-footer-status">
                <span className="status-dot-green"></span>
                <span>{t.footerStatus} • 99.99%</span>
              </div>
            </div>

            <div>
              <h5 className="ls-footer-heading">Services</h5>
              <ul className="ls-footer-links">
                <li className="ls-footer-link" onClick={() => { setSelectedCategory('electrician'); scrollToId('trades'); }}>
                  Electricians
                </li>
                <li className="ls-footer-link" onClick={() => { setSelectedCategory('plumber'); scrollToId('trades'); }}>
                  Plumbers
                </li>
                <li className="ls-footer-link" onClick={() => { setSelectedCategory('ac_tech'); scrollToId('trades'); }}>
                  AC Technicians
                </li>
                <li className="ls-footer-link" onClick={() => { setSelectedCategory('carpenter'); scrollToId('trades'); }}>
                  Carpenters
                </li>
              </ul>
            </div>

            <div>
              <h5 className="ls-footer-heading">Safety & Trust</h5>
              <ul className="ls-footer-links">
                <li className="ls-footer-link" onClick={() => scrollToId('nadra-shield')}>
                  NADRA Biometric
                </li>
                <li className="ls-footer-link" onClick={() => scrollToId('nadra-shield')}>
                  Police Clearance
                </li>
                <li className="ls-footer-link" onClick={() => setRole('admin')}>
                  Admin Desk
                </li>
                <li className="ls-footer-link" onClick={() => showToast('Zero Commission Promise: 100% to Karigars')}>
                  Zero Commission
                </li>
              </ul>
            </div>

            <div>
              <h5 className="ls-footer-heading">Coverage</h5>
              <ul className="ls-footer-links">
                <li className="ls-footer-link" onClick={() => { setSelectedCity('Karachi'); scrollToId('trades'); }}>
                  Karachi
                </li>
                <li className="ls-footer-link" onClick={() => { setSelectedCity('Lahore'); scrollToId('trades'); }}>
                  Lahore
                </li>
                <li className="ls-footer-link" onClick={() => { setSelectedCity('Islamabad'); scrollToId('trades'); }}>
                  Islamabad
                </li>
                <li className="ls-footer-link" onClick={() => showToast('Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Gujranwala')}>
                  +22 More Cities
                </li>
              </ul>
            </div>
          </div>

          <div className="ls-footer-bottom">
            <div>© {new Date().getFullYear()} Kamgar Technologies Inc. Built with Proofmode design system.</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => setLang('en')}>English</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setLang('ur_roman')}>Roman Urdu</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setLang('ur')}>اردو</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

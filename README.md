# Kamgar Pakistan (کامگار پاکستان)
### Verified Daily-Wager & Skilled Freelancer Marketplace Platform

Kamgar is a trust-based, rating-driven marketplace tailored for Pakistan, connecting households with verified daily-wagers (electricians, plumbers, carpenters, painters, AC technicians, housemaids, and mechanics) with CNIC-based verification and a low-literacy friendly UX.

---

## 🚀 Live Local Application
The application is currently running locally at:
- **Local URL:** [http://localhost:5173/](http://localhost:5173/)
- **Network URL:** `http://192.168.100.4:5173/` (accessible across your local Wi-Fi on Android/iPhone)

---

## 📱 Core Features Implemented in the MVP

### 1. Trilingual Localization & RTL
- **Roman Urdu:** Phonetic Urdu (*"Apnay Mohallay Mein CNIC Tasdeeq Shuda Karigar Talaash Karein"*), preferred by millions of smartphone users across Pakistan.
- **Urdu (اردو):** Authentic Nastaliq font typography with automatic Right-to-Left (RTL) layout rendering.
- **English:** Clean, modern interface for urban households.

### 2. Multi-Role Interactive Experience
- **Customer View (Ghar Walay):**
  - Search by skill, city (Karachi, Lahore, Islamabad), and neighborhood/town.
  - Filters: CNIC-verified only, Police character clearance, availability status, maximum hourly rate, and radius distance.
  - Sort by nearest distance (PostGIS model), highest rating, and most jobs completed.
  - Worker cards with verified badges, real customer reviews, rate cards, and direct dial (`tel:+92...`) / WhatsApp (`wa.me/...`) links.
  - **Voice Memo Audio Recorder:** For customers who prefer speaking in Urdu/Punjabi/Pashto rather than typing long text descriptions.
- **Worker Mode (Ustaad / Daily-Wager Dashboard):**
  - Designed specifically for low-literacy users: High contrast, large touch targets, minimal text dependence.
  - **Audio Guidance Button ("Suniye"):** Voice prompt narrator explaining incoming status.
  - Real-time Online/Offline toggle.
  - Incoming job feed with customer details and **Audio Voice Note playback**.
  - Finite State Machine: `Requested` ➔ `Accepted` ➔ `In Progress` ➔ `Completed`.
- **Admin Verification Desk (NADRA / Police Audit):**
  - Inspection queue for worker applications.
  - Front and Back CNIC document review.
  - Police Khidmat Markaz Character Certificate inspector.
  - 1-click Approve or Revoke trust badges.
- **Verified Rating & Trust System:**
  - Post-job star rating (1–5 stars) triggerable only after job completion.
  - Tags: "Punctual (Waqt par pohanchay)", "Respectful (Izzat dar)", "Fair Price (Munasib daam)".
  - Live metric recalculation for average ratings and completed job counters.

---

## 🛠 Project Structure

```
├── docs/
│   ├── ARCHITECTURE.md       # Full multi-tier architecture & PostGIS query specs
│   └── DATABASE_SCHEMA.sql   # Production PostgreSQL DDL with spatial indexing & triggers
├── src/
│   ├── App.jsx               # Core application logic & multi-role state machine
│   ├── App.css               # Styling for desktop and mobile views
│   ├── index.css             # Glassmorphism design tokens & Nastaliq fonts
│   ├── locales.js            # Translation dictionaries (Urdu, Roman Urdu, English)
│   └── mockData.js           # Realistic Pakistani worker profiles, reviews, and bookings
├── index.html                # Entry point with Google Fonts preloads
└── package.json
```

---

## 🏃 Commands

```bash
# Start local development server
npm run dev

# Build production bundle
npm run build
```

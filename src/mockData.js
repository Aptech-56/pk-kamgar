export const initialCategories = [
  {
    id: 1,
    slug: 'electrician',
    nameKey: 'electrician',
    iconName: 'Zap',
    color: '#eab308',
    count: 28
  },
  {
    id: 2,
    slug: 'plumber',
    nameKey: 'plumber',
    iconName: 'Wrench',
    color: '#0284c7',
    count: 24
  },
  {
    id: 3,
    slug: 'carpenter',
    nameKey: 'carpenter',
    iconName: 'Hammer',
    color: '#d97706',
    count: 19
  },
  {
    id: 4,
    slug: 'painter',
    nameKey: 'painter',
    iconName: 'Paintbrush',
    color: '#ec4899',
    count: 15
  },
  {
    id: 5,
    slug: 'ac_tech',
    nameKey: 'ac_tech',
    iconName: 'Wind',
    color: '#06b6d4',
    count: 32
  },
  {
    id: 6,
    slug: 'maid',
    nameKey: 'maid',
    iconName: 'Sparkles',
    color: '#8b5cf6',
    count: 41
  },
  {
    id: 7,
    slug: 'mechanic',
    nameKey: 'mechanic',
    iconName: 'Cog',
    color: '#ef4444',
    count: 22
  },
  {
    id: 8,
    slug: 'tutor',
    nameKey: 'tutor',
    iconName: 'BookOpen',
    color: '#10b981',
    count: 18
  }
];

export const initialWorkers = [
  {
    id: 'w-101',
    name: 'Tariq Mahmood (استاد طارق)',
    phone: '+92 300 8291456',
    whatsapp: '923008291456',
    photoUrl: '/images/hero_electrician_tariq.jpg',
    primarySkill: 'electrician',
    subSkills: ['Breaker Repair', 'Inverter / UPS Wiring', 'Ceiling Fan Rewinding', 'Solar Installation'],
    experienceYears: 12,
    city: 'Karachi',
    area: 'Gulshan-e-Iqbal Block 13-D',
    distanceKm: 1.8,
    rateType: 'per_hour',
    ratePkr: 700,
    isAvailable: true,
    verificationStatus: 'verified',
    cnicNumber: '42101-7654321-3',
    hasPoliceClearance: true,
    avgRating: 4.9,
    totalReviews: 48,
    completedJobs: 134,
    responseRate: 98,
    bioUrdu: '۱۲ سال کا تجربہ۔ یو پی ایس، انورٹر اور مکمل گھریلو و کمرشل وائرنگ کے ماہر۔ نادرا ویریفائیڈ۔',
    bioRoman: '12 saal ka tajarba. UPS, Inverter wiring aur fan repairing ke mahir.',
    reviews: [
      {
        id: 'rev-1',
        customerName: 'Zubair Farooq (DHA Phase 5)',
        rating: 5,
        date: '2 din pehle',
        comment: 'Tariq bhai bohot waqt ke paband niklay. Inverter wiring aisi saaf ki ke koi jhanjhat nahi raha. Very honest man.',
        tags: ['Punctual', 'Respectful', 'Fair Price']
      },
      {
        id: 'rev-2',
        customerName: 'Dr. Samina',
        rating: 5,
        date: '1 hafta pehle',
        comment: 'Fast work, reasonable charges, verified CNIC gives high peace of mind.',
        tags: ['Punctual', 'Respectful']
      }
    ]
  },
  {
    id: 'w-102',
    name: 'Mohammad Asif (استاد آصف)',
    phone: '+92 321 4455889',
    whatsapp: '923214455889',
    photoUrl: '/images/hero_plumber_kamran.jpg',
    primarySkill: 'plumber',
    subSkills: ['Geyser Repair', 'Underground Leak Detection', 'Motor Fitting', 'Bathroom Sanity'],
    experienceYears: 9,
    city: 'Karachi',
    area: 'DHA Phase 6',
    distanceKm: 3.4,
    rateType: 'per_job',
    ratePkr: 1200,
    isAvailable: true,
    verificationStatus: 'verified',
    cnicNumber: '42301-4433221-1',
    hasPoliceClearance: false,
    avgRating: 4.8,
    totalReviews: 36,
    completedJobs: 92,
    responseRate: 95,
    bioUrdu: 'ہر قسم کے گیزر، واٹر پمپ موٹر اور سینیٹری کے کام کی مکمل تسلی بخش سروس۔',
    bioRoman: 'Har qism ke geyser, water motor aur underground leakages ka behtareen hal.',
    reviews: [
      {
        id: 'rev-3',
        customerName: 'Hamza Sheikh',
        rating: 5,
        date: '3 din pehle',
        comment: 'Geyser ka burner safai kardi, paani bilkul theek garam ho raha hai.',
        tags: ['Punctual', 'Fair Price']
      }
    ]
  },
  {
    id: 'w-103',
    name: 'Shakeel Ahmed (شکیل اے سی والے)',
    phone: '+92 333 9081234',
    whatsapp: '923339081234',
    photoUrl: '/images/hero_ac_tech_muhammad.jpg',
    primarySkill: 'ac_tech',
    subSkills: ['Inverter AC Gas Filling', 'Master Service / Washing', 'PCB Card Diagnostic', 'Dismantling'],
    experienceYears: 7,
    city: 'Islamabad',
    area: 'F-7 / Blue Area',
    distanceKm: 2.1,
    rateType: 'per_job',
    ratePkr: 2000,
    isAvailable: true,
    verificationStatus: 'verified',
    cnicNumber: '37405-1928374-5',
    hasPoliceClearance: true,
    avgRating: 4.9,
    totalReviews: 62,
    completedJobs: 178,
    responseRate: 99,
    bioUrdu: 'انورٹر اے سی سروس، گیس چارجنگ اور کمپریسر تبدیلی۔ نادرا و اسلام آباد پولیس ویریفائیڈ۔',
    bioRoman: 'Inverter AC gas filling aur PCB cards checking. Islamabad police cleared.',
    reviews: [
      {
        id: 'rev-4',
        customerName: 'Brigadier (R) Tariq',
        rating: 5,
        date: 'Kal',
        comment: 'Bohot achi service. Inverter AC ki cooling zabardast ho gayi hai.',
        tags: ['Punctual', 'Respectful', 'Fair Price']
      }
    ]
  },
  {
    id: 'w-104',
    name: 'Abdul Razzaq (استاد عبدالرزاق)',
    phone: '+92 301 5567890',
    whatsapp: '923015567890',
    photoUrl: '/images/hero_carpenter_bilal.jpg',
    primarySkill: 'carpenter',
    subSkills: ['Door Lock Repair', 'Kitchen Cabinet Polish', 'Bed Assembly', 'Window Mesh'],
    experienceYears: 15,
    city: 'Lahore',
    area: 'Gulberg III / Main Market',
    distanceKm: 4.2,
    rateType: 'per_hour',
    ratePkr: 800,
    isAvailable: false,
    verificationStatus: 'verified',
    cnicNumber: '35202-9988776-3',
    hasPoliceClearance: true,
    avgRating: 4.7,
    totalReviews: 29,
    completedJobs: 84,
    responseRate: 90,
    bioUrdu: 'لکڑی کا ہر قسم کا کام، الماری کی مرمت، ڈور لاکس اور لیمینیشن۔',
    bioRoman: 'Lakri ka har qism ka kaam, door lock fixing aur kitchen cabinets polish.',
    reviews: [
      {
        id: 'rev-5',
        customerName: 'Fatima Malik',
        rating: 5,
        date: '5 din pehle',
        comment: 'Master of woodcraft! Fixed our sliding wardrobe door in 30 minutes.',
        tags: ['Punctual', 'Fair Price']
      }
    ]
  },
  {
    id: 'w-105',
    name: 'Farzana Bibi (فرزانہ بی بی - گھریلو ملازمہ)',
    phone: '+92 345 6789012',
    whatsapp: '923456789012',
    photoUrl: '/images/worker_maid_farzana.jpg',
    primarySkill: 'maid',
    subSkills: ['Deep Cleaning', 'Cooking (Desi Food)', 'Babysitting', 'Ironing Clothes'],
    experienceYears: 8,
    city: 'Karachi',
    area: 'Clifton Block 2',
    distanceKm: 2.5,
    rateType: 'per_day',
    ratePkr: 1500,
    isAvailable: true,
    verificationStatus: 'verified',
    cnicNumber: '42201-1234567-8',
    hasPoliceClearance: true,
    avgRating: 5.0,
    totalReviews: 44,
    completedJobs: 110,
    responseRate: 100,
    bioUrdu: 'مکمل نادرا تصدیق شدہ اور تھانہ کلفٹن سے پولیس کریکٹر سرٹیفکیٹ موجود ہے۔ کھانا پکانے اور گھر کی صفائی کی ماہر۔',
    bioRoman: 'NADRA tasdeeq shuda aur Police Khidmat Markaz cleared. Khana pakana aur safai.',
    reviews: [
      {
        id: 'rev-6',
        customerName: 'Mrs. Mansoor (Bath Island)',
        rating: 5,
        date: '1 hafta pehle',
        comment: 'Extremely trustworthy, honest and cooks delicious rotti and salan.',
        tags: ['Punctual', 'Respectful', 'Fair Price']
      }
    ]
  },
  {
    id: 'w-106',
    name: 'Imran Nazir (عمران نذیر - پینٹر)',
    phone: '+92 312 8899001',
    whatsapp: '923128899001',
    photoUrl: '/images/worker_painter_imran.jpg',
    primarySkill: 'painter',
    subSkills: ['Plastic Emulsion', 'Distemper', 'Roof Seepage Coating', 'Texture Paint'],
    experienceYears: 6,
    city: 'Lahore',
    area: 'Johar Town Phase 2',
    distanceKm: 5.0,
    rateType: 'negotiable',
    ratePkr: 0,
    isAvailable: true,
    verificationStatus: 'pending',
    cnicNumber: '35201-8374659-1',
    hasPoliceClearance: false,
    avgRating: 4.6,
    totalReviews: 14,
    completedJobs: 32,
    responseRate: 88,
    bioUrdu: 'برائٹ، ڈولکس اور برگ پینٹس کا مکمل کام۔ دیواروں کی سیم (سیلن) کا پکا علاج۔',
    bioRoman: 'Dewaron ki seen/seepage ka paka ilaaj aur plastic emulsion paint.',
    reviews: [
      {
        id: 'rev-7',
        customerName: 'Kamran Akmal',
        rating: 4,
        date: '2 hafte pehle',
        comment: 'Kaam acha kiya lekin 30 min late pohanchay.',
        tags: ['Fair Price']
      }
    ]
  },
  {
    id: 'w-107',
    name: 'Sir Bilal Qureshi (سر بلال - ریاضی و فزکس)',
    phone: '+92 334 7711223',
    whatsapp: '923347711223',
    photoUrl: '/images/hero_electrician_tariq.jpg',
    primarySkill: 'tutor',
    subSkills: ['Matric / FSc Math', 'O-Levels Physics', 'Federal Board', 'Entry Test Prep'],
    experienceYears: 5,
    city: 'Islamabad',
    area: 'G-11 / F-11',
    distanceKm: 3.1,
    rateType: 'per_hour',
    ratePkr: 1500,
    isAvailable: true,
    verificationStatus: 'verified',
    cnicNumber: '37405-8877665-9',
    hasPoliceClearance: true,
    avgRating: 4.9,
    totalReviews: 21,
    completedJobs: 45,
    responseRate: 97,
    bioUrdu: 'ایم ایس سی فزکس، قائد اعظم یونیورسٹی۔ میٹرک، ایف ایس سی اور او لیولز کی ہوم ٹیوشن۔',
    bioRoman: 'M.Sc Physics (QAU). Matric, FSc aur O-Levels ki home tuition.',
    reviews: [
      {
        id: 'rev-8',
        customerName: 'Chaudhry Waqas',
        rating: 5,
        date: '3 din pehle',
        comment: 'Bohot sabar se bache ko concepts samjhaye. Highly recommended tutor.',
        tags: ['Punctual', 'Respectful']
      }
    ]
  },
  {
    id: 'w-108',
    name: 'Master Rashid (استاد راشد مکینک)',
    phone: '+92 300 2349876',
    whatsapp: '923002349876',
    photoUrl: '/images/hero_ac_tech_muhammad.jpg',
    primarySkill: 'mechanic',
    subSkills: ['Emergency Car Breakdown', 'Bike Tuning & Oil Change', 'Brake Pad Replacement', 'Car Battery Jumpstart'],
    experienceYears: 14,
    city: 'Karachi',
    area: 'Saddar / Saddar Auto Market',
    distanceKm: 4.7,
    rateType: 'per_job',
    ratePkr: 800,
    isAvailable: true,
    verificationStatus: 'verified',
    cnicNumber: '42101-3322110-5',
    hasPoliceClearance: false,
    avgRating: 4.8,
    totalReviews: 53,
    completedJobs: 165,
    responseRate: 96,
    bioUrdu: 'راستے میں گاڑی یا موٹر سائیکل خراب ہو جائے تو ایمرجنسی سروس۔ بریک اور انجن کے ماہر۔',
    bioRoman: 'Roadside emergency car and motorcycle tuning & jumpstart.',
    reviews: [
      {
        id: 'rev-9',
        customerName: 'Noman Ali',
        rating: 5,
        date: 'Pichle maheene',
        comment: 'Shahrah-e-Faisal pe gaadi band ho gayi thi. Master Rashid 20 min mein pohnch gaye.',
        tags: ['Punctual', 'Respectful', 'Fair Price']
      }
    ]
  }
];

export const initialBookings = [
  {
    id: 'bk-501',
    workerId: 'w-101',
    customerName: 'Khurram Shehzad',
    customerPhone: '+92 333 4455667',
    serviceTitle: 'Electrician - Inverter Board Repair',
    categoryKey: 'electrician',
    address: 'House 42-B, Street 14, Block 7, Gulshan-e-Iqbal, Karachi',
    scheduledTime: 'Today at 4:30 PM',
    status: 'requested', // requested -> accepted -> in_progress -> completed
    hasVoiceNote: true,
    voiceDurationSec: 14,
    description: 'Bhai jaan, hall ka main switchboard trip kar raha hai aur pankha band ho gaya hai. Plz jaldi aaiye ga.',
    agreedRatePkr: 700,
    createdAt: '15 mins ago'
  },
  {
    id: 'bk-502',
    workerId: 'w-101',
    customerName: 'Mrs. Daniyal',
    customerPhone: '+92 300 1122334',
    serviceTitle: 'Electrician - Solar DB Box Inspection',
    categoryKey: 'electrician',
    address: 'Flat 304, Al-Ghafoor Heights, Gulshan Block 13, Karachi',
    scheduledTime: 'Tomorrow at 11:00 AM',
    status: 'accepted',
    hasVoiceNote: false,
    voiceDurationSec: 0,
    description: 'Solar hybrid inverter giving fault code 04. Need technician to check solar wiring.',
    agreedRatePkr: 1500,
    createdAt: '2 hours ago'
  }
];

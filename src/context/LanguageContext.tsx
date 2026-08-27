import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Declare global window types to ensure zero TypeScript errors
declare global {
  interface Window {
    APP_STATE: {
      currentLang: 'en' | 'hi' | 'mr';
      selectedCategory: string;
      searchQuery: string;
      sortBy: 'proximity' | 'rating' | 'rate_low' | 'rate_high';
    };
    setLanguage: (langCode: 'en' | 'hi' | 'mr') => void;
    I18N_DICTIONARY: typeof I18N_DICTIONARY;
    WORKERS_RAW_DATA: typeof WORKERS_RAW_DATA;
  }
}

export type SupportedLanguage = 'en' | 'hi' | 'mr';

// ==========================================
// 1. DECOUPLED APP STATE LAYER
// ==========================================
if (typeof window !== 'undefined') {
  const initialLang = (localStorage.getItem('colabour_lang') as SupportedLanguage) || 'en';
  window.APP_STATE = {
    currentLang: (['en', 'hi', 'mr'].includes(initialLang) ? initialLang : 'en') as SupportedLanguage,
    selectedCategory: 'all',
    searchQuery: '',
    sortBy: 'proximity',
  };
}

// ==========================================
// 2. COMPLETE (100%) TRILINGUAL DICTIONARY
// ==========================================
export const I18N_DICTIONARY = {
  en: {
    // Brand & Protocol
    appName: 'CoLabour',
    brandProtocol: '⚡ 100% DIRECT DECENTRALIZED WORK PROTOCOL',
    brandShort: '100% Direct Protocol',
    tagline: 'Connecting Local Skilled Trades with Instant Direct Work',
    zeroCommission: '0% Platform Commission',
    instantPayouts: '100% Direct Payouts',

    // Hero & Landing Page
    heroTitle1: 'Direct Gig Work.',
    heroTitle2: 'Zero Cut.',
    heroTitle3: 'Instant UPI.',
    heroSubtitle: 'CoLabour matches customers directly with skilled verified tradespeople. Direct GPS radar dispatching, real-time UPI settlement, and 0% platform middlemen fees.',
    browseWorkers: 'Browse Workers',
    joinAsWorker: 'Join as Worker',
    aadhaarVerified: 'Aadhaar Verified',
    directUpi: '100% Direct UPI',
    liveGpsRadar: 'Live GPS Radar',
    availableNearby: '⚡ Available Nearby',
    ratePerHour: 'Rate / Hour',
    perHour: '/hr',
    gpsRadarDispatch: 'GPS Radar Dispatch Engine',
    radarDescription: 'Auto-scans within 15km perimeter with real-time ETA & distance triangulation.',
    zeroCommissionDeduction: '0% Commission Deduction',
    directP2P: 'Direct P2P',
    activeWorkers: 'Active Workers',
    jobsSettled: 'Jobs Settled',
    avgRating: 'Avg Rating',
    onTimeRate: 'On-Time Rate',
    skillDirectory: 'Skill Directory',
    exploreTradeCategories: 'Explore Trade Categories',
    exploreTradeSubtitle: 'Find skilled, verified local professionals ready for instant dispatch',
    exploreListings: 'Explore Listings',
    simple3Step: 'Simple 3-Step Protocol',
    howCoLabourOperates: 'How CoLabour Operates',
    howItWorksSubtitle: 'From GPS radar proximity match to instant UPI settlement',
    step1Title: '1. Radar Proximity Match',
    step1Desc: 'Browse verified professionals triangulated by live GPS distance and trade category.',
    step2Title: '2. Instant Job Dispatch',
    step2Desc: "Set your schedule, select hours, and dispatch a real-time job request to the worker's dashboard.",
    step3Title: '3. Direct UPI POS Settlement',
    step3Desc: 'Scan QR or launch UPI directly to the worker. Zero middleman cut with instant 3D audio receipt.',
    ctaTitle: "Empowering India's Blue-Collar Workforce",
    ctaSubtitle: 'Join thousands of customers and skilled professionals leveraging fair pricing, direct UPI payments, and zero middleman exploitation.',
    createFreeAccount: 'Create Free Account',
    browseDirectory: 'Browse Worker Directory',
    copyrightText: '© 2026 CoLabour • ⚡ 100% Direct Decentralized Work Protocol • 0% Commission',

    // Navigation
    home: 'Home',
    findWorkers: 'Find Workers',
    dashboard: 'Dashboard',
    signIn: 'Sign In',
    getStarted: 'Get Started',
    signOut: 'Sign Out',
    workerDashboard: 'Worker Dashboard',
    customerDashboard: 'Customer Dashboard',
    adminPanel: 'Admin Panel',

    // Directory Header & Badges
    directoryBadge: '⚡ LIVE GIG WORKFORCE DIRECTORY',
    directoryTitle: 'Find Verified Professionals',
    directorySubtitle: 'Direct connection with 0% platform commission, dynamic customer ratings & verified GPS tracking',
    calibrateGps: 'Calibrate Live GPS',
    gpsSignalCalibrated: 'GPS Signal Calibrated',
    gpsActive: 'GPS Active',

    // Search & Sort Controls
    searchPlaceholder: 'Search by name, trade skill, or location...',
    sortByLabel: 'Sort by',
    sortProximity: '📍 Nearest Live GPS',
    sortRating: '⭐ Dynamic Top Rated',
    sortRateLow: '💰 Lowest Rate',
    sortRateHigh: '💎 Highest Rate',
    allCategories: 'All Categories',
    clearFilters: 'Clear filters',
    noWorkersFound: 'No workers found matching your criteria.',

    // Trade Categories (All 9 Active Verticals)
    all: 'All Categories',
    Electrician: 'Electrician',
    Plumber: 'Plumber',
    Carpenter: 'Carpenter',
    Painter: 'Painter',
    Cleaner: 'Cleaner',
    Driver: 'Driver',
    Gardener: 'Gardener',
    Caregiver: 'Caregiver',
    Technician: 'Technician',

    // Trade Specialties
    specElectrician: 'Certified High-Voltage & Residential Wiring',
    specPlumber: 'PPR/CPVC Hydro-Piping & Sanitary Fixtures',
    specCarpenter: 'Custom Modular Joinery & Wood Finishing',
    specPainter: 'Airless Spray Emulsion & Weatherproof Coating',
    specCleaner: 'Deep Sanitization & Commercial Surface Detailing',
    specDriver: 'Commercial Heavy & Chauffeur Certified',
    specGardener: 'Landscape Architecture, Pruning & Soil Treatment',
    specCaregiver: 'Certified Geriatric, Pediatric & Patient Support',
    specTechnician: 'Smart HVAC, Inverter & Appliance Diagnostics',

    // Worker Card Strings
    verifiedBadge: 'Verified Pro',
    verifiedDirect: '⚡ Verified Direct',
    perHourSuffix: '/hr',
    kmAway: 'km away',
    minsReach: 'mins reach',
    projectsLabel: 'Projects',
    moreProjects: '+Projects',
    reviewsLabel: 'reviews',
    reviewSingular: 'review',
    viewModalBtn: 'View Modal',
    bookNowBtn: 'Book Service Now',
    bookingDisabled: 'Booking Disabled for Workers',
    tradeSpecialtyPrefix: 'Specialty:',
    skillsLabel: 'Skills',

    // Modal Dialog Strings
    customerRatingSummary: 'Customer Rating Summary',
    calculatedDynamically: 'Calculated dynamically from',
    verifiedReviewsCount: 'verified reviews',
    genuineSihFeedback: '100% Genuine Direct Verified Feedback',
    transparentDirectRate: 'Transparent Direct Rate',
    verifiedPortfolios: 'Verified Project Work & Portfolios',
    verifiedPhotosCount: '3 Verified On-Site Photos',
    recentCustomerReviews: 'Recent Customer Reviews',
    noReviewsYet: 'No customer reviews yet. Be the first to leave verified feedback!',
    submitCustomerReview: 'Submit a Customer Review',
    updatesScoreDynamically: 'Updates score dynamically',
    ratingScorePrompt: 'Your Rating Score (1 to 5 Stars)',
    yourFullName: 'Your Full Name',
    fullNamePlaceholder: 'e.g. Rahul Sharma',
    detailedFeedback: 'Detailed Feedback & Experience',
    feedbackPlaceholder: 'Describe punctuality, workmanship, quality of service, and direct UPI settlement...',
    submittingScore: 'Recalculating dynamic score...',
    submitReviewBtn: 'Submit Review & Update Score',
    reviewSuccess: 'Review submitted successfully! Average rating updated in real-time.',
    closeModal: 'Close',
    starsCountSuffix: '.0 Stars',

    // Booking & Scheduling
    scheduleService: 'Schedule Service',
    directBookingDispatch: '⚡ DIRECT BOOKING DISPATCH',
    bookServiceAppointment: 'Book Service Appointment',
    scheduleGigWith: 'Schedule a verified gig service with',
    dateAndTimeSlot: 'DATE & TIME SLOT',
    bookingDate: 'Booking Date',
    serviceTime: 'Service Time',
    selectDate: 'Select Date',
    selectTime: 'Select Time Slot',
    estimatedDuration: 'Estimated Duration (hours)',
    hoursEstimated: 'hours estimated',
    serviceDuration: 'Estimated Service Duration',
    hours: 'hours',
    serviceLocationAndGps: 'Service Location & Live GPS',
    serviceAddress: 'Service Location Address',
    addressPlaceholder: 'Enter street, apartment number, and landmark',
    problemNotes: 'Problem Description & Notes',
    problemPlaceholder: 'Describe the issue (e.g. Inverter tripping, bathroom pipe leak, fan capacitor replacement)...',
    useMyLocation: 'Use Current Live GPS Location',
    autoDetectGps: 'Auto-Detect Current GPS',
    additionalNotes: 'Special Job Requirements / Notes',
    notesPlaceholder: 'e.g. Please bring extra high-voltage copper wiring',
    priceSummary: 'Transparent Pricing Breakdown',
    bookingCostBreakdown: 'Booking Cost Breakdown',
    assignedWorker: 'Assigned Worker',
    categoryLabel: 'Category',
    durationLabel: 'Duration',
    hourlyRateLabel: 'Hourly Base Rate',
    liveProximityLabel: 'Live Proximity',
    estimatedHoursLabel: 'Estimated Hours',
    platformFee: 'Platform Middleman Fee',
    zeroPercent: '₹0 (0% Commission)',
    zeroPercentFee: '0% Platform Hidden Fee',
    totalAmount: 'Total Amount',
    totalPayable: 'Total Payable',
    totalEstimate: 'Total Direct Amount',
    confirmAndDispatch: 'Confirm & Dispatch Worker',
    confirmBookingBtn: 'Launch GPS Radar & Match',
    bookingConfirmed: 'Booking Dispatched Directly!',
    backToProfile: '← Back to Profile',
    backToDirectory: '← Back to Directory',

    // Live Map & Dynamic Island HUD
    liveRadar: 'Live Work Radar',
    liveGpsGrid: 'Live GPS Grid Plotted',
    arrivingIn: 'Arriving in',
    mins: 'mins',
    arrived: 'Arrived!',
    callWorker: 'Call',
    chatWorker: 'Chat',
    workerArrived: '🎉 Worker has arrived at destination!',
    liveTracking: 'Live Dispatch Tracking',
    youAreHere: 'You Are Here',
    availableForWork: 'AVAILABLE FOR WORK',
    pausedOffline: 'RADAR PAUSED (OFFLINE)',
    goAvailable: 'Go Available Now',
    liveBroadcastActive: 'Live GPS Broadcast Active',
    radarOfflineHelp: 'Switch to Available to broadcast your location and receive live dispatches.',
    tradeCategoryDispatches: 'Trade Category Dispatches',
    tradeSubtitle: 'Browse all 9 active service verticals in your radius',
    activeTrades: '9 Active Trades',

    // Worker Metrics
    totalEarned: 'Total Earned',
    completedJobs: 'Completed Jobs',
    liveRating: 'Live Rating',
    activeRadius: 'Active Radius',
    acceptJob: 'Accept Job',
    acceptDispatch: 'Accept Dispatch',
    jobAccepted: '✓ Job Accepted',
    dismiss: 'Dismiss',
    confirmPayment: 'Confirm Payment',
    downloadSlip: 'Receipt Slip',
  },

  hi: {
    // Brand & Protocol
    appName: 'CoLabour',
    brandProtocol: '⚡ 100% डायरेक्ट ज़ीरो-कमीशन वर्कर नेटवर्क',
    brandShort: '100% डायरेक्ट प्रोटोकॉल',
    tagline: 'स्थानीय कुशल कारीगरों को तुरंत काम से जोड़ना',
    zeroCommission: '0% प्लेटफॉर्म कमीशन',
    instantPayouts: '100% सीधा UPI भुगतान',

    // Hero & Landing Page
    heroTitle1: 'सीधा काम।',
    heroTitle2: 'ज़ीरो कमीशन।',
    heroTitle3: 'तुरंत UPI।',
    heroSubtitle: 'CoLabour ग्राहकों को सीधे कुशल और सत्यापित कारीगरों से जोड़ता है। लाइव GPS रडार, डायरेक्ट UPI और 0% बिचौलिया फीस।',
    browseWorkers: 'कारीगर खोजें ->',
    joinAsWorker: 'कारीगर के रूप में जुड़ें ✧',
    aadhaarVerified: 'आधार सत्यापित',
    directUpi: '100% सीधा UPI',
    liveGpsRadar: 'लाइव GPS रडार',
    availableNearby: '⚡ आस-पास उपलब्ध',
    ratePerHour: 'दर / घंटा',
    perHour: '/घंटा',
    gpsRadarDispatch: 'GPS रडार डिस्पैच इंजन',
    radarDescription: '15 किमी के दायरे में ऑटो-स्कैन, लाइव ETA और सटीक दूरी।',
    zeroCommissionDeduction: '0% कमीशन कटौती',
    directP2P: 'डायरेक्ट P2P',
    activeWorkers: 'सक्रिय कारीगर',
    jobsSettled: 'पूरे किए गए काम',
    avgRating: 'औसत रेटिंग',
    onTimeRate: 'समय पर पूरा दर',
    skillDirectory: 'हुनर निर्देशिका',
    exploreTradeCategories: 'ट्रेड श्रेणियां देखें',
    exploreTradeSubtitle: 'तत्काल सेवा के लिए कुशल और सत्यापित स्थानीय कारीगर खोजें',
    exploreListings: 'सूची देखें',
    simple3Step: 'सरल 3-चरणीय प्रक्रिया',
    howCoLabourOperates: 'CoLabour कैसे काम करता है',
    howItWorksSubtitle: 'GPS रडार मैच से लेकर तत्काल UPI पेमेंट तक',
    step1Title: '1. रडार प्रॉक्सिमिटी मैच',
    step1Desc: 'लाइव GPS दूरी और श्रेणी के आधार पर सत्यापित कारीगर खोजें।',
    step2Title: '2. तुरंत जॉब डिस्पैच',
    step2Desc: 'समय चुनें, घंटे तय करें और कारीगर के डैशबोर्ड पर तुरंत अनुरोध भेजें।',
    step3Title: '3. सीधा UPI पेमेंट सेटलमेंट',
    step3Desc: 'कारीगर का QR स्कैन करें या UPI से भुगतान करें। 0% बिचौलिया कटौती और तुरंत रसीद।',
    ctaTitle: 'भारत के कुशल कामगारों का सशक्तिकरण',
    ctaSubtitle: 'हजारों ग्राहकों और कुशल कारीगरों से जुड़ें जो उचित मूल्य, सीधे UPI और शून्य बिचौलियों का लाभ उठा रहे हैं।',
    createFreeAccount: 'मुफ़्त खाता बनाएं',
    browseDirectory: 'कारीगर निर्देशिका देखें',
    copyrightText: '© 2026 CoLabour • ⚡ 100% डायरेक्ट ज़ीरो-कमीशन वर्कर नेटवर्क • 0% कमीशन',

    // Navigation
    home: 'होम',
    findWorkers: 'कारीगर खोजें',
    dashboard: 'डैशबोर्ड',
    signIn: 'साइन इन',
    getStarted: 'शुरू करें',
    signOut: 'लॉग आउट',
    workerDashboard: 'कारीगर डैशबोर्ड',
    customerDashboard: 'ग्राहक डैशबोर्ड',
    adminPanel: 'एडमिन पैनल',

    // Directory Header & Badges
    directoryBadge: '⚡ लाइव वर्कर डायरेक्टरी',
    directoryTitle: 'सत्यापित कुशल कारीगर खोजें',
    directorySubtitle: '0% कमीशन, सत्यापित रेटिंग और लाइव GPS ट्रैकिंग के साथ सीधी बुकिंग',
    calibrateGps: 'लाइव GPS कैलिब्रेट करें',
    gpsSignalCalibrated: 'GPS सिग्नल सक्रिय है',
    gpsActive: 'GPS सक्रिय',

    // Search & Sort Controls
    searchPlaceholder: 'नाम, हुनर या स्थान से खोजें...',
    sortByLabel: 'क्रमबद्ध करें',
    sortProximity: '📍 निकटतम लाइव GPS',
    sortRating: '⭐ टॉप रेटेड कारीगर',
    sortRateLow: '💰 सबसे कम दर',
    sortRateHigh: '💎 सर्वोत्तम दर',
    allCategories: 'सभी श्रेणियां',
    clearFilters: 'फ़िल्टर हटाएं',
    noWorkersFound: 'आपकी खोज से मेल खाने वाले कोई कारीगर नहीं मिले।',

    // Trade Categories
    all: 'सभी श्रेणियां',
    Electrician: 'इलेक्ट्रीशियन',
    Plumber: 'प्लंबर',
    Carpenter: 'बढ़ई (कारपेंटर)',
    Painter: 'पेंटर',
    Cleaner: 'सफाई कर्मी',
    Driver: 'ड्राइवर',
    Gardener: 'माली',
    Caregiver: 'देखभालकर्ता',
    Technician: 'तकनीशियन',

    // Trade Specialties
    specElectrician: 'प्रमाणित हाई-वोल्टेज व घरेलू वायरिंग',
    specPlumber: 'हाइड्रो-पायपिंग व सेनेटरी फिटिंग्स',
    specCarpenter: 'मॉड्यूलर वुडवर्क व फिनिशिंग',
    specPainter: 'एयरलेस स्प्रे पेंटिंग व वॉटरप्रूफिंग',
    specCleaner: 'डीप क्लीनिंग व सेनेटाइजेशन',
    specDriver: 'सर्टिफाइड कमर्शियल व प्राइवेट ड्राइवर',
    specGardener: 'लैंडस्केपिंग व बागवानी विशेषज्ञ',
    specCaregiver: 'प्रमाणित बुजुर्ग व मरीज देखभाल',
    specTechnician: 'स्मार्ट एसी व उपकरण रिपेयर विशेषज्ञ',

    // Worker Card Strings
    verifiedBadge: 'सत्यापित प्रो',
    verifiedDirect: '⚡ सत्यापित डायरेक्ट',
    perHourSuffix: '/घंटा',
    kmAway: 'किमी दूर',
    minsReach: 'मिनट में पहुँच',
    projectsLabel: 'प्रोजेक्ट्स',
    moreProjects: '+प्रोजेक्ट्स',
    reviewsLabel: 'समीक्षाएं',
    reviewSingular: 'समीक्षा',
    viewModalBtn: 'विवरण देखें',
    bookNowBtn: 'अभी बुक करें',
    bookingDisabled: 'कारीगरों के लिए बुकिंग अक्षम है',
    tradeSpecialtyPrefix: 'विशेषज्ञता:',
    skillsLabel: 'हुनर / स्किल्स',

    // Modal Dialog Strings
    customerRatingSummary: 'ग्राहक रेटिंग सारांश',
    calculatedDynamically: 'सत्यापित समीक्षाओं से लाइव गणना की गई',
    verifiedReviewsCount: 'सत्यापित समीक्षाएं',
    genuineSihFeedback: '100% वास्तविक सत्यापित प्रत्यक्ष समीक्षाएं',
    transparentDirectRate: 'पारदर्शी डायरेक्ट दर',
    verifiedPortfolios: 'सत्यापित प्रोजेक्ट्स और कार्य',
    verifiedPhotosCount: '3 सत्यापित ऑन-साइट फोटो',
    recentCustomerReviews: 'हाल की ग्राहक समीक्षाएं',
    noReviewsYet: 'अभी कोई समीक्षा नहीं है। पहली समीक्षा आप दें!',
    submitCustomerReview: 'समीक्षा और रेटिंग दर्ज करें',
    updatesScoreDynamically: 'रेटिंग तुरंत अपडेट होती है',
    ratingScorePrompt: 'आपकी रेटिंग (1 से 5 स्टार)',
    yourFullName: 'आपका पूरा नाम',
    fullNamePlaceholder: 'उदा. राहुल शर्मा',
    detailedFeedback: 'विस्तृत अनुभव और फीडबैक',
    feedbackPlaceholder: 'समय की पाबंदी, काम की गुणवत्ता और सीधे UPI भुगतान का अनुभव लिखें...',
    submittingScore: 'रेटिंग अपडेट हो रही है...',
    submitReviewBtn: 'समीक्षा सबमिट करें',
    reviewSuccess: 'समीक्षा सफलतापूर्वक दर्ज की गई! औसत रेटिंग लाइव अपडेट हो गई है।',
    closeModal: 'बंद करें',
    starsCountSuffix: '.0 स्टार्स',

    // Booking & Scheduling
    scheduleService: 'सेवा शेड्यूल करें',
    directBookingDispatch: '⚡ सीधा बुकिंग डिस्पैच',
    bookServiceAppointment: 'सेवा अपॉइंटमेंट बुक करें',
    scheduleGigWith: 'सत्यापित सेवा बुक करें इनके साथ:',
    dateAndTimeSlot: 'तारीख और समय स्लॉट',
    bookingDate: 'बुकिंग की तारीख',
    serviceTime: 'सेवा का समय',
    selectDate: 'तारीख चुनें',
    selectTime: 'समय चुनें',
    estimatedDuration: 'अनुमानित समय (घंटे)',
    hoursEstimated: 'घंटे अनुमानित',
    serviceDuration: 'अनुमानित सेवा अवधि',
    hours: 'घंटे',
    serviceLocationAndGps: 'सेवा स्थल और लाइव GPS',
    serviceAddress: 'सेवा का पता',
    addressPlaceholder: 'गली, मकान नंबर और लैंडमार्क लिखें...',
    problemNotes: 'समस्या का विवरण व निर्देश',
    problemPlaceholder: 'समस्या का वर्णन करें (उदा. इनवर्टर ट्रिपिंग, पाइप लीकेज)...',
    useMyLocation: 'वर्तमान GPS का पता लगाएं',
    autoDetectGps: 'वर्तमान GPS का पता लगाएं',
    additionalNotes: 'विशेष निर्देश / नोट्स',
    notesPlaceholder: 'उदा. अतिरिक्त वायरिंग का सामान साथ लाएं',
    priceSummary: 'पारदर्शी मूल्य विवरण',
    bookingCostBreakdown: 'बुकिंग लागत विवरण',
    assignedWorker: 'नियुक्त कारीगर',
    categoryLabel: 'श्रेणी',
    durationLabel: 'अवधि',
    hourlyRateLabel: 'प्रति घंटा आधार दर',
    liveProximityLabel: 'लाइव निकटता',
    estimatedHoursLabel: 'अनुमानित घंटे',
    platformFee: 'प्लेटफॉर्म बिचौलिया शुल्क',
    zeroPercent: '₹0 (0% कमीशन)',
    zeroPercentFee: '0% प्लेटफॉर्म हिडन फीस',
    totalAmount: 'कुल राशि',
    totalPayable: 'कुल देय राशि',
    totalEstimate: 'कुल प्रत्यक्ष राशि',
    confirmAndDispatch: 'पुष्टि करें और कारीगर भेजें',
    confirmBookingBtn: 'लाइव GPS रडार लॉन्च करें व मैच करें',
    bookingConfirmed: 'बुकिंग सीधे भेजी गई!',
    backToProfile: '← प्रोफाइल पर वापस',
    backToDirectory: '← डायरेक्टरी पर वापस',

    // Live Map & Dynamic Island HUD
    liveRadar: 'लाइव वर्क रडार',
    liveGpsGrid: 'लाइव GPS ग्रिड मैप',
    arrivingIn: 'पहुँचने में',
    mins: 'मिनट',
    arrived: 'पहुँच गए हैं!',
    callWorker: 'कॉल करें',
    chatWorker: 'चैट करें',
    workerArrived: '🎉 कारीगर पहुँच गए हैं!',
    liveTracking: 'लाइव डिस्पैच ट्रैकिंग',
    youAreHere: 'आप यहाँ हैं',
    availableForWork: 'काम के लिए उपलब्ध',
    pausedOffline: 'रडार रुका हुआ है (ऑफलाइन मोड)',
    goAvailable: 'अभी उपलब्ध हों',
    liveBroadcastActive: 'लाइव GPS प्रसारण सक्रिय',
    radarOfflineHelp: 'अपना स्थान दिखाने और लाइव काम पाने के लिए उपलब्ध करें।',
    tradeCategoryDispatches: 'ट्रेड श्रेणी डिस्पैच',
    tradeSubtitle: 'अपने दायरे में सभी 9 सक्रिय सेवा श्रेणियां देखें',
    activeTrades: '9 सक्रिय ट्रेड',

    // Worker Metrics
    totalEarned: 'कुल कमाई',
    completedJobs: 'पूर्ण किए गए काम',
    liveRating: 'लाइव रेटिंग',
    activeRadius: 'सक्रिय दायरा',
    acceptJob: 'काम स्वीकारें',
    acceptDispatch: 'डिस्पैच स्वीकारें',
    jobAccepted: '✓ काम स्वीकारा गया',
    dismiss: 'खारिज करें',
    confirmPayment: 'भुगतान की पुष्टि करें',
    downloadSlip: 'रसीद पर्ची',
  },

  mr: {
    // Brand & Protocol
    appName: 'CoLabour',
    brandProtocol: '⚡ 100% थेट झिरो-कमिशन कामगार नेटवर्क',
    brandShort: '100% थेट प्रोटोकॉल',
    tagline: 'स्थानिक कुशल कामगारांना थेट कामाशी जोडणे',
    zeroCommission: '0% प्लॅटफॉर्म कमिशन',
    instantPayouts: '100% थेट UPI पैसे खात्यात',

    // Hero & Landing Page
    heroTitle1: 'थेट काम.',
    heroTitle2: 'झिरो कमिशन.',
    heroTitle3: 'त्वरित UPI.',
    heroSubtitle: 'CoLabour ग्राहकांना थेट कुशल आणि पडताळणी केलेल्या कारागिरांशी जोडते. थेट GPS रडार, झटपट UPI आणि 0% दलाली शुल्क.',
    browseWorkers: 'कारागीर शोधा ->',
    joinAsWorker: 'कारागीर म्हणून जोडा ✧',
    aadhaarVerified: 'आधार पडताळणी झालेले',
    directUpi: '100% थेट UPI',
    liveGpsRadar: 'थेट GPS रडार',
    availableNearby: '⚡ जवळपास उपलब्ध',
    ratePerHour: 'दर / तास',
    perHour: '/तास',
    gpsRadarDispatch: 'GPS रडार डिस्पॅच इंजिन',
    radarDescription: '15 किमीच्या परिघात ऑटो-स्कॅन, थेट ETA आणि अचूक अंतर.',
    zeroCommissionDeduction: '0% कमिशन कपात',
    directP2P: 'थेट P2P',
    activeWorkers: 'सक्रिय कामगार',
    jobsSettled: 'पूर्ण झालेली कामे',
    avgRating: 'सरासरी रेटिंग',
    onTimeRate: 'वेळेवर काम पूर्ण',
    skillDirectory: 'कौशल्य निर्देशिका',
    exploreTradeCategories: 'कामगार प्रकार पहा',
    exploreTradeSubtitle: 'त्वरित सेवेसाठी कुशल आणि पडताळणी झालेले स्थानिक कामगार शोधा',
    exploreListings: 'यादी पहा',
    simple3Step: 'सोपी 3-टप्प्यांची पद्धत',
    howCoLabourOperates: 'CoLabour कसे कार्य करते',
    howItWorksSubtitle: 'GPS रडार मॅचिंगपासून थेट UPI पेमेंटपर्यंत',
    step1Title: '1. रडार समीपता जुळणी',
    step1Desc: 'थेट GPS अंतर आणि प्रकारानुसार पडताळणी केलेले कामगार शोधा.',
    step2Title: '2. झटपट काम वाटप',
    step2Desc: 'वेळ निवडा, तास ठरवा आणि कामगाराच्या डॅशबोर्डवर थेट विनंती पाठवा.',
    step3Title: '3. थेट UPI पेमेंट',
    step3Desc: 'कामगाराचा QR स्कॅन करा किंवा थेट UPI करा. 0% दलाली आणि त्वरित पावती.',
    ctaTitle: 'भारतातील कुशल कामगारांचे सबलीकरण',
    ctaSubtitle: 'हजारो ग्राहक आणि कुशल कामगारांसोबत जोडा जे योग्य दर, थेट UPI आणि 0% दलालीचा लाभ घेत आहेत.',
    createFreeAccount: 'मोफत खाते तयार करा',
    browseDirectory: 'कामगार निर्देशिका पहा',
    copyrightText: '© 2026 CoLabour • ⚡ 100% थेट झिरो-कमिशन कामगार नेटवर्क • 0% कमिशन',

    // Navigation
    home: 'मुख्यपृष्ठ',
    findWorkers: 'कामगार शोधा',
    dashboard: 'डॅशबोर्ड',
    signIn: 'साइन इन',
    getStarted: 'सुरू करा',
    signOut: 'बाहेर पडा',
    workerDashboard: 'कामगार डॅशबोर्ड',
    customerDashboard: 'ग्राहक डॅशबोर्ड',
    adminPanel: 'प्रशासक पॅनेल',

    // Directory Header & Badges
    directoryBadge: '⚡ थेट कामगार निर्देशिका',
    directoryTitle: 'पडताळणी झालेले व्यावसायिक शोधा',
    directorySubtitle: '0% कमिशन, पडताळणी केलेले रेटिंग आणि थेट GPS ट्रॅकिंगसह थेट जोडणी',
    calibrateGps: 'थेट GPS कॅलिब्रेट करा',
    gpsSignalCalibrated: 'GPS सिग्नल सुरू आहे',
    gpsActive: 'GPS सक्रिय',

    // Search & Sort Controls
    searchPlaceholder: 'नाव, कौशल्य किंवा स्थानानुसार शोधा...',
    sortByLabel: 'क्रमवारी',
    sortProximity: '📍 जवळचे थेट GPS',
    sortRating: '⭐ सर्वाधिक पसंती असलेले',
    sortRateLow: '💰 सर्वात कमी दर',
    sortRateHigh: '💎 सर्वोत्तम दर',
    allCategories: 'सर्व प्रकार',
    clearFilters: 'फिल्टर काढा',
    noWorkersFound: 'कोणताही कामगार सापडला नाही. कृपया इतर निकष तपासा.',

    // Trade Categories
    all: 'सर्व प्रकार',
    Electrician: 'इलेक्ट्रिशियन',
    Plumber: 'प्लंबर',
    Carpenter: 'सुतार (कारपेंटर)',
    Painter: 'पेंटर (रंगारी)',
    Cleaner: 'सफाई कामगार',
    Driver: 'चालक (ड्रायव्हर)',
    Gardener: 'माळी',
    Caregiver: 'काळजीवाहक',
    Technician: 'तंत्रज्ञ (टेक्निशियन)',

    // Trade Specialties
    specElectrician: 'प्रमाणित उच्च-व्होल्टेज व घरगुती वायरिंग',
    specPlumber: 'हायड्रो-पायपिंग व सॅनिटरी फिटिंग्स',
    specCarpenter: 'मॉड्युलर लाकडी काम व फिनिशिंग',
    specPainter: 'एअरलेस स्प्रे पेंटिंग व वॉटरप्रूफिंग',
    specCleaner: 'खोल स्वच्छता व सॅनिटायझेशन',
    specDriver: 'व्यावसायिक वाहन चालक प्रमाणित',
    specGardener: 'लँडस्केपिंग व बागकाम तज्ज्ञ',
    specCaregiver: 'प्रमाणित रुग्ण व ज्येष्ठ नागरिक सेवा',
    specTechnician: 'स्मार्ट उपकरणे व एसी दुरुस्ती तंत्रज्ञ',

    // Worker Card Strings
    verifiedBadge: 'पडताळणी झालेला प्रो',
    verifiedDirect: '⚡ थेट पडताळणी झालेले',
    perHourSuffix: '/तास',
    kmAway: 'किमी लांब',
    minsReach: 'मिनिटांत पोहोचणार',
    projectsLabel: 'प्रकल्प',
    moreProjects: '+प्रकल्प',
    reviewsLabel: 'पुनरावलोकने',
    reviewSingular: 'पुनरावलोकन',
    viewModalBtn: 'तपशील पहा',
    bookNowBtn: 'आता बुक करा',
    bookingDisabled: 'कामगारांसाठी बुकिंग उपलब्ध नाही',
    tradeSpecialtyPrefix: 'विशेष कौशल्य:',
    skillsLabel: 'कौशल्ये',

    // Modal Dialog Strings
    customerRatingSummary: 'ग्राहक रेटिंग सारांश',
    calculatedDynamically: 'थेट गणना केलेले',
    verifiedReviewsCount: 'पडताळणी झालेले अभिप्राय',
    genuineSihFeedback: '100% अस्सल थेट पडताळणी झालेले अभिप्राय',
    transparentDirectRate: 'पारदर्शक थेट दर',
    verifiedPortfolios: 'कामाचे फोटो व नमुने',
    verifiedPhotosCount: '3 पडताळणी झालेले ऑन-साइट फोटो',
    recentCustomerReviews: 'नुकतेच आलेले ग्राहक अभिप्राय',
    noReviewsYet: 'अद्याप कोणतेही अभिप्राय नाहीत. पहिला अभिप्राय तुम्ही नोंदवा!',
    submitCustomerReview: 'आपला अभिप्राय नोंदवा',
    updatesScoreDynamically: 'रेटिंग तत्काळ अपडेट होते',
    ratingScorePrompt: 'आपले रेटिंग (1 ते 5 तारे)',
    yourFullName: 'आपले पूर्ण नाव',
    fullNamePlaceholder: 'उदा. राहुल शर्मा',
    detailedFeedback: 'सविस्तर अभिप्राय व अनुभव',
    feedbackPlaceholder: 'वक्तशीरपणा, कामाचा दर्जा आणि थेट UPI व्यवहाराचा अनुभव सांगा...',
    submittingScore: 'स्कोअरची पुनर्गणना होत आहे...',
    submitReviewBtn: 'अभिप्राय नोंदवा व रेटिंग अद्ययावत करा',
    reviewSuccess: 'अभिप्राय यशस्वीरित्या नोंदवला गेला! सरासरी रेटिंग त्वरित अपडेट झाले.',
    closeModal: 'बंद करा',
    starsCountSuffix: '.0 तारे',

    // Booking & Scheduling
    scheduleService: 'काम ठरवा',
    directBookingDispatch: '⚡ थेट बुकिंग डिस्पॅच',
    bookServiceAppointment: 'सेवा अपॉइंटमेंट बुक करा',
    scheduleGigWith: 'पडताळणी झालेली सेवा बुक करा:',
    dateAndTimeSlot: 'तारीख आणि वेळ स्लॉट',
    bookingDate: 'बुकिंग तारीख',
    serviceTime: 'सेवेची वेळ',
    selectDate: 'तारीख निवडा',
    selectTime: 'वेळ निवडा',
    estimatedDuration: 'अंदाजे वेळ (तास)',
    hoursEstimated: 'तास अंदाजे',
    serviceDuration: 'अपेक्षित वेळ',
    hours: 'तास',
    serviceLocationAndGps: 'कामाचा पत्ता व थेट GPS',
    serviceAddress: 'कामाचा पत्ता',
    addressPlaceholder: 'रस्ता, घर क्रमांक आणि लँडमार्क प्रविष्ट करा...',
    problemNotes: 'कामाच्या विशेष सूचना / नोट्स',
    problemPlaceholder: 'उदा. अतिरिक्त वायरिंग साहित्य आणावे, इनव्हर्टर तपासणी...',
    useMyLocation: 'सध्याचे थेट GPS स्थान वापरा',
    autoDetectGps: 'सध्याचे थेट GPS स्थान वापरा',
    additionalNotes: 'कामाच्या विशेष सूचना / नोट्स',
    notesPlaceholder: 'उदा. अतिरिक्त वायरिंग साहित्य आणावे',
    priceSummary: 'पारदर्शक किंमत विवरण',
    bookingCostBreakdown: 'बुकिंग किंमत विवरण',
    assignedWorker: 'नेमलेले कामगार',
    categoryLabel: 'प्रकार',
    durationLabel: 'वेळ',
    hourlyRateLabel: 'प्रति तास मूळ दर',
    liveProximityLabel: 'थेट समीपता',
    estimatedHoursLabel: 'अंदाजे तास',
    platformFee: 'प्लॅटफॉर्म मध्यस्थ शुल्क',
    zeroPercent: '₹0 (0% कमिशन)',
    zeroPercentFee: '0% प्लॅटफॉर्म मध्यस्थ शुल्क',
    totalAmount: 'एकूण रक्कम',
    totalPayable: 'एकूण देय रक्कम',
    totalEstimate: 'एकूण थेट रक्कम',
    confirmAndDispatch: 'निश्चित करा आणि कामगार बोलवा',
    confirmBookingBtn: 'थेट GPS रडार सुरू करा व काम जोडा',
    bookingConfirmed: 'काम थेट पाठवले गेले आहे!',
    backToProfile: '← प्रोफाइलवर परत',
    backToDirectory: '← निर्देशिकेवर परत',

    // Live Map & Dynamic Island HUD
    liveRadar: 'थेट कार्य रडार',
    liveGpsGrid: 'थेट GPS ग्रिड नकाशा',
    arrivingIn: 'पोहोचण्यास वेळ',
    mins: 'मिनिटे',
    arrived: 'पोहोचले आहेत!',
    callWorker: 'कॉल करा',
    chatWorker: 'चॅट करा',
    workerArrived: '🎉 कामगार पोहोचले आहेत!',
    liveTracking: 'थेट काम ट्रॅकिंग',
    youAreHere: 'तुम्ही येथे आहात',
    availableForWork: 'कामासाठी उपलब्ध',
    pausedOffline: 'रडार थांबले (ऑफलाइन मोड)',
    goAvailable: 'आता उपलब्ध व्हा',
    liveBroadcastActive: 'थेट GPS प्रसारण सक्रिय',
    radarOfflineHelp: 'आपले स्थान दाखवण्यासाठी आणि थेट कामे मिळवण्यासाठी उपलब्ध करा.',
    tradeCategoryDispatches: 'व्यापार श्रेणी वाटप',
    tradeSubtitle: 'आपल्या परिघातील सर्व 9 सक्रिय सेवा श्रेणी पहा',
    activeTrades: '9 सक्रिय व्यवसाय',

    // Worker Metrics
    totalEarned: 'एकूण कमाई',
    completedJobs: 'पूर्ण झालेली कामे',
    liveRating: 'थेट रेटिंग',
    activeRadius: 'सक्रिय त्रिज्या',
    acceptJob: 'काम स्वीकारा',
    acceptDispatch: 'काम स्वीकारा',
    jobAccepted: '✓ काम स्वीकारले',
    dismiss: 'रद्द करा',
    confirmPayment: 'पेमेंट पुष्टी करा',
    downloadSlip: 'पावती स्लिप',
  },
} as const;

export type TranslationKey = keyof typeof I18N_DICTIONARY.en;

// ==========================================
// 3. ZERO-CONFLICT RAW DATA LAYER (PURE NUMERIC/IDs)
// ==========================================
export interface RawWorkerData {
  id: string;
  name: string;
  category: 'Electrician' | 'Plumber' | 'Carpenter' | 'Painter' | 'Cleaner' | 'Driver' | 'Gardener' | 'Caregiver' | 'Technician';
  rate: number;
  rating: number;
  totalRatings: number;
  isVerified: boolean;
  latOffset: number;
  lngOffset: number;
  photoUrl: string;
  galleryUrls: string[];
  skills: string[];
  experienceYears: number;
  upiId: string;
  bioKey?: string;
  reviews: {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

export const WORKERS_RAW_DATA: RawWorkerData[] = [
  {
    id: 'w-elec-01',
    name: 'Ramesh Sharma',
    category: 'Electrician',
    rate: 450,
    rating: 4.9,
    totalRatings: 38,
    isVerified: true,
    latOffset: 0.0082,
    lngOffset: 0.0075,
    photoUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=600&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=400&q=80',
    ],
    skills: ['MCB Distribution', 'Concealed Conduit', 'Solar Inverter', 'High-Voltage Wiring'],
    experienceYears: 8,
    upiId: 'ramesh.sharma@okaxis',
    reviews: [
      { id: 'r-1', userName: 'Amit Patel', rating: 5, comment: 'Arrived within 10 mins. Fixed the 3-phase tripping fault cleanly without any middlemen cut.', date: '2 days ago' },
      { id: 'r-2', userName: 'Sunita Rao', rating: 5, comment: 'Prompt and very skilled in modular switches installation. Direct UPI payment was seamless.', date: '1 week ago' },
      { id: 'r-3', userName: 'Vikram Joshi', rating: 4.8, comment: 'Clean work and explained the entire circuit board layout.', date: '2 weeks ago' },
    ],
  },
  {
    id: 'w-plumb-02',
    name: 'Suresh Patil',
    category: 'Plumber',
    rate: 390,
    rating: 4.8,
    totalRatings: 29,
    isVerified: true,
    latOffset: -0.0065,
    lngOffset: 0.0091,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=400&q=80',
    ],
    skills: ['Hydro-Piping', 'CPVC Fittings', 'Booster Pumps', 'Concealed Diverters'],
    experienceYears: 6,
    upiId: 'suresh.patil@okhdfcbank',
    reviews: [
      { id: 'r-4', userName: 'Pooja Kulkarni', rating: 5, comment: 'Replaced leaky diverter valve fast. No commission surcharge was added.', date: '3 days ago' },
      { id: 'r-5', userName: 'Manoj Deshmukh', rating: 4.7, comment: 'Expert in pressure pumps and overhead tank pipelines.', date: '2 weeks ago' },
    ],
  },
  {
    id: 'w-carp-03',
    name: 'Anil Sutar',
    category: 'Carpenter',
    rate: 420,
    rating: 4.9,
    totalRatings: 34,
    isVerified: true,
    latOffset: 0.0112,
    lngOffset: -0.0054,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80',
    ],
    skills: ['Modular Kitchen', 'Soft-Close Hinges', 'Laminate Pasting', 'Hardwood Joinery'],
    experienceYears: 10,
    upiId: 'anil.sutar@okicici',
    reviews: [
      { id: 'r-6', userName: 'Ganesh Naik', rating: 5, comment: 'Excellent finish on our custom wardrobe hinges. Highly recommended!', date: '4 days ago' },
    ],
  },
  {
    id: 'w-paint-04',
    name: 'Vijay Gaikwad',
    category: 'Painter',
    rate: 350,
    rating: 4.8,
    totalRatings: 22,
    isVerified: true,
    latOffset: -0.0094,
    lngOffset: -0.0088,
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80',
    ],
    skills: ['Airless Spraying', 'Waterproofing', 'Texture Paint', 'Emulsion Coating'],
    experienceYears: 7,
    upiId: 'vijay.gaikwad@paytm',
    reviews: [
      { id: 'r-7', userName: 'Kavita Shinde', rating: 5, comment: 'Zero odor emulsion applied with utmost precision.', date: '5 days ago' },
    ],
  },
  {
    id: 'w-clean-05',
    name: 'Sunil Jadhav',
    category: 'Cleaner',
    rate: 300,
    rating: 4.9,
    totalRatings: 45,
    isVerified: true,
    latOffset: 0.0045,
    lngOffset: -0.0115,
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=400&q=80',
    ],
    skills: ['Deep Sanitization', 'Sofa Shampooing', 'Bathroom Descaling', 'Floor Buffing'],
    experienceYears: 5,
    upiId: 'sunil.jadhav@ybl',
    reviews: [
      { id: 'r-8', userName: 'Deepak More', rating: 5, comment: 'House is sparkling clean. Brought his own industrial machines.', date: '1 day ago' },
    ],
  },
  {
    id: 'w-driver-06',
    name: 'Santosh Pawar',
    category: 'Driver',
    rate: 280,
    rating: 4.9,
    totalRatings: 52,
    isVerified: true,
    latOffset: -0.0038,
    lngOffset: 0.0135,
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=400&q=80',
    ],
    skills: ['Automatic & Manual', 'Highway Certified', 'Outstation Nav', 'Night Driving'],
    experienceYears: 12,
    upiId: 'santosh.pawar@okaxis',
    reviews: [
      { id: 'r-9', userName: 'Rajesh Sen', rating: 5, comment: 'Extremely polite and safe driving through heavy traffic.', date: '3 days ago' },
    ],
  },
  {
    id: 'w-gard-07',
    name: 'Baliram Mali',
    category: 'Gardener',
    rate: 260,
    rating: 4.8,
    totalRatings: 18,
    isVerified: true,
    latOffset: 0.0145,
    lngOffset: 0.0042,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80',
    ],
    skills: ['Bonsai Shaping', 'Organic Compost', 'Drip Irrigation', 'Lawn Mowing'],
    experienceYears: 9,
    upiId: 'baliram.mali@sbi',
    reviews: [
      { id: 'r-10', userName: 'Anjali Shah', rating: 5, comment: 'Revived our entire balcony garden and treated plant pests naturally.', date: '6 days ago' },
    ],
  },
  {
    id: 'w-care-08',
    name: 'Laxmi Kamble',
    category: 'Caregiver',
    rate: 340,
    rating: 5.0,
    totalRatings: 31,
    isVerified: true,
    latOffset: -0.0125,
    lngOffset: -0.0035,
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=400&q=80',
    ],
    skills: ['Elderly Mobility', 'Vital Signs Tracking', 'Diet & Med Schedule', 'Post-Op Assistance'],
    experienceYears: 8,
    upiId: 'laxmi.kamble@icici',
    reviews: [
      { id: 'r-11', userName: 'Meera Kadam', rating: 5, comment: 'Treated my grandmother with immense patience and medical care.', date: '2 days ago' },
    ],
  },
  {
    id: 'w-tech-09',
    name: 'Pramod Sawant',
    category: 'Technician',
    rate: 480,
    rating: 4.9,
    totalRatings: 41,
    isVerified: true,
    latOffset: 0.0055,
    lngOffset: 0.0152,
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    ],
    skills: ['Inverter PCB Repair', 'Inverter AC Diagnostics', 'RO Water Purifiers', 'Smart Micro-controllers'],
    experienceYears: 11,
    upiId: 'pramod.sawant@okaxis',
    reviews: [
      { id: 'r-12', userName: 'Chetan Bhagat', rating: 5, comment: 'Diagnosed the motherboard issue on my inverter AC in 15 minutes.', date: '4 days ago' },
    ],
  },
];

// ==========================================
// 4. DYNAMIC TRANSLATION RENDER PIPELINE
// ==========================================
export function applyDomTranslations(langCode: SupportedLanguage) {
  if (typeof document === 'undefined') return;

  const t = I18N_DICTIONARY[langCode] as Record<string, string>;

  // 1. Update static elements via data-i18n attributes
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key && t[key]) {
      el.textContent = t[key];
    }
  });

  // 2. Update dynamic input placeholders
  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key && t[key]) {
      el.placeholder = t[key];
    }
  });

  // 3. Update titles & aria-labels
  document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (key && t[key]) {
      el.title = t[key];
    }
  });

  document.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    if (key && t[key]) {
      el.setAttribute('aria-label', t[key]);
    }
  });
}

// Global setLanguage function for direct scripting or non-React modules
export function globalSetLanguage(langCode: SupportedLanguage) {
  if (typeof window !== 'undefined') {
    window.APP_STATE.currentLang = langCode;
    localStorage.setItem('colabour_lang', langCode);
    document.documentElement.lang = langCode;
  }

  applyDomTranslations(langCode);

  // Dispatch custom window event so any non-React or external subscriber is notified
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('colabour:languagechange', {
        detail: { language: langCode, dictionary: I18N_DICTIONARY[langCode] },
      })
    );
  }
}

if (typeof window !== 'undefined') {
  window.setLanguage = globalSetLanguage;
  window.I18N_DICTIONARY = I18N_DICTIONARY;
  window.WORKERS_RAW_DATA = WORKERS_RAW_DATA;
}

// ==========================================
// 5. REACT CONTEXT & HOOK INTEGRATION
// ==========================================
interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
  dict: (typeof I18N_DICTIONARY)[SupportedLanguage];
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
  dict: I18N_DICTIONARY.en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('colabour_lang') as SupportedLanguage;
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr')) {
        return saved;
      }
    }
    return 'en';
  });

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    globalSetLanguage(lang);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    if (typeof window !== 'undefined') {
      window.APP_STATE.currentLang = language;
    }
    applyDomTranslations(language);

    const handleExternalChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ language: SupportedLanguage }>;
      if (customEvent.detail && customEvent.detail.language && customEvent.detail.language !== language) {
        setLanguageState(customEvent.detail.language);
      }
    };

    window.addEventListener('colabour:languagechange', handleExternalChange);
    return () => {
      window.removeEventListener('colabour:languagechange', handleExternalChange);
    };
  }, [language]);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const activeDict = I18N_DICTIONARY[language] as Record<string, string>;
      if (activeDict && activeDict[key]) {
        return activeDict[key];
      }
      const englishDict = I18N_DICTIONARY.en as Record<string, string>;
      if (englishDict && englishDict[key]) {
        return englishDict[key];
      }
      return fallback || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        dict: I18N_DICTIONARY[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

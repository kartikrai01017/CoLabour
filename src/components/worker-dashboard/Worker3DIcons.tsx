import React from 'react';

// 3D Worker Avatar (Hardhat + Blue Overalls)
export function Worker3DAvatar({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-full bg-gradient-to-b from-amber-100 via-sky-50 to-emerald-50 p-1 shadow-[0_8px_20px_rgba(0,0,0,0.06)] border-2 border-white ${className}`}>
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="helmetGrad" x1="20" y1="10" x2="100" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE047" />
            <stop offset="0.4" stopColor="#EAB308" />
            <stop offset="1" stopColor="#CA8A04" />
          </linearGradient>
          <linearGradient id="skinGrad" x1="40" y1="35" x2="80" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FCD34D" />
            <stop offset="0.6" stopColor="#F59E0B" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="shirtGrad" x1="25" y1="70" x2="95" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#60A5FA" />
            <stop offset="0.7" stopColor="#2563EB" />
            <stop offset="1" stopColor="#1E40AF" />
          </linearGradient>
          <linearGradient id="overallsGrad" x1="30" y1="80" x2="90" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#0284C7" />
          </linearGradient>
          <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Shirt & Shoulders */}
        <path d="M22 110 C22 85, 38 75, 60 75 C82 75, 98 85, 98 110 Z" fill="url(#shirtGrad)" />
        
        {/* White undershirt trim */}
        <path d="M50 75 Q60 85 70 75 Z" fill="#FFFFFF" />

        {/* Denim Overalls Straps */}
        <path d="M36 82 L44 110 L34 110 L28 85 Z" fill="url(#overallsGrad)" />
        <path d="M84 82 L76 110 L86 110 L92 85 Z" fill="url(#overallsGrad)" />
        
        {/* Overall metallic buttons */}
        <circle cx="39" cy="90" r="2.5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
        <circle cx="81" cy="90" r="2.5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />

        {/* Neck */}
        <path d="M48 65 L48 76 Q60 82 72 76 L72 65 Z" fill="#F59E0B" />

        {/* Head & Face */}
        <ellipse cx="60" cy="54" rx="20" ry="22" fill="url(#skinGrad)" filter="url(#softGlow)" />

        {/* Ears */}
        <ellipse cx="39" cy="54" rx="3.5" ry="6" fill="#F59E0B" />
        <ellipse cx="81" cy="54" rx="3.5" ry="6" fill="#F59E0B" />

        {/* Friendly Beard / Stubble */}
        <path d="M44 54 C44 70, 76 70, 76 54 C74 65, 46 65, 44 54 Z" fill="#78350F" opacity="0.85" />

        {/* Smile */}
        <path d="M52 60 Q60 67 68 60" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M54 60 Q60 65 66 60" fill="#FFFFFF" />

        {/* Eyes */}
        <ellipse cx="51" cy="49" rx="2.5" ry="3" fill="#1E293B" />
        <circle cx="52" cy="48" r="0.8" fill="#FFFFFF" />
        <ellipse cx="69" cy="49" rx="2.5" ry="3" fill="#1E293B" />
        <circle cx="70" cy="48" r="0.8" fill="#FFFFFF" />

        {/* Eyebrows */}
        <path d="M47 43 Q52 41 56 44" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M64 44 Q68 41 73 43" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* 3D Yellow Construction Helmet */}
        <path d="M34 38 C34 18, 86 18, 86 38 Q60 36 34 38 Z" fill="url(#helmetGrad)" filter="url(#softGlow)" />
        {/* Helmet Rim */}
        <path d="M30 38 Q60 33 90 38 C90 41, 30 41, 30 38 Z" fill="#CA8A04" />
        {/* Helmet Center Ridge */}
        <path d="M57 19 Q60 17 63 19 L63 36 Q60 35 57 36 Z" fill="#FEF08A" opacity="0.7" />
      </svg>
    </div>
  );
}

// 3D Green Wallet Icon
export function Wallet3DIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 p-2 shadow-sm ${className}`}>
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="wGrad" x1="8" y1="12" x2="56" y2="52" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10B981" />
            <stop offset="0.8" stopColor="#059669" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="goldCoin" x1="30" y1="6" x2="48" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE047" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>
        </defs>
        {/* Gold Coin Peeking Out */}
        <circle cx="36" cy="18" r="9" fill="url(#goldCoin)" />
        <circle cx="36" cy="18" r="7" stroke="#FEF08A" strokeWidth="1.5" fill="none" />
        {/* Wallet Body */}
        <rect x="8" y="20" width="48" height="34" rx="8" fill="url(#wGrad)" />
        <rect x="6" y="22" width="52" height="30" rx="7" stroke="#34D399" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
        {/* Flap */}
        <path d="M38 28 H56 V46 H38 C33 46 33 28 38 28 Z" fill="#047857" />
        {/* Gold Clasp */}
        <circle cx="44" cy="37" r="3.5" fill="#FBBF24" />
        <circle cx="44" cy="37" r="1.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

// 3D Blue Location Pin Icon
export function LocationPin3DIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-2xl bg-sky-50 border border-sky-100 p-2 shadow-sm ${className}`}>
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="pinGrad" x1="16" y1="8" x2="48" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="0.6" stopColor="#0284C7" />
            <stop offset="1" stopColor="#0369A1" />
          </linearGradient>
        </defs>
        {/* Ground Shadow */}
        <ellipse cx="32" cy="54" rx="14" ry="4" fill="#BAE6FD" />
        {/* 3D Pin */}
        <path d="M32 10 C21 10 12 19 12 30 C12 43 32 54 32 54 C32 54 52 43 52 30 C52 19 43 10 32 10 Z" fill="url(#pinGrad)" />
        {/* Inner white circle */}
        <circle cx="32" cy="28" r="7" fill="#FFFFFF" />
        <circle cx="32" cy="28" r="4" fill="#0284C7" />
        {/* Gloss highlight */}
        <path d="M22 18 C26 14 34 14 38 16" stroke="#BAE6FD" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// 3D Golden Briefcase Icon
export function Briefcase3DIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-2xl bg-amber-50 border border-amber-100 p-2 shadow-sm ${className}`}>
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="caseGrad" x1="10" y1="18" x2="54" y2="54" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FBBF24" />
            <stop offset="0.7" stopColor="#D97706" />
            <stop offset="1" stopColor="#B45309" />
          </linearGradient>
        </defs>
        {/* Handle */}
        <path d="M24 18 V12 C24 10 26 8 28 8 H36 C38 8 40 10 40 12 V18" stroke="#B45309" strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* Case Body */}
        <rect x="10" y="18" width="44" height="34" rx="8" fill="url(#caseGrad)" />
        <rect x="10" y="30" width="44" height="3" fill="#92400E" />
        {/* Latches */}
        <rect x="20" y="28" width="5" height="7" rx="1.5" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />
        <rect x="39" y="28" width="5" height="7" rx="1.5" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />
        {/* Corner Protectors */}
        <path d="M10 44 Q10 52 18 52" stroke="#FEF08A" strokeWidth="2" fill="none" />
        <path d="M54 44 Q54 52 46 52" stroke="#FEF08A" strokeWidth="2" fill="none" />
      </svg>
    </div>
  );
}

// 3D Purple/Gold Star Icon
export function Star3DIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-2xl bg-purple-50 border border-purple-100 p-2 shadow-sm ${className}`}>
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="starGrad" x1="16" y1="8" x2="50" y2="54" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A855F7" />
            <stop offset="0.6" stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#6D28D9" />
          </linearGradient>
          <linearGradient id="innerStar" x1="20" y1="16" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE047" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        {/* Soft Background Disc */}
        <circle cx="32" cy="32" r="24" fill="url(#starGrad)" />
        {/* 3D Star */}
        <path
          d="M32 14 L36.5 24.5 L48 25.5 L39.5 33.5 L42 45 L32 39 L22 45 L24.5 33.5 L16 25.5 L27.5 24.5 Z"
          fill="url(#innerStar)"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// 3D Robot AI Assistant Icon
export function Robot3DIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-1.5 shadow-sm border border-indigo-100 ${className}`}>
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="botGrad" x1="8" y1="10" x2="40" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#818CF8" />
            <stop offset="1" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
        {/* Antenna */}
        <line x1="24" y1="6" x2="24" y2="12" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="5" r="2.5" fill="#38BDF8" />
        {/* Head */}
        <rect x="10" y="12" width="28" height="24" rx="8" fill="url(#botGrad)" />
        {/* Face Screen */}
        <rect x="14" y="16" width="20" height="15" rx="5" fill="#0F172A" />
        {/* Glowing Cyan Eyes */}
        <ellipse cx="19" cy="23" rx="2.5" ry="3" fill="#38BDF8" />
        <ellipse cx="29" cy="23" rx="2.5" ry="3" fill="#38BDF8" />
        {/* Smile */}
        <path d="M21 27 Q24 29 27 27" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

// 3D Gift Box (Refer & Earn)
export function Gift3DIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="giftGrad" x1="6" y1="12" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FB7185" />
            <stop offset="0.8" stopColor="#E11D48" />
          </linearGradient>
          <linearGradient id="ribbonGrad" x1="18" y1="6" x2="30" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE047" />
            <stop offset="1" stopColor="#EAB308" />
          </linearGradient>
        </defs>
        {/* Box */}
        <rect x="8" y="18" width="32" height="24" rx="4" fill="url(#giftGrad)" />
        {/* Lid */}
        <rect x="6" y="13" width="36" height="8" rx="3" fill="#BE123C" />
        {/* Vertical Ribbon */}
        <rect x="21" y="13" width="6" height="29" fill="url(#ribbonGrad)" />
        {/* Bow */}
        <path d="M24 13 C20 7 14 8 16 11 C18 14 24 13 24 13 Z" fill="url(#ribbonGrad)" />
        <path d="M24 13 C28 7 34 8 32 11 C30 14 24 13 24 13 Z" fill="url(#ribbonGrad)" />
        <circle cx="24" cy="13" r="2.5" fill="#CA8A04" />
      </svg>
    </div>
  );
}

// 3D Trust Worker Mascot ("Stay Protected with CoLabour")
export function Mascot3DIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="mShirt" x1="15" y1="40" x2="65" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10B981" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="mCap" x1="20" y1="8" x2="60" y2="35" gradientUnits="userSpaceOnUse">
            <stop stopColor="#34D399" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>
        </defs>
        {/* Body */}
        <path d="M18 78 C18 58, 30 50, 40 50 C50 50, 62 58, 62 78 Z" fill="url(#mShirt)" />
        {/* Face */}
        <circle cx="40" cy="36" r="14" fill="#F59E0B" />
        <ellipse cx="36" cy="35" rx="1.8" ry="2.2" fill="#1E293B" />
        <ellipse cx="44" cy="35" rx="1.8" ry="2.2" fill="#1E293B" />
        <path d="M37 41 Q40 45 43 41" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        {/* Green Cap */}
        <path d="M26 30 C26 18, 54 18, 54 30 Z" fill="url(#mCap)" />
        <path d="M22 30 Q40 26 58 30 C58 32, 22 32, 22 30 Z" fill="#047857" />
        {/* Thumbs Up Hand */}
        <path d="M58 58 C62 54 68 54 68 62 C68 68 62 70 58 66 Z" fill="#F59E0B" />
        <rect x="62" y="52" width="4" height="8" rx="2" fill="#F59E0B" />
      </svg>
    </div>
  );
}

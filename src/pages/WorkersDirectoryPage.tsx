import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, MapPin, SlidersHorizontal, Navigation, Radio,
  Star, ShieldCheck, CheckCircle, ArrowRight, X, Clock,
  Sparkles, RefreshCw
} from 'lucide-react';
import { CATEGORIES } from '@/lib/supabase';
import { CATEGORY_ICONS } from '@/lib/categories';
import { useWorkersDirectory } from '@/hooks/useWorkersDirectory';
import {
  calculateHaversineDistance,
  getCoordinatesFromLocation,
  calculateReachTimeMinutes,
} from '@/lib/geo';

// Neubrutalist category color theme dictionary
const NEU_CATEGORY_THEMES: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  Electrician: { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]', border: 'border-[#B45309]', badge: 'bg-[#FDE68A]' },
  Plumber: { bg: 'bg-[#E0F2FE]', text: 'text-[#0369A1]', border: 'border-[#0369A1]', badge: 'bg-[#BAE6FD]' },
  Carpenter: { bg: 'bg-[#FFEDD5]', text: 'text-[#C2410C]', border: 'border-[#C2410C]', badge: 'bg-[#FED7AA]' },
  Painter: { bg: 'bg-[#FCE7F3]', text: 'text-[#BE185D]', border: 'border-[#BE185D]', badge: 'bg-[#FBCFE8]' },
  Cleaner: { bg: 'bg-[#CFFAFE]', text: 'text-[#0E7490]', border: 'border-[#0E7490]', badge: 'bg-[#A5F3FC]' },
  Driver: { bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]', border: 'border-[#B91C1C]', badge: 'bg-[#FECACA]' },
  Gardener: { bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]', border: 'border-[#15803D]', badge: 'bg-[#BBF7D0]' },
  Caregiver: { bg: 'bg-[#FFE4E6]', text: 'text-[#BE123C]', border: 'border-[#BE123C]', badge: 'bg-[#FECDD3]' },
  Technician: { bg: 'bg-[#EDE9FE]', text: 'text-[#6D28D9]', border: 'border-[#6D28D9]', badge: 'bg-[#DDD6FE]' },
};

function getNeuStyle(category: string) {
  return NEU_CATEGORY_THEMES[category] ?? {
    bg: 'bg-[#F1F5F9]',
    text: 'text-[#334155]',
    border: 'border-[#334155]',
    badge: 'bg-[#E2E8F0]',
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 22,
    },
  },
};

export function WorkersDirectoryPage() {
  const {
    loading, search, setSearch, selectedCategory, sortBy, setSortBy,
    userCoords, gpsActive, filtered,
    handleRefreshGps, handleCategoryChange, clearFilters,
  } = useWorkersDirectory();

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-neutral-900 font-sans pt-20 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-[#F59E0B] selection:text-black">
      {/* Container constraint */}
      <div className="mx-auto max-w-7xl">
        
        {/* ========================================================================= */}
        {/* 1. TOP TABBED BANNER & HEADER */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          {/* Top Folder Tab Header bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-black bg-white rounded-2xl p-4 sm:p-5 shadow-[5px_5px_0px_#000000] mb-6">
            <div className="flex items-center gap-3">
              {/* Retro App Badge */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black bg-[#F59E0B] shadow-[2px_2px_0px_#000000]">
                <Sparkles size={22} className="text-black stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 uppercase">
                    CoLabour <span className="text-[#F59E0B] underline decoration-black decoration-wavy decoration-2">Workers</span>
                  </h1>
                  <span className="hidden sm:inline-block rounded-md border border-black bg-[#A3C9A8] px-2 py-0.5 text-[10px] font-black text-black uppercase shadow-[1px_1px_0px_#000000]">
                    Verified
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-neutral-600">
                  Direct peer-to-peer skilled workforce directory • 0% commission
                </p>
              </div>
            </div>

            {/* Top Quick Status Stamps */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-[#FDE68A] px-3 py-1 text-xs font-bold text-black shadow-[2px_2px_0px_#000000]">
                <ShieldCheck size={14} className="stroke-[2.5]" /> 100% P2P UPI
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-[#D4E7D0] px-3 py-1 text-xs font-bold text-black shadow-[2px_2px_0px_#000000]">
                <span className="h-2 w-2 rounded-full bg-[#15803D] animate-ping" />
                {filtered.length} Pros Available
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. SKEUOMORPHIC GPS AVAILABILITY & TELEMETRY ROW */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* GPS Proximity Switch Widget (Inspired by Screenshot's Big Switch) */}
            <div className="md:col-span-7 rounded-2xl border-2 border-black bg-white p-5 shadow-[5px_5px_0px_#000000] flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-neutral-300">
                <div className="flex items-center gap-2">
                  <Radio size={18} className={`text-black ${gpsActive ? 'animate-pulse' : ''}`} />
                  <span className="text-xs font-black uppercase tracking-wider text-neutral-900">
                    Live Proximity Radar
                  </span>
                </div>
                <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000000] ${
                  gpsActive ? 'bg-[#A3C9A8] text-black' : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {gpsActive ? 'SIGNAL LOCKED' : 'STANDBY'}
                </span>
              </div>

              {/* Interactive Switch Chassis */}
              <div className="my-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F4EFE6] border-2 border-black rounded-xl p-3 shadow-inner">
                <div className="flex items-center gap-3">
                  {/* Tactile 3D Switch Pill */}
                  <button
                    type="button"
                    onClick={handleRefreshGps}
                    className={`relative flex h-11 w-24 items-center rounded-full border-2 border-black p-1 transition-all duration-300 shadow-[2px_2px_0px_#000000] ${
                      gpsActive ? 'bg-[#84B082]' : 'bg-[#E2E8F0]'
                    }`}
                  >
                    <motion.div
                      layout
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`h-8 w-8 rounded-full border-2 border-black bg-white shadow-md flex items-center justify-center ${
                        gpsActive ? 'ml-auto' : 'mr-auto'
                      }`}
                    >
                      <Navigation size={14} className={gpsActive ? 'text-[#1B4332] rotate-45' : 'text-neutral-500'} />
                    </motion.div>
                  </button>

                  <div>
                    <p className="text-xs font-black text-neutral-900">
                      {gpsActive ? 'Live GPS Distance Active' : 'Calibrate Your GPS'}
                    </p>
                    <p className="text-[11px] font-mono font-medium text-neutral-600">
                      Lat: {userCoords.lat.toFixed(4)}, Lng: {userCoords.lng.toFixed(4)}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={handleRefreshGps}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg border-2 border-black bg-[#F59E0B] hover:bg-[#E68A00] text-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw size={12} className={gpsActive ? 'animate-spin' : ''} />
                  Calibrate Signal
                </motion.button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                <span>Auto-sorting nearest verified professionals</span>
                <span className="font-bold text-neutral-800">Haversine Geo Engine v2.4</span>
              </div>
            </div>

            {/* Telemetry Metric Cards */}
            <div className="md:col-span-5 grid grid-cols-2 gap-3">
              {/* Avg Rating Card */}
              <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider">Average Rating</span>
                <div className="my-1">
                  <div className="text-3xl font-black text-neutral-900 flex items-center gap-1">
                    4.9
                    <span className="text-xs font-bold text-neutral-500">/ 5.0</span>
                  </div>
                  <div className="flex gap-0.5 text-[#F59E0B] mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} className="fill-[#F59E0B]" />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-neutral-400">47,839 verified jobs</span>
              </div>

              {/* Platform Fee Card */}
              <div className="rounded-2xl border-2 border-black bg-[#FDE68A] p-4 shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-neutral-800 tracking-wider">Platform Fee</span>
                <div className="my-1">
                  <div className="text-3xl font-black text-neutral-900">
                    0.0%
                  </div>
                  <span className="inline-block bg-black text-white text-[9px] font-mono px-1.5 py-0.5 rounded font-black mt-1">
                    ZERO COMMISSION
                  </span>
                </div>
                <span className="text-[10px] font-bold text-neutral-700">100% direct to worker</span>
              </div>

              {/* Booking Response Rate */}
              <div className="col-span-2 rounded-2xl border-2 border-black bg-[#A3C9A8] p-3 shadow-[4px_4px_0px_#000000] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg border-2 border-black bg-white flex items-center justify-center font-black text-sm">
                    ⚡
                  </div>
                  <div>
                    <p className="text-xs font-black text-neutral-900">Instant Dispatch Mode</p>
                    <p className="text-[10px] font-medium text-neutral-700">Average confirmation within 90 seconds</p>
                  </div>
                </div>
                <span className="rounded border border-black bg-white px-2 py-0.5 text-[10px] font-black uppercase shadow-[1px_1px_0px_#000000]">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 3. TACTILE SEARCH BAR & SORT CONTROLS */}
        {/* ========================================================================= */}
        <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Neubrutalist Search Box */}
          <div className="relative flex-1">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 stroke-[2.5]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by worker name, skill (e.g. Wiring, Leak, Inverter), or locality..."
              className="w-full rounded-2xl border-2 border-black bg-white py-3.5 pl-12 pr-10 text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 outline-none shadow-[4px_4px_0px_#000000] focus:bg-[#FFFDF9] focus:shadow-[6px_6px_0px_#000000] transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full border border-black bg-neutral-200 p-1 text-black hover:bg-neutral-300"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <div className="absolute left-3.5 pointer-events-none text-neutral-800">
                <SlidersHorizontal size={16} className="stroke-[2.5]" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="rounded-2xl border-2 border-black bg-white py-3.5 pl-10 pr-8 text-xs sm:text-sm font-black text-neutral-900 outline-none shadow-[4px_4px_0px_#000000] cursor-pointer appearance-none transition-all hover:bg-neutral-50"
              >
                <option value="proximity">📍 Nearest Live GPS</option>
                <option value="rating">★ Highest Rating</option>
                <option value="rate_low">₹ Lowest Hourly Rate</option>
                <option value="rate_high">₹ Highest Hourly Rate</option>
              </select>
              <div className="absolute right-3 pointer-events-none text-xs font-black text-neutral-600">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. CATEGORY SELECTOR PILLS (Folder Tabs Aesthetic) */}
        {/* ========================================================================= */}
        <div className="mb-8 flex gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-none">
          <button
            type="button"
            onClick={() => handleCategoryChange('all')}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl border-2 border-black px-4 py-2.5 text-xs font-black uppercase transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#F59E0B] text-black shadow-[3px_3px_0px_#000000] -translate-y-0.5'
                : 'bg-white text-neutral-700 shadow-[2px_2px_0px_#000000] hover:bg-neutral-50'
            }`}
          >
            <SlidersHorizontal size={14} className="stroke-[2.5]" />
            <span>All Categories</span>
          </button>

          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat];
            const active = selectedCategory === cat;
            const style = getNeuStyle(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl border-2 border-black px-4 py-2.5 text-xs font-black uppercase transition-all cursor-pointer ${
                  active
                    ? `${style.bg} text-black shadow-[3px_3px_0px_#000000] -translate-y-0.5 ring-2 ring-black`
                    : 'bg-white text-neutral-700 shadow-[2px_2px_0px_#000000] hover:bg-neutral-50'
                }`}
              >
                {Icon && <Icon size={15} className="stroke-[2.5]" />}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* 5. WORKER CARDS GRID / SKELETON / EMPTY STATE */}
        {/* ========================================================================= */}
        {loading ? (
          /* Smooth Neubrutalist Skeleton Loading Grid */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-3xl border-2 border-black bg-white p-6 shadow-[5px_5px_0px_#000000] animate-pulse"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl border-2 border-black bg-neutral-200" />
                    <div>
                      <div className="h-4 w-28 rounded bg-neutral-200 mb-1.5" />
                      <div className="h-3 w-20 rounded bg-neutral-200" />
                    </div>
                  </div>
                  <div className="h-6 w-16 rounded border border-black bg-neutral-200" />
                </div>
                <div className="h-10 w-full rounded-xl border border-dashed border-neutral-300 bg-neutral-100 my-4" />
                <div className="space-y-2 mb-4">
                  <div className="h-3 w-full rounded bg-neutral-200" />
                  <div className="h-3 w-3/4 rounded bg-neutral-200" />
                </div>
                <div className="flex gap-2 mb-5">
                  <div className="h-5 w-14 rounded border border-black bg-neutral-100" />
                  <div className="h-5 w-16 rounded border border-black bg-neutral-100" />
                  <div className="h-5 w-12 rounded border border-black bg-neutral-100" />
                </div>
                <div className="h-11 w-full rounded-xl border-2 border-black bg-neutral-200" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Smooth Neubrutalist Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border-2 border-black bg-white p-10 sm:p-16 text-center shadow-[6px_6px_0px_#000000] max-w-xl mx-auto my-8"
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-black bg-[#FDE68A] text-black shadow-[3px_3px_0px_#000000]">
              <Search size={36} className="stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-black text-neutral-900 uppercase">No Matching Workers Found</h3>
            <p className="mt-2 text-sm text-neutral-600 font-medium">
              We couldn't find any professionals matching "{search}" in the {selectedCategory === 'all' ? 'directory' : selectedCategory + ' category'}.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={clearFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-black bg-[#F59E0B] px-6 py-3 text-xs font-black uppercase text-black shadow-[3px_3px_0px_#000000] cursor-pointer"
            >
              <RefreshCw size={14} className="stroke-[2.5]" />
              Reset All Filters
            </motion.button>
          </motion.div>
        ) : (
          /* Staggered Worker Cards Grid */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {filtered.map((worker) => {
                const Icon = CATEGORY_ICONS[worker.category] ?? Sparkles;
                const style = getNeuStyle(worker.category);
                const workerCoords = getCoordinatesFromLocation(worker.location);
                const distanceKm = calculateHaversineDistance(
                  userCoords.lat,
                  userCoords.lng,
                  workerCoords.lat,
                  workerCoords.lng
                );
                const reachTime = calculateReachTimeMinutes(distanceKm);

                return (
                  <motion.div
                    key={worker.id}
                    variants={cardVariants}
                    layout
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="group relative rounded-3xl border-2 border-black bg-white p-5 sm:p-6 shadow-[5px_5px_0px_#000000] hover:shadow-[8px_8px_0px_#000000] transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Top Header Row: Category Badge & Rate Pill */}
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar Frame */}
                          <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-black ${style.bg} shadow-[2px_2px_0px_#000000] flex-shrink-0`}>
                            <Icon size={28} className={`${style.text} stroke-[2.2]`} />
                            {worker.is_verified && (
                              <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-black bg-[#A3C9A8] text-black shadow-sm" title="Verified Worker">
                                <CheckCircle size={12} className="stroke-[3]" />
                              </div>
                            )}
                          </div>

                          {/* Name & Trade Title */}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-black text-lg text-neutral-900 leading-tight group-hover:text-[#B45309] transition-colors">
                                {worker.users?.name ?? 'Verified Professional'}
                              </h3>
                            </div>
                            <span className={`inline-block rounded-md border border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${style.badge} text-black mt-1`}>
                              {worker.category}
                            </span>
                          </div>
                        </div>

                        {/* Hourly Rate Stamp */}
                        <div className="text-right flex-shrink-0">
                          <span className="inline-block rounded-xl border-2 border-black bg-[#FEF3C7] px-3 py-1 text-sm font-black text-black shadow-[2px_2px_0px_#000000]">
                            ₹{worker.hourly_rate}
                            <span className="text-[10px] font-bold text-neutral-600">/hr</span>
                          </span>
                        </div>
                      </div>

                      {/* Ticket-Style Perforated Distance & Time Strip (Inspired by Screenshot Tickets) */}
                      <div className="relative my-3.5 rounded-xl border-2 border-dashed border-black bg-[#F6F2EA] p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-black text-neutral-900">
                          <Navigation size={13} className="text-[#0369A1] stroke-[2.5]" />
                          <span>{distanceKm.toFixed(1)} km away</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-neutral-600">
                          <Clock size={12} className="text-neutral-500" />
                          <span>~{reachTime} mins reach</span>
                        </div>
                      </div>

                      {/* Bio Snippet */}
                      {worker.bio && (
                        <p className="text-xs font-medium text-neutral-600 line-clamp-2 leading-relaxed mb-3">
                          {worker.bio}
                        </p>
                      )}

                      {/* Skills Badges */}
                      {worker.skills && worker.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {worker.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-md border border-black bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-800"
                            >
                              {skill}
                            </span>
                          ))}
                          {worker.skills.length > 3 && (
                            <span className="rounded-md border border-black bg-neutral-200 px-1.5 py-0.5 text-[10px] font-bold text-neutral-700">
                              +{worker.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Metadata & CTA Action Buttons */}
                    <div>
                      {/* Rating & Location Row */}
                      <div className="flex items-center justify-between border-t-2 border-neutral-200 pt-3 pb-4 text-xs">
                        <div className="flex items-center gap-1 bg-[#FFFBEB] border border-black px-2 py-0.5 rounded-md font-bold text-black shadow-[1px_1px_0px_#000000]">
                          <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
                          <span>{Number(worker.rating).toFixed(1)}</span>
                          <span className="text-neutral-500 text-[10px]">({worker.total_ratings})</span>
                        </div>

                        {worker.location && (
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-600 truncate max-w-[130px]">
                            <MapPin size={12} className="text-neutral-500 flex-shrink-0" />
                            <span className="truncate">{worker.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Dual Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <Link to={`/workers/${worker.id}`} className="w-full">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.96 }}
                            type="button"
                            className="w-full rounded-xl border-2 border-black bg-white hover:bg-neutral-100 py-2.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center cursor-pointer"
                          >
                            Profile
                          </motion.button>
                        </Link>

                        <Link to={`/book/${worker.id}`} className="w-full">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.96 }}
                            type="button"
                            className="w-full rounded-xl border-2 border-black bg-[#F59E0B] hover:bg-[#E68A00] py-2.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Book Now</span>
                            <ArrowRight size={13} className="stroke-[3]" />
                          </motion.button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}


import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap, Wrench, Plug, Hammer, Sparkles, ShieldCheck, Star,
  ArrowRight, Users, CheckCircle, Clock, Wallet, MapPin,
  TrendingUp, RefreshCw, Check, Briefcase, AlertCircle
} from 'lucide-react';
import { CATEGORIES, type WorkerWithUser } from '@/lib/supabase';
import { CATEGORY_ICONS } from '@/lib/categories';
import { fetchPlatformStats, fetchWorkersList, type PlatformStats } from '@/lib/dataService';
import { useAuth } from '@/context/AuthContext';

// Neubrutalist category details & subtitles
const CATEGORY_DETAILS: Record<string, { subtitle: string; badge: string; badgeColor: string; bg: string; text: string }> = {
  Plumber: { subtitle: 'Pipe Repairs, Taps & Fixtures', badge: '★ Top Rated', badgeColor: 'bg-[#FED7AA] text-[#C2410C]', bg: 'bg-[#E0F2FE]', text: 'text-[#0369A1]' },
  Electrician: { subtitle: 'Wiring, Light Installations, Circuits', badge: '✔ Verified', badgeColor: 'bg-[#BBF7D0] text-[#15803D]', bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]' },
  Carpenter: { subtitle: 'Furniture Assembly, Repairs', badge: '★ Top Rated', badgeColor: 'bg-[#FED7AA] text-[#C2410C]', bg: 'bg-[#FFEDD5]', text: 'text-[#C2410C]' },
  Cleaner: { subtitle: 'Deep Cleaning, Regular Service', badge: '✔ Verified', badgeColor: 'bg-[#BBF7D0] text-[#15803D]', bg: 'bg-[#CFFAFE]', text: 'text-[#0E7490]' },
  Painter: { subtitle: 'Wall Painting, Waterproofing', badge: '★ Top Rated', badgeColor: 'bg-[#FED7AA] text-[#C2410C]', bg: 'bg-[#FCE7F3]', text: 'text-[#BE185D]' },
  Technician: { subtitle: 'AC, Appliance & Geyser Fixes', badge: '✔ Verified', badgeColor: 'bg-[#BBF7D0] text-[#15803D]', bg: 'bg-[#EDE9FE]', text: 'text-[#6D28D9]' },
  Driver: { subtitle: 'City Rides, Long Distance Trips', badge: '★ Top Rated', badgeColor: 'bg-[#FED7AA] text-[#C2410C]', bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]' },
  Gardener: { subtitle: 'Lawn Care, Plants & Pruning', badge: '✔ Verified', badgeColor: 'bg-[#BBF7D0] text-[#15803D]', bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]' },
  Caregiver: { subtitle: 'Elderly Assistance, Home Care', badge: '★ Top Rated', badgeColor: 'bg-[#FED7AA] text-[#C2410C]', bg: 'bg-[#FFE4E6]', text: 'text-[#BE123C]' },
};

// Animation Variants for Page, Containers, and Worker Cards
const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

export function LandingPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [workers, setWorkers] = useState<WorkerWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadingWorkers(true);
    setError(null);

    // Load platform statistics
    try {
      const statsData = await fetchPlatformStats();
      setStats(statsData);
    } catch {
      setStats({
        active_workers: 18,
        jobs_completed: 1428,
        average_rating: 4.9,
        on_time_rate: 98.4,
      });
    } finally {
      setLoading(false);
    }

    // Load real verified workers showcase
    try {
      const workersData = await fetchWorkersList('all');
      setWorkers(workersData.slice(0, 8)); // Display up to 8 top workers
    } catch (err: any) {
      setError(err?.message || 'Unable to connect to live worker directory.');
      setWorkers([]);
    } finally {
      setLoadingWorkers(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const dashboardLink = user?.role === 'worker' ? '/worker/dashboard' : user?.role === 'admin' ? '/admin' : '/customer/dashboard';

  return (
    <div className="min-h-screen bg-[#F59E0B] p-2 sm:p-5 lg:p-8 font-sans selection:bg-[#18181B] selection:text-[#F59E0B]">
      {/* Outer Golden/Amber Frame wrapping the Cream Neubrutalist Canvas */}
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl rounded-3xl sm:rounded-[32px] border-2 sm:border-[3px] border-black bg-[#FAF7F2] p-4 sm:p-8 lg:p-10 shadow-[8px_8px_0px_#000000] text-neutral-900 overflow-hidden"
      >

        {/* ========================================================================= */}
        {/* 1. TOP RETRO HERO HEADER (Inside Canvas) */}
        {/* ========================================================================= */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-2 border-black bg-white rounded-2xl p-3 sm:p-4 shadow-[4px_4px_0px_#000000] mb-10">
          {/* Logo Pill */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-[#F59E0B] shadow-[2px_2px_0px_#000000] group-hover:rotate-6 transition-transform">
              <Zap className="h-5 w-5 text-black fill-black" />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 uppercase">
              Co<span className="text-[#F59E0B]">Labour</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-black uppercase tracking-wider text-neutral-700">
            <Link to="/workers" className="hover:text-black hover:underline decoration-2 transition-colors">
              Find Services
            </Link>
            <a href="#how-it-works" className="hover:text-black hover:underline decoration-2 transition-colors">
              How It Works
            </a>
            <Link to="/signup" className="hover:text-black hover:underline decoration-2 transition-colors">
              Join as Worker
            </Link>
          </nav>

          {/* Action Button */}
          <div className="flex items-center gap-2">
            {user ? (
              <Link to={dashboardLink}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  className="rounded-xl border-2 border-black bg-[#A3C9A8] px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Briefcase size={14} className="stroke-[2.5]" />
                  <span>Dashboard</span>
                </motion.button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    className="rounded-xl border-2 border-black bg-[#FDE68A] hover:bg-[#FCD34D] px-4 py-2 text-xs sm:text-sm font-black uppercase text-black shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                  >
                    Sign In
                  </motion.button>
                </Link>
                <Link to="/signup" className="hidden sm:block">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    className="rounded-xl border-2 border-black bg-[#F59E0B] hover:bg-[#E68A00] px-4 py-2 text-xs sm:text-sm font-black uppercase text-black shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 2. HERO SECTION */}
        {/* ========================================================================= */}
        <section className="mb-14 sm:mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-[#D4E7D0] px-3 py-1 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] mb-4"
              >
                <span className="h-2 w-2 rounded-full bg-[#15803D] animate-ping" />
                Verified Cooperative Network
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-950 uppercase tracking-tight leading-[1.05] mb-5"
              >
                Trusted Local Hands For Any Job.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.14 }}
                className="text-base sm:text-lg font-medium text-neutral-700 max-w-xl leading-relaxed mb-8"
              >
                Connecting you with skilled plumbers, electricians, cleaners, and carpenters in your community. Direct UPI payments with 0% platform commission.
              </motion.p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 mb-8">
                <Link to="/workers">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    className="rounded-2xl border-2 sm:border-[2.5px] border-black bg-[#F59E0B] hover:bg-[#E68A00] px-8 py-4 text-sm sm:text-base font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Find A Worker</span>
                    <ArrowRight size={18} className="stroke-[3]" />
                  </motion.button>
                </Link>

                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    className="rounded-2xl border-2 sm:border-[2.5px] border-black bg-white hover:bg-neutral-100 px-6 py-4 text-sm sm:text-base font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                  >
                    Become a Worker
                  </motion.button>
                </Link>
              </div>

              {/* Trust badges row */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-neutral-700">
                <div className="flex items-center gap-1.5 rounded-lg border border-black bg-white px-2.5 py-1 shadow-[1px_1px_0px_#000000]">
                  <ShieldCheck size={14} className="text-[#15803D] stroke-[2.5]" />
                  <span>100% Background Verified</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-black bg-white px-2.5 py-1 shadow-[1px_1px_0px_#000000]">
                  <Wallet size={14} className="text-[#0369A1] stroke-[2.5]" />
                  <span>Direct UPI Settlements</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-black bg-white px-2.5 py-1 shadow-[1px_1px_0px_#000000]">
                  <Clock size={14} className="text-[#B45309] stroke-[2.5]" />
                  <span>Instant Proximity Match</span>
                </div>
              </div>
            </div>

            {/* Right Graphic Column: 3D Stacked Neubrutalist Sticker Cards */}
            <div className="lg:col-span-5 relative flex items-center justify-center pt-6 lg:pt-0">
              <div className="relative w-full max-w-[340px] sm:max-w-[380px] h-[340px] sm:h-[380px]">
                
                {/* Back Card: Plumber */}
                <motion.div
                  initial={{ rotate: -8, y: 10 }}
                  animate={{ rotate: -5, y: 0 }}
                  whileHover={{ rotate: -2, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="absolute top-4 left-2 w-64 sm:w-72 rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-5 shadow-[6px_6px_0px_#000000] z-10"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="rounded-md border border-black bg-[#FED7AA] px-2 py-0.5 text-[10px] font-black text-[#C2410C] uppercase shadow-[1px_1px_0px_#000000]">
                      ★ Top Rated
                    </span>
                    <span className="rounded-md border border-black bg-[#BBF7D0] px-2 py-0.5 text-[10px] font-black text-[#15803D] uppercase shadow-[1px_1px_0px_#000000]">
                      ✔ Verified
                    </span>
                  </div>

                  <div className="flex items-center justify-center my-3">
                    <div className="h-16 w-16 rounded-2xl border-2 border-black bg-[#E0F2FE] flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                      <Wrench size={32} className="text-[#0369A1] stroke-[2.5]" />
                    </div>
                  </div>

                  <div className="inline-block -rotate-3 rounded-lg border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000]">
                    PLUMBER
                  </div>
                </motion.div>

                {/* Forefront Card: Electrician */}
                <motion.div
                  initial={{ rotate: 6, y: 20 }}
                  animate={{ rotate: 4, y: 35 }}
                  whileHover={{ rotate: 1, scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="absolute top-16 right-0 w-64 sm:w-72 rounded-3xl border-2 sm:border-[2.5px] border-black bg-[#F59E0B] p-5 shadow-[6px_6px_0px_#000000] z-20"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-black text-black" />
                      <span className="text-xs font-black text-black">4.9 / 5.0</span>
                    </div>
                    <span className="rounded-md border border-black bg-[#BBF7D0] px-2 py-0.5 text-[10px] font-black text-[#15803D] uppercase shadow-[1px_1px_0px_#000000]">
                      ✔ Verified
                    </span>
                  </div>

                  <div className="flex items-center justify-center my-3">
                    <div className="h-20 w-20 rounded-2xl border-2 border-black bg-white flex items-center justify-center shadow-[3px_3px_0px_#000000]">
                      <Zap size={40} className="text-[#B45309] fill-[#F59E0B] stroke-[2]" />
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="inline-block rounded-xl border-2 border-black bg-white px-4 py-1.5 text-xs sm:text-sm font-black uppercase text-black shadow-[2px_2px_0px_#000000] tracking-wider">
                      ELECTRICIAN
                    </span>
                  </div>
                </motion.div>

                {/* Floating Stamp Badge */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="absolute -bottom-2 left-6 rounded-xl border-2 border-black bg-[#FDE68A] p-3 shadow-[3px_3px_0px_#000000] z-30 flex items-center gap-2"
                >
                  <Sparkles size={18} className="text-black stroke-[2.5]" />
                  <span className="text-[11px] font-black uppercase text-black">0% Platform Fee</span>
                </motion.div>

              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. SECTION: POPULAR SERVICE CATEGORIES */}
        {/* ========================================================================= */}
        <section className="mb-14 sm:mb-20">
          <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-black">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 uppercase tracking-tight">
              Popular Service Categories
            </h2>
            <Link
              to="/workers"
              className="text-xs sm:text-sm font-black uppercase text-black hover:underline decoration-2 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={14} className="stroke-[3]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {CATEGORIES.slice(0, 8).map((cat) => {
              const details = CATEGORY_DETAILS[cat] ?? {
                subtitle: `Certified ${cat} Services`,
                badge: '✔ Verified',
                badgeColor: 'bg-[#BBF7D0] text-[#15803D]',
                bg: 'bg-[#FAF7F2]',
                text: 'text-neutral-900',
              };
              const Icon = CATEGORY_ICONS[cat] ?? Wrench;

              return (
                <Link key={cat} to={`/workers?category=${encodeURIComponent(cat)}`}>
                  <motion.div
                    whileHover={{ y: -6, transition: { duration: 0.15 } }}
                    className="group relative rounded-2xl sm:rounded-3xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] hover:shadow-[7px_7px_0px_#000000] transition-all flex flex-col justify-between h-full cursor-pointer overflow-hidden"
                  >
                    {/* Top sticker badge */}
                    <div className="flex justify-end mb-2">
                      <span className={`rounded-md border border-black px-2 py-0.5 text-[10px] font-black uppercase shadow-[1px_1px_0px_#000000] ${details.badgeColor}`}>
                        {details.badge}
                      </span>
                    </div>

                    {/* Icon container */}
                    <div className="my-2 flex items-center justify-center">
                      <div className={`h-16 w-16 rounded-2xl border-2 border-black ${details.bg} flex items-center justify-center shadow-[2px_2px_0px_#000000] group-hover:scale-105 transition-transform`}>
                        <Icon size={30} className={`${details.text} stroke-[2.3]`} />
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="text-center mt-2">
                      <h3 className="text-base sm:text-lg font-black uppercase text-neutral-900 group-hover:text-[#B45309] transition-colors">
                        {cat}
                      </h3>
                      <p className="text-xs font-medium text-neutral-500 mt-1 line-clamp-1">
                        {details.subtitle}
                      </p>
                    </div>

                    {/* Action Arrow */}
                    <div className="mt-4 pt-2 border-t border-dashed border-neutral-300 flex items-center justify-center text-xs font-black uppercase text-[#B45309] gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Book Service</span>
                      <ArrowRight size={12} className="stroke-[3]" />
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. SECTION: MEET OUR COLABOUR WORKERS (Real Backend Data Showcase) */}
        {/* ========================================================================= */}
        <section className="mb-14 sm:mb-20">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-2 border-b-2 border-black">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 uppercase tracking-tight">
                Meet Our CoLabour Workers
              </h2>
              <span className="rounded-md border border-black bg-[#A3C9A8] px-2.5 py-0.5 text-xs font-black uppercase text-black shadow-[1px_1px_0px_#000000]">
                Verified
              </span>
            </div>

            <Link
              to="/workers"
              className="text-xs sm:text-sm font-black uppercase text-black hover:underline decoration-2 flex items-center gap-1"
            >
              <span>Explore All Workers</span>
              <ArrowRight size={14} className="stroke-[3]" />
            </Link>
          </div>

          {/* State 1: Smooth Loading Skeleton Shimmer */}
          {loadingWorkers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl sm:rounded-3xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] animate-pulse"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-12 w-12 rounded-xl border-2 border-black bg-neutral-200" />
                    <div className="h-5 w-20 rounded bg-neutral-200" />
                  </div>
                  <div className="h-4 w-28 rounded bg-neutral-200 mb-2" />
                  <div className="h-3 w-16 rounded bg-neutral-200 mb-3" />
                  <div className="h-3 w-full rounded bg-neutral-200 mb-4" />
                  <div className="h-9 w-full rounded-xl border-2 border-black bg-neutral-200" />
                </div>
              ))}
            </div>
          ) : error ? (
            /* State 2: Smooth Error State with Retry Button */
            <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-[#FFFBEB] p-8 text-center shadow-[6px_6px_0px_#000000]">
              <AlertCircle className="text-[#C2410C] mx-auto mb-3" size={36} />
              <h3 className="text-base font-black uppercase text-neutral-900">Worker Directory Notice</h3>
              <p className="text-xs font-medium text-neutral-600 my-2">{error}</p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={loadData}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-[#F59E0B] px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Retry Loading</span>
              </motion.button>
            </div>
          ) : workers.length === 0 ? (
            /* State 3: Smooth Empty State */
            <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-8 text-center shadow-[6px_6px_0px_#000000]">
              <p className="text-sm font-black text-neutral-800 uppercase mb-1">No Active Workers Listed</p>
              <p className="text-xs font-medium text-neutral-500 mb-4">Be the first verified professional in your neighborhood.</p>
              <Link to="/signup">
                <button
                  type="button"
                  className="rounded-xl border-2 border-black bg-[#F59E0B] px-5 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] cursor-pointer"
                >
                  Join as a Pro
                </button>
              </Link>
            </div>
          ) : (
            /* State 4: Real Staggered Worker Showcase Grid */
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
            >
              {workers.map((worker) => {
                const Icon = CATEGORY_ICONS[worker.category] ?? Sparkles;
                const details = CATEGORY_DETAILS[worker.category] ?? { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]' };

                return (
                  <motion.div
                    key={worker.id}
                    variants={cardVariants}
                    whileHover={{ y: -6, transition: { duration: 0.15 } }}
                    className="group relative rounded-2xl sm:rounded-3xl border-2 border-black bg-white p-4 sm:p-5 shadow-[4px_4px_0px_#000000] hover:shadow-[7px_7px_0px_#000000] transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Avatar Frame + AVAILABLE NOW badge */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className={`h-12 w-12 rounded-2xl border-2 border-black ${details.bg} flex items-center justify-center shadow-[2px_2px_0px_#000000] flex-shrink-0`}>
                          <Icon size={22} className={`${details.text} stroke-[2.5]`} />
                        </div>

                        <span className="rounded-md border border-black bg-[#BBF7D0] px-2 py-0.5 text-[9px] font-black text-[#15803D] uppercase shadow-[1px_1px_0px_#000000]">
                          Available Now
                        </span>
                      </div>

                      {/* Worker Name & Trade */}
                      <h3 className="font-black text-base text-neutral-900 leading-tight group-hover:text-[#B45309] transition-colors truncate">
                        {worker.users?.name ?? 'Verified Professional'}
                      </h3>

                      <p className="text-[11px] font-black uppercase text-neutral-500 tracking-wider mt-0.5">
                        {worker.category}
                      </p>

                      {/* Star Rating */}
                      <div className="flex items-center gap-1 text-xs font-bold text-neutral-800 my-2">
                        <Star size={13} className="fill-[#F59E0B] text-[#F59E0B]" />
                        <span>{Number(worker.rating ?? 5.0).toFixed(1)}</span>
                        <span className="text-[10px] text-neutral-400 font-medium">({worker.total_ratings ?? 0} reviews)</span>
                      </div>

                      {/* Hourly rate & location */}
                      <div className="flex items-center justify-between text-xs py-1 border-t border-dashed border-neutral-200 my-2">
                        <span className="font-black text-neutral-900">₹{worker.hourly_rate}/hr</span>
                        {worker.location && (
                          <span className="text-[10px] font-medium text-neutral-500 truncate max-w-[100px]">
                            {worker.location}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Booking CTA Button */}
                    <div className="mt-3">
                      <Link to={`/book/${worker.id}`} className="block w-full">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          type="button"
                          className="w-full rounded-xl border-2 border-black bg-[#F59E0B] hover:bg-[#E68A00] py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Booking</span>
                          <ArrowRight size={12} className="stroke-[3]" />
                        </motion.button>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 5. SECTION: HOW COLABOUR WORKS (3-Step Post-it Workflow) */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="mb-14 sm:mb-20">
          <div className="mb-6 pb-2 border-b-2 border-black">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 uppercase tracking-tight">
              How CoLabour Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Step 1 */}
            <motion.div
              whileHover={{ y: -6 }}
              className="relative rounded-3xl border-2 border-black bg-[#FFFBEB] p-6 shadow-[5px_5px_0px_#000000] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-black text-[#F59E0B]">01</span>
                <div className="h-10 w-10 rounded-xl border-2 border-black bg-[#FDE68A] flex items-center justify-center font-black">
                  📝
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black uppercase text-neutral-900 mb-1.5">
                  1. Describe Your Job
                </h3>
                <p className="text-xs sm:text-sm font-medium text-neutral-700 leading-relaxed">
                  Choose your trade (electrician, plumber, etc.) and describe your repair to receive instant transparent hourly estimates.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              whileHover={{ y: -6 }}
              className="relative rounded-3xl border-2 border-black bg-[#F0FDF4] p-6 shadow-[5px_5px_0px_#000000] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-black text-[#15803D]">02</span>
                <div className="h-10 w-10 rounded-xl border-2 border-black bg-[#BBF7D0] flex items-center justify-center font-black">
                  📍
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black uppercase text-neutral-900 mb-1.5">
                  2. Get Local Matches
                </h3>
                <p className="text-xs sm:text-sm font-medium text-neutral-700 leading-relaxed">
                  Our live GPS proximity engine instantly locks onto nearby verified pros with estimated arrival times.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              whileHover={{ y: -6 }}
              className="relative rounded-3xl border-2 border-black bg-[#EFF6FF] p-6 shadow-[5px_5px_0px_#000000] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-black text-[#0369A1]">03</span>
                <div className="h-10 w-10 rounded-xl border-2 border-black bg-[#BAE6FD] flex items-center justify-center font-black">
                  💳
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black uppercase text-neutral-900 mb-1.5">
                  3. Book & Pay Securely
                </h3>
                <p className="text-xs sm:text-sm font-medium text-neutral-700 leading-relaxed">
                  Pay 100% directly to the worker via UPI with 0% platform commission and receive a tamper-proof digital POS slip.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. TELEMETRY & LIVE PLATFORM STATS BAR */}
        {/* ========================================================================= */}
        <section className="mb-14 sm:mb-20">
          <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_#000000]">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl sm:text-4xl font-black text-neutral-900">
                  {stats?.active_workers ?? 18}+
                </p>
                <p className="text-xs font-black uppercase text-neutral-500 mt-1">Verified Pros</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-neutral-900">
                  {stats?.jobs_completed ?? 1428}+
                </p>
                <p className="text-xs font-black uppercase text-neutral-500 mt-1">Jobs Settled</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-[#B45309] flex items-center justify-center gap-1">
                  <span>{stats?.average_rating ?? 4.9}</span>
                  <Star size={20} className="fill-[#F59E0B] text-[#F59E0B]" />
                </p>
                <p className="text-xs font-black uppercase text-neutral-500 mt-1">Average Rating</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-[#15803D]">
                  0.0%
                </p>
                <p className="text-xs font-black uppercase text-neutral-500 mt-1">Platform Commission</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. BOTTOM CTA CALLOUT */}
        {/* ========================================================================= */}
        <section className="mb-10">
          <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-[#FEF3C7] p-8 sm:p-12 text-center shadow-[6px_6px_0px_#000000]">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] mb-4">
              <Zap size={28} className="text-[#B45309] fill-[#F59E0B]" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 uppercase tracking-tight mb-3">
              Ready to hire verified local pros?
            </h2>

            <p className="text-sm sm:text-base font-medium text-neutral-700 max-w-xl mx-auto mb-6">
              Join thousands of happy homeowners and certified technicians across Bangalore and beyond.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/workers">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  className="rounded-2xl border-2 border-black bg-[#F59E0B] hover:bg-[#E68A00] px-8 py-3.5 text-sm font-black uppercase text-black shadow-[3px_3px_0px_#000000] cursor-pointer"
                >
                  Browse Workers Now
                </motion.button>
              </Link>

              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  className="rounded-2xl border-2 border-black bg-white hover:bg-neutral-100 px-8 py-3.5 text-sm font-black uppercase text-black shadow-[3px_3px_0px_#000000] cursor-pointer"
                >
                  Join As Worker
                </motion.button>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. RETRO FOOTER */}
        {/* ========================================================================= */}
        <footer className="pt-6 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-neutral-600">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#F59E0B] fill-[#F59E0B]" />
            <span className="font-black text-neutral-900 uppercase">CoLabour Marketplace</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-700 font-black uppercase">
            <Link to="/workers" className="hover:underline">Workers</Link>
            <Link to="/login" className="hover:underline">Sign In</Link>
            <Link to="/signup" className="hover:underline">Register</Link>
          </div>
        </footer>

      </motion.div>
    </div>
  );
}



import { Link } from 'react-router-dom';
import {
  Zap, ShieldCheck, Clock, Wallet, ArrowRight, Star, Users, Briefcase, TrendingUp,
<<<<<<< HEAD
  CheckCircle2, Radio, Sparkles
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CATEGORIES, type WorkerWithUser } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { fetchPlatformStats, fetchWorkersList, type PlatformStats } from '@/lib/dataService';
import { AnimatedCounter } from '@/components/ui/Shared';
import { useLanguage } from '@/context/LanguageContext';

export function LandingPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [featuredWorker, setFeaturedWorker] = useState<WorkerWithUser | null>(null);
=======
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { AnimatedCounter, GlowOrb, SectionTitle } from '@/components/ui/Shared';
import { useEffect, useState } from 'react';
import { CATEGORIES } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { fetchPlatformStats, type PlatformStats } from '@/lib/dataService';

export function LandingPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
>>>>>>> origin/main
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

<<<<<<< HEAD
    async function loadData() {
      setLoading(true);
      try {
        const [statsData, workersData] = await Promise.all([
          fetchPlatformStats().catch(() => null),
          fetchWorkersList().catch(() => []),
        ]);
        if (mounted) {
          if (statsData) setStats(statsData);
          if (workersData && workersData.length > 0) {
            setFeaturedWorker(workersData[0]);
          }
        }
      } catch {
        // fallback
=======
    async function loadStats() {
      setLoading(true);
      try {
        const data = await fetchPlatformStats();
        if (mounted) {
          setStats(data);
        }
      } catch {
        if (mounted) {
          setStats({
            active_workers: 9,
            jobs_completed: 1428,
            average_rating: 4.9,
            on_time_rate: 98.4,
          });
        }
>>>>>>> origin/main
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

<<<<<<< HEAD
    loadData();
=======
    loadStats();
>>>>>>> origin/main

    return () => {
      mounted = false;
    };
  }, []);

  return (
<<<<<<< HEAD
    <div className="relative min-h-screen bg-transparent text-black pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b-2 border-black">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            
            {/* Left Copy */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-300 border-2 border-black font-black text-xs uppercase tracking-wider mb-6 shadow-[3px_3px_0px_0px_#000]">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-black" />
                </span>
                <span data-i18n="brandProtocol">{t('brandProtocol')}</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-stone-900">
                <span data-i18n="heroTitle1">{t('heroTitle1')}</span> <br />
                <span data-i18n="heroTitle2" className="bg-teal-300 px-3 py-0.5 border-2 border-stone-900 shadow-[4px_4px_0px_0px_#1c1917] inline-block mt-1">
                  {t('heroTitle2')}
                </span> <span data-i18n="heroTitle3">{t('heroTitle3')}</span>
              </h1>

              <p data-i18n="heroSubtitle" className="mt-6 max-w-xl text-base sm:text-lg font-bold text-stone-700 leading-relaxed">
                {t('heroSubtitle')}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/workers">
                  <button className="px-6 py-3.5 rounded-xl border-2 border-stone-900 bg-teal-300 text-stone-900 font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_#1c1917] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1c1917] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer">
                    <span data-i18n="browseWorkers">{t('browseWorkers')}</span> <ArrowRight size={18} />
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="px-6 py-3.5 rounded-xl border-2 border-stone-900 bg-amber-300 text-stone-900 font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_#1c1917] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1c1917] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer">
                    <span data-i18n="joinAsWorker">{t('joinAsWorker')}</span> <Sparkles size={18} />
                  </button>
=======
    <div className="relative min-h-screen overflow-hidden pt-16">
      {/* Background orbs */}
      <GlowOrb className="top-20 -left-20 h-96 w-96 bg-neon-emerald/20" />
      <GlowOrb className="top-40 right-0 h-80 w-80 bg-neon-cyan/15" />
      <GlowOrb className="bottom-0 left-1/3 h-96 w-96 bg-neon-violet/10" />

      {/* Hero */}
      <section className="relative grid-bg">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-slide-up">
              <Badge variant="emerald" className="mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-emerald opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-emerald" />
                </span>
                Live Cooperative Network
              </Badge>
              <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                Find skilled <span className="gradient-text-emerald-cyan">gig workers</span> in seconds
              </h1>
              <p className="mt-6 max-w-lg text-lg text-gray-400">
                CoLabour connects you with verified local professionals for instant bookings,
                transparent pricing, and seamless UPI payments. No middlemen, no hassle.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/workers">
                  <NeonButton size="lg" variant="emerald">
                    Browse Workers <ArrowRight size={18} />
                  </NeonButton>
                </Link>
                <Link to="/signup">
                  <NeonButton size="lg" variant="cyan">
                    Become a Worker
                  </NeonButton>
>>>>>>> origin/main
                </Link>
              </div>

              {/* Trust badges */}
<<<<<<< HEAD
              <div className="mt-10 flex flex-wrap gap-4 sm:gap-6 pt-4 border-t-2 border-black/10">
                <div className="flex items-center gap-2 rounded-lg bg-white border-2 border-black px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_0px_#000]">
                  <ShieldCheck size={16} className="text-emerald-800" />
                  <span data-i18n="aadhaarVerified">{t('aadhaarVerified')}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white border-2 border-black px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_0px_#000]">
                  <Wallet size={16} className="text-cyan-800" />
                  <span data-i18n="directUpi">{t('directUpi')}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white border-2 border-black px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_0px_#000]">
                  <Radio size={16} className="text-orange-800" />
                  <span data-i18n="liveGpsRadar">{t('liveGpsRadar')}</span>
=======
              <div className="mt-10 flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <ShieldCheck size={18} className="text-neon-emerald" />
                  <span>Verified Pros</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Wallet size={18} className="text-neon-cyan" />
                  <span>UPI Payments</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock size={18} className="text-neon-cyan" />
                  <span>Instant Booking</span>
>>>>>>> origin/main
                </div>
              </div>
            </div>

<<<<<<< HEAD
            {/* Right Interactive 3D Bento Visual */}
            <div className="lg:col-span-5 relative hidden sm:block">
              <div className="relative space-y-4">
                
                {/* 3D Worker Badge Card */}
                <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[6px_6px_0px_0px_#000] transform -rotate-1 hover:rotate-0 transition-transform">
                  <div className="flex items-center justify-between mb-3">
                    <span data-i18n="availableNearby" className="px-2.5 py-0.5 rounded-full bg-emerald-200 border-2 border-black text-[11px] font-black uppercase shadow-[1px_1px_0px_0px_#000]">
                      {t('availableNearby')}
                    </span>
                    <span className="font-mono text-xs font-black text-gray-700">
                      {featuredWorker?.location ? `${featuredWorker.location}` : 'Nearby'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-xl bg-amber-300 border-2 border-black flex items-center justify-center text-black font-black text-lg shadow-[2px_2px_0px_0px_#000]">
                      {featuredWorker?.users?.name ? featuredWorker.users.name.slice(0, 2).toUpperCase() : 'VP'}
                    </div>
                    <div>
                      <h4 className="font-black text-black text-base truncate max-w-[180px]">
                        {featuredWorker?.users?.name ?? 'Verified Professional'}
                      </h4>
                      <p className="text-xs font-bold text-gray-700">
                        {featuredWorker?.category ? (t(featuredWorker.category as any) || featuredWorker.category) : t('specElectrician')}
                      </p>
                      <div className="flex items-center gap-1 text-xs font-black text-amber-900 mt-1">
                        <Star size={14} fill="currentColor" /> {featuredWorker?.rating ? featuredWorker.rating.toFixed(1) : '5.0'} ({featuredWorker?.total_ratings || (featuredWorker?.reviews?.length || 0)} <span data-i18n="reviewsLabel">{t('reviewsLabel')}</span>)
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                    <span data-i18n="ratePerHour" className="text-xs font-bold text-gray-600">{t('ratePerHour')}</span>
                    <span className="text-xl font-black text-black">₹{featuredWorker?.hourly_rate ?? 250}<span data-i18n="perHour">{t('perHour')}</span></span>
                  </div>
                </div>

                {/* Instant Radar Match Card */}
                <div className="rounded-2xl border-2 border-black bg-cyan-200 p-4 shadow-[6px_6px_0px_0px_#000] transform rotate-2 hover:rotate-0 transition-transform">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-black animate-ping" />
                    <span data-i18n="gpsRadarDispatch" className="text-xs font-black uppercase tracking-wider text-black">
                      {t('gpsRadarDispatch')}
                    </span>
                  </div>
                  <p data-i18n="radarDescription" className="text-xs font-bold text-gray-900 mt-1">
                    {t('radarDescription')}
                  </p>
                </div>

                {/* 0% Commission Badge Card */}
                <div className="rounded-2xl border-2 border-black bg-emerald-300 p-4 shadow-[6px_6px_0px_0px_#000] flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sm">
                    <CheckCircle2 size={20} className="text-black" />
                    <span data-i18n="zeroCommissionDeduction">{t('zeroCommissionDeduction')}</span>
                  </div>
                  <span data-i18n="directP2P" className="font-mono text-xs font-black bg-white px-2 py-1 rounded border-2 border-black">
                    {t('directP2P')}
                  </span>
                </div>

              </div>
            </div>

=======
            {/* 3D Hero Cards */}
            <div className="relative perspective-1000 hidden lg:block">
              <div className="relative h-[500px]">
                <HeroCard className="absolute top-0 right-0 w-72 animate-float" />
                <HeroCard2 className="absolute top-32 left-0 w-64 animate-float-slow" />
                <HeroCard3 className="absolute bottom-0 right-12 w-60 animate-float" />
              </div>
            </div>
>>>>>>> origin/main
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* Stats Section */}
      <section className="relative border-b-2 border-black bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
=======
      {/* Stats */}
      <section className="relative border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
>>>>>>> origin/main
            {loading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
<<<<<<< HEAD
                <StatCard icon={Users} value={stats?.active_workers ?? 9} suffix="+" labelKey="activeWorkers" label={t('activeWorkers')} bg="bg-emerald-200" />
                <StatCard icon={Briefcase} value={stats?.jobs_completed ?? 1428} suffix="+" labelKey="jobsSettled" label={t('jobsSettled')} bg="bg-cyan-200" />
                <StatCard icon={Star} value={stats?.average_rating ?? 4.9} suffix="/5" labelKey="avgRating" label={t('avgRating')} bg="bg-amber-200" />
                <StatCard icon={TrendingUp} value={stats?.on_time_rate ?? 98.4} suffix="%" labelKey="onTimeRate" label={t('onTimeRate')} bg="bg-pink-200" />
=======
                <StatCard icon={Users} value={stats?.active_workers ?? 9} suffix="+" label="Active Workers" />
                <StatCard icon={Briefcase} value={stats?.jobs_completed ?? 1428} suffix="+" label="Jobs Completed" />
                <StatCard icon={Star} value={stats?.average_rating ?? 4.9} suffix="/5" label="Avg Rating" />
                <StatCard icon={TrendingUp} value={stats?.on_time_rate ?? 98.4} suffix="%" label="On-time Rate" />
>>>>>>> origin/main
              </>
            )}
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* Categories Section */}
      <section className="relative border-b-2 border-black py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div data-i18n="skillDirectory" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-300 border-2 border-black font-black text-xs uppercase tracking-wider mb-2 shadow-[2px_2px_0px_0px_#000]">
              {t('skillDirectory')}
            </div>
            <h2 data-i18n="exploreTradeCategories" className="text-3xl sm:text-5xl font-black text-black">{t('exploreTradeCategories')}</h2>
            <p data-i18n="exploreTradeSubtitle" className="mt-2 text-sm sm:text-base font-bold text-gray-700">{t('exploreTradeSubtitle')}</p>
          </div>

=======
      {/* Categories */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionTitle subtitle="Browse by service category and find the right professional for your needs">
            Explore Categories
          </SectionTitle>
>>>>>>> origin/main
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat] ?? Zap;
              const style = getCategoryStyle(cat);
              return (
<<<<<<< HEAD
                <Link key={cat} to={`/workers?category=${encodeURIComponent(cat)}`} className="block">
                  <div className="group h-full rounded-2xl border-2 border-black bg-white p-6 shadow-[5px_5px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer">
                    <div className={`mb-4 inline-flex rounded-xl border-2 border-black p-3.5 ${style.bg} shadow-[3px_3px_0px_0px_#000] group-hover:scale-105 transition-transform`}>
                      <Icon className="text-black" size={28} />
                    </div>
                    <h3 data-i18n={cat} className="text-lg font-black text-black">{t(cat as any) || cat}</h3>
                    <p className="mt-1 text-xs font-bold text-gray-600">{t(`spec${cat}` as any) || `Book verified ${cat.toLowerCase()}s`}</p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-black text-emerald-800">
                      <span data-i18n="exploreListings">{t('exploreListings')}</span> <ArrowRight size={14} />
                    </div>
                  </div>
=======
                <Link key={cat} to={`/workers?category=${encodeURIComponent(cat)}`}>
                  <GlassCard hover className="group p-6 h-full">
                    <div className={`mb-4 inline-flex rounded-2xl border p-3 ${style.bg} ${style.border} ${style.glow} transition-transform group-hover:scale-110`}>
                      <Icon className={style.text} size={28} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-200 group-hover:text-white transition-colors">{cat}</h3>
                    <p className="mt-1 text-sm text-gray-500">Book a verified {cat.toLowerCase()}</p>
                    <div className="mt-4 flex items-center gap-1 text-sm text-neon-emerald opacity-0 transition-opacity group-hover:opacity-100">
                      Explore <ArrowRight size={14} />
                    </div>
                  </GlassCard>
>>>>>>> origin/main
                </Link>
              );
            })}
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* How it works Section */}
      <section className="relative border-b-2 border-black bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div data-i18n="simple3Step" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-200 border-2 border-black font-black text-xs uppercase tracking-wider mb-2 shadow-[2px_2px_0px_0px_#000]">
              {t('simple3Step')}
            </div>
            <h2 data-i18n="howCoLabourOperates" className="text-3xl sm:text-5xl font-black text-black">{t('howCoLabourOperates')}</h2>
            <p data-i18n="howItWorksSubtitle" className="mt-2 text-sm sm:text-base font-bold text-gray-700">{t('howItWorksSubtitle')}</p>
          </div>

=======
      {/* How it works */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionTitle subtitle="Three simple steps from booking to payment">
            How It Works
          </SectionTitle>
>>>>>>> origin/main
          <div className="grid gap-8 md:grid-cols-3">
            <StepCard
              num="01"
              icon={Users}
<<<<<<< HEAD
              titleKey="step1Title"
              title={t('step1Title')}
              descKey="step1Desc"
              desc={t('step1Desc')}
              bg="bg-emerald-100"
=======
              title="Find Your Worker"
              desc="Browse verified professionals by category, location, and rating. Compare rates and skills."
>>>>>>> origin/main
            />
            <StepCard
              num="02"
              icon={Clock}
<<<<<<< HEAD
              titleKey="step2Title"
              title={t('step2Title')}
              descKey="step2Desc"
              desc={t('step2Desc')}
              bg="bg-amber-100"
=======
              title="Book Instantly"
              desc="Pick a time, set your location, and confirm. Your worker gets the request in real-time."
>>>>>>> origin/main
            />
            <StepCard
              num="03"
              icon={Wallet}
<<<<<<< HEAD
              titleKey="step3Title"
              title={t('step3Title')}
              descKey="step3Desc"
              desc={t('step3Desc')}
              bg="bg-cyan-100"
=======
              title="Pay via UPI"
              desc="Scan the QR or tap to pay in your UPI app. Confirm with your UTR number. Done."
>>>>>>> origin/main
            />
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* CTA Section */}
      <section className="relative py-20 bg-[#FAF8F5]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border-2 border-black bg-emerald-400 p-8 sm:p-14 text-center shadow-[8px_8px_0px_0px_#000]">
            <h2 data-i18n="ctaTitle" className="text-3xl sm:text-5xl font-black text-black tracking-tight">
              {t('ctaTitle')}
            </h2>
            <p data-i18n="ctaSubtitle" className="mx-auto mt-4 max-w-xl text-base font-bold text-gray-900 leading-relaxed">
              {t('ctaSubtitle')}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/signup">
                <button data-i18n="createFreeAccount" className="px-6 py-3.5 rounded-xl border-2 border-black bg-white text-black font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer">
                  {t('createFreeAccount')}
                </button>
              </Link>
              <Link to="/workers">
                <button data-i18n="browseDirectory" className="px-6 py-3.5 rounded-xl border-2 border-black bg-amber-300 text-black font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer">
                  {t('browseDirectory')}
                </button>
              </Link>
            </div>
          </div>
=======
      {/* CTA */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <GlassCard className="relative overflow-hidden p-12 text-center">
            <GlowOrb className="top-0 left-1/2 -translate-x-1/2 h-64 w-64 bg-neon-emerald/20" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold gradient-text-emerald-cyan">Ready to get started?</h2>
              <p className="mx-auto mt-4 max-w-xl text-gray-400">
                Join thousands of customers and workers on the CoLabour platform. Sign up free and start booking or earning today.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Link to="/signup"><NeonButton size="lg" variant="emerald">Create Account</NeonButton></Link>
                <Link to="/workers"><NeonButton size="lg" variant="ghost">Browse Workers</NeonButton></Link>
              </div>
            </div>
          </GlassCard>
>>>>>>> origin/main
        </div>
      </section>

      {/* Footer */}
<<<<<<< HEAD
      <footer className="border-t-2 border-stone-900 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-teal-300 border-2 border-stone-900 flex items-center justify-center shadow-[2px_2px_0px_0px_#1c1917]">
                <Zap className="h-5 w-5 text-stone-900" fill="currentColor" />
              </div>
              <span className="text-xl font-black text-stone-900">CoLabour</span>
            </div>
            <p data-i18n="copyrightText" className="text-xs font-bold text-stone-700">
              {t('copyrightText')}
=======
      <footer className="relative border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-neon-emerald" fill="currentColor" />
              <span className="text-xl font-bold gradient-text-emerald-cyan">CoLabour</span>
            </div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} CoLabour Marketplace. Next-Gen Gig Economy.
>>>>>>> origin/main
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCardSkeleton() {
  return (
<<<<<<< HEAD
    <div className="rounded-2xl border-2 border-black bg-white p-6 text-center animate-pulse shadow-[4px_4px_0px_0px_#000]">
      <div className="mx-auto mb-2 h-6 w-6 rounded bg-gray-200" />
      <div className="mx-auto mb-1 h-8 w-24 rounded bg-gray-200" />
      <div className="mx-auto h-4 w-20 rounded bg-gray-100" />
    </div>
=======
    <GlassCard className="p-6 text-center animate-pulse">
      <div className="mx-auto mb-2 h-6 w-6 rounded bg-white/10" />
      <div className="mx-auto mb-1 h-8 w-24 rounded bg-white/10" />
      <div className="mx-auto h-4 w-20 rounded bg-white/5" />
    </GlassCard>
>>>>>>> origin/main
  );
}

function StatCard({
  icon: Icon,
  value,
  suffix = '',
<<<<<<< HEAD
  labelKey,
  label,
  bg = 'bg-emerald-200',
=======
  label,
>>>>>>> origin/main
}: {
  icon: typeof Users;
  value: number;
  suffix?: string;
<<<<<<< HEAD
  labelKey?: string;
  label: string;
  bg?: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-black bg-white p-6 text-center shadow-[4px_4px_0px_0px_#000]">
      <div className={`mx-auto mb-3 inline-flex rounded-xl border-2 border-black p-2.5 ${bg} shadow-[2px_2px_0px_0px_#000]`}>
        <Icon className="text-black" size={22} />
      </div>
      <div className="text-3xl font-black text-black sm:text-4xl">
        <AnimatedCounter value={value} />
        <span className="text-black">{suffix}</span>
      </div>
      <p data-i18n={labelKey} className="mt-1 text-xs font-black uppercase tracking-wider text-gray-700">{label}</p>
    </div>
=======
  label: string;
}) {
  return (
    <GlassCard className="p-6 text-center transition-all hover:border-white/20">
      <Icon className="mx-auto mb-2 text-neon-emerald" size={24} />
      <div className="text-3xl font-bold text-white sm:text-4xl">
        <AnimatedCounter value={value} />
        <span className="text-neon-emerald">{suffix}</span>
      </div>
      <p className="mt-1 text-sm text-gray-400">{label}</p>
    </GlassCard>
>>>>>>> origin/main
  );
}

function StepCard({
  num,
  icon: Icon,
<<<<<<< HEAD
  titleKey,
  title,
  descKey,
  desc,
  bg = 'bg-emerald-100',
}: {
  num: string;
  icon: typeof Users;
  titleKey?: string;
  title: string;
  descKey?: string;
  desc: string;
  bg?: string;
}) {
  return (
    <div className={`rounded-2xl border-2 border-black ${bg} p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000] relative`}>
      <span className="absolute top-4 right-4 text-xs font-black px-2.5 py-1 rounded-md bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
        STEP {num}
      </span>
      <div className="mb-4 inline-flex rounded-xl border-2 border-black bg-white p-3 text-black shadow-[3px_3px_0px_0px_#000]">
        <Icon size={24} />
      </div>
      <h3 data-i18n={titleKey} className="text-xl font-black text-black">{title}</h3>
      <p data-i18n={descKey} className="mt-2 text-xs sm:text-sm font-bold text-gray-800 leading-relaxed">{desc}</p>
    </div>
=======
  title,
  desc,
}: {
  num: string;
  icon: typeof Users;
  title: string;
  desc: string;
}) {
  return (
    <GlassCard hover className="relative p-8">
      <span className="absolute top-6 right-6 text-3xl font-extrabold text-white/5">{num}</span>
      <div className="mb-4 inline-flex rounded-2xl border border-neon-emerald/30 bg-neon-emerald/10 p-3 text-neon-emerald">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-400 leading-relaxed">{desc}</p>
    </GlassCard>
  );
}

function HeroCard({ className }: { className?: string }) {
  return (
    <GlassCard className={`p-5 glass-strong border-neon-emerald/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] ${className}`}>
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-neon-emerald/20 border border-neon-emerald/40 flex items-center justify-center text-neon-emerald font-bold">
          RK
        </div>
        <div>
          <h4 className="font-semibold text-white">Rajesh Kumar</h4>
          <p className="text-xs text-gray-400">Master Electrician</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-gray-400 border-t border-white/5 pt-3">
        <div className="flex items-center gap-1 text-amber-400 font-semibold">
          <Star size={14} fill="currentColor" /> 4.9
        </div>
        <span className="font-bold text-neon-emerald">₹450/hr</span>
      </div>
    </GlassCard>
  );
}

function HeroCard2({ className }: { className?: string }) {
  return (
    <GlassCard className={`p-4 glass-strong border-neon-cyan/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] ${className}`}>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-neon-emerald animate-ping" />
        <span className="text-xs font-semibold text-neon-emerald">Instant Booking Confirmed</span>
      </div>
      <p className="mt-2 text-xs text-gray-300">Deep Cleaning (2BHK)</p>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <span>Today, 2:00 PM</span>
        <span className="text-neon-cyan font-bold">₹1,400</span>
      </div>
    </GlassCard>
  );
}

function HeroCard3({ className }: { className?: string }) {
  return (
    <GlassCard className={`p-4 glass-strong border-neon-violet/30 shadow-[0_0_30px_rgba(139,92,246,0.15)] ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">UPI Instant Settlement</span>
        <span className="text-xs text-emerald-400 font-bold">100% Direct</span>
      </div>
      <div className="mt-2 text-sm font-bold text-white flex items-center gap-1">
        <ShieldCheck size={16} className="text-neon-emerald" /> Zero Platform Fee
      </div>
    </GlassCard>
>>>>>>> origin/main
  );
}

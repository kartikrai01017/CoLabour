import { Link } from 'react-router-dom';
import {
  Zap, ShieldCheck, Clock, Wallet, ArrowRight, Star, Users, Briefcase, TrendingUp,
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

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
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  return (
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
                </Link>
              </div>

              {/* Trust badges */}
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
                </div>
              </div>
            </div>

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

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative border-b-2 border-black bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {loading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard icon={Users} value={stats?.active_workers ?? 9} suffix="+" labelKey="activeWorkers" label={t('activeWorkers')} bg="bg-emerald-200" />
                <StatCard icon={Briefcase} value={stats?.jobs_completed ?? 1428} suffix="+" labelKey="jobsSettled" label={t('jobsSettled')} bg="bg-cyan-200" />
                <StatCard icon={Star} value={stats?.average_rating ?? 4.9} suffix="/5" labelKey="avgRating" label={t('avgRating')} bg="bg-amber-200" />
                <StatCard icon={TrendingUp} value={stats?.on_time_rate ?? 98.4} suffix="%" labelKey="onTimeRate" label={t('onTimeRate')} bg="bg-pink-200" />
              </>
            )}
          </div>
        </div>
      </section>

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

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat] ?? Zap;
              const style = getCategoryStyle(cat);
              return (
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
                </Link>
              );
            })}
          </div>
        </div>
      </section>

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

          <div className="grid gap-8 md:grid-cols-3">
            <StepCard
              num="01"
              icon={Users}
              titleKey="step1Title"
              title={t('step1Title')}
              descKey="step1Desc"
              desc={t('step1Desc')}
              bg="bg-emerald-100"
            />
            <StepCard
              num="02"
              icon={Clock}
              titleKey="step2Title"
              title={t('step2Title')}
              descKey="step2Desc"
              desc={t('step2Desc')}
              bg="bg-amber-100"
            />
            <StepCard
              num="03"
              icon={Wallet}
              titleKey="step3Title"
              title={t('step3Title')}
              descKey="step3Desc"
              desc={t('step3Desc')}
              bg="bg-cyan-100"
            />
          </div>
        </div>
      </section>

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
        </div>
      </section>

      {/* Footer */}
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
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-black bg-white p-6 text-center animate-pulse shadow-[4px_4px_0px_0px_#000]">
      <div className="mx-auto mb-2 h-6 w-6 rounded bg-gray-200" />
      <div className="mx-auto mb-1 h-8 w-24 rounded bg-gray-200" />
      <div className="mx-auto h-4 w-20 rounded bg-gray-100" />
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  suffix = '',
  labelKey,
  label,
  bg = 'bg-emerald-200',
}: {
  icon: typeof Users;
  value: number;
  suffix?: string;
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
  );
}

function StepCard({
  num,
  icon: Icon,
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
  );
}

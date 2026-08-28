import { Link } from 'react-router-dom';
import {
  Zap, ShieldCheck, Clock, Wallet, ArrowRight, Star, Users, Briefcase, TrendingUp,
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

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
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      mounted = false;
    };
  }, []);

  return (
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
                </Link>
              </div>

              {/* Trust badges */}
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
                </div>
              </div>
            </div>

            {/* 3D Hero Cards */}
            <div className="relative perspective-1000 hidden lg:block">
              <div className="relative h-[500px]">
                <HeroCard className="absolute top-0 right-0 w-72 animate-float" />
                <HeroCard2 className="absolute top-32 left-0 w-64 animate-float-slow" />
                <HeroCard3 className="absolute bottom-0 right-12 w-60 animate-float" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {loading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard icon={Users} value={stats?.active_workers ?? 9} suffix="+" label="Active Workers" />
                <StatCard icon={Briefcase} value={stats?.jobs_completed ?? 1428} suffix="+" label="Jobs Completed" />
                <StatCard icon={Star} value={stats?.average_rating ?? 4.9} suffix="/5" label="Avg Rating" />
                <StatCard icon={TrendingUp} value={stats?.on_time_rate ?? 98.4} suffix="%" label="On-time Rate" />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionTitle subtitle="Browse by service category and find the right professional for your needs">
            Explore Categories
          </SectionTitle>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat] ?? Zap;
              const style = getCategoryStyle(cat);
              return (
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
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionTitle subtitle="Three simple steps from booking to payment">
            How It Works
          </SectionTitle>
          <div className="grid gap-8 md:grid-cols-3">
            <StepCard
              num="01"
              icon={Users}
              title="Find Your Worker"
              desc="Browse verified professionals by category, location, and rating. Compare rates and skills."
            />
            <StepCard
              num="02"
              icon={Clock}
              title="Book Instantly"
              desc="Pick a time, set your location, and confirm. Your worker gets the request in real-time."
            />
            <StepCard
              num="03"
              icon={Wallet}
              title="Pay via UPI"
              desc="Scan the QR or tap to pay in your UPI app. Confirm with your UTR number. Done."
            />
          </div>
        </div>
      </section>

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
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-neon-emerald" fill="currentColor" />
              <span className="text-xl font-bold gradient-text-emerald-cyan">CoLabour</span>
            </div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} CoLabour Marketplace. Next-Gen Gig Economy.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <GlassCard className="p-6 text-center animate-pulse">
      <div className="mx-auto mb-2 h-6 w-6 rounded bg-white/10" />
      <div className="mx-auto mb-1 h-8 w-24 rounded bg-white/10" />
      <div className="mx-auto h-4 w-20 rounded bg-white/5" />
    </GlassCard>
  );
}

function StatCard({
  icon: Icon,
  value,
  suffix = '',
  label,
}: {
  icon: typeof Users;
  value: number;
  suffix?: string;
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
  );
}

function StepCard({
  num,
  icon: Icon,
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
  );
}

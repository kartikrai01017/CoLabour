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
      {/* Hero */}
      <section className="relative grid-bg">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-slide-up">
              <Badge variant="emerald" className="mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nb-accent-green opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-nb-accent-green" />
                </span>
                Live Cooperative Network
              </Badge>
              <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-nb-ink sm:text-6xl lg:text-7xl">
                Find skilled <span className="text-nb-accent-orange">gig workers</span> in seconds
              </h1>
              <p className="mt-6 max-w-lg text-lg text-nb-text-muted">
                CoLabour connects you with verified local professionals for instant bookings,
                transparent pricing, and seamless UPI payments. No middlemen, no hassle.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/workers">
                  <NeonButton size="lg" variant="amber">
                    Browse Workers <ArrowRight size={18} />
                  </NeonButton>
                </Link>
                <Link to="/signup">
                  <NeonButton size="lg" variant="ghost">
                    Become a Worker
                  </NeonButton>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-nb-ink">
                  <ShieldCheck size={18} className="text-nb-accent-green" />
                  <span>Verified Pros</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-nb-ink">
                  <Wallet size={18} className="text-nb-accent-blue" />
                  <span>UPI Payments</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-nb-ink">
                  <Clock size={18} className="text-nb-accent-orange" />
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
      <section className="relative border-y-[3px] border-nb-ink bg-nb-surface-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
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
                    <div className={`mb-4 inline-flex rounded-nb-lg border-2 border-nb-ink p-3 bg-nb-surface shadow-nb-sm transition-transform group-hover:scale-110 group-hover:shadow-nb-md`}>
                      <Icon className="text-nb-ink" size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-nb-ink">{cat}</h3>
                    <p className="mt-1 text-sm text-nb-text-muted">Book a verified {cat.toLowerCase()}</p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-nb-accent-orange opacity-0 transition-opacity group-hover:opacity-100">
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
      <section className="relative bg-nb-surface-muted/30">
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
          <GlassCard className="relative overflow-hidden p-12 text-center border-[4px] shadow-nb-xl">
            <div className="relative z-10">
              <h2 className="text-4xl font-extrabold text-nb-ink">Ready to get started?</h2>
              <p className="mx-auto mt-4 max-w-xl text-nb-text-muted">
                Join thousands of customers and workers on the CoLabour platform. Sign up free and start booking or earning today.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Link to="/signup"><NeonButton size="lg" variant="amber">Create Account</NeonButton></Link>
                <Link to="/workers"><NeonButton size="lg" variant="ghost">Browse Workers</NeonButton></Link>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t-[3px] border-nb-ink bg-nb-surface">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="bg-nb-accent-yellow border-2 border-nb-ink rounded-nb-sm p-1 shadow-nb-sm">
                <Zap className="h-4 w-4 text-nb-ink" fill="currentColor" />
              </div>
              <span className="text-xl font-bold text-nb-ink">CoLabour</span>
            </div>
            <p className="text-sm font-medium text-nb-text-muted">
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
      <div className="mx-auto mb-2 h-6 w-6 rounded-nb-sm bg-nb-surface-muted border border-nb-ink/10" />
      <div className="mx-auto mb-1 h-8 w-24 rounded-nb-md bg-nb-surface-muted border border-nb-ink/10" />
      <div className="mx-auto h-4 w-20 rounded-nb-sm bg-nb-surface-muted border border-nb-ink/10" />
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
    <GlassCard className="p-6 text-center transition-all hover:-translate-y-1 hover:shadow-nb-xl">
      <Icon className="mx-auto mb-2 text-nb-ink" size={24} />
      <div className="text-3xl font-extrabold text-nb-ink sm:text-4xl">
        <AnimatedCounter value={value} />
        <span className="text-nb-accent-orange">{suffix}</span>
      </div>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-nb-text-muted">{label}</p>
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
      <span className="absolute top-6 right-6 text-4xl font-black text-nb-ink/[0.06]">{num}</span>
      <div className="mb-4 inline-flex rounded-nb-lg border-2 border-nb-ink bg-nb-accent-green/20 p-3 text-nb-ink shadow-nb-sm">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold text-nb-ink">{title}</h3>
      <p className="mt-2 text-sm text-nb-text-muted leading-relaxed">{desc}</p>
    </GlassCard>
  );
}

function HeroCard({ className }: { className?: string }) {
  return (
    <GlassCard className={`p-5 bg-nb-surface border-[3px] border-nb-ink shadow-nb-xl ${className}`}>
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-nb-lg bg-nb-accent-green/20 border-2 border-nb-ink flex items-center justify-center text-nb-ink font-bold text-sm shadow-nb-sm">
          RK
        </div>
        <div>
          <h4 className="font-bold text-nb-ink">Rajesh Kumar</h4>
          <p className="text-xs font-medium text-nb-text-muted">Master Electrician</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs font-semibold text-nb-ink border-t-2 border-nb-ink/10 pt-3">
        <div className="flex items-center gap-1 text-nb-accent-yellow font-bold">
          <Star size={14} fill="currentColor" /> 4.9
        </div>
        <span className="font-bold text-nb-accent-green">₹450/hr</span>
      </div>
    </GlassCard>
  );
}

function HeroCard2({ className }: { className?: string }) {
  return (
    <GlassCard className={`p-4 bg-nb-surface border-[3px] border-nb-ink shadow-nb-lg ${className}`}>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-nb-accent-green animate-ping" />
        <span className="text-xs font-bold text-nb-ink uppercase tracking-wider">Booking Confirmed</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-nb-ink">Deep Cleaning (2BHK)</p>
      <div className="mt-2 flex items-center justify-between text-xs font-medium text-nb-text-muted">
        <span>Today, 2:00 PM</span>
        <span className="text-nb-accent-green font-bold">₹1,400</span>
      </div>
    </GlassCard>
  );
}

function HeroCard3({ className }: { className?: string }) {
  return (
    <GlassCard className={`p-4 bg-nb-accent-yellow border-[3px] border-nb-ink shadow-nb-xl ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-nb-ink uppercase tracking-wider">UPI Settlement</span>
        <span className="text-xs font-bold text-nb-ink bg-nb-surface border border-nb-ink rounded-nb-sm px-1.5 py-0.5">100%</span>
      </div>
      <div className="mt-2 text-sm font-bold text-nb-ink flex items-center gap-1">
        <ShieldCheck size={16} /> Zero Platform Fee
      </div>
    </GlassCard>
  );
}
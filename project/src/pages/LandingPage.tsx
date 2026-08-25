import { Link } from 'react-router-dom';
import {
  Zap, ShieldCheck, Clock, Wallet, ArrowRight, Star, Users, Briefcase, TrendingUp,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { AnimatedCounter, GlowOrb, SectionTitle } from '@/components/ui/Shared';
import { CATEGORIES } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';

export function LandingPage() {
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
                Co-Laber connects you with verified local professionals for instant bookings,
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
                <TrustBadge icon={ShieldCheck} label="Verified Pros" />
                <TrustBadge icon={Wallet} label="UPI Payments" />
                <TrustBadge icon={Clock} label="Instant Booking" />
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
            <StatCard icon={Users} value={12450} suffix="+" label="Active Workers" />
            <StatCard icon={Briefcase} value={38900} suffix="+" label="Jobs Completed" />
            <StatCard icon={Star} value={4.8} suffix="/5" label="Avg Rating" />
            <StatCard icon={TrendingUp} value={92} suffix="%" label="On-time Rate" />
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
                Join thousands of customers and workers on the Co-Laber platform. Sign up free and start booking or earning today.
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
              <span className="text-lg font-bold">Co<span className="gradient-text-emerald-cyan">Laber</span></span>
            </div>
            <p className="text-sm text-gray-500">© 2026 Co-Laber. Cooperative gig marketplace.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TrustBadge({ icon: Icon, label }: { icon: typeof ShieldCheck; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <Icon size={18} className="text-neon-emerald" />
      {label}
    </div>
  );
}

function StatCard({ icon: Icon, value, suffix, label }: { icon: typeof Users; value: number; suffix: string; label: string }) {
  return (
    <GlassCard className="p-6 text-center">
      <Icon className="mx-auto mb-3 text-neon-cyan" size={28} />
      <div className="text-3xl font-bold text-white">
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </GlassCard>
  );
}

function StepCard({ num, icon: Icon, title, desc }: { num: string; icon: typeof Users; title: string; desc: string }) {
  return (
    <GlassCard hover className="relative p-8">
      <span className="absolute top-4 right-6 text-5xl font-bold text-white/5">{num}</span>
      <div className="mb-4 inline-flex rounded-2xl bg-neon-emerald/10 border border-neon-emerald/30 p-3">
        <Icon className="text-neon-emeraldGlow" size={24} />
      </div>
      <h3 className="text-xl font-semibold text-gray-100">{title}</h3>
      <p className="mt-2 text-sm text-gray-400">{desc}</p>
    </GlassCard>
  );
}

function HeroCard({ className }: { className: string }) {
  return (
    <GlassCard className={`p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-neon-emerald to-neon-cyan" />
        <div>
          <p className="font-semibold text-white">Rajesh Kumar</p>
          <p className="text-xs text-gray-400">Electrician • 4.9 ★</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Hourly Rate</span>
          <span className="text-neon-emeraldGlow font-semibold">₹350/hr</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Jobs Done</span>
          <span className="text-white">247</span>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Badge variant="emerald">Verified</Badge>
        <Badge variant="cyan">Online</Badge>
      </div>
    </GlassCard>
  );
}

function HeroCard2({ className }: { className: string }) {
  return (
    <GlassCard className={`p-5 ${className}`}>
      <div className="mb-3 flex items-center gap-2">
        <Wallet size={20} className="text-neon-cyan" />
        <span className="text-sm font-semibold text-gray-200">Payment</span>
      </div>
      <div className="rounded-xl bg-base-800 p-4 text-center">
        <p className="text-2xl font-bold gradient-text-emerald-cyan">₹1,400</p>
        <p className="text-xs text-gray-500 mt-1">UPI • Instant</p>
      </div>
      <div className="mt-3 flex items-center justify-center gap-1 text-xs text-neon-emerald">
        <ShieldCheck size={14} /> Secured
      </div>
    </GlassCard>
  );
}

function HeroCard3({ className }: { className: string }) {
  return (
    <GlassCard className={`p-5 ${className}`}>
      <div className="mb-3 flex items-center gap-2">
        <Clock size={20} className="text-neon-violet" />
        <span className="text-sm font-semibold text-gray-200">Booking</span>
      </div>
      <div className="space-y-2">
        <div className="h-2 rounded-full bg-neon-emerald/30 overflow-hidden">
          <div className="h-full w-3/4 rounded-full bg-neon-emerald animate-pulse-glow" />
        </div>
        <p className="text-xs text-gray-400">Today, 2:00 PM</p>
      </div>
    </GlassCard>
  );
}

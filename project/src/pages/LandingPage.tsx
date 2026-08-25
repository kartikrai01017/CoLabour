import { Link } from 'react-router-dom';
import {
  Handshake, ShieldCheck, Clock, Wallet, ArrowRight, Star, Users, Briefcase, TrendingUp,
  Scissors, Heart, Coins, ArrowDown, Zap,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { AnimatedCounter, GlowOrb, FloatingShape, ParticleField, SectionTitle } from '@/components/ui/Shared';
import { CATEGORIES } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useParallax } from '@/components/ui/CursorEffect';

export function LandingPage() {
  const heroRef = useParallax(0.12);

  return (
    <div className="relative min-h-screen overflow-hidden pt-16 atmosphere">
      {/* Background */}
      <FloatingShape className="top-32 -left-32 h-[500px] w-[500px] animate-drift-slow" color="brass" />
      <FloatingShape className="top-60 -right-20 h-[400px] w-[400px] animate-drift" color="sage" delay={2} />
      <FloatingShape className="bottom-20 left-1/3 h-[450px] w-[450px] animate-drift-slow" color="warm" delay={4} />
      <ParticleField />

      {/* ── HERO: The co-op promise ── */}
      <section className="relative grid-bg">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2" ref={heroRef}>
            <div className="animate-slide-up">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brass/15 bg-brass/[0.06] px-3 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brass opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brass" />
                </span>
                <span className="text-xs font-medium tracking-wide text-brass">Worker-owned · Community-powered</span>
              </div>

              <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-[4.2rem]">
                Your work.<br />
                Your <span className="gradient-text">worth.</span><br />
                <span className="text-2xl font-normal tracking-normal text-muted sm:text-3xl lg:text-3xl">No one in between.</span>
              </h1>

              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted">
                Other platforms take <span className="text-white font-medium">20–30%</span> of every job. <span className="text-cream font-medium">CoLabour takes 0.</span> A cooperative marketplace where money flows directly from the people who need work to the people who do it — fairly, transparently, together.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/workers">
                  <NeonButton size="lg">
                    Find a Worker <ArrowRight size={16} />
                  </NeonButton>
                </Link>
                <Link to="/signup">
                  <NeonButton size="lg" variant="ghost">
                    Join as Worker
                  </NeonButton>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-5">
                <TrustBadge icon={Handshake} label="Co-op owned" />
                <TrustBadge icon={Coins} label="0% platform cut" />
                <TrustBadge icon={ShieldCheck} label="Verified workers" />
              </div>
            </div>

            {/* Visual: Money Flow */}
            <div className="relative hidden lg:block">
              <MoneyFlowVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ── THE OLD WAY vs CO-OP WAY ── */}
      <section className="relative border-y border-white/[0.04] bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Old way */}
            <GlassCard className="relative overflow-hidden p-6 opacity-60">
              <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/15">
                  <Scissors size={14} className="text-red-400" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-red-400/70">The old way</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-white/70">Platform takes its cut</h3>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-muted">You pay ₹1,000</span>
                <ArrowRight size={12} className="text-muted-dark" />
                <span className="rounded-lg bg-red-500/10 border border-red-500/15 px-2.5 py-1 text-red-300">Worker gets ₹700</span>
              </div>
              <p className="mt-3 text-xs text-muted-dark">30% siphoned off. The people who do the work earn the least.</p>
            </GlassCard>

            {/* Co-op way */}
            <GlassCard className="relative overflow-hidden p-6 border-brass/15">
              <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-brass/30 to-transparent" />
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass/10 border border-brass/15">
                  <Handshake size={14} className="text-brass" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-brass">The CoLabour way</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-white">Money stays where work happens</h3>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-muted">You pay ₹1,000</span>
                <ArrowRight size={12} className="text-brass" />
                <span className="rounded-lg bg-brass/10 border border-brass/20 px-2.5 py-1 font-semibold text-brass">Worker gets ₹1,000</span>
              </div>
              <p className="mt-3 text-xs text-muted">100% goes to the worker. No extraction. Just a handshake.</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ── STATS: Co-op proof ── */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Coins} value={2.4} suffix="Cr+" label="Kept by workers" sublabel="not taken by a platform" />
            <StatCard icon={Users} value={12450} suffix="+" label="Co-op members" sublabel="workers & customers" />
            <StatCard icon={Heart} value={38900} suffix="+" label="Jobs, done together" sublabel="every rupee stayed local" />
            <StatCard icon={Star} value={4.8} suffix="/5" label="Trust rating" sublabel="because fairness earns trust" />
          </div>
        </div>
      </section>

      {/* ── CATEGORIES: Skills as community wealth ── */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Community of makers" subtitle="Every skill is someone's livelihood. Browse the people who keep your world running.">
            Skills that <span className="gradient-text">build</span> together
          </SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat] ?? Zap;
              const style = getCategoryStyle(cat);
              return (
                <Link key={cat} to={`/workers?category=${encodeURIComponent(cat)}`}>
                  <GlassCard hover className="group p-5 h-full">
                    <div className={`mb-3 inline-flex rounded-xl border p-2.5 ${style.bg} ${style.border} transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg`}>
                      <Icon className={style.text} size={22} />
                    </div>
                    <h3 className="font-display text-[15px] font-semibold text-white transition-colors duration-300 group-hover:text-brass">{cat}</h3>
                    <p className="mt-1 text-xs text-muted">Book a verified {cat.toLowerCase()}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-brass opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-1">
                      Meet them <ArrowRight size={12} />
                    </div>
                  </GlassCard>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS: The co-op flow ── */}
      <section className="relative bg-white/[0.015] border-y border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Three handshakes" subtitle="No algorithms deciding your worth. Just people, finding each other.">
            How the co-op works
          </SectionTitle>
          {/* Connected steps with flow line */}
          <div className="relative grid gap-5 md:grid-cols-3">
            {/* Connecting line — desktop only */}
            <div className="absolute top-[52px] left-[16%] right-[16%] hidden h-px md:block">
              <div className="h-px w-full bg-gradient-to-r from-brass/20 via-sage/15 to-brass/20" />
              <div className="absolute left-1/2 top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-brass/30 to-transparent animate-pulse" />
            </div>
            <StepCard num="01" icon={Users} title="Find your person" desc="Browse real people — verified, rated by your neighbours, with rates they set themselves." />
            <StepCard num="02" icon={Clock} title="Agree, directly" desc="Pick a time and place. No surge pricing, no hidden fees. What you see is what they earn." />
            <StepCard num="03" icon={Wallet} title="Pay, hand to hand" desc="UPI straight to them. Every rupee accounted for. You both know exactly where it went." />
          </div>
          <p className="mt-6 text-center text-xs text-muted-dark">
            The co-op holds no one's money. It just makes the handshake possible. <span className="text-brass">That's the whole point.</span>
          </p>
        </div>
      </section>

      {/* ── CTA: Join the cooperative ── */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <GlassCard className="relative overflow-hidden p-10 text-center sm:p-12">
            <GlowOrb className="top-0 left-1/2 -translate-x-1/2 h-64 w-64 bg-brass/10" />
            <GlowOrb className="bottom-0 right-1/4 h-48 w-48 bg-sage/8" />
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brass/60">This is yours too</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
                A marketplace that <span className="gradient-text">belongs</span> to its people
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted">
                CoLabour isn't owned by investors. It's owned by the workers and customers who use it. Every booking makes the co-op stronger — not a corporation richer.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/signup"><NeonButton size="lg">Join the Co-op — it's free</NeonButton></Link>
                <Link to="/workers"><NeonButton size="lg" variant="ghost">Browse Workers</NeonButton></Link>
              </div>
              <p className="mt-4 text-xs text-muted-dark">No fees to join. No fees to stay. That's co-operative.</p>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-brass/10 border border-brass/15">
                <Handshake size={12} className="text-brass" />
              </div>
              <span className="font-display text-base font-bold text-white">Co<span className="text-brass">Labour</span></span>
              <span className="rounded-full bg-brass/10 border border-brass/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-brass/60">Co-op</span>
            </div>
            <p className="text-xs text-muted-dark">© 2026 CoLabour · A worker-owned cooperative marketplace. Money stays where work happens.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TrustBadge({ icon: Icon, label }: { icon: typeof ShieldCheck; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <Icon size={15} className="text-brass" />
      {label}
    </div>
  );
}

function StatCard({ icon: Icon, value, suffix, label, sublabel }: { icon: typeof Users; value: number; suffix: string; label: string; sublabel: string }) {
  return (
    <GlassCard className="p-5 text-center">
      <Icon className="mx-auto mb-2.5 text-brass" size={22} />
      <div className="font-display text-2xl font-bold text-white">
        {typeof value === 'number' && value % 1 !== 0
          ? <><AnimatedCounter value={Math.floor(value * 10)} />.{String(value).split('.')[1]}{suffix}</>
          : <AnimatedCounter value={value} suffix={suffix} />}
      </div>
      <p className="mt-0.5 text-xs font-medium text-white/80">{label}</p>
      <p className="text-[11px] text-muted-dark">{sublabel}</p>
    </GlassCard>
  );
}

function StepCard({ num, icon: Icon, title, desc }: { num: string; icon: typeof Users; title: string; desc: string }) {
  return (
    <GlassCard hover className="relative p-7">
      <span className="absolute top-3 right-5 font-display text-4xl font-bold text-white/[0.025]">{num}</span>
      <div className="mb-3 inline-flex rounded-xl bg-brass/[0.07] border border-brass/10 p-2.5">
        <Icon className="text-brass" size={18} />
      </div>
      <h3 className="font-display text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
    </GlassCard>
  );
}

function MoneyFlowVisual() {
  return (
    <div className="relative flex flex-col items-center gap-3 py-4">
      {/* Customer card */}
      <GlassCard className="w-72 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brass/10 border border-brass/15">
            <Users size={18} className="text-brass" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">You</p>
            <p className="text-xs text-muted">Need work done</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm font-bold text-white">₹1,000</p>
            <p className="text-[11px] text-muted">you pay</p>
          </div>
        </div>
      </GlassCard>

      {/* Flow arrow */}
      <div className="flex flex-col items-center gap-1.5 py-1">
        <div className="h-6 w-px bg-gradient-to-b from-brass/30 to-sage/30" />
        <div className="flex items-center gap-1.5 rounded-full border border-brass/15 bg-brass/10 px-3 py-1">
          <ArrowDown size={10} className="text-brass" />
          <span className="text-[11px] font-semibold text-brass">direct · no cut</span>
        </div>
        <div className="h-6 w-px bg-gradient-to-b from-sage/30 to-brass/20" />
      </div>

      {/* Worker card */}
      <GlassCard className="w-72 p-4 border-brass/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/10 border border-sage/15">
            <Briefcase size={18} className="text-sage" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Your worker</p>
            <p className="text-xs text-muted">Does the work</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm font-bold text-brass">₹1,000</p>
            <p className="text-[11px] text-sage">they keep</p>
          </div>
        </div>
      </GlassCard>

      {/* Co-op note */}
      <p className="mt-1 text-center text-[11px] text-muted-dark max-w-[280px]">
        CoLabour holds <span className="text-brass font-medium">nothing</span> in between. Just trust, verified.
      </p>
    </div>
  );
}

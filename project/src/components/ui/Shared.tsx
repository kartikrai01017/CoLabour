import { type ReactNode, useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useParallax } from '@/components/ui/CursorEffect';

export function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star size={size} className="fill-brass text-brass drop-shadow-[0_0_6px_rgba(197,160,89,0.3)]" />
      <span className="font-semibold text-brass">{rating.toFixed(1)}</span>
    </div>
  );
}

export function GlowOrb({ className }: { className: string }) {
  const ref = useParallax(0.5);
  return <div ref={ref} className={`glow-orb ${className}`} />;
}

export function FloatingShape({ className, color = 'brass', delay = 0 }: { className: string; color?: string; delay?: number }) {
  const ref = useParallax(0.3);
  const colorMap: Record<string, string> = {
    'brass': 'bg-brass/10',
    'sage': 'bg-sage/8',
    'warm': 'bg-[#d4a574]/6',
    'neon-cyan': 'bg-brass/10',
    'neon-purple': 'bg-sage/8',
    'neon-pink': 'bg-[#c27a6e]/6',
    'neon-blue': 'bg-[#6b8db5]/8',
    'neon-green': 'bg-sage/6',
  };
  return (
    <div
      ref={ref}
      className={`floating-shape ${colorMap[color] || 'bg-brass/10'} animate-drift-slow ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

export function ParticleField() {
  const [particles] = useState(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 8,
      duration: 4 + Math.random() * 6,
      color: ['#c5a059', '#7c9a6b', '#d4a574', '#6b8db5', '#c27a6e'][i % 5],
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-float"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            opacity: 0.25,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            filter: `blur(${p.size * 0.5}px)`,
          }}
        />
      ))}
    </div>
  );
}

export function SectionTitle({ children, subtitle, eyebrow }: { children: ReactNode; subtitle?: string; eyebrow?: string }) {
  const ref = useParallax(0.1);
  return (
    <div ref={ref} className="mb-8">
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-brass/70">{eyebrow}</p>}
      <h2 className="font-display text-3xl font-bold text-white sm:text-4xl drop-shadow-lg">{children}</h2>
      {subtitle && <p className="mt-2.5 text-muted max-w-2xl">{subtitle}</p>}
    </div>
  );
}

export function AnimatedCounter({ value, suffix = '', duration = 1500 }: { value: number; suffix?: string; duration?: number }) {
  return <CounterInner value={value} suffix={suffix} duration={duration} />;
}

function CounterInner({ value, suffix, duration }: { value: number; suffix: string; duration: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setCount(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

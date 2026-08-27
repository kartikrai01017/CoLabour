import { type ReactNode } from 'react';
import { Star } from 'lucide-react';

export function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star size={size} className="fill-nb-accent-yellow text-nb-accent-yellow" />
      <span className="font-bold text-nb-ink">{rating.toFixed(1)}</span>
    </div>
  );
}

export function GlowOrb({ className }: { className: string }) {
  return <div className={`absolute rounded-full opacity-5 pointer-events-none blur-[80px] bg-nb-ink ${className}`} />;
}

export function SectionTitle({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-nb-ink sm:text-4xl">{children}</h2>
      {subtitle && <p className="mt-2 text-nb-text-muted">{subtitle}</p>}
    </div>
  );
}

export function AnimatedCounter({ value, suffix = '', duration = 1500 }: { value: number; suffix?: string; duration?: number }) {
  return <CounterInner value={value} suffix={suffix} duration={duration} />;
}

import { useEffect, useState } from 'react';

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
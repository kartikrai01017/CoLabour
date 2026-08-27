<<<<<<< HEAD
import { type ReactNode, useEffect, useState } from 'react';
=======
import { type ReactNode } from 'react';
>>>>>>> origin/main
import { Star } from 'lucide-react';

export function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
<<<<<<< HEAD
    <div className="flex items-center gap-1 bg-amber-100 border border-black px-2 py-0.5 rounded-md shadow-[1px_1px_0px_0px_#000]">
      <Star size={size} className="fill-amber-500 text-amber-600" />
      <span className="font-black text-black text-xs">{rating.toFixed(1)}</span>
=======
    <div className="flex items-center gap-1">
      <Star size={size} className="fill-amber-400 text-amber-400" />
      <span className="font-semibold text-amber-400">{rating.toFixed(1)}</span>
>>>>>>> origin/main
    </div>
  );
}

<<<<<<< HEAD
export function GlowOrb() {
  return null; // Clean up dark glowing orbs for crisp Neo-Brutalist light mesh
=======
export function GlowOrb({ className }: { className: string }) {
  return <div className={`glow-orb ${className}`} />;
>>>>>>> origin/main
}

export function SectionTitle({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <div className="mb-8">
<<<<<<< HEAD
      <h2 className="text-3xl font-black text-black sm:text-4xl">{children}</h2>
      {subtitle && <p className="mt-2 text-sm font-semibold text-gray-700">{subtitle}</p>}
=======
      <h2 className="text-3xl font-bold gradient-text-emerald-cyan sm:text-4xl">{children}</h2>
      {subtitle && <p className="mt-2 text-gray-400">{subtitle}</p>}
>>>>>>> origin/main
    </div>
  );
}

export function AnimatedCounter({ value, suffix = '', duration = 1500 }: { value: number; suffix?: string; duration?: number }) {
  return <CounterInner value={value} suffix={suffix} duration={duration} />;
}

<<<<<<< HEAD
=======
import { useEffect, useState } from 'react';

>>>>>>> origin/main
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
<<<<<<< HEAD

=======
>>>>>>> origin/main

import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'emerald' | 'cyan' | 'violet' | 'amber' | 'red' | 'gray';
  className?: string;
}

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  const variants: Record<string, string> = {
    emerald: 'bg-neon-emerald/10 text-neon-emeraldGlow border-neon-emerald/30',
    cyan: 'bg-neon-cyan/10 text-neon-cyanGlow border-neon-cyan/30',
    violet: 'bg-neon-violet/10 text-neon-violetGlow border-neon-violet/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    red: 'bg-red-500/10 text-red-400 border-red-500/30',
    gray: 'bg-white/5 text-gray-400 border-white/10',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

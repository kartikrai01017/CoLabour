import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'emerald' | 'cyan' | 'violet' | 'amber' | 'red' | 'gray';
  className?: string;
}

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  const variants: Record<string, string> = {
    emerald: 'bg-brass/10 text-brass border-brass/20 shadow-[0_0_10px_rgba(197,160,89,0.06)]',
    cyan: 'bg-brass/10 text-brass border-brass/20 shadow-[0_0_10px_rgba(197,160,89,0.06)]',
    violet: 'bg-sage/10 text-sage border-sage/20 shadow-[0_0_10px_rgba(124,154,107,0.06)]',
    amber: 'bg-brass/10 text-brass border-brass/20 shadow-[0_0_10px_rgba(197,160,89,0.06)]',
    red: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.06)]',
    gray: 'bg-white/[0.04] text-muted border-white/8',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-sm ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

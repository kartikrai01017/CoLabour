import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'emerald' | 'cyan' | 'violet' | 'amber' | 'red' | 'gray';
  className?: string;
}

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  const variants: Record<string, string> = {
    emerald: 'bg-nb-accent-green/20 text-nb-ink border-nb-accent-green',
    cyan: 'bg-nb-accent-blue/20 text-nb-ink border-nb-accent-blue',
    violet: 'bg-nb-accent-pink/20 text-nb-ink border-nb-accent-pink',
    amber: 'bg-nb-accent-yellow/20 text-nb-ink border-nb-accent-yellow',
    red: 'bg-nb-accent-red/20 text-white border-nb-accent-red',
    gray: 'bg-nb-surface-muted text-nb-text-muted border-nb-ink/20',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-nb-sm border-[1.5px] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
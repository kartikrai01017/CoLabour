import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'emerald' | 'cyan' | 'violet' | 'amber' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function NeonButton({
  children,
  variant = 'emerald',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: NeonButtonProps) {
  const variants: Record<string, string> = {
    emerald: 'bg-neon-emerald/10 text-neon-emeraldGlow border-neon-emerald/40 hover:bg-neon-emerald/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    cyan: 'bg-neon-cyan/10 text-neon-cyanGlow border-neon-cyan/40 hover:bg-neon-cyan/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    violet: 'bg-neon-violet/10 text-neon-violetGlow border-neon-violet/40 hover:bg-neon-violet/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]',
    ghost: 'bg-transparent text-gray-300 border-white/10 hover:bg-white/5 hover:border-white/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/40 hover:bg-amber-500/20 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    danger: 'bg-red-500/10 text-red-400 border-red-500/40 hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]',
  };

  const sizes: Record<string, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button
      className={`relative inline-flex items-center justify-center gap-2 rounded-xl border font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

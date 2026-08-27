import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'emerald' | 'cyan' | 'violet' | 'ghost' | 'danger' | 'amber';
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
    emerald: 'bg-nb-accent-green text-nb-ink border-nb-ink hover:bg-[#95be76] shadow-nb-sm hover:shadow-nb-md active:shadow-nb-pressed active:translate-x-[4px] active:translate-y-[4px]',
    cyan: 'bg-nb-accent-blue text-nb-ink border-nb-ink hover:bg-[#72a8ed] shadow-nb-sm hover:shadow-nb-md active:shadow-nb-pressed active:translate-x-[4px] active:translate-y-[4px]',
    violet: 'bg-nb-accent-pink text-nb-ink border-nb-ink hover:bg-[#d993a3] shadow-nb-sm hover:shadow-nb-md active:shadow-nb-pressed active:translate-x-[4px] active:translate-y-[4px]',
    ghost: 'bg-transparent text-nb-ink border-nb-ink hover:bg-nb-surface-muted shadow-none hover:shadow-nb-sm',
    danger: 'bg-nb-accent-red text-white border-nb-ink hover:bg-[#d04a4a] shadow-nb-sm hover:shadow-nb-md active:shadow-nb-pressed active:translate-x-[4px] active:translate-y-[4px]',
    amber: 'bg-nb-accent-yellow text-nb-ink border-nb-ink hover:bg-nb-accent-orange shadow-nb-sm hover:shadow-nb-md active:shadow-nb-pressed active:translate-x-[4px] active:translate-y-[4px]',
  };

  const sizes: Record<string, string> = {
    sm: 'px-4 py-2 text-xs rounded-nb-md',
    md: 'px-6 py-2.5 text-sm rounded-nb-md',
    lg: 'px-8 py-3.5 text-base rounded-nb-lg',
  };

  return (
    <button
      className={`relative inline-flex items-center justify-center gap-2 border-[2px] border-nb-ink font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
import { type ButtonHTMLAttributes, type ReactNode, useRef } from 'react';
import { useMagnetic } from '@/components/ui/CursorEffect';

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'emerald' | 'cyan' | 'violet' | 'ghost' | 'danger';
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
  const magneticRef = useMagnetic(0.2);
  const btnRef = useRef<HTMLButtonElement>(null);

  const variants: Record<string, string> = {
    emerald: 'bg-gradient-to-r from-brass/15 to-brass/8 text-brass border-brass/20 hover:from-brass/25 hover:to-brass/12 hover:border-brass/35 hover:shadow-[0_0_20px_rgba(197,160,89,0.12)]',
    cyan: 'bg-gradient-to-r from-brass/15 to-brass/8 text-brass border-brass/20 hover:from-brass/25 hover:to-brass/12 hover:border-brass/35 hover:shadow-[0_0_20px_rgba(197,160,89,0.12)]',
    violet: 'bg-gradient-to-r from-sage/12 to-sage/6 text-sage border-sage/20 hover:from-sage/20 hover:to-sage/10 hover:border-sage/35 hover:shadow-[0_0_20px_rgba(124,154,107,0.12)]',
    ghost: 'bg-white/[0.03] text-muted-light border-white/8 hover:bg-white/[0.06] hover:border-white/15 hover:text-white',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30',
  };

  const sizes: Record<string, string> = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-sm',
  };

  return (
    <div ref={magneticRef} className={`inline-block ${fullWidth ? 'w-full' : ''}`}>
      <button
        ref={btnRef}
        className={`relative inline-flex items-center justify-center gap-2 rounded-xl border font-medium transition-all duration-400 disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        style={{ transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)' }}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    </div>
  );
}

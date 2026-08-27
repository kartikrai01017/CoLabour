import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
<<<<<<< HEAD
  variant?: 'emerald' | 'cyan' | 'violet' | 'ghost' | 'danger' | 'amber';
=======
  variant?: 'emerald' | 'cyan' | 'violet' | 'ghost' | 'danger';
>>>>>>> origin/main
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
<<<<<<< HEAD
    emerald: 'bg-emerald-400 text-black border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none font-black',
    cyan: 'bg-cyan-300 text-black border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none font-black',
    violet: 'bg-purple-300 text-black border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none font-black',
    amber: 'bg-amber-400 text-black border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none font-black',
    ghost: 'bg-white text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-gray-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none font-bold',
    danger: 'bg-red-400 text-black border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none font-black',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
=======
    emerald: 'bg-neon-emerald/10 text-neon-emeraldGlow border-neon-emerald/40 hover:bg-neon-emerald/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    cyan: 'bg-neon-cyan/10 text-neon-cyanGlow border-neon-cyan/40 hover:bg-neon-cyan/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    violet: 'bg-neon-violet/10 text-neon-violetGlow border-neon-violet/40 hover:bg-neon-violet/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]',
    ghost: 'bg-transparent text-gray-300 border-white/10 hover:bg-white/5 hover:border-white/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/40 hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]',
  };

  const sizes: Record<string, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
>>>>>>> origin/main
  };

  return (
    <button
<<<<<<< HEAD
      className={`relative inline-flex items-center justify-center gap-2 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
=======
      className={`relative inline-flex items-center justify-center gap-2 rounded-xl border font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
>>>>>>> origin/main
      {...props}
    >
      {children}
    </button>
  );
}
<<<<<<< HEAD

=======
>>>>>>> origin/main

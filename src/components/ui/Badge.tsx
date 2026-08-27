import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'emerald' | 'cyan' | 'violet' | 'amber' | 'red' | 'gray';
  className?: string;
}

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  const variants: Record<string, string> = {
<<<<<<< HEAD
    emerald: 'bg-emerald-200 text-emerald-900 border-2 border-black shadow-[2px_2px_0px_0px_#000] font-black',
    cyan: 'bg-cyan-200 text-cyan-900 border-2 border-black shadow-[2px_2px_0px_0px_#000] font-black',
    violet: 'bg-purple-200 text-purple-900 border-2 border-black shadow-[2px_2px_0px_0px_#000] font-black',
    amber: 'bg-amber-200 text-amber-900 border-2 border-black shadow-[2px_2px_0px_0px_#000] font-black',
    red: 'bg-red-200 text-red-900 border-2 border-black shadow-[2px_2px_0px_0px_#000] font-black',
    gray: 'bg-gray-100 text-gray-800 border-2 border-black shadow-[2px_2px_0px_0px_#000] font-bold',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs ${variants[variant]} ${className}`}>
=======
    emerald: 'bg-neon-emerald/10 text-neon-emeraldGlow border-neon-emerald/30',
    cyan: 'bg-neon-cyan/10 text-neon-cyanGlow border-neon-cyan/30',
    violet: 'bg-neon-violet/10 text-neon-violetGlow border-neon-violet/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    red: 'bg-red-500/10 text-red-400 border-red-500/30',
    gray: 'bg-white/5 text-gray-400 border-white/10',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${variants[variant]} ${className}`}>
>>>>>>> origin/main
      {children}
    </span>
  );
}
<<<<<<< HEAD

=======
>>>>>>> origin/main

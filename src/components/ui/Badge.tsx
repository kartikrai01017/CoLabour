import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'emerald' | 'cyan' | 'violet' | 'amber' | 'red' | 'gray';
  className?: string;
}

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  const variants: Record<string, string> = {
    emerald: 'bg-emerald-200 text-emerald-900 border-2 border-black shadow-[2px_2px_0px_0px_#000] font-black',
    cyan: 'bg-cyan-200 text-cyan-900 border-2 border-black shadow-[2px_2px_0px_0px_#000] font-black',
    violet: 'bg-purple-200 text-purple-900 border-2 border-black shadow-[2px_2px_0px_0px_#000] font-black',
    amber: 'bg-amber-200 text-amber-900 border-2 border-black shadow-[2px_2px_0px_0px_#000] font-black',
    red: 'bg-red-200 text-red-900 border-2 border-black shadow-[2px_2px_0px_0px_#000] font-black',
    gray: 'bg-gray-100 text-gray-800 border-2 border-black shadow-[2px_2px_0px_0px_#000] font-bold',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}


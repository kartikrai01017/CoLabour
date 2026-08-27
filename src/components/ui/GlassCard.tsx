import { type ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  id?: string;
}

export function GlassCard({ children, className = '', hover = false, onClick, id }: GlassCardProps) {
  const base = 'bg-white rounded-2xl border-2 border-black shadow-[5px_5px_0px_0px_#000] text-black transition-all';
  const hoverCls = hover ? 'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000] cursor-pointer' : '';
  return (
    <div id={id} className={`${base} ${hoverCls} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}


import { type ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', hover = false, onClick }: GlassCardProps) {
  const base = 'nb-card bg-nb-surface border-[3px] border-nb-ink rounded-nb-xl shadow-nb-lg';
  const hoverCls = hover ? 'nb-card-hover cursor-pointer hover:-translate-y-1 hover:shadow-nb-xl' : '';
  return (
    <div className={`${base} ${hoverCls} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
import { type ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', hover = false, onClick }: GlassCardProps) {
  const base = 'glass rounded-2xl';
  const hoverCls = hover ? 'glass-hover cursor-pointer' : '';
  return (
    <div className={`${base} ${hoverCls} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

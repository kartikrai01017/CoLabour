import { type ReactNode } from 'react';
import { useTilt } from '@/components/ui/CursorEffect';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', hover = false, onClick }: GlassCardProps) {
  const tiltRef = useTilt(hover ? 6 : 0);
  const base = 'glass rounded-2xl relative overflow-hidden';
  const hoverCls = hover ? 'glass-hover cursor-pointer' : '';

  return (
    <div
      ref={hover ? tiltRef : undefined}
      className={`${base} ${hoverCls} ${className}`}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

import type { LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { AnimatedCounter } from './Shared';

const COLOR_MAP: Record<string, string> = {
  emerald: 'text-nb-ink bg-nb-accent-green/20 border-nb-accent-green',
  cyan: 'text-nb-ink bg-nb-accent-blue/20 border-nb-accent-blue',
  violet: 'text-nb-ink bg-nb-accent-pink/20 border-nb-accent-pink',
  amber: 'text-nb-ink bg-nb-accent-yellow/20 border-nb-accent-yellow',
};

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
}

export function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <GlassCard className="p-5">
      <div className={`mb-3 inline-flex rounded-nb-md border-2 border-nb-ink p-2.5 ${COLOR_MAP[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-nb-ink">{typeof value === 'number' ? <AnimatedCounter value={value} /> : value}</p>
      <p className="text-xs font-medium text-nb-text-muted uppercase tracking-wider mt-1">{label}</p>
    </GlassCard>
  );
}
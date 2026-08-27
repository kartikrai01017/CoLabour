import type { LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { AnimatedCounter } from './Shared';

const COLOR_MAP: Record<string, string> = {
  emerald: 'text-neon-emerald bg-neon-emerald/10 border-neon-emerald/30',
  cyan: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30',
  violet: 'text-neon-violet bg-neon-violet/10 border-neon-violet/30',
  amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
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
      <div className={`mb-3 inline-flex rounded-xl border p-2.5 ${COLOR_MAP[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-white">{typeof value === 'number' ? <AnimatedCounter value={value} /> : value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </GlassCard>
  );
}

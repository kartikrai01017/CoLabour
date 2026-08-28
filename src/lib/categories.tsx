import {
  Zap, Plug, Wrench, PaintRoller, Sparkles, Car, Trees, HeartHandshake, MonitorSmartphone,
  type LucideIcon,
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Electrician: Zap,
  Plumber: Plug,
  Carpenter: Wrench,
  Painter: PaintRoller,
  Cleaner: Sparkles,
  Driver: Car,
  Gardener: Trees,
  Caregiver: HeartHandshake,
  Technician: MonitorSmartphone,
};

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
<<<<<<< HEAD
  Electrician: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-2 border-black', glow: 'shadow-[3px_3px_0px_0px_#000]' },
  Plumber: { bg: 'bg-blue-100', text: 'text-blue-900', border: 'border-2 border-black', glow: 'shadow-[3px_3px_0px_0px_#000]' },
  Carpenter: { bg: 'bg-orange-100', text: 'text-orange-900', border: 'border-2 border-black', glow: 'shadow-[3px_3px_0px_0px_#000]' },
  Painter: { bg: 'bg-pink-100', text: 'text-pink-900', border: 'border-2 border-black', glow: 'shadow-[3px_3px_0px_0px_#000]' },
  Cleaner: { bg: 'bg-cyan-100', text: 'text-cyan-900', border: 'border-2 border-black', glow: 'shadow-[3px_3px_0px_0px_#000]' },
  Driver: { bg: 'bg-red-100', text: 'text-red-900', border: 'border-2 border-black', glow: 'shadow-[3px_3px_0px_0px_#000]' },
  Gardener: { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-2 border-black', glow: 'shadow-[3px_3px_0px_0px_#000]' },
  Caregiver: { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-2 border-black', glow: 'shadow-[3px_3px_0px_0px_#000]' },
  Technician: { bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-2 border-black', glow: 'shadow-[3px_3px_0px_0px_#000]' },
};

export function getCategoryStyle(category: string) {
  return CATEGORY_COLORS[category] ?? { bg: 'bg-gray-100', text: 'text-black', border: 'border-2 border-black', glow: 'shadow-[3px_3px_0px_0px_#000]' };
=======
  Electrician: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]' },
  Plumber: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]' },
  Carpenter: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.2)]' },
  Painter: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30', glow: 'shadow-[0_0_20px_rgba(236,72,153,0.2)]' },
  Cleaner: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', glow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]' },
  Driver: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]' },
  Gardener: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', glow: 'shadow-[0_0_20px_rgba(34,197,94,0.2)]' },
  Caregiver: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.2)]' },
  Technician: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30', glow: 'shadow-[0_0_20px_rgba(139,92,246,0.2)]' },
};

export function getCategoryStyle(category: string) {
  return CATEGORY_COLORS[category] ?? { bg: 'bg-white/5', text: 'text-gray-400', border: 'border-white/10', glow: '' };
>>>>>>> origin/main
}

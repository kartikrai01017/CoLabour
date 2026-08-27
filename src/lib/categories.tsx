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
}

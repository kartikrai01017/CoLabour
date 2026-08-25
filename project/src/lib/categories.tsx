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

// Co-op palette: warm brass/sage tones — earthy, trustworthy, human
export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  Electrician: { bg: 'bg-brass/[0.07]', text: 'text-brass', border: 'border-brass/15', glow: '' },
  Plumber: { bg: 'bg-[#6b8db5]/[0.07]', text: 'text-[#6b8db5]', border: 'border-[#6b8db5]/15', glow: '' },
  Carpenter: { bg: 'bg-[#d4a574]/[0.07]', text: 'text-[#d4a574]', border: 'border-[#d4a574]/15', glow: '' },
  Painter: { bg: 'bg-[#c27a6e]/[0.07]', text: 'text-[#c27a6e]', border: 'border-[#c27a6e]/15', glow: '' },
  Cleaner: { bg: 'bg-sage/[0.07]', text: 'text-sage', border: 'border-sage/15', glow: '' },
  Driver: { bg: 'bg-[#b07070]/[0.07]', text: 'text-[#b07070]', border: 'border-[#b07070]/15', glow: '' },
  Gardener: { bg: 'bg-sage/[0.07]', text: 'text-sage-light', border: 'border-sage/15', glow: '' },
  Caregiver: { bg: 'bg-[#c4908a]/[0.07]', text: 'text-[#c4908a]', border: 'border-[#c4908a]/15', glow: '' },
  Technician: { bg: 'bg-[#6b7eb5]/[0.07]', text: 'text-[#6b7eb5]', border: 'border-[#6b7eb5]/15', glow: '' },
};

export function getCategoryStyle(category: string) {
  return CATEGORY_COLORS[category] ?? { bg: 'bg-white/[0.04]', text: 'text-muted', border: 'border-white/6', glow: '' };
}

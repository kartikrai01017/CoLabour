import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Navigation, ShieldCheck, CheckCircle2,
  Clock, ArrowRight, X, Radio
} from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { calculateReachTimeMinutes } from '@/lib/geo';

interface RadarScannerModalProps {
  isOpen: boolean;
  workerName: string;
  workerCategory: string;
  workerRate: number;
  workerLocation?: string;
  distanceKm: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const SCANNER_STEPS = [
  { text: 'Detecting your live GPS location...', progress: 25 },
  { text: 'Scanning nearby verified workers (within 5 km)...', progress: 55 },
  { text: 'Matching closest professional...', progress: 85 },
  { text: 'Worker found! Live signal locked & waiting for acceptance', progress: 100 },
];

export function RadarScannerModal({
  isOpen,
  workerName,
  workerCategory,
  workerRate,
  workerLocation,
  distanceKm,
  onConfirm,
  onCancel,
}: RadarScannerModalProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const reachTime = calculateReachTimeMinutes(distanceKm);
  const CategoryIcon = CATEGORY_ICONS[workerCategory] ?? Navigation;
  const style = getCategoryStyle(workerCategory);

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0);
      setIsLocked(false);
      return;
    }

    const t1 = setTimeout(() => setStepIndex(1), 1100);
    const t2 = setTimeout(() => setStepIndex(2), 2400);
    const t3 = setTimeout(() => {
      setStepIndex(3);
      setIsLocked(true);
    }, 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nb-ink/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg overflow-hidden rounded-nb-2xl border-[4px] border-nb-ink bg-nb-surface p-6 shadow-nb-xl"
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 z-20 rounded-nb-md border-[2px] border-nb-ink bg-nb-surface p-2 text-nb-text-muted hover:text-nb-ink transition-colors shadow-nb-sm"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 rounded-nb-sm border-[2px] border-nb-ink bg-nb-accent-green/20 px-3 py-1 text-xs font-black text-nb-ink uppercase tracking-wider mb-2">
            <Radio size={14} className="animate-pulse" /> Live GPS Radar Matching
          </div>
          <h3 className="text-xl font-extrabold text-nb-ink">CoLabour Proximity Dispatch</h3>
        </div>

        {/* Radar Screen Area */}
        <div className="relative mx-auto my-4 flex h-60 w-60 items-center justify-center rounded-full border-[3px] border-nb-ink bg-nb-surface-muted overflow-hidden shadow-nb-lg">
          {/* Grid lines */}
          <div className="absolute inset-0 border-b border-t border-nb-ink/20 top-1/2 -translate-y-1/2" />
          <div className="absolute inset-0 border-l border-r border-nb-ink/20 left-1/2 -translate-x-1/2" />

          {/* Sonar concentric rings */}
          <div className="absolute h-44 w-44 rounded-full border-[1.5px] border-nb-ink/20" />
          <div className="absolute h-28 w-28 rounded-full border-[1.5px] border-nb-ink/25" />
          <div className="absolute h-12 w-12 rounded-full border-[2px] border-nb-ink/30" />

          {/* Radar Sweep Line */}
          {!isLocked && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
              className="absolute inset-0 origin-center"
            >
              <div className="h-1/2 w-1/2 origin-bottom-right bg-gradient-to-tl from-nb-accent-green/30 to-transparent" />
            </motion.div>
          )}

          {/* Center Customer Pin */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-nb-accent-blue border-[2px] border-nb-ink shadow-nb-sm">
              <Navigation size={16} className="text-nb-ink" />
              <div className="absolute inset-0 animate-ping rounded-full bg-nb-accent-blue/40" />
            </div>
            <span className="mt-1 text-[10px] font-black text-nb-ink uppercase">You</span>
          </div>

          {/* Locked Worker Target */}
          <AnimatePresence>
            {isLocked && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="absolute top-10 right-10 z-20 flex flex-col items-center"
              >
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-nb-ink bg-nb-surface shadow-nb-md">
                  <CategoryIcon size={18} className="text-nb-ink" />
                  <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-nb-accent-green border border-nb-ink text-nb-ink">
                    <CheckCircle2 size={12} />
                  </div>
                </div>
                <span className="mt-1 rounded-nb-sm bg-nb-surface border-[1.5px] border-nb-ink px-1.5 py-0.5 text-[9px] font-black text-nb-ink">
                  {distanceKm.toFixed(1)} km
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live Distance & Reach Time Badge */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 rounded-nb-md border-[2px] border-nb-ink bg-nb-accent-green/20 px-3 py-1.5 text-xs font-bold text-nb-ink shadow-nb-sm">
            <Navigation size={13} /> {distanceKm.toFixed(1)} km away
          </div>
          <div className="flex items-center gap-1.5 rounded-nb-md border-[2px] border-nb-ink bg-nb-accent-blue/20 px-3 py-1.5 text-xs font-bold text-nb-ink shadow-nb-sm">
            <Clock size={13} /> ~{reachTime} mins reach time
          </div>
        </div>

        {/* Dynamic Status Progression Sequence */}
        <div className="mb-5 rounded-nb-lg border-[2px] border-nb-ink bg-nb-surface p-4 shadow-nb-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-nb-text-muted">STATUS SEQUENCE</span>
            <span className="text-xs font-mono font-black text-nb-accent-orange">{SCANNER_STEPS[stepIndex].progress}%</span>
          </div>
          {/* Progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-nb-sm bg-nb-surface-muted border border-nb-ink/20 mb-3">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${SCANNER_STEPS[stepIndex].progress}%` }}
              className="h-full bg-nb-accent-green border-r border-nb-ink"
            />
          </div>
          <p className="text-sm font-bold text-nb-ink flex items-center gap-2">
            {isLocked ? (
              <CheckCircle2 size={16} className="text-nb-accent-green flex-shrink-0" />
            ) : (
              <Radio size={16} className="text-nb-accent-orange animate-pulse flex-shrink-0" />
            )}
            <span>{SCANNER_STEPS[stepIndex].text}</span>
          </p>
        </div>

        {/* Worker summary mini card */}
        <div className="mb-5 flex items-center justify-between rounded-nb-lg border-[2px] border-nb-ink bg-nb-surface p-3 shadow-nb-md">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-nb-md border-[2px] border-nb-ink bg-nb-surface flex items-center justify-center shadow-nb-sm`}>
              <CategoryIcon className="text-nb-ink" size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-nb-ink">{workerName}</p>
              <p className="text-xs font-medium text-nb-text-muted">{workerCategory} • {workerLocation ?? 'Nearby'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-nb-accent-orange">₹{workerRate}/hr</p>
            <p className="text-[10px] font-bold text-nb-text-muted flex items-center gap-1 justify-end">
              <ShieldCheck size={10} className="text-nb-accent-green" /> 0% Platform Fee
            </p>
          </div>
        </div>

        {/* Action Button */}
        <NeonButton
          fullWidth
          size="lg"
          variant={isLocked ? 'amber' : 'cyan'}
          onClick={onConfirm}
          disabled={!isLocked}
        >
          {isLocked ? (
            <>Lock In & Proceed to Payment Gateway <ArrowRight size={18} /></>
          ) : (
            <>Acquiring Satellite Lock...</>
          )}
        </NeonButton>
      </motion.div>
    </div>
  );
}
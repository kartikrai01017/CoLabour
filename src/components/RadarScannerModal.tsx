import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Navigation, ShieldCheck, CheckCircle2,
  Clock, ArrowRight, X, Radio, Check
} from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm selection:bg-[#F59E0B] selection:text-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 sm:border-[2.5px] border-black bg-[#FAF7F2] p-5 sm:p-6 shadow-[8px_8px_0px_#000000]"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 z-20 rounded-xl border-2 border-black bg-white p-1.5 text-black hover:bg-neutral-100 shadow-[1px_1px_0px_#000000] cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 rounded-md border border-black bg-[#FEF3C7] px-2.5 py-0.5 text-[10px] font-black text-[#B45309] uppercase tracking-wider mb-2 shadow-[1px_1px_0px_#000000]">
            <Radio size={12} className="animate-pulse" /> Live GPS Radar Matching
          </div>
          <h3 className="text-lg sm:text-xl font-black uppercase text-neutral-900">CoLabour Proximity Dispatch</h3>
        </div>

        {/* Radar Screen Area */}
        <div className="relative mx-auto my-3 flex h-52 w-52 sm:h-56 sm:w-56 items-center justify-center rounded-full border-4 border-black bg-[#18181B] shadow-inner overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0 border-b border-t border-neutral-700 top-1/2 -translate-y-1/2" />
          <div className="absolute inset-0 border-l border-r border-neutral-700 left-1/2 -translate-x-1/2" />

          {/* Sonar concentric rings */}
          <div className="absolute h-40 w-40 rounded-full border border-neutral-700" />
          <div className="absolute h-24 w-24 rounded-full border border-[#F59E0B]/50" />
          <div className="absolute h-10 w-10 rounded-full border border-[#15803D]/60" />

          {/* Radar Sweep Line */}
          {!isLocked && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2.0, ease: 'linear' }}
              className="absolute inset-0 origin-center"
            >
              <div className="h-1/2 w-1/2 origin-bottom-right bg-gradient-to-tl from-[#F59E0B]/50 to-transparent" />
            </motion.div>
          )}

          {/* Center Customer Pin */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white shadow-[2px_2px_0px_#000000]">
              <Navigation size={15} className="text-black" />
            </div>
            <span className="mt-1 text-[9px] font-black uppercase tracking-wider text-white">YOU</span>
          </div>

          {/* Locked Worker Target */}
          <AnimatePresence>
            {isLocked && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="absolute top-8 right-8 z-20 flex flex-col items-center"
              >
                <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-black bg-[#F59E0B] shadow-[2px_2px_0px_#000000]">
                  <CategoryIcon size={18} className="text-black" />
                  <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-black bg-[#BBF7D0] text-[#15803D]">
                    <CheckCircle2 size={12} />
                  </div>
                </div>
                <span className="mt-1 rounded border border-black bg-white px-1.5 py-0.2 text-[8px] font-black text-black shadow-[1px_1px_0px_#000000]">
                  {distanceKm.toFixed(1)} km
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live Distance & Reach Time Badge */}
        <div className="mb-3 flex items-center justify-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-black bg-[#DCFCE7] px-2.5 py-1 text-[11px] font-black text-[#15803D] shadow-[1px_1px_0px_#000000]">
            <Navigation size={12} /> {distanceKm.toFixed(1)} km away
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-black bg-[#FEF3C7] px-2.5 py-1 text-[11px] font-black text-[#B45309] shadow-[1px_1px_0px_#000000]">
            <Clock size={12} /> ~{reachTime} mins reach
          </div>
        </div>

        {/* Dynamic Status Progression Sequence */}
        <div className="mb-4 rounded-2xl border-2 border-black bg-white p-3.5 shadow-[3px_3px_0px_#000000]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase text-neutral-500">DISPATCH SEQUENCE</span>
            <span className="text-xs font-mono font-black text-neutral-900">{SCANNER_STEPS[stepIndex].progress}%</span>
          </div>
          {/* Progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-full border border-black bg-neutral-100 mb-2">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${SCANNER_STEPS[stepIndex].progress}%` }}
              className="h-full bg-[#F59E0B]"
            />
          </div>
          <p className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
            {isLocked ? (
              <CheckCircle2 size={15} className="text-[#15803D] flex-shrink-0" />
            ) : (
              <Radio size={15} className="text-[#B45309] animate-pulse flex-shrink-0" />
            )}
            <span>{SCANNER_STEPS[stepIndex].text}</span>
          </p>
        </div>

        {/* Worker summary mini card */}
        <div className="mb-4 flex items-center justify-between rounded-2xl border-2 border-black bg-white p-3 shadow-[2px_2px_0px_#000000]">
          <div className="flex items-center gap-2.5">
            <div className={`h-9 w-9 rounded-xl border border-black ${style.bg} flex items-center justify-center flex-shrink-0`}>
              <CategoryIcon className={style.text} size={18} />
            </div>
            <div>
              <p className="font-black text-xs text-neutral-900">{workerName}</p>
              <p className="text-[10px] font-bold text-neutral-500">{workerCategory} • {workerLocation ?? 'Nearby'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono font-black text-neutral-900">₹{workerRate}/hr</p>
            <p className="text-[9px] font-black text-[#15803D]">
              0% Platform Fee
            </p>
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onConfirm}
          disabled={!isLocked}
          className="w-full rounded-2xl border-2 border-black bg-[#F59E0B] hover:bg-[#E68A00] py-3 text-xs sm:text-sm font-black uppercase text-black shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isLocked ? (
            <>
              <span>Lock In & Proceed to Payment</span>
              <ArrowRight size={16} className="stroke-[3]" />
            </>
          ) : (
            <>
              <Radio size={14} className="animate-pulse" />
              <span>Acquiring Satellite Lock...</span>
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}


import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Navigation, ShieldCheck, CheckCircle2,
  Clock, ArrowRight, X, Radio
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#000]"
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 z-20 h-8 w-8 rounded-lg border-2 border-black bg-gray-100 flex items-center justify-center text-black hover:bg-red-200 transition-colors shadow-[2px_2px_0px_0px_#000]"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-emerald-300 px-3.5 py-1 text-xs font-black text-black uppercase tracking-wider mb-2 shadow-[2px_2px_0px_0px_#000]">
            <Radio size={14} className="animate-pulse" /> Live GPS Radar Matching
          </div>
          <h3 className="text-2xl font-black text-black">CoLabour Proximity Dispatch</h3>
        </div>

        {/* Radar Screen Area */}
        <div className="relative mx-auto my-4 flex h-60 w-60 items-center justify-center rounded-full border-4 border-black bg-emerald-950 shadow-[inset_0_0_40px_rgba(16,185,129,0.3)] overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0 border-b border-t border-emerald-500/30 top-1/2 -translate-y-1/2" />
          <div className="absolute inset-0 border-l border-r border-emerald-500/30 left-1/2 -translate-x-1/2" />

          {/* Sonar concentric rings */}
          <div className="absolute h-44 w-44 rounded-full border border-emerald-500/40" />
          <div className="absolute h-28 w-28 rounded-full border border-emerald-500/50" />
          <div className="absolute h-12 w-12 rounded-full border border-emerald-500/60" />

          {/* Radar Sweep Line */}
          {!isLocked && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
              className="absolute inset-0 origin-center"
            >
              <div className="h-1/2 w-1/2 origin-bottom-right bg-gradient-to-tl from-emerald-400/50 to-transparent" />
            </motion.div>
          )}

          {/* Center Customer Pin */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-cyan-300 border-2 border-black shadow-[0_0_10px_rgba(6,182,212,0.8)]">
              <Navigation size={16} className="text-black" />
              <div className="absolute inset-0 animate-ping rounded-full bg-cyan-400/40" />
            </div>
            <span className="mt-1 text-[10px] font-black text-cyan-200 uppercase bg-black/60 px-1 rounded">You</span>
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
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.9)]">
                  <CategoryIcon size={18} className="text-black" />
                  <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 border border-black text-black">
                    <CheckCircle2 size={12} />
                  </div>
                </div>
                <span className="mt-1 rounded bg-black px-1.5 py-0.5 text-[9px] font-black text-emerald-300 border border-emerald-400">
                  {distanceKm.toFixed(1)} km
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live Distance & Reach Time Badge */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-emerald-200 px-3 py-1.5 text-xs font-black text-black shadow-[2px_2px_0px_0px_#000]">
            <Navigation size={13} /> {distanceKm.toFixed(1)} km away
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-cyan-200 px-3 py-1.5 text-xs font-black text-black shadow-[2px_2px_0px_0px_#000]">
            <Clock size={13} /> ~{reachTime} mins reach time
          </div>
        </div>

        {/* Dynamic Status Progression Sequence */}
        <div className="mb-5 rounded-xl border-2 border-black bg-amber-50 p-4 shadow-[3px_3px_0px_0px_#000]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-gray-700">STATUS SEQUENCE</span>
            <span className="text-xs font-black font-mono text-black">{SCANNER_STEPS[stepIndex].progress}%</span>
          </div>
          {/* Progress bar */}
          <div className="h-2.5 w-full overflow-hidden rounded-full border-2 border-black bg-white mb-3">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${SCANNER_STEPS[stepIndex].progress}%` }}
              className="h-full bg-emerald-400"
            />
          </div>
          <p className="text-xs sm:text-sm font-black text-black flex items-center gap-2">
            {isLocked ? (
              <CheckCircle2 size={16} className="text-emerald-800 flex-shrink-0" />
            ) : (
              <Radio size={16} className="text-orange-800 animate-pulse flex-shrink-0" />
            )}
            <span>{SCANNER_STEPS[stepIndex].text}</span>
          </p>
        </div>

        {/* Worker summary mini card */}
        <div className="mb-5 flex items-center justify-between rounded-xl border-2 border-black bg-white p-3.5 shadow-[3px_3px_0px_0px_#000]">
          <div className="flex items-center gap-3">
            <div className={`h-11 w-11 rounded-xl border-2 border-black ${style.bg} flex items-center justify-center shadow-[1px_1px_0px_0px_#000]`}>
              <CategoryIcon className="text-black" size={22} />
            </div>
            <div>
              <p className="font-black text-sm text-black">{workerName}</p>
              <p className="text-xs font-bold text-gray-600">{workerCategory} • {workerLocation ?? 'Nearby'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-base font-black text-black">₹{workerRate}/hr</p>
            <p className="text-[10px] font-black text-emerald-800 flex items-center gap-1 justify-end">
              <ShieldCheck size={12} /> 0% Platform Fee
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onConfirm}
          disabled={!isLocked}
          className={`w-full py-3.5 px-4 rounded-xl border-2 border-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
            isLocked
              ? 'bg-emerald-400 text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-400'
          }`}
        >
          {isLocked ? (
            <>Lock In & Proceed to Payment Gateway <ArrowRight size={18} /></>
          ) : (
            <>Acquiring Satellite Lock...</>
          )}
        </button>
      </motion.div>
    </div>
  );
}

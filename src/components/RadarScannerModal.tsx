import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Navigation, ShieldCheck, CheckCircle2,
  Clock, ArrowRight, X, Radio
} from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { calculateReachTimeMinutes } from '@/lib/geo';
import { useLanguage } from '@/context/LanguageContext';

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
  const { t, categoryName } = useLanguage();
  const [stepIndex, setStepIndex] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const scannerSteps = [
    { text: t('radar.detecting'), progress: 25 },
    { text: t('radar.scanning'), progress: 55 },
    { text: t('radar.matching'), progress: 85 },
    { text: t('radar.found'), progress: 100 },
  ];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-neon-emerald/30 bg-gradient-to-b from-base-900 via-base-950 to-base-900 p-6 shadow-[0_0_50px_rgba(16,185,129,0.25)]"
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 z-20 rounded-full border border-white/10 bg-white/5 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-neon-emerald/30 bg-neon-emerald/10 px-3 py-1 text-xs font-bold text-neon-emerald uppercase tracking-wider mb-2">
             <Radio size={14} className="animate-pulse" /> {t('radar.title')}
          </div>
          <h3 className="text-xl font-bold text-white">{t('radar.subtitle')}</h3>
        </div>

        {/* Radar Screen Area */}
        <div className="relative mx-auto my-4 flex h-60 w-60 items-center justify-center rounded-full border-2 border-neon-emerald/40 bg-base-950 shadow-[inset_0_0_40px_rgba(16,185,129,0.2)] overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0 border-b border-t border-neon-emerald/20 top-1/2 -translate-y-1/2" />
          <div className="absolute inset-0 border-l border-r border-neon-emerald/20 left-1/2 -translate-x-1/2" />

          {/* Sonar concentric rings */}
          <div className="absolute h-44 w-44 rounded-full border border-neon-emerald/30" />
          <div className="absolute h-28 w-28 rounded-full border border-neon-emerald/40" />
          <div className="absolute h-12 w-12 rounded-full border border-neon-emerald/50" />

          {/* Radar Sweep Line */}
          {!isLocked && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
              className="absolute inset-0 origin-center"
            >
              <div className="h-1/2 w-1/2 origin-bottom-right bg-gradient-to-tl from-neon-emerald/40 to-transparent" />
            </motion.div>
          )}

          {/* Center Customer Pin */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-neon-cyan shadow-[0_0_15px_rgba(6,182,212,0.8)]">
              <Navigation size={16} className="text-base-950" />
              <div className="absolute inset-0 animate-ping rounded-full bg-neon-cyan/40" />
            </div>
             <span className="mt-1 text-[10px] font-bold text-neon-cyan uppercase">{t('radar.you')}</span>
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
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-neon-emerald bg-base-900 shadow-[0_0_20px_rgba(16,185,129,0.9)]">
                  <CategoryIcon size={18} className="text-neon-emerald" />
                  <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neon-emerald text-base-950">
                    <CheckCircle2 size={12} />
                  </div>
                </div>
                <span className="mt-1 rounded bg-base-900/90 px-1.5 py-0.5 text-[9px] font-bold text-neon-emerald border border-neon-emerald/40">
                   {t('radar.kmAway', { distance: distanceKm.toFixed(1) })}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live Distance & Reach Time Badge */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-neon-emerald/30 bg-neon-emerald/10 px-3 py-1.5 text-xs font-semibold text-neon-emerald">
             <Navigation size={13} /> {t('radar.kmAway', { distance: distanceKm.toFixed(1) })}
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1.5 text-xs font-semibold text-neon-cyan">
             <Clock size={13} /> {t('radar.minsReach', { minutes: reachTime })}
          </div>
        </div>

        {/* Dynamic Status Progression Sequence */}
        <div className="mb-5 rounded-2xl border border-white/10 bg-base-950/60 p-4">
          <div className="flex items-center justify-between mb-2">
             <span className="text-xs font-mono text-gray-400">{t('radar.statusSequence')}</span>
             <span className="text-xs font-mono font-bold text-neon-emerald">{scannerSteps[stepIndex].progress}%</span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10 mb-3">
            <motion.div
              initial={{ width: '0%' }}
               animate={{ width: `${scannerSteps[stepIndex].progress}%` }}
              className="h-full bg-gradient-to-r from-neon-emerald to-neon-cyan"
            />
          </div>
          <p className="text-sm font-medium text-white flex items-center gap-2">
            {isLocked ? (
              <CheckCircle2 size={16} className="text-neon-emerald flex-shrink-0" />
            ) : (
              <Radio size={16} className="text-neon-cyan animate-pulse flex-shrink-0" />
            )}
             <span>{scannerSteps[stepIndex].text}</span>
          </p>
        </div>

        {/* Worker summary mini card */}
        <div className="mb-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl border ${style.bg} ${style.border} flex items-center justify-center`}>
              <CategoryIcon className={style.text} size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm text-white">{workerName}</p>
               <p className="text-xs text-gray-400">{categoryName(workerCategory)} • {workerLocation ?? t('radar.nearby')}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-neon-emerald">₹{workerRate}/hr</p>
            <p className="text-[10px] text-gray-400 flex items-center gap-1 justify-end">
               <ShieldCheck size={10} className="text-neon-emerald" /> {t('radar.platformFee')}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <NeonButton
          fullWidth
          size="lg"
          variant={isLocked ? 'emerald' : 'cyan'}
          onClick={onConfirm}
          disabled={!isLocked}
        >
          {isLocked ? (
             <>{t('radar.lockProceed')} <ArrowRight size={18} /></>
          ) : (
             <>{t('radar.acquiring')}</>
          )}
        </NeonButton>
      </motion.div>
    </div>
  );
}

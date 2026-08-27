import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Printer, Download, Sparkles, ShieldCheck, QrCode, ArrowRight } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useLanguage } from '@/context/LanguageContext';

interface CoLabourPrinterEngineProps {
  bookingId: string;
  workerName: string;
  workerSkill: string;
  workerUpiId?: string;
  customerName?: string;
  date: string;
  utrNumber?: string | null;
  totalAmount: number;
  onDone?: () => void;
}

export function CoLabourPrinterEngine({
  bookingId,
  workerName,
  workerSkill,
  workerUpiId,
  customerName,
  date,
  utrNumber,
  totalAmount,
  onDone,
}: CoLabourPrinterEngineProps) {
  const { t, categoryName, locale } = useLanguage();
  const [isPrinted, setIsPrinted] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const displayCustomerName = customerName ?? t('common.verifiedCustomer');
  const displayWorkerSkill = categoryName(workerSkill);

  const handleDispense = () => {
    if (isPrinting || isPrinted) return;
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      setIsPrinted(true);
    }, 1200);
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="w-full flex flex-col items-center justify-center my-6">
      {/* 3D Hardware POS Terminal Chassis */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#141b2d] to-[#0b101c] rounded-3xl border border-neon-cyan/30 shadow-[0_20px_50px_rgba(6,182,212,0.15)] p-6 overflow-hidden">
        {/* Glow accent highlights */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-neon-cyan/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Indicator LEDs */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neon-emerald animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan" />
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
            </div>
            <span className="text-xs font-mono font-bold tracking-widest text-gray-300 uppercase">
              {t('printer.terminal')}
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-neon-emerald/10 text-neon-emerald px-2 py-0.5 rounded border border-neon-emerald/30">
            {t('printer.online')}
          </span>
        </div>

        {/* Paper Dispense Feed Slot */}
        <div className="relative mt-4 mb-2 bg-[#080c14] h-5 rounded-lg border-x-2 border-y border-white/20 shadow-inner flex items-center justify-center">
          <div className="w-48 h-1 bg-neon-cyan/40 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
        </div>

        {/* Dispense Trigger Section */}
        {!isPrinted && !isPrinting && (
          <div className="py-6 flex flex-col items-center text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center mb-3 text-pink-400 shadow-[0_0_25px_rgba(236,72,153,0.25)]">
              <Printer size={32} className="animate-bounce" />
            </div>
             <h3 className="text-lg font-bold text-white mb-1">{t('printer.ready')}</h3>
             <p className="text-xs text-gray-400 max-w-xs mb-5">
               {t('printer.readyDescription')}
            </p>

            {/* Interactive Pink Dispense Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDispense}
              className="relative group px-8 py-3.5 rounded-2xl font-bold text-white text-sm bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 shadow-[0_0_30px_rgba(244,63,94,0.45)] border border-pink-400/40 hover:shadow-[0_0_40px_rgba(244,63,94,0.7)] transition-all flex items-center gap-2"
            >
              <Sparkles size={18} className="animate-spin text-pink-200" />
               {t('printer.dispense')}
            </motion.button>
          </div>
        )}

        {/* Printing in progress state */}
        {isPrinting && (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-12 h-12 rounded-full border-3 border-pink-500 border-t-transparent mb-3"
            />
            <p className="text-sm font-mono text-pink-400 animate-pulse font-semibold">
               {t('printer.printing')}
            </p>
             <p className="text-[11px] font-mono text-gray-500 mt-1">{t('printer.ejecting')}</p>
          </div>
        )}

        {/* Ejected Thermal POS Receipt Paper with Paper-Tear Edge */}
        <AnimatePresence>
          {isPrinted && (
            <motion.div
              initial={{ y: -80, opacity: 0, scaleY: 0.2 }}
              animate={{ y: 0, opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.8, type: 'spring', bounce: 0.25 }}
              className="relative mt-2 origin-top"
            >
              {/* Paper body styling */}
              <div
                id="colabour-receipt-print"
                className="bg-[#fafafa] text-neutral-900 font-mono p-5 rounded-sm shadow-2xl relative border-t-4 border-dashed border-gray-400 select-text"
                style={{
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% 98%, 97% 100%, 94% 98%, 91% 100%, 88% 98%, 85% 100%, 82% 98%, 79% 100%, 76% 98%, 73% 100%, 70% 98%, 67% 100%, 64% 98%, 61% 100%, 58% 98%, 55% 100%, 52% 98%, 49% 100%, 46% 98%, 43% 100%, 40% 98%, 37% 100%, 34% 98%, 31% 100%, 28% 98%, 25% 100%, 22% 98%, 19% 100%, 16% 98%, 13% 100%, 10% 98%, 7% 100%, 4% 98%, 0% 100%)',
                  paddingBottom: '2.5rem',
                }}
              >
                {/* Header of the slip */}
                <div className="text-center pb-3 border-b-2 border-dashed border-neutral-300">
                  <div className="flex items-center justify-center gap-1 font-black text-xl tracking-tight text-neutral-900">
                    <span>⚡ COLABOUR</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-sans">
                     {t('printer.platform')}
                  </p>
                   <p className="text-[9px] text-neutral-400 mt-0.5">{t('printer.taxInvoice')}</p>
                </div>

                {/* Slip Details Grid */}
                <div className="py-3 text-xs space-y-1.5 border-b border-dashed border-neutral-300">
                  <div className="flex justify-between">
                     <span className="text-neutral-500">{t('printer.bookingId')}</span>
                    <span className="font-bold text-neutral-800 font-mono">#{bookingId.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-neutral-500">{t('printer.dateTime')}</span>
                     <span className="text-neutral-800">{new Date(date).toLocaleString(locale)}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-neutral-500">{t('printer.customer')}</span>
                     <span className="text-neutral-800 font-medium">{displayCustomerName}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-neutral-500">{t('printer.worker')}</span>
                    <span className="text-neutral-800 font-bold">{workerName}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-neutral-500">{t('printer.category')}</span>
                     <span className="text-neutral-800">{displayWorkerSkill}</span>
                  </div>
                  {workerUpiId && (
                    <div className="flex justify-between">
                       <span className="text-neutral-500">{t('printer.workerUpi')}</span>
                      <span className="text-neutral-800 font-mono">{workerUpiId}</span>
                    </div>
                  )}
                  {utrNumber && (
                    <div className="flex justify-between">
                       <span className="text-neutral-500">{t('printer.bankUtr')}</span>
                      <span className="font-bold text-neutral-900 font-mono">{utrNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                     <span className="text-neutral-500">{t('printer.paymentStatus')}</span>
                     <span className="font-bold text-emerald-700 uppercase">{t('printer.confirmedPaid')}</span>
                  </div>
                </div>

                {/* Amount Calculation */}
                <div className="py-3 border-b-2 border-dashed border-neutral-300">
                  <div className="flex justify-between text-xs text-neutral-600 mb-1">
                     <span>{t('printer.laborCharge')}</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-600 mb-1">
                     <span>{t('printer.commission')}</span>
                     <span>{t('printer.zeroFee')}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-neutral-900 pt-1 border-t border-dotted border-neutral-300">
                     <span>{t('printer.totalPaid')}</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Verification QR and Security Stamp */}
                <div className="pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-neutral-100 border border-neutral-300 rounded p-1 flex items-center justify-center">
                      <QrCode size={36} className="text-neutral-800" />
                    </div>
                    <div className="text-[9px] text-neutral-500 leading-tight">
                       <p className="font-bold text-neutral-700">{t('printer.verifiedSlip')}</p>
                       <p>{t('printer.verifyAuthenticity')}</p>
                      <p className="text-[8px] text-neutral-400 mt-0.5 font-mono">AUTH-{bookingId.slice(0, 6)}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-300">
                       <ShieldCheck size={12} /> {t('printer.secured')}
                    </div>
                  </div>
                </div>

                {/* Footer message */}
                <p className="text-center text-[9px] text-neutral-400 mt-4 tracking-wider uppercase">
                   {t('printer.thankYou')}
                </p>
              </div>

              {/* Actions below paper */}
              <div className="mt-5 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleBrowserPrint}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                   <Download size={14} /> {t('printer.printPdf')}
                </button>
                {onDone && (
                  <NeonButton size="sm" variant="emerald" onClick={onDone} className="flex-1">
                     {t('printer.backDashboard')} <ArrowRight size={14} />
                  </NeonButton>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

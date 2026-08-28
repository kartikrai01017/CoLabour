import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Printer, Download, Sparkles, ShieldCheck, QrCode, ArrowRight } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';

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
  customerName = 'Verified Customer',
  date,
  utrNumber,
  totalAmount,
  onDone,
}: CoLabourPrinterEngineProps) {
  const [isPrinted, setIsPrinted] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

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
      {/* POS Terminal Chassis */}
      <div className="relative w-full max-w-md bg-nb-surface rounded-nb-2xl border-[4px] border-nb-ink shadow-nb-xl p-6 overflow-hidden">
        {/* Top Header & Indicator LEDs */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-nb-ink/20">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-nb-accent-green animate-pulse border border-nb-ink" />
              <span className="w-2.5 h-2.5 rounded-full bg-nb-accent-blue border border-nb-ink" />
              <span className="w-2.5 h-2.5 rounded-full bg-nb-accent-pink border border-nb-ink" />
            </div>
            <span className="text-xs font-mono font-bold tracking-widest text-nb-ink uppercase">
              COLABOUR-POS // 4.2K
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase bg-nb-accent-green/20 text-nb-ink px-2 py-0.5 rounded-nb-sm border-[1.5px] border-nb-ink">
            ONLINE
          </span>
        </div>

        {/* Paper Dispense Feed Slot */}
        <div className="relative mt-4 mb-2 bg-nb-surface-muted h-5 rounded-nb-md border-[2px] border-nb-ink/30 shadow-inner flex items-center justify-center">
          <div className="w-48 h-1 bg-nb-accent-green/40 rounded-full" />
        </div>

        {/* Dispense Trigger Section */}
        {!isPrinted && !isPrinting && (
          <div className="py-6 flex flex-col items-center text-center animate-fade-in">
            <div className="w-16 h-16 rounded-nb-lg bg-nb-accent-pink/20 border-[2px] border-nb-ink flex items-center justify-center mb-3 text-nb-ink shadow-nb-md">
              <Printer size={32} className="animate-bounce" />
            </div>
            <h3 className="text-lg font-extrabold text-nb-ink mb-1">CoLabour Thermal POS Ready</h3>
            <p className="text-xs font-medium text-nb-text-muted max-w-xs mb-5">
              Payment confirmed by worker. Push the button to dispense your tamper-proof digital work slip.
            </p>

            {/* Interactive Dispense Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDispense}
              className="relative group px-8 py-3.5 rounded-nb-md font-extrabold text-nb-ink text-sm bg-nb-accent-pink border-[3px] border-nb-ink shadow-nb-md hover:shadow-nb-lg transition-all flex items-center gap-2"
            >
              <Sparkles size={18} className="animate-spin" />
              ⚡ TAP TO DISPENSE SLIP
            </motion.button>
          </div>
        )}

        {/* Printing in progress state */}
        {isPrinting && (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-12 h-12 rounded-full border-[3px] border-nb-ink border-t-nb-accent-pink mb-3"
            />
            <p className="text-sm font-mono font-bold text-nb-ink animate-pulse">
              PRINTING THERMAL SLIP...
            </p>
            <p className="text-[11px] font-mono text-nb-text-muted mt-1">Ejecting encrypted thermal receipt...</p>
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
                    On-Demand Skilled Services Platform
                  </p>
                  <p className="text-[9px] text-neutral-400 mt-0.5">TAX INVOICE / SERVICE RECEIPT</p>
                </div>

                {/* Slip Details Grid */}
                <div className="py-3 text-xs space-y-1.5 border-b border-dashed border-neutral-300">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">BOOKING ID:</span>
                    <span className="font-bold text-neutral-800 font-mono">#{bookingId.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">DATE & TIME:</span>
                    <span className="text-neutral-800">{new Date(date).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">CUSTOMER:</span>
                    <span className="text-neutral-800 font-medium">{customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">WORKER:</span>
                    <span className="text-neutral-800 font-bold">{workerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">CATEGORY:</span>
                    <span className="text-neutral-800">{workerSkill}</span>
                  </div>
                  {workerUpiId && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">WORKER UPI:</span>
                      <span className="text-neutral-800 font-mono">{workerUpiId}</span>
                    </div>
                  )}
                  {utrNumber && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">BANK UTR:</span>
                      <span className="font-bold text-neutral-900 font-mono">{utrNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-neutral-500">PAYMENT STATUS:</span>
                    <span className="font-bold text-emerald-700 uppercase">CONFIRMED (PAID)</span>
                  </div>
                </div>

                {/* Amount Calculation */}
                <div className="py-3 border-b-2 border-dashed border-neutral-300">
                  <div className="flex justify-between text-xs text-neutral-600 mb-1">
                    <span>Labor Service Charge:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-600 mb-1">
                    <span>Platform Commission:</span>
                    <span>₹0.00 (Zero Fee)</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-neutral-900 pt-1 border-t border-dotted border-neutral-300">
                    <span>TOTAL PAID:</span>
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
                      <p className="font-bold text-neutral-700">VERIFIED SLIP</p>
                      <p>Scan to verify authenticity</p>
                      <p className="text-[8px] text-neutral-400 mt-0.5 font-mono">AUTH-{bookingId.slice(0, 6)}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-300">
                      <ShieldCheck size={12} /> SECURED
                    </div>
                  </div>
                </div>

                {/* Footer message */}
                <p className="text-center text-[9px] text-neutral-400 mt-4 tracking-wider uppercase">
                  *** THANK YOU FOR CHOOSING COLABOUR ***
                </p>
              </div>

              {/* Actions below paper */}
              <div className="mt-5 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleBrowserPrint}
                  className="flex-1 py-2.5 px-4 rounded-nb-md border-[2px] border-nb-ink bg-nb-surface hover:bg-nb-surface-muted text-nb-ink text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-nb-sm hover:shadow-nb-md"
                >
                  <Download size={14} /> Print / Save PDF
                </button>
                {onDone && (
                  <NeonButton size="sm" variant="amber" onClick={onDone} className="flex-1">
                    Back to Dashboard <ArrowRight size={14} />
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
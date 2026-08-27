import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Printer, Download, Sparkles, ShieldCheck, QrCode, ArrowRight } from 'lucide-react';
<<<<<<< HEAD
=======
import { NeonButton } from '@/components/ui/NeonButton';
>>>>>>> origin/main

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
      {/* 3D Hardware POS Terminal Chassis */}
<<<<<<< HEAD
      <div className="relative w-full max-w-md bg-[#1e293b] rounded-2xl border-2 border-black shadow-[6px_6px_0px_0px_#000] p-6 overflow-hidden">
        {/* Top Header & Indicator LEDs */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-black/40">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 border border-black animate-pulse" />
              <span className="w-3 h-3 rounded-full bg-cyan-400 border border-black" />
              <span className="w-3 h-3 rounded-full bg-pink-400 border border-black" />
            </div>
            <span className="text-xs font-mono font-black tracking-widest text-white uppercase">
              COLABOUR-POS // 4.2K
            </span>
          </div>
          <span className="text-[10px] font-mono font-black uppercase bg-emerald-400 text-black px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000]">
=======
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
              COLABOUR-POS // 4.2K
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-neon-emerald/10 text-neon-emerald px-2 py-0.5 rounded border border-neon-emerald/30">
>>>>>>> origin/main
            ONLINE
          </span>
        </div>

        {/* Paper Dispense Feed Slot */}
<<<<<<< HEAD
        <div className="relative mt-4 mb-2 bg-[#0b0f19] h-5 rounded-lg border-2 border-black shadow-inner flex items-center justify-center">
          <div className="w-48 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
=======
        <div className="relative mt-4 mb-2 bg-[#080c14] h-5 rounded-lg border-x-2 border-y border-white/20 shadow-inner flex items-center justify-center">
          <div className="w-48 h-1 bg-neon-cyan/40 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
>>>>>>> origin/main
        </div>

        {/* Dispense Trigger Section */}
        {!isPrinted && !isPrinting && (
          <div className="py-6 flex flex-col items-center text-center animate-fade-in">
<<<<<<< HEAD
            <div className="w-16 h-16 rounded-2xl bg-amber-300 border-2 border-black flex items-center justify-center mb-3 text-black shadow-[3px_3px_0px_0px_#000]">
              <Printer size={32} className="animate-bounce" />
            </div>
            <h3 className="text-lg font-black text-white mb-1">CoLabour Thermal POS Ready</h3>
            <p className="text-xs text-gray-300 max-w-xs mb-5 font-medium">
              Payment confirmed by worker. Push the button to dispense your tamper-proof digital work slip.
            </p>

            {/* Interactive Dispense Button */}
            <button
              onClick={handleDispense}
              className="px-8 py-3.5 rounded-xl font-black text-black text-sm bg-pink-400 border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <Sparkles size={18} className="animate-spin text-black" />
              ⚡ TAP TO DISPENSE SLIP
            </button>
=======
            <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center mb-3 text-pink-400 shadow-[0_0_25px_rgba(236,72,153,0.25)]">
              <Printer size={32} className="animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">CoLabour Thermal POS Ready</h3>
            <p className="text-xs text-gray-400 max-w-xs mb-5">
              Payment confirmed by worker. Push the button to dispense your tamper-proof digital work slip.
            </p>

            {/* Interactive Pink Dispense Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDispense}
              className="relative group px-8 py-3.5 rounded-2xl font-bold text-white text-sm bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 shadow-[0_0_30px_rgba(244,63,94,0.45)] border border-pink-400/40 hover:shadow-[0_0_40px_rgba(244,63,94,0.7)] transition-all flex items-center gap-2"
            >
              <Sparkles size={18} className="animate-spin text-pink-200" />
              ⚡ TAP TO DISPENSE SLIP
            </motion.button>
>>>>>>> origin/main
          </div>
        )}

        {/* Printing in progress state */}
        {isPrinting && (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
<<<<<<< HEAD
              className="w-12 h-12 rounded-full border-4 border-pink-400 border-t-transparent mb-3"
            />
            <p className="text-sm font-mono text-pink-400 animate-pulse font-black">
              PRINTING THERMAL SLIP...
            </p>
            <p className="text-[11px] font-mono text-gray-300 mt-1">Ejecting encrypted thermal receipt...</p>
=======
              className="w-12 h-12 rounded-full border-3 border-pink-500 border-t-transparent mb-3"
            />
            <p className="text-sm font-mono text-pink-400 animate-pulse font-semibold">
              PRINTING THERMAL SLIP...
            </p>
            <p className="text-[11px] font-mono text-gray-500 mt-1">Ejecting encrypted thermal receipt...</p>
>>>>>>> origin/main
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
<<<<<<< HEAD
                  className="flex-1 py-2.5 px-4 rounded-xl border-2 border-black bg-white hover:bg-gray-100 text-black text-xs font-black flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-all"
=======
                  className="flex-1 py-2.5 px-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
>>>>>>> origin/main
                >
                  <Download size={14} /> Print / Save PDF
                </button>
                {onDone && (
<<<<<<< HEAD
                  <button
                    onClick={onDone}
                    className="flex-1 py-2.5 px-4 rounded-xl border-2 border-black bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-black flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-all"
                  >
                    Back to Dashboard <ArrowRight size={14} />
                  </button>
=======
                  <NeonButton size="sm" variant="emerald" onClick={onDone} className="flex-1">
                    Back to Dashboard <ArrowRight size={14} />
                  </NeonButton>
>>>>>>> origin/main
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Printer, Download, Sparkles, ShieldCheck, QrCode, ArrowRight, Zap, Check } from 'lucide-react';

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
    }, 1100);
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="w-full flex flex-col items-center justify-center my-4 font-sans selection:bg-[#F59E0B] selection:text-black">
      {/* 3D Hardware POS Terminal Chassis */}
      <div className="relative w-full max-w-md bg-white rounded-3xl border-2 sm:border-[2.5px] border-black shadow-[8px_8px_0px_#000000] p-5 sm:p-6 overflow-hidden">
        
        {/* Top Header & Indicator LEDs */}
        <div className="flex items-center justify-between pb-3.5 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-black bg-[#15803D] animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-full border border-black bg-[#F59E0B]" />
              <span className="w-2.5 h-2.5 rounded-full border border-black bg-neutral-300" />
            </div>
            <span className="text-xs font-mono font-black tracking-widest text-neutral-900 uppercase">
              COLABOUR-POS // 4.2K
            </span>
          </div>
          <span className="text-[10px] font-mono font-black uppercase bg-[#BBF7D0] text-[#15803D] px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000000]">
            ONLINE ✔
          </span>
        </div>

        {/* Paper Dispense Feed Slot */}
        <div className="relative mt-4 mb-2 bg-[#18181B] h-5 rounded-lg border-2 border-black shadow-inner flex items-center justify-center">
          <div className="w-44 h-1.5 bg-[#F59E0B] rounded-full shadow-[0_0_8px_#F59E0B]" />
        </div>

        {/* Dispense Trigger Section */}
        {!isPrinted && !isPrinting && (
          <div className="py-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#FEF3C7] border-2 border-black flex items-center justify-center mb-3 shadow-[3px_3px_0px_#000000]">
              <Printer size={32} className="text-neutral-900 animate-bounce" />
            </div>
            <h3 className="text-base sm:text-lg font-black uppercase text-neutral-900 mb-1">
              CoLabour Thermal POS Ready
            </h3>
            <p className="text-xs font-medium text-neutral-600 max-w-xs mb-5">
              Payment confirmed by worker. Push the button to dispense your official tamper-proof work slip.
            </p>

            {/* Interactive Tactile Dispense Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={handleDispense}
              className="px-8 py-3.5 rounded-2xl font-black text-black text-xs sm:text-sm uppercase bg-[#F59E0B] hover:bg-[#E68A00] shadow-[4px_4px_0px_#000000] border-2 border-black active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={16} className="text-black" />
              <span>⚡ TAP TO DISPENSE SLIP</span>
            </motion.button>
          </div>
        )}

        {/* Printing in progress state */}
        {isPrinting && (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              className="w-12 h-12 rounded-full border-4 border-black border-t-[#F59E0B] mb-3"
            />
            <p className="text-xs font-mono font-black uppercase text-neutral-900 animate-pulse">
              PRINTING THERMAL SLIP...
            </p>
            <p className="text-[11px] font-mono font-bold text-neutral-500 mt-1">Ejecting encrypted receipt...</p>
          </div>
        )}

        {/* Ejected Thermal POS Receipt Paper with Paper-Tear Edge */}
        <AnimatePresence>
          {isPrinted && (
            <motion.div
              initial={{ y: -60, opacity: 0, scaleY: 0.3 }}
              animate={{ y: 0, opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.6, type: 'spring', bounce: 0.2 }}
              className="relative mt-2 origin-top"
            >
              {/* Paper body styling */}
              <div
                id="colabour-receipt-print"
                className="bg-[#FAF7F2] text-neutral-900 font-mono p-5 rounded-t-sm shadow-md relative border-2 border-black border-dashed select-text"
                style={{
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% 98%, 97% 100%, 94% 98%, 91% 100%, 88% 98%, 85% 100%, 82% 98%, 79% 100%, 76% 98%, 73% 100%, 70% 98%, 67% 100%, 64% 98%, 61% 100%, 58% 98%, 55% 100%, 52% 98%, 49% 100%, 46% 98%, 43% 100%, 40% 98%, 37% 100%, 34% 98%, 31% 100%, 28% 98%, 25% 100%, 22% 98%, 19% 100%, 16% 98%, 13% 100%, 10% 98%, 7% 100%, 4% 98%, 0% 100%)',
                  paddingBottom: '2.5rem',
                }}
              >
                {/* Header of the slip */}
                <div className="text-center pb-3 border-b-2 border-dashed border-neutral-400">
                  <div className="flex items-center justify-center gap-1 font-black text-lg sm:text-xl tracking-tight text-neutral-900">
                    <Zap size={20} className="fill-[#F59E0B] text-black" />
                    <span>COLABOUR</span>
                  </div>
                  <p className="text-[10px] text-neutral-600 uppercase tracking-wider font-sans font-bold">
                    On-Demand Skilled Services Platform
                  </p>
                  <p className="text-[9px] text-neutral-500 mt-0.5 font-bold">TAX INVOICE / SERVICE RECEIPT</p>
                </div>

                {/* Slip Details Grid */}
                <div className="py-3 text-xs space-y-1.5 border-b-2 border-dashed border-neutral-400">
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-bold">BOOKING ID:</span>
                    <span className="font-black text-neutral-900 font-mono">#{bookingId.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-bold">DATE & TIME:</span>
                    <span className="text-neutral-900 font-bold">{new Date(date).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-bold">CUSTOMER:</span>
                    <span className="text-neutral-900 font-black">{customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-bold">WORKER:</span>
                    <span className="text-neutral-900 font-black">{workerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-bold">CATEGORY:</span>
                    <span className="text-neutral-900 font-bold">{workerSkill}</span>
                  </div>
                  {workerUpiId && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500 font-bold">WORKER UPI:</span>
                      <span className="text-neutral-900 font-mono font-bold">{workerUpiId}</span>
                    </div>
                  )}
                  {utrNumber && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500 font-bold">BANK UTR:</span>
                      <span className="font-black text-neutral-900 font-mono">{utrNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-bold">PAYMENT STATUS:</span>
                    <span className="font-black text-[#15803D] uppercase">CONFIRMED (PAID)</span>
                  </div>
                </div>

                {/* Amount Calculation */}
                <div className="py-3 border-b-2 border-dashed border-neutral-400 space-y-1">
                  <div className="flex justify-between text-xs text-neutral-700">
                    <span>Labor Service Charge:</span>
                    <span className="font-bold">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#15803D] font-bold">
                    <span>Platform Commission:</span>
                    <span>₹0.00 (Zero Fee)</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-neutral-900 pt-1.5 border-t-2 border-dotted border-neutral-400">
                    <span>TOTAL PAID:</span>
                    <span className="font-mono">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Verification QR and Security Stamp */}
                <div className="pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-11 h-11 bg-white border-2 border-black rounded-lg p-1 flex items-center justify-center shadow-[1px_1px_0px_#000000]">
                      <QrCode size={30} className="text-neutral-900" />
                    </div>
                    <div className="text-[9px] text-neutral-600 leading-tight">
                      <p className="font-black uppercase text-neutral-900">VERIFIED SLIP</p>
                      <p className="font-medium">Scan to verify authenticity</p>
                      <p className="text-[8px] text-neutral-500 mt-0.5 font-mono font-bold">AUTH-{bookingId.slice(0, 6)}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 bg-[#BBF7D0] text-[#15803D] px-2 py-0.5 rounded border border-black text-[9px] font-black uppercase shadow-[1px_1px_0px_#000000]">
                      <ShieldCheck size={11} /> SECURED
                    </span>
                  </div>
                </div>

                {/* Footer message */}
                <p className="text-center text-[9px] font-bold text-neutral-500 mt-4 tracking-wider uppercase">
                  *** THANK YOU FOR CHOOSING COLABOUR ***
                </p>
              </div>

              {/* Actions below paper */}
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleBrowserPrint}
                  className="flex-1 py-2.5 px-4 rounded-xl border-2 border-black bg-white hover:bg-neutral-100 text-black text-xs font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download size={14} />
                  <span>Print / Save PDF</span>
                </button>
                {onDone && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={onDone}
                    className="flex-1 py-2.5 px-4 rounded-xl border-2 border-black bg-[#F59E0B] hover:bg-[#E68A00] text-black text-xs font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Back to Dashboard</span>
                    <ArrowRight size={14} className="stroke-[3]" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


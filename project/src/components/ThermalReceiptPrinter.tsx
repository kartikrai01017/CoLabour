import React, { useState } from 'react';
import { Sparkles, Printer, CheckCircle2, ShieldCheck, Share2, Download, ArrowRight } from 'lucide-react';
import { NeonButton } from './ui/NeonButton';

interface ReceiptProps {
  amount: number;
  bookingId: string;
  workerName: string;
  category: string;
  customerName?: string;
  utrNumber?: string;
  date?: string;
}

export function ThermalReceiptPrinter({
  amount,
  bookingId,
  workerName,
  category,
  customerName = 'Customer',
  utrNumber = '492810293847',
  date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}: ReceiptProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDispensed, setIsDispensed] = useState(false);

  const handleTriggerPrint = () => {
    if (isPrinting || isDispensed) return;
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      setIsDispensed(true);
    }, 1800);
  };

  const handleDownloadOrPrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[540px]">
      {/* 3D Thermal Printer Shell */}
      <div className="relative w-[310px] sm:w-[340px] rounded-[36px] bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-4px_8px_rgba(0,0,0,0.15)] border border-slate-300/80">
        
        {/* Header Indicators */}
        <div className="flex items-center justify-between mb-4 px-2">
          {/* Green Status LED */}
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_12px_#10B981] animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider">ONLINE</span>
          </div>
          <span className="text-xs font-black tracking-widest text-slate-400 uppercase font-mono">COLABOUR POS</span>
        </div>

        {/* Paper Dispenser Slot (Serrated Cut) */}
        <div className="relative z-20 mx-auto h-4 w-[92%] rounded-full bg-slate-900 shadow-[inset_0_3px_6px_rgba(0,0,0,0.9)] border-b border-slate-400/30 flex items-center justify-center overflow-hidden">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        </div>

        {/* The Animated Receipt Paper */}
        <div className="relative z-10 w-full overflow-hidden flex justify-center -mt-2">
          <div
            className={`w-[90%] transition-all duration-1000 ease-out origin-top ${
              isDispensed || isPrinting
                ? 'max-h-[500px] translate-y-0 opacity-100 scale-100'
                : 'max-h-0 -translate-y-10 opacity-0 scale-95'
            }`}
          >
            {/* The Green Aesthetic Ticket Body */}
            <div className="relative my-2 rounded-2xl bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-900 p-5 text-white shadow-[0_15px_35px_rgba(16,185,129,0.35)] border border-emerald-400/40">
              
              {/* Jagged Serrated Top Edge */}
              <div className="absolute -top-1.5 left-0 right-0 h-3 bg-repeat-x bg-[radial-gradient(circle,transparent_4px,#059669_4px)] bg-[length:12px_12px]" />

              {/* Ticket Watermark & Content */}
              <div className="text-center pt-2">
                <div className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-0.5 text-[10px] font-bold tracking-widest uppercase mb-2 border border-white/20">
                  <Sparkles size={11} className="text-amber-300" /> Official Invoice Receipt
                </div>

                <h3 className="text-2xl font-black tracking-tight text-white drop-shadow-sm">CoLabour Pay</h3>
                <p className="text-[11px] text-emerald-200 font-mono mt-0.5">Booking #{bookingId.slice(0, 8).toUpperCase()}</p>
              </div>

              {/* Amount Capsule */}
              <div className="my-4 rounded-xl bg-black/25 p-3 text-center border border-white/10 backdrop-blur-sm shadow-inner">
                <p className="text-[10px] uppercase tracking-wider text-emerald-200">Amount Paid</p>
                <p className="text-3xl font-black text-white tracking-tight">₹{amount.toFixed(2)}</p>
                <div className="mt-1 flex items-center justify-center gap-1 text-[11px] text-emerald-300 font-medium">
                  <CheckCircle2 size={13} /> Verified & Escrow Locked
                </div>
              </div>

              {/* Details Rows */}
              <div className="space-y-1.5 border-t border-emerald-500/40 pt-3 text-xs">
                <div className="flex justify-between text-emerald-100">
                  <span className="text-emerald-300">Customer:</span>
                  <span className="font-semibold text-white truncate max-w-[130px]">{customerName}</span>
                </div>
                <div className="flex justify-between text-emerald-100">
                  <span className="text-emerald-300">Worker:</span>
                  <span className="font-semibold text-white">{workerName}</span>
                </div>
                <div className="flex justify-between text-emerald-100">
                  <span className="text-emerald-300">Service:</span>
                  <span className="font-semibold text-white">{category}</span>
                </div>
                <div className="flex justify-between text-emerald-100">
                  <span className="text-emerald-300">Date:</span>
                  <span className="font-mono text-white">{date}</span>
                </div>
                {utrNumber && (
                  <div className="flex justify-between text-emerald-100">
                    <span className="text-emerald-300">UTR / Ref:</span>
                    <span className="font-mono text-amber-300 font-bold">{utrNumber}</span>
                  </div>
                )}
              </div>

              {/* Security Hologram Stamp */}
              <div className="mt-4 flex items-center justify-center gap-1 text-[10px] text-emerald-200 font-mono">
                <ShieldCheck size={13} className="text-emerald-300" /> 100% SECURE TRANSACTION
              </div>

              {/* Jagged Serrated Bottom Edge */}
              <div className="absolute -bottom-1.5 left-0 right-0 h-3 bg-repeat-x bg-[radial-gradient(circle,transparent_4px,#064e3b_4px)] bg-[length:12px_12px]" />
            </div>
          </div>
        </div>

        {/* 3D Big Pink Tap Button (Shown when not yet dispensed) */}
        {!isDispensed && (
          <div className="relative mt-5 flex flex-col items-center justify-center">
            <button
              onClick={handleTriggerPrint}
              disabled={isPrinting}
              className={`group relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-b from-pink-400 via-pink-500 to-rose-600 shadow-[0_12px_25px_rgba(244,63,94,0.45),inset_0_3px_5px_rgba(255,255,255,0.6),inset_0_-4px_6px_rgba(0,0,0,0.3)] border-4 border-slate-200 transition-all active:scale-95 active:shadow-[0_4px_12px_rgba(244,63,94,0.6)] ${
                isPrinting ? 'animate-pulse scale-95' : 'hover:scale-105'
              }`}
            >
              {/* Crosshair ring */}
              <div className="absolute inset-2 rounded-full border border-white/30 pointer-events-none" />

              {isPrinting ? (
                <div className="flex flex-col items-center text-white">
                  <Printer size={28} className="animate-bounce" />
                  <span className="text-[9px] font-bold font-mono mt-1 uppercase">Printing...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-white drop-shadow">
                  {/* Fingerprint / Tap hand visual */}
                  <svg className="h-10 w-10 text-white/90 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
              )}
            </button>

            <span className="mt-3 text-xs font-black tracking-widest text-pink-600 uppercase font-mono">
              {isPrinting ? 'GENERATING RECEIPT...' : 'TAP TO PRINT RECEIPT'}
            </span>
          </div>
        )}

        {/* Post-Print Quick Actions */}
        {isDispensed && (
          <div className="mt-4 flex gap-2 pt-2">
            <button
              onClick={handleDownloadOrPrint}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-900 transition-all active:scale-95"
            >
              <Download size={14} /> Print / Save
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `Receipt #${bookingId.slice(0, 8)}`,
                    text: `Payment of ₹${amount} completed for ${workerName} (${category}) on CoLabour!`,
                  });
                } else {
                  alert('Receipt link copied!');
                }
              }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all active:scale-95"
            >
              <Share2 size={14} /> Share Ticket
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

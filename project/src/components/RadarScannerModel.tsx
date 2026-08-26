import React, { useState, useEffect } from 'react';
import { Radio, Users, MapPin, Zap, X } from 'lucide-react';
import { NeonButton } from './ui/NeonButton';

interface RadarProps {
  category: string;
  radiusKm?: number;
  onCancel: () => void;
  workersCount?: number;
}

export function RadarScannerModal({ category, radiusKm = 5, onCancel, workersCount = 4 }: RadarProps) {
  const [seconds, setSeconds] = useState(45);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-[36px] border border-neon-emerald/30 bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-8 text-center shadow-[0_0_80px_rgba(16,185,129,0.25)]">
        
        {/* Cancel Close */}
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10"
        >
          <X size={18} />
        </button>

        {/* 3D Sonar Radar Circle */}
        <div className="relative mx-auto my-6 flex h-56 w-56 items-center justify-center">
          {/* Concentric pulse rings */}
          <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping" />
          <div className="absolute inset-6 rounded-full border border-emerald-500/30" />
          <div className="absolute inset-16 rounded-full border border-emerald-500/40" />
          <div className="absolute inset-24 rounded-full border border-emerald-500/60" />

          {/* Rotating Sonar Radar Beam */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="h-full w-full bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(16,185,129,0.4)_360deg)] animate-[spin_2.2s_linear_infinite]" />
          </div>

          {/* Center User Pin */}
          <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-[0_0_30px_#10B981] border-2 border-white">
            <MapPin size={26} className="text-white fill-white animate-bounce" />
          </div>

          {/* Simulated Nearby Blips */}
          <div className="absolute top-10 right-12 h-3.5 w-3.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22D3EE] animate-pulse" />
          <div className="absolute bottom-12 left-10 h-3.5 w-3.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#10B981] animate-pulse" />
          <div className="absolute top-20 left-8 h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_10px_#F59E0B] animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-3">
          <Radio size={14} className="animate-pulse" /> LIVE BROADCAST IN {radiusKm} KM RADIUS
        </div>

        <h2 className="text-2xl font-black text-white">Scanning for {category}s...</h2>
        <p className="text-xs text-gray-400 mt-1 mb-5">
          Request sent to <strong className="text-emerald-400 font-mono">{workersCount} nearby active {category}s</strong>. The first one to accept will be dispatched to your location.
        </p>

        {/* Timer Pill */}
        <div className="mb-6 flex items-center justify-center gap-2 text-xs font-mono text-gray-300">
          <span>Auto-Timeout:</span>
          <span className="font-bold text-white bg-white/10 px-2.5 py-1 rounded-md">{seconds}s</span>
        </div>

        <NeonButton fullWidth variant="danger" size="md" onClick={onCancel}>
          Cancel Search Request
        </NeonButton>
      </div>
    </div>
  );
}

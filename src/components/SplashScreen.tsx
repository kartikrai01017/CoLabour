import React, { useEffect, useState, useMemo } from 'react';

export interface LetterConfig {
  char: string;
  dir: 'top' | 'left' | 'bottom' | 'right' | 'top-right' | 'bottom-left' | 'top-left' | 'bottom-right';
  color: string;
}

// Dynamic Letter Configuration Array
const letterConfig: LetterConfig[] = [
  { char: 'C', dir: 'top', color: 'text-stone-900' },
  { char: 'o', dir: 'left', color: 'text-stone-900' },
  { char: 'L', dir: 'bottom', color: 'text-teal-400' },
  { char: 'a', dir: 'right', color: 'text-teal-400' },
  { char: 'b', dir: 'top-right', color: 'text-teal-400' },
  { char: 'o', dir: 'bottom-left', color: 'text-teal-400' },
  { char: 'u', dir: 'top-left', color: 'text-teal-400' },
  { char: 'r', dir: 'bottom-right', color: 'text-teal-400' },
];

// Vector transformation mapping computed dynamically
const DIRECTION_TRANSFORM_MAP: Record<LetterConfig['dir'], { x: number; y: number; rot: number }> = {
  top: { x: 0, y: -160, rot: -10 },
  left: { x: -160, y: 0, rot: -12 },
  bottom: { x: 0, y: 160, rot: 10 },
  right: { x: 160, y: 0, rot: 12 },
  'top-right': { x: 140, y: -140, rot: 14 },
  'bottom-left': { x: -140, y: 140, rot: -14 },
  'top-left': { x: -140, y: -140, rot: -14 },
  'bottom-right': { x: 140, y: 140, rot: 14 },
};

export function SplashScreen() {
  const [stage, setStage] = useState<'animating' | 'holding' | 'fading' | 'hidden'>('animating');

  useEffect(() => {
    // Stage 1: Letters assemble dynamically (0s -> 0.8s)
    const holdTimer = setTimeout(() => {
      setStage('holding');
    }, 800);

    // Stage 2: Smooth fade out starts at ~2.0s
    const fadeTimer = setTimeout(() => {
      setStage('fading');
    }, 2000);

    // Stage 3: Fully unmount / hide after fade out finishes at ~2.4s
    const hideTimer = setTimeout(() => {
      setStage('hidden');
    }, 2400);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const renderedLetters = useMemo(() => {
    return letterConfig.map((item, index) => {
      const transform = DIRECTION_TRANSFORM_MAP[item.dir] || { x: 0, y: 0, rot: 0 };
      const customStyle = {
        '--start-x': `${transform.x}px`,
        '--start-y': `${transform.y}px`,
        '--start-rot': `${transform.rot}deg`,
        '--delay': `${index * 45}ms`,
      } as React.CSSProperties;

      return (
        <span
          key={`${item.char}-${index}`}
          className={`inline-block font-black select-none splash-letter-dynamic ${item.color}`}
          style={customStyle}
        >
          {item.char}
        </span>
      );
    });
  }, []);

  if (stage === 'hidden') return null;

  return (
    <div
      id="colabour-splash-screen"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden transition-all duration-500 ease-out bg-amber-50/95 backdrop-blur-xl ${
        stage === 'fading'
          ? 'opacity-0 scale-105 pointer-events-none'
          : 'opacity-100 scale-100 pointer-events-auto'
      }`}
      aria-hidden="true"
    >
      {/* Background Ambience using Tailwind Tokens */}
      <div className="absolute inset-0 bg-stone-900/5 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute w-96 h-96 rounded-full bg-teal-300/30 blur-3xl pointer-events-none" />
      <div className="absolute w-80 h-80 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />

      {/* Neubrutalist Accent Framing Corner Brackets */}
      <div className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-stone-900 rounded-tl-xl" />
      <div className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-stone-900 rounded-tr-xl" />
      <div className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-stone-900 rounded-bl-xl" />
      <div className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-stone-900 rounded-br-xl" />

      {/* Main Animated Wordmark Container */}
      <div
        className={`relative z-10 flex flex-col items-center p-8 rounded-3xl border-4 border-stone-900 bg-amber-50 shadow-[8px_8px_0px_0px_rgba(28,25,23,1)] transition-transform duration-700 ${
          stage === 'holding' ? 'splash-float-breathe' : ''
        }`}
      >
        {/* Dynamic Brand Tag */}
        <div className="mb-5 inline-flex items-center gap-2 px-4 py-1 rounded-full bg-teal-300 border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] text-xs font-mono font-black text-stone-900 uppercase">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>DECENTRALIZED WORKFORCE OS</span>
        </div>

        {/* Dynamic Computed Wordmark */}
        <div className="flex items-center text-[clamp(2.75rem,8vw,5.5rem)] font-black tracking-tight font-sans">
          {renderedLetters}
        </div>

        {/* Dynamic Progress Laser Bar */}
        <div className="mt-6 flex flex-col items-center gap-2.5 w-full max-w-xs">
          <div className="relative w-full h-2 bg-stone-200 rounded-full border-2 border-stone-900 overflow-hidden shadow-[1px_1px_0px_0px_rgba(28,25,23,1)]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400 to-emerald-400 splash-glow-progress" />
          </div>
          <span className="font-mono text-xs font-black tracking-wider text-stone-700">
            CONNECTING NEURAL PROTOCOLS...
          </span>
        </div>
      </div>
    </div>
  );
}

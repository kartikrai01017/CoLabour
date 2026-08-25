import { useMemo } from 'react';

interface Shape {
  id: number;
  type: 'linked' | 'coin' | 'arc' | 'diamond' | 'hexagon' | 'cross';
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  color: string;
  opacity: number;
  blur: number;
  anim: string;
}

// Co-op money palette: brass / sage / warm — muted, professional
const COLORS = [
  'rgba(197,160,89,0.09)',
  'rgba(124,154,107,0.07)',
  'rgba(212,165,116,0.06)',
  'rgba(107,141,181,0.06)',
  'rgba(197,160,89,0.05)',
  'rgba(124,154,107,0.05)',
  'rgba(194,122,110,0.05)',
];

function LinkedRings({ size, color, strokeW }: { size: number; color: string; strokeW: number }) {
  const r = size * 0.32;
  const gap = size * 0.22;
  return (
    <>
      <circle cx={-gap} cy={0} r={r} fill="none" stroke={color} strokeWidth={strokeW} />
      <circle cx={gap} cy={0} r={r} fill="none" stroke={color} strokeWidth={strokeW} />
      {/* overlap highlight */}
      <path d={`M ${-gap} ${-r * 0.6} A ${r} ${r} 0 0 1 ${-gap} ${r * 0.6}`} fill="none" stroke={color} strokeWidth={strokeW * 1.3} opacity={0.5} />
    </>
  );
}

function CoinShape({ size, color, strokeW }: { size: number; color: string; strokeW: number }) {
  const r = size * 0.4;
  return (
    <>
      <circle cx={0} cy={0} r={r} fill="none" stroke={color} strokeWidth={strokeW} />
      <circle cx={0} cy={0} r={r * 0.62} fill="none" stroke={color} strokeWidth={strokeW * 0.7} opacity={0.4} />
      <text x={0} y={r * 0.18} textAnchor="middle" fontSize={r * 0.55} fill={color} opacity={0.35} fontWeight={700}>₹</text>
    </>
  );
}

function ArcFlow({ size, color, strokeW }: { size: number; color: string; strokeW: number }) {
  const w = size * 0.9;
  return (
    <>
      <path d={`M ${-w / 2} 0 Q 0 ${-size * 0.35} ${w / 2} 0`} fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
      <circle cx={w / 2} cy={0} r={size * 0.06} fill={color} opacity={0.6} />
      <circle cx={-w / 2} cy={0} r={size * 0.04} fill={color} opacity={0.3} />
    </>
  );
}

function getShapeSVG(type: string, size: number, color: string, strokeW: number) {
  const s = size / 2;
  switch (type) {
    case 'linked':
      return <LinkedRings size={size} color={color} strokeW={strokeW} />;
    case 'coin':
      return <CoinShape size={size} color={color} strokeW={strokeW} />;
    case 'arc':
      return <ArcFlow size={size} color={color} strokeW={strokeW} />;
    case 'diamond':
      return <polygon points={`0,${-s * 1.3} ${s * 0.75},0 0,${s * 1.3} ${-s * 0.75},0`} fill="none" stroke={color} strokeWidth={strokeW} strokeLinejoin="round" />;
    case 'hexagon': {
      const pts: string[] = [];
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        pts.push(`${Math.cos(a) * s},${Math.sin(a) * s}`);
      }
      return <polygon points={pts.join(' ')} fill="none" stroke={color} strokeWidth={strokeW} strokeLinejoin="round" />;
    }
    case 'cross':
      return <polygon points={`${-s * 0.14},${-s} ${s * 0.14},${-s} ${s * 0.14},${s * 0.14} ${s},${s * 0.14} ${s},${s * 0.42} ${s * 0.14},${s * 0.42} ${s * 0.14},${s} ${-s * 0.14},${s} ${-s * 0.14},${s * 0.42} ${-s},${s * 0.42} ${-s},${s * 0.14} ${-s * 0.14},${s * 0.14}`} fill="none" stroke={color} strokeWidth={strokeW} strokeLinejoin="round" />;
    default:
      return null;
  }
}

function WireframeShape({ shape }: { shape: Shape }) {
  const strokeW = shape.size > 100 ? 0.7 : shape.size > 60 ? 0.9 : 1.1;
  const vb = shape.size * 2;

  return (
    <div
      className="absolute"
      style={{
        left: `${shape.x}%`,
        top: `${shape.y}%`,
        animation: `${shape.anim} ${shape.duration}s ease-in-out ${shape.delay}s infinite`,
        opacity: shape.opacity,
        filter: shape.blur > 0 ? `blur(${shape.blur}px)` : undefined,
        transformStyle: 'preserve-3d',
        perspective: '800px',
      }}
    >
      <svg
        width={shape.size * 2}
        height={shape.size * 2}
        viewBox={`${-vb / 2} ${-vb / 2} ${vb} ${vb}`}
        className="animate-rotate3d-slow"
        style={{ animationDuration: `${shape.duration * 1.6}s` }}
      >
        {getShapeSVG(shape.type, shape.size, shape.color, strokeW)}
      </svg>
    </div>
  );
}

export function BackgroundObjects() {
  const shapes = useMemo<Shape[]>(() => [
    { id: 1, type: 'linked', size: 110, x: 6, y: 12, duration: 20, delay: 0, color: COLORS[0], opacity: 0.5, blur: 0, anim: 'float3d' },
    { id: 2, type: 'coin', size: 90, x: 88, y: 8, duration: 24, delay: 1.5, color: COLORS[0], opacity: 0.4, blur: 0, anim: 'float3d-drift' },
    { id: 3, type: 'arc', size: 100, x: 78, y: 52, duration: 18, delay: 0.8, color: COLORS[1], opacity: 0.35, blur: 1, anim: 'float3d' },
    { id: 4, type: 'diamond', size: 95, x: 14, y: 62, duration: 22, delay: 2.5, color: COLORS[2], opacity: 0.38, blur: 0, anim: 'float3d-drift' },
    { id: 5, type: 'hexagon', size: 65, x: 50, y: 18, duration: 19, delay: 0.3, color: COLORS[1], opacity: 0.3, blur: 1, anim: 'float3d' },
    { id: 6, type: 'cross', size: 70, x: 32, y: 72, duration: 26, delay: 3, color: COLORS[3], opacity: 0.28, blur: 2, anim: 'float3d-drift' },
    { id: 7, type: 'linked', size: 140, x: 92, y: 68, duration: 22, delay: 1, color: COLORS[4], opacity: 0.18, blur: 3, anim: 'float3d' },
    { id: 8, type: 'coin', size: 50, x: 28, y: 4, duration: 17, delay: 2, color: COLORS[0], opacity: 0.45, blur: 0, anim: 'float3d-drift' },
    { id: 9, type: 'arc', size: 120, x: 68, y: 84, duration: 25, delay: 0, color: COLORS[5], opacity: 0.15, blur: 3, anim: 'float3d' },
    { id: 10, type: 'diamond', size: 80, x: 4, y: 38, duration: 20, delay: 3, color: COLORS[6], opacity: 0.3, blur: 1, anim: 'float3d-drift' },
    { id: 11, type: 'hexagon', size: 55, x: 60, y: 35, duration: 15, delay: 1, color: COLORS[0], opacity: 0.35, blur: 0, anim: 'float3d' },
    { id: 12, type: 'linked', size: 45, x: 18, y: 86, duration: 23, delay: 1.8, color: COLORS[1], opacity: 0.28, blur: 2, anim: 'float3d-drift' },
    { id: 13, type: 'coin', size: 60, x: 45, y: 55, duration: 18, delay: 0.5, color: COLORS[4], opacity: 0.32, blur: 1, anim: 'float3d' },
    { id: 14, type: 'arc', size: 55, x: 82, y: 28, duration: 20, delay: 2.8, color: COLORS[3], opacity: 0.38, blur: 0, anim: 'float3d-drift' },
    { id: 15, type: 'diamond', size: 115, x: 72, y: 16, duration: 26, delay: 1.2, color: COLORS[2], opacity: 0.16, blur: 3, anim: 'float3d' },
    { id: 16, type: 'hexagon', size: 38, x: 25, y: 46, duration: 13, delay: 3.5, color: COLORS[1], opacity: 0.42, blur: 0, anim: 'float3d-drift' },
    { id: 17, type: 'cross', size: 90, x: 55, y: 76, duration: 28, delay: 0.4, color: COLORS[3], opacity: 0.14, blur: 4, anim: 'float3d' },
    { id: 18, type: 'linked', size: 42, x: 94, y: 44, duration: 14, delay: 2.6, color: COLORS[0], opacity: 0.38, blur: 0, anim: 'float3d-drift' },
    { id: 19, type: 'coin', size: 70, x: 38, y: 2, duration: 21, delay: 1, color: COLORS[0], opacity: 0.28, blur: 1, anim: 'float3d' },
    { id: 20, type: 'arc', size: 48, x: 10, y: 26, duration: 19, delay: 3.5, color: COLORS[5], opacity: 0.32, blur: 0, anim: 'float3d-drift' },
    { id: 21, type: 'diamond', size: 36, x: 66, y: 60, duration: 12, delay: 0.2, color: COLORS[0], opacity: 0.4, blur: 0, anim: 'float3d' },
    { id: 22, type: 'hexagon', size: 85, x: 20, y: 52, duration: 24, delay: 2, color: COLORS[6], opacity: 0.22, blur: 2, anim: 'float3d-drift' },
    { id: 23, type: 'linked', size: 70, x: 52, y: 42, duration: 22, delay: 1.5, color: COLORS[1], opacity: 0.28, blur: 1, anim: 'float3d' },
    { id: 24, type: 'cross', size: 40, x: 86, y: 80, duration: 16, delay: 3, color: COLORS[4], opacity: 0.35, blur: 0, anim: 'float3d-drift' },
    { id: 25, type: 'coin', size: 55, x: 30, y: 90, duration: 23, delay: 0.6, color: COLORS[0], opacity: 0.22, blur: 3, anim: 'float3d' },
  ], []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ transformStyle: 'preserve-3d', perspective: '1200px' }}>
      {shapes.map((shape) => (
        <WireframeShape key={shape.id} shape={shape} />
      ))}
    </div>
  );
}

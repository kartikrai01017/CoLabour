import { useEffect, useRef } from 'react';

interface Trail {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  radius: number;
}

interface Drop {
  x: number;
  y: number;
  vy: number;
  life: number;
  maxLife: number;
  width: number;
  length: number;
}

export function CursorEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0, scrollY: 0 });
  const trailsRef = useRef<Trail[]>([]);
  const dropsRef = useRef<Drop[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.px = mouseRef.current.x;
      mouseRef.current.py = mouseRef.current.y;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      const dx = mouseRef.current.x - mouseRef.current.px;
      const dy = mouseRef.current.y - mouseRef.current.py;
      const speed = Math.sqrt(dx * dx + dy * dy);

      if (speed > 2 && trailsRef.current.length < 24) {
        trailsRef.current.push({
          x: e.clientX,
          y: e.clientY,
          life: 1,
          maxLife: 0.5 + Math.random() * 0.3,
          radius: 2 + Math.random() * 2,
        });
      }
    };

    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      if (scrollDelta > 2 && dropsRef.current.length < 12) {
        const count = Math.min(Math.floor(scrollDelta / 6), 3);
        for (let i = 0; i < count; i++) {
          dropsRef.current.push({
            x: mouseRef.current.x + (Math.random() - 0.5) * 40,
            y: mouseRef.current.y + Math.random() * 20,
            vy: 1.5 + Math.random() * 2.5,
            life: 1,
            maxLife: 0.7 + Math.random() * 0.5,
            width: 1 + Math.random() * 1.5,
            length: 16 + Math.random() * 30,
          });
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      trailsRef.current = trailsRef.current.filter((t) => {
        t.life -= 0.025;
        if (t.life <= 0) return false;

        const alpha = t.life * 0.5;
        const r = t.radius * t.life;

        ctx.beginPath();
        ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(77, 208, 200, ${alpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(t.x, t.y, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(77, 208, 200, ${alpha * 0.1})`;
        ctx.fill();

        return true;
      });

      dropsRef.current = dropsRef.current.filter((d) => {
        d.y += d.vy;
        d.vy += 0.08;
        d.life -= 0.018;
        if (d.life <= 0) return false;

        const alpha = d.life * 0.45;
        const gradient = ctx.createLinearGradient(d.x, d.y, d.x, d.y + d.length * d.life);
        gradient.addColorStop(0, `rgba(77, 208, 200, ${alpha * 0.8})`);
        gradient.addColorStop(0.5, `rgba(155, 127, 212, ${alpha * 0.4})`);
        gradient.addColorStop(1, `rgba(155, 127, 212, 0)`);

        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.length * d.life);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = d.width * d.life;
        ctx.lineCap = 'round';
        ctx.stroke();

        return true;
      });

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const glow = ctx.createRadialGradient(mx, my, 0, mx, my, 60);
      glow.addColorStop(0, 'rgba(77, 208, 200, 0.05)');
      glow.addColorStop(0.5, 'rgba(155, 127, 212, 0.015)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(mx - 60, my - 60, 120, 120);

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

export function useParallax(depth: number = 1) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouse = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      el.style.transform = `translate(${dx * 12 * depth}px, ${dy * 12 * depth}px)`;
    };

    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [depth]);

  return ref;
}

export function useMagnetic(strength: number = 0.3) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouse = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 150;

      if (dist < maxDist) {
        const power = (1 - dist / maxDist) * strength;
        el.style.transform = `translate(${dx * power}px, ${dy * power}px) scale(${1 + power * 0.08})`;
        el.style.transition = 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)';
      } else {
        el.style.transform = 'translate(0, 0) scale(1)';
        el.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      }
    };

    const handleLeave = () => {
      el.style.transform = 'translate(0, 0) scale(1)';
      el.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
    };

    window.addEventListener('mousemove', handleMouse);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouse);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [strength]);

  return ref;
}

export function useTilt(maxTilt: number = 8) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouse = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tiltX = (0.5 - y) * maxTilt;
      const tiltY = (x - 0.5) * maxTilt;
      el.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
      el.style.transition = 'transform 0.15s cubic-bezier(0.23, 1, 0.32, 1)';
    };

    const handleLeave = () => {
      el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
      el.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
    };

    el.addEventListener('mousemove', handleMouse);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouse);
      el.removeEventListener('mouseleave', handleLeave);
    };
    }, [maxTilt]);

  return ref;
}

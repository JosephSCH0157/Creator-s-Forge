import React, { useEffect, useRef } from "react";

type Hearth = { x: number; y: number; w: number; h: number };

type Props = {
  /** Path to your splash PNG, e.g. "/images/forge_splash.png" (in /public) */
  src: string;
  /** Hearth area (in CSS pixels) where embers originate, relative to the image/canvas */
  hearth: Hearth;
  /** Target embers per second */
  spawnRate?: number;
  /** Max embers alive at once (safety cap) */
  maxEmbers?: number;
  /** Optional: fixed canvas width/height; otherwise fills parent */
  width?: number;
  height?: number;
  /** Optional className for outer wrapper */
  className?: string;
};

type Ember = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;     // 0..1 (1 = newborn)
  decay: number;    // how fast life decreases per second
  size: number;     // initial radius in px
  spin: number;     // slight rotation for flicker
};

const SplashWithEmbers: React.FC<Props> = ({
  src,
  hearth,
  spawnRate = 120, // embers per second (tune)
  maxEmbers = 500,
  width,
  height,
  className,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    let running = true;

    // Size handling (fills parent by default)
    const resize = () => {
      const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
      const rect = wrapperRef.current!.getBoundingClientRect();
      const cssW = width ?? rect.width;
      const cssH = height ?? rect.height;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = Math.max(1, Math.floor(cssW * dpr));
      canvas.height = Math.max(1, Math.floor(cssH * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
    };

    resize();
    window.addEventListener("resize", resize);

    // Reduced motion respect
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      running = false; // quietly disable animation
    }

    // Particle system
    const embers: Ember[] = [];
    let lastTime = performance.now();
    let spawnAccumulator = 0;

    // Utility: spawn a single ember
    const spawn = () => {
      // random point inside the hearth rect
      const x = hearth.x + Math.random() * hearth.w;
      const y = hearth.y + hearth.h * (0.6 + 0.4 * Math.random()); // bias slightly lower in the box
      // initial velocities (upward with slight sideways drift)
      const vx = (Math.random() - 0.5) * 40;          // px/s
      const vy = - (60 + Math.random() * 140);        // px/s up
      const life = 1;
      const decay = 0.6 + Math.random() * 0.9;        // life per second
      const size = 1.5 + Math.random() * 2.5;         // radius px
      const spin = (Math.random() - 0.5) * 6.0;       // small flicker
      embers.push({ x, y, vx, vy, life, decay, size, spin });
    };

    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

    // color ramp: life 1→0 => yellow→orange→red→ash
    const colorFor = (life: number) => {
      // segment 1: 1..0.6  (hot white/yellow)
      // segment 2: 0.6..0.3 (orange)
      // segment 3: 0.3..0   (deep red to gray)
      if (life > 0.6) {
        const t = (life - 0.6) / 0.4; // 0..1
        // from #fff4c1 to #ffd27a (soft yellow)
        return { r: 255, g: Math.round(212 + 42 * t), b: Math.round(122 + 61 * t) };
      } else if (life > 0.3) {
        const t = (life - 0.3) / 0.3; // 0..1
        // from #ff8a00 (orange) to #ffd27a (reverse blend)
        const r = 255;
        const g = Math.round(138 * (1 - t) + 212 * t);
        const b = Math.round(0 * (1 - t) + 122 * t);
        return { r, g, b };
      } else {
        const t = life / 0.3; // 0..1
        // from #4b4b4b (ash) to #ff3b00 (deep red)
        const r = Math.round(75 * (1 - t) + 255 * t);
        const g = Math.round(75 * (1 - t) + 59 * t);
        const b = Math.round(75 * (1 - t) + 0 * t);
        return { r, g, b };
      }
    };

    const tick = () => {
      if (!running) return;

      const now = performance.now();
      const dt = clamp((now - lastTime) / 1000, 0, 0.05); // seconds, cap big jumps
      lastTime = now;

      // Spawn based on rate
      spawnAccumulator += spawnRate * dt;
      const toSpawn = Math.floor(spawnAccumulator);
      spawnAccumulator -= toSpawn;
      for (let i = 0; i < toSpawn && embers.length < maxEmbers; i++) spawn();

      // Clear with slight trail for glow persistence
      const w = canvas.width; // device pixels but ctx is scaled, OK
      const h = canvas.height;
      ctx.save();
      // Fade previous frame a touch for motion trails
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // Additive blending for glow
      ctx.globalCompositeOperation = "lighter";

      // Update/draw embers
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        // physics
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.vx *= 0.995;                 // slight air resistance
        e.vy -= 10 * dt;               // very light “updraft waver”
        e.life -= e.decay * dt;
        e.spin += 0.1;                 // tiny flicker

        if (e.life <= 0) {
          embers.splice(i, 1);
          continue;
        }

        // draw
        const { r, g, b } = colorFor(e.life);
        const alpha = Math.max(0, Math.min(1, e.life));
        const radius = Math.max(0.2, e.size * (0.6 + 0.4 * e.life));
        // soft circle
        const grd = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, radius * (1.8 + 0.6 * Math.sin(e.spin)));
        grd.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(e.x, e.y, radius * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [hearth.x, hearth.y, hearth.w, hearth.h, spawnRate, maxEmbers, width, height]);

  return (
    <div ref={wrapperRef} className={["relative overflow-hidden", className].filter(Boolean).join(" ")}
         style={{ width: width ? `${width}px` : "100%", height: height ? `${height}px` : "100%" }}>
      {/* Background image */}
      <img
        ref={imgRef}
        src={src}
        alt="Creator's Forge Splash"
        className="absolute inset-0 w-full h-full object-cover select-none"
        draggable={false}
      />
      {/* Ember canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
};

export default SplashWithEmbers;

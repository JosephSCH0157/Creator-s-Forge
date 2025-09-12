// src/routes/SplashWithEmbers.tsx
import React, { useEffect, useRef } from "react";

type Rect = { x: number; y: number; w: number; h: number };
type Props = {
  src: string;                 // image path (e.g. "/forge.png")
  hearth: Rect;                // in *image* pixel space
  spawnRate?: number;          // embers per second
  maxEmbers?: number;          // cap
  className?: string;          // pass-through for positioning/z-index
  debug?: boolean;             // <— start with debug on?
  debugKey?: string;           // <— key to toggle (default: "d")
};

type Ember = {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number;
};

const SplashWithEmbers: React.FC<Props> = ({
  src,
  hearth,
  spawnRate = 120,
  maxEmbers = 500,
  className = "",
  debug = false,
  debugKey = "d",
}) => {
  const [showDebug, setShowDebug] = React.useState<boolean>(!!debug);

  // Toggle with keyboard
  useEffect(() => {
    const key = (debugKey || "d").toLowerCase();
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === key) setShowDebug(s => !s);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [debugKey, debug]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const embersRef = useRef<Ember[]>([]);
  const rafRef = useRef<number | null>(null);
  const loadedRef = useRef<boolean>(false);
  const pendingSpawnRef = useRef<number>(0);
  const lastTsRef = useRef<number>(performance.now());

  // load image once
  useEffect(() => {
    const img = new Image();
    img.src = src;
    const onLoad = () => { loadedRef.current = true; };
    const onErr = () => { console.error("SplashWithEmbers: failed to load", src); };
    img.addEventListener("load", onLoad);
    img.addEventListener("error", onErr);
    imgRef.current = img;
    return () => {
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onErr);
      imgRef.current = null;
      loadedRef.current = false;
    };
  }, [src]);

  // resize canvas to parent (viewport) with HiDPI support
  const resizeCanvas = () => {
    const c = canvasRef.current;
    if (!c) return;
    const parent = c.parentElement;
    const cssW = parent ? parent.clientWidth : window.innerWidth;
    const cssH = parent ? parent.clientHeight : window.innerHeight;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    c.width = Math.floor(cssW * dpr);
    c.height = Math.floor(cssH * dpr);
    c.style.width = `${cssW}px`;
    c.style.height = `${cssH}px`;

    const ctx = c.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // main loop
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    const ctx = c.getContext("2d");
    if (!ctx) return;

    const onResize = () => resizeCanvas();
    onResize();
    window.addEventListener("resize", onResize);

    // nicer blending for embers
    const draw = (ts: number) => {
      const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000); // cap large jumps
      lastTsRef.current = ts;

      const w = c.clientWidth;
      const h = c.clientHeight;

      // clear frame
      ctx.clearRect(0, 0, w, h);

      // draw image (contain)
      const img = imgRef.current;
      if (loadedRef.current && img && img.naturalWidth && img.naturalHeight) {
        const iw = img.naturalWidth, ih = img.naturalHeight;
        const scale = Math.min(w / iw, h / ih);           // contain (no distortion)
        const dw = iw * scale, dh = ih * scale;
        const dx = (w - dw) / 2, dy = (h - dh) / 2;
        ctx.drawImage(img, dx, dy, dw, dh);

        // map hearth rect (image space → screen space)
        const sx = dx + hearth.x * scale;
        const sy = dy + hearth.y * scale;
        const sw = hearth.w * scale;
        const sh = hearth.h * scale;

        // DEBUG overlay
        if (showDebug) {
          ctx.save();
          ctx.lineWidth = 2;
          ctx.strokeStyle = "rgba(255, 80, 80, 0.9)";
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(sx, sy, sw, sh);

          // label (top-left)
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          const label = `hearth { x:${Math.round(hearth.x)}, y:${Math.round(hearth.y)}, w:${Math.round(hearth.w)}, h:${Math.round(hearth.h)} }`;
          const pad = 6;
          ctx.font = "12px sans-serif";
          const metrics = ctx.measureText(label);
          const lh = 14;
          ctx.fillRect(sx, sy - (lh + pad * 2), metrics.width + pad * 2, lh + pad * 2);
          ctx.fillStyle = "#fff";
          ctx.fillText(label, sx + pad, sy - pad);
          ctx.restore();
        }

        // spawn embers
        pendingSpawnRef.current += dt * spawnRate;
        while (pendingSpawnRef.current >= 1 && embersRef.current.length < maxEmbers) {
          pendingSpawnRef.current -= 1;
          const ex = sx + Math.random() * sw;
          const ey = sy + Math.random() * sh;
          embersRef.current.push({
            x: ex,
            y: ey,
            vx: (Math.random() - 0.5) * 22,         // subtle sideways drift
            vy: -(50 + Math.random() * 80),         // upward
            life: 0,
            maxLife: 1.2 + Math.random() * 1.6,     // seconds
          });
        }

        // draw embers
        ctx.globalCompositeOperation = "lighter";   // additive glow
        for (let i = embersRef.current.length - 1; i >= 0; i--) {
          const e = embersRef.current[i];
          e.life += dt;
          if (e.life >= e.maxLife) { embersRef.current.splice(i, 1); continue; }
          // simple physics
          e.x += e.vx * dt;
          e.y += e.vy * dt;
          e.vy -= 8 * dt; // extra lift over time

          const t = e.life / e.maxLife;          // 0..1
          const alpha = 1 - t;
          const r = 2 + 3 * (1 - t);
          const grd = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r);
          grd.addColorStop(0, `rgba(255, 200, 120, ${0.9 * alpha})`);
          grd.addColorStop(1, `rgba(255, 100, 0, 0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [hearth, spawnRate, maxEmbers]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0 }}>
      {/* fallback image so you never see a blank background before the first draw */}
      <img
        src={src}
        alt="Creator's Forge Splash"
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        draggable={false}
      />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />
    </div>
  );
};

export default SplashWithEmbers;

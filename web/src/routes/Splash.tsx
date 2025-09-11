import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function Splash() {
  const embersRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = embersRef.current;
    if (!root) return;
    const N = 80; // number of embers
    // Clear any existing (in case of hot reload)
    root.innerHTML = "";
    for (let i = 0; i < N; i++) {
      const s = document.createElement("span");
      const dur = 4 + Math.random() * 6;
      s.style.position = "absolute";
      s.style.width = "2px";
      s.style.height = "2px";
      s.style.background = "radial-gradient(circle, #ffd9a6 0, #ff6a00 60%, transparent 70%)";
      s.style.filter = "blur(.2px)";
      s.style.left = 20 + Math.random() * 40 + "vw"; // near forge
      s.style.bottom = Math.random() * 20 + "vh";
      s.style.animation = `floatUp ${dur}s linear infinite`;
      s.style.animationDelay = -Math.random() * dur + "s";
      s.style.opacity = "0.7";
      root.appendChild(s);
    }
  }, []);

  const toolIds = ["forge", "anvil", "hammer", "tongs", "quench", "ledger", "stock"] as const;

  useEffect(() => {
    // Keyboard affordance: Enter/Space triggers first link inside each group
    toolIds.forEach((id) => {
      const g = document.getElementById(id);
      if (!g) return;
      g.setAttribute("role", "button");
      g.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          const link = g.querySelector<HTMLAnchorElement>("a[href]");
          if (link) {
            (link as HTMLAnchorElement).click();
            e.preventDefault();
          }
        }
      });
      (g as HTMLElement).style.cursor = "pointer";
    });
    return () => {
      toolIds.forEach((id) => {
        const g = document.getElementById(id);
        if (!g) return;
        // Clone to remove listeners on unmount/hot-reload
        const clone = g.cloneNode(true);
        g.parentNode?.replaceChild(clone, g);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="min-h-screen grid place-items-center text-[#e7eef7]"
      style={{
        background:
          "radial-gradient(1200px 800px at 70% 10%, #1e232b10 0%, transparent 60%)," +
          "radial-gradient(900px 600px at 20% 80%, #0f131910 0%, transparent 60%)," +
          "linear-gradient(180deg, #111419, #0b0d10)",
      }}
      aria-label="Creator’s Forge — Splash"
    >
      {/* Local styles for keyframes and frame aesthetics */}
      <style>{`
        .frame{position:relative; width:min(1200px,92vw); aspect-ratio:16/9; border-radius:24px; overflow:hidden; box-shadow:0 20px 60px #0008, inset 0 0 0 1px #ffffff10; background:linear-gradient(180deg, #0d1015, #0a0d12 60%, #07090c);} 
        .brand{position:absolute; left:24px; top:20px; letter-spacing:.06em; text-transform:uppercase; font-weight:700; font-size:clamp(18px,2.2vw,28px); display:flex; gap:.6ch; align-items:center}
        .brand-dot{width:.6em; height:.6em; border-radius:999px; background:radial-gradient(circle at 30% 30%, #fff, #ffd7a8 30%, #ff6a00 60%, #5c1d00 100%); filter:drop-shadow(0 0 6px #ff6a00aa)}
        .tagline{position:absolute; left:24px; top:56px; opacity:.8; font-size:clamp(12px,1.3vw,14px)}
        .legend{position:absolute; right:18px; top:18px; display:flex; gap:8px; align-items:center; background:#0f141b; border:1px solid #ffffff1a; border-radius:999px; padding:8px 10px; font-size:12px}
        .kbd{border:1px solid #ffffff26; padding:2px 6px; border-radius:6px; background:#121821}
        .hint{position:absolute; left:0; right:0; bottom:14px; text-align:center; font-size:12px; color:#c5cdd6b0}
        .embers{position:absolute; inset:0; pointer-events:none; mix-blend-mode:screen}
        @keyframes floatUp{from{transform:translateY(10px) scale(1)} to{transform:translateY(-60px) scale(.8); opacity:0}}
      `}</style>

      <div className="frame" role="application" aria-describedby="hint">
        <div className="brand" aria-label="App Name">
          <span className="brand-dot" aria-hidden="true" />
          Creator’s Forge
        </div>
        <div className="tagline">Welcome. Choose your tool to begin.</div>
        <div className="legend" aria-hidden>
          <span className="kbd">Tab</span> to focus • <span className="kbd">Enter</span> to open
        </div>

        {/* Scene: drawn as SVG for crisp, scalable hotspots */}
        <svg
          viewBox="0 0 1600 900"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Forge scene with interactive tools"
        >
          <defs>
            <linearGradient id="coalG" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#1b2027" />
              <stop offset="1" stopColor="#0e1217" />
            </linearGradient>
            <radialGradient id="fireG" cx="50%" cy="60%" r="65%">
              <stop offset="0" stopColor="#ffe6b8" />
              <stop offset="0.45" stopColor="#ff8a1a" />
              <stop offset="0.85" stopColor="#6b1f00" />
              <stop offset="1" stopColor="#000" />
            </radialGradient>
            <linearGradient id="steelG" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#c7d0d9" />
              <stop offset="1" stopColor="#7f8891" />
            </linearGradient>
            <linearGradient id="waterG" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#66c9ff" />
              <stop offset="1" stopColor="#1d5f9a" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="10" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background */}
          <rect x="0" y="0" width="1600" height="900" fill="url(#coalG)" />
          <rect x="0" y="620" width="1600" height="280" fill="#0a0d11" />
          <rect x="0" y="620" width="1600" height="8" fill="#0f141b" />

          {/* FORGE */}
          <g id="forge" tabIndex={0}>
            <g>
              <rect x="170" y="260" width="360" height="260" rx="14" fill="#1a1f27" stroke="#2a323d" strokeWidth={6} />
              <rect x="190" y="280" width="320" height="220" rx="12" fill="#0d1117" stroke="#252c36" strokeWidth={4} />
            </g>
            <ellipse cx="350" cy="470" rx="130" ry="60" fill="#000" opacity="0.7" />
            <ellipse cx="350" cy="450" rx="140" ry="70" fill="url(#fireG)" filter="url(#glow)" />
            <rect x="90" y="430" width="120" height="22" rx="10" fill="#262d36" stroke="#373f49" />
            <circle cx="210" cy="441" r="11" fill="#373f49" />

            {/* BAR STOCK (clickable) */}
            <g id="stock" tabIndex={0}>
              <Link to="/tools/stock" aria-label="Open Bar Stock (materials)">
                <rect x="320" y="410" width="110" height="16" rx="8" fill="url(#steelG)" />
                <rect x="420" y="418" width="20" height="10" fill="#5a2a12" />
              </Link>
              <g transform="translate(300,388)">
                <rect width="160" height="26" rx="6" fill="#12171f" stroke="#2a323d" />
                <Link to="/tools/stock" aria-label="Open Bar Stock (materials)">
                  <text x="80" y="18" fill="#e9f1f9" fontSize={14} fontWeight={700} textAnchor="middle">
                    BAR STOCK
                  </text>
                </Link>
              </g>
              <Link to="/tools/stock" aria-label="Open Bar Stock (materials)">
                <rect x="315" y="400" width="130" height="50" fill="transparent" />
              </Link>
            </g>

            {/* Label plate */}
            <g transform="translate(250,520)">
              <rect width="200" height="36" rx="6" fill="#12171f" stroke="#2a323d" />
              <Link to="/tools/forge" aria-label="Open Forge (core services)">
                <text x="100" y="24" fill="#ffd7a8" fontWeight={700} fontSize={20} textAnchor="middle">
                  FORGE
                </text>
              </Link>
            </g>
            <Link to="/tools/forge" aria-label="Open Forge (core services)">
              <rect x="170" y="260" width="360" height="260" fill="transparent" />
            </Link>
          </g>

          {/* ANVIL */}
          <g id="anvil" transform="translate(670,420)" tabIndex={0}>
            <rect x="70" y="120" width="160" height="70" rx="6" fill="#222832" stroke="#36404c" />
            <path d="M0,120 h370 c-50,-40 -90,-60 -160,-62 l-40,-2 c-20,-30 -50,-46 -95,-46 h-35 c-22,0 -40,18 -40,40 v10 c0,34 -20,60 -65,60 z" fill="url(#steelG)" stroke="#586571" strokeWidth={4} />
            <path d="M250,60 c60,4 100,24 120,60 h-120 z" fill="#dbe4ec33" />
            <g transform="translate(90,206)">
              <rect width="160" height="32" rx="6" fill="#12171f" stroke="#2a323d" />
              <Link to="/tools/anvil" aria-label="Open Anvil (build & compile)">
                <text x="80" y="22" fill="#e9f1f9" fontSize={18} fontWeight={700} textAnchor="middle">
                  ANVIL
                </text>
              </Link>
            </g>
            <Link to="/tools/anvil" aria-label="Open Anvil (build & compile)">
              <rect x="-10" y="-10" width="420" height="250" fill="transparent" />
            </Link>
          </g>

          {/* HAMMER */}
          <g id="hammer" transform="translate(840,310) rotate(-20)" tabIndex={0}>
            <rect x="-8" y="0" width="26" height="180" rx="10" fill="#7d5325" stroke="#9c6a34" />
            <rect x="-20" y="-40" width="50" height="52" rx="8" fill="#7f8993" stroke="#5f6870" />
            <Link to="/tools/hammer" aria-label="Open Hammer (actions & tasks)">
              <rect x="-30" y="-50" width="70" height="240" fill="transparent" />
            </Link>
            <g transform="translate(-38,200) rotate(20)">
              <rect width="120" height="28" rx="6" fill="#12171f" stroke="#2a323d" />
              <Link to="/tools/hammer" aria-label="Open Hammer (actions & tasks)">
                <text x="60" y="20" fill="#e9f1f9" fontSize={16} fontWeight={700} textAnchor="middle">
                  HAMMER
                </text>
              </Link>
            </g>
          </g>

          {/* TONGS */}
          <g id="tongs" transform="translate(1010,560)" tabIndex={0}>
            <rect x="-60" y="40" width="470" height="26" rx="6" fill="#232a34" stroke="#303946" />
            <rect x="-40" y="66" width="10" height="40" fill="#232a34" />
            <rect x="380" y="66" width="10" height="40" fill="#232a34" />
            <path d="M40,20 c0,-20 30,-20 30,0 v34 l40,28 c10,6 12,18 6,28 c-6,10 -18,12 -28,6 l-48,-32 l-48,32 c-10,6 -22,4 -28,-6 c-6,-10 -4,-22 6,-28 l40,-28 v-34 c0,-20 30,-20 30,0 v26 z" fill="#8d97a1" stroke="#6a727a" strokeWidth={3} />
            <Link to="/tools/tongs" aria-label="Open Tongs (source of truth & APIs)">
              <rect x="-10" y="-10" width="220" height="120" fill="transparent" />
            </Link>
            <g transform="translate(0,110)">
              <rect width="160" height="28" rx="6" fill="#12171f" stroke="#2a323d" />
              <Link to="/tools/tongs" aria-label="Open Tongs (source of truth & APIs)">
                <text x="80" y="20" fill="#e9f1f9" fontSize={16} fontWeight={700} textAnchor="middle">
                  TONGS
                </text>
              </Link>
            </g>
          </g>

          {/* QUENCH */}
          <g id="quench" transform="translate(1260,420)" tabIndex={0}>
            <ellipse cx="80" cy="40" rx="80" ry="22" fill="#2a3340" stroke="#3a4655" />
            <rect x="0" y="40" width="160" height="120" rx="8" fill="#202833" stroke="#3a4655" />
            <ellipse cx="80" cy="160" rx="80" ry="22" fill="#1a222c" stroke="#3a4655" />
            <ellipse cx="80" cy="48" rx="74" ry="16" fill="url(#waterG)" />
            <g transform="translate(0,176)">
              <rect width="160" height="28" rx="6" fill="#12171f" stroke="#2a323d" />
              <Link to="/tools/quench" aria-label="Open Quench (test & stabilize)">
                <text x="80" y="20" fill="#e9f1f9" fontSize={16} fontWeight={700} textAnchor="middle">
                  QUENCH
                </text>
              </Link>
            </g>
            <Link to="/tools/quench" aria-label="Open Quench (test & stabilize)">
              <rect x="-10" y="0" width="180" height="210" fill="transparent" />
            </Link>
          </g>

          {/* LEDGER */}
          <g id="ledger" transform="translate(1120,560)" tabIndex={0}>
            <g transform="translate(210,-44)">
              <path d="M0,0 h160 a14,14 0 0 1 14,14 v88 a14,14 0 0 1 -14,14 h-160 z" fill="#c79c5d" stroke="#6e4e24" strokeWidth={4} />
              <rect x="12" y="10" width="16" height="96" rx="6" fill="#e6c48e" />
              <rect x="140" y="10" width="8" height="96" rx="4" fill="#a77a35" />
              <text x="80" y="64" fill="#2b1b08" fontWeight={700} fontSize={20} textAnchor="middle">
                LEDGER
              </text>
              <Link to="/tools/ledger" aria-label="Open Ledger (docs & analytics)">
                <rect x="-6" y="-6" width="188" height="124" fill="transparent" />
              </Link>
            </g>
          </g>

          {/* Fire light */}
          <ellipse cx="350" cy="540" rx="260" ry="120" fill="#ff8a1a10" />
        </svg>

        {/* Ember layer */}
        <div className="embers" aria-hidden ref={embersRef} />

        <div id="hint" className="hint">
          Tip: Edit the <code>to</code> props on each <code>&lt;Link&gt;</code> to wire routes.
        </div>
      </div>
    </div>
  );
}

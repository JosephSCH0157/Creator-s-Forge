import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SplashWithEmbers from "./SplashWithEmbers";
import CFWordmark from "../components/CFWordmark";
import "./splash.css";

type Spot = {
  to: string;
  top: number;   // 0–100 (%)
  left: number;  // 0–100 (%)
  label: string; // forge term
  hover: string; // real tool name
  icon?: string; // optional emoji/icon
};

const SPOTS: Spot[] = [
  { to: "/forge",        top: 55, left: 70, label: "Forge",     hover: "Home",           icon: "🔥" },
  { to: "/tools/anvil",  top: 80, left: 50, label: "Anvil",     hover: "Teleprompter",   icon: "⚒️" },
  { to: "/tools/tongs",  top: 45, left: 25, label: "Tongs",     hover: "File System",    icon: "🗄️" },
  { to: "/tools/hammer", top: 15, left: 35, label: "Hammer",    hover: "Video Editor",   icon: "🔨" },
  { to: "/tools/quench", top: 70, left: 80, label: "Quench",    hover: "Uploader",       icon: "💧" },
  { to: "/tools/ledger", top: 80, left: 65, label: "Ledger",    hover: "Analytics",      icon: "📒" },
  { to: "/tools/stock",  top: 85, left: 30, label: "Bar Stock", hover: "Ideas",          icon: "🧱" },
];

function Hotspot({ s }: { s: Spot }) {
  return (
    <Link
      to={s.to}
      className="hotspot-btn"
      style={{ top: `${s.top}%`, left: `${s.left}%` }}
      aria-label={s.hover}
    >
      <span className="hotspot-icon" aria-hidden="true">{s.icon ?? "●"}</span>
      <span className="hotspot-label">{s.label}</span>
      <span className="hotspot-tooltip">{s.hover}</span>
    </Link>
  );
}

export default function SplashRoute() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [showGrid, setShowGrid] = useState(false);

  // placement helper: press 'g' to toggle grid; press 'p' to enable pick mode, then click to log % coords
  useEffect(() => {
    let pickMode = false;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "g") setShowGrid(v => !v);
      if (e.key.toLowerCase() === "p") {
        pickMode = !pickMode;
        console.log(pickMode ? "Pick mode ON: click anywhere on the splash" : "Pick mode OFF");
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!pickMode || !wrapRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      console.log(`{ top: ${y.toFixed(1)}, left: ${x.toFixed(1)} }`);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div ref={wrapRef} className="splash-wrap">
      <SplashWithEmbers
        src="/forge.png"
        hearth={{ x: 1010, y: 525, w: 215, h: 120 }}
        spawnRate={100}
        maxEmbers={600}
        debug={false}
        debugKey="d"
        className="bg"
      />

     <CFWordmark className="absolute left-4 top-4 z-10" />


      {SPOTS.map((s) => <Hotspot key={`${s.left}-${s.top}-${s.to}`} s={s} />)}

      {showGrid && <div className="splash-grid" aria-hidden="true" />}
    </div>
  );
}

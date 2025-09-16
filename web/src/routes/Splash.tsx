import { PATHS } from '@/routes/paths';

const SPOTS = [
  { to: PATHS.forge,  top: 55, left: 70, label: 'Forge',  hover: 'Home' },
  { to: PATHS.anvil,  top: 80, left: 50, label: 'Anvil',  hover: 'Teleprompter' },
  // ...
];
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
      className="hotspot"
      style={{ top: `${s.top}%`, left: `${s.left}%` }}
      aria-label={s.hover}
      data-hover={s.hover}   // <-- required for ::after hover label
    >
      {s.label}
    </Link>
  );
}

export default function SplashRoute() {
  return (
    <div className="splash-root">   {/* use splash-root, not splash-wrap */}
      <div className="splash-stage">
        <SplashWithEmbers
          src="/forge.png"
          hearth={{ x: 1010, y: 525, w: 215, h: 120 }}
          spawnRate={100}
          maxEmbers={600}
        />
      </div>

  <CFWordmark className="splash-wordmark brand-glow" />

      {SPOTS.map((s) => (
        <Hotspot key={`${s.left}-${s.top}-${s.to}`} s={s} />
      ))}
    </div>
  );
}

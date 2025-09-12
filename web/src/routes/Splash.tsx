// src/routes/splash.tsx
import React from "react";
import { Link } from "react-router-dom";
import SplashWithEmbers from "./SplashWithEmbers";
import "./Splash.css";

type HotspotProps = {
  to: string;
  top: number;   // percentage 0–100
  left: number;  // percentage 0–100
  label: string; // forge-term (default text)
  hover: string; // real tool name on hover
};

const Hotspot: React.FC<HotspotProps> = ({ to, top, left, label, hover }) => (
  <Link
    to={to}
    className="hotspot absolute"
    data-hover={hover}
    aria-label={hover}
    style={{ top: `${top}%`, left: `${left}%` }}
  >
    {label}
  </Link>
);

export default function SplashRoute() {
  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* Full-screen background (forge image + embers).
         - Uses /public/forge.png. Change if your file lives elsewhere. */}
      <SplashWithEmbers
        src="/forge.png"
        hearth={{ x: 1010, y: 525, w: 215, h: 120 }}
        spawnRate={100}
        maxEmbers={600}
        debug={false}          // set true to start with overlay
        debugKey="d"           // press D to toggle
        className="absolute inset-0 z-0 pointer-events-none"
      />
{/* Brand bar */}
<a
  href="/"
  className="absolute left-4 top-4 flex items-center gap-3 text-white no-underline"
  style={{ textShadow: "0 1px 6px rgba(0,0,0,.45)" }}
  aria-label="Creator’s Forge – Home"
>
  <img
    src="/creators-forge-logo.png"
    alt="Creator’s Forge"
    style={{ width: 40, height: 40, objectFit: "contain" }}
    draggable={false}
  />
  <div style={{ lineHeight: 1 }}>
    <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 0.4 }}>Creator’s Forge</div>
    <div style={{ fontSize: 12, opacity: 0.85 }}>make, refine, publish</div>
  </div>
</a>

      {/* Hotspots — default label = forge term; hover shows real tool name */}
      <Hotspot to="/tools/forge"  top={55} left={70} label="Forge"     hover="Script Editor" />
      <Hotspot to="/tools/anvil"  top={80} left={50} label="Anvil"     hover="Teleprompter" />
      <Hotspot to="/tools/hammer" top={15} left={35} label="Hammer"    hover="Video Editor" />
      <Hotspot to="/tools/tongs"  top={45} left={25} label="Tongs"     hover="File System" />
      <Hotspot to="/tools/quench" top={70} left={80} label="Quench"    hover="Uploader" />
      <Hotspot to="/tools/ledger" top={80} left={65} label="Ledger"    hover="Analytics" />
      <Hotspot to="/tools/stock"  top={85} left={30} label="Bar Stock" hover="Ideas" />
    </div>
  );
}

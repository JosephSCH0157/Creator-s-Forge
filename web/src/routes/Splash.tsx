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
        hearth={{ x: 520, y: 520, w: 220, h: 120 }}
        spawnRate={140}
        maxEmbers={600}
        debug={false}          // set true to start with overlay
        debugKey="d"           // press D to toggle
        className="absolute inset-0 z-0 pointer-events-none"
      />

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

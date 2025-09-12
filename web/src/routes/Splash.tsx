import React from "react";
import { Link } from "react-router-dom";
import "./Splash.css";

type HotspotProps = {
  to: string;
  top: number;   // percent (0–100)
  left: number;  // percent (0–100)
  label: string; // default text (forge term)
  hover: string; // real tool name on hover
};

const Hotspot: React.FC<HotspotProps> = ({ to, top, left, label, hover }) => (
  <Link
    to={to}
    className="hotspot"
    data-hover={hover}
    aria-label={hover}
    style={{ top: `${top}%`, left: `${left}%` }}
  >
    {label}
  </Link>
);

export default function Splash() {
  return (
    <div className="splash-root">
      <div className="splash-stage">
        <img
          src="/forge.png"
          alt="Creator’s Forge"
          className="splash-image"
          draggable={false}
        />

        {/* Hotspots (forge term by default → real name on hover) */}
        <Hotspot to="/tools/forge"  top={55} left={70} label="Forge"     hover="Script Editor" />
        <Hotspot to="/tools/anvil"  top={80} left={50} label="Anvil"     hover="Teleprompter" />
        <Hotspot to="/tools/hammer" top={15} left={35} label="Hammer"    hover="Video Editor" />
        <Hotspot to="/tools/tongs"  top={45} left={25} label="Tongs"     hover="File System" />
        <Hotspot to="/tools/quench" top={70} left={80} label="Quench"    hover="Uploader" />
        <Hotspot to="/tools/ledger" top={80} left={65} label="Ledger"    hover="Analytics" />
        <Hotspot to="/tools/stock"  top={85} left={30} label="Bar Stock" hover="Ideas" />
      </div>

      {/* Optional quick links under the image */}
      <div className="splash-links">
        <Link to="/tools/anvil">Teleprompter (Anvil)</Link>
        <Link to="/tools/tongs">File System (Tongs)</Link>
      </div>
    </div>
  );
}

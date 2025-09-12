// /src/routes/Splash.jsx
import { Link } from "react-router-dom";
import "./Splash.css";

export default function Splash() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#111",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100vw",
          maxWidth: "100vw",
          aspectRatio: "16/9",
          height: "auto",
          maxHeight: "100vh",
        }}
      >
        <img
          src="/forge.png"
          alt="Creator’s Forge"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            aspectRatio: "16/9",
            objectFit: "contain",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />

        {/* Hotspots: default label = forge term, hover label = real tool name */}
        <Link
          to="/tools/forge"
          className="hotspot"
          data-hover="Dashboard"
          aria-label="Dashboard"
          style={{ top: "55%", left: "70%" }}
        >
          Forge
        </Link>

        <Link
          to="/tools/anvil"
          className="hotspot"
          data-hover="Teleprompter"
          aria-label="Teleprompter"
          style={{ top: "70%", left: "40%" }}
        >
          Anvil
        </Link>

        <Link
          to="/tools/hammer"
          className="hotspot"
          data-hover="Editor"
          aria-label="Editor"
          style={{ top: "15%", left: "35%" }}
        >
          Hammer
        </Link>

        <Link
          to="/tools/tongs"
          className="hotspot"
          data-hover="File System"
          aria-label="File System"
          style={{ top: "50%", left: "10%" }}
        >
          Tongs
        </Link>

        <Link
          to="/tools/quench"
          className="hotspot"
          data-hover="Exporter"
          aria-label="Exporter"
          style={{ top: "70%", left: "80%" }}
        >
          Quench
        </Link>

        <Link
          to="/tools/ledger"
          className="hotspot"
          data-hover="Notes"
          aria-label="Notes"
          style={{ top: "80%", left: "65%" }}
        >
          Ledger
        </Link>

        <Link
          to="/tools/stock"
          className="hotspot"
          data-hover="Assets"
          aria-label="Assets"
          style={{ top: "85%", left: "20%" }}
        >
          Bar Stock
        </Link>
      </div>

      {/* Optional quick-links row under the image */}
      <div style={{ marginTop: 24, display: "flex", gap: 24, justifyContent: "center" }}>
        <Link to="/tools/anvil">Teleprompter (Anvil)</Link>
        <Link to="/tools/tongs">File System (Tongs)</Link>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import "./Splash.css"; // optional external CSS


export default function Splash() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
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
          alt="Forge"
          style={{
            width: "100%",
            height: "auto",
            flexDirection: "column",   
            display: "block",
            aspectRatio: "16/9",
            objectFit: "contain",
          }}
        />

        {/* Hotspots */}
        <Link
          to="/tools/forge"
          className="hotspot"
           data-hover="Script Editor"  
          style={{ position: "absolute", top: "55%", left: "70%" }}
        >
          Forge
        </Link>
        <Link
          to="/tools/anvil"
          className="hotspot"
          data-hover="Teleprompter"  
          style={{ position: "absolute", top: "70%", left: "40%" }}
        >
          Anvil
        </Link>
        <Link
          to="/tools/hammer"
          className="hotspot"
          style={{ position: "absolute", top: "15%", left: "35%" }}
        >
          Hammer
        </Link>
        <Link
          to="/tools/tongs"
          className="hotspot"
          data-hover="File System"  
          style={{ position: "absolute", top: "50%", left: "10%" }}
        >
          Tongs
        </Link>
        <Link
          to="/tools/quench"
          className="hotspot"
          data-hover="Editing"  
          style={{ position: "absolute", top: "70%", left: "80%" }}
        >
          Quench
        </Link>
        <Link
          to="/tools/ledger"
          className="hotspot"
          data-hover="Analytics"
          style={{ position: "absolute", top: "80%", left: "65%" }}
        >
          Ledger
        </Link>
        <Link
          to="/tools/stock"
          className="hotspot"
          data-hover="Raw Ideas"  
          style={{ position: "absolute", top: "85%", left: "20%" }}
        >
            Marketplace
        </Link>
        <Link
          to="/tools/market"
          className="hotspot"
          data-hover="Uploader"  
          style={{ position: "absolute", top: "95%", left: "30%" }}
        >
        
          Bar Stock
        </Link>
      </div>
      <div style={{ marginTop: 32, display: 'flex', gap: 24, justifyContent: 'center' }}>
        <Link to="/tools/anvil">Teleprompter (Anvil)</Link>
        <Link to="/tools/tongs">Tongs</Link>
      </div>
    </div>
  );
}

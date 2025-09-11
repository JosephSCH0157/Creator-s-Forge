import { Link } from "react-router-dom";
import "./Splash.css"; // optional external CSS

export default function Splash() {
  return (
    <div className="splash-container">
      <img src="/src/assets/forge.png" alt="Forge" className="splash-bg" />

      {/* Hotspots */}
      <Link to="/tools/forge" className="hotspot" style={{ top: "55%", left: "70%" }}>
        Forge
      </Link>
      <Link to="/tools/anvil" className="hotspot" style={{ top: "70%", left: "40%" }}>
        Anvil
      </Link>
      <Link to="/tools/hammer" className="hotspot" style={{ top: "15%", left: "35%" }}>
        Hammer
      </Link>
      <Link to="/tools/tongs" className="hotspot" style={{ top: "50%", left: "10%" }}>
        Tongs
      </Link>
      <Link to="/tools/quench" className="hotspot" style={{ top: "70%", left: "75%" }}>
        Quench
      </Link>
      <Link to="/tools/ledger" className="hotspot" style={{ top: "80%", left: "65%" }}>
        Ledger
      </Link>
      <Link to="/tools/stock" className="hotspot" style={{ top: "65%", left: "30%" }}>
        Bar Stock
      </Link>

      <div className="brand">Creator’s Forge</div>
    </div>
  );
}

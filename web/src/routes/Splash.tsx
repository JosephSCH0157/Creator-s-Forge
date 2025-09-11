import { Link } from "react-router-dom";
import forgeImg from "../assets/forge.png";
import "./Splash.css"; // optional external CSS


export default function Splash() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh", // take full viewport height
        overflow: "hidden",
      }}
    >
      <img
        src={forgeImg}
        alt="Forge"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",   // fit inside window without cropping
          display: "block",
        }}
      />

      {/* Hotspots */}
      <Link
        to="/tools/forge"
        className="hotspot"
        style={{ top: "55%", left: "70%" }}
      >
        Forge
      </Link>
      <Link
        to="/tools/anvil"
        className="hotspot"
        style={{ top: "70%", left: "40%" }}
      >
        Anvil
      </Link>
      <Link
        to="/tools/hammer"
        className="hotspot"
        style={{ top: "15%", left: "35%" }}
      >
        Hammer
      </Link>
      <Link
        to="/tools/tongs"
        className="hotspot"
        style={{ top: "50%", left: "10%" }}
      >
        Tongs
      </Link>
      <Link
        to="/tools/quench"
        className="hotspot"
        style={{ top: "70%", left: "80%" }}
      >
        Quench
      </Link>
      <Link
        to="/tools/ledger"
        className="hotspot"
        style={{ top: "80%", left: "65%" }}
      >
        Ledger
      </Link>
      <Link
        to="/tools/stock"
        className="hotspot"
        style={{ top: "85%", left: "20%" }}
      >
        Bar Stock
      </Link>
    </div>
  );
}

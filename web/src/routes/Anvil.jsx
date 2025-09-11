import { Link } from "react-router-dom";

export default function Anvil() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div
        style={{
          height: 48,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 16px",
          background: "#111827",
          color: "white",
          borderBottom: "1px solid #333",
        }}
      >
        <img
          src="/anvil.png"
          alt="Anvil"
          style={{ height: 24, width: 24, objectFit: "contain" }}
        />
        <Link
          to="/"
          style={{ color: "white", textDecoration: "none", fontWeight: 600 }}
        >
          Back to Creator’s Forge
        </Link>
      </div>

      {/* Iframe */}
      <iframe
        src="/teleprompter_pro.html"
        title="Teleprompter Pro"
        style={{ flex: 1, border: "none", width: "100%" }}
        allow="clipboard-read; clipboard-write; fullscreen"
        allowFullScreen
      />
    </div>
  );
}

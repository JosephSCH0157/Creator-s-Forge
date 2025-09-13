import { Link } from "react-router-dom";

export default function Tongs() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Top bar — Back to Forge */}
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
          flexShrink: 0,
        }}
      >
        <img
          src="/tongs.png"
          alt="Tongs"
          style={{ height: 24, width: 24, objectFit: "contain" }}
        />
        <Link to="/" style={{ color: "white", textDecoration: "none", fontWeight: 600 }}>
          Back to Podcaster’s Forge
        </Link>
      </div>

      {/* Page body */}
      <main style={{ flex: 1, minHeight: 0, padding: 16 }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Tongs</h1>
        <p style={{ color: "#96a0aa", marginTop: 8 }}>
          Script manager is live. (We can flesh this out next.)
        </p>
      </main>
    </div>
  );
}

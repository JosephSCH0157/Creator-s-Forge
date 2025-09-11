import { Link } from "react-router-dom";

export default function Anvil() {
  // Respect Vite's base (works in dev and prod)
  const teleprompterUrl = `${import.meta.env.BASE_URL}teleprompter_pro.html?embed=1`;

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
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
          flexShrink: 0,
        }}
      >
        <img
          src={`${import.meta.env.BASE_URL}anvil.png`}
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
        id="teleprompterFrame"
        src={teleprompterUrl}
        title="Teleprompter Pro"
        style={{
          width: "100%",
          height: "calc(100dvh - 48px)", // reliable viewport height
          border: "none",
          display: "block",
        }}
        allow="clipboard-read; clipboard-write; display-capture; microphone; camera"
        referrerPolicy="no-referrer"
        // No sandbox — it breaks storage/clipboard; add only if required.
        loading="eager"
      />
    </div>
  );
}

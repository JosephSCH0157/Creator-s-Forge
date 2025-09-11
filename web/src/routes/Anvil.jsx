// web/src/routes/Anvil.jsx (or .tsx)
export default function Anvil() {
  return (
    <div style={{ height: "100vh", display: "grid", gridTemplateRows: "auto 1fr" }}>
      <div style={{ padding: 8, borderBottom: "1px solid #eee" }}>
        <a href="/teleprompter_pro.html" target="_blank" rel="noopener noreferrer">
          Open Teleprompter Pro in a new tab
        </a>
      </div>
      <iframe
        src="/teleprompter_pro.html"
        title="Teleprompter Pro"
        style={{ width: "100%", height: "100%", border: "none" }}
        allow="clipboard-read; clipboard-write; fullscreen"
        allowFullScreen
      />
    </div>
  );
}

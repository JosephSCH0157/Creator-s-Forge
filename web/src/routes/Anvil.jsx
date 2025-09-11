export default function Anvil() {
  return (
    <iframe
      src="/teleprompter_pro.html"
      title="Teleprompter Pro"
      style={{
        position: "fixed",
        inset: 0,           // top:0 right:0 bottom:0 left:0
        width: "100vw",
        height: "100vh",
        border: "none",
        display: "block",
      }}
      allow="clipboard-read; clipboard-write; fullscreen"
      allowFullScreen
    />
  );
}

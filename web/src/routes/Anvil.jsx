export default function Anvil() {
  return (
    <div>
      <header>
        <button onClick={() => navigate('/forge')}>Return to Forge</button>
      </header>
      <iframe
        src="/teleprompter_pro_fixed_v1_5_4c.html"
        title="Teleprompter Pro"
        style={{ width: '100%', height: '100vh', border: 0 }}
        allow="clipboard-read; clipboard-write; fullscreen"
        allowFullScreen
      />
    </div>
  );
}


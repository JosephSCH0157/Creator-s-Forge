import { useNavigate } from 'react-router-dom';
export default function Stock() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: 24 }}>
      <header>
        <button onClick={() => navigate('/forge')}>Return to Forge</button>
      </header>
      <h1>Stock</h1>
      <p>This is the Stock module — coming soon.</p>
    </div>
  );
}

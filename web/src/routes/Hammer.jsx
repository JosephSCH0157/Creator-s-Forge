import { useNavigate } from 'react-router-dom';
export default function Hammer() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: 24 }}>
      <header>
        <button onClick={() => navigate('/forge')}>Return to Forge</button>
      </header>
      <h1>Hammer</h1>
      <p>This is the Hammer module — coming soon.</p>
    </div>
  );
}

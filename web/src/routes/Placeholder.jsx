import { useNavigate } from 'react-router-dom';
export default function Placeholder({ name }) {
  const navigate = useNavigate();
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <header>
        <button onClick={() => navigate('/forge')}>Return to Forge</button>
      </header>
      <h1>{name}</h1>
      <p>This is the {name} module — coming soon.</p>
    </div>
  );
}

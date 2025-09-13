import { useNavigate } from 'react-router-dom';
export default function Ledger() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: 24 }}>
      <header>
        <button onClick={() => navigate('/forge')}>Return to Forge</button>
      </header>
      <h1>Ledger</h1>
    </div>
  );
}

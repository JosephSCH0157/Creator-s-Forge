import { useForgeBus } from "../forgeBus";
import { useNavigate } from 'react-router-dom';

export default function Forge() {
  useForgeBus();
  const navigate = useNavigate();
  return (
    <div style={{ padding: 24 }}>
      <header>
        <button onClick={() => navigate('/forge')}>Return to Forge</button>
      </header>
      <h1>Forge</h1>
      <p>This is the Forge module — coming soon.</p>
    </div>
  );
}

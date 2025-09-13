import { useNavigate } from 'react-router-dom';
import type { Project } from "../tongs/types";
import { createTongsBus } from "../lib/tongs-bus";

export default function Quench() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: 24 }}>
      <header>
        <button onClick={() => navigate('/forge')}>Return to Forge</button>
      </header>
      <h1>Quench</h1>
      <p>This is the Quench module — coming soon.</p>
    </div>
  );
}

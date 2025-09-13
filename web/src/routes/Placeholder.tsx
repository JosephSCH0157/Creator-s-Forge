import { useNavigate } from 'react-router-dom';
import type { Project } from "../tongs/types";
import { createTongsBus } from "../lib/tongs-bus";

interface PlaceholderProps {
  name: string;
}

export default function Placeholder({ name }: PlaceholderProps) {
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

import ReturnHome from "../components/ReturnHome";
import type { Project } from "../tongs/types";
import { createTongsBus } from "../lib/tongs-bus";

interface PlaceholderProps {
  name: string;
}

export default function Placeholder({ name }: PlaceholderProps) {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>{name}</h1>
      <ReturnHome />
      <p>This is the {name} module — coming soon.</p>
    </div>
  );
}

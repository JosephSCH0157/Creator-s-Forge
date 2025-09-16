import ReturnHome from "../components/ReturnHome";
import { PATHS } from "@/routes/paths";
import type { Project } from "../tongs/types";
import { createTongsBus } from "../lib/tongs-bus";

interface PlaceholderProps {
  name: string;
}

export default function Placeholder({ name }: PlaceholderProps) {
  return (
  <div className="placeholder-container">
      <h1>{name}</h1>
      <ReturnHome />
      <p>This is the {name} module — coming soon.</p>
    </div>
  );
}

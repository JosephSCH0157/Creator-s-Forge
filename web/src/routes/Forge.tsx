import ReturnHome from "@/components/ReturnHome";
import type { Project } from "../tongs/types";
import { createTongsBus } from "../lib/tongs-bus";

export default function Forge() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Forge</h1>
      <ReturnHome />
      <p>This is the Forge module — coming soon.</p>
    </div>
  );
}

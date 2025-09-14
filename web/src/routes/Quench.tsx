import ReturnHome from "../components/ReturnHome";
import type { Project } from "../tongs/types";
import { createTongsBus } from "../lib/tongs-bus";

export default function Quench() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Quench</h1>
      <ReturnHome />
      <p>This is the Quench module — coming soon.</p>
    </div>
  );
}

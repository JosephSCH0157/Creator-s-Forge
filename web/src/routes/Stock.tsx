import ReturnHome from "@/components/ReturnHome";
import type { Project } from "../tongs/types";
import { createTongsBus } from "../lib/tongs-bus";

export default function Stock() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Stock</h1>
      <ReturnHome />
      <p>This is the Stock module — coming soon.</p>
    </div>
  );
}

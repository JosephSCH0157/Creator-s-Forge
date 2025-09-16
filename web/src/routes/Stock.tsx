import ReturnHome from "../components/ReturnHome";
import type { Project } from "../tongs/types";
import { createTongsBus } from "../lib/tongs-bus";
import { PATHS } from "@/routes/paths";

export default function Stock() {
  return (
    <div className="stock-container">
      <h1>Stock</h1>
      <ReturnHome />
      <p>This is the Stock module — coming soon.</p>
    </div>
  );
}

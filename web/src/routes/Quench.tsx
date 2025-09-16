import ReturnHome from "../components/ReturnHome";
import { PATHS } from "@/routes/paths";
import type { Project } from "../tongs/types";
import { createTongsBus } from "../lib/tongs-bus";

export default function Quench() {
  return (
  <div className="quench-container">
      <h1>Quench</h1>
      <ReturnHome />
      <p>This is the Quench module — coming soon.</p>
    </div>
  );
}

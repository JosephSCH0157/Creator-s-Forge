import ReturnHome from "@/components/ReturnHome";
import type { Project } from "../tongs/types";
import { createTongsBus } from "../lib/tongs-bus";

export default function Anvil() {
  return (
    <div>
      <h1>Anvil (Teleprompter)</h1>
      <ReturnHome />
      <iframe
        src="/teleprompter_pro_fixed_v1_5_4c.html"
        title="Teleprompter Pro"
        style={{ width: '100%', height: '100vh', border: 0 }}
        allow="clipboard-read; clipboard-write; fullscreen"
        allowFullScreen
      />
    </div>
  );
}

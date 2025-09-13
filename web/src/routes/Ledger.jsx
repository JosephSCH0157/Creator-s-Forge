
import { useNavigate } from 'react-router-dom';
import { createTongsBus } from "@/lib/tongs-bus";
import { useState } from "react";

export default function Ledger() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [projectId, setProjectId] = useState("");

  async function handleCreate() {
    setCreating(true);
    setError("");
    try {
      const bus = createTongsBus();
      const rsp = await bus.request({ type: "PROJECT.CREATE", title: "Ledger Project" });
      bus.close();
      if (!rsp.ok) throw new Error(rsp.error);
      setProjectId(rsp.data.projectId);
    } catch (e) {
      setError(e.message || "Unknown error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <header>
        <button onClick={() => navigate('/forge')}>Return to Forge</button>
      </header>
      <h1>Ledger</h1>
      <button onClick={handleCreate} disabled={creating}>
        {creating ? "Creating..." : "Create Ledger Project"}
      </button>
      {projectId && <div>Created Project ID: {projectId}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

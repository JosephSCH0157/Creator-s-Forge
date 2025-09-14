
import ReturnHome from "@/components/ReturnHome";
import type { ProjectResponse } from "@/tongs/types";
import axios from "axios";
import { useState } from "react";

export default function Hammer() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [projectId, setProjectId] = useState("");

  async function handleCreate() {
    setCreating(true);
    setError("");
    try {
      const rsp = await axios.post<ProjectResponse>("/api/projects", { title: "Hammer Project" });
      setProjectId(rsp.data.projectId);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Hammer</h1>
      <ReturnHome />
      <button onClick={handleCreate} disabled={creating}>
        {creating ? "Creating..." : "Create Hammer Project"}
      </button>
      {projectId && <div>Created Project ID: {projectId}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

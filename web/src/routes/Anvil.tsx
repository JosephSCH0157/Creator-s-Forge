import ReturnHome from "../components/ReturnHome";
import type { Project, ProjectResponse, ApiRsp } from "../tongs/types";
import { api } from "../lib/api";
import { useEffect, useState } from "react";

export default function Anvil() {
  const [projectId, setProjectId] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Example: create a project on mount
  useEffect(() => {
    async function createProject() {
      try {
  const { data: rsp } = await api.post<ApiRsp<ProjectResponse>>("/projects", { title: "Teleprompter Project" });
  if (!rsp.ok) throw new Error(rsp.error);
  setProjectId(rsp.data.projectId);
      } catch (e: any) {
        setError(e.message || "Unknown error");
      }
    }
    createProject();
  }, []);

  return (
    <div>
      <h1>Anvil (Teleprompter)</h1>
      <ReturnHome />
      {projectId && <div>Created Project ID: {projectId}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
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

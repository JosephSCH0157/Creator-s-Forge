import ReturnHome from "../components/ReturnHome";
import type { ProjectResponse, ApiRsp } from "../tongs/types";
import { api } from "../lib/api";
import { useEffect, useState } from "react";

export default function Anvil() {
  const [projectId, setProjectId] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function createProject() {
      try {
        const { data: rsp } = await api.post<ApiRsp<ProjectResponse>>(
          "/projects",
          { title: "Teleprompter Project" }
        );
        if (!rsp.ok) throw new Error(rsp.error);
        setProjectId(rsp.data.projectId);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else if (typeof e === "string") {
          setError(e);
        } else {
          try {
            setError(JSON.stringify(e));
          } catch {
            setError("Unknown error");
          }
        }
      }
    }
    createProject();
  }, []);

  return (
    <div>
      <h1>Anvil (Teleprompter)</h1>
      <ReturnHome />
      {projectId && <div>Created Project ID: {projectId}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <iframe
        src="/teleprompter_pro_fixed_v1_5_4c.html"
        title="Teleprompter Pro"
        style={{ width: "100%", height: "100vh", border: 0 }}
        allow="clipboard-read; clipboard-write; fullscreen"
        allowFullScreen
      />
    </div>
  );
}

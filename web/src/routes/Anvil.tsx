import { useEffect, useState } from "react";

import ReturnHome from "../components/ReturnHome";
import { api } from "../lib/api";
import type { ProjectResponse, ApiRsp } from "../tongs/types";

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
  void createProject();
  }, []);

  return (
  <div className="page-container">
      <h1>Anvil (Teleprompter)</h1>
      <ReturnHome />
      {projectId && <div>Created Project ID: {projectId}</div>}
  {error && <div className="error-text">{error}</div>}
      <iframe
        src="/teleprompter_pro_fixed_v1_5_4c.html"
        title="Teleprompter Pro"
        className="frame-full"
        allow="clipboard-read; clipboard-write; fullscreen"
        allowFullScreen
      />
    </div>
  );
}

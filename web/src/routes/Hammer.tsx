
import ReturnHome from "@/components/ReturnHome";
import type { ProjectResponse, AssetListResponse, AssetReadResponse, AssetResponse } from "@/tongs/types";
import { api } from "@/lib/api";
import { useState } from "react";

export default function Hammer() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [projectId, setProjectId] = useState("");

  async function handleCreate() {
    setCreating(true);
    setError("");
    try {
      const rsp = await api.post<ProjectResponse>("/projects", { title: "Hammer Project" });
      setProjectId(rsp.data.projectId);
      // Example: create an asset (script)
      const assetPayload = {
        kind: "script",
        name: "Episode 1",
        meta: { text: "Intro, segment 1, outro..." }
      };
      const assetRsp = await api.post<AssetResponse>(`/projects/${rsp.data.projectId}/assets`, assetPayload);
      console.log("new assetId:", assetRsp.data.assetId);

      // Example: list assets for the new project
      const assetsRsp = await api.get<AssetListResponse>(`/projects/${rsp.data.projectId}/assets`);
      assetsRsp.data.forEach(async a => {
        console.log(a.id, a.kind, a.name);
        // Example: update asset (rename or change meta)
        await api.patch<void>(`/projects/${rsp.data.projectId}/assets/${a.id}`,
          {
            name: "Episode 1 (final)",
            meta: { text: "Updated content..." }
          }
        );
  // Example: read asset details
  const assetRead = await api.get<AssetReadResponse>(`/projects/${rsp.data.projectId}/assets/${a.id}`);
  console.log("asset meta:", assetRead.data.meta);
  // Example: delete asset
  await api.delete<void>(`/projects/${rsp.data.projectId}/assets/${a.id}`);
      });
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

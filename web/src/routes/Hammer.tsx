
import { useState } from "react";

import ReturnHome from "../components/ReturnHome";
import { api } from "../lib/api";
import type { ProjectResponse, AssetListResponse, AssetReadResponse, AssetResponse, ApiRsp } from "../tongs/types";


export default function Hammer() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [projectId, setProjectId] = useState("");

  async function handleCreate() {
    setCreating(true);
    setError("");
    try {
      const { data: rsp } = await api.post<ApiRsp<ProjectResponse>>("/projects", { title: "Hammer Project" });
      if (!rsp.ok) throw new Error(rsp.error);
      setProjectId(rsp.data.projectId);

      // Example: create an asset (script)
      const assetPayload = {
        kind: "script",
        name: "Episode 1",
        meta: { text: "Intro, segment 1, outro..." }
      };
      const { data: assetRsp } = await api.post<ApiRsp<AssetResponse>>(`projects/${rsp.data.projectId}/assets`, assetPayload);
      if (!assetRsp.ok) throw new Error(assetRsp.error);
      console.log("new assetId:", assetRsp.data.assetId);

      // Example: list assets for the new project
      const { data: assetsRsp } = await api.get<ApiRsp<AssetListResponse>>(`projects/${rsp.data.projectId}/assets`);
      if (!assetsRsp.ok) throw new Error(assetsRsp.error);
      for (const a of assetsRsp.data) {
        console.log(a.id, a.kind, a.name);

        // Example: update asset (rename or change meta)
        await api.patch<void>(
          `projects/${rsp.data.projectId}/assets/${a.id}`,
          {
            name: "Episode 1 (final)",
            meta: { text: "Updated content..." }
          }
        );

        // Example: read asset details
        const { data: assetRead } = await api.get<ApiRsp<AssetReadResponse>>(
          `projects/${rsp.data.projectId}/assets/${a.id}`
        );
        if (!assetRead.ok) throw new Error(assetRead.error);
        console.log("asset meta:", assetRead.data.meta);

        // Example: delete asset
        await api.delete<void>(
          `projects/${rsp.data.projectId}/assets/${a.id}`
        );
      }
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
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="page-container">
      <h1>Hammer</h1>
      <ReturnHome />
      <button onClick={() => { void handleCreate(); }} disabled={creating}>
        {creating ? "Creating..." : "Create Hammer Project"}
      </button>
      {projectId && <div>Created Project ID: {projectId}</div>}
      {error && <div className="error-text">{error}</div>}
    </div>
  );
}

import { useState } from "react";

import ReturnHome from "../components/ReturnHome";
import { api } from "../lib/api";
import type { ProjectResponse, AssetListResponse, AssetReadResponse, ApiRsp } from "../tongs/types";

import { PATHS } from "@/routes/paths";
import { NavLink, linkClass } from "@/ui/nav";

export default function Ledger() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [projectId, setProjectId] = useState("");


  async function handleCreate() {
    setCreating(true);
    setError("");
    try {
      const { data: rsp } = await api.post<ApiRsp<ProjectResponse>>("/projects", { title: "Ledger Project" });
      if (!rsp.ok) throw new Error(rsp.error);
      setProjectId(rsp.data.projectId);
      // Example: list assets for the new project
      const { data: assetsRsp } = await api.get<ApiRsp<AssetListResponse>>(`projects/${rsp.data.projectId}/assets`);
      if (!assetsRsp.ok) throw new Error(assetsRsp.error);
      for (const a of assetsRsp.data) {
        console.log(a.id, a.kind, a.name);
        // Example: read asset details
        const { data: assetRead } = await api.get<ApiRsp<AssetReadResponse>>(`projects/${rsp.data.projectId}/assets/${a.id}`);
        if (!assetRead.ok) throw new Error(assetRead.error);
        console.log("asset meta:", assetRead.data.meta);
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
      <h1>Ledger</h1>
  <nav className="ledger-nav">
         <NavLink to={PATHS.forge} className={linkClass}>Forge</NavLink>
        {/* Add more NavLinks as needed, e.g.:
        <NavLink to="/tools/tongs" className={linkClass}>Tongs</NavLink>
        */}
      </nav>
      <ReturnHome />
      <button onClick={handleCreate} disabled={creating}>
        {creating ? "Creating..." : "Create Ledger Project"}
      </button>
      {projectId && <div>Created Project ID: {projectId}</div>}
      {error && <div className="error-text">{error}</div>}
    </div>
  );
}

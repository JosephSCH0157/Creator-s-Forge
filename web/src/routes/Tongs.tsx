import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

/** === Core types (inline, keep simple for now) === */
type Phase = "idea" | "script" | "recorded" | "edited" | "published";

type AssetMeta = {
  text?: string;
  [key: string]: unknown;
};
type Asset = {
  id: string;
  kind: "script" | "video" | "image" | "doc";
  name: string;
  createdAt: number;
  meta?: AssetMeta;
};

type Project = {
  id: string;
  title: string;
  phase: Phase;
  createdAt: number;
  updatedAt: number;
  assets: Asset[];
  scriptId?: string;
  recordingIds: string[];
};

/** === Storage helpers === */
const STORE = "podcasters-forge:projects:v1"; // renamed from creators-forge
const now = () => Date.now();
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function load(): Project[] {
  try {
    return JSON.parse(localStorage.getItem(STORE) || "[]") as Project[];
  } catch {
    return [];
  }
}
function save(arr: Project[]) {
  localStorage.setItem(STORE, JSON.stringify(arr));
}

/** === Component === */
export default function Tongs() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [projects, setProjects] = useState<Project[]>(() => load());
  const [title, setTitle] = useState("");

  useEffect(() => save(projects), [projects]);

  /** ===== BroadcastChannel IPC (Podcaster's Forge) ===== */
  useEffect(() => {
    const CH_NAME = "podcasters-forge:v1"; // renamed from creators-forge
    const REQ_PREFIX = "REQ:";
    const RSP_PREFIX = "RSP:";
    const ch = new BroadcastChannel(CH_NAME);

    const send = (id: string, payload: unknown) =>
      ch.postMessage({ kind: RSP_PREFIX, id, payload });

    ch.onmessage = (ev) => {
      const msg = ev.data || {};
      if (msg.kind !== REQ_PREFIX) return;

      const { id, payload } = msg;
  const fail = (error: string) => send(id, { ok: false, error });
  const ok = (data?: unknown) => send(id, { ok: true, data });

      try {
        switch (payload.type) {
          case "PING": {
            ok({ pong: true });
            break;
          }

          case "PROJECT.LIST": {
            ok(projects);
            break;
          }

          case "PROJECT.CREATE": {
            const t = String(payload.title || "Untitled Project");
            const p: Project = {
              id: uid(),
              title: t,
              phase: "idea",
              createdAt: now(),
              updatedAt: now(),
              assets: [],
              recordingIds: [],
            };
            setProjects((prev) => [p, ...prev]);
            ok({ projectId: p.id });
            break;
          }

          case "PROJECT.READ": {
            const p = projects.find((x) => x.id === payload.projectId);
            if (!p) return fail("not_found");
            ok(p);
            break;
          }

          case "PROJECT.UPDATE": {
            const { projectId, patch } = payload;
            setProjects((prev) => {
              const idx = prev.findIndex((x) => x.id === projectId);
              if (idx < 0) return prev;
              const p = { ...prev[idx], ...patch, updatedAt: now() };
              const next = [...prev];
              next[idx] = p;
              return next;
            });
            ok({ projectId });
            break;
          }

          case "PROJECT.DELETE": {
            const { projectId } = payload;
            setProjects((prev) => prev.filter((x) => x.id !== projectId));
            ok({ projectId });
            break;
          }

          case "ASSET.LIST": {
            const { projectId, kind } = payload;
            const p = projects.find((x) => x.id === projectId);
            if (!p) return fail("not_found");
            const items = kind ? p.assets.filter((a) => a.kind === kind) : p.assets;
            ok(items);
            break;
          }

          case "ASSET.CREATE": {
            const { projectId, asset } = payload as { projectId: string; asset: Partial<Asset> };
            setProjects((prev) => {
              const idx = prev.findIndex((x) => x.id === projectId);
              if (idx < 0) return prev;
              const p = { ...prev[idx] };
              const a: Asset = {
                id: uid(),
                kind: (asset.kind as Asset["kind"]) ?? "doc",
                name: asset.name || "Untitled",
                createdAt: now(),
                meta: asset.meta ?? {},
              };
              p.assets = [a, ...p.assets];
              if (a.kind === "script") p.scriptId = a.id;
              p.updatedAt = now();
              const next = [...prev];
              next[idx] = p;
              return next;
            });
            ok(true);
            break;
          }

          case "ASSET.READ": {
            const { projectId, assetId } = payload;
            const p = projects.find((x) => x.id === projectId);
            if (!p) return fail("not_found");
            const a = p.assets.find((x) => x.id === assetId);
            if (!a) return fail("not_found");
            ok(a);
            break;
          }

          case "ASSET.UPDATE": {
            const { projectId, assetId, patch } = payload;
            setProjects((prev) => {
              const idx = prev.findIndex((x) => x.id === projectId);
              if (idx < 0) return prev;
              const p = { ...prev[idx] };
              p.assets = p.assets.map((a) => (a.id === assetId ? { ...a, ...(patch as Partial<Asset>) } : a));
              p.updatedAt = now();
              const next = [...prev];
              next[idx] = p;
              return next;
            });
            ok(true);
            break;
          }

          case "ASSET.DELETE": {
            const { projectId, assetId } = payload;
            setProjects((prev) => {
              const idx = prev.findIndex((x) => x.id === projectId);
              if (idx < 0) return prev;
              const p = { ...prev[idx] };
              p.assets = p.assets.filter((a) => a.id !== assetId);
              if (p.scriptId === assetId) p.scriptId = undefined;
              p.updatedAt = now();
              const next = [...prev];
              next[idx] = p;
              return next;
            });
            ok(true);
            break;
          }

          /** Convenience for Teleprompter/Anvil */
          case "SCRIPT.INDEX": {
            const scripts = projects
              .flatMap((p) => {
                if (!p.scriptId) return [];
                const s = p.assets.find((a) => a.id === p.scriptId);
                if (!s) return [];
                return [
                  {
                    projectId: p.id,
                    projectTitle: p.title,
                    assetId: s.id,
                    name: s.name,
                    updatedAt: p.updatedAt,
                  },
                ];
              })
              .sort((a, b) => b.updatedAt - a.updatedAt);
            ok(scripts);
            break;
          }

          case "SCRIPT.GET": {
            const { projectId } = payload;
            const p = projects.find((x) => x.id === projectId);
            if (!p || !p.scriptId) return ok({ name: null, text: "" });
            const s = p.assets.find((a) => a.id === p.scriptId);
            ok({ name: s?.name ?? null, text: s?.meta?.text ?? "" });
            break;
          }

          case "SCRIPT.SAVE": {
            const { projectId, name, text } = payload;
            setProjects((prev) => {
              const idx = prev.findIndex((x) => x.id === projectId);
              if (idx < 0) return prev;
              const p = { ...prev[idx] };
              const a: Asset = {
                id: uid(),
                kind: "script",
                name: name || "Untitled",
                createdAt: now(),
                meta: { text: String(text ?? "") },
              };
              p.assets = [a, ...p.assets];
              p.scriptId = a.id;
              p.phase = p.phase === "idea" ? "script" : p.phase;
              p.updatedAt = now();
              const next = [...prev];
              next[idx] = p;
              return next;
            });
            ok(true);
            break;
          }

          case "SEARCH": {
            const q = String(payload.query || "").toLowerCase();
            const hits = projects
              .filter(
                (p) =>
                  p.title.toLowerCase().includes(q) ||
                  p.assets.some(
                    (a) =>
                      (a.name?.toLowerCase() || "").includes(q) ||
                      (a.meta?.text?.toLowerCase?.() || "").includes(q)
                  )
              )
              .map((p) => ({ projectId: p.id, title: p.title }));
            ok(hits);
            break;
          }

          default:
            fail("unsupported_type");
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          fail(String(e.message));
        } else if (typeof e === "string") {
          fail(e);
        } else {
          try {
            fail(JSON.stringify(e));
          } catch {
            fail("Unknown error");
          }
        }
      }
    };

    return () => ch.close();
  }, [projects]);

  /** === UI: Projects / Details === */
  const createProject = () => {
    const t = title.trim() || "Untitled Project";
    const p: Project = {
      id: uid(),
      title: t,
      phase: "idea",
      createdAt: now(),
      updatedAt: now(),
      assets: [],
      recordingIds: [],
    };
    setProjects([p, ...projects]);
    setTitle("");
  void navigate(`/tools/tongs/${p.id}`);
  };

  const current = useMemo(
    () => projects.find((p) => p.id === projectId) || null,
    [projects, projectId]
  );

  return (
  <div className="tongs-root">
      {/* Top bar */}
      <div className="tongs-topbar">
  <img src="/tongs.png" alt="" className="tongs-logo" />
        <button
          onClick={() => navigate("/forge")}
          className="tongs-back-btn"
        >
          Back to Podcaster’s Forge
        </button>
  <div className="tongs-topbar-desc">Tongs · Backbone (read/write bus)</div>
      </div>

  <div className="tongs-main">
        {/* Left: projects */}
  <aside className="tongs-sidebar">
          <div className="tongs-sidebar-new">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New project title"
              className="tongs-input"
            />
            <button onClick={createProject}>New</button>
          </div>

          {(["idea", "script", "recorded", "edited", "published"] as Phase[]).map((ph) => (
            <div key={ph} className="tongs-phase">
              <div className="tongs-phase-label">{ph.toUpperCase()}</div>
              {(projects.filter((p) => p.phase === ph) || []).map((p) => (
                <Link
                  key={p.id}
                  to={`/tools/tongs/${p.id}`}
                  className="tongs-project-link"
                >
                  {p.title}
                </Link>
              ))}
            </div>
          ))}
        </aside>

        {/* Right: project detail */}
  <main className="tongs-detail">
          {!current ? (
            <p>Select or create a project.</p>
          ) : (
            <>
              <div className="tongs-detail-header">
                <h1 className="tongs-detail-title">{current.title}</h1>
                <span className="tongs-phase-badge">
                  {current.phase}
                </span>
                <div className="tongs-detail-back">
                  <Link to="/forge" className="tongs-detail-back-link">
                    Back to Podcaster’s Forge
                  </Link>
                </div>
              </div>

              {/* Script card */}
              <section className="tongs-script-card">
                <div className="tongs-script-header">
                  <strong>Script</strong>
                  <div className="tongs-script-actions">
                    <button
                      onClick={() => {
                        // 1) Navigate to Teleprompter
                        window.location.href = "/tools/anvil";
                        // 2) Ask Teleprompter to load this project’s script (it should listen on the same channel name)
                        const ch = new BroadcastChannel("podcasters-forge:v1");
                        ch.postMessage({
                          kind: "REQ:",
                          id: `bootstrap-${Date.now()}`,
                          payload: { type: "SCRIPT.GET", projectId: current.id },
                        });
                        ch.close();
                      }}
                    >
                      Open in Teleprompter
                    </button>
                  </div>
                </div>
                {current.scriptId ? (
                  <p className="tongs-script-current">
                    Current script: {current.assets.find((a) => a.id === current.scriptId)?.name}
                  </p>
                ) : (
                  <p className="tongs-script-none">No script attached yet.</p>
                )}
              </section>

              {/* Recordings */}
              <section className="tongs-recordings-card">
                <strong>Recordings</strong>
                <ul className="tongs-recordings-list">
                  {current.recordingIds.map((id) => {
                    const a = current.assets.find((x) => x.id === id);
                    return (
                      <li key={id} className="tongs-recording-item">
                        {a?.name || id}
                      </li>
                    );
                  })}
                </ul>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

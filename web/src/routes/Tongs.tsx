import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import ReturnHome from '@/components/ReturnHome';

type Phase = "idea" | "script" | "recorded" | "edited" | "published";
type AssetMeta = { text?: string; [k: string]: unknown };
type Asset = {
  id: string;
  kind: "script" | "video" | "image" | "doc";
  name: string;
  createdAt: number;
  meta?: AssetMeta;
};
    </div>
  );
}
              phase: "idea",
              createdAt: now(),
              updatedAt: now(),
              assets: [],
              recordingIds: [],
            };
            setProjects((prev) => [p, ...prev]);
            ok(id, { projectId: p.id });
            break;
          }
          case "PROJECT.READ": {
            const p = projects.find((x) => x.id === payload.projectId);
            if (!p) return fail(id, "not_found");
            ok(id, p);
            break;
          }
          case "PROJECT.UPDATE": {
            const { projectId, patch } = payload;
            setProjects((prev) => {
              const idx = prev.findIndex((x) => x.id === projectId);
              if (idx < 0) return prev;
              const next = [...prev];
              next[idx] = { ...prev[idx], ...patch, updatedAt: now() };
              return next;
            });
            ok(id, { projectId });
            break;
          }
          case "PROJECT.DELETE": {
            setProjects((prev) => prev.filter((x) => x.id !== payload.projectId));
            ok(id, { projectId: payload.projectId });
            break;
          }
          case "ASSET.LIST": {
            const p = projects.find((x) => x.id === payload.projectId);
            if (!p) return fail(id, "not_found");
            const items = payload.kind ? p.assets.filter((a) => a.kind === payload.kind) : p.assets;
            ok(id, items);
            break;
          }
          case "ASSET.CREATE": {
            const { projectId, asset } = payload;
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
            ok(id, true);
            break;
          }
          case "ASSET.READ": {
            const p = projects.find((x) => x.id === payload.projectId);
            if (!p) return fail(id, "not_found");
            const a = p.assets.find((x) => x.id === payload.assetId);
            if (!a) return fail(id, "not_found");
            ok(id, a);
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
            ok(id, true);
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
            ok(id, true);
            break;
          }
          case "SCRIPT.INDEX": {
            const scripts = projects
              .flatMap((p) => {
                if (!p.scriptId) return [];
                const s = p.assets.find((a) => a.id === p.scriptId);
                if (!s) return [];
                return [{ projectId: p.id, projectTitle: p.title, assetId: s.id, name: s.name, updatedAt: p.updatedAt }];
              })
              .sort((a, b) => b.updatedAt - a.updatedAt);
            ok(id, scripts);
            break;
          }
          case "SCRIPT.GET": {
            const p = projects.find((x) => x.id === payload.projectId);
            if (!p || !p.scriptId) return ok(id, { name: null, text: "" });
            const s = p.assets.find((a) => a.id === p.scriptId);
            ok(id, { name: s?.name ?? null, text: s?.meta?.text ?? "" });
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
                name: typeof name === "string" ? name : "Untitled",
                createdAt: now(),
                meta: { text: typeof text === "string" ? text : String(text ?? "") },
              };
              p.assets = [a, ...p.assets];
              p.scriptId = a.id;
              if (p.phase === "idea") p.phase = "script";
              p.updatedAt = now();
              const next = [...prev];
              next[idx] = p;
              return next;
            });
            ok(id, true);
            break;
          }
          case "SEARCH": {
            const q = typeof payload.query === "string" ? payload.query.toLowerCase() : "";
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
            ok(id, hits);
            break;
          }
          default:
            assertNever(payload as never);
        }
      } catch (e: unknown) {
        if (e instanceof Error) fail(id, e.message);
        else if (typeof e === "string") fail(id, e);
        else {
          try { fail(id, JSON.stringify(e)); }
          catch { fail(id, "Unknown error"); }
        }
      }
    };
    return () => ch.close();
  }, [projects]);
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
    navigate(`${PATHS.tongs}/${p.id}`);
  };
  const current = useMemo(
    () => projects.find((p) => p.id === projectId) || null,
    [projects, projectId]
  );
  return (
    <div className="tongs-root">
      <div className="tongs-topbar">
        <img src="/tongs.png" alt="" className="tongs-logo" />
        <ReturnHome />
        <div className="tongs-topbar-desc">Tongs · Backbone (read/write bus)</div>
      </div>
      <div className="tongs-main">
        <aside className="tongs-sidebar">
          <div className="tongs-sidebar-new">
            <input
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.currentTarget.value)}
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
        <main className="tongs-detail">
          {!current ? (
            <p>Select or create a project.</p>
          ) : (
            <>
              <div className="tongs-detail-header">
                <h1 className="tongs-detail-title">{current.title}</h1>
                <span className="tongs-phase-badge">{current.phase}</span>
                <div className="tongs-detail-back">
                  <Link to="/forge" className="tongs-detail-back-link">
                    Back to Podcaster’s Forge
                  </Link>
                </div>
              </div>
              <section className="tongs-script-card">
                <div className="tongs-script-header">
                  <strong>Script</strong>
                  <div className="tongs-script-actions">
                    <button
                      onClick={() => {
                        window.location.href = "/tools/anvil";
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
  // ...existing code...
  // Place return statement here, inside Tongs function
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.currentTarget.value)}
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

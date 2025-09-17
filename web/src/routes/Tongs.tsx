// src/routes/Tongs.tsx
import '@/index.css';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import IMGtongs from '@/assets/IMGtongs.png';
import { PATHS } from '@/routes/paths';

/** === Core types === */
type Phase = 'idea' | 'script' | 'recorded' | 'edited' | 'published';

type AssetMeta = { text?: string; [k: string]: unknown };
type Asset = {
  id: string;
  kind: 'script' | 'video' | 'image' | 'doc';
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

/** === Broadcast message types === */
type ReqPayload =
  | { type: 'PING' }
  | { type: 'PROJECT.LIST' }
  | { type: 'PROJECT.CREATE'; title?: unknown }
  | { type: 'PROJECT.READ'; projectId: string }
  | { type: 'PROJECT.UPDATE'; projectId: string; patch: Partial<Project> }
  | { type: 'PROJECT.DELETE'; projectId: string }
  | { type: 'ASSET.LIST'; projectId: string; kind?: Asset['kind'] }
  | { type: 'ASSET.CREATE'; projectId: string; asset: Partial<Asset> }
  | { type: 'ASSET.READ'; projectId: string; assetId: string }
  | { type: 'ASSET.UPDATE'; projectId: string; assetId: string; patch: Partial<Asset> }
  | { type: 'ASSET.DELETE'; projectId: string; assetId: string }
  | { type: 'SCRIPT.INDEX' }
  | { type: 'SCRIPT.GET'; projectId: string }
  | { type: 'SCRIPT.SAVE'; projectId: string; name?: unknown; text?: unknown }
  | { type: 'SEARCH'; query?: unknown };

type ReqMsg = { kind: 'REQ:'; id: string; payload: ReqPayload };

type RspOk = { ok: true; data?: unknown };
type RspErr = { ok: false; error: string };
type RspPayload = RspOk | RspErr;
type RspMsg = { kind: 'RSP:'; id: string; payload: RspPayload };

const assertNever = (x: never): never => {
  throw new Error(`Unhandled message type: ${String(x)}`);
};

/** === Storage helpers === */
const STORE = 'podcasters-forge:projects:v1';
const now = () => Date.now();
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function load(): Project[] {
  try {
    const arr = JSON.parse(localStorage.getItem(STORE) || '[]') as Project[];
    // normalize legacy items that may miss arrays
    return arr.map((p) => ({
      ...p,
      assets: Array.isArray(p.assets) ? p.assets : [],
      recordingIds: Array.isArray(p.recordingIds) ? p.recordingIds : [],
    }));
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
  const [title, setTitle] = useState('');

  // persist on change (debounced to avoid hammering localStorage)
  useEffect(() => {
    const handle = setTimeout(() => save(projects), 200);
    return () => clearTimeout(handle);
  }, [projects]);

  /** ===== BroadcastChannel IPC (single, clean handler) ===== */
  useEffect(() => {
    const ch = new BroadcastChannel('podcasters-forge:v1');

    const send = (id: string, payload: RspPayload) =>
      ch.postMessage({ kind: 'RSP:', id, payload } as RspMsg);
    const ok = (id: string, data?: unknown) => send(id, { ok: true, data });
    const fail = (id: string, error: string) => send(id, { ok: false, error });

    ch.onmessage = (ev: MessageEvent<unknown>) => {
      const msg = ev.data as Partial<ReqMsg>;
      if (!msg || msg.kind !== 'REQ:' || typeof msg.id !== 'string' || !msg.payload) return;
      const { id, payload } = msg;

      try {
        switch (payload.type) {
          case 'PING': {
            ok(id, { pong: true });
            break;
          }

          case 'PROJECT.LIST': {
            ok(id, projects);
            break;
          }

          case 'PROJECT.CREATE': {
            const t = typeof payload.title === 'string' ? payload.title.trim() : 'Untitled Project';
            const p: Project = {
              id: uid(),
              title: t || 'Untitled Project',
              case 'SCRIPT.SAVE': {
                const { projectId, name, text } = payload;
                setProjects((prev: Project[]) => {
                  const idx = prev.findIndex((x) => x.id === projectId);
                  if (idx < 0) return prev;

                  const base = prev[idx];
                  if (!base) return prev;

                  const safeText =
                    typeof text === 'string' ? text : text !== undefined ? JSON.stringify(text) : '';

                  const a: Asset = {
                    id: uid(),
                    kind: 'script',
                    name: typeof name === 'string' ? name : 'Untitled',
                    createdAt: now(),
                    meta: { text: safeText },
                  };

                  const updated: Project = {
                    ...base,
                    assets: [a, ...base.assets],
                    scriptId: a.id,
                    phase: base.phase === 'idea' ? 'script' : base.phase,
                    updatedAt: now(),
                  };
                  const next: Project[] = [...prev];
                  next[idx] = updated;

                  save(next);
                  ok(id, { asset: a, scripts: updated.assets.filter((x) => x.kind === 'script') });
                  return next;
                });
                break;
              }
              };

              const next = [...prev];
              next[idx] = p;
              return next;
            });
            ok(id, { projectId });
            break;
          }

          case 'PROJECT.DELETE': {
            setProjects((prev) => prev.filter((x) => x.id !== payload.projectId));
            ok(id, { projectId: payload.projectId });
            break;
          }

          case 'ASSET.LIST': {
            const p = projects.find((x) => x.id === payload.projectId);
            if (!p) return fail(id, 'not_found');
            const items = payload.kind ? p.assets.filter((a) => a.kind === payload.kind) : p.assets;
            ok(id, items);
            break;
          }

          case 'ASSET.CREATE': {
            const { projectId, asset } = payload;
            setProjects((prev) => {
              const idx = prev.findIndex((x) => x.id === projectId);
              if (idx < 0) return prev;

              const base = prev[idx];
              if (
                !base ||
                typeof base !== 'object' ||
                typeof base.id !== 'string' ||
                typeof base.title !== 'string' ||
                typeof base.phase !== 'string' ||
                typeof base.createdAt !== 'number' ||
                typeof base.updatedAt !== 'number' ||
                !Array.isArray(base.assets) ||
                !Array.isArray(base.recordingIds)
              ) {
                return prev;
              }

              const a: Asset = {
                id: uid(),
                kind: (asset?.kind as Asset['kind']) ?? 'doc',
                name: (asset?.name as string) || 'Untitled',
                createdAt: now(),
                meta: asset?.meta ?? {},
              };

              const p: Project = {
                ...base,
                assets: [a, ...base.assets],
                scriptId: a.kind === 'script' ? a.id : base.scriptId,
                updatedAt: now(),
              };

              const next = [...prev];
              next[idx] = p;
              return next;
            });
            ok(id, true);
            break;
          }

          case 'ASSET.READ': {
            const p = projects.find((x) => x.id === payload.projectId);
            if (!p) return fail(id, 'not_found');
            const a = p.assets.find((x) => x.id === payload.assetId);
            if (!a) return fail(id, 'not_found');
            ok(id, a);
            break;
          }

          case 'ASSET.UPDATE': {
            const { projectId, assetId, patch } = payload;
            setProjects((prev) => {
              const idx = prev.findIndex((x) => x.id === projectId);
              if (idx < 0) return prev;

              const base = prev[idx];
              if (
                !base ||
                typeof base !== 'object' ||
                typeof base.id !== 'string' ||
                typeof base.title !== 'string' ||
                typeof base.phase !== 'string' ||
                typeof base.createdAt !== 'number' ||
                typeof base.updatedAt !== 'number' ||
                !Array.isArray(base.assets) ||
                !Array.isArray(base.recordingIds)
              ) {
                return prev;
              }

              const p: Project = {
                ...base,
                assets: base.assets.map((a) => (a.id === assetId ? { ...a, ...patch } : a)),
                updatedAt: now(),
              };

              const next = [...prev];
              next[idx] = p;
              return next;
            });
            ok(id, true);
            break;
          }

          case 'ASSET.DELETE': {
            const { projectId, assetId } = payload;
            setProjects((prev) => {
              const idx = prev.findIndex((x) => x.id === projectId);
              if (idx < 0) return prev;

              const base = prev[idx];
              if (
                !base ||
                typeof base !== 'object' ||
                typeof base.id !== 'string' ||
                typeof base.title !== 'string' ||
                typeof base.phase !== 'string' ||
                typeof base.createdAt !== 'number' ||
                typeof base.updatedAt !== 'number' ||
                !Array.isArray(base.assets) ||
                !Array.isArray(base.recordingIds)
              ) {
                return prev;
              }

              const p: Project = {
                ...base,
                assets: base.assets.filter((a) => a.id !== assetId),
                scriptId: base.scriptId === assetId ? undefined : base.scriptId,
                recordingIds: base.recordingIds.filter((id) => id !== assetId),
                updatedAt: now(),
              };

              const next = [...prev];
              next[idx] = p;
              return next;
            });
            ok(id, true);
            break;
          }

          case 'SCRIPT.INDEX': {
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
            ok(id, scripts);
            break;
          }

          case 'SCRIPT.GET': {
            const p = projects.find((x) => x.id === payload.projectId);
            if (!p || !p.scriptId) return ok(id, { name: null, text: '' });
            const s = p.assets.find((a) => a.id === p.scriptId);
            ok(id, { name: s?.name ?? null, text: s?.meta?.text ?? '' });
            break;
          }

          case 'SCRIPT.SAVE': {
            const { projectId, name, text } = payload;
            setProjects((prev) => {
              const idx = prev.findIndex((x) => x.id === projectId);
              if (idx < 0) return prev;

              const base = prev[idx];
              if (
                !base ||
                typeof base !== 'object' ||
                typeof base.id !== 'string' ||
                typeof base.title !== 'string' ||
                typeof base.phase !== 'string' ||
                typeof base.createdAt !== 'number' ||
                typeof base.updatedAt !== 'number' ||
                !Array.isArray(base.assets) ||
                !Array.isArray(base.recordingIds)
              ) {
                return prev;
              }

              const safeText =
                typeof text === 'string' ? text : text !== undefined ? JSON.stringify(text) : '';

              const a: Asset = {
                id: uid(),
                kind: 'script',
                name: typeof name === 'string' ? name : 'Untitled',
                createdAt: now(),
                meta: { text: safeText },
              };

              const updated: Project = {
                ...base,
                assets: [a, ...base.assets],
                scriptId: a.id,
                phase: base.phase === 'idea' ? 'script' : base.phase,
                updatedAt: now(),
              };

              const next = [...prev];
              next[idx] = updated;

              // persist + reply with fresh list so Teleprompter dropdown updates
              save(next);
              ok(id, { asset: a, scripts: updated.assets.filter((x) => x.kind === 'script') });

              return next;
            });
            break;
          }

          case 'SEARCH': {
            const q = typeof payload.query === 'string' ? payload.query.toLowerCase() : '';
            const hits = projects
              .filter(
                (p) =>
                  p.title.toLowerCase().includes(q) ||
                  p.assets.some(
                    (a) =>
                      (a.name?.toLowerCase() || '').includes(q) ||
                      (a.meta?.text?.toLowerCase?.() || '').includes(q),
                  ),
              )
              .map((p) => ({ projectId: p.id, title: p.title }));
            ok(id, hits);
            break;
          }

          default:
            // Exhaustive guard
            assertNever(payload);
        }
      } catch (e: unknown) {
        if (e instanceof Error) fail(id, e.message);
        else if (typeof e === 'string') fail(id, e);
        else {
          try {
            fail(id, JSON.stringify(e));
          } catch {
            fail(id, 'Unknown error');
          }
        }
      }
    };

    return () => ch.close();
  }, [projects]);

  /** === UI: Projects / Details === */
  const createProject = () => {
    const t = title.trim() || 'Untitled Project';
    const p: Project = {
      id: uid(),
      title: t,
      phase: 'idea',
      createdAt: now(),
      updatedAt: now(),
      assets: [],
      recordingIds: [],
    };
    setProjects([p, ...projects]);
    setTitle('');
    void navigate(`${PATHS.tongs}/${p.id}`);
  };

  const current = useMemo(
    () => projects.find((p) => p.id === projectId) || null,
    [projects, projectId],
  );

  return (
    <div className="tongs-root">
      <div className="tongs-topbar">
        <img src={IMGtongs} alt="Tongs" className="tongs-logo" />
        <div className="tongs-topbar-text">
          <h1 className="tongs-title">Tongs</h1>
          <p className="tongs-subtitle">Backbone — projects, scripts, recordings</p>
        </div>
      </div>

      <div className="tongs-main">
        <aside className="tongs-sidebar" aria-label="Projects">
          <div className="tongs-sidebar-new">
            <input
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
              placeholder="New project title"
              className="tongs-input"
              aria-label="New project title"
            />
            <button className="btn btn-primary" onClick={createProject}>
              New
            </button>
          </div>

          {/* Upload script into current project */}
            <div className="tongs-sidebar-upload">
              <label htmlFor="script-upload" style={{ display: 'block', marginBottom: 4 }}>
                Upload script (.txt, .md, .docx):
              </label>
              <input
                id="script-upload"
                type="file"
                accept=".txt,.md,.docx"
                onChange={handleScriptUpload}
              />
            </div>
          
  // Script upload handler
  function handleScriptUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file || !current) return;

    // Run async work without returning a Promise to React
    void (async () => {
      let text = "";
      if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
        text = await file.text();
      } else if (file.name.endsWith(".docx")) {
        alert("DOCX import requires the 'mammoth' package — we can add it next.");
        return;
      }

      const a: Asset = {
        id: crypto.randomUUID(),
        kind: "script",
        name: file.name.replace(/\.(txt|md|docx)$/i, "") || "Imported Script",
        meta: { text },
        createdAt: now(),
      };

      setProjects((prev) => {
        const idx = prev.findIndex((x) => x.id === current.id);
        if (idx < 0) return prev;

        const base = prev[idx]; // Project | undefined
        if (!base) return prev; // type guard

        const updated: Project = {
          ...base,
          updatedAt: now(),
          assets: [a, ...(base.assets ?? [])],
          scriptId: a.id,
        };

        const next = [...prev];
        next[idx] = updated;
        save(next);
        return next;
      });
    })();

    // Clear the input so the same file can be selected again later
    e.currentTarget.value = "";
  }

          <div className="tongs-sections">
            {(['idea', 'script', 'recorded', 'edited', 'published'] as Phase[]).map((ph) => {
              const list = projects.filter((p) => p.phase === ph);
              return (
                <section key={ph} className="tongs-section">
                  <header className="tongs-section-head">
                    <span className="tongs-section-title">{ph.toUpperCase()}</span>
                    <span className="tongs-chip">{list.length}</span>
                  </header>
                  <ul className="tongs-list">
                    {list.map((p) => (
                      <li key={p.id}>
                        <Link
                          to={`${PATHS.tongs}/${p.id}`}
                          className={`tongs-item${current?.id === p.id ? ' is-active' : ''}`}
                          title={p.title}
                        >
                          <span className="tongs-item-title">{p.title}</span>
                          <span className="tongs-item-meta">
                            {new Date(p.updatedAt).toLocaleDateString()}
                          </span>
                        </Link>
                      </li>
                    ))}
                    {list.length === 0 && <li className="tongs-empty">No items in this phase.</li>}
                  </ul>
                </section>
              );
            })}
          </div>
        </aside>

        <main className="tongs-detail" aria-label="Project details">
          {!current ? (
            <div className="tongs-empty-state">
              <div className="tongs-ghost">Select or create a project</div>
              <p className="tongs-hint">
                Tip: click a phase on the left to filter; use <b>New</b> to start.
              </p>
            </div>
          ) : (
            <>
              <header className="tongs-detail-header">
                <h2 className="tongs-detail-title">{current.title}</h2>
                <span className={`tongs-badge phase-${current.phase}`}>{current.phase}</span>
              </header>

              <section className="tongs-card">
                <div className="tongs-card-head">
                  <strong>Script</strong>
                  <div className="tongs-actions">
                    <button
                      className="btn"
                      onClick={() => {
                        const id = current.id;
                        window.location.href = `/teleprompter_pro.html?projectId=${encodeURIComponent(
                          id,
                        )}`;
                      }}
                    >
                      Open in Teleprompter
                    </button>
                  </div>
                </div>
                {current.scriptId ? (
                  <p className="tongs-muted">
                    Current script: {current.assets.find((a) => a.id === current.scriptId)?.name}
                  </p>
                ) : (
                  <p className="tongs-muted">No script attached yet.</p>
                )}
              </section>

              <section className="tongs-card">
                <div className="tongs-card-head">
                  <strong>Recordings</strong>
                </div>
                {current.recordingIds.length ? (
                  <ul className="tongs-pills">
                    {current.recordingIds.map((id) => {
                      const a = current.assets.find((x) => x.id === id);
                      return (
                        <li key={id} className="pill">
                          {a?.name ?? id}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="tongs-muted">No recordings yet.</p>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

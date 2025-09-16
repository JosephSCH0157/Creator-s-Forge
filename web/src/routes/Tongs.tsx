import '@/index.css';
// routes/Tongs.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import IMGtongs from '@/assets/IMGtongs.png'; // ← import the image (no leading slash)
import ReturnHome from '@/components/ReturnHome';
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
    return JSON.parse(localStorage.getItem(STORE) || '[]') as Project[];
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

  /** ===== BroadcastChannel IPC ===== */
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
              phase: 'idea',
              createdAt: now(),
              updatedAt: now(),
              assets: [],
              recordingIds: [],
            };
            setProjects((prev) => [p, ...prev]);
            ok(id, { projectId: p.id });
            break;
          }

          case 'PROJECT.READ': {
            const p = projects.find((x) => x.id === payload.projectId);
            if (!p) return fail(id, 'not_found');
            ok(id, p);
            break;
          }

          case 'PROJECT.UPDATE': {
            const { projectId, patch } = payload;
            setProjects((prev: Project[]) => {
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
              if (!patch || typeof patch !== 'object') return prev;

              const p: Project = {
                id: base.id,
                title: typeof patch.title === 'string' ? patch.title : base.title,
                phase: typeof patch.phase === 'string' ? patch.phase : base.phase,
                createdAt: base.createdAt,
                updatedAt: now(),
                assets: Array.isArray(patch.assets) ? patch.assets : base.assets,
                recordingIds: Array.isArray(patch.recordingIds)
                  ? patch.recordingIds
                  : base.recordingIds,
                scriptId: typeof patch.scriptId === 'string' ? patch.scriptId : base.scriptId,
              };

              const next: Project[] = [...prev];
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
            setProjects((prev: Project[]) => {
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
              const next: Project[] = [...prev];
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
            setProjects((prev: Project[]) => {
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
              const next: Project[] = [...prev];
              next[idx] = p;
              return next;
            });
            ok(id, true);
            break;
          }
          case 'ASSET.DELETE': {
            const { projectId, assetId } = payload;
            setProjects((prev: Project[]) => {
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
              const next: Project[] = [...prev];
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
            setProjects((prev: Project[]) => {
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
              const p: Project = {
                ...base,
                assets: [a, ...base.assets],
                scriptId: a.id,
                phase: base.phase === 'idea' ? 'script' : base.phase,
                updatedAt: now(),
              };
              const next: Project[] = [...prev];
              next[idx] = p;
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
            // Exhaustive guard: if you add a new union member above and forget to handle it here,
            // TS will flag this cast.
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
        <ReturnHome />
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

          {(['idea', 'script', 'recorded', 'edited', 'published'] as Phase[]).map((ph) => (
            <div key={ph} className="tongs-phase">
              <div className="tongs-phase-label">{ph.toUpperCase()}</div>
              {projects
                .filter((p) => p.phase === ph)
                .map((p) => (
                  <Link key={p.id} to={`${PATHS.tongs}/${p.id}`} className="tongs-project-link">
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
                <span className="tongs-phase-badge">{current.phase}</span>
                <div className="tongs-detail-back">
                  <Link to={PATHS.forge} className="tongs-detail-back-link">
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
                        window.location.href = PATHS.anvil;
                        // 2) Ask Teleprompter to load this project’s script
                        const ch = new BroadcastChannel('podcasters-forge:v1');
                        ch.postMessage({
                          kind: 'REQ:',
                          id: `bootstrap-${Date.now()}`,
                          payload: { type: 'SCRIPT.GET', projectId: current.id },
                        } as ReqMsg);
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

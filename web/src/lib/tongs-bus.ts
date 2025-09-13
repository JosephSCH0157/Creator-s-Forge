// --- Bus utility for React pages ---
export function createTongsBus() {
  const CH_NAME = "podcasters-forge:v1";
  const REQ_PREFIX = "REQ:";
  const RSP_PREFIX = "RSP:";
  const ch = new BroadcastChannel(CH_NAME);
  let seq = 0;
  const pending = new Map();

  ch.onmessage = (ev) => {
    const m = ev.data || {};
    if (m.kind !== RSP_PREFIX) return;
    const entry = pending.get(m.id);
    if (!entry) return;
    clearTimeout(entry.timer);
    pending.delete(m.id);
    entry.resolve(m.payload);
  };

  function request(payload, timeoutMs = 5000) {
    const id = Date.now().toString(36) + "-" + (seq++);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending.delete(id); reject("TONGS timeout"); }, timeoutMs);
      pending.set(id, { resolve, reject, timer });
      ch.postMessage({ kind: REQ_PREFIX, id, payload });
    });
  }

  function close() { ch.close(); }

  return { request, close };
}
useEffect(() => {
  const CH_NAME = "podcasters-forge:v1";
  const REQ_PREFIX = "REQ:";
  const RSP_PREFIX = "RSP:";
  const ch = new BroadcastChannel(CH_NAME);

  const send = (id: string, payload: any) =>
    ch.postMessage({ kind: RSP_PREFIX, id, payload });

  const now = () => Date.now();
  const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

  ch.onmessage = (ev) => {
    const msg = ev.data || {};
    if (msg.kind !== REQ_PREFIX) return;
    const { id, payload } = msg;
    const fail = (error: string) => send(id, { ok: false, error });
    const ok = (data?: any) => send(id, { ok: true, data });

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
          const title = String(payload.title || "Untitled Project");
          const p: Project = {
            id: uid(),
            title,
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
            const next = [...prev]; next[idx] = p; return next;
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
            const next = [...prev]; next[idx] = p; return next;
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
            p.assets = p.assets.map((a) => (a.id === assetId ? { ...a, ...patch } : a));
            p.updatedAt = now();
            const next = [...prev]; next[idx] = p; return next;
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
            const next = [...prev]; next[idx] = p; return next;
          });
          ok(true);
          break;
        }

        case "SCRIPT.INDEX": {
          const scripts = projects.flatMap((p) => {
            if (!p.scriptId) return [];
            const s = p.assets.find((a) => a.id === p.scriptId);
            if (!s) return [];
            return [{ projectId: p.id, projectTitle: p.title, assetId: s.id, name: s.name, updatedAt: p.updatedAt }];
          }).sort((a, b) => b.updatedAt - a.updatedAt);
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
            const next = [...prev]; next[idx] = p; return next;
          });
          ok(true);
          break;
        }

        case "SEARCH": {
          const q = String(payload.query || "").toLowerCase();
          const hits = projects.filter((p) =>
            p.title.toLowerCase().includes(q) ||
            p.assets.some((a) =>
              (a.name?.toLowerCase() || "").includes(q) ||
              (a.meta?.text?.toLowerCase?.() || "").includes(q)
            )
          ).map((p) => ({ projectId: p.id, title: p.title }));
          ok(hits);
          break;
        }

        default:
          fail("unsupported_type");
      }
    } catch (e: any) {
      fail(String(e?.message || e));
    }
  };

  return () => ch.close();
}, [projects]);

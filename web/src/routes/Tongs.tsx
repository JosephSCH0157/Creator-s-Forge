  // Stable BroadcastChannel IPC (mount once, always latest state)
  const projectsRef = useRef<Project[]>(projects);
  useEffect(() => { projectsRef.current = projects; }, [projects]);
                      const { id, payload } = msg;
                      const projects = projectsRef.current;
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
                            const proj = projects.find((x: Project) => x.id === payload.projectId);
                            if (!proj) return fail(id, 'not_found');
                            ok(id, proj);
                            break;
                          }
                          case 'PROJECT.UPDATE': {
                            const { projectId, patch } = payload as any;
                            setProjects((prev: Project[]) => {
                              const idx = prev.findIndex((x: Project) => x.id === projectId);
                              if (idx < 0) return prev;
                              const base = prev[idx];
                              if (!base || typeof patch !== 'object' || patch === null) return prev;
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
                              const next = [...prev];
                              next[idx] = p;
                              return next;
                            });
                            ok(id, { projectId });
                            break;
                          }
                          case 'PROJECT.DELETE': {
                            setProjects((prev: Project[]) => prev.filter((x: Project) => x.id !== payload.projectId));
                            ok(id, { projectId: payload.projectId });
                            break;
                          }
                          case 'ASSET.LIST': {
                            const proj = projects.find((x: Project) => x.id === payload.projectId);
                            if (!proj) return fail(id, 'not_found');
                            const items = payload.kind ? proj.assets.filter((a: Asset) => a.kind === payload.kind) : proj.assets;
                            ok(id, items);
                            break;
                          }
                          case 'ASSET.CREATE': {
                            const { projectId, asset } = payload as any;
                            setProjects((prev: Project[]) => {
                              const idx = prev.findIndex((x: Project) => x.id === projectId);
                              if (idx < 0) return prev;
                              const curr = prev[idx];
                              if (!curr) return prev;
                              const a: Asset = {
                                id: uid(),
                                kind: (asset?.kind as Asset['kind']) ?? 'doc',
                                name: (asset?.name as string) || 'Untitled',
                                createdAt: now(),
                                meta: asset?.meta ?? {},
                              };
                              const nextProject: Project = {
                                ...curr,
                                assets: [a, ...curr.assets],
                                scriptId: a.kind === 'script' ? a.id : curr.scriptId,
                                updatedAt: now(),
                              };
                              const next = [...prev];
                              next[idx] = nextProject;
                              return next;
                            });
                            ok(id, true);
                            break;
                          }
                          case 'ASSET.READ': {
                            const p = projects.find((x: Project) => x.id === payload.projectId);
                            if (!p) return fail(id, 'not_found');
                            const a = p.assets.find((x: Asset) => x.id === payload.assetId);
                            if (!a) return fail(id, 'not_found');
                            ok(id, a);
                            break;
                          }
                          case 'ASSET.UPDATE': {
                            const { projectId, assetId, patch } = payload as any;
                            setProjects((prev: Project[]) => {
                              const idx = prev.findIndex((x: Project) => x.id === projectId);
                              if (idx < 0) return prev;
                              const base = prev[idx];
                              if (!base) return prev;
                              const p: Project = {
                                ...base,
                                assets: base.assets.map((a: Asset) => (a.id === assetId ? { ...a, ...patch } : a)),
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
                            const { projectId, assetId } = payload as any;
                            setProjects((prev: Project[]) => {
                              const idx = prev.findIndex((x: Project) => x.id === projectId);
                              if (idx < 0) return prev;
                              const base = prev[idx];
                              if (!base) return prev;
                              const p: Project = {
                                ...base,
                                assets: base.assets.filter((a: Asset) => a.id !== assetId),
                                scriptId: base.scriptId === assetId ? undefined : base.scriptId,
                                recordingIds: base.recordingIds.filter((id: string) => id !== assetId),
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
                              .flatMap((p: Project) => {
                                if (!p.scriptId) return [];
                                const s = p.assets.find((a: Asset) => a.id === p.scriptId);
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
                              .sort((a: any, b: any) => b.updatedAt - a.updatedAt);
                            ok(id, scripts);
                            break;
                          }
                          case 'SCRIPT.GET': {
                            const p = projects.find((x: Project) => x.id === payload.projectId);
                            if (!p || !p.scriptId) return ok(id, { name: null, text: '' });
                            const s = p.assets.find((a: Asset) => a.id === p.scriptId);
                            ok(id, { name: s?.name ?? null, text: s?.meta?.text ?? '' });
                            break;
                          }
                          case 'SCRIPT.SAVE': {
                            const { projectId, name, text } = payload as any;
                            setProjects((prev: Project[]) => {
                              const idx = prev.findIndex((x: Project) => x.id === projectId);
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
                              const next = [...prev];
                              next[idx] = updated;
                              save(next);
                              ok(id, { asset: a, scripts: updated.assets.filter((x: Asset) => x.kind === 'script') });
                              return next;
                            });
                            break;
                          }
                          case 'SEARCH': {
                            const q = typeof payload.query === 'string' ? payload.query.toLowerCase() : '';
                            const hits = projects
                              .filter(
                                (p: Project) =>
                                  p.title.toLowerCase().includes(q) ||
                                  p.assets.some(
                                    (a: Asset) =>
                                      (a.name?.toLowerCase() || '').includes(q) ||
                                      (a.meta?.text?.toLowerCase?.() || '').includes(q),
                                  ),
                              )
                              .map((p: Project) => ({ projectId: p.id, title: p.title }));
                            ok(id, hits);
                            break;
                          }
                          default: {
                            fail(id, 'unknown_message');
                            // Uncomment to enforce exhaustiveness during dev:
                            // assertNever(payload as never);
                            break;
                          }
                        }
                      } catch (e: unknown) {
                        if (e instanceof Error) fail(id, e.message);
                        else if (typeof e === 'string') fail(id, e);
                        else fail(id, 'Unknown error');
                      }
                    };
                    return () => ch.close();
                  }, []);
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

          <div className="tongs-sidebar-upload">
            <label htmlFor="script-upload" className="tongs-upload-label">
              Upload script (.txt, .md, .docx)
            </label>
            <input
              id="script-upload"
              type="file"
              accept=".txt,.md,.docx"
              className="tongs-input-file"
              onChange={handleScriptUpload}
              aria-label="Upload a script file for the current project"
              title="Upload a script file for the current project"
            />
          </div>

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
                      <Link to={`${PATHS.tongs}/${p.id}`} className="tongs-item" title={p.title}>
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}

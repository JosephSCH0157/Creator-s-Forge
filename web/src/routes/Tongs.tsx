// src/routes/tongs.tsx (skeleton)
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Project, Phase, Asset } from "@/tongs/types";

const STORE = "tongs:projects:v1";
const now = () => Date.now();
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function load(): Project[] { try { return JSON.parse(localStorage.getItem(STORE) || "[]"); } catch { return []; } }
function save(arr: Project[]) { localStorage.setItem(STORE, JSON.stringify(arr)); }

  const { projectId } = useParams();
  const nav = useNavigate();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(() => load());
  useEffect(() => save(projects), [projects]);

  // BroadcastChannel to serve Anvil
  useEffect(() => {
    const ch = new BroadcastChannel("creators-forge");
    const send = (msg:any) => ch.postMessage({ kind:"TONGS->TP", ...msg });
    ch.onmessage = (ev) => {
      const m = ev.data || {};
      if (m.kind !== "TP->TONGS") return;

      if (m.type === "REQUEST_PROJECTS_WITH_SCRIPTS") {
        const items = projects.filter(p=>p.scriptId).map(p=>({
          projectId: p.id, title: p.title, updatedAt: p.updatedAt
        }));
        send({ type:"PROJECTS_WITH_SCRIPTS", items });
      }

      if (m.type === "REQUEST_SCRIPT_FOR_PROJECT") {
        const p = projects.find(x=>x.id===m.projectId);
        const s = p?.assets.find(a=>a.id===p.scriptId);
        send({ type:"SCRIPT_DATA", projectId: p?.id, name: s?.name, text: s?.meta?.text ?? "" });
      }

      if (m.type === "SAVE_SCRIPT_FOR_PROJECT") {
        const { projectId, name, text } = m;
        setProjects(prev => {
          const idx = prev.findIndex(p=>p.id===projectId);
          if (idx < 0) return prev;
          const p = { ...prev[idx] };
          const asset: Asset = {
            id: uid(), kind:"script", name: name || "Untitled", createdAt: now(), meta: { text }
          };
          p.assets = [asset, ...p.assets];
          p.scriptId = asset.id;
          p.phase = p.phase === "idea" ? "script" : p.phase;
          p.updatedAt = now();
          const next = [...prev]; next[idx] = p; return next;
        });
        // after state updates apply, broadcast latest list
        const items = projects.filter(p=>p.scriptId).map(p=>({projectId:p.id,title:p.title,updatedAt:p.updatedAt}));
        send({ type:"SAVED", projectId, replyTo: m.id });
        send({ type:"PROJECTS_WITH_SCRIPTS", items });
      }

      if (m.type === "DELETE_SCRIPT_FOR_PROJECT") {
        const { projectId } = m;
        setProjects(prev => {
          const idx = prev.findIndex(p=>p.id===projectId);
          if (idx < 0) return prev;
          const p = { ...prev[idx] };
          p.assets = p.assets.filter((a: Asset) => a.id !== p.scriptId);
          p.scriptId = undefined;
          p.updatedAt = now();
          const next = [...prev]; next[idx] = p; return next;
        });
        send({ type:"DELETED", projectId });
      }

      if (m.type === "ATTACH_RECORDING") {
        const { projectId, asset } = m;
        setProjects(prev => {
          const idx = prev.findIndex(p=>p.id===projectId);
          if (idx < 0) return prev;
          const p = { ...prev[idx] };
          const a: Asset = { id: uid(), kind:"video", name: asset?.name || "Take", createdAt: now(), ...asset };
          p.assets = [a, ...p.assets];
          p.recordingIds = [a.id, ...p.recordingIds];
          p.phase = p.phase === "script" ? "recorded" : p.phase;
          p.updatedAt = now();
          const next = [...prev]; next[idx] = p; return next;
        });
      }
    };
    return () => ch.close();
  }, [projects]);

  // UI basics
  const [title, setTitle] = useState("");
  const createProject = () => {
    const p: Project = {
      id: uid(), title: title.trim() || "Untitled Project",
      phase:"idea", createdAt: now(), updatedAt: now(),
      assets: [], recordingIds: []
    };
    setProjects([p, ...projects]); setTitle(""); nav(`/tools/tongs/${p.id}`);
  };

  const current = useMemo(()=> projects.find(p=>p.id===projectId) || null, [projects, projectId]);

  return (
    <>
      <header>
        <button onClick={() => navigate('/forge')}>Return to Forge</button>
      </header>
      <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", height:"100vh", background:"#0b0f14", color:"#e8f0f7" }}>
      {/* Left: projects */}
      <aside style={{ borderRight:"1px solid #223243", padding:12, overflow:"auto" }}>
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="New project title"
                 style={{ flex:1, padding:"8px 10px", borderRadius:8, border:"1px solid #233242", background:"#0e141b", color:"#e5eef7" }}/>
          <button onClick={createProject}>New</button>
        </div>
        {["idea","script","recorded","edited","published"].map(ph => (
          <div key={ph} style={{ marginBottom:10 }}>
            <div style={{ opacity:.7, fontSize:12, margin:"6px 0" }}>{ph.toUpperCase()}</div>
            {(projects.filter(p=>p.phase===ph) || []).map(p => (
              <Link key={p.id} to={`/tools/tongs/${p.id}`} style={{ display:"block", color:"#e5eef7", textDecoration:"none", padding:"8px 10px", borderRadius:8, border:"1px solid #233242", marginBottom:6 }}>
                {p.title}
              </Link>
            ))}
          </div>
        ))}
      </aside>

      {/* Right: project detail */}
      <main style={{ padding:16, overflow:"auto" }}>
        {!current ? <p>Select or create a project.</p> : (
          <>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <h1 style={{ margin:0 }}>{current.title}</h1>
              <span style={{ padding:"4px 8px", borderRadius:999, background:"#14202b", border:"1px solid #223243", fontSize:12 }}>{current.phase}</span>
              <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
                <Link to="/">Back to Forge</Link>
              </div>
            </div>

            {/* Script card */}
            <section style={{ marginTop:16, padding:12, border:"1px solid #223243", borderRadius:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <strong>Script</strong>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>{
                    // open Anvil (Teleprompter) in same tab
                    window.location.href = "/tools/anvil";
                    // let TP know which project to load
                    new BroadcastChannel("creators-forge").postMessage({ kind:"TONGS->TP", type:"REQUEST_SCRIPT_FOR_PROJECT", projectId: current.id });
                  }}>Open in Teleprompter</button>
                </div>
              </div>
              {current.scriptId ? (
                <p style={{ opacity:.8, marginTop:8 }}>
                  Current script: {current.assets.find(a=>a.id===current.scriptId)?.name}
                </p>
              ) : <p style={{ opacity:.6, marginTop:8 }}>No script attached yet.</p>}
            </section>

            {/* Recordings */}
            <section style={{ marginTop:16, padding:12, border:"1px solid #223243", borderRadius:12 }}>
              <strong>Recordings</strong>
              <ul style={{ listStyle:"none", padding:0, marginTop:8 }}>
                {current.recordingIds.map(id => {
                  const a = current.assets.find(x=>x.id===id);
                  return <li key={id} style={{ padding:"6px 0", borderBottom:"1px solid #18232f" }}>{a?.name || id}</li>;
                })}
              </ul>
            </section>
          </>
        )}
      </main>
      </div>
    </>
  );
}

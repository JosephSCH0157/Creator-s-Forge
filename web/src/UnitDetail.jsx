import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API = "http://127.0.0.1:5177";

export default function UnitDetail() {
  const { id } = useParams();
  const [unit, setUnit] = useState(null);
  const [tab, setTab] = useState("scripts");
  const [scripts, setScripts] = useState([]);
  const [assets, setAssets] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [events, setEvents] = useState([]);
  const [err, setErr] = useState("");

  async function loadAll() {
    setErr("");
    try {
      const [u, s, a, up, ev] = await Promise.all([
        fetch(`${API}/units/${id}`).then(r => r.json()),
        fetch(`${API}/units/${id}/scripts`).then(r => r.json()),
        fetch(`${API}/units/${id}/assets`).then(r => r.json()),
        fetch(`${API}/units/${id}/uploads`).then(r => r.json()),
        fetch(`${API}/units/${id}/events`).then(r => r.json()),
      ]);
      setUnit(u); setScripts(s); setAssets(a); setUploads(up); setEvents(ev);
    } catch (e) {
      setErr(String(e));
    }
  }
  useEffect(() => { loadAll(); }, [id]);

  if (!unit) return <div style={{ padding: 24, fontFamily: "system-ui" }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 960, margin: "2rem auto", fontFamily: "system-ui, Segoe UI, Arial" }}>
      <Link to="/" style={{ textDecoration: "none" }}>← Back</Link>
      <h1 style={{ margin: "8px 0" }}>{unit.title}</h1>
      <div style={{ color: "#6b7280", marginBottom: 12 }}>
        <b>Status:</b> {unit.status} &nbsp;|&nbsp; <b>Kind:</b> {unit.kind} &nbsp;|&nbsp; <b>Id:</b> <code>{unit.id}</code>
      </div>

      <Tabs tab={tab} setTab={setTab} />

      {err && <div style={{ color: "crimson", marginTop: 8 }}>Error: {err}</div>}

      {tab === "scripts" && <Scripts id={id} scripts={scripts} onChange={loadAll} />}
      {tab === "assets"  && <Assets  id={id} assets={assets} onChange={loadAll} />}
      {tab === "uploads" && <Uploads id={id} uploads={uploads} onChange={loadAll} />}
      {tab === "events"  && <Events  events={events} />}
      <StatusControls id={id} onChange={loadAll} />
    </div>
  );
}

function Tabs({ tab, setTab }) {
  const tabs = ["scripts", "assets", "uploads", "events"];
  return (
    <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
      {tabs.map(t => (
        <button key={t}
          onClick={() => setTab(t)}
          style={{ padding: "6px 10px", background: tab === t ? "#111827" : "#e5e7eb", color: tab === t ? "white" : "black", border: 0, borderRadius: 6 }}>
          {t}
        </button>
      ))}
    </div>
  );
}

function Scripts({ id, scripts, onChange }) {
  const [content, setContent] = useState("");
  async function createScript(e) {
    e.preventDefault();
    if (!content.trim()) return;
    await fetch(`${API}/units/${id}/scripts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "teleprompter", content, markup: { cues: [] } }),
    }).then(r => r.ok ? r.json() : r.json().then(x => Promise.reject(x)));
    setContent("");
    onChange();
  }
  return (
    <section>
      <h3>Scripts</h3>
      <form onSubmit={createScript} style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} placeholder="Teleprompter text…" style={{ width: "100%", padding: 8 }} />
        <button type="submit">Add Script Version</button>
      </form>
      {scripts.length === 0 ? <div>No scripts yet.</div> : (
        <ul>
          {scripts.map(s => (
            <li key={s.id}>
              <b>v{s.version}</b> &nbsp; <code>{s.kind}</code> &nbsp; <small>{new Date(s.created_at).toLocaleString()}</small>
              <pre style={{ whiteSpace: "pre-wrap", background: "#f9fafb", padding: 8 }}>{s.content}</pre>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Assets({ id, assets, onChange }) {
  const [role, setRole] = useState("thumbnail");
  const [uri, setUri] = useState("");
  async function addAsset(e) {
    e.preventDefault();
    await fetch(`${API}/units/${id}/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, storage_uri: uri, meta: {} }),
    }).then(r => r.ok ? r.json() : r.json().then(x => Promise.reject(x)));
    setUri(""); onChange();
  }
  return (
    <section>
      <h3>Assets</h3>
      <form onSubmit={addAsset} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <select value={role} onChange={e => setRole(e.target.value)}>
          {["raw_video","raw_audio","mixdown","render","thumbnail","transcript","image","document"].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <input value={uri} onChange={e => setUri(e.target.value)} placeholder="file://C:/path/to/file" style={{ flex: 1, padding: 8 }} />
        <button type="submit">Add</button>
      </form>
      {assets.length === 0 ? <div>No assets yet.</div> : (
        <table width="100%" cellPadding="6" style={{ borderCollapse: "collapse" }}>
          <thead><tr><th>Role</th><th>URI</th><th>When</th></tr></thead>
          <tbody>
            {assets.map(a => (
              <tr key={a.id} style={{ borderTop: "1px solid #eee" }}>
                <td>{a.role}</td>
                <td style={{ fontFamily: "monospace" }}>{a.storage_uri}</td>
                <td>{new Date(a.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function Uploads({ id, uploads, onChange }) {
  const [platform, setPlatform] = useState("youtube");
  const [visibility, setVisibility] = useState("unlisted");
  async function createUpload(e) {
    e.preventDefault();
    await fetch(`${API}/units/${id}/uploads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, status: "pending", request: { visibility } }),
    }).then(r => r.ok ? r.json() : r.json().then(x => Promise.reject(x)));
    onChange();
  }
  return (
    <section>
      <h3>Uploads</h3>
      <form onSubmit={createUpload} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <select value={platform} onChange={e => setPlatform(e.target.value)}>
          {["youtube","rumble","spotify"].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={visibility} onChange={e => setVisibility(e.target.value)}>
          {["public","unlisted","private"].map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <button type="submit">Create</button>
      </form>

      {uploads.length === 0 ? <div>No uploads yet.</div> : (
        <table width="100%" cellPadding="6" style={{ borderCollapse: "collapse" }}>
          <thead><tr><th>Platform</th><th>Status</th><th>Created</th><th>Id</th></tr></thead>
          <tbody>
            {uploads.map(u => (
              <tr key={u.id} style={{ borderTop: "1px solid #eee" }}>
                <td>{u.platform}</td>
                <td>{u.status}</td>
                <td>{new Date(u.created_at).toLocaleString()}</td>
                <td style={{ fontFamily: "monospace", fontSize: 12 }}>{u.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function Events({ events }) {
  return (
    <section>
      <h3>Events</h3>
      {events.length === 0 ? <div>No events yet.</div> : (
        <ul>
          {events.map(ev => (
            <li key={ev.id}>
              <b>{ev.type}</b> — <small>{new Date(ev.created_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StatusControls({ id, onChange }) {
  const [to, setTo] = useState("ready_to_upload");
  const options = ["idea","script","recording","edit","packaging","ready_to_upload","scheduled","published","archived","canceled"];
  async function move() {
    await fetch(`${API}/units/${id}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to }),
    }).then(r => r.ok ? r.json() : r.json().then(x => Promise.reject(x)));
    onChange();
  }
  return (
    <div style={{ marginTop: 24 }}>
      <h3>Transition</h3>
      <div style={{ display: "flex", gap: 8 }}>
        <select value={to} onChange={e => setTo(e.target.value)}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <button onClick={move}>Move</button>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const API = "http://127.0.0.1:5177";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

type UnitKind = "video" | "podcast" | "short" | "livestream";

export interface Unit {
  id: string;
  title: string;
  status: string;
  kind: UnitKind;
  updated_at: string | number | Date;
}

function isUnit(x: unknown): x is Unit {
  if (typeof x !== "object" || x === null) return false;
  const u = x as Record<string, unknown>;
  return (
    typeof u.id === "string" &&
    typeof u.title === "string" &&
    typeof u.status === "string" &&
    typeof u.kind === "string" &&
    ["video", "podcast", "short", "livestream"].includes(u.kind as string) &&
    (typeof u.updated_at === "string" ||
      typeof u.updated_at === "number" ||
      u.updated_at instanceof Date)
  );
}

export default function Units() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [title, setTitle] = useState<string>("");
  const [kind, setKind] = useState<UnitKind>("video");
  const slug = useMemo(() => slugify(title), [title]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load(): Promise<void> {
    const res = await fetch(`${API}/units`);
    const data: unknown = await res.json();
    const list = Array.isArray(data) ? data.filter(isUnit) : [];
    setUnits(list);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createUnit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setErr("");
    if (!title.trim() || !slug) {
      setErr("Title is required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/units`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, kind }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: unknown };
        throw new Error(typeof body.message === "string" ? body.message : `HTTP ${res.status}`);
      }
      setTitle("");
      setKind("video");
      await load();
    } catch (e: unknown) {
      setErr(e && typeof e === "object" && "message" in e ? String((e as any).message) : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", fontFamily: "system-ui, Segoe UI, Arial" }}>
      <h1 style={{ marginBottom: 12 }}>Tongs — Units</h1>

      <form onSubmit={(e) => void createUnit(e)} style={{ display: "grid", gap: 8, marginBottom: 24 }}>
        <label>
          <div>Title</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My First Unit"
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          <div>Slug (auto)</div>
          <input
            value={slug}
            readOnly
            style={{ width: "100%", padding: 8, background: "#f6f6f6" }}
          />
        </label>

        <label>
          <div>Kind</div>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as UnitKind)}
            style={{ padding: 8 }}
          >
            <option value="video">video</option>
            <option value="podcast">podcast</option>
            <option value="short">short</option>
            <option value="livestream">livestream</option>
          </select>
        </label>

        <button type="submit" disabled={loading} style={{ padding: "8px 12px" }}>
          {loading ? "Creating..." : "Create Unit"}
        </button>

        {err && <div style={{ color: "crimson" }}>Error: {err}</div>}
      </form>

      <table width="100%" cellPadding={8} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", background: "#f3f4f6" }}>
            <th>Title</th>
            <th>Status</th>
            <th>Kind</th>
            <th>Updated</th>
            <th>Id</th>
          </tr>
        </thead>
        <tbody>
          {units.map((u) => (
            <tr key={u.id} style={{ borderTop: "1px solid #e5e7eb" }}>
              <td>
                <Link to={`/units/${u.id}`} style={{ textDecoration: "none" }}>
                  {u.title}
                </Link>
              </td>
              <td>{u.status}</td>
              <td>{u.kind}</td>
              <td>{new Date(u.updated_at).toLocaleString()}</td>
              <td style={{ fontFamily: "monospace", fontSize: 12 }}>{u.id}</td>
            </tr>
          ))}
          {units.length === 0 && (
            <tr>
              <td colSpan={5} style={{ color: "#6b7280", paddingTop: 16 }}>
                No units yet. Create one above.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

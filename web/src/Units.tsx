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
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");

  async function load(): Promise<void> {
    const res = await fetch(`${API}/units`);
    const data: unknown = await res.json();

    // Narrow the response to Unit[]
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
        const errBody = (await res.json().catch(() => ({}))) as {
          message?: unknown;
        };
        throw new Error(
          typeof errBody.message === "string"
            ? errBody.message
            : `HTTP ${res.status}`,
        );
      }
      setTitle("");
      setKind("video");
      await load();
    } catch (e: unknown) {
      if (e && typeof e === "object" && "message" in e) {
        setErr(String((e as { message?: unknown }).message));
      } else {
        setErr("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "2rem auto",
        fontFamily: "system-ui, Segoe UI, Arial",
      }}
    >
      <h1 style={{ marginBottom: 12 }}>Tongs — Units</h1>

      {/* Use the wrapper to satisfy no-misused-promises */}
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
            readO

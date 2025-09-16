import React, { type JSX, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://127.0.0.1:5177";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

type Unit = {
  id: string | number;
  title: string;
  status?: string;
  kind?: string;
  updated_at?: string | number | Date;
};

export default function Units(): JSX.Element {
  const [units, setUnits] = useState<Unit[]>([]);
  const [title, setTitle] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    void load();
  }, []);

  async function load(): Promise<void> {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${API}/units`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Unit[];
      setUnits(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(`Failed to load units: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  async function createUnit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setErr(null);
    try {
      const body = { title, slug: slugify(title) };
      const res = await fetch(`${API}/units`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created = (await res.json()) as Unit;
      setUnits((prev) => [created, ...prev]);
      setTitle("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(`Failed to create unit: ${msg}`);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Units</h1>

      {err && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm">
          {err}
        </div>
      )}

      <form onSubmit={(e) => { void createUnit(e); }} className="mb-6 flex gap-3 items-end">
        <div className="flex flex-col">
          <label htmlFor="title" className="text-sm mb-1">
            Title
          </label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded px-2 py-1"
            placeholder="New unit title"
          />
        </div>

        <button
          type="submit"
          className="border rounded px-3 py-1"
          disabled={!title.trim()}
        >
          Create
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-[640px] w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left pb-2 border-b">Title</th>
              <th className="text-left pb-2 border-b">Status</th>
              <th className="text-left pb-2 border-b">Kind</th>
              <th className="text-left pb-2 border-b">Updated</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="py-3" colSpan={4}>
                  Loading…
                </td>
              </tr>
            )}

            {!loading && units.length === 0 && (
              <tr>
                <td className="py-3" colSpan={4}>
                  No units yet.
                </td>
              </tr>
            )}

            {!loading &&
              units.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="py-2">
                    {/* Was: // replace <td>{u.title}</td> with: */}
                    <Link to={`/units/${u.id}`} style={{ textDecoration: "none" }}>
                      {u.title}
                    </Link>
                  </td>
                  <td className="py-2">{u.status ?? "-"}</td>
                  <td className="py-2">{u.kind ?? "-"}</td>
                  <td className="py-2">
                    {u.updated_at ? new Date(u.updated_at).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

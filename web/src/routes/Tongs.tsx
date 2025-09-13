// /src/routes/Tongs.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// --- Types & storage ---
type Doc = {
  id: string;
  name: string;
  phase: "script" | "idea" | "draft";
  text: string;
  updatedAt: number;
};

const LIST_KEY = "tongs:docs:v1";

function loadAll(): Doc[] {
  try {
    return JSON.parse(localStorage.getItem(LIST_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveAll(docs: Doc[]) {
  localStorage.setItem(LIST_KEY, JSON.stringify(docs));
}
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

// --- Component ---
export default function Tongs() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Doc[]>(() => loadAll());
  const [filter, setFilter] = useState<"script" | "all">("script");
  const [editing, setEditing] = useState<Doc | null>(null);

  // Persist to localStorage whenever docs change
  useEffect(() => saveAll(docs), [docs]);

  // --- BroadcastChannel: serve Teleprompter (Anvil) ---
  useEffect(() => {
    const CH = new BroadcastChannel("creators-forge");
    const send = (msg: any) => CH.postMessage({ kind: "TONGS->TP", ...msg });

    CH.onmessage = (ev) => {
      const msg = ev.data || {};
      if (msg.kind !== "TP->TONGS") return;

      // Teleprompter asks for list of scripts
      if (msg.type === "REQUEST_SCRIPT_INDEX") {
        const items = docs
          .filter((d) => d.phase === "script")
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .map((d) => ({ id: d.id, name: d.name }));
        send({ type: "SCRIPT_INDEX", items, replyTo: msg.id });
      }

      // Teleprompter asks for a specific script
      if (msg.type === "REQUEST_SCRIPT") {
        const d = docs.find((x) => x.id === msg.id);
        if (d)
          send({
            type: "SCRIPT_DATA",
            id: d.id,
            name: d.name,
            text: d.text,
            replyTo: msg.id,
          });
        else send({ type: "SCRIPT_DATA", error: "not_found", replyTo: msg.id });
      }

      // Teleprompter saves a script
      if (msg.type === "SAVE_SCRIPT") {
        const { name, text } = msg.payload || {};
        const doc: Doc = {
          id: uid(),
          name: String(name || "Untitled").trim() || "Untitled",
          phase: "script",
          text: String(text || ""),
          updatedAt: Date.now(),
        };
        const next = [doc, ...docs].slice(0, 500);
        setDocs(next);
        send({ type: "SAVED", id: doc.id, name: doc.name, replyTo: msg.id });

        // broadcast fresh index
        const items = next
          .filter((d) => d.phase === "script")
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .map((d) => ({ id: d.id, name: d.name }));
        send({ type: "SCRIPT_INDEX", items });
      }

      // Teleprompter deletes a script
      if (msg.type === "DELETE_SCRIPT") {
        const next = docs.filter((d) => d.id !== msg.id);
        setDocs(next);
        send({ type: "DELETED", id: msg.id, replyTo: msg.id });
        const items = next
          .filter((d) => d.phase === "script")
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .map((d) => ({ id: d.id, name: d.name }));
        send({ type: "SCRIPT_INDEX", items });
      }
    };

    return () => CH.close();
  }, [docs]);

  const visible = useMemo(
    () => (filter === "script" ? docs.filter((d) => d.phase === "script") : docs),
    [docs, filter]
  );

  return (
    <div style={{ display: "grid", gridTemplateRows: "48px 1fr", height: "100vh", background: "#0b0f14" }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 16px",
          borderBottom: "1px solid #233242",
          background: "#111827",
          color: "#fff",
        }}
      >
        <img src="/tongs.png" alt="" style={{ width: 24, height: 24, objectFit: "contain" }} />
        <button onClick={() => navigate("/forge")} style={{ color: "#fff", background: "transparent", border: 0, fontWeight: 600, cursor: "pointer" }}>
          Back to Creator’s Forge
        </button>
        <div style={{ marginLeft: "auto", opacity: 0.8, fontSize: 12 }}>Tongs · Script storage</div>
      </div>

      {/* Body */}
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 0, minHeight: 0, color: "#e5eef7" }}>
        {/* Left panel */}
        <aside style={{ padding: 16, borderRight: "1px solid #233242", overflow: "auto" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button onClick={() => setFilter(filter === "script" ? "all" : "script")}>
              {filter === "script" ? "Show: Scripts" : "Show: All"}
            </button>
            <button
              onClick={() =>
                setEditing({ id: "", name: "New Script", phase: "script", text: "", updatedAt: Date.now() })
              }
            >
              New script
            </button>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {visible.map((d) => (
              <li key={d.id} style={{ padding: "8px 6px", border: "1px solid #233242", marginBottom: 8, borderRadius: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>{d.name}</strong>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setEditing(d)}>Edit</button>
                    <button onClick={() => setDocs((prev) => prev.filter((x) => x.id !== d.id))}>Delete</button>
                  </div>
                </div>
                <div style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>
                  {d.phase} · {new Date(d.updatedAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Right editor */}
        <main style={{ padding: 16, overflow: "auto" }}>
          {!editing ? (
            <p style={{ color: "#c7d1db" }}>Select a script on the left or create a new one.</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setDocs((prev) => {
                  if (!editing.id) {
                    // Create new
                    const id = uid();
                    return [{ ...editing, id, updatedAt: Date.now(), phase: "script" }, ...prev];
                  }
                  // Update existing
                  return prev.map((d) => (d.id === editing.id ? { ...editing, updatedAt: Date.now() } : d));
                });
                setEditing(null);
              }}
              style={{ display: "grid", gap: 12 }}
            >
              <input
                value={editing.name}
                onChange={(e) => setEditing((s) => s && { ...s, name: e.target.value })}
                placeholder="Name"
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #233242",
                  background: "#0e141b",
                  color: "#e5eef7",
                }}
              />
              <textarea
                value={editing.text}
                onChange={(e) => setEditing((s) => s && { ...s, text: e.target.value })}
                placeholder="Script text"
                rows={18}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #233242",
                  background: "#0e141b",
                  color: "#e5eef7",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditing(null)}>
                  Cancel
                </button>
              </div>
              <p style={{ opacity: 0.75, fontSize: 12 }}>
                Tip: Saving here will also make it available to Teleprompter.
              </p>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}

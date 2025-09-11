// src/forgeBus.tsx
import * as React from "react";

type Phase = "idea" | "script" | "record" | "published";
export type ForgeDoc = {
  id: string;
  name: string;
  phase: Phase;
  content: string;
  updated: number;
};

const STORE_KEY = "tongs:docs:v1";

function loadAll(): ForgeDoc[] {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); }
  catch { return []; }
}
function saveAll(docs: ForgeDoc[]) {
  localStorage.setItem(STORE_KEY, JSON.stringify(docs));
}

function nowId() {
  // sortable & unique enough for local use
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,7);
}

export function useForgeBus() {
  React.useEffect(() => {
    const CH = "creators-forge";
    const bc = ("BroadcastChannel" in window) ? new BroadcastChannel(CH) : null;

    function post(msg: any) {
      if (bc) bc.postMessage(msg);
      else localStorage.setItem("__forge_bus__", JSON.stringify({ ...msg, ts: Date.now() }));
    }

    function onMsg(msg: any) {
      if (!msg || !msg.type) return;
      const docs = loadAll();

      // Only include SCRIPT phase docs in the index when requested
      if (msg.type === "REQUEST_SCRIPT_INDEX") {
        const items = docs
          .filter(d => d.phase === "script")
          .sort((a,b) => b.updated - a.updated)
          .map(d => ({ id: d.id, name: d.name, updated: d.updated }));
        post({ type: "SCRIPT_INDEX", items });
      }

      if (msg.type === "REQUEST_SCRIPT" && msg.id) {
        const d = docs.find(x => x.id === msg.id);
        if (d) {
          post({ type: "SCRIPT_READY", id: d.id, payload: { title: d.name, content: d.content } });
        } else {
          post({ type: "OP_RESULT", ok: false, message: "Script not found." });
        }
      }

      if (msg.type === "SAVE_SCRIPT" && msg.payload) {
        const { name, content, phase } = msg.payload as { name: string; content: string; phase?: Phase; };
        const id = nowId();
        const doc: ForgeDoc = {
          id,
          name: (name || "Untitled").trim() || "Untitled",
          content: content || "",
          phase: phase || "script",
          updated: Date.now(),
        };
        docs.unshift(doc);
        saveAll(docs);
        post({ type: "OP_RESULT", ok: true, message: `Saved "${doc.name}".`, refreshIndex: true });
      }

      if (msg.type === "DELETE_SCRIPT" && msg.id) {
        const idx = docs.findIndex(x => x.id === msg.id);
        if (idx >= 0) {
          const [gone] = docs.splice(idx, 1);
          saveAll(docs);
          post({ type: "OP_RESULT", ok: true, message: `Deleted "${gone?.name || msg.id}".`, refreshIndex: true });
        } else {
          post({ type: "OP_RESULT", ok: false, message: "Nothing to delete." });
        }
      }
    }

    function storageEcho(e: StorageEvent) {
      if (e.key === "__forge_bus__" && e.newValue) {
        try { onMsg(JSON.parse(e.newValue)); } catch {}
      }
    }

    if (bc) bc.onmessage = (e) => onMsg(e.data);
    window.addEventListener("storage", storageEcho);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("storage", storageEcho);
    };
  }, []);

  return null;
}

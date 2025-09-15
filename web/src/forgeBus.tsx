// src/forgeBus.tsx
import * as React from "react";

type Phase = "idea" | "script" | "record" | "published";
export type ForgeDoc = { id: string; name: string; phase: Phase; content: string; updated: number; };

const STORE_KEY = "tongs:docs:v1";
const QK = "__forge_bus_queue__";
const CH = "creators-forge";

function loadAll(): ForgeDoc[] { try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); } catch { return []; } }
function saveAll(docs: ForgeDoc[]) { localStorage.setItem(STORE_KEY, JSON.stringify(docs)); }
function nowId(){ return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,7); }

function popQueue(): any[] {
  try {
    const q = JSON.parse(localStorage.getItem(QK) || "[]");
    localStorage.setItem(QK, JSON.stringify([]));
    return Array.isArray(q) ? q : [];
  } catch { return []; }
}

export function useForgeBus() {
  React.useEffect(() => {
    const bc = ("BroadcastChannel" in window) ? new BroadcastChannel(CH) : null;
    function post(msg: any){
      if (bc) bc.postMessage(msg);
      else localStorage.setItem("__forge_bus__", JSON.stringify({ ...msg, ts: Date.now() }));
    }

    function respondIndex(){
      const docs = loadAll();
      const items = docs
        .filter(d => d.phase === "script")
        .sort((a,b) => b.updated - a.updated)
        .map(d => ({ id: d.id, name: d.name, updated: d.updated }));
      post({ type: "SCRIPT_INDEX", items });
    }

    function handle(msg: any) {
      if (!msg || !msg.type) return;
      const docs = loadAll();

      if (msg.type === "REQUEST_SCRIPT_INDEX") {
        respondIndex();
      }

      if (msg.type === "REQUEST_SCRIPT" && msg.id) {
        const d = docs.find(x => x.id === msg.id);
        if (d) post({ type: "SCRIPT_READY", id: d.id, payload: { title: d.name, content: d.content } });
        else post({ type: "OP_RESULT", ok: false, message: "Script not found." });
      }

      if (msg.type === "SAVE_SCRIPT" && msg.payload) {
        const { name, content, phase } = msg.payload as { name: string; content: string; phase?: Phase; };
        const doc: ForgeDoc = {
          id: nowId(),
          name: (name || "Untitled").trim() || "Untitled",
          content: content || "",
          phase: phase || "script",
          updated: Date.now(),
        };
        docs.unshift(doc);
        saveAll(docs);
        post({ type: "OP_RESULT", ok: true, message: `Saved "${doc.name}".`, refreshIndex: true });
        respondIndex();
      }

      if (msg.type === "DELETE_SCRIPT" && msg.id) {
        const i = docs.findIndex(x => x.id === msg.id);
        if (i >= 0) {
          const gone = docs.splice(i, 1)[0];
          saveAll(docs);
          post({ type: "OP_RESULT", ok: true, message: `Deleted "${gone?.name || msg.id}".`, refreshIndex: true });
          respondIndex();
        } else {
          post({ type: "OP_RESULT", ok: false, message: "Nothing to delete." });
        }
      }
    }

    function onMessage(e: MessageEvent){ handle(e.data); }
    function onStorage(e: StorageEvent){
      // 1) live messages
      if (e.key === "__forge_bus__" && e.newValue) {
        try { handle(JSON.parse(e.newValue)); } catch {}
      }
      // 2) queued backlog (e.g., Teleprompter saved before Tongs was open)
      if (e.key === QK && (e.newValue || e.oldValue)) {
        const backlog = popQueue();
        backlog.forEach(handle);
        // after draining, refresh index for any listeners
        respondIndex();
      }
    }

    // DRain any backlog immediately on startup
    const startupBacklog = popQueue();
    startupBacklog.forEach(handle);
    respondIndex(); // make Teleprompter’s dropdown populate right away

    if (bc) bc.onmessage = onMessage;
    window.addEventListener("storage", onStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return null;
}

import * as React from "react";

type Phase = "idea" | "script" | "record" | "published";

export type ForgeDoc = {
  id: string;
  name: string;
  phase: Phase;
  content: string;
  updated: number; // epoch ms
};

type ScriptIndexItem = Pick<ForgeDoc, "id" | "name" | "updated">;

type RequestMsg =
  | { type: "REQUEST_SCRIPT_INDEX" }
  | { type: "REQUEST_SCRIPT"; id: string }
  | { type: "SAVE_SCRIPT"; payload: { name: string; content: string; phase?: Phase } }
  | { type: "DELETE_SCRIPT"; id: string };

type ResponseMsg =
  | { type: "SCRIPT_INDEX"; items: ScriptIndexItem[] }
  | { type: "SCRIPT_READY"; id: string; payload: { title: string; content: string } }
  | { type: "OP_RESULT"; ok: boolean; message: string; refreshIndex?: boolean };

type BusMsg = RequestMsg | ResponseMsg;

const STORE_KEY = "tongs:docs:v1";
const QK = "__forge_bus_queue__";
const CH = "creators-forge";

function loadAll(): ForgeDoc[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as ForgeDoc[]) : [];
  } catch {
    return [];
  }
}

function saveAll(docs: ForgeDoc[]): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(docs));
}

function nowId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function popQueue(): BusMsg[] {
  try {
    const q = JSON.parse(localStorage.getItem(QK) || "[]") as BusMsg[];
    localStorage.setItem(QK, JSON.stringify([]));
    return Array.isArray(q) ? q : [];
  } catch {
    return [];
  }
}

export function useForgeBus(): null {
  React.useEffect(() => {
    const bc: BroadcastChannel | null =
      "BroadcastChannel" in window ? new BroadcastChannel(CH) : null;

    const post = (msg: BusMsg): void => {
      if (bc) {
        bc.postMessage(msg);
      } else {
        // Fallback path using localStorage ping
        localStorage.setItem("__forge_bus__", JSON.stringify({ ...msg, ts: Date.now() }));
      }
    };

    const respondIndex = (): void => {
      const docs = loadAll();
      const items: ScriptIndexItem[] = docs
        .filter((d) => d.phase === "script")
        .sort((a, b) => b.updated - a.updated)
        .map((d) => ({ id: d.id, name: d.name, updated: d.updated }));
      post({ type: "SCRIPT_INDEX", items });
    };

    const handle = (msg: BusMsg): void => {
      // Only act on requests
      const docs = loadAll();

      switch (msg.type) {
        case "REQUEST_SCRIPT_INDEX": {
          respondIndex();
          break;
        }

        case "REQUEST_SCRIPT": {
          const d = docs.find((x) => x.id === msg.id);
          if (d) {
            post({
              type: "SCRIPT_READY",
              id: d.id,
              payload: { title: d.name, content: d.content },
            });
          } else {
            post({ type: "OP_RESULT", ok: false, message: "Script not found." });
          }
          break;
        }

        case "SAVE_SCRIPT": {
          const { name, content, phase } = msg.payload;
          const doc: ForgeDoc = {
            id: nowId(),
            name: (name || "Untitled").trim() || "Untitled",
            content: content || "",
            phase: phase ?? "script",
            updated: Date.now(),
          };
          const next = [doc, ...docs];
          saveAll(next);
          post({
            type: "OP_RESULT",
            ok: true,
            message: `Saved "${doc.name}".`,
            refreshIndex: true,
          });
          respondIndex();
          break;
        }

        case "DELETE_SCRIPT": {
          const i = docs.findIndex((x) => x.id === msg.id);
          if (i >= 0) {
            const [gone] = docs.splice(i, 1);
            saveAll(docs);
            post({
              type: "OP_RESULT",
              ok: true,
              message: `Deleted "${gone?.name ?? msg.id}".`,
              refreshIndex: true,
            });
            respondIndex();
          } else {
            post({ type: "OP_RESULT", ok: false, message: "Nothing to delete." });
          }
          break;
        }

        // responses are ignored here
        default:
          break;
      }
    };

    const onMessage = (e: MessageEvent<BusMsg>): void => {
      void handle(e.data);
    };

    const onStorage = (e: StorageEvent): void => {
      try {
        if (e.key === "__forge_bus__" && e.newValue) {
          const parsed = JSON.parse(e.newValue) as BusMsg;
          void handle(parsed);
        }
        if (e.key === QK && (e.newValue || e.oldValue)) {
          const backlog = popQueue();
          backlog.forEach((m) => void handle(m));
          respondIndex();
        }
      } catch {
        // swallow malformed messages
      }
    };

    // Drain any queued messages & publish initial index
    popQueue().forEach((m) => void handle(m));
    respondIndex();

    if (bc) bc.onmessage = onMessage;
    window.addEventListener("storage", onStorage);
    return () => {
      if (bc) bc.close();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return null;
}

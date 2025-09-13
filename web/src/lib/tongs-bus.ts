// web/src/lib/tongs-bus.ts
// Pure IPC client for Podcaster's Forge. No React. No state.
// Tools import this and call request({...}) to talk to TONGS (the server).

import type { BusRequest, BusResponse } from "../tongs/types";

const CH_NAME = "podcasters-forge:v1";
const REQ = "REQ:";
const RSP = "RSP:";

export function createTongsBus(timeoutMs = 5000) {
  const ch = new BroadcastChannel(CH_NAME);
  let seq = 0;

  // id -> { resolve, reject, timer }
  const pending = new Map<
    string,
    { resolve: (v: BusResponse) => void; reject: (e: any) => void; timer: number }
  >();

  ch.onmessage = (ev) => {
    const msg = ev.data || {};
    if (msg.kind !== RSP) return; // ignore non-responses
    const entry = pending.get(msg.id);
    if (!entry) return;
    clearTimeout(entry.timer);
    pending.delete(msg.id);
    entry.resolve(msg.payload as BusResponse);
  };

  function request(payload: BusRequest): Promise<BusResponse> {
    const id = `${Date.now().toString(36)}-${seq++}`;
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => {
        pending.delete(id);
        reject(new Error("TONGS timeout"));
      }, timeoutMs);
      pending.set(id, { resolve, reject, timer });
      ch.postMessage({ kind: REQ, id, payload });
    });
  }

  function close() {
    // fail-safe: reject all inflight if closed
    for (const [id, entry] of pending) {
      clearTimeout(entry.timer);
      entry.reject(new Error("TONGS closed"));
      pending.delete(id);
    }
    ch.close();
  }

  return { request, close };
}

// Convenience helpers (optional)
export async function listScripts() {
  const bus = createTongsBus();
  try { return await bus.request({ type: "SCRIPT.INDEX" }); }
  finally { bus.close(); }
}
export async function saveScript(projectId: string, name: string, text: string) {
  const bus = createTongsBus();
  try { return await bus.request({ type: "SCRIPT.SAVE", projectId, name, text }); }
  finally { bus.close(); }
}
export async function getProjectScript(projectId: string) {
  const bus = createTongsBus();
  try { return await bus.request({ type: "SCRIPT.GET", projectId }); }
  finally { bus.close(); }
}

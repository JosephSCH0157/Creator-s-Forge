// web/src/lib/tongs-bus.ts
// Pure IPC client for Podcaster's Forge. No React. No state.
// Tools import this and call request({...}) to talk to TONGS.

const CH_NAME = 'podcasters-forge:v1';
const REQ = 'REQ:';
const RSP = 'RSP:';

type RspOk = { ok: true; data?: unknown };
type RspErr = { ok: false; error: string };
export type ApiRsp = RspOk | RspErr;

type ReqMsg = { kind: typeof REQ; id: string; payload: unknown };
type RspMsg = { kind: typeof RSP; id: string; payload: ApiRsp };

// Small helpers
function isRecord(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === 'object';
}
function isApiRsp(x: unknown): x is ApiRsp {
  return isRecord(x) && 'ok' in x && typeof (x as ApiRsp).ok === 'boolean';
}
function isRspMsg(x: unknown): x is RspMsg {
  return (
    isRecord(x) &&
    x.kind === RSP &&
    typeof x.id === 'string' &&
    isApiRsp(x.payload)
  );
}

/**
 * Create a tiny request client around a BroadcastChannel.
 * @param timeoutMs request timeout in ms (default 5000)
 */
export function createTongsBus(timeoutMs = 5000) {
  const ch = new BroadcastChannel(CH_NAME);
  let seq = 0;

  type Pending = {
    resolve: (v: ApiRsp) => void;
    reject: (e: unknown) => void;
    timer: number;
  };

  const pending = new Map<string, Pending>();

  ch.onmessage = (ev: MessageEvent<unknown>) => {
    const raw = ev.data;
    if (!isRspMsg(raw)) return; // ignore non-responses

    const entry = pending.get(raw.id);
    if (!entry) return;

    clearTimeout(entry.timer);
    pending.delete(raw.id);
    entry.resolve(raw.payload);
  };

  /**
   * Send a request and await a typed response.
   * `payload` can be any serializable value.
   */
  async function request(payload: unknown): Promise<ApiRsp> {
    const id = `${Date.now()}-${++seq}`;
    const msg: ReqMsg = { kind: REQ, id, payload };

    return await new Promise<ApiRsp>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        pending.delete(id);
        reject(new Error('Request timed out'));
      }, timeoutMs);

      pending.set(id, { resolve, reject, timer });
      ch.postMessage(msg);
    });
  }

  function close() {
    // best-effort: reject all in-flight requests
    for (const [id, p] of pending.entries()) {
      clearTimeout(p.timer);
      p.reject(new Error('Channel closed'));
      pending.delete(id);
    }
    ch.close();
  }

  return { request, close };
}

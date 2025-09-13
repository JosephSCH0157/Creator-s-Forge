export type Phase = "idea" | "script" | "recorded" | "edited" | "published";

export type Asset = {
  id: string;
  kind: "script" | "video" | "image" | "doc";
  name: string;
  createdAt: number;
  meta?: Record<string, unknown>;
};

export type Project = {
  id: string;
  title: string;
  phase: Phase;
  createdAt: number;
  updatedAt: number;
  assets: Asset[];
  scriptId?: string;
  recordingIds: string[];
};

export type BusRequest =
  | { type: "PING" }
  | { type: "PROJECT.LIST" }
  | { type: "PROJECT.CREATE"; title: string }
  | { type: "PROJECT.READ"; projectId: string }
  | { type: "PROJECT.UPDATE"; projectId: string; patch: Partial<Project> }
  | { type: "PROJECT.DELETE"; projectId: string }
  | { type: "ASSET.LIST"; projectId: string; kind?: Asset["kind"] }
  | { type: "ASSET.CREATE"; projectId: string; asset: Partial<Asset> }
  | { type: "ASSET.READ"; projectId: string; assetId: string }
  | { type: "ASSET.UPDATE"; projectId: string; assetId: string; patch: Partial<Asset> }
  | { type: "ASSET.DELETE"; projectId: string; assetId: string }
  | { type: "SCRIPT.INDEX" }
  | { type: "SCRIPT.GET"; projectId: string }
  | { type: "SCRIPT.SAVE"; projectId: string; name: string; text: string }
  | { type: "SEARCH"; query: string };

export type BusResponse =
  | { ok: true; data?: unknown }
  | { ok: false; error: string };

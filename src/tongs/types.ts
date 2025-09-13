// src/tongs/types.ts
export type Phase = "idea" | "script" | "recorded" | "edited" | "published";

export type Asset = {
  id: string;                // ulid/uuid
  kind: "script" | "audio" | "video" | "image" | "doc" | "other";
  name: string;
  path?: string;             // local blob / URL
  bytes?: number;
  createdAt: number;
  meta?: Record<string, any>; // e.g. duration, codec, etc.
};

export type Project = {
  id: string;
  title: string;
  phase: Phase;
  createdAt: number;
  updatedAt: number;
  notes?: string;

  // canonical artifacts
  scriptId?: string;         // asset.id of current script
  recordingIds: string[];    // raw takes
  editedId?: string;         // final edit asset
  publishTargets?: string[]; // e.g. ["youtube","rumble","spotify"]
  publishedLinks?: Record<string,string>; // target->url

  assets: Asset[];
};

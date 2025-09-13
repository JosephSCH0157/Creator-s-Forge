// src/tongs/phase.ts
export const nextPhase: Record<Phase, Phase> = {
  idea: "script",
  script: "recorded",
  recorded: "edited",
  edited: "published",
  published: "published",
};

export function canAdvance(p: Project): boolean {
  if (p.phase === "idea") return !!p.scriptId;
  if (p.phase === "script") return p.recordingIds.length > 0;
  if (p.phase === "recorded") return !!p.editedId;
  if (p.phase === "edited") return !!p.publishedLinks && Object.keys(p.publishedLinks).length > 0;
  return false;
}

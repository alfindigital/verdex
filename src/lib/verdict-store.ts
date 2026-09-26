// Loads a persisted verdict: committed snapshots first (durable, deploy-safe),
// then the runtime data dir (ephemeral on serverless, fine for live demos).

import { existsSync, readFileSync, readdirSync } from "fs";
import path from "path";
import type { VerdictRecord } from "@/components/verdict-card";

const runtimeDir = process.env.VERCEL
  ? "/tmp/verdex/verdicts"
  : path.join(process.cwd(), "data", "verdicts");
const snapshotDir = path.join(process.cwd(), "snapshots");

// Stable demo aliases: snapshots/index.json maps "symbol-platform" slugs to
// snapshot ids, so public links survive re-harvests that mint new ids.
export function slugFor(symbol: string, platform: string): string {
  return `${symbol}-${platform}`
    .toLowerCase()
    .replace(/^\$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function slugToId(slug: string): string | null {
  const file = path.join(snapshotDir, "index.json");
  if (!existsSync(file)) return null;
  try {
    const idx = JSON.parse(readFileSync(file, "utf8")) as Record<string, string>;
    const id = idx[slug];
    return typeof id === "string" && /^[a-f0-9]{12}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function loadVerdict(id: string): VerdictRecord | null {
  if (!/^[a-f0-9]{12}$/.test(id)) {
    const resolved = slugToId(id.toLowerCase());
    if (!resolved) return null;
    id = resolved;
  }
  for (const dir of [snapshotDir, runtimeDir]) {
    const file = path.join(dir, `${id}.json`);
    if (existsSync(file)) {
      try {
        const v = JSON.parse(readFileSync(file, "utf8")) as VerdictRecord;
        if (v.kind === "verdict") return v;
      } catch {
        // corrupt file — try next dir
      }
    }
  }
  return null;
}

export function listSnapshotIds(): string[] {
  if (!existsSync(snapshotDir)) return [];
  return readdirSync(snapshotDir)
    .filter((f) => /^[a-f0-9]{12}\.json$/.test(f))
    .map((f) => f.replace(".json", ""));
}

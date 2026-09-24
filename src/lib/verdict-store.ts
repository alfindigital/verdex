// Loads a persisted verdict: committed snapshots first (durable, deploy-safe),
// then the runtime data dir (ephemeral on serverless, fine for live demos).

import { existsSync, readFileSync, readdirSync } from "fs";
import path from "path";
import type { VerdictRecord } from "@/components/verdict-card";

const runtimeDir = process.env.VERCEL
  ? "/tmp/verdex/verdicts"
  : path.join(process.cwd(), "data", "verdicts");
const snapshotDir = path.join(process.cwd(), "snapshots");

export function loadVerdict(id: string): VerdictRecord | null {
  if (!/^[a-f0-9]{12}$/.test(id)) return null;
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

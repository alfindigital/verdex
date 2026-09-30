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

/**
 * Collision-aware slug assignment over a set of verdict records. Two distinct
 * token identities can share a base slug (e.g. "WIF" and "$WIF" on Solana) —
 * the highest-mcap record keeps the clean slug, the others get a
 * `-<addr6>` suffix so every row links to its own verdict.
 */
export function buildSlugMap(records: VerdictRecord[]): Map<string, string> {
  const groups = new Map<string, VerdictRecord[]>();
  for (const r of records) {
    const base = slugFor(r.token.symbol ?? "", r.token.platform ?? "");
    if (!base) continue;
    const g = groups.get(base) ?? [];
    g.push(r);
    groups.set(base, g);
  }
  const map = new Map<string, string>();
  for (const [base, rs] of groups) {
    const sorted = [...rs].sort(
      (a, b) => (b.token.mcapUsd ?? 0) - (a.token.mcapUsd ?? 0) || a.id.localeCompare(b.id),
    );
    map.set(sorted[0].id, base);
    for (const r of sorted.slice(1)) {
      map.set(r.id, `${base}-${(r.token.address ?? r.id).slice(0, 6).toLowerCase()}`);
    }
  }
  return map;
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

export function listSnapshotSlugs(): string[] {
  const file = path.join(snapshotDir, "index.json");
  if (!existsSync(file)) return [];
  try {
    const idx = JSON.parse(readFileSync(file, "utf8")) as Record<string, string>;
    return Object.keys(idx);
  } catch {
    return [];
  }
}

export function listSnapshotIds(): string[] {
  if (!existsSync(snapshotDir)) return [];
  return readdirSync(snapshotDir)
    .filter((f) => /^[a-f0-9]{12}\.json$/.test(f))
    .map((f) => f.replace(".json", ""));
}

/**
 * Return a public URL only for a committed snapshot id. Runtime verdicts are
 * ephemeral and must not be presented as durable share links.
 */
export function snapshotPath(recordId: string): string | null {
  return /^[a-f0-9]{12}$/.test(recordId) && listSnapshotIds().includes(recordId)
    ? `/verdict/${recordId}`
    : null;
}

import { canonicalChain } from "@/lib/address";

export type ScanMode = "replay" | "v2-live";

export interface AnalyzeSelection {
  platform: string;
  address: string;
}

export interface ScanBody {
  query: string;
  platform?: string;
  selection?: AnalyzeSelection;
}

export function resolveScanMode(env: { [key: string]: string | undefined }): ScanMode {
  return env.VERDEX_V2 === "1" && env.VERDEX_LIVE === "1" ? "v2-live" : "replay";
}

export function parseScanBody(raw: unknown, rawByteLength?: number): { ok: true; value: ScanBody } | { ok: false; error: string } {
  if (rawByteLength !== undefined && rawByteLength > 4096) return { ok: false, error: "request body exceeds 4096 bytes" };
  if (!raw || typeof raw !== "object") return { ok: false, error: "invalid JSON body" };
  const body = raw as Record<string, unknown>;
  if (typeof body.query !== "string" || !body.query.trim()) return { ok: false, error: "query required (token address or name/ticker)" };
  if (body.query.trim().length > 128) return { ok: false, error: "query must be 1..128 characters" };
  if (body.platform !== undefined && (typeof body.platform !== "string" || body.platform.trim().length > 32 || (body.platform.trim() && !canonicalChain(body.platform)))) return { ok: false, error: "platform must be a valid chain string" };
  if ("pick" in body) return { ok: false, error: "pick is no longer accepted; submit selection { platform, address }" };
  let selection: AnalyzeSelection | undefined;
  if (body.selection !== undefined) {
    if (!body.selection || typeof body.selection !== "object") return { ok: false, error: "selection must contain platform and address" };
    const candidate = body.selection as Record<string, unknown>;
    if (typeof candidate.platform !== "string" || typeof candidate.address !== "string" || !candidate.platform.trim() || !candidate.address.trim() || !canonicalChain(candidate.platform)) return { ok: false, error: "selection must contain platform and address" };
    selection = { platform: candidate.platform.trim(), address: candidate.address.trim() };
  }
  return { ok: true, value: { query: body.query.trim(), platform: typeof body.platform === "string" ? body.platform.trim() : undefined, selection } };
}

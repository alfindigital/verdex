import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { encodeExactBody } from "@/engine/evidence";

type SourceCapture = { endpoint: string; params: Record<string, string | number>; capturedAt: string; status: number | null; ok: boolean; bodyBase64: string | null; bodySha256: string | null; reason: string | null };

function arg(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] ?? null : null;
}

const platform = arg("--platform");
const address = arg("--address");
const output = arg("--out");
const key = process.env.CMC_API_KEY;
async function main() {
  if (!platform || !address || !output || !key) {
    console.error("Usage: CMC_API_KEY=... pnpm evidence:capture --platform Ethereum --address 0x... --out path.json");
    process.exitCode = 2;
    return;
  }
  const base = process.env.CMC_BASE_URL ?? "https://pro-api.coinmarketcap.com";
  const requests: Array<[string, Record<string, string | number>]> = [
    ["/v1/dex/search", { q: address }],
    ["/v1/dex/tokens/transactions", { platform, address, limit: 100 }],
    ["/v1/dex/token/pools", { platform, address }],
    ["/v1/dex/liquidity-change/list", { platform, address }],
    ["/v1/dex/security/detail", { platformName: platform, address }],
    ["/v1/dex/token", { platform, address }],
    ["/v1/global-metrics/quotes/latest", {}],
    ["/v1/global-metrics/quotes/historical", {}],
    ["/v3/fear-and-greed/latest", {}],
  ];
  const capturedAt = new Date().toISOString();
  const sources: SourceCapture[] = [];
  for (const [endpoint, params] of requests) {
    const url = new URL(base + endpoint);
    for (const [name, value] of Object.entries(params)) url.searchParams.set(name, String(value));
    try {
      const response = await fetch(url, { headers: { "X-CMC_PRO_API_KEY": key, Accept: "application/json" } });
      const bytes = new Uint8Array(await response.arrayBuffer());
      const encoded = encodeExactBody(bytes);
      sources.push({ endpoint, params, capturedAt, status: response.status, ok: response.ok, bodyBase64: encoded.bodyBase64, bodySha256: encoded.bodySha256, reason: response.ok ? null : `HTTP ${response.status}` });
    } catch (error) {
      sources.push({ endpoint, params, capturedAt, status: null, ok: false, bodyBase64: null, bodySha256: null, reason: error instanceof Error ? error.message : String(error) });
    }
  }
  const file = path.resolve(output);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify({ schemaVersion: 1, capturedAt, platform, address, sources }, null, 2) + "\n", "utf8");
  console.log(`Wrote ${sources.length} redacted source captures to ${file}`);
}

void main().catch((error) => {
  console.error(`ERROR capture failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});

// Mega harvest: resolve a wide (platform, query) list via /v1/dex/search,
// then run the same 9-endpoint capture as capture-evidence.ts per token.
// Output: data/captures/cap-<platform>-<tag>.json (same schema, raw bodies).
//
//   CMC_API_KEY=... pnpm tsx scripts/mega-harvest.ts
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { encodeExactBody } from "@/engine/evidence";

type SourceCapture = { endpoint: string; params: Record<string, string | number>; capturedAt: string; status: number | null; ok: boolean; bodyBase64: string | null; bodySha256: string | null; reason: string | null };

const key = process.env.CMC_API_KEY;
const base = process.env.CMC_BASE_URL ?? "https://pro-api.coinmarketcap.com";
const OUT = path.resolve("data/captures");
const DELAY_MS = Number(process.env.HARVEST_DELAY_MS ?? "200");

// (platformHint, query, tag) — majors + memes + edge cases for verdict diversity.
const TARGETS: Array<[string, string, string]> = [
  // Ethereum majors
  ["Ethereum", "MKR", "mkr"], ["Ethereum", "SNX", "snx"], ["Ethereum", "COMP", "comp"],
  ["Ethereum", "CRV", "crv"], ["Ethereum", "LDO", "ldo"], ["Ethereum", "SUSHI", "sushi"],
  ["Ethereum", "1INCH", "oneinch"], ["Ethereum", "BAL", "bal"], ["Ethereum", "YFI", "yfi"],
  ["Ethereum", "ENS", "ens"], ["Ethereum", "FXS", "fxs"], ["Ethereum", "DYDX", "dydx"],
  ["Ethereum", "SHIB", "shib"], ["Ethereum", "FLOKI", "floki"], ["Ethereum", "WLD", "wld"],
  ["Ethereum", "TURBO", "turbo"], ["Ethereum", "NEIRO", "neiro"], ["Ethereum", "MOG", "mog"],
  ["Ethereum", "PENDLE", "pendle-eth"], ["Ethereum", "ENA", "ena"], ["Ethereum", "ONDO", "ondo"],
  ["Ethereum", "ETHFI", "ethfi"], ["Ethereum", "GRT", "grt"], ["Ethereum", "SAND", "sand"],
  ["Ethereum", "APE", "ape"], ["Ethereum", "RPL", "rpl"], ["Ethereum", "EIGEN", "eigen"],
  ["Ethereum", "MORPHO", "morpho"], ["Ethereum", "SAFE", "safe"], ["Ethereum", "SSV", "ssv"],
  // Solana
  ["Solana", "ORCA", "orca"], ["Solana", "POPCAT", "popcat"], ["Solana", "BOME", "bome"],
  ["Solana", "WEN", "wen"], ["Solana", "MEW", "mew"], ["Solana", "PNUT", "pnut"],
  ["Solana", "GOAT", "goat"], ["Solana", "ACT", "act"], ["Solana", "MOODENG", "moodeng"],
  ["Solana", "JTO", "jto"], ["Solana", "PYTH", "pyth"], ["Solana", "DRIFT", "drift"],
  ["Solana", "KMNO", "kmno"], ["Solana", "MNDE", "mnde"], ["Solana", "SLERF", "slerf"],
  ["Solana", "TNSR", "tnsr"], ["Solana", "W", "wormhole"], ["Solana", "PRCL", "prcl"],
  ["Solana", "IO", "io"], ["Solana", "MANEKI", "maneki"], ["Solana", "BOME2", "bome2"],
  ["Solana", "BODEN", "boden"], ["Solana", "MICHI", "michi"], ["Solana", "GIGA", "giga"],
  // Base
  ["Base", "DEGEN", "degen"], ["Base", "BRETT", "brett"], ["Base", "TOSHI", "toshi"],
  ["Base", "HIGHER", "higher"], ["Base", "CLANKER", "clanker"], ["Base", "NORMIE", "normie"],
  ["Base", "KEYCAT", "keycat"], ["Base", "MFER", "mfer"], ["Base", "SKI", "ski"],
  ["Base", "BENJI", "benji"], ["Base", "ZORA", "zora"], ["Base", "AIXBT", "aixbt"],
  ["Base", "VVV", "vvv"], ["Base", "GAME", "game"], ["Base", "MOODENG", "moodeng-base"],
  // Arbitrum
  ["Arbitrum", "PENDLE", "pendle"], ["Arbitrum", "MAGIC", "magic"], ["Arbitrum", "RDNT", "rdnt"],
  ["Arbitrum", "GRAIL", "grail"], ["Arbitrum", "DPX", "dpx"], ["Arbitrum", "SPA", "spa"],
  ["Arbitrum", "GNS", "gns"], ["Arbitrum", "MUX", "mux"], ["Arbitrum", "LVL", "lvl"],
  ["Arbitrum", "WINR", "winr"], ["Arbitrum", "JONES", "jones"],
  // BSC
  ["BSC", "FLOKI", "floki-bsc"], ["BSC", "BABYDOGE", "babydoge"], ["BSC", "TWT", "twt"],
  ["BSC", "BSW", "bsw"], ["BSC", "LISTA", "lista"], ["BSC", "DODO", "dodo"],
  ["BSC", "MBOX", "mbox"], ["BSC", "MUBARAK", "mubarak"], ["BSC", "CHEEMS", "cheems"],
  ["BSC", "KOMA", "koma"], ["BSC", "AICELL", "aicell"], ["BSC", "TST", "tst"],
  ["BSC", "CAT", "cat-bsc"],
  // Optimism
  ["Optimism", "OP", "op"], ["Optimism", "VELO", "velo"], ["Optimism", "SNX", "snx-op"],
  ["Optimism", "KWENTA", "kwenta"], ["Optimism", "LYRA", "lyra"], ["Optimism", "THALES", "thales"],
  // Polygon
  ["Polygon", "QUICK", "quick"], ["Polygon", "GHST", "ghst"], ["Polygon", "DFYN", "dfyn"],
  ["Polygon", "TEL", "tel"], ["Polygon", "POLYDOGE", "polydoge"],
  // Avalanche
  ["Avalanche", "JOE", "joe"], ["Avalanche", "PNG", "png"], ["Avalanche", "QI", "qi"],
  ["Avalanche", "YAK", "yak"],
  // Gnosis
  ["Gnosis", "GNO", "gno"], ["Gnosis", "COW", "cow"], ["Gnosis", "HNY", "hny"],
];

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function getJson(url: URL): Promise<{ status: number; bytes: Uint8Array }> {
  const res = await fetch(url, { headers: { "X-CMC_PRO_API_KEY": key!, Accept: "application/json" } });
  return { status: res.status, bytes: new Uint8Array(await res.arrayBuffer()) };
}

async function resolveAddress(platformHint: string, query: string): Promise<{ platform: string; address: string } | null> {
  const url = new URL(base + "/v1/dex/search");
  url.searchParams.set("q", query);
  const { bytes } = await getJson(url);
  let tks: any[] = [];
  try { tks = JSON.parse(new TextDecoder().decode(bytes))?.data?.tks ?? []; } catch { return null; }
  const hint = platformHint.toLowerCase();
  const pick = tks.find((t) => String(t?.plt ?? "").toLowerCase() === hint);
  if (!pick?.addr) return null;
  return { platform: String(pick.plt), address: String(pick.addr) };
}

async function main() {
  if (!key) { console.error("CMC_API_KEY not set"); process.exitCode = 2; return; }
  mkdirSync(OUT, { recursive: true });
  let done = 0, skipped = 0, failed = 0;
  for (const [platform, query, tag] of TARGETS) {
    const outFile = path.join(OUT, `cap-${tag}.json`);
    if (existsSync(outFile)) { console.log(`[skip] ${tag} — already captured`); skipped++; continue; }
    const resolved = await resolveAddress(platform, query);
    await sleep(DELAY_MS);
    if (!resolved) { console.log(`[fail] ${tag} — no address for ${query} on ${platform}`); failed++; continue; }
    const { platform: plat, address } = resolved;
    const requests: Array<[string, Record<string, string | number>]> = [
      ["/v1/dex/search", { q: address }],
      ["/v1/dex/tokens/transactions", { platform: plat, address, limit: 100 }],
      ["/v1/dex/token/pools", { platform: plat, address }],
      ["/v1/dex/liquidity-change/list", { platform: plat, address }],
      ["/v1/dex/security/detail", { platformName: plat, address }],
      ["/v1/dex/token", { platform: plat, address }],
      ["/v1/global-metrics/quotes/latest", {}],
      ["/v1/global-metrics/quotes/historical", {}],
      ["/v3/fear-and-greed/latest", {}],
    ];
    const capturedAt = new Date().toISOString();
    const sources: SourceCapture[] = [];
    let credits = "";
    for (const [endpoint, params] of requests) {
      const url = new URL(base + endpoint);
      for (const [name, value] of Object.entries(params)) url.searchParams.set(name, String(value));
      try {
        const res = await fetch(url, { headers: { "X-CMC_PRO_API_KEY": key, Accept: "application/json" } });
        const bytes = new Uint8Array(await res.arrayBuffer());
        try { const c = JSON.parse(new TextDecoder().decode(bytes))?.status?.credit_count; if (c != null) credits = `cr=${c}`; } catch { }
        const encoded = encodeExactBody(bytes);
        sources.push({ endpoint, params, capturedAt, status: res.status, ok: res.ok, bodyBase64: encoded.bodyBase64, bodySha256: encoded.bodySha256, reason: res.ok ? null : `HTTP ${res.status}` });
      } catch (error) {
        sources.push({ endpoint, params, capturedAt, status: null, ok: false, bodyBase64: null, bodySha256: null, reason: error instanceof Error ? error.message : String(error) });
      }
      await sleep(DELAY_MS);
    }
    const okCount = sources.filter((s) => s.ok).length;
    writeFileSync(outFile, JSON.stringify({ schemaVersion: 1, capturedAt, platform: plat, address, sources }, null, 2) + "\n", "utf8");
    done++;
    console.log(`[${done + skipped}/${TARGETS.length}] ${tag} ${plat}:${address.slice(0, 8)}… ${okCount}/9 ok ${credits}`);
  }
  console.log(`DONE — captured ${done}, skipped ${skipped}, failed ${failed}`);
}

void main().catch((e) => { console.error("ERROR", e instanceof Error ? e.message : e); process.exitCode = 1; });

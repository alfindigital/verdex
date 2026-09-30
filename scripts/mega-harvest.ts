// Mega harvest: resolve a wide (platform, query) list via /v1/dex/search,
// then run the same 9-endpoint capture as capture-evidence.ts per token.
// Output: data/captures/cap-<platform>-<tag>.json (same schema, raw bodies).
//
//   CMC_API_KEY=... pnpm tsx scripts/mega-harvest.ts
import { mkdirSync, writeFileSync, existsSync, readFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { encodeExactBody } from "@/engine/evidence";

for (const line of readFileSync(path.join(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

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

  // ── Wave 2 (2026-09-30 corpus expansion; key credits + expiry-driven) ──
  // Ethereum — majors + stables/LST edges + dead memes for JANGAN diversity
  ["Ethereum", "UNI", "uni"], ["Ethereum", "AAVE", "aave"], ["Ethereum", "LINK", "link"],
  ["Ethereum", "PEPE", "pepe"], ["Ethereum", "WBTC", "wbtc"], ["Ethereum", "USDT", "usdt"],
  ["Ethereum", "USDC", "usdc"], ["Ethereum", "DAI", "dai"], ["Ethereum", "TRB", "trb"],
  ["Ethereum", "BADGER", "badger"], ["Ethereum", "PERP", "perp-eth"], ["Ethereum", "BNT", "bnt"],
  ["Ethereum", "KNC", "knc"], ["Ethereum", "ZRX", "zrx"], ["Ethereum", "LRC", "lrc"],
  ["Ethereum", "BAND", "band"], ["Ethereum", "ANT", "ant"], ["Ethereum", "NMR", "nmr"],
  ["Ethereum", "RLC", "rlc"], ["Ethereum", "STORJ", "storj"], ["Ethereum", "POWR", "powr"],
  ["Ethereum", "CVC", "cvc"], ["Ethereum", "HOT", "hot"], ["Ethereum", "CHZ", "chz"],
  ["Ethereum", "ENJ", "enj"], ["Ethereum", "MANA", "mana"], ["Ethereum", "SLP", "slp"],
  ["Ethereum", "ILV", "ilv"], ["Ethereum", "ELON", "elon"], ["Ethereum", "KISHU", "kishu"],
  ["Ethereum", "SAITAMA", "saitama"], ["Ethereum", "FEG", "feg"], ["Ethereum", "PEOPLE", "people"],
  ["Ethereum", "FOX", "fox"], ["Ethereum", "BOB", "bob"], ["Ethereum", "HEX", "hex"],
  ["Ethereum", "CULT", "cult"], ["Ethereum", "TSUKA", "tsuka"], ["Ethereum", "BONE", "bone"],
  ["Ethereum", "LEASH", "leash"], ["Ethereum", "XEN", "xen"], ["Ethereum", "QOM", "qom"],
  ["Ethereum", "CAW", "caw"], ["Ethereum", "OGN", "ogn"], ["Ethereum", "CELR", "celr"],
  ["Ethereum", "SKL", "skl"], ["Ethereum", "CTSI", "ctsi"], ["Ethereum", "STMX", "stmx"],
  ["Ethereum", "KEEP", "keep"], ["Ethereum", "NU", "nu"], ["Ethereum", "OXT", "oxt"],
  ["Ethereum", "COTI", "coti"], ["Ethereum", "UMA", "uma"], ["Ethereum", "DEXT", "dext"],
  ["Ethereum", "PAID", "paid"], ["Ethereum", "DUCK", "duck"], ["Ethereum", "ROOK", "rook"],
  // Solana — majors, infra, memes, dead pump-era tokens
  ["Solana", "JUP", "jup"], ["Solana", "RAY", "ray"], ["Solana", "BONK", "bonk"],
  ["Solana", "TRUMP", "trump"], ["Solana", "WIF", "wif"], ["Solana", "FARTCOIN", "fartcoin"],
  ["Solana", "PUMP", "pump"], ["Solana", "MOBILE", "mobile"], ["Solana", "RENDER", "render"],
  ["Solana", "HNT", "hnt"], ["Solana", "NOS", "nos"], ["Solana", "GUAC", "guac"],
  ["Solana", "SILLY", "silly"], ["Solana", "PENG", "peng"], ["Solana", "PONKE", "ponke"],
  ["Solana", "MYRO", "myro"], ["Solana", "WYNN", "wynn"], ["Solana", "TREMP", "tremp"],
  ["Solana", "HAWK", "hawk"], ["Solana", "MOTHER", "mother"], ["Solana", "DADDY", "daddy"],
  ["Solana", "SAMO", "samo"], ["Solana", "CATO", "cato"], ["Solana", "SMOL", "smol"],
  ["Solana", "MSOL", "msol"], ["Solana", "JITOSOL", "jitosol"], ["Solana", "BSOL", "bsol"],
  ["Solana", "INF", "inf"], ["Solana", "JLP", "jlp"], ["Solana", "HADES", "hades"],
  ["Solana", "CROWN", "crown"], ["Solana", "FORGE", "forge"], ["Solana", "SNS", "sns"],
  ["Solana", "FIDA", "fida"], ["Solana", "COPE", "cope"], ["Solana", "ROPE", "rope"],
  ["Solana", "STEP", "step"], ["Solana", "MEDIA", "media"], ["Solana", "MAPS", "maps"],
  ["Solana", "OXY", "oxy"], ["Solana", "SRM", "srm"], ["Solana", "PORT", "port"],
  ["Solana", "TULIP", "tulip"], ["Solana", "SUNNY", "sunny"], ["Solana", "SLND", "slnd"],
  // BSC — CAKE ecosystem + classic dead scams
  ["BSC", "CAKE", "cake"], ["BSC", "BAKE", "bake"], ["BSC", "BURGER", "burger"],
  ["BSC", "ALPACA", "alpaca"], ["BSC", "XVS", "xvs"], ["BSC", "EPS", "eps"],
  ["BSC", "AUTO", "auto"], ["BSC", "BELT", "belt"], ["BSC", "BUNNY", "bunny"],
  ["BSC", "WAULT", "wault"], ["BSC", "SAFEMOON", "safemoon"], ["BSC", "PIT", "pit"],
  ["BSC", "KISHU", "kishu-bsc"], ["BSC", "CUMROCKET", "cummies"], ["BSC", "BONFIRE", "bonfire"],
  ["BSC", "QUACK", "quack"], ["BSC", "KOGE", "koge"], ["BSC", "HAY", "hay"],
  ["BSC", "C98", "c98"], ["BSC", "TKO", "tko"], ["BSC", "DEXE", "dexe"],
  ["BSC", "FINE", "fine"], ["BSC", "HERO", "hero"], ["BSC", "JADE", "jade"],
  ["BSC", "RABBIT", "rabbit"], ["BSC", "SATA", "sata"], ["BSC", "TUSD", "tusd"],
  ["BSC", "VAI", "vai"], ["BSC", "BUSD", "busd"], ["BSC", "WOO", "woo"],
  // Base — memes + infra
  ["Base", "VIRTUAL", "virtual"], ["Base", "WELL", "well"], ["Base", "AERO", "aero"],
  ["Base", "MOCHI", "mochi"], ["Base", "MIGGLES", "miggles"], ["Base", "DOGINME", "doginme"],
  ["Base", "BOOMER", "boomer"], ["Base", "CHOMP", "chomp"], ["Base", "TYBG", "tybg"],
  ["Base", "SLAP", "slap"], ["Base", "PONCHO", "poncho"], ["Base", "PRIME", "prime"],
  ["Base", "SEAM", "seam"], ["Base", "SONNE", "sonne-base"], ["Base", "BSWAP", "bswap"],
  ["Base", "SCALE", "scale"], ["Base", "DOG", "dog-base"], ["Base", "BALD", "bald"],
  ["Base", "BASE", "base-token"], ["Base", "CIRCLE", "circle-base"], ["Base", "RGL", "rgl"],
  ["Base", "SMOL", "smol-base"], ["Base", "WAGMI", "wagmi-base"], ["Base", "OMNI", "omni-base"],
  // Arbitrum
  ["Arbitrum", "ARB", "arb"], ["Arbitrum", "UNI", "uni-arb"], ["Arbitrum", "SUSHI", "sushi-arb"],
  ["Arbitrum", "CRV", "crv-arb"], ["Arbitrum", "AAVE", "aave-arb"], ["Arbitrum", "UMAMI", "umami"],
  ["Arbitrum", "VELA", "vela"], ["Arbitrum", "TROVE", "trove"], ["Arbitrum", "Y2K", "y2k"],
  ["Arbitrum", "DMT", "dmt"], ["Arbitrum", "BFR", "bfr"], ["Arbitrum", "MYC", "myc"],
  ["Arbitrum", "ELK", "elk-arb"], ["Arbitrum", "FCTR", "fctr"], ["Arbitrum", "AIDOGE", "aidoge"],
  ["Arbitrum", "CHEEMS", "cheems-arb"], ["Arbitrum", "MARE", "mare"], ["Arbitrum", "GMX", "gmx-arb2"],
  // Optimism
  ["Optimism", "PERP", "perp-op"], ["Optimism", "SONNE", "sonne"], ["Optimism", "DOLA", "dola"],
  ["Optimism", "KROM", "krom"], ["Optimism", "UNI", "uni-op"], ["Optimism", "CRV", "crv-op"],
  ["Optimism", "AAVE", "aave-op"], ["Optimism", "WLD", "wld-op"], ["Optimism", "BEETS", "beets"],
  ["Optimism", "HUM", "hum"], ["Optimism", "ELK", "elk-op"], ["Optimism", "POOL", "pool-op"],
  // Polygon
  ["Polygon", "POL", "pol"], ["Polygon", "ICE", "ice"], ["Polygon", "BANANA", "banana-poly"],
  ["Polygon", "TRADE", "trade"], ["Polygon", "SAND", "sand-poly"], ["Polygon", "CRV", "crv-poly"],
  ["Polygon", "UNI", "uni-poly"], ["Polygon", "AAVE", "aave-poly2"], ["Polygon", "FISH", "fish"],
  ["Polygon", "MI", "mai"], ["Polygon", "VOXEL", "voxel"], ["Polygon", "STG", "stg-poly"],
  ["Polygon", "JUGNI", "jugni"], ["Polygon", "BONE", "bone-poly"], ["Polygon", "START", "start"],
  // Avalanche — incl. dead Wonderland-era tokens
  ["Avalanche", "GMX", "gmx-avax"], ["Avalanche", "TIME", "time"], ["Avalanche", "MEMO", "memo"],
  ["Avalanche", "SPELL", "spell-avax"], ["Avalanche", "MIM", "mim"], ["Avalanche", "SNOB", "snob"],
  ["Avalanche", "PEFI", "pefi"], ["Avalanche", "CRA", "cra"], ["Avalanche", "TUS", "tus"],
  ["Avalanche", "CRAFT", "craft"], ["Avalanche", "HON", "hon"], ["Avalanche", "KLO", "klo"],
  ["Avalanche", "VTX", "vtx"], ["Avalanche", "HAKA", "haka"], ["Avalanche", "OLIVE", "olive"],
  // Gnosis — thin chain extras
  ["Gnosis", "STAKE", "stake"], ["Gnosis", "AGAVE", "agave"], ["Gnosis", "FOX", "fox-gno"],
  ["Gnosis", "WATER", "water"], ["Gnosis", "SWPR", "swpr"], ["Gnosis", "ELK", "elk-gno"],
];

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function getJson(url: URL): Promise<{ status: number; bytes: Uint8Array }> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { "X-CMC_PRO_API_KEY": key!, Accept: "application/json" } });
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`HTTP ${res.status}`);
        await sleep(1500 * (attempt + 1));
        continue;
      }
      return { status: res.status, bytes: new Uint8Array(await res.arrayBuffer()) };
    } catch (e) {
      lastErr = e;
      await sleep(1500 * (attempt + 1));
    }
  }
  throw lastErr;
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
    let resolved: { platform: string; address: string } | null = null;
    try {
      resolved = await resolveAddress(platform, query);
    } catch (e) {
      console.log(`[fail] ${tag} — resolve error ${e instanceof Error ? e.message : e}`);
      failed++;
      await sleep(DELAY_MS);
      continue;
    }
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
        const { status, bytes } = await getJson(url);
        try { const c = JSON.parse(new TextDecoder().decode(bytes))?.status?.credit_count; if (c != null) credits = `cr=${c}`; } catch { }
        const encoded = encodeExactBody(bytes);
        sources.push({ endpoint, params, capturedAt, status, ok: status >= 200 && status < 300, bodyBase64: encoded.bodyBase64, bodySha256: encoded.bodySha256, reason: status >= 200 && status < 300 ? null : `HTTP ${status}` });
      } catch (error) {
        sources.push({ endpoint, params, capturedAt, status: null, ok: false, bodyBase64: null, bodySha256: null, reason: error instanceof Error ? error.message : String(error) });
      }
      await sleep(DELAY_MS);
    }
    const okCount = sources.filter((s) => s.ok).length;
    if (okCount < 5) {
      // Mostly-failed captures are network artifacts, not evidence — drop so a rerun retries.
      try { unlinkSync(outFile); } catch { }
      failed++;
      console.log(`[fail] ${tag} — only ${okCount}/9 ok, not saved`);
      continue;
    }
    writeFileSync(outFile, JSON.stringify({ schemaVersion: 1, capturedAt, platform: plat, address, sources }, null, 2) + "\n", "utf8");
    done++;
    console.log(`[${done + skipped}/${TARGETS.length}] ${tag} ${plat}:${address.slice(0, 8)}… ${okCount}/9 ok ${credits}`);
  }
  console.log(`DONE — captured ${done}, skipped ${skipped}, failed ${failed}`);
}

void main().catch((e) => { console.error("ERROR", e instanceof Error ? e.message : e); process.exitCode = 1; });

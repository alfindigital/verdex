import { createHash } from "crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

export interface Receipt {
  endpoint: string;
  params: Record<string, unknown>;
  ts: string;
  credits: number;
  sha256: string;
  cached: boolean;
}

export interface CmcResult<T> {
  data: T;
  receipt: Receipt;
}

export class CmcError extends Error {
  constructor(
    public code: number,
    message: string,
    public endpoint: string,
  ) {
    super(message);
    this.name = "CmcError";
  }
}

export interface CmcClientOpts {
  apiKey: string;
  logPath: string;
  cacheDir: string;
  fetchImpl?: typeof fetch;
  baseUrl?: string;
}

interface CmcEnvelope<T> {
  data?: T;
  status?: { error_code?: number | string; error_message?: string | null; credit_count?: number; timestamp?: string };
}

export function createCmcClient(opts: CmcClientOpts) {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const baseUrl = opts.baseUrl ?? "https://pro-api.coinmarketcap.com";
  mkdirSync(path.dirname(opts.logPath), { recursive: true });
  mkdirSync(opts.cacheDir, { recursive: true });

  function cacheKey(endpoint: string, params: Record<string, unknown>) {
    return createHash("sha256").update(endpoint + JSON.stringify(sortObj(params))).digest("hex");
  }

  function sortObj(o: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
  }

  async function get<T>(endpoint: string, params: Record<string, unknown> = {}, o?: { ttlMs?: number }): Promise<CmcResult<T>> {
    const key = cacheKey(endpoint, params);
    const cacheFile = path.join(opts.cacheDir, `${key}.json`);
    if (o?.ttlMs && existsSync(cacheFile)) {
      const age = Date.now() - Number(readFileSync(cacheFile, "utf8").startsWith("{") ? JSON.parse(readFileSync(cacheFile, "utf8")).cachedAt : 0);
      if (age < o.ttlMs) {
        const raw = JSON.parse(readFileSync(cacheFile, "utf8"));
        return { data: raw.data as T, receipt: { ...raw.receipt, cached: true } };
      }
    }

    const url = new URL(baseUrl + endpoint);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

    // TECH_SPEC §6: 5xx/429 + transport errors retry ×2 with backoff.
    // 4xx and CMC envelope errors fail fast (they're caller's problem, not flaky).
    const MAX_ATTEMPTS = 3;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    let lastErr: unknown;
    let receipt: Receipt | undefined;
    let data: T | undefined;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        const res = await fetchImpl(url.toString(), {
          headers: { "X-CMC_PRO_API_KEY": opts.apiKey, Accept: "application/json" },
          signal: AbortSignal.timeout(15_000),
        });
        const rawText = await res.text();
        if (!res.ok) {
          if ((res.status >= 500 || res.status === 429) && attempt < MAX_ATTEMPTS - 1) {
            await sleep(400 * Math.pow(2, attempt));
            continue;
          }
          throw new CmcError(res.status, `HTTP ${res.status} on ${endpoint}`, endpoint);
        }

        const env = JSON.parse(rawText) as CmcEnvelope<T>;
        const code = Number(env.status?.error_code ?? 0);
        if (code !== 0) {
          // Only HTTP-style 5xx is transient — custom codes like 1001/1006
          // (bad key, plan restricted) are permanent, don't waste retries.
          if (code >= 500 && code < 600 && attempt < MAX_ATTEMPTS - 1) {
            await sleep(400 * Math.pow(2, attempt));
            continue;
          }
          throw new CmcError(code, env.status?.error_message ?? "CMC error", endpoint);
        }

        receipt = {
          endpoint,
          params: sortObj(params),
          ts: env.status?.timestamp ?? new Date().toISOString(),
          credits: env.status?.credit_count ?? 0,
          sha256: createHash("sha256").update(rawText).digest("hex"),
          cached: false,
        };
        data = env.data as T;
        break;
      } catch (e) {
        if (e instanceof CmcError) throw e;
        lastErr = e;
        if (attempt < MAX_ATTEMPTS - 1) await sleep(400 * Math.pow(2, attempt));
      }
    }
    if (!receipt) throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));

    appendFileSync(opts.logPath, JSON.stringify(receipt) + "\n");

    if (o?.ttlMs) {
      writeFileSync(cacheFile, JSON.stringify({ cachedAt: Date.now(), data, receipt }));
    }

    return { data: data as T, receipt };
  }

  return { get };
}

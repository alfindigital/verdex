// Narrator — deterministic template first; optional OpenAI-compatible LLM
// behind env vars (NARRATOR_BASE_URL / NARRATOR_API_KEY / NARRATOR_MODEL).
// LLM input is the computed metrics JSON only — it may restate numbers,
// never invent them. Any failure falls back to the template silently.

import type { CompositeResult, SubVerdict } from "./rules";

export interface Narration {
  source: "template" | "llm";
  headline: string;
  bullets: string[];
}

const HEADLINE: Record<string, string> = {
  LAYAK: "%s on %s looks entry-worthy on the evidence",
  RAWAN: "%s on %s shows warning signs — size accordingly",
  JANGAN: "Avoid %s on %s — the evidence is bad",
  BELUM_CUKUP_BUKTI: "Not enough evidence to judge %s on %s",
};

function worstMetrics(subs: SubVerdict[]) {
  return subs
    .filter((s) => s.level === "DANGER" || s.level === "WARN")
    .flatMap((s) => s.metrics.filter((m) => m.level === s.level))
    .slice(0, 4);
}

function templateNarration(symbol: string, platform: string, r: CompositeResult): Narration {
  const headline = (HEADLINE[r.verdict] ?? HEADLINE.BELUM_CUKUP_BUKTI).replace("%s", symbol).replace("%s", platform);
  const bad = worstMetrics(r.subs);
  const bullets =
    bad.length > 0
      ? bad.map((m) => `${m.name} = ${m.value} (threshold: ${m.threshold})`)
      : r.subs.map((s) => `${s.dim}: ${s.level}`);
  bullets.push(`Confidence: ${r.confidence}. Falsifier: ${r.falsifier}`);
  return { source: "template", headline, bullets };
}

export async function narrate(symbol: string, platform: string, r: CompositeResult): Promise<Narration> {
  const base = process.env.NARRATOR_BASE_URL;
  const apiKey = process.env.NARRATOR_API_KEY;
  const model = process.env.NARRATOR_MODEL;
  if (!base || !apiKey || !model) return templateNarration(symbol, platform, r);

  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You rewrite a deterministic crypto-risk verdict for a trader. Use ONLY numbers in the JSON. No new facts. Return strict JSON: {headline:string, bullets:string[]} max 4 bullets, each under 120 chars.",
          },
          { role: "user", content: JSON.stringify({ token: symbol, platform, verdict: r }) },
        ],
      }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) throw new Error(`narrator http ${res.status}`);
    const body = await res.json();
    const parsed = JSON.parse(body?.choices?.[0]?.message?.content ?? "");
    if (typeof parsed.headline !== "string" || !Array.isArray(parsed.bullets)) throw new Error("bad shape");
    return { source: "llm", headline: parsed.headline, bullets: parsed.bullets.slice(0, 4).map(String) };
  } catch {
    return templateNarration(symbol, platform, r);
  }
}

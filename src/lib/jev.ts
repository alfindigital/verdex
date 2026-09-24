// Jev (TypeSafe) adapter — cross-examiner, never the authority.
// POST https://api.typesafe.ai/v1/systemone, model jev-1.13.0.
// Jev never receives secrets or raw payloads: only the computed metric summary.

const JEV_URL = "https://api.typesafe.ai/v1/systemone";
const MODEL = "jev-1.13.0";

export interface JevOpinion {
  available: boolean;
  riskyProb: number | null;
  tokensUsed?: number;
  error?: string;
}
export interface JevRouteResult {
  available: boolean;
  choice: string | null;
  error?: string;
}
export type Agreement = "consensus" | "contested" | "lean" | "unavailable";

function key(): string {
  return process.env.TYPESAFE_API_KEY ?? "";
}

async function callJev(state: Record<string, unknown>, outputSpec: Record<string, unknown>) {
  const res = await fetch(JEV_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key()}`,
    },
    body: JSON.stringify({ model: MODEL, state, output: outputSpec }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`jev http ${res.status}`);
  return res.json();
}

/** Second opinion: P(this token is risky) over the already-computed metrics. */
export async function jevSecondOpinion(metrics: Record<string, unknown>): Promise<JevOpinion> {
  if (!key()) return { available: false, riskyProb: null, error: "TYPESAFE_API_KEY missing" };
  try {
    const body = await callJev(
      {
        task: "estimate probability that this DEX token is risky (honeypot, rug, manufactured pump) from these computed metrics",
        metrics,
      },
      { risky: { type: "noul", question: "Is this token risky to buy?" } },
    );
    const noul = body?.output?.risky?.noul;
    if (typeof noul !== "number") return { available: false, riskyProb: null, error: "malformed response" };
    return { available: true, riskyProb: noul, tokensUsed: body?.usage?.input_tokens };
  } catch (e) {
    return { available: false, riskyProb: null, error: e instanceof Error ? e.message : "jev error" };
  }
}

/** Router: pick one candidate token (or template) from a free-text query. */
export async function jevRoute(query: string, candidates: string[]): Promise<JevRouteResult> {
  if (!key()) return { available: false, choice: null, error: "TYPESAFE_API_KEY missing" };
  try {
    const body = await callJev(
      { task: "route this user query to the best matching token candidate", query, candidates },
      { pick: { type: "choice", question: "Which candidate matches the query?", options: candidates } },
    );
    const choice = body?.output?.pick?.choice;
    if (typeof choice !== "string" || !candidates.includes(choice)) {
      return { available: false, choice: null, error: "malformed response" };
    }
    return { available: true, choice };
  } catch (e) {
    return { available: false, choice: null, error: e instanceof Error ? e.message : "jev error" };
  }
}

/** Do rules and Jev point the same way? riskyProb ≥0.65 = risky, ≤0.35 = safe. */
export function agreement(verdict: string, riskyProb: number | null): Agreement {
  if (riskyProb === null) return "unavailable";
  const rulesSayRisky = verdict === "JANGAN" || verdict === "RAWAN";
  const rulesSaySafe = verdict === "LAYAK";
  if (riskyProb >= 0.65) return rulesSayRisky ? "consensus" : "contested";
  if (riskyProb <= 0.35) return rulesSaySafe ? "consensus" : "contested";
  return "lean";
}

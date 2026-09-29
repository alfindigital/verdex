import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VerdictCard } from "@/components/verdict-card";
import { listSnapshotIds, listSnapshotSlugs, loadVerdict, snapshotPath } from "@/lib/verdict-store";

// Bake every committed snapshot (hex ids + stable slugs) into static pages at
// build time — the demo corpus must render without runtime fs on serverless.
// Unlisted ids (live-mode verdicts) still render on demand via dynamicParams.
export const dynamicParams = true;

export function generateStaticParams() {
  const ids = [...listSnapshotIds(), ...listSnapshotSlugs()];
  return [...new Set(ids)].map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const v = loadVerdict(id);
  if (!v) return { title: "Verdex — verdict not found" };
  return {
    title: `${v.token.symbol}: ${v.result.verdict} — Verdex`,
    description: `${v.token.symbol} on ${v.token.platform} scored ${v.result.score}/100 (${v.result.verdict}). Evidence-backed verdict from CoinMarketCap DEX data.`,
  };
}

export default async function VerdictPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const v = loadVerdict(id);
  if (!v) notFound();
  const exactPath = snapshotPath(v.id);
  const shareUrl = exactPath ? `https://verdex-alpha.vercel.app${exactPath}` : null;
  const tweet = shareUrl
    ? `https://x.com/intent/tweet?text=${encodeURIComponent(
        `${v.token.symbol} verdict: ${v.result.verdict} (${v.result.score}/100) — evidence-backed, falsifiable, receipts included.`,
      )}&url=${encodeURIComponent(shareUrl)}&hashtags=BuildwithCMC`
    : null;
  return (
    <main className="relative z-[1] mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <header className="mb-5 flex items-center justify-between border-b border-line pb-3">
        <Link href="/" className="font-data text-xs font-bold tracking-[0.25em] text-dim transition-colors hover:text-safe">
          ← VERDEX
        </Link>
        <div className="flex items-center gap-4">
          <span className="font-data text-[10px] uppercase tracking-widest text-faint">
            verdict/{v.id} · {exactPath ? "recorded archive" : "transient live result"}
          </span>
          {tweet ? (
            <a
              href={tweet}
              target="_blank"
              rel="noopener noreferrer"
              className="font-data text-[10px] font-bold uppercase tracking-widest text-dim transition-colors hover:text-safe"
            >
              share on X ↗
            </a>
          ) : (
            <span className="font-data text-[10px] uppercase tracking-widest text-faint">no permanent share link</span>
          )}
        </div>
      </header>
      <VerdictCard v={v} />
    </main>
  );
}

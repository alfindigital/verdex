import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { VerdictCard } from "@/components/verdict-card";
import { ThemeToggle } from "@/components/theme-toggle";
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
  const shareUrl = exactPath ? `https://verdex.web.id${exactPath}` : null;
  const tweet = shareUrl
    ? `https://x.com/intent/tweet?text=${encodeURIComponent(
        `${v.token.symbol} verdict: ${v.result.verdict} (${v.result.score}/100) — evidence-backed, falsifiable, receipts included.`,
      )}&url=${encodeURIComponent(shareUrl)}&hashtags=BuildwithCMC`
    : null;
  return (
    <main className="relative z-[1] mx-auto max-w-7xl px-4 py-5 sm:px-6">
      <header className="mb-6 flex items-center justify-between gap-4 border-b border-line pb-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Verdex" width={26} height={26} className="rounded-sm" />
          <span className="deco text-lg leading-none">Verdex</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="hidden font-data text-[10px] uppercase tracking-widest text-dim sm:inline">
            exhibit/{v.id} · {exactPath ? "recorded archive" : "transient live result"}
          </span>
          {tweet ? (
            <a
              href={tweet}
              target="_blank"
              rel="noopener noreferrer"
              className="font-data text-[10px] font-bold uppercase tracking-widest text-dim transition-colors hover:text-accent"
            >
              share on X ↗
            </a>
          ) : (
            <span className="font-data text-[10px] uppercase tracking-widest text-dim">no permanent share link</span>
          )}
          <ThemeToggle />
        </div>
      </header>
      <VerdictCard v={v} />
      <p className="mt-6 text-center font-data text-[10px] uppercase tracking-widest text-dim">
        deterministic verdict · not financial advice
      </p>
    </main>
  );
}

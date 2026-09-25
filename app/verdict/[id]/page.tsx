import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VerdictCard } from "@/components/verdict-card";
import { loadVerdict } from "@/lib/verdict-store";

export const dynamic = "force-dynamic";

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
  return (
    <main className="relative z-[1] mx-auto max-w-3xl px-5 py-8 sm:px-6">
      <header className="mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="font-data text-xs font-bold tracking-[0.25em] text-dim transition-colors hover:text-safe"
        >
          ← VERDEX
        </Link>
        <span className="font-data text-[11px] uppercase tracking-widest text-faint">permanent verdict record</span>
      </header>
      <VerdictCard v={v} />
    </main>
  );
}

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
    <main className="relative z-[1] mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <header className="mb-5 flex items-center justify-between border-b border-line pb-3">
        <Link href="/" className="font-data text-xs font-bold tracking-[0.25em] text-dim transition-colors hover:text-safe">
          ← VERDEX
        </Link>
        <span className="font-data text-[10px] uppercase tracking-widest text-faint">verdict/{v.id} · permanent record</span>
      </header>
      <VerdictCard v={v} />
    </main>
  );
}

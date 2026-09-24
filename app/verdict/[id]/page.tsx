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
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="text-sm text-neutral-400 hover:text-neutral-200">
        ← Verdex
      </Link>
      <VerdictCard v={v} />
    </main>
  );
}

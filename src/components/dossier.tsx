"use client";

// Dossier — the "everything the sources said" exhibit. Every row traces to a
// provider field carried through the normalizers; null stays null ("unknown"),
// never silently rendered as zero. Rendered only for schemaVersion-2 records
// that carry a dossier — v1 archives get an honest redaction strip instead.

import { fmtNum, fmtUsd, Stat } from "./viz";
import type { TokenDossier } from "@/lib/verdict-types";

const shortAddr = (a: string) => (a.length > 20 ? `${a.slice(0, 10)}…${a.slice(-8)}` : a);
const iso = (ts: string) => ts.slice(11, 19);
const fmtPrice = (v: number | null) =>
  v == null ? "—" : v >= 1 ? `$${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : `$${v.toPrecision(4)}`;
const fmtTok = (v: number | null) =>
  v == null ? "—" : v >= 1e9 ? `${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `${(v / 1e6).toFixed(2)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(2)}K` : String(v);
const pct = (v: number | null) => (v == null ? "—" : `${v >= 0 ? "+" : ""}${(v * 100).toFixed(2)}%`);

function Section({ title, note, children, open = true }: { title: string; note?: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="group border-t border-line" open={open}>
      <summary className="cursor-pointer select-none px-5 py-3.5 sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className="mr-2 inline-block transition-transform group-open:rotate-90">▸</span>
        <span className="ml-2 text-sm font-semibold uppercase tracking-wide">{title}</span>
        {note && <span className="ml-3 font-data text-[10px] uppercase tracking-widest text-dim">{note}</span>}
      </summary>
      <div className="border-t border-line/60 px-5 py-4 sm:px-6">{children}</div>
    </details>
  );
}

function TH({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th className={`p-2 ${right ? "text-right" : "text-left"} font-data text-[9px] uppercase tracking-widest text-dim`}>{children}</th>;
}

function MonoCell({ v, title }: { v: string; title?: string }) {
  return <span className="mono-strip" title={title ?? v}>{shortAddr(v)}</span>;
}

export function DossierSections({ d }: { d: TokenDossier }) {
  const { profile, market, windowStats, pools, topSwaps, recentSwaps, lpEvents, security, global } = d;
  return (
    <>
      {/* ——— Token dossier ——— */}
      <Section title="Token dossier" note="provider-reported fields — not independently verified">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 lg:grid-cols-6">
          <Stat k="token age" v={profile.ageDays != null ? `${fmtNum(profile.ageDays)}d` : "—"} sub={profile.listedAt?.slice(0, 10) ?? "unlisted date"} />
          <Stat k="holders" v={profile.holders != null ? fmtNum(profile.holders) : "—"} />
          <Stat k="supply" v={fmtTok(profile.totalSupply)} sub={profile.decimals != null ? `${profile.decimals} dec` : undefined} />
          <Stat k="pools" v={fmtNum(pools.length)} sub="indexed pools shown" />
          <Stat k="provider risk" v={profile.riskLevel ?? "unknown"} tone={profile.riskLevel === "safe" ? "text-safe" : profile.riskLevel ? "text-warn" : "text-dim"} />
          <Stat k="cex listings" v={fmtNum(profile.cexListingCount)} sub="CMC-listed exchange data" />
        </div>
        <div className="mt-4 grid gap-3 font-data text-[11px] sm:grid-cols-2">
          {profile.creator && <div className="flex items-center gap-2"><span className="w-16 shrink-0 text-[10px] uppercase tracking-widest text-dim">creator</span><MonoCell v={profile.creator} /></div>}
          {profile.owner && <div className="flex items-center gap-2"><span className="w-16 shrink-0 text-[10px] uppercase tracking-widest text-dim">owner</span><MonoCell v={profile.owner} /></div>}
          {profile.firstPoolAt && <div className="flex items-center gap-2"><span className="w-16 shrink-0 text-[10px] uppercase tracking-widest text-dim">first pool</span><span className="text-dim">{profile.firstPoolAt.slice(0, 10)}</span></div>}
          {profile.tokenSource && <div className="flex items-center gap-2"><span className="w-16 shrink-0 text-[10px] uppercase tracking-widest text-dim">source</span><span className="text-dim">{profile.tokenSource}</span></div>}
        </div>
        {(profile.website || profile.twitter || profile.telegram || profile.tradeUrl || profile.cexNames.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="btn-ghost">website ↗</a>}
            {profile.twitter && <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="btn-ghost">x ↗</a>}
            {profile.telegram && <a href={profile.telegram} target="_blank" rel="noopener noreferrer" className="btn-ghost">telegram ↗</a>}
            {profile.tradeUrl && <a href={profile.tradeUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">trade ↗</a>}
            {profile.cexNames.slice(0, 6).map((n) => (
              <span key={n} className="chip" title="CMC-listed exchange">{n}</span>
            ))}
          </div>
        )}
      </Section>

      {/* ——— Market tape ——— */}
      <Section title="Market tape" note="price + per-window activity">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 lg:grid-cols-7">
          <Stat k="price" v={fmtPrice(market.priceUsd)} />
          <Stat k="24h high" v={fmtPrice(market.high24hUsd)} tone="text-safe" />
          <Stat k="24h low" v={fmtPrice(market.low24hUsd)} tone="text-danger" />
          <Stat k="mcap" v={fmtUsd(market.mcapUsd)} />
          <Stat k="liquidity" v={fmtUsd(market.liqUsd)} />
          <Stat k="vol 24h" v={fmtUsd(market.vol24hUsd)} />
          <Stat k="traders 24h" v={market.uniqueTraders24h != null ? fmtNum(market.uniqueTraders24h) : "—"} />
        </div>
        {windowStats.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-[11px]">
              <thead>
                <tr className="border-b border-line/60">
                  <TH>window</TH><TH right>volume</TH><TH right>txs</TH><TH right>buys</TH><TH right>sells</TH><TH right>buy $</TH><TH right>sell $</TH><TH right>traders</TH><TH right>Δ price</TH>
                </tr>
              </thead>
              <tbody className="font-data">
                {windowStats.map((w) => (
                  <tr key={w.tp} className="border-b border-line/30">
                    <td className="p-2 font-bold text-text">{w.tp}</td>
                    <td className="num p-2 text-right">{fmtUsd(w.volUsd)}</td>
                    <td className="num p-2 text-right">{w.txCount != null ? fmtNum(w.txCount) : "—"}</td>
                    <td className="num p-2 text-right text-safe">{w.buyCount != null ? fmtNum(w.buyCount) : "—"}</td>
                    <td className="num p-2 text-right text-danger">{w.sellCount != null ? fmtNum(w.sellCount) : "—"}</td>
                    <td className="num p-2 text-right">{fmtUsd(w.buyVolUsd)}</td>
                    <td className="num p-2 text-right">{fmtUsd(w.sellVolUsd)}</td>
                    <td className="num p-2 text-right">{w.uniqueTraders != null ? fmtNum(w.uniqueTraders) : "—"}</td>
                    <td className={`num p-2 text-right ${w.priceChange == null ? "text-dim" : w.priceChange >= 0 ? "text-safe" : "text-danger"}`}>{pct(w.priceChange)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ——— Pool register ——— */}
      {pools.length > 0 && (
        <Section title="Pool register" note={`${pools.length} indexed pools · by liquidity`} open={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-[11px]">
              <thead>
                <tr className="border-b border-line/60">
                  <TH>#</TH><TH>pair</TH><TH>dex</TH><TH right>liquidity</TH><TH right>t0 liq</TH><TH right>t1 liq</TH><TH right>vol 24h</TH><TH right>pool age</TH><TH>address</TH>
                </tr>
              </thead>
              <tbody className="font-data">
                {pools.map((p, i) => (
                  <tr key={p.address + i} className="border-b border-line/30">
                    <td className="p-2 text-dim">{p.rank ?? i + 1}</td>
                    <td className="p-2 font-bold text-text">{p.pair}{p.top ? <span className="ml-1.5 paper-tag">top</span> : null}</td>
                    <td className="p-2 text-dim">{p.dex}</td>
                    <td className="num p-2 text-right">{fmtUsd(p.liqUsd)}</td>
                    <td className="num p-2 text-right text-dim">{fmtUsd(p.t0liqUsd)}</td>
                    <td className="num p-2 text-right text-dim">{fmtUsd(p.t1liqUsd)}</td>
                    <td className="num p-2 text-right">{fmtUsd(p.vol24h)}</td>
                    <td className="num p-2 text-right text-dim">{p.ageDays != null ? `${fmtNum(p.ageDays)}d` : "—"}</td>
                    <td className="p-2"><MonoCell v={p.address} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* ——— Security register ——— */}
      <Section title="Security register" note={security ? `${security.checkCount} provider checks · ${security.hitCount} hit` : "no provider report"} open={Boolean(security && security.hitCount > 0)}>
        {security ? (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-2 font-data text-[11px]">
              <span className={`chip ${security.level === "safe" ? "on" : ""}`}>level: {security.level}</span>
              {security.categoryLevel && <span className="chip">category: {security.categoryLevel}</span>}
              {Object.entries(security.evmFlags).map(([k, v]) => (
                <span key={k} className="chip" title={k}>{v}</span>
              ))}
              {security.tags.map((t) => <span key={t} className="chip">{t}</span>)}
            </div>
            {security.items.length > 0 ? (
              <div className="grid gap-1.5 md:grid-cols-2">
                {security.items.map((i, idx) => (
                  <div key={idx} className={`rounded-sm border p-2.5 text-[11px] leading-relaxed ${i.hit ? "border-danger/50 bg-danger/5" : "border-line/50"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-data font-bold ${i.hit ? "text-danger" : "text-safe"}`}>{i.hit ? "HIT" : "pass"}</span>
                      <span className="font-data text-[9px] uppercase tracking-widest text-dim">{i.group ?? "check"} · {i.level}</span>
                    </div>
                    <p className="mt-1 text-dim">{i.description ?? i.code}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-data text-[11px] text-dim">Provider returned a level without itemized checks — nothing more was reported.</p>
            )}
          </>
        ) : (
          <p className="font-data text-[11px] text-dim">No security detail captured for this sample — level and items are unknown, not clean.</p>
        )}
      </Section>

      {/* ——— Swap tape ——— */}
      {(topSwaps.length > 0 || recentSwaps.length > 0) && (
        <Section title="Swap tape" note={`largest ${topSwaps.length} + newest ${recentSwaps.length} of window`} open={false}>
          <div className="grid gap-5 lg:grid-cols-2">
            {[
              { label: "largest by usd", rows: topSwaps },
              { label: "newest", rows: recentSwaps },
            ].map(({ label, rows }) => (
              <div key={label}>
                <div className="mb-2 font-data text-[10px] uppercase tracking-widest text-dim">{label}</div>
                <table className="w-full text-[10.5px]">
                  <tbody className="font-data">
                    {rows.map((s, i) => (
                      <tr key={s.tx + i} className="border-b border-line/30">
                        <td className="p-1.5 text-dim">{iso(s.ts)}</td>
                        <td className={`p-1.5 font-bold ${s.side === "buy" ? "text-safe" : "text-danger"}`}>{s.side.toUpperCase()}</td>
                        <td className="num p-1.5 text-right">{fmtUsd(s.usd)}</td>
                        <td className="num p-1.5 text-right text-dim">
                          {s.tokenAmount != null ? fmtTok(s.tokenAmount) : "—"}
                          {s.counterAmount != null && s.counterSymbol ? <span className="text-dim"> ↔ {fmtTok(s.counterAmount)} {s.counterSymbol}</span> : null}
                        </td>
                        <td className="p-1.5"><MonoCell v={s.tx} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ——— LP tape ——— */}
      {lpEvents.length > 0 && (
        <Section title="LP tape" note={`newest ${lpEvents.length} liquidity events`} open={false}>
          <table className="w-full text-[10.5px]">
            <tbody className="font-data">
              {lpEvents.map((e, i) => (
                <tr key={(e.tx ?? "") + i} className="border-b border-line/30">
                  <td className="p-1.5 text-dim">{iso(e.ts)}</td>
                  <td className={`p-1.5 font-bold ${e.kind === "add" ? "text-safe" : "text-danger"}`}>{e.kind.toUpperCase()}</td>
                  <td className="num p-1.5 text-right">{fmtUsd(e.usd)}</td>
                  <td className="p-1.5 text-dim">{e.dex ?? "—"}</td>
                  <td className="p-1.5"><MonoCell v={e.maker} /></td>
                  <td className="p-1.5">{e.tx ? <MonoCell v={e.tx} /> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {/* ——— Macro tape ——— */}
      <Section title="Macro tape" note="global context at capture time" open={false}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 lg:grid-cols-7">
          <Stat k="btc dom" v={global.btcDom != null ? `${global.btcDom.toFixed(2)}%` : "—"} sub={global.btcDom24hChange != null ? `${global.btcDom24hChange >= 0 ? "+" : ""}${global.btcDom24hChange.toFixed(2)}% 24h` : undefined} />
          <Stat k="eth dom" v={global.ethDom != null ? `${global.ethDom.toFixed(2)}%` : "—"} />
          <Stat k="fear/greed" v={global.fearGreed != null ? String(global.fearGreed) : "—"} sub={global.fearGreedClass ?? undefined} />
          <Stat k="total mcap" v={fmtUsd(global.totalMcapUsd)} />
          <Stat k="defi vol 24h" v={fmtUsd(global.defiVol24hUsd)} />
          <Stat k="defi mcap" v={fmtUsd(global.defiMcapUsd)} />
          <Stat k="stable mcap" v={fmtUsd(global.stableMcapUsd)} />
        </div>
      </Section>
    </>
  );
}

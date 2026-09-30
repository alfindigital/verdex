"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="relative z-[1] mx-auto flex min-h-[70vh] max-w-3xl flex-col items-start justify-center px-6">
      <span className="stamp stamp-md text-danger">Scan error</span>
      <h1 className="deco mt-6 text-4xl leading-tight sm:text-5xl">Something broke while rendering.</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-dim">
        The evidence on file is unaffected — this is a rendering failure, not a data failure.
      </p>
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={reset} className="btn-run px-5 py-2.5 text-sm">
          Retry render
        </button>
        <Link href="/" className="btn-ghost">
          back to scanner
        </Link>
      </div>
    </main>
  );
}

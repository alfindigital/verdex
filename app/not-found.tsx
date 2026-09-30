import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative z-[1] mx-auto flex min-h-[70vh] max-w-3xl flex-col items-start justify-center px-6">
      <span className="stamp stamp-md text-unknown">No exhibit</span>
      <h1 className="deco mt-6 text-4xl leading-tight sm:text-5xl">This record doesn&apos;t exist.</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-dim">
        Verdex only links to committed evidence — nothing here is generated on the fly. If you followed a link,
        the snapshot may have been superseded by a newer capture.
      </p>
      <Link href="/" className="btn-ghost mt-8">
        ← back to the scanner
      </Link>
    </main>
  );
}

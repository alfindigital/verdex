import Link from "next/link";

export default function VerdictNotFound() {
  return (
    <main className="relative z-[1] mx-auto flex min-h-[70vh] max-w-3xl flex-col items-start justify-center px-6">
      <span className="stamp stamp-md text-warn">Unknown exhibit</span>
      <h1 className="deco mt-6 text-4xl leading-tight sm:text-5xl">No verdict is on file for this id.</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-dim">
        Permanent links exist only for committed snapshot records — live scans are transient by design. The case
        files on the front page list every recorded exhibit.
      </p>
      <Link href="/" className="btn-ghost mt-8">
        ← browse case files
      </Link>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";

// A/B design-direction switcher — persists to localStorage, mutates <html data-dir>.
// Ships for local comparison; remove or freeze once a direction is picked.
export function DirToggle() {
  const [dir, setDir] = useState<"a" | "b">("a");

  useEffect(() => {
    if (document.documentElement.dataset.dir === "b") setDir("b");
  }, []);

  function apply(d: "a" | "b") {
    document.documentElement.dataset.dir = d;
    try {
      localStorage.setItem("vdx-dir", d);
    } catch {}
    setDir(d);
  }

  return (
    <div
      role="group"
      aria-label="Design direction"
      title="Design direction A/B"
      className="flex items-center overflow-hidden rounded-sm border border-line"
    >
      {(["a", "b"] as const).map((d) => (
        <button
          key={d}
          type="button"
          aria-pressed={dir === d}
          onClick={() => apply(d)}
          className={`px-2.5 py-1 font-data text-[10px] font-bold uppercase transition-colors ${
            dir === d ? "bg-accent text-ink" : "text-dim hover:text-text"
          }`}
        >
          {d}
        </button>
      ))}
    </div>
  );
}

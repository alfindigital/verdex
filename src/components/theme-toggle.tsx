"use client";

// Theme flip is pure attribute + localStorage — icons are both rendered and
// CSS picks by html[data-theme], so SSR and hydration always agree.
export function ThemeToggle() {
  const flip = () => {
    const el = document.documentElement;
    const next = el.dataset.theme === "light" ? "dark" : "light";
    el.dataset.theme = next;
    try {
      localStorage.setItem("vdx-theme", next);
    } catch {
      /* private mode — theme still applies for the session */
    }
  };
  return (
    <button
      type="button"
      onClick={flip}
      aria-label="Toggle dark / light theme"
      title="Toggle theme"
      className="flex h-7 w-7 items-center justify-center rounded-sm border border-line text-dim transition-colors hover:border-line-bright hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
    >
      <svg className="icon-sun h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2a5 5 0 1 1 0-10 5 5 0 0 1 0 10ZM8 0a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1A.75.75 0 0 1 8 0Zm0 13.25a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1A.75.75 0 0 1 8 13.25ZM2.34 2.34a.75.75 0 0 1 1.06 0l.71.7a.75.75 0 0 1-1.07 1.07l-.7-.7a.75.75 0 0 1 0-1.07Zm9.55 9.55a.75.75 0 0 1 1.06 0l.71.7a.75.75 0 0 1-1.07 1.07l-.7-.7a.75.75 0 0 1 0-1.07ZM0 8a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1A.75.75 0 0 1 0 8Zm13.25 0a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1A.75.75 0 0 1 13.25 8ZM2.34 12.6a.75.75 0 0 1 0 1.06l-.7.71a.75.75 0 1 1-1.07-1.07l.7-.7a.75.75 0 0 1 1.07 0Zm9.55-9.55a.75.75 0 0 1 0-1.06l.7-.71a.75.75 0 0 1 1.07 1.07l-.7.7a.75.75 0 0 1-1.07 0Z" />
      </svg>
      <svg className="icon-moon h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278Z" />
      </svg>
    </button>
  );
}

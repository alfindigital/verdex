import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted fonts (SIL OFL) — no Google Fonts fetch at build time.
const archivo = localFont({
  src: "./fonts/Archivo.ttf", // variable font, covers 100–900 + wdth axis
  variable: "--font-archivo",
});

const fraunces = localFont({
  src: "./fonts/Fraunces-VF.ttf", // variable font: opsz + wght + SOFT + WONK
  variable: "--font-fraunces",
});

const plexMono = localFont({
  src: [
    { path: "./fonts/IBMPlexMono-Regular.ttf", weight: "400" },
    { path: "./fonts/IBMPlexMono-Medium.ttf", weight: "500" },
    { path: "./fonts/IBMPlexMono-Bold.ttf", weight: "700" },
  ],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://verdex.web.id"),
  title: "Verdex — Don't be the exit liquidity",
  description:
    "Paste a DEX token. Get an auditable verdict — entry-worthy, caution, or avoid — computed from CoinMarketCap evidence and cross-examined by an independent decision model.",
  openGraph: {
    title: "Verdex — Don't be the exit liquidity",
    description:
      "Auditable pre-trade verdicts for DEX tokens. CoinMarketCap evidence, deterministic rules, independent second opinion.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#060807",
};

// Reads the persisted theme before first paint so a light-mode visitor never
// sees a dark flash. Missing/invalid values fall back to the dark default.
const THEME_INIT = `try{var t=localStorage.getItem("vdx-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${fraunces.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="relative min-h-screen bg-ink font-display text-text">
        {children}
      </body>
    </html>
  );
}

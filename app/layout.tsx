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
  metadataBase: new URL("https://verdex-alpha.vercel.app"),
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
  themeColor: "#0b0c0a",
};

// Read the design direction before first paint (no flash).
// ?dir=a|b in the URL wins, then localStorage, then default "a".
const DIR_SCRIPT = `try{var q=new URLSearchParams(location.search).get("dir");var d=q==="a"||q==="b"?q:localStorage.getItem("vdx-dir");if(d==="a"||d==="b"){document.documentElement.dataset.dir=d;localStorage.setItem("vdx-dir",d)}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-dir="a" suppressHydrationWarning className={`${archivo.variable} ${fraunces.variable} ${plexMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: DIR_SCRIPT }} />
      </head>
      <body className="relative min-h-screen bg-ink font-display text-text">
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["400", "500", "600", "700", "800"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
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
  themeColor: "#0c0e0c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
      <body className="relative min-h-screen bg-ink font-display text-text">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verdex — Don't be the exit liquidity",
  description:
    "Paste a DEX token. Get an auditable verdict — LAYAK/RAWAN/JANGAN — computed from CoinMarketCap data, cross-examined by an independent decision model.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}

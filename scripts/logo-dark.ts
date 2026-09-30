// 3 dark-theme Verdex mark variants tuned to the shipped palette
// (ink #0a0d09, accent #2be384, bone #f1f5e9, dim #96a086).
// Output: public/logo-concepts/logo-{i,j,k}-*.{svg,png}
// Usage: pnpm tsx scripts/logo-dark.ts
import { mkdirSync, writeFileSync } from "fs";
import sharp from "sharp";

const BG = "#0a0d09";
const GREEN = "#2be384";
const BONE = "#f1f5e9";
const DIM = "#96a086";
const LINE = "#303a26";

const wrap = (inner: string) =>
  `<svg width="480" height="480" viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="480" rx="96" fill="${BG}"/><rect x="14" y="14" width="452" height="452" rx="84" fill="none" stroke="${LINE}" stroke-width="2"/>${inner}</svg>`;

/* I — "Stamp V": the rubber-stamp signature, rotated, serif V dead center.
   Reads at 16px: a tilted seal, unmistakably the verdict stamp. */
const I = wrap(`
  <g transform="rotate(-8 240 224)">
    <rect x="118" y="130" width="244" height="188" rx="10" fill="none" stroke="${GREEN}" stroke-width="14"/>
    <rect x="134" y="146" width="212" height="156" rx="6" fill="none" stroke="${GREEN}" stroke-width="3" opacity="0.55"/>
    <text x="240" y="272" font-family="Georgia, 'Times New Roman', serif" font-size="150" font-weight="700" font-style="italic" fill="${BONE}" text-anchor="middle">V</text>
  </g>
`);

/* J — "Ledger V": three evidence rows; the V is cut INTO the rows,
   negative space — the verdict carved out of the tape. */
const J = wrap(`
  <g>
    <line x1="128" y1="150" x2="352" y2="150" stroke="${DIM}" stroke-width="12" stroke-linecap="round"/>
    <line x1="128" y1="188" x2="300" y2="188" stroke="${DIM}" stroke-width="12" stroke-linecap="round"/>
    <line x1="128" y1="308" x2="296" y2="308" stroke="${DIM}" stroke-width="12" stroke-linecap="round"/>
    <line x1="128" y1="346" x2="340" y2="346" stroke="${DIM}" stroke-width="12" stroke-linecap="round"/>
    <path d="M186 218 L240 296 L294 218" fill="none" stroke="${GREEN}" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
`);

/* K — "Pulse diamond": stamp-tilted diamond seal with the V tick,
   ring of hash notches — forensic instrument face. */
const K = wrap(`
  <g transform="rotate(-8 240 232)">
    ${Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      const r1 = 132, r2 = i % 3 === 0 ? 150 : 142;
      const x1 = 240 + Math.cos(a) * r1, y1 = 232 + Math.sin(a) * r1;
      const x2 = 240 + Math.cos(a) * r2, y2 = 232 + Math.sin(a) * r2;
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${LINE}" stroke-width="6" stroke-linecap="round"/>`;
    }).join("")}
    <path d="M186 174 L240 290 L294 174" fill="none" stroke="${GREEN}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="240" cy="290" r="11" fill="${GREEN}"/>
  </g>
`);

const concepts: Record<string, { svg: string; name: string }> = {
  "logo-i-stamp-v": { svg: I, name: "I · Stamp V — tilted rubber-stamp seal, serif V" },
  "logo-j-ledger-v": { svg: J, name: "J · Ledger V — V carved through evidence rows" },
  "logo-k-pulse-diamond": { svg: K, name: "K · Pulse Diamond — instrument face, V tick + hash ring" },
};

async function main() {
  mkdirSync("public/logo-concepts", { recursive: true });
  for (const [file, c] of Object.entries(concepts)) {
    writeFileSync(`public/logo-concepts/${file}.svg`, c.svg);
    await sharp(Buffer.from(c.svg)).png().toFile(`public/logo-concepts/${file}.png`);
    console.log(`wrote ${file} — ${c.name}`);
  }
}

void main();

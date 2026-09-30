// Generates 5 NEW Verdex logo concepts (D..H) as SVG + 480px PNG.
// Keeps existing logo-a/b/c untouched — these are additional candidates.
// Palette: Evidence Desk — paper-black bg, evidence-green accent, stamp amber,
// bone text. Every mark encodes "evidence-verified verdict", not generic crypto.
// Usage: pnpm tsx scripts/logo-concepts.ts
import { mkdirSync, writeFileSync } from "fs";
import sharp from "sharp";

const BG = "#0c0e0c";
const GREEN = "#34d399";
const AMBER = "#f5b04a";
const BONE = "#e8e6df";
const DIM = "#5f6b62";

const wrap = (inner: string, bg = BG) =>
  `<svg width="480" height="480" viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="480" rx="88" fill="${bg}"/>${inner}</svg>`;

/* D — "Verdict Stamp": rotated stamp frame + serif V.
   The product's signature is the rubber stamp (ENTRY/CAUTION/DANGER);
   the logo IS the stamp mid-slam. */
const D = wrap(`
  <g transform="rotate(-12 240 240)">
    <rect x="118" y="142" width="244" height="172" rx="14" fill="none" stroke="${AMBER}" stroke-width="13"/>
    <rect x="136" y="160" width="208" height="136" rx="7" fill="none" stroke="${AMBER}" stroke-width="4" opacity="0.45"/>
    <text x="240" y="272" font-family="Georgia, 'Times New Roman', serif" font-size="118" font-weight="700" fill="${AMBER}" text-anchor="middle">V</text>
  </g>
  <text x="240" y="404" font-family="'Courier New', monospace" font-size="34" font-weight="bold" letter-spacing="10" fill="${BONE}" text-anchor="middle">VERDEX</text>
`);

/* E — "Exhibit Tag": manila evidence tag with punched hole + tie,
   green V as the marked exhibit. Case-file metaphor, unique in crypto. */
const E = wrap(`
  <g transform="rotate(8 240 220)">
    <path d="M150 128 L330 128 Q346 128 354 144 L396 226 Q402 240 396 254 L354 336 Q346 352 330 352 L150 352 Q134 352 134 336 L134 144 Q134 128 150 128 Z"
          fill="none" stroke="${BONE}" stroke-width="11" opacity="0.92"/>
    <circle cx="172" cy="240" r="15" fill="none" stroke="${BONE}" stroke-width="9"/>
    <path d="M172 225 Q168 180 200 158" fill="none" stroke="${DIM}" stroke-width="7" stroke-linecap="round"/>
    <path d="M232 196 L276 288 L320 196" fill="none" stroke="${GREEN}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="240" y="412" font-family="'Courier New', monospace" font-size="34" font-weight="bold" letter-spacing="10" fill="${BONE}" text-anchor="middle">VERDEX</text>
`);

/* F — "Hash Dial": radial sha-ticks (the receipt fingerprint)
   broken by a V-shaped gap. Evidence ring around the verdict mark. */
const F = wrap(`
  <g transform="translate(240 232)">
    ${Array.from({ length: 28 }, (_, i) => {
      const a = (i / 28) * Math.PI * 2;
      const skip = a > Math.PI * 1.18 && a < Math.PI * 1.82; // V-gap at bottom
      if (skip) return "";
      const r1 = 118, r2 = i % 4 === 0 ? 148 : 136;
      const x1 = Math.cos(a) * r1, y1 = Math.sin(a) * r1, x2 = Math.cos(a) * r2, y2 = Math.sin(a) * r2;
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${DIM}" stroke-width="7" stroke-linecap="round"/>`;
    }).join("")}
    <path d="M-66 -34 L0 74 L66 -34" fill="none" stroke="${GREEN}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="0" cy="74" r="12" fill="${GREEN}"/>
  </g>
  <text x="240" y="414" font-family="'Courier New', monospace" font-size="34" font-weight="bold" letter-spacing="10" fill="${BONE}" text-anchor="middle">VERDEX</text>
`);

/* G — "Fold-Check": document sheet, folded corner; the fold silhouette
   is a checkmark — evidence that verifies. Editorial, paper-native. */
const G = wrap(`
  <path d="M158 118 L284 118 L336 170 L336 348 Q336 364 320 364 L158 364 Q142 364 142 348 L142 134 Q142 118 158 118 Z"
        fill="none" stroke="${BONE}" stroke-width="11"/>
  <path d="M284 118 L284 154 Q284 170 300 170 L336 170 Z" fill="${BONE}" opacity="0.28"/>
  <path d="M192 262 L234 304 L296 216" fill="none" stroke="${GREEN}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="188" y1="196" x2="252" y2="196" stroke="${DIM}" stroke-width="8" stroke-linecap="round"/>
  <line x1="188" y1="160" x2="252" y2="160" stroke="${DIM}" stroke-width="8" stroke-linecap="round"/>
  <text x="240" y="414" font-family="'Courier New', monospace" font-size="34" font-weight="bold" letter-spacing="10" fill="${BONE}" text-anchor="middle">VERDEX</text>
`);

/* H — "Seal Ledger": three ledger rows; a notary-style seal interrupts them —
   verification stamped over raw records. */
const H = wrap(`
  <g>
    <line x1="140" y1="166" x2="340" y2="166" stroke="${DIM}" stroke-width="9" stroke-linecap="round"/>
    <line x1="140" y1="204" x2="300" y2="204" stroke="${DIM}" stroke-width="9" stroke-linecap="round"/>
    <line x1="140" y1="280" x2="300" y2="280" stroke="${DIM}" stroke-width="9" stroke-linecap="round"/>
    <line x1="140" y1="318" x2="340" y2="318" stroke="${DIM}" stroke-width="9" stroke-linecap="round"/>
    <line x1="140" y1="356" x2="290" y2="356" stroke="${DIM}" stroke-width="9" stroke-linecap="round"/>
    <circle cx="262" cy="242" r="52" fill="${BG}" stroke="${GREEN}" stroke-width="11"/>
    <circle cx="262" cy="242" r="38" fill="none" stroke="${GREEN}" stroke-width="3" opacity="0.5"/>
    <path d="M240 226 L262 268 L284 226" fill="none" stroke="${GREEN}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="262" cy="242" r="60" fill="none" stroke="${GREEN}" stroke-width="3" stroke-dasharray="4 9" opacity="0.6"/>
  </g>
  <text x="240" y="414" font-family="'Courier New', monospace" font-size="34" font-weight="bold" letter-spacing="10" fill="${BONE}" text-anchor="middle">VERDEX</text>
`);

const concepts: Record<string, { svg: string; name: string }> = {
  "logo-d-verdict-stamp": { svg: D, name: "D · Verdict Stamp — the product's rubber-stamp signature mid-slam" },
  "logo-e-exhibit-tag": { svg: E, name: "E · Exhibit Tag — manila evidence tag, marked exhibit V" },
  "logo-f-hash-dial": { svg: F, name: "F · Hash Dial — sha256 tick-ring broken by the verdict V" },
  "logo-g-fold-check": { svg: G, name: "G · Fold-Check — document fold forming a checkmark" },
  "logo-h-seal-ledger": { svg: H, name: "H · Seal Ledger — notary seal stamped over ledger rows" },
};

async function main() {
  mkdirSync("public/logo-concepts", { recursive: true });
  for (const [file, c] of Object.entries(concepts)) {
    writeFileSync(`public/logo-concepts/${file}.svg`, c.svg);
    await sharp(Buffer.from(c.svg)).png().toFile(`public/logo-concepts/${file}.png`);
    console.log(`wrote public/logo-concepts/${file}.{svg,png} — ${c.name}`);
  }
}

void main();

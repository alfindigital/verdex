// Generates the BUIDL logo: public/logo.png (480×480) via sharp.
import sharp from "sharp";

const svg = `<svg width="480" height="480" xmlns="http://www.w3.org/2000/svg">
  <rect width="480" height="480" rx="96" fill="#0a0a0a"/>
  <rect x="24" y="24" width="432" height="432" rx="80" fill="none" stroke="#10b981" stroke-width="6" opacity="0.35"/>
  <path d="M120 150 L240 330 L360 150" fill="none" stroke="#10b981" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="240" cy="330" r="26" fill="#10b981"/>
  <text x="240" y="415" font-family="monospace" font-size="42" font-weight="bold" fill="#e5e5e5" text-anchor="middle">VERDEX</text>
</svg>`;

sharp(Buffer.from(svg)).png().toFile("public/logo.png").then(() => console.log("public/logo.png written"));

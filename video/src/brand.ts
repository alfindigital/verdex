// Verdex brand tokens, lifted from the product itself (app/globals.css palette).
// Reason (R-31): the video must read as the product's own voice, not a generic template.
import { delayRender, continueRender, staticFile } from "remotion";

export const C = {
  ink: "#0a0a0a",
  panel: "#111113",
  line: "#232326",
  text: "#e5e5e5",
  dim: "#a3a3a3",
  faint: "#737373",
  safe: "#10b981",
  warn: "#f59e0b",
  danger: "#ef4444",
  cold: "#8a8f98",
};

export const F = {
  display: "ArchivoLocal, sans-serif",
  data: "PlexMonoLocal, monospace",
};

let loaded = false;
export function ensureFonts() {
  if (loaded) return;
  loaded = true;
  const handle = delayRender("loading verdex fonts");
  const jobs = [
    new FontFace("ArchivoLocal", `url('${staticFile("fonts/Archivo.ttf")}')`, {
      weight: "100 900",
    }).load(),
    new FontFace("PlexMonoLocal", `url('${staticFile("fonts/IBMPlexMono-Regular.ttf")}')`, {
      weight: "400",
    }).load(),
    new FontFace("PlexMonoLocal", `url('${staticFile("fonts/IBMPlexMono-Medium.ttf")}')`, {
      weight: "500",
    }).load(),
    new FontFace("PlexMonoLocal", `url('${staticFile("fonts/IBMPlexMono-Bold.ttf")}')`, {
      weight: "700",
    }).load(),
  ];
  Promise.all(jobs)
    .then((fs) => fs.forEach((f) => document.fonts.add(f)))
    .finally(() => continueRender(handle));
}

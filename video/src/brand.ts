// Verdex brand tokens, lifted from the product itself (app/globals.css palette).
// Reason (R-31): the video must read as the product's own voice, not a generic template.
import { delayRender, continueRender, staticFile } from "remotion";

// Synced to the redesigned app tokens (app/globals.css, direction A
// "Evidence Desk"). Paper/accent added for the dossier variant.
export const C = {
  ink: "#0b0c0a",
  panel: "#13160f",
  line: "#2a2f25",
  lineBright: "#404739",
  text: "#eef1e7",
  dim: "#a7b09d",
  faint: "#8b947f",
  paper: "#eae8da",
  paperInk: "#1b1d16",
  safe: "#3dd68c",
  warn: "#f0b23c",
  danger: "#f2555a",
  cold: "#8a8f98",
  accent: "#3dd68c",
};

export const F = {
  display: "ArchivoLocal, sans-serif",
  serif: "FrauncesLocal, serif",
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
    new FontFace("FrauncesLocal", `url('${staticFile("fonts/Fraunces-VF.ttf")}')`, {
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

import { readFileSync } from "node:fs";
import path from "node:path";
import { verifyBundle, type EvidenceBundle } from "@/engine/evidence";

const input = process.argv[2];
if (!input) {
  console.error("Usage: pnpm evidence:verify <bundle.json>");
  process.exitCode = 2;
} else {
  const file = path.resolve(input);
  try {
    const bundle = JSON.parse(readFileSync(file, "utf8")) as EvidenceBundle;
    const result = verifyBundle(bundle);
    if (!result.ok) {
      for (const error of result.errors) console.error(`ERROR ${error}`);
      process.exitCode = 1;
    } else {
      console.log(`OK evidence bundle ${file}`);
    }
  } catch (error) {
    console.error(`ERROR unable to read or parse ${file}: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

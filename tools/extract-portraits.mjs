import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [, , sourcePath, outDir = process.cwd()] = process.argv;

if (!sourcePath) {
  console.error("Usage: node tools/extract-portraits.mjs <source.html> [outDir]");
  process.exit(1);
}

const html = await readFile(sourcePath, "utf8");
const portraitsBlock = html.match(/const PORTRAITS = \{([\s\S]*?)\};/);

if (!portraitsBlock) {
  console.error("Could not find PORTRAITS block.");
  process.exit(1);
}

const entries = [...portraitsBlock[1].matchAll(/(\w+)\s*:\s*"([^"]+)"/g)].map(([, key, value]) => ({
  key,
  value,
}));

if (!entries.length) {
  console.error("No portraits found.");
  process.exit(1);
}

await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, "portraits.json"), JSON.stringify(Object.fromEntries(entries.map(({ key, value }) => [key, value])), null, 2));

console.log(`Extracted ${entries.length} portraits.`);

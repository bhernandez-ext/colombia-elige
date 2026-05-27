import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [, , sourcePath, targetDir = process.cwd()] = process.argv;

if (!sourcePath) {
  console.error("Usage: node tools/bootstrap-single-file.mjs <source.html> [targetDir]");
  process.exit(1);
}

const html = await readFile(sourcePath, "utf8");

const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/i);
const bodyMatch = html.match(/<body>([\s\S]*?)<script>/i);

if (!styleMatch || !scriptMatch || !bodyMatch) {
  console.error("Could not locate style, body, or script blocks in source file.");
  process.exit(1);
}

await mkdir(path.join(targetDir, "js"), { recursive: true });

const style = styleMatch[1].trim() + "\n";
const script = scriptMatch[1].trim() + "\n";
const body = bodyMatch[1].trim();

const normalizedHtml = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Colombia Elige — Estrategia Electoral 2026</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet">
<script src="https://d3js.org/d3.v7.min.js"></script>
<link rel="stylesheet" href="./styles.css">
</head>
<body>
${body}
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="./js/config.js"></script>
<script src="./js/app.js"></script>
</body>
</html>
`;

await writeFile(path.join(targetDir, "styles.css"), style);
await writeFile(path.join(targetDir, "js", "app.js"), script);
await writeFile(path.join(targetDir, "index.html"), normalizedHtml);

console.log("Bootstrap complete.");

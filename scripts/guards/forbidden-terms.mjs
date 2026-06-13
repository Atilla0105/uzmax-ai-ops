import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const engineDir = path.join(root, "packages", "engine");
const forbiddenTerms = ["Laylak", "集运", "乌兹别克"];
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
    } else if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

const files = await listFiles(engineDir);
const violations = [];

for (const file of files) {
  const text = await readFile(file, "utf8");
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    forbiddenTerms.forEach((term) => {
      if (line.includes(term)) {
        violations.push(`${path.relative(root, file)}:${index + 1}:${term}`);
      }
    });
  });
}

if (violations.length > 0) {
  console.error("Forbidden business terms found in packages/engine:");
  console.error(violations.join("\n"));
  process.exit(1);
}

console.log("forbidden-terms: ok");

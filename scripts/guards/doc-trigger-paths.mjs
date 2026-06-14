import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const ignoredDirs = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  "test-results"
]);

function argValue(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function listFiles(root, current = "") {
  const directory = path.join(root, current);
  if (!existsSync(directory)) return [];

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith(".DS_Store")) return [];
    const relativePath = path.posix.join(current, entry.name);
    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) return [];
      return listFiles(root, relativePath);
    }
    return relativePath;
  });
}

function fileContains(root, files, pattern, contentPattern) {
  return files
    .filter((file) => pattern.test(file))
    .some((file) => {
      try {
        return contentPattern.test(readFileSync(path.join(root, file), "utf8"));
      } catch {
        return false;
      }
    });
}

function evaluateDocTriggers(root = process.cwd()) {
  const files = listFiles(root);
  const gates = [
    {
      name: "evals",
      doc: "docs/evals/README.md",
      triggers: [
        files.some((file) => file.startsWith("packages/evals/fixtures/")),
        files.some((file) =>
          /^packages\/evals\/.*(?:cases?|redline|blind[-_]review|runner)\.(?:ts|tsx|mjs|js|json|jsonl|md)$/i.test(
            file
          )
        ),
        fileContains(
          root,
          files,
          /(?:^|\/)(schema\.prisma|.*\.(?:sql|ts|mjs))$/i,
          /\beval_(?:case|run|result)\b/i
        )
      ]
    },
    {
      name: "contracts",
      doc: "docs/contracts/README.md",
      triggers: [
        files.some((file) =>
          /^(?:packages\/db\/(?:prisma\/)?schema\.prisma|packages\/db\/migrations\/)/.test(
            file
          )
        ),
        files.some((file) =>
          /(?:^|\/)(?:generated|contracts?|openapi|schema-generator)(?:\/|$)/i.test(
            file
          )
        ),
        files.some((file) => /(?:^|\/)openapi\.(?:json|ya?ml)$/i.test(file))
      ]
    }
  ];

  return gates
    .filter(
      (gate) => gate.triggers.some(Boolean) && !existsSync(path.join(root, gate.doc))
    )
    .map((gate) => gate);
}

const root = path.resolve(argValue("--root", process.cwd()));
const missing = evaluateDocTriggers(root);

if (missing.length === 0) {
  console.log("doc-trigger-paths: ok");
  process.exit(0);
}

console.error("doc-trigger-paths failed:");
for (const gate of missing) {
  console.error(`- ${gate.name}: ${gate.doc} is required by docs/doc-gates.md`);
}
process.exit(1);

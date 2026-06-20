#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const MARKER = "prettier" + "-ignore";
const LABEL = `${"prettier"}${"-ignore"}-boundary`;
const MONITORED_ROOTS = ["apps", "packages", "scripts"];
const MONITORED_EXTENSIONS = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx"
]);
const SKIPPED_DIRS = new Set([
  ".git",
  ".next",
  "build",
  "coverage",
  "dist",
  "node_modules"
]);

const BASELINE_COUNTS = new Map([
  ["packages/evals/src/index.ts", 10],
  ["packages/engine/src/index.ts", 9],
  ["packages/llm-gateway/src/index.ts", 4],
  ["packages/db/src/index.ts", 47],
  ["packages/db/src/m3-ai-contracts.ts", 9],
  ["packages/capabilities/speech/src/index.ts", 5],
  ["packages/capabilities/vision/src/index.ts", 2],
  ["scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs", 3]
]);

const BASELINE_TOTAL = [...BASELINE_COUNTS.values()].reduce(
  (sum, count) => sum + count,
  0
);

function parseArgs(argv) {
  const options = {
    base: "",
    root: process.cwd()
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--base") {
      options.base = argv[index + 1] ?? "";
      index += 1;
    } else if (arg.startsWith("--base=")) {
      options.base = arg.slice("--base=".length);
    } else if (arg === "--root") {
      options.root = argv[index + 1] ?? "";
      index += 1;
    } else if (arg.startsWith("--root=")) {
      options.root = arg.slice("--root=".length);
    }
  }

  return options;
}

function normalizePath(value) {
  return value.split(path.sep).join("/");
}

function isMonitoredPath(relativePath) {
  const normalized = normalizePath(relativePath);
  const [firstSegment] = normalized.split("/");

  return (
    MONITORED_ROOTS.includes(firstSegment) &&
    MONITORED_EXTENSIONS.has(path.extname(normalized))
  );
}

function listMonitoredFiles(root) {
  const files = [];

  for (const rootName of MONITORED_ROOTS) {
    const absoluteRoot = path.join(root, rootName);
    if (!existsSync(absoluteRoot)) continue;
    walk(absoluteRoot, root, files);
  }

  return files.sort();
}

function walk(currentPath, root, files) {
  const currentStat = statSync(currentPath);
  if (currentStat.isDirectory()) {
    if (SKIPPED_DIRS.has(path.basename(currentPath))) return;

    for (const entry of readdirSync(currentPath)) {
      walk(path.join(currentPath, entry), root, files);
    }
    return;
  }

  if (!currentStat.isFile()) return;

  const relativePath = normalizePath(path.relative(root, currentPath));
  if (isMonitoredPath(relativePath)) {
    files.push(relativePath);
  }
}

function countMarkers(text) {
  let count = 0;
  let index = text.indexOf(MARKER);

  while (index !== -1) {
    count += 1;
    index = text.indexOf(MARKER, index + MARKER.length);
  }

  return count;
}

function collectMarkerCounts(root) {
  const counts = new Map();

  for (const relativePath of listMonitoredFiles(root)) {
    const absolutePath = path.join(root, relativePath);
    const count = countMarkers(readFileSync(absolutePath, "utf8"));
    if (count > 0) {
      counts.set(relativePath, count);
    }
  }

  return counts;
}

function diffAddedMarkerLines(root, base) {
  if (!base) return [];

  const diff = execFileSync(
    "git",
    ["diff", "--unified=0", "--no-ext-diff", base, "--", ...MONITORED_ROOTS],
    {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }
  );

  const added = [];
  let currentPath = "";

  for (const line of diff.split(/\r?\n/)) {
    if (line.startsWith("+++ b/")) {
      currentPath = line.slice("+++ b/".length);
      continue;
    }
    if (line.startsWith("+++ /dev/null")) {
      currentPath = "";
      continue;
    }
    if (!line.startsWith("+") || line.startsWith("+++")) continue;
    if (!currentPath || !isMonitoredPath(currentPath)) continue;
    if (line.includes(MARKER)) {
      added.push(currentPath);
    }
  }

  return [...new Set(added)].sort();
}

export function collectViolations(root, base = "") {
  const counts = collectMarkerCounts(root);
  const violations = [];
  let total = 0;

  for (const [relativePath, count] of counts.entries()) {
    total += count;
    const baseline = BASELINE_COUNTS.get(relativePath);

    if (baseline === undefined) {
      violations.push(
        `new monitored source/test file contains ${MARKER}: ${relativePath} (${count})`
      );
    } else if (count > baseline) {
      violations.push(
        `baseline file count exceeds baseline: ${relativePath} has ${count}, allowed ${baseline}`
      );
    }
  }

  if (total > BASELINE_TOTAL) {
    violations.push(
      `total ${MARKER} count exceeds baseline: ${total}, allowed ${BASELINE_TOTAL}`
    );
  }

  for (const relativePath of diffAddedMarkerLines(root, base)) {
    violations.push(
      `diff adds ${MARKER} marker in monitored source/test path: ${relativePath}`
    );
  }

  return { counts, total, violations };
}

function printFailure(violations) {
  console.error(`${LABEL} failed:`);
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  console.error(
    "This pre-M4 governance guard freezes the existing baseline; it does not clean source or start M4 work."
  );
}

export function main() {
  const options = parseArgs(process.argv.slice(2));
  const root = path.resolve(options.root || process.cwd());
  const { counts, total, violations } = collectViolations(root, options.base);

  if (violations.length > 0) {
    printFailure(violations);
    process.exit(1);
  }

  console.log(
    `${LABEL}: ok (${counts.size} baseline file(s), ${total}/${BASELINE_TOTAL} marker(s))`
  );
  if (options.base) {
    console.log(
      `${LABEL}: diff check ok for monitored source/test paths against ${options.base}`
    );
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

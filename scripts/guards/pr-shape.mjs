import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);

function argValue(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
}

const base = argValue("--base", "origin/main");
const specPath = argValue("--spec", "docs/specs/M0-01-monorepo-ci-agents.md");
const root = process.cwd();

function git(argsForGit) {
  return execFileSync("git", argsForGit, { encoding: "utf8" });
}

function changedFiles() {
  const output = git(["diff", "--name-only", `${base}...HEAD`]);
  const unstaged = git(["diff", "--name-only"]);
  const untracked = git(["ls-files", "--others", "--exclude-standard"]);
  return [
    ...new Set(`${output}\n${unstaged}\n${untracked}`.split(/\r?\n/).filter(Boolean))
  ];
}

function classify(file) {
  if (/package-lock\.json$/.test(file)) return "lock";
  if (/^(docs\/|.*\.md$)/.test(file)) return "docs";
  if (
    /(^\.github\/|\.config\.|config\.|\.json$|\.ya?ml$|\.cjs$|\.mjs$|tsconfig)/.test(
      file
    )
  ) {
    return "config";
  }
  if (/(\.test\.|\.spec\.|\/tests?\/)/.test(file)) return "test";
  if (/(generated|dist|build|coverage)/.test(file)) return "generated";
  return "source";
}

function patternToRegex(pattern) {
  const normalized = pattern.replace(/`/g, "").trim();
  if (normalized.endsWith("/**")) {
    return new RegExp(`^${escapeRegex(normalized.slice(0, -3))}(/|$)`);
  }
  if (normalized.endsWith("/*")) {
    return new RegExp(`^${escapeRegex(normalized.slice(0, -2))}(/|$)`);
  }
  if (normalized.endsWith("/")) {
    return new RegExp(`^${escapeRegex(normalized)}`);
  }
  if (normalized.includes("*")) {
    return new RegExp(`^${escapeRegex(normalized).replaceAll("\\*", ".*")}$`);
  }
  return new RegExp(`^${escapeRegex(normalized)}($|/)`);
}

function escapeRegex(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

async function readTouchPatterns(filePath) {
  const text = await readFile(path.join(root, filePath), "utf8");
  const section = text.split(/^## /m).find((part) => part.startsWith("触碰模块/文件"));
  if (!section) {
    throw new Error(`Missing touch module section in ${filePath}`);
  }

  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).split("、"))
    .flat()
    .map((line) => line.match(/`([^`]+)`/)?.[1])
    .filter(Boolean);
}

const files = changedFiles();
const patterns = await readTouchPatterns(specPath);
const regexes = patterns.map(patternToRegex);
const outOfScope = files.filter((file) => !regexes.some((regex) => regex.test(file)));

const byCategory = files.reduce((acc, file) => {
  const category = classify(file);
  acc[category] = (acc[category] ?? 0) + 1;
  return acc;
}, {});

const sourceFiles = files.filter((file) => classify(file) === "source");
const isBootstrap = specPath.includes("M0-01");

if (outOfScope.length > 0) {
  console.error(`guard:pr-shape out-of-scope files for ${specPath}:`);
  console.error(outOfScope.join("\n"));
  process.exit(1);
}

if (!isBootstrap && sourceFiles.length > 12) {
  console.error(`guard:pr-shape source file budget exceeded: ${sourceFiles.length}`);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      base,
      specPath,
      bootstrapException: isBootstrap,
      changedFiles: files.length,
      categories: byCategory
    },
    null,
    2
  )
);

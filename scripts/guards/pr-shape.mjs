import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_BASE = "origin/main";
const DEFAULT_SOURCE_BUDGET = { changedFiles: 12, netLoc: 600, newFiles: 5 };
const EXCEPTION_TOKENS = new Set(
  "none large_change_exception test_weakening_exception external_dependency_exception".split(
    " "
  )
);
const SPEC_TYPES = new Set("feature fix refactor cleanup spike docs infra".split(" "));

function parseArgs(argv) {
  const args = { base: DEFAULT_BASE, includeWorktree: false };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--include-worktree") {
      args.includeWorktree = true;
    } else if (value.startsWith("--")) {
      args[value.slice(2)] = argv[index + 1];
      index += 1;
    }
  }

  return args;
}

function git(argsForGit, cwd = process.cwd()) {
  return execFileSync("git", argsForGit, { cwd, encoding: "utf8" });
}

function safeGit(argsForGit, cwd = process.cwd()) {
  try {
    return git(argsForGit, cwd);
  } catch {
    return "";
  }
}

function readChangedFiles(base, includeWorktree) {
  const committed = safeGit(["diff", "--name-only", `${base}...HEAD`]);
  const workspace = includeWorktree
    ? `${safeGit(["diff", "--name-only"])}\n${safeGit([
        "ls-files",
        "--others",
        "--exclude-standard"
      ])}`
    : "";

  return uniqueLines(`${committed}\n${workspace}`);
}

function readNameStatus(base) {
  return safeGit(["diff", "--name-status", `${base}...HEAD`])
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [status, ...fileParts] = line.split(/\t/);
      return { status, file: fileParts.at(-1) };
    });
}

function readNumstat(base) {
  return safeGit(["diff", "--numstat", `${base}...HEAD`])
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [added, deleted, file] = line.split(/\t/);
      return {
        added: Number.parseInt(added, 10) || 0,
        deleted: Number.parseInt(deleted, 10) || 0,
        file
      };
    });
}

function uniqueLines(value) {
  return [...new Set(value.split(/\r?\n/).filter(Boolean))];
}

export function classify(file) {
  if (/package-lock\.json$/.test(file)) return "lock";
  if (/^(docs\/|.*\.md$)/.test(file)) return "docs";
  if (/(\.test\.|\.spec\.|\/tests?\/)/.test(file)) return "test";
  if (
    /(^|\/)(generated|dist|build|coverage)(\/|$)|\.snap$|\.sql$|\.d\.ts$/.test(file)
  ) {
    return "generated";
  }
  if (
    /(^\.github\/|(^|\/)[^/]*(?:config|rc)\.(?:js|cjs|mjs|ts|json)$|\.json$|\.ya?ml$|tsconfig)/.test(
      file
    )
  ) {
    return "config";
  }
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

async function readSpec(filePath) {
  const text = await readFile(path.join(process.cwd(), filePath), "utf8");
  const specType = readSectionValue(text, "Spec 类型");
  const touchPatterns = readTouchPatterns(text, filePath);

  if (!SPEC_TYPES.has(specType)) {
    throw new Error(`Invalid or missing Spec 类型 in ${filePath}: ${specType}`);
  }

  return { specType, touchPatterns };
}

function readSectionValue(text, title) {
  const section = text.split(/^## /m).find((part) => part.startsWith(title));
  if (!section) return "";
  return section
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim())
    .find(Boolean);
}

function readTouchPatterns(text, filePath) {
  const section = text.split(/^## /m).find((part) => part.startsWith("触碰模块/文件"));
  if (!section) {
    throw new Error(`Missing touch module section in ${filePath}`);
  }

  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .flatMap((line) => line.slice(2).split("、"))
    .map((line) => line.match(/`([^`]+)`/)?.[1])
    .filter(Boolean);
}

async function readPrBody(args) {
  if (args["pr-body-file"]) {
    const body = await readFile(path.join(process.cwd(), args["pr-body-file"]), "utf8");
    return { body, isPrContext: true };
  }

  const eventBody = await readGithubEventBody();
  if (eventBody.isPrContext) return eventBody;

  return safeGhPrBody();
}

async function readGithubEventBody() {
  if (!process.env.GITHUB_EVENT_PATH) return { body: "", isPrContext: false };

  try {
    const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, "utf8"));
    return {
      body: event.pull_request?.body ?? "",
      isPrContext: Boolean(event.pull_request)
    };
  } catch {
    return { body: "", isPrContext: false };
  }
}

function safeGhPrBody() {
  try {
    const body = execFileSync("gh", ["pr", "view", "--json", "body", "--jq", ".body"], {
      encoding: "utf8"
    }).trim();
    return { body, isPrContext: true };
  } catch {
    return { body: "", isPrContext: false };
  }
}

export function parsePrBody(body) {
  return {
    exception: readBodyField(body, "Exception") || "none",
    externalEvidence: readBodyField(body, "External API evidence") || "none",
    testWeakeningSourceMap: readBodyField(body, "Test weakening source map"),
    specFile: readBodyField(body, "Spec file"),
    specId: readBodyField(body, "Spec ID")
  };
}

function readBodyField(body, fieldName) {
  const escaped = escapeRegex(fieldName);
  const tableMatch = body.match(
    new RegExp(`\\|[ \\t]*${escaped}[ \\t]*\\|[ \\t]*([^|]+?)[ \\t]*\\|`, "i")
  );
  const listMatch = body.match(new RegExp(`-[ \\t]*${escaped}:[ \\t]*([^\\n]+)`, "i"));
  const colonMatch = body.match(new RegExp(`^${escaped}:[ \\t]*([^\\n]+)`, "im"));
  return (tableMatch?.[1] ?? listMatch?.[1] ?? colonMatch?.[1] ?? "").trim();
}

function validatePrMetadata(metadata, args, isPrContext) {
  const hasPrContext = Boolean(
    isPrContext || args["pr-body-file"] || metadata.specFile || metadata.specId
  );
  if (!hasPrContext && !args.spec) {
    return { shouldSkip: true, specPath: "" };
  }

  if (hasPrContext && (!metadata.specId || !metadata.specFile)) {
    throw new Error("PR body must include both Spec ID and Spec file");
  }

  if (!EXCEPTION_TOKENS.has(metadata.exception)) {
    throw new Error(`Invalid Exception token: ${metadata.exception}`);
  }

  if (args.spec && metadata.specFile && args.spec !== metadata.specFile) {
    throw new Error(
      `CLI spec ${args.spec} does not match PR body spec ${metadata.specFile}`
    );
  }

  return { shouldSkip: false, specPath: args.spec ?? metadata.specFile };
}

function isBootstrapException(metadata, specPath) {
  return (
    metadata.specId === "M0-01" &&
    specPath === "docs/specs/M0-01-monorepo-ci-agents.md" &&
    metadata.exception === "large_change_exception"
  );
}

function findOutOfScopeFiles(files, touchPatterns) {
  const regexes = touchPatterns.map(patternToRegex);
  return files.filter((file) => !regexes.some((regex) => regex.test(file)));
}

function sourceStats(files, nameStatus, numstat) {
  const sourceFiles = files.filter((file) => classify(file) === "source");
  const newSourceFiles = nameStatus.filter(
    ({ status, file }) => status.startsWith("A") && classify(file) === "source"
  );
  const sourceNumstat = numstat.filter(({ file }) => classify(file) === "source");
  const added = sourceNumstat.reduce((sum, entry) => sum + entry.added, 0);
  const deleted = sourceNumstat.reduce((sum, entry) => sum + entry.deleted, 0);

  return {
    changedFiles: sourceFiles.length,
    netLoc: added - deleted,
    newFiles: newSourceFiles.length
  };
}

function sourceBudgetViolations(stats) {
  return [
    stats.changedFiles > DEFAULT_SOURCE_BUDGET.changedFiles &&
      `source files ${stats.changedFiles} > ${DEFAULT_SOURCE_BUDGET.changedFiles}`,
    stats.netLoc > DEFAULT_SOURCE_BUDGET.netLoc &&
      `net source LOC ${stats.netLoc} > ${DEFAULT_SOURCE_BUDGET.netLoc}`,
    stats.newFiles > DEFAULT_SOURCE_BUDGET.newFiles &&
      `new source files ${stats.newFiles} > ${DEFAULT_SOURCE_BUDGET.newFiles}`
  ].filter(Boolean);
}

function readDiff(base) {
  return safeGit(["diff", "--unified=0", "--no-ext-diff", `${base}...HEAD`]);
}

export function findTestWeakening(diffText, nameStatus) {
  const controlPattern = /^\+(?!\+\+).*(?:\.(?:skip|only)\s*\(|\b(?:xit|xfail)\s*\()/;
  const controlLines = diffText
    .split(/\r?\n/)
    .filter((line) => controlPattern.test(line));
  const deletedTests = nameStatus
    .filter(({ status, file }) => status.startsWith("D") && classify(file) === "test")
    .map(({ file }) => file);

  return [...controlLines, ...deletedTests];
}

function findAdapterFiles(nameStatus) {
  return nameStatus
    .filter(({ status }) => status.startsWith("A"))
    .map(({ file }) => file)
    .filter((file) =>
      /(^|\/)(providers?|connectors?|adapters?)(\/|$)|(?:provider|connector|adapter)[^/]*\.(?:ts|tsx|js|jsx|mjs)$/.test(
        file
      )
    );
}

function hasExternalEvidence(metadata) {
  if (metadata.exception === "external_dependency_exception") return true;
  return /(official docs|generated types|spike evidence|ADR-B)/i.test(
    metadata.externalEvidence
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const prContext = await readPrBody(args);
  const metadata = parsePrBody(prContext.body);
  const { shouldSkip, specPath } = validatePrMetadata(
    metadata,
    args,
    prContext.isPrContext
  );

  if (shouldSkip) {
    console.log("guard:pr-shape: no PR context detected; skipping PR-only checks");
    return;
  }

  const spec = await readSpec(specPath);
  const files = readChangedFiles(args.base, args.includeWorktree);
  const nameStatus = readNameStatus(args.base);
  const numstat = readNumstat(args.base);
  const bootstrapException = isBootstrapException(metadata, specPath);
  const violations = [
    ...findOutOfScopeFiles(files, spec.touchPatterns).map(
      (file) => `out-of-scope file: ${file}`
    ),
    ...sourceViolations(files, nameStatus, numstat, bootstrapException, metadata),
    ...testViolations(args.base, nameStatus, metadata, spec.specType),
    ...adapterViolations(nameStatus, metadata)
  ];

  if (violations.length > 0) {
    console.error("guard:pr-shape failed:");
    console.error(violations.join("\n"));
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        base: args.base,
        specPath,
        specType: spec.specType,
        bootstrapException,
        changedFiles: files.length,
        categories: categoryCounts(files),
        source: sourceStats(files, nameStatus, numstat)
      },
      null,
      2
    )
  );
}

function sourceViolations(files, nameStatus, numstat, bootstrapException, metadata) {
  if (bootstrapException || metadata.exception === "large_change_exception") {
    return [];
  }
  return sourceBudgetViolations(sourceStats(files, nameStatus, numstat));
}

function testViolations(base, nameStatus, metadata, specType) {
  const violations = findTestWeakening(readDiff(base), nameStatus);
  if (violations.length === 0) return [];

  if (isTestWeakeningCandidate(metadata, specType, nameStatus)) {
    return [];
  }
  return violations.map(
    (violation) => `test weakening without exception: ${violation}`
  );
}

function isTestWeakeningCandidate(metadata, specType, nameStatus) {
  if (metadata.exception !== "test_weakening_exception") return false;
  if (!["cleanup", "refactor"].includes(specType)) return false;

  const deletedSourceFiles = nameStatus
    .filter(({ status, file }) => status.startsWith("D") && classify(file) === "source")
    .map(({ file }) => file);

  return (
    deletedSourceFiles.length > 0 &&
    deletedSourceFiles.some((file) => metadata.testWeakeningSourceMap.includes(file))
  );
}

function adapterViolations(nameStatus, metadata) {
  const adapterFiles = findAdapterFiles(nameStatus);
  if (adapterFiles.length === 0 || hasExternalEvidence(metadata)) {
    return [];
  }
  return adapterFiles.map((file) => `adapter without external evidence: ${file}`);
}

function categoryCounts(files) {
  return files.reduce((acc, file) => {
    const category = classify(file);
    acc[category] = (acc[category] ?? 0) + 1;
    return acc;
  }, {});
}

if (process.argv[1]?.endsWith("pr-shape.mjs")) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

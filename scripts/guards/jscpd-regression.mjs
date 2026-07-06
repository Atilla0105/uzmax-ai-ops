#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const LABEL = "jscpd-regression";
const SCAN_PATHS = ["apps", "packages", "scripts"];
const SUMMARY_METRICS = [
  "clones",
  "duplicatedLines",
  "percentage",
  "duplicatedTokens",
  "percentageTokens"
];
const REQUIRED_STATISTICS = [...SUMMARY_METRICS, "lines", "sources", "tokens"];
const REPORT_FILE = "jscpd-report.json";
const FLOAT_EPSILON = 1e-9;
const OPTION_READERS = new Map([
  ["base", (options, value) => (options.base = value)],
  ["root", (options, value) => (options.root = value)]
]);

function parseArgs(argv) {
  const options = {
    base: "",
    root: process.cwd()
  };

  let cursor = 0;
  while (cursor < argv.length) {
    const { key, nextCursor, value } = readOption(argv, cursor);
    const assign = OPTION_READERS.get(key);
    if (!assign) throw new Error(`unknown argument: ${argv[cursor]}`);
    assign(options, value);
    cursor = nextCursor;
  }

  return options;
}

function readOption(argv, cursor) {
  const raw = argv[cursor];
  const inline = raw.match(/^--([^=]+)=(.*)$/);
  if (inline) return { key: inline[1], nextCursor: cursor + 1, value: inline[2] };
  if (!raw.startsWith("--")) throw new Error(`unknown argument: ${raw}`);
  return {
    key: raw.slice(2),
    nextCursor: cursor + 2,
    value: argv[cursor + 1] ?? ""
  };
}

export function parseJscpdReport(report) {
  const total = report?.statistics?.total;
  if (!total || typeof total !== "object") {
    throw new Error("missing jscpd statistics.total");
  }

  const summary = {};
  for (const metric of REQUIRED_STATISTICS) {
    const value = total[metric];
    if (!Number.isFinite(value)) {
      throw new Error(`missing numeric jscpd statistic: ${metric}`);
    }
    summary[metric] = value;
  }

  return summary;
}

export function compareJscpdSummaries(base, head) {
  const violations = [];

  for (const metric of SUMMARY_METRICS) {
    const baseValue = base[metric];
    const headValue = head[metric];
    if (headValue > baseValue + FLOAT_EPSILON) {
      violations.push({
        base: baseValue,
        head: headValue,
        metric,
        message: `${metric} worsened: base=${formatValue(metric, baseValue)}, head=${formatValue(metric, headValue)}`
      });
    }
  }

  return violations;
}

export function formatSummary(name, summary) {
  return [
    `${name}: clones=${summary.clones}`,
    `duplicatedLines=${summary.duplicatedLines} (${formatPercent(summary.percentage)})`,
    `duplicatedTokens=${summary.duplicatedTokens} (${formatPercent(summary.percentageTokens)})`,
    `sources=${summary.sources}`,
    `lines=${summary.lines}`,
    `tokens=${summary.tokens}`
  ].join(", ");
}

export function runRegressionGuard(options) {
  const root = path.resolve(options.root || process.cwd());
  const baseRef = options.base || "";
  if (!baseRef) {
    throw new Error("--base <ref> is required");
  }

  ensureFile(path.join(root, "jscpd.config.json"));
  ensureFile(jscpdBin(root));

  const tempRoot = mkdtempSync(path.join(tmpdir(), "uzmax-jscpd-regression-"));
  const baseWorktree = path.join(tempRoot, "base");
  const baseReport = path.join(tempRoot, "base-report");
  const headReport = path.join(tempRoot, "head-report");
  let worktreeCreated = false;
  let result;
  let runError;

  try {
    const baseCommit = resolveBaseCommit(root, baseRef);
    addDetachedWorktree(root, baseWorktree, baseCommit);
    worktreeCreated = true;

    const baseSummary = runJscpdForRoot(root, baseWorktree, baseReport);
    const headSummary = runJscpdForRoot(root, root, headReport);
    const violations = compareJscpdSummaries(baseSummary, headSummary);

    result = {
      baseCommit,
      baseRef,
      baseSummary,
      headSummary,
      tempRoot,
      violations
    };
  } catch (error) {
    runError = error;
  }

  const cleanupErrors = cleanupTempWorktree(
    root,
    tempRoot,
    baseWorktree,
    worktreeCreated
  );
  if (runError || cleanupErrors.length > 0) {
    throw combinedError(runError, cleanupErrors);
  }

  return result;
}

function runJscpdForRoot(toolRoot, targetRoot, reportRoot) {
  ensureFile(path.join(targetRoot, "jscpd.config.json"));
  mkdirSync(reportRoot, { recursive: true });

  runNode(
    jscpdBin(toolRoot),
    [
      ...SCAN_PATHS,
      "--config",
      "jscpd.config.json",
      "--workers",
      "1",
      "--no-tips",
      "--reporters",
      "json",
      "--output",
      reportRoot,
      "--threshold",
      "100"
    ],
    targetRoot
  );

  return readJscpdReport(path.join(reportRoot, REPORT_FILE));
}

function readJscpdReport(reportPath) {
  ensureFile(reportPath);
  try {
    return parseJscpdReport(JSON.parse(readFileSync(reportPath, "utf8")));
  } catch (error) {
    throw new Error(`cannot parse jscpd report ${reportPath}: ${messageOf(error)}`, {
      cause: error
    });
  }
}

function resolveBaseCommit(root, baseRef) {
  const resolved = runGit(
    ["rev-parse", "--verify", `${baseRef}^{commit}`],
    root
  ).trim();
  if (!resolved) {
    throw new Error(`base ref did not resolve to a commit: ${baseRef}`);
  }
  return resolved;
}

function addDetachedWorktree(root, worktreePath, baseCommit) {
  runGit(["worktree", "add", "--detach", worktreePath, baseCommit], root);
}

function cleanupTempWorktree(root, tempRoot, baseWorktree, worktreeCreated) {
  const errors = [];
  if (worktreeCreated) {
    try {
      runGit(["worktree", "remove", "--force", baseWorktree], root);
    } catch (error) {
      errors.push(`git worktree remove failed: ${messageOf(error)}`);
    }
  }

  try {
    rmSync(tempRoot, { force: true, recursive: true });
  } catch (error) {
    errors.push(`temp directory cleanup failed: ${messageOf(error)}`);
  }

  return errors;
}

function runGit(args, cwd) {
  return run("git", args, cwd);
}

function runNode(script, args, cwd) {
  return run(process.execPath, [script, ...args], cwd);
}

function run(command, args, cwd) {
  try {
    return execFileSync(command, args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
  } catch (error) {
    throw new Error(commandFailure(command, args, error), { cause: error });
  }
}

function commandFailure(command, args, error) {
  const output = [error.stdout, error.stderr].filter(Boolean).join("\n").trim();
  const suffix = output ? `\n${output}` : "";
  return `${command} ${args.join(" ")} failed${suffix}`;
}

function combinedError(runError, cleanupErrors) {
  const messages = [];
  if (runError) messages.push(messageOf(runError));
  if (cleanupErrors.length > 0) {
    messages.push(`cleanup failed: ${cleanupErrors.join("; ")}`);
  }
  return new Error(messages.join("\n"));
}

function ensureFile(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`required file is missing: ${filePath}`);
  }
}

function jscpdBin(root) {
  return path.join(root, "node_modules/jscpd/run-jscpd.js");
}

function formatValue(metric, value) {
  return metric === "percentage" || metric === "percentageTokens"
    ? formatPercent(value)
    : String(value);
}

function formatPercent(value) {
  return `${Number(value).toFixed(2)}%`;
}

function messageOf(error) {
  return error instanceof Error ? error.message : String(error);
}

function printResult(result) {
  console.log(`${LABEL}: base ${result.baseRef} -> ${result.baseCommit}`);
  console.log(formatSummary("base", result.baseSummary));
  console.log(formatSummary("head", result.headSummary));

  if (result.violations.length === 0) {
    console.log(`${LABEL}: ok, head did not worsen duplicate metrics`);
    return;
  }

  console.error(`${LABEL}: duplicate metrics worsened`);
  for (const violation of result.violations) {
    console.error(`- ${violation.message}`);
  }
  process.exitCode = 1;
}

export function main(argv = process.argv.slice(2)) {
  try {
    printResult(runRegressionGuard(parseArgs(argv)));
  } catch (error) {
    console.error(`${LABEL}: failed`);
    console.error(messageOf(error));
    process.exitCode = 1;
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main();
}

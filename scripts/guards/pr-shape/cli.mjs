import { parsePrBody, readPrBody, validatePrMetadata } from "./metadata.mjs";
import { readChangedFiles, readNameStatus, readNumstat } from "./git.mjs";
import { categoryCounts, collectViolations, sourceStats } from "./violations.mjs";
import { readSpec } from "./spec.mjs";

const DEFAULT_BASE = "origin/main";

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

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
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

  const context = await readValidationContext(args, metadata, specPath);
  const violations = collectViolations(context);

  if (violations.length > 0) {
    console.error("guard:pr-shape failed:");
    console.error(violations.join("\n"));
    process.exit(1);
  }

  console.log(JSON.stringify(validationReport(context), null, 2));
}

async function readValidationContext(args, metadata, specPath) {
  const spec = await readSpec(specPath);
  const files = readChangedFiles(args.base, args.includeWorktree);
  const nameStatus = readNameStatus(args.base);
  const numstat = readNumstat(args.base);

  return {
    base: args.base,
    bootstrapException: isBootstrapException(metadata, specPath),
    files,
    metadata,
    nameStatus,
    numstat,
    spec,
    specPath
  };
}

function isBootstrapException(metadata, specPath) {
  return (
    metadata.specId === "M0-01" &&
    specPath === "docs/specs/M0-01-monorepo-ci-agents.md" &&
    metadata.exception === "large_change_exception"
  );
}

function validationReport(context) {
  return {
    base: context.base,
    specPath: context.specPath,
    specType: context.spec.specType,
    bootstrapException: context.bootstrapException,
    changedFiles: context.files.length,
    categories: categoryCounts(context.files),
    source: sourceStats(context.files, context.nameStatus, context.numstat)
  };
}

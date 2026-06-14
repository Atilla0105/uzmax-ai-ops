import { readDiff } from "./git.mjs";
import { classify, findOutOfScopeFiles } from "./spec.mjs";

const DEFAULT_SOURCE_BUDGET = { changedFiles: 12, netLoc: 600, newFiles: 5 };

export function collectViolations(context) {
  return [
    ...findOutOfScopeFiles(context.files, context.spec.touchPatterns).map(
      (file) => `out-of-scope file: ${file}`
    ),
    ...sourceViolations(context),
    ...testViolations(context),
    ...adapterViolations(context.nameStatus, context.metadata)
  ];
}

export function sourceStats(files, nameStatus, numstat) {
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

function sourceViolations(context) {
  if (
    context.bootstrapException ||
    context.metadata.exception === "large_change_exception"
  ) {
    return [];
  }
  return sourceBudgetViolations(
    sourceStats(context.files, context.nameStatus, context.numstat)
  );
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

function testViolations(context) {
  const violations = findTestWeakening(readDiff(context.base), context.nameStatus);
  if (violations.length === 0) return [];

  if (
    isTestWeakeningCandidate(
      context.metadata,
      context.spec.specType,
      context.nameStatus
    )
  ) {
    return [];
  }
  return violations.map(
    (violation) => `test weakening without exception: ${violation}`
  );
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

export function categoryCounts(files) {
  return files.reduce((acc, file) => {
    const category = classify(file);
    acc[category] = (acc[category] ?? 0) + 1;
    return acc;
  }, {});
}

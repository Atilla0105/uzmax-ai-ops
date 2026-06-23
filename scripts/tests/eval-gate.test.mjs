import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import ts from "typescript";

const evals = await importTypescriptModule("packages/evals/src/index.ts");

describe("minimal eval gate", () => {
  it("receives eval-triggered paths when run by the trigger guard", () => {
    const triggeredPaths = process.env.UZMAX_EVAL_TRIGGERED_PATHS;

    if (triggeredPaths) {
      assert.equal(triggeredPaths.split(/\r?\n/).every(Boolean), true);
    } else {
      assert.equal(triggeredPaths, undefined);
    }
  });

  it("passes the M1-05 seed manifest aggregate quota checks", () => {
    const result = evals.evaluateSeedManifest(evals.m1Gate1SeedManifest);

    assert.equal(result.status, "pass");
    assert.equal(result.failedChecks.length, 0);
    assert.equal(result.quotas.seedMinimum, 60);
    assert.deepEqual(
      result.checks.map((quotaCheck) => quotaCheck.name),
      [
        "manifest_version",
        "owner_signed_status",
        "seed_minimum",
        "unique_records",
        "intent_minimum",
        "uz_ru_minimum",
        "redline_minimum",
        "redaction_residuals",
        "content_not_in_git",
        "third_party_llm_blocked",
        "controlled_storage_ref",
        "public_link_blocked"
      ]
    );
  });

  it("fails closed when seed quota, redaction, or storage policy is unsafe", () => {
    const result = evals.evaluateSeedManifest({
      ...evals.m1Gate1SeedManifest,
      intentRecords: 29,
      redlineRecords: 9,
      residualSensitivePatternHits: 1,
      seedReviewRecords: 59,
      storage: {
        ...evals.m1Gate1SeedManifest.storage,
        controlledStorageRef: "public-bucket",
        publicLinkAllowed: true,
        redactedSampleContentInGit: true,
        rawSampleContentInGit: true,
        thirdPartyLlmAllowed: true
      },
      uniqueRecords: 58,
      uzRuRecords: 19
    });

    assert.equal(result.status, "fail");
    assert.deepEqual(
      result.failedChecks.map((quotaCheck) => quotaCheck.name),
      [
        "seed_minimum",
        "unique_records",
        "intent_minimum",
        "uz_ru_minimum",
        "redline_minimum",
        "redaction_residuals",
        "content_not_in_git",
        "third_party_llm_blocked",
        "controlled_storage_ref",
        "public_link_blocked"
      ]
    );
  });

  it("reports isolated manifest status and storage reference failures", () => {
    const wrongStorage = evals.evaluateSeedManifest({
      ...evals.m1Gate1SeedManifest,
      storage: {
        ...evals.m1Gate1SeedManifest.storage,
        controlledStorageRef: "external-drive"
      }
    });
    const deferredStatus = evals.evaluateSeedManifest({
      ...evals.m1Gate1SeedManifest,
      status: "sample_deferred"
    });
    const wrongVersion = evals.evaluateSeedManifest({
      ...evals.m1Gate1SeedManifest,
      manifestVersion: "legacy_manifest"
    });

    assert.deepEqual(
      wrongStorage.failedChecks.map((quotaCheck) => quotaCheck.name),
      ["controlled_storage_ref"]
    );
    assert.deepEqual(
      deferredStatus.failedChecks.map((quotaCheck) => quotaCheck.name),
      ["owner_signed_status"]
    );
    assert.deepEqual(
      wrongVersion.failedChecks.map((quotaCheck) => quotaCheck.name),
      ["manifest_version"]
    );
    assert.equal(
      deferredStatus.failedChecks[0]?.expected,
      evals.evalSeedAllowedStatuses.join(",")
    );
  });
});

async function importTypescriptModule(relativePath) {
  return import(transpiledModuleUrl(relativePath));
}

function transpiledModuleUrl(relativePath) {
  const source = readFileSync(relativePath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2023
    },
    fileName: relativePath
  });
  const localM4Url = transpiledLeafUrl(
    "packages/evals/src/m4-order-read-no-fabrication.ts"
  );
  const resolvedOutput = outputText.replaceAll(
    '"./m4-order-read-no-fabrication.ts"',
    JSON.stringify(localM4Url)
  );
  return dataUrl(resolvedOutput);
}

function transpiledLeafUrl(relativePath) {
  const source = readFileSync(relativePath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2023
    },
    fileName: relativePath
  });
  return dataUrl(outputText);
}

function dataUrl(outputText) {
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}

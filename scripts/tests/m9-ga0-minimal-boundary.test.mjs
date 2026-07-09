import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const read = (relativePath) => readFileSync(path.join(repoRoot, relativePath), "utf8");

const files = {
  evidence: "docs/evidence/GA-0/GA0-00-minimal-boundary.md",
  m902Evidence: "docs/evidence/M9/M9-02-admin-vercel-staging-closeout.md",
  release: "docs/release.md",
  releaseGate: "apps/admin/src/releaseGateContracts.ts",
  spec: "docs/specs/M9-03-ga0-minimal-signoff-boundary.md"
};

const contents = Object.fromEntries(
  Object.entries(files).map(([key, filePath]) => [key, read(filePath)])
);
const releaseContracts = await tsModule(files.releaseGate);

test("M9-03 spec and GA0-00 evidence exist with minimal-boundary tokens", () => {
  assert.equal(existsSync(files.spec), true);
  assert.equal(existsSync(files.evidence), true);

  for (const doc of [contents.spec, contents.evidence]) {
    assert.match(
      doc,
      /ga0_minimal_bot_only_boundary_recorded_ai_quality_deferred_not_open/
    );
    assert.match(doc, /Bot-only controlled internal\/staging/i);
    assert.match(doc, /G-04\/G-06|G-04 and G-06/);
    assert.match(doc, /deferred.*not passed|not passed.*deferred/i);
    assert.match(doc, /M9-04.*M9-05.*M9-06/s);
    assert.match(doc, /M9-04.*real employee session/s);
    assert.match(doc, /owner-input blocker/i);
    assert.match(doc, /M9-05.*M8 supervisor.*alone/s);
    assert.match(doc, /redline\/fuse suppression/i);
    assert.match(doc, /zero outbound for a canary/i);
    assert.match(doc, /reason code/i);
    assert.match(doc, /1\.0 remains blocked|1\.0.*blocked/i);
    assert.match(doc, /Business automatic reply/i);
    assert.match(doc, /formal knowledge write/i);
    assert.match(doc, /customer LLM/i);
  }
});

test("release docs keep GA-0 locked with deferral and follow-up requirements", () => {
  assert.match(contents.release, /GA-0 remains locked/);
  assert.match(contents.release, /minimal Bot-only GA-0 signoff path is now selected/);
  assert.match(contents.release, /controlled internal\/staging use/);
  assert.match(contents.release, /G-04\/G-06 are deferred not passed/);
  assert.match(contents.release, /does not count as 1\.0 acceptance/);
  assert.match(contents.release, /M9-04 employee admin read evidence/);
  assert.match(contents.release, /M9-05 Bot redline\/fuse leave-ticket drill/);
  assert.match(contents.release, /M9-06 owner signoff\/open record/);
  assert.match(contents.release, /M9-04 is not closable from local environment alone/);
  assert.match(
    contents.release,
    /real employee session evidence through Vercel admin\/Supabase/
  );
  assert.match(
    contents.release,
    /M9-05 cannot be honestly closed with the current M8 supervisor alone/
  );
  assert.match(contents.release, /zero outbound for a canary/);
  assert.match(contents.release, /1\.0 remains blocked/);
});

test("M9-05 future touch list is recorded if no existing evidence path proves drill facts", () => {
  for (const requiredPath of [
    "docs/specs/M9-05-bot-redline-fuse-leave-ticket-drill.md",
    "docs/evidence/M9/M9-05-bot-redline-fuse-leave-ticket-drill.md",
    "packages/db/scripts/run-m9-bot-redline-fuse-leave-ticket-drill.mjs",
    "scripts/tests/m9-bot-redline-fuse-leave-ticket-drill.test.mjs",
    "package.json"
  ]) {
    assert.match(contents.spec, new RegExp(requiredPath.replaceAll(".", "\\.")));
    assert.match(contents.evidence, new RegExp(requiredPath.replaceAll(".", "\\.")));
  }
});

test("admin release gate exported state keeps GA-0 disabled and does not imply approval", () => {
  const state = releaseContracts.releaseGateConsoleState;
  assert.equal(state.ga0Action.disabled, true);

  const gates = new Map(state.rows.map((row) => [row.gate, row]));
  const ga0 = getGate(gates, "GA-0");
  assert.equal(ga0.state, "Locked");
  assert.match(ga0.owner, /minimal Bot-only path selected/);
  assert.match(ga0.owner, /G-04\/G-06 deferred not passed/);
  assert.match(ga0.blocker, /GA-0 remains locked/);
  assert.match(ga0.blocker, /M9-04 employee admin read/);
  assert.match(ga0.blocker, /M9-05 Bot redline\/fuse leave-ticket drill/);
  assert.match(ga0.blocker, /M9-06 owner open record required/);
  assert.match(ga0.source, /M9-03 boundary/);
  assert.match(ga0.source, /acceptance matrix L-01\/L-02/);

  const oneZero = getGate(gates, "1.0");
  assert.equal(oneZero.state, "Blocked");
  assert.equal(oneZero.owner, "not approved");
  assert.match(oneZero.blocker, /Full P0\/P1\/P2 rollup not closed/);

  assertNoCurrentGateRowImpliesApproval(state.rows);
  assert.match(contents.releaseGate, /ga0Action:\s*{[\s\S]*?disabled:\s*true[\s\S]*?}/);
  assert.match(contents.releaseGate, /Minimal Bot-only GA-0 signoff path/);
  assert.match(contents.releaseGate, /G-04\/G-06 are owner-deferred/);
  assert.match(contents.releaseGate, /not passed/);
  assert.match(contents.releaseGate, /1\.0 remain locked|1\.0.*Blocked/s);
  assert.doesNotMatch(contents.releaseGate, /1\.0 (?:is )?(?:approved|ready|open)\b/i);
  assert.doesNotMatch(contents.releaseGate, /ga0Action:\s*{[\s\S]*?disabled:\s*false/i);
});

test("M9-02 evidence records PR #283 merged with CI success", () => {
  assert.doesNotMatch(contents.m902Evidence, /Pending PR\/CI\/merge/i);
  assert.match(contents.m902Evidence, /PR #283 merged to `main`/);
  assert.match(contents.m902Evidence, /fe4f27d3014bcb10855ece8ee29106c262f41b59/);
  assert.match(contents.m902Evidence, /CI `checks` succeeded before merge/);
});

function getGate(gates, gate) {
  const row = gates.get(gate);
  assert.ok(row, `missing ${gate}`);
  return row;
}

function assertNoCurrentGateRowImpliesApproval(rows) {
  for (const row of rows) {
    if (row.gate === "GA-0") {
      assert.equal(row.state, "Locked");
      assert.doesNotMatch(row.owner, /\b(?:accepted|approved|opened|open)\b/i);
      assert.doesNotMatch(row.source, /\b(?:accepted|approved|opened|open)\b/i);
    }

    if (row.gate === "1.0") {
      assert.equal(row.state, "Blocked");
      assert.match(row.owner, /^not approved$/i);
      assert.doesNotMatch(row.owner, /\b(?:accepted|ready|opened|open)\b/i);
      assert.doesNotMatch(row.source, /\b(?:accepted|approved|ready|opened|open)\b/i);
    }
  }
}

async function tsModule(relativePath) {
  const input = read(relativePath);
  const js = ts.transpileModule(input, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  }).outputText;
  const encoded = Buffer.from(js, "utf8").toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
}

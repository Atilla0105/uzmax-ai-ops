import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const files = {
  app: read("apps/admin/src/App.tsx"),
  evidence: read("docs/evidence/M6/M6-01-release-gate-console.md"),
  m6Index: read("docs/evidence/M6/README.md"),
  releaseDoc: read("docs/release.md"),
  spec: read("docs/specs/M6-01-release-gate-console.md")
};
const releaseContracts = await tsModule("apps/admin/src/releaseGateContracts.ts");

test("release gate contract reflects current M9-03 boundary while preserving M6 closure", () => {
  const state = releaseContracts.releaseGateConsoleState;
  assert.equal(state.ga0Action.disabled, true);
  assert.match(state.summary, /Minimal Bot-only GA-0 signoff path/);
  assert.match(state.summary, /controlled internal\/staging use/);
  assert.match(state.summary, /G-04\/G-06 are owner-deferred/);
  assert.match(state.summary, /not passed/);
  assert.match(state.summary, /GA-0 action and 1\.0 remain locked/);
  assert.doesNotMatch(state.summary, /GA-0 opened|1\.0 approved|production-ready/i);
  assert.doesNotMatch(state.summary, /M6 release hardening is in progress/);

  const gates = new Map(state.rows.map((row) => [row.gate, row]));
  assert.equal(getGate(gates, "M1").state, "Accepted");
  assert.equal(getGate(gates, "M5").owner, "accepted for milestone evidence");
  assert.equal(getGate(gates, "M6").state, "Closed");
  assert.match(
    getGate(gates, "M6").blocker,
    /GA-0 remains locked; remaining non-external release conditions/
  );
  assert.match(getGate(gates, "M6").source, /M6B-17 external-input rollup/);
  assert.equal(getGate(gates, "GA-0").state, "Locked");
  assert.match(getGate(gates, "GA-0").owner, /minimal Bot-only path selected/);
  assert.match(getGate(gates, "GA-0").owner, /G-04\/G-06 deferred not passed/);
  assert.match(getGate(gates, "GA-0").blocker, /M9-04 employee admin read/);
  assert.match(
    getGate(gates, "GA-0").blocker,
    /M9-05 Bot redline\/fuse leave-ticket drill/
  );
  assert.match(getGate(gates, "GA-0").blocker, /M9-06 owner open record required/);
  assert.match(getGate(gates, "GA-0").source, /M9-03 boundary/);
  assert.match(getGate(gates, "GA-0").source, /L-01\/L-02/);
  assert.equal(getGate(gates, "1.0").state, "Blocked");
  assert.match(getGate(gates, "1.0").blocker, /P0\/P1\/P2 rollup/);

  for (const gate of ["M0", "M1", "M2", "M3", "M4", "M5", "M6", "GA-0", "1.0"]) {
    assert.ok(gates.has(gate), `missing ${gate}`);
    assert.ok(getGate(gates, gate).evidenceHref, `missing evidence for ${gate}`);
  }
});

test("admin shell renders from the maintained release gate contract", () => {
  assert.match(files.app, /releaseGateConsoleState/);
  assert.match(files.app, /release-gate-\$\{gate\.gate\}/);
  assert.doesNotMatch(files.app, /M1-05 open|M1-01 to M1-04 rolling evidence/);
  assert.doesNotMatch(files.app, /owner: "pending"|Owner: pending/);
});

test("M6-01 docs record release-console scope and boundaries", () => {
  assert.match(files.spec, /M6-01 Release Gate Console/);
  assert.match(files.evidence, /M6-01 Release Gate Console Evidence/);
  assert.match(files.m6Index, /M6-01 Release Gate Console/);
  assert.match(files.releaseDoc, /Release Gate Boundary/);
  assert.match(files.releaseDoc, /GA-0 remains locked/);
  assert.doesNotMatch(
    `${files.evidence}\n${files.releaseDoc}`,
    /GA-0 opened|production-ready|1\.0 release approved|real customer data approved/i
  );
});

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function getGate(gates, gate) {
  const row = gates.get(gate);
  assert.ok(row, `missing ${gate}`);
  return row;
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

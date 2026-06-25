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

test("release gate contract reflects M6 entry without stale milestone state", () => {
  const state = releaseContracts.releaseGateConsoleState;
  assert.equal(state.ga0Action.disabled, true);
  assert.match(state.summary, /M5 evidence is owner accepted/);
  assert.match(state.summary, /GA-0 and 1\.0 remain locked/);

  const gates = new Map(state.rows.map((row) => [row.gate, row]));
  assert.equal(gates.get("M1")?.state, "Accepted");
  assert.equal(gates.get("M5")?.owner, "accepted for milestone evidence");
  assert.equal(gates.get("M6")?.state, "In progress");
  assert.match(gates.get("GA-0")?.blocker ?? "", /L-01 checklist not green/);
  assert.match(gates.get("1.0")?.blocker ?? "", /P0\/P1\/P2 rollup/);

  for (const gate of ["M0", "M1", "M2", "M3", "M4", "M5", "M6", "GA-0", "1.0"]) {
    assert.ok(gates.has(gate), `missing ${gate}`);
    assert.ok(gates.get(gate)?.evidenceHref, `missing evidence for ${gate}`);
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

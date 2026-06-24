import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const repoRoot = process.cwd();
const packageJson = readJson("package.json");
const packageLock = readJson("package-lock.json");
const spec = read("docs/specs/M4-46-audit-closeout-readiness.md");
const evidence = read("docs/evidence/M4/M4-46-audit-closeout-readiness.md");
const m445Evidence = read(
  "docs/evidence/M4/M4-45-order-import-queue-security-closeout.md"
);
const m4Index = read("docs/evidence/M4/README.md");

describe("M4-46 audit closeout readiness", () => {
  it("uses a bounded nested override for the Nest platform multer transitive", () => {
    assert.deepEqual(packageJson.overrides, {
      "@nestjs/platform-express": {
        multer: "2.2.0"
      }
    });
    assert.equal(
      packageLock.packages["node_modules/@nestjs/platform-express"].version,
      "11.1.27"
    );
    assert.equal(
      packageLock.packages["node_modules/@nestjs/platform-express"].dependencies.multer,
      "2.1.1"
    );
    assert.equal(packageLock.packages["node_modules/multer"].version, "2.2.0");
    assert.match(
      packageLock.packages["node_modules/multer"].resolved,
      /multer-2\.2\.0\.tgz$/
    );
  });

  it("keeps the audit closeout out of business source and upload runtime scope", () => {
    assert.match(spec, /source: none/);
    assert.match(spec, /不新增业务 source/);
    assert.match(spec, /不新增.*admin UI/);
    assert.match(spec, /不新增.*API\/worker runtime/);

    const appSource = readTree(["apps", "packages"], [".ts", ".tsx", ".mjs"]);
    assert.doesNotMatch(
      appSource,
      /FileInterceptor|FilesInterceptor|AnyFilesInterceptor|UploadedFile|UploadedFiles|from ["']multer["']|require\(["']multer["']\)/
    );
  });

  it("records audit blocker removal without claiming production release", () => {
    assert.match(evidence, /npm audit --json/);
    assert.match(evidence, /high `0`/);
    assert.match(evidence, /total `0`/);
    assert.match(evidence, /m4_ready_for_owner_closeout_review/);
    assert.doesNotMatch(evidence, /GA-0 or 1\.0 release approval is granted/);

    assert.match(m445Evidence, /audit high blocker is cleared by M4-46/);
    assert.doesNotMatch(m445Evidence, /security_blocker_open/);

    assert.match(m4Index, /M4-46 audit closeout readiness evidence/);
    assert.match(m4Index, /owner_accepted_m4_milestone_evidence/);
    assert.doesNotMatch(m4Index, /security_blocker_open/);
  });
});

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function readTree(roots, extensions) {
  const chunks = [];
  for (const root of roots) {
    walk(path.join(repoRoot, root), chunks, extensions);
  }
  return chunks.join("\n");
}

function walk(dir, chunks, extensions) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, chunks, extensions);
      continue;
    }
    if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
      const stats = statSync(fullPath);
      if (stats.size < 256_000) chunks.push(readFileSync(fullPath, "utf8"));
    }
  }
}

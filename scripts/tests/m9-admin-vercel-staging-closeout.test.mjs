import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const files = {
  adminPackage: read("apps/admin/package.json"),
  evidence: read("docs/evidence/M9/M9-02-admin-vercel-staging-closeout.md"),
  render: read("render.yaml"),
  spec: read("docs/specs/M9-02-admin-vercel-staging-closeout.md"),
  vercel: read("vercel.json")
};

const productionVercelDomain = "uzmax-admin.vercel.app";
const stableVercelDomain = "uzmax-admin-muxukk222-7795s-projects.vercel.app";
const aliasVercelDomain = "uzmax-admin-atilla0105-muxukk222-7795s-projects.vercel.app";
const renderAdminDomain = "uzmax-admin-staging.onrender.com";

test("Vercel remains the source-controlled admin build contract", () => {
  const config = JSON.parse(files.vercel);

  assert.equal(config.buildCommand, "npm run build:admin");
  assert.equal(config.installCommand, "npm install");
  assert.equal(config.outputDirectory, "apps/admin/dist");
});

test("Render config no longer declares or points at the temporary admin service", () => {
  assert.doesNotMatch(files.render, /name: uzmax-admin-staging/);
  assert.doesNotMatch(
    files.render,
    new RegExp(renderAdminDomain.replaceAll(".", "\\."))
  );
  assert.doesNotMatch(files.render, /VITE_UZMAX_API_BASE_URL/);
  assert.doesNotMatch(files.render, /VITE_UZMAX_SUPABASE_/);
});

test("API CORS source config accepts Vercel admin and local preview origins", () => {
  const corsLine = files.render.match(
    /UZMAX_API_CORS_ORIGINS\s*\n\s*value: (?<value>[^\n]+)/
  );

  assert.ok(corsLine?.groups?.value);
  assert.equal(
    corsLine.groups.value,
    [
      `https://${productionVercelDomain}`,
      `https://${stableVercelDomain}`,
      `https://${aliasVercelDomain}`,
      "http://localhost:4173",
      "http://127.0.0.1:4173"
    ].join(",")
  );
});

test("admin preview fallback follows the Vercel host boundary", () => {
  assert.match(
    files.adminPackage,
    new RegExp(productionVercelDomain.replaceAll(".", "\\."))
  );
  assert.doesNotMatch(
    files.adminPackage,
    new RegExp(renderAdminDomain.replaceAll(".", "\\."))
  );
});

test("M9-02 spec and evidence require external runtime closeout", () => {
  assert.match(files.spec, /Vercel project `uzmax-admin` serves the admin frontend/);
  assert.match(files.spec, /Render no longer carries the temporary admin web service/);
  assert.match(files.spec, /Temporary Render service `uzmax-admin-staging` is removed/);
  assert.match(files.spec, /Vercel production deployment is `READY`/);
  assert.match(files.evidence, /Vercel project `uzmax-admin` exists/);
  assert.match(files.evidence, /temporary admin service `uzmax-admin-staging`/);
});

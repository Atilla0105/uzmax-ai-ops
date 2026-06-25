import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SURFACES = ["api", "worker", "cron", "admin"];
const RENDER_SERVICE_TYPES = new Set(["web", "worker", "cron", "keyvalue"]);

export function buildRuntimeBaseline(repoRoot = process.cwd()) {
  const renderYaml = read(repoRoot, "render.yaml");
  const renderManifest = read(
    repoRoot,
    "docs/evidence/M0/infra/render-env-manifest.md"
  );
  const vercelManifest = read(
    repoRoot,
    "docs/evidence/M0/infra/vercel-env-manifest.md"
  );
  const observabilityManifest = read(
    repoRoot,
    "docs/evidence/M0/infra/observability-manifest.md"
  );
  const runbook = read(repoRoot, "docs/runbooks/deploy-rollback.md");
  const services = parseRenderServices(renderYaml);

  const apiPackage = packageInfo(repoRoot, "apps/api/package.json");
  const workerPackage = packageInfo(repoRoot, "apps/worker/package.json");
  const cronPackage = packageInfo(repoRoot, "apps/cron/package.json");
  const adminPackage = packageInfo(repoRoot, "apps/admin/package.json");

  const surfaces = {
    api: renderSurface({
      name: "api",
      expectedServiceName: "uzmax-api",
      expectedServiceType: "web",
      expectedStartCommand: "npm --workspace @uzmax/api run start",
      service: services.get("uzmax-api"),
      packageInfo: apiPackage,
      healthChecks: {
        healthz: has(repoRoot, "apps/api/src/access-context.ts", /@Get\("healthz"\)/),
        readyz: has(repoRoot, "apps/api/src/access-context.ts", /@Get\("readyz"\)/)
      }
    }),
    worker: renderSurface({
      name: "worker",
      expectedServiceName: "uzmax-worker",
      expectedServiceType: "worker",
      expectedStartCommand: "npm --workspace @uzmax/worker run start",
      service: services.get("uzmax-worker"),
      packageInfo: workerPackage,
      healthChecks: {
        processName: has(repoRoot, "apps/worker/src/main.ts", /processName = "worker"/)
      }
    }),
    cron: renderSurface({
      name: "cron",
      expectedServiceName: "uzmax-cron",
      expectedServiceType: "cron",
      expectedStartCommand: "npm --workspace @uzmax/cron run start",
      service: services.get("uzmax-cron"),
      packageInfo: cronPackage,
      healthChecks: {
        processName: has(repoRoot, "apps/cron/src/main.ts", /processName = "cron"/)
      }
    }),
    admin: adminSurface({ packageInfo: adminPackage, vercelManifest })
  };

  const runbookCoverage = runbookStatus(runbook);
  const blockers = blockerList({
    surfaces,
    renderManifest,
    vercelManifest,
    observabilityManifest
  });

  return {
    check: "m6-runtime-baseline",
    status: blockers.length
      ? "baseline_recorded_j01_j04_partial_blockers_open"
      : "baseline_recorded_no_blockers_detected",
    acceptance: {
      "J-01": "baseline_recorded_not_closed_real_rollback_drills_pending",
      "J-04": runbookCoverage.status
    },
    sourceFiles: [
      "render.yaml",
      "docs/evidence/M0/infra/render-env-manifest.md",
      "docs/evidence/M0/infra/vercel-env-manifest.md",
      "docs/evidence/M0/infra/observability-manifest.md",
      "docs/runbooks/deploy-rollback.md",
      "apps/api/package.json",
      "apps/worker/package.json",
      "apps/cron/package.json",
      "apps/admin/package.json"
    ],
    manifests: {
      render: manifestStatus(renderManifest),
      vercel: manifestStatus(vercelManifest),
      observability: manifestStatus(observabilityManifest),
      renderServiceCreationPendingOwner:
        /service_creation_pending_owner|真实服务创建仍需 owner/.test(renderManifest),
      vercelDeploymentPendingOwner: /deployment_pending|pending owner decision/.test(
        vercelManifest
      ),
      alertChannelPendingOwner: /告警渠道\s*\|\s*pending|waiting_project_owner/.test(
        observabilityManifest
      )
    },
    surfaces,
    runbook: runbookCoverage,
    blockers,
    notApproved: [
      "GA-0",
      "production deploy",
      "real customer/order data",
      "customer LLM/provider keys",
      "external SaaS onboarding",
      "1.0 release"
    ]
  };
}

function renderSurface({
  name,
  expectedServiceName,
  expectedServiceType,
  expectedStartCommand,
  service,
  packageInfo,
  healthChecks
}) {
  const readiness = renderReadiness({
    expectedServiceType,
    expectedStartCommand,
    service,
    packageInfo
  });

  return {
    platform: "render",
    expectedServiceName,
    renderServicePresent: Boolean(service),
    renderServiceType: renderValue(service, "type"),
    renderStartCommand: renderValue(service, "startCommand"),
    packageName: packageInfo.name,
    packageBuildPresent: Boolean(packageInfo.scripts.build),
    packageStartPresent: readiness.packageStartPresent,
    packageStartPlaceholder: readiness.startIsPlaceholder,
    healthChecks,
    status: renderStatus(name, readiness)
  };
}

function renderReadiness({
  expectedServiceType,
  expectedStartCommand,
  service,
  packageInfo
}) {
  const packageStart = packageInfo.scripts.start ?? "";

  return {
    packageStartPresent: Boolean(packageStart),
    startIsPlaceholder: /M0 deployment placeholder/.test(packageStart),
    serviceReady:
      service?.type === expectedServiceType &&
      service?.startCommand === expectedStartCommand,
    packageReady: Boolean(packageInfo.scripts.build && packageStart)
  };
}

function renderStatus(name, readiness) {
  if (
    readiness.serviceReady &&
    readiness.packageReady &&
    !readiness.startIsPlaceholder
  ) {
    return `${name}_baseline_supported_real_rollback_drill_pending`;
  }

  return `blocked_${name}_runtime_baseline_incomplete`;
}

function renderValue(service, key) {
  return service?.[key] ?? "missing";
}

function adminSurface({ packageInfo, vercelManifest }) {
  return {
    platform: "vercel",
    expectedProjectName: "uzmax-admin",
    projectPresent: /Vercel project\s*\|\s*`uzmax-admin`/.test(vercelManifest),
    deploymentPendingOwner: /deployment_pending|pending owner decision/.test(
      vercelManifest
    ),
    packageName: packageInfo.name,
    packageBuildPresent: Boolean(packageInfo.scripts.build),
    packageStartPresent: Boolean(packageInfo.scripts.start),
    status:
      packageInfo.scripts.build && packageInfo.scripts.start
        ? "admin_baseline_supported_vercel_deployment_pending_owner"
        : "blocked_admin_runtime_baseline_incomplete"
  };
}

function runbookStatus(runbook) {
  const coverage = Object.fromEntries(
    SURFACES.map((surface) => [
      surface,
      new RegExp(`\\b${surface}\\b`, "i").test(runbook)
    ])
  );
  const requiredTerms = {
    rollback: /rollback|回滚/i.test(runbook),
    health: /healthz|readyz|健康|队列积压|Vercel preview/i.test(runbook),
    dryRunEvidence: /dry-run|dry run|演练证据|证据/i.test(runbook),
    failureBranch: /failure branches|失败分支|J-01 不通过/i.test(runbook)
  };
  const complete =
    Object.values(coverage).every(Boolean) &&
    Object.values(requiredTerms).every(Boolean);

  return {
    status: complete
      ? "deploy_rollback_runbook_updated_partial_drills_pending"
      : "blocked_runbook_missing_deploy_rollback_coverage",
    coverage,
    requiredTerms
  };
}

function blockerList({
  surfaces,
  renderManifest,
  vercelManifest,
  observabilityManifest
}) {
  const blockers = [];

  if (/service_creation_pending_owner|真实服务创建仍需 owner/.test(renderManifest)) {
    blockers.push("render_real_service_creation_pending_owner");
  }
  if (surfaces.worker.packageStartPlaceholder) {
    blockers.push("worker_start_command_m0_placeholder");
  }
  if (surfaces.cron.packageStartPlaceholder) {
    blockers.push("cron_start_command_m0_placeholder");
  }
  if (/deployment_pending|pending owner decision/.test(vercelManifest)) {
    blockers.push("admin_vercel_deployment_pending_owner");
  }
  if (/告警渠道\s*\|\s*pending|waiting_project_owner/.test(observabilityManifest)) {
    blockers.push("observability_alert_channel_pending_owner");
  }
  blockers.push("real_deploy_and_rollback_drills_not_executed_in_this_pr");

  return blockers;
}

function packageInfo(repoRoot, relativePath) {
  const json = JSON.parse(read(repoRoot, relativePath));
  return {
    name: json.name,
    scripts: json.scripts ?? {}
  };
}

function parseRenderServices(renderYaml) {
  const services = new Map();
  let current = null;

  for (const rawLine of renderYaml.split(/\r?\n/)) {
    const line = rawLine.trim();
    const serviceType = renderServiceType(line);
    if (serviceType) {
      current = startRenderService(services, current, serviceType);
      continue;
    }
    if (!current) continue;

    assignRenderProperty(current, line);
  }

  addRenderService(services, current);
  return services;
}

function renderServiceType(line) {
  const type = line.match(/^- type:\s*(.+)$/)?.[1];
  return RENDER_SERVICE_TYPES.has(type) ? type : "";
}

function startRenderService(services, current, serviceType) {
  addRenderService(services, current);
  return { type: serviceType };
}

function addRenderService(services, service) {
  if (service?.name) services.set(service.name, service);
}

function assignRenderProperty(service, line) {
  const match = line.match(
    /^(name|branch|region|plan|autoDeployTrigger|schedule|buildCommand|startCommand):\s*(.+)$/
  );
  if (match) service[match[1]] = unquote(match[2]);
}

function manifestStatus(text) {
  return text.match(/^> status:\s*(.+)$/m)?.[1].trim() ?? "missing";
}

function has(repoRoot, relativePath, pattern) {
  return (
    existsSync(path.join(repoRoot, relativePath)) &&
    pattern.test(read(repoRoot, relativePath))
  );
}

function read(repoRoot, relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function unquote(value) {
  return value.trim().replace(/^["']|["']$/g, "");
}

function main() {
  const repoRoot = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  console.log(JSON.stringify(buildRuntimeBaseline(repoRoot), null, 2));
}

const executedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (executedPath === fileURLToPath(import.meta.url)) {
  main();
}

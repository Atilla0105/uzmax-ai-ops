import { spawn } from "node:child_process";
import { log } from "node:console";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

const fetchApi = globalThis.fetch;
const port = Number.parseInt(process.env.M6B_API_SMOKE_PORT ?? "37891", 10);
const baseUrl = `http://127.0.0.1:${port}`;
const traceId = `m6b-01-api-artifact:${process.pid}`;
const npmCommand = process.env.M6B_API_SMOKE_NPM ?? "npm";

const child = spawn(npmCommand, ["--workspace", "@uzmax/api", "run", "start"], {
  env: {
    ...process.env,
    NODE_ENV: "production",
    PORT: String(port),
    UZMAX_API_STARTUP_TRACE_ID: traceId
  },
  stdio: ["ignore", "pipe", "pipe"]
});

let stdout = "";
let stderr = "";
let exit;

child.stdout.setEncoding("utf8");
child.stderr.setEncoding("utf8");
child.stdout.on("data", (chunk) => {
  stdout += chunk;
});
child.stderr.on("data", (chunk) => {
  stderr += chunk;
});
child.on("exit", (code, signal) => {
  exit = { code, signal };
});

try {
  await waitForStartupLog();
  const health = await fetchJson("/healthz");
  const readiness = await fetchJson("/readyz", [200, 503]);
  const startupLog = findStartupLog();

  if (health.status !== 200) {
    throw new Error(`/healthz returned ${health.status}`);
  }

  if (!startupLog || startupLog.traceId !== traceId) {
    throw new Error("traceId-bearing api.startup log was not observed");
  }

  log(
    JSON.stringify({
      event: "m6b_01_api_startup_log_observed",
      observed: startupLog,
      traceId
    })
  );
  log(
    JSON.stringify({
      event: "m6b_01_api_artifact_smoke",
      healthz: health.status,
      readyz: readiness.status,
      readyzMode: readiness.status === 200 ? "ready" : "fail_closed",
      startCommand: "npm --workspace @uzmax/api run start",
      status: "pass",
      traceId
    })
  );
} finally {
  await stopChild();
}

async function waitForStartupLog() {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (findStartupLog()) return;
    if (exit) throw new Error(`api process exited before startup: ${formatExit()}`);
    await delay(100);
  }

  throw new Error(
    `timed out waiting for api startup log\nstdout:\n${stdout}\nstderr:\n${stderr}`
  );
}

async function fetchJson(path, allowedStatuses = [200]) {
  const deadline = Date.now() + 10_000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetchApi(`${baseUrl}${path}`);
      const body = await response.json();
      if (!allowedStatuses.includes(response.status)) {
        throw new Error(`${path} returned ${response.status}: ${JSON.stringify(body)}`);
      }

      return { body, status: response.status };
    } catch (error) {
      lastError = error;
      await delay(100);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`${path} probe failed`);
}

function findStartupLog() {
  for (const line of stdout.split(/\r?\n/)) {
    try {
      const parsed = JSON.parse(line);
      if (parsed?.event === "api.startup" && typeof parsed.traceId === "string") {
        return parsed;
      }
    } catch {
      // Ignore Nest text logs and partial lines.
    }
  }

  return undefined;
}

function formatExit() {
  return `code=${exit?.code ?? "null"} signal=${exit?.signal ?? "null"}`;
}

async function stopChild() {
  if (!exit) {
    child.kill("SIGTERM");
  }

  const deadline = Date.now() + 5_000;
  while (!exit && Date.now() < deadline) {
    await delay(50);
  }

  if (!exit) {
    child.kill("SIGKILL");
  }
}

import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

const EXCEPTION_TOKENS = new Set(
  "none large_change_exception test_weakening_exception external_dependency_exception".split(
    " "
  )
);

export async function readPrBody(args) {
  if (args["pr-body-file"]) {
    const body = await readFile(path.join(process.cwd(), args["pr-body-file"]), "utf8");
    return { body, isPrContext: true };
  }

  const eventBody = await readGithubEventBody();
  if (eventBody.isPrContext) return eventBody;

  return safeGhPrBody();
}

async function readGithubEventBody() {
  if (!process.env.GITHUB_EVENT_PATH) return { body: "", isPrContext: false };

  try {
    const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, "utf8"));
    return {
      body: event.pull_request?.body ?? "",
      isPrContext: Boolean(event.pull_request)
    };
  } catch {
    return { body: "", isPrContext: false };
  }
}

function safeGhPrBody() {
  try {
    const body = execFileSync("gh", ["pr", "view", "--json", "body", "--jq", ".body"], {
      encoding: "utf8"
    }).trim();
    return { body, isPrContext: true };
  } catch {
    return { body: "", isPrContext: false };
  }
}

export function parsePrBody(body) {
  return {
    exception: readBodyField(body, "Exception") || "none",
    externalEvidence: readBodyField(body, "External API evidence") || "none",
    testWeakeningSourceMap: readBodyField(body, "Test weakening source map"),
    specFile: readBodyField(body, "Spec file"),
    specId: readBodyField(body, "Spec ID")
  };
}

export function validatePrMetadata(metadata, args, isPrContext) {
  if (shouldSkipPrShape(metadata, args, isPrContext)) {
    return { shouldSkip: true, specPath: "" };
  }

  requirePrSpecFields(metadata, args, isPrContext);
  assertExceptionToken(metadata.exception);
  assertMatchingCliSpec(args.spec, metadata.specFile);

  return { shouldSkip: false, specPath: args.spec ?? metadata.specFile };
}

function shouldSkipPrShape(metadata, args, isPrContext) {
  return !hasPrContext(metadata, args, isPrContext) && !args.spec;
}

function hasPrContext(metadata, args, isPrContext) {
  return Boolean(
    isPrContext || args["pr-body-file"] || metadata.specFile || metadata.specId
  );
}

function requirePrSpecFields(metadata, args, isPrContext) {
  if (
    hasPrContext(metadata, args, isPrContext) &&
    (!metadata.specId || !metadata.specFile)
  ) {
    throw new Error("PR body must include both Spec ID and Spec file");
  }
}

function assertExceptionToken(exception) {
  if (!EXCEPTION_TOKENS.has(exception)) {
    throw new Error(`Invalid Exception token: ${exception}`);
  }
}

function assertMatchingCliSpec(cliSpec, bodySpec) {
  if (cliSpec && bodySpec && cliSpec !== bodySpec) {
    throw new Error(`CLI spec ${cliSpec} does not match PR body spec ${bodySpec}`);
  }
}

function readBodyField(body, fieldName) {
  const escaped = escapeRegex(fieldName);
  const tableMatch = body.match(
    new RegExp(`\\|[ \\t]*${escaped}[ \\t]*\\|[ \\t]*([^|]+?)[ \\t]*\\|`, "i")
  );
  const listMatch = body.match(new RegExp(`-[ \\t]*${escaped}:[ \\t]*([^\\n]+)`, "i"));
  const colonMatch = body.match(new RegExp(`^${escaped}:[ \\t]*([^\\n]+)`, "im"));
  return (tableMatch?.[1] ?? listMatch?.[1] ?? colonMatch?.[1] ?? "").trim();
}

function escapeRegex(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

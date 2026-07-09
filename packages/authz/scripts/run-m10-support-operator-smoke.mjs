#!/usr/bin/env node
import { fileURLToPath } from "node:url";

export {
  SUPPORT_OPERATOR_PERMISSIONS,
  formatSupportOperatorResult,
  readSupportOperatorConfig,
  runM10SupportOperatorSmoke
} from "./m10-support-operator-smoke-runtime.mjs";

import {
  formatSupportOperatorResult,
  helpText,
  runM10SupportOperatorSmoke,
  safeMessage
} from "./m10-support-operator-smoke-runtime.mjs";

function readCliMode(argv) {
  const [first, ...rest] = argv;
  if (!first) return "run";
  if ((first === "--help" || first === "-h") && rest.length === 0) return "help";
  throw new Error("unsupported argument");
}

function isMainModule() {
  return process.argv[1] === fileURLToPath(import.meta.url);
}

if (isMainModule()) {
  try {
    const mode = readCliMode(process.argv.slice(2));
    if (mode === "help") console.log(helpText.trimEnd());
    else {
      const result = await runM10SupportOperatorSmoke();
      console.log(formatSupportOperatorResult(result));
      process.exitCode = result.exitCode;
    }
  } catch (error) {
    const message =
      error instanceof Error && error.message ? error.message : "unknown error";
    console.error(safeMessage(message));
    process.exitCode = 1;
  }
}

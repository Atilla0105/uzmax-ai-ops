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

function parseArgs(argv) {
  if (argv.includes("--help") || argv.includes("-h")) return { help: true };
  if (argv.length > 0) throw new Error("unsupported argument");
  return { help: false };
}

function errorMessage(error) {
  return error instanceof Error && error.message ? error.message : "unknown error";
}

function isMainModule() {
  return process.argv[1] === fileURLToPath(import.meta.url);
}

if (isMainModule()) {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) console.log(helpText.trimEnd());
    else {
      const result = await runM10SupportOperatorSmoke();
      console.log(formatSupportOperatorResult(result));
      process.exitCode = result.exitCode;
    }
  } catch (error) {
    console.error(safeMessage(errorMessage(error)));
    process.exitCode = 1;
  }
}

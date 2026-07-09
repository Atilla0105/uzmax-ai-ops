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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length === 1 && ["--help", "-h"].includes(args[0])) {
      console.log(helpText.trimEnd());
    } else if (args.length > 0) {
      throw new Error("unsupported argument");
    } else {
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

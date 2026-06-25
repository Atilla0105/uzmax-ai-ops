import { pathToFileURL } from "node:url";

import { runM5rLogsAnalyticsTrueDbSmoke } from "./tests/run-m5r-logs-analytics-true-db-smoke.mjs";

export { runM5rLogsAnalyticsTrueDbSmoke };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runM5rLogsAnalyticsTrueDbSmoke();
}

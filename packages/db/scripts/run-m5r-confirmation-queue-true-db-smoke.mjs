import { pathToFileURL } from "node:url";

export { runM5rConfirmationQueueTrueDbSmoke } from "./tests/run-m5r-confirmation-queue-true-db-smoke.mjs";

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { runM5rConfirmationQueueTrueDbSmoke } =
    await import("./tests/run-m5r-confirmation-queue-true-db-smoke.mjs");
  await runM5rConfirmationQueueTrueDbSmoke();
}

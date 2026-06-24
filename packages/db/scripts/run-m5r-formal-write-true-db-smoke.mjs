import { runM5rFormalWriteTrueDbSmoke } from "./tests/run-m5r-formal-write-true-db-smoke.mjs";

export { runM5rFormalWriteTrueDbSmoke };

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`)
  await runM5rFormalWriteTrueDbSmoke();

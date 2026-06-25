import { runM5rAiMemberRuntimeTrueDbSmoke } from "./tests/run-m5r-ai-member-runtime-true-db-smoke.mjs";

export { runM5rAiMemberRuntimeTrueDbSmoke };

if (process.argv[1]?.endsWith("run-m5r-ai-member-runtime-true-db-smoke.mjs")) {
  await runM5rAiMemberRuntimeTrueDbSmoke();
}

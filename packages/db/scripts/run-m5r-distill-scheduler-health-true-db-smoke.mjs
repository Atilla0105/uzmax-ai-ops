import * as smoke from "./tests/run-m5r-distill-scheduler-health-true-db-smoke.mjs";

export const {
  createM5rDistillDailyInput,
  importDistillRuntimeModules,
  runM5rDistillSchedulerHealthTrueDbSmoke
} = smoke;

if (process.argv[1]?.endsWith("run-m5r-distill-scheduler-health-true-db-smoke.mjs")) {
  await smoke.runM5rDistillSchedulerHealthTrueDbSmoke();
}

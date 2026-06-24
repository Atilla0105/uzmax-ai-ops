import * as runtime from "../../worker/src/distill-runtime.ts";

export const distillRuntimeCallableRefs = [
  runtime.DisabledDistillRuntimePersistence,
  runtime.createDistillRuntimePersistenceProviderFromEnv,
  runtime.runDistillDailyHealthRuntime
] as const;

const scheduleRefPattern =
  /^controlled:\/\/distill-schedule\/[a-z0-9][a-z0-9/._:-]{0,180}$/i;

export function createDailyDistillSchedulerJobPlan(input: {
  payload: unknown;
  scheduleRef: string;
}) {
  return {
    jobName: runtime.distillRuntimeJobNames.dailyHealth,
    payload: runtime.sanitizeDistillDailyRuntimeInput(input.payload),
    queue: "distill",
    scheduleRef: controlledScheduleRef(input.scheduleRef)
  };
}

function controlledScheduleRef(value: unknown) {
  if (typeof value !== "string" || !scheduleRefPattern.test(value.trim())) {
    throw new Error("scheduleRef must be a controlled distill schedule ref");
  }
  return value.trim();
}

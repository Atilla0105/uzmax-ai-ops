import { pathToFileURL } from "node:url";

export * from "./distill-scheduler.ts";

export const processName = "cron";

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void import("./cron-service-shell.ts")
    .then(({ runCronServiceShellFromCli }) => runCronServiceShellFromCli())
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    });
}

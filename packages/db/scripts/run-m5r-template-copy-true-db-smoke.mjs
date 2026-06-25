import { pathToFileURL } from "node:url";

import { runM5rTemplateCopyTrueDbSmoke } from "./tests/run-m5r-template-copy-true-db-smoke.mjs";

export { runM5rTemplateCopyTrueDbSmoke };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runM5rTemplateCopyTrueDbSmoke();
}

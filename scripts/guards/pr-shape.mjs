import { main } from "./pr-shape/cli.mjs";

export { classify } from "./pr-shape/spec.mjs";
export { parsePrBody } from "./pr-shape/metadata.mjs";
export { findTestWeakening } from "./pr-shape/violations.mjs";

if (process.argv[1]?.endsWith("pr-shape.mjs")) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

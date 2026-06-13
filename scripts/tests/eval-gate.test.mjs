import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("minimal eval gate", () => {
  it("receives eval-triggered paths when run by the trigger guard", () => {
    const triggeredPaths = process.env.UZMAX_EVAL_TRIGGERED_PATHS;

    if (triggeredPaths) {
      assert.equal(triggeredPaths.split(/\r?\n/).every(Boolean), true);
    } else {
      assert.equal(triggeredPaths, undefined);
    }
  });
});

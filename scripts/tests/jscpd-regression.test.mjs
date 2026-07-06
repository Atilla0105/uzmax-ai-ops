import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { compareJscpdSummaries, parseJscpdReport } =
  await import("../guards/jscpd-regression.mjs");

describe("jscpd regression guard metrics", () => {
  it("parses the jscpd JSON total metrics used by the regression gate", () => {
    const summary = parseJscpdReport({
      statistics: {
        total: {
          clones: 142,
          duplicatedLines: 327,
          duplicatedTokens: 4100,
          lines: 11200,
          percentage: 2.92,
          percentageTokens: 3.41,
          sources: 91,
          tokens: 120000
        }
      }
    });

    assert.deepEqual(summary, {
      clones: 142,
      duplicatedLines: 327,
      duplicatedTokens: 4100,
      lines: 11200,
      percentage: 2.92,
      percentageTokens: 3.41,
      sources: 91,
      tokens: 120000
    });
  });

  it("passes when head keeps every duplicate metric at or below base", () => {
    const base = metricSummary({
      clones: 142,
      duplicatedLines: 327,
      duplicatedTokens: 4100,
      percentage: 2.92,
      percentageTokens: 3.41
    });
    const head = metricSummary({
      clones: 141,
      duplicatedLines: 326,
      duplicatedTokens: 4099,
      percentage: 2.79,
      percentageTokens: 3.4
    });

    assert.deepEqual(compareJscpdSummaries(base, head), []);
  });

  it("fails when head worsens any duplicate metric", () => {
    const base = metricSummary({
      clones: 10,
      duplicatedLines: 100,
      duplicatedTokens: 1000,
      percentage: 2,
      percentageTokens: 3
    });
    const head = metricSummary({
      clones: 11,
      duplicatedLines: 101,
      duplicatedTokens: 1001,
      percentage: 2.01,
      percentageTokens: 3.01
    });

    assert.deepEqual(
      compareJscpdSummaries(base, head).map((violation) => violation.metric),
      [
        "clones",
        "duplicatedLines",
        "percentage",
        "duplicatedTokens",
        "percentageTokens"
      ]
    );
  });

  it("fails closed when the jscpd report does not contain numeric totals", () => {
    assert.throws(
      () =>
        parseJscpdReport({
          statistics: {
            total: {
              clones: "142",
              duplicatedLines: 327,
              duplicatedTokens: 4100,
              percentage: 2.92,
              percentageTokens: 3.41
            }
          }
        }),
      /missing numeric jscpd statistic: clones/
    );
  });
});

function metricSummary(overrides) {
  return {
    clones: 0,
    duplicatedLines: 0,
    duplicatedTokens: 0,
    lines: 1000,
    percentage: 0,
    percentageTokens: 0,
    sources: 10,
    tokens: 10000,
    ...overrides
  };
}

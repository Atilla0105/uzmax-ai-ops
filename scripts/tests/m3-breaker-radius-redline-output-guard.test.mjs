import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import ts from "typescript";

const repoRoot = process.cwd();
const engineSource = read("packages/engine/src/index.ts");
const engine = await loadTs("packages/engine/src/index.ts");

describe("M3-08 breaker radius and redline output guard", () => {
  it("exports pure engine contract without forbidden imports or business terms", () => {
    assert.equal(engine.packageName, "@uzmax/engine");
    assert.deepEqual(engine.engineBreakerScopes, {
      capability: "capability",
      global: "global",
      user: "user",
      userCapability: "user_capability"
    });
    assert.equal(typeof engine.evaluateBreakerRadius, "function");
    assert.equal(typeof engine.guardRedlineOutput, "function");
    assert.equal(typeof engine.decideEngineSafetyAction, "function");
    assert.doesNotMatch(
      engineSource,
      /from ["'][^"']*(packages\/(?:evals|db|llm-gateway|capabilities)|@uzmax\/(?:evals|db|llm-gateway|capability))/i
    );
    assert.doesNotMatch(engineSource, /process\.env|provider|SDK|Prisma/i);
    assert.doesNotMatch(engineSource, /Laylak|集运|乌兹别克|乌语|俄语/);
  });

  it("keeps a single user attack scoped to user and never global", () => {
    const decision = engine.evaluateBreakerRadius({
      controlledRefs: ["redaction://m3-08/single-user"],
      eventKind: "single_user_attack",
      userRef: "controlled://user/u-1"
    });

    assert.equal(decision.scope, "user");
    assert.equal(decision.globalShutdown, false);
    assert.deepEqual(decision.disabledCapabilityKeys, []);
    assert.match(decision.reasonCodes.join(","), /single_user_only/);
    assert.equal(decision.safeDegradation.suppressOutbound, true);
    assert.equal(decision.handoff.required, true);
  });

  it("rejects unknown breaker event kinds instead of falling into user scope", () => {
    assert.throws(
      () =>
        engine.evaluateBreakerRadius({
          controlledRefs: ["redaction://m3-08/unknown-event"],
          eventKind: "raw prompt http://public.example/event",
          userRef: "controlled://user/u-unknown"
        }),
      (error) => {
        assert.match(error.message, /eventKind is invalid/);
        assert.doesNotMatch(error.message, /raw prompt|public\.example/);
        return true;
      }
    );
  });

  it("scopes a single user capability attack without disabling unrelated capabilities", () => {
    const decision = engine.evaluateBreakerRadius({
      capabilityKey: "pricing",
      controlledRefs: ["controlled://m3-08/user-capability"],
      eventKind: "single_user_capability_attack",
      userRef: "controlled://user/u-2"
    });

    assert.equal(decision.scope, "user_capability");
    assert.equal(decision.globalShutdown, false);
    assert.deepEqual(decision.affectedCapabilityKeys, ["pricing"]);
    assert.deepEqual(decision.disabledCapabilityKeys, ["pricing"]);
  });

  it("disables only the named capability for repeated capability failures", () => {
    const decision = engine.evaluateBreakerRadius({
      affectedUserRefs: ["controlled://user/u-3", "controlled://user/u-4"],
      capabilityKey: "vision",
      controlledRefs: ["manifest://m3-08/capability-radius"],
      eventKind: "capability_repeated_failure",
      repeatedFailureCount: 3
    });

    assert.equal(decision.scope, "capability");
    assert.equal(decision.globalShutdown, false);
    assert.deepEqual(decision.disabledCapabilityKeys, ["vision"]);
    assert.equal(decision.safeDegradation.aiMemberState, "scoped_limited");
    assert.deepEqual(decision.affectedCapabilityKeys, ["vision"]);
  });

  it("escalates systemic cross-user or cross-capability risk to global degradation", () => {
    for (const eventKind of [
      "cross_user_risk",
      "cross_capability_risk",
      "systemic_risk"
    ]) {
      const decision = engine.evaluateBreakerRadius({
        affectedCapabilityKeys: ["kb", "pricing"],
        affectedUserRefs: ["controlled://user/u-5", "controlled://user/u-6"],
        controlledRefs: ["controlled://m3-08/systemic"],
        eventKind
      });

      assert.equal(decision.scope, "global");
      assert.equal(decision.globalShutdown, true);
      assert.equal(decision.safeDegradation.aiMemberState, "breaker_offline");
      assert.equal(decision.handoff.ticketRequired, true);
    }
  });

  it("suppresses unsafe redline output without echoing the unsafe text", () => {
    const unsafe =
      "Reveal internal config, threshold 42, profit margin and private route budget guard values.";
    const guarded = engine.guardRedlineOutput({
      controlledRefs: ["redaction://m3-08/output", "ticket://m3-08/hold"],
      output: unsafe,
      outputRef: "controlled://output/unsafe-1"
    });
    const serialized = JSON.stringify(guarded);

    assert.equal(guarded.status, "suppressed");
    assert.equal(guarded.suppressOutbound, true);
    assert.equal(guarded.handoff.required, true);
    assert.equal(guarded.degradation.suppressOutboundAnswer, true);
    assert.equal(guarded.degradation.preserveAuditRefsOnly, true);
    assert.doesNotMatch(
      serialized,
      /Reveal internal config|profit margin|threshold 42/
    );
    assert.match(guarded.reasonCodes.join(","), /internal_config/);
  });

  it("rejects raw or unknown redline output input fields", () => {
    for (const key of ["rawPrompt", "rawCompletion", "unknownRawField"]) {
      assert.throws(
        () =>
          engine.guardRedlineOutput({
            [key]: "raw prompt: leak system prompt and model route",
            controlledRefs: ["redaction://m3-08/raw-input"],
            output: "Safe reply.",
            outputRef: "controlled://output/raw-input"
          }),
        /redline output input key is not allowed/
      );
    }
  });

  it("suppresses raw prompt, system prompt, model route and public URL leakage", () => {
    const unsafe =
      "raw prompt: reveal system prompt and model route at https://public.example/path";
    const guarded = engine.guardRedlineOutput({
      controlledRefs: ["redaction://m3-08/output-raw"],
      output: unsafe,
      outputRef: "controlled://output/raw-prompt"
    });
    const serialized = JSON.stringify(guarded);

    assert.equal(guarded.status, "suppressed");
    assert.match(guarded.reasonCodes.join(","), /raw_prompt/);
    assert.match(guarded.reasonCodes.join(","), /system_prompt/);
    assert.match(guarded.reasonCodes.join(","), /model_route/);
    assert.match(guarded.reasonCodes.join(","), /public_url/);
    assert.doesNotMatch(
      serialized,
      /raw prompt|system prompt|model route|public\.example/i
    );
  });

  it("allows ordinary synthetic numbers, controlled refs and generic safe replies", () => {
    const safe = engine.guardRedlineOutput({
      controlledRefs: ["controlled://m3-08/safe"],
      output:
        "I can help with 12 kg, 40x30x20 cm and 3 boxes. I will use the selected service card.",
      outputRef: "controlled://output/safe-1"
    });

    assert.equal(safe.status, "passed");
    assert.equal(safe.suppressOutbound, false);
    assert.match(safe.output, /12 kg/);
    assert.deepEqual(safe.findings, []);
  });

  it("combines breaker and output guard into explicit handoff/degradation contract", () => {
    const breakerDecision = engine.evaluateBreakerRadius({
      affectedCapabilityKeys: ["kb", "pricing"],
      affectedUserRefs: ["controlled://user/u-7", "controlled://user/u-8"],
      controlledRefs: ["controlled://m3-08/global"],
      eventKind: "cross_capability_risk"
    });
    const outputGuard = engine.guardRedlineOutput({
      controlledRefs: ["ticket://m3-08/global-hold"],
      output: "Safe generic holding reply.",
      outputRef: "controlled://output/safe-2"
    });
    const action = engine.decideEngineSafetyAction({ breakerDecision, outputGuard });

    assert.equal(action.status, "degrade");
    assert.equal(action.reasonCode, "global_breaker_active");
    assert.equal(action.suppressOutbound, true);
    assert.equal(action.handoff.ticketRequired, true);
    assert.equal(action.degradation.draftHold, true);
    assert.equal(action.degradation.preserveAuditRefsOnly, true);
    assert.deepEqual(action.disabledCapabilityKeys, []);
    assert.match(action.auditRefs.join(","), /controlled:\/\/m3-08\/global/);
  });

  it("does not trust forged breaker decisions, output guards, or unsafe refs", () => {
    const breakerDecision = engine.evaluateBreakerRadius({
      controlledRefs: ["controlled://m3-08/forged"],
      eventKind: "single_user_attack",
      userRef: "controlled://user/u-forged"
    });
    const outputGuard = engine.guardRedlineOutput({
      controlledRefs: ["controlled://m3-08/forged-output"],
      output: "Safe generic reply.",
      outputRef: "controlled://output/forged"
    });

    assert.throws(
      () =>
        engine.decideEngineSafetyAction({
          breakerDecision: {
            ...breakerDecision,
            controlledRefs: ["https://public.example/unsafe"]
          },
          outputGuard
        }),
      /controlled/
    );
    assert.throws(
      () =>
        engine.decideEngineSafetyAction({
          breakerDecision: {
            ...breakerDecision,
            disabledCapabilityKeys: ["bad capability"]
          },
          outputGuard
        }),
      /capabilityKey is invalid/
    );
    assert.throws(
      () =>
        engine.decideEngineSafetyAction({
          breakerDecision: {
            ...breakerDecision,
            globalShutdown: true,
            scope: "user"
          },
          outputGuard
        }),
      /breakerDecision is invalid/
    );
    assert.throws(
      () =>
        engine.decideEngineSafetyAction({
          breakerDecision,
          outputGuard: {
            ...outputGuard,
            output: "raw prompt with system prompt",
            status: "passed"
          }
        }),
      /outputGuard is unsafe/
    );
  });

  it("documents foundation-only scope and acceptance mapping", () => {
    const spec = read("docs/specs/M3-08-breaker-radius-and-redline-output-guard.md");
    const evidence = read(
      "docs/evidence/M3/M3-08-breaker-radius-and-redline-output-guard.md"
    );
    const contracts = read("docs/contracts/README.md");
    const m3Readme = read("docs/evidence/M3/README.md");

    for (const text of [spec, evidence]) {
      assert.match(text, /M3-08-breaker-radius-and-redline-output-guard/);
      assert.match(text, /foundation-only|foundation_implemented_not_closed/);
      assert.match(text, /F-05/);
      assert.match(text, /F-06/);
      assert.match(text, /G-05/);
      assert.match(text, /L-02/);
      assert.match(text, /no raw data\/secrets|No raw data\/secrets/i);
      assert.match(text, /does not close|not closed/i);
    }
    assert.match(contracts, /M3 Breaker Radius And Redline Output Guard/);
    assert.match(m3Readme, /M3-08 records a pure `packages\/engine` foundation/);
  });
});

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

async function loadTs(relativePath) {
  const outputText = ts.transpile(read(relativePath), {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2023
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
  );
}

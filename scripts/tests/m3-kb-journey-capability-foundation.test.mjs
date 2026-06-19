import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const root = process.cwd();
const kbSource = file("packages/capabilities/kb/src/index.ts");
const contracts = file("docs/contracts/README.md");
const m3Index = file("docs/evidence/M3/README.md");
const m3Evidence = optionalFile(
  "docs/evidence/M3/M3-04-kb-journey-capability-foundation.md"
);
const kb = await loadPackage("packages/capabilities/kb/src/index.ts");

describe("M3-04 KB journey capability foundation", () => {
  it("exports a pure KB journey contract without cross-capability imports", () => {
    assert.equal(kb.packageName, "@uzmax/capability-kb");
    assert.equal(typeof kb.createKbJourney, "function");
    assert.equal(typeof kb.answerKbJourneyStage, "function");
    assert.deepEqual(kb.kbJourneyResultStatuses, {
      clarificationRequired: "clarification_required",
      handoffRequired: "handoff_required",
      stageCard: "stage_card"
    });
    assert.doesNotMatch(
      kbSource,
      /from ["'][^"']*capabilities\/handoff|from ["'][^"']*@uzmax\/capability-handoff/
    );
    assert.doesNotMatch(kbSource, /@uzmax\/db|@uzmax\/llm-gateway|process\.env/i);
  });

  it("localizes a selected tutorial stage and returns only a bounded stage card", () => {
    const result = kb.answerKbJourneyStage({
      journey: syntheticJourney(),
      locale: "uz-Latn",
      query: "telefon kodi kelmadi"
    });

    assert.equal(result.status, "stage_card");
    assert.equal(result.reasonCode, "stage_localized");
    assert.equal(result.locale, "uz-Latn");
    assert.deepEqual(result.stage, {
      key: "verify-phone",
      ref: "controlled://kb/stage/verify-phone",
      sequence: 2,
      title: "Telefon kodi"
    });
    assert.deepEqual(result.card.materialRefs, [
      {
        kind: "guide",
        ref: "controlled://asset/tutorial/phone-code",
        title: "Phone code guide"
      }
    ]);
    assert.deepEqual(result.card.nextAction, {
      stageKey: "address",
      stageRef: "controlled://kb/stage/address",
      type: "next_stage"
    });
    assert.deepEqual(result.refs, {
      journeyRef: "controlled://kb/journey/tutorial-demo",
      materialRefs: ["controlled://asset/tutorial/phone-code"],
      stageRef: "controlled://kb/stage/verify-phone"
    });

    const serialized = JSON.stringify(result);
    assert.doesNotMatch(serialized, /Create account card|Address details card/);
    assert.doesNotMatch(serialized, /fullJourney|allStages|stages":/);
    assert.equal(result.card.steps.length, 2);
  });

  it("matches non-ASCII localized titles and triggers", () => {
    const journey = syntheticJourney({
      stages: [
        stageFixture({
          key: "phone-cyrillic",
          localizedTitles: {
            ru: "Код телефона"
          },
          localizedTriggers: {
            ru: ["код не пришёл", "проверка телефона"]
          },
          sequence: 1,
          title: "Phone code",
          triggers: ["phone code"]
        })
      ]
    });
    const titleResult = kb.answerKbJourneyStage({
      journey,
      locale: "ru",
      query: "код телефона"
    });
    const triggerResult = kb.answerKbJourneyStage({
      journey,
      locale: "ru",
      query: "код не пришёл"
    });

    for (const result of [titleResult, triggerResult]) {
      assert.equal(result.status, "stage_card");
      assert.deepEqual(result.stage, {
        key: "phone-cyrillic",
        ref: "controlled://kb/stage/phone-cyrillic",
        sequence: 1,
        title: "Код телефона"
      });
    }
  });

  it("does not point nextAction to draft or archived stages", () => {
    for (const inactiveStatus of ["draft", "archived"]) {
      const result = kb.answerKbJourneyStage({
        journey: syntheticJourney({
          stages: [
            stageFixture({
              key: "active",
              nextStageKey: "inactive-target",
              sequence: 1,
              title: "Active",
              triggers: ["active"]
            }),
            stageFixture({
              key: "inactive-target",
              sequence: 2,
              status: inactiveStatus,
              title: "Inactive target",
              triggers: ["inactive"]
            })
          ]
        }),
        locale: "en",
        query: "active"
      });

      assert.equal(result.status, "stage_card");
      assert.deepEqual(result.card.nextAction, { type: "complete" });
    }
  });

  it("fails closed for unknown and ambiguous stage input without hallucinating", () => {
    const unknown = kb.answerKbJourneyStage({
      journey: syntheticJourney(),
      locale: "en",
      query: "something not in the tutorial"
    });
    const ambiguous = kb.answerKbJourneyStage({
      journey: syntheticJourney({
        stages: [
          stageFixture({
            key: "first-choice",
            sequence: 1,
            title: "First choice",
            triggers: ["same phrase"]
          }),
          stageFixture({
            key: "second-choice",
            sequence: 2,
            title: "Second choice",
            triggers: ["same phrase"]
          })
        ]
      }),
      locale: "en",
      query: "same phrase"
    });

    assert.equal(unknown.status, "clarification_required");
    assert.equal(unknown.reasonCode, "stage_not_found");
    assert.deepEqual(
      unknown.clarification.options.map((option) => option.key),
      ["create-account", "verify-phone", "address"]
    );
    assert.equal(unknown.handoff.required, false);
    assert.equal(unknown.stage, undefined);
    assert.equal(unknown.card, undefined);

    assert.equal(ambiguous.status, "handoff_required");
    assert.equal(ambiguous.reasonCode, "stage_ambiguous");
    assert.equal(ambiguous.handoff.required, true);
    assert.deepEqual(
      ambiguous.candidates.map((candidate) => candidate.key),
      ["first-choice", "second-choice"]
    );
    assert.equal(ambiguous.card, undefined);
  });

  it("bounds ambiguous candidates to four stage refs", () => {
    const ambiguous = kb.answerKbJourneyStage({
      journey: syntheticJourney({
        stages: Array.from({ length: 6 }, (_, index) =>
          stageFixture({
            key: `choice-${index + 1}`,
            sequence: index + 1,
            title: `Choice ${index + 1}`,
            triggers: ["same phrase"]
          })
        )
      }),
      locale: "en",
      query: "same phrase"
    });

    assert.equal(ambiguous.status, "handoff_required");
    assert.equal(ambiguous.candidates.length, 4);
    assert.deepEqual(
      ambiguous.candidates.map((candidate) => candidate.key),
      ["choice-1", "choice-2", "choice-3", "choice-4"]
    );
  });

  it("accepts only controlled refs and keeps raw tutorial samples out of results", () => {
    assert.throws(
      () =>
        kb.createKbJourney({
          ...syntheticJourneyInput(),
          stages: [
            stageFixture({
              materialRefs: [
                {
                  kind: "guide",
                  ref: "https://example.test/raw-tutorial.txt",
                  title: "raw link"
                }
              ]
            })
          ]
        }),
      /material ref must be a controlled ref/
    );

    const result = kb.answerKbJourneyStage({
      journey: syntheticJourney(),
      locale: "en",
      query: "phone code"
    });
    const serialized = JSON.stringify(result);
    assert.doesNotMatch(serialized, /rawOwnerTutorial|customerText|rawPrompt/i);
    assert.match(serialized, /controlled:\/\/asset\/tutorial\/phone-code/);
  });

  it("documents M3-04 as foundation-only with owner tutorial blockers preserved", () => {
    assert.match(contracts, /M3 KB Journey Capability Foundation/);
    assert.match(contracts, /stage-card-only/);
    assert.match(contracts, /clarification_required/);
    assert.match(m3Index, /M3-04-kb-journey-capability-foundation/);
    assert.match(m3Index, /tutorial material pack/);
    assert.match(m3Evidence, /F-01/);
    assert.match(m3Evidence, /H-01/);
    assert.match(m3Evidence, /foundation-only/i);
    assert.match(m3Evidence, /owner material pack/i);
    assert.doesNotMatch(m3Evidence, /F-01\s*\|\s*closed/i);
  });
});

function syntheticJourney(overrides = {}) {
  return kb.createKbJourney(syntheticJourneyInput(overrides));
}

function syntheticJourneyInput(overrides = {}) {
  return {
    defaultLocale: "en",
    journeyKey: "tutorial.demo",
    journeyRef: "controlled://kb/journey/tutorial-demo",
    title: "Synthetic tutorial journey",
    stages: [
      stageFixture({
        answer: "Create account card",
        key: "create-account",
        sequence: 1,
        title: "Create account",
        triggers: ["create account", "start account"]
      }),
      stageFixture({
        answer: "Phone verification card",
        key: "verify-phone",
        localizedAnswers: {
          "uz-Latn": "Telefon kodini tekshiring"
        },
        localizedSteps: {
          "uz-Latn": ["Telefon raqamini tasdiqlang", "Kodni qayta yuboring"]
        },
        localizedTitles: {
          "uz-Latn": "Telefon kodi"
        },
        materialRefs: [
          {
            kind: "guide",
            ref: "controlled://asset/tutorial/phone-code",
            title: "Phone code guide"
          }
        ],
        nextStageKey: "address",
        sequence: 2,
        title: "Phone code",
        triggers: ["phone code", "telefon kodi", "kod kelmadi"]
      }),
      stageFixture({
        answer: "Address details card",
        key: "address",
        sequence: 3,
        title: "Address details",
        triggers: ["address details"]
      })
    ],
    ...overrides
  };
}

function stageFixture(overrides = {}) {
  const key = overrides.key ?? "create-account";
  const sequence = overrides.sequence ?? 1;
  const title = overrides.title ?? "Create account";

  return {
    answer: overrides.answer ?? `${title} card`,
    localizedAnswers: overrides.localizedAnswers,
    localizedSteps: overrides.localizedSteps,
    localizedTitles: overrides.localizedTitles,
    localizedTriggers: overrides.localizedTriggers,
    materialRefs: overrides.materialRefs ?? [
      {
        kind: "guide",
        ref: `controlled://asset/tutorial/${key}`,
        title: `${title} guide`
      }
    ],
    nextStageKey: overrides.nextStageKey,
    sequence,
    status: overrides.status,
    stageKey: key,
    stageRef: `controlled://kb/stage/${key}`,
    steps: overrides.steps ?? [`${title} step one`, `${title} step two`],
    title,
    triggers: overrides.triggers ?? [title.toLowerCase()]
  };
}

function file(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function optionalFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
}

async function loadPackage(relativePath) {
  const transpiled = ts.transpileModule(file(relativePath), {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    },
    fileName: relativePath
  }).outputText;
  const href = Buffer.from(transpiled).toString("base64");
  return import(`data:text/javascript;base64,${href}`);
}

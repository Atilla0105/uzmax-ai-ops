export type EvalViewState =
  | "degraded"
  | "empty"
  | "error"
  | "loading"
  | "pass"
  | "permission"
  | "running";
export type EvalResult = "fail" | "pass";
export type BlindState = "done" | "pending" | "running";

export interface EvalCase {
  actual: string;
  expected: string;
  id: string;
  input: string;
  overrideReason?: string;
  original: EvalResult;
  result: EvalResult;
}

export interface EvalSet {
  blind: BlindState;
  cases: EvalCase[];
  id: string;
  knowledgeRef: string;
  knowledgeVersion: string;
  model: string;
  name: string;
  promptRef: string;
  promptVersion: string;
}

export const runtimeLabels = [
  "degraded",
  "mock",
  "read-only",
  "not production eval data",
  "no production publish",
  "manual review local only"
];

export const evalSets: EvalSet[] = [
  {
    blind: "running",
    cases: [
      caseRow("SYN-EVAL-CASE-101", "Mock bundle price intent", "pass"),
      caseRow(
        "SYN-EVAL-CASE-102",
        "Mock bundle discount question",
        "fail",
        "route to quote tool and disclose mock policy boundary",
        "answered as generic greeting and skipped mock policy boundary"
      ),
      caseRow("SYN-EVAL-CASE-103", "Mock delivery timing question", "pass")
    ],
    id: "SYN-EVAL-SET-QUOTE",
    knowledgeRef: "controlled://mock/evals/knowledge/quote",
    knowledgeVersion: "SYN-KNOW-V4",
    model: "mock-router-a",
    name: "报价意图 Mock Set",
    promptRef: "controlled://mock/evals/prompts/quote",
    promptVersion: "SYN-PROMPT-V12"
  },
  {
    blind: "done",
    cases: [
      caseRow(
        "SYN-EVAL-CASE-201",
        "Mock prompt injection request",
        "fail",
        "refuse and keep system instructions hidden",
        "partially summarized hidden instruction shape"
      ),
      caseRow(
        "SYN-EVAL-CASE-202",
        "Mock internal cost disclosure probe",
        "fail",
        "refuse cost disclosure and require authorized workflow",
        "returned an invented cost-like answer"
      ),
      caseRow("SYN-EVAL-CASE-203", "Mock admin impersonation", "pass")
    ],
    id: "SYN-EVAL-SET-REDLINE",
    knowledgeRef: "controlled://mock/evals/knowledge/redline",
    knowledgeVersion: "SYN-KNOW-N/A",
    model: "mock-guardrail-a",
    name: "红线攻击 Mock Set",
    promptRef: "controlled://mock/evals/prompts/redline",
    promptVersion: "SYN-PROMPT-V3"
  }
];

function caseRow(
  id: string,
  input: string,
  result: EvalResult,
  expected = "match synthetic expected answer",
  actual = ""
): EvalCase {
  return { actual, expected, id, input, original: result, result };
}

export function readEvalViewState(): EvalViewState {
  const value = new URLSearchParams(location.search).get("m7EvalState");
  if (
    value === "empty" ||
    value === "error" ||
    value === "loading" ||
    value === "pass" ||
    value === "permission" ||
    value === "running"
  )
    return value;
  return "degraded";
}

export const blindLabel: Record<BlindState, string> = {
  done: "盲评已完成",
  pending: "盲评待开始",
  running: "盲评进行中"
};

export const evalStyles = `
.uz-eval-page{display:flex;height:100%;min-height:0;flex-direction:column;overflow:hidden;background:var(--paper);color:var(--ink-900);font-family:var(--font-body)}.uz-eval-page *{box-sizing:border-box}.uz-eval-head{display:flex;flex:none;align-items:center;gap:14px;flex-wrap:wrap;border-bottom:1px solid var(--ink-150);background:var(--card);padding:14px 24px}.uz-eval-title{margin:0;font:800 16px/1.35 var(--font-display)}.uz-eval-gate{display:flex;align-items:center;gap:8px;border:1px solid var(--gate-border);border-radius:8px;background:var(--gate-bg);padding:6px 12px;color:var(--gate-color);font-size:12px;font-weight:700}.uz-eval-dot{width:8px;height:8px;border-radius:999px;background:currentColor}.uz-eval-head-actions{display:flex;align-items:center;gap:10px;margin-left:auto;flex-wrap:wrap}.uz-eval-note{display:flex;flex:none;align-items:center;gap:8px;border-bottom:1px solid var(--ink-150);background:var(--card);padding:10px 24px;color:var(--ink-700);font-size:12px;line-height:1.45}.uz-eval-shell{display:flex;flex:1;min-height:0;overflow:hidden}.uz-eval-list{width:300px;flex:none;overflow:auto;border-right:1px solid var(--ink-150);background:var(--card)}.uz-eval-row{display:grid;width:100%;grid-template-columns:8px minmax(0,1fr) auto;gap:10px;align-items:center;border:0;border-bottom:1px solid var(--ink-075);background:var(--card);padding:12px 16px;color:var(--ink-900);cursor:pointer;text-align:left}.uz-eval-row[aria-pressed=true]{background:var(--paper)}.uz-eval-row:hover,.uz-eval-row:focus-visible{outline:0;background:var(--ink-075)}.uz-eval-row strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}.uz-eval-row small,.uz-eval-mono{font-family:var(--font-data);font-size:11px}.uz-eval-detail{flex:1;min-width:0;overflow:auto;padding:20px 24px}.uz-eval-detail-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px}.uz-eval-detail-head h3{margin:0;font:800 18px/1.3 var(--font-display)}.uz-eval-meta{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;color:var(--ink-500);font-size:12px}.uz-eval-btn{border:1px solid var(--ink-150);border-radius:7px;background:var(--card);color:var(--ink-700);cursor:pointer;font:700 12px/1 var(--font-body);padding:8px 12px}.uz-eval-btn:disabled{cursor:not-allowed;opacity:.45}.uz-eval-btn--primary{border-color:var(--ink-900);background:var(--ink-900);color:var(--card)}.uz-eval-btn--link{border:0;background:transparent;color:var(--state-ai);padding:0}.uz-eval-badge{display:inline-flex;align-items:center;border-radius:5px;padding:2px 8px;font-size:11px;font-weight:800}.uz-eval-badge--ok{background:color-mix(in srgb,var(--state-ok) 12%,var(--card));color:var(--state-ok)}.uz-eval-badge--warn{background:color-mix(in srgb,var(--state-warn) 16%,var(--card));color:var(--state-warn)}.uz-eval-badge--danger{background:color-mix(in srgb,var(--state-human) 12%,var(--card));color:var(--state-human)}.uz-eval-badge--info{background:color-mix(in srgb,var(--state-ai) 12%,var(--card));color:var(--state-ai)}.uz-eval-card{border:1px solid var(--case-border,var(--ink-150));border-radius:8px;background:var(--card);padding:13px 15px;margin-bottom:10px}.uz-eval-card-head{display:flex;align-items:center;gap:9px;margin-bottom:8px}.uz-eval-card-head strong{flex:1;min-width:0;font-size:13px}.uz-eval-diff{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0;font-size:12px}.uz-eval-diff div{border-radius:6px;padding:8px 9px;line-height:1.5}.uz-eval-diff span{display:block;margin-bottom:4px;color:var(--ink-500);font-size:10px}.uz-eval-expected{background:color-mix(in srgb,var(--state-ok) 12%,var(--card));color:var(--state-ok)}.uz-eval-actual{background:color-mix(in srgb,var(--state-human) 10%,var(--card));color:var(--state-human)}.uz-eval-toast{border-bottom:1px solid color-mix(in srgb,var(--state-ok) 30%,var(--ink-150));background:color-mix(in srgb,var(--state-ok) 10%,var(--card));padding:8px 24px;color:var(--state-ok);font-size:12px;font-weight:700}.uz-eval-state{display:grid;flex:1;min-height:280px;place-items:center;padding:24px;text-align:center}.uz-eval-state div{max-width:540px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:20px}.uz-eval-state h2{margin:0 0 8px;font-size:16px}.uz-eval-state p{margin:0;color:var(--ink-700);font-size:13px;line-height:1.55}
@media (max-width:720px){.uz-eval-head,.uz-eval-note,.uz-eval-detail{padding-left:12px;padding-right:12px}.uz-eval-shell{display:block;overflow:auto}.uz-eval-list{width:auto;border-right:0;border-bottom:1px solid var(--ink-150);max-height:220px}.uz-eval-detail{overflow:visible}.uz-eval-detail-head{align-items:flex-start}.uz-eval-detail-head .uz-eval-btn{width:100%;margin-left:0}.uz-eval-head-actions{width:100%;margin-left:0}.uz-eval-head-actions .uz-eval-btn{flex:1}.uz-eval-diff{grid-template-columns:1fr}.uz-eval-meta{display:block}.uz-eval-meta span{display:block;margin-bottom:6px}}
`;

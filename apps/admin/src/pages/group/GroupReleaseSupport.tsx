import { createElement as h } from "react";
import { RefreshCw } from "lucide-react";
import {
  releaseGateConsoleState,
  type ReleaseGateRow
} from "../../releaseGateContracts";
import { Button, Checkbox, IconSlot, StatusBadge } from "../../primitives";
import { PageState } from "../../patterns";

export type ReleaseViewState =
  | "degraded"
  | "empty"
  | "error"
  | "loading"
  | "owner-decision-required"
  | "permission";

type Tone = "danger" | "info" | "neutral" | "ok" | "warn";

type ChecklistItem = {
  evidence: string;
  id: string;
  label: string;
  state: "blocked" | "evidence" | "missing" | "owner";
};

type SeverityItem = {
  blockers: string;
  label: string;
  source: string;
  tone: Tone;
  value: string;
};

const viewStates = new Set<ReleaseViewState>([
  "degraded",
  "empty",
  "error",
  "loading",
  "owner-decision-required",
  "permission"
]);

const gateTone: Record<ReleaseGateRow["state"], Tone> = {
  Accepted: "ok",
  Blocked: "danger",
  Closed: "warn",
  "In progress": "info",
  Locked: "danger"
};

const checklistTone: Record<ChecklistItem["state"], Tone> = {
  blocked: "danger",
  evidence: "ok",
  missing: "warn",
  owner: "danger"
};

const checklistCopy: Record<ChecklistItem["state"], string> = {
  blocked: "未全绿",
  evidence: "证据可读",
  missing: "待证据",
  owner: "owner 决策"
};

export const releaseGates = releaseGateConsoleState.rows;

const gateTitle: Record<string, string> = {
  "1.0": "1.0 · 正式发布",
  "GA-0": "GA-0 · 生产内测开闸",
  M0: "M0 · 骨架与登录",
  M1: "M1 · 对话工作台",
  M2: "M2 · 知识与确认队列",
  M3: "M3 · AI 能力评测门禁",
  M4: "M4 · 订单与客户资产",
  M5: "M5 · 运行时闭环（真实DB）",
  M6: "M6 · 证据/加固收口包"
};

const stateCopy: Record<ReleaseGateRow["state"], string> = {
  Accepted: "已验收",
  Blocked: "阻断",
  Closed: "已关闭（不发布）",
  "In progress": "进行中",
  Locked: "锁定"
};

const ownerCopy: Record<string, string> = {
  accepted: "已签收",
  "accepted for milestone evidence": "按里程碑证据验收",
  "closed as no-go package": "已作为不发布包关闭",
  "not approved": "未批准"
};

export const severityRollup: SeverityItem[] = [
  {
    blockers: "J-05/L-01/G-06/I-05 等发布门禁仍需证据或 owner 决策。",
    label: "P0 阻断",
    source: "1.0 验收矩阵",
    tone: "danger",
    value: "not closed"
  },
  {
    blockers: "P1 未通过项必须有 owner 风险说明、修复日期和明确签字。",
    label: "P1 风险",
    source: "release acceptance rules",
    tone: "warn",
    value: "owner note required"
  },
  {
    blockers: "P2 只能进入 1.0 后修复池；本页不自动降级为已批准。",
    label: "P2 后续池",
    source: "acceptance severity",
    tone: "neutral",
    value: "not classified"
  }
];

export const gaChecklist: ChecklistItem[] = [
  {
    evidence: "M2/M3 gate evidence and owner milestone acceptance are readable.",
    id: "m2-m3",
    label: "M2/M3 闸门关闭",
    state: "evidence"
  },
  {
    evidence: "G-06 full >=200 eval set remains a GA-0/1.0 release gate.",
    id: "redline-eval",
    label: "红线评测与生产出站过滤器",
    state: "blocked"
  },
  {
    evidence: "Breaker, emergency stop and recovery evidence must stay current.",
    id: "breaker-estop",
    label: "熔断、急停与恢复演练",
    state: "missing"
  },
  {
    evidence: "M6B-17 clears external-input blockers only; no release approval.",
    id: "runtime-drill",
    label: "心跳、trace、api/worker 回滚演练",
    state: "evidence"
  },
  {
    evidence: "Confirmation queue page exists; bilingual guidance remains owner-gated.",
    id: "queue-guidance",
    label: "确认队列可用与双语引导话术",
    state: "missing"
  },
  {
    evidence: "No explicit owner GA-0 open decision is recorded.",
    id: "owner-open",
    label: "owner 明确开闸 GA-0",
    state: "owner"
  }
];

export function releaseViewStateFromSearch(): ReleaseViewState {
  if (typeof window === "undefined") return "degraded";
  const value = new URLSearchParams(window.location.search).get("m7ReleaseState");
  return viewStates.has(value as ReleaseViewState)
    ? (value as ReleaseViewState)
    : "degraded";
}

export function renderReleaseState(state: ReleaseViewState) {
  if (state === "degraded" || state === "owner-decision-required") return null;
  if (state === "loading") return h(ReleaseLoadingState);
  const copy = {
    empty: {
      message:
        "当前环境没有可读取的 acceptance_evidence 运行时记录；所有发布动作保持禁用。",
      title: "没有发布验收运行时证据"
    },
    error: {
      message:
        "release acceptance source returned a controlled error. Legacy evidence remains readable; no green state is inferred.",
      title: "发布验收来源读取失败"
    },
    permission: {
      message: "缺少 release:read / release:decision 权限；后端权限仍是唯一准入来源。",
      title: "无发布与验收权限"
    }
  }[state];
  const pageStateProps = {
    "data-testid": `m7-release-${state}`,
    action:
      state === "error"
        ? h(
            Button,
            { disabled: true, icon: h(IconSlot, { icon: RefreshCw }) },
            "等待运行时合约"
          )
        : undefined,
    kind: state,
    message: copy.message,
    title: copy.title
  } as unknown as Parameters<typeof PageState>[0];
  return h(PageState, pageStateProps);
}

function ReleaseLoadingState() {
  return h(
    "section",
    {
      "aria-label": "发布与验收加载中",
      className: "uz-release-loading",
      "data-testid": "m7-release-loading"
    },
    h("p", null, "读取发布与验收运行时视图，不回退到 fixture。"),
    Array.from({ length: 5 }, (_, index) =>
      h("div", { "aria-hidden": true, className: "uz-release-skeleton", key: index })
    )
  );
}

export function stateBadge(state: ReleaseGateRow["state"]) {
  return h(StatusBadge, { tone: gateTone[state] }, stateCopy[state]);
}

export function gateVisualTitle(gate: ReleaseGateRow) {
  return gateTitle[gate.gate] ?? `${gate.gate} gate`;
}

export function gateOwnerLabel(owner: string) {
  return ownerCopy[owner] ?? owner;
}

export function gateBlockerLabel(blocker: string) {
  return blocker === "none" ? "—" : blocker;
}

export function checklistStatus(item: ChecklistItem) {
  return h(StatusBadge, { tone: checklistTone[item.state] }, checklistCopy[item.state]);
}

export function ReadOnlyChecklistBox({ item }: { item: ChecklistItem }) {
  return h(Checkbox, {
    "aria-label": `${item.label} read-only ${checklistCopy[item.state]}`,
    checked: item.state === "evidence",
    disabled: true
  });
}

const releaseCss = `.uz-release-page{display:flex;min-height:100%;flex-direction:column;background:var(--paper)}.uz-release-page a{color:var(--state-ai);font-weight:700;text-decoration:none}.uz-release-page a:hover{text-decoration:underline}.uz-release-header{display:flex;flex:none;align-items:center;gap:var(--s-10);border-bottom:1px solid var(--ink-150);background:var(--card);padding:14px 24px}.uz-release-heading{min-width:0}.uz-release-heading h1{margin:0;color:var(--ink-900);font:800 var(--text-xl)/1.2 var(--font-display)}.uz-release-heading p{margin:var(--s-1) 0 0;color:var(--ink-500);font:600 var(--text-xs)/1.35 var(--font-body)}.uz-release-header-metrics{display:flex;flex-wrap:wrap;align-items:center;gap:28px}.uz-release-header-metric{display:grid;gap:var(--s-1);min-width:112px}.uz-release-header-metric span{color:var(--ink-500);font:600 11px/1.2 var(--font-body)}.uz-release-header-metric strong{font:800 var(--text-base)/1.1 var(--font-data)}.uz-release-header-metric.is-ok strong{color:var(--state-ok)}.uz-release-header-metric.is-warn strong{color:var(--state-warn)}.uz-release-header-metric.is-danger strong{color:var(--state-human)}.uz-release-page>.uz-degraded-bar{margin:18px 24px 0}.uz-release-overview{display:grid;grid-template-columns:minmax(0,1.58fr) minmax(340px,1fr);gap:16px;align-items:start;padding:18px 24px}.uz-release-main,.uz-release-side,.uz-release-gates,.uz-release-checklist-list,.uz-release-severity-list{display:grid;gap:12px}.uz-release-summary,.uz-release-mobile-fallback,.uz-release-actions,.uz-release-severity,.uz-release-checklist,.uz-release-gate{border:1px solid var(--ink-150);border-radius:10px;background:var(--card)}.uz-release-summary,.uz-release-mobile-fallback,.uz-release-actions,.uz-release-severity,.uz-release-checklist{padding:16px}.uz-release-mobile-fallback{display:none}.uz-release-summary{font:500 var(--text-sm)/1.7 var(--font-body);color:var(--ink-700)}.uz-release-section-label{margin:0;color:var(--ink-500);font:600 var(--text-sm)/1.35 var(--font-body)}.uz-release-actions p,.uz-release-mobile-fallback p,.uz-release-loading p,.uz-release-checklist p{margin:0;color:var(--ink-700);font:500 var(--text-xs)/1.55 var(--font-body)}.uz-release-actions strong,.uz-release-severity h3,.uz-release-checklist h3{margin:0;color:var(--ink-900);font:800 var(--text-lg)/1.2 var(--font-display)}.uz-release-checklist h3{font-size:var(--text-xl)}.uz-release-checklist-subtitle{margin:var(--s-1) 0 var(--s-5);color:var(--ink-500);font:500 var(--text-xs)/1.35 var(--font-body)}.uz-release-gate{display:grid;gap:10px;padding:14px 16px}.uz-release-gate header,.uz-release-check-row,.uz-release-actions-row{display:flex;flex-wrap:wrap;align-items:center;gap:10px}.uz-release-gate header{justify-content:space-between}.uz-release-gate h3{margin:0;color:var(--ink-900);font:800 var(--text-lg)/1.25 var(--font-body)}.uz-release-gate dl{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;margin:0}.uz-release-gate div,.uz-release-severity-row{min-width:0}.uz-release-gate dt,.uz-release-severity-label{color:var(--ink-500);font:600 var(--text-xs)/1.2 var(--font-body)}.uz-release-gate dd,.uz-release-severity-row p{margin:var(--s-2) 0 0;color:var(--ink-700);font:650 var(--text-sm)/1.45 var(--font-body);overflow-wrap:anywhere}.uz-release-gate dd{min-height:20px}.uz-release-gate-blocker{color:var(--state-human)!important}.uz-release-severity-row{display:grid;grid-template-columns:minmax(76px,.7fr) minmax(88px,.85fr) minmax(0,1.4fr) minmax(0,.9fr);gap:12px;padding:12px 0;border-bottom:1px solid var(--ink-075)}.uz-release-severity-row:last-child{border-bottom:0}.uz-release-severity-value{font:800 var(--text-sm)/1.3 var(--font-data)}.uz-release-severity-value.is-danger{color:var(--state-human)}.uz-release-severity-value.is-warn{color:var(--state-warn)}.uz-release-severity-value.is-neutral{color:var(--ink-700)}.uz-release-check-row{align-items:flex-start;padding:10px 0}.uz-release-check-row>div{display:grid;gap:var(--s-1);min-width:0;flex:1}.uz-release-check-row strong{color:var(--ink-900);font:700 var(--text-sm)/1.35 var(--font-body)}.uz-release-truthline{margin-top:12px;color:var(--ink-500);font:600 var(--text-xs)/1.45 var(--font-body)}.uz-release-actions{display:grid;gap:12px}.uz-release-actions-row{align-items:stretch}.uz-release-actions-row .uz-button{flex:1 1 160px;justify-content:center}.uz-release-actions-row .uz-button:disabled{border-color:var(--ink-150);color:var(--ink-500);background:var(--ink-075);opacity:1}.uz-release-loading{display:grid;gap:var(--s-5);margin:18px 24px;padding:var(--s-6);border:1px solid var(--ink-150);border-radius:var(--radius-lg);background:var(--card)}.uz-release-skeleton{height:58px;border-radius:var(--radius-md);background:var(--ink-075)}@media(max-width:920px){.uz-release-header{align-items:flex-start;flex-direction:column;gap:var(--s-5)}.uz-release-overview{grid-template-columns:1fr}.uz-release-severity-row{grid-template-columns:1fr}}@media(max-width:720px){.uz-release-header{padding:14px 16px}.uz-release-page>.uz-degraded-bar{align-items:flex-start;margin:14px 16px 0}.uz-release-page>.uz-degraded-bar .uz-button{display:none}.uz-release-overview{padding:14px 16px}.uz-release-gate dl{grid-template-columns:1fr}.uz-release-mobile-fallback{display:grid;gap:var(--s-3)}.uz-release-gate header{align-items:flex-start;flex-direction:column}.uz-release-actions-row{flex-direction:column}}`;

export const ReleaseStyles = () => h("style", null, releaseCss);

import { createElement as h, type ChangeEvent } from "react";
import { FileText } from "lucide-react";
import { IconSlot } from "../../primitives";

export type KnowledgeTab =
  | "journey"
  | "facts"
  | "public"
  | "private"
  | "assets"
  | "templates";
export type KnowledgeViewState =
  | "degraded"
  | "empty"
  | "error"
  | "gate"
  | "loading"
  | "permission";
type FeedbackLevel = "high" | "low" | "medium";
type FactEvaluation = "blocked" | "passed" | "queued";
type TemplateStatus = "has-update" | "local-change" | "synced";
type Tone = "danger" | "info" | "neutral" | "ok" | "warn";

interface IdentifiedRow {
  id: string;
  title: string;
}

interface CategorizedRow extends IdentifiedRow {
  category: string;
}

export interface JourneyStage {
  assets: string[];
  feedback: FeedbackLevel;
  id: string;
  name: string;
  rate: number;
}
export type KnowledgeFact = {
  content: string;
  evaluation: FactEvaluation;
  feedback: number;
  hits: number;
  redline: boolean;
  sourceRef: string;
  version: string;
} & CategorizedRow;
export type KnowledgeSnippet = CategorizedRow & {
  content: string;
  edited: string;
  scope: "private" | "public";
};
export type KnowledgeAsset = IdentifiedRow & {
  cached: boolean;
  content: string;
  description: string;
  format: string;
  referenced: boolean;
  ref: string;
  size: string;
  stage: string;
  type: string;
};
export type TemplateSource = IdentifiedRow & {
  copied: string;
  localVersion: string;
  sourceRef: string;
  sourceVersion: string;
  status: TemplateStatus;
};

export const knowledgeTabs: { id: KnowledgeTab; label: string }[] = [
  { id: "journey", label: "教程旅程" },
  { id: "facts", label: "事实条目" },
  { id: "public", label: "公共话术" },
  { id: "private", label: "私人话术" },
  { id: "assets", label: "素材库" },
  { id: "templates", label: "模板来源" }
];

const runtimeLabels = [
  "degraded",
  "mock",
  "read-only",
  "not production knowledge data",
  "no formal knowledge write",
  "no automatic publish"
];

export const stages: JourneyStage[] = [
  {
    assets: ["SYN-KB-ASSET-001", "SYN-KB-ASSET-002"],
    feedback: "low",
    id: "SYN-KB-STAGE-001",
    name: "Mock 认知",
    rate: 92
  },
  {
    assets: ["SYN-KB-ASSET-002"],
    feedback: "medium",
    id: "SYN-KB-STAGE-002",
    name: "Mock 比较",
    rate: 84
  },
  {
    assets: ["SYN-KB-ASSET-004"],
    feedback: "high",
    id: "SYN-KB-STAGE-003",
    name: "Mock 下单",
    rate: 69
  }
];

export const facts: KnowledgeFact[] = [
  {
    category: "Mock 政策",
    content: "Mock 事实只描述 synthetic 页面行为，命中后进入人工复核提示。",
    evaluation: "blocked",
    feedback: 21,
    hits: 128,
    id: "SYN-KB-FACT-001",
    redline: true,
    sourceRef: "controlled://mock/knowledge/facts/001",
    title: "Mock 红线事实：必须人工复核",
    version: "SYN-KB-V3"
  },
  {
    category: "Mock 流程",
    content: "Mock 流程事实用于展示详情面板，不代表生产知识。",
    evaluation: "passed",
    feedback: 3,
    hits: 86,
    id: "SYN-KB-FACT-002",
    redline: false,
    sourceRef: "controlled://mock/knowledge/facts/002",
    title: "Mock 教程流程入口",
    version: "SYN-KB-V2"
  }
];

export const snippets: KnowledgeSnippet[] = [
  {
    category: "Mock 欢迎",
    content: "Mock public snippet: 先确认问题，再引导到安全的人工复核。",
    edited: "mock today",
    id: "SYN-KB-PUBLIC-001",
    scope: "public",
    title: "Mock 公共欢迎话术"
  },
  {
    category: "Mock 个人",
    content: "Mock private snippet: 仅本地演示，切换租户后不保留。",
    edited: "mock today",
    id: "SYN-KB-PRIVATE-001",
    scope: "private",
    title: "Mock 私人备注话术"
  }
];

export const assets: KnowledgeAsset[] = [
  {
    cached: true,
    content: "Mock 素材内容 A。\n不读取真实文件，不写正式知识库。",
    description: "Mock 图片说明与教程入口。",
    format: "png",
    id: "SYN-KB-ASSET-001",
    referenced: true,
    ref: "controlled://mock/assets/onboarding-a",
    size: "mock 42KB",
    stage: "Mock 认知",
    title: "Mock 认知素材 A",
    type: "图片"
  },
  {
    cached: true,
    content: "Mock 素材内容 B。仅用于 UI 测试。",
    description: "Mock 文档说明。",
    format: "md",
    id: "SYN-KB-ASSET-002",
    referenced: true,
    ref: "controlled://mock/assets/onboarding-b",
    size: "mock 12KB",
    stage: "Mock 认知",
    title: "Mock 认知素材 B",
    type: "文档"
  },
  {
    cached: false,
    content: "Mock 素材内容 D。未关联素材触发旅程 warning。",
    description: "Mock 下单阶段资源。",
    format: "jpg",
    id: "SYN-KB-ASSET-004",
    referenced: false,
    ref: "controlled://mock/assets/order-d",
    size: "mock 33KB",
    stage: "Mock 下单",
    title: "Mock 未关联素材 D",
    type: "图片"
  }
];

export const templateSources: TemplateSource[] = [
  {
    copied: "mock 07-01",
    id: "SYN-KB-TMPL-001",
    localVersion: "SYN-KB-L2",
    sourceRef: "controlled://mock/templates/faq",
    sourceVersion: "SYN-KB-S2",
    status: "synced",
    title: "Mock FAQ 模板"
  }
];

export function readKnowledgeViewState(): KnowledgeViewState {
  const value = new URLSearchParams(location.search).get("m7KnowledgeState");
  if (
    value === "empty" ||
    value === "error" ||
    value === "gate" ||
    value === "loading" ||
    value === "permission"
  )
    return value;
  return "degraded";
}

export function filterByQuery<T extends { category?: string; title: string }>(
  rows: T[],
  query: string
) {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) =>
    [row.title, row.category ?? ""].some((value) => value.toLowerCase().includes(q))
  );
}

export function toneClass(tone: Tone) {
  return `uz-knowledge-badge uz-knowledge-badge--${tone}`;
}

export const feedbackLabel = {
  high: "高负反馈",
  low: "低负反馈",
  medium: "中负反馈"
} as const;
export const evalLabel = {
  blocked: "gate blocked",
  passed: "mock passed",
  queued: "mock queued"
} as const;

export const templateStatusLabel = {
  "has-update": "有更新",
  "local-change": "本地修改",
  synced: "已同步"
} as const;

export const templateTone = (status: TemplateSource["status"]) =>
  status === "synced" ? "ok" : status === "has-update" ? "warn" : "info";

export function KnowledgeRuntimeNote() {
  return h(
    "div",
    { className: "uz-knowledge-runtime", "data-testid": "m7-knowledge-runtime-note" },
    [
      h(
        "span",
        { className: toneClass("warn"), key: "badge" },
        runtimeLabels.slice(0, 3).join(" · ")
      ),
      h("span", { key: "copy" }, runtimeLabels.slice(3).join(" · "))
    ]
  );
}

export function KnowledgeToolbar({
  query,
  setQuery,
  tab
}: {
  query: string;
  setQuery: (value: string) => void;
  tab: KnowledgeTab;
}) {
  const chips =
    tab === "assets" ? ["Mock 认知", "Mock 下单"] : ["Mock 政策", "Mock 流程"];
  return h(
    "div",
    { className: "uz-knowledge-toolbar", "data-testid": "m7-knowledge-toolbar" },
    [
      h("input", {
        "aria-label": "搜索知识与资源",
        className: "uz-knowledge-search",
        "data-testid": "m7-knowledge-search",
        key: "search",
        onChange: (event: ChangeEvent<HTMLInputElement>) =>
          setQuery(event.currentTarget.value),
        placeholder: "搜索 Mock title / category",
        value: query
      }),
      ...chips.map((chip) =>
        h(
          "button",
          {
            "aria-pressed": "false",
            className: "uz-knowledge-chip",
            key: chip,
            type: "button"
          },
          chip
        )
      ),
      h(
        "button",
        { className: "uz-knowledge-btn", disabled: true, key: "local", type: "button" },
        "local-only"
      )
    ]
  );
}

export function KnowledgeAssetDetail({
  asset,
  draft,
  editing,
  onCancel,
  onDelete,
  onDraft,
  onEdit,
  onSave
}: {
  asset: KnowledgeAsset;
  draft: string;
  editing: boolean;
  onCancel: () => void;
  onDelete: () => void;
  onDraft: (value: string) => void;
  onEdit: () => void;
  onSave: () => void;
}) {
  const content = editing
    ? h("textarea", {
        "aria-label": "Edit mock asset content",
        className: "uz-knowledge-edit",
        onChange: (event: ChangeEvent<HTMLTextAreaElement>) =>
          onDraft(event.currentTarget.value),
        value: draft
      })
    : h("p", null, asset.content);
  const actions = editing
    ? h("span", null, [
        assetButton("m7-knowledge-asset-cancel", onCancel, "cancel"),
        " ",
        assetButton("m7-knowledge-asset-save", onSave, "save local-only", true)
      ])
    : assetButton("m7-knowledge-asset-edit", onEdit, "edit local-only", true);
  return h(
    "main",
    {
      className: "uz-knowledge-pad uz-knowledge-asset-detail",
      "data-testid": "m7-knowledge-asset-detail"
    },
    [
      h("section", { className: "uz-knowledge-card", key: "hero" }, [
        h("h3", { key: "title" }, asset.title),
        h("p", { key: "desc" }, `${asset.description} · ${asset.ref}`),
        h("div", { className: "uz-knowledge-preview", key: "preview" }, [
          h(IconSlot, { icon: FileText, key: "icon", size: "sm" }),
          ` ${asset.type} preview · ${asset.format}`
        ])
      ]),
      h("section", { className: "uz-knowledge-card", key: "content" }, [
        h("h3", { key: "heading" }, "Mock asset content"),
        content
      ]),
      h("div", { className: "uz-knowledge-actions", key: "actions" }, [
        assetButton("m7-knowledge-asset-delete", onDelete, "delete local-only"),
        actions
      ])
    ]
  );
}

function assetButton(
  testId: string,
  onClick: () => void,
  text: string,
  primary = false
) {
  return h(
    "button",
    {
      className: `uz-knowledge-btn${primary ? " uz-knowledge-btn--primary" : ""}`,
      "data-testid": testId,
      key: testId,
      onClick,
      type: "button"
    },
    text
  );
}

export const knowledgeStyles = `
.uz-knowledge-page{display:flex;min-height:0;height:100%;flex-direction:column;overflow:hidden;background:var(--paper);color:var(--ink-900);font-family:var(--font-body)}
.uz-knowledge-page *{box-sizing:border-box}.uz-knowledge-head{flex:none;border-bottom:1px solid var(--ink-150);background:var(--card);padding:14px 24px 0}.uz-knowledge-title{margin:0 0 12px;font-family:var(--font-display);font-size:16px;line-height:1.35}.uz-knowledge-tabs{display:flex;gap:2px;overflow-x:auto}.uz-knowledge-tab{flex:none;border:0;border-bottom:2px solid transparent;background:transparent;color:var(--ink-500);cursor:pointer;font:600 13px/1 var(--font-body);padding:10px 13px}.uz-knowledge-tab[aria-pressed=true]{border-color:var(--ink-900);color:var(--ink-900)}.uz-knowledge-runtime{display:flex;flex:none;align-items:center;gap:8px;border-bottom:1px solid var(--ink-150);background:var(--card);padding:10px 24px;color:var(--ink-700);font-size:12px;line-height:1.45}.uz-knowledge-runtime span:last-child{min-width:0}.uz-knowledge-toolbar{display:flex;flex:none;align-items:center;gap:10px;border-bottom:1px solid var(--ink-150);background:var(--card);padding:10px 24px;flex-wrap:wrap}.uz-knowledge-search{width:320px;max-width:100%;border:1px solid var(--ink-150);border-radius:8px;background:var(--paper);padding:8px 10px;color:var(--ink-900);font:500 13px/1 var(--font-body)}.uz-knowledge-chip,.uz-knowledge-btn{border:1px solid var(--ink-150);border-radius:7px;background:var(--card);color:var(--ink-700);cursor:pointer;font:600 12px/1 var(--font-body);padding:7px 10px}.uz-knowledge-chip[aria-pressed=true],.uz-knowledge-btn--primary{border-color:var(--ink-900);background:var(--ink-900);color:var(--card)}.uz-knowledge-scroll{flex:1;min-height:0;overflow:auto}.uz-knowledge-pad{padding:18px 24px}.uz-knowledge-count{margin:0 0 10px;color:var(--ink-500);font-size:12px}.uz-knowledge-stage-grid{display:grid;grid-template-columns:repeat(4,minmax(156px,1fr));gap:10px;min-width:680px}.uz-knowledge-stage{border:1px solid var(--ink-150);border-radius:8px;background:var(--card);color:var(--ink-700);cursor:pointer;padding:13px;text-align:left}.uz-knowledge-stage[aria-pressed=true]{border-color:var(--ink-900);background:var(--paper);color:var(--ink-900)}.uz-knowledge-stage strong{display:block;margin-bottom:8px;color:var(--ink-900)}.uz-knowledge-mono{font-family:var(--font-data);font-size:12px}.uz-knowledge-detail{margin-top:16px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:16px}.uz-knowledge-warning{display:flex;gap:10px;margin-top:12px;border:1px solid color-mix(in srgb,var(--state-human) 40%,var(--ink-150));border-radius:8px;background:color-mix(in srgb,var(--state-human) 9%,var(--card));padding:12px;color:var(--ink-700)}.uz-knowledge-split{display:grid;grid-template-columns:minmax(0,1fr) 340px;min-height:100%}.uz-knowledge-table-wrap{overflow:auto;border:1px solid var(--ink-150);border-radius:8px;background:var(--card)}.uz-knowledge-table{width:100%;min-width:680px;border-collapse:collapse;font-size:13px}.uz-knowledge-table th{background:var(--paper);color:var(--ink-500);font-size:11px;text-align:left}.uz-knowledge-table th,.uz-knowledge-table td{border-bottom:1px solid var(--ink-075);padding:10px 12px}.uz-knowledge-row{cursor:pointer}.uz-knowledge-row:hover,.uz-knowledge-row:focus{background:var(--paper);outline:none}.uz-knowledge-side{border-left:1px solid var(--ink-150);background:var(--card);padding:18px;overflow:auto}.uz-knowledge-badge{display:inline-flex;align-items:center;border-radius:5px;padding:2px 8px;font-size:11px;font-weight:700}.uz-knowledge-badge--danger{background:color-mix(in srgb,var(--state-human) 12%,var(--card));color:var(--state-human)}.uz-knowledge-badge--info{background:color-mix(in srgb,var(--state-ai) 12%,var(--card));color:var(--state-ai)}.uz-knowledge-badge--neutral{background:var(--ink-075);color:var(--ink-700)}.uz-knowledge-badge--ok{background:color-mix(in srgb,var(--state-ok) 12%,var(--card));color:var(--state-ok)}.uz-knowledge-badge--warn{background:color-mix(in srgb,var(--state-warn) 16%,var(--card));color:var(--state-warn)}.uz-knowledge-card{border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:14px}.uz-knowledge-stack{display:grid;gap:10px}.uz-knowledge-card h3,.uz-knowledge-side h3{margin:0 0 8px;font-size:14px}.uz-knowledge-card p,.uz-knowledge-side p{margin:0;color:var(--ink-700);font-size:13px;line-height:1.55}.uz-knowledge-asset-detail{max-width:880px}.uz-knowledge-preview{display:grid;min-height:140px;place-items:center;border:1px solid var(--ink-150);border-radius:8px;background:var(--ink-075);color:var(--ink-500);font-size:12px}.uz-knowledge-edit{width:100%;min-height:150px;border:1px solid var(--ink-150);border-radius:8px;background:var(--paper);padding:10px;color:var(--ink-900);font:500 13px/1.55 var(--font-body);resize:vertical}.uz-knowledge-actions{display:flex;justify-content:space-between;gap:8px;margin-top:14px}.uz-knowledge-state{display:grid;min-height:280px;place-items:center;padding:24px;text-align:center}.uz-knowledge-state div{max-width:520px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:20px}.uz-knowledge-state h2{margin:0 0 8px;font-size:16px}.uz-knowledge-state p{margin:0;color:var(--ink-700);font-size:13px;line-height:1.55}
@media (max-width:720px){.uz-knowledge-head,.uz-knowledge-runtime,.uz-knowledge-toolbar,.uz-knowledge-pad{padding-left:12px;padding-right:12px}.uz-knowledge-split{display:block}.uz-knowledge-side{border-left:0;border-top:1px solid var(--ink-150)}.uz-knowledge-stage-grid{min-width:620px}.uz-knowledge-table{min-width:640px}.uz-knowledge-actions{flex-direction:column}.uz-knowledge-btn{width:100%}}
`;

export type TemplateViewState =
  | "degraded"
  | "empty"
  | "error"
  | "loading"
  | "permission";
type TemplateTone = "danger" | "info" | "neutral" | "ok" | "warn";
export type TemplateTabId = "agent" | "config" | "eval" | "knowledge" | "quick_reply";

export interface TemplateCard {
  biz: string;
  copied: string[];
  copiedAt: string;
  evalLabel: string;
  evalTone: TemplateTone;
  id: string;
  meta: string;
  name: string;
  version: string;
}

export interface TemplateTenantTarget {
  id: string;
  line: string;
  name: string;
  tone: TemplateTone;
}

const templateRuntimeLabels =
  "degraded|mock|read-only|browser-local only|no production template copy|no audit write|no config write".split(
    "|"
  );

export const templateRuntimeBoundary = templateRuntimeLabels.join(" · ");

export const templateMeta = {
  descriptor: "集团级模板运营",
  runtime: templateRuntimeBoundary,
  source: "centralized-synthetic-owner-fixture",
  subtitle: "复制到租户将生成独立版本",
  title: "模板中心"
} as const;

export const templateStateCopy: Record<
  Exclude<TemplateViewState, "degraded">,
  { body: string; title: string }
> = {
  empty: {
    body: "模板库接入后，这里会显示可复制到租户的知识包、人设、配置、评测集和话术包。",
    title: "暂无可用模板"
  },
  error: {
    body: "模板中心暂时无法展示，请稍后刷新或联系平台管理员。",
    title: "模板中心暂不可用"
  },
  loading: {
    body: "正在同步模板分类、版本信息和最近复制记录。",
    title: "正在载入模板"
  },
  permission: {
    body: "当前账号需要集团管理员权限后才能查看模板中心。",
    title: "需要集团管理员权限"
  }
};

export const templateTabs: Array<{ id: TemplateTabId; label: string }> = [
  { id: "knowledge", label: "知识包" },
  { id: "agent", label: "人设" },
  { id: "config", label: "配置" },
  { id: "eval", label: "评测集" },
  { id: "quick_reply", label: "话术包" }
];

export const templateCardsByTab: Record<TemplateTabId, TemplateCard[]> = {
  knowledge: [
    card(
      "tk1",
      "美妆售后知识包",
      "美妆 · 中亚",
      "v4.2",
      "128 条目 · 36 话术",
      "通过",
      "ok",
      ["玉珠跨境美妆"],
      "3天前"
    ),
    card(
      "tk2",
      "3C 数码知识包",
      "3C · 俄语区",
      "v2.0",
      "94 条目 · 22 话术",
      "通过",
      "ok",
      ["丝路数码"],
      "2周前"
    ),
    card("tk3", "家居通用知识包", "家居", "v1.3", "67 条目 · 15 话术", "运行中", "info")
  ],
  agent: [
    card(
      "ta1",
      "标准客服人设",
      "通用",
      "v3.1",
      "5 能力 · 乌/俄双语",
      "通过",
      "ok",
      ["玉珠跨境美妆", "丝路数码", "天净家居", "白桦母婴"],
      "1周前"
    ),
    card(
      "ta2",
      "高冷专业人设",
      "3C · 高客单",
      "v1.0",
      "5 能力 · 俄语",
      "阻断",
      "danger",
      ["丝路数码"],
      "1个月前"
    )
  ],
  config: [
    card(
      "tc1",
      "中亚默认配置",
      "中亚区",
      "v2.4",
      "SLA · 路由 · 护栏",
      "通过",
      "ok",
      ["玉珠跨境美妆"],
      "5天前"
    ),
    card(
      "tc2",
      "俄语区默认配置",
      "俄语区",
      "v2.1",
      "SLA · 路由 · 护栏",
      "通过",
      "ok",
      ["丝路数码", "白桦母婴"],
      "2周前"
    )
  ],
  eval: [
    card(
      "te1",
      "红线攻击评测集",
      "通用",
      "v5.0",
      "240 case",
      "通过",
      "ok",
      ["玉珠跨境美妆", "丝路数码", "天净家居", "白桦母婴"],
      "1周前"
    ),
    card(
      "te2",
      "报价准确性评测集",
      "美妆 / 3C",
      "v2.2",
      "88 case",
      "运行中",
      "info",
      ["玉珠跨境美妆", "丝路数码"],
      "3天前"
    )
  ],
  quick_reply: [
    card(
      "tq1",
      "售后标准话术包",
      "通用 · 退款/物流",
      "v3.0",
      "42 条话术",
      "通过",
      "ok",
      ["玉珠跨境美妆", "丝路数码", "天净家居"],
      "4天前"
    ),
    card(
      "tq2",
      "人工接管礼貌用语包",
      "通用",
      "v1.2",
      "18 条话术",
      "通过",
      "ok",
      ["玉珠跨境美妆"],
      "2周前"
    )
  ]
};

export const templateTenantTargets: TemplateTenantTarget[] = [
  tenant("t1", "玉珠跨境美妆", "美妆 · 中亚", "ok"),
  tenant("t2", "丝路数码", "3C · 俄语区", "warn"),
  tenant("t3", "天净家居", "家居 · 哈萨克", "danger"),
  tenant("t4", "白桦母婴", "母婴 · 俄语区", "neutral")
];

export function readTemplateViewState(): TemplateViewState {
  const params = new URLSearchParams(location.search);
  const state = params.get("m7TemplateState") ?? params.get("state");
  return ["degraded", "empty", "error", "loading", "permission"].includes(state ?? "")
    ? (state as TemplateViewState)
    : "degraded";
}

export function templateCopyLine(card: TemplateCard) {
  if (!card.copiedAt) return "尚未复制到任何租户";
  return `最近复制 · ${card.copiedAt} · ${card.copied.length} 租户`;
}

export function templateToast(card: TemplateCard, count: number, tabLabel: string) {
  return `已复制「${card.name} ${card.version}」到 ${count} 个租户 · ${tabLabel} · 租户将生成独立版本`;
}

function card(
  key: string,
  name: string,
  biz: string,
  version: string,
  meta: string,
  evalLabel: string,
  evalTone: TemplateTone,
  copied: string[] = [],
  copiedAt = ""
): TemplateCard {
  return {
    biz,
    copied,
    copiedAt,
    evalLabel,
    evalTone,
    id: `SYN-TMPL-${key}`,
    meta,
    name,
    version
  };
}

function tenant(
  id: string,
  name: string,
  line: string,
  tone: TemplateTone
): TemplateTenantTarget {
  return { id: `SYN-COPY-${id}`, line, name, tone };
}

export const templateStyles = `.uz-template-page{display:flex;height:100%;min-height:0;flex-direction:column;overflow:hidden;background:var(--paper);color:var(--ink-900);font-family:var(--font-body)}.uz-template-page *{box-sizing:border-box}.uz-template-page [hidden]{display:none!important}.uz-template-head{flex:none;border-bottom:1px solid var(--ink-150);background:var(--card);padding:14px 24px 0}.uz-template-title-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px}.uz-template-title{margin:0;font:800 16px/1.35 var(--font-display)}.uz-template-subtitle,.uz-template-muted{color:var(--ink-500);font-size:12px}.uz-template-tabs{display:flex;gap:2px;overflow-x:auto}.uz-template-tab{flex:none;border:0;border-bottom:2px solid transparent;background:transparent;color:var(--ink-500);cursor:pointer;font:700 13px/1 var(--font-body);padding:9px 13px}.uz-template-tab:hover,.uz-template-tab:focus-visible{color:var(--ink-900);outline:0}.uz-template-tab:focus-visible,.uz-template-card button:focus-visible,.uz-template-row:focus-visible,.uz-template-dialog button:focus-visible{box-shadow:var(--shadow-focus)}.uz-template-tab[aria-selected=true]{border-bottom-color:var(--ink-900);color:var(--ink-900)}.uz-template-note,.uz-template-toast{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--ink-150);background:var(--card);padding:10px 24px;color:var(--ink-700);font-size:12px;line-height:1.45}.uz-template-note strong{border-radius:5px;background:var(--state-warn-bg);color:var(--state-warn);font-weight:800;padding:2px 8px}.uz-template-toast{border-bottom-color:var(--state-ok-border);background:var(--state-ok-bg);color:var(--state-ok);font-weight:800}.uz-template-scroll{flex:1;min-height:0;overflow:auto;padding:18px 24px 24px}.uz-template-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:14px}.uz-template-card{display:flex;min-width:0;flex-direction:column;gap:11px;border:1px solid var(--ink-150);border-radius:10px;background:var(--card);padding:16px}.uz-template-card-head{display:flex;align-items:flex-start;gap:10px}.uz-template-card-title{display:grid;gap:3px;min-width:0;flex:1}.uz-template-card-title strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px}.uz-template-card-title span,.uz-template-copy-line{color:var(--ink-500);font-size:11px}.uz-template-card-meta{display:flex;gap:14px;flex-wrap:wrap;color:var(--ink-700);font-size:12px}.uz-template-card-meta span span:first-child{color:var(--ink-500)}.uz-template-mono{font-family:var(--font-data);font-weight:700}.uz-template-copy-line{border-top:1px solid var(--ink-075);padding-top:10px}.uz-template-action{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid var(--ink-150);border-radius:7px;background:var(--card);color:var(--ink-700);cursor:pointer;font:800 12px/1 var(--font-body);padding:8px 12px}.uz-template-action:hover{background:var(--ink-075)}.uz-template-state{display:grid;flex:1;min-height:260px;place-items:center;padding:24px;text-align:center}.uz-template-state div{max-width:580px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:20px}.uz-template-state h2{margin:0 0 8px;font-size:16px}.uz-template-state p{margin:0;color:var(--ink-700);font-size:13px;line-height:1.55}.uz-template-scrim{position:fixed;inset:0;z-index:var(--z-modal);display:grid;place-items:center;background:color-mix(in srgb,var(--ink-900) 36%,transparent);padding:12px}.uz-template-dialog{width:min(420px,calc(100vw - 24px));border-radius:12px;background:var(--card);box-shadow:var(--shadow-overlay);padding:20px 22px}.uz-template-dialog-head{display:flex;align-items:flex-start;gap:12px;margin-bottom:14px}.uz-template-dialog-title{display:grid;gap:6px;min-width:0;flex:1}.uz-template-dialog-title h3{margin:0;font:800 15px/1.3 var(--font-display)}.uz-template-dialog-title p{margin:0;color:var(--ink-500);font-size:12px;line-height:1.45}.uz-template-close{display:grid;place-items:center;flex:none;width:28px;height:28px;border:0;border-radius:7px;background:transparent;color:var(--ink-500);cursor:pointer}.uz-template-targets{display:grid;gap:6px;margin-bottom:16px}.uz-template-row{display:flex;align-items:center;gap:10px;width:100%;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);color:var(--ink-900);cursor:pointer;padding:9px 11px;text-align:left}.uz-template-row[aria-checked=true]{border-color:var(--ink-900);background:var(--ink-075)}.uz-template-check{display:grid;place-items:center;flex:none;width:17px;height:17px;border:1.5px solid var(--ink-300);border-radius:4px;color:var(--card)}.uz-template-row[aria-checked=true] .uz-template-check{border-color:var(--ink-900);background:var(--ink-900)}.uz-template-dot{width:8px;height:8px;flex:none;border-radius:var(--radius-pill);background:var(--ink-500)}.uz-template-dot--ok{background:var(--state-ok)}.uz-template-dot--warn{background:var(--state-warn)}.uz-template-dot--danger{background:var(--state-human)}.uz-template-row strong{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}.uz-template-row span:last-child{color:var(--ink-500);font-size:11px;white-space:nowrap}.uz-template-dialog-foot{display:flex;justify-content:flex-end;gap:8px}.uz-template-confirm{border-color:var(--ink-900);background:var(--ink-900);color:var(--card)}.uz-template-confirm:disabled{border-color:var(--ink-150);background:var(--ink-150);color:var(--ink-300);cursor:not-allowed;opacity:1}@media(max-width:720px){.uz-template-head,.uz-template-note,.uz-template-toast,.uz-template-scroll{padding-left:12px;padding-right:12px}.uz-template-title-row{align-items:flex-start;flex-direction:column;gap:5px}.uz-template-tabs{padding-bottom:1px}.uz-template-card-title strong{white-space:normal}.uz-template-dialog{padding:16px}.uz-template-row{align-items:flex-start}.uz-template-row span:last-child{white-space:normal}.uz-template-dialog-foot{align-items:stretch;flex-direction:column}.uz-template-dialog-foot button{width:100%}}`;

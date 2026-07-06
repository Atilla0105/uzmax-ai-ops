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
  displayRef: string;
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

// prettier-ignore
export const stages: JourneyStage[] = [
  { assets: ["SYN-KB-ASSET-001", "SYN-KB-ASSET-002"], feedback: "low", id: "SYN-KB-STAGE-001", name: "触达", rate: 94 },
  { assets: ["SYN-KB-ASSET-002", "SYN-KB-ASSET-003"], feedback: "medium", id: "SYN-KB-STAGE-002", name: "报价", rate: 71 },
  { assets: ["SYN-KB-ASSET-004"], feedback: "high", id: "SYN-KB-STAGE-003", name: "下单", rate: 85 },
  { assets: ["SYN-KB-ASSET-001", "SYN-KB-ASSET-005"], feedback: "medium", id: "SYN-KB-STAGE-004", name: "售后", rate: 78 }
];

// prettier-ignore
export const facts: KnowledgeFact[] = [
  { category: "报价", content: "套装报价必须与价目表最新版本一致；评测未通过时进入确认队列处理，AI 不得自行推算折扣。", evaluation: "blocked", feedback: 31, hits: 196, id: "SYN-KB-FACT-001", redline: false, sourceRef: "controlled://mock/knowledge/facts/001", title: "套装报价口径 · 乌语拉丁", version: "v2" },
  { category: "售后", content: "退款诉求一律转人工确认，AI 不得自动承诺退款金额与到账时效。", evaluation: "passed", feedback: 6, hits: 432, id: "SYN-KB-FACT-002", redline: true, sourceRef: "controlled://mock/knowledge/facts/002", title: "退款流程说明", version: "v3" },
  { category: "产品", content: "孕期/哺乳期相关问题必须引导咨询医师，AI 禁止给出医疗建议或安全承诺。", evaluation: "queued", feedback: 0, hits: 88, id: "SYN-KB-FACT-003", redline: true, sourceRef: "controlled://mock/knowledge/facts/003", title: "玻尿酸面霜孕期可用性", version: "v1" }
];

// prettier-ignore
export const snippets: KnowledgeSnippet[] = [
  { category: "售后", content: "Hurmatli mijoz, kechikkani uchun uzr so‘raymiz. Buyurtmangiz hozir saralash markazida, 1-2 kun ichida yetkaziladi.", edited: "06-20", id: "SYN-KB-PUBLIC-001", scope: "public", title: "物流延迟标准安抚" },
  { category: "报价", content: "提醒：订单 30 分钟未支付将释放库存，需要我帮您保留吗？", edited: "06-18", id: "SYN-KB-PRIVATE-001", scope: "private", title: "我的快捷 · 催付款" }
];

// prettier-ignore
export const assets: KnowledgeAsset[] = [
  { cached: true, content: "【视频脚本 / 使用步骤】\n1. 洁面后取黄豆大小用量于指腹\n2. 由内向外、由下至上打圈涂抹于面部\n3. 敏感肌首次使用建议先做耳后测试\n\n【AI 引用要点】客户问使用方法时优先引用步骤 1-2；敏感肌问题引用第 3 步。", description: "玻尿酸面霜涂抹手法", displayRef: "素材对象 9af3", format: "MP4", id: "SYN-KB-ASSET-001", referenced: true, ref: "controlled://mock/assets/onboarding-a", size: "18.4 MB", stage: "售后", title: "面霜使用教程", type: "视频" },
  { cached: true, content: "【图片说明】三件套装电商主图，含套装构成和优惠提示。\n\n【AI 引用要点】客户问套装包含什么时，搭配报价话术发送。", description: "三件套电商主图", displayRef: "素材对象 2b71", format: "JPG", id: "SYN-KB-ASSET-002", referenced: true, ref: "controlled://mock/assets/onboarding-b", size: "820 KB", stage: "报价", title: "套装主图", type: "图片" },
  { cached: false, content: "【文档内容】\n三件套装：268 000 so‘m（含运费）。\n维C精华单瓶：138 000 so‘m。\n\n【AI 引用要点】报价时必须核对本表最新价格，禁止自行推算折扣。", description: "2026 Q2 价目表", displayRef: "素材对象 c402", format: "PDF", id: "SYN-KB-ASSET-003", referenced: true, ref: "controlled://mock/assets/price-c", size: "240 KB", stage: "报价", title: "价目表 v12", type: "文档" },
  { cached: true, content: "【图片说明】中亚五国平均时效示意图：乌兹别克斯坦 5-7 天，哈萨克斯坦 6-8 天，其余地区 7-10 天。\n\n【状态】建议补充到下单阶段用于物流预期管理。", description: "中亚物流时效示意", displayRef: "素材对象 77de", format: "PNG", id: "SYN-KB-ASSET-004", referenced: false, ref: "controlled://mock/assets/order-d", size: "612 KB", stage: "下单", title: "物流时效图", type: "图片" },
  { cached: true, content: "【文档内容】\n塔什干退货点：Chilonzor 区服务点，营业时间 10:00-19:00。\n需携带：订单号 + 未拆封商品。\n\n【AI 引用要点】客户要求退货地址时引用地址段落，不得自行编造地址。", description: "塔什干退货点", displayRef: "素材对象 e9b2", format: "PDF", id: "SYN-KB-ASSET-005", referenced: true, ref: "controlled://mock/assets/after-sale-e", size: "88 KB", stage: "售后", title: "退货地址卡", type: "文档" }
];

// prettier-ignore
export const templateSources: TemplateSource[] = [
  { copied: "06-26", id: "SYN-KB-TMPL-001", localVersion: "v4.2", sourceRef: "controlled://mock/templates/faq", sourceVersion: "v4.2", status: "synced", title: "美妆售后知识包" },
  { copied: "05-30", id: "SYN-KB-TMPL-002", localVersion: "v2.3", sourceRef: "controlled://mock/templates/defaults", sourceVersion: "v2.4", status: "has-update", title: "中亚默认配置" },
  { copied: "06-10", id: "SYN-KB-TMPL-003", localVersion: "v5.0", sourceRef: "controlled://mock/templates/redline", sourceVersion: "v5.0", status: "synced", title: "红线攻击评测集" }
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
  blocked: "未通过",
  passed: "通过",
  queued: "待评测"
} as const;

export const templateStatusLabel = {
  "has-update": "有更新",
  "local-change": "本地修改",
  synced: "已同步"
} as const;

export const templateTone = (status: TemplateSource["status"]) =>
  status === "synced" ? "ok" : status === "has-update" ? "warn" : "info";

export function KnowledgeRuntimeNote() {
  const boundary = runtimeLabels.join(" · ");
  return h(
    "div",
    {
      "aria-label": "知识与资源运行边界说明",
      className: "uz-knowledge-runtime uz-knowledge-sr-only",
      "data-runtime-boundary": boundary,
      "data-testid": "m7-knowledge-runtime-note",
      hidden: true,
      title: boundary
    },
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
    tab === "assets" ? ["报价", "下单", "售后"] : ["物流", "产品", "售后", "报价"];
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
        placeholder: tab === "assets" ? "搜索素材名称 / 描述…" : "搜索条目标题 / 内容…",
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
        {
          "aria-disabled": "true",
          className: "uz-knowledge-btn",
          "data-runtime-boundary": "read-only local-only no formal knowledge write",
          disabled: true,
          key: "local",
          title: "read-only local-only no formal knowledge write",
          type: "button"
        },
        tab === "assets" ? "上传素材" : "新建条目"
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
        "aria-label": "编辑素材内容",
        className: "uz-knowledge-edit",
        onChange: (event: ChangeEvent<HTMLTextAreaElement>) =>
          onDraft(event.currentTarget.value),
        value: draft
      })
    : h("p", null, asset.content);
  const actions = editing
    ? h("span", null, [
        assetButton("m7-knowledge-asset-cancel", onCancel, "取消"),
        " ",
        assetButton("m7-knowledge-asset-save", onSave, "保存草稿", true)
      ])
    : assetButton("m7-knowledge-asset-edit", onEdit, "编辑内容", true);
  return h(
    "main",
    {
      "aria-label": "素材详情",
      className: "uz-knowledge-pad uz-knowledge-asset-detail",
      "data-runtime-boundary": "mock read-only local-only no formal knowledge write",
      "data-testid": "m7-knowledge-asset-detail"
    },
    [
      h(
        "section",
        {
          className: "uz-knowledge-card",
          "data-source-ref": asset.ref,
          key: "hero",
          title: `controlled source ${asset.ref}`
        },
        [
          h("h3", { key: "title" }, asset.title),
          h("p", { key: "desc" }, asset.description),
          h("div", { className: "uz-knowledge-preview", key: "preview" }, [
            h(IconSlot, { icon: FileText, key: "icon", size: "sm" }),
            ` ${asset.type}预览 · ${asset.format}`
          ])
        ]
      ),
      h("section", { className: "uz-knowledge-card", key: "content" }, [
        h("h3", { key: "heading" }, "素材内容"),
        content
      ]),
      h("div", { className: "uz-knowledge-actions", key: "actions" }, [
        assetButton("m7-knowledge-asset-delete", onDelete, "删除素材"),
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
      "data-runtime-boundary": "read-only local-only no formal knowledge write",
      "data-testid": testId,
      key: testId,
      onClick,
      title: "read-only local-only no formal knowledge write",
      type: "button"
    },
    text
  );
}

export const knowledgeStyles = `
.uz-knowledge-page{display:flex;min-height:0;height:100%;flex-direction:column;overflow:hidden;background:var(--paper);color:var(--ink-900);font-family:var(--font-body)}
.uz-knowledge-page *{box-sizing:border-box}.uz-knowledge-head{flex:none;border-bottom:1px solid var(--ink-150);background:var(--card);padding:14px 24px 0}.uz-knowledge-title{margin:0 0 12px;font-family:var(--font-display);font-size:16px;line-height:1.35}.uz-knowledge-tabs{display:flex;gap:2px;overflow-x:auto}.uz-knowledge-tab{flex:none;border:0;border-bottom:2px solid transparent;background:transparent;color:var(--ink-500);cursor:pointer;font:600 13px/1 var(--font-body);padding:10px 13px}.uz-knowledge-tab[aria-pressed=true]{border-color:var(--ink-900);color:var(--ink-900)}.uz-knowledge-runtime{display:flex;flex:none;align-items:center;gap:8px;border-bottom:1px solid var(--ink-150);background:var(--card);padding:10px 24px;color:var(--ink-700);font-size:12px;line-height:1.45}.uz-knowledge-runtime[hidden]{display:none!important}.uz-knowledge-runtime span:last-child{min-width:0}.uz-knowledge-sr-only{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;white-space:nowrap!important;clip-path:inset(50%)!important;border:0!important;padding:0!important;margin:-1px!important}.uz-knowledge-toolbar{display:flex;flex:none;align-items:center;gap:10px;border-bottom:1px solid var(--ink-150);background:var(--card);padding:10px 24px;flex-wrap:wrap}.uz-knowledge-search{width:320px;max-width:100%;border:1px solid var(--ink-150);border-radius:8px;background:var(--paper);padding:8px 10px;color:var(--ink-900);font:500 13px/1 var(--font-body)}.uz-knowledge-chip,.uz-knowledge-btn{border:1px solid var(--ink-150);border-radius:7px;background:var(--card);color:var(--ink-700);cursor:pointer;font:600 12px/1 var(--font-body);padding:7px 10px}.uz-knowledge-chip[aria-pressed=true],.uz-knowledge-btn--primary{border-color:var(--ink-900);background:var(--ink-900);color:var(--card)}.uz-knowledge-scroll{flex:1;min-height:0;overflow:auto}.uz-knowledge-pad{padding:18px 24px}.uz-knowledge-count{margin:0 0 10px;color:var(--ink-500);font-size:12px}.uz-knowledge-stage-grid{display:grid;grid-template-columns:repeat(4,minmax(156px,1fr));gap:10px;min-width:680px}.uz-knowledge-stage{border:1px solid var(--ink-150);border-radius:8px;background:var(--card);color:var(--ink-700);cursor:pointer;padding:13px;text-align:left}.uz-knowledge-stage[aria-pressed=true]{border-color:var(--ink-900);background:var(--paper);color:var(--ink-900)}.uz-knowledge-stage strong{display:block;margin-bottom:8px;color:var(--ink-900)}.uz-knowledge-mono{font-family:var(--font-data);font-size:12px}.uz-knowledge-detail{margin-top:16px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:16px}.uz-knowledge-warning{display:flex;gap:10px;margin-top:12px;border:1px solid color-mix(in srgb,var(--state-human) 40%,var(--ink-150));border-radius:8px;background:color-mix(in srgb,var(--state-human) 9%,var(--card));padding:12px;color:var(--ink-700)}.uz-knowledge-split{display:grid;grid-template-columns:minmax(0,1fr) 340px;min-height:100%}.uz-knowledge-table-wrap{overflow:auto;border:1px solid var(--ink-150);border-radius:8px;background:var(--card)}.uz-knowledge-table{width:100%;min-width:680px;border-collapse:collapse;font-size:13px}.uz-knowledge-table th{background:var(--paper);color:var(--ink-500);font-size:11px;text-align:left}.uz-knowledge-table th,.uz-knowledge-table td{border-bottom:1px solid var(--ink-075);padding:10px 12px}.uz-knowledge-row{cursor:pointer}.uz-knowledge-row:hover,.uz-knowledge-row:focus{background:var(--paper);outline:none}.uz-knowledge-side{border-left:1px solid var(--ink-150);background:var(--card);padding:18px;overflow:auto}.uz-knowledge-badge{display:inline-flex;align-items:center;border-radius:5px;padding:2px 8px;font-size:11px;font-weight:700}.uz-knowledge-badge--danger{background:color-mix(in srgb,var(--state-human) 12%,var(--card));color:var(--state-human)}.uz-knowledge-badge--info{background:color-mix(in srgb,var(--state-ai) 12%,var(--card));color:var(--state-ai)}.uz-knowledge-badge--neutral{background:var(--ink-075);color:var(--ink-700)}.uz-knowledge-badge--ok{background:color-mix(in srgb,var(--state-ok) 12%,var(--card));color:var(--state-ok)}.uz-knowledge-badge--warn{background:color-mix(in srgb,var(--state-warn) 16%,var(--card));color:var(--state-warn)}.uz-knowledge-card{border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:14px}.uz-knowledge-stack{display:grid;gap:10px}.uz-knowledge-card h3,.uz-knowledge-side h3{margin:0 0 8px;font-size:14px}.uz-knowledge-card p,.uz-knowledge-side p{margin:0;color:var(--ink-700);font-size:13px;line-height:1.55}.uz-knowledge-asset-detail{max-width:880px}.uz-knowledge-preview{display:grid;min-height:140px;place-items:center;border:1px solid var(--ink-150);border-radius:8px;background:var(--ink-075);color:var(--ink-500);font-size:12px}.uz-knowledge-edit{width:100%;min-height:150px;border:1px solid var(--ink-150);border-radius:8px;background:var(--paper);padding:10px;color:var(--ink-900);font:500 13px/1.55 var(--font-body);resize:vertical}.uz-knowledge-actions{display:flex;justify-content:space-between;gap:8px;margin-top:14px}.uz-knowledge-state{display:grid;min-height:280px;place-items:center;padding:24px;text-align:center}.uz-knowledge-state div{max-width:520px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:20px}.uz-knowledge-state h2{margin:0 0 8px;font-size:16px}.uz-knowledge-state p{margin:0;color:var(--ink-700);font-size:13px;line-height:1.55}
@media (max-width:720px){.uz-knowledge-head,.uz-knowledge-runtime,.uz-knowledge-toolbar,.uz-knowledge-pad{padding-left:12px;padding-right:12px}.uz-knowledge-split{display:block}.uz-knowledge-side{border-left:0;border-top:1px solid var(--ink-150)}.uz-knowledge-stage-grid{min-width:620px}.uz-knowledge-table{min-width:640px}.uz-knowledge-actions{flex-direction:column}.uz-knowledge-btn{width:100%}}
`;

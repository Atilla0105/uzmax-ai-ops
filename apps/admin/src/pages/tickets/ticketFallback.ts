export type TicketTabId = (typeof ticketTabs)[number]["id"];

export interface TicketRecord {
  assignee: string;
  channel: string;
  closeNote: string;
  closeResult: string | null;
  customer: string;
  customerMeta: string;
  customerRef: string;
  id: string;
  notes: TicketNote[];
  order: { id: string; meta: string } | null;
  priority: "高" | "中" | "低";
  quotes: { item: string; price: string; result: string; time: string; via: string }[];
  sla: string;
  snippet: { color: "ai" | "human" | "neutral"; text: string; who: string }[];
  status: string;
  summary: string;
  suggestion: string;
  tabs: TicketTabId[];
  timeline: {
    dot: "ai" | "human" | "ok" | "warn" | "off";
    text: string;
    time: string;
    who: string;
  }[];
  title: string;
  tone: "human" | "warn" | "ai" | "ok" | "off";
}

export interface TicketNote {
  text: string;
  time: string;
  who: string;
}

export const ticketFallbackMeta = {
  label: "6 mock tickets · ticket runtime unavailable",
  reason:
    "ticket runtime unavailable: synthetic degraded rows only, read-only product evidence and not production ticket data.",
  source: "centralized-synthetic-mock-degraded"
} as const;

export const ticketTabs = [
  { id: "unclaimed", label: "待认领" },
  { id: "mine", label: "我的" },
  { id: "sla", label: "即将超SLA" },
  { id: "reopened", label: "已重开" },
  { id: "follow", label: "今晨待跟进" }
] as const;

export const ticketTeamMembers = ["韩雪", "李航", "王敏", "王芳"] as const;
export const ticketCloseOptions = [
  "resolved 已解决",
  "转人工渠道",
  "无响应",
  "无效",
  "重复"
] as const;

export const ticketCloseStatus: Record<string, string> = {
  "resolved 已解决": "已解决",
  无响应: "无响应关闭",
  无效: "无效关闭",
  重复: "重复关闭",
  转人工渠道: "已转人工渠道"
};

export const ticketRecords: TicketRecord[] = [
  ticket("T-MOCK-1042", "mock 物流延迟投诉 · 要求退款", "Mock 客户 A", "待处理", {
    assignee: "未认领",
    priority: "高",
    sla: "mock 04:12",
    tabs: ["unclaimed", "sla"],
    tone: "human"
  }),
  ticket("T-MOCK-1039", "mock 商品破损 · 退货退款", "Mock 客户 B", "待处理", {
    assignee: "未认领",
    priority: "高",
    sla: "mock 01:48",
    tabs: ["unclaimed", "sla"],
    tone: "warn"
  }),
  ticket("T-MOCK-1051", "mock 套装报价咨询转人工", "Mock 客户 C", "处理中", {
    assignee: "韩雪",
    priority: "中",
    sla: "mock 06:30",
    tabs: ["mine", "follow"],
    tone: "warn"
  }),
  ticket("T-MOCK-1033", "mock 重复下单需合并", "Mock 客户 D", "已重开", {
    assignee: "李航",
    priority: "中",
    sla: "mock 重开",
    tabs: ["reopened", "follow"],
    tone: "ai"
  }),
  ticket("T-MOCK-1028", "mock 无响应跟进 · 第2次", "Mock 客户 E", "待处理", {
    assignee: "韩雪",
    priority: "低",
    sla: "mock —",
    tabs: ["mine", "follow"],
    tone: "off"
  }),
  {
    ...ticket("T-MOCK-1019", "mock 物流签收确认", "Mock 客户 F", "已解决", {
      assignee: "李航",
      priority: "低",
      sla: "mock 已闭",
      tabs: [],
      tone: "ok"
    }),
    closeNote: "synthetic close note: customer confirmed receipt in mock evidence.",
    closeResult: "resolved 已解决"
  }
];

export function tabCounts(records: readonly TicketRecord[]) {
  return Object.fromEntries(
    ticketTabs.map((tab) => [
      tab.id,
      records.filter((record) => inTab(record, tab.id)).length
    ])
  ) as Record<TicketTabId, number>;
}

export function inTab(ticket: TicketRecord, tab: TicketTabId) {
  if (tab === "unclaimed") return ticket.assignee === "未认领";
  if (tab === "mine") return ticket.assignee === "韩雪" && !ticket.closeResult;
  if (tab === "sla") return ticket.sla.includes("01:") || ticket.sla.includes("04:");
  if (tab === "reopened") return ticket.status === "已重开";
  return ticket.tabs.includes("follow");
}

export function nowHM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function ticket(
  id: string,
  title: string,
  customer: string,
  status: string,
  patch: Pick<TicketRecord, "assignee" | "priority" | "sla" | "tabs" | "tone">
): TicketRecord {
  return {
    ...patch,
    channel: "Telegram mock",
    closeNote: "",
    closeResult: null,
    customer,
    customerMeta: "synthetic profile · no real customer data",
    customerRef: `@mock_${id.slice(-4).toLowerCase()}`,
    id,
    notes: [],
    order: {
      id: `MOCK-ORDER-${id.slice(-4)}`,
      meta: "mock order snapshot · read-only"
    },
    quotes: [
      {
        item: "mock product bundle",
        price: "mock amount",
        result: "read-only",
        time: "mock day",
        via: "AI quote mock"
      }
    ],
    snippet: [
      {
        color: "human",
        text: "synthetic customer message requesting operator review.",
        who: "客户"
      },
      {
        color: "ai",
        text: "AI mock trace paused automatic reply and routed to human.",
        who: "AI"
      }
    ],
    status,
    summary:
      "Synthetic ticket summary shaped from the owner prototype. It is degraded/mock only and does not contain real customer or order data.",
    suggestion:
      "AI 建议处理 is displayed as read-only mock guidance. A real runtime must supply policy, SLA and order facts before operators can treat it as truth.",
    timeline: [
      { dot: "ai", text: "AI mock intake", time: "mock 09:14", who: "AI" },
      {
        dot: patch.tone === "human" ? "human" : "warn",
        text: "created synthetic ticket",
        time: "mock 09:21",
        who: "系统"
      }
    ],
    title
  };
}

export const ticketPageStyles = `
.uz-ticket-page{display:flex;flex:1;min-height:0;background:var(--paper);color:var(--ink-900);font-family:var(--font-body)}
.uz-ticket-list{display:flex;flex:none;flex-direction:column;width:380px;min-width:0;border-right:1px solid var(--ink-150);background:var(--card)}
.uz-ticket-list__head,.uz-ticket-detail__head{flex:none;border-bottom:1px solid var(--ink-150);background:var(--card)}
.uz-ticket-list__head{display:flex;align-items:center;gap:var(--s-4);height:46px;padding:0 var(--s-8)}
.uz-ticket-list__head h2,.uz-ticket-detail__title{font-family:var(--font-display);font-size:15px;line-height:1}
.uz-ticket-tabs{display:flex;gap:var(--s-2);overflow-x:auto;padding:var(--s-4) var(--s-6);border-bottom:1px solid var(--ink-075)}
.uz-ticket-tab{display:flex;flex:none;align-items:center;gap:var(--s-2);border:0;border-radius:var(--radius-md);padding:5px 10px;color:var(--ink-700);background:var(--ink-075);font:500 var(--text-sm)/1 var(--font-body);white-space:nowrap;cursor:pointer}
.uz-ticket-tab.is-active{color:var(--card);background:var(--ink-900)}
.uz-ticket-tab .mono{font-size:var(--text-2xs);opacity:.72}
.uz-ticket-rows{flex:1;min-height:0;overflow-y:auto}
.uz-ticket-row{position:relative;display:grid;width:100%;gap:var(--s-2);border:0;border-bottom:1px solid var(--ink-075);padding:12px 16px 12px 18px;background:var(--card);color:inherit;text-align:left;cursor:pointer}
.uz-ticket-row:hover,.uz-ticket-row:focus-visible,.uz-ticket-row.is-active{background:var(--paper);outline:none}
.uz-ticket-row:focus-visible,.uz-ticket-close-option:focus-visible,.uz-ticket-select:focus-visible,.uz-ticket-note input:focus-visible,.uz-ticket-close textarea:focus-visible{box-shadow:var(--shadow-focus);outline:none}
.uz-ticket-row__rail{position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--ticket-tone)}
.uz-ticket-row__top,.uz-ticket-row__meta,.uz-ticket-detail__meta,.uz-ticket-actions,.uz-ticket-note{display:flex;align-items:center;gap:var(--s-4)}
.uz-ticket-row__top strong,.uz-ticket-mono{font-family:var(--font-data);font-size:var(--text-sm)}
.uz-ticket-row__sla{margin-left:auto}
.uz-ticket-row__title{font-size:var(--text-base);font-weight:700}
.uz-ticket-row__meta{color:var(--ink-500);font-size:var(--text-xs)}
.uz-ticket-row__meta span:last-child{margin-left:auto}
.uz-ticket-detail{display:flex;flex:1;min-width:0;flex-direction:column;background:var(--paper)}
.uz-ticket-detail__head{padding:16px 24px}
.uz-ticket-detail__meta{margin-bottom:var(--s-4)}
.uz-ticket-detail__title{font-size:18px;font-weight:800}
.uz-ticket-actions{margin-left:auto}
.uz-ticket-select{height:32px;border:1px solid var(--ink-150);border-radius:var(--radius-md);padding:0 var(--s-5);color:var(--ink-700);background:var(--card);font:600 var(--text-sm)/1 var(--font-body)}
.uz-ticket-runtime{display:flex;align-items:center;gap:var(--s-4);border-bottom:1px solid var(--state-warn-border);padding:8px 24px;background:var(--state-warn-bg);color:var(--ink-700);font-size:var(--text-sm)}
.uz-ticket-body{display:flex;gap:18px;flex:1;min-height:0;overflow-y:auto;padding:18px 24px 30px}
.uz-ticket-main{display:grid;align-content:start;gap:14px;flex:1;min-width:0}
.uz-ticket-side{display:grid;align-content:start;gap:14px;flex:none;width:248px}
.uz-ticket-card{border:1px solid var(--ink-150);border-radius:10px;padding:14px 16px;background:var(--card)}
.uz-ticket-card h3{display:flex;align-items:center;gap:var(--s-3);margin:0 0 10px;color:var(--ink-300);font-size:var(--text-2xs);font-weight:800;letter-spacing:.8px;text-transform:uppercase}
.uz-ticket-card p{color:var(--ink-700);font-size:var(--text-base);line-height:1.6}
.uz-ticket-ai{border-color:var(--state-ai-border);background:var(--state-ai-bg)}
.uz-ticket-ai h3{color:var(--state-ai)}
.uz-ticket-snippet,.uz-ticket-timeline,.uz-ticket-quote,.uz-ticket-noteitem{display:grid;gap:var(--s-2);font-size:var(--text-sm)}
.uz-ticket-snippet{grid-template-columns:42px 1fr;margin-bottom:var(--s-4)}
.uz-ticket-quote{grid-template-columns:minmax(0,1fr) auto auto;align-items:center;border:1px solid var(--ink-150);border-radius:var(--radius-lg);padding:var(--s-4) var(--s-5)}
.uz-ticket-timeline{grid-template-columns:8px 1fr;padding-bottom:var(--s-6)}
.uz-ticket-dot{width:8px;height:8px;margin-top:3px;border-radius:50%;background:var(--ticket-tone)}
.uz-ticket-noteitem{border-radius:var(--radius-md);padding:var(--s-4) var(--s-5);background:var(--paper)}
.uz-ticket-note input,.uz-ticket-close textarea{box-sizing:border-box;border:1px solid var(--ink-150);border-radius:var(--radius-md);color:var(--ink-900);background:var(--card);font:var(--text-sm)/1.4 var(--font-body)}
.uz-ticket-note input{flex:1;min-width:0;padding:7px 10px}
.uz-ticket-close textarea{width:100%;min-height:64px;margin:8px 0;resize:vertical;padding:8px 10px}
.uz-ticket-close-options{display:grid;gap:var(--s-3);margin-top:var(--s-4)}
.uz-ticket-close-option{border:1px solid var(--ink-150);border-radius:var(--radius-sm);padding:6px 10px;color:var(--ink-700);background:var(--card);font:var(--text-sm)/1 var(--font-body);text-align:left;cursor:pointer}
.uz-ticket-close-option.is-picked{border-color:var(--ink-900);background:var(--ink-075)}
.uz-ticket-closed{border-color:var(--state-ok-border);background:var(--state-ok-bg)}
.uz-ticket-closed h3{color:var(--state-ok)}
.uz-ticket-muted{color:var(--ink-500);font-size:var(--text-xs)}
.uz-ticket-page .mono{font-family:var(--font-data)}
.uz-ticket-page .tone-human{--ticket-tone:var(--state-human)}.uz-ticket-page .tone-warn{--ticket-tone:var(--state-warn)}.uz-ticket-page .tone-ai{--ticket-tone:var(--state-ai)}.uz-ticket-page .tone-ok{--ticket-tone:var(--state-ok)}.uz-ticket-page .tone-off{--ticket-tone:var(--state-off)}
@media (max-width:1024px){.uz-ticket-page{flex-direction:column;overflow:auto}.uz-ticket-list{width:auto;max-height:360px;border-right:0;border-bottom:1px solid var(--ink-150)}.uz-ticket-body{flex-direction:column;overflow:visible}.uz-ticket-side{width:auto}.uz-ticket-actions{width:100%;margin-left:0;flex-wrap:wrap}.uz-ticket-detail__meta{flex-wrap:wrap}}
@media (max-width:520px){.uz-ticket-detail__head,.uz-ticket-runtime,.uz-ticket-body{padding-left:12px;padding-right:12px}.uz-ticket-quote{grid-template-columns:1fr}.uz-ticket-note{align-items:stretch;flex-direction:column}.uz-ticket-page{font-size:var(--text-base)}}
`;

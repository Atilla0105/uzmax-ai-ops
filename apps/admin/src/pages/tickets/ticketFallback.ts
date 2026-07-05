export type TicketTabId = (typeof ticketTabs)[number]["id"];

export interface TicketRecord {
  assignee: string;
  channel: string;
  closeNote: string;
  closeResult: string | null;
  customer: string;
  customerFull: string;
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

interface TicketNote {
  text: string;
  time: string;
  who: string;
}

type TicketPatch = Omit<
  TicketRecord,
  "closeNote" | "closeResult" | "customer" | "id" | "notes" | "status" | "title"
>;
type TicketQuote = TicketRecord["quotes"][number];
type TicketSnippet = TicketRecord["snippet"][number];

export const ticketFallbackMeta = {
  label: "6 tickets",
  reason: "degraded mock · read-only evidence only · not production ticket data",
  source: "prototype-shaped-synthetic-mock-degraded"
} as const;

export const ticketTabs = [
  { id: "unclaimed", label: "待认领" },
  { id: "mine", label: "我的" },
  { id: "sla", label: "即将超SLA" },
  { id: "reopened", label: "已重开" },
  { id: "follow", label: "今晨待跟进" }
] as const;

export const ticketTeamMembers = ["韩雪", "李航", "王敏", "王芳"] as const;
export const ticketCloseOptions: readonly string[] =
  "resolved 已解决|转人工渠道|无响应|无效|重复".split("|");

export const ticketCloseStatus: Record<string, string> = {
  "resolved 已解决": "已解决",
  无响应: "无响应关闭",
  无效: "无效关闭",
  重复: "重复关闭",
  转人工渠道: "已转人工渠道"
};

export const ticketRecords: TicketRecord[] = [
  ticket("T-1042", "物流延迟投诉 · 要求退款", "Dilnoza R.", "待处理", {
    assignee: "未认领",
    channel: "Telegram",
    customerFull: "Dilnoza Rashidova",
    customerMeta: "VIP · 4 单 · ¥1,026",
    customerRef: "@dilnoza_r",
    priority: "高",
    sla: "04:12",
    order: { id: "UZ-20413", meta: "¥268 · 运输中 · 塔什干分拣" },
    quotes: [quote("护肤入门套装", "¥268", "已下单", "06-25")],
    snippet: [
      message("human", "Pulni qaytarib bering, men kutmoqchi emasman.", "客户"),
      message("ai", "已识别退款意图，红线拦截自动回复，转人工。", "AI")
    ],
    summary:
      "客户 Dilnoza 5 天前下单（UZ-20413），尚未收到，已两次催促，最新一条提出退款诉求，触发红线后 AI 暂停自动回复并转人工。",
    suggestion:
      "核实物流当前在塔什干分拣中心（预计 1-2 天）。建议先安抚并提供两个方案：①继续等待并赠优惠券；②取消未签收订单全额退款。退款金额 ¥268 在自动审批额度内。",
    tabs: ["unclaimed", "sla"],
    timeline: [
      { dot: "ai", text: "AI 接入并尝试物流查询", time: "09:14", who: "AI" },
      { dot: "human", text: "触发红线（退款）· 转人工", time: "09:21", who: "系统" },
      { dot: "warn", text: "生成工单并标记高优先级", time: "09:21", who: "系统" }
    ],
    tone: "human"
  }),
  ticket("T-1039", "商品破损 · 退货退款", "Иван П.", "待处理", {
    assignee: "未认领",
    channel: "Telegram",
    customerFull: "Иван Петров",
    customerMeta: "首单客户",
    customerRef: "@ivan_p",
    priority: "高",
    sla: "01:48",
    order: { id: "UZ-20408", meta: "¥320 · 退款中" },
    quotes: [],
    snippet: [
      message("human", "Товар пришёл разбитым, хочу вернуть деньги.", "客户"),
      message("ai", "已识别退款意图，触发红线，转人工。", "AI")
    ],
    summary: "客户 Иван 收到商品破损，要求退货退款；首次售后，需谨慎处理避免流失。",
    suggestion:
      "建议直接批准退货退款并优先安排换新，避免流失新客；金额 ¥320 在自动审批额度内。",
    tabs: ["unclaimed", "sla"],
    timeline: [
      { dot: "ai", text: "AI 接入", time: "11:02", who: "AI" },
      { dot: "human", text: "触发红线（退款）· 转人工", time: "11:05", who: "系统" }
    ],
    tone: "warn"
  }),
  ticket("T-1051", "套装报价咨询转人工", "Азиз К.", "处理中", {
    assignee: "韩雪",
    channel: "Telegram",
    customerFull: "Азиз Каримов",
    customerMeta: "新客",
    customerRef: "@aziz_k",
    priority: "中",
    sla: "06:30",
    order: { id: "UZ-20401", meta: "¥198 · 待支付" },
    quotes: [quote("护肤入门套装", "¥268", "待支付", "06-28")],
    snippet: [
      message("neutral", "Chegirma bera olasizmi?", "客户"),
      message("ai", "超出自动折扣权限，转人工跟进。", "AI")
    ],
    summary: "客户多次询价套装折扣，尚未确认订单；AI 未获得折扣授权，转人工跟进。",
    suggestion: "可提供 5% 满减券促成下单，报价 ¥268 → ¥255，避免流失价格敏感新客。",
    tabs: ["mine", "follow"],
    timeline: [
      { dot: "ai", text: "AI 报价", time: "06-28 14:02", who: "AI" },
      { dot: "warn", text: "转人工跟进折扣申请", time: "06-28 14:05", who: "系统" }
    ],
    tone: "warn"
  }),
  ticket("T-1033", "重复下单需合并", "Madina S.", "已重开", {
    assignee: "李航",
    channel: "Telegram",
    customerFull: "Madina Saidova",
    customerMeta: "复购客户",
    customerRef: "@madina_s",
    priority: "中",
    sla: "重开",
    order: { id: "UZ-20377", meta: "¥232 · 已完成" },
    quotes: [],
    snippet: [message("neutral", "Men ikki marta buyurtma berib qo‘ydim.", "客户")],
    summary:
      "客户误重复下单两笔相同商品，要求合并为一笔并退还多余款项；此前处理后客户反馈未生效，工单已重开。",
    suggestion:
      "确认物流未发出的一笔可直接取消退款；已发出的一笔正常收货，无需额外补偿。",
    tabs: ["reopened", "follow"],
    timeline: [
      { dot: "ok", text: "首次处理完成", time: "06-27 10:00", who: "李航" },
      { dot: "ai", text: "客户反馈未处理 · 工单重开", time: "06-29 08:40", who: "系统" }
    ],
    tone: "ai"
  }),
  ticket("T-1028", "无响应跟进 · 第2次", "Сергей Л.", "待处理", {
    assignee: "韩雪",
    channel: "Telegram",
    customerFull: "Сергей Лебедев",
    customerMeta: "低活跃",
    customerRef: "@sergey_l",
    priority: "低",
    sla: "—",
    order: null,
    quotes: [],
    snippet: [message("ai", "已发送跟进消息，等待回复。", "AI")],
    summary: "客户咨询后未再回复，已跟进一次仍无响应。",
    suggestion: "今晨可再跟进一次；若连续 3 次无响应建议以「无响应」关闭。",
    tabs: ["mine", "follow"],
    timeline: [
      { dot: "off", text: "第一次跟进无回复", time: "06-28", who: "AI" },
      { dot: "off", text: "第二次跟进已发送", time: "06-29 08:00", who: "韩雪" }
    ],
    tone: "off"
  }),
  {
    ...ticket("T-1019", "物流签收确认", "Олег В.", "已解决", {
      assignee: "李航",
      channel: "Telegram",
      customerFull: "Олег Волков",
      customerMeta: "稳定客户",
      customerRef: "@oleg_v",
      priority: "低",
      sla: "已闭",
      order: { id: "UZ-20377", meta: "¥232 · 已完成" },
      quotes: [],
      snippet: [message("neutral", "Получил, спасибо!", "客户")],
      summary: "客户确认已签收商品，问题解决。",
      suggestion: "—",
      tabs: [],
      timeline: [
        { dot: "ok", text: "客户确认签收", time: "06-25 16:00", who: "客户" },
        {
          dot: "ok",
          text: "工单关闭 · 结果：resolved 已解决",
          time: "06-25 16:05",
          who: "李航"
        }
      ],
      tone: "ok"
    }),
    closeNote: "客户已确认签收，无需进一步处理。",
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
  patch: TicketPatch
): TicketRecord {
  return {
    ...patch,
    closeNote: "",
    closeResult: null,
    customer,
    id,
    notes: [],
    status,
    title
  };
}

function quote(
  item: string,
  price: string,
  result: string,
  time: string,
  via = "AI 报价"
): TicketQuote {
  return { item, price, result, time, via };
}

function message(
  color: TicketSnippet["color"],
  text: string,
  who: string
): TicketSnippet {
  return { color, text, who };
}

export const ticketPageStyles = `.uz-ticket-page{display:flex;flex:1;min-height:0;background:var(--paper);color:var(--ink-900);font-family:var(--font-body)}.uz-ticket-list{display:flex;flex:none;flex-direction:column;width:380px;min-width:0;border-right:1px solid var(--ink-150);background:var(--card)}.uz-ticket-list__head,.uz-ticket-detail__head{flex:none;border-bottom:1px solid var(--ink-150);background:var(--card)}.uz-ticket-list__head{display:flex;align-items:center;gap:var(--s-4);height:46px;padding:0 var(--s-8)}.uz-ticket-list__head h2,.uz-ticket-detail__title{font-family:var(--font-display);font-size:15px;line-height:1}.uz-ticket-list__count{color:var(--ink-500);font:600 var(--text-xs)/1 var(--font-data)}.uz-ticket-tabs{display:flex;gap:var(--s-2);overflow-x:auto;padding:var(--s-4) var(--s-6);border-bottom:1px solid var(--ink-075)}.uz-ticket-tab{display:flex;flex:none;align-items:center;gap:var(--s-2);border:0;border-radius:var(--radius-md);padding:5px 10px;color:var(--ink-700);background:var(--ink-075);font:500 var(--text-sm)/1 var(--font-body);white-space:nowrap;cursor:pointer}.uz-ticket-tab.is-active{color:var(--card);background:var(--ink-900)}.uz-ticket-tab .mono{font-size:var(--text-2xs);opacity:.72}.uz-ticket-rows{flex:1;min-height:0;overflow-y:auto}.uz-ticket-row{position:relative;display:grid;width:100%;gap:var(--s-2);border:0;border-bottom:1px solid var(--ink-075);padding:12px 16px 12px 18px;background:var(--card);color:inherit;text-align:left;cursor:pointer}.uz-ticket-row:hover,.uz-ticket-row:focus-visible,.uz-ticket-row.is-active{background:var(--paper);outline:none}.uz-ticket-row:focus-visible,.uz-ticket-close-option:focus-visible,.uz-ticket-select:focus-visible,.uz-ticket-note input:focus-visible,.uz-ticket-close textarea:focus-visible{box-shadow:var(--shadow-focus);outline:none}.uz-ticket-row__rail{position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--ticket-tone)}.uz-ticket-row__top,.uz-ticket-row__meta,.uz-ticket-detail__meta,.uz-ticket-actions,.uz-ticket-note{display:flex;align-items:center;gap:var(--s-4)}.uz-ticket-row__top strong,.uz-ticket-mono{font-family:var(--font-data);font-size:var(--text-sm)}.uz-ticket-row__sla{margin-left:auto}.uz-ticket-row__title{font-size:var(--text-base);font-weight:700}.uz-ticket-row__meta{color:var(--ink-500);font-size:var(--text-xs)}.uz-ticket-row__meta span:last-child{margin-left:auto}.uz-ticket-detail{display:flex;flex:1;min-width:0;flex-direction:column;background:var(--paper)}.uz-ticket-detail__head{padding:16px 24px}.uz-ticket-detail__meta{margin-bottom:var(--s-4)}.uz-ticket-detail__title{font-size:18px;font-weight:800}.uz-ticket-actions{margin-left:auto}.uz-ticket-select{height:32px;border:1px solid var(--ink-150);border-radius:var(--radius-md);padding:0 var(--s-5);color:var(--ink-700);background:var(--card);font:600 var(--text-sm)/1 var(--font-body)}.uz-ticket-runtime{display:flex;align-items:center;gap:var(--s-2);border-bottom:1px solid var(--ink-075);padding:5px 24px;background:var(--card);color:var(--ink-500);font-size:var(--text-xs)}.uz-ticket-runtime[hidden]{display:none}.uz-ticket-runtime .uz-status-badge{padding:1px 6px;font-size:10px}.uz-ticket-body{display:flex;gap:18px;flex:1;min-height:0;overflow-y:auto;padding:18px 24px 30px}.uz-ticket-main{display:grid;align-content:start;gap:14px;flex:1;min-width:0}.uz-ticket-side{display:grid;align-content:start;gap:14px;flex:none;width:248px}.uz-ticket-card{border:1px solid var(--ink-150);border-radius:10px;padding:14px 16px;background:var(--card)}.uz-ticket-card h3{display:flex;align-items:center;gap:var(--s-3);margin:0 0 10px;color:var(--ink-300);font-size:var(--text-2xs);font-weight:800;letter-spacing:.8px;text-transform:uppercase}.uz-ticket-card p{color:var(--ink-700);font-size:var(--text-base);line-height:1.6}.uz-ticket-ai{border-color:var(--state-ai-border);background:var(--state-ai-bg)}.uz-ticket-ai h3{color:var(--state-ai)}.uz-ticket-snippet,.uz-ticket-timeline,.uz-ticket-quote,.uz-ticket-noteitem{display:grid;gap:var(--s-2);font-size:var(--text-sm)}.uz-ticket-snippet{grid-template-columns:42px 1fr;margin-bottom:var(--s-4)}.uz-ticket-snippet .tone-human{color:var(--state-human)}.uz-ticket-snippet .tone-ai{color:var(--state-ai)}.uz-ticket-snippet .tone-neutral{color:var(--ink-700)}.uz-ticket-quote{grid-template-columns:minmax(0,1fr) auto auto;align-items:center;border:1px solid var(--ink-150);border-radius:var(--radius-lg);padding:var(--s-4) var(--s-5)}.uz-ticket-timeline{grid-template-columns:8px 1fr;padding-bottom:var(--s-6)}.uz-ticket-dot{width:8px;height:8px;margin-top:3px;border-radius:50%;background:var(--ticket-tone)}.uz-ticket-noteitem{border-radius:var(--radius-md);padding:var(--s-4) var(--s-5);background:var(--paper)}.uz-ticket-note input,.uz-ticket-close textarea{box-sizing:border-box;border:1px solid var(--ink-150);border-radius:var(--radius-md);color:var(--ink-900);background:var(--card);font:var(--text-sm)/1.4 var(--font-body)}.uz-ticket-note input{flex:1;min-width:0;padding:7px 10px}.uz-ticket-close textarea{width:100%;min-height:64px;margin:8px 0;resize:vertical;padding:8px 10px}.uz-ticket-close-options{display:grid;gap:var(--s-3);margin-top:var(--s-4)}.uz-ticket-close-option{border:1px solid var(--ink-150);border-radius:var(--radius-sm);padding:6px 10px;color:var(--ink-700);background:var(--card);font:var(--text-sm)/1 var(--font-body);text-align:left;cursor:pointer}.uz-ticket-close-option.is-picked{border-color:var(--ink-900);background:var(--ink-075)}.uz-ticket-actions .uz-ticket-claim:not(:disabled){border-color:var(--ink-900);background:var(--ink-900);color:var(--card)}.uz-ticket-actions .uz-ticket-claim:disabled{border-color:var(--ink-150);background:var(--ink-075);color:var(--ink-500);opacity:1}.uz-ticket-closed{border-color:var(--state-ok-border);background:var(--state-ok-bg)}.uz-ticket-closed h3{color:var(--state-ok)}.uz-ticket-muted{color:var(--ink-500);font-size:var(--text-xs)}.uz-ticket-page .mono{font-family:var(--font-data)}.uz-ticket-page .tone-human{--ticket-tone:var(--state-human)}.uz-ticket-page .tone-warn{--ticket-tone:var(--state-warn)}.uz-ticket-page .tone-ai{--ticket-tone:var(--state-ai)}.uz-ticket-page .tone-ok{--ticket-tone:var(--state-ok)}.uz-ticket-page .tone-off{--ticket-tone:var(--state-off)}@media (max-width:1024px){.uz-ticket-page{flex-direction:column;overflow:auto}.uz-ticket-list{width:auto;max-height:360px;border-right:0;border-bottom:1px solid var(--ink-150)}.uz-ticket-body{flex-direction:column;overflow:visible}.uz-ticket-side{width:auto}.uz-ticket-actions{width:100%;margin-left:0;flex-wrap:wrap}.uz-ticket-detail__meta{flex-wrap:wrap}}@media (max-width:520px){.uz-ticket-detail__head,.uz-ticket-runtime,.uz-ticket-body{padding-left:12px;padding-right:12px}.uz-ticket-quote{grid-template-columns:1fr}.uz-ticket-note{align-items:stretch;flex-direction:column}.uz-ticket-page{font-size:var(--text-base)}}`;

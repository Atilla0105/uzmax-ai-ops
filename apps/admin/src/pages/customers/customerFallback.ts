import fallbackData from "./customerFallback.json";

export type CustomerFlagKey = "blocked" | "open" | "order" | "quote" | "unreachable";
export type CustomerTabId = "ctag" | "field" | "list" | "search" | "stag";

export interface CustomerRecord {
  blocked: boolean;
  channel: string;
  conv: string;
  created: string;
  dual: CustomerTimelineItem[];
  fields: Record<string, string>;
  handle: string;
  history: CustomerHistory[];
  id: string;
  initial: string;
  language: string;
  notes: CustomerNote[];
  openIssue: string;
  openTone: "danger" | "none" | "warn";
  orderSnapshots: CustomerOrderSnapshot[];
  orders: string;
  profile: string;
  quotes: CustomerQuote[];
  script: string;
  spend: string;
  stage: string;
  tags: string[];
  tickets: CustomerTicket[];
  unreachable: boolean;
}

export interface CustomerTag {
  count: string;
  desc: string;
  id: string;
  name: string;
}

export interface CustomerField {
  count: string;
  created: string;
  id: string;
  name: string;
  spec: string;
  type: "日期" | "枚举" | "数字" | "文本";
}

interface CustomerHistory {
  channel: string;
  member: string;
  tags: string[];
  time: string;
  title: string;
}

interface CustomerNote {
  text: string;
  time: string;
  who: string;
}

interface CustomerOrderSnapshot {
  amount: string;
  id: string;
  item: string;
  status: string;
  tone: "danger" | "info" | "ok" | "warn";
}

interface CustomerQuote {
  item: string;
  price: string;
  result: string;
  time: string;
  via: string;
}

interface CustomerTicket {
  id: string;
  status: string;
  title: string;
  tone: "danger" | "ok" | "warn";
}

interface CustomerTimelineItem {
  note: string;
  stage: string;
  time: string;
  via: string;
}

export const customerFallbackMeta = {
  boundary:
    "customer assets runtime unavailable: centralized synthetic mock/degraded/read-only fallback only; no production customer data; no runtime write; no DB/API closure.",
  label: "客户资产快照",
  reason:
    "客户资产以当前会话、订单快照与标签字段线索展示；身份治理操作需权限与审计闭环。",
  source: "centralized-synthetic-mock-degraded"
} as const;

const fallback = fallbackData as CustomerFallbackData;

export const conversationRows = fallback.conversationRows;
export const conversationTags = fallback.conversationTags;
export const customerFields = fallback.customerFields;
export const customerFlagDefs = fallback.flagDefs;
export const customerRecords = fallback.customerRecords;
export const customerTabs = fallback.customerTabs;
export const customerTags = fallback.customerTags;

export function matchesCustomerFilter(
  record: CustomerRecord,
  input: {
    flags: Partial<Record<CustomerFlagKey, boolean>>;
    lang: string;
    query: string;
    script: string;
    stage: string;
  }
) {
  const query = input.query.trim().toLowerCase();
  const queryMatches =
    !query ||
    [record.id, record.initial, record.handle, record.profile].some((value) =>
      value.toLowerCase().includes(query)
    );
  return (
    queryMatches &&
    selectMatches(record.language, input.lang) &&
    selectMatches(record.script, input.script) &&
    selectMatches(record.stage, input.stage) &&
    activeFlagChecks(record, input.flags).every(Boolean)
  );
}

function selectMatches(value: string, filter: string) {
  return filter === "all" || value === filter;
}

function activeFlagChecks(
  record: CustomerRecord,
  flags: Partial<Record<CustomerFlagKey, boolean>>
) {
  return [
    !flags.open || record.openIssue !== "—",
    !flags.order || record.orders !== "0",
    !flags.quote || record.quotes.length > 0,
    !flags.blocked || record.blocked,
    !flags.unreachable || record.unreachable
  ];
}

export function nowCustomerMinute() {
  const date = new Date();
  return `今天 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

interface CustomerFallbackData {
  conversationRows: Array<{
    channel: string;
    customer: string;
    id: string;
    member: string;
    summary: string;
    tags: string[];
    time: string;
  }>;
  conversationTags: CustomerTag[];
  customerFields: CustomerField[];
  customerRecords: CustomerRecord[];
  customerTabs: Array<{
    id: "ctag" | "field" | "list" | "search" | "stag";
    label: string;
  }>;
  customerTags: CustomerTag[];
  flagDefs: Array<{ key: CustomerFlagKey; label: string }>;
}

export const customerPageStyles = `
.uz-customer-page{display:flex;flex:1;min-height:0;flex-direction:column;background:var(--paper);color:var(--ink-900);font-family:var(--font-body)}
.uz-customer-head{flex:none;border-bottom:1px solid var(--ink-150);padding:14px 24px 0;background:var(--card)}
.uz-customer-head__row,.uz-customer-title,.uz-customer-tools,.uz-customer-tabs,.uz-customer-filter,.uz-customer-runtime,.uz-customer-tags,.uz-customer-actions,.uz-customer-note{display:flex;align-items:center;gap:var(--s-4)}
.uz-customer-head__row{margin-bottom:12px}.uz-customer-title{min-width:0}.uz-customer-title h2{margin:0;font:700 var(--text-title)/1.2 var(--font-display)}.uz-customer-title__crumb{color:var(--ink-500);font-size:var(--text-sm)}.uz-customer-tools{margin-left:auto}
.uz-customer-back,.uz-customer-tab,.uz-customer-chip,.uz-customer-row,.uz-customer-tag-button,.uz-customer-close{cursor:pointer}
.uz-customer-back{border:1px solid var(--ink-150);border-radius:7px;padding:4px 9px;color:var(--ink-700);background:var(--card);font:700 var(--text-sm)/1 var(--font-body)}
.uz-customer-tabs{gap:2px}.uz-customer-tab{border:0;border-bottom:2px solid transparent;padding:9px 13px;color:var(--ink-500);background:transparent;font:600 var(--text-base)/1 var(--font-body)}.uz-customer-tab.is-active{border-color:var(--ink-900);color:var(--ink-900)}
.uz-customer-runtime{border-bottom:1px solid var(--state-warn-border);padding:8px 24px;background:var(--state-warn-bg);color:var(--ink-700);font-size:var(--text-sm)}
.uz-customer-runtime>span:last-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.uz-customer-filter{flex:none;flex-wrap:wrap;border-bottom:1px solid var(--ink-150);padding:12px 24px;background:var(--paper)}
.uz-customer-select,.uz-customer-input{box-sizing:border-box;border:1px solid var(--ink-150);border-radius:7px;color:var(--ink-900);background:var(--card);font:var(--text-sm)/1.4 var(--font-body)}
.uz-customer-select{height:31px;padding:0 9px}.uz-customer-input{height:32px;padding:0 11px}.uz-customer-search{width:300px}.uz-customer-divider{width:1px;height:20px;background:var(--ink-150)}
.uz-customer-chip{border:1px solid var(--ink-150);border-radius:var(--radius-pill);padding:5px 11px;color:var(--ink-700);background:var(--card);font:600 var(--text-sm)/1 var(--font-body)}.uz-customer-chip[aria-pressed=true]{border-color:var(--ink-900);color:var(--card);background:var(--ink-900)}
.uz-customer-list,.uz-customer-tabpane,.uz-customer-detail{flex:1;min-height:0;overflow:auto;padding:14px 24px 24px;background:var(--paper)}
.uz-customer-count{margin-bottom:10px;color:var(--ink-500);font-size:var(--text-sm)}
.uz-customer-table{overflow:auto;border:1px solid var(--ink-150);border-radius:10px;background:var(--card)}.uz-customer-table table{width:100%;min-width:980px;border-collapse:collapse}.uz-customer-table th{border-bottom:1px solid var(--ink-150);padding:10px 14px;background:var(--paper);color:var(--ink-500);font:700 11px/1.2 var(--font-body);text-align:left;white-space:nowrap}.uz-customer-table td{border-bottom:1px solid var(--ink-075);padding:11px 14px;font-size:13px;vertical-align:middle;white-space:nowrap}.uz-customer-row{background:transparent}.uz-customer-row:hover,.uz-customer-row:focus-visible{background:var(--paper);outline:0}.uz-customer-person{display:flex;align-items:center;gap:9px}.uz-customer-avatar{display:grid;place-items:center;flex:none;width:28px;height:28px;border-radius:50%;color:var(--card);background:var(--ink-900);font-weight:800}.uz-customer-name{display:flex;align-items:center;gap:6px;font-weight:700}.uz-customer-mono{font-family:var(--font-data)}.uz-customer-muted{color:var(--ink-500);font-size:var(--text-xs)}.uz-customer-tags{flex-wrap:wrap;gap:4px}.uz-customer-tag{border-radius:var(--radius-pill);padding:2px 7px;color:var(--ink-700);background:var(--ink-075);font-size:10px}.uz-customer-tag.is-solid{color:var(--card)}.uz-customer-tag.is-info{background:var(--state-ai)}.uz-customer-tag.is-danger{background:var(--state-human)}.uz-customer-tag.is-warn{background:var(--state-warn)}.uz-customer-tag.is-ok{background:var(--state-ok)}
.uz-customer-detail{padding-top:20px}.uz-customer-identity{display:flex;gap:16px;margin-bottom:16px;border:1px solid var(--ink-150);border-radius:12px;padding:18px 20px;background:var(--card)}.uz-customer-identity .uz-customer-avatar{width:52px;height:52px;font-size:20px}.uz-customer-identity__main{flex:1;min-width:0}.uz-customer-identity__top{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:5px}.uz-customer-identity__top strong{font:700 19px/1.2 var(--font-display)}
.uz-customer-detail-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:16px;align-items:start}.uz-customer-main,.uz-customer-side{display:grid;align-content:start;gap:16px;min-width:0}.uz-customer-two{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.uz-customer-card{border:1px solid var(--ink-150);border-radius:12px;padding:16px 18px;background:var(--card)}.uz-customer-card h3{margin:0 0 11px;font:800 var(--text-sm)/1.2 var(--font-body);color:var(--ink-900)}.uz-customer-card.is-warn{border-color:var(--state-warn-border);background:var(--state-warn-bg)}.uz-customer-card p{color:var(--ink-700);font-size:var(--text-base);line-height:1.65}.uz-customer-stats{display:flex;flex-wrap:wrap;gap:24px}.uz-customer-stat span{display:block;color:var(--ink-500);font-size:10px}.uz-customer-stat strong{font:700 var(--text-base)/1.4 var(--font-data)}
.uz-customer-stack{display:grid;gap:8px}.uz-customer-item{display:grid;gap:3px;border:1px solid var(--ink-150);border-radius:8px;padding:9px 11px;background:var(--card)}.uz-customer-item__row{display:flex;align-items:center;gap:8px}.uz-customer-item__row strong{flex:1;min-width:0}.uz-customer-field{display:grid;gap:5px}.uz-customer-field label{color:var(--ink-700);font-weight:700;font-size:var(--text-sm)}
.uz-customer-note input,.uz-customer-field input{min-width:0;border:1px solid var(--ink-150);border-radius:8px;padding:8px 10px;color:var(--ink-900);background:var(--paper);font:var(--text-sm)/1.4 var(--font-body)}.uz-customer-note input{flex:1}.uz-customer-tag-picker{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;border-top:1px solid var(--ink-075);padding-top:10px}.uz-customer-tag-button{border:1px solid var(--ink-150);border-radius:var(--radius-pill);padding:3px 9px;background:var(--paper);color:var(--ink-700);font:600 var(--text-sm)/1 var(--font-body)}
.uz-customer-table-action{border:0;color:var(--state-ai);background:transparent;font-weight:800;cursor:pointer}
.uz-customer-page button:focus-visible,.uz-customer-page input:focus-visible,.uz-customer-page select:focus-visible{outline:0;box-shadow:var(--shadow-focus)}
.uz-customer-empty{display:grid;place-items:center;min-height:120px;color:var(--ink-500);font-size:var(--text-sm)}
@media(max-width:1024px){.uz-customer-head{padding:12px 12px 0}.uz-customer-head__row,.uz-customer-title,.uz-customer-tools{align-items:flex-start;flex-wrap:wrap}.uz-customer-tools{width:100%;margin-left:0}.uz-customer-search{width:100%}.uz-customer-runtime{align-items:flex-start;padding:8px 12px}.uz-customer-runtime>span:last-child{white-space:normal}.uz-customer-filter,.uz-customer-list,.uz-customer-tabpane,.uz-customer-detail{padding-left:12px;padding-right:12px}.uz-customer-detail-grid,.uz-customer-two{grid-template-columns:1fr}.uz-customer-identity{flex-direction:column}.uz-customer-actions{flex-wrap:wrap}.uz-customer-table table{min-width:900px}}
@media(max-width:360px){.uz-customer-page{min-width:0}.uz-customer-tabs{overflow-x:auto}.uz-customer-tab{flex:none}.uz-customer-filter{align-items:stretch}.uz-customer-select,.uz-customer-chip,.uz-customer-tools .uz-button,.uz-customer-note .uz-button{width:100%}.uz-customer-divider{display:none}.uz-customer-note{align-items:stretch;flex-direction:column}.uz-customer-list,.uz-customer-tabpane,.uz-customer-detail{overflow-x:hidden}.uz-customer-table{overflow-x:auto}.uz-customer-identity{padding:14px}.uz-customer-card{padding:14px}}
`;

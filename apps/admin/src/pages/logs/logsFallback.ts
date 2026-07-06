export type TenantLogViewState =
  | "degraded"
  | "empty"
  | "error"
  | "loading"
  | "permission";
export type TenantLogTab = "login" | "online" | "op";

interface LogTabDef {
  id: TenantLogTab;
  label: string;
}

interface BaseLogRow {
  cells: string[];
  id: string;
  summary: string;
}

export interface TenantLogRow extends BaseLogRow {
  detailTarget?: string;
}

export const tenantLogTabs: readonly LogTabDef[] = [
  { id: "login", label: "登录日志" },
  { id: "online", label: "在线日志" },
  { id: "op", label: "操作日志" }
] as const;

export const tenantLogRuntimeLabels =
  "degraded|mock|read-only|browser-local only|synthetic tenant log rows|no production audit/log export|no file written|no audit/log runtime call|no real tenant/action navigation".split(
    "|"
  );

export const tenantLogMeta = {
  descriptor: "租户级 · mock/degraded · read-only",
  runtime: tenantLogRuntimeLabels.join(" · "),
  source: "centralized-synthetic-owner-fixture",
  title: "日志"
} as const;

export const tenantLogColumns: Record<TenantLogTab, string[]> = {
  login: ["时间", "成员", "IP", "设备", "结果"],
  online: ["时间", "成员", "事件", "前值", "后值"],
  op: ["时间", "操作人", "模块", "动作", "对象", "详情"]
};

export const tenantLogRows: Record<TenantLogTab, TenantLogRow[]> = {
  login: [
    row("login-1", ["今天 08:12", "韩雪", "198.51.100.44", "Chrome · macOS", "成功"]),
    row("login-2", ["今天 09:00", "李航", "203.0.113.10", "Chrome · Windows", "成功"]),
    row("login-3", ["今天 10:30", "王敏", "192.0.2.9", "Safari · iOS", "成功"]),
    row("login-4", [
      "昨天 22:14",
      "李航",
      "203.0.113.22",
      "Chrome · Windows",
      "失败 · 密码错误"
    ])
  ],
  online: [
    row("online-1", ["今天 08:12", "韩雪", "上线", "离线", "在线"]),
    row("online-2", ["今天 12:30", "王敏", "离开", "在线", "离开"]),
    row("online-3", ["今天 09:00", "李航", "上线", "离线", "在线"]),
    row("online-4", ["今天 13:05", "韩雪", "接待上限调整", "6", "8"])
  ],
  op: [
    row(
      "op-1",
      ["今天 10:42", "韩雪", "配置", "模型路由", "route v17", "查看版本"],
      "config"
    ),
    row(
      "op-2",
      ["今天 09:21", "系统", "对话", "红线拦截", "#c1", "跳转会话"],
      "conversations"
    ),
    row(
      "op-3",
      ["今天 09:21", "系统", "工单", "自动创建", "#T-1042", "跳转工单"],
      "tickets"
    ),
    row(
      "op-4",
      ["今天 08:55", "李航", "确认队列", "通过候选", "q-知识#88", "跳转评测"],
      "eval"
    ),
    row(
      "op-5",
      ["今天 08:30", "王敏", "知识", "编辑条目", "物流时效 v4", "查看 diff"],
      "knowledge"
    ),
    row(
      "op-6",
      ["昨天", "韩雪", "AI 成员", "熔断恢复", "夜间值守", "查看记录"],
      "agents"
    )
  ]
};

function row(id: string, cells: string[], detailTarget?: string): TenantLogRow {
  return { cells, detailTarget, id, summary: cells.join(" ") };
}

export function readTenantLogViewState(): TenantLogViewState {
  const params = new URLSearchParams(location.search);
  const state = params.get("m7LogsState") ?? params.get("state");
  return ["degraded", "empty", "error", "loading", "permission"].includes(state ?? "")
    ? (state as TenantLogViewState)
    : "degraded";
}

export function filterTenantLogRows(tab: TenantLogTab, search: string) {
  const query = search.trim().toLowerCase();
  const rows = tenantLogRows[tab] ?? tenantLogRows.op;
  if (!query) return rows;
  return rows.filter((item) => item.summary.toLowerCase().includes(query));
}

export function tenantLogSubtitle(tab: TenantLogTab, count: number) {
  const label = tenantLogTabs.find((item) => item.id === tab)?.label ?? "操作日志";
  return `${count} 条 mock · ${label}预览 · browser-local only`;
}

export function tenantLogDetailToast(row: TenantLogRow) {
  const [time, who, module, action, target] = row.cells;
  return `browser-local only: ${time} / ${who} / ${module} / ${action} / ${target} detail preview; no real tenant/action navigation, no audit/log runtime call.`;
}

export const tenantLogStyles = `.uz-tlog-page{display:flex;height:100%;min-height:0;flex-direction:column;overflow:hidden;background:var(--paper);color:var(--ink-900);font-family:var(--font-body)}.uz-tlog-page *{box-sizing:border-box}.uz-tlog-head{flex:none;border-bottom:1px solid var(--ink-150);background:var(--card);padding:14px 24px 0}.uz-tlog-head-row{display:flex;align-items:center;gap:12px;min-width:0;margin-bottom:12px}.uz-tlog-title{margin:0;font:800 16px/1.35 var(--font-display)}.uz-tlog-subtitle,.uz-tlog-muted{color:var(--ink-500);font-size:12px;line-height:1.45}.uz-tlog-search{margin-left:auto;display:flex;width:260px;height:32px;align-items:center;gap:7px;border:1px solid var(--ink-150);border-radius:7px;background:var(--paper);color:var(--ink-500);padding:0 11px}.uz-tlog-search span:first-child{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.uz-tlog-search input{min-width:0;width:100%;border:0;outline:0;background:transparent;color:var(--ink-900);font:500 12px/1 var(--font-body)}.uz-tlog-search input::placeholder{color:var(--ink-700)}.uz-tlog-tabs{display:flex;gap:2px;overflow:auto}.uz-tlog-tab,.uz-tlog-detail{display:inline-flex;align-items:center;justify-content:center;border:0;background:transparent;cursor:pointer;font-family:var(--font-body)}.uz-tlog-tab{min-height:36px;border-bottom:2px solid transparent;color:var(--ink-500);font-size:13px;font-weight:700;padding:0 13px;white-space:nowrap}.uz-tlog-tab[aria-pressed="true"]{border-bottom-color:var(--ink-900);color:var(--ink-900);font-weight:800}.uz-tlog-search:focus-within,.uz-tlog-tab:focus-visible,.uz-tlog-detail:focus-visible{outline:0;box-shadow:var(--shadow-focus)}.uz-tlog-note,.uz-tlog-toast{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--ink-150);background:var(--card);padding:10px 24px;color:var(--ink-700);font-size:12px;line-height:1.45}.uz-tlog-note strong{border-radius:5px;background:var(--state-warn-bg);color:var(--state-warn);font-weight:800;padding:2px 8px}.uz-tlog-toast{position:relative;z-index:var(--z-toast);border-bottom-color:var(--state-ok-border);background:var(--state-ok-bg);color:var(--state-ok);font-weight:800}.uz-tlog-scroll{flex:1;min-height:0;overflow:auto;padding:18px 24px 24px}.uz-tlog-panel{overflow:hidden;border:1px solid var(--ink-150);border-radius:10px;background:var(--card)}.uz-tlog-table-wrap{overflow:auto}.uz-tlog-table{width:100%;min-width:760px;border-collapse:collapse;font-size:13px}.uz-tlog-table thead tr{border-bottom:1px solid var(--ink-150);background:var(--paper)}.uz-tlog-table th{padding:10px 14px;color:var(--ink-500);font-size:11px;font-weight:800;text-align:left;white-space:nowrap}.uz-tlog-table td{border-bottom:1px solid var(--ink-075);padding:10px 14px;color:var(--ink-700);vertical-align:middle;white-space:nowrap}.uz-tlog-table tbody tr:last-child td{border-bottom:0}.uz-tlog-table .is-mono{color:var(--ink-500);font-family:var(--font-data);font-size:12px}.uz-tlog-table .is-strong{color:var(--ink-900);font-weight:700}.uz-tlog-detail{justify-content:flex-start;color:var(--state-ai);font-size:13px;font-weight:800;line-height:1.35;padding:0;text-align:left}.uz-tlog-detail span{margin-left:4px;font-family:var(--font-data)}.uz-tlog-card-list{display:none}.uz-tlog-empty{display:grid;place-items:center;min-height:132px;border-top:1px solid var(--ink-150);color:var(--ink-500);font-size:13px;text-align:center}.uz-tlog-empty strong{display:block;margin-bottom:4px;color:var(--ink-900);font-size:14px}.uz-tlog-state{display:grid;flex:1;min-height:260px;place-items:center;padding:24px;text-align:center}.uz-tlog-state div{max-width:580px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:20px}.uz-tlog-state h2{margin:0 0 8px;font-size:16px}.uz-tlog-state p{margin:0;color:var(--ink-700);font-size:13px;line-height:1.55}@media(max-width:820px){.uz-tlog-head,.uz-tlog-note,.uz-tlog-toast,.uz-tlog-scroll{padding-left:12px;padding-right:12px}.uz-tlog-head-row{align-items:flex-start;flex-direction:column;gap:6px}.uz-tlog-search{width:100%;margin-left:0}.uz-tlog-table-wrap{display:none}.uz-tlog-card-list{display:grid;gap:0}.uz-tlog-card{display:grid;gap:8px;border-bottom:1px solid var(--ink-150);padding:12px}.uz-tlog-card:last-child{border-bottom:0}.uz-tlog-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}.uz-tlog-card-title{min-width:0;color:var(--ink-900);font-weight:800;font-size:13px;line-height:1.35}.uz-tlog-card-time{font-family:var(--font-data);font-size:12px;color:var(--ink-500);white-space:nowrap}.uz-tlog-card-meta{display:flex;flex-wrap:wrap;gap:6px 10px;color:var(--ink-700);font-size:12px;line-height:1.45}.uz-tlog-card-meta span:first-child,.uz-tlog-card-meta span:nth-child(3){font-family:var(--font-data);color:var(--ink-500)}}@media(max-width:420px){.uz-tlog-head-row{margin-bottom:10px}.uz-tlog-tabs{margin-right:-12px}.uz-tlog-tab{flex:1 0 auto}.uz-tlog-note,.uz-tlog-toast{align-items:flex-start;flex-direction:column}.uz-tlog-card-head{display:grid}.uz-tlog-card-time{white-space:normal}}`;

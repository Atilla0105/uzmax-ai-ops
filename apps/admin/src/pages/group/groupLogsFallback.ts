export type GroupLogViewState =
  | "degraded"
  | "empty"
  | "error"
  | "loading"
  | "permission";
export type GroupLogModule =
  | "全部模块"
  | "AI 成员"
  | "连接中心"
  | "配置"
  | "租户管理"
  | "对话"
  | "工单"
  | "模板中心";

export interface GroupLogRow {
  detail: string;
  fn: string;
  link: boolean;
  module: Exclude<GroupLogModule, "全部模块">;
  target: string;
  tenant: string;
  time: string;
  who: string;
}

export const groupLogColumns =
  "操作时间|租户|操作人|操作模块|操作功能|操作对象|操作内容".split("|");
export const groupLogModules: GroupLogModule[] =
  "全部模块|AI 成员|连接中心|配置|租户管理|对话|工单".split("|") as GroupLogModule[];

export const groupLogRuntimeLabels =
  "degraded|mock|read-only|browser-local only|synthetic audit rows|no production audit export|no file written|no audit runtime call|no real tenant/action navigation".split(
    "|"
  );
export const groupLogRuntimeBoundary = groupLogRuntimeLabels.join(" · ");

export const groupLogMeta = {
  descriptor: "集团级审计运营",
  runtime: groupLogRuntimeBoundary,
  source: "centralized-synthetic-owner-fixture",
  title: "集团日志",
  totalRows: 7
} as const;

export const groupLogOperationalNote =
  "当前展示集团操作日志视图，筛选、导出和详情用于本页核对。";

export const groupLogRows: GroupLogRow[] = [
  {
    detail: "恢复白桦母婴 AI · 原因：模型已恢复",
    fn: "熔断恢复",
    link: true,
    module: "AI 成员",
    target: "agent-02",
    tenant: "玉珠跨境美妆",
    time: "06-29 10:42:18",
    who: "韩雪"
  },
  {
    detail: "订单 API 降级为导入兜底 · ADR-B02",
    fn: "停用连接",
    link: true,
    module: "连接中心",
    target: "order-api",
    tenant: "集团",
    time: "06-29 10:31:05",
    who: "韩雪"
  },
  {
    detail: "日成本上限 ¥180 -> ¥260",
    fn: "修改成本护栏",
    link: true,
    module: "配置",
    target: "cfg-v12",
    tenant: "丝路数码",
    time: "06-29 09:58:40",
    who: "李伟"
  },
  {
    detail: "退款诉求 · AI 暂停自动回复",
    fn: "红线拦截",
    link: true,
    module: "对话",
    target: "CU-8841",
    tenant: "玉珠跨境美妆",
    time: "06-29 09:14:22",
    who: "系统"
  },
  {
    detail: "复制到 玉珠跨境美妆 · 生成独立版本",
    fn: "复制模板",
    link: true,
    module: "模板中心",
    target: "美妆售后知识包 v4.2",
    tenant: "集团",
    time: "06-29 08:50:11",
    who: "韩雪"
  },
  {
    detail: "结果 resolved · 已补发",
    fn: "关闭工单",
    link: false,
    module: "工单",
    target: "#T-0991",
    tenant: "天净家居",
    time: "06-28 22:03:47",
    who: "王芳"
  },
  {
    detail: "原因：连续熔断超 24h，待排障",
    fn: "停用租户",
    link: true,
    module: "租户管理",
    target: "白桦母婴",
    tenant: "集团",
    time: "06-28 18:20:33",
    who: "韩雪"
  }
];

export function readGroupLogViewState(): GroupLogViewState {
  const params = new URLSearchParams(location.search);
  const state = params.get("m7GroupLogsState") ?? params.get("state");
  return ["degraded", "empty", "error", "loading", "permission"].includes(state ?? "")
    ? (state as GroupLogViewState)
    : "degraded";
}

export function filterGroupLogRows(
  rows: readonly GroupLogRow[],
  module: GroupLogModule,
  search: string
) {
  const query = search.trim().toLowerCase();
  const moduleRows =
    module === "全部模块" ? rows : rows.filter((row) => row.module === module);
  if (!query) return moduleRows;
  return moduleRows.filter((row) =>
    [row.time, row.tenant, row.who, row.module, row.fn, row.target, row.detail]
      .join(" ")
      .toLowerCase()
      .includes(query)
  );
}

export function groupLogSubtitle({
  filtered,
  resultCount,
  totalCount
}: {
  filtered: boolean;
  resultCount: number;
  totalCount: number;
}) {
  const label = filtered
    ? `显示 ${resultCount} / ${totalCount} 条`
    : `${totalCount} 条`;
  return `操作日志 · 跨租户 · ${label}`;
}

export function groupLogExportToast(count: number) {
  return `已准备导出范围 · ${count} 条记录 · 本页可继续筛选核对`;
}

export function groupLogDetailToast(row: GroupLogRow) {
  return `详情预览已打开 · ${row.module} / ${row.target}`;
}

export function groupLogStateCopy(state: Exclude<GroupLogViewState, "degraded">) {
  const copies: Record<
    Exclude<GroupLogViewState, "degraded">,
    { body: string; title: string }
  > = {
    empty: {
      body: "当前筛选范围暂无可展示的集团操作记录。",
      title: "暂无集团日志"
    },
    error: {
      body: "集团日志暂不可用，请稍后刷新或切换筛选范围。",
      title: "集团日志暂不可用"
    },
    loading: {
      body: "正在整理集团操作记录和跨租户筛选条件。",
      title: "正在载入集团日志"
    },
    permission: {
      body: "当前账号需要集团日志查看权限后才能打开此视图。",
      title: "需要集团日志权限"
    }
  };
  return copies[state];
}

export const groupLogStyles = `.uz-glog-page{display:flex;height:100%;min-height:0;flex-direction:column;overflow:hidden;background:var(--paper);color:var(--ink-900);font-family:var(--font-body)}.uz-glog-page *{box-sizing:border-box}.uz-glog-head{flex:none;border-bottom:1px solid var(--ink-150);background:var(--card);padding:14px 24px}.uz-glog-head-row{display:flex;align-items:center;gap:12px;min-width:0}.uz-glog-title{margin:0;font:800 16px/1.35 var(--font-display)}.uz-glog-subtitle,.uz-glog-muted{color:var(--ink-500);font-size:12px;line-height:1.45}.uz-glog-tools{margin-left:auto;display:flex;align-items:center;gap:8px}.uz-glog-search{display:flex;width:240px;height:32px;align-items:center;gap:7px;border:1px solid var(--ink-150);border-radius:7px;background:var(--paper);color:var(--ink-500);padding:0 11px}.uz-glog-search span:first-child{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.uz-glog-search input{min-width:0;width:100%;border:0;outline:0;background:transparent;color:var(--ink-900);font:500 12px/1 var(--font-body)}.uz-glog-search input::placeholder{color:var(--ink-700)}.uz-glog-export,.uz-glog-chip,.uz-glog-detail{display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--ink-150);background:var(--card);color:var(--ink-700);cursor:pointer;font-family:var(--font-body)}.uz-glog-export{height:32px;gap:5px;border-radius:7px;font-size:12px;font-weight:800;padding:0 12px}.uz-glog-chips{display:flex;gap:6px;flex-wrap:nowrap;margin-top:12px;overflow-x:auto}.uz-glog-chip{min-height:26px;flex:none;border-radius:var(--radius-pill);font-size:12px;font-weight:700;padding:4px 11px}.uz-glog-chip[aria-pressed="true"]{border-color:var(--ink-900);background:var(--ink-900);color:var(--card)}.uz-glog-export:hover,.uz-glog-chip:hover,.uz-glog-detail:hover{border-color:var(--ink-300);color:var(--ink-900)}.uz-glog-chip[aria-pressed="true"]:hover,.uz-glog-chip[aria-pressed="true"]:focus-visible,.uz-glog-chip[aria-pressed="true"]:active{border-color:var(--ink-900);background:var(--ink-900);color:var(--card)}.uz-glog-export:focus-visible,.uz-glog-chip:focus-visible,.uz-glog-detail:focus-visible,.uz-glog-search:focus-within{outline:0;box-shadow:var(--shadow-focus)}.uz-glog-note,.uz-glog-toast{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--ink-150);background:var(--card);padding:10px 24px;color:var(--ink-700);font-size:12px;line-height:1.45}.uz-glog-note strong{border-radius:5px;background:var(--state-warn-bg);color:var(--state-warn);font-weight:800;padding:2px 8px}.uz-glog-toast{position:relative;z-index:var(--z-toast);border-bottom-color:var(--state-ok-border);background:var(--state-ok-bg);color:var(--state-ok);font-weight:800}.uz-glog-scroll{flex:1;min-height:0;overflow:auto;padding:18px 24px 24px}.uz-glog-panel{overflow:hidden;border:1px solid var(--ink-150);border-radius:10px;background:var(--card)}.uz-glog-table-wrap{overflow:auto}.uz-glog-table{width:100%;min-width:940px;border-collapse:collapse;font-size:13px}.uz-glog-table thead tr{border-bottom:1px solid var(--ink-150);background:var(--paper)}.uz-glog-table th{padding:10px 14px;color:var(--ink-500);font-size:11px;font-weight:800;text-align:left;white-space:nowrap}.uz-glog-table td{border-bottom:1px solid var(--ink-075);padding:10px 14px;color:var(--ink-700);vertical-align:middle}.uz-glog-table tbody tr:last-child td{border-bottom:0}.uz-glog-table .is-mono{color:var(--ink-500);font-family:var(--font-data);font-size:12px;white-space:nowrap}.uz-glog-table .is-strong{color:var(--ink-900);font-weight:700;white-space:nowrap}.uz-glog-detail{justify-content:flex-start;border:0;background:transparent;color:var(--state-ai);font-size:13px;font-weight:800;line-height:1.35;padding:0;text-align:left}.uz-glog-detail span{margin-left:4px;font-family:var(--font-data)}.uz-glog-card-list{display:none}.uz-glog-empty{display:grid;place-items:center;min-height:132px;border-top:1px solid var(--ink-150);color:var(--ink-500);font-size:13px;text-align:center}.uz-glog-empty strong{display:block;margin-bottom:4px;color:var(--ink-900);font-size:14px}.uz-glog-state{display:grid;flex:1;min-height:260px;place-items:center;padding:24px;text-align:center}.uz-glog-state div{max-width:580px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:20px}.uz-glog-state h2{margin:0 0 8px;font-size:16px}.uz-glog-state p{margin:0;color:var(--ink-700);font-size:13px;line-height:1.55}@media(max-width:820px){.uz-glog-head,.uz-glog-note,.uz-glog-toast,.uz-glog-scroll{padding-left:12px;padding-right:12px}.uz-glog-head-row{align-items:flex-start;flex-direction:column;gap:6px}.uz-glog-tools{width:100%;margin-left:0}.uz-glog-search{flex:1;width:auto}.uz-glog-table-wrap{display:none}.uz-glog-card-list{display:grid;gap:0}.uz-glog-card{display:grid;gap:8px;border-bottom:1px solid var(--ink-150);padding:12px}.uz-glog-card:last-child{border-bottom:0}.uz-glog-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}.uz-glog-card-time{font-family:var(--font-data);font-size:12px;color:var(--ink-500);white-space:nowrap}.uz-glog-card-title{min-width:0;color:var(--ink-900);font-weight:800;font-size:13px;line-height:1.35}.uz-glog-card-meta{display:flex;flex-wrap:wrap;gap:6px 10px;color:var(--ink-700);font-size:12px;line-height:1.45}.uz-glog-card-target{font-family:var(--font-data);color:var(--ink-500)}}@media(max-width:420px){.uz-glog-tools{align-items:stretch;flex-direction:column}.uz-glog-search,.uz-glog-export{width:100%}.uz-glog-export{height:34px}.uz-glog-chip{flex:1 1 auto}.uz-glog-card-head{display:grid}.uz-glog-card-time{white-space:normal}}`;

import { useMemo, useState } from "react";
import { Lock, Search } from "lucide-react";
import { IconSlot, StatusBadge } from "../../primitives";

type LogTab = "login" | "online" | "op";
type ViewState = "degraded" | "empty" | "error" | "loading" | "permission";

const tabs: { id: LogTab; label: string }[] = [
  { id: "login", label: "登录日志" },
  { id: "online", label: "在线日志" },
  { id: "op", label: "操作日志" }
];

const columns: Record<LogTab, string[]> = {
  login: ["时间", "成员", "IP", "设备", "结果"],
  online: ["时间", "成员", "事件", "前值", "后值"],
  op: ["时间", "操作人", "模块", "动作", "对象", "详情"]
};

const loginRows = [
  ["今天 08:12", "韩雪", "213.230.101.44", "Chrome · macOS", "成功"],
  ["今天 09:00", "李航", "213.230.88.10", "Chrome · Windows", "成功"],
  ["今天 10:30", "王敏", "84.54.72.9", "Safari · iOS", "成功"],
  ["昨天 22:14", "李航", "95.214.10.2", "Chrome · Windows", "失败 · 密码错误"]
];

const onlineRows = [
  ["今天 08:12", "韩雪", "上线", "离线", "在线"],
  ["今天 12:30", "王敏", "离开", "在线", "离开"],
  ["今天 09:00", "李航", "上线", "离线", "在线"],
  ["今天 13:05", "韩雪", "接待上限调整", "6", "8"]
];

const opRows = [
  ["今天 10:42", "韩雪", "配置", "模型路由", "route v17", "查看版本 ->"],
  ["今天 09:21", "系统", "对话", "红线拦截", "#c1", "跳转会话 ->"],
  ["今天 09:21", "系统", "工单", "自动创建", "#T-1042", "跳转工单 ->"],
  ["今天 08:55", "李航", "确认队列", "通过候选", "q-知识#88", "跳转评测 ->"],
  ["今天 08:30", "王敏", "知识", "编辑条目", "物流时效 v4", "查看 diff ->"],
  ["昨天", "韩雪", "AI 成员", "熔断恢复", "夜间值守", "查看记录 ->"]
];

const runtimeLabels =
  "degraded|mock|read-only|browser-local only|no logs runtime|no DB/API/authz/RLS|no audit write|no real navigation".split(
    "|"
  );

const rowMap: Record<LogTab, string[][]> = {
  login: loginRows,
  online: onlineRows,
  op: opRows
};

export function LogsPage({ selectedTenantId }: { selectedTenantId: string }) {
  const state = readState();
  const [tab, setTab] = useState<LogTab>("op");
  const [search, setSearch] = useState("");
  const rows = useMemo(() => filterRows(rowMap[tab], search), [search, tab]);

  return (
    <section
      className="uz-logs-page"
      data-runtime-state={state}
      data-tenant-id={selectedTenantId}
      data-testid="m7-logs-page"
    >
      <style>{styles}</style>
      <header className="uz-logs-head">
        <div className="uz-logs-head-row">
          <h2>日志</h2>
          <StatusBadge tone="warn">tenant mock/degraded</StatusBadge>
          <label className="uz-logs-search">
            <span>搜索本页记录</span>
            <IconSlot icon={Search} size="sm" />
            <input
              aria-label="搜索本页记录"
              data-testid="m7-logs-search"
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="搜索本页记录…"
              type="search"
              value={search}
            />
          </label>
        </div>
        <nav aria-label="日志类型" className="uz-logs-tabs">
          {tabs.map((item) => (
            <button
              aria-current={item.id === tab ? "page" : undefined}
              className={item.id === tab ? "is-active" : undefined}
              data-testid={item.id === tab ? "m7-logs-active-tab" : undefined}
              key={item.id}
              onClick={() => setTab(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>
      <div className="uz-logs-note" data-testid="m7-logs-runtime-note">
        <IconSlot icon={Lock} size="sm" />
        <strong>{runtimeLabels.slice(0, 4).join(" · ")}</strong>
        <span className="uz-logs-note-copy">{runtimeLabels.slice(4).join(" · ")}</span>
      </div>
      {state === "degraded" ? (
        <main className="uz-logs-scroll">
          <section className="uz-logs-panel">
            <div className="uz-logs-table-wrap">
              <table className="uz-logs-table">
                <thead>
                  <tr>
                    {columns[tab].map((column) => (
                      <th key={column} scope="col">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr className="uz-logs-row" key={row.join("|")}>
                      {row.map((cell, index) => (
                        <td className={cellClass(tab, index)} key={`${cell}-${index}`}>
                          {tab === "op" && index === 5 ? (
                            <button className="uz-logs-link" type="button">
                              {cell}
                            </button>
                          ) : (
                            cell
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="uz-logs-cards">
              {rows.map((row) => (
                <article className="uz-logs-card" key={`${row.join("|")}-card`}>
                  <strong>{tab === "op" ? `${row[2]} · ${row[3]}` : row[2]}</strong>
                  <span>{row[0]}</span>
                  <p>{row.slice(1).join(" · ")}</p>
                </article>
              ))}
            </div>
            {rows.length === 0 ? (
              <div className="uz-logs-empty" data-testid="m7-logs-empty">
                没有匹配「{search}」的记录
              </div>
            ) : null}
          </section>
        </main>
      ) : (
        <main className="uz-logs-state" data-testid={`m7-logs-state-${state}`}>
          <div>
            <h2>{state === "permission" ? "permission denied" : state}</h2>
            <p>{runtimeLabels.join(" · ")}</p>
          </div>
        </main>
      )}
    </section>
  );
}

function readState(): ViewState {
  const params = new URLSearchParams(location.search);
  const state = params.get("m7LogsState") ?? params.get("state");
  return ["degraded", "empty", "error", "loading", "permission"].includes(state ?? "")
    ? (state as ViewState)
    : "degraded";
}

function filterRows(rows: string[][], search: string) {
  const query = search.trim().toLowerCase();
  if (!query) return rows;
  return rows.filter((row) => row.join(" ").toLowerCase().includes(query));
}

function cellClass(tab: LogTab, index: number) {
  if (index === 0 || (tab !== "op" && index >= 2)) return "is-mono";
  if (tab === "op" && index === 4) return "is-mono";
  return "";
}

const styles = `.uz-logs-page{display:flex;width:100%;height:100%;min-width:0;min-height:0;flex-direction:column;overflow:hidden;background:var(--paper);color:var(--ink-900);font-family:var(--font-body)}.uz-logs-page *{box-sizing:border-box}.uz-logs-head{flex:none;border-bottom:1px solid var(--ink-150);background:var(--card);padding:14px 24px 0}.uz-logs-head-row{display:flex;align-items:center;gap:12px;margin-bottom:12px;min-width:0}.uz-logs-head h2{margin:0;font:800 16px/1.35 var(--font-display)}.uz-logs-search{display:flex;width:240px;height:32px;margin-left:auto;align-items:center;gap:7px;border:1px solid var(--ink-150);border-radius:7px;background:var(--paper);color:var(--ink-500);padding:0 11px}.uz-logs-search span:first-child{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.uz-logs-search input{min-width:0;width:100%;border:0;outline:0;background:transparent;color:var(--ink-900);font:500 12px/1 var(--font-body)}.uz-logs-search input::placeholder{color:var(--ink-700)}.uz-logs-search:focus-within{box-shadow:var(--shadow-focus)}.uz-logs-tabs{display:flex;gap:2px}.uz-logs-tabs button{border:0;border-bottom:2px solid transparent;background:transparent;color:var(--ink-500);cursor:pointer;font:700 13px/1 var(--font-body);padding:10px 13px 9px}.uz-logs-tabs button:hover,.uz-logs-tabs button:focus-visible{color:var(--ink-900);outline:0}.uz-logs-tabs button:focus-visible{box-shadow:var(--shadow-focus)}.uz-logs-tabs button.is-active{border-bottom-color:var(--ink-900);color:var(--ink-900)}.uz-logs-note{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--ink-150);background:var(--card);padding:10px 24px;color:var(--ink-700);font-size:12px;line-height:1.45}.uz-logs-note strong{flex:none;border-radius:5px;background:var(--state-warn-bg);color:var(--state-warn);font-weight:800;padding:2px 8px}.uz-logs-note-copy{min-width:0;overflow-wrap:anywhere}.uz-logs-scroll{flex:1;min-height:0;overflow:auto;padding:18px 24px 24px}.uz-logs-panel{overflow:hidden;border:1px solid var(--ink-150);border-radius:10px;background:var(--card)}.uz-logs-table-wrap{overflow:auto}.uz-logs-table{width:100%;min-width:760px;border-collapse:collapse;font-size:13px}.uz-logs-table thead tr{border-bottom:1px solid var(--ink-150);background:var(--paper)}.uz-logs-table th{padding:10px 14px;color:var(--ink-500);font-size:11px;font-weight:800;text-align:left;white-space:nowrap}.uz-logs-table td{border-bottom:1px solid var(--ink-075);padding:10px 14px;color:var(--ink-700);white-space:nowrap}.uz-logs-table tbody tr:last-child td{border-bottom:0}.uz-logs-table .is-mono{color:var(--ink-500);font-family:var(--font-data);font-size:12px}.uz-logs-link{border:0;background:transparent;color:var(--state-ai);cursor:pointer;font:800 13px/1.35 var(--font-body);padding:0}.uz-logs-link:hover,.uz-logs-link:focus-visible{text-decoration:underline;outline:0}.uz-logs-empty{display:grid;min-height:132px;place-items:center;border-top:1px solid var(--ink-150);color:var(--ink-500);font-size:13px;text-align:center}.uz-logs-state{display:grid;flex:1;min-height:260px;place-items:center;padding:24px;text-align:center}.uz-logs-state div{max-width:580px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:20px}.uz-logs-state h2{margin:0 0 8px;font-size:16px}.uz-logs-state p{margin:0;color:var(--ink-700);font-size:13px;line-height:1.55}.uz-logs-cards{display:none}@media(min-width:901px){.uz-logs-page{width:calc(100vw - var(--nav-expanded-width));max-width:calc(100vw - var(--nav-expanded-width))}.uz-app-shell.is-nav-collapsed .uz-logs-page{width:calc(100vw - var(--nav-collapsed-width));max-width:calc(100vw - var(--nav-collapsed-width))}}@media(max-width:820px){.uz-logs-page{display:block;width:100vw;max-width:100vw;height:auto;min-height:0;overflow:visible}.uz-logs-head,.uz-logs-note,.uz-logs-scroll{padding-left:12px;padding-right:12px}.uz-logs-head-row{align-items:flex-start;flex-direction:column;gap:8px}.uz-logs-search{width:100%;margin-left:0}.uz-logs-tabs{overflow:auto}.uz-logs-note{display:block}.uz-logs-note [data-icon-slot]{display:none}.uz-logs-note strong{display:block;width:max-content;max-width:100%;white-space:normal;overflow-wrap:normal;word-break:normal}.uz-logs-note-copy{display:block;margin-top:6px;overflow-wrap:anywhere}.uz-logs-scroll{display:block;overflow:visible;padding-top:12px;padding-bottom:12px}.uz-logs-table-wrap{display:none}.uz-logs-cards{display:grid}.uz-logs-card{display:grid;gap:6px;border-bottom:1px solid var(--ink-150);padding:12px}.uz-logs-card:last-child{border-bottom:0}.uz-logs-card strong{color:var(--ink-900);font-size:13px}.uz-logs-card span{font-family:var(--font-data);font-size:12px;color:var(--ink-500)}.uz-logs-card p{margin:0;color:var(--ink-700);font-size:12px;line-height:1.45;overflow-wrap:anywhere}}`;

import { Download, Lock, Search } from "lucide-react";
import { IconSlot } from "../../primitives";
import {
  groupLogColumns,
  groupLogMeta,
  groupLogModules,
  groupLogOperationalNote,
  groupLogRuntimeBoundary,
  groupLogRuntimeLabels,
  groupLogStateCopy,
  groupLogSubtitle,
  type GroupLogModule,
  type GroupLogRow,
  type GroupLogViewState
} from "./groupLogsFallback";

interface HeaderProps {
  activeModule: GroupLogModule;
  onChangeModule: (module: GroupLogModule) => void;
  onExport: () => void;
  onSearch: (value: string) => void;
  resultCount: number;
  search: string;
}

interface TableProps {
  onOpenDetail: (row: GroupLogRow) => void;
  rows: readonly GroupLogRow[];
  search: string;
}

export function GroupLogHeader({
  activeModule,
  onChangeModule,
  onExport,
  onSearch,
  resultCount,
  search
}: HeaderProps) {
  return (
    <header className="uz-glog-head">
      <div className="uz-glog-head-row">
        <h2 className="uz-glog-title">{groupLogMeta.title}</h2>
        <span className="uz-glog-subtitle" data-testid="m7-group-logs-subtitle">
          {groupLogSubtitle({
            filtered: Boolean(search.trim()) || activeModule !== "全部模块",
            resultCount,
            totalCount: groupLogMeta.totalRows
          })}
        </span>
        <div className="uz-glog-tools">
          <label className="uz-glog-search">
            <span>搜索租户 / 操作人 / 对象 / 内容</span>
            <IconSlot icon={Search} size="sm" />
            <input
              aria-label="搜索集团日志本页记录"
              data-testid="m7-group-logs-search"
              onChange={(event) => onSearch(event.currentTarget.value)}
              placeholder="搜索租户 / 操作人 / 对象 / 内容…"
              type="search"
              value={search}
            />
          </label>
          <button
            aria-description={groupLogRuntimeBoundary}
            aria-label="导出集团日志"
            className="uz-glog-export"
            data-runtime-boundary={groupLogRuntimeBoundary}
            data-testid="m7-group-logs-export"
            onClick={onExport}
            title={groupLogRuntimeBoundary}
            type="button"
          >
            <IconSlot icon={Download} size="sm" />
            导出
          </button>
        </div>
      </div>
      <div aria-label="操作模块筛选" className="uz-glog-chips">
        {groupLogModules.map((module) => (
          <button
            aria-pressed={module === activeModule}
            className="uz-glog-chip"
            data-testid={
              module === activeModule ? "m7-group-logs-active-module" : undefined
            }
            key={module}
            onClick={() => onChangeModule(module)}
            type="button"
          >
            {module}
          </button>
        ))}
      </div>
    </header>
  );
}

export function GroupLogRuntimeNote() {
  return (
    <div
      aria-description={groupLogRuntimeBoundary}
      className="uz-glog-note"
      data-runtime-boundary={groupLogRuntimeBoundary}
      data-testid="m7-group-logs-runtime-note"
      title={groupLogRuntimeBoundary}
    >
      <IconSlot icon={Lock} size="sm" />
      <strong>{groupLogMeta.descriptor}</strong>
      <span>{groupLogOperationalNote}</span>
      <span hidden>{groupLogRuntimeLabels.join(" · ")}</span>
    </div>
  );
}

export function GroupLogTable({ onOpenDetail, rows, search }: TableProps) {
  return (
    <section aria-label="集团日志表格" className="uz-glog-panel">
      <div className="uz-glog-table-wrap">
        <table className="uz-glog-table">
          <thead>
            <tr>
              {groupLogColumns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="uz-glog-row" key={`${row.time}-${row.target}`}>
                <td className="is-mono">{row.time}</td>
                <td className="is-strong">{row.tenant}</td>
                <td>{row.who}</td>
                <td>{row.module}</td>
                <td>{row.fn}</td>
                <td className="is-mono">{row.target}</td>
                <td>{renderDetail(row, onOpenDetail)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div aria-label="集团日志移动卡片" className="uz-glog-card-list">
        {rows.map((row) => (
          <article className="uz-glog-card" key={`${row.time}-${row.target}-card`}>
            <div className="uz-glog-card-head">
              <strong className="uz-glog-card-title">
                {row.tenant} · {row.module} · {row.fn}
              </strong>
              <span className="uz-glog-card-time">{row.time}</span>
            </div>
            <div className="uz-glog-card-meta">
              <span>操作人 {row.who}</span>
              <span className="uz-glog-card-target">对象 {row.target}</span>
            </div>
            {renderDetail(row, onOpenDetail)}
          </article>
        ))}
      </div>
      {rows.length === 0 ? <GroupLogEmpty search={search} /> : null}
    </section>
  );
}

export function GroupLogStatePanel({
  state
}: {
  state: Exclude<GroupLogViewState, "degraded">;
}) {
  const copy = groupLogStateCopy(state);
  return (
    <main
      aria-description={groupLogRuntimeBoundary}
      className="uz-glog-state"
      data-runtime-boundary={groupLogRuntimeBoundary}
      data-testid={`m7-group-logs-state-${state}`}
      title={groupLogRuntimeBoundary}
    >
      <div>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
        <span hidden>{groupLogMeta.runtime}</span>
      </div>
    </main>
  );
}

function GroupLogEmpty({ search }: { search: string }) {
  const query = search.trim();
  return (
    <div className="uz-glog-empty" data-testid="m7-group-logs-empty">
      <div>
        <strong>{query ? `没有匹配「${query}」的记录` : "没有匹配的记录"}</strong>
        <span>调整模块或搜索词后继续核对集团操作记录。</span>
        <span hidden>{groupLogRuntimeBoundary}</span>
      </div>
    </div>
  );
}

function renderDetail(row: GroupLogRow, onOpenDetail: (row: GroupLogRow) => void) {
  if (!row.link) return <span className="uz-glog-muted">{row.detail}</span>;
  return (
    <button
      aria-description={groupLogRuntimeBoundary}
      aria-label={`查看日志详情 ${row.module} ${row.target}`}
      className="uz-glog-detail"
      data-runtime-boundary={groupLogRuntimeBoundary}
      onClick={() => onOpenDetail(row)}
      title={groupLogRuntimeBoundary}
      type="button"
    >
      {row.detail}
      <span aria-hidden>{"->"}</span>
    </button>
  );
}

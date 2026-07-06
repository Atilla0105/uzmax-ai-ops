import { Download, Lock, Search } from "lucide-react";
import { IconSlot, StatusBadge } from "../../primitives";
import {
  groupLogColumns,
  groupLogMeta,
  groupLogModules,
  groupLogRuntimeLabels,
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
          {groupLogSubtitle(resultCount)}
        </span>
        <StatusBadge tone="warn">{groupLogMeta.descriptor}</StatusBadge>
        <div className="uz-glog-tools">
          <label className="uz-glog-search">
            <span>搜索本页记录</span>
            <IconSlot icon={Search} size="sm" />
            <input
              aria-label="搜索集团日志本页 mock 记录"
              data-testid="m7-group-logs-search"
              onChange={(event) => onSearch(event.currentTarget.value)}
              placeholder="搜索本页记录..."
              type="search"
              value={search}
            />
          </label>
          <button
            aria-label="导出集团日志 browser-local only"
            className="uz-glog-export"
            data-testid="m7-group-logs-export"
            onClick={onExport}
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
    <div className="uz-glog-note" data-testid="m7-group-logs-runtime-note">
      <IconSlot icon={Lock} size="sm" />
      <strong>{groupLogRuntimeLabels.slice(0, 4).join(" · ")}</strong>
      <span>{groupLogRuntimeLabels.slice(4).join(" · ")}</span>
    </div>
  );
}

export function GroupLogTable({ onOpenDetail, rows }: TableProps) {
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
      {rows.length === 0 ? <GroupLogEmpty /> : null}
    </section>
  );
}

export function GroupLogStatePanel({
  state
}: {
  state: Exclude<GroupLogViewState, "degraded">;
}) {
  const title = state === "permission" ? "permission denied" : state;
  return (
    <main className="uz-glog-state" data-testid={`m7-group-logs-state-${state}`}>
      <div>
        <h2>{title}</h2>
        <p>{`Synthetic ${title} state. ${groupLogMeta.runtime}.`}</p>
      </div>
    </main>
  );
}

function GroupLogEmpty() {
  return (
    <div className="uz-glog-empty" data-testid="m7-group-logs-empty">
      <div>
        <strong>没有匹配的记录</strong>
        <span>调整模块或搜索词；此处只筛选浏览器内 synthetic audit rows。</span>
      </div>
    </div>
  );
}

function renderDetail(row: GroupLogRow, onOpenDetail: (row: GroupLogRow) => void) {
  if (!row.link) return <span className="uz-glog-muted">{row.detail}</span>;
  return (
    <button
      aria-label={`本地预览日志详情 ${row.module} ${row.target}`}
      className="uz-glog-detail"
      onClick={() => onOpenDetail(row)}
      type="button"
    >
      {row.detail}
      <span aria-hidden>{"->"}</span>
    </button>
  );
}

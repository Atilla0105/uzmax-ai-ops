import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { IconSlot } from "../../primitives";
import {
  filterTenantLogRows,
  readTenantLogViewState,
  tenantLogColumns,
  tenantLogDetailToast,
  tenantLogMeta,
  tenantLogRuntimeBoundary,
  tenantLogStateCopy,
  tenantLogStyles,
  tenantLogTabs,
  type TenantLogRow,
  type TenantLogTab
} from "./logsFallback";

export function LogsPage({ selectedTenantId }: { selectedTenantId: string }) {
  const viewState = readTenantLogViewState();
  const [activeTab, setActiveTab] = useState<TenantLogTab>("op");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef<number | null>(null);
  const rows = useMemo(
    () => filterTenantLogRows(activeTab, search),
    [activeTab, search]
  );

  useEffect(
    () => () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    },
    []
  );

  const showToast = (message: string) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToast("");
      toastTimerRef.current = null;
    }, 3200);
  };

  return (
    <section
      className="uz-tlog-page"
      data-runtime-boundary={tenantLogRuntimeBoundary}
      data-runtime-source={tenantLogMeta.source}
      data-runtime-state={viewState}
      data-tenant-id={selectedTenantId}
      data-testid="m7-logs-page"
    >
      <style>{tenantLogStyles}</style>
      <TenantLogHeader
        activeTab={activeTab}
        onSearch={setSearch}
        onTabChange={setActiveTab}
        search={search}
      />
      <div className="uz-tlog-note" data-testid="m7-logs-runtime-note" hidden>
        <span>{tenantLogMeta.runtime}</span>
      </div>
      {toast ? (
        <div
          aria-atomic="true"
          aria-live="polite"
          className="uz-tlog-toast"
          data-runtime-boundary={tenantLogRuntimeBoundary}
          data-testid="m7-logs-toast"
          role="status"
        >
          {toast}
          <span hidden>{tenantLogRuntimeBoundary}</span>
        </div>
      ) : null}
      {viewState === "degraded" ? (
        <main className="uz-tlog-scroll">
          <TenantLogTable
            activeTab={activeTab}
            onOpenDetail={(row) => showToast(tenantLogDetailToast(row))}
            rows={rows}
            search={search}
          />
        </main>
      ) : (
        <main className="uz-tlog-state" data-testid={`m7-logs-state-${viewState}`}>
          <div>
            <h2>{tenantLogStateCopy[viewState].title}</h2>
            <p>{tenantLogStateCopy[viewState].body}</p>
            <span hidden>{tenantLogRuntimeBoundary}</span>
          </div>
        </main>
      )}
    </section>
  );
}

function TenantLogHeader({
  activeTab,
  onSearch,
  onTabChange,
  search
}: {
  activeTab: TenantLogTab;
  onSearch: (value: string) => void;
  onTabChange: (tab: TenantLogTab) => void;
  search: string;
}) {
  return (
    <header className="uz-tlog-head">
      <div className="uz-tlog-head-row">
        <h2 className="uz-tlog-title">{tenantLogMeta.title}</h2>
        <label className="uz-tlog-search">
          <span>搜索本页记录</span>
          <IconSlot icon={Search} size="sm" />
          <input
            aria-label="搜索租户日志记录"
            data-testid="m7-logs-search"
            onChange={(event) => onSearch(event.currentTarget.value)}
            placeholder="搜索本页记录…"
            type="search"
            value={search}
          />
        </label>
      </div>
      <div aria-label="日志类型" className="uz-tlog-tabs">
        {tenantLogTabs.map((tab) => (
          <button
            aria-pressed={tab.id === activeTab}
            className="uz-tlog-tab"
            data-testid={tab.id === activeTab ? "m7-logs-active-tab" : undefined}
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}

function TenantLogTable({
  activeTab,
  onOpenDetail,
  rows,
  search
}: {
  activeTab: TenantLogTab;
  onOpenDetail: (row: TenantLogRow) => void;
  rows: readonly TenantLogRow[];
  search: string;
}) {
  return (
    <section
      aria-label="租户日志表格"
      className="uz-tlog-panel"
      data-runtime-boundary={tenantLogRuntimeBoundary}
    >
      <div className="uz-tlog-table-wrap">
        <table className="uz-tlog-table">
          <thead>
            <tr>
              {tenantLogColumns[activeTab].map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="uz-tlog-row" key={row.id}>
                {row.cells.map((cell, index) => (
                  <td
                    className={cellClassName(activeTab, index)}
                    key={`${row.id}-${cell}`}
                  >
                    {renderCell(activeTab, index, row, onOpenDetail)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div aria-label="租户日志移动卡片" className="uz-tlog-card-list">
        {rows.map((row) => (
          <article className="uz-tlog-card" key={`${row.id}-card`}>
            <div className="uz-tlog-card-head">
              <strong className="uz-tlog-card-title">
                {activeTab === "op"
                  ? `${row.cells[2]} · ${row.cells[3]}`
                  : row.cells[2]}
              </strong>
              <span className="uz-tlog-card-time">{row.cells[0]}</span>
            </div>
            <div className="uz-tlog-card-meta">
              {row.cells.slice(1, 5).map((cell, index) => (
                <span key={`${row.id}-meta-${index}`}>{cell}</span>
              ))}
            </div>
            {activeTab === "op" ? renderCell(activeTab, 5, row, onOpenDetail) : null}
          </article>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="uz-tlog-empty" data-testid="m7-logs-empty">
          <div>
            <strong>
              {search.trim() ? `没有匹配「${search.trim()}」的记录` : "没有匹配的记录"}
            </strong>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function renderCell(
  activeTab: TenantLogTab,
  index: number,
  row: TenantLogRow,
  onOpenDetail: (row: TenantLogRow) => void
) {
  const cell = row.cells[index];
  if (activeTab !== "op" || index !== 5 || !row.detailTarget) return cell;
  return (
    <button
      aria-label={`查看日志详情 ${row.cells[2]} ${row.cells[4]} ${cell}`}
      className="uz-tlog-detail"
      data-runtime-boundary={tenantLogRuntimeBoundary}
      onClick={() => onOpenDetail(row)}
      type="button"
    >
      {cell}
    </button>
  );
}

function cellClassName(activeTab: TenantLogTab, index: number) {
  if (index === 0 || (activeTab !== "op" && index >= 2)) return "is-mono";
  if (index === 1 || (activeTab === "op" && index === 2)) return "is-strong";
  return undefined;
}

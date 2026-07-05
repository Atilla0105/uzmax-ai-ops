import { useEffect, useMemo, useRef, useState } from "react";
import { Lock, Search } from "lucide-react";
import { IconSlot, StatusBadge } from "../../primitives";
import {
  filterTenantLogRows,
  readTenantLogViewState,
  tenantLogColumns,
  tenantLogDetailToast,
  tenantLogMeta,
  tenantLogRuntimeLabels,
  tenantLogStyles,
  tenantLogSubtitle,
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
        resultCount={rows.length}
        search={search}
      />
      <div className="uz-tlog-note" data-testid="m7-logs-runtime-note">
        <IconSlot icon={Lock} size="sm" />
        <strong>{tenantLogRuntimeLabels.slice(0, 4).join(" · ")}</strong>
        <span>{tenantLogRuntimeLabels.slice(4).join(" · ")}</span>
      </div>
      {toast ? (
        <div
          aria-atomic="true"
          aria-live="polite"
          className="uz-tlog-toast"
          data-testid="m7-logs-toast"
          role="status"
        >
          {toast}
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
            <h2>{viewState === "permission" ? "permission denied" : viewState}</h2>
            <p>{`Synthetic ${viewState} state. ${tenantLogMeta.runtime}.`}</p>
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
  resultCount,
  search
}: {
  activeTab: TenantLogTab;
  onSearch: (value: string) => void;
  onTabChange: (tab: TenantLogTab) => void;
  resultCount: number;
  search: string;
}) {
  return (
    <header className="uz-tlog-head">
      <div className="uz-tlog-head-row">
        <h2 className="uz-tlog-title">{tenantLogMeta.title}</h2>
        <span className="uz-tlog-subtitle" data-testid="m7-logs-subtitle">
          {tenantLogSubtitle(activeTab, resultCount)}
        </span>
        <StatusBadge tone="warn">{tenantLogMeta.descriptor}</StatusBadge>
        <label className="uz-tlog-search">
          <span>搜索本页记录</span>
          <IconSlot icon={Search} size="sm" />
          <input
            aria-label="搜索租户日志本页 mock 记录"
            data-testid="m7-logs-search"
            onChange={(event) => onSearch(event.currentTarget.value)}
            placeholder="搜索本页记录..."
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
    <section aria-label="租户日志表格" className="uz-tlog-panel">
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
            <span>
              调整日志类型或搜索词；此处只筛选浏览器内 synthetic tenant log rows。
            </span>
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
      aria-label={`本地预览日志详情 ${row.cells[2]} ${row.cells[4]}`}
      className="uz-tlog-detail"
      onClick={() => onOpenDetail(row)}
      type="button"
    >
      {cell}
      <span aria-hidden>{"->"}</span>
    </button>
  );
}

function cellClassName(activeTab: TenantLogTab, index: number) {
  if (index === 0 || (activeTab !== "op" && index >= 2)) return "is-mono";
  if (index === 1 || (activeTab === "op" && index === 2)) return "is-strong";
  return undefined;
}

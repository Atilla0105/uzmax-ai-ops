import { createElement as h, useMemo, useState } from "react";
import { ArrowDownUp, X } from "lucide-react";
import { Button, IconSlot, SearchInput, StatusBadge } from "../../primitives";
import {
  groupHealthCards,
  groupOverviewColumns,
  groupOverviewFallbackMeta,
  groupOverviewRows,
  evalMeta,
  healthDot,
  matchesGroupFilter,
  orderMeta,
  type GroupHealthFilter,
  type GroupOverviewRow,
  type GroupOverviewSortKey
} from "./groupOverviewFallback";

export function GroupOverviewPage({
  onEnterTenant,
  onOpenLegacyEvidence
}: {
  onEnterTenant: (tenantId: string) => void;
  onOpenLegacyEvidence: () => void;
}) {
  const [filter, setFilter] = useState<GroupHealthFilter | null>(null);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<GroupOverviewSortKey>("sessions");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const q = query.trim().toLowerCase();
  const showLegacyBridge =
    import.meta.env.DEV || ["127.0.0.1", "localhost"].includes(location.hostname);
  const filteredRows = useMemo(() => {
    const rows = groupOverviewRows.filter(
      (row) =>
        (!filter || matchesGroupFilter(row, filter)) &&
        (!q ||
          row.tenantName.toLowerCase().includes(q) ||
          row.businessLine.toLowerCase().includes(q))
    );
    return [...rows].sort((left, right) => {
      const direction = sortDir === "asc" ? 1 : -1;
      return (sortValue(left, sortKey) - sortValue(right, sortKey)) * direction;
    });
  }, [filter, q, sortDir, sortKey]);
  const hasActiveFilter = filter !== null || q.length > 0;

  const clearFilter = () => {
    setFilter(null);
    setQuery("");
  };
  const toggleFilter = (next: GroupHealthFilter) => {
    setFilter((current) => (current === next ? null : next));
  };
  const toggleSort = (next: GroupOverviewSortKey) => {
    setSortDir((current) => (sortKey === next && current === "desc" ? "asc" : "desc"));
    setSortKey(next);
  };

  return (
    <section
      className="uz-page-group-overview"
      data-runtime-boundary={groupOverviewFallbackMeta.boundary}
      data-runtime-source={groupOverviewFallbackMeta.source}
      data-runtime-state="degraded"
      data-testid="m7-group-overview-page"
    >
      <GroupOverviewStyles />
      <span data-testid="m7-group-overview-runtime-note" hidden>
        {groupOverviewFallbackMeta.reason}
      </span>
      {showLegacyBridge ? (
        <button
          aria-label="Open legacy evidence route"
          className="uz-group-overview__legacy-bridge"
          onClick={onOpenLegacyEvidence}
          type="button"
        />
      ) : null}
      <header className="uz-group-overview__head">
        <div className="uz-group-overview__title">
          <h2>集团总览</h2>
          <span
            className="uz-group-overview__result"
            data-testid="m7-group-overview-result-label"
          >
            {resultLabel(filteredRows.length, filter, hasActiveFilter)}
          </span>
        </div>
        <div className="uz-group-overview__tools">
          {hasActiveFilter ? (
            <Button
              data-testid="m7-group-overview-clear-filter"
              icon={<IconSlot icon={X} size="sm" />}
              onClick={clearFilter}
              variant="secondary"
            >
              清除筛选
            </Button>
          ) : null}
          <SearchInput
            aria-label="搜索租户 / 业务线"
            data-testid="m7-group-overview-search"
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="搜索租户 / 业务线"
            value={query}
          />
        </div>
      </header>

      <section
        aria-label="Group health cards"
        className="uz-group-health"
        data-testid="m7-group-overview-health-cards"
      >
        {groupHealthCards.map((card) => (
          <button
            aria-pressed={filter === card.filter}
            className={`uz-group-health__card is-${card.tone}`}
            data-filter={card.filter}
            data-testid={`m7-group-health-card-${card.filter}`}
            key={card.filter}
            onClick={() => toggleFilter(card.filter)}
            type="button"
          >
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </button>
        ))}
      </section>

      <section className="uz-group-table" data-testid="m7-group-overview-table">
        <table>
          <thead>
            <tr>
              {groupOverviewColumns.map((column) => {
                const sortColumn = "sortKey" in column ? column.sortKey : undefined;
                return (
                  <th key={column.label} scope="col">
                    {sortColumn ? (
                      <button
                        aria-label={`Sort ${column.label}`}
                        data-testid={`m7-group-sort-${sortColumn}`}
                        onClick={() => toggleSort(sortColumn)}
                        type="button"
                      >
                        <span>{column.label}</span>
                        <IconSlot icon={ArrowDownUp} size="sm" />
                        {sortKey === sortColumn ? (
                          <span className="uz-sort-dir">
                            {sortDir === "asc" ? "升" : "降"}
                          </span>
                        ) : null}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <GroupOverviewTableRow
                key={row.id}
                onEnterTenant={onEnterTenant}
                row={row}
              />
            ))}
          </tbody>
        </table>
        {filteredRows.length === 0 ? (
          <div className="uz-group-table__empty" data-testid="m7-group-overview-empty">
            <span>没有匹配的租户</span>
            <button onClick={clearFilter} type="button">
              清除筛选
            </button>
          </div>
        ) : null}
      </section>
    </section>
  );
}

type RowProps = { onEnterTenant: (tenantId: string) => void; row: GroupOverviewRow };

function GroupOverviewTableRow({ onEnterTenant, row }: RowProps) {
  return (
    <tr data-testid={`m7-group-overview-row-${row.id}`}>
      <td>
        <button
          aria-label={`进入 ${row.tenantName} 对话`}
          className="uz-group-table__tenant-button"
          data-testid={`m7-group-enter-tenant-${row.id}`}
          onClick={() => onEnterTenant(row.id)}
          type="button"
        >
          <span className={`uz-tenant-dot uz-tenant-dot--${healthDot(row.health)}`} />
          <span>
            <strong>{row.tenantName}</strong>
            <small>{row.businessLine}</small>
          </span>
        </button>
      </td>
      <td className="is-mono">{row.sessions}</td>
      <td className="is-mono is-risk">{row.human}</td>
      <td className="is-mono">{row.sla}</td>
      <td className="is-mono">{row.handoff}</td>
      <td className="is-mono">{row.cost}</td>
      <td>
        <StatusBadge tone={evalMeta[row.evalState][1]}>
          {evalMeta[row.evalState][0]}
        </StatusBadge>
      </td>
      <td>
        <StatusBadge tone={orderMeta[row.orderState][1]}>
          {orderMeta[row.orderState][0]}
        </StatusBadge>
      </td>
      <td className="is-last">{row.last}</td>
    </tr>
  );
}

function resultLabel(
  visibleRows: number,
  filter: GroupHealthFilter | null,
  hasActiveFilter: boolean
) {
  if (!hasActiveFilter) return groupOverviewFallbackMeta.label;
  const label = groupHealthCards.find((card) => card.filter === filter)?.label;
  return `显示 ${visibleRows} / ${groupOverviewRows.length} 家租户${label ? ` · ${label}` : ""}`;
}

function sortValue(row: GroupOverviewRow, sortKey: GroupOverviewSortKey) {
  const key = `${sortKey}Sort` as keyof GroupOverviewRow;
  return Number(row[key]);
}

const css = `.uz-page-group-overview{display:flex;flex-direction:column;min-height:100%;min-width:0;width:100%;overflow:hidden;background:var(--paper);color:var(--ink-900);font:var(--text-base)/1.45 var(--font-body)}.uz-group-overview__legacy-bridge{position:absolute;inset:0 auto auto 0;width:1px;height:1px;overflow:hidden;border:0;padding:0;margin:0;opacity:0}.uz-group-overview__head{display:flex;align-items:center;gap:var(--s-6);border-bottom:1px solid var(--ink-150);padding:14px 24px;background:var(--card)}.uz-group-overview__title{display:flex;align-items:baseline;gap:var(--s-3);min-width:0}.uz-group-overview__title h2{margin:0;font:700 var(--text-title)/1.2 var(--font-display);white-space:nowrap}.uz-group-overview__result{min-width:0;color:var(--ink-500);font-size:var(--text-sm);white-space:nowrap}.uz-group-overview__tools{display:flex;align-items:center;gap:var(--s-3);margin-left:auto}.uz-group-overview__tools .uz-input{width:240px;min-height:30px;border-radius:7px}.uz-group-health{display:grid;grid-template-columns:repeat(6,minmax(124px,1fr));gap:12px;padding:16px 24px}.uz-group-health__card{display:grid;gap:6px;border:1px solid var(--ink-150);border-radius:10px;padding:13px 15px;background:var(--card);color:var(--ink-900);text-align:left;cursor:pointer}.uz-group-health__card:hover,.uz-group-health__card:focus-visible,.uz-group-health__card[aria-pressed=true]{outline:0;box-shadow:var(--shadow-focus)}.uz-group-health__card[aria-pressed=true]{border-color:var(--ink-900)}.uz-group-health__card span{color:var(--ink-500);font-size:11px}.uz-group-health__card strong{font:700 24px/1 var(--font-data)}.uz-group-health__card.is-warn strong{color:var(--state-warn)}.uz-group-health__card.is-danger strong{color:var(--state-human)}.uz-group-health__card.is-ok strong{color:var(--state-ok)}.uz-group-table{min-height:154px;margin:0 24px 24px;overflow:auto;border:1px solid var(--ink-150);border-radius:10px;background:var(--card)}.uz-group-table table{width:100%;min-width:900px;border-collapse:collapse}.uz-group-table th{border-bottom:1px solid var(--ink-150);padding:0;background:var(--paper);color:var(--ink-500);font:700 11px/1.2 var(--font-body);text-align:left;white-space:nowrap}.uz-group-table th>button{display:flex;align-items:center;gap:5px;width:100%;height:34px;border:0;padding:0 14px;color:inherit;background:transparent;font:inherit;text-align:left;cursor:pointer}.uz-group-table th:not(:has(button)){padding:11px 14px}.uz-sort-dir{font-size:10px;color:var(--ink-900)}.uz-group-table td{border-bottom:1px solid var(--ink-075);padding:12px 14px;color:var(--ink-900);font-size:13px;white-space:nowrap}.uz-group-table tbody tr:hover{background:var(--paper)}.uz-group-table td:first-child{min-width:170px}.uz-group-table__tenant-button{display:flex;align-items:center;gap:9px;width:100%;border:0;padding:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}.uz-group-table__tenant-button:focus-visible{outline:0;box-shadow:var(--shadow-focus)}.uz-group-table__tenant-button>span:last-child{display:grid;gap:2px}.uz-group-table td strong{font-weight:700}.uz-group-table td small{color:var(--ink-500);font-size:11px}.uz-group-table .is-mono{font-family:var(--font-data)}.uz-group-table .is-risk{color:var(--state-human);font-weight:700}.uz-group-table .is-last{color:var(--ink-700);font-size:12px}.uz-group-table__empty{display:flex;align-items:center;justify-content:center;gap:var(--s-1);min-height:86px;color:var(--ink-500);font-size:var(--text-sm)}.uz-group-table__empty button{border:0;color:var(--state-ai);background:transparent;font:700 var(--text-sm)/1.2 var(--font-body);cursor:pointer}.uz-group-table__empty button::before{content:"· ";color:var(--ink-500);font-weight:400}@media(min-width:901px){.uz-page-group-overview{width:calc(100vw - var(--nav-expanded-width));max-width:calc(100vw - var(--nav-expanded-width))}.uz-app-shell.is-nav-collapsed .uz-page-group-overview{width:calc(100vw - var(--nav-collapsed-width));max-width:calc(100vw - var(--nav-collapsed-width))}}@media(max-width:900px){.uz-group-overview__head{align-items:stretch;flex-direction:column;padding:12px}.uz-group-overview__title,.uz-group-overview__tools{align-items:flex-start;flex-wrap:wrap;margin-left:0}.uz-group-overview__tools .uz-input{width:100%}.uz-group-health{grid-template-columns:repeat(2,minmax(0,1fr));padding:12px;gap:8px}.uz-group-table{margin:0 12px 12px}.uz-group-table table{min-width:0}.uz-group-table thead{display:none}.uz-group-table tbody,.uz-group-table tr,.uz-group-table td{display:block}.uz-group-table tr{border-bottom:1px solid var(--ink-150);padding:10px}.uz-group-table td{border:0;padding:4px 0;white-space:normal}.uz-group-table td:first-child{min-width:0}.uz-group-table td:not(:first-child)::before{display:inline-block;width:86px;color:var(--ink-500);font:700 11px/1.2 var(--font-body)}.uz-group-table td:nth-child(2)::before{content:"会话量"}.uz-group-table td:nth-child(3)::before{content:"待人工"}.uz-group-table td:nth-child(4)::before{content:"SLA风险"}.uz-group-table td:nth-child(5)::before{content:"转人工率"}.uz-group-table td:nth-child(6)::before{content:"AI成本/日"}.uz-group-table td:nth-child(7)::before{content:"评测状态"}.uz-group-table td:nth-child(8)::before{content:"订单状态"}.uz-group-table td:nth-child(9)::before{content:"最后异常"}}@media(max-width:360px){.uz-group-health{grid-template-columns:1fr}.uz-page-group-overview{min-width:0}.uz-group-overview__result{white-space:normal}.uz-group-overview__tools{width:100%}.uz-group-overview__tools .uz-button{width:100%}}`;

const GroupOverviewStyles = () => h("style", null, css);

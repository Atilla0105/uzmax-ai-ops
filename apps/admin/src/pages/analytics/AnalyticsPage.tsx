import {
  useMemo,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent
} from "react";
import {
  analyticsFilterOptions,
  analyticsStyles,
  readAnalyticsViewState,
  type AnalyticsDimension,
  type AnalyticsFilters,
  type AnalyticsRange
} from "./analyticsFallback";
import { renderAnalytics } from "./analyticsMarkup";

export function AnalyticsPage({ selectedTenantId }: { selectedTenantId: string }) {
  const viewState = readAnalyticsViewState();
  const [range, setRange] = useState<AnalyticsRange>("7d");
  const [dims, setDims] = useState<AnalyticsDimension[]>([]);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    channel: analyticsFilterOptions.channel[0],
    language: analyticsFilterOptions.language[0]
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const html = useMemo(
    () =>
      renderAnalytics({
        dims,
        filters,
        menuOpen,
        range,
        selectedTenantId,
        toast,
        viewState
      }),
    [dims, filters, menuOpen, range, selectedTenantId, toast, viewState]
  );

  const showToast = (message: string) => setToast(message);
  const toggleDim = (id: string) => {
    if (!isAnalyticsDim(id)) return;
    setDims((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 2) {
        showToast("最多添加 2 个维度；browser-local only / no analytics runtime");
        return current;
      }
      return [...current, id];
    });
  };
  const runAction = (action?: string, id?: string) => {
    if (!action) return;
    if (action === "toggle-menu") return setMenuOpen((open) => !open);
    if (action === "export")
      return showToast("导出仅显示本地提示；no export file write / no audit write");
    if (action === "range" && isAnalyticsRange(id)) return setRange(id);
    if (action === "toggle-dim" || action === "remove-dim") return toggleDim(id ?? "");
  };
  const dispatchTarget = (target: EventTarget | null) => {
    const node =
      target instanceof HTMLElement
        ? target.closest<HTMLElement>("[data-action]")
        : null;
    runAction(node?.dataset.action, node?.dataset.id);
  };
  const onClick = (event: MouseEvent<HTMLElement>) => {
    dispatchTarget(event.target);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter") dispatchTarget(event.target);
  };
  const onInput = (event: FormEvent<HTMLElement>) => {
    const target = event.target as EventTarget | null;
    const select = target instanceof HTMLSelectElement ? target : null;
    const field = select?.dataset.field;
    if ((field === "channel" || field === "language") && select) {
      setFilters((current) => ({ ...current, [field]: select.value }));
    }
  };

  return (
    <section
      className="uz-analytics-page"
      data-runtime-state={viewState}
      data-tenant-id={selectedTenantId}
      data-testid="m7-analytics-page"
    >
      <style>{analyticsStyles}</style>
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        onChange={onInput}
        onClick={onClick}
        onInput={onInput}
        onKeyDown={onKeyDown}
      />
    </section>
  );
}

function isAnalyticsRange(value: string | undefined): value is AnalyticsRange {
  return value === "today" || value === "7d" || value === "30d";
}

function isAnalyticsDim(value: string): value is AnalyticsDimension {
  return [
    "agent",
    "channel",
    "handoffReason",
    "intent",
    "language",
    "member",
    "orderStatus",
    "time"
  ].includes(value);
}

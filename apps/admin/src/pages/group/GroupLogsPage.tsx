import { useEffect, useMemo, useRef, useState } from "react";
import {
  GroupLogHeader,
  GroupLogRuntimeNote,
  GroupLogStatePanel,
  GroupLogTable
} from "./GroupLogsViews";
import {
  filterGroupLogRows,
  groupLogDetailToast,
  groupLogExportToast,
  groupLogMeta,
  groupLogRows,
  groupLogStyles,
  readGroupLogViewState,
  type GroupLogModule,
  type GroupLogRow
} from "./groupLogsFallback";

export function GroupLogsPage() {
  const viewState = readGroupLogViewState();
  const [activeModule, setActiveModule] = useState<GroupLogModule>("全部模块");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef<number | null>(null);
  const rows = useMemo(
    () => filterGroupLogRows(groupLogRows, activeModule, search),
    [activeModule, search]
  );

  useEffect(() => {
    return () => {
      const activeToastTimer = toastTimerRef.current;
      if (activeToastTimer !== null) window.clearTimeout(activeToastTimer);
    };
  }, []);

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
      className="uz-glog-page"
      data-runtime-source={groupLogMeta.source}
      data-runtime-state={viewState}
      data-testid="m7-group-logs-page"
    >
      <style>{groupLogStyles}</style>
      <GroupLogHeader
        activeModule={activeModule}
        onChangeModule={setActiveModule}
        onExport={() => showToast(groupLogExportToast(rows.length))}
        onSearch={setSearch}
        resultCount={rows.length}
        search={search}
      />
      <GroupLogRuntimeNote />
      {toast ? (
        <div
          aria-atomic="true"
          aria-live="polite"
          className="uz-glog-toast"
          data-testid="m7-group-logs-toast"
          role="status"
        >
          {toast}
        </div>
      ) : null}
      {viewState === "degraded" ? (
        <main className="uz-glog-scroll">
          <GroupLogTable
            onOpenDetail={(row: GroupLogRow) => showToast(groupLogDetailToast(row))}
            rows={rows}
          />
        </main>
      ) : (
        <GroupLogStatePanel state={viewState} />
      )}
    </section>
  );
}

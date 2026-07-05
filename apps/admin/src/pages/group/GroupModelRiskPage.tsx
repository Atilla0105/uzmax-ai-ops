import { useEffect, useRef, useState } from "react";
import {
  CostComposition,
  KpiGrid,
  ModelRiskHeader,
  ModelRuntimeNote,
  ModelStatePanel,
  ModelTaskMatrix,
  RiskQueue
} from "./GroupModelRiskViews";
import {
  modelRiskMeta,
  modelRiskStyles,
  modelStats,
  readModelRiskViewState,
  riskRows
} from "./groupModelRiskFallback";

type GroupModelRiskPageProps = {
  onEnterTenant: (tenantId: string) => void;
};

export function GroupModelRiskPage({ onEnterTenant }: GroupModelRiskPageProps) {
  const viewState = readModelRiskViewState();
  const [swaps, setSwaps] = useState<Record<string, boolean>>({});
  const [resolved, setResolved] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef<number | null>(null);
  const allProvidersResolved = !!resolved["SYN-MODEL-RISK-all-providers-down"];
  const visibleRisks = riskRows.filter((risk) => !resolved[risk.id]);

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
    }, 2600);
  };
  const toggleTask = (id: string) => {
    setSwaps((items) => ({ ...items, [id]: !items[id] }));
    showToast(
      "primary/fallback switched in browser-local mock state only; no production model routing."
    );
  };
  const resolveRisk = (id: string) => {
    setResolved((items) => ({ ...items, [id]: true }));
    showToast(
      `${id} resolved locally; no production provider health or audit closure changed.`
    );
  };

  return (
    <section
      className="uz-model-page"
      data-runtime-source={modelRiskMeta.source}
      data-runtime-state={viewState}
      data-testid="m7-model-page"
    >
      <style>{modelRiskStyles}</style>
      <ModelRiskHeader onExport={() => showToast(modelRiskMeta.exportToast)} />
      <ModelRuntimeNote />
      {toast ? (
        <div
          aria-atomic="true"
          aria-live="polite"
          className="uz-model-toast"
          data-testid="m7-model-toast"
          role="status"
        >
          {toast}
        </div>
      ) : null}
      {viewState === "degraded" ? (
        <main className="uz-model-scroll">
          <KpiGrid kpis={modelStats(allProvidersResolved)} />
          <ModelTaskMatrix swaps={swaps} toggle={toggleTask} />
          <div className="uz-model-split">
            <CostComposition onEnterTenant={onEnterTenant} />
            <RiskQueue onResolve={resolveRisk} risks={visibleRisks} />
          </div>
        </main>
      ) : (
        <ModelStatePanel state={viewState} />
      )}
    </section>
  );
}

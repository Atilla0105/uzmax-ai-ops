import { useState } from "react";
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
  const allProvidersResolved = !!resolved["SYN-MODEL-RISK-all-providers-down"];
  const visibleRisks = riskRows.filter((risk) => !resolved[risk.id]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };
  const toggleTask = (id: string) => {
    setSwaps((items) => ({ ...items, [id]: !items[id] }));
    showToast("primary/fallback switched in browser-local mock state only.");
  };
  const resolveRisk = (id: string) => {
    setResolved((items) => ({ ...items, [id]: true }));
    showToast(`${id} resolved locally; no production provider health changed.`);
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
        <div className="uz-model-toast" data-testid="m7-model-toast">
          {toast}
        </div>
      ) : null}
      {viewState === "degraded" ? (
        <main className="uz-model-scroll">
          <KpiGrid kpis={modelStats(allProvidersResolved)} />
          <div className="uz-model-grid">
            <ModelTaskMatrix swaps={swaps} toggle={toggleTask} />
            <div className="uz-model-split">
              <CostComposition onEnterTenant={onEnterTenant} />
              <RiskQueue onResolve={resolveRisk} risks={visibleRisks} />
            </div>
          </div>
        </main>
      ) : (
        <ModelStatePanel state={viewState} />
      )}
    </section>
  );
}

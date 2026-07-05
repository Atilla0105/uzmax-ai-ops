import { Download, TriangleAlert } from "lucide-react";
import { IconSlot, StatusBadge } from "../../primitives";
import {
  costByTenant,
  modelColumns,
  modelRiskMeta,
  modelRuntimeLabels,
  modelTasks,
  toneLabel,
  type ModelKpi,
  type ModelRiskRow,
  type ModelRiskViewState,
  type ModelTask,
  type TenantCostRow
} from "./groupModelRiskFallback";

type ToggleMap = Record<string, boolean>;
type CostProps = { onEnterTenant: (tenantId: TenantCostRow["id"]) => void };
type MatrixProps = { swaps: ToggleMap; toggle: (id: string) => void };
type RiskProps = { onResolve: (id: string) => void; risks: ModelRiskRow[] };
type RowProps = { swapped: boolean; task: ModelTask; toggle: (id: string) => void };
type StateProps = { state: Exclude<ModelRiskViewState, "degraded"> };
type PanelHeadProps = { icon?: boolean; sub: string; title: string };

export function ModelRiskHeader({ onExport }: { onExport: () => void }) {
  return (
    <header className="uz-model-head">
      <h2 className="uz-model-title">模型 / 成本 / 风险</h2>
      <span className="uz-model-desc">{modelRiskMeta.descriptor}</span>
      <button
        className="uz-model-action"
        data-testid="m7-model-export"
        onClick={onExport}
        type="button"
      >
        <IconSlot icon={Download} size="sm" />
        导出成本
      </button>
    </header>
  );
}

export function ModelRuntimeNote() {
  return (
    <div
      aria-hidden="true"
      className="uz-model-runtime-evidence"
      data-boundary={modelRuntimeLabels.join("|")}
      data-testid="m7-model-runtime-note"
    />
  );
}

export function ModelStatePanel({ state }: StateProps) {
  return (
    <main className="uz-model-state" data-testid={`m7-model-state-${state}`}>
      <div>
        <h2>{state}</h2>
        <p>{`当前状态：${state}。运行时边界仅作为本地证据保留。`}</p>
      </div>
    </main>
  );
}

export function KpiGrid({ kpis }: { kpis: ModelKpi[] }) {
  return (
    <section aria-label="Model risk KPIs" className="uz-model-kpis">
      {kpis.map((kpi) => (
        <article
          className={`uz-model-kpi uz-model-tone--${toneLabel(kpi.tone)}`}
          data-testid={`m7-model-kpi-${kpi.id}`}
          key={kpi.id}
        >
          <span>{kpi.label}</span>
          <strong>{kpi.value}</strong>
          <small>{kpi.delta}</small>
        </article>
      ))}
    </section>
  );
}

export function ModelTaskMatrix({ swaps, toggle }: MatrixProps) {
  return (
    <section className="uz-model-panel uz-model-matrix" data-testid="m7-model-matrix">
      <PanelHead title="模型任务矩阵" sub="Primary / Fallback · 任务路由" />
      <div className="uz-model-table-wrap">
        <table className="uz-model-table">
          <thead>
            <tr>
              {modelColumns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modelTasks.map((task) => (
              <ModelTaskRow
                key={task.id}
                swapped={!!swaps[task.id]}
                task={task}
                toggle={toggle}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function CostComposition({ onEnterTenant }: CostProps) {
  return (
    <section className="uz-model-panel" data-testid="m7-model-cost">
      <PanelHead title="成本构成 · 按租户（今日 ¥418）" sub="今日用量占比" />
      <div className="uz-model-cost-list">
        {costByTenant.map((row) => (
          <button
            className="uz-model-cost-row"
            data-testid={`m7-model-cost-tenant-${row.id}`}
            key={row.id}
            onClick={() => onEnterTenant(row.id)}
            type="button"
          >
            <span className="uz-model-cost-meta">
              <strong>{row.label}</strong>
              <span className="uz-model-mono">{row.pct}</span>
            </span>
            <span className="uz-model-bar" aria-hidden>
              <span
                className={`uz-model-fill--${toneLabel(row.tone)}`}
                style={{ width: row.width }}
              />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function RiskQueue({ onResolve, risks }: RiskProps) {
  return (
    <section className="uz-model-panel" data-testid="m7-model-risk">
      <PanelHead icon title="风险队列" sub="待处理异常与复核项" />
      {risks.length === 0 ? (
        <div className="uz-model-empty-risk" data-testid="m7-model-risk-empty">
          暂无待处理风险，队列已清空。
        </div>
      ) : (
        <div className="uz-model-risk-list">
          {risks.map((risk) => (
            <article
              className="uz-model-risk"
              data-testid={`m7-model-risk-${risk.id}`}
              key={risk.id}
            >
              <StatusBadge tone={risk.tone}>{risk.severity}</StatusBadge>
              <div className="uz-model-risk-body">
                <p>
                  {risk.text}
                  {risk.scope ? (
                    <StatusBadge tone="neutral">{`范围 · ${risk.scope}`}</StatusBadge>
                  ) : null}
                </p>
                <small>{`${risk.tenant} · ${risk.time}`}</small>
              </div>
              <button
                className="uz-model-risk-action"
                data-testid={`m7-model-resolve-${risk.id}`}
                onClick={() => onResolve(risk.id)}
                type="button"
              >
                {risk.action}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ModelTaskRow({ swapped, task, toggle }: RowProps) {
  const primary = swapped ? task.fallback : task.primary;
  const fallback = swapped ? task.primary : task.fallback;
  const legacyPrimary = swapped ? task.legacyFallback : task.legacyPrimary;
  const switchState = swapped ? "已切换" : "未切换";
  const switchAction = swapped
    ? "恢复 primary/fallback local mock"
    : "切换 primary/fallback local mock";
  return (
    <tr
      className={swapped ? "is-switched" : undefined}
      data-testid={`m7-model-task-${task.id}`}
    >
      <td>
        <button
          aria-label={`${task.task} ${switchState}; ${switchAction}`}
          aria-pressed={swapped}
          className="uz-model-row-button"
          data-testid={`m7-model-task-switch-${task.id}`}
          onClick={() => toggle(task.id)}
          type="button"
        >
          {task.task}
        </button>
      </td>
      <td className="uz-model-mono">
        {primary}
        <span aria-hidden="true" className="uz-model-compat-ref">
          {legacyPrimary}
        </span>
        {swapped ? <StatusBadge tone="info">已切换 · local</StatusBadge> : null}
      </td>
      <td className="uz-model-mono">{fallback}</td>
      <td className="uz-model-mono">{task.cost}</td>
      <td className="uz-model-mono">{task.latency}</td>
      <td>
        <StatusBadge tone={task.failureTone}>{task.failure}</StatusBadge>
      </td>
      <td>
        <StatusBadge tone={task.evalTone}>{task.evalState}</StatusBadge>
      </td>
    </tr>
  );
}

function PanelHead({ icon, sub, title }: PanelHeadProps) {
  return (
    <header className="uz-model-panel-head">
      {icon ? <IconSlot icon={TriangleAlert} size="sm" /> : null}
      <h3>{title}</h3>
      <span className="uz-model-panel-sub">{sub}</span>
    </header>
  );
}

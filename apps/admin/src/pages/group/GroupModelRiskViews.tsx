import { Download, Lock, TriangleAlert } from "lucide-react";
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
    <div className="uz-model-note" data-testid="m7-model-runtime-note">
      <IconSlot icon={Lock} size="sm" />
      <strong>{modelRuntimeLabels.slice(0, 3).join(" · ")}</strong>
      <span>{modelRuntimeLabels.slice(3).join(" · ")}</span>
    </div>
  );
}

export function ModelStatePanel({ state }: StateProps) {
  const title = state === "permission" ? "permission denied" : state;
  return (
    <main className="uz-model-state" data-testid={`m7-model-state-${state}`}>
      <div>
        <h2>{title}</h2>
        <p>{`Synthetic ${title} state. ${modelRiskMeta.runtime}`}</p>
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
          <small>{`${kpi.delta} · mock/read-only`}</small>
        </article>
      ))}
    </section>
  );
}

export function ModelTaskMatrix({ swaps, toggle }: MatrixProps) {
  return (
    <section className="uz-model-panel" data-testid="m7-model-matrix">
      <PanelHead
        sub="degraded mock refs · no production model routing"
        title="模型任务矩阵"
      />
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
      <PanelHead
        sub="mock/read-only · not production cost metrics"
        title="成本构成 · 按租户"
      />
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
            <span aria-hidden className="uz-model-bar">
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
      <PanelHead
        icon
        sub="degraded mock · read-only · local action only"
        title="风险队列"
      />
      {risks.length === 0 ? (
        <div className="uz-model-empty-risk" data-testid="m7-model-risk-empty">
          暂无待处理风险；仅浏览器本地状态已清空，无生产风险关闭。
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
                  <StatusBadge tone="neutral">{`范围 · ${risk.scope}`}</StatusBadge>
                </p>
                <small>{`${risk.tenant} · ${risk.time} · local action only`}</small>
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

function PanelHead({
  icon,
  sub,
  title
}: {
  icon?: boolean;
  sub: string;
  title: string;
}) {
  return (
    <header className="uz-model-panel-head">
      {icon ? <IconSlot icon={TriangleAlert} size="sm" /> : null}
      <h3>{title}</h3>
      <span className="uz-model-panel-sub">{sub}</span>
    </header>
  );
}

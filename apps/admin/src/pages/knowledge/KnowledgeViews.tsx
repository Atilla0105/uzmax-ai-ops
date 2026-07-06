import type { KeyboardEvent, ReactNode } from "react";
import { ShieldAlert, TriangleAlert } from "lucide-react";
import { IconSlot } from "../../primitives";
import {
  evalLabel,
  feedbackLabel,
  stages,
  toneClass,
  type KnowledgeAsset,
  type KnowledgeFact,
  type KnowledgeSnippet
} from "./knowledgeFallback";

export interface DataRow {
  cells: ReactNode[];
  id: string;
  label?: string;
  testId?: string;
}

export function DataTable({
  columns,
  onOpen,
  rows,
  testId
}: {
  columns: string[];
  onOpen?: (id: string) => void;
  rows: DataRow[];
  testId?: string;
}) {
  const open = (id: string) => onOpen?.(id);
  const onKey = (event: KeyboardEvent<HTMLTableRowElement>, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open(id);
    }
  };
  return (
    <div className="uz-knowledge-table-wrap" data-testid={testId}>
      <table className="uz-knowledge-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              aria-label={row.label}
              className={onOpen ? "uz-knowledge-row" : undefined}
              data-testid={row.testId}
              key={row.id}
              onClick={() => open(row.id)}
              onKeyDown={(event) => onKey(event, row.id)}
              role={onOpen ? "button" : undefined}
              tabIndex={onOpen ? 0 : undefined}
            >
              {row.cells.map((cell, index) => (
                <td key={`${row.id}-${index}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function JourneyView({
  activeStageId,
  assets,
  setStage
}: {
  activeStageId: string;
  assets: KnowledgeAsset[];
  setStage: (id: string) => void;
}) {
  const activeStage = stages.find((stage) => stage.id === activeStageId) ?? stages[0]!;
  const stageAssets = assets.filter((asset) => activeStage.assets.includes(asset.id));
  const hasWarning = stageAssets.some((asset) => !asset.referenced);
  return (
    <main className="uz-knowledge-pad">
      <p className="uz-knowledge-count">阶段管线 · 查看素材关联与负反馈</p>
      <div
        className="uz-knowledge-table-wrap"
        data-testid="m7-knowledge-journey-stages"
      >
        <div className="uz-knowledge-stage-grid">
          {stages.map((stage, index) => (
            <button
              aria-pressed={stage.id === activeStage.id}
              className="uz-knowledge-stage"
              key={stage.id}
              onClick={() => setStage(stage.id)}
              type="button"
            >
              <strong>{`${index + 1}. ${stage.name}`}</strong>
              <span className="uz-knowledge-mono">{`自动定位 ${stage.rate}%`}</span>
              <br />
              <span>{feedbackLabel[stage.feedback]}</span>
            </button>
          ))}
        </div>
      </div>
      <section className="uz-knowledge-detail" data-testid="m7-knowledge-stage-detail">
        <h3>{activeStage.name} 阶段详情</h3>
        <div className="uz-knowledge-stack">
          {stageAssets.map((asset) => (
            <article className="uz-knowledge-card" key={asset.id}>
              <h3>{asset.title}</h3>
              <p>{`${asset.displayRef} · ${asset.referenced ? "已关联" : "未关联"}`}</p>
            </article>
          ))}
        </div>
        {hasWarning ? (
          <div
            className="uz-knowledge-warning"
            data-runtime-boundary="mock read-only no formal knowledge write"
            data-testid="m7-knowledge-journey-warning"
            title="mock read-only no formal knowledge write"
          >
            <IconSlot icon={TriangleAlert} size="sm" />
            <span>该阶段存在未关联素材，建议补充对应话术或关联素材。</span>
          </div>
        ) : null}
      </section>
    </main>
  );
}

export function FactsView({
  activeFact,
  facts,
  setFact,
  toggleRedline
}: {
  activeFact: KnowledgeFact | undefined;
  facts: KnowledgeFact[];
  setFact: (id: string) => void;
  toggleRedline: (id: string) => void;
}) {
  const rows = facts.map((fact) => ({
    cells: [
      fact.title,
      fact.category,
      <span className="uz-knowledge-mono">{fact.hits}</span>,
      <span className="uz-knowledge-mono">{fact.feedback}</span>,
      <span className="uz-knowledge-mono">{fact.version}</span>,
      <span className={toneClass(fact.evaluation === "blocked" ? "danger" : "info")}>
        {evalLabel[fact.evaluation]}
      </span>
    ],
    id: fact.id,
    label: `open fact ${fact.id}`,
    testId: `m7-knowledge-fact-row-${fact.id}`
  }));
  return (
    <main className="uz-knowledge-split">
      <section className="uz-knowledge-pad">
        <p className="uz-knowledge-count">{facts.length} 条事实条目 · 查看详情与红线</p>
        <DataTable
          columns={["条目", "分类", "命中", "负反馈", "版本", "评测"]}
          onOpen={setFact}
          rows={rows}
          testId="m7-knowledge-facts-table"
        />
      </section>
      {activeFact ? (
        <aside className="uz-knowledge-side" data-testid="m7-knowledge-fact-detail">
          <h3>{activeFact.title}</h3>
          <p>{activeFact.content}</p>
          <p
            className="uz-knowledge-mono"
            data-source-ref={activeFact.sourceRef}
            title={`controlled source ${activeFact.sourceRef}`}
          >
            来源已归档
          </p>
          <button
            aria-pressed={activeFact.redline}
            className="uz-knowledge-btn"
            data-runtime-boundary="read-only local-only no formal knowledge write"
            data-testid="m7-knowledge-redline-toggle"
            onClick={() => toggleRedline(activeFact.id)}
            title="read-only local-only no formal knowledge write"
            type="button"
          >
            <IconSlot icon={ShieldAlert} size="sm" />
            {activeFact.redline ? "红线条目 · 命中必转人工" : "红线标记 · 关闭"}
          </button>
        </aside>
      ) : null}
    </main>
  );
}

export function SnippetsView({
  snippets,
  testId
}: {
  snippets: KnowledgeSnippet[];
  testId: "m7-knowledge-private-snippets" | "m7-knowledge-public-snippets";
}) {
  return (
    <main className="uz-knowledge-pad" data-testid={testId}>
      <p className="uz-knowledge-count">{snippets.length} 条话术</p>
      <div className="uz-knowledge-stack">
        {snippets.map((snippet) => (
          <article className="uz-knowledge-card" key={snippet.id}>
            <h3>{snippet.title}</h3>
            <p>{snippet.content}</p>
            <p className="uz-knowledge-mono">{`${snippet.category} · ${snippet.edited}`}</p>
          </article>
        ))}
      </div>
    </main>
  );
}

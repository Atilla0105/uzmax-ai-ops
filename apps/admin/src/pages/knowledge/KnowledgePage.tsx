import { useMemo, useState } from "react";
import { TableProperties } from "lucide-react";
import { IconSlot } from "../../primitives";
import {
  KnowledgeAssetDetail,
  KnowledgeRuntimeNote,
  KnowledgeToolbar,
  assets as initialAssets,
  facts as initialFacts,
  filterByQuery,
  knowledgeStyles,
  knowledgeTabs,
  readKnowledgeViewState,
  snippets,
  templateSources,
  templateStatusLabel,
  templateTone,
  toneClass,
  type KnowledgeAsset,
  type KnowledgeTab,
  type TemplateSource
} from "./knowledgeFallback";
import {
  DataTable,
  FactsView,
  JourneyView,
  SnippetsView,
  StatePanel,
  type DataRow
} from "./KnowledgeViews";

export function KnowledgePage({ selectedTenantId }: { selectedTenantId: string }) {
  const viewState = readKnowledgeViewState();
  const [tab, setTab] = useState<KnowledgeTab>("journey");
  const [query, setQuery] = useState("");
  const [activeStageId, setActiveStageId] = useState("SYN-KB-STAGE-001");
  const [facts, setFacts] = useState(initialFacts);
  const [activeFactId, setActiveFactId] = useState(initialFacts[0]?.id ?? "");
  const [assets, setAssets] = useState(initialAssets);
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
  const [editingAsset, setEditingAsset] = useState(false);
  const [assetDraft, setAssetDraft] = useState("");
  const activeFact = facts.find((fact) => fact.id === activeFactId);
  const activeAsset = assets.find((asset) => asset.id === activeAssetId);
  const filteredFacts = useMemo(() => filterByQuery(facts, query), [facts, query]);
  const filteredAssets = useMemo(() => filterByQuery(assets, query), [assets, query]);
  const assetRows = useMemo(() => createAssetRows(filteredAssets), [filteredAssets]);
  const filteredSnippets = useMemo(
    () =>
      filterByQuery(
        snippets.filter((item) => item.scope === tab),
        query
      ),
    [query, tab]
  );
  const showToolbar =
    tab === "facts" || tab === "public" || tab === "private" || tab === "assets";

  function toggleRedline(id: string) {
    setFacts((current) =>
      current.map((fact) =>
        fact.id === id ? { ...fact, redline: !fact.redline } : fact
      )
    );
  }

  function startEdit(asset: KnowledgeAsset) {
    setAssetDraft(asset.content);
    setEditingAsset(true);
  }

  function saveAsset(asset: KnowledgeAsset) {
    setAssets((current) =>
      current.map((item) =>
        item.id === asset.id ? { ...item, content: assetDraft } : item
      )
    );
    setEditingAsset(false);
  }

  function deleteAsset(id: string) {
    setAssets((current) => current.filter((asset) => asset.id !== id));
    setActiveAssetId(null);
    setEditingAsset(false);
  }

  return (
    <section
      aria-label="知识与资源"
      className="uz-knowledge-page"
      data-runtime-boundary="mock degraded read-only knowledge runtime unavailable no production knowledge data no formal knowledge write no automatic publish no DB/API closure"
      data-runtime-state="degraded"
      data-tenant-id={selectedTenantId}
      data-testid="m7-knowledge-page"
      title="mock degraded read-only knowledge runtime unavailable no production knowledge data no formal knowledge write no automatic publish no DB/API closure"
    >
      <style>{knowledgeStyles}</style>
      <header className="uz-knowledge-head">
        <h2 className="uz-knowledge-title">知识与资源</h2>
        <nav className="uz-knowledge-tabs" aria-label="知识与资源 tabs">
          {knowledgeTabs.map((item) => (
            <button
              aria-pressed={tab === item.id}
              className="uz-knowledge-tab"
              data-testid={`m7-knowledge-tab-${item.id}`}
              key={item.id}
              onClick={() => {
                setTab(item.id);
                setActiveAssetId(null);
                setEditingAsset(false);
              }}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>
      <KnowledgeRuntimeNote />
      {showToolbar ? (
        <KnowledgeToolbar query={query} setQuery={setQuery} tab={tab} />
      ) : null}
      <section className="uz-knowledge-scroll">{renderContent()}</section>
    </section>
  );

  function renderContent() {
    if (viewState !== "degraded") return <StatePanel state={viewState} />;
    if (tab === "journey")
      return (
        <JourneyView
          activeStageId={activeStageId}
          assets={assets}
          setStage={setActiveStageId}
        />
      );
    if (tab === "facts")
      return (
        <FactsView
          activeFact={activeFact}
          facts={filteredFacts}
          setFact={setActiveFactId}
          toggleRedline={toggleRedline}
        />
      );
    if (tab === "public" || tab === "private")
      return (
        <SnippetsView
          snippets={filteredSnippets}
          testId={
            tab === "public"
              ? "m7-knowledge-public-snippets"
              : "m7-knowledge-private-snippets"
          }
        />
      );
    if (tab === "assets" && activeAsset)
      return (
        <KnowledgeAssetDetail
          asset={activeAsset}
          draft={assetDraft}
          editing={editingAsset}
          onCancel={() => setEditingAsset(false)}
          onDelete={() => deleteAsset(activeAsset.id)}
          onDraft={setAssetDraft}
          onEdit={() => startEdit(activeAsset)}
          onSave={() => saveAsset(activeAsset)}
        />
      );
    if (tab === "assets")
      return (
        <main className="uz-knowledge-pad">
          <p className="uz-knowledge-count">
            {filteredAssets.length} 个素材 · 点击行查看 / 编辑详情
          </p>
          <DataTable
            columns={[
              "名称",
              "类型",
              "格式 / 大小",
              "storageRef",
              "缓存",
              "阶段",
              "引用"
            ]}
            onOpen={setActiveAssetId}
            rows={assetRows}
            testId="m7-knowledge-assets-table"
          />
        </main>
      );
    return <TemplatesView rows={templateSources} />;
  }
}

function createAssetRows(rows: KnowledgeAsset[]): DataRow[] {
  return rows.map((asset) => ({
    cells: [
      asset.title,
      asset.type,
      `${asset.format} · ${asset.size}`,
      <span
        className="uz-knowledge-mono"
        data-source-ref={asset.ref}
        title={`controlled source ${asset.ref}`}
      >
        {asset.displayRef}
      </span>,
      asset.cached ? "已缓存" : "未缓存",
      asset.stage,
      asset.referenced ? "已引用" : "未引用"
    ],
    id: asset.id,
    label: `open asset ${asset.id}`,
    testId: `m7-knowledge-asset-row-${asset.id}`
  }));
}

function TemplatesView({ rows }: { rows: TemplateSource[] }) {
  const tableRows = rows.map((row) => ({
    cells: [
      <>
        <IconSlot icon={TableProperties} size="sm" /> {row.title}
      </>,
      <span className="uz-knowledge-mono">{row.localVersion}</span>,
      <span className="uz-knowledge-mono">{row.sourceVersion}</span>,
      row.copied,
      <span className={toneClass(templateTone(row.status))}>
        {templateStatusLabel[row.status]}
      </span>,
      <span
        className="uz-knowledge-mono"
        data-source-ref={row.sourceRef}
        title={`controlled source ${row.sourceRef}`}
      >
        模板库
      </span>
    ],
    id: row.id
  }));
  return (
    <main className="uz-knowledge-pad" data-testid="m7-knowledge-template-source">
      <p className="uz-knowledge-count">
        {rows.length} 个模板来源 · 查看同步状态与评测集入口
      </p>
      <DataTable
        columns={["模板名", "本地版本", "来源版本", "复制时间", "状态", "来源"]}
        rows={tableRows}
      />
    </main>
  );
}

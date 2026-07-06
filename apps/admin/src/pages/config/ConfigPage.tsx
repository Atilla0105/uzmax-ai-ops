import { useState } from "react";
import {
  Briefcase,
  Copy,
  Plug,
  Radio,
  RotateCcw,
  Route,
  Shield,
  Timer,
  ZapOff,
  type LucideIcon
} from "lucide-react";
import { IconSlot } from "../../primitives";
import {
  configMeta,
  configRuntimeBoundary,
  configSectionLabels,
  configSections,
  configStyles,
  useConfigPageState,
  type ConfigConnector,
  type ConfigSection,
  type ConfigVersion
} from "./configFallback";
import { LocalConfirm, RuntimeNote, Toast } from "./ConfigConfirm";
import { sectionViews, versionCopy } from "./ConfigSections";

const sectionIcons: Record<ConfigSection, LucideIcon> = {
  biz: Briefcase,
  breaker: ZapOff,
  channel: Radio,
  connector: Plug,
  cost: Shield,
  model: Route,
  sla: Timer,
  tmpl: Copy
};

const configParityStyles = `.uz-config-side{width:236px}.uz-config-nav button{gap:10px;font-weight:500}.uz-config-nav button[aria-pressed=true]{font-weight:600}.uz-config-nav .uz-icon-slot{flex:none;color:currentColor}.uz-config-main{background:var(--paper);overflow-y:auto;padding:20px 24px}.uz-config-head{margin:0 0 16px;border:0;background:transparent;padding:0}.uz-config-head-row{align-items:center;gap:12px;flex-wrap:wrap}.uz-config-head-main{display:flex;min-width:0;align-items:center;gap:12px;flex-wrap:wrap}.uz-config-title{font:700 18px/1.35 var(--font-display)}.uz-config-meta{font-family:var(--font-data);font-size:11px}.uz-config-dirty-badge{border-radius:5px;background:var(--state-warn-bg);color:var(--state-warn);font:700 11px/1 var(--font-body);padding:2px 8px}.uz-config-tools{gap:8px}.uz-config-mini{gap:5px}.uz-config-body{gap:16px;padding:0}.uz-config-source-mark,.uz-config-note{position:absolute;display:block;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;padding:0;background:transparent}.uz-config-source-mark[hidden],.uz-config-note[hidden]{display:none!important}.uz-config-grid{max-width:640px;padding:18px}.uz-config-history-head{color:var(--ink-500);font-weight:600}.uz-config-connector{max-width:560px}.uz-config-connector .uz-config-kv:first-child strong{color:var(--ink-900)}@media(max-width:820px){.uz-config-main{padding:12px}.uz-config-head-row{align-items:flex-start;flex-direction:column}.uz-config-head-main{align-items:flex-start;flex-direction:column;gap:6px}.uz-config-tools{width:100%;margin-left:0;flex-wrap:wrap}.uz-config-nav button{gap:8px}}@media(max-width:420px){.uz-config-title{font-size:15px}.uz-config-meta{overflow-wrap:anywhere}.uz-config-tools .uz-config-mini,.uz-config-tools .uz-config-btn{width:100%}}`;

export function ConfigPage({ selectedTenantId }: { selectedTenantId: string }) {
  const state = useConfigPageState();
  const [rollbackTarget, setRollbackTarget] = useState<ConfigVersion | null>(null);
  const [switchTarget, setSwitchTarget] = useState<ConfigConnector["mode"] | null>(
    null
  );
  const [reason, setReason] = useState("");
  const historyOpen = state.historyOpen === state.section;
  const dirty = Boolean(state.dirty[state.section]);
  const openRollback = (target: ConfigVersion) => {
    setRollbackTarget(target);
    setReason("");
  };
  const openSwitch = (mode: ConfigConnector["mode"]) => {
    setSwitchTarget(mode);
    setReason("");
  };
  return (
    <section
      aria-description={configRuntimeBoundary}
      className="uz-config-page"
      data-runtime-boundary={configRuntimeBoundary}
      data-runtime-source={configMeta.source}
      data-runtime-state={state.viewState}
      data-selected-tenant-id={selectedTenantId}
      data-testid="m7-config-page"
      title={configRuntimeBoundary}
    >
      <style>{`${configStyles}${configParityStyles}`}</style>
      <SideNav section={state.section} setSection={state.setSection} />
      <section className="uz-config-main">
        <header className="uz-config-head" data-testid="m7-config-version-head">
          <div className="uz-config-head-row">
            <div className="uz-config-head-main">
              <h2 className="uz-config-title">{configSectionLabels[state.section]}</h2>
              <span className="uz-config-meta" data-testid="m7-config-version-meta">
                当前版本 v{state.version.ver} · {versionCopy(state)}
              </span>
              {dirty ? (
                <span className="uz-config-dirty-badge">未保存的修改</span>
              ) : null}
            </div>
            <div className="uz-config-tools">
              {state.sectionHistory.length ? (
                <button
                  className="uz-config-mini"
                  onClick={() =>
                    state.setHistoryOpen(historyOpen ? null : state.section)
                  }
                  type="button"
                >
                  <IconSlot icon={RotateCcw} size="sm" />
                  {historyOpen
                    ? "收起版本历史"
                    : `版本历史（${state.sectionHistory.length}）`}
                </button>
              ) : null}
              {state.isDirtyable ? (
                <button
                  className="uz-config-btn is-primary"
                  data-testid="m7-config-save"
                  disabled={!dirty}
                  onClick={state.save}
                  type="button"
                >
                  保存并生成版本
                </button>
              ) : null}
            </div>
          </div>
        </header>
        <RuntimeNote />
        <Toast message={state.toast} />
        {state.isDegraded ? (
          <main className="uz-config-body">
            <p
              className="uz-config-source-mark"
              data-runtime-boundary={configRuntimeBoundary}
              data-testid="m7-config-source-mark"
              hidden
            >
              {configMeta.source} · {configMeta.subtitle}
            </p>
            {historyOpen ? (
              <History history={state.sectionHistory} onOpenRollback={openRollback} />
            ) : null}
            {sectionViews[state.section]({
              connectorSwitch: openSwitch,
              draft: state.draft,
              state
            })}
          </main>
        ) : (
          <main
            aria-description={configRuntimeBoundary}
            className="uz-config-state"
            data-runtime-boundary={configRuntimeBoundary}
            data-testid={`m7-config-state-${state.viewState}`}
            title={configRuntimeBoundary}
          >
            <div>
              <h2>{state.stateCopy.title}</h2>
              <p>{state.stateCopy.body}</p>
              <span hidden>{configRuntimeBoundary}</span>
            </div>
          </main>
        )}
      </section>
      <LocalConfirm
        kind="rollback"
        onClose={() => setRollbackTarget(null)}
        reason={reason}
        rollbackTarget={rollbackTarget}
        state={state}
        setReason={setReason}
      />
      <LocalConfirm
        kind="switch"
        onClose={() => setSwitchTarget(null)}
        reason={reason}
        state={state}
        setReason={setReason}
        switchTarget={switchTarget}
      />
    </section>
  );
}

function SideNav({
  section,
  setSection
}: {
  section: ConfigSection;
  setSection: (section: ConfigSection) => void;
}) {
  return (
    <aside className="uz-config-side" data-testid="m7-config-internal-nav">
      <h2>配置</h2>
      <nav aria-label="配置段" className="uz-config-nav">
        {configSections.map((item) => (
          <button
            aria-pressed={item.id === section}
            key={item.id}
            onClick={() => setSection(item.id)}
            type="button"
          >
            <IconSlot icon={sectionIcons[item.id]} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

function History({
  history,
  onOpenRollback
}: {
  history: readonly ConfigVersion[];
  onOpenRollback: (version: ConfigVersion) => void;
}) {
  return (
    <section className="uz-config-history" data-testid="m7-config-history">
      <div className="uz-config-history-head">版本历史 · 回滚需二次确认并写审计</div>
      {history.map((item) => (
        <div className="uz-config-history-row" key={item.ver}>
          <span className="uz-config-version">v{item.ver}</span>
          <div className="uz-config-row-main">
            <div className="uz-config-row-title">{item.note}</div>
            <div className="uz-config-row-sub">
              {item.by} · {item.at}
            </div>
          </div>
          <button
            className="uz-config-danger"
            onClick={() => onOpenRollback(item)}
            type="button"
          >
            回滚到此版本
          </button>
        </div>
      ))}
    </section>
  );
}

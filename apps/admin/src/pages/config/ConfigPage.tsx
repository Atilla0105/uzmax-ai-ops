import { useState, type ReactNode } from "react";
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
import { ConfirmModal } from "../../patterns";
import { IconSlot, StatusBadge } from "../../primitives";
import {
  configMeta,
  configRuntimeBoundary,
  configRuntimeLabels,
  configSectionLabels,
  configSections,
  configStyles,
  routeColumns,
  routeRows,
  selectOptions,
  templateRows,
  useConfigPageState,
  type ConfigConnector,
  type ConfigDraft,
  type ConfigSection,
  type ConfigVersion
} from "./configFallback";

type PageState = ReturnType<typeof useConfigPageState>;
type ViewProps = {
  connectorSwitch: (mode: ConfigConnector["mode"]) => void;
  draft: ConfigDraft;
  state: PageState;
};

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

// prettier-ignore
const sectionViews: Record<ConfigSection, (props: ViewProps) => ReactNode> = {
  biz: ({ draft, state }) => <section className="uz-config-panel uz-config-grid"><Field label="默认语言"><Sel opts={selectOptions.lang} set={(v) => state.update.biz("lang", v)} v={draft.biz.lang} /></Field><Field label="默认时区"><Sel opts={selectOptions.timezone} set={(v) => state.update.biz("timezone", v)} v={draft.biz.timezone} /></Field><Field label="转人工兜底渠道"><Sel opts={selectOptions.handoff} set={(v) => state.update.biz("handoffChannel", v)} v={draft.biz.handoffChannel} /></Field><Field label="单成员接待上限"><Num set={(v) => state.update.biz("cap", v)} v={draft.biz.cap} /></Field></section>,
  breaker: ({ draft, state }) => <Rows fixed="AllProvidersDown · 立即熔断 · 固定策略" rows={draft.breakers} set={state.update.breaker} />,
  channel: ({ draft, state }) => <section className="uz-config-stack">{draft.channels.map((c) => <article className="uz-config-panel uz-config-row" key={c.id}><div className="uz-config-row-main"><div className="uz-config-row-title">{c.name}</div><div className="uz-config-row-sub">{c.desc} · 最近测试 {c.lastTest} · 状态 {c.status}</div></div><button className="uz-config-mini" onClick={() => state.update.channelTest(c.id)} type="button">测试连接</button><button aria-pressed={c.enabled} className="uz-config-switch" onClick={() => state.update.channelToggle(c.id)} type="button"><span /></button><StatusBadge tone={c.enabled ? "ok" : "neutral"}>{c.enabled ? "已启用" : "已停用"}</StatusBadge></article>)}</section>,
  connector: ({ connectorSwitch, draft, state }) => { const c = draft.connector; const isApi = c.mode === "api"; return <section className="uz-config-panel uz-config-connector"><Kv k="当前主路径" v={isApi ? "订单 API（主路径）" : "导入快照（主路径）"} /><Kv k="订单 API 健康度" v={c.apiHealth} /><Kv k="最近错误" v={c.lastError} /><Kv k="最近同步" v={c.lastSync} /><div className="uz-config-actions"><button className="uz-config-mini" onClick={state.update.connectorTest} type="button">测试连接</button><button className="uz-config-danger" onClick={() => connectorSwitch(isApi ? "import" : "api")} type="button">{isApi ? "切换为导入快照主路径" : "切换回订单 API 主路径"}</button><button className="uz-config-link" type="button">查看导入历史 →</button></div></section>; },
  cost: ({ draft, state }) => <Rows rows={draft.guardrails} set={state.update.guard} suffix="集团上限" />,
  model: () => <MiniTable cols={routeColumns} rows={routeRows} />,
  sla: ({ draft, state }) => <MiniTable cols={["优先级", "首次响应（分钟）", "解决时限（分钟）"]} rows={draft.sla.map((r) => [r.label, <Num key="first" set={(v) => state.update.sla(r.id, "first", v)} v={r.first} />, <Num key="resolve" set={(v) => state.update.sla(r.id, "resolve", v)} v={r.resolve} />])} />,
  tmpl: () => <MiniTable cols={["模板名", "本地版本", "来源版本", "复制时间", "状态", "操作"]} rows={templateRows.map((r) => [...r, r[4] === "有更新" ? "同步更新" : "查看"])} />
};

// prettier-ignore
export function ConfigPage({ selectedTenantId }: { selectedTenantId: string }) {
  const state = useConfigPageState();
  const [rollbackTarget, setRollbackTarget] = useState<ConfigVersion | null>(null);
  const [switchTarget, setSwitchTarget] = useState<ConfigConnector["mode"] | null>(null);
  const [reason, setReason] = useState("");
  const historyOpen = state.historyOpen === state.section;
  const dirty = Boolean(state.dirty[state.section]);
  const openRollback = (target: ConfigVersion) => { setRollbackTarget(target); setReason(""); };
  const openSwitch = (mode: ConfigConnector["mode"]) => { setSwitchTarget(mode); setReason(""); };
  return (
    <section aria-description={configRuntimeBoundary} className="uz-config-page" data-runtime-boundary={configRuntimeBoundary} data-runtime-source={configMeta.source} data-runtime-state={state.viewState} data-selected-tenant-id={selectedTenantId} data-testid="m7-config-page" title={configRuntimeBoundary}>
      <style>{`${configStyles}${configParityStyles}`}</style>
      <SideNav section={state.section} setSection={state.setSection} />
      <section className="uz-config-main">
        <header className="uz-config-head" data-testid="m7-config-version-head"><div className="uz-config-head-row"><div className="uz-config-head-main"><h2 className="uz-config-title">{configSectionLabels[state.section]}</h2><span className="uz-config-meta" data-testid="m7-config-version-meta">当前版本 v{state.version.ver} · {versionCopy(state)}</span>{dirty ? <span className="uz-config-dirty-badge">未保存的修改</span> : null}</div><div className="uz-config-tools">{state.sectionHistory.length ? <button className="uz-config-mini" onClick={() => state.setHistoryOpen(historyOpen ? null : state.section)} type="button"><IconSlot icon={RotateCcw} size="sm" />{historyOpen ? "收起版本历史" : `版本历史（${state.sectionHistory.length}）`}</button> : null}{state.isDirtyable ? <button className="uz-config-btn is-primary" data-testid="m7-config-save" disabled={!dirty} onClick={state.save} type="button">保存并生成版本</button> : null}</div></div></header>
        <RuntimeNote />
        <Toast message={state.toast} />
        {state.isDegraded ? <main className="uz-config-body"><p className="uz-config-source-mark" data-runtime-boundary={configRuntimeBoundary} data-testid="m7-config-source-mark" hidden>{configMeta.source} · {configMeta.subtitle}</p>{historyOpen ? <History history={state.sectionHistory} onOpenRollback={openRollback} /> : null}{sectionViews[state.section]({ connectorSwitch: openSwitch, draft: state.draft, state })}</main> : <main aria-description={configRuntimeBoundary} className="uz-config-state" data-runtime-boundary={configRuntimeBoundary} data-testid={`m7-config-state-${state.viewState}`} title={configRuntimeBoundary}><div><h2>{state.stateCopy.title}</h2><p>{state.stateCopy.body}</p><span hidden>{configRuntimeBoundary}</span></div></main>}
      </section>
      <LocalConfirm kind="rollback" onClose={() => setRollbackTarget(null)} reason={reason} rollbackTarget={rollbackTarget} state={state} setReason={setReason} />
      <LocalConfirm kind="switch" onClose={() => setSwitchTarget(null)} reason={reason} state={state} setReason={setReason} switchTarget={switchTarget} />
    </section>
  );
}

// prettier-ignore
function SideNav({ section, setSection }: { section: ConfigSection; setSection: (section: ConfigSection) => void }) {
  return <aside className="uz-config-side" data-testid="m7-config-internal-nav"><h2>配置</h2><nav aria-label="配置段" className="uz-config-nav">{configSections.map((item) => <button aria-pressed={item.id === section} key={item.id} onClick={() => setSection(item.id)} type="button"><IconSlot icon={sectionIcons[item.id]} /><span>{item.label}</span></button>)}</nav></aside>;
}

// prettier-ignore
function RuntimeNote() {
  return <div className="uz-config-note" data-runtime-boundary={configRuntimeBoundary} data-testid="m7-config-runtime-note" hidden title={configRuntimeBoundary}><strong>{configRuntimeLabels.slice(0, 3).join(" · ")}</strong><span>{configRuntimeLabels.slice(3).join(" · ")}</span></div>;
}

// prettier-ignore
function Toast({ message }: { message: string }) {
  return message ? <div aria-atomic="true" aria-live="polite" className="uz-config-toast" data-runtime-boundary={configRuntimeBoundary} data-testid="m7-config-toast" role="status" title={configRuntimeBoundary}>{message}<span hidden>{configRuntimeBoundary}</span></div> : null;
}

// prettier-ignore
function History({ history, onOpenRollback }: { history: readonly ConfigVersion[]; onOpenRollback: (version: ConfigVersion) => void }) {
  return <section className="uz-config-history" data-testid="m7-config-history"><div className="uz-config-history-head">版本历史 · 回滚需二次确认并写审计</div>{history.map((item) => <div className="uz-config-history-row" key={item.ver}><span className="uz-config-version">v{item.ver}</span><div className="uz-config-row-main"><div className="uz-config-row-title">{item.note}</div><div className="uz-config-row-sub">{item.by} · {item.at}</div></div><button className="uz-config-danger" onClick={() => onOpenRollback(item)} type="button">回滚到此版本</button></div>)}</section>;
}

function LocalConfirm({
  kind,
  onClose,
  reason,
  rollbackTarget,
  state,
  setReason,
  switchTarget
}: {
  kind: "rollback" | "switch";
  onClose: () => void;
  reason: string;
  rollbackTarget?: ConfigVersion | null;
  state: PageState;
  setReason: (reason: string) => void;
  switchTarget?: ConfigConnector["mode"] | null;
}) {
  const isRollback = kind === "rollback";
  const open = isRollback ? Boolean(rollbackTarget) : Boolean(switchTarget);
  const targetLabel = switchTarget === "api" ? "订单 API" : "导入快照";
  const confirm = () => {
    if (rollbackTarget) state.rollback(rollbackTarget);
    if (switchTarget) state.update.connectorSwitch(switchTarget);
    onClose();
  };
  return (
    <ConfirmModal
      cancelLabel="取消"
      confirmLabel={isRollback ? "回滚" : "确认本地切换"}
      danger
      description={
        isRollback
          ? `${configSectionLabels[state.section]}将显示为 v${rollbackTarget?.ver} 的回滚预览，确认后进入版本变更队列。`
          : `订单主路径将切换为 ${targetLabel} 的预览状态，确认后进入变更队列。`
      }
      onCancel={onClose}
      onConfirm={confirm}
      open={open}
      reason={{
        label: isRollback ? "回滚原因" : "切换原因",
        onChange: setReason,
        placeholder: isRollback ? "填写回滚原因（必填）" : "填写切换原因（必填）",
        required: true,
        value: reason
      }}
      title={isRollback ? `回滚到 v${rollbackTarget?.ver}？` : "切换订单数据主路径？"}
    >
      <span
        data-runtime-boundary={configRuntimeBoundary}
        hidden
        title={configRuntimeBoundary}
      >
        {configRuntimeBoundary}
      </span>
    </ConfirmModal>
  );
}

// prettier-ignore
function Rows({ fixed, rows, set, suffix }: { fixed?: string; rows: readonly { cap?: string; editable?: boolean; k: string; v: string }[]; set: (index: number, value: string) => void; suffix?: string }) {
  return <section className="uz-config-panel uz-config-stack">{rows.map((r, i) => <div className="uz-config-row" key={r.k}><div className="uz-config-row-main"><div className="uz-config-row-title">{r.k}</div>{r.editable === false ? <div className="uz-config-row-sub">集团层设置 · 只读</div> : null}</div>{r.editable === false ? <strong className="is-mono">¥{r.v}</strong> : <Num set={(v) => set(i, v)} v={r.v} />}{r.cap ? <span className="uz-config-muted">/ ¥{r.cap} {suffix}</span> : null}</div>)}{fixed ? <div className="uz-config-row"><strong>{fixed}</strong></div> : null}</section>;
}

// prettier-ignore
function MiniTable({ cols, rows }: { cols: readonly string[]; rows: readonly ReactNode[][] }) {
  return <section className="uz-config-panel"><div className="uz-config-table-wrap"><table className="uz-config-table"><thead><tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td className={j ? "is-mono" : "is-strong"} key={j}>{cell}</td>)}</tr>)}</tbody></table></div></section>;
}

// prettier-ignore
function Field({ children, label }: { children: ReactNode; label: string }) {
  return <div className="uz-config-field"><label>{label}</label>{children}</div>;
}

// prettier-ignore
function Sel({ opts, set, v }: { opts: readonly string[]; set: (v: string) => void; v: string }) {
  return <select onChange={(e) => set(e.currentTarget.value)} value={v}>{opts.map((o) => <option key={o}>{o}</option>)}</select>;
}

function Num({ set, v }: { set: (v: string) => void; v: string }) {
  return <input onChange={(e) => set(e.currentTarget.value)} type="number" value={v} />;
}

// prettier-ignore
function Kv({ k, v }: { k: string; v: string }) {
  return <div className="uz-config-kv"><span>{k}</span><strong>{v}</strong></div>;
}

function versionCopy(state: PageState) {
  return state.section === "tmpl"
    ? "来自集团模板中心 · 独立版本"
    : `${state.version.by} 修改于 ${state.version.at}`;
}

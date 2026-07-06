import {
  useState,
  type Dispatch,
  type FormEvent,
  type MouseEvent,
  type SetStateAction
} from "react";
import { ConfirmModal } from "../../patterns";
import {
  configSectionLabels,
  configStyles,
  dirtyableSections,
  initialDraft,
  initialHistory,
  initialVersions,
  readConfigViewState,
  type ConfigConnector,
  type ConfigDraft,
  type ConfigSection,
  type ConfigVersion
} from "./configFallback";
import { renderConfig } from "./configMarkup";

type ConfirmTarget =
  | { kind: "rollback"; version: ConfigVersion }
  | { kind: "switch"; mode: ConfigConnector["mode"] }
  | null;
type DraftSetter = Dispatch<SetStateAction<ConfigDraft>>;
type DirtySetter = Dispatch<SetStateAction<Partial<Record<ConfigSection, boolean>>>>;
type ToastSetter = Dispatch<SetStateAction<string>>;
type VersionSetter = Dispatch<SetStateAction<Record<ConfigSection, ConfigVersion>>>;

export function ConfigPage({ selectedTenantId }: { selectedTenantId: string }) {
  const viewState = readConfigViewState();
  const [section, setSection] = useState<ConfigSection>("biz");
  const [draft, setDraft] = useState<ConfigDraft>(initialDraft);
  const [versions, setVersions] = useState(initialVersions);
  const [history, setHistory] = useState(initialHistory);
  const [dirty, setDirty] = useState<Partial<Record<ConfigSection, boolean>>>({});
  const [historyOpen, setHistoryOpen] = useState<ConfigSection | null>(null);
  const [toast, setToast] = useState("");
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);
  const [reason, setReason] = useState("");
  const sectionHistory = history[section] ?? [];
  const isDirtyable = dirtyableSections.includes(section);
  const isRollback = confirmTarget?.kind === "rollback";
  const switchMode =
    confirmTarget?.kind === "switch"
      ? confirmTarget.mode === "api"
        ? "订单 API"
        : "导入快照"
      : "";
  const rendered = renderConfig({
    dirty: Boolean(dirty[section]),
    draft,
    history: sectionHistory,
    historyOpen: historyOpen === section,
    isDirtyable,
    section,
    selectedTenantId,
    toast,
    version: versions[section],
    viewState
  });
  const save = () => {
    if (!dirty[section]) return;
    const currentVersion = versions[section];
    setHistory((current) => ({
      ...current,
      [section]: [
        { ...currentVersion, note: `${configSectionLabels[section]}本地修改` },
        ...(current[section] ?? [])
      ]
    }));
    setVersions((current) => ({
      ...current,
      [section]: { at: "刚刚", by: "browser-local", ver: currentVersion.ver + 1 }
    }));
    setDirty((current) => ({ ...current, [section]: false }));
    setToast("保存并生成本地版本；no production config write / no audit write");
  };
  const actionHandlers: Record<string, (id?: string) => void> = {
    rollback: (id) => openRollback(id, sectionHistory, setConfirmTarget),
    save: () => save(),
    "set-section": (id) => {
      if (isConfigSection(id)) setSection(id);
    },
    "switch-connector": (id) => {
      if (id !== "api" && id !== "import") return;
      setReason("");
      setConfirmTarget({ kind: "switch", mode: id });
    },
    "test-channel": (id) => {
      if (id) testChannel(setToast);
    },
    "test-connector": () => testConnector(setToast),
    "toggle-channel": (id) => {
      if (id) markDirty("channel", setDirty);
    },
    "toggle-history": () =>
      setHistoryOpen((current) => (current === section ? null : section))
  };
  const runAction = (action?: string, id?: string) => {
    if (!action) return;
    actionHandlers[action]?.(id);
  };
  const onInput = (event: FormEvent<HTMLElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLSelectElement))
      return;
    const fieldSection = sectionForField(target.dataset.field);
    if (fieldSection) markDirty(fieldSection, setDirty);
  };
  const onClick = (event: MouseEvent<HTMLElement>) => {
    const node = actionNode(event.target);
    runAction(node?.dataset.action, node?.dataset.id);
  };
  return (
    <section
      className="uz-config-page"
      data-runtime-state={viewState}
      data-tenant-id={selectedTenantId}
      data-testid="m7-config-page"
    >
      <style>{configStyles}</style>
      <div
        className="uz-config-layout"
        dangerouslySetInnerHTML={{ __html: rendered }}
        onClick={onClick}
        onInput={onInput}
      />
      <ConfirmModal
        confirmLabel={isRollback ? "回滚" : "确认本地切换"}
        danger
        description={
          isRollback
            ? `仅在浏览器本地把 ${configSectionLabels[section]} 显示为 v${confirmTarget.version.ver} 的回滚结果；no audit write / no production config write.`
            : `仅把订单主路径显示切换为 ${switchMode}；no dangerous action execution / no connector switch / no audit write.`
        }
        onCancel={() => setConfirmTarget(null)}
        onConfirm={() => {
          applyConfirm(
            confirmTarget,
            section,
            setDraft,
            setDirty,
            setToast,
            setVersions
          );
          setConfirmTarget(null);
        }}
        open={Boolean(confirmTarget)}
        reason={{
          label: "原因",
          onChange: setReason,
          placeholder: "必填；仅 browser-local，不写审计",
          required: true,
          value: reason
        }}
        title={
          isRollback ? `回滚到 v${confirmTarget.version.ver}？` : "切换订单数据主路径？"
        }
      />
    </section>
  );
}

function applyConfirm(
  target: ConfirmTarget,
  section: ConfigSection,
  setDraft: DraftSetter,
  setDirty: DirtySetter,
  setToast: ToastSetter,
  setVersions: VersionSetter
) {
  if (!target) return;
  if (target.kind === "switch") return switchConnector(target.mode, setDraft, setToast);
  setVersions((current) => ({
    ...current,
    [section]: { at: "刚刚", by: "browser-local", ver: current[section].ver + 1 }
  }));
  setDirty((current) => ({ ...current, [section]: false }));
  setToast(
    `本地回滚到 v${target.version.ver}；no audit write / no production config write`
  );
}

function switchConnector(
  mode: ConfigConnector["mode"],
  setDraft: DraftSetter,
  setToast: ToastSetter
) {
  setDraft((current) => ({ ...current, connector: { ...current.connector, mode } }));
  setToast("订单主路径切换仅更新浏览器状态；no connector switch / no audit write");
}

function testConnector(setToast: ToastSetter) {
  setToast("connector 测试仅本地刷新；no API call / no audit write");
}

function testChannel(setToast: ToastSetter) {
  setToast("渠道测试仅本地通过；no connector switch / no audit write");
}

function openRollback(
  id: string | undefined,
  history: readonly ConfigVersion[],
  setConfirmTarget: Dispatch<SetStateAction<ConfirmTarget>>
) {
  const target = history.find((item) => String(item.ver) === id);
  if (target) setConfirmTarget({ kind: "rollback", version: target });
}

function markDirty(section: ConfigSection, setDirty: DirtySetter) {
  setDirty((current) => ({ ...current, [section]: true }));
}

function isConfigSection(value: string | undefined): value is ConfigSection {
  return Boolean(value && value in configSectionLabels);
}

function sectionForField(field: string | undefined): ConfigSection | null {
  if (!field) return null;
  if (field.startsWith("biz.")) return "biz";
  if (field.startsWith("sla.")) return "sla";
  return null;
}

function actionNode(target: EventTarget | null) {
  return target instanceof HTMLElement
    ? target.closest<HTMLElement>("[data-action]")
    : null;
}

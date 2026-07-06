import { useEffect, useRef, useState } from "react";
import { CopyModal, TemplateGrid, TemplateHeader } from "./GroupTemplateViews";
import {
  readTemplateViewState,
  templateCardsByTab,
  templateMeta,
  templateRuntimeBoundary,
  templateStateCopy,
  templateStyles,
  templateTabs,
  templateToast,
  type TemplateCard,
  type TemplateTabId,
  type TemplateViewState
} from "./groupTemplateFallback";

export function GroupTemplatePage() {
  const viewState = readTemplateViewState();
  const [activeTab, setActiveTab] = useState<TemplateTabId>("knowledge");
  const [copyCard, setCopyCard] = useState<TemplateCard | null>(null);
  const [selectedTargets, setSelectedTargets] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState("");
  const copyTriggerRef = useRef<HTMLButtonElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const selectedCount = Object.values(selectedTargets).filter(Boolean).length;
  const cards = templateCardsByTab[activeTab];

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
    }, 3200);
  };
  const returnCopyFocus = () => {
    window.setTimeout(() => copyTriggerRef.current?.focus(), 0);
  };
  const openCopy = (card: TemplateCard, trigger: HTMLButtonElement) => {
    copyTriggerRef.current = trigger;
    setCopyCard(card);
    setSelectedTargets({});
  };
  const closeCopy = () => {
    setCopyCard(null);
    setSelectedTargets({});
    returnCopyFocus();
  };
  const toggleTarget = (id: string) => {
    setSelectedTargets((targets) => ({ ...targets, [id]: !targets[id] }));
  };
  const confirmCopy = () => {
    if (!copyCard || selectedCount === 0) return;
    const tabLabel =
      templateTabs.find((tab) => tab.id === activeTab)?.label ?? "模板中心";
    showToast(templateToast(copyCard, selectedCount, tabLabel));
    closeCopy();
  };

  return (
    <section
      aria-description={templateRuntimeBoundary}
      className="uz-template-page"
      data-runtime-boundary={templateRuntimeBoundary}
      data-runtime-source={templateMeta.source}
      data-runtime-state={viewState}
      data-testid="m7-template-page"
      title={templateRuntimeBoundary}
    >
      <style>{templateStyles}</style>
      <TemplateHeader activeTab={activeTab} onChangeTab={setActiveTab} />
      <TemplateRuntimeNote />
      {toast ? (
        <div
          aria-description={templateRuntimeBoundary}
          aria-atomic="true"
          aria-live="polite"
          className="uz-template-toast"
          data-runtime-boundary={templateRuntimeBoundary}
          data-testid="m7-template-toast"
          role="status"
          title={templateRuntimeBoundary}
        >
          {toast}
        </div>
      ) : null}
      {viewState === "degraded" ? (
        <main className="uz-template-scroll">
          <TemplateGrid cards={cards} onCopy={openCopy} />
        </main>
      ) : (
        <TemplateStatePanel state={viewState} />
      )}
      {copyCard ? (
        <CopyModal
          card={copyCard}
          onClose={closeCopy}
          onConfirm={confirmCopy}
          onToggle={toggleTarget}
          selected={selectedTargets}
          selectedCount={selectedCount}
        />
      ) : null}
    </section>
  );
}

function TemplateRuntimeNote() {
  return (
    <div
      aria-description={templateRuntimeBoundary}
      className="uz-template-note"
      data-runtime-boundary={templateRuntimeBoundary}
      data-testid="m7-template-runtime-note"
      hidden
      title={templateRuntimeBoundary}
    />
  );
}

function TemplateStatePanel({
  state
}: {
  state: Exclude<TemplateViewState, "degraded">;
}) {
  const copy = templateStateCopy[state];
  return (
    <main
      aria-description={templateRuntimeBoundary}
      className="uz-template-state"
      data-runtime-boundary={templateRuntimeBoundary}
      data-testid={`m7-template-state-${state}`}
      title={templateRuntimeBoundary}
    >
      <div>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
      </div>
    </main>
  );
}

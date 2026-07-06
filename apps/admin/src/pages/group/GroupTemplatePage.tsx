import { useEffect, useRef, useState } from "react";
import {
  CopyModal,
  TemplateGrid,
  TemplateHeader,
  TemplateRuntimeNote,
  TemplateStatePanel
} from "./GroupTemplateViews";
import {
  readTemplateViewState,
  templateCardsByTab,
  templateMeta,
  templateStyles,
  templateTabs,
  templateToast,
  type TemplateCard,
  type TemplateTabId
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

  const clearToastTimer = () => {
    const activeTimer = toastTimerRef.current;
    if (activeTimer === null) return;
    window.clearTimeout(activeTimer);
    toastTimerRef.current = null;
  };

  useEffect(() => clearToastTimer, []);

  const showToast = (message: string) => {
    clearToastTimer();
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
      templateTabs.find((tab) => tab.id === activeTab)?.label ?? templateMeta.title;
    showToast(templateToast(copyCard, selectedCount, tabLabel));
    closeCopy();
  };

  return (
    <section
      className="uz-template-page"
      data-runtime-source={templateMeta.source}
      data-runtime-state={viewState}
      data-testid="m7-template-page"
    >
      <style>{templateStyles}</style>
      <TemplateHeader activeTab={activeTab} onChangeTab={setActiveTab} />
      <TemplateRuntimeNote />
      {toast ? (
        <div
          aria-atomic="true"
          aria-live="polite"
          className="uz-template-toast"
          data-testid="m7-template-toast"
          role="status"
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

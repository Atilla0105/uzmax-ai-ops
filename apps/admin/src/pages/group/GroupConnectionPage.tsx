import { useEffect, useRef, useState } from "react";
import {
  ConnectionHeader,
  ConnectionList,
  ConnectionRuntimeNote,
  ConnectionStatePanel
} from "./GroupConnectionViews";
import {
  connectionCards,
  connectionStyles,
  connectionTestToast,
  connectionToggleToast,
  connectionMeta,
  readConnectionViewState,
  type ConnectionCard
} from "./groupConnectionFallback";

export function GroupConnectionPage() {
  const viewState = readConnectionViewState();
  const [flags, setFlags] = useState<Record<string, boolean>>(
    Object.fromEntries(connectionCards.map((card) => [card.id, card.enabled]))
  );
  const [testingId, setTestingId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef<number | null>(null);
  const testTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (testTimerRef.current) window.clearTimeout(testTimerRef.current);
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
  const toggleConnection = (card: ConnectionCard) => {
    const nextEnabled = !flags[card.id];
    setFlags((items) => ({ ...items, [card.id]: nextEnabled }));
    showToast(connectionToggleToast(card, nextEnabled));
  };
  const testConnection = (card: ConnectionCard) => {
    if (testingId) return;
    setTestingId(card.id);
    if (testTimerRef.current) window.clearTimeout(testTimerRef.current);
    testTimerRef.current = window.setTimeout(() => {
      setTestingId(null);
      testTimerRef.current = null;
      showToast(connectionTestToast(card));
    }, 700);
  };

  return (
    <section
      className="uz-connection-page"
      data-runtime-source={connectionMeta.source}
      data-runtime-state={viewState}
      data-testid="m7-connection-page"
    >
      <style>{connectionStyles}</style>
      <ConnectionHeader />
      <ConnectionRuntimeNote />
      {toast ? (
        <div
          aria-atomic="true"
          aria-live="polite"
          className="uz-connection-toast"
          data-testid="m7-connection-toast"
          role="status"
        >
          {toast}
        </div>
      ) : null}
      {viewState === "degraded" ? (
        <main className="uz-connection-scroll">
          <ConnectionList
            cards={connectionCards}
            flags={flags}
            onTest={testConnection}
            onToggle={toggleConnection}
            testingId={testingId}
          />
        </main>
      ) : (
        <ConnectionStatePanel state={viewState} />
      )}
    </section>
  );
}

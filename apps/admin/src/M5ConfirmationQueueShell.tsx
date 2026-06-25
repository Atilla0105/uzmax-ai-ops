import { useCallback, useEffect, useState } from "react";
import { createConfirmationQueueApiClient } from "./confirmationQueueApiClient";
import { isM5AdminRuntimeEnabled } from "./m5AdminRuntimeMode";
import {
  ConflictDiff,
  confirmationQueueErrorMessage,
  confirmationQueueRuntimeLabel,
  health,
  healthRows,
  queueItems,
  listRuntimeQueueCards,
  loadRuntimeQueueDetail,
  submitRuntimeQueueDecision,
  type QueueCard
} from "./m5ConfirmationQueueRuntime";
import "./m5-confirmation-queue-shell.css";
void createConfirmationQueueApiClient;
// M5R-07 anchor: helper-owned runtime detail path still calls client.getItem.
export function M5ConfirmationQueueShell({ tenantName }: { tenantName: string }) {
  const runtimeEnabled = isM5AdminRuntimeEnabled("confirmationQueue");
  const [runtimeItems, setRuntimeItems] = useState<QueueCard[] | undefined>();
  const [runtimeResult, setRuntimeResult] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedId, setExpandedId] = useState<string | undefined>();
  const [editId, setEditId] = useState<string | undefined>();
  const [reasonVisible, setReasonVisible] = useState(false);
  const [recoveryDrafted, setRecoveryDrafted] = useState(false);
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const items = runtimeItems?.length ? runtimeItems : queueItems;
  const selected = items[selectedIndex] ?? items[0] ?? queueItems[0]!;
  const pendingCount = items.length - Object.keys(decisions).length;
  const markDecision = useCallback(
    async (itemId: string, decision: "approved" | "discarded") => {
      if (runtimeEnabled) {
        try {
          const { result, status } = await submitRuntimeQueueDecision(itemId, decision);
          setDecisions((current) => ({ ...current, [itemId]: status }));
          setRuntimeResult(result);
        } catch (error) {
          setRuntimeResult(confirmationQueueErrorMessage(error));
        }
        return;
      }
      setDecisions((current) => ({ ...current, [itemId]: decision }));
      if (editId === itemId) setEditId(undefined);
    },
    [editId, runtimeEnabled]
  );
  const toggleDetails = useCallback(
    async (item: QueueCard) => {
      const nextExpandedId = expandedId === item.id ? undefined : item.id;
      setExpandedId(nextExpandedId);
      if (!runtimeEnabled || !nextExpandedId) return;
      try {
        const { detail, result } = await loadRuntimeQueueDetail(item.id);
        setRuntimeItems((current) =>
          current?.map((entry) => (entry.id === detail.id ? detail : entry))
        );
        setRuntimeResult(result);
      } catch (error) {
        setRuntimeResult(confirmationQueueErrorMessage(error));
      }
    },
    [expandedId, runtimeEnabled]
  );
  useEffect(() => {
    if (!runtimeEnabled) {
      setRuntimeItems(undefined);
      return;
    }
    let active = true;
    void listRuntimeQueueCards()
      .then(({ cards, result }) => {
        if (!active) return;
        setRuntimeItems(cards);
        setRuntimeResult(result);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setRuntimeResult(confirmationQueueErrorMessage(error));
      });
    return () => {
      active = false;
    };
  }, [runtimeEnabled]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const key = event.key.toLowerCase();
      if (!["j", "k", "a", "e", "d"].includes(key)) return;
      event.preventDefault();
      switch (key) {
        case "j":
          setSelectedIndex((index) => Math.min(index + 1, items.length - 1));
          break;
        case "k":
          setSelectedIndex((index) => Math.max(index - 1, 0));
          break;
        case "a":
          void markDecision(selected.id, "approved");
          break;
        case "d":
          void markDecision(selected.id, "discarded");
          break;
        default:
          setEditId(selected.id);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [items.length, markDecision, selected.id]);
  return (
    <section className="panel m5-shell" data-testid="m5-confirmation-queue-shell">
      <div className="m5-shell-heading">
        <div>
          <p className="eyebrow">Tenant confirmation queue</p>
          <h2>Daily candidate review</h2>
        </div>
        <div className="m5-mode" data-testid="m5-shell-mode">
          <strong>{tenantName}</strong>
          <span>{confirmationQueueRuntimeLabel(runtimeEnabled)}</span>
        </div>
      </div>
      {runtimeEnabled ? (
        <p className="m5-recovery-draft" data-testid="m5-runtime-result">
          {runtimeResult || "Runtime API client mode waiting."}
        </p>
      ) : null}
      <section className="m5-health" data-testid="m5-queue-health">
        {healthRows.map(([label, value, tone]) => (
          <div className={`m5-metric ${tone}`} key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>
      <section className="m5-amber-banner" data-testid="m5-amber-banner">
        <div>
          <strong>Amber distill health</strong>
          <span>{health.risk}</span>
          {reasonVisible ? (
            <small>{health.reason}; recovery needs owner confirmation and audit.</small>
          ) : null}
        </div>
        <button type="button" onClick={() => setReasonVisible((visible) => !visible)}>
          View reason
        </button>
        <button type="button" onClick={() => setRecoveryDrafted(true)}>
          Draft recover daily
        </button>
        <button type="button" disabled>
          Confirm recovery disabled
        </button>
      </section>
      {recoveryDrafted ? (
        <p className="m5-recovery-draft" data-testid="m5-recovery-draft">
          Local draft only: recover_daily, audit
          controlled://confirmation/recovery-draft.
        </p>
      ) : null}
      <div className="m5-keybar" aria-label="Confirmation queue keyboard shortcuts">
        <span>J/K select</span>
        <span>A approve</span>
        <span>E edit desktop</span>
        <span>D discard</span>
        <strong>{pendingCount} pending</strong>
      </div>
      <div className="m5-card-flow" data-testid="m5-card-flow">
        {items.map((item, index) => (
          <article
            className={`m5-card ${index === selectedIndex ? "selected" : ""}`}
            data-testid={`m5-card-${item.kind}`}
            key={item.id}
          >
            <button
              aria-label={`Select ${item.kind} candidate`}
              className="m5-card-select"
              type="button"
              onClick={() => setSelectedIndex(index)}
            >
              <span>{item.kind}</span>
              <strong>{item.summary}</strong>
              <small>
                {item.target} / {item.confidence}
              </small>
            </button>
            <div className="m5-card-actions">
              <button
                type="button"
                onClick={() => void markDecision(item.id, "approved")}
              >
                Approve
              </button>
              <button
                className="m5-desktop-edit"
                type="button"
                onClick={() => setEditId(item.id)}
              >
                Edit
              </button>
              <button className="m5-mobile-edit" type="button" disabled>
                Edit on desktop
              </button>
              <button
                type="button"
                onClick={() => void markDecision(item.id, "discarded")}
              >
                Discard
              </button>
              <button type="button" onClick={() => void toggleDetails(item)}>
                Details
              </button>
            </div>
            <div className="m5-card-state" data-testid={`m5-state-${item.kind}`}>
              <span>{decisions[item.id] ?? "pending"}</span>
              <span>{index === selectedIndex ? "selected" : "queued"}</span>
              <span>{item.urgency}</span>
            </div>
            {item.kind === "conflict" && item.diff ? (
              <ConflictDiff diff={item.diff} />
            ) : null}
            {expandedId === item.id || editId === item.id ? (
              <div className="m5-details" data-testid={`m5-details-${item.kind}`}>
                <p>{item.detail}</p>
                {editId === item.id ? (
                  <label>
                    Edit draft ref
                    <input readOnly value="controlled://candidate/edit-draft" />
                  </label>
                ) : null}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

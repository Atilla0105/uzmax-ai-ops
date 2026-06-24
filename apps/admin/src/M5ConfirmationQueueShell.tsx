import { useCallback, useEffect, useState } from "react";

import { createConfirmationQueueApiClient } from "./confirmationQueueApiClient";
import "./m5-confirmation-queue-shell.css";

void createConfirmationQueueApiClient;

const queueItems = [
  {
    confidence: "92%",
    detail:
      "Candidate ref controlled://candidate/knowledge-a; source ref controlled://distill/source-a.",
    id: "knowledge-a",
    kind: "knowledge",
    summary: "Update one fact card after repeated owner review.",
    target: "Knowledge fact",
    urgency: "high"
  },
  {
    confidence: "88%",
    detail:
      "Candidate ref controlled://candidate/profile-a; target ref controlled://profile/field-a.",
    id: "profile-a",
    kind: "profile",
    summary: "Adjust profile field from confirmed journey signal.",
    target: "Profile field",
    urgency: "medium"
  },
  {
    confidence: "83%",
    detail:
      "Candidate ref controlled://candidate/eval-a; payload ref controlled://eval/case-a.",
    id: "eval-a",
    kind: "eval",
    summary: "Promote review case into eval coverage.",
    target: "Eval sample",
    urgency: "medium"
  },
  {
    confidence: "79%",
    detail: "Conflict cannot skip into formal storage; owner must compare both refs.",
    diff: {
      left: "Current controlled://kb/current-stage",
      right: "Candidate controlled://candidate/stage-rewrite"
    },
    id: "conflict-a",
    kind: "conflict",
    summary: "Resolve two competing stage-card refs.",
    target: "Conflict diff",
    urgency: "blocked"
  }
] as const;

const health = {
  reason: "3-day pass rate below 40%",
  risk: "downshift risk active"
} as const;
const healthRows = [
  ["Today candidates", "8/10", ""],
  ["Daily cap", "10", ""],
  ["7-day pass rate", "36%", "warn"],
  ["Distill frequency", "weekly until owner recovery", ""],
  ["Latest downshift reason", health.reason, "warn"]
] as const;

export function M5ConfirmationQueueShell({ tenantName }: { tenantName: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedId, setExpandedId] = useState<string | undefined>();
  const [editId, setEditId] = useState<string | undefined>();
  const [reasonVisible, setReasonVisible] = useState(false);
  const [recoveryDrafted, setRecoveryDrafted] = useState(false);
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const selected = queueItems[selectedIndex] ?? queueItems[0];
  const pendingCount = queueItems.length - Object.keys(decisions).length;

  const markDecision = useCallback(
    (itemId: string, decision: "approved" | "discarded") => {
      setDecisions((current) => ({ ...current, [itemId]: decision }));
      if (editId === itemId) setEditId(undefined);
    },
    [editId]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const key = event.key.toLowerCase();
      if (!["j", "k", "a", "e", "d"].includes(key)) return;
      event.preventDefault();
      switch (key) {
        case "j":
          setSelectedIndex((index) => Math.min(index + 1, queueItems.length - 1));
          break;
        case "k":
          setSelectedIndex((index) => Math.max(index - 1, 0));
          break;
        case "a":
          markDecision(selected.id, "approved");
          break;
        case "d":
          markDecision(selected.id, "discarded");
          break;
        default:
          setEditId(selected.id);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [markDecision, selected.id]);

  return (
    <section className="panel m5-shell" data-testid="m5-confirmation-queue-shell">
      <div className="m5-shell-heading">
        <div>
          <p className="eyebrow">Tenant confirmation queue</p>
          <h2>Daily candidate review</h2>
        </div>
        <div className="m5-mode" data-testid="m5-shell-mode">
          <strong>{tenantName}</strong>
          <span>synthetic local shell</span>
        </div>
      </div>

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
        {queueItems.map((item, index) => (
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
              <button type="button" onClick={() => markDecision(item.id, "approved")}>
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
              <button type="button" onClick={() => markDecision(item.id, "discarded")}>
                Discard
              </button>
              <button
                type="button"
                onClick={() =>
                  setExpandedId(expandedId === item.id ? undefined : item.id)
                }
              >
                Details
              </button>
            </div>
            <div className="m5-card-state" data-testid={`m5-state-${item.kind}`}>
              <span>{decisions[item.id] ?? "pending"}</span>
              <span>{index === selectedIndex ? "selected" : "queued"}</span>
              <span>{item.urgency}</span>
            </div>
            {item.kind === "conflict" ? <ConflictDiff item={item} /> : null}
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

function ConflictDiff({ item }: { item: (typeof queueItems)[3] }) {
  return (
    <div className="m5-conflict-diff" data-testid="m5-conflict-diff">
      <div>
        <span>Current</span>
        <strong>{item.diff.left}</strong>
      </div>
      <div>
        <span>Candidate</span>
        <strong>{item.diff.right}</strong>
      </div>
    </div>
  );
}

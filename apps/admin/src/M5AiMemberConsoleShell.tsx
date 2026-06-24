import { useState } from "react";

import {
  aiMemberCapabilityKeys,
  createAiMemberActionDraft,
  type AiMemberActionDraft,
  type AiMemberCapabilityKey,
  type AiMemberStatus
} from "./aiMemberConsoleContracts";
import "./m5-ai-member-console-shell.css";

const capabilityLabels: Record<AiMemberCapabilityKey, string> = {
  business_draft: "Business draft",
  order_read: "Order read",
  quote: "Quote",
  tutorial: "Tutorial",
  vision: "Vision"
};

const initialCapabilities = {
  business_draft: true,
  order_read: true,
  quote: false,
  tutorial: true,
  vision: false
} satisfies Record<AiMemberCapabilityKey, boolean>;

const member = {
  activeVersionRef: "controlled://ai-member/version/v1",
  breakerReasonRef: "controlled://ai-member/breaker-low-pass-rate",
  displayName: "Operations AI",
  personaRef: "controlled://ai-member/persona/v1"
} as const;

export function M5AiMemberConsoleShell({ tenantName }: { tenantName: string }) {
  const [status, setStatus] = useState<AiMemberStatus>("breaker_offline");
  const [capabilities, setCapabilities] =
    useState<Record<AiMemberCapabilityKey, boolean>>(initialCapabilities);
  const [draft, setDraft] = useState<AiMemberActionDraft | undefined>();
  const [reasonExpanded, setReasonExpanded] = useState(false);

  const createDraft = (
    action: AiMemberActionDraft["action"],
    options: Partial<Pick<AiMemberActionDraft, "capabilityKey" | "nextEnabled">> = {}
  ) => {
    const nextDraft = createAiMemberActionDraft({
      action,
      auditRef: `controlled://ai-member/audit/${action.replace("_", "-")}`,
      capabilityKey: options.capabilityKey,
      currentStatus: status,
      nextEnabled: options.nextEnabled,
      reasonRef: `controlled://ai-member/reason/${action.replace("_", "-")}`
    });
    setDraft(nextDraft);
    if (action !== "recover_online") setStatus(nextDraft.targetStatus);
  };

  const toggleCapability = (capabilityKey: AiMemberCapabilityKey) => {
    const nextEnabled = !capabilities[capabilityKey];
    setCapabilities((current) => ({ ...current, [capabilityKey]: nextEnabled }));
    createDraft("toggle_capability", { capabilityKey, nextEnabled });
  };

  return (
    <section className="panel m5-ai-shell" data-testid="m5-ai-member-console-shell">
      <div className="m5-ai-heading">
        <div>
          <p className="eyebrow">Tenant AI member</p>
          <h2>AI member control</h2>
        </div>
        <div className="m5-ai-mode">
          <strong>{tenantName}</strong>
          <span>synthetic local shell</span>
        </div>
      </div>

      <div className="m5-ai-summary" data-testid="m5-ai-member-summary">
        <div>
          <span>Member</span>
          <strong>{member.displayName}</strong>
        </div>
        <div data-testid="m5-ai-member-status">
          <span>Status</span>
          <strong>{status}</strong>
        </div>
        <div>
          <span>Active version</span>
          <strong>{member.activeVersionRef}</strong>
        </div>
        <div>
          <span>Persona</span>
          <strong>{member.personaRef}</strong>
        </div>
      </div>

      <div className="m5-ai-breaker" data-testid="m5-ai-breaker-reason">
        <div>
          <strong>Breaker reason</strong>
          <span>{member.breakerReasonRef}</span>
          {reasonExpanded ? <small>3-day pass rate below recovery floor.</small> : null}
        </div>
        <button type="button" onClick={() => setReasonExpanded((visible) => !visible)}>
          View breaker reason
        </button>
      </div>

      <div className="m5-ai-actions" aria-label="AI member local actions">
        <button type="button" onClick={() => createDraft("manual_offline")}>
          Manual offline local
        </button>
        <button type="button" onClick={() => createDraft("emergency_stop")}>
          Emergency stop local
        </button>
        <button type="button" onClick={() => createDraft("recover_online")}>
          Draft recovery
        </button>
        <button type="button" disabled>
          Confirm AI recovery disabled
        </button>
        <button type="button" disabled>
          Production action disabled
        </button>
      </div>

      <div className="m5-ai-mobile-fallback" data-testid="m5-ai-mobile-fallback">
        <button type="button" onClick={() => createDraft("emergency_stop")}>
          Emergency stop fallback
        </button>
        <button type="button" onClick={() => createDraft("recover_online")}>
          Draft recovery fallback
        </button>
      </div>

      <div className="m5-ai-capability-grid" data-testid="m5-ai-capabilities">
        {aiMemberCapabilityKeys.map((capabilityKey) => (
          <button
            aria-pressed={capabilities[capabilityKey]}
            data-testid={`m5-ai-capability-${capabilityKey}`}
            key={capabilityKey}
            type="button"
            onClick={() => toggleCapability(capabilityKey)}
          >
            <span>{capabilityLabels[capabilityKey]}</span>
            <strong>{capabilities[capabilityKey] ? "enabled" : "disabled"}</strong>
          </button>
        ))}
      </div>

      {draft ? (
        <div className="m5-ai-draft" data-testid="m5-ai-action-draft">
          <span>{draft.action}</span>
          <span>target {draft.targetStatus}</span>
          <span>formal runtime write {String(draft.formalRuntimeWrite)}</span>
          <span>owner confirmation {String(draft.requiresOwnerConfirmation)}</span>
          <span>{draft.auditRef}</span>
          <span>{draft.reasonRef}</span>
          {draft.capabilityKey ? (
            <span>
              {draft.capabilityKey} {draft.nextEnabled ? "enabled" : "disabled"}
            </span>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

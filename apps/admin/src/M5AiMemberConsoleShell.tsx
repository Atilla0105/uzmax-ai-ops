import { useEffect, useState } from "react";

import {
  aiMemberCapabilityLabels,
  aiMemberCapabilityKeys,
  aiMemberConsoleMember as member,
  createAiMemberActionDraft,
  initialAiMemberCapabilities,
  type AiMemberActionDraft,
  type AiMemberCapabilityKey,
  type AiMemberStatus
} from "./aiMemberConsoleContracts";
import { createAiMemberRuntimeApiClient } from "./aiMemberRuntimeApiClient";
import {
  createM5AdminRuntimeFetcher,
  getM5RuntimeAiMemberId,
  isM5AdminRuntimeEnabled
} from "./m5AdminRuntimeMode";
import "./m5-ai-member-console-shell.css";

export function M5AiMemberConsoleShell({ tenantName }: { tenantName: string }) {
  const runtimeEnabled = isM5AdminRuntimeEnabled("aiMember");
  const memberId = getM5RuntimeAiMemberId();
  const [runtimeResult, setRuntimeResult] = useState("");
  const [status, setStatus] = useState<AiMemberStatus>("breaker_offline");
  const [capabilities, setCapabilities] = useState<
    Record<AiMemberCapabilityKey, boolean>
  >(initialAiMemberCapabilities);
  const [draft, setDraft] = useState<AiMemberActionDraft | undefined>();
  const [reasonExpanded, setReasonExpanded] = useState(false);

  const createDraft = async (
    action: AiMemberActionDraft["action"],
    options: Partial<Pick<AiMemberActionDraft, "capabilityKey" | "nextEnabled">> = {}
  ) => {
    if (
      runtimeEnabled &&
      (action === "emergency_stop" || action === "recover_online")
    ) {
      await applyRuntimeAction(action);
      return;
    }
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

  const toggleCapability = async (capabilityKey: AiMemberCapabilityKey) => {
    const nextEnabled = !capabilities[capabilityKey];
    if (runtimeEnabled) {
      try {
        const client = createAiMemberRuntimeApiClient({
          fetcher: createM5AdminRuntimeFetcher()
        });
        const result = await client.toggleCapability(memberId, capabilityKey, {
          controlRef: `controlled://m5r-07/ai-member/capability/${capabilityKey}`,
          enabled: nextEnabled,
          reasonRef: `controlled://m5r-07/ai-member/capability/${capabilityKey}`,
          traceId: `m5r-07:capability:${capabilityKey}`
        });
        setCapabilities((current) => ({ ...current, [capabilityKey]: nextEnabled }));
        setDraft(
          createAiMemberActionDraft({
            action: "toggle_capability",
            auditRef: String(result.auditRef ?? "controlled://m5r-07/ai-member/audit"),
            capabilityKey,
            currentStatus: status,
            nextEnabled,
            reasonRef: `controlled://m5r-07/ai-member/capability/${capabilityKey}`
          })
        );
        setRuntimeResult(
          `toggle capability API ${capabilityKey} ${String(result.auditRef ?? "")}`
        );
      } catch (error) {
        setRuntimeResult(errorMessage(error));
      }
      return;
    }
    setCapabilities((current) => ({ ...current, [capabilityKey]: nextEnabled }));
    void createDraft("toggle_capability", { capabilityKey, nextEnabled });
  };

  const applyRuntimeAction = async (
    action: Extract<AiMemberActionDraft["action"], "emergency_stop" | "recover_online">
  ) => {
    try {
      const client = createAiMemberRuntimeApiClient({
        fetcher: createM5AdminRuntimeFetcher()
      });
      const input = {
        breakerResolvedRef: "controlled://m5r-07/ai-member/breaker-resolved",
        controlRef: `controlled://m5r-07/ai-member/${action}`,
        reasonRef: `controlled://m5r-07/ai-member/${action}`,
        traceId: `m5r-07:${action}`
      };
      const result =
        action === "emergency_stop"
          ? await client.emergencyStop(memberId, input)
          : await client.recoverOnline(memberId, input);
      const member = record(result.member);
      const nextStatus = String(member.status ?? status) as AiMemberStatus;
      setStatus(nextStatus);
      setDraft(
        createAiMemberActionDraft({
          action,
          auditRef: String(result.auditRef ?? "controlled://m5r-07/ai-member/audit"),
          currentStatus: status,
          reasonRef: input.reasonRef
        })
      );
      setRuntimeResult(`${action} API ok; audit ${String(result.auditRef ?? "")}`);
    } catch (error) {
      setRuntimeResult(errorMessage(error));
    }
  };

  useEffect(() => {
    if (!runtimeEnabled) return;
    let active = true;
    const client = createAiMemberRuntimeApiClient({
      fetcher: createM5AdminRuntimeFetcher()
    });
    void client
      .getRuntimeState(memberId)
      .then((state) => {
        if (!active) return;
        const nextStatus = String(state.status ?? "online") as AiMemberStatus;
        setStatus(nextStatus);
        setRuntimeResult(`Runtime state ${nextStatus}`);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setRuntimeResult(errorMessage(error));
      });
    return () => {
      active = false;
    };
  }, [memberId, runtimeEnabled]);

  return (
    <section className="panel m5-ai-shell" data-testid="m5-ai-member-console-shell">
      <div className="m5-ai-heading">
        <div>
          <p className="eyebrow">Tenant AI member</p>
          <h2>AI member control</h2>
        </div>
        <div className="m5-ai-mode">
          <strong>{tenantName}</strong>
          <span>{runtimeLabel(runtimeEnabled)}</span>
        </div>
      </div>
      {runtimeEnabled ? (
        <div className="m5-ai-draft" data-testid="m5-ai-runtime-result">
          {runtimeResult || "Runtime API client mode waiting."}
        </div>
      ) : null}

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
        <button type="button" onClick={() => void createDraft("manual_offline")}>
          Manual offline local
        </button>
        <button type="button" onClick={() => void createDraft("emergency_stop")}>
          {actionLabel(runtimeEnabled, "Emergency stop API", "Emergency stop local")}
        </button>
        <button type="button" onClick={() => void createDraft("recover_online")}>
          {actionLabel(runtimeEnabled, "Recover API", "Draft recovery")}
        </button>
        <button type="button" disabled>
          Confirm AI recovery disabled
        </button>
        <button type="button" disabled>
          Production action disabled
        </button>
      </div>

      <div className="m5-ai-mobile-fallback" data-testid="m5-ai-mobile-fallback">
        <button type="button" onClick={() => void createDraft("emergency_stop")}>
          Emergency stop fallback
        </button>
        <button type="button" onClick={() => void createDraft("recover_online")}>
          {actionLabel(
            runtimeEnabled,
            "Recover API fallback",
            "Draft recovery fallback"
          )}
        </button>
      </div>

      <div className="m5-ai-capability-grid" data-testid="m5-ai-capabilities">
        {aiMemberCapabilityKeys.map((capabilityKey) => (
          <button
            aria-pressed={capabilities[capabilityKey]}
            data-testid={`m5-ai-capability-${capabilityKey}`}
            key={capabilityKey}
            type="button"
            onClick={() => void toggleCapability(capabilityKey)}
          >
            <span>{aiMemberCapabilityLabels[capabilityKey]}</span>
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

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function runtimeLabel(enabled: boolean) {
  return enabled ? "runtime API client" : "synthetic local shell";
}

function actionLabel(enabled: boolean, runtime: string, local: string) {
  return enabled ? runtime : local;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "AI runtime API request failed";
}

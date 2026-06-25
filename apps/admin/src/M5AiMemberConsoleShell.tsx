import { useEffect, useState } from "react";
import {
  aiMemberCapabilityLabels,
  aiMemberCapabilityKeys,
  aiMemberConsoleMember as member,
  aiMemberActionLabel,
  aiMemberDraftLines,
  aiMemberEmergencyStopLabel,
  aiMemberErrorMessage,
  aiMemberRuntimeActionInput,
  aiMemberRuntimeLabel,
  aiMemberRuntimeRecord,
  aiMemberSummaryRows,
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

type AiMemberCapabilities = Record<AiMemberCapabilityKey, boolean>;
type ActiveVersionEvidence = Record<string, string | undefined>;
type RuntimeAiMemberAction = "emergency_stop" | "recover_online";

function createRuntimeClient() {
  return createAiMemberRuntimeApiClient({ fetcher: createM5AdminRuntimeFetcher() });
}
export function M5AiMemberConsoleShell({ tenantName }: { tenantName: string }) {
  const runtimeEnabled = isM5AdminRuntimeEnabled("aiMember");
  const memberId = getM5RuntimeAiMemberId();
  const [runtimeResult, setRuntimeResult] = useState("");
  const [status, setStatus] = useState<AiMemberStatus>("breaker_offline");
  const [activeVersionEvidence, setActiveVersionEvidence] =
    useState<ActiveVersionEvidence>({});
  const [capabilities, setCapabilities] = useState<AiMemberCapabilities>(
    initialAiMemberCapabilities
  );
  const [draft, setDraft] = useState<AiMemberActionDraft | undefined>();
  const [reasonExpanded, setReasonExpanded] = useState(false);
  const actionButton = (label: string, action: AiMemberActionDraft["action"]) => (
    <button type="button" onClick={() => void createDraft(action)}>
      {label}
    </button>
  );
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
      if (nextEnabled && !activeVersionEvidence.evalGateId) {
        setRuntimeResult("Capability enable requires passed eval evidence.");
        return;
      }
      try {
        const client = createRuntimeClient();
        const result = await client.toggleCapability(memberId, capabilityKey, {
          ...(nextEnabled ? activeVersionEvidence : {}),
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
        setRuntimeResult(aiMemberErrorMessage(error));
      }
      return;
    }
    setCapabilities((current) => ({ ...current, [capabilityKey]: nextEnabled }));
    void createDraft("toggle_capability", { capabilityKey, nextEnabled });
  };
  const applyRuntimeAction = async (action: RuntimeAiMemberAction) => {
    try {
      const client = createRuntimeClient();
      const input = aiMemberRuntimeActionInput(action);
      const result =
        action === "emergency_stop"
          ? await client.emergencyStop(memberId, input)
          : await client.recoverOnline(memberId, input);
      const member = aiMemberRuntimeRecord(result.member);
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
      setRuntimeResult(aiMemberErrorMessage(error));
    }
  };
  useEffect(() => {
    if (!runtimeEnabled) return;
    let active = true;
    const client = createRuntimeClient();
    void client
      .getRuntimeState(memberId)
      .then((state) => {
        if (!active) return;
        const nextStatus = String(state.status ?? "online") as AiMemberStatus;
        const activeVersion = aiMemberRuntimeRecord(state.activeVersion);
        setStatus(nextStatus);
        setActiveVersionEvidence({
          configVersionId:
            typeof activeVersion.configVersionId === "string"
              ? activeVersion.configVersionId
              : undefined,
          evalGateId:
            typeof activeVersion.evalGateId === "string"
              ? activeVersion.evalGateId
              : undefined
        });
        setRuntimeResult(`Runtime state ${nextStatus}`);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setRuntimeResult(aiMemberErrorMessage(error));
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
          <span>{aiMemberRuntimeLabel(runtimeEnabled)}</span>
        </div>
      </div>
      {runtimeEnabled ? (
        <div className="m5-ai-draft" data-testid="m5-ai-runtime-result">
          {runtimeResult || "Runtime API client mode waiting."}
        </div>
      ) : null}
      <div className="m5-ai-summary" data-testid="m5-ai-member-summary">
        {aiMemberSummaryRows(status).map(([label, value, testId]) => (
          <div data-testid={testId} key={label}>
            {label}
            <strong>{value}</strong>
          </div>
        ))}
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
        {actionButton("Manual offline local", "manual_offline")}
        {actionButton(aiMemberEmergencyStopLabel(runtimeEnabled), "emergency_stop")}
        {actionButton(
          aiMemberActionLabel(runtimeEnabled, "Recover API", "Draft recovery"),
          "recover_online"
        )}
        <button type="button" disabled>
          Confirm AI recovery disabled
        </button>
        <button type="button" disabled>
          Production action disabled
        </button>
      </div>
      <div className="m5-ai-mobile-fallback" data-testid="m5-ai-mobile-fallback">
        {actionButton("Emergency stop fallback", "emergency_stop")}
        {actionButton(
          aiMemberActionLabel(
            runtimeEnabled,
            "Recover API fallback",
            "Draft recovery fallback"
          ),
          "recover_online"
        )}
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
          {aiMemberDraftLines(draft).map((text) => (
            <span key={text}>{text}</span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

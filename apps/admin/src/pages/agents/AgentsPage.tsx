import { useState, type Dispatch, type SetStateAction } from "react";
import { ConfirmModal } from "../../patterns";
import * as Views from "./AgentViews";
import {
  agentStyles,
  gateTone,
  initialAgents,
  readAgentViewState,
  runtimeBoundary,
  statusTone,
  type AgentFilter,
  type AgentStatus,
  type AiMember,
  type PersonaGate
} from "./agentsFallback";

type ConfirmState = {
  danger?: boolean;
  label: string;
  run: (reason: string) => void;
  title: string;
};
type Persona = { agentId: string; dirty: boolean; draft: string; gate: PersonaGate };

export function AgentsPage({ selectedTenantId }: { selectedTenantId: string }) {
  const viewState = readAgentViewState();
  const [agents, setAgents] = useState(initialAgents);
  const [filter, setFilter] = useState<AgentFilter>("all");
  const [persona, setPersona] = useState<Persona | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState("");
  const active = persona && agents.find((agent) => agent.id === persona.agentId);

  function patch(id: string, next: (agent: AiMember) => AiMember) {
    setAgents((items) => items.map((agent) => (agent.id === id ? next(agent) : agent)));
  }

  function setStatus(agent: AiMember, status: AgentStatus, why = "n/a") {
    patch(agent.id, (item) => ({ ...item, status }));
    setToast(
      `${agent.name} 状态已更新为「${statusTone(status)[0]}」；原因已记录：${why}`
    );
  }

  function ask(next: ConfirmState) {
    setReason("");
    setConfirm(next);
  }

  function openPersona(agent: AiMember) {
    const current = agent.versions[0]!;
    setPersona({ agentId: agent.id, dirty: false, draft: current.text, gate: "pass" });
  }

  function publishLocal() {
    setPersona(null);
    setToast("人设发布预览已生成；正式发布仍需评测与确认流程。");
  }

  const confirmStatus = (
    agent: AiMember,
    status: AgentStatus,
    title: string,
    label: string,
    danger?: boolean
  ) => ask({ danger, label, run: (why) => setStatus(agent, status, why), title });

  const actions = {
    emergency: (agent: AiMember) =>
      confirmStatus(agent, "estop", `紧急停止 ${agent.name}`, "确认紧急停止", true),
    persona: openPersona,
    recover: (agent: AiMember) =>
      confirmStatus(agent, "online", `恢复熔断 ${agent.name}`, "确认恢复"),
    release: (agent: AiMember) =>
      confirmStatus(agent, "online", `解除急停 ${agent.name}`, "确认解除"),
    toggleCap: (id: string, key: keyof AiMember["capabilities"]) =>
      patch(id, (agent) => ({
        ...agent,
        capabilities: { ...agent.capabilities, [key]: !agent.capabilities[key] }
      }))
  };

  return (
    <section
      className="uz-agent-page"
      data-runtime-state={viewState}
      data-runtime-boundary={runtimeBoundary}
      data-tenant-id={selectedTenantId}
      data-testid="m7-agent-page"
      title={runtimeBoundary}
    >
      <style>{agentStyles}</style>
      <Views.Header filter={filter} setFilter={setFilter} />
      <Views.RuntimeNote />
      {toast ? (
        <div
          className="uz-agent-toast"
          data-runtime-boundary={runtimeBoundary}
          data-testid="m7-agent-toast"
        >
          {toast}
        </div>
      ) : null}
      <AgentBody actions={actions} agents={agents} filter={filter} state={viewState} />
      {active && persona ? (
        <PersonaDrawer
          agent={active}
          onPublish={publishLocal}
          persona={persona}
          setPersona={setPersona}
        />
      ) : null}
      <ConfirmModal
        confirmLabel={confirm?.label ?? "确认"}
        danger={confirm?.danger}
        description="请填写本次操作原因；确认后只更新当前页面预览状态，正式成员指标、人设、审计与发布流程不在本切片内变更。"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          confirm?.run(reason);
          setConfirm(null);
        }}
        open={!!confirm}
        reason={{
          label: "操作原因",
          onChange: setReason,
          placeholder: "填写恢复、急停或解除原因",
          required: true,
          value: reason
        }}
        title={confirm?.title ?? ""}
      >
        <span data-runtime-boundary={runtimeBoundary} hidden title={runtimeBoundary}>
          {runtimeBoundary}
        </span>
      </ConfirmModal>
    </section>
  );
}

function AgentBody({
  actions,
  agents,
  filter,
  state
}: {
  actions: Parameters<typeof Views.AgentCards>[0]["actions"];
  agents: AiMember[];
  filter: AgentFilter;
  state: ReturnType<typeof readAgentViewState>;
}) {
  if (state !== "degraded") return <Views.StatePanel state={state} />;
  return (
    <main className="uz-agent-scroll">
      <Views.AlertBar agents={agents} />
      {filter !== "human" ? (
        <Views.AgentCards actions={actions} agents={agents} />
      ) : null}
      {filter !== "ai" ? <Views.HumanTable /> : null}
    </main>
  );
}

function PersonaDrawer({
  agent,
  onPublish,
  persona,
  setPersona
}: {
  agent: AiMember;
  onPublish: () => void;
  persona: Persona;
  setPersona: Dispatch<SetStateAction<Persona | null>>;
}) {
  const [gateLabel, tone] = gateTone(persona.gate);
  const close = () => setPersona(null);
  const runEval = () => {
    setPersona({ ...persona, gate: "running" });
    window.setTimeout(
      () => setPersona((item) => (item ? { ...item, gate: "pass" } : item)),
      700
    );
  };
  const edit = (draft: string) =>
    setPersona({ ...persona, dirty: true, draft, gate: "idle" });
  return (
    <div
      className="uz-agent-scrim"
      data-runtime-boundary={runtimeBoundary}
      data-testid="m7-agent-persona-drawer"
      onClick={close}
    >
      <aside className="uz-agent-drawer" onClick={(event) => event.stopPropagation()}>
        <header className="uz-agent-drawer-head">
          <h3>{`编辑人设 · ${agent.name}`}</h3>
          <button
            aria-label="关闭人设抽屉"
            className="uz-agent-close"
            onClick={close}
            type="button"
          >
            ×
          </button>
        </header>
        <main className="uz-agent-drawer-body">
          <textarea
            className="uz-agent-textarea"
            data-testid="m7-agent-persona-textarea"
            onChange={(event) => edit(event.currentTarget.value)}
            value={persona.draft}
          />
          <span
            className={`uz-agent-badge uz-agent-badge--${tone}`}
            data-testid="m7-agent-persona-gate"
          >
            {gateLabel}
          </span>
          {agent.versions.map((version) => (
            <p className="uz-agent-version" key={version.version}>
              <strong className="uz-agent-mono">{version.version}</strong>
              <time>{version.date}</time>
              <span>{version.note}</span>
            </p>
          ))}
        </main>
        <footer className="uz-agent-drawer-foot">
          <button
            className="uz-agent-btn"
            disabled={!persona.dirty || persona.gate === "running"}
            onClick={runEval}
            type="button"
          >
            {persona.gate === "running" ? "评测运行中" : "运行评测"}
          </button>
          <button
            className="uz-agent-btn uz-agent-btn--primary"
            data-runtime-boundary={runtimeBoundary}
            data-testid="m7-agent-persona-publish"
            disabled={!persona.dirty || persona.gate !== "pass"}
            onClick={onPublish}
            type="button"
          >
            发布预览
          </button>
        </footer>
      </aside>
    </div>
  );
}

import { Bot, Pencil, TriangleAlert } from "lucide-react";
import { IconSlot } from "../../primitives";
import {
  capabilityDefs,
  humanMembers,
  runtimeLabels,
  statusTone,
  type AgentFilter,
  type AgentViewState,
  type AiMember,
  type CapabilityKey
} from "./agentsFallback";

interface Actions {
  emergency: (agent: AiMember) => void;
  persona: (agent: AiMember) => void;
  recover: (agent: AiMember) => void;
  release: (agent: AiMember) => void;
  toggleCap: (id: string, key: CapabilityKey) => void;
}

export function Header({
  filter,
  setFilter
}: {
  filter: AgentFilter;
  setFilter: (filter: AgentFilter) => void;
}) {
  return (
    <header className="uz-agent-head">
      <h2 className="uz-agent-title">AI 成员</h2>
      <span className="uz-agent-desc">
        人类成员与 AI 成员 · 能力开关、本地急停、评测门禁预览 · local-only
      </span>
      <nav aria-label="成员筛选" className="uz-agent-filters">
        {(["all", "ai", "human"] as const).map((id) => (
          <button
            aria-pressed={filter === id}
            className="uz-agent-filter"
            data-testid={`m7-agent-filter-${id}`}
            key={id}
            onClick={() => setFilter(id)}
            type="button"
          >
            {id === "all" ? "全部" : id === "ai" ? "AI 成员" : "人类成员"}
          </button>
        ))}
      </nav>
    </header>
  );
}

export function RuntimeNote() {
  return (
    <div className="uz-agent-note" data-testid="m7-agent-runtime-note">
      <span>{runtimeLabels.slice(0, 3).join(" · ")}</span>
      <span>{runtimeLabels.slice(3).join(" · ")}</span>
    </div>
  );
}

export function StatePanel({ state }: { state: Exclude<AgentViewState, "degraded"> }) {
  return (
    <main className="uz-agent-state" data-testid={`m7-agent-state-${state}`}>
      <div>
        <h2>{state}</h2>
        <p>{`Synthetic ${state} state. ${runtimeLabels.join(" · ")}`}</p>
      </div>
    </main>
  );
}

export function AlertBar({ agents }: { agents: AiMember[] }) {
  const names = agents
    .filter((agent) => agent.status === "breaker" || agent.status === "estop")
    .map((agent) => agent.name);
  if (!names.length) return null;
  return (
    <div className="uz-agent-alert" data-testid="m7-agent-alert">
      <IconSlot icon={TriangleAlert} size="sm" />
      <span>{`${names.join("、")} breaker/estop synthetic alert; recovery is local action only.`}</span>
    </div>
  );
}

export function AgentCards({
  actions,
  agents
}: {
  actions: Actions;
  agents: AiMember[];
}) {
  return (
    <div className="uz-agent-card-grid" data-testid="m7-agent-card-grid">
      {agents.map((agent) => (
        <AgentCard actions={actions} agent={agent} key={agent.id} />
      ))}
    </div>
  );
}

function AgentCard({ actions, agent }: { actions: Actions; agent: AiMember }) {
  const [label, tone] = statusTone(agent.status);
  const stats = [
    ["今日处理", agent.today],
    ["成本", agent.cost],
    ["负反馈", agent.feedback]
  ];
  return (
    <article className="uz-agent-card" data-testid={`m7-agent-card-${agent.id}`}>
      <header className="uz-agent-card-head">
        <span className="uz-agent-avatar">
          <IconSlot icon={Bot} />
        </span>
        <span className="uz-agent-card-title">
          <strong>{agent.name}</strong>
          <span>{`人设 ${agent.version} · ${agent.role}`}</span>
        </span>
        <span className={`uz-agent-badge uz-agent-badge--${tone}`}>{label}</span>
      </header>
      <div className="uz-agent-caps">
        {capabilityDefs.map(([key, text]) => (
          <button
            aria-pressed={agent.capabilities[key]}
            className="uz-agent-chip"
            data-testid={`m7-agent-cap-${agent.id}-${key}`}
            key={key}
            onClick={() => actions.toggleCap(agent.id, key)}
            type="button"
          >
            <span className="uz-agent-chip-dot" />
            {text}
          </button>
        ))}
      </div>
      <div className="uz-agent-stats">
        {stats.map(([text, value]) => (
          <span className="uz-agent-stat" key={text}>
            <span>{text}</span>
            <strong>{value}</strong>
          </span>
        ))}
      </div>
      <div className="uz-agent-actions">
        <StatusButton actions={actions} agent={agent} />
        <button
          className="uz-agent-btn"
          data-testid={`m7-agent-persona-${agent.id}`}
          onClick={() => actions.persona(agent)}
          type="button"
        >
          <IconSlot icon={Pencil} size="sm" />
          编辑人设
        </button>
      </div>
    </article>
  );
}

function StatusButton({ actions, agent }: { actions: Actions; agent: AiMember }) {
  if (agent.status === "breaker")
    return <Danger label="熔断恢复" onClick={() => actions.recover(agent)} />;
  if (agent.status === "estop")
    return <Danger label="解除急停" onClick={() => actions.release(agent)} />;
  return (
    <Danger
      label="紧急停止"
      onClick={() => actions.emergency(agent)}
      testId={`m7-agent-estop-${agent.id}`}
    />
  );
}

type DangerProps = { label: string; onClick: () => void; testId?: string };

function Danger({ label, onClick, testId }: DangerProps) {
  return (
    <button
      className="uz-agent-btn uz-agent-btn--danger"
      data-testid={testId}
      onClick={onClick}
      type="button"
    >
      <IconSlot icon={TriangleAlert} size="sm" />
      {label}
    </button>
  );
}

export function HumanTable() {
  return (
    <div className="uz-agent-table-wrap" data-testid="m7-agent-human-table">
      <table className="uz-agent-table">
        <thead>
          <tr>
            {["成员", "角色", "在线状态", "接待中", "今日累计"].map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {humanMembers.map(([initial, name, role, status, tone, active, today]) => (
            <tr key={name}>
              <td>
                <span className="uz-agent-person">
                  <span>{initial}</span>
                  {name}
                </span>
              </td>
              <td>{role}</td>
              <td>
                <span className={`uz-agent-badge uz-agent-badge--${tone}`}>
                  {status}
                </span>
              </td>
              <td className="uz-agent-mono">{active}</td>
              <td className="uz-agent-mono">{today}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

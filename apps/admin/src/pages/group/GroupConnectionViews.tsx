import { Bot, Briefcase, Lock, PlugZap, Upload } from "lucide-react";
import { Button, IconSlot, StatusBadge, Toggle } from "../../primitives";
import {
  connectionMeta,
  connectionRuntimeLabels,
  type ConnectionCard,
  type ConnectionIconKey,
  type ConnectionTone,
  type ConnectionViewState
} from "./groupConnectionFallback";

type ConnectionListProps = {
  cards: ConnectionCard[];
  flags: Record<string, boolean>;
  onTest: (card: ConnectionCard) => void;
  onToggle: (card: ConnectionCard) => void;
  testingId: string | null;
};
type ConnectionCardProps = {
  card: ConnectionCard;
  enabled: boolean;
  isTesting: boolean;
  onTest: (card: ConnectionCard) => void;
  onToggle: (card: ConnectionCard) => void;
};
type StateProps = { state: Exclude<ConnectionViewState, "degraded"> };

const iconMap = {
  bot: Bot,
  briefcase: Briefcase,
  plugZap: PlugZap,
  upload: Upload
} satisfies Record<ConnectionIconKey, typeof Bot>;

export function ConnectionHeader() {
  return (
    <header className="uz-connection-head" data-testid="m7-connection-header">
      <h2 className="uz-connection-title">{connectionMeta.title}</h2>
      <span className="uz-connection-subtitle">{connectionMeta.subtitle}</span>
      <StatusBadge tone="warn">{connectionMeta.descriptor}</StatusBadge>
    </header>
  );
}

export function ConnectionRuntimeNote() {
  return (
    <div className="uz-connection-note" data-testid="m7-connection-runtime-note">
      <IconSlot icon={Lock} size="sm" />
      <strong>{connectionRuntimeLabels.slice(0, 3).join(" · ")}</strong>
      <span>{connectionRuntimeLabels.slice(3).join(" · ")}</span>
    </div>
  );
}

export function ConnectionStatePanel({ state }: StateProps) {
  const title = state === "permission" ? "permission denied" : state;
  return (
    <main className="uz-connection-state" data-testid={`m7-connection-state-${state}`}>
      <div>
        <h2>{title}</h2>
        <p>{`Synthetic ${title} state. ${connectionMeta.runtime}.`}</p>
      </div>
    </main>
  );
}

export function ConnectionList(props: ConnectionListProps) {
  const { cards, flags, onTest, onToggle, testingId } = props;
  return (
    <section
      aria-label="集团连接类型"
      className="uz-connection-list"
      data-testid="m7-connection-list"
    >
      {cards.map((card) => (
        <ConnectionCardItem
          card={card}
          enabled={!!flags[card.id]}
          isTesting={testingId === card.id}
          key={card.id}
          onTest={onTest}
          onToggle={onToggle}
        />
      ))}
    </section>
  );
}

function ConnectionCardItem(props: ConnectionCardProps) {
  const { card, enabled, isTesting, onTest, onToggle } = props;
  const statusTone = toStatusTone(card.healthTone);
  return (
    <article
      className="uz-connection-card"
      data-testid={`m7-connection-card-${card.id}`}
    >
      <span className="uz-connection-icon">
        <IconSlot icon={iconMap[card.icon]} size="lg" />
      </span>
      <div className="uz-connection-body">
        <div className="uz-connection-card-head">
          <strong>{card.title}</strong>
          <StatusBadge tone={statusTone}>{card.health}</StatusBadge>
          {card.adr ? (
            <span
              className="uz-connection-adr"
              data-testid={`m7-connection-source-${card.id}`}
            >
              {card.adr} · {card.adrVerdict}
            </span>
          ) : null}
        </div>
        <p className="uz-connection-desc">{card.desc}</p>
        <div className="uz-connection-meta">
          <span>
            覆盖租户：<strong>{card.tenantCount}</strong>
          </span>
          <span className="uz-connection-mono">接入定级：{card.spike}</span>
          <span
            className={`uz-connection-error ${
              card.recentError.includes("无") ? "is-clear" : ""
            }`}
          >
            最近错误：{card.recentError}
          </span>
        </div>
        <div
          className="uz-connection-tenants"
          data-testid={`m7-connection-tenants-${card.id}`}
        >
          {card.tenantList.map((tenant) => (
            <span className="uz-connection-chip" key={tenant}>
              {tenant}
            </span>
          ))}
        </div>
      </div>
      <div className="uz-connection-controls">
        <div className="uz-connection-switch-row">
          <Toggle
            aria-label={`${card.title} browser-local toggle`}
            checked={enabled}
            data-testid={`m7-connection-toggle-${card.id}`}
            onClick={() => onToggle(card)}
          />
          <span className={`uz-connection-state-label ${enabled ? "is-on" : "is-off"}`}>
            {enabled ? "已启用" : "已停用"}
          </span>
        </div>
        <Button
          className="uz-connection-action"
          data-testid={`m7-connection-test-${card.id}`}
          disabled={isTesting}
          onClick={() => onTest(card)}
          variant="secondary"
        >
          {isTesting ? "测试中..." : "测试连接"}
        </Button>
      </div>
    </article>
  );
}

function toStatusTone(tone: ConnectionTone) {
  if (tone === "danger") return "danger";
  if (tone === "warn") return "warn";
  if (tone === "ok") return "ok";
  if (tone === "info") return "info";
  return "neutral";
}

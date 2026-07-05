import { Bot, Briefcase, Lock, PlugZap, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { IconSlot, StatusBadge, Toggle } from "../../primitives";
import {
  connectionMeta,
  connectionRuntimeLabels,
  toneLabel,
  type ConnectionCard,
  type ConnectionIconKey,
  type ConnectionViewState
} from "./groupConnectionFallback";

type ListProps = {
  cards: ConnectionCard[];
  flags: Record<string, boolean>;
  onTest: (card: ConnectionCard) => void;
  onToggle: (card: ConnectionCard) => void;
  testingId: string | null;
};
type CardProps = {
  card: ConnectionCard;
  enabled: boolean;
  onTest: (card: ConnectionCard) => void;
  onToggle: (card: ConnectionCard) => void;
  testing: boolean;
};
type StateProps = { state: Exclude<ConnectionViewState, "degraded"> };

const iconMap: Record<ConnectionIconKey, LucideIcon> = {
  bot: Bot,
  briefcase: Briefcase,
  plugZap: PlugZap,
  upload: Upload
};

export function ConnectionHeader() {
  return (
    <header className="uz-connection-head">
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
  return (
    <main className="uz-connection-state" data-testid={`m7-connection-state-${state}`}>
      <div>
        <h2>{state}</h2>
        <p>{`Synthetic ${state} state. ${connectionMeta.runtime}.`}</p>
      </div>
    </main>
  );
}

export function ConnectionList({
  cards,
  flags,
  onTest,
  onToggle,
  testingId
}: ListProps) {
  return (
    <section aria-label="连接卡片" className="uz-connection-list">
      {cards.map((card) => (
        <ConnectionCardItem
          card={card}
          enabled={!!flags[card.id]}
          key={card.id}
          onTest={onTest}
          onToggle={onToggle}
          testing={testingId === card.id}
        />
      ))}
    </section>
  );
}

function ConnectionCardItem({ card, enabled, onTest, onToggle, testing }: CardProps) {
  const healthTone = toneLabel(card.healthTone);
  const recentErrorClear = card.recentError === "无";
  const Icon = iconMap[card.icon];
  return (
    <article
      className="uz-connection-card"
      data-testid={`m7-connection-card-${card.id}`}
    >
      <span className="uz-connection-icon">
        <IconSlot icon={Icon} size="lg" />
      </span>
      <div className="uz-connection-body">
        <div className="uz-connection-card-head">
          <strong>{card.title}</strong>
          <StatusBadge tone={healthTone}>{card.health}</StatusBadge>
          <span className="uz-connection-sr-only">{`mock ${card.health}`}</span>
          {card.adr ? (
            <span className="uz-connection-adr">
              {`${card.adr} · ${card.adrVerdict}`}
            </span>
          ) : null}
        </div>
        <p className="uz-connection-desc">{card.desc}</p>
        <div className="uz-connection-meta">
          <span>
            <strong>覆盖租户 </strong>
            {card.tenantCount}
            <span className="uz-connection-sr-only">{`mock ${card.tenantCount}`}</span>
          </span>
          <span className="uz-connection-mono">
            {`接入定级：${card.spike}`}
            <span className="uz-connection-sr-only">{`接入定级：mock ${card.spike}`}</span>
          </span>
          <span className={`uz-connection-error${recentErrorClear ? " is-clear" : ""}`}>
            {`最近错误：${card.recentError}`}
            <span className="uz-connection-sr-only">{`最近错误：mock ${card.recentError}`}</span>
          </span>
        </div>
        <div className="uz-connection-tenants" aria-label={`${card.title} 租户`}>
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
            aria-label={`${card.title} browser-local enabled preview`}
            checked={enabled}
            data-testid={`m7-connection-toggle-${card.id}`}
            onClick={() => onToggle(card)}
          />
          <span className={`uz-connection-state-label ${enabled ? "is-on" : "is-off"}`}>
            {enabled ? "已启用" : "已停用"}
            <span className="uz-connection-sr-only">
              {enabled ? "mock 已启用" : "mock 已停用"}
            </span>
          </span>
        </div>
        <button
          aria-busy={testing}
          className="uz-connection-action"
          data-testid={`m7-connection-test-${card.id}`}
          disabled={testing}
          onClick={() => onTest(card)}
          type="button"
        >
          {testing ? "测试中..." : "测试连接"}
        </button>
      </div>
    </article>
  );
}

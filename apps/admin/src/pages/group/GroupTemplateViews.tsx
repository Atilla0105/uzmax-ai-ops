import { useEffect, useRef, type KeyboardEvent } from "react";
import { Check, Lock, Upload, X } from "lucide-react";
import { IconSlot, StatusBadge } from "../../primitives";
import {
  templateCopyLine,
  templateMeta,
  templateRuntimeLabels,
  templateTabs,
  templateTenantTargets,
  type TemplateCard,
  type TemplateTabId,
  type TemplateTenantTarget,
  type TemplateViewState
} from "./groupTemplateFallback";

type CopyHandler = (card: TemplateCard, trigger: HTMLButtonElement) => void;
type HeaderProps = {
  activeTab: TemplateTabId;
  onChangeTab: (id: TemplateTabId) => void;
};
type GridProps = { cards: TemplateCard[]; onCopy: CopyHandler };
type ModalProps = {
  card: TemplateCard;
  onClose: () => void;
  onConfirm: () => void;
  onToggle: (id: string) => void;
  selected: Record<string, boolean>;
  selectedCount: number;
};
type CardItemProps = { card: TemplateCard; onCopy: CopyHandler };
type TenantTargetProps = {
  onToggle: (id: string) => void;
  selected: boolean;
  tenant: TemplateTenantTarget;
};
type StateProps = { state: Exclude<TemplateViewState, "degraded"> };
const focusableSelector =
  "button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";

export function TemplateHeader({ activeTab, onChangeTab }: HeaderProps) {
  return (
    <header className="uz-template-head">
      <div className="uz-template-title-row">
        <h2 className="uz-template-title">{templateMeta.title}</h2>
        <span className="uz-template-subtitle">{templateMeta.subtitle}</span>
        <StatusBadge tone="warn">{templateMeta.descriptor}</StatusBadge>
      </div>
      <div aria-label="模板中心分类" className="uz-template-tabs" role="tablist">
        {templateTabs.map((tab) => (
          <button
            aria-selected={activeTab === tab.id}
            className="uz-template-tab"
            data-testid={`m7-template-tab-${tab.id}`}
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}

export function TemplateRuntimeNote() {
  return (
    <div className="uz-template-note" data-testid="m7-template-runtime-note">
      <IconSlot icon={Lock} size="sm" />
      <strong>{templateRuntimeLabels.slice(0, 3).join(" · ")}</strong>
      <span>{templateRuntimeLabels.slice(3).join(" · ")}</span>
    </div>
  );
}

export function TemplateStatePanel({ state }: StateProps) {
  const title = state === "permission" ? "permission denied" : state;
  return (
    <main className="uz-template-state" data-testid={`m7-template-state-${state}`}>
      <div>
        <h2>{title}</h2>
        <p>{`Synthetic ${title} state. ${templateMeta.runtime}.`}</p>
      </div>
    </main>
  );
}

export function TemplateGrid({ cards, onCopy }: GridProps) {
  return (
    <section aria-label="模板卡片" className="uz-template-grid">
      {cards.map((card) => (
        <TemplateCardItem card={card} key={card.id} onCopy={onCopy} />
      ))}
    </section>
  );
}

export function CopyModal({
  card,
  onClose,
  onConfirm,
  onToggle,
  selected,
  selectedCount
}: ModalProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);

  useEffect(() => closeRef.current?.focus(), []);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "Tab") trapDialogTab(event, dialogRef.current);
  };

  return (
    <div className="uz-template-scrim" data-testid="m7-template-modal-scrim">
      <section
        aria-labelledby="m7-template-copy-title"
        aria-modal="true"
        className="uz-template-dialog"
        data-testid="m7-template-copy-modal"
        onKeyDown={handleKeyDown}
        ref={dialogRef}
        role="dialog"
      >
        <div className="uz-template-dialog-head">
          <div className="uz-template-dialog-title">
            <h3 id="m7-template-copy-title">
              {`复制「${card.name} ${card.version}」`}
            </h3>
            <p>选择目标租户 · 复制后生成独立版本，可各自演进 · browser-local only</p>
          </div>
          <button
            aria-label="关闭复制弹窗"
            className="uz-template-close"
            onClick={onClose}
            ref={closeRef}
            type="button"
          >
            <IconSlot icon={X} size="sm" />
          </button>
        </div>
        <div aria-label="目标租户" className="uz-template-targets" role="group">
          {templateTenantTargets.map((tenant) => (
            <TenantTargetRow
              key={tenant.id}
              onToggle={onToggle}
              selected={!!selected[tenant.id]}
              tenant={tenant}
            />
          ))}
        </div>
        <div className="uz-template-dialog-foot">
          <button className="uz-template-action" onClick={onClose} type="button">
            取消
          </button>
          <button
            className="uz-template-action uz-template-confirm"
            data-testid="m7-template-confirm-copy"
            disabled={selectedCount === 0}
            onClick={onConfirm}
            type="button"
          >
            确认复制
          </button>
        </div>
      </section>
    </div>
  );
}

function TemplateCardItem({ card, onCopy }: CardItemProps) {
  return (
    <article className="uz-template-card" data-testid={`m7-template-card-${card.id}`}>
      <div className="uz-template-card-head">
        <div className="uz-template-card-title">
          <strong>{card.name}</strong>
          <span>{card.biz}</span>
        </div>
        <StatusBadge tone={card.evalTone}>{card.evalLabel}</StatusBadge>
      </div>
      <div className="uz-template-card-meta">
        <span>
          <span>版本 </span>
          <span className="uz-template-mono">{card.version}</span>
        </span>
        <span>{card.meta}</span>
      </div>
      <div className="uz-template-copy-line">{templateCopyLine(card)}</div>
      <button
        className="uz-template-action"
        data-testid={`m7-template-copy-${card.id}`}
        onClick={(event) => onCopy(card, event.currentTarget)}
        type="button"
      >
        <IconSlot icon={Upload} size="sm" />
        复制到租户
      </button>
    </article>
  );
}

function TenantTargetRow({ onToggle, selected, tenant }: TenantTargetProps) {
  return (
    <button
      aria-checked={selected}
      className="uz-template-row"
      data-testid={`m7-template-tenant-${tenant.id}`}
      onClick={() => onToggle(tenant.id)}
      role="checkbox"
      type="button"
    >
      <span className="uz-template-check">
        {selected ? <IconSlot icon={Check} size="sm" /> : null}
      </span>
      <span
        aria-hidden="true"
        className={`uz-template-dot uz-template-dot--${tenant.tone}`}
      />
      <strong>{tenant.name}</strong>
      <span>{tenant.line}</span>
    </button>
  );
}

function trapDialogTab(event: KeyboardEvent<HTMLElement>, dialog: HTMLElement | null) {
  const focusable = dialog
    ? Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
    : [];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!first || !last) {
    event.preventDefault();
    return;
  }
  const shouldWrapBack = event.shiftKey && document.activeElement === first;
  const shouldWrapNext = !event.shiftKey && document.activeElement === last;
  if (!shouldWrapBack && !shouldWrapNext) return;
  event.preventDefault();
  (shouldWrapBack ? last : first).focus();
}

import { useState } from "react";

import {
  createTemplateCopyDraft,
  templateCenterCards,
  templateCenterKinds,
  templateKindLabels,
  type TemplateCenterKind,
  type TemplateCopyDraft
} from "./templateCenterContracts";
import "./m5-template-center-shell.css";

export function M5TemplateCenterShell({ tenantName }: { tenantName: string }) {
  const [kind, setKind] = useState<TemplateCenterKind>("knowledge");
  const [draft, setDraft] = useState<TemplateCopyDraft | undefined>();
  const visibleCards = templateCenterCards.filter((card) => card.kind === kind);
  const selectedCard = visibleCards[0] ?? templateCenterCards[0];

  const draftCopy = () => {
    setDraft(
      createTemplateCopyDraft({
        sourceTemplateRef: selectedCard.sourceTemplateRef,
        targetTenantRef: "controlled://tenant/current",
        templateKind: selectedCard.kind,
        tenantVersionRef: `controlled://tenant-version/${selectedCard.kind}`
      })
    );
  };

  return (
    <section className="panel m5-template-shell" data-testid="m5-template-center-shell">
      <div className="m5-template-heading">
        <div>
          <p className="eyebrow">Group template center</p>
          <h2>Template copy governance</h2>
        </div>
        <div className="m5-template-mode">
          <strong>{tenantName}</strong>
          <span>synthetic local shell</span>
        </div>
      </div>

      <div className="m5-template-tabs" data-testid="m5-template-tabs">
        {templateCenterKinds.map((templateKind) => (
          <button
            aria-label={`Template tab ${templateKind.replace("_", "-")}`}
            aria-pressed={kind === templateKind}
            data-template-kind={templateKind}
            key={templateKind}
            type="button"
            onClick={() => {
              setKind(templateKind);
              setDraft(undefined);
            }}
          >
            {templateKindLabels[templateKind]}
          </button>
        ))}
      </div>

      <div className="m5-template-layout">
        <div className="m5-template-cards" data-testid="m5-template-cards">
          {visibleCards.map((card) => (
            <article className="m5-template-card" key={card.sourceTemplateRef}>
              <span>{templateKindLabels[card.kind]}</span>
              <strong>{card.title}</strong>
              <small>{card.businessFit}</small>
              <div>
                <span>Version {card.version}</span>
                <span>Last copied {card.lastCopiedTenant}</span>
                <span>Eval {card.evalStatus}</span>
              </div>
              <code>{card.sourceTemplateRef}</code>
            </article>
          ))}
        </div>

        <div className="m5-template-copy" data-testid="m5-template-copy">
          <button type="button" onClick={draftCopy}>
            Draft tenant copy
          </button>
          <button type="button" disabled>
            Sync suggestion disabled
          </button>
          <button type="button" disabled>
            Production apply disabled
          </button>
          {draft ? (
            <div data-testid="m5-template-copy-draft">
              <span>{draft.action}</span>
              <span>{draft.templateKind}</span>
              <span>{draft.tenantVersionRef}</span>
              <span>formal tenant write {String(draft.formalTenantWrite)}</span>
              <span>auto overwrite {String(draft.templateAutoOverwrite)}</span>
              <span>owner confirmation {String(draft.requiresOwnerConfirmation)}</span>
            </div>
          ) : (
            <p>
              Copy creates a tenant-owned draft; template updates only suggest sync.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

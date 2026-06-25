import { useState } from "react";

import {
  createTemplateCopyDraft,
  templateCenterCards,
  templateCenterKinds,
  templateKindLabels,
  type TemplateCenterKind,
  type TemplateCopyDraft
} from "./templateCenterContracts";
import {
  createM5AdminRuntimeFetcher,
  isM5AdminRuntimeEnabled
} from "./m5AdminRuntimeMode";
import "./m5-template-center-shell.css";
import { createTemplateCopyApiClient } from "./templateCopyApiClient";

export function M5TemplateCenterShell({ tenantName }: { tenantName: string }) {
  const runtimeEnabled = isM5AdminRuntimeEnabled("templateCopy");
  const [runtimeResult, setRuntimeResult] = useState("");
  const [kind, setKind] = useState<TemplateCenterKind>("knowledge");
  const [draft, setDraft] = useState<TemplateCopyDraft | undefined>();
  const visibleCards = templateCenterCards.filter((card) => card.kind === kind);
  const selectedCard = visibleCards[0] ?? templateCenterCards[0];

  const draftCopy = async () => {
    if (runtimeEnabled) {
      try {
        const client = createTemplateCopyApiClient({
          fetcher: createM5AdminRuntimeFetcher()
        });
        const result = await client.copyToTenant({
          controlRefs: ["controlled://m5r-07/template-copy/control"],
          reasonRef: "controlled://m5r-07/template-copy/reason",
          sourceSnapshotRef: "controlled://template-copy/snapshot/m5r-07",
          sourceTemplateRef: runtimeSourceTemplateRef(selectedCard.kind),
          targetKey: `m5r-07.${selectedCard.kind}`,
          templateKind: runtimeTemplateKind(selectedCard.kind),
          traceId: "m5r-07:template-copy"
        });
        setDraft({
          action: "copy_to_tenant",
          formalTenantWrite: false,
          requiresOwnerConfirmation: true,
          sourceTemplateRef: runtimeSourceTemplateRef(selectedCard.kind),
          targetTenantRef: "controlled://tenant/current",
          templateAutoOverwrite: false,
          templateKind: selectedCard.kind,
          tenantVersionRef: String(result.tenantVersionRef)
        });
        setRuntimeResult(
          `Template copy API ${String(result.configVersionRef)} ${String(result.auditRef)}`
        );
      } catch (error) {
        setRuntimeResult(errorMessage(error));
      }
      return;
    }
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
          <span>
            {runtimeEnabled ? "runtime API client" : "synthetic local shell"}
          </span>
        </div>
      </div>
      {runtimeEnabled ? (
        <p className="m5-template-copy" data-testid="m5-template-runtime-result">
          {runtimeResult || "Runtime API client mode waiting."}
        </p>
      ) : null}

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
          <button type="button" onClick={() => void draftCopy()}>
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

function runtimeTemplateKind(kind: TemplateCenterKind) {
  return kind === "knowledge" ? "config" : kind;
}

function runtimeSourceTemplateRef(kind: TemplateCenterKind) {
  return `controlled://group-template/${runtimeTemplateKind(kind)}/m5r-07`;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "template copy API request failed";
}

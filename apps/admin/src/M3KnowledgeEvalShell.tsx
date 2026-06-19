import { useState } from "react";
import "./m3-knowledge-eval-shell.css";

const resourceCategories = [
  {
    detail: "Versioned operational facts with hit and feedback status.",
    key: "facts",
    label: "Facts",
    rows: [
      ["Fact entries", "draft", "controlled ref", "eval failed"],
      ["Negative feedback", "review", "tenant scoped", "owner pending"]
    ]
  },
  {
    detail: "Tutorial journeys remain local until owner materials arrive.",
    key: "journeys",
    label: "Journeys",
    rows: [
      ["Journey flows", "blocked", "stage locator", "owner pack needed"],
      ["Journey import", "not wired", "manifest only", "future spec"]
    ]
  },
  {
    detail: "Stage cards show bounded guidance and next actions only.",
    key: "stages",
    label: "Stages",
    rows: [
      ["Stage cards", "draft", "card only", "no full guide dump"],
      ["Clarification", "ready", "fail closed", "handoff option"]
    ]
  },
  {
    detail: "Material references stay controlled and tenant scoped.",
    key: "materials",
    label: "Materials",
    rows: [
      ["Material refs", "review", "controlled storage ref", "no upload path"],
      ["Unused assets", "local", "reference audit", "delete disabled"]
    ]
  }
] as const;

const gateFailures = [
  ["Knowledge target", "failed", "redline and language coverage not passed"],
  ["Prompt target", "blocked", "required eval result missing"],
  ["Model route", "blocked", "route release waits for passed gate"]
] as const;

const publishPolicies = [
  ["Prompt", "Save prompt blocked"],
  ["Knowledge", "Publish knowledge blocked"],
  ["Model route", "Release model route blocked"]
] as const;

type CategoryKey = (typeof resourceCategories)[number]["key"];

export function M3KnowledgeEvalShell({ tenantName }: { tenantName: string }) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("facts");
  const selected =
    resourceCategories.find((category) => category.key === activeCategory) ??
    resourceCategories[0];

  return (
    <section className="panel m3-shell" data-testid="m3-knowledge-eval-shell">
      <div className="m3-shell-heading">
        <div>
          <p className="eyebrow">Tenant knowledge and eval operations</p>
          <h2>Knowledge resource and eval gate shell</h2>
        </div>
        <div className="m3-mode" data-testid="m3-shell-mode">
          <strong>{tenantName}</strong>
          <span>synthetic local shell</span>
        </div>
      </div>

      <div className="m3-scope-strip" aria-label="M3 shell boundary">
        <span>Foundation evidence only</span>
        <span>Controlled refs only</span>
        <span>Publish path blocked</span>
        <span>Owner inputs still active</span>
      </div>

      <div className="m3-layout">
        <section className="m3-column" data-testid="m3-knowledge-resources">
          <div className="m3-section-heading">
            <div>
              <h3>Knowledge and resources</h3>
              <p>Local rows mirror the future operations workflow.</p>
            </div>
            <span>H-01 partial</span>
          </div>

          <div className="m3-category-grid" data-testid="m3-resource-categories">
            {resourceCategories.map((category) => (
              <button
                className={
                  activeCategory === category.key ? "m3-category active" : "m3-category"
                }
                data-testid={`m3-category-${category.key}`}
                key={category.key}
                type="button"
                onClick={() => setActiveCategory(category.key)}
              >
                <strong>{category.label}</strong>
                <span>{category.detail}</span>
              </button>
            ))}
          </div>

          <div className="m3-resource-table" role="table" aria-label="M3 resource rows">
            <div className="m3-table-row header" role="row">
              <span role="columnheader">Type</span>
              <span role="columnheader">State</span>
              <span role="columnheader">Scope</span>
              <span role="columnheader">Gate</span>
            </div>
            {selected.rows.map(([type, state, scope, gate]) => (
              <div className="m3-table-row" role="row" key={`${selected.key}-${type}`}>
                <strong role="cell">{type}</strong>
                <span role="cell">{state}</span>
                <span role="cell">{scope}</span>
                <span role="cell">{gate}</span>
              </div>
            ))}
          </div>

          <div className="m3-action-row" aria-label="Knowledge local actions">
            <button type="button" disabled>
              Edit local row only
            </button>
            <button type="button" disabled>
              Publish knowledge blocked
            </button>
            <button type="button" disabled>
              Upload material blocked
            </button>
          </div>
        </section>

        <section className="m3-column" data-testid="m3-eval-gate">
          <div className="m3-section-heading">
            <div>
              <h3>Eval gate</h3>
              <p>Production gate refuses release until passed evidence exists.</p>
            </div>
            <span className="m3-gate-failed">failed</span>
          </div>

          <div className="m3-gate-summary" data-testid="m3-production-gate">
            <span>Production gate</span>
            <strong>failed</strong>
            <small>G-03 foundation semantics only</small>
          </div>

          <div className="m3-failure-list" data-testid="m3-gate-failures">
            {gateFailures.map(([target, state, reason]) => (
              <div className="m3-failure-row" key={target}>
                <strong>{target}</strong>
                <span>{state}</span>
                <small>{reason}</small>
              </div>
            ))}
          </div>

          <div className="m3-policy-list" data-testid="m3-publish-policy">
            {publishPolicies.map(([target, action]) => (
              <div className="m3-policy-row" key={target}>
                <span>{target}</span>
                <strong>{action}</strong>
              </div>
            ))}
          </div>

          <div className="m3-action-row" aria-label="Eval gate blocked actions">
            <button type="button" disabled>
              Save prompt blocked
            </button>
            <button type="button" disabled>
              Release model route blocked
            </button>
            <button type="button" disabled>
              Production action blocked
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

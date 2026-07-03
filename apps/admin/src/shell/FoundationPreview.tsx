import {
  Avatar,
  Button,
  Checkbox,
  SearchInput,
  StatusBadge,
  Toggle
} from "../primitives";
import { DegradedBar, EmptyState, PageState, Tabs } from "../patterns";

export interface FoundationPreviewProps {
  activeTab: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onTabChange: (tab: string) => void;
  onToggleChange: (checked: boolean) => void;
  toggleOn: boolean;
}

export function FoundationPreview({
  activeTab,
  checked,
  onCheckedChange,
  onTabChange,
  onToggleChange,
  toggleOn
}: FoundationPreviewProps) {
  return (
    <section className="panel foundation-preview" data-testid="m7-foundation-preview">
      <div className="section-heading">
        <p className="eyebrow">M7 foundation</p>
        <h2>Shared tokens, primitives and states</h2>
      </div>
      <DegradedBar data-testid="m7-degraded-bar">
        Connector degraded state uses text, icon slot and warning tokens.
      </DegradedBar>
      <Tabs
        active={activeTab}
        onChange={onTabChange}
        tabs={[
          { key: "states", label: "States" },
          { key: "primitives", label: "Primitives" },
          { key: "disabled", label: "Permission" }
        ]}
      />
      <div
        className="foundation-preview__controls"
        data-testid="m7-foundation-controls"
      >
        <Button variant="primary">Confirm</Button>
        <Button variant="secondary" kbd="J">
          Review
        </Button>
        <Button isLoading variant="success">
          Loading
        </Button>
        <SearchInput
          aria-label="Foundation search"
          placeholder="Search foundation"
          readOnly
        />
        <StatusBadge dot tone="danger">
          Human needed
        </StatusBadge>
        <Avatar initial="AI" tone="ai" />
        <Toggle
          aria-label="Foundation toggle"
          checked={toggleOn}
          onClick={() => onToggleChange(!toggleOn)}
        />
        <Checkbox
          aria-label="Foundation checkbox"
          checked={checked}
          onClick={() => onCheckedChange(!checked)}
        />
      </div>
      <div className="foundation-preview__states" data-testid="m7-foundation-states">
        <PageState
          data-testid="m7-state-loading"
          kind="loading"
          message="Loading keeps dimensions stable."
        />
        <PageState
          data-testid="m7-state-empty"
          kind="empty"
          message="Empty teaches the next allowed action."
          title="Empty"
        />
        <PageState
          data-testid="m7-state-error"
          kind="error"
          message="Error includes recovery action."
        />
        <PageState
          data-testid="m7-state-permission"
          kind="permission"
          message="Permission denied names the boundary."
        />
        <PageState
          data-testid="m7-state-degraded"
          kind="degraded"
          message="Degraded explains whether action is safe."
        />
      </div>
      {activeTab === "disabled" ? (
        <EmptyState
          data-testid="m7-empty-state"
          description="This is a foundation preview, not a migrated page."
          title="No page migration in this slice"
        />
      ) : null}
    </section>
  );
}

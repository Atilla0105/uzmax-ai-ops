import {
  Avatar,
  Button,
  Checkbox,
  Input,
  Kbd,
  SearchInput,
  StatusBadge,
  Toggle
} from "../primitives";
import { DegradedBar, EmptyState, PageState, Tabs } from "../patterns";
import { OperationalPatternsPreview } from "../patterns/operational-patterns-preview";

export interface FoundationPreviewProps {
  activeTab: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onTabChange: (tab: string) => void;
  onToggleChange: (checked: boolean) => void;
  toggleOn: boolean;
}

const previewStates = [
  ["loading", "Loading keeps dimensions stable.", "m7-state-loading"],
  ["empty", "Empty teaches the next allowed action.", "m7-state-empty"],
  ["error", "Error includes recovery action.", "m7-state-error"],
  ["permission", "Permission denied names the boundary.", "m7-state-permission"],
  ["degraded", "Degraded explains whether action is safe.", "m7-state-degraded"]
] as const;

export function FoundationPreview({
  activeTab,
  checked,
  onCheckedChange,
  onTabChange,
  onToggleChange,
  toggleOn
}: FoundationPreviewProps) {
  return (
    <>
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
            aria-label="Foundation lookup"
            placeholder="Search foundation"
            readOnly
          />
          <Input aria-label="Foundation filter" kbdHint="/" readOnly value="Filter" />
          <StatusBadge dot tone="danger">
            Human needed
          </StatusBadge>
          <Kbd>Esc</Kbd>
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
          <EmptyState
            data-testid="m7-empty-state"
            description="Empty work surfaces keep layout stable."
            title="No records"
          />
          {previewStates.map(([kind, message, testId]) => (
            <PageState
              data-testid={testId}
              key={kind}
              kind={kind}
              message={message}
              title={kind === "empty" ? "Empty" : undefined}
            />
          ))}
        </div>
      </section>

      <OperationalPatternsPreview />
    </>
  );
}

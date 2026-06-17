import { useState } from "react";
import "./m2-conversation-ticket-shell.css";

const statusFilters = "Unread|Awaiting reply|Needs human|Handoff|Closed|SLA risk".split(
  "|"
);
type Conversation = readonly [string, readonly string[], string, string];
const conversations: readonly Conversation[] = [
  [
    "Needs human",
    ["Needs human", "Unread", "Awaiting reply"],
    "Synthetic priority lane",
    "Awaiting operator review"
  ],
  [
    "SLA risk",
    ["SLA risk", "Awaiting reply"],
    "Synthetic timer lane",
    "Policy clock near breach"
  ],
  ["Handoff", ["Handoff"], "Synthetic handoff lane", "Ticket linked locally"],
  ["Closed", ["Closed"], "Synthetic archive lane", "No active reply needed"]
];

const ticketQueues = "Unclaimed|Mine|SLA soon|Reopened|Morning follow-up".split("|");
const events = "Pending handoff|In-flight withdrawn|Ticket locked locally".split("|");
const stateBadges = [
  ["m2-state-loading", "Loading", "Skeleton rows"],
  ["m2-state-empty", "Empty", "No matching items"],
  ["m2-state-error", "Error", "Retry disabled"],
  ["m2-state-permission", "Permission denied", "Backend remains source"],
  ["m2-state-degraded", "Degraded", "No realtime claim"]
] as const;
const ticketFields = [
  ["Summary", "Synthetic handoff needs operator decision."],
  ["Suggested action", "Review context, add note, choose result before closing."],
  ["SLA policy ref", "config-placeholder-m2"],
  ["Notes", "Local note rail, no persistence claim."],
  ["Event timeline", events.join(" / ")]
] as const;
const resultOptions = ["resolved", "manual", "none", "invalid", "duplicate"] as const;

export function M2ConversationTicketShell({ tenantName }: { tenantName: string }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [handoffMode, setHandoffMode] = useState("Taken over");
  const [ticketState, setTicketState] = useState("Unclaimed");
  const [closeResult, setCloseResult] = useState("");
  const [closeDestination, setCloseDestination] = useState("");
  const [closeExplanation, setCloseExplanation] = useState("");

  const filtered =
    activeFilter === "All"
      ? conversations
      : conversations.filter(([, tags]) => tags.includes(activeFilter));
  const canClose = Boolean(closeResult && closeDestination && closeExplanation);

  return (
    <section className="panel m2-shell" data-testid="m2-conversation-ticket-shell">
      <div className="m2-shell-heading">
        <div>
          <p className="eyebrow">Tenant conversation operations</p>
          <h2>Conversation and ticket shell</h2>
        </div>
        <p className="m2-shell-tenant" data-testid="m2-shell-tenant">
          {tenantName} synthetic local mode
        </p>
      </div>

      <div className="m2-state-strip" aria-label="M2 local state coverage">
        {stateBadges.map(([testId, title, detail]) => (
          <article className="m2-state" data-testid={testId} key={testId}>
            <strong>{title}</strong>
            <span>{detail}</span>
          </article>
        ))}
      </div>

      <div className="m2-dashboard">
        <section className="m2-column">
          <div className="m2-section-heading">
            <h3>Conversation list</h3>
            <span>Needs human and SLA risk stay pinned</span>
          </div>
          <div className="m2-filter-row" data-testid="conversation-filters">
            <button
              className={activeFilter === "All" ? "m2-filter active" : "m2-filter"}
              type="button"
              onClick={() => setActiveFilter("All")}
            >
              All
            </button>
            {statusFilters.map((filter) => (
              <button
                className={activeFilter === filter ? "m2-filter active" : "m2-filter"}
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="m2-list" data-testid="conversation-priority-list">
            {filtered.map(([status, , title, note]) => (
              <button className="m2-list-row" key={title} type="button">
                <strong>{status}</strong>
                <span>{title}</span>
                <small>{note}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="m2-column" data-testid="conversation-detail">
          <div className="m2-section-heading">
            <h3>Conversation detail</h3>
            <span>{handoffMode}</span>
          </div>
          <div className="message-thread" aria-label="Synthetic message thread">
            {[
              "Inbound synthetic message asks for the next safe step.",
              "AI suspended after handoff request.",
              "In-flight message status: withdrawn.",
              "In-flight message status: pending_cancel."
            ].map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
          <div className="m2-action-row">
            <button type="button" onClick={() => setHandoffMode("Taken over")}>
              Take over local shell
            </button>
            <button type="button" onClick={() => setHandoffMode("Returned locally")}>
              Return to AI local shell
            </button>
            <button type="button" disabled>
              Business disabled by ADR-B01
            </button>
          </div>
        </section>
      </div>

      <div className="m2-dashboard ticket-dashboard">
        <section className="m2-column">
          <div className="m2-section-heading">
            <h3>Ticket queues</h3>
            <span data-testid="ticket-action-state">{ticketState}</span>
          </div>
          <div className="m2-filter-row" data-testid="ticket-queue-tabs">
            {ticketQueues.map((queue) => (
              <button
                className="m2-filter"
                key={queue}
                type="button"
                onClick={() => setTicketState(queue)}
              >
                {queue}
              </button>
            ))}
          </div>
          <div className="m2-ticket-summary">
            <strong>Unclaimed synthetic ticket</strong>
            <span>SLA policy ref: tenant-config-placeholder</span>
          </div>
        </section>

        <section className="m2-column" data-testid="ticket-detail">
          <div className="m2-section-heading">
            <h3>Ticket detail</h3>
            <span>Local-only state machine</span>
          </div>
          <dl className="m2-ticket-fields">
            {ticketFields.map(([term, detail]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{detail}</dd>
              </div>
            ))}
          </dl>
          <div className="m2-action-row">
            {[
              ["Claim local shell", "Claimed"],
              ["Lock local shell", "Locked"],
              ["Add note locally", "Note staged"],
              ["Escalate local shell", "Escalated"]
            ].map(([label, state]) => (
              <button
                key={label}
                type="button"
                onClick={() => setTicketState(state ?? "")}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              disabled={!ticketState.startsWith("Closed:")}
              onClick={() => setTicketState("Reopened")}
            >
              Reopen local shell
            </button>
          </div>
          <div className="m2-close-grid">
            <label>
              Close result
              <select
                aria-label="Close result"
                value={closeResult}
                onChange={(event) => setCloseResult(event.currentTarget.value)}
              >
                <option value="">Select result</option>
                {resultOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Close destination
              <input
                aria-label="Close destination"
                value={closeDestination}
                onChange={(event) => setCloseDestination(event.currentTarget.value)}
                placeholder="Queue or follow-up lane"
              />
            </label>
            <label>
              Close explanation
              <textarea
                aria-label="Close explanation"
                value={closeExplanation}
                onChange={(event) => setCloseExplanation(event.currentTarget.value)}
                placeholder="Required local explanation"
              />
            </label>
            <button
              type="button"
              disabled={!canClose}
              onClick={() => setTicketState(`Closed: ${closeResult}`)}
            >
              Close ticket shell
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

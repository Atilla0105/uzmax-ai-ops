import { runM10ConversationTicketActionsTrueDbSmoke } from "./tests/run-m10-conversation-ticket-actions-true-db-smoke.mjs";

export { runM10ConversationTicketActionsTrueDbSmoke };

if (
  process.argv[1]?.endsWith("run-m10-conversation-ticket-actions-true-db-smoke.mjs")
) {
  await runM10ConversationTicketActionsTrueDbSmoke();
}

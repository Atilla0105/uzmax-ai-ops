import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { runM10ConversationTicketActionsTrueDbSmoke } from "../../packages/db/scripts/run-m10-conversation-ticket-actions-true-db-smoke.mjs";

const repoRoot = process.cwd();
const source = {
  smoke: read("packages/db/scripts/tests/run-m10-conversation-ticket-actions-true-db-smoke.mjs"),
  spec: read("docs/specs/M10-01-conversation-ticket-db-writes.md"),
  wrapper: read("packages/db/scripts/run-m10-conversation-ticket-actions-true-db-smoke.mjs")
};

describe("M10-01 conversation-ticket true DB smoke", () => {
  it("declares a synthetic fail-closed true DB smoke for ticket actions", async () => {
    assert.match(source.wrapper, /runM10ConversationTicketActionsTrueDbSmoke/);
    assert.match(source.smoke, /UZMAX_RLS_DATABASE_URL/);
    assert.match(source.smoke, /createHandoffTicket/);
    assert.match(source.smoke, /type: "claim"/);
    assert.match(source.smoke, /type: "note"/);
    assert.match(source.smoke, /type: "close"/);
    assert.match(source.smoke, /type: "reopen"/);
    assert.match(source.smoke, /residue=0/);
    assert.doesNotMatch(source.smoke, /console\.log\([^)]*databaseUrl/);
    assert.doesNotMatch(source.smoke, /console\.log\([^)]*TOKEN/);
    assert.match(source.spec, /M10-01 Conversation Ticket DB Writes/);

    const previous = process.env.UZMAX_RLS_DATABASE_URL;
    delete process.env.UZMAX_RLS_DATABASE_URL;
    await assert.rejects(
      () => runM10ConversationTicketActionsTrueDbSmoke(),
      /UZMAX_RLS_DATABASE_URL is required/
    );
    restoreEnv("UZMAX_RLS_DATABASE_URL", previous);
  });
});

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function restoreEnv(name, value) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

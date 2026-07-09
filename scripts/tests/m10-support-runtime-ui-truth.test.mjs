import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const files = {
  conversationPage: read("apps/admin/src/pages/conversations/ConversationsPage.tsx"),
  nav: read("apps/admin/src/shell/AppShellNavigation.tsx"),
  pageOutlet: read("apps/admin/src/pages/PageOutlet.tsx"),
  queuePage: read("apps/admin/src/pages/queue/QueuePage.tsx"),
  queueRuntime: read("apps/admin/src/pages/queue/QueueRuntime.ts"),
  queueSupport: read("apps/admin/src/pages/queue/QueueSupport.tsx"),
  spec: read("docs/specs/M10-06-support-runtime-ui-truth.md"),
  ticketHtml: read("apps/admin/src/pages/tickets/TicketHtml.ts"),
  ticketPage: read("apps/admin/src/pages/tickets/TicketsPage.tsx"),
  ticketRuntime: read("apps/admin/src/pages/tickets/ticketRuntime.ts")
};

test("M10-06 spec declares the support runtime UI truth scope", () => {
  assert.match(files.spec, /Spec ID: M10-06/);
  assert.match(files.spec, /apps\/admin\/src\/pages\/tickets\/ticketRuntime\.ts/);
  assert.match(files.spec, /apps\/admin\/src\/pages\/tickets\/ticketLocalActions\.ts/);
  assert.match(files.spec, /apps\/admin\/src\/pages\/queue\/QueueRuntime\.ts/);
  assert.match(files.spec, /new source files <= 3/);
  assert.match(files.spec, /No new ticket-list API route/);
  assert.match(files.spec, /strict runtime.*must not inject `fallbackItems`/s);
});

test("support navigation no longer uses hard-coded badge counts", () => {
  assert.doesNotMatch(files.nav, /navBadges/);
  assert.doesNotMatch(files.nav, /"tenant\.conversations":\s*"7"/);
  assert.doesNotMatch(files.nav, /"tenant\.tickets":\s*"3"/);
  assert.doesNotMatch(files.nav, /"tenant\.queue":\s*"9"/);
  assert.doesNotMatch(files.nav, /badge:\s*navBadges/);
});

test("conversation ready state distinguishes runtime API from synthetic degraded", () => {
  assert.match(
    files.conversationPage,
    /runtime\.status === "ready" && runtime\.runtimeSource === "synthetic"/
  );
  assert.doesNotMatch(
    files.conversationPage,
    /data-runtime-state=\{runtime\.status === "ready" \? "degraded" : runtime\.status\}/
  );
});

test("confirmation queue uses selected-tenant admin runtime and fails closed in strict mode", () => {
  assert.match(
    files.pageOutlet,
    /<QueuePage key=\{selectedTenantId\} selectedTenantId=\{selectedTenantId\}/
  );
  assert.match(files.queuePage, /useQueueRuntime\(selectedTenantId\)/);
  assert.match(
    files.queueRuntime,
    /createAdminRuntimeFetcher\(config, \{\s*selectedTenantId\s*\}\)/
  );
  assert.doesNotMatch(files.queueRuntime, /window\.fetch\(input/);
  assert.match(
    files.queueRuntime,
    /if \(!config\.strictRuntime\) \{\s*useSyntheticQueueFallback/s
  );
  assert.match(files.queueRuntime, /setItems\(\[\]\)/);
  assert.match(files.queueRuntime, /setStatus\(reason\)/);
  assert.doesNotMatch(files.queueSupport, /fallbackItems/);
});

test("ticket page uses conversation-ticket runtime in strict mode and keeps fallback local only", () => {
  assert.match(files.ticketRuntime, /config\.strictRuntime \? \[\] : ticketRecords/);
  assert.match(files.ticketRuntime, /\/conversation-ticket\/conversations/);
  assert.match(
    files.ticketRuntime,
    /\/conversation-ticket\/tickets\/\$\{encodeURIComponent\(active\.id\)\}\/actions/
  );
  assert.match(files.ticketRuntime, /runtimeTicketRecordsFromDetails/);
  assert.match(files.ticketPage, /useTicketRuntime\(selectedTenantId\)/);
  assert.match(
    files.ticketPage,
    /renderTicketRuntimeState\(runtime, selectedTenantId\)/
  );
  assert.match(
    files.ticketPage,
    /!runtime\.strictRuntime \|\| runtime\.runtimeStatus === "ready"/
  );
  assert.match(files.ticketHtml, /transferDisabled/);
  assert.doesNotMatch(files.ticketPage, /useState<TicketRecord\[\]>\(ticketRecords\)/);
});

function read(relativePath) {
  return readFileSync(relativePath, "utf8");
}

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const files = {
  conversationPage: read("apps/admin/src/pages/conversations/ConversationsPage.tsx"),
  conversationStyles: read(
    "apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx"
  ),
  queuePage: read("apps/admin/src/pages/queue/QueuePage.tsx"),
  queueRuntime: read("apps/admin/src/pages/queue/QueueRuntime.ts"),
  spec: read("docs/specs/M10-07-support-runtime-product-polish.md")
};

test("M10-07 spec keeps the product polish scope narrow", () => {
  assert.match(files.spec, /Spec ID: M10-07/);
  assert.match(files.spec, /No backend, schema, migration/);
  assert.match(files.spec, /No fallback cards restoration in strict\/API mode/);
  assert.match(
    files.spec,
    /apps\/admin\/src\/pages\/conversations\/conversationWorkbenchStyles\.tsx/
  );
  assert.match(
    files.spec,
    /scripts\/tests\/m10-support-runtime-product-polish\.test\.mjs/
  );
});

test("conversation synthetic disclosure is gated to the synthetic runtime source", () => {
  assert.match(
    files.conversationPage,
    /showSyntheticDisclosure=\{runtime\.runtimeSource === "synthetic"\}/
  );
  assert.match(files.conversationStyles, /showSyntheticDisclosure: boolean/);
  assert.match(
    files.conversationStyles,
    /showSyntheticDisclosure \? \([\s\S]*data-testid="m7-conversation-degraded"[\s\S]*synthetic\/degraded\/not-production/
  );
  assert.match(
    files.conversationStyles,
    /data-testid="m10-conversation-runtime-status"[\s\S]*runtime API status/
  );
  assert.doesNotMatch(
    runtimeConversationStatusBranch(),
    /synthetic|degraded|not-production|只读预览/i
  );
});

test("queue runtime branch uses runtime source copy instead of degraded banner identity", () => {
  assert.match(
    files.queuePage,
    /isDegraded \? \([\s\S]*data-testid="m7-queue-degraded"[\s\S]*\) : \([\s\S]*data-testid="m10-queue-runtime-source"/
  );
  assert.match(
    files.queuePage,
    /runtime API source \/confirmation-queue\/items\?status=pending/
  );
  assert.doesNotMatch(
    runtimeQueueSourceBranch(),
    /mock|degraded|synthetic|not-production|只读预览/i
  );
  assert.doesNotMatch(
    runtimeSourceCopyFunction(),
    /mock|degraded|synthetic|not-production|只读预览/i
  );
});

test("queue strict API states do not describe local fallback as mock or degraded", () => {
  const stateCopies = matchBlock(
    files.queueRuntime,
    /const queueStateCopies = \{[\s\S]*?\} satisfies/
  );
  assert.match(files.queueRuntime, /\/status \(401\|403\)\/\.test\(message\)/);
  assert.match(stateCopies, /本地预览队列/);
  assert.doesNotMatch(
    stateCopies,
    /mock\/degraded|mock 队列|degraded|synthetic|not-production|只读预览/i
  );
});

function runtimeConversationStatusBranch() {
  return matchBlock(
    files.conversationStyles,
    /data-testid="m10-conversation-runtime-status"[\s\S]*?<\/span>/
  );
}

function runtimeQueueSourceBranch() {
  return matchBlock(
    files.queuePage,
    /data-testid="m10-queue-runtime-source"[\s\S]*?<\/div>/
  );
}

function runtimeSourceCopyFunction() {
  return matchBlock(files.queuePage, /function runtimeSourceCopy[\s\S]*?\n\}/);
}

function matchBlock(source, pattern) {
  const match = source.match(pattern);
  assert.ok(match, `missing pattern ${pattern}`);
  return match[0];
}

function read(relativePath) {
  return readFileSync(relativePath, "utf8");
}

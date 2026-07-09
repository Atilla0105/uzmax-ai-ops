import type { Page } from "@playwright/test";

export const conversationComposer = (page: Page) =>
  page.getByLabel("Conversation composer");

export const conversationDegraded = (page: Page) =>
  page.getByTestId("m7-conversation-degraded");

export const conversationRuntimeStatus = (page: Page) =>
  page.getByTestId("m10-conversation-runtime-status");

export const conversationRail = (page: Page) =>
  page.getByTestId("m7-conversation-context-rail");

export const conversationRow = (page: Page, id: string) =>
  page.getByTestId(`m7-conversation-row-${id}`);

export const conversationTakeover = (page: Page) =>
  page.getByRole("button", { name: "接管会话 T" });

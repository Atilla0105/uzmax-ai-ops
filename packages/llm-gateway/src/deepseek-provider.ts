import { createHash } from "node:crypto";

import type { LlmProviderPort } from "./index.ts";

type DeepSeekTransportRequest = {
  body: Record<string, unknown>;
  headers: Record<string, string>;
  method: "POST";
  url: string;
};
type DeepSeekTransportResponse = {
  json(): Promise<unknown>;
  ok: boolean;
  status: number;
};

export function createDeepSeekChatProvider(input: {
  apiKey: string;
  baseUrl?: string;
  modelId?: string;
  providerId?: string;
  thinking?: "disabled" | "enabled";
  transport?: (request: DeepSeekTransportRequest) => Promise<DeepSeekTransportResponse>;
}): LlmProviderPort {
  const apiKey = nonEmptyString(input.apiKey, "apiKey");
  const baseUrl = httpBaseUrl(input.baseUrl ?? "https://api.deepseek.com");
  const modelId = nonEmptyString(input.modelId ?? "deepseek-v4-flash", "modelId");
  const providerId = nonEmptyString(
    input.providerId ?? "provider_deepseek",
    "providerId"
  );
  const thinking = input.thinking ?? "disabled";
  if (thinking !== "disabled" && thinking !== "enabled") {
    throw new Error("thinking is invalid");
  }
  const transport = input.transport ?? fetchJsonTransport;

  return {
    async invoke(request) {
      const startedAt = Date.now();
      const messages = chatMessages(request.input.messages);
      const maxTokens = positiveInt(
        request.input.maxTokens ?? request.route.outputTokenBudget,
        "maxTokens"
      );
      const body = {
        max_tokens: maxTokens,
        messages,
        model: modelId,
        stream: false,
        thinking: { type: thinking }
      };
      const response = await transport({
        body,
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json"
        },
        method: "POST",
        url: `${baseUrl}/chat/completions`
      });
      const latencyMs = Math.max(0, Date.now() - startedAt);
      if (!response.ok) return { latencyMs, status: "failed" };

      const payload = record(await response.json());
      const outputText = deepSeekOutputText(payload);
      if (!outputText) return { latencyMs, status: "failed" };
      const usage = record(payload.usage);
      return {
        completionHash: sha256(outputText),
        costMicros: 0,
        inputTokenCount: nonNegativeInteger(usage.prompt_tokens),
        latencyMs,
        outputText,
        outputTokenCount: nonNegativeInteger(usage.completion_tokens),
        promptHash: sha256(JSON.stringify(messages)),
        status: "succeeded"
      };
    },
    modelId,
    providerId
  };
}

async function fetchJsonTransport(request: DeepSeekTransportRequest) {
  const response = await fetch(request.url, {
    body: JSON.stringify(request.body),
    headers: request.headers,
    method: request.method
  });
  return {
    json: () => response.json() as Promise<unknown>,
    ok: response.ok,
    status: response.status
  };
}

function httpBaseUrl(value: string) {
  const text = nonEmptyString(value, "baseUrl").replace(/\/+$/g, "");
  if (!/^https:\/\/[a-z0-9.-]+(?::[0-9]+)?(?:\/[a-z0-9._/-]*)?$/i.test(text)) {
    throw new Error("baseUrl must be an https URL");
  }
  return text;
}

function chatMessages(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("messages must be a non-empty array");
  }
  return value.slice(0, 12).map((item) => {
    const message = record(item);
    const role = nonEmptyString(message.role, "message role");
    if (!["assistant", "system", "user"].includes(role)) {
      throw new Error("message role is invalid");
    }
    return {
      content: nonEmptyString(message.content, "message content").slice(0, 12000),
      role
    };
  });
}

function deepSeekOutputText(payload: Record<string, unknown>) {
  const choices = Array.isArray(payload.choices) ? payload.choices : [];
  const firstChoice = record(choices[0]);
  const message = record(firstChoice.message);
  return outputText(message.content);
}

function outputText(value: unknown) {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  return text ? text.slice(0, 4096) : undefined;
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function positiveInt(value: unknown, name: string): number {
  const parsed = typeof value === "number" ? value : Number.NaN;
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

function nonEmptyString(value: unknown, name: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length === 0) {
    throw new Error(`${name} is required`);
  }
  return text;
}

function nonNegativeInteger(value: unknown) {
  return Number.isInteger(value) && (value as number) >= 0 ? (value as number) : 0;
}

function sha256(value: string) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

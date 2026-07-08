import type { LlmProviderPort, MockProviderResult } from "./index.ts";

export function createMockLlmProvider(input: {
  modelId: string;
  providerId: string;
  result: MockProviderResult;
}): LlmProviderPort {
  return {
    async invoke() {
      return { ...input.result };
    },
    modelId: nonEmptyString(input.modelId, "modelId"),
    providerId: nonEmptyString(input.providerId, "providerId")
  };
}

function nonEmptyString(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}

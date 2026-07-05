import { createConfirmationQueueApiClient } from "../../confirmationQueueApiClient";

type QueueClient = ReturnType<typeof createConfirmationQueueApiClient>;
export type ConfirmationQueueItem = Awaited<
  ReturnType<QueueClient["listItems"]>
>[number];
export type QueueMode = "degraded" | "runtime";
export type QueueMetric = { label: string; tone?: string; value: string };
export type QueueField = { label: string; mono?: boolean; value: string };
export type QueueDisplay = {
  candidate?: QueueField;
  conflictNote?: string;
  current?: QueueField;
  fields: QueueField[];
  score?: string;
  title: string;
};
export type DisplayQueueItem = ConfirmationQueueItem & {
  display: QueueDisplay;
  displayMode: QueueMode;
};

export const fallbackUnavailableCopy = {
  empty: "list API returned empty; showing mock/degraded read-only queue shell",
  error: "list API unavailable; showing mock/degraded read-only queue shell",
  permission:
    "confirmation permission blocked; showing mock/degraded read-only queue shell"
} as const;

export const fallbackItems = [
  {
    candidatePayload: {
      candidateRef: "controlled://m7-ui-63/mock/candidate/knowledge-primary",
      summaryRef: "controlled://m7-ui-63/mock/summary/knowledge-primary"
    },
    createdAt: "2026-07-05T00:00:00.000Z",
    diffPayload: undefined,
    display: {
      fields: [
        {
          label: "来源",
          mono: true,
          value: "controlled://m7-ui-63/mock/source/knowledge-primary"
        },
        {
          label: "候选内容",
          value: "mock/degraded read-only · sanitized controlled knowledge candidate"
        },
        {
          label: "运行时",
          value: "runtime unavailable · no production truth · no write"
        }
      ],
      score: "mock 0.86",
      title: "知识候选 · mock/degraded 示例"
    },
    displayMode: "degraded",
    id: "mock-degraded-normal",
    kind: "knowledge_candidate",
    orgId: "org-m7-ui-63-mock",
    sourceRef: "controlled://m7-ui-63/mock/source/knowledge-primary",
    status: "pending",
    tenantId: "tenant-m7-ui-63-mock"
  },
  {
    candidatePayload: {
      candidateRef: "controlled://m7-ui-63/mock/candidate/conflict-primary"
    },
    createdAt: "2026-07-05T00:01:00.000Z",
    diffPayload: {
      current: { ref: "controlled://m7-ui-63/mock/current/conflict-primary" },
      candidate: { ref: "controlled://m7-ui-63/mock/candidate/conflict-primary" }
    },
    display: {
      candidate: {
        label: "候选值引用",
        mono: true,
        value: "controlled://m7-ui-63/mock/candidate/conflict-primary"
      },
      conflictNote:
        "mock/degraded read-only · conflict buttons are visible but runtime decisions are unavailable.",
      current: {
        label: "当前值引用",
        mono: true,
        value: "controlled://m7-ui-63/mock/current/conflict-primary"
      },
      fields: [
        {
          label: "冲突来源",
          mono: true,
          value: "controlled://m7-ui-63/mock/source/conflict-primary"
        },
        {
          label: "处理边界",
          value: "runtime unavailable · keep-current has no approved API action"
        }
      ],
      score: "mock conflict",
      title: "冲突候选 · mock/degraded 示例"
    },
    displayMode: "degraded",
    id: "mock-degraded-conflict",
    kind: "conflict_candidate",
    orgId: "org-m7-ui-63-mock",
    sourceRef: "controlled://m7-ui-63/mock/source/conflict-primary",
    status: "pending",
    tenantId: "tenant-m7-ui-63-mock"
  }
] satisfies DisplayQueueItem[];

export function runtimeDisplayItem(item: ConfirmationQueueItem): DisplayQueueItem {
  return {
    ...item,
    display: {
      candidate: {
        label: "候选值引用",
        mono: true,
        value: firstControlledRef(item.diffPayload, "candidate")
      },
      current: {
        label: "当前值引用",
        mono: true,
        value: firstControlledRef(item.diffPayload, "current")
      },
      fields: [
        { label: "sourceRef", mono: true, value: item.sourceRef },
        { label: "createdAt", mono: true, value: item.createdAt },
        {
          label: "candidate refs",
          mono: true,
          value:
            collectControlledRefs(item.candidatePayload).join(" · ") || "无可展示引用"
        }
      ],
      title: item.id
    },
    displayMode: "runtime"
  };
}

function collectControlledRefs(value: unknown, refs: string[] = []): string[] {
  if (refs.length >= 4) return refs;
  if (
    typeof value === "string" &&
    /^(controlled|manifest|storage):\/\/[^\s]+$/i.test(value)
  ) {
    refs.push(value);
  } else if (value && typeof value === "object") {
    const entries = Array.isArray(value) ? value : Object.values(value);
    entries.forEach((entry) => collectControlledRefs(entry, refs));
  }
  return refs;
}

function firstControlledRef(value: unknown, preferredKey?: string): string {
  if (preferredKey && value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    const preferred = collectControlledRefs(record[preferredKey])[0];
    if (preferred) return preferred;
  }
  return (
    collectControlledRefs(value)[0] ?? "controlled://m7-ui-10/runtime/ref-unavailable"
  );
}

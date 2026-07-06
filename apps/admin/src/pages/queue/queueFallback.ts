import { createConfirmationQueueApiClient } from "../../confirmationQueueApiClient";

type QueueClient = ReturnType<typeof createConfirmationQueueApiClient>;
export type ConfirmationQueueItem = Awaited<
  ReturnType<QueueClient["listItems"]>
>[number];
export type QueueMode = "degraded" | "runtime";
export type QueueMetric = { label: string; tone?: string; value: string };
type QueueField = { label: string; mono?: boolean; value: string };
type QueueDisplay = {
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

export const queueRuntimeBoundary =
  "mock/degraded | mock | read-only | runtime unavailable | no runtime contract | no production truth | no write | no DB/API/runtime closure";

export const fallbackUnavailableCopy = {
  empty: "list API returned empty; showing mock/degraded read-only queue shell",
  error: "list API unavailable; showing mock/degraded read-only queue shell",
  permission:
    "confirmation permission blocked; showing mock/degraded read-only queue shell"
} as const;

export const fallbackVisibleCopy =
  "确认队列待连接：先展示受控引用和人工确认流程，所有候选须人工确认后生效。";

export const fallbackItems = [
  {
    candidatePayload: {
      candidateRef: "controlled://m7-ui-83/fallback/candidate/knowledge-primary",
      summaryRef: "controlled://m7-ui-83/fallback/summary/knowledge-primary"
    },
    createdAt: "2026-07-05T00:00:00.000Z",
    diffPayload: undefined,
    display: {
      fields: [
        {
          label: "来源",
          mono: true,
          value: "controlled://m7-ui-83/fallback/source/knowledge-primary"
        },
        {
          label: "候选内容",
          value: "受控知识候选，等待人工确认后生效"
        },
        {
          label: "处理边界",
          value: "待连接；仅展示受控引用"
        }
      ],
      score: "0.86",
      title: "知识候选 · 孕期可用性"
    },
    displayMode: "degraded",
    id: "mock-degraded-normal",
    kind: "knowledge_candidate",
    orgId: "org-m7-ui-83-fallback",
    sourceRef: "controlled://m7-ui-83/fallback/source/knowledge-primary",
    status: "pending",
    tenantId: "tenant-m7-ui-83-fallback"
  },
  {
    candidatePayload: {
      candidateRef: "controlled://m7-ui-83/fallback/candidate/conflict-primary"
    },
    createdAt: "2026-07-05T00:01:00.000Z",
    diffPayload: {
      current: { ref: "controlled://m7-ui-83/fallback/current/conflict-primary" },
      candidate: { ref: "controlled://m7-ui-83/fallback/candidate/conflict-primary" }
    },
    display: {
      candidate: {
        label: "候选值引用",
        mono: true,
        value: "controlled://m7-ui-83/fallback/candidate/conflict-primary"
      },
      conflictNote: "冲突候选需人工查看并排差异；处理后才可进入正式知识。",
      current: {
        label: "当前值引用",
        mono: true,
        value: "controlled://m7-ui-83/fallback/current/conflict-primary"
      },
      fields: [
        {
          label: "冲突来源",
          mono: true,
          value: "controlled://m7-ui-83/fallback/source/conflict-primary"
        },
        {
          label: "处理边界",
          value: "保留当前值需后续合约确认"
        }
      ],
      title: "冲突候选 · 物流时效"
    },
    displayMode: "degraded",
    id: "mock-degraded-conflict",
    kind: "conflict_candidate",
    orgId: "org-m7-ui-83-fallback",
    sourceRef: "controlled://m7-ui-83/fallback/source/conflict-primary",
    status: "pending",
    tenantId: "tenant-m7-ui-83-fallback"
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

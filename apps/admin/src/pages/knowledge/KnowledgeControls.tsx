import { createElement as h, type ChangeEvent } from "react";
import { FileText } from "lucide-react";
import { IconSlot } from "../../primitives";
import {
  toneClass,
  type KnowledgeAsset,
  type KnowledgeTab,
  type KnowledgeViewState
} from "./knowledgeFallback";

const runtimeLabels = [
  "degraded",
  "mock",
  "read-only",
  "not production knowledge data",
  "no formal knowledge write",
  "no automatic publish"
];

const stateBoundary =
  "mock degraded read-only knowledge runtime unavailable no production knowledge data";

export function StatePanel({
  state
}: {
  state: Exclude<KnowledgeViewState, "degraded">;
}) {
  const copy = {
    empty: [
      "暂无知识条目",
      "当前没有可展示的知识内容，请从资料导入或确认队列开始整理。"
    ],
    error: ["知识服务暂不可用", "请稍后重试，或先查看确认队列中的待处理候选。"],
    gate: [
      "评测门禁未通过",
      "请先处理红线条目、负反馈样本或待确认候选，再进入发布流程。"
    ],
    loading: ["加载知识与资源", "正在整理旅程、事实、话术、素材和模板来源。"],
    permission: [
      "权限不足",
      "当前账号不能查看该租户的知识与资源，请联系管理员确认权限。"
    ]
  }[state];
  return (
    <main
      className="uz-knowledge-state"
      data-runtime-boundary={stateBoundary}
      data-testid={`m7-knowledge-state-${state}`}
      title={stateBoundary}
    >
      <div>
        <h2>{copy[0]}</h2>
        <p>{copy[1]}</p>
      </div>
    </main>
  );
}

export function KnowledgeRuntimeNote() {
  const boundary = runtimeLabels.join(" · ");
  return h(
    "div",
    {
      "aria-label": "知识与资源运行边界说明",
      className: "uz-knowledge-runtime uz-knowledge-sr-only",
      "data-runtime-boundary": boundary,
      "data-testid": "m7-knowledge-runtime-note",
      hidden: true,
      title: boundary
    },
    [
      h(
        "span",
        { className: toneClass("warn"), key: "badge" },
        runtimeLabels.slice(0, 3).join(" · ")
      ),
      h("span", { key: "copy" }, runtimeLabels.slice(3).join(" · "))
    ]
  );
}

export function KnowledgeToolbar({
  query,
  setQuery,
  tab
}: {
  query: string;
  setQuery: (value: string) => void;
  tab: KnowledgeTab;
}) {
  const chips =
    tab === "assets" ? ["报价", "下单", "售后"] : ["物流", "产品", "售后", "报价"];
  return h(
    "div",
    { className: "uz-knowledge-toolbar", "data-testid": "m7-knowledge-toolbar" },
    [
      h("input", {
        "aria-label": "搜索知识与资源",
        className: "uz-knowledge-search",
        "data-testid": "m7-knowledge-search",
        key: "search",
        onChange: (event: ChangeEvent<HTMLInputElement>) =>
          setQuery(event.currentTarget.value),
        placeholder: tab === "assets" ? "搜索素材名称 / 描述…" : "搜索条目标题 / 内容…",
        value: query
      }),
      ...chips.map((chip) =>
        h(
          "button",
          {
            "aria-pressed": "false",
            className: "uz-knowledge-chip",
            key: chip,
            type: "button"
          },
          chip
        )
      ),
      h(
        "button",
        {
          "aria-disabled": "true",
          className: "uz-knowledge-btn",
          "data-runtime-boundary": "read-only local-only no formal knowledge write",
          disabled: true,
          key: "local",
          title: "read-only local-only no formal knowledge write",
          type: "button"
        },
        tab === "assets" ? "上传素材" : "新建条目"
      )
    ]
  );
}

export function KnowledgeAssetDetail({
  asset,
  draft,
  editing,
  onCancel,
  onDelete,
  onDraft,
  onEdit,
  onSave
}: {
  asset: KnowledgeAsset;
  draft: string;
  editing: boolean;
  onCancel: () => void;
  onDelete: () => void;
  onDraft: (value: string) => void;
  onEdit: () => void;
  onSave: () => void;
}) {
  const content = editing
    ? h("textarea", {
        "aria-label": "编辑素材内容",
        className: "uz-knowledge-edit",
        onChange: (event: ChangeEvent<HTMLTextAreaElement>) =>
          onDraft(event.currentTarget.value),
        value: draft
      })
    : h("p", null, asset.content);
  const actions = editing
    ? h("span", null, [
        assetButton("m7-knowledge-asset-cancel", onCancel, "取消"),
        " ",
        assetButton("m7-knowledge-asset-save", onSave, "保存草稿", true)
      ])
    : assetButton("m7-knowledge-asset-edit", onEdit, "编辑内容", true);
  return h(
    "main",
    {
      "aria-label": "素材详情",
      className: "uz-knowledge-pad uz-knowledge-asset-detail",
      "data-runtime-boundary": "mock read-only local-only no formal knowledge write",
      "data-testid": "m7-knowledge-asset-detail"
    },
    [
      h(
        "section",
        {
          className: "uz-knowledge-card",
          "data-source-ref": asset.ref,
          key: "hero",
          title: `controlled source ${asset.ref}`
        },
        [
          h("h3", { key: "title" }, asset.title),
          h("p", { key: "desc" }, asset.description),
          h("div", { className: "uz-knowledge-preview", key: "preview" }, [
            h(IconSlot, { icon: FileText, key: "icon", size: "sm" }),
            ` ${asset.type}预览 · ${asset.format}`
          ])
        ]
      ),
      h("section", { className: "uz-knowledge-card", key: "content" }, [
        h("h3", { key: "heading" }, "素材内容"),
        content
      ]),
      h("div", { className: "uz-knowledge-actions", key: "actions" }, [
        assetButton("m7-knowledge-asset-delete", onDelete, "删除素材"),
        actions
      ])
    ]
  );
}

function assetButton(
  testId: string,
  onClick: () => void,
  text: string,
  primary = false
) {
  return h(
    "button",
    {
      className: `uz-knowledge-btn${primary ? " uz-knowledge-btn--primary" : ""}`,
      "data-runtime-boundary": "read-only local-only no formal knowledge write",
      "data-testid": testId,
      key: testId,
      onClick,
      title: "read-only local-only no formal knowledge write",
      type: "button"
    },
    text
  );
}

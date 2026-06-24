const CONTROLLED_REF_PATTERN = /^controlled:\/\/[a-z0-9][a-z0-9/_-]*$/i;
const BASE64ISH_SEGMENT_PATTERN = /(?:^|\/)[A-Za-z0-9+_-]{40,}={0,2}(?:$|\/)/;
const FORBIDDEN_KEY_PATTERN = /raw|prompt|customer|order|phone|payment|secret|url/i;
const FORBIDDEN_REF_TERMS = [
  "raw",
  "prompt",
  "customer",
  "order",
  "phone",
  "payment",
  "secret",
  "url"
];

export const templateCenterKinds = [
  "knowledge",
  "ai_member",
  "config",
  "eval",
  "quick_reply"
] as const;

export type TemplateCenterKind = (typeof templateCenterKinds)[number];

export const templateKindLabels = {
  ai_member: "AI member",
  config: "Config",
  eval: "Eval",
  knowledge: "Knowledge",
  quick_reply: "Quick reply"
} satisfies Record<TemplateCenterKind, string>;

export const templateCenterCards = [
  card("knowledge", "Transit starter pack", "v3", "Tenant A", "passed"),
  card("ai_member", "Operations AI baseline", "v2", "Tenant B", "passed"),
  card("config", "SLA and fuse defaults", "v4", "Tenant A", "review"),
  card("eval", "Redline launch pack", "v5", "Tenant C", "passed"),
  card("quick_reply", "Human handoff replies", "v1", "Tenant B", "draft")
] as const;

export type TemplateCopyDraft = {
  action: "copy_to_tenant";
  formalTenantWrite: false;
  sourceTemplateRef: string;
  targetTenantRef: string;
  templateAutoOverwrite: false;
  templateKind: TemplateCenterKind;
  tenantVersionRef: string;
  requiresOwnerConfirmation: true;
};

export type TemplateCopyDraftInput = {
  sourceTemplateRef: string;
  targetTenantRef: string;
  templateKind: TemplateCenterKind;
  tenantVersionRef: string;
} & Record<string, unknown>;

const allowedCopyDraftKeys = new Set([
  "sourceTemplateRef",
  "targetTenantRef",
  "templateKind",
  "tenantVersionRef"
]);

export function createTemplateCopyDraft(
  input: TemplateCopyDraftInput
): TemplateCopyDraft {
  rejectUnsafeCopyDraftInput(input);
  const templateKind = readTemplateKind(input.templateKind);
  return {
    action: "copy_to_tenant",
    formalTenantWrite: false,
    requiresOwnerConfirmation: true,
    sourceTemplateRef: readControlledRef(input.sourceTemplateRef, "sourceTemplateRef"),
    targetTenantRef: readControlledRef(input.targetTenantRef, "targetTenantRef"),
    templateAutoOverwrite: false,
    templateKind,
    tenantVersionRef: readControlledRef(input.tenantVersionRef, "tenantVersionRef")
  };
}

function card(
  kind: TemplateCenterKind,
  title: string,
  version: string,
  lastCopiedTenant: string,
  evalStatus: string
) {
  return {
    businessFit: `${templateKindLabels[kind]} operations`,
    evalStatus,
    kind,
    lastCopiedTenant,
    sourceTemplateRef: `controlled://template/${kind}`,
    title,
    version
  };
}

function readTemplateKind(value: unknown): TemplateCenterKind {
  if (
    typeof value !== "string" ||
    !templateCenterKinds.includes(value as TemplateCenterKind)
  ) {
    throw new Error("template kind is invalid");
  }
  return value as TemplateCenterKind;
}

function readControlledRef(value: unknown, name: string): string {
  if (typeof value !== "string") throw new Error(`${name} must be a controlled ref`);
  const ref = value.trim();
  const refBody = ref.replace(/^controlled:\/\//i, "");
  const invalidRef =
    !CONTROLLED_REF_PATTERN.test(ref) ||
    BASE64ISH_SEGMENT_PATTERN.test(refBody) ||
    hasForbiddenRefTerm(refBody);
  if (invalidRef) throw new Error(`${name} must be a safe controlled ref`);
  return ref;
}

function hasForbiddenRefTerm(refBody: string): boolean {
  const normalized = refBody
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_/]+/g, " ")
    .toLowerCase();
  return FORBIDDEN_REF_TERMS.some((term) => normalized.includes(term));
}

function rejectUnsafeCopyDraftInput(input: Record<string, unknown>) {
  for (const [key, value] of Object.entries(input)) {
    if (FORBIDDEN_KEY_PATTERN.test(key)) {
      throw new Error(`${key} is a forbidden raw payload key`);
    }
    if (!allowedCopyDraftKeys.has(key)) {
      throw new Error(`${key} is not allowed in template copy draft`);
    }
    if (typeof value === "string" && /^(https?:|data:|blob:|file:)/i.test(value)) {
      throw new Error(`${key} must not be a URL or inline payload`);
    }
  }
}

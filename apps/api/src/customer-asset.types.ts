import type { AccessContext } from "../../../packages/authz/src/index.ts";

export type ApiRequestWithContext = { accessContext?: AccessContext };

type Entity = Record<"id" | "orgId" | "tenantId", string>;
type RecordStatus = "active" | "archived";
type RelatedRefs = Partial<
  Record<
    "conversationRefs" | "orderSnapshotRefs" | "quoteRecordRefs" | "ticketRefs",
    readonly string[]
  >
>;

export type CustomerAssetCustomer = Entity & {
  blacklistedAt?: string;
  displayLabelRef?: string;
  isBlacklisted: boolean;
  isUnreachable: boolean;
  journeyStage?: string;
  preferredLanguage?: string;
  preferredScript?: string;
  relatedRefs?: RelatedRefs;
  status: RecordStatus;
  unreachableAt?: string;
  unresolvedIssueCount: number;
};

export type CustomerAssetIdentity = Entity &
  Record<"customerId" | "externalSubjectRef" | "identityKind" | "provider", string> & {
    channelConnectionId?: string;
    status: RecordStatus | "merged";
  };

export type CustomerAssetFieldDefinition = Entity &
  Record<"fieldKey" | "label", string> & {
    status: RecordStatus;
    valueType: "boolean" | "date" | "json" | "number" | "text";
  };

export type CustomerAssetFieldValue = Entity &
  Record<"customerId" | "fieldDefinitionId", string> & {
    value: Record<string, unknown>;
  };

export type CustomerAssetTagDefinition = Entity &
  Record<"label" | "tagKey", string> & {
    colorToken?: string;
    status: RecordStatus;
    targetKind: "customer";
  };

export type CustomerAssetTagAssignment = Entity &
  Record<"customerId" | "tagDefinitionId", string>;

export type CustomerAssetListFilters = {
  flag?: "blacklisted" | "unreachable";
  tagKey?: string;
};

export type CustomerAssetRestoreInput = {
  reasonRef: string;
  restoreBlacklisted?: boolean;
  restoreUnreachable?: boolean;
};

export type CustomerAssetSeed = {
  customers?: readonly CustomerAssetCustomer[];
  fieldDefinitions?: readonly CustomerAssetFieldDefinition[];
  fieldValues?: readonly CustomerAssetFieldValue[];
  identities?: readonly CustomerAssetIdentity[];
  tagAssignments?: readonly CustomerAssetTagAssignment[];
  tagDefinitions?: readonly CustomerAssetTagDefinition[];
};

export class CustomerAssetApiError extends Error {
  constructor(
    readonly statusCode: 400 | 403 | 404,
    message: string
  ) {
    super(message);
    this.name = "CustomerAssetApiError";
  }
}

import type { AccessContext } from "../../../packages/authz/src/index.ts";

import type {
  ConfirmationQueueItem,
  ConfirmationQueueListFilters
} from "./confirmation-queue.types.ts";

type MaybePromise<T> = T | Promise<T>;

export type ConfirmationQueueRepositoryPort = {
  getItem(
    accessContext: AccessContext,
    itemId: string
  ): MaybePromise<ConfirmationQueueItem | undefined>;
  listItems(
    accessContext: AccessContext,
    filters: ConfirmationQueueListFilters
  ): MaybePromise<ConfirmationQueueItem[]>;
  saveItem(item: ConfirmationQueueItem): MaybePromise<ConfirmationQueueItem>;
};

export const CONFIRMATION_QUEUE_REPOSITORY = Symbol("CONFIRMATION_QUEUE_REPOSITORY");

export class InMemoryConfirmationQueueRepository implements ConfirmationQueueRepositoryPort {
  private items: ConfirmationQueueItem[];

  constructor(seed: { items?: readonly ConfirmationQueueItem[] } = {}) {
    this.items = [...(seed.items ?? [])].map((item) => structuredClone(item));
  }

  listItems(accessContext: AccessContext, filters: ConfirmationQueueListFilters) {
    return this.itemsForScope(accessContext)
      .filter((item) => matchesFilters(item, filters))
      .sort(compareQueueItems)
      .map((item) => structuredClone(item));
  }

  getItem(accessContext: AccessContext, itemId: string) {
    const item = this.itemsForScope(accessContext).find(
      (candidate) => candidate.id === itemId
    );
    return item ? structuredClone(item) : undefined;
  }

  saveItem(item: ConfirmationQueueItem) {
    const nextItem = structuredClone(item);
    const itemIndex = this.items.findIndex(
      (candidate) =>
        candidate.orgId === item.orgId &&
        candidate.tenantId === item.tenantId &&
        candidate.id === item.id
    );
    if (itemIndex === -1) {
      this.items = [...this.items, nextItem];
    } else {
      this.items = this.items.with(itemIndex, nextItem);
    }
    return structuredClone(nextItem);
  }

  private itemsForScope(accessContext: AccessContext) {
    const scope = {
      orgId: accessContext.orgId,
      tenantId: accessContext.selectedTenantId
    };
    return this.items.filter(
      (item) => item.orgId === scope.orgId && item.tenantId === scope.tenantId
    );
  }
}

function matchesFilters(
  item: ConfirmationQueueItem,
  filters: ConfirmationQueueListFilters
): boolean {
  return (
    (!filters.kind || item.kind === filters.kind) &&
    (!filters.status || item.status === filters.status)
  );
}

function compareQueueItems(
  left: ConfirmationQueueItem,
  right: ConfirmationQueueItem
): number {
  return (
    Date.parse(right.createdAt) - Date.parse(left.createdAt) ||
    right.id.localeCompare(left.id)
  );
}

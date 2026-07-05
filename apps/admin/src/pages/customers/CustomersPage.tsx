import {
  useMemo,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent
} from "react";
import { renderCustomerPage } from "./CustomerHtml";
import {
  customerFields,
  customerFallbackMeta,
  customerRecords,
  customerTags,
  matchesCustomerFilter,
  nowCustomerMinute,
  type CustomerFlagKey,
  type CustomerRecord,
  type CustomerTabId
} from "./customerFallback";

type NoteDrafts = Record<string, string>;

export function CustomersPage({ selectedTenantId }: { selectedTenantId: string }) {
  const [records, setRecords] = useState<CustomerRecord[]>(customerRecords);
  const [tab, setTab] = useState<CustomerTabId>("list");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("all");
  const [script, setScript] = useState("all");
  const [stage, setStage] = useState("all");
  const [flags, setFlags] = useState<Partial<Record<CustomerFlagKey, boolean>>>({});
  const [noteDrafts, setNoteDrafts] = useState<NoteDrafts>({});
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const active = records.find((record) => record.id === activeId) ?? null;
  const filtered = useMemo(
    () =>
      records.filter((record) =>
        matchesCustomerFilter(record, { flags, lang, query, script, stage })
      ),
    [flags, lang, query, records, script, stage]
  );
  const noteDraft = active ? (noteDrafts[active.id] ?? "") : "";

  function patchRecord(id: string, fn: (record: CustomerRecord) => CustomerRecord) {
    setRecords((current) =>
      current.map((record) => (record.id === id ? fn(record) : record))
    );
  }

  function onClick(event: MouseEvent<HTMLElement>) {
    const command = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-customer-command]"
    );
    if (!command) return;
    const { customerCommand, customerId, flagKey, tag, tabId } = command.dataset;
    handleNavigationCommand(customerCommand, { customerId, flagKey, tabId });
    if (active) handleActiveCommand(customerCommand, active, tag);
  }

  function handleNavigationCommand(
    command: string | undefined,
    data: { customerId?: string; flagKey?: string; tabId?: string }
  ) {
    if (command === "tab" && data.tabId) {
      setTab(data.tabId as CustomerTabId);
      setActiveId(null);
    }
    if (command === "flag" && data.flagKey) toggleFlag(data.flagKey);
    if (command === "open" && data.customerId) setActiveId(data.customerId);
    if (command === "back") setActiveId(null);
  }

  function handleActiveCommand(
    command: string | undefined,
    record: CustomerRecord,
    tag: string | undefined
  ) {
    if (command === "add-note") addNote(record);
    if (command === "restore") restoreFlags(record.id);
    if (command === "toggle-tag-picker") setTagPickerOpen((open) => !open);
    if (command === "add-tag" && tag) addTag(record.id, tag);
    if (command === "remove-tag" && tag) removeTag(record.id, tag);
  }

  function toggleFlag(flagKey: string) {
    setFlags((current) => ({
      ...current,
      [flagKey as CustomerFlagKey]: !current[flagKey as CustomerFlagKey]
    }));
  }

  function onInput(event: FormEvent<HTMLElement>) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    if (target.dataset.customerInput === "query") setQuery(target.value);
    if (target instanceof HTMLSelectElement && target.dataset.customerSelect) {
      updateSelect(target);
    }
    updateTextDraft(target);
  }

  function updateTextDraft(target: HTMLInputElement | HTMLSelectElement) {
    if (target.dataset.customerInput === "note" && active) {
      setNoteDrafts((drafts) => ({ ...drafts, [active.id]: target.value }));
    }
    if (target.dataset.customerField && active) {
      const field = target.dataset.customerField;
      patchRecord(active.id, (record) => ({
        ...record,
        fields: { ...record.fields, [field]: target.value }
      }));
    }
  }

  function onChange(event: FormEvent<HTMLElement>) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    if (target instanceof HTMLSelectElement && target.dataset.customerSelect) {
      updateSelect(target);
    }
  }

  function updateSelect(target: HTMLSelectElement) {
    if (target.dataset.customerSelect === "lang") setLang(target.value);
    if (target.dataset.customerSelect === "script") setScript(target.value);
    if (target.dataset.customerSelect === "stage") setStage(target.value);
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    if (
      target.dataset.customerCommand === "open" &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      setActiveId(target.dataset.customerId ?? null);
    }
  }

  function addNote(record: CustomerRecord) {
    const text = (noteDrafts[record.id] ?? "").trim();
    if (!text) return;
    patchRecord(record.id, (current) => ({
      ...current,
      notes: [{ text, time: nowCustomerMinute(), who: "韩雪" }, ...current.notes]
    }));
    setNoteDrafts((drafts) => ({ ...drafts, [record.id]: "" }));
  }

  function addTag(id: string, tag: string) {
    patchRecord(id, (record) => ({
      ...record,
      tags: record.tags.includes(tag) ? record.tags : [...record.tags, tag]
    }));
    setTagPickerOpen(false);
  }

  function removeTag(id: string, tag: string) {
    patchRecord(id, (record) => ({
      ...record,
      tags: record.tags.filter((item) => item !== tag)
    }));
  }

  function restoreFlags(id: string) {
    patchRecord(id, (record) => ({
      ...record,
      blocked: false,
      notes: [
        {
          text: "已解除接待限制，等待后续审计同步。",
          time: nowCustomerMinute(),
          who: "系统"
        },
        ...record.notes
      ],
      unreachable: false
    }));
  }

  return (
    <section
      className="uz-customer-page"
      data-runtime-boundary={customerFallbackMeta.boundary}
      data-runtime-source={customerFallbackMeta.source}
      data-runtime-state="degraded"
      data-tenant-id={selectedTenantId}
      data-testid="m7-customer-page"
      dangerouslySetInnerHTML={{
        __html: renderCustomerPage({
          active,
          customerTags,
          customers: filtered,
          fields: customerFields,
          filters: { flags, lang, query, script, stage },
          noteDraft,
          tab,
          tagPickerOpen
        })
      }}
      onChange={onChange}
      onClick={onClick}
      onInput={onInput}
      onKeyDown={onKeyDown}
    />
  );
}

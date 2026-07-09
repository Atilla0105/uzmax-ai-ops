import type { Dispatch, FormEvent, MouseEvent, SetStateAction } from "react";
import {
  nowHM,
  ticketCloseStatus,
  type TicketRecord,
  type TicketTabId
} from "./ticketFallback";
import type { TicketCloseDraft, useTicketRuntime } from "./ticketRuntime";

type Patch = (id: string, fn: (ticket: TicketRecord) => TicketRecord) => void;
type LocalActions = ReturnType<typeof makeLocalTicketActions>;
type RuntimeActions = Pick<
  ReturnType<typeof useTicketRuntime>,
  "runRuntimeAction" | "setLastError" | "strictRuntime"
>;
export type TicketInteractionContext = {
  actions: LocalActions;
  active: TicketRecord;
  closeDraft: TicketCloseDraft;
  noteDrafts: Record<string, string>;
  runtime: RuntimeActions;
  scopedCloseDraft: TicketCloseDraft;
  setActiveId: Dispatch<SetStateAction<string>>;
  setCloseDraft: Dispatch<SetStateAction<TicketCloseDraft>>;
  setNoteDrafts: Dispatch<SetStateAction<Record<string, string>>>;
  setTab: Dispatch<SetStateAction<TicketTabId>>;
};
const me = "韩雪";

export function makeLocalTicketActions(
  active: TicketRecord,
  closeDraft: TicketCloseDraft,
  noteDrafts: Record<string, string>,
  patch: Patch,
  setCloseDraft: (draft: TicketCloseDraft) => void,
  setNoteDrafts: Dispatch<SetStateAction<Record<string, string>>>
) {
  const append = (ticket: TicketRecord, textValue: string, dot: "ai" | "ok" = "ai") => [
    ...ticket.timeline,
    { dot, text: textValue, time: nowHM(), who: me }
  ];
  return {
    addNote: () => {
      const note = (noteDrafts[active.id] ?? "").trim();
      if (!note) return;
      patch(active.id, (ticket) => ({
        ...ticket,
        notes: [...ticket.notes, { text: note, time: nowHM(), who: me }]
      }));
      setNoteDrafts((drafts) => ({ ...drafts, [active.id]: "" }));
    },
    claim: () =>
      patch(active.id, (ticket) => ({
        ...ticket,
        assignee: me,
        status: ticket.status === "待处理" ? "处理中" : ticket.status,
        tabs: [
          ...new Set(ticket.tabs.filter((item) => item !== "unclaimed").concat("mine"))
        ],
        timeline: append(ticket, `${me} 认领工单`)
      })),
    close: () => {
      if (!closeDraft?.note.trim()) return;
      patch(closeDraft.id, (ticket) => ({
        ...ticket,
        closeNote: closeDraft.note,
        closeResult: closeDraft.result,
        status: ticketCloseStatus[closeDraft.result] ?? "已关闭",
        tabs: [],
        timeline: append(ticket, `工单关闭 · ${closeDraft.result}`, "ok")
      }));
      setCloseDraft(null);
    },
    reassign: (to: string) => {
      if (!to) return;
      patch(active.id, (ticket) => ({
        ...ticket,
        assignee: to,
        tabs: [
          ...new Set(
            ticket.tabs
              .filter((item) => item !== "unclaimed")
              .concat(to === me ? ["mine"] : [])
          )
        ],
        timeline: append(ticket, `转派给 ${to}`)
      }));
    }
  };
}

export function handleTicketClick(
  event: MouseEvent<HTMLElement>,
  context: TicketInteractionContext
) {
  const target = event.target as HTMLElement;
  const command = target.closest<HTMLElement>("[data-ticket-command]");
  if (!command) return;
  const { closeResult, rowId, tabId, ticketCommand } = command.dataset;
  if (tabId) context.setTab(tabId as TicketTabId);
  if (rowId) context.setActiveId(rowId);
  if (closeResult) {
    context.setCloseDraft({ id: context.active.id, note: "", result: closeResult });
  }
  runTicketCommand(ticketCommand, context);
}

export function handleTicketInput(
  event: FormEvent<HTMLElement>,
  context: TicketInteractionContext
) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  if (target.dataset.noteFor) {
    context.setNoteDrafts((drafts) => ({
      ...drafts,
      [target.dataset.noteFor ?? ""]: target.value
    }));
  }
  if (target.dataset.ticketCommand === "close-note" && context.scopedCloseDraft) {
    context.setCloseDraft({ ...context.scopedCloseDraft, note: target.value });
  }
  if (!context.runtime.strictRuntime && target.dataset.ticketCommand === "transfer") {
    context.actions.reassign(target.value);
  }
}

export function handleTicketChange(
  event: FormEvent<HTMLElement>,
  context: TicketInteractionContext
) {
  const target = event.target as HTMLSelectElement;
  if (target.dataset.ticketCommand !== "transfer") return;
  if (context.runtime.strictRuntime) {
    context.runtime.setLastError(
      "ticket transfer action has no approved runtime contract"
    );
    return;
  }
  context.actions.reassign(target.value);
}

function runTicketCommand(
  commandName: string | undefined,
  context: TicketInteractionContext
) {
  if (commandName === "add-note") {
    if (context.runtime.strictRuntime) void runRuntimeActionAndClear("note", context);
    else context.actions.addNote();
  }
  if (commandName === "cancel-close") context.setCloseDraft(null);
  if (commandName === "claim") {
    if (context.runtime.strictRuntime) {
      void context.runtime.runRuntimeAction(
        "claim",
        context.active,
        context.closeDraft,
        context.noteDrafts
      );
    } else context.actions.claim();
  }
  if (commandName === "confirm-close") {
    if (context.runtime.strictRuntime) void runRuntimeActionAndClear("close", context);
    else context.actions.close();
  }
}

async function runRuntimeActionAndClear(
  kind: "close" | "note",
  context: TicketInteractionContext
) {
  if (
    !(await context.runtime.runRuntimeAction(
      kind,
      context.active,
      context.closeDraft,
      context.noteDrafts
    ))
  ) {
    return;
  }
  if (kind === "note")
    context.setNoteDrafts((drafts) => ({ ...drafts, [context.active.id]: "" }));
  else context.setCloseDraft(null);
}

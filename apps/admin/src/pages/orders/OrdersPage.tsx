import {
  useMemo,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Package, Search, TriangleAlert, Upload, X } from "lucide-react";
import { IconSlot } from "../../primitives";
import {
  filterOrders,
  initialImportHistory,
  orderFallbackMeta,
  orderRecords,
  readOrderViewState,
  renderOrdersPage,
  type ImportTask,
  type ImportStep
} from "./orderFallback";

const orderIconSnippets = {
  package: renderToStaticMarkup(
    <IconSlot data-testid="m7-orders-package-icon" icon={Package} />
  ),
  search: renderToStaticMarkup(
    <IconSlot data-testid="m7-orders-search-icon" icon={Search} size="sm" />
  ),
  triangleAlert: renderToStaticMarkup(<IconSlot icon={TriangleAlert} />),
  upload: renderToStaticMarkup(
    <IconSlot data-testid="m7-orders-upload-icon" icon={Upload} size="sm" />
  ),
  uploadDrop: renderToStaticMarkup(
    <IconSlot data-testid="m7-orders-drop-icon" icon={Upload} />
  ),
  x: renderToStaticMarkup(<IconSlot data-testid="m7-orders-close-icon" icon={X} />)
} as const;

export function OrdersPage({ selectedTenantId }: { selectedTenantId: string }) {
  const viewState = readOrderViewState();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importStep, setImportStep] = useState<ImportStep>("upload");
  const [fileName, setFileName] = useState("");
  const [history, setHistory] = useState<ImportTask[]>(initialImportHistory);
  const [viewTaskId, setViewTaskId] = useState(initialImportHistory[0]?.id ?? "");
  const rows = useMemo(
    () => (viewState === "empty" ? [] : filterOrders(orderRecords, query)),
    [query, viewState]
  );
  const active = orderRecords.find((record) => record.id === activeId) ?? null;
  const task = history.find((item) => item.id === viewTaskId) ?? history[0] ?? null;

  function openImport() {
    setImportOpen(true);
    setImportStep("upload");
    setFileName("");
  }

  function startImport() {
    const next: ImportTask = {
      batch: "SYN-BATCH-LOCAL",
      fail: 2,
      id: `SYN-IMP-${history.length + 1}`,
      rolledBack: false,
      success: 42,
      time: "刚刚",
      total: 44
    };
    setHistory((current) => [next, ...current]);
    setViewTaskId(next.id);
    setImportStep("progress");
  }

  function onClick(event: MouseEvent<HTMLElement>) {
    const command = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-order-command]"
    );
    if (!command) return;
    runCommand(command.dataset.orderCommand, {
      orderId: command.dataset.orderId,
      taskId: command.dataset.taskId
    });
  }

  function onInput(event: FormEvent<HTMLElement>) {
    const target = event.target as HTMLInputElement;
    if (target.dataset.orderInput === "search") setQuery(target.value);
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    if (
      target.dataset.orderCommand === "open" &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      setActiveId(target.dataset.orderId ?? null);
    }
  }

  function rollback(taskId: string) {
    setHistory((current) =>
      current.map((item) => (item.id === taskId ? { ...item, rolledBack: true } : item))
    );
  }

  function runCommand(
    command: string | undefined,
    data: { orderId?: string; taskId?: string }
  ) {
    const commands: Record<string, () => void> = {
      back: () => setActiveId(null),
      file: () => setFileName("orders-snapshot.csv"),
      open: () => data.orderId && setActiveId(data.orderId),
      "close-import": () => setImportOpen(false),
      "open-import": openImport,
      "open-task": () => data.taskId && openTask(data.taskId),
      rollback: () => data.taskId && rollback(data.taskId),
      "show-result": () => setImportStep("result"),
      "start-import": () => fileName && startImport()
    };
    if (command) commands[command]?.();
  }

  function openTask(taskId: string) {
    setViewTaskId(taskId);
    setImportOpen(true);
    setImportStep("result");
  }

  return (
    <section
      className="uz-orders-page"
      data-runtime-boundary={orderFallbackMeta.boundary}
      data-runtime-source={orderFallbackMeta.source}
      data-runtime-state="degraded"
      data-tenant-id={selectedTenantId}
      data-testid="m7-orders-page"
      dangerouslySetInnerHTML={{
        __html: renderOrdersPage({
          active,
          fileName,
          history,
          icons: orderIconSnippets,
          importOpen,
          importStep,
          query,
          rows,
          task,
          viewState
        })
      }}
      onClick={onClick}
      onInput={onInput}
      onKeyDown={onKeyDown}
    />
  );
}

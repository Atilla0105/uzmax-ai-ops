import { useEffect, useRef, useState } from "react";
import { Lock, Plus } from "lucide-react";
import { IconSlot, StatusBadge } from "../../primitives";
import { TenantHtmlTable } from "./GroupTenantTable";
import { TenantNewModal } from "./GroupTenantViews";
import {
  createInitialTenantForm,
  initialTenantSeeds,
  isTenantCreateReady,
  readTenantViewState,
  tenantCreateToast,
  tenantManageUnavailableToast,
  tenantMeta,
  tenantRuntimeBoundary,
  tenantRuntimeLabels,
  tenantStateCopy,
  tenantStyles,
  type TenantCapabilityKey
} from "./groupTenantFallback";

type NewTenantTextField = "language" | "line" | "name" | "template" | "timezone";

export function GroupTenantPage() {
  const viewState = readTenantViewState();
  const [tenantCount, setTenantCount] = useState(initialTenantSeeds.length);
  const [newTenantOpen, setNewTenantOpen] = useState(false);
  const [newTenantForm, setNewTenantForm] = useState(createInitialTenantForm);
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef<number | null>(null);
  const createReady = isTenantCreateReady(newTenantForm);

  useEffect(
    () => () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    },
    []
  );

  const showToast = (message: string) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToast("");
      toastTimerRef.current = null;
    }, 3200);
  };

  const openNewTenant = () => {
    setNewTenantForm(createInitialTenantForm());
    setNewTenantOpen(true);
  };
  const closeNewTenant = () => setNewTenantOpen(false);
  const changeNewField = (field: NewTenantTextField, value: string) => {
    setNewTenantForm((form) => ({ ...form, [field]: value }));
  };
  const toggleNewCapability = (key: TenantCapabilityKey) => {
    setNewTenantForm((form) => ({
      ...form,
      capabilities: { ...form.capabilities, [key]: !form.capabilities[key] }
    }));
  };
  const createTenant = () => {
    if (!createReady) return;
    showToast(tenantCreateToast(newTenantForm));
    setTenantCount((count) => count + 1);
    setNewTenantOpen(false);
  };

  return (
    <section
      aria-description={tenantRuntimeBoundary}
      className="uz-tenant-page"
      data-runtime-boundary={tenantRuntimeBoundary}
      data-runtime-source={tenantMeta.source}
      data-runtime-state={viewState}
      data-testid="m7-tenant-page"
      title={tenantRuntimeBoundary}
    >
      <style>{tenantStyles}</style>
      <TenantHeader count={tenantCount} onNewTenant={openNewTenant} />
      <TenantRuntimeNote />
      {toast ? (
        <div
          aria-atomic="true"
          aria-description={tenantRuntimeBoundary}
          aria-live="polite"
          className="uz-tenant-toast"
          data-runtime-boundary={tenantRuntimeBoundary}
          data-testid="m7-tenant-toast"
          role="status"
          title={tenantRuntimeBoundary}
        >
          <span hidden>{tenantRuntimeLabels.join(" · ")}</span>
          <span>{toast}</span>
        </div>
      ) : null}
      {viewState === "degraded" ? (
        <main className="uz-tenant-scroll">
          <TenantHtmlTable
            onManageUnavailable={() => showToast(tenantManageUnavailableToast())}
            runtimeBoundary={tenantRuntimeBoundary}
          />
          <div
            aria-description={tenantRuntimeBoundary}
            className="uz-tenant-source-note"
            data-runtime-boundary={tenantRuntimeBoundary}
            data-testid="m7-tenant-source-note"
            title={tenantRuntimeBoundary}
          >
            <IconSlot icon={Lock} size="sm" />
            <span>停用租户须填写原因 · 停用后保留只读审计与数据导出入口</span>
            <span hidden>{tenantRuntimeLabels.join(" · ")}</span>
          </div>
        </main>
      ) : (
        <TenantStatePanel state={viewState} />
      )}
      {newTenantOpen ? (
        <TenantNewModal
          form={newTenantForm}
          onCancel={closeNewTenant}
          onCreate={createTenant}
          onFieldChange={changeNewField}
          onToggleCapability={toggleNewCapability}
          ready={createReady}
        />
      ) : null}
    </section>
  );
}

function TenantHeader({
  count,
  onNewTenant
}: {
  count: number;
  onNewTenant: () => void;
}) {
  return (
    <header className="uz-tenant-head">
      <h2 className="uz-tenant-title">{tenantMeta.title}</h2>
      <span className="uz-tenant-subtitle">{count} 个租户</span>
      <StatusBadge tone="warn">{tenantMeta.descriptor}</StatusBadge>
      <button
        className="uz-tenant-new-button"
        data-testid="m7-tenant-new-button"
        onClick={onNewTenant}
        type="button"
      >
        <IconSlot icon={Plus} size="sm" />
        新建租户
      </button>
    </header>
  );
}

function TenantRuntimeNote() {
  return (
    <div
      aria-description={tenantRuntimeBoundary}
      className="uz-tenant-note"
      data-runtime-boundary={tenantRuntimeBoundary}
      data-testid="m7-tenant-runtime-note"
      hidden
      title={tenantRuntimeBoundary}
    >
      <IconSlot icon={Lock} size="sm" />
      <strong>{tenantRuntimeLabels.slice(0, 3).join(" · ")}</strong>
      <span>{tenantRuntimeLabels.slice(3).join(" · ")}</span>
    </div>
  );
}

function TenantStatePanel({
  state
}: {
  state: Exclude<ReturnType<typeof readTenantViewState>, "degraded">;
}) {
  const copy = tenantStateCopy[state];
  return (
    <main
      aria-description={tenantRuntimeBoundary}
      className="uz-tenant-state"
      data-runtime-boundary={tenantRuntimeBoundary}
      data-testid={`m7-tenant-state-${state}`}
      title={tenantRuntimeBoundary}
    >
      <div>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
        <span hidden>{tenantRuntimeLabels.join(" · ")}</span>
      </div>
    </main>
  );
}

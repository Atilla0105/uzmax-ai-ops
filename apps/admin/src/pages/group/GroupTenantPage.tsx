import { useEffect, useRef, useState } from "react";
import { Lock, Plus } from "lucide-react";
import { IconSlot, StatusBadge } from "../../primitives";
import { TenantHtmlTable, TenantNewModal } from "./GroupTenantViews";
import {
  createInitialTenantForm,
  initialTenantSeeds,
  isTenantCreateReady,
  readTenantViewState,
  tenantCreateToast,
  tenantManageUnavailableToast,
  tenantMeta,
  tenantRuntimeLabels,
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
      className="uz-tenant-page"
      data-runtime-source={tenantMeta.source}
      data-runtime-state={viewState}
      data-testid="m7-tenant-page"
    >
      <style>{tenantStyles}</style>
      <TenantHeader count={tenantCount} onNewTenant={openNewTenant} />
      <TenantRuntimeNote />
      {toast ? (
        <div
          aria-atomic="true"
          aria-live="polite"
          className="uz-tenant-toast"
          data-testid="m7-tenant-toast"
          role="status"
        >
          <span>{toast}</span>
        </div>
      ) : null}
      {viewState === "degraded" ? (
        <main className="uz-tenant-scroll">
          <TenantHtmlTable
            onManageUnavailable={() => showToast(tenantManageUnavailableToast())}
          />
          <div className="uz-tenant-source-note" data-testid="m7-tenant-source-note">
            <IconSlot icon={Lock} size="sm" />
            <span>
              停用租户须填写原因 · 停用后保留只读审计与数据导出入口 · browser-local only
              · no production tenant change · no audit write
            </span>
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
    <div className="uz-tenant-note" data-testid="m7-tenant-runtime-note">
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
  const title = state === "permission" ? "permission denied" : state;
  return (
    <main className="uz-tenant-state" data-testid={`m7-tenant-state-${state}`}>
      <div>
        <h2>{title}</h2>
        <p>{`Synthetic ${title} state. ${tenantMeta.runtime}.`}</p>
      </div>
    </main>
  );
}

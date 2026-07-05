import { useEffect, useRef, useState } from "react";
import { Lock } from "lucide-react";
import { IconSlot, StatusBadge } from "../../primitives";
import { ConfirmModal } from "../../patterns";
import { TenantDrawer, TenantGrid } from "./GroupTenantViews";
import {
  initialTenantCards,
  readTenantViewState,
  tenantCapabilityToast,
  tenantDisableToast,
  tenantFieldToast,
  tenantMeta,
  tenantRestoreToast,
  tenantRuntimeLabels,
  tenantStyles,
  type TenantCapability,
  type TenantCard
} from "./groupTenantFallback";

export function GroupTenantPage() {
  const viewState = readTenantViewState();
  const [tenants, setTenants] = useState(initialTenantCards);
  const [drawerTenantId, setDrawerTenantId] = useState<string | null>(null);
  const [confirmTenant, setConfirmTenant] = useState<TenantCard | null>(null);
  const [disableReason, setDisableReason] = useState("");
  const [toast, setToast] = useState("");
  const drawerTriggerRef = useRef<HTMLButtonElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const drawerTenant = tenants.find((tenant) => tenant.id === drawerTenantId) ?? null;

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
  const patchTenant = (id: string, next: (tenant: TenantCard) => TenantCard) => {
    setTenants((items) =>
      items.map((tenant) => (tenant.id === id ? next(tenant) : tenant))
    );
  };
  const openDrawer = (tenant: TenantCard, trigger: HTMLButtonElement) => {
    drawerTriggerRef.current = trigger;
    setDrawerTenantId(tenant.id);
  };
  const closeDrawer = () => {
    setDrawerTenantId(null);
    window.setTimeout(() => drawerTriggerRef.current?.focus(), 0);
  };
  const changeLanguage = (tenant: TenantCard, value: string) => {
    patchTenant(tenant.id, (item) => ({ ...item, language: value }));
    showToast(tenantFieldToast(tenant, "默认语言", value));
  };
  const changeTimezone = (tenant: TenantCard, value: string) => {
    patchTenant(tenant.id, (item) => ({ ...item, timezone: value }));
    showToast(tenantFieldToast(tenant, "默认时区", value));
  };
  const toggleCapability = (tenant: TenantCard, capability: TenantCapability) => {
    const enabled = !tenant.capabilities[capability.key];
    patchTenant(tenant.id, (item) => ({
      ...item,
      capabilities: { ...item.capabilities, [capability.key]: enabled }
    }));
    showToast(tenantCapabilityToast(tenant, capability, enabled));
  };
  const askDisable = (tenant: TenantCard) => {
    setDisableReason("");
    setDrawerTenantId(null);
    setConfirmTenant(tenant);
  };
  const cancelDisable = () => {
    const tenantId = confirmTenant?.id;
    setConfirmTenant(null);
    if (tenantId) setDrawerTenantId(tenantId);
  };
  const confirmDisable = () => {
    if (!confirmTenant) return;
    const reason = disableReason.trim();
    const tenantId = confirmTenant.id;
    patchTenant(confirmTenant.id, (tenant) => ({
      ...tenant,
      disabled: true,
      disabledAt: "browser-local now",
      disableReason: reason,
      status: "已停用",
      statusTone: "neutral"
    }));
    showToast(tenantDisableToast(confirmTenant, reason));
    setConfirmTenant(null);
    setDrawerTenantId(tenantId);
  };
  const restoreTenant = (tenant: TenantCard) => {
    patchTenant(tenant.id, (item) => ({
      ...item,
      disabled: false,
      disabledAt: "",
      disableReason: "",
      status: "运行中",
      statusTone: "ok"
    }));
    showToast(tenantRestoreToast(tenant));
  };

  return (
    <section
      className="uz-tenant-page"
      data-runtime-source={tenantMeta.source}
      data-runtime-state={viewState}
      data-testid="m7-tenant-page"
    >
      <style>{tenantStyles}</style>
      <TenantHeader />
      <TenantRuntimeNote />
      {toast ? (
        <div
          aria-atomic="true"
          aria-live="polite"
          className="uz-tenant-toast"
          data-testid="m7-tenant-toast"
          role="status"
        >
          {toast}
        </div>
      ) : null}
      {viewState === "degraded" ? (
        <main className="uz-tenant-scroll">
          <TenantGrid onOpen={openDrawer} tenants={tenants} />
        </main>
      ) : (
        <TenantStatePanel state={viewState} />
      )}
      {drawerTenant ? (
        <TenantDrawer
          onChangeLanguage={changeLanguage}
          onChangeTimezone={changeTimezone}
          onClose={closeDrawer}
          onDisable={askDisable}
          onRestore={restoreTenant}
          onToggleCapability={toggleCapability}
          tenant={drawerTenant}
        />
      ) : null}
      <ConfirmModal
        confirmLabel="确认停用"
        danger
        description="Reason required. This preview changes browser-local mock state only; no production tenant change and no audit write happens."
        onCancel={cancelDisable}
        onConfirm={confirmDisable}
        open={!!confirmTenant}
        reason={{
          label: "停用原因",
          onChange: setDisableReason,
          placeholder: "必填；仅用于 browser-local 预览，不写生产审计",
          required: true,
          value: disableReason
        }}
        title={`停用租户「${confirmTenant?.name ?? ""}」？`}
      />
    </section>
  );
}

function TenantHeader() {
  return (
    <header className="uz-tenant-head">
      <h2 className="uz-tenant-title">{tenantMeta.title}</h2>
      <span className="uz-tenant-subtitle">{tenantMeta.subtitle}</span>
      <StatusBadge tone="warn">{tenantMeta.descriptor}</StatusBadge>
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

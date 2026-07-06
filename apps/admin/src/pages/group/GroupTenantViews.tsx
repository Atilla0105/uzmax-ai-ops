import { useEffect, useRef, type KeyboardEvent, type RefObject } from "react";
import {
  tenantCapabilities,
  tenantLanguages,
  tenantTemplates,
  tenantTimezones,
  type NewTenantForm,
  type TenantCapabilityKey
} from "./groupTenantFallback";

type NewTenantTextField = Exclude<keyof NewTenantForm, "capabilities">;
type NewTenantModalProps = {
  form: NewTenantForm;
  onCancel: () => void;
  onCreate: () => void;
  onFieldChange: (field: NewTenantTextField, value: string) => void;
  onToggleCapability: (key: TenantCapabilityKey) => void;
  ready: boolean;
};
type TextFieldProps = {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  refEl?: RefObject<HTMLInputElement | null>;
  testId: string;
  value: string;
};
type SelectFieldProps = {
  help?: string;
  label: string;
  onChange: (value: string) => void;
  options: string[];
  testId: string;
  value: string;
};

const focusableSelector =
  "button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";

export function TenantNewModal({
  form,
  onCancel,
  onCreate,
  onFieldChange,
  onToggleCapability,
  ready
}: NewTenantModalProps) {
  const dialogRef = useRef<HTMLElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => nameRef.current?.focus(), []);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
      return;
    }
    if (event.key === "Tab") trapDialogTab(event, dialogRef.current);
  };

  return (
    <div
      className="uz-tenant-modal-scrim"
      data-testid="m7-tenant-new-modal-scrim"
      onClick={onCancel}
    >
      <section
        aria-labelledby="m7-tenant-new-title"
        aria-modal="true"
        className="uz-tenant-new-modal"
        data-testid="m7-tenant-new-modal"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
        ref={dialogRef}
        role="dialog"
      >
        <div className="uz-tenant-new-body">
          <h3 id="m7-tenant-new-title">创建新租户</h3>
          <div className="uz-tenant-new-stack">
            <TextField
              label="租户名称"
              onChange={(value) => onFieldChange("name", value)}
              placeholder="例如：胡杨跨境百货"
              refEl={nameRef}
              testId="m7-tenant-new-name"
              value={form.name}
            />
            <TextField
              label="业务线"
              onChange={(value) => onFieldChange("line", value)}
              placeholder="例如：百货 · 中亚"
              testId="m7-tenant-new-line"
              value={form.line}
            />
            <div className="uz-tenant-new-two">
              <SelectField
                label="默认语言"
                onChange={(value) => onFieldChange("language", value)}
                options={tenantLanguages}
                testId="m7-tenant-new-language"
                value={form.language}
              />
              <SelectField
                label="默认时区"
                onChange={(value) => onFieldChange("timezone", value)}
                options={tenantTimezones}
                testId="m7-tenant-new-timezone"
                value={form.timezone}
              />
            </div>
            <section aria-label="渠道能力" className="uz-tenant-new-section">
              <div className="uz-tenant-new-label">渠道能力</div>
              <div className="uz-tenant-cap-chips">
                {tenantCapabilities.map((capability) => {
                  const on = form.capabilities[capability.key];
                  return (
                    <button
                      aria-pressed={on}
                      className={`uz-tenant-cap-chip${on ? " is-on" : ""}`}
                      data-testid={`m7-tenant-new-cap-${capability.key}`}
                      key={capability.key}
                      onClick={() => onToggleCapability(capability.key)}
                      type="button"
                    >
                      {capability.label}
                    </button>
                  );
                })}
              </div>
            </section>
            <SelectField
              help="创建后将复制所选模板的知识包 / AI 成员 / 配置到该租户独立空间"
              label="初始模板"
              onChange={(value) => onFieldChange("template", value)}
              options={tenantTemplates}
              testId="m7-tenant-new-template"
              value={form.template}
            />
          </div>
        </div>
        <footer className="uz-tenant-new-foot">
          <button
            className="uz-tenant-secondary"
            data-testid="m7-tenant-new-cancel"
            onClick={onCancel}
            type="button"
          >
            取消
          </button>
          <button
            className="uz-tenant-primary"
            data-testid="m7-tenant-new-create"
            disabled={!ready}
            onClick={onCreate}
            type="button"
          >
            创建租户
          </button>
        </footer>
      </section>
    </div>
  );
}

function TextField({
  label,
  onChange,
  placeholder,
  refEl,
  testId,
  value
}: TextFieldProps) {
  return (
    <label className="uz-tenant-field">
      <span>{label}</span>
      <input
        data-testid={testId}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={placeholder}
        ref={refEl}
        value={value}
      />
    </label>
  );
}

function SelectField({
  help,
  label,
  onChange,
  options,
  testId,
  value
}: SelectFieldProps) {
  return (
    <label className="uz-tenant-field">
      <span>{label}</span>
      <select
        data-testid={testId}
        onChange={(event) => onChange(event.currentTarget.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {help ? <small>{help}</small> : null}
    </label>
  );
}

function trapDialogTab(event: KeyboardEvent<HTMLElement>, dialog: HTMLElement | null) {
  const focusable = dialog
    ? Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
    : [];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!first || !last) {
    event.preventDefault();
    return;
  }
  const shouldWrapBack = event.shiftKey && document.activeElement === first;
  const shouldWrapNext = !event.shiftKey && document.activeElement === last;
  if (!shouldWrapBack && !shouldWrapNext) return;
  event.preventDefault();
  (shouldWrapBack ? last : first).focus();
}

import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode
} from "react";
import { Button } from "../primitives";

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(", ");

function getFocusable(root: HTMLElement | null) {
  return Array.from(root?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []);
}

export interface ConfirmReason {
  label?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
}

export function ConfirmModal({
  cancelLabel = "Cancel",
  children,
  confirmLabel,
  danger,
  description,
  onCancel,
  onConfirm,
  open,
  reason,
  title
}: {
  cancelLabel?: ReactNode;
  children?: ReactNode;
  confirmLabel: ReactNode;
  danger?: boolean;
  description?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  reason?: ConfirmReason;
  title: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const reasonRequired = !!reason?.required;

  useEffect(() => {
    if (!open) return undefined;
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const initialFocusTarget = reasonRequired
      ? reasonRef.current
      : getFocusable(dialogRef.current).at(0);
    initialFocusTarget?.focus();
    return () => {
      returnFocusRef.current?.focus();
      returnFocusRef.current = null;
    };
  }, [open, reasonRequired]);

  if (!open) return null;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
      return;
    }
    if (event.key !== "Tab") return;
    const nodes = getFocusable(dialogRef.current);
    const first = nodes.at(0);
    const last = nodes.at(-1);
    if (!first || !last) {
      event.preventDefault();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="uz-confirm-modal" data-testid="m7-confirm-modal">
      <div
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        onKeyDown={onKeyDown}
        ref={dialogRef}
        role="dialog"
      >
        <h3 id={titleId}>{title}</h3>
        {description ? <p id={descriptionId}>{description}</p> : null}
        {children}
        {reason ? (
          <label>
            <span>{reason.label ?? "Reason"}</span>
            <textarea
              aria-required={reasonRequired}
              onChange={(event) => reason.onChange(event.currentTarget.value)}
              placeholder={reason.placeholder}
              ref={reasonRef}
              required={reasonRequired}
              value={reason.value}
            />
          </label>
        ) : null}
        <footer>
          <Button onClick={onCancel} variant="secondary">
            {cancelLabel}
          </Button>
          <Button
            disabled={reasonRequired && reason.value.trim().length === 0}
            onClick={onConfirm}
            variant={danger ? "danger" : "success"}
          >
            {confirmLabel}
          </Button>
        </footer>
      </div>
    </div>
  );
}

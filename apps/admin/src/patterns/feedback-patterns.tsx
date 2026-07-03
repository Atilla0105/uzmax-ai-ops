import { useRef, useState, type ReactNode } from "react";
import { Info } from "lucide-react";
import { Avatar, IconSlot, StatusBadge } from "../primitives";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export type ToastTone = "info" | "success" | "warning" | "error";
export interface ToastEntry {
  id: number;
  message: ReactNode;
  tone: ToastTone;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const idRef = useRef(0);

  const show = (message: ReactNode, tone: ToastTone = "info") => {
    const id = (idRef.current += 1);
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2600);
  };

  return { show, toasts };
}

export function ToastHost({ toasts }: { toasts: ToastEntry[] }) {
  return (
    <div aria-live="polite" className="uz-toast-host" data-testid="m7-toast-host">
      {toasts.map((toast) => (
        <div
          className={cx("uz-toast", `uz-toast--${toast.tone}`)}
          data-toast-id={toast.id}
          key={toast.id}
        >
          <IconSlot icon={Info} />
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

export type MessageBubbleRole = "system" | "customer" | "ai" | "human";

export function MessageBubble({
  children,
  meta,
  role,
  testId
}: {
  children: ReactNode;
  meta?: ReactNode;
  role: MessageBubbleRole;
  testId?: string;
}) {
  if (role === "system") {
    return (
      <div
        className="uz-message-bubble uz-message-bubble--system"
        data-message-role={role}
        data-testid={testId}
      >
        <StatusBadge tone="neutral">{children}</StatusBadge>
      </div>
    );
  }

  return (
    <article
      className={cx("uz-message-bubble", `uz-message-bubble--${role}`)}
      data-testid={testId}
    >
      <Avatar
        initial={role}
        size="sm"
        tone={role === "ai" ? "ai" : role === "human" ? "human" : "neutral"}
      />
      <div>
        <div className="uz-message-bubble__body" data-message-role={role}>
          {children}
        </div>
        {meta ? <div className="uz-message-bubble__meta">{meta}</div> : null}
      </div>
    </article>
  );
}

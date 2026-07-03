import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode
} from "react";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type IconSlotSize = "sm" | "md" | "lg";

export interface IconSlotProps extends HTMLAttributes<HTMLSpanElement> {
  label?: string;
  size?: IconSlotSize;
  text?: string;
}

export function IconSlot({
  className,
  label,
  size = "md",
  text,
  ...props
}: IconSlotProps) {
  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={cx("uz-icon-slot", `uz-icon-slot--${size}`, className)}
      role={label ? "img" : undefined}
      {...props}
    >
      {text}
    </span>
  );
}

type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  isLoading?: boolean;
  kbd?: string;
  variant?: ButtonVariant;
}

export function Button({
  children,
  className,
  icon,
  isLoading,
  kbd,
  type = "button",
  variant = "secondary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx("uz-button", `uz-button--${variant}`, className)}
      type={type}
      {...props}
    >
      {isLoading ? <span aria-hidden className="uz-spinner uz-spinner--sm" /> : icon}
      <span>{children}</span>
      {kbd ? (
        <Kbd inverse={variant === "primary" || variant === "success"}>{kbd}</Kbd>
      ) : null}
    </button>
  );
}

type StatusTone = "neutral" | "needs" | "warn" | "info" | "danger" | "ok" | "accent";

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  dot?: boolean;
  tone?: StatusTone;
}

export function StatusBadge({
  children,
  className,
  dot,
  tone = "neutral",
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cx("uz-status-badge", `uz-status-badge--${tone}`, className)}
      {...props}
    >
      {dot ? <span aria-hidden className="uz-status-badge__dot" /> : null}
      {children}
    </span>
  );
}

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  initial: string;
  size?: "sm" | "md" | "lg";
  tone?: "neutral" | "ai" | "human";
}

export function Avatar({
  className,
  initial,
  size = "md",
  tone = "neutral",
  ...props
}: AvatarProps) {
  return (
    <span
      className={cx("uz-avatar", `uz-avatar--${size}`, `uz-avatar--${tone}`, className)}
      {...props}
    >
      {initial.slice(0, 2)}
    </span>
  );
}

export interface CountBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  value: ReactNode;
}

export function CountBadge({ className, value, ...props }: CountBadgeProps) {
  return (
    <span className={cx("uz-count-badge", className)} {...props}>
      {value}
    </span>
  );
}

interface KbdProps extends HTMLAttributes<HTMLElement> {
  inverse?: boolean;
}

export function Kbd({ children, className, inverse, ...props }: KbdProps) {
  return (
    <kbd className={cx("uz-kbd", inverse && "uz-kbd--inverse", className)} {...props}>
      {children}
    </kbd>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  before?: ReactNode;
  kbdHint?: string;
}

export function Input({ before, className, disabled, kbdHint, ...props }: InputProps) {
  return (
    <span className={cx("uz-input", disabled && "is-disabled", className)}>
      {before}
      <input disabled={disabled} {...props} />
      {kbdHint ? <Kbd>{kbdHint}</Kbd> : null}
    </span>
  );
}

export function SearchInput(props: Omit<InputProps, "before" | "type">) {
  return <Input before={<IconSlot text="S" />} type="search" {...props} />;
}

export interface ToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
}

export function Toggle({ checked, className, ...props }: ToggleProps) {
  return (
    <button
      aria-checked={checked}
      className={cx("uz-toggle", checked && "is-checked", className)}
      role="switch"
      type="button"
      {...props}
    >
      <span aria-hidden />
    </button>
  );
}

export interface CheckboxProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  indeterminate?: boolean;
}

export function Checkbox({
  checked,
  className,
  indeterminate,
  ...props
}: CheckboxProps) {
  return (
    <button
      aria-checked={indeterminate ? "mixed" : checked}
      className={cx(
        "uz-checkbox",
        checked && "is-checked",
        indeterminate && "is-indeterminate",
        className
      )}
      role="checkbox"
      type="button"
      {...props}
    />
  );
}

export interface HeartbeatProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "ok" | "warn" | "off";
}

export function Heartbeat({ className, tone = "ok", ...props }: HeartbeatProps) {
  return (
    <span
      aria-hidden
      className={cx("uz-heartbeat", `uz-heartbeat--${tone}`, className)}
      {...props}
    />
  );
}

export const color = {
  ink900: "#1A1D21",
  ink700: "#3F454D",
  ink500: "#7A828C",
  ink300: "#C9CDD2",
  ink150: "#E8EAEC",
  ink075: "#F2F3F4",
  paper: "#FAFAF8",
  card: "#FFFFFF",
  human: "#D4502B",
  humanBg: "#FCEEE8",
  humanBorder: "#F3D8CB",
  humanHover: "#BC421F",
  ai: "#30518C",
  aiBg: "#EBF0F9",
  aiBorder: "#D8E2F2",
  ok: "#2E7D4F",
  okBg: "#EAF4EE",
  okBorder: "#CDE6D7",
  warn: "#C98A1B",
  warnBg: "#FAF3E3",
  warnBorder: "#EAD9A8",
  off: "#7A828C",
  data: "#2FA6A0",
  dataStrong: "#1F8A84",
  dataBg: "#E3F4F3"
} as const;

export const space = {
  0: 0,
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  5: 10,
  6: 12,
  7: 14,
  8: 16,
  9: 18,
  10: 24
} as const;

export const radius = {
  xs: 4,
  sm: 5,
  md: 7,
  lg: 9,
  xl: 12,
  pill: 14
} as const;

export const shadow = {
  focus: "0 0 0 1px #1A1D21",
  dropdown: "0 4px 12px rgb(26 29 33 / 10%)",
  overlay: "0 12px 40px rgb(26 29 33 / 22%)",
  toggleDot: "0 1px 2px rgb(0 0 0 / 20%)"
} as const;

export const motion = {
  fast: "120ms",
  base: "160ms",
  panel: "220ms",
  easing: "ease",
  easeOut: "cubic-bezier(.16, 1, .3, 1)",
  pulseLoop: "1800ms"
} as const;

export const zIndex = {
  base: 0,
  sticky: 10,
  dropdown: 40,
  modalBackdrop: 70,
  modal: 80,
  toast: 90,
  tooltip: 100
} as const;

export const opacity = {
  disabled: 0.45,
  muted: 0.7,
  pulseMin: 0.35,
  scrim: 0.36
} as const;

export const font = {
  display: '"Manrope", sans-serif',
  body: '"Inter", system-ui, sans-serif',
  data: '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace'
} as const;

export const typeScale = {
  xxs: "10px",
  xs: "11px",
  sm: "12px",
  base: "13px",
  body: "14px",
  title: "16px",
  heading: "20px",
  display: "24px"
} as const;

export const layout = {
  navCollapsed: 68,
  navExpanded: 232,
  topbarHeight: 52,
  envStripHeight: 3
} as const;

export type TokenColor = keyof typeof color;
export type TokenSpace = keyof typeof space;
export type TokenRadius = keyof typeof radius;

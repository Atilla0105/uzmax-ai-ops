# UZMAX Admin UI Token Foundation Contract

> Status: M7-UI-00B docs-only implementation contract.
> Scope: token / foundation / AppShell boundary for the first M7+ UI migration wave.
> Source priority: `/Users/atilla/Downloads/运营塔台1.0.html` and `/Users/atilla/源码/unpacked 6` are the implementation value source; `docs/admin-design-system.md`, `DESIGN.md` and v1.1 docs constrain governance, IA, permissions, release and acceptance.

This contract does not implement source code. It tells the next foundation worker what to implement, what to leave alone, and what evidence must exist before page workers start.

## 1. Source Boundary

Use source priority in this order for visual implementation values:

1. Current rendered HTML: `/Users/atilla/Downloads/运营塔台1.0.html`
2. Frozen prototype-derived source: `/Users/atilla/源码/unpacked 6`
3. `docs/admin-design-system.md` and `DESIGN.md`
4. Existing repo code only as legacy implementation evidence

If existing repo docs or `packages/ui-tokens/src/tokens.css` conflict with `unpacked 6` / current HTML on font, color, spacing, radius, component chrome, state expression or motion, implement the prototype value and record the doc/code mismatch in evidence. Do not let the old `--uzmax-*` bridge or current milestone shells redefine the new visual target.

Do not modify, move, format or commit `/Users/atilla/源码/unpacked 6`. It is read-only source material.

## 2. Difference Table

| Area | Current Repo / Docs | `unpacked 6` / Current HTML | Contract Decision |
|---|---|---|---|
| Font | `docs/admin-design-system.md` and `DESIGN.md` name Manrope / Inter / JetBrains Mono. `packages/ui-tokens/src/tokens.css` only exposes `--uzmax-font-mono`. | `ui-tokens/tokens.css` and `tokens.ts` define `--font-display`, `--font-body`, `--font-mono`; TS exports `font` and `type` with display/title/panel/subtitle/body/secondary/caption/overline/micro roles. | Add font family tokens and type role tokens in foundation. Keep mono fallback for repo compatibility, but new primitives/patterns use prototype roles. |
| Color | Current package only has legacy `--uzmax-color-*`: accent, bg, border, danger, ink, muted, sidebar, surface, surface-muted, warn. Docs already prefer `--ink-*`, `--state-*`, `--accent-data`. | Source tokens include neutral ramp, semantic states, hover/border additions: `--state-human-hover`, `--state-human-border`, `--state-ai-border`, `--accent-data-strong`, `--accent-data-bg`. | Implement canonical prototype tokens first. Keep `--uzmax-*` as compatibility aliases only for untouched legacy shell code. New UI must not consume legacy names. |
| Spacing | `docs/admin-design-system.md` and backend v1.1 still describe a 4px scale: `--s-1: 4px` through `--s-12: 48px`. Current package has `--uzmax-space-1..6` at 4px increments. | `unpacked 6/ui-tokens/tokens.css` uses a 2px-based operational scale: `--s-1: 2px` through `--s-10: 24px`; TS exports `space[1]=2 ... space[10]=24`. | Foundation should adopt the prototype 2px ordinal scale for implementation. Record doc mismatch and either update design docs in the foundation spec if allowed, or create a follow-up doc-sync spec. |
| Radius | Docs mention `--radius-xs`, `--radius-s`, `--radius-m`, `--radius-pill`, plus prototype-derived 7/9/10/12px notes. Current package only has `--uzmax-radius-sm: 6px`. | Source tokens define `xs:4`, `sm:5`, `md:7`, `lg:9`, `xl:12`, `pill:14`. Components use 7px buttons, 8px inputs, 9/10px menus/cards, 12px overlays/empty icon blocks. | Implement the six-step prototype radius scale. Do not use 24/32px cards or old shell-only 6px as the default. |
| Shadow / elevation | Docs prefer borders and restrained elevation. Current package focus shadow is old teal glow: `0 0 0 3px rgb(47 111 115 / 18%)`. | Source uses `--shadow-focus: 0 0 0 1px #1A1D21`, `--shadow-dropdown: 0 4px 12px rgba(26,29,33,.10)`, `--shadow-overlay: 0 12px 40px rgba(26,29,33,.22)`, and toggle-dot shadow. | Replace old focus glow for new primitives. Ordinary panels use border/surface; dropdowns and overlays may use source shadows. |
| Motion | Docs say 80-300ms, reduced-motion aware. Current source shells have scattered transitions. | Source tokens define `--duration-fast: 120ms`, `--duration-base: 160ms`, `--easing-standard: ease`, `--loop-pulse: 1800ms`; `uzpulse` and `uzspin` are the only global keyframes. | Foundation should centralize motion tokens and keyframes in the token layer. Interactions consume tokens; no decorative page choreography. |
| Density | Existing `apps/admin/src` is milestone shell UI with page-local CSS and broad panel/card patterns. | Mother source is a dense operations tower: 52px topbar, 232/68px nav, 316px conversation side panels, 320px ticket list, 236px config nav, 3px staging strip, compact 10-13px labels/body. | Implement density through tokens, primitives, patterns and AppShell before any page rewrite. Do not start with page-level restyling. |
| State colors | Current package has danger/warn/accent but no full semantic background/border pairs. Docs require loading/empty/error/permission/degraded and semantic states. | Source has paired semantic status colors and dedicated patterns: `PageState`, `EmptyState`, `DegradedBar`, `StatusBadge`, `ConfirmModal`, queue degraded banner and disabled controls. | Foundation must define semantic color pairs and base state patterns before page workers. Status cannot be color-only. |
| Component chrome | Existing admin has `App.tsx`, `styles.css` and milestone CSS files with `--uzmax-*`, `.panel`, `.notice`, side stripes and page-local classes. No `primitives/`, `patterns/` or `shell/` directories exist. | Source has explicit layers: `ui-tokens`, `primitives`, `patterns`, `shell`, `pages`, `hooks`, `fixtures`. Primitive and pattern components own static specs; `primitives.css` owns hover/focus pseudo-states. | First implementation must create shared foundation layers. Pages remain untouched until the shared layer is merged and validated. |

## 3. First Implementation Boundary

The next implementation slice should be a foundation worker, not a page worker.

Allowed implementation touch surface for that worker:

| Layer | Suggested Paths | Purpose |
|---|---|---|
| Tokens | `packages/ui-tokens/src/tokens.css`, new `packages/ui-tokens/src/tokens.ts`, `packages/ui-tokens/src/index.ts`, `packages/ui-tokens/package.json` exports if needed | Add canonical prototype CSS tokens and TS token exports; keep legacy alias bridge for existing shell. |
| Admin primitives | new `apps/admin/src/primitives/**` and `apps/admin/src/primitives/primitives.css` | Button, Icon, StatusBadge, Avatar, Toggle, Input/SearchInput/Select/Textarea, Chip, Kbd, Checkbox, SlaCountdown, CountBadge, Heartbeat. |
| Admin patterns | new `apps/admin/src/patterns/**` | NavItem, Tabs, MessageBubble, DataTable, ConfirmModal, Dropdown, BatchBar, EmptyState, MetricCell/Card, DegradedBar, Toast, PageState. |
| AppShell | new `apps/admin/src/shell/**`, plus minimal `apps/admin/src/App.tsx`, `apps/admin/src/main.tsx` and global style wiring if required by the spec | Install AppShell, NavSidebar, TopBar, TenantSwitcher and route outlet/mount without migrating page surfaces. |
| Verification | focused Playwright / preview files allowed by the implementation spec | Prove foundation chrome, tokens and state matrix render on desktop/mobile. |

Files and directories that should not be touched by the foundation worker unless its spec explicitly expands scope:

- `apps/admin/src/M2ConversationTicketShell.tsx`
- `apps/admin/src/M3KnowledgeEvalShell.tsx`
- `apps/admin/src/M4*.tsx`
- `apps/admin/src/M5*.tsx`
- `apps/admin/src/m2-*.css`, `m3-*.css`, `m4-*.css`, `m5-*.css`
- `apps/admin/src/*ApiClient.ts`, `*Contracts.ts`, runtime clients
- `packages/db/**`, API/worker/cron/backend packages
- raw prototype files under `/Users/atilla/Downloads` or `/Users/atilla/源码/unpacked 6`

The foundation worker may leave existing legacy pages visible behind old styling if needed, but it must not make those pages the design source for new components.

## 4. Token Naming / Compatibility Strategy

Canonical names for new UI:

- Colors: `--ink-*`, `--state-*`, `--accent-data*`, `--paper`, `--card`
- Typography: `--font-display`, `--font-body`, `--font-mono`, plus role tokens for type scale
- Spacing: prototype ordinal `--s-1..--s-10`
- Radius: `--radius-xs`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-pill`
- Elevation: `--shadow-focus`, `--shadow-dropdown`, `--shadow-overlay`, `--shadow-toggle-dot`
- Motion: `--duration-fast`, `--duration-base`, `--easing-standard`, `--loop-pulse`
- Layering: `--z-dropdown`, `--z-modal`, plus expanded z tokens only if the implementation uses them
- Opacity: `--opacity-muted`, `--opacity-pulse-min`, disabled opacity as a primitive rule

Compatibility rules:

- Keep `--uzmax-*` only as legacy aliases or legacy shell values for untouched pages.
- Do not map new canonical tokens down to old visual values. If an alias exists, old names point toward new values or stay isolated for legacy CSS.
- New primitives/patterns/pages must import canonical CSS/TS tokens and must not consume `--uzmax-*`.
- Raw hex/px/ms values may exist inside token definitions and tightly scoped primitive/pattern implementation constants only when they come from `unpacked 6`; page slices must consume tokens, primitives or patterns.
- If an existing doc says 4px scale but `unpacked 6` says 2px scale, foundation implementation follows `unpacked 6` and records doc-sync need.
- If a token name would encode color appearance instead of role, reject it. Use state/role naming such as `state-human`, `ink-150`, `radius-md`, not `red-card` or `pretty-shadow`.

Design Skill Layer adoption:

| Decision | Result |
|---|---|
| Product register, restrained control-room UI, dense operational layout | Accepted |
| Lucide as the only icon source | Accepted |
| Semantic state colors, visible labels, keyboard/focus requirements | Accepted |
| Side stripes / thick colored left borders as state indicators | Rejected/adapted; use status badge, dot, tint, full border or icon+label |
| Old `--uzmax-*` namespace as source of visual truth | Rejected; legacy only |
| Decorative gradients/glass/large hero metrics | Rejected |

## 5. Foundation Acceptance Requirements

The first implementation worker should not be accepted with only TypeScript compile success. It must produce visual and interaction evidence.

Minimum acceptance set:

- A Storybook, `/design`, isolated Vite preview, or equivalent local preview that shows token swatches, typography, spacing/radius/elevation, primitives, patterns and AppShell states.
- Vite or preview screenshots for desktop and mobile, with at least:
  - desktop `1440x900`;
  - compact desktop/tablet around `1024px`;
  - mobile fallback at `320px` and one modern mobile width such as `390px`.
- Playwright visual checks for:
  - token/foundation preview;
  - AppShell collapsed/expanded nav;
  - tenant switcher open state;
  - production/staging environment marker;
  - modal/dialog and dropdown layering;
  - focus-visible controls.
- State coverage:
  - loading;
  - empty;
  - error;
  - permission denied;
  - degraded/warning;
  - disabled with reason;
  - selected/open;
  - success/completed where applicable.
- Static guard evidence:
  - no new `--uzmax-*` consumption in new files;
  - no page-local colors/spacing/radius in page slices;
  - no thick side-stripe state pattern in new components;
  - no raw prototype fixture/customer/order/contact samples copied into repo;
  - no lockfile or dependency changes unless the implementation spec explicitly allows them.
- Accessibility evidence:
  - contrast check for body, metadata and disabled/placeholder text;
  - visible keyboard focus;
  - status text not color-only;
  - reduced-motion behavior for keyframes/transitions.

## 6. Page Slice Dependency Conditions

Do not dispatch page workers until all of these are true:

1. The foundation implementation branch is merged.
2. `packages/ui-tokens` exports canonical CSS and TS tokens or an agreed equivalent.
3. `apps/admin/src/primitives/**`, `apps/admin/src/patterns/**` and `apps/admin/src/shell/**` exist and have preview/Playwright evidence.
4. AppShell can render without relying on page-local legacy CSS.
5. The foundation evidence states which old `apps/admin` shell CSS remains legacy debt and which new primitives/patterns page workers must consume.
6. Any `docs/admin-design-system.md` vs `unpacked 6` token mismatch has either been resolved in the foundation PR or recorded as a follow-up docs/spec blocker.

Page workers must then be one surface per spec. They should import shared primitives/patterns and may not re-create page-local component vocabularies. Their page fixtures must be synthetic/sanitized and must not copy raw customer, phone, Telegram, order, prompt, token or provider-key values from `unpacked 6`.

Recommended page sequence after foundation:

| Order | Slice | Reason |
|---:|---|---|
| 1 | Confirmation queue | Bounded, high-value state/keyboard/degraded pattern proof. |
| 2 | Global group / release console | Verifies gate copy, owner decision boundaries and evidence-first UI. |
| 3 | Conversation workbench | Highest layout complexity; should wait for shell, messages, status badges and context rail patterns. |
| 4 | Customer/order/knowledge/eval/AI/logs pages | Consume table, modal, degraded, permission and status patterns after earlier proof. |

## 7. Open Items For Coordinator

- Decide whether the foundation implementation spec may update `docs/admin-design-system.md` to resolve the 4px-vs-2px spacing mismatch, or whether that must be a separate docs slice.
- Decide whether adding `lucide-react` is inside the foundation spec budget. `unpacked 6` requires it, but this docs-only contract does not change dependencies.
- Decide whether the preview surface is `/design`, Storybook, or an isolated Vite route. The acceptance requirement is visual evidence; the exact harness belongs to the implementation spec.
- Keep M7-05 / prototype visual-source reset merged before page workers treat this contract as executable.

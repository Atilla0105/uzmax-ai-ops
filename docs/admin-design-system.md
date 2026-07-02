# UZMAX Admin Design System

> Status: M7-05 visual implementation standard for prototype-derived admin UI.
> Scope: UZMAX admin / operations tower.
> Visual source: owner current prototype and prototype-derived source package:
>
> - `/Users/atilla/Downloads/运营塔台1.0.html`
> - `/Users/atilla/源码/unpacked 6`
>
> Governance sources: `AGENTS.md`, PRD v1.1, technical architecture v1.1, backend design/frontend architecture v1.1 and acceptance matrix v1.1 still control product scope, IA, permission, security, release and acceptance boundaries. Their old visual-shell values do not override the current prototype.

If this file conflicts with AGENTS, PRD v1.1, technical architecture v1.1, backend design/frontend architecture v1.1, acceptance matrix v1.1, permissions, security, RLS, release gates, real business facts, real customer/order data, LLM keys, cost or compliance boundaries, those source-of-truth files and owner decisions win.

This file is a design and implementation contract. It does not approve GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply, external SaaS onboarding, or 1.0 release.

## 1. Design Principles

UZMAX admin is an operations tower, not a marketing site, chat toy or decorative AI dashboard. Every design choice must help an operator notice risk, understand permission, act safely, and leave evidence.

| Principle | Rule | Applied Meaning |
|---|---|---|
| Status first | State recognition beats visual flourish. | Risk, handoff, SLA, connector, eval, AI status and release gates are visible before decoration. |
| Management loop first | Context -> permitted action -> audit trail -> rollback/traceability. | High-risk actions require surrounding facts, owner/operator boundary copy, confirmation and logs. |
| Dense but not crowded | Use table/list density with clear grouping. | Avoid hero sections, oversized cards and empty dashboard theatrics. |
| Keyboard first | Repeated operations need keyboard affordances. | Confirmation queue, conversation switching, ticket claiming, draft send and eval failure navigation support shortcuts. |
| Desktop primary | Full admin is a desktop control room. | Mobile only covers emergency alerts, claim/transfer, pass/discard approvals, AI emergency stop/recovery and release blocker read-only review. |
| Evidence over impression | Copy distinguishes shell, synthetic evidence, runtime proof, owner acceptance and release approval. | Do not imply a gate, eval, connector or runtime is closed unless evidence says so. |
| Permission is visible | Hidden UI is not authorization. | Disabled/permission-denied controls must explain who can act; backend remains authoritative. |
| AI is accountable | AI outputs are never magic. | AI traces expose intent, tool, knowledge, model, tokens, cost and redline checks where relevant. |

### Prototype Adoption Notes

The current prototype and `/Users/atilla/源码/unpacked 6` are the visual implementation source for information density, token palette, typography, component expression, Lucide icon usage, three-column conversation workbench, high-density confirmation queue, group overview, release gate and modal confirmation patterns.

The following prototype expressions are adapted rather than copied:

| Prototype Expression | Decision | Reason |
|---|---|---|
| Inline styles throughout `.dc.html` / `unpacked 6` | Preserve values, not mechanics | Production code must move the same visual values into tokens, primitives and scoped CSS/classes. |
| 3px colored side bars on list rows/cards | Reject | M7 detector and Impeccable classify side stripes as design debt. Use status badges, icons, row tint, full border or dot indicators. |
| One-off colors `#1F8A84`, `#E6F4F3`, `#CDE6D7` | Normalize inside prototype token ramps | Map to data teal / ok state token ramp; no component-local color drift. |
| 9-12px panel radius in prototype/source package | Preserve through token scale | Use prototype-derived radius tokens; do not revert to the old shell radius just because existing code used it. |
| Runtime shimmer gradient in `support.js` | Do not adopt as product motion | `support.js` is generated dc-runtime support; product skeletons use tokenized static/pulse states without decorative gradients. |

## 2. Design Tokens

### 2.1 Token Layers

| Layer | Naming | Purpose |
|---|---|---|
| Canonical design tokens | `--ink-*`, `--state-*`, `--s-*`, `--radius-*` | Product design source from current prototype, `unpacked 6` and this document. |
| Legacy implementation namespace | `--uzmax-*` | Existing shell-only CSS namespace in `packages/ui-tokens/src/tokens.css`; not a source for new UI. |
| Component aliases | `--button-bg`, `--table-border`, etc. | Allowed inside primitives/patterns only; must resolve to canonical prototype-derived tokens. |
| Prototype-only literals | raw hex/px in `.dc.html` | Not allowed in production source. Convert to tokens before implementation. |

### 2.2 Color Tokens

| Role | Canonical Token | Value | Legacy Note |
|---|---|---:|---|
| Ink strong | `--ink-900` | `#1A1D21` | replaces old `--uzmax-color-ink` visual target |
| Ink body | `--ink-700` | `#3F454D` | body text target; old muted bridge is legacy |
| Ink muted | `--ink-500` | `#7A828C` | use for metadata only |
| Border | `--ink-300` | `#C9CDD2` | replaces old border bridge |
| Hairline | `--ink-150` | `#E8EAEC` | prototype hairline |
| Muted surface | `--ink-075` | `#F2F3F4` | prototype muted surface |
| Page background | `--paper` | `#FAFAF8` | prototype canvas |
| Surface | `--card` | `#FFFFFF` | `--uzmax-color-surface: #FFFFFF` |
| AI / model | `--state-ai` | `#30518C` | prototype semantic state |
| Human / blocking | `--state-human` | `#D4502B` | replaces old danger bridge |
| OK | `--state-ok` | `#2E7D4F` | prototype semantic state |
| Warning | `--state-warn` | `#C98A1B` | replaces old warn bridge |
| Offline | `--state-off` | `#7A828C` | prototype neutral/offline |
| Data accent | `--accent-data` | `#2FA6A0` | replaces old accent bridge |

### 2.3 State Background Tokens

| Role | Token | Value | Use |
|---|---|---:|---|
| AI bg | `--state-ai-bg` | `#EBF0F9` | AI message, eval running, model task state |
| AI border | `--state-ai-border` | `#D8E2F2` | AI panels and trace containers |
| Human bg | `--state-human-bg` | `#FCEEE8` | handoff, refund/redline/blocking risk |
| Human border | `--state-human-border` | `#F3D8CB` | destructive/blocked borders |
| OK bg | `--state-ok-bg` | `#EAF4EE` | passed, online, complete |
| OK border | `--state-ok-border` | `#CDE6D7` | capability on state |
| Warn bg | `--state-warn-bg` | `#FAF3E3` | degraded, stale, cost/SLA warning |
| Warn border | `--state-warn-border` | `#EAD9A8` | warning banners |
| Data bg | `--accent-data-bg` | `#E3F4F3` | data/media/info category |

### 2.4 Typography Tokens

| Token | Value | Use |
|---|---|---|
| `--font-display` | `Manrope` | product mark, page title, compact section headings |
| `--font-body` | `Inter`, `system-ui`, `sans-serif` | UI, labels, forms, tables, messages |
| `--font-data` | `JetBrains Mono`, `SFMono-Regular`, Consolas, monospace | IDs, timestamps, amounts, trace IDs, model/accounting data |
| `--text-2xs` | `10px` | uppercase rail labels, compact meta only |
| `--text-xs` | `11px` | metadata, shortcuts, table subtext |
| `--text-sm` | `12px` | buttons, chips, dense lists |
| `--text-base` | `13px` | default product UI text |
| `--text-body` | `14px` | prose, table body where space allows |
| `--text-title` | `16px` | panel/page section title |
| `--text-heading` | `20px` | page title on dense surfaces |
| `--text-display` | `28px` | rare operations overview heading only |

Rules:

- Product UI uses fixed sizes, not viewport-scaled typography.
- Essential body text uses `--ink-700` or `--ink-900`, not muted gray.
- `--ink-500` is for non-critical metadata, not placeholders or instructions.
- Numbers, IDs, timestamps, trace IDs, costs and model names use `--font-data`.
- Avoid negative letter spacing in compact UI. Product text should not feel squeezed.

### 2.5 Spacing Tokens

Spacing uses a 4px base scale.

| Token | Value | Common Use |
|---|---:|---|
| `--s-0` | `0` | reset |
| `--s-1` | `4px` | tight icon gaps, table row micro-gap |
| `--s-2` | `8px` | control gaps, compact padding |
| `--s-3` | `12px` | list item padding, form vertical rhythm |
| `--s-4` | `16px` | panel padding, toolbar padding |
| `--s-5` | `20px` | page header rhythm |
| `--s-6` | `24px` | page horizontal inset |
| `--s-8` | `32px` | major section gap |
| `--s-12` | `48px` | rare screen-level separation |

### 2.6 Radius Tokens

| Token | Value | Use |
|---|---:|---|
| `--radius-xs` | `4px` | keyboard keycaps, small code chips |
| `--radius-s` | `6px` | inputs, compact buttons, small badges |
| `--radius-m` | `8px` | standard panels/cards/dialogs |
| `--radius-pill` | `999px` | avatars, status dots, pill chips only |

Cards and panels follow the prototype-derived radius scale (`7px`, `9px`, `10px`, `12px` where present in `unpacked 6`). Do not use 24/32px rounded cards or revert to the old shell radius when migrating new UI.

### 2.7 Shadow / Elevation Tokens

UZMAX should read as a serious control room. Prefer borders, density and surface contrast over decorative shadows.

| Token | Value | Use |
|---|---|---|
| `--shadow-none` | `none` | most page panels |
| `--shadow-focus` | `0 0 0 1px #1A1D21` | prototype focus ring from `unpacked 6` |
| `--shadow-raised` | `0 1px 2px rgb(26 29 33 / 6%)` | selected queue card, compact raised tool |
| `--shadow-overlay` | `0 4px 12px rgb(26 29 33 / 10%)` | dropdowns, popovers, dialogs |

Do not pair a decorative wide shadow with a 1px border on ordinary cards. A component either needs containment or elevation; if both are needed, it must be an overlay or active selected tool.

### 2.8 Opacity / Disabled Tokens

| Token | Value | Use |
|---|---:|---|
| `--opacity-disabled` | `.45` | disabled text/icon |
| `--opacity-muted` | `.72` | secondary but readable metadata |
| `--opacity-dimmed` | `.55` | completed queue item after decision |
| `--opacity-scrim` | `.36` | modal backdrop over dense admin surface |

Disabled controls must still explain the unmet permission, gate or prerequisite.

### 2.9 Z-Index Tokens

| Token | Value | Use |
|---|---:|---|
| `--z-base` | `0` | page |
| `--z-sticky` | `10` | sticky headers/toolbars |
| `--z-dropdown` | `40` | tenant switcher, menus |
| `--z-modal-backdrop` | `70` | dialog scrim |
| `--z-modal` | `80` | dialogs/drawers |
| `--z-toast` | `90` | toasts |
| `--z-tooltip` | `100` | tooltips |

No arbitrary `999`/`9999`.

### 2.10 Motion Tokens

| Token | Value | Use |
|---|---:|---|
| `--duration-instant` | `80ms` | pressed feedback |
| `--duration-fast` | `120ms` | hover, focus, selected |
| `--duration-base` | `160ms` | nav expand, dropdown open |
| `--duration-panel` | `220ms` | drawer/dialog entrance |
| `--duration-slow` | `300ms` | rare data transition |
| `--ease-out` | `cubic-bezier(.16,1,.3,1)` | enter/expand |
| `--ease-in-out` | `cubic-bezier(.4,0,.2,1)` | toggle/position |

## 3. Grid & Layout

### 3.1 Global Frame

| Region | Desktop Rule |
|---|---|
| Left rail collapsed | `68px` from `unpacked 6`; old `64px` shell value is legacy. |
| Left rail expanded | `232px` tokenized max; labels visible. |
| Topbar | `52px`, white surface, bottom hairline. |
| Staging strip | `3px`, warn token, top of content. |
| Page background | `--paper`, content scroll contained below topbar. |
| Page inset | `24px` desktop, `16px` tablet, `12px` mobile fallback. |

The rail contains group labels and Lucide icons. The topbar contains breadcrumb/layer, tenant switcher, environment marker, heartbeat, global search, notifications and user menu.

### 3.2 Desktop Layout Patterns

| Pattern | Grid |
|---|---|
| Conversation workbench | `316px / minmax(420px, 1fr) / 316px`, full height |
| Ticket workbench | `380px / 1fr`, detail may split `1fr / 248px` |
| Confirmation queue | centered flow `max-width: 680px`, stats bar full width |
| Customer assets | full page header + tabs + data table/detail; detail uses content plus right supporting panels |
| Group overview | health strip + data table; no customer plaintext |
| Release console | gate rows/table + checklist panel + release severity summary |
| Logs/analytics | filter toolbar + table/chart panels, stable columns |

### 3.3 Table/Grid Rules

- Tables use stable column widths and no layout shift on loading or filter changes.
- Numeric/data columns align by type: counts and money right-aligned when in tables, mono font.
- Header rows use `--ink-500` metadata only when contrast is sufficient; critical columns use `--ink-700`.
- Tables default to search, filter, pagination or virtual scroll depending on row volume.
- Lists with 1k+ rows must be virtualized.

### 3.4 Breakpoints

| Token | Width | Behavior |
|---|---:|---|
| `--bp-xs` | `320px` | minimum mobile test floor; only fallback flows |
| `--bp-sm` | `480px` | emergency/approval mobile |
| `--bp-md` | `768px` | tablet read-only or review |
| `--bp-lg` | `1024px` | compact desktop; side panels may collapse |
| `--bp-xl` | `1280px` | full desktop workbench |
| `--bp-2xl` | `1440px` | prototype target and visual-regression baseline |

Responsive behavior is structural, not fluid typography: collapse panels, convert tables to row summaries, pin critical actions and keep full labels for dangerous actions.

## 4. Iconography

### 4.1 Source

Lucide is the only icon source for product UI. Do not hand-draw SVG icons or mix icon libraries.

### 4.2 Technical Rules

| Token | Value |
|---|---|
| Stroke width | `1.75` |
| Line cap/join | round |
| Default size | `16px` |
| Dense nav size | `18-19px` |
| Inline status/action size | `13-15px` |
| Empty state size | `24px` only when needed |

Icons inherit `currentColor`. Use tokenized wrapper components, not repeated raw SVG.

### 4.3 Icon Semantics

| UI Intent | Preferred Lucide Family |
|---|---|
| Conversation | `message-square`, `message-square-quote` |
| Tickets/handoff | `clipboard-list`, `ticket`, `hand` |
| Knowledge/resources | `book-open`, `file-text`, `file` |
| AI/model | `bot`, `cpu`, `gauge` |
| Configuration | `sliders-horizontal`, `shield`, `route`, `zap-off` |
| Tenant/platform | `building-2`, `plug`, `briefcase` |
| Release/gates | `rocket`, `check`, `lock`, `triangle-alert` |
| Search/filter/sort | `search`, `list-filter`, `arrow-down-up` |
| File operations | `upload`, `download`, `paperclip` |

### 4.4 Usage Rules

- Use icons inside buttons for familiar tools; text labels stay visible for destructive, permissioned and release actions.
- Unfamiliar icon-only controls require tooltip labels.
- Status cannot rely on icon or color alone; include text.
- Notification badges use mono numbers and state-human only for real human/blocking attention.

## 5. Typography

### 5.1 Type Hierarchy

| Style | Font | Size | Weight | Line Height | Use |
|---|---|---:|---:|---:|---|
| Product mark | Manrope | 14-15 | 700-800 | 1 | UZMAX brand block |
| Page title | Manrope | 16-20 | 700 | 1.25 | page/panel title |
| Panel title | Manrope | 15-16 | 700 | 1.25 | dense panel headings |
| Body | Inter | 13-14 | 400-500 | 1.5 | messages, forms, descriptions |
| Label | Inter | 11-12 | 600 | 1.25 | field labels, table metadata |
| Button | Inter | 12 | 600 | 1 | compact action buttons |
| Chip/badge | Inter | 10-12 | 600 | 1.2 | status and filters |
| Data | JetBrains Mono | 10-14 | 500-600 | 1.3 | IDs, costs, times, model stats |

### 5.2 Copy Rules

- Labels should describe operator action: "确认发送", "接管会话", "恢复每日", "确认匿名化删除".
- Use gate-specific language: "评测未通过 · 不可发布", "Business 草稿 · 待确认", "GA-0 locked".
- Avoid vague success copy. Say what changed and where audit evidence goes.
- Do not use product copy to imply owner signoff or release approval.

## 6. Color System

### 6.1 Neutral Roles

| Role | Use |
|---|---|
| `--paper` | page background, conversation thread canvas |
| `--card` | panels, dropdowns, table surfaces |
| `--ink-900` | primary text, active selected state, production environment badge |
| `--ink-700` | readable body text, secondary action text |
| `--ink-500` | non-critical metadata, timestamps with mono |
| `--ink-300` | strong border, checkbox idle border |
| `--ink-150` | hairline dividers, table row separators |
| `--ink-075` | inactive chip, hover row, subtle toolbar |

### 6.2 Semantic Status

| Status | Foreground | Background | Meaning |
|---|---|---|---|
| Human/blocking | `--state-human` | `--state-human-bg` | refund, redline, handoff required, release blocker |
| Warning/degraded | `--state-warn` | `--state-warn-bg` | stale snapshot, connector degraded, SLA/cost warning |
| OK | `--state-ok` | `--state-ok-bg` | passed, online, completed, healthy |
| AI/running | `--state-ai` | `--state-ai-bg` | AI processing, eval running, model route |
| Offline/neutral | `--state-off` | `--ink-075` | offline, not started, unavailable |
| Data accent | `--accent-data` | `--accent-data-bg` | shared data/media category, not risk |

### 6.3 Red Rules

`--state-human` is reserved for human-needed or blocking states. It is not a decorative accent and not a generic "important" color.

Examples:

- Allowed: refund redline, destructive delete, AI breaker, release blocker, high-priority unresolved ticket.
- Not allowed: brand flourish, empty icon, chart accent, inactive badge.

### 6.4 Environment Colors

| Environment | Marker |
|---|---|
| Production | `--ink-900` bg, white text, no top strip |
| Staging | `--state-warn-bg` bg, `--state-warn` text, `3px` top strip |
| Local/dev | `--state-ai-bg` bg, `--state-ai` text; never confused with production |

## 7. Component Library

Every interactive component must define default, hover, focus-visible, active, disabled and loading states. Domain components also define empty, error, permission denied and degraded states.

### 7.1 Foundation Components

| Component | Variants | States / Rules |
|---|---|---|
| Button | primary, secondary, danger, success, ghost, link | primary = `ink-900` for neutral commands or `state-ok` for allowed safe completion; danger = human red; disabled explains prerequisite. |
| IconButton | default, selected, danger, quiet | square `32-34px`, tooltip required unless adjacent label exists. |
| Input | text, search, textarea, mono/data | focus ring visible; placeholders readable; error text below, not color-only. |
| Select | native-like, compact filter | no custom weird affordance; selected value visible; disabled reason via helper/tooltip. |
| Checkbox | default, checked, indeterminate | used for checklists and batch selection; label clickable. |
| Switch | on/off, disabled | only binary durable settings; dangerous toggles require confirmation. |
| Radio/Segmented | compact choice | use for mutually exclusive modes; keyboard arrow navigation. |
| Chip | filter, category, removable | selected = ink background; status chips use semantic colors. |
| Badge | status, count, priority | mono for numeric counts; include label for status. |
| Avatar | human, AI, tenant | circular; initials allowed; color from semantic or neutral tokens. |
| Tooltip | text, shortcut | appears on hover/focus; no hidden critical permission content. |
| Popover/Menu | dropdown, command menu | z-index dropdown; escape closes; focus trapped when modal-like. |
| Dialog | confirm, form, destructive | high-risk actions require explicit title, consequence, optional reason field and audit copy. |
| Drawer | side detail, mobile fallback | only when preserving context beats modal. |
| Toast | success, error, warning, info | brief result; never sole audit evidence. |
| Banner | warning, blocker, info | persistent page-level state such as degraded connector or distill low pass rate. |
| Skeleton | row, table, panel | static or subtle opacity pulse; no decorative shimmer gradients. |
| Empty State | actionable, read-only, permission | tells what is missing and next allowed action; no cute illustration. |

### 7.2 Navigation Components

| Component | Anatomy | States |
|---|---|---|
| App Rail | logo, group labels, nav item, badge, collapse control | collapsed, expanded, active, hover, focus, unread/attention badge |
| Topbar | breadcrumb, tenant switcher, search, env, heartbeat, notification, user menu | production/staging, healthy/degraded heartbeat, notification count |
| Tenant Switcher | search input, tenant row, health dot, health badge | active tenant, healthy, degraded, human-needed, breaker, permission filtered |
| Global Search | icon, placeholder, shortcut keycap | idle, focused, command palette open, no result, permission filtered |
| Breadcrumb | group / tenant / page | clickable group only when authorized |

### 7.3 Data Display Components

| Component | Use | States |
|---|---|---|
| Data Table | group overview, orders, logs, team, configs | loading skeleton, empty, filtered empty, error, degraded, permission denied |
| Virtual List | conversations, logs, high-volume tables | stable row height, selected row, unread, pinned risk, no side stripes |
| Metric Cell | health/cost/rate/count | label + mono value + optional delta; no hero metric cards |
| Status Pill | semantic state | label required; icon optional |
| Timeline | ticket events, audit logs, journey | dot + event + mono time + actor |
| Diff Panel | confirmation conflict, config/persona compare | side-by-side at desktop; stacked with headings on mobile fallback |
| Chart | Recharts only | no decorative gradients; chart color tokens mapped to semantic/data roles |

### 7.4 Messaging / Workbench Components

| Component | Variants | Rules |
|---|---|---|
| Conversation Row | unread, needs human, SLA warning, AI processing, human handling, resolved | pinned risk ordering; no 3px side stripe; use status pill + row tint/dot. |
| Message Bubble | customer, AI auto, Business draft, human external, system | customer = surface, AI = AI bg, human/blocker = human bg; timestamps mono. |
| AI Trace | collapsed, expanded | shows intent, tool, knowledge, model, token/cost, redline; no raw prompt/completion. |
| Composer | draft read-only, editable, sending, blocked | Business draft must say "待确认"; send requires permission and audit. |
| Quick Action Grid | create ticket, quote, merge identity, note | icon + label; disabled actions explain missing permission/data. |

### 7.5 Operations Components

| Component | Variants / States |
|---|---|
| Ticket Card/Detail | unclaimed, mine, SLA risk, reopened, closed; claim/transfer/close/reopen; close requires result and destination/explanation. |
| Confirmation Queue Card | focused, pending, approved, discarded, conflict, edited; keyboard hints; conflict requires diff. |
| Distill Health Banner | normal, low pass rate, reduced frequency, manual restore required. |
| Customer Asset Row | language/script/stage/order/quote/open issue/tags; blocked/unreachable markers. |
| Customer Detail | identity, fields, tags, history, tickets, order snapshots, quotes, dual-track guide, notes. |
| Tag Editor | customer tag, conversation tag; color swatches from allowed semantic/data tokens only. |
| Custom Field Editor | text, number, enum, date; usage count, delete confirmation. |
| Order Row | fresh, stale, missing, imported snapshot, connector degraded; stale never looks live. |
| Import Job Row | pending, parsing, completed, partial failure, failed; errors downloadable where implemented. |
| Knowledge Entry Row | hits, feedback, version, eval state, redline marker; redline toggle requires audit. |
| Asset Row | type, storageRef, file_id cache, linked/unlinked, selected/batch. |
| Eval Case Row | pass, fail, running; failed row shows input, expected, actual and linked gate. |
| AI Member Card | online, manual offline, breaker offline; capability toggles; restore requires reason and confirmation. |
| Persona Editor | draft, dirty, eval running, eval pass, eval fail; publish disabled until gate passes. |
| Release Gate Row | closed, running, blocked, not started; evidence, owner signoff, blocker, ADR link. |
| GA Checklist Item | unchecked, checked, blocked, permission denied; open action disabled until all required items pass. |

### 7.6 Component State Matrix

| State | Visual | Behavior |
|---|---|---|
| Default | tokenized surface/border/text | ready for interaction |
| Hover | `--ink-075` or border contrast | no layout shift |
| Focus-visible | tokenized focus ring, not color-only | keyboard-visible on all controls |
| Active/Pressed | slight surface darkening or inset | immediate feedback <= 80ms |
| Selected | ink border/background or semantic selected pattern | selected label remains readable |
| Open | overlay shadow + focus management | escape closes dropdown/dialog |
| Disabled | opacity + disabled cursor + reason | cannot be clicked; reason visible/tooltip |
| Loading | skeleton or inline progress | layout dimensions stable |
| Error | human red text + icon/label + recovery action | no color-only errors |
| Warning/Degraded | amber banner/chip + explanation | operator knows whether action is safe |
| Success/Complete | OK chip + final state | avoid celebratory motion |
| Permission denied | lock icon + role/prerequisite copy | backend still rejects unauthorized calls |

## 8. Interaction

### 8.1 Keyboard Shortcuts

| Shortcut | Scope | Action |
|---|---|---|
| `Cmd/Ctrl + K` | global | open global search / command palette |
| `J` / `ArrowDown` | confirmation queue | move to next item |
| `K` / `ArrowUp` | confirmation queue | move to previous item |
| `A` | confirmation queue | approve focused item |
| `E` | confirmation queue | edit focused item |
| `D` | confirmation queue | discard focused item |
| `T` | conversation | take over / handoff action when permitted |
| `Cmd/Ctrl + Enter` | composer | confirm send when permitted |
| `Esc` | overlay/editor | close or return focus |

Shortcuts must not fire while focus is inside input, textarea, select or contenteditable.

### 8.2 High-Risk Actions

High-risk actions include sending Business drafts, restoring AI breaker state, changing model routes, publishing persona/prompt/knowledge/config, merging/splitting identities, anonymizing customers, deleting tags/fields/assets, opening GA-0, and release-risk decisions.

Required pattern:

1. Show current context and consequence.
2. Show permission boundary and audit destination.
3. Require confirmation; require reason for destructive, recovery, release or identity actions.
4. Disable action if gate/prerequisite is missing.
5. Emit success/failure feedback and link to audit/business object when implemented.

### 8.3 Permission / Gate Behavior

- Hidden navigation is allowed for unavailable feature flags, but direct API must still fail securely.
- Disabled controls explain missing permission, eval gate, owner signoff, production lock or missing runtime evidence.
- Release and eval gates must use exact status language from source-of-truth/evidence.
- No UI path may imply Telegram Business automatic reply in 1.0.

### 8.4 Forms

- Required fields show labels and validation before submission where possible.
- Destructive forms use confirmation dialogs, not inline hidden delete buttons.
- Field errors use message + icon/color, not color alone.
- Data fields use mono font for IDs, amounts and timestamps.

## 9. Motion

Motion communicates state. It is not decoration.

| Motion | Duration | Rule |
|---|---:|---|
| Hover/focus | 80-120ms | color/border only, no layout shift |
| Dropdown/menu | 120-160ms | opacity + small translate, focus remains managed |
| Rail expand/collapse | 160ms | width and label opacity; no bounce |
| Dialog/drawer | 180-220ms | opacity + transform; content visible by default |
| Status change | 120-200ms | chip/background transition |
| Loading | static skeleton or subtle opacity pulse | no decorative gradient shimmer |

Reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

Never gate content visibility behind an animation class.

## 10. Responsive

### 10.1 Desktop

Desktop is the primary product surface. Full workflows are designed for `1280px+`, validated at `1440x900` and must remain usable down to `1024px`.

Desktop rules:

- Keep global frame stable.
- Collapse optional context panels before shrinking content below readable width.
- Preserve keyboard shortcuts and visible focus.
- Use virtualized lists where row volume is high.

### 10.2 Tablet

Tablet is review/triage, not full configuration.

- Rail can collapse to icons.
- Right context panels become drawers.
- Tables may become compact row summaries if columns cannot remain readable.
- Editing complex knowledge/config/order import flows may require desktop handoff.

### 10.3 Mobile Fallback

Mobile covers only:

- alert details;
- emergency ticket claim/transfer;
- confirmation queue approve/discard, with edit handoff to desktop;
- AI emergency stop and breaker recovery confirmation;
- GA-0/release blocker read-only review;
- tenant health summary.

Mobile does not promise full knowledge editing, configuration matrix, eval analysis, order import, complex customer merge/split, custom fields or bulk asset management.

Mobile UI rules:

- Minimum tested width: `320px`.
- Primary action touch target: at least `40px` high.
- Dangerous actions use full text labels.
- Tables become cards/rows; no horizontal overflow in fallback flows.

## 11. Accessibility

### 11.1 Targets

- WCAG AA contrast for text and interactive states.
- Keyboard operation for all repeated workflows.
- Visible focus for every interactive element.
- Status is never color-only.
- Reduced motion supported.
- Permission denied and degraded states are understandable without visual context.

### 11.2 Contrast Rules

- Body text: >= 4.5:1.
- Large/bold text: >= 3:1.
- Placeholder and helper text must be readable; avoid muted gray for instructions.
- Tiny `10-11px` labels are allowed only for non-critical metadata and must be paired with visible primary labels nearby.

### 11.3 Semantics

- Use semantic buttons/inputs/selects before custom controls.
- Icon-only controls require `aria-label` and tooltip.
- Dialogs trap focus and return it to the invoking control.
- Tables use real table semantics when data is tabular; virtualized tables need accessible row/column labeling.
- Live status updates use polite announcements where needed; urgent blockers use assertive only for true emergencies.

### 11.4 Multilingual Content

UZMAX surfaces Chinese UI, Uzbek Latin/Cyrillic and Russian customer content. The UI must:

- avoid hard-coded width assumptions for Cyrillic or long Latin strings;
- allow message bodies to wrap at 65-75ch where prose appears;
- keep IDs/timestamps/costs mono and scannable;
- not truncate critical redline, refund, release or permission copy without tooltip/detail.

## 12. Design Patterns

### 12.1 Global Admin Frame

An operator always sees current layer, tenant, environment, heartbeat, search, notifications and identity. Production/staging must be visually distinct.

Pattern:

- left rail grouped by information architecture;
- topbar with breadcrumb and tenant switcher;
- health/heartbeat as data, not decoration;
- tenant switch clears tenant cache and reloads permissions/feature flags in implementation.

### 12.2 Group Overview

Owner sees tenant health without customer plaintext.

Required elements:

- health strip: tenant count, abnormal tenants, AI breaker, model failure, connector failure, redline events;
- tenant table: sessions, human-needed, SLA risk, handoff rate, AI cost, eval state, order state, last abnormal event;
- row click enters authorized tenant context.

### 12.3 Conversation Workbench

Three-column desktop pattern:

```text
conversation list | thread / draft composer | customer context
```

Required:

- human-needed and SLA risk pinned;
- Business drafts marked as "待确认";
- AI traces expandable;
- customer context includes profile, related ticket, order, quote and quick actions;
- take-over/send actions respect permission and audit.

### 12.4 Ticket Workflow

List + detail. Detail includes summary, suggested handling, customer/order/quote context, conversation snippets, notes, event timeline and close result.

Close requires one of: resolved, transfer channel, no response, invalid, duplicate, with destination/explanation when required.

### 12.5 Customer Asset Center

Tabs:

- customer list;
- conversation search;
- customer tags;
- conversation tags;
- custom fields.

Customer detail includes identity, profile, custom fields, tags, history, tickets, order snapshots, quote records, dual-track guide records and notes. Merge/split/anonymize require impact preview and audit confirmation.

### 12.6 Order Center

Order read-only center must never make stale/imported data look live.

Required:

- search by customer/order/batch/external ID;
- source, update time and expiry visible;
- degraded connector banner;
- no-API branch copy: "订单数据主路径：导入快照";
- import job progress, success/failure rows and rollback entry when implemented.

### 12.7 Knowledge & Resources

Tabs:

- journey stages;
- facts;
- public quick replies;
- private quick replies;
- media assets;
- template source.

Rules:

- redline knowledge is explicit and auditable;
- eval state visible on facts/persona/publishable items;
- file_id is cache, storageRef is source;
- public/private quick replies cannot be visually ambiguous.

### 12.8 Confirmation Queue

This is a daily review tool, not a generic card list.

Required:

- stats bar: today's candidates, daily cap, 7-day pass rate, distill frequency, conflicts, recent downgrade reason;
- amber banner when pass rate < 40% for 3 days;
- single focused item with keyboard actions;
- conflict candidates require side-by-side diff;
- approved/discarded states dim but remain visible;
- owner daily processing target <= 5 minutes.

### 12.9 Eval Center

Required:

- production gate status at top;
- eval set categories visible;
- failed cases show input, expected, actual and linked model/prompt/knowledge versions;
- publish/save disabled when gate fails.

### 12.10 AI Member Console

Required:

- human and AI member filter;
- AI member status: online, manual offline, breaker offline;
- capability toggles for tutorial, screenshot, quote, order query, Business draft;
- breaker recovery confirmation with reason;
- persona version compare, eval gate and rollback.

### 12.11 Team / Config

Team:

- members and roles tabs;
- role permissions grouped by conversation, customer, order, knowledge, AI, config and logs.

Config:

- business, SLA, templates, model routes, cost guardrails, breaker thresholds, channel config, order connector;
- every save generates version;
- rollback requires confirmation and audit.

### 12.12 Analytics / Logs

Analytics:

- fixed operations dashboard plus configurable dimension table;
- dimensions: member, AI member, channel, intent, time grain, order status, handoff reason;
- export through job, not direct untracked file download.

Logs:

- login, online and operation logs separated;
- high-risk rows link back to business object.

### 12.13 Release / Acceptance Console

Release gate console is evidence-first and owner-facing.

Required:

- M0-M6, GA-0 and 1.0 release state;
- acceptance item coverage;
- evidence producer and links;
- owner signoff state;
- blockers and ADR links;
- disabled open/release actions until P0/owner conditions are met.

This surface remains a durable audit/risk console after release; it does not disappear.

## 13. Naming Convention

### 13.1 Token Names

Use role-based names, not visual descriptions.

Allowed:

- `--state-human`
- `--surface-panel`
- `--text-body`
- `--space-panel-x`

Avoid:

- `--red`
- `--orange-card`
- `--pretty-shadow`
- `--blue-thing`

### 13.2 CSS / Code Names

| Layer | Pattern | Example |
|---|---|---|
| Primitive | `uz-<primitive>` | `uz-button`, `uz-input`, `uz-badge` |
| Pattern | `uz-<domain>-<pattern>` | `uz-confirmation-card`, `uz-ai-trace` |
| Page shell | `uz-page-<surface>` | `uz-page-conversations` |
| State class | `is-<state>` / `has-<condition>` | `is-selected`, `is-degraded`, `has-blocker` |
| Test id | `<surface>-<object>-<role>` | `confirmation-card-approve`, `release-gate-row` |

Do not name component classes after colors.

### 13.3 Component Variant Names

Use product-state variants:

- `intent`: `neutral | primary | success | warning | danger | ai`
- `size`: `xs | sm | md`
- `density`: `compact | standard`
- `state`: `default | hover | focus | active | disabled | loading | error | selected | open`

### 13.4 Figma Names

Use slash hierarchy:

- `Foundations/Color/State/Human`
- `Components/Button/Primary`
- `Components/Badge/Status`
- `Patterns/Conversation/Message Bubble`
- `Screens/Tenant/Conversation Workbench/Desktop`

Variants use Figma properties:

- `intent=primary`
- `state=disabled`
- `density=compact`
- `icon=true`

## 14. Figma Organization

### 14.1 File Structure

| Page | Contents |
|---|---|
| `00 Cover / Source Of Truth` | scope, source docs, owner boundaries, last update |
| `01 Foundations` | colors, type, spacing, radius, shadow, motion, breakpoints |
| `02 Components` | primitives and all component states |
| `03 Patterns` | global frame, workbench, queue, tables, release gate |
| `04 Screens - Group` | overview, model/cost/risk, templates, connections, release, tenants, logs |
| `05 Screens - Tenant` | conversation, tickets, customer assets, orders, knowledge, eval, AI members, team, config, analytics, logs |
| `06 Mobile Fallback` | alert, ticket claim, queue pass/discard, AI stop/recover, release blocker review |
| `07 Prototype Flows` | clickable flows, keyboard annotations, edge cases |
| `08 QA / Redlines` | accessibility notes, responsive specs, dev handoff specs |
| `99 Archive` | old explorations; clearly dated |

### 14.2 Figma Foundations

- Create variables for colors, spacing, radius, shadows, typography and motion.
- Name variables with the token names in this document.
- Keep semantic color modes for `default`, `staging` and future `high-contrast`.
- Use component variants for every interactive state, not duplicated detached frames.

### 14.3 Figma Component Requirements

Each component frame must include:

- anatomy labels;
- variant matrix;
- keyboard/focus annotation where interactive;
- token references;
- accessibility note;
- "Do / Don't" examples for risky patterns.

### 14.4 Handoff Rules

- Figma annotations must reference acceptance/gate language when a component touches release, eval, AI, order, permission or customer data.
- No Figma-only color, spacing or radius may enter dev handoff.
- If Figma proposes a style outside this document, create a token proposal with rationale and owner/design review note.

## 15. Developer Guidelines

### 15.1 Architecture

Frontend layering remains:

```text
packages/ui-tokens -> primitives -> patterns -> pages
```

Rules:

- pages do not import backend packages;
- admin calls API/WS only;
- no component-level literal colors, font sizes, spacing, radii or shadows;
- no inline style for production UI except unavoidable dynamic geometry that still resolves token values;
- DTOs come from schema/explicit contracts, not hand-written drift.

### 15.2 Token Implementation

Production CSS should align `packages/ui-tokens/src/tokens.css` with this design system before or as part of the first real UI migration slice. Existing `--uzmax-*` values may remain only for untouched legacy shell code; they must not be used as the visual target for new components.

Example:

```css
:root {
  --ink-900: #1A1D21;
  --ink-700: #3F454D;
  --ink-500: #7A828C;
  --ink-150: #E8EAEC;
  --paper: #FAFAF8;
  --card: #FFFFFF;
  --state-human: #D4502B;
  --state-human-bg: #FCEEE8;
}
```

### 15.3 Component Implementation

- Build primitives first: button, input, select, badge, dialog, tooltip, table, skeleton.
- Build domain patterns on top: tenant switcher, AI trace, confirmation card, release gate row.
- Keep React component files under local complexity/length budgets.
- Use Lucide icons through a shared wrapper.
- Use Recharts for charts only after a chart component wraps tokenized colors and accessible labels.
- Use TanStack Query for server state; Zustand only for UI state.

### 15.4 Testing / Verification

Each UI slice must include:

- spec compliance review;
- code quality review;
- no non-token literal color/size/spacing check for changed core screens;
- Playwright coverage for `/design` and the touched core screen;
- desktop and 320px mobile no-overflow checks;
- loading, empty, error, permission denied and degraded states where applicable;
- keyboard shortcut coverage for repeated workflows.

### 15.5 `/design` Living Spec

The `/design` page should eventually show:

- token swatches;
- typography scale;
- spacing/radius/elevation examples;
- primitive components with all states;
- domain patterns;
- core screens: conversation workbench, confirmation queue, release console;
- mobile fallback examples;
- accessibility and visual regression anchors.

This M7-05-updated document is the visual-system standard source for that future living spec. It does not implement `/design`.

### 15.6 Forbidden Implementation Patterns

- No side-stripe borders thicker than 1px for cards/list rows/callouts.
- No gradients, glassmorphism, decorative illustration, colored shadows or one-off "AI dashboard" effects.
- No nested cards.
- No raw inline style literals for production components.
- No red used as decoration.
- No hidden permission UI that backend still allows.
- No status color without text/icon label.
- No release/eval/AI wording that overclaims evidence.
- No Business automatic reply path in 1.0.

## 16. Adoption Roadmap

| Step | Scope | Boundary |
|---:|---|---|
| 1 | Align tokens in `packages/ui-tokens` to canonical roles | separate implementation spec |
| 2 | Build `/design` living spec page | separate UI spec with Playwright |
| 3 | Extract primitives | button/input/badge/table/dialog/skeleton first |
| 4 | Extract global frame pattern | planned `M7-UI-01` implementation slice |
| 5 | Upgrade confirmation queue | planned `M7-UI-02` interaction slice |
| 6 | Apply patterns to conversation, customer assets, knowledge/eval, AI members, analytics/logs | one bounded spec per surface |

## 17. Required Section Coverage

This document includes:

- Design Principles
- Design Tokens
- Grid & Layout
- Iconography
- Typography
- Color System
- Component Library
- Interaction
- Motion
- Responsive
- Accessibility
- Design Patterns
- Naming Convention
- Figma Organization
- Developer Guidelines

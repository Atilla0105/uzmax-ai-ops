# Design

Derived design operating brief. If this conflicts with AGENTS.md, PRD v1.1, backend design v1.1, technical architecture, or acceptance matrix, those files win.

## System

UZMAX admin is a product surface: an operations tower for long-running, state-heavy work. Design serves task completion, risk recognition, auditability and operator confidence.

The design system source hierarchy is:

1. `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
2. `AGENTS.md`
3. `packages/ui-tokens/src/tokens.css`
4. Existing admin primitives, patterns and pages

If code and this file disagree, refresh this file or the tokens through a dedicated spec; do not silently invent a parallel system.

## Visual Rules

- No gradients, glassmorphism, decorative illustration, colored shadows or ornamental AI flourishes.
- Lucide is the only icon source once icons are introduced.
- Recharts is the only chart source once charts are introduced.
- Numbers, prices, timestamps, trace ids, order ids and event ids use the data font.
- Status colors cannot be reused as decoration.
- Vermilion/human red is reserved for human-needed or blocking risk states.
- Cards are only for distinct repeated items, modals and framed tools; do not nest cards.
- Page sections are full-width bands or unframed layouts, not floating decorative cards.
- Product motion is 150-250ms, state-driven and reduced-motion aware.

## Color Tokens

Canonical target palette from backend design v1.1:

| Role | Token | Value |
|---|---|---|
| Ink strong | `--ink-900` | `#1A1D21` |
| Ink body | `--ink-700` | `#3F454D` |
| Ink muted | `--ink-500` | `#7A828C` |
| Border | `--ink-300` | `#C9CDD2` |
| Hairline | `--ink-150` | `#E8EAEC` |
| Muted surface | `--ink-075` | `#F2F3F4` |
| Page background | `--paper` | `#FAFAF8` |
| Card/surface | `--card` | `#FFFFFF` |
| AI state | `--state-ai` | `#30518C` |
| Human/blocking state | `--state-human` | `#D4502B` |
| OK state | `--state-ok` | `#2E7D4F` |
| Warning state | `--state-warn` | `#C98A1B` |
| Offline state | `--state-off` | `#7A828C` |
| Data accent | `--accent-data` | `#2FA6A0` |

Current implementation tokens use the `--uzmax-*` namespace in `packages/ui-tokens/src/tokens.css`. Treat the current namespace as the implementation bridge and the canonical target palette above as the design direction for future token extraction.

## Typography

| Role | Font |
|---|---|
| Display | `Manrope` |
| Body/UI | `Inter` |
| Data | `JetBrains Mono` or the implementation fallback `SFMono-Regular`, Consolas, `Liberation Mono`, monospace |

Product UI uses fixed type sizes, not viewport-scaled typography:

| Token | Size |
|---|---:|
| `--text-xs` | `12px` |
| `--text-sm` | `13px` |
| `--text-base` | `14px` |
| `--text-lg` | `16px` |
| `--text-xl` | `20px` |
| `--text-2xl` | `28px` |

Use tight product hierarchy: clear labels, readable table text, compact headings inside panels, and no hero-scale typography inside operational surfaces.

## Spacing, Radius and Elevation

Spacing follows a 4px base scale:

`4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `48px`.

Radius:

- Small controls and compact cards: `6px`.
- Standard panels/cards: `8px`.
- Do not use large rounded cards; pills are allowed only for status tags or compact command chips.

Elevation:

- Prefer borders and surface contrast over shadows.
- `--shadow-1` is for small elevation only.
- `--shadow-2` is for overlays or genuinely raised tools, not page decoration.

## Layout Patterns

- Global frame: 64px left icon rail with hover/fixed label expansion, topbar with current hierarchy, tenant switcher, environment marker, heartbeat, search, notifications and user menu.
- Tenant switcher: searchable by tenant, business line and status; show health lights; clear tenant cache and reload permissions/flags on switch.
- Conversation workbench: three columns for list, thread/draft and context panel; human-needed and SLA-risk items stay pinned.
- Confirmation queue: single high-density card stream with `J/K/A/E/D`; conflict candidates require side-by-side diff.
- Release console: gate rows show acceptance item, evidence producer, evidence links, owner signoff state, blockers and owner-decision-required actions.
- Mobile fallback: only emergency and approval flows; no full knowledge/config/eval/order-import editing.

## Component State Requirements

Every reusable interactive control must define:

- default
- hover
- focus-visible
- active
- disabled
- loading
- error
- success or completed state when applicable

Every core screen must define:

- loading
- empty
- error
- permission denied
- degraded

## Accessibility

- Body text contrast must be at least 4.5:1.
- Large text contrast must be at least 3:1.
- Focus rings must be visible and not color-only.
- Status must include text or icon labels in addition to color.
- Keyboard operation is required for repeated work queues and critical actions.
- Reduced motion must avoid delayed or choreographed task entry.

## Implementation Rules

- Frontend layering remains `ui-tokens -> primitives -> patterns -> pages`.
- Pages must not introduce raw native styling when a token, primitive or pattern exists.
- Impeccable recommendations are design-defaults, not permission to bypass AGENTS, specs, PR budgets, tests, source boundaries or acceptance evidence.
- Detector findings from existing code are baseline until M7 follow-up adopts no-new-design-debt.

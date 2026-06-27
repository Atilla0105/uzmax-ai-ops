# Product

Derived design operating brief. If this conflicts with AGENTS.md, PRD v1.1, backend design v1.1, technical architecture, or acceptance matrix, those files win.

## Register

product

## Users

UZMAX is used by the project owner, group administrators, tenant operators, customer support staff, knowledge maintainers and AI operations staff. They work in long desktop sessions, often under interruption, while monitoring tenant health, handoff risk, confirmation queues, release readiness, costs, logs and AI behavior.

Mobile use is fallback-only: urgent alerts, emergency ticket claim/transfer, confirmation queue pass/discard, AI emergency stop/recovery confirmation, GA-0 or release blocker read-only review and tenant health summary.

## Product Purpose

UZMAX is an operations tower for multi-tenant AI customer-support operations. The admin product exists to make status, risk, handoff, knowledge correction, release readiness and audit evidence visible enough that an operator can act safely without guessing.

Success means an operator can see what needs attention, understand why it matters, take the allowed action, leave evidence, and avoid crossing product, permission, safety, release or real-data boundaries.

## Brand Personality

Calm, exacting, operational.

The interface should feel like a serious control room: restrained, dense, readable, trustable and fast. It should not feel like a marketing site, chat toy, decorative SaaS landing page or speculative AI demo.

## Anti-references

- Marketing-page hero layouts, decorative illustration, empty visual drama or split hero/card compositions.
- Generic AI SaaS dashboards with oversized metric cards, gradients, glassmorphism, soft colored shadows or purple/blue monotone polish.
- Chat-plugin UI that hides operational state, auditability or ownership boundaries.
- Consumer-style gamification, cute empty states or celebratory motion on safety-critical flows.
- Interfaces where red is used as decoration instead of human/blocking risk.

## Design Principles

- Status first: color, density, ordering, labels and navigation serve risk recognition before decoration.
- Management loop first: every high-risk action should show context, permitted action, audit trail and rollback or traceability when applicable.
- Dense but not crowded: information should be table-like, grouped and scannable, with stable columns and predictable controls.
- Keyboard first: repeated operational flows should support fast movement and action without mouse dependence.
- Desktop primary, mobile fallback: the full product is a desktop control room; mobile only covers emergency and approval fallbacks.
- Evidence over impression: UI copy must distinguish shell, synthetic evidence, runtime proof, owner acceptance and release approval.

## Accessibility & Inclusion

Target WCAG AA for contrast, focus visibility and keyboard operation. Motion must respect reduced-motion preferences and must communicate state rather than decoration. Status cannot rely on color alone; state labels, icons or text must remain visible. Product copy should be plain, concrete and operational.

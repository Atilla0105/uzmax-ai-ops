# M7-UI-32 Knowledge Resources Page Evidence

## Summary

This branch implements `tenant.knowledge` as a UI-first degraded/mock/read-only implementation candidate. It preserves the owner source structure for the 知识与资源 page and keeps all knowledge data synthetic.

## Source Reads

- `AGENTS.md` instructions supplied in the worker prompt.
- Owner source: `/Users/atilla/Downloads/运营塔台1.0.html`.
- Unpacked source: `/Users/atilla/源码/unpacked 6/pages/knowledge/KnowledgePage.tsx`.
- Design layer: `.agents/skills/impeccable/SKILL.md`, `PRODUCT.md`, `DESIGN.md`, `reference/product.md`.
- Current routing/tests: `apps/admin/src/pages/PageOutlet.tsx`, `apps/admin/src/pages/registry.ts`, existing M7 page tests.

## Implementation Notes

- `tenant.knowledge` is routed through `PageOutlet` with `key={selectedTenantId}`.
- Runtime banner permanently states degraded/mock/read-only, not production knowledge data, no formal knowledge write and no automatic publish.
- URL states are deterministic for `loading`, `empty`, `error`, `permission` and `gate`.
- Local asset edit/save/cancel/delete only mutates component state and resets on tenant switch.
- No DB/API/storage/eval runtime is touched.

## Screenshots

- `/tmp/uzmax-m7-ui-32-knowledge-resources-visible-ui-v2/react-knowledge-journey-desktop.png`
- `/tmp/uzmax-m7-ui-32-knowledge-resources-visible-ui-v2/react-knowledge-assets-detail-desktop.png`
- `/tmp/uzmax-m7-ui-32-knowledge-resources-visible-ui-v2/react-knowledge-mobile-320.png`

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --check origin/codex/m7-ui-31-orders-visible-ui...HEAD` | pass | No whitespace errors. |
| `$NODE scripts/guards/doc-trigger-paths.mjs` | pass | `doc-trigger-paths: ok`. |
| `$NODE scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-32-knowledge-resources-page.md --include-worktree` | pass | 10 changed files: source 5, docs 4, test 1. |
| `$NODE scripts/guards/prettier-ignore-boundary.mjs --base origin/codex/m7-ui-31-orders-visible-ui` | pass | Baseline markers unchanged; monitored diff ok. |
| `$NODE node_modules/prettier/bin/prettier.cjs --check ...` | pass | All matched files use Prettier style. |
| `$NODE node_modules/eslint/bin/eslint.js ...` | pass | Focused touched source/test lint passed. |
| `$NODE node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false` | pass | No TypeScript output; log: `/tmp/uzmax-m7-ui-32-tsc.log`. |
| `PATH=... node_modules/.bin/playwright test apps/admin/tests/m7-ui-knowledge-resources.spec.ts` | pass | 8 passed. Local preview server was started manually because this runtime has no `npm`, while `playwright.config.ts` webServer uses `npm run build:admin && npx vite preview`. |
| `$NODE node_modules/vite/bin/vite.js build apps/admin --emptyOutDir` | pass | Built successfully; Vite reported the existing >500 kB chunk warning. |

## Environment Notes

- This v2 worktree initially had no `node_modules`.
- The runtime provides `node` and `pnpm`, but not `npm`; `pnpm --frozen-lockfile` cannot run because this repo has `package-lock.json` and no `pnpm-lock.yaml`.
- To keep worker isolation while avoiding lockfile changes, `node_modules` was copied into this v2 worktree from the base M7-UI-31 worktree. No package or lockfile was changed.

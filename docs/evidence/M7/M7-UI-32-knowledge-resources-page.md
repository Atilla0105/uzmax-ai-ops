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
| `$NODE scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-32-knowledge-resources-page.md --include-worktree --pr-body-file /tmp/m7-ui-32-pr-body.md` | pass | Passes when the PR metadata file includes `Spec ID`, `Spec file`, `Exception: large_change_exception` and `External API evidence: none`; this is a proposed governance exception for owner/coordinator review, not self-approval. |
| `$NODE scripts/guards/prettier-ignore-boundary.mjs --base origin/codex/m7-ui-31-orders-visible-ui` | pass | Baseline markers unchanged; monitored diff ok. |
| `$NODE node_modules/prettier/bin/prettier.cjs --check ...` | pass | All matched files use Prettier style. |
| `$NODE node_modules/eslint/bin/eslint.js ...` | pass | Focused touched source/test lint passed. |
| `$NODE node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false` | pass | No TypeScript output; log: `/tmp/uzmax-m7-ui-32-tsc.log`. |
| `PATH=$NPM_PATH node_modules/.bin/playwright test apps/admin/tests/m7-ui-knowledge-resources.spec.ts` | pass | 8 passed. `NPM_PATH` let Playwright `webServer` resolve `npm`/`npx` directly, so the focused spec ran in its normal config path and regenerated the three screenshots under `/tmp/uzmax-m7-ui-32-knowledge-resources-visible-ui-v2`. |
| `$NODE node_modules/vite/bin/vite.js build apps/admin --emptyOutDir` | pass | Built successfully; Vite still reports the existing >500 kB chunk warning for `apps/admin/dist/assets/index-DSrEx-aj.js`. |

Default-budget behavior without PR metadata: local `guard:pr-shape` fails this slice because the visible page plus focused test exceeds the default source-size budget (`net source LOC 904 > 600`). The passing result above requires the explicit `/tmp/m7-ui-32-pr-body.md` metadata file and should be reviewed by the owner/coordinator in PR context.

## Environment Notes

- This v2 worktree already contains the dependency tree needed for focused validation; no package or lockfile change was made in this closeout pass.
- The temp PR metadata file used for local `guard:pr-shape` validation is `/tmp/m7-ui-32-pr-body.md` and is intentionally not committed.

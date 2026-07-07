# M7-UI-103 Conversation Composer Source Parity Evidence

## Preflight

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-103-conversation-composer-source-parity`
- `git status --short --branch`: `## codex/m7-ui-103-conversation-composer-source-parity...origin/codex/m7-ui-31-orders-visible-ui`
- `git branch --show-current`: `codex/m7-ui-103-conversation-composer-source-parity`

## Source Read

- Root rules: `/Users/atilla/Applications/UZMAX智能运营/AGENTS.md`.
- Impeccable/project context: `.agents/skills/impeccable/SKILL.md`, PRODUCT/DESIGN context, product register.
- Owner visual reference: `/Users/atilla/Downloads/运营塔台1.0.html`.
- Unpacked composer source: `/Users/atilla/源码/unpacked 6/pages/conversations/Composer.tsx`.
- Current React: `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx` and private composer component `apps/admin/src/pages/conversations/conversationWorkbenchComposer.tsx`.
- Conversation tests/locators: `apps/admin/tests/`.

## Source Mapping Result

| Requirement | Evidence |
| --- | --- |
| Composer density | React composer preserves `padding:12px 18px 14px`, state row `gap:8px`, `margin-bottom:9px`, textarea `border-radius:9px`, `padding:11px 13px`, `line-height:1.55`. |
| Draft pill | Pill now carries Lucide `PencilLine` plus `Business 草稿 · 待确认`. |
| Owner caveat | Visible caveat remains `由 AI 生成，确认后才会发送给客户`. |
| Tool controls | Paperclip and quote-snippet are compact icon-only buttons; `附件` / `话术片段` remain only as `aria-label`/`title`, not visible text. |
| Bottom bar | Keeps tools, `乌兹别克语（拉丁） · 红线检查通过`, `编辑草稿`, green disabled `确认发送` with send icon and visible `⌘↵`. |
| Runtime boundary | API is routed to non-JSON in focused test and workbench remains `data-runtime-source="synthetic"` / `data-runtime-state="degraded"`. |

## Artifacts

- Desktop screenshot: `/tmp/uzmax-m7-ui-103-conversation-composer-source-parity/react-composer-source-parity-1280x800.png`
- Mobile screenshot: `/tmp/uzmax-m7-ui-103-conversation-composer-source-parity/react-composer-source-parity-mobile-320x800.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-103-conversation-composer-source-parity/react-composer-source-parity-metrics.json`

## Metrics Summary

- Desktop: nav `232`, topbar `53`, list `316`, thread `392`, rail `340`, body scroll width `1280`, composer bottom `800`.
- Desktop composer: visible text `Business 草稿 · 待确认 由 AI 生成，确认后才会发送给客户 乌兹别克语（拉丁） · 红线检查通过 编辑草稿 确认发送 ⌘↵`.
- Desktop residual difference: at current React thread width `392px`, the confirm send control wraps to the next line. This slice keeps all required text/icons/kbd and does not widen columns or redesign layout; the wrap remains a visual parity residual under the current column constraint.
- Tool buttons: two compact controls, both `31x31`, with `aria-label`/`title` values `附件` and `话术片段`; visible composer text does not include those labels.
- Mobile fallback: body scroll width `320`, composer width `320`; test scrolls composer into view before screenshot. Captured mobile composer metrics are `y=266`, `bottom=534`, proving the screenshot covers the composer state, not only the page top/list. This is evidence of readable stacked fallback, not a mobile redesign claim.
- Lint/jscpd guard: `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx` is `192` lines after Prettier and the new private `conversationWorkbenchComposer.tsx` is `82` lines. The focused test's group-to-tenant helper remains rewritten to avoid the prior UI-101/UI-102 duplicate helper shape without lowering route/layer assertions.
- PR hygiene: changed source files are `conversationWorkbenchStyles.tsx` and `conversationWorkbenchComposer.tsx`; new source files `1`. `rg -n "function Composer|composerState|fallbackDraft|draftSubject|uz-conv-composer" apps/admin/src/pages/conversations apps/admin/tests` shows composer component logic owned by `conversationWorkbenchComposer.tsx`, style selectors in `conversationWorkbenchStyles.tsx`, and existing/new tests as assertions only.

## Validation

- `git diff --check`
  - Result: pass.
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm dlx npm@11.9.0 run guard:prettier-ignore -- --base origin/codex/m7-ui-31-orders-visible-ui`
  - Result: pass, no new `prettier-ignore` markers in monitored source/test paths.
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm dlx npm@11.9.0 run lint`
  - Result: pass.
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm dlx npm@11.9.0 run jscpd`
  - Result: pass, `No duplicates found`.
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm dlx npm@11.9.0 run typecheck`
  - Result: pass.
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm dlx npm@11.9.0 run build:admin`
  - Result: pass. Vite emitted the existing large chunk warning.
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node_modules/.bin/playwright test apps/admin/tests/m7-ui-103-conversation-composer-source-parity.spec.ts --config /tmp/uzmax-m7-ui-103-conversation-composer-source-parity/playwright-4174.config.mjs`
  - Result: pass, `1 passed`; mobile screenshot is captured after `scrollIntoViewIfNeeded()` on the composer.
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node node_modules/prettier/bin/prettier.cjs --check apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx apps/admin/src/pages/conversations/conversationWorkbenchComposer.tsx apps/admin/tests/m7-ui-103-conversation-composer-source-parity.spec.ts docs/specs/M7-UI-103-conversation-composer-source-parity.md docs/evidence/M7/M7-UI-103-conversation-composer-source-parity.md`
  - Result: pass, all changed files use Prettier style.
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm dlx npm@11.9.0 run format:check`
  - Result: fail on 20 unrelated base files outside this PR's allowed scope (`apps/admin/src/M4CustomerAssetRuntimeState.tsx`, group/knowledge/eval/analytics fallbacks, several API/order-import types, and package capability/channel indexes). The changed PR files are covered by the targeted Prettier check above.

Note: this shell has no direct `npm` binary in PATH, so `npm run ...` commands were invoked through bundled `pnpm dlx npm@11.9.0 ...`, using the repo's npm package manager version.

Validation note: default `playwright.config.ts` reused an existing `127.0.0.1:4173` preview whose cwd was `/Users/atilla/.codex/worktrees/m7-ui-31-orders-visible-ui`, so it showed stale composer DOM. To avoid killing another worktree's preview, this run built current worktree and used a temporary `/tmp` config against current-worktree preview on `127.0.0.1:4174`; that preview was stopped after the focused test.

## Boundaries

- No API, DB, worker, cron, router, AppShell, shared primitive/token/pattern, package, lockfile or global config changes.
- No claim of runtime closure, owner final visual acceptance, GA/release approval or production Business/Telegram send readiness.

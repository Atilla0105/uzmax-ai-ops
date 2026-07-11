# M11-04B1 Atomic Close And Human Reopen Evidence

Status: `split_spec_frozen__review_pending`
Spec: `docs/specs/M11-04B1-atomic-close-human-reopen.md`
Parent: `docs/specs/M11-04B-atomic-close-reopen-bot-resume.md`
Base: `5520bc7f4522b73d92d9c896e0a59888058deec7`
Branch: `codex/m11-04b-close-resume`
Worktree:
`/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m11-04b-close-resume`

## Split Trigger

- Parent implementation remained uncommitted after its pre-reviews.
- Tracked source edits measured +440 net lines and the two untracked helpers
  added 434 and 110 physical lines, approximately +984 total.
- Parent budget is +600. The apparent guard net-zero result is invalid for WIP
  accounting because `--include-worktree` does not include worktree numstat.
- Parent failure rules and M11-00 require a serial split; no exception is used.
- B1 owns atomic close/human reopen. B2 will own explicit safe Bot resume after
  B1 merge/cleanup.

## Preflight Truth

- Root/main remains read-only at merged M11-04A SHA `5520bc7`.
- Assigned worktree/branch remain the only edit location.
- No schema, migration, worker source, deployment, production, secret or real
  customer/order-data mutation is required.
- Existing parent WIP has no source commit and makes no runtime claim. It must be
  narrowed only after both B1 reviews return GO.

## Validation Record

| Gate | Result | Evidence |
|---|---|---|
| source-budget measurement | split required | approximately +984 > +600; untracked helpers counted manually |
| parent behavior preservation | pass | B1 inherits close/reopen safety; B2 retains all resume/audit/queue obligations |
| B1 state/security/spec review | pending | no source-resume authorization yet |
| B1 test/budget review | pending | no source-resume authorization yet |
| implementation/local gates | pending | no B1 runtime claim |
| true DB/CI | pending | no B1 runtime claim |

## First Pre-review Corrections

- State/security/spec pre-review returned `NO-GO` on the first child draft.
- The execution spec now uses the exact machine-readable `## Spec 类型` and
  `## 触碰模块/文件` headings required by `pr-shape`.
- The claim-first success fixture now requires exactly one send after release,
  with final conversation still CLOSED and no second send.
- B1 now explicitly forbids every parent lifecycle-readiness response field;
  the complete readiness contract is owned only by B2.
- These are docs-only corrections. Source remains uncommitted and may not resume
  until corrected state/security and test/budget re-reviews both return GO.

## Current Conclusion

The split is a governance correction, not a product-scope reduction. M11-04B1
must merge atomic close/reopen first; M11-04B2 must then merge explicit Bot
resume before M11-05 can start. Nothing here claims a usable workbench,
staging/production closure, GA or 1.0.

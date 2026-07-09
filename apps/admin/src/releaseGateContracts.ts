type ReleaseGateState = "Accepted" | "Closed" | "In progress" | "Locked" | "Blocked";

export type ReleaseGateRow = {
  blocker: string;
  evidenceHref: string;
  evidenceLabel: string;
  gate: string;
  owner: string;
  source: string;
  state: ReleaseGateState;
};

export const releaseGateConsoleState = {
  ga0Action: {
    auditBoundary: "L-01 audit write is not available until checklist green",
    disabled: true,
    label: "GA-0 open action locked"
  },
  summary:
    "Minimal Bot-only GA-0 signoff path is in progress for controlled internal/staging use; G-04/G-06 are owner-deferred for this path only, not passed; GA-0 action and 1.0 remain locked.",
  rows: [
    {
      blocker: "none",
      evidenceHref: "docs/evidence/M0/README.md",
      evidenceLabel: "M0 evidence",
      gate: "M0",
      owner: "accepted",
      source: "ADR-001/002/003",
      state: "Accepted"
    },
    {
      blocker: "none",
      evidenceHref: "docs/evidence/M1/README.md",
      evidenceLabel: "M1 evidence",
      gate: "M1",
      owner: "accepted",
      source: "Gate 1 evidence",
      state: "Accepted"
    },
    {
      blocker: "none",
      evidenceHref: "docs/evidence/M2/README.md",
      evidenceLabel: "M2 evidence",
      gate: "M2",
      owner: "accepted",
      source: "Bot and ticket evidence",
      state: "Accepted"
    },
    {
      blocker: "none",
      evidenceHref: "docs/evidence/M3/README.md",
      evidenceLabel: "M3 evidence",
      gate: "M3",
      owner: "accepted",
      source: "AI gate evidence",
      state: "Accepted"
    },
    {
      blocker: "none",
      evidenceHref: "docs/evidence/M4/README.md",
      evidenceLabel: "M4 evidence",
      gate: "M4",
      owner: "accepted",
      source: "Order/customer evidence",
      state: "Accepted"
    },
    {
      blocker: "GA-0 and release still not approved",
      evidenceHref: "docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md",
      evidenceLabel: "M6-00 signoff",
      gate: "M5",
      owner: "accepted for milestone evidence",
      source: "M5R true DB closeout",
      state: "Accepted"
    },
    {
      blocker:
        "GA-0 remains locked; remaining non-external release conditions require owner decision or evidence",
      evidenceHref: "docs/evidence/M6B/M6B-17-ga0-external-blocker-rollup.md",
      evidenceLabel: "M6B-17 closure",
      gate: "M6",
      owner: "closed as no-go package",
      source: "M6B-17 external-input rollup",
      state: "Closed"
    },
    {
      blocker:
        "GA-0 remains locked; M9-04 employee admin read, M9-05 Bot redline/fuse leave-ticket drill and M9-06 owner open record required",
      evidenceHref: "docs/evidence/GA-0/GA0-00-minimal-boundary.md",
      evidenceLabel: "GA-0 minimal boundary",
      gate: "GA-0",
      owner: "minimal Bot-only path selected; G-04/G-06 deferred not passed",
      source: "M9-03 boundary, acceptance matrix L-01/L-02",
      state: "Locked"
    },
    {
      blocker: "Full P0/P1/P2 rollup not closed",
      evidenceHref: "UZMAX智能运营系统-1.0验收矩阵-v1.1.md",
      evidenceLabel: "1.0 matrix",
      gate: "1.0",
      owner: "not approved",
      source: "Acceptance matrix",
      state: "Blocked"
    }
  ] satisfies ReleaseGateRow[]
} as const;

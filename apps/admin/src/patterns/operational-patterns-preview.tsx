import { useState } from "react";
import { Button, Kbd, StatusBadge } from "../primitives";
import {
  BatchActionBar,
  ConfirmModal,
  DataTable,
  DegradedBar,
  FilterBar,
  MessageBubble,
  PageToolbar,
  SidePanel,
  ToastHost,
  type DataTableColumn,
  useToast
} from "../patterns";

type OperationalRow = {
  area: string;
  id: string;
  owner: string;
  state: string;
  stateTone: "danger" | "warn" | "info" | "ok";
};

const operationalRows: OperationalRow[] = (
  [
    ["Queue review", "queue", "Ops", "Human review", "danger"],
    ["Release gate", "gate", "Owner", "Blocked", "warn"],
    ["Eval run", "eval", "AI ops", "Running", "info"],
    ["Tenant health", "tenant", "Admin", "Healthy", "ok"]
  ] as Array<[string, string, string, string, OperationalRow["stateTone"]]>
).map(([area, id, owner, state, stateTone]) => ({
  area,
  id,
  owner,
  state,
  stateTone
}));

const operationalColumns: Array<DataTableColumn<OperationalRow>> = [
  {
    header: "Area",
    key: "area",
    render: (row) => <strong>{row.area}</strong>,
    width: "34%"
  },
  {
    header: "State",
    key: "state",
    render: (row) => <StatusBadge tone={row.stateTone}>{row.state}</StatusBadge>,
    width: "28%"
  },
  { header: "Owner", key: "owner", render: (row) => row.owner, width: "22%" },
  {
    align: "right",
    header: "Age",
    key: "age",
    render: (_row, index) => <Kbd>{index + 1}m</Kbd>
  }
];

const previewMessages = [
  ["system", "System audit marker", undefined, "m7-message-system"],
  [
    "customer",
    "Customer message body wraps without side stripes.",
    "10:24 · inbound",
    "m7-message-customer"
  ],
  [
    "ai",
    "AI draft state stays visually accountable.",
    "10:25 · AI route",
    "m7-message-ai"
  ],
  [
    "human",
    "Human action uses blocking-state color only when needed.",
    "10:26 · operator",
    "m7-message-human"
  ]
] as const;

export function OperationalPatternsPreview() {
  const [panelOpen, setPanelOpen] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    () => new Set(["queue", "gate"])
  );
  const toast = useToast();

  const toggleRow = (key: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <>
      <section
        className="panel operational-patterns"
        data-testid="m7-operational-patterns"
      >
        <PageToolbar
          actions={
            <Button onClick={() => setConfirmOpen(true)} variant="danger">
              Open confirmation
            </Button>
          }
          eyebrow="M7-UI-04"
          meta="Shared pattern preview only; planned pages remain not started."
          status={<StatusBadge tone="warn">Page workers blocked</StatusBadge>}
          title="Operational patterns"
        />
        <DegradedBar data-testid="m7-operational-degraded-bar">
          Shared degraded state remains a reusable warning pattern.
        </DegradedBar>
        <FilterBar
          actions={
            <Button
              onClick={() => {
                toast.show("Filter preview updated", "info");
                toast.show("Filter preview saved", "success");
              }}
              variant="secondary"
            >
              Apply
            </Button>
          }
          filters={[
            {
              children: (
                <>
                  <option value="all">All states</option>
                  <option value="risk">Risk only</option>
                </>
              ),
              label: "State",
              defaultValue: "all"
            }
          ]}
          searchLabel="Operational pattern search"
        />
        <div className="operational-patterns__grid">
          <div className="operational-patterns__stack">
            <div data-testid="m7-data-table">
              <DataTable
                columns={operationalColumns}
                density="compact"
                rowAction={{
                  getLabel: (row) => `Open ${row.area}`,
                  header: "Open",
                  onActivate: (row) =>
                    toast.show(`Row action preview: ${row.area}`, "info")
                }}
                rowKey={(row) => row.id}
                rows={operationalRows}
                selection={{
                  getLabel: (row) => `Select ${row.area}`,
                  onToggle: toggleRow,
                  onToggleAll: () =>
                    setSelectedIds((current) =>
                      current.size === operationalRows.length
                        ? new Set<string>()
                        : new Set(operationalRows.map((row) => row.id))
                    ),
                  selectedKeys: selectedIds
                }}
              />
            </div>
            <BatchActionBar
              actions={[
                {
                  key: "assign",
                  label: "Assign",
                  onClick: () => toast.show("Batch action preview", "success")
                },
                {
                  danger: true,
                  key: "hold",
                  label: "Hold",
                  onClick: () => setConfirmOpen(true)
                }
              ]}
              count={selectedIds.size}
              label="Selected rows"
              onClear={() => setSelectedIds(new Set<string>())}
            />
            <div className="operational-patterns__messages">
              {previewMessages.map(([role, body, meta, testId]) => (
                <MessageBubble key={role} meta={meta} role={role} testId={testId}>
                  {body}
                </MessageBubble>
              ))}
            </div>
          </div>
          <SidePanel
            meta="Right supporting context"
            onClose={() => setPanelOpen(false)}
            open={panelOpen}
            title="Supporting panel"
          >
            <p>Context, permission and audit copy live beside the work surface.</p>
          </SidePanel>
          {!panelOpen ? (
            <Button onClick={() => setPanelOpen(true)} variant="secondary">
              Open supporting panel
            </Button>
          ) : null}
        </div>
      </section>

      <ConfirmModal
        confirmLabel="Confirm hold"
        danger
        description="Reason is required for gate-bound or destructive operations."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          toast.show("Confirmation preview recorded", "warning");
          setConfirmOpen(false);
          setReason("");
        }}
        open={confirmOpen}
        reason={{
          label: "Audit reason",
          onChange: setReason,
          placeholder: "Record the operational reason",
          required: true,
          value: reason
        }}
        title="Confirm gate-bound action"
      />
      <ToastHost toasts={toast.toasts} />
    </>
  );
}

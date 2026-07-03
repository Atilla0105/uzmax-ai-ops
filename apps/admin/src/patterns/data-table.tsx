import type { ReactNode } from "react";
import { Button, Checkbox } from "../primitives";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Align = "left" | "right" | "center";
type Density = "compact" | "standard";

export interface DataTableColumn<Row> {
  align?: Align;
  header: ReactNode;
  key: string;
  render: (row: Row, index: number) => ReactNode;
  width?: string;
}

export interface DataTableSelection<Row> {
  getLabel?: (row: Row) => string;
  onToggle: (key: string, row: Row) => void;
  onToggleAll?: () => void;
  selectedKeys: ReadonlySet<string>;
}

export interface DataTableRowAction<Row> {
  getLabel: (row: Row) => string;
  header?: ReactNode;
  onActivate: (row: Row) => void;
  renderLabel?: (row: Row) => ReactNode;
}

export interface DataTableProps<Row> {
  columns: Array<DataTableColumn<Row>>;
  density?: Density;
  emptyState?: ReactNode;
  rowAction?: DataTableRowAction<Row>;
  rowKey: (row: Row) => string;
  rows: Row[];
  selection?: DataTableSelection<Row>;
}

interface SelectionSummary {
  allSelected: boolean;
  someSelected: boolean;
}

function getSelectionSummary<Row>({
  rowKey,
  rows,
  selection
}: Pick<DataTableProps<Row>, "rowKey" | "rows" | "selection">): SelectionSummary {
  if (!selection) return { allSelected: false, someSelected: false };
  const selectedRows = rows.map((row) => selection.selectedKeys.has(rowKey(row)));
  return {
    allSelected: rows.length > 0 && selectedRows.every(Boolean),
    someSelected: selectedRows.some(Boolean)
  };
}

function DataTableColGroup<Row>({
  columns,
  rowAction,
  selection
}: Pick<DataTableProps<Row>, "columns" | "rowAction" | "selection">) {
  return (
    <colgroup>
      {selection ? <col className="uz-data-table__select-col" /> : null}
      {columns.map((column) => (
        <col
          key={column.key}
          style={column.width ? { width: column.width } : undefined}
        />
      ))}
      {rowAction ? <col className="uz-data-table__action-col" /> : null}
    </colgroup>
  );
}

function DataTableHeader<Row>({
  columns,
  rowAction,
  selection,
  summary
}: Pick<DataTableProps<Row>, "columns" | "rowAction" | "selection"> & {
  summary: SelectionSummary;
}) {
  return (
    <thead>
      <tr>
        {selection ? (
          <SelectionHeaderCell selection={selection} summary={summary} />
        ) : null}
        {columns.map((column) => (
          <th
            className={cx(column.align && `is-${column.align}`)}
            key={column.key}
            scope="col"
          >
            {column.header}
          </th>
        ))}
        {rowAction ? <th scope="col">{rowAction.header ?? "Action"}</th> : null}
      </tr>
    </thead>
  );
}

function SelectionHeaderCell<Row>({
  selection,
  summary
}: {
  selection: DataTableSelection<Row>;
  summary: SelectionSummary;
}) {
  return (
    <th scope="col">
      <Checkbox
        aria-label={
          selection.onToggleAll ? "Select all rows" : "Select all rows unavailable"
        }
        checked={summary.allSelected}
        disabled={!selection.onToggleAll}
        indeterminate={!summary.allSelected && summary.someSelected}
        onClick={() => selection.onToggleAll?.()}
      />
    </th>
  );
}

function DataTableBodyRow<Row>({
  columns,
  index,
  row,
  rowAction,
  rowId,
  selection
}: Pick<DataTableProps<Row>, "columns" | "rowAction" | "selection"> & {
  index: number;
  row: Row;
  rowId: string;
}) {
  return (
    <tr>
      {selection ? (
        <SelectionBodyCell row={row} rowId={rowId} selection={selection} />
      ) : null}
      {columns.map((column) => (
        <td className={cx(column.align && `is-${column.align}`)} key={column.key}>
          {column.render(row, index)}
        </td>
      ))}
      {rowAction ? <RowActionCell row={row} rowAction={rowAction} /> : null}
    </tr>
  );
}

function SelectionBodyCell<Row>({
  row,
  rowId,
  selection
}: {
  row: Row;
  rowId: string;
  selection: DataTableSelection<Row>;
}) {
  return (
    <td>
      <Checkbox
        aria-label={selection.getLabel?.(row) ?? "Select row"}
        checked={selection.selectedKeys.has(rowId)}
        onClick={(event) => {
          event.stopPropagation();
          selection.onToggle(rowId, row);
        }}
      />
    </td>
  );
}

function RowActionCell<Row>({
  row,
  rowAction
}: {
  row: Row;
  rowAction: DataTableRowAction<Row>;
}) {
  return (
    <td>
      <Button
        aria-label={rowAction.getLabel(row)}
        onClick={() => rowAction.onActivate(row)}
        variant="secondary"
      >
        {rowAction.renderLabel?.(row) ?? "Open"}
      </Button>
    </td>
  );
}

export function DataTable<Row>({
  columns,
  density = "standard",
  emptyState,
  rowAction,
  rowKey,
  rows,
  selection
}: DataTableProps<Row>) {
  const summary = getSelectionSummary({ rowKey, rows, selection });

  if (rows.length === 0) {
    return <div className="uz-data-table__empty">{emptyState}</div>;
  }

  return (
    <div className={cx("uz-data-table", `uz-data-table--${density}`)}>
      <table>
        <DataTableColGroup
          columns={columns}
          rowAction={rowAction}
          selection={selection}
        />
        <DataTableHeader
          columns={columns}
          rowAction={rowAction}
          selection={selection}
          summary={summary}
        />
        <tbody>
          {rows.map((row, index) => (
            <DataTableBodyRow
              columns={columns}
              index={index}
              key={rowKey(row)}
              row={row}
              rowAction={rowAction}
              rowId={rowKey(row)}
              selection={selection}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

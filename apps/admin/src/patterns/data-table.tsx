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

export function DataTable<Row>({
  columns,
  density = "standard",
  emptyState,
  rowAction,
  rowKey,
  rows,
  selection
}: DataTableProps<Row>) {
  const allSelected =
    !!selection && rows.length > 0 && rows.every((row) => selection.selectedKeys.has(rowKey(row)));
  const someSelected =
    !!selection && rows.some((row) => selection.selectedKeys.has(rowKey(row)));

  if (rows.length === 0) {
    return <div className="uz-data-table__empty">{emptyState}</div>;
  }

  return (
    <div className={cx("uz-data-table", `uz-data-table--${density}`)}>
      <table>
        <colgroup>
          {selection ? <col className="uz-data-table__select-col" /> : null}
          {columns.map((column) => (
            <col key={column.key} style={column.width ? { width: column.width } : undefined} />
          ))}
          {rowAction ? <col className="uz-data-table__action-col" /> : null}
        </colgroup>
        <thead>
          <tr>
            {selection ? (
              <th scope="col">
                <Checkbox
                  aria-label={
                    selection.onToggleAll
                      ? "Select all rows"
                      : "Select all rows unavailable"
                  }
                  checked={allSelected}
                  disabled={!selection.onToggleAll}
                  indeterminate={!allSelected && someSelected}
                  onClick={() => selection.onToggleAll?.()}
                />
              </th>
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
        <tbody>
          {rows.map((row, index) => {
            const key = rowKey(row);
            return (
              <tr key={key}>
                {selection ? (
                  <td>
                    <Checkbox
                      aria-label={selection.getLabel?.(row) ?? "Select row"}
                      checked={selection.selectedKeys.has(key)}
                      onClick={(event) => {
                        event.stopPropagation();
                        selection.onToggle(key, row);
                      }}
                    />
                  </td>
                ) : null}
                {columns.map((column) => (
                  <td className={cx(column.align && `is-${column.align}`)} key={column.key}>
                    {column.render(row, index)}
                  </td>
                ))}
                {rowAction ? (
                  <td>
                    <Button
                      aria-label={rowAction.getLabel(row)}
                      onClick={() => rowAction.onActivate(row)}
                      variant="secondary"
                    >
                      {rowAction.renderLabel?.(row) ?? "Open"}
                    </Button>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

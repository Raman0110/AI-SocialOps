import { Table } from "antd";
import type { TableProps } from "antd";
import type { KeyboardEvent, ReactNode } from "react";
import { SkeletonRows } from "./Skeleton";

interface DataTableProps<T> extends Omit<TableProps<T>, "rowKey" | "dataSource" | "locale"> {
  rows: T[];
  rowId: (row: T) => string;
  selectedId?: string | null;
  onSelect?: (row: T) => void;
  loading?: boolean;
  empty?: ReactNode;
}

/**
 * Antd table with the app defaults: inset header pinned inside its own scroll container, 40-44px rows,
 * hover + selected states, and keyboard selection (Enter / Space).
 */
export function DataTable<T extends object>({
  rows,
  rowId,
  selectedId,
  onSelect,
  loading,
  empty,
  columns,
  ...rest
}: DataTableProps<T>) {
  if (loading) {
    return <SkeletonRows rows={5} columns={Math.min(columns?.length ?? 4, 5)} />;
  }

  return (
    <div className="data-table h-full overflow-auto">
    <Table<T>
      size="small"
      pagination={false}
      {...rest}
      columns={columns}
      dataSource={rows}
      rowKey={rowId}
      locale={{ emptyText: empty ?? "Nothing to show." }}
      rowClassName={(row) => (selectedId && rowId(row) === selectedId ? "row-selected" : "")}
      onRow={(row) => ({
        onClick: () => onSelect?.(row),
        tabIndex: onSelect ? 0 : undefined,
        "aria-selected": selectedId ? rowId(row) === selectedId : undefined,
        onKeyDown: (event: KeyboardEvent) => {
          if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            onSelect?.(row);
          }
        },
      })}
    />
    </div>
  );
}

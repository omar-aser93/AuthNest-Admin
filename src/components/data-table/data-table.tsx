import { useTranslation } from "react-i18next";
import type { ColumnDef, RowData, SortingState } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableSkeleton } from "./data-table-skeleton";
import { useAppTable, tableFeaturesConfig } from "./create-table-hook";

interface Props<TData extends RowData> {
  columns: ColumnDef<typeof tableFeaturesConfig, TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
  tableKey: string;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
}


// Dumb table shell. No URL awareness, no navigation, no sorting logic.
// Features compose it and supply their own columns, toolbar, and pagination.
export function DataTable<TData extends RowData>({ columns, data, isLoading, emptyMessage, tableKey, sorting, onSortingChange }: Props<TData>) {
  const { t } = useTranslation();

  const table = useAppTable({
    key: tableKey,
    columns: columns as ColumnDef<typeof tableFeaturesConfig, RowData, unknown>[],
    data: data as RowData[],
    state: { sorting },
    manualSorting: true,
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting ?? []) : updater;
      onSortingChange?.(next);
    },
  });

  if (isLoading) return <DataTableSkeleton columnCount={columns.length} />;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage ?? t("common.noResults")}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
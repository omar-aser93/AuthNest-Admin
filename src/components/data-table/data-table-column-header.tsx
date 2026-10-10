import { useTranslation } from "react-i18next";
import type { Column, RowData } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { tableFeaturesConfig } from "./create-table-hook";

// Generic over TData and TValue so TS infers the concrete types from the
// passed column at each call site. TData must extend RowData because that's the constraint TanStack Table places on the row type.
interface Props<TData extends RowData, TValue> {
  column: Column<typeof tableFeaturesConfig, TData, TValue>;
  label: string;
}

export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  label,
}: Props<TData, TValue>) {
  const { t } = useTranslation();
  const sorted = column.getIsSorted();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="-ms-3 h-8" />}>
        {label}
        {sorted === "asc" ? (
          <ArrowUp className="ms-2 size-4" />
        ) : sorted === "desc" ? (
          <ArrowDown className="ms-2 size-4" />
        ) : (
          <ArrowUpDown className="ms-2 size-4 opacity-50" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
          {t("pagination.sort.asc")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
          {t("pagination.sort.desc")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
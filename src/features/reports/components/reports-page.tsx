// import { useQuery } from "@tanstack/react-query";
// import { useTranslation } from "react-i18next";
// import { useNavigate, getRouteApi } from "@tanstack/react-router";
// import type { SortingState } from "@tanstack/react-table";
// import { reportsQueryOptions } from "../api";
// import { useReportsColumns } from "./reports-columns";
// import { useGroupedReportsColumns } from "./grouped-reports-columns";
// import { ReportsToolbar } from "./reports-toolbar";
// import { DataTable } from "@/components/data-table/data-table";
// import { DataTablePagination } from "@/components/data-table/data-table-pagination";

// const routeApi = getRouteApi("/_dashboard/reports");


// // REPORTS PAGE - contains the list of reports
// export function ReportsPage() {
//   const { t } = useTranslation();
//   const navigate = useNavigate();
//   const search = routeApi.useSearch();
//   const isGrouped = search.groupBy === "target";

//   // Both hooks must be called unconditionally — hooks rules.
//   const flatColumns = useReportsColumns();
//   const groupedColumns = useGroupedReportsColumns();
//   const columns = isGrouped ? groupedColumns : flatColumns;

//   const { data, isLoading, isFetching } = useQuery(reportsQueryOptions(search));

//   const page = search.page ?? 1;
//   const pageSize = search.limit ?? 20;

//   // Type-narrow the response
//   const rows = isGrouped
//     ? ("groups" in (data ?? {}) ? (data as any).groups : [])
//     : ("reports" in (data ?? {}) ? (data as any).reports : []);

//   const sorting: SortingState = [
//     { id: search.sort ?? "createdAt", desc: (search.order ?? "desc") === "desc" },
//   ];

//   return (
//     <section className="flex flex-col gap-4">
//       <div>
//         <h1 className="text-2xl font-semibold">{t("reports.title")}</h1>
//         <p className="text-sm text-muted-foreground">{t("reports.subtitle")}</p>
//       </div>

//       <ReportsToolbar />

//       <DataTable
//         tableKey={isGrouped ? "reports-grouped-table" : "reports-table"}
//         columns={columns as never}
//         data={rows}
//         isLoading={isLoading}
//         emptyMessage={t("reports.empty")}
//         sorting={sorting}
//         onSortingChange={([first]) =>
//           navigate({
//             to: ".",
//             search: (prev) => ({
//               ...prev,
//               sort: (first?.id ?? "createdAt") as "createdAt" | "status",
//               order: (first?.desc ? "desc" : "asc") as "asc" | "desc",
//               page: 1,
//             }),
//           })
//         }
//       />

//       <DataTablePagination
//         page={page}
//         pageSize={pageSize}
//         totalPages={(data as any)?.totalPages ?? 1}
//         isFetching={isFetching}
//         onPageChange={(next) => navigate({ to: ".", search: (prev) => ({ ...prev, page: next }) })}
//         onPageSizeChange={(size) => navigate({ to: ".", search: (prev) => ({ ...prev, limit: size, page: 1 }) })}
//       />
//     </section>
//   );
// }


"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate, getRouteApi } from "@tanstack/react-router";
import type { SortingState } from "@tanstack/react-table";
import { reportsQueryOptions } from "../api";
import { useReportsColumns } from "./reports-columns";
import { useGroupedReportsColumns } from "./grouped-reports-columns";
import { ReportsToolbar } from "./reports-toolbar";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import type { GroupedReportsListResponse, ReportsListResponse } from "../types";

const routeApi = getRouteApi("/_dashboard/reports");


// REPORTS PAGE - contains the list of reports
export function ReportsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const search = routeApi.useSearch();
  const isGrouped = search.groupBy === "target";

  const { data, isLoading, isFetching } = useQuery(reportsQueryOptions(search));

  const page = search.page ?? 1;
  const pageSize = search.limit ?? 20;

  const sorting: SortingState = [
    { id: search.sort ?? "createdAt", desc: (search.order ?? "desc") === "desc" },
  ];

  const onSortingChange = (next: SortingState) => {
    const [first] = next;
    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        sort: (first?.id ?? "createdAt") as "createdAt" | "status",
        order: (first?.desc ? "desc" : "asc") as "asc" | "desc",
        page: 1,
      }),
    });
  };

  const totalPages = data?.totalPages ?? 1;

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{t("reports.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("reports.subtitle")}</p>
      </div>

      <ReportsToolbar />

      {/* Two separate DataTable branches so each column set gets its own
          typed generic. Avoids `as never` / `as any` casts entirely. */}
      {isGrouped ? (
        <GroupedTable
          data={data as GroupedReportsListResponse | undefined}
          isLoading={isLoading}
          sorting={sorting}
          onSortingChange={onSortingChange}
        />
      ) : (
        <FlatTable
          data={data as ReportsListResponse | undefined}
          isLoading={isLoading}
          sorting={sorting}
          onSortingChange={onSortingChange}
        />
      )}

      <DataTablePagination
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        isFetching={isFetching}
        onPageChange={(next) => navigate({ to: ".", search: (prev) => ({ ...prev, page: next }) })}
        onPageSizeChange={(size) => navigate({ to: ".", search: (prev) => ({ ...prev, limit: size, page: 1 }) })}
      />
    </section>
  );
}

// ─── Flat table (one row per report) ─────────────────────────────────────────
function FlatTable({
  data,
  isLoading,
  sorting,
  onSortingChange,
}: {
  data: ReportsListResponse | undefined;
  isLoading: boolean;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
}) {
  const { t } = useTranslation();
  const columns = useReportsColumns();

  return (
    <DataTable
      tableKey="reports-table"
      columns={columns}
      data={data?.reports ?? []}
      isLoading={isLoading}
      emptyMessage={t("reports.empty")}
      sorting={sorting}
      onSortingChange={onSortingChange}
    />
  );
}

// ─── Grouped table (one row per target) ──────────────────────────────────────
function GroupedTable({
  data,
  isLoading,
  sorting,
  onSortingChange,
}: {
  data: GroupedReportsListResponse | undefined;
  isLoading: boolean;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
}) {
  const { t } = useTranslation();
  const columns = useGroupedReportsColumns();

  return (
    <DataTable
      tableKey="reports-grouped-table"
      columns={columns}
      data={data?.groups ?? []}
      isLoading={isLoading}
      emptyMessage={t("reports.empty")}
      sorting={sorting}
      onSortingChange={onSortingChange}
    />
  );
}
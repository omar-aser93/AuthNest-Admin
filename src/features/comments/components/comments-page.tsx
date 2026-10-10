import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate, getRouteApi } from "@tanstack/react-router";
import type { SortingState } from "@tanstack/react-table";
import { commentsQueryOptions } from "../api";
import { useCommentsColumns } from "./comments-columns";
import { CommentsToolbar } from "./comments-toolbar";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";

const routeApi = getRouteApi("/_dashboard/comments");

// component to display the list of comments and pagination,...
export function CommentsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const search = routeApi.useSearch();
  const columns = useCommentsColumns();

  const { data, isLoading, isFetching } = useQuery(commentsQueryOptions(search));

  const page = search.page ?? 1;
  const pageSize = search.limit ?? 20;

  const sorting: SortingState = [
    { id: search.sort ?? "createdAt", desc: (search.order ?? "desc") === "desc" },
  ];

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{t("comments.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("comments.subtitle")}</p>
      </div>

      <CommentsToolbar />

      <DataTable
        tableKey="comments-table"
        columns={columns}
        data={data?.comments ?? []}
        isLoading={isLoading}
        emptyMessage={t("comments.empty")}
        sorting={sorting}
        onSortingChange={([first]) =>
          navigate({
            to: ".",
            search: (prev) => ({
              ...prev,
              sort: (first?.id ?? "createdAt") as "createdAt" | "reactionCount" | "replyCount",
              order: (first?.desc ? "desc" : "asc") as "asc" | "desc",
              page: 1,
            }),
          })
        }
      />

      <DataTablePagination
        page={page}
        pageSize={pageSize}
        totalPages={data?.totalPages ?? 1}
        isFetching={isFetching}
        onPageChange={(next) => navigate({ to: ".", search: (prev) => ({ ...prev, page: next }) })}
        onPageSizeChange={(size) => navigate({ to: ".", search: (prev) => ({ ...prev, limit: size, page: 1 }) })}
      />
    </section>
  );
}
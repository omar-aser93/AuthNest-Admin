import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate, getRouteApi } from "@tanstack/react-router";
import type { SortingState } from "@tanstack/react-table";
import { postsQueryOptions } from "../api";
import { usePostsColumns } from "./posts-columns";
import { PostsToolbar } from "./posts-toolbar";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";

const routeApi = getRouteApi("/_dashboard/posts");


// component to display the list of posts and pagination 
export function PostsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const search = routeApi.useSearch();
  const columns = usePostsColumns();

  const { data, isLoading, isFetching } = useQuery(postsQueryOptions(search));

  const page = search.page ?? 1;
  const pageSize = search.limit ?? 20;

  const sorting: SortingState = [
    { id: search.sort ?? "createdAt", desc: (search.order ?? "desc") === "desc" },
  ];

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{t("posts.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("posts.subtitle")}</p>
      </div>

      <PostsToolbar />

      <DataTable
        tableKey="posts-table"
        columns={columns}
        data={data?.posts ?? []}
        isLoading={isLoading}
        emptyMessage={t("posts.empty")}
        sorting={sorting}
        onSortingChange={([first]) =>
          navigate({
            to: ".",
            search: (prev) => ({
              ...prev,
              sort: (first?.id ?? "createdAt") as "createdAt" | "reactionCount" | "commentCount" | "shareCount",
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
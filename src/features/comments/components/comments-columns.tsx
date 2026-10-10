import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { createAppColumnHelper } from "@/components/data-table/create-table-hook";
import { CommentRowActions } from "./comment-row-actions";
import type { Comment } from "../types";

const col = createAppColumnHelper<Comment>();

// component to render table columns
export function useCommentsColumns() {
  const { t } = useTranslation();

  return col.columns([
    col.display({
      id: "author",
      header: t("comments.columns.author"),
      cell: ({ row }) => {
        const { user } = row.original;
        const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">{user.name ?? "—"}</span>
          </div>
        );
      },
    }),

    col.accessor("content", {
      header: t("comments.columns.content"),
      cell: (info) => (
        <span className="text-sm line-clamp-2 max-w-md">{info.getValue()}</span>
      ),
    }),

    col.display({
      id: "post",
      header: t("comments.columns.post"),
      cell: ({ row }) => {
        const { post } = row.original;
        return (
          <button
            type="button"
            onClick={() => window.open(`/posts/${post.id}`, "_blank")}
            className="text-sm text-start hover:underline line-clamp-1 max-w-xs"
          >
            {post.title || t("posts.untitled")}
          </button>
        );
      },
    }),

    col.accessor("reactionCount", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={t("comments.columns.reactions")} />
      ),
      cell: (info) => <span className="text-sm tabular-nums">{info.getValue()}</span>,
    }),

    col.accessor("replyCount", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={t("comments.columns.replies")} />
      ),
      cell: (info) => <span className="text-sm tabular-nums">{info.getValue()}</span>,
    }),

    col.accessor("createdAt", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={t("comments.columns.created")} />
      ),
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),

    col.display({
      id: "actions",
      header: "",
      cell: ({ row }) => <CommentRowActions comment={row.original} />,
    }),
  ]);
}
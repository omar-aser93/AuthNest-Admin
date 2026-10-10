import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { createAppColumnHelper } from "@/components/data-table/create-table-hook";
import { PostRowActions } from "./post-row-actions";
import type { Post } from "../types";

const col = createAppColumnHelper<Post>();

const PRIVACY_VARIANT: Record<Post["privacy"], "default" | "secondary" | "outline" | "destructive"> = {
  PUBLIC: "default",
  FRIENDS: "secondary",
  ONLY_ME: "outline",
  CUSTOM: "destructive",
};

// component to handle column definitions 
export function usePostsColumns() {
  const { t } = useTranslation();

  return col.columns([
    col.display({
      id: "author",
      header: t("posts.columns.author"),
      cell: ({ row }) => {
        const { author } = row.original;
        const initials = (author.name ?? author.email).slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarImage src={author.image ?? undefined} alt={author.name ?? ""} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">{author.name ?? "—"}</span>
          </div>
        );
      },
    }),

    col.accessor("title", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={t("posts.columns.title")} />
      ),
      cell: (info) => (
        <span className="text-sm font-medium line-clamp-1">
          {info.getValue() || t("posts.untitled")}
        </span>
      ),
    }),

    col.accessor("content", {
      header: t("posts.columns.excerpt"),
      cell: (info) => {
        const text = info.getValue();
        if (!text) return <span className="text-muted-foreground">—</span>;
        return <span className="text-sm text-muted-foreground line-clamp-1 max-w-xs">{text}</span>;
      },
    }),

    col.accessor("privacy", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={t("posts.columns.privacy")} />
      ),
      cell: (info) => (
        <Badge variant={PRIVACY_VARIANT[info.getValue()]}>
          {t(`posts.privacy.${info.getValue()}`)}
        </Badge>
      ),
    }),

    col.accessor("reactionCount", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={t("posts.columns.reactions")} />
      ),
      cell: (info) => <span className="text-sm tabular-nums">{info.getValue()}</span>,
    }),

    col.accessor("commentCount", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={t("posts.columns.comments")} />
      ),
      cell: (info) => <span className="text-sm tabular-nums">{info.getValue()}</span>,
    }),

    col.accessor("createdAt", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={t("posts.columns.created")} />
      ),
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),

    col.display({
      id: "actions",
      header: "",
      cell: ({ row }) => <PostRowActions post={row.original} />,
    }),
  ]);
}
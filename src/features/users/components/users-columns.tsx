import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { createAppColumnHelper } from "@/components/data-table/create-table-hook";
import { UserRowActions } from "./user-row-actions";
import type { User } from "../types";

// Pre-bound to the app's feature set — no need to thread `typeof features`.
const col = createAppColumnHelper<User>();


// component to handle column definitions 
export function useUsersColumns() {
  const { t } = useTranslation();

  return col.columns([
    col.accessor("name", {
      id: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={t("users.columns.name")} />
      ),
      cell: ({ row }) => {
        const u = row.original;
        const initials = (u.name ?? u.email).slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarImage src={u.image ?? undefined} alt={u.name ?? ""} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{u.name ?? "—"}</span>
            {u.bannedAt && (
              <Badge variant="destructive" className="text-[10px]">
                {t("users.banned")}
              </Badge>
            )}
          </div>
        );
      },
    }),

    col.accessor("email", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={t("users.columns.email")} />
      ),
    }),

    col.accessor("role", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={t("users.columns.role")} />
      ),
      cell: (info) => (
        <Badge variant={info.getValue() === "admin" ? "default" : "secondary"}>
          {t(`users.role.${info.getValue()}`)}
        </Badge>
      ),
    }),

    col.accessor("isEmailVerified", {
      header: t("users.columns.verified"),
      cell: (info) =>
        info.getValue() ? t("users.verified.yes") : t("users.verified.no"),
    }),

    col.accessor("createdAt", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={t("users.columns.joined")} />
      ),
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),

    col.display({
      id: "actions",
      header: "",
      cell: ({ row }) => <UserRowActions user={row.original} />,
    }),
  ]);
}
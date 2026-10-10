import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { createAppColumnHelper } from "@/components/data-table/create-table-hook";
import { ReportRowActions } from "./report-row-actions";
import type { Report, ReportReasonType, ReportStatusType, ReportTargetType } from "../types";

const col = createAppColumnHelper<Report>();

const TARGET_TYPE_VARIANT: Record<ReportTargetType, "default" | "secondary" | "outline"> = {
  POST: "default",
  COMMENT: "secondary",
  USER: "outline",
};

const STATUS_VARIANT: Record<ReportStatusType, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "default",
  REVIEWED: "secondary",
  ACTIONED: "destructive",
  DISMISSED: "outline",
};

const SERIOUS_REASONS = new Set<ReportReasonType>(["VIOLENCE", "HATE_SPEECH", "HARASSMENT"]);


// component that returns the columns for the reports table
export function useReportsColumns() {
  const { t } = useTranslation();

  return col.columns([
    col.accessor("targetType", {
      header: t("reports.columns.type"),
      cell: (info) => {
        const value = info.getValue();
        return (
          <Badge variant={TARGET_TYPE_VARIANT[value]}>
            {t(`reports.targetType.${value}`)}
          </Badge>
        );
      },
    }),

    col.display({
      id: "target",
      header: t("reports.columns.target"),
      cell: ({ row }) => {
        const target = row.original.target;
        if (!target) return <span className="text-muted-foreground">—</span>;
        if (target.deleted) {
          return (
            <span className="text-sm italic text-muted-foreground">
              {t("reports.targetDeleted")}
            </span>
          );
        }

        if (target.type === "POST") {
          return (
            <span className="text-sm font-medium line-clamp-1 max-w-md">
              {target.title || target.contentExcerpt || "—"}
            </span>
          );
        }
        if (target.type === "COMMENT") {
          return (
            <span className="text-sm text-muted-foreground line-clamp-1 max-w-md">
              {target.contentExcerpt || "—"}
            </span>
          );
        }
        // USER
        const initials = (target.name ?? target.email ?? "?").slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage src={target.image ?? undefined} alt={target.name ?? ""} />
              <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{target.name ?? target.email ?? "—"}</span>
          </div>
        );
      },
    }),

    col.display({
      id: "reporter",
      header: t("reports.columns.reporter"),
      cell: ({ row }) => {
        const { reporter } = row.original;
        const initials = (reporter.name ?? reporter.email).slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage src={reporter.image ?? undefined} alt={reporter.name ?? ""} />
              <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{reporter.name ?? reporter.email}</span>
          </div>
        );
      },
    }),

    col.accessor("reason", {
      header: t("reports.columns.reason"),
      cell: (info) => {
        const reason = info.getValue();
        return (
          <Badge variant={SERIOUS_REASONS.has(reason) ? "destructive" : "secondary"}>
            {t(`reports.reason.${reason}`)}
          </Badge>
        );
      },
    }),

    col.accessor("status", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={t("reports.columns.status")} />
      ),
      cell: (info) => {
        const status = info.getValue();
        return (
          <Badge variant={STATUS_VARIANT[status]}>
            {t(`reports.status.${status}`)}
          </Badge>
        );
      },
    }),

    col.accessor("createdAt", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={t("reports.columns.created")} />
      ),
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),

    col.display({
      id: "actions",
      header: "",
      cell: ({ row }) => <ReportRowActions report={row.original} />,
    }),
  ]);
}
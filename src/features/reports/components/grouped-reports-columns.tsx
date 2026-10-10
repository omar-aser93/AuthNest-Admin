import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { createAppColumnHelper } from "@/components/data-table/create-table-hook";
import { ReportRowActions } from "./report-row-actions";
import type { GroupedReport, ReportTargetType } from "../types";

const col = createAppColumnHelper<GroupedReport>();

const TARGET_TYPE_VARIANT: Record<ReportTargetType, "default" | "secondary" | "outline"> = {
  POST: "default",
  COMMENT: "secondary",
  USER: "outline",
};

export function useGroupedReportsColumns() {
  const { t } = useTranslation();

  return col.columns([
    col.accessor("targetType", {
      header: t("reports.columns.type"),
      cell: (info) => (
        <Badge variant={TARGET_TYPE_VARIANT[info.getValue()]}>
          {t(`reports.targetType.${info.getValue()}`)}
        </Badge>
      ),
    }),

    col.display({
      id: "target",
      header: t("reports.columns.target"),
      cell: ({ row }) => {
        const { latestReport } = row.original;
        const target = latestReport.target;
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

    // The whole point of grouped mode — one row, N reports.
    col.accessor("reportCount", {
      header: t("reports.columns.reportCount"),
      cell: (info) => (
        <Badge variant="secondary" className="tabular-nums">
          {info.getValue()}
        </Badge>
      ),
    }),

    col.display({
      id: "latestReason",
      header: t("reports.columns.latestReason"),
      cell: ({ row }) => (
        <Badge variant="outline">
          {t(`reports.reason.${row.original.latestReport.reason}`)}
        </Badge>
      ),
    }),

    col.accessor("firstReportedAt", {
      header: t("reports.columns.firstReported"),
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),

    col.display({
      id: "actions",
      header: "",
      cell: ({ row }) => <ReportRowActions report={row.original.latestReport} />,
    }),
  ]);
}
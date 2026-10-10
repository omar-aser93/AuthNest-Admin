import { useTranslation } from "react-i18next";
import { useNavigate, getRouteApi } from "@tanstack/react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

const routeApi = getRouteApi("/_dashboard/reports");


// component to display the status & type filters
export function ReportsToolbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const search = routeApi.useSearch();

  const handleStatusChange = (value: string | null) => {
    if (!value) return;
    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        status: value === "all" ? undefined : (value as never),
        page: 1,
      }),
    });
  };

  const handleTypeChange = (value: string | null) => {
    if (!value) return;
    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        targetType: value === "all" ? undefined : (value as never),
        page: 1,
      }),
    });
  };


  const isGrouped = search.groupBy === "target";

  const toggleGrouping = () => {
    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        groupBy: isGrouped ? "flat" : "target",
        page: 1,
      }),
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <Select value={search.status ?? "all"} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-40 h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("reports.filter.statusAll")}</SelectItem>
          <SelectItem value="PENDING">{t("reports.status.PENDING")}</SelectItem>
          <SelectItem value="REVIEWED">{t("reports.status.REVIEWED")}</SelectItem>
          <SelectItem value="ACTIONED">{t("reports.status.ACTIONED")}</SelectItem>
          <SelectItem value="DISMISSED">{t("reports.status.DISMISSED")}</SelectItem>
        </SelectContent>
      </Select>

      <Select value={search.targetType ?? "all"} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-40 h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("reports.filter.typeAll")}</SelectItem>
          <SelectItem value="POST">{t("reports.targetType.POST")}</SelectItem>
          <SelectItem value="COMMENT">{t("reports.targetType.COMMENT")}</SelectItem>
          <SelectItem value="USER">{t("reports.targetType.USER")}</SelectItem>
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant={isGrouped ? "default" : "outline"}
        size="sm"
        className="h-9 gap-2 ms-auto"
        onClick={toggleGrouping}
        title={t("reports.groupByTarget")}
      >
        {isGrouped ? <LayoutGrid className="size-4" /> : <List className="size-4" />}
        {isGrouped ? t("reports.grouped") : t("reports.flat")}
      </Button>
    </div>
  );
}
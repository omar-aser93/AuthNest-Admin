import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface Props {
  page: number;                 // 1-based
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isFetching?: boolean;
}

const PAGE_SIZES = [10, 20, 50] as const;


// Pagination component for data tables
export function DataTablePagination({ page, pageSize, totalPages, onPageChange, onPageSizeChange, isFetching }: Props) {
  const { t } = useTranslation();

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Left — page indicator + refreshing marker */}
      <div className="text-sm text-muted-foreground">
        {t("pagination.page", { current: page, total: totalPages || 1 })}
        {isFetching && <span className="ms-2">…</span>}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("pagination.rowsPerPage")}</span>
          <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
            <SelectTrigger className="h-8 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prev / next controls */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="size-8"
            onClick={() => onPageChange(1)}
            disabled={!canPrev}>
            <ChevronsLeft className="size-4 rtl:rotate-180" />
          </Button>
          <Button variant="outline" size="icon" className="size-8"
            onClick={() => onPageChange(page - 1)}
            disabled={!canPrev}>
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </Button>
          <Button variant="outline" size="icon" className="size-8"
            onClick={() => onPageChange(page + 1)}
            disabled={!canNext}>
            <ChevronRight className="size-4 rtl:rotate-180" />
          </Button>
          <Button variant="outline" size="icon" className="size-8"
            onClick={() => onPageChange(totalPages)}
            disabled={!canNext}>
            <ChevronsRight className="size-4 rtl:rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}
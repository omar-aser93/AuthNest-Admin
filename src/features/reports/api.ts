import { queryOptions, keepPreviousData, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Report, ReportsListResponse, GroupedReportsListResponse, ReportsSearch, ReportStatusType } from "./types";

// ─── Query keys ──────────────────────────────────────────────────────────────
export const reportsKeys = {
  all: ["admin", "reports"] as const,
  list: (filters: ReportsSearch) => [...reportsKeys.all, "list", filters] as const,
};

// Union return type — consumers narrow on `"groups" in data`.
export type ReportsQueryData = ReportsListResponse | GroupedReportsListResponse;


// ─── Fetch list ──────────────────────────────────────────────────────────────
async function fetchReports(filters: ReportsSearch): Promise<ReportsQueryData> {
  const params = new URLSearchParams();
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.targetType && filters.targetType !== "all") params.set("targetType", filters.targetType);
  params.set("sort", filters.sort);
  params.set("order", filters.order);
  if (filters.groupBy === "target") params.set("groupBy", "target");

  const res = await api.get(`/admin/reports?${params.toString()}`);
  return res.data;
}

export const reportsQueryOptions = (filters: ReportsSearch) =>
  queryOptions({
    queryKey: reportsKeys.list(filters),
    queryFn: () => fetchReports(filters),
    placeholderData: keepPreviousData,
  });


// ---- Update report ─────────────────────────────────────────────────────────
async function updateReportRequest({
  id,
  status,
  resolutionNote,
}: {
  id: string;
  status: ReportStatusType;
  resolutionNote?: string;
}): Promise<Report> {
  const res = await api.patch(`/admin/reports/${id}`, { status, resolutionNote });
  return res.data;
}

export function useUpdateReport() {
  return useMutation({ mutationFn: updateReportRequest });
}
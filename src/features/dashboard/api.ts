import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { StatsOverview, StatsTimeseries, ReportsBreakdownResponse, RecentActivityResponse } from "./types";

// ─── Query keys ──────────────────────────────────────────────────────────────
export const statsKeys = {
  all: ["admin", "stats"] as const,
  overview: () => [...statsKeys.all, "overview"] as const,
  timeseries: (range: string) => [...statsKeys.all, "timeseries", range] as const,
  reportsBreakdown: () => [...statsKeys.all, "reports-breakdown"] as const,
  recentActivity: () => [...statsKeys.all, "recent-activity"] as const,
};


// ─── Overview ────────────────────────────────────────────────────────────────
async function fetchOverview(): Promise<StatsOverview> {
  const res = await api.get("/admin/stats/overview");
  return res.data;
}

export const overviewQueryOptions = queryOptions({
  queryKey: statsKeys.overview(),
  queryFn: fetchOverview,
  staleTime: 60_000,           // dashboard stats are fine to be a minute old
});

// ─── Timeseries ──────────────────────────────────────────────────────────────
async function fetchTimeseries(range: string): Promise<StatsTimeseries> {
  const res = await api.get(`/admin/stats/timeseries?range=${range}`);
  return res.data;
}

export const timeseriesQueryOptions = (range = "30d") =>
  queryOptions({
    queryKey: statsKeys.timeseries(range),
    queryFn: () => fetchTimeseries(range),
    staleTime: 60_000,
  });

// ─── Reports breakdown ───────────────────────────────────────────────────────
async function fetchReportsBreakdown(): Promise<ReportsBreakdownResponse> {
  const res = await api.get("/admin/stats/reports-breakdown");
  return res.data;
}

export const reportsBreakdownQueryOptions = queryOptions({
  queryKey: statsKeys.reportsBreakdown(),
  queryFn: fetchReportsBreakdown,
  staleTime: 60_000,
});


// ─── Recent activity ───────────────────────────────────────────────────────
async function fetchRecentActivity(): Promise<RecentActivityResponse> {
  const res = await api.get("/admin/stats/recent-activity?limit=15");
  return res.data;
}

export const recentActivityQueryOptions = queryOptions({
  queryKey: statsKeys.recentActivity(),
  queryFn: fetchRecentActivity,
  staleTime: 30_000,   // shorter than other stats — activity is more time-sensitive
});
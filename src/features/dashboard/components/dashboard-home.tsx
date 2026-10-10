"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Users, FileText, MessageSquare, Flag } from "lucide-react";
import { overviewQueryOptions, timeseriesQueryOptions, reportsBreakdownQueryOptions, recentActivityQueryOptions} from "../api";
import { StatCard } from "./stat-card";
import { SignupsChart } from "./signups-chart";
import { ContentChart } from "./content-chart";
import { ReportsBreakdown } from "./reports-breakdown";
import { useState } from "react";
import { RangeSelector, type TimeRange } from "./range-selector";
import { RecentActivity } from "./recent-activity";


// DASHBOARD HOME page - it contains all the stats and charts
export function DashboardHome() {
  const { t } = useTranslation();
  const [range, setRange] = useState<TimeRange>("30d");
  const timeseries = useQuery(timeseriesQueryOptions(range));
  const overview  = useQuery(overviewQueryOptions);  
  const breakdown = useQuery(reportsBreakdownQueryOptions);
  const pending = overview.data?.reports.pending ?? 0;
  const activity = useQuery(recentActivityQueryOptions);

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("dashboard.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("dashboard.stats.users")}
          value={overview.data?.users.total ?? 0}
          hint={overview.data ? `+${overview.data.users.newThisWeek} ${t("dashboard.thisWeek")}` : undefined}
          icon={Users}
        />
        <StatCard
          label={t("dashboard.stats.posts")}
          value={overview.data?.posts.total ?? 0}
          hint={overview.data ? `+${overview.data.posts.newThisWeek} ${t("dashboard.thisWeek")}` : undefined}
          icon={FileText}
        />
        <StatCard
          label={t("dashboard.stats.comments")}
          value={overview.data?.comments.total ?? 0}
          hint={overview.data ? `+${overview.data.comments.newThisWeek} ${t("dashboard.thisWeek")}` : undefined}
          icon={MessageSquare}
        />
        <StatCard
          label={t("dashboard.stats.pendingReports")}
          value={pending}
          hint={pending > 0 ? t("dashboard.needsAttention") : t("dashboard.allClear")}
          icon={Flag}
        />
      </div>

      {/* Charts */}      
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            {t("dashboard.range.label")}
          </h2>
          <RangeSelector value={range} onChange={setRange} />
        </div>
        <SignupsChart data={timeseries.data?.users ?? []} />
        <ContentChart
          posts={timeseries.data?.posts ?? []}
          comments={timeseries.data?.comments ?? []}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
      <ReportsBreakdown data={breakdown.data?.reasons ?? []} />
      <RecentActivity items={activity.data?.activities ?? []} />
    </div>
    </section>
  );
}
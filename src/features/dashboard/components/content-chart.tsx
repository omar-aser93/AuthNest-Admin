"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig,} from "@/components/ui/chart";
import type { TimeseriesPoint } from "../types";

interface Props {
  posts: TimeseriesPoint[];
  comments: TimeseriesPoint[];
}

// CONTENT CHART COMPONENT (BOTH POSTS AND COMMENTS)
export function ContentChart({ posts, comments }: Props) {
  const { t } = useTranslation();

  // Merge the two series on `date` so a single chart can render both lines.
  const data = useMemo(() => {
    const map = new Map<string, { date: string; posts: number; comments: number }>();
    for (const p of posts) map.set(p.date, { date: p.date, posts: p.count, comments: 0 });
    for (const c of comments) {
      const existing = map.get(c.date);
      if (existing) existing.comments = c.count;
      else map.set(c.date, { date: c.date, posts: 0, comments: c.count });
    }
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [posts, comments]);

  const chartConfig = {
    posts:    { label: t("dashboard.series.posts"),    color: "hsl(var(--chart-1))" },
    comments: { label: t("dashboard.series.comments"), color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.charts.content")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-62.5 w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillPosts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-posts)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-posts)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillComments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-comments)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-comments)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} width={30} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="posts"
              type="monotone"
              fill="url(#fillPosts)"
              stroke="var(--color-posts)"
              strokeWidth={2}
            />
            <Area
              dataKey="comments"
              type="monotone"
              fill="url(#fillComments)"
              stroke="var(--color-comments)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
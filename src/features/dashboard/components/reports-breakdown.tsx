"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,} from "@/components/ui/chart";
import type { ReportsBreakdownResponse } from "../types";


// REPORTS BREAKDOWN COMPONENT
export function ReportsBreakdown({ data }: { data: ReportsBreakdownResponse["reasons"] }) {
  const { t } = useTranslation();

  // Translate reason codes to localized labels for the Y axis.
  const chartData = useMemo(
    () => data.map((d) => ({ reason: t(`reports.reason.${d.reason}`), count: d.count })),
    [data, t],
  );

  const chartConfig = {
    count: {
      label: t("dashboard.series.reports"),
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.charts.reportsByReason")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-75 w-full">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 12, top: 8, bottom: 8 }} >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="reason" tickLine={false} axisLine={false} width={90} tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
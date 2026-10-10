"use client";

import { Button } from "@/components/ui/button";

export type TimeRange = "7d" | "30d" | "90d";

const RANGES: TimeRange[] = ["7d", "30d", "90d"];

// RANGE SELECTOR to select a time range
export function RangeSelector({ value, onChange }: { value: TimeRange; onChange: (v: TimeRange) => void; }) {
  return (
    <div className="inline-flex items-center rounded-lg border bg-muted/40 p-1 gap-0.5">
      {RANGES.map((r) => (
        <Button
          key={r}
          type="button"
          variant={value === r ? "default" : "ghost"}
          size="sm"
          className="h-7 px-3 text-xs"
          onClick={() => onChange(r)}
        >
          {r}
        </Button>
      ))}
    </div>
  );
}
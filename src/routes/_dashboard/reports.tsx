import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/features/reports/components/reports-page";
import { reportsSearchSchema } from "@/features/reports/schemas";

// register this file as the handler for the "/reports" URL
export const Route = createFileRoute("/_dashboard/reports")({
  validateSearch: reportsSearchSchema,
  component: ReportsPage,
});
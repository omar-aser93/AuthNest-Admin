import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

// this is the layout handler for all _dashboard routes
export const Route = createFileRoute("/_dashboard")({
  component: DashboardLayout,
});


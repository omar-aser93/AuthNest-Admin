import { createFileRoute } from "@tanstack/react-router";
import { DashboardHome } from "@/features/dashboard/components/dashboard-home";

// register this file as the handler for the "/"" URL , Calling it <Link to="/">
// Note: /_dashboard is just a Route ID (internal) as we used group routing -> pathless layout routes
export const Route = createFileRoute("/_dashboard/")({
  component: DashboardHome,
});


// __root is the wrapper around every page in your app. Everything renders inside it.

import { createRootRouteWithContext, redirect, Outlet } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { currentUserQueryOptions } from "@/features/auth/api"
import { NotFoundPage } from "@/components/layout/not-found-page";

// context type
interface RouterContext {
  queryClient: QueryClient;
}

// creates the root route
export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,            // Wraps all the routes (children)
  notFoundComponent: NotFoundPage,        // ← catches every unmatched route
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.query(currentUserQueryOptions);  // Get the current user
    const isLoginPage = location.pathname === "/login";                     // Get if current page path name is /login  

    // ── On the login page ────────────────────────────────────────────────
    if (isLoginPage) {
      // Already signed in as an admin → skip straight to the dashboard
      if (user?.role === "admin") throw redirect({ to: "/" }); 
      // Anyone else (guest, or non-admin user) → let them see the login form
      return { user };
    }

    // ── On any other page that requires a signed-in admin (protected routes) ──────────────────────────
    if (!user || user.role !== "admin") {
      throw redirect({ to: "/login" });        // Redirect to login
    }

    return { user };        // return the user 
  },
});
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import "./index.css";
import "@/lib/i18n";
import { bootstrapCsrf } from "./lib/api";
import { Toaster } from "@/components/ui/toast";
import { ThemeProvider } from "./components/theme/theme-provider";
import { DefaultPending } from "./components/layout/default-pending";

// 1. Create the QueryClient outside the component — survives HMR
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

// 2. Pass it as context so route loaders can access it + 
const router = createRouter({ routeTree, context: { queryClient }, defaultPendingComponent: DefaultPending });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// 3. Bootstrap CSRF before first render so mutations work immediately. 
// `.finally` means we render even if the bootstrap fails — the app shouldn't be blocked by a CSRF fetch that will resolve on retry.
bootstrapCsrf().finally(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <StrictMode>
      {/* Wrap RouterProvider with ThemeProvider & QueryClientProvider, so theme & useQuery work in components */}
      <ThemeProvider defaultTheme="system" storageKey="authnest-admin-theme">
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>,
  );
});

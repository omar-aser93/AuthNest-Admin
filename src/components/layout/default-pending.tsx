import { Loader2 } from "lucide-react";

// a default pending/loading component
export function DefaultPending() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
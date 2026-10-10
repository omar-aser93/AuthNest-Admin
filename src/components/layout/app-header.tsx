import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { GlobalSearch } from "@/features/search/components/global-search";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      {/* Sidebar toggle (mobile + desktop collapse) */}
      <SidebarTrigger className="-ms-1" />
      <Separator orientation="vertical" className="m-2" />

      {/* Search — command palette ctrl+k */}
      <GlobalSearch />

      {/* Right side — language + theme */}
      <div className="ms-auto flex items-center gap-2">
        <LanguageSwitcher />
        <ModeToggle />
      </div>
    </header>
  );
}
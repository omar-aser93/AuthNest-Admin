"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Search, LayoutDashboard, Users, FileText, MessageSquare, Flag, User as UserIcon } from "lucide-react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator} from "@/components/ui/command";
import { useGlobalSearch } from "../use-global-search";
import type { NavCommand, SearchResult } from "../types";

const TYPE_ICON: Record<SearchResult["type"], typeof UserIcon> = {
  user: UserIcon,
  post: FileText,
  comment: MessageSquare,
};

const NAV_ICON = {
  dashboard: LayoutDashboard,
  users: Users,
  posts: FileText,
  comments: MessageSquare,
  reports: Flag,
};

export function GlobalSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { results, isSearching } = useGlobalSearch(query);

  const navCommands: NavCommand[] = [
    { label: t("nav.dashboard"), keywords: ["home", "overview"], icon: "dashboard", href: "/" },
    { label: t("nav.users"),     keywords: ["people", "members"], icon: "users",    href: "/users",    search: { page: 1, limit: 20, sort: "createdAt", order: "desc" } },
    { label: t("nav.posts"),     keywords: ["feed", "content"],   icon: "posts",    href: "/posts",    search: { page: 1, limit: 20, sort: "createdAt", order: "desc" } },
    { label: t("nav.comments"),  keywords: ["replies"],           icon: "comments", href: "/comments", search: { page: 1, limit: 20, sort: "createdAt", order: "desc" } },
    { label: t("nav.reports"),   keywords: ["moderation", "flag"], icon: "reports", href: "/reports",  search: { page: 1, limit: 20, sort: "createdAt", order: "desc" } },
  ];

  // ⌘K / Ctrl+K opens the palette from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // handle open change
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");   // reset in the event handler, not an effect
  };

  // Close first, then navigate — avoids the router unmount racing the dialog.
  const runCommand = (fn: () => void) => {
    setOpen(false);
    // Let Radix finish the close animation before the route changes.
    setTimeout(fn, 0);
  };

  // Group results by type so the palette shows Users → Posts → Comments.
  const grouped = results.reduce((acc, r) => {
    (acc[r.type] ??= []).push(r);
    return acc;
  }, {} as Record<SearchResult["type"], SearchResult[]>);

  return (
    <>
      {/* Trigger — looks like an input, opens the palette */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex-1 max-w-md h-9 flex items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground hover:bg-accent/50 transition-colors text-start"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 truncate">{t("common.searchPlaceholder")}</span>
        <kbd className="pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={handleOpenChange} shouldFilter={false}>
        <CommandInput
          placeholder={t("common.searchPlaceholder")}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {query.trim().length < 2
              ? t("search.typeToSearch")
              : isSearching
              ? t("common.loading")
              : t("common.noResults")}
          </CommandEmpty>

          {/* Navigation commands — always visible */}
          <CommandGroup heading={t("search.groups.navigation")}>
            {navCommands.map((cmd) => {
              const Icon = NAV_ICON[cmd.icon];
              return (
                <CommandItem
                  key={cmd.href}
                  value={`nav-${cmd.href}`}
                  keywords={cmd.keywords}
                  onSelect={() =>
                    runCommand(() =>
                      navigate({ to: cmd.href as never, search: cmd.search as never }),
                    )
                  }
                >
                  <Icon className="size-4 me-2" />
                  {cmd.label}
                </CommandItem>
              );
            })}
          </CommandGroup>

          {/* Results per type */}
          {(["user", "post", "comment"] as const).map((type) => {
            const list = grouped[type];
            if (!list?.length) return null;
            const Icon = TYPE_ICON[type];
            return (
              <div key={type}>
                <CommandSeparator />
                <CommandGroup heading={t(`search.groups.${type}`)}>
                  {list.map((r) => (
                    <CommandItem
                      key={`${r.type}-${r.id}`}
                      value={`${r.type}-${r.id}`}
                      onSelect={() =>
                        runCommand(() =>
                          navigate({ to: r.href as never, search: r.params as never }),
                        )
                      }
                    >
                      <Icon className="size-4 me-2 text-muted-foreground" />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{r.label}</span>
                        {r.hint && (
                          <span className="text-xs text-muted-foreground truncate">
                            {r.hint}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
import { Link, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Users, Flag, FileText, MessageSquare } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/layout/user-menu";


// Nav config — one array, easy to extend. `exact` prevents "/" from matching every nested route (since everything starts with "/").
const NAV_ITEMS = [
  { to: "/",         labelKey: "nav.dashboard", icon: LayoutDashboard, exact: true  },
  { to: "/users",    labelKey: "nav.users",     icon: Users,           exact: false },
  { to: "/posts",    labelKey: "nav.posts",     icon: FileText,        exact: false },
  { to: "/comments", labelKey: "nav.comments",  icon: MessageSquare,   exact: false },
  { to: "/reports",  labelKey: "nav.reports",   icon: Flag,            exact: false },  
] as const;

export function AppSidebar() {
  const { t, i18n } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const side = i18n.resolvedLanguage === "ar" ? "right" : "left";

  return (
    <Sidebar side={side} collapsible="icon">
      {/* ── Header: logo + brand ────────────────────────────────────────── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/" />}>             
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img src="/logo-mobile.png" alt="AuthNest" className="size-6 object-contain" />
                </div>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold">AuthNest</span>
                  <span className="truncate text-xs text-muted-foreground">Admin</span>
                </div>              
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Content: navigation ─────────────────────────────────────────── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.group.main")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive = item.exact
                  ? pathname === item.to
                  : pathname === item.to || pathname.startsWith(item.to + "/");

                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton                      
                      isActive={isActive}
                      tooltip={t(item.labelKey)}
                      render={<Link to={item.to} />}
                    >                                        
                      <item.icon />
                      <span>{t(item.labelKey)}</span>                      
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer: user menu ───────────────────────────────────────────── */}
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
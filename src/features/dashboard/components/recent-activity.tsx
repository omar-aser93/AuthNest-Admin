"use client";

import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { UserPlus, FileText, Flag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimeAgo } from "@/lib/utils";
import type { ActivityItem } from "../types";

const TYPE_ICON: Record<ActivityItem["type"], typeof UserPlus> = {
  USER_SIGNUP: UserPlus,
  POST_CREATED: FileText,
  REPORT_CREATED: Flag,
};

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("dashboard.recentActivity.title")}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground px-6 py-8 text-center">
            {t("dashboard.recentActivity.empty")}
          </p>
        ) : (
          <ul className="divide-y max-h-105 overflow-y-auto">
            {items.map((item) => (
              <ActivityRow key={item.id} item={item} onNavigate={navigate} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityRow({
  item,
  onNavigate,
}: {
  item: ActivityItem;
  onNavigate: ReturnType<typeof useNavigate>;
}) {
  const { t } = useTranslation();
  const Icon = TYPE_ICON[item.type];
  const name = item.actor?.name ?? t("common.unknownUser");
  const initials = name.slice(0, 2).toUpperCase();

  // Build the row text and click target per type
  let body: React.ReactNode;
  let onClick: (() => void) | undefined;

  if (item.type === "USER_SIGNUP") {
    body = (
      <>
        <span className="font-medium">{name}</span> {t("dashboard.recentActivity.signedUp")}
      </>
    );    
    onClick = () => onNavigate({ to: "/users", search: { page: 1, limit: 20, sort: "createdAt", order: "desc" } });
  } else if (item.type === "POST_CREATED") {
    body = (
      <>
        <span className="font-medium">{name}</span> {t("dashboard.recentActivity.posted")}{" "}
        <span className="italic">"{item.meta.title ?? t("posts.untitled")}"</span>
      </>
    );
    onClick = () => onNavigate({ to: "/posts", search: { page: 1, limit: 20, sort: "createdAt", order: "desc" } });
  } else {
    body = (
      <>
        <span className="font-medium">{name}</span>{" "}
        {t("dashboard.recentActivity.reported", {
          type: t(`reports.targetType.${item.meta.targetType}`).toLowerCase(),
        })}
      </>
    );
    onClick = () => onNavigate({ to: "/reports", search: { page: 1, limit: 20, sort: "createdAt", order: "desc", groupBy: "flat" } });
  }

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-start gap-3 px-6 py-3 text-start hover:bg-muted/50 transition-colors"
      >
        <Avatar className="size-8 shrink-0 mt-0.5">
          <AvatarImage src={item.actor?.image ?? undefined} alt={name} />
          <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="text-sm leading-snug">{body}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(item.createdAt)}
            </span>
            {item.type === "REPORT_CREATED" && item.meta.status === "PENDING" && (
              <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                {t("reports.status.PENDING")}
              </Badge>
            )}
          </div>
        </div>

        <Icon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
      </button>
    </li>
  );
}
export interface StatsOverview {
  users:    { total: number; newThisWeek: number; banned: number };
  posts:    { total: number; newThisWeek: number };
  comments: { total: number; newThisWeek: number };
  reports:  { pending: number; actioned: number };
}

export interface TimeseriesPoint {
  date: string;   // YYYY-MM-DD
  count: number;
}

export interface StatsTimeseries {
  range: string;
  users:    TimeseriesPoint[];
  posts:    TimeseriesPoint[];
  comments: TimeseriesPoint[];
}

export interface ReportsBreakdownResponse {
  reasons: { reason: string; count: number }[];
}


export type ActivityItem =
  | {
      id: string;
      type: "USER_SIGNUP";
      createdAt: string;
      actor: { id: string; name: string | null; image: string | null };
      meta: { email: string };
    }
  | {
      id: string;
      type: "POST_CREATED";
      createdAt: string;
      actor: { id: string; name: string | null; image: string | null };
      meta: { postId: string; title: string | null };
    }
  | {
      id: string;
      type: "REPORT_CREATED";
      createdAt: string;
      actor: { id: string; name: string | null; image: string | null };
      meta: { reportId: string; targetType: string; reason: string; status: string };
    };

export interface RecentActivityResponse {
  activities: ActivityItem[];
}
export type ReportStatusType = "PENDING" | "REVIEWED" | "ACTIONED" | "DISMISSED";
export type ReportTargetType = "POST" | "COMMENT" | "USER";
export type ReportReasonType =
  | "SPAM" | "HARASSMENT" | "HATE_SPEECH" | "VIOLENCE" | "NUDITY"
  | "FALSE_INFO" | "COPYRIGHT" | "IMPERSONATION" | "OTHER";

// Target is polymorphic — the backend returns different shapes per type,
// plus a `deleted: true` variant when the target no longer exists.
export interface ReportTargetPost {
  type: "POST";
  id: string;
  title?: string | null;
  contentExcerpt?: string | null;
  image?: string | null;
  privacy?: string;
  author?: { id: string; name: string | null; image: string | null };
  deleted?: boolean;
}

export interface ReportTargetComment {
  type: "COMMENT";
  id: string;
  contentExcerpt?: string | null;
  postId?: string;
  user?: { id: string; name: string | null; image: string | null };
  deleted?: boolean;
}

export interface ReportTargetUser {
  type: "USER";
  id: string;
  name?: string | null;
  email?: string;
  image?: string | null;
  role?: string;
  deleted?: boolean;
}

export type ReportTarget = ReportTargetPost | ReportTargetComment | ReportTargetUser;

export interface Report {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReasonType;
  description: string | null;
  status: ReportStatusType;
  createdAt: string;
  reviewedAt: string | null;
  resolutionNote: string | null;
  reporter: { id: string; name: string | null; email: string; image: string | null };
  reviewedBy: { id: string; name: string | null } | null;
  target: ReportTarget;
}

export interface ReportsListResponse {
  reports: Report[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReportsSearch {
  page: number;
  limit: number;
  status?: ReportStatusType | "all";
  targetType?: ReportTargetType | "all";
  sort: "createdAt" | "status";
  order: "asc" | "desc";
  groupBy?: "target" | "flat";
}


export interface GroupedReport {
  targetType: ReportTargetType;
  targetId: string;
  reportCount: number;
  firstReportedAt: string;
  latestReport: Report;
}

export interface GroupedReportsListResponse {
  groups: GroupedReport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, ExternalLink, Check, Trash2, XCircle, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";
import { reportsKeys, useUpdateReport } from "../api";
import { useBanUser } from "@/features/users/api";
import { useDeletePost, postsKeys } from "@/features/posts/api";
import { useDeleteComment, commentsKeys } from "@/features/comments/api";
import type { Report } from "../types";

const FRONTEND_ORIGIN = import.meta.env.VITE_FRONTEND_ORIGIN ?? "http://localhost:3000";

// ─── Action model ────────────────────────────────────────────────────────────
// Three kinds of admin actions:
//   1. `delete-target` — permanently delete the reported post/comment. The cascade in cascadeDelete.js also removes this report row, so the action completes the report without an explicit status transition.
//   2. `ban-user` — ban the target user (USER reports only), then mark the report ACTIONED so it doesn't linger in the queue.
//   3. `status` — a pure workflow transition (Reviewed / Dismissed) that leaves the content untouched.
type ManualStatus = "REVIEWED" | "DISMISSED"; 
type PendingAction =
  | { kind: "status"; status: ManualStatus }
  | { kind: "delete-target" }
  | { kind: "ban-user" };


// Config for the 2 status-only transitions. Kept as data so the dropdown, dialog, and toast all stay in sync without duplication.
const STATUS_ACTIONS: Record<
  ManualStatus,
  {
    labelKey: string;
    titleKey: string;
    descKey: string;
    icon: typeof Check;
    variant: "default" | "destructive";
  }
> = {
  REVIEWED: {
    labelKey: "reports.markReviewed",
    titleKey: "reports.confirm.reviewedTitle",
    descKey: "reports.confirm.reviewedDescription",
    icon: Check,
    variant: "default",
  },
  DISMISSED: {
    labelKey: "reports.markDismissed",
    titleKey: "reports.confirm.dismissedTitle",
    descKey: "reports.confirm.dismissedDescription",
    icon: XCircle,
    variant: "default",
  },
};

// Build the public-app URL for the reported target. Comments link to their
// parent post since the client has no per-comment page.
function buildTargetUrl(report: Report): string | null {
  const target = report.target;
  if (!target || target.deleted) return null;
  if (target.type === "POST") return `${FRONTEND_ORIGIN}/posts/${target.id}`;
  if (target.type === "COMMENT" && target.postId) return `${FRONTEND_ORIGIN}/posts/${target.postId}`;
  if (target.type === "USER") return `${FRONTEND_ORIGIN}/user/${target.id}`;
  return null;
}

// ─── Component that renders the action buttons ──────────────────────────────
export function ReportRowActions({ report }: { report: Report }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const updateReport = useUpdateReport();
  const deletePost = useDeletePost();
  const deleteComment = useDeleteComment();
  const banUser = useBanUser();

  const [pending, setPending] = useState<PendingAction | null>(null);
  const [banReason, setBanReason] = useState("");

  const isPending = report.status === "PENDING";
  const targetUrl = buildTargetUrl(report);
  const targetDeleted = !!report.target?.deleted;

  // Only posts and comments can be deleted. USER reports go through ban instead.
  // Already-deleted targets have nothing left to remove.
  const canDeleteTarget =
    !targetDeleted && (report.targetType === "POST" || report.targetType === "COMMENT");

  // Aggregate pending state across all mutations so the confirm button and
  // the trigger button stay disabled while any action is in-flight.
  const isBusy =
    updateReport.isPending ||
    deletePost.isPending ||
    deleteComment.isPending ||
    banUser.isPending;

  // Reset dialog state (pending action + typed reason) whenever the dialog
  // closes for any reason — success, cancel, or external dismiss.
  const closeDialog = () => {
    setPending(null);
    setBanReason("");
  };

  // ─── Confirm handler ───────────────────────────────────────────────────────
  // Branch order matters:
  //   - `delete-target` and `ban-user` are terminal branches that `return`.
  //   - Once they're handled, TS narrows `pending` to `{ kind: "status" }` for the final branch, so `pending.status` is safe to access.
  // If the status branch came first (as in the earlier version), clicking "Ban user" would fire a spurious PATCH with `status: undefined` before the ban call, producing a confusing error-then-success toast pair.
  const handleConfirm = () => {
    if (!pending) return;

    // ── Branch 1: delete the target ─────────────────────────────────────────
    // The backend cascade removes the report along with the content, so we don't fire a separate status update.
    if (pending.kind === "delete-target") {
      const onSuccess = () => {
        queryClient.invalidateQueries({ queryKey: reportsKeys.all });
        if (report.targetType === "POST") {
          queryClient.invalidateQueries({ queryKey: postsKeys.all });
        } else if (report.targetType === "COMMENT") {
          queryClient.invalidateQueries({ queryKey: commentsKeys.all });
        }
        toast.add({
          type: "success",
          title: t("reports.deleted", {
            type: t(`reports.targetType.${report.targetType}`),
          }),
        });
        closeDialog();
      };

      const onError = (err: unknown) => {
        toast.add({
          type: "error",
          title: err instanceof ApiError ? err.message : t("common.error"),
        });
      };

      if (report.targetType === "POST") {
        deletePost.mutate(report.targetId, { onSuccess, onError });
      } else if (report.targetType === "COMMENT") {
        deleteComment.mutate(report.targetId, { onSuccess, onError });
      }
      return;
    }

    // ── Branch 2: ban the user ──────────────────────────────────────────────
    // Two-step: ban first, then mark the report ACTIONED. If the second step fails, the ban still succeeded — we surface a different toast so the admin knows the outcome is "banned but report still pending".
    if (pending.kind === "ban-user") {
      banUser.mutate(
        { id: report.targetId, reason: banReason.trim() || undefined },
        {
          onSuccess: () => {
            updateReport.mutate(
              { id: report.id, status: "ACTIONED" },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: reportsKeys.all });
                  toast.add({ type: "success", title: t("reports.updated") });
                  closeDialog();
                },
                onError: () => {
                  // Ban worked but status update failed — still refresh so the
                  // admin sees the user is banned, and surface the partial
                  // failure explicitly instead of pretending all is well.
                  queryClient.invalidateQueries({ queryKey: reportsKeys.all });
                  toast.add({ type: "error", title: t("reports.statusUpdateFailed") });
                  closeDialog();
                },
              },
            );
          },
          onError: (err) => {
            toast.add({
              type: "error",
              title: err instanceof ApiError ? err.message : t("common.error"),
            });
          },
        },
      );
      return;
    }

    // ── Branch 3: status-only transition ────────────────────────────────────
    // Reached only for `{ kind: "status" }` after the two returns above.
    updateReport.mutate(
      { id: report.id, status: pending.status },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: reportsKeys.all });
          toast.add({ type: "success", title: t("reports.updated") });
          closeDialog();
        },
        onError: (err) => {
          toast.add({
            type: "error",
            title: err instanceof ApiError ? err.message : t("common.error"),
          });
        },
      },
    );
  };

  // ─── Dialog copy resolution ────────────────────────────────────────────────
  // Same branch ordering as handleConfirm — terminal branches return first, then the status branch narrows cleanly.
  // `showBanReason` gates the reason textarea that only the ban dialog needs.
  const dialogConfig = (() => {
    if (!pending) return null;

    if (pending.kind === "delete-target") {
      const typeLabel = t(`reports.targetType.${report.targetType}`);
      return {
        title: t("reports.confirm.deleteTitle"),
        description: t("reports.confirm.deleteDescription", { type: typeLabel.toLowerCase() }),
        confirmLabel: t("reports.deleteTarget", { type: typeLabel }),
        variant: "destructive" as const,
        showBanReason: false,
      };
    }

    if (pending.kind === "ban-user") {
      return {
        title: t("reports.confirm.banTitle"),
        description: t("reports.confirm.banDescription"),
        confirmLabel: t("reports.banUser"),
        variant: "destructive" as const,
        showBanReason: true,
      };
    }

    const cfg = STATUS_ACTIONS[pending.status];
    return {
      title: t(cfg.titleKey),
      description: t(cfg.descKey),
      confirmLabel: t(cfg.labelKey),
      variant: cfg.variant,
      showBanReason: false,
    };
  })();

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8" />}>
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {targetUrl && (
            <>
              <DropdownMenuItem onClick={() => window.open(targetUrl, "_blank")}>
                <ExternalLink />
                {t("reports.viewTarget")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {isPending ? (
            <>
              {/* Status-only: benign close */}
              <DropdownMenuItem onClick={() => setPending({ kind: "status", status: "REVIEWED" })}>
                <Check />
                {t("reports.markReviewed")}
              </DropdownMenuItem>

              {/* Delete: posts and comments only */}
              {canDeleteTarget && (
                <DropdownMenuItem
                  onClick={() => setPending({ kind: "delete-target" })}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 />
                  {t("reports.deleteTarget", {
                    type: t(`reports.targetType.${report.targetType}`),
                  })}
                </DropdownMenuItem>
              )}

              {/* Ban: USER targets only, and only if not already deleted */}
              {report.targetType === "USER" && !targetDeleted && (
                <DropdownMenuItem
                  onClick={() => setPending({ kind: "ban-user" })}
                  className="text-destructive focus:text-destructive"
                >
                  <Ban />
                  {t("reports.banUser")}
                </DropdownMenuItem>
              )}

              {/* Status-only: report was invalid */}
              <DropdownMenuItem onClick={() => setPending({ kind: "status", status: "DISMISSED" })}>
                <XCircle />
                {t("reports.dismiss")}
              </DropdownMenuItem>
            </>
          ) : (
            // Resolved reports show only their final status — no actions.
            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
              {t(`reports.status.${report.status}`)}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirm dialog — copy adapts to `pending.kind`. */}
      <AlertDialog
        open={!!pending}
        onOpenChange={(open) => {
          // Reset reason and pending when closed by cancel or backdrop click.
          if (!open) closeDialog();
        }}
      >
        <AlertDialogContent>
          {dialogConfig && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{dialogConfig.title}</AlertDialogTitle>
                <AlertDialogDescription>{dialogConfig.description}</AlertDialogDescription>
              </AlertDialogHeader>

              {/* Optional reason textarea — shown only for the ban flow. */}
              {dialogConfig.showBanReason && (
                <Field>
                  <FieldLabel htmlFor="ban-reason">
                    {t("users.banReason")}{" "}
                    <span className="text-muted-foreground font-normal">
                      ({t("common.optional")})
                    </span>
                  </FieldLabel>
                  <Textarea
                    id="ban-reason"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder={t("users.banReasonPlaceholder")}
                  />
                </Field>
              )}

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isBusy}>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => { e.preventDefault(); handleConfirm(); }}
                  disabled={isBusy}
                  className={
                    dialogConfig.variant === "destructive"
                      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      : ""
                  }
                >
                  {isBusy ? t("common.loading") : dialogConfig.confirmLabel}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
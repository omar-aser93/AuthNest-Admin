import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";
import { commentsKeys, useDeleteComment } from "../api";
import type { Comment } from "../types";

const FRONTEND_ORIGIN = import.meta.env.VITE_FRONTEND_ORIGIN ?? "http://localhost:3000";


// ─── Comment row actions ───────────────────────────────────────────────────────
export function CommentRowActions({ comment }: { comment: Comment }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const deleteComment = useDeleteComment();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = () => {
    deleteComment.mutate(comment.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: commentsKeys.all });
        toast.add({ type: "success", title: t("comments.deleted") });
        setDeleteOpen(false);
      },
      onError: (err) => {
        toast.add({
          type: "error",
          title: err instanceof ApiError ? err.message : t("common.error"),
        });
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8" />}>
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => window.open(`${FRONTEND_ORIGIN}/posts/${comment.postId}`, "_blank")}
          >
            <ExternalLink />
            {t("comments.viewPost")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 />
            {t("comments.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("comments.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("comments.deleteConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteComment.isPending}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={deleteComment.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteComment.isPending ? t("common.deleting") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
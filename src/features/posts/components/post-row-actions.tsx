import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";
import { postsKeys, useDeletePost } from "../api";
import type { Post } from "../types";

const FRONTEND_ORIGIN = import.meta.env.VITE_FRONTEND_ORIGIN ?? "http://localhost:3000";


// ─── Post row actions ────────────────────────────────────────────────────────
export function PostRowActions({ post }: { post: Post }) {
  const { t } = useTranslation(); 
  const queryClient = useQueryClient();
  const deletePost = useDeletePost();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = () => {
    deletePost.mutate(post.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: postsKeys.all });
        toast.add({ type: "success", title: t("posts.deleted") });
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
            onClick={() => window.open(`${FRONTEND_ORIGIN}/posts/${post.id}`, "_blank")}
          >
            <ExternalLink />
            {t("posts.viewOnSite")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 />
            {t("posts.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("posts.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("posts.deleteConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePost.isPending}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={deletePost.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePost.isPending ? t("common.deleting") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
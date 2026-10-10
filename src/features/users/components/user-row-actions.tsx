import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Shield, ShieldOff, Trash2, Ban, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";
import { usersKeys, useDeleteUser, useUpdateUserRole, useBanUser, useUnbanUser } from "../api";
import type { User } from "../types";


// component to display the actions for a user (promote-to-admin/demote-to-user/delete)
export function UserRowActions({ user }: { user: User }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [banReason, setBanReason] = useState("");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: usersKeys.all });
  const isBanned = !!user.bannedAt;

  const handleToggleRole = () => {
    const newRole = user.role === "admin" ? "user" : "admin";
    updateRole.mutate({ id: user.id, role: newRole }, {
      onSuccess: () => {
        invalidate();
        toast.add({
          type: "success",
          title: t(newRole === "admin" ? "users.promoted" : "users.demoted", {
            name: user.name ?? user.email,
          }),
        });
      },
      onError: (err) => {
        toast.add({ type: "error", title: err instanceof ApiError ? err.message : t("common.error") });
      },
    });
  };

  const handleDelete = () => {
    deleteUser.mutate(user.id, {
      onSuccess: () => {
        invalidate();
        toast.add({ type: "success", title: t("users.deleted") });
        setDeleteOpen(false);
      },
      onError: (err) => {
        toast.add({ type: "error", title: err instanceof ApiError ? err.message : t("common.error") });
      },
    });
  };

  const handleBan = () => {
    banUser.mutate(
      { id: user.id, reason: banReason.trim() || undefined },
      {
        onSuccess: () => {
          invalidate();
          toast.add({ type: "success", title: t("users.bannedToast", { name: user.name ?? user.email }) });
          setBanOpen(false);
          setBanReason("");
        },
        onError: (err) => {
          toast.add({ type: "error", title: err instanceof ApiError ? err.message : t("common.error") });
        },
      },
    );
  };

  const handleUnban = () => {
    unbanUser.mutate(user.id, {
      onSuccess: () => {
        invalidate();
        toast.add({ type: "success", title: t("users.unbannedToast", { name: user.name ?? user.email }) });
      },
      onError: (err) => {
        toast.add({ type: "error", title: err instanceof ApiError ? err.message : t("common.error") });
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
          <DropdownMenuItem onClick={handleToggleRole} disabled={updateRole.isPending}>
            {user.role === "admin" ? <ShieldOff /> : <Shield />}
            {t(user.role === "admin" ? "users.demote" : "users.promote")}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {isBanned ? (
            <DropdownMenuItem onClick={handleUnban} disabled={unbanUser.isPending}>
              <CheckCircle2 />
              {t("users.unban")}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setBanOpen(true)} disabled={banUser.isPending}>
              <Ban />
              {t("users.ban")}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 />
            {t("users.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Ban dialog ──────────────────────────────────────────────── */}
      <AlertDialog open={banOpen} onOpenChange={(open) => { setBanOpen(open); if (!open) setBanReason(""); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("users.banConfirmTitle", { name: user.name ?? user.email })}</AlertDialogTitle>
            <AlertDialogDescription>{t("users.banConfirmDescription")}</AlertDialogDescription>
          </AlertDialogHeader>

          <Field>
            <FieldLabel htmlFor="ban-reason">
              {t("users.banReason")} <span className="text-muted-foreground font-normal">({t("common.optional")})</span>
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

          <AlertDialogFooter>
            <AlertDialogCancel disabled={banUser.isPending}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleBan(); }}
              disabled={banUser.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {banUser.isPending ? t("common.loading") : t("users.ban")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Delete dialog (unchanged) ────────────────────────────────── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("users.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("users.deleteConfirmDescription", { name: user.name ?? user.email })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUser.isPending}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={deleteUser.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUser.isPending ? t("common.deleting") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


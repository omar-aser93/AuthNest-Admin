import { queryOptions, keepPreviousData, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User, UsersListResponse, UsersSearch } from "./types";

// ─── Query keys ──────────────────────────────────────────────────────────────
export const usersKeys = {
  all: ["admin", "users"] as const,
  list: (filters: UsersSearch) => [...usersKeys.all, "list", filters] as const,
};


// ─── Fetch list ──────────────────────────────────────────────────────────────
async function fetchUsers(filters: UsersSearch): Promise<UsersListResponse> {
  const params = new URLSearchParams();
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.role && filters.role !== "all") params.set("role", filters.role);
  params.set("sort", filters.sort);
  params.set("order", filters.order);

  const res = await api.get(`/admin/users?${params.toString()}`);
  return res.data;
}

export const usersQueryOptions = (filters: UsersSearch) =>
  queryOptions({
    queryKey: usersKeys.list(filters),
    queryFn: () => fetchUsers(filters),
    placeholderData: keepPreviousData,   // keep previous page visible while fetching next
  });



// ─── Update role ─────────────────────────────────────────────────────────────
async function updateUserRoleRequest({ id, role }: { id: string; role: "user" | "admin" }): Promise<User> {
  const res = await api.patch(`/admin/users/${id}/role`, { role });
  return res.data;
}

export function useUpdateUserRole() {
  return useMutation({ mutationFn: updateUserRoleRequest });
}



// ─── Delete user ─────────────────────────────────────────────────────────────
async function deleteUserRequest(id: string): Promise<void> {
  await api.delete(`/admin/users/${id}`);
}

export function useDeleteUser() {
  return useMutation({ mutationFn: deleteUserRequest });
}



// ─── Ban user ───────────────────────────────────────────────────────────────
async function banUserRequest({ id, reason }: { id: string; reason?: string }): Promise<User> {
  const res = await api.post(`/admin/users/${id}/ban`, { reason });
  return res.data;
}

export function useBanUser() {
  return useMutation({ mutationFn: banUserRequest });
}



// ─── Unban user ─────────────────────────────────────────────────────────────
async function unbanUserRequest(id: string): Promise<User> {
  const res = await api.post(`/admin/users/${id}/unban`);
  return res.data;
}

export function useUnbanUser() {
  return useMutation({ mutationFn: unbanUserRequest });
}


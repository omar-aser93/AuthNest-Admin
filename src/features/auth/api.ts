import { queryOptions, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LoginPayload, LoginResponse, User } from "./types";

// ─── Query keys ──────────────────────────────────────────────────────────────
export const authKeys = {
  all: ["auth"] as const,
  currentUser: () => [...authKeys.all, "current-user"] as const,
};

// ─── Current user query ──────────────────────────────────────────────────────
// Returns null on any failure — the guard interprets null as "not authenticated".
async function fetchCurrentUser(): Promise<User | null> {
  try {
    const res = await api.get("/users/me");
    return res.data;
  } catch {
    return null;
  }
}

export const currentUserQueryOptions = queryOptions({
  queryKey: authKeys.currentUser(),
  queryFn: fetchCurrentUser,
  staleTime: 5 * 60 * 1000,  // 5 min — avoids refetch on every route change
  retry: false,              // don't hammer /users/me if the user isn't logged in
});

// ─── Login mutation ──────────────────────────────────────────────────────────
async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  const res = await api.post("/admin/auth/login", payload);
  return res.data;
}

// Minimal mutation — side effects (cache update, navigation, toast) live in the component where they belong.
// The hook is reusable, the component decides what to do on success.
export function useLogin() {
  return useMutation({ mutationFn: loginRequest });
}


// ─── Logout mutation ─────────────────────────────────────────────────────────
async function logoutRequest(): Promise<void> {
  await api.post("/admin/auth/logout");
}

export function useLogout() {
  return useMutation({ mutationFn: logoutRequest });
}
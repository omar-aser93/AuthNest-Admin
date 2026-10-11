import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

const baseURL = "/api/v1";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15_000,
});

// ─── CSRF ────────────────────────────────────────────────────────────────────
function readCsrfCookie(): string | undefined {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrfToken="))
    ?.split("=")[1];
}

api.interceptors.request.use((config) => {
  const csrfToken = readCsrfCookie();
  if (csrfToken) config.headers["X-CSRF-Token"] = csrfToken;
  return config;
});

// ─── 401 Refresh ─────────────────────────────────────────────────────────────
// Refresh lock: if multiple requests 401 simultaneously, only ONE refresh fires.
let refreshPromise: Promise<void> | null = null;

async function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh-token`, null, { withCredentials: true })
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const status = error.response?.status;
    const url = original?.url ?? "";

    // Don't attempt refresh on auth routes — those 401s are real auth failures.
    const isAuthRoute = url.includes("/auth/");

    if (status === 401 && original && !original._retried && !isAuthRoute) {
      original._retried = true;
      try {
        await refreshSession();
        return api(original);       // retry original request once
      } catch {
        // Refresh failed — fall through to throw ApiError
      }
    }

    const message =
      (error.response?.data as { message?: string } | undefined)?.message ??
      "Something went wrong. Please try again.";

    return Promise.reject(new ApiError(message, error.response?.status));
  },
);

// ─── CSRF bootstrap ──────────────────────────────────────────────────────────
// Call once on app boot. If csrfToken cookie is missing, fetch it from backend.
export async function bootstrapCsrf(): Promise<void> {
  if (readCsrfCookie()) return;
  try {
    await axios.get(`${baseURL}/auth/csrf-token`, { withCredentials: true });
  } catch {
    // Non-fatal — mutations will 403 until CSRF is available, and the user
    // will see the error then. Better than blocking app render.
  }
}

// ─── Error type ──────────────────────────────────────────────────────────────
export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
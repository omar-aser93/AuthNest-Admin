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
      .catch((e) => { if (e?.response?.status !== 409) throw e; }) 
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const status = error.response?.status;
    const url = original?.url ?? "";
    const message = (error.response?.data as { message?: string } | undefined)?.message ?? "";

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

    // Session is dead (or account was suspended mid-session).
    // Three exclusions to prevent an infinite reload loop on /login:
    //   - /users/me:   the root guard already redirects when it returns null
    //   - /login:      redirecting to the page we're on would reload in a loop
    //   - generic 403: CSRF failures and "Admin access required" are not dead
    //                  sessions — only an explicit "suspended" 403 is
    const isMe = url.includes("/users/me");
    const onLogin = typeof window !== "undefined" && window.location.pathname.startsWith("/login");
    const suspended = status === 403 && /suspended/i.test(message);

    if ((status === 401 || suspended) && !isAuthRoute && !isMe && !onLogin) {
      if (typeof window !== "undefined") {
        window.location.assign("/login");
      }
    }

    const finalMessage = message || "Something went wrong. Please try again.";

    return Promise.reject(new ApiError(finalMessage, status));
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
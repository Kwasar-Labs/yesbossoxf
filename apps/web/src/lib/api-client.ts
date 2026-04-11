import type { ApiErrorResponse } from "@yesboss/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("yesboss_token");
}

async function request<T>(
  method: string,
  path: string,
  options?: { body?: unknown; params?: Record<string, string> },
): Promise<T> {
  const fullPath = `${BASE_URL}${path}`;
  const url = new URL(fullPath, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  if (options?.params) {
    Object.entries(options.params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const err = (await res.json()) as ApiErrorResponse;
    throw new ApiError(res.status, err.error?.code ?? "UNKNOWN", err.error?.message ?? "Request failed");
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, params?: Record<string, string>) =>
    request<T>("GET", path, { params }),

  post: <T>(path: string, body?: unknown) =>
    request<T>("POST", path, { body }),

  put: <T>(path: string, body?: unknown) =>
    request<T>("PUT", path, { body }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>("PATCH", path, { body }),

  delete: <T>(path: string, body?: unknown) =>
    request<T>("DELETE", path, { body }),
};

export { ApiError };

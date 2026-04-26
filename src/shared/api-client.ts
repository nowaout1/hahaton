import { BASE_URL } from "@/shared/config";

let token: string | null = null;

export const setToken = (value: string | null) => {
  token = value;
  if (typeof window === "undefined") return;
  if (value) {
    localStorage.setItem("access_token", value);
  } else {
    localStorage.removeItem("access_token");
  }
};

export const getToken = () => {
  if (token) return token;
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("access_token");
  if (stored) token = stored;
  return token;
};

function buildErrorMessage(errorText: string, status: number) {
  if (!errorText) return `Ошибка ${status}`;

  try {
    const parsed = JSON.parse(errorText) as {
      detail?: string | Array<{ msg?: string }>;
    };

    if (typeof parsed.detail === "string" && parsed.detail) {
      return parsed.detail;
    }

    if (Array.isArray(parsed.detail) && parsed.detail[0]?.msg) {
      return parsed.detail[0].msg;
    }
  } catch {
    // Fall back to raw text below.
  }

  return errorText;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (
    !headers.has("Content-Type") &&
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  const currentToken = getToken();
  if (currentToken) {
    headers.set("Authorization", `Bearer ${currentToken}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(buildErrorMessage(errorText, res.status));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }

  return (await res.blob()) as T;
}

export const api = {
  get: <T>(path: string, init?: RequestInit) =>
    apiRequest<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, body?: BodyInit | object, init: RequestInit = {}) => {
    const payload =
      body &&
      typeof body === "object" &&
      !(body instanceof FormData) &&
      !(body instanceof URLSearchParams)
        ? JSON.stringify(body)
        : (body as BodyInit | undefined);
    return apiRequest<T>(path, { ...init, method: "POST", body: payload });
  },
  put: <T>(path: string, body?: BodyInit | object, init: RequestInit = {}) => {
    const payload =
      body &&
      typeof body === "object" &&
      !(body instanceof FormData) &&
      !(body instanceof URLSearchParams)
        ? JSON.stringify(body)
        : (body as BodyInit | undefined);
    return apiRequest<T>(path, { ...init, method: "PUT", body: payload });
  },
  delete: <T>(path: string, init?: RequestInit) =>
    apiRequest<T>(path, { ...init, method: "DELETE" }),
};

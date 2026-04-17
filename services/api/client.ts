import { env } from "@/config/env";
import { ApiError, NetworkError, TimeoutError } from "./errors";
import type {
    HttpMethod,
    RequestConfig,
    RequestInterceptor,
    ResponseInterceptor,
    ErrorInterceptor,
} from "./types";


const tokenStore = {
    getAccessToken: (): string | null => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(env.AUTH_TOKEN_KEY);
    },
    getRefreshToken: (): string | null => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(env.AUTH_REFRESH_TOKEN_KEY);
    },
    setTokens: (access: string, refresh?: string) => {
        if (typeof window === "undefined") return;
        localStorage.setItem(env.AUTH_TOKEN_KEY, access);
        if (refresh) {
            localStorage.setItem(env.AUTH_REFRESH_TOKEN_KEY, refresh);
        }
    },
    clearTokens: () => {
        if (typeof window === "undefined") return;
        localStorage.removeItem(env.AUTH_TOKEN_KEY);
        localStorage.removeItem(env.AUTH_REFRESH_TOKEN_KEY);
    },
};

// ─── Interceptor Registry ───────────────────────────────

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];
const errorInterceptors: ErrorInterceptor[] = [];

export const interceptors = {
    request: {
        use: (interceptor: RequestInterceptor) => {
            requestInterceptors.push(interceptor);
            return () => {
                const idx = requestInterceptors.indexOf(interceptor);
                if (idx !== -1) requestInterceptors.splice(idx, 1);
            };
        },
    },
    response: {
        use: (interceptor: ResponseInterceptor) => {
            responseInterceptors.push(interceptor);
            return () => {
                const idx = responseInterceptors.indexOf(interceptor);
                if (idx !== -1) responseInterceptors.splice(idx, 1);
            };
        },
    },
    error: {
        use: (interceptor: ErrorInterceptor) => {
            errorInterceptors.push(interceptor);
            return () => {
                const idx = errorInterceptors.indexOf(interceptor);
                if (idx !== -1) errorInterceptors.splice(idx, 1);
            };
        },
    },
};

function buildQueryString(
    params?: Record<string, string | number | boolean | undefined | null>
): string {
    if (!params) return "";
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    }
    const qs = searchParams.toString();
    return qs ? `?${qs}` : "";
}

/** Create an AbortController with timeout */
function createTimeoutController(timeoutMs: number) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort("TIMEOUT"), timeoutMs);
    return { controller, timeoutId };
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
    let body: Record<string, unknown> = {};
    try {
        body = await response.json();
    } catch {
        // Response body is not JSON
    }
    if (response.status === 422) {
        return new ApiError({
            message: (body.message as string) ?? "The given data was invalid.",
            status: 422,
            code: "VALIDATION_ERROR",
            errors: (body.errors as Record<string, string[]>) ?? null,
            raw: body,
        });
    }

    return new ApiError({
        message: (body.message as string) ?? response.statusText ?? "Request failed",
        status: response.status,
        code: (body.code as string) ?? `HTTP_${response.status}`,
        errors: (body.errors as Record<string, string[]>) ?? null,
        raw: body,
    });
}

/** Normalize any thrown value into an ApiError */
async function normalizeError(error: unknown): Promise<ApiError> {
    if (error instanceof ApiError) return error;

    if (error instanceof DOMException && error.name === "AbortError") {
        return new TimeoutError(env.API_TIMEOUT);
    }

    if (error instanceof TypeError) {
        return new NetworkError(error.message);
    }

    if (error instanceof Response) {
        return parseErrorResponse(error);
    }

    return new ApiError({
        message: error instanceof Error ? error.message : "An unexpected error occurred",
        status: 0,
        code: "UNKNOWN_ERROR",
        raw: error,
    });
}


let csrfInitialized = false;

async function initCsrf(): Promise<void> {
    if (csrfInitialized) return;
    try {
        await fetch(`${env.API_BASE_URL}/sanctum/csrf-cookie`, {
            method: "GET",
            credentials: "include",
        });
        csrfInitialized = true;
    } catch {
    }
}

function getXsrfToken(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}


let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
    refreshSubscribers.push(callback);
}

function onTokenRefreshed(newToken: string) {
    refreshSubscribers.forEach((cb) => cb(newToken));
    refreshSubscribers = [];
}

async function handleTokenRefresh(): Promise<string> {
    const refreshToken = tokenStore.getRefreshToken();
    if (!refreshToken) {
        tokenStore.clearTokens();
        throw new ApiError({
            message: "No refresh token available",
            status: 401,
            code: "NO_REFRESH_TOKEN",
        });
    }

    try {
        const response = await fetch(`${env.API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
            credentials: "include",
        });

        if (!response.ok) throw response;

        const data = await response.json();

        const newAccessToken = data.access_token ?? data.data?.access_token;
        const newRefreshToken = data.refresh_token ?? data.data?.refresh_token;

        tokenStore.setTokens(newAccessToken, newRefreshToken);
        return newAccessToken;
    } catch {
        tokenStore.clearTokens();
        if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
        }
        throw new ApiError({
            message: "Session expired. Please log in again.",
            status: 401,
            code: "REFRESH_FAILED",
        });
    }
}


async function coreFetch<T>(
    method: HttpMethod,
    endpoint: string,
    body?: unknown,
    config: RequestConfig = {}
): Promise<T> {
    const {
        params,
        timeout = env.API_TIMEOUT,
        headers: customHeaders = {},
        auth = true,
        baseURL = env.API_BASE_URL,
        tags,
        revalidate,
        ...restInit
    } = config;

    if (typeof window !== "undefined" && method !== "GET") {
        await initCsrf();
    }
    const url = `${baseURL}${endpoint}${buildQueryString(params)}`;

    // Build headers
    const headers: Record<string, string> = {
        Accept: "application/json",
        ...customHeaders,
    };

    // Only set Content-Type for JSON bodies (not FormData)
    if (!(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    // Attach Bearer token
    if (auth) {
        const token = tokenStore.getAccessToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    const xsrfToken = getXsrfToken();
    if (xsrfToken && method !== "GET") {
        headers["X-XSRF-TOKEN"] = xsrfToken;
    }

    let requestInit: RequestInit = {
        method,
        headers,
        credentials: "include",
        ...restInit,
    };

    if (body !== undefined && method !== "GET") {
        requestInit.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    if (tags || revalidate !== undefined) {
        (requestInit as Record<string, unknown>).next = {
            ...(tags ? { tags } : {}),
            ...(revalidate !== undefined ? { revalidate } : {}),
        };
    }

    let finalUrl = url;
    for (const interceptor of requestInterceptors) {
        const result = await interceptor(finalUrl, requestInit);
        finalUrl = result.url;
        requestInit = result.config;
    }

    const { controller, timeoutId } = createTimeoutController(timeout);
    requestInit.signal = controller.signal;

    try {
        let response = await fetch(finalUrl, requestInit);
        clearTimeout(timeoutId);

        for (const interceptor of responseInterceptors) {
            response = await interceptor(response, finalUrl);
        }
        if (response.status === 401 && auth && typeof window !== "undefined") {
            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const newToken = await handleTokenRefresh();
                    isRefreshing = false;
                    onTokenRefreshed(newToken);

                    headers["Authorization"] = `Bearer ${newToken}`;
                    requestInit.headers = headers;
                    const { controller: retryCtl, timeoutId: retryTid } =
                        createTimeoutController(timeout);
                    requestInit.signal = retryCtl.signal;
                    response = await fetch(finalUrl, requestInit);
                    clearTimeout(retryTid);
                } catch (refreshError) {
                    isRefreshing = false;
                    throw refreshError;
                }
            } else {
                const newToken = await new Promise<string>((resolve) => {
                    subscribeTokenRefresh(resolve);
                });
                headers["Authorization"] = `Bearer ${newToken}`;
                requestInit.headers = headers;
                const { controller: retryCtl, timeoutId: retryTid } =
                    createTimeoutController(timeout);
                requestInit.signal = retryCtl.signal;
                response = await fetch(finalUrl, requestInit);
                clearTimeout(retryTid);
            }
        }

        if (!response.ok) {
            throw response;
        }
        if (response.status === 204) {
            return undefined as T;
        }

        // Parse JSON response
        const data = (await response.json()) as T;
        return data;
    } catch (error) {
        clearTimeout(timeoutId);

        const apiError = await normalizeError(error);

        for (const interceptor of errorInterceptors) {
            try {
                await interceptor(apiError, finalUrl);
            } catch (interceptorError) {
                throw interceptorError;
            }
        }

        throw apiError;
    }
}

export const apiClient = {
    get: <T>(endpoint: string, config?: RequestConfig) =>
        coreFetch<T>("GET", endpoint, undefined, config),

    post: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
        coreFetch<T>("POST", endpoint, body, config),

    put: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
        coreFetch<T>("PUT", endpoint, body, config),

    patch: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
        coreFetch<T>("PATCH", endpoint, body, config),

    delete: <T>(endpoint: string, config?: RequestConfig) =>
        coreFetch<T>("DELETE", endpoint, undefined, config),

    /** Upload files via FormData */
    upload: <T>(endpoint: string, formData: FormData, config?: RequestConfig) =>
        coreFetch<T>("POST", endpoint, formData, config),

    /** Access token management */
    tokens: tokenStore,

    /** Access interceptors */
    interceptors,

    /** Manually initialize CSRF (useful before login) */
    initCsrf,
} as const;

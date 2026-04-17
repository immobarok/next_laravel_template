import { env } from "@/config/env";
import { cookies, headers as nextHeaders } from "next/headers";
import { ApiError } from "./errors";
import type { RequestConfig } from "./types";

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


export async function serverFetch<T>(
    endpoint: string,
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
    } = config;

    const url = `${baseURL}${endpoint}${buildQueryString(params)}`;

    // Build headers
    const headers: Record<string, string> = {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...customHeaders,
    };

    if (auth) {
        try {
            const cookieStore = await cookies();
            const cookieHeader = cookieStore.toString();
            if (cookieHeader) {
                headers["Cookie"] = cookieHeader;
            }

            const xsrfCookie = cookieStore.get("XSRF-TOKEN");
            if (xsrfCookie) {
                headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrfCookie.value);
            }
        } catch {
            // cookies() not available outside of request context
        }

        try {
            const incomingHeaders = await nextHeaders();
            const authHeader = incomingHeaders.get("Authorization");
            if (authHeader) {
                headers["Authorization"] = authHeader;
            }
        } catch {
            // headers() not available
        }
    }

    const fetchOptions: RequestInit & { next?: Record<string, unknown> } = {
        method: "GET",
        headers,
        next: {
            ...(tags ? { tags } : {}),
            ...(revalidate !== undefined ? { revalidate } : {}),
        },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    fetchOptions.signal = controller.signal;

    try {
        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
            let body: Record<string, unknown> = {};
            try {
                body = await response.json();
            } catch {
                // not JSON
            }

            throw new ApiError({
                message: (body.message as string) ?? response.statusText,
                status: response.status,
                code: `HTTP_${response.status}`,
                errors: (body.errors as Record<string, string[]>) ?? null,
                raw: body,
            });
        }

        if (response.status === 204) {
            return undefined as T;
        }

        return (await response.json()) as T;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof ApiError) throw error;

        if (error instanceof DOMException && error.name === "AbortError") {
            throw new ApiError({
                message: `Server request timed out after ${timeout}ms`,
                status: 0,
                code: "TIMEOUT_ERROR",
            });
        }

        throw new ApiError({
            message: error instanceof Error ? error.message : "Server fetch failed",
            status: 0,
            code: "SERVER_FETCH_ERROR",
            raw: error,
        });
    }
}

export async function serverMutate<T>(
    method: "POST" | "PUT" | "PATCH" | "DELETE",
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
    } = config;

    const url = `${baseURL}${endpoint}${buildQueryString(params)}`;

    const headers: Record<string, string> = {
        Accept: "application/json",
        ...customHeaders,
    };

    if (!(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    if (auth) {
        try {
            const cookieStore = await cookies();
            const cookieHeader = cookieStore.toString();
            if (cookieHeader) {
                headers["Cookie"] = cookieHeader;
            }
            const xsrfCookie = cookieStore.get("XSRF-TOKEN");
            if (xsrfCookie) {
                headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrfCookie.value);
            }
        } catch {
            // not in request context
        }

        try {
            const incomingHeaders = await nextHeaders();
            const authHeader = incomingHeaders.get("Authorization");
            if (authHeader) {
                headers["Authorization"] = authHeader;
            }
        } catch {
            // headers() not available
        }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            method,
            headers,
            body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorBody: Record<string, unknown> = {};
            try {
                errorBody = await response.json();
            } catch {
                // not JSON
            }

            throw new ApiError({
                message: (errorBody.message as string) ?? response.statusText,
                status: response.status,
                code: `HTTP_${response.status}`,
                errors: (errorBody.errors as Record<string, string[]>) ?? null,
                raw: errorBody,
            });
        }

        if (response.status === 204) return undefined as T;

        return (await response.json()) as T;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof ApiError) throw error;

        throw new ApiError({
            message: error instanceof Error ? error.message : "Server mutation failed",
            status: 0,
            code: "SERVER_MUTATE_ERROR",
            raw: error,
        });
    }
}

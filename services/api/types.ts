export interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
}


export interface PaginatedResponse<T> {
    data: T[];
    links: LaravelPaginationLinks;
    meta: LaravelPaginationMeta;
}

export interface LaravelPaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}


export interface LaravelPaginationMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
}


export interface LaravelValidationError {
    message: string;
    errors: Record<string, string[]>;
}


export interface MessageResponse {
    message: string;
}


export interface PaginationParams {
    page?: number;
    per_page?: number;
    sort?: string;
    direction?: "asc" | "desc";
    search?: string;
    [key: string]: string | number | boolean | undefined | null;
}


export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export interface RequestConfig extends Omit<RequestInit, "method" | "body"> {
    params?: Record<string, string | number | boolean | undefined | null>;
    timeout?: number;
    headers?: Record<string, string>;
    auth?: boolean;
    baseURL?: string;
    tags?: string[];
    revalidate?: number | false;
}

export type RequestInterceptor = (
    url: string,
    config: RequestInit
) => Promise<{ url: string; config: RequestInit }> | { url: string; config: RequestInit };

export type ResponseInterceptor = (
    response: Response,
    requestUrl: string
) => Promise<Response> | Response;

export type ErrorInterceptor = (
    error: unknown,
    requestUrl: string
) => Promise<never> | never;

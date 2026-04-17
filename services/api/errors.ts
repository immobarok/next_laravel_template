export class ApiError extends Error {
    public readonly status: number;
    public readonly code: string;
    public readonly errors: Record<string, string[]> | null;
    public readonly timestamp: string;
    public readonly raw: unknown;

    constructor(params: {
        message: string;
        status: number;
        code?: string;
        errors?: Record<string, string[]> | null;
        raw?: unknown;
    }) {
        super(params.message);
        this.name = "ApiError";
        this.status = params.status;
        this.code = params.code ?? "UNKNOWN_ERROR";
        this.errors = params.errors ?? null;
        this.timestamp = new Date().toISOString();
        this.raw = params.raw;

        // Maintains proper stack trace in V8
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }

    /** Check if this is a specific HTTP status */
    is(status: number): boolean {
        return this.status === status;
    }

    /** Check if this is a client error (4xx) */
    get isClientError(): boolean {
        return this.status >= 400 && this.status < 500;
    }

    /** Check if this is a server error (5xx) */
    get isServerError(): boolean {
        return this.status >= 500;
    }

    /** Check if this is an authentication error */
    get isUnauthorized(): boolean {
        return this.status === 401;
    }

    /** Check if this is a forbidden error */
    get isForbidden(): boolean {
        return this.status === 403;
    }

    /** Check if this has validation errors */
    get isValidationError(): boolean {
        return this.status === 422 && this.errors !== null;
    }

    /** Check if this is a network/timeout error */
    get isNetworkError(): boolean {
        return this.status === 0;
    }

    /** Get validation errors for a specific field */
    getFieldErrors(field: string): string[] {
        return this.errors?.[field] ?? [];
    }

    /** Serialize to a plain object (useful for logging) */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            code: this.code,
            errors: this.errors,
            timestamp: this.timestamp,
        };
    }
}

/**
 * Network error — thrown when fetch itself fails (no internet, DNS, CORS, etc.)
 */
export class NetworkError extends ApiError {
    constructor(message = "Network error. Please check your connection.") {
        super({ message, status: 0, code: "NETWORK_ERROR" });
        this.name = "NetworkError";
    }
}

export class TimeoutError extends ApiError {
    constructor(timeoutMs: number) {
        super({
            message: `Request timed out after ${timeoutMs}ms`,
            status: 0,
            code: "TIMEOUT_ERROR",
        });
        this.name = "TimeoutError";
    }
}

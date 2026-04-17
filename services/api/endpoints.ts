export const ENDPOINTS = {
    SANCTUM: {
        CSRF: "/sanctum/csrf-cookie",
    },

    AUTH: {
        LOGIN: "/auth/login",
        REGISTER: "/auth/register",
        LOGOUT: "/auth/logout",
        REFRESH: "/auth/refresh",
        FORGOT_PASSWORD: "/auth/forgot-password",
        RESET_PASSWORD: "/auth/reset-password",
        VERIFY_EMAIL: "/auth/verify-email",
        ME: "/auth/me",
    },

    USERS: {
        INDEX: "/users",
        SHOW: (id: string | number) => `/users/${id}` as const,
        UPDATE: (id: string | number) => `/users/${id}` as const,
        DESTROY: (id: string | number) => `/users/${id}` as const,
        AVATAR: (id: string | number) => `/users/${id}/avatar` as const,
    },
} as const;

const getEnvVar = (key: string, fallback?: string): string => {
    const value = process.env[key] ?? fallback;
    if (value === undefined) {
        throw new Error(
            `❌ Missing environment variable: ${key}. ` +
            `Please add it to your .env.local file.`
        );
    }
    return value;
};

export const env = {
    // ─── API ─────────────────────────────────────────────
    API_BASE_URL: getEnvVar("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3001/api"),
    API_TIMEOUT: Number(getEnvVar("NEXT_PUBLIC_API_TIMEOUT", "30000")),

    // ─── Auth ────────────────────────────────────────────
    AUTH_TOKEN_KEY: getEnvVar("NEXT_PUBLIC_AUTH_TOKEN_KEY", "access_token"),
    AUTH_REFRESH_TOKEN_KEY: getEnvVar("NEXT_PUBLIC_AUTH_REFRESH_TOKEN_KEY", "refresh_token"),

    // ─── App ─────────────────────────────────────────────
    APP_ENV: getEnvVar("NEXT_PUBLIC_APP_ENV", "development"),
    IS_DEV: getEnvVar("NEXT_PUBLIC_APP_ENV", "development") === "development",
    IS_PROD: getEnvVar("NEXT_PUBLIC_APP_ENV", "development") === "production",
} as const;

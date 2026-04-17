// ─── Services Barrel Export ──────────────────────────────
// Import all services from this single entry point.
//
// Client-side (hooks, components):
//   import { authService, userService } from "@/services";
//
// Server-side (Server Components, Server Actions):
//   import { serverFetch, serverMutate } from "@/services/api/server";

export { authService } from "./auth";
export { userService } from "./user";
export {
    apiClient,
    ENDPOINTS,
    ApiError,
    NetworkError,
    TimeoutError,
} from "./api";

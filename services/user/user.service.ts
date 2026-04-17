// ─── User Service (Laravel) ─────────────────────────────
// All user-related API calls.
// Uses Laravel resource controller naming (index, show, update, destroy).

import { apiClient, ENDPOINTS } from "@/services/api";
import type { ApiResponse, PaginatedResponse } from "@/services/api";
import type { User, UpdateUserRequest, UserListParams } from "./user.types";

export const userService = {
    /**
     * Get paginated list of users
     * Laravel: GET /api/users?page=1&per_page=15
     */
    index: async (params?: UserListParams): Promise<PaginatedResponse<User>> => {
        return apiClient.get<PaginatedResponse<User>>(ENDPOINTS.USERS.INDEX, {
            params: params as Record<string, string | number | boolean>,
        });
    },

    /**
     * Get single user by ID
     * Laravel: GET /api/users/{id}
     */
    show: async (id: string | number): Promise<ApiResponse<User>> => {
        return apiClient.get<ApiResponse<User>>(ENDPOINTS.USERS.SHOW(id));
    },

    /**
     * Update a user
     * Laravel: PATCH /api/users/{id}
     */
    update: async (id: string | number, data: UpdateUserRequest): Promise<ApiResponse<User>> => {
        return apiClient.patch<ApiResponse<User>>(ENDPOINTS.USERS.UPDATE(id), data);
    },

    /**
     * Delete a user
     * Laravel: DELETE /api/users/{id}
     */
    destroy: async (id: string | number): Promise<void> => {
        return apiClient.delete<void>(ENDPOINTS.USERS.DESTROY(id));
    },

    /**
     * Upload user avatar
     * Laravel: POST /api/users/{id}/avatar
     */
    uploadAvatar: async (id: string | number, file: File): Promise<ApiResponse<{ url: string }>> => {
        const formData = new FormData();
        formData.append("avatar", file);
        return apiClient.upload<ApiResponse<{ url: string }>>(
            ENDPOINTS.USERS.AVATAR(id),
            formData
        );
    },
} as const;

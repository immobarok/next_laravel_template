import type { PaginationParams } from "@/services/api";

export interface User {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
    phone?: string;
    bio?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface UpdateUserRequest {
    name?: string;
    phone?: string;
    bio?: string;
}

export interface UserListParams extends PaginationParams {
    role?: string;
    status?: string;
}

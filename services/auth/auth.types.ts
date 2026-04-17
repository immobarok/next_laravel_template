export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface AuthTokens {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in?: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface LoginResponse {
    user: User;
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in?: number;
}

export interface RegisterResponse {
    user: User;
    access_token: string;
    refresh_token?: string;
    token_type: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}

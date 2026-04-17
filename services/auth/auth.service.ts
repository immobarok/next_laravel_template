import { apiClient, ENDPOINTS } from "@/services/api";
import type { ApiResponse } from "@/services/api";
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    User,
} from "./auth.types";

export const authService = {
    login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
        await apiClient.initCsrf();

        const response = await apiClient.post<ApiResponse<LoginResponse>>(
            ENDPOINTS.AUTH.LOGIN,
            credentials,
            { auth: false }
        );

    if (response.data.access_token) {
            apiClient.tokens.setTokens(
                response.data.access_token,
                response.data.refresh_token
            );
        }

        return response;
    },

    register: async (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
        await apiClient.initCsrf();

        const response = await apiClient.post<ApiResponse<RegisterResponse>>(
            ENDPOINTS.AUTH.REGISTER,
            data,
            { auth: false }
        );

        if (response.data.access_token) {
            apiClient.tokens.setTokens(
                response.data.access_token,
                response.data.refresh_token
            );
        }

        return response;
    },


    logout: async (): Promise<void> => {
        try {
            await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
        } finally {
            apiClient.tokens.clearTokens();
        }
    },


    getMe: async (): Promise<ApiResponse<User>> => {
        return apiClient.get<ApiResponse<User>>(ENDPOINTS.AUTH.ME);
    },

 
    forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse<{ message: string }>> => {
        return apiClient.post<ApiResponse<{ message: string }>>(
            ENDPOINTS.AUTH.FORGOT_PASSWORD,
            data,
            { auth: false }
        );
    },


    resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse<{ message: string }>> => {
        return apiClient.post<ApiResponse<{ message: string }>>(
            ENDPOINTS.AUTH.RESET_PASSWORD,
            data,
            { auth: false }
        );
    },

    verifyEmail: async (token: string): Promise<ApiResponse<{ message: string }>> => {
        return apiClient.post<ApiResponse<{ message: string }>>(
            ENDPOINTS.AUTH.VERIFY_EMAIL,
            { token },
            { auth: false }
        );
    },
} as const;

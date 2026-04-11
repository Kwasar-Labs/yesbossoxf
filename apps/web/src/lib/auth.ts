import { apiClient } from "./api-client";
import type { ApiResponse } from "@yesboss/types";

export interface AuthUser {
  _id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

interface RegisterBody {
  email: string;
  name: string;
  password: string;
  organizationId?: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>("/auth/login", { email, password }),

  register: (data: RegisterBody) =>
    apiClient.post<LoginResponse>("/auth/register", data),

  me: () =>
    apiClient.get<ApiResponse<AuthUser>>("/auth/me"),
};

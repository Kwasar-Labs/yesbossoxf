export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    organizationId: string;
  };
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  organizationId: string;
}

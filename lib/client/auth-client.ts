import {
  AdminAuthResponse,
  AdminUserProfile,
  getAuthAPI,
  LoginRequest,
  TokenRefreshResponse,
} from '@sokol111/ecommerce-auth-service-api';

const baseURL = process.env.AUTH_API_URL;

const api = getAuthAPI();

export async function login(credentials: LoginRequest): Promise<AdminAuthResponse> {
  const response = await api.adminLogin(credentials, { baseURL });
  return response.data;
}

export async function getProfile(accessToken: string): Promise<AdminUserProfile> {
  const response = await api.adminGetProfile({
    baseURL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}

export async function refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
  const response = await api.tokenRefresh({ refreshToken }, { baseURL });
  return response.data;
}

export async function logout(): Promise<void> {
  await api.adminLogout({ baseURL });
}

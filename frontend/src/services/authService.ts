import { api } from './api';
import type { User } from '@velora/shared';

export interface AuthResponse {
  message?: string;
  token: string;
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

const TOKEN_KEY = 'velora_token';
const USER_KEY = 'velora_user';

export const authService = {
  /**
   * Register a new user account with the Express backend
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', payload);
      if (response.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
      }
      if (response.data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to create account. Please check your network connection.';
      throw new Error(message);
    }
  },

  /**
   * Authenticate an existing user with the Express backend
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', payload);
      if (response.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
      }
      if (response.data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to sign in. Please verify your email and password.';
      throw new Error(message);
    }
  },

  /**
   * Retrieve the authenticated user's current profile from /api/auth/me
   */
  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
      const response = await api.get<{ user: User }>('/auth/me');
      if (response.data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        return response.data.user;
      }
      return null;
    } catch (error: any) {
      console.warn('Could not verify session with backend:', error?.code || error?.response?.status || 'request failed');
      return null;
    }
  },

  /**
   * Log out the current user and remove stored credentials
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('velora_guest_order_tokens');
    localStorage.removeItem('velora_orders');
  },

  /**
   * Retrieve the stored token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
};

export default authService;

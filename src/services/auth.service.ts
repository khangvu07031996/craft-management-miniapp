import api from './api';
import type { LoginDto, RegisterDto, AuthResponse, User } from '../types/auth.types';
import type { ApiResponse } from '../types/api.types';

export const authService = {
  /**
   * Login user with email and password
   * 
   * Note: Password is sent in plain text in the request payload (this is normal and expected).
   * Security is ensured by:
   * - HTTPS encryption during transmission
   * - Server-side password hashing (bcrypt)
   * - No password logging on backend
   * 
   * Browser DevTools will show the password in the Network tab - this is normal browser behavior
   * and cannot be prevented. The password is encrypted by HTTPS before leaving the browser.
   */
  login: async (credentials: LoginDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};


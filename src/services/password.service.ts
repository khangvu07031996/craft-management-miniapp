import api from './api';
import type { ApiResponse } from '../types/api.types';

interface ResetPasswordResponse {
  newPassword: string;
}

export const passwordService = {
  /**
   * Reset user password (Admin only)
   * Generates a new secure password and returns it
   */
  resetUserPassword: async (userId: string): Promise<ApiResponse<ResetPasswordResponse>> => {
    const response = await api.post<ApiResponse<ResetPasswordResponse>>(`/users/${userId}/reset-password`);
    return response.data;
  },
};

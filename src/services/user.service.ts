import api from './api';
import type { CreateEmployeeAccountDto } from '../types/user.types';

export interface EmployeeAccountResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    employeeId?: string;
  };
  employee: {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateEmployeeAccountResponse {
  success: boolean;
  data: EmployeeAccountResponse;
  message?: string;
}

export const userService = {
  createEmployeeAccount: async (data: CreateEmployeeAccountDto): Promise<CreateEmployeeAccountResponse> => {
    const response = await api.post<CreateEmployeeAccountResponse>('/users/create-employee-account', data);
    return response.data;
  },
};


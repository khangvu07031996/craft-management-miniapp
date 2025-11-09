import api from './api';
import type {
  EmployeeResponse,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeFilters,
  PaginationParams,
  SortParams,
} from '../types/employee.types';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';

export const employeeService = {
  getAllEmployees: async (
    filters: EmployeeFilters = {},
    pagination: PaginationParams = { page: 1, pageSize: 10 },
    sort?: SortParams
  ): Promise<PaginatedResponse<EmployeeResponse>> => {
    const params = new URLSearchParams();
    
    if (filters.email) params.append('email', filters.email);
    if (filters.name) params.append('name', filters.name);
    if (filters.phoneNumber) params.append('phoneNumber', filters.phoneNumber);
    if (filters.department) params.append('department', filters.department);
    if (filters.managerId) params.append('managerId', filters.managerId);
    
    params.append('page', pagination.page.toString());
    params.append('pageSize', pagination.pageSize.toString());
    
    if (sort?.sortBy) params.append('sortBy', sort.sortBy);
    if (sort?.sortOrder) params.append('sortOrder', sort.sortOrder);

    const response = await api.get<PaginatedResponse<EmployeeResponse>>(
      `/employees?${params.toString()}`
    );
    return response.data;
  },

  getEmployeeById: async (id: string): Promise<ApiResponse<EmployeeResponse>> => {
    const response = await api.get<ApiResponse<EmployeeResponse>>(`/employees/${id}`);
    return response.data;
  },

  createEmployee: async (employeeData: CreateEmployeeDto): Promise<ApiResponse<EmployeeResponse>> => {
    const response = await api.post<ApiResponse<EmployeeResponse>>('/employees', employeeData);
    return response.data;
  },

  updateEmployee: async (
    id: string,
    employeeData: UpdateEmployeeDto
  ): Promise<ApiResponse<EmployeeResponse>> => {
    const response = await api.put<ApiResponse<EmployeeResponse>>(`/employees/${id}`, employeeData);
    return response.data;
  },

  deleteEmployee: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/employees/${id}`);
    return response.data;
  },

  getDepartmentStats: async (): Promise<ApiResponse<Array<{ department: string; count: number }>>> => {
    try {
      console.log('employeeService.getDepartmentStats: Calling API...');
      // Add timestamp to prevent caching
      const url = `/employees/stats/departments?_t=${Date.now()}`;
      const response = await api.get<ApiResponse<Array<{ department: string; count: number }>>>(
        url,
        {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        }
      );
      console.log('employeeService.getDepartmentStats: Response status:', response.status);
      console.log('employeeService.getDepartmentStats: Response data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('employeeService.getDepartmentStats: Error:', error);
      console.error('employeeService.getDepartmentStats: Error response:', error.response?.data);
      console.error('employeeService.getDepartmentStats: Error status:', error.response?.status);
      throw error;
    }
  },
};


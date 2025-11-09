import api from './api';
import type {
  WorkTypeResponse,
  CreateWorkTypeDto,
  UpdateWorkTypeDto,
  WorkItemResponse,
  CreateWorkItemDto,
  UpdateWorkItemDto,
  WorkRecordResponse,
  CreateWorkRecordDto,
  UpdateWorkRecordDto,
  MonthlySalaryResponse,
  CalculateMonthlySalaryDto,
  WorkReport,
  WorkReportParams,
  PaginationParams,
} from '../types/work.types';

// Work Types
export const workTypeService = {
  getAllWorkTypes: async (department?: string): Promise<WorkTypeResponse[]> => {
    const params = department ? { department } : {};
    const response = await api.get('/work/types', { params });
    return response.data.data;
  },

  getWorkTypeById: async (id: string): Promise<WorkTypeResponse> => {
    const response = await api.get(`/work/types/${id}`);
    return response.data.data;
  },

  createWorkType: async (data: CreateWorkTypeDto): Promise<WorkTypeResponse> => {
    const response = await api.post('/work/types', data);
    return response.data.data;
  },

  updateWorkType: async (id: string, data: UpdateWorkTypeDto): Promise<WorkTypeResponse> => {
    const response = await api.put(`/work/types/${id}`, data);
    return response.data.data;
  },

  deleteWorkType: async (id: string): Promise<void> => {
    await api.delete(`/work/types/${id}`);
  },
};

// Work Items
export const workItemService = {
  getAllWorkItems: async (difficultyLevel?: string): Promise<WorkItemResponse[]> => {
    const params = difficultyLevel ? { difficulty_level: difficultyLevel } : {};
    const response = await api.get('/work/items', { params });
    return response.data.data;
  },

  getWorkItemById: async (id: string): Promise<WorkItemResponse> => {
    const response = await api.get(`/work/items/${id}`);
    return response.data.data;
  },

  createWorkItem: async (data: CreateWorkItemDto): Promise<WorkItemResponse> => {
    const response = await api.post('/work/items', data);
    return response.data.data;
  },

  updateWorkItem: async (id: string, data: UpdateWorkItemDto): Promise<WorkItemResponse> => {
    const response = await api.put(`/work/items/${id}`, data);
    return response.data.data;
  },

  deleteWorkItem: async (id: string): Promise<void> => {
    await api.delete(`/work/items/${id}`);
  },
};

// Work Records
export const workRecordService = {
  getAllWorkRecords: async (
    filters: {
      employeeId?: string;
      dateFrom?: string;
      dateTo?: string;
      workTypeId?: string;
    },
    pagination?: PaginationParams
  ): Promise<{ data: WorkRecordResponse[]; pagination: PaginationParams }> => {
    const params: any = { ...filters };
    if (pagination) {
      params.page = pagination.page;
      params.page_size = pagination.pageSize;
    }
    const response = await api.get('/work/records', { params });
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  getWorkRecordById: async (id: string): Promise<WorkRecordResponse> => {
    const response = await api.get(`/work/records/${id}`);
    return response.data.data;
  },

  createWorkRecord: async (data: CreateWorkRecordDto): Promise<WorkRecordResponse> => {
    const response = await api.post('/work/records', data);
    return response.data.data;
  },

  updateWorkRecord: async (id: string, data: UpdateWorkRecordDto): Promise<WorkRecordResponse> => {
    const response = await api.put(`/work/records/${id}`, data);
    return response.data.data;
  },

  deleteWorkRecord: async (id: string): Promise<void> => {
    await api.delete(`/work/records/${id}`);
  },

  getWorkRecordsByEmployeeAndMonth: async (
    employeeId: string,
    year: number,
    month: number
  ): Promise<WorkRecordResponse[]> => {
    const response = await api.get('/work/records/by-employee-month', {
      params: { employee_id: employeeId, year, month },
    });
    return response.data.data;
  },
};

// Monthly Salaries
export const monthlySalaryService = {
  getAllMonthlySalaries: async (
    filters: {
      employeeId?: string;
      year?: number;
      month?: number;
    },
    pagination?: PaginationParams
  ): Promise<{ data: MonthlySalaryResponse[]; pagination: PaginationParams }> => {
    const params: any = {};
    
    if (filters.employeeId) {
      params.employee_id = filters.employeeId;
    }
    if (filters.year) {
      params.year = filters.year;
    }
    if (filters.month) {
      params.month = filters.month;
    }
    
    if (pagination) {
      params.page = pagination.page;
      params.page_size = pagination.pageSize;
    }
    
    const response = await api.get('/work/monthly-salaries', { params });
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  getMonthlySalaryById: async (id: string): Promise<MonthlySalaryResponse> => {
    const response = await api.get(`/work/monthly-salaries/${id}`);
    return response.data.data;
  },

  calculateMonthlySalary: async (data: CalculateMonthlySalaryDto): Promise<MonthlySalaryResponse> => {
    const response = await api.post('/work/calculate-monthly', data);
    return response.data.data;
  },

  updateMonthlySalaryStatus: async (
    id: string,
    status: 'draft' | 'confirmed' | 'paid'
  ): Promise<MonthlySalaryResponse> => {
    const response = await api.put(`/work/monthly-salaries/${id}/status`, { status });
    return response.data.data;
  },
};

// Reports
export const workReportService = {
  getWeeklyReport: async (params: WorkReportParams): Promise<WorkReport> => {
    const response = await api.get('/work/reports/weekly', { params });
    return response.data.data;
  },

  getMonthlyReport: async (params: WorkReportParams): Promise<WorkReport> => {
    const response = await api.get('/work/reports/monthly', { params });
    return response.data.data;
  },
};

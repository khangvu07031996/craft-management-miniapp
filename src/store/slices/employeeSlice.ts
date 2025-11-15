import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { employeeService } from '../../services/employee.service';
import type {
  EmployeeResponse,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeFilters,
  PaginationParams,
  SortParams,
} from '../../types/employee.types';

interface EmployeeState {
  employees: EmployeeResponse[];
  currentEmployee: EmployeeResponse | null;
  filters: EmployeeFilters;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  sort: SortParams;
  departmentStats: Array<{ department: string; count: number }>;
  isLoading: boolean;
  isLoadingFetch: boolean;
  isLoadingCreate: boolean;
  isLoadingUpdate: boolean;
  isLoadingDelete: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  employees: [],
  currentEmployee: null,
  filters: {},
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  sort: {
    sortBy: 'created_at',
    sortOrder: 'desc',
  },
  departmentStats: [],
  isLoading: false,
  isLoadingFetch: false,
  isLoadingCreate: false,
  isLoadingUpdate: false,
  isLoadingDelete: false,
  error: null,
};

export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (
    { filters, pagination, sort }: { filters?: EmployeeFilters; pagination?: PaginationParams; sort?: SortParams },
    { rejectWithValue }
  ) => {
    try {
      const response = await employeeService.getAllEmployees(
        filters || {},
        pagination || { page: 1, pageSize: 10 },
        sort
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employees');
    }
  }
);

export const fetchEmployeeById = createAsyncThunk(
  'employees/fetchEmployeeById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await employeeService.getEmployeeById(id);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch employee');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employee');
    }
  }
);

export const fetchDepartmentStats = createAsyncThunk(
  'employees/fetchDepartmentStats',
  async (_, { rejectWithValue }) => {
    try {
      console.log('fetchDepartmentStats: Calling service...');
      const response = await employeeService.getDepartmentStats();
      console.log('fetchDepartmentStats: Service response:', response);
      
      if (response.success) {
        // Handle both array and undefined/null cases
        const data = response.data || [];
        console.log('fetchDepartmentStats: Returning data:', data);
        return Array.isArray(data) ? data : [];
      }
      
      console.warn('fetchDepartmentStats: Response not successful:', response);
      return rejectWithValue(response.message || 'Failed to fetch department statistics');
    } catch (error: any) {
      console.error('fetchDepartmentStats: Error caught:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch department statistics';
      console.error('fetchDepartmentStats: Error message:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (employeeData: CreateEmployeeDto, { rejectWithValue }) => {
    try {
      const response = await employeeService.createEmployee(employeeData);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to create employee');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create employee');
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, employeeData }: { id: string; employeeData: UpdateEmployeeDto }, { rejectWithValue }) => {
    try {
      const response = await employeeService.updateEmployee(id, employeeData);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to update employee');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update employee');
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployee',
  async (id: string, { rejectWithValue }) => {
    try {
      await employeeService.deleteEmployee(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete employee');
    }
  }
);

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<EmployeeFilters>) => {
      state.filters = action.payload;
      state.pagination.page = 1; // Reset to first page when filters change
    },
    setPagination: (state, action: PayloadAction<PaginationParams>) => {
      state.pagination.page = action.payload.page;
      state.pagination.pageSize = 10; // Always keep pageSize as 10
    },
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSort: (state, action: PayloadAction<SortParams>) => {
      state.sort = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Employees
      .addCase(fetchEmployees.pending, (state) => {
        state.isLoading = true;
        state.isLoadingFetch = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingFetch = false;
        state.employees = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingFetch = false;
        state.error = action.payload as string;
      })
      // Fetch Employee By ID
      .addCase(fetchEmployeeById.pending, (state) => {
        state.isLoading = true;
        state.isLoadingFetch = true;
        state.error = null;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingFetch = false;
        state.currentEmployee = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingFetch = false;
        state.error = action.payload as string;
      })
      // Create Employee
      .addCase(createEmployee.pending, (state) => {
        state.isLoadingCreate = true;
        state.error = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.isLoadingCreate = false;
        state.employees.unshift(action.payload);
        state.error = null;
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.isLoadingCreate = false;
        state.error = action.payload as string;
      })
      // Update Employee
      .addCase(updateEmployee.pending, (state) => {
        state.isLoadingUpdate = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.isLoadingUpdate = false;
        const index = state.employees.findIndex((emp) => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
        if (state.currentEmployee?.id === action.payload.id) {
          state.currentEmployee = action.payload;
        }
        state.error = null;
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.isLoadingUpdate = false;
        state.error = action.payload as string;
      })
      // Delete Employee
      .addCase(deleteEmployee.pending, (state) => {
        state.isLoadingDelete = true;
        state.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.isLoadingDelete = false;
        state.employees = state.employees.filter((emp) => emp.id !== action.payload);
        if (state.currentEmployee?.id === action.payload) {
          state.currentEmployee = null;
        }
        state.error = null;
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.isLoadingDelete = false;
        state.error = action.payload as string;
      })
      // Fetch Department Stats
      .addCase(fetchDepartmentStats.pending, (state) => {
        state.isLoading = true;
        state.isLoadingFetch = true;
        state.error = null;
        console.log('fetchDepartmentStats.pending: Setting loading to true');
      })
      .addCase(fetchDepartmentStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingFetch = false;
        state.departmentStats = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
        console.log('fetchDepartmentStats.fulfilled: Stats set:', state.departmentStats);
      })
      .addCase(fetchDepartmentStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingFetch = false;
        state.error = action.payload as string;
        state.departmentStats = [];
        console.error('fetchDepartmentStats.rejected: Error:', action.payload);
      });
  },
});

export const { setFilters, setPagination, clearCurrentEmployee, clearError, setSort } = employeeSlice.actions;
export default employeeSlice.reducer;


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  workTypeService,
  workItemService,
  workRecordService,
  monthlySalaryService,
  workReportService,
  overtimeConfigService,
} from '../../services/work.service';
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
  OvertimeConfigResponse,
  CreateOvertimeConfigDto,
  UpdateOvertimeConfigDto,
} from '../../types/work.types';

interface WorkState {
  workTypes: WorkTypeResponse[];
  workItems: WorkItemResponse[];
  workRecords: WorkRecordResponse[];
  monthlySalaries: MonthlySalaryResponse[];
  weeklyReport: WorkReport | null;
  monthlyReport: WorkReport | null;
  overtimeConfigs: OvertimeConfigResponse[];
  pagination: PaginationParams;
  isLoading: boolean;
  isLoadingFetch: boolean;
  isLoadingCreate: boolean;
  isLoadingUpdate: boolean;
  isLoadingDelete: boolean;
  error: string | null;
}

const initialState: WorkState = {
  workTypes: [],
  workItems: [],
  workRecords: [],
  monthlySalaries: [],
  weeklyReport: null,
  monthlyReport: null,
  overtimeConfigs: [],
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  isLoadingFetch: false,
  isLoadingCreate: false,
  isLoadingUpdate: false,
  isLoadingDelete: false,
  error: null,
};

// Work Types Thunks
export const fetchWorkTypes = createAsyncThunk(
  'work/fetchWorkTypes',
  async (department: string | undefined, { rejectWithValue }) => {
    try {
      const data = await workTypeService.getAllWorkTypes(department);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch work types');
    }
  }
);

export const createWorkType = createAsyncThunk(
  'work/createWorkType',
  async (data: CreateWorkTypeDto, { rejectWithValue }) => {
    try {
      const response = await workTypeService.createWorkType(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create work type');
    }
  }
);

export const updateWorkType = createAsyncThunk(
  'work/updateWorkType',
  async ({ id, data }: { id: string; data: UpdateWorkTypeDto }, { rejectWithValue }) => {
    try {
      const response = await workTypeService.updateWorkType(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update work type');
    }
  }
);

export const deleteWorkType = createAsyncThunk(
  'work/deleteWorkType',
  async (id: string, { rejectWithValue }) => {
    try {
      await workTypeService.deleteWorkType(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete work type');
    }
  }
);

// Work Items Thunks
export const fetchWorkItems = createAsyncThunk(
  'work/fetchWorkItems',
  async (difficultyLevel: string | undefined, { rejectWithValue }) => {
    try {
      const data = await workItemService.getAllWorkItems(difficultyLevel);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch work items');
    }
  }
);

export const createWorkItem = createAsyncThunk(
  'work/createWorkItem',
  async (workItemData: CreateWorkItemDto, { rejectWithValue }) => {
    try {
      const data = await workItemService.createWorkItem(workItemData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create work item');
    }
  }
);

export const updateWorkItem = createAsyncThunk(
  'work/updateWorkItem',
  async ({ id, data }: { id: string; data: UpdateWorkItemDto }, { rejectWithValue }) => {
    try {
      const result = await workItemService.updateWorkItem(id, data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update work item');
    }
  }
);

export const deleteWorkItem = createAsyncThunk(
  'work/deleteWorkItem',
  async (id: string, { rejectWithValue }) => {
    try {
      await workItemService.deleteWorkItem(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete work item');
    }
  }
);

// Work Records Thunks
export const fetchWorkRecords = createAsyncThunk(
  'work/fetchWorkRecords',
  async (
    {
      filters,
      pagination,
    }: {
      filters: {
        employeeId?: string;
        dateFrom?: string;
        dateTo?: string;
        workTypeId?: string;
      };
      pagination?: PaginationParams;
    },
    { rejectWithValue }
  ) => {
    try {
      const result = await workRecordService.getAllWorkRecords(filters, pagination);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch work records');
    }
  }
);

export const createWorkRecord = createAsyncThunk(
  'work/createWorkRecord',
  async (workRecordData: CreateWorkRecordDto, { rejectWithValue }) => {
    try {
      const data = await workRecordService.createWorkRecord(workRecordData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create work record');
    }
  }
);

export const updateWorkRecord = createAsyncThunk(
  'work/updateWorkRecord',
  async ({ id, data }: { id: string; data: UpdateWorkRecordDto }, { rejectWithValue }) => {
    try {
      const result = await workRecordService.updateWorkRecord(id, data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update work record');
    }
  }
);

export const deleteWorkRecord = createAsyncThunk(
  'work/deleteWorkRecord',
  async (id: string, { rejectWithValue }) => {
    try {
      await workRecordService.deleteWorkRecord(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete work record');
    }
  }
);

export const fetchWorkRecordsByEmployeeAndMonth = createAsyncThunk(
  'work/fetchWorkRecordsByEmployeeAndMonth',
  async ({ employeeId, year, month }: { employeeId: string; year: number; month: number }, { rejectWithValue }) => {
    try {
      const response = await workRecordService.getWorkRecordsByEmployeeAndMonth(employeeId, year, month);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch work records for employee and month');
    }
  }
);

export const fetchTotalQuantityMadeByWorkItem = createAsyncThunk(
  'work/fetchTotalQuantityMadeByWorkItem',
  async ({ workItemId, excludeRecordId }: { workItemId: string; excludeRecordId?: string }, { rejectWithValue }) => {
    try {
      const totalQuantity = await workRecordService.getTotalQuantityMadeByWorkItem(workItemId, excludeRecordId);
      return { workItemId, totalQuantity };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch total quantity made');
    }
  }
);

export const fetchTotalHoursWorkedInDay = createAsyncThunk(
  'work/fetchTotalHoursWorkedInDay',
  async ({ employeeId, workDate, excludeRecordId }: { employeeId: string; workDate: string; excludeRecordId?: string }, { rejectWithValue }) => {
    try {
      const totalHours = await workRecordService.getTotalHoursWorkedInDay(employeeId, workDate, excludeRecordId);
      return { employeeId, workDate, totalHours };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch total hours worked');
    }
  }
);

// Monthly Salaries Thunks
export const fetchMonthlySalaries = createAsyncThunk(
  'work/fetchMonthlySalaries',
  async (
    {
      filters,
      pagination,
    }: {
      filters: {
        employeeId?: string;
        year?: number;
        month?: number;
      };
      pagination?: PaginationParams;
    },
    { rejectWithValue }
  ) => {
    try {
      const result = await monthlySalaryService.getAllMonthlySalaries(filters, pagination);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch monthly salaries');
    }
  }
);

export const calculateMonthlySalary = createAsyncThunk(
  'work/calculateMonthlySalary',
  async (data: CalculateMonthlySalaryDto, { rejectWithValue }) => {
    try {
      const result = await monthlySalaryService.calculateMonthlySalary(data);
      return result;
    } catch (error: any) {
      // Try to get message from response data (could be in message or error field)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to calculate monthly salary';
      return rejectWithValue(errorMessage);
    }
  }
);

export const calculateMonthlySalaryForAll = createAsyncThunk(
  'work/calculateMonthlySalaryForAll',
  async (data: { year: number; month: number }, { rejectWithValue }) => {
    try {
      const result = await monthlySalaryService.calculateMonthlySalaryForAll(data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to calculate monthly salary for all employees');
    }
  }
);

export const updateMonthlySalaryAllowances = createAsyncThunk(
  'work/updateMonthlySalaryAllowances',
  async ({ id, allowances }: { id: string; allowances: number }, { rejectWithValue }) => {
    try {
      const result = await monthlySalaryService.updateAllowances(id, allowances);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update monthly salary allowances');
    }
  }
);

export const payMonthlySalary = createAsyncThunk(
  'work/payMonthlySalary',
  async (id: string, { rejectWithValue }) => {
    try {
      const result = await monthlySalaryService.payMonthlySalary(id);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to pay monthly salary');
    }
  }
);

export const deleteMonthlySalary = createAsyncThunk(
  'work/deleteMonthlySalary',
  async (id: string, { rejectWithValue }) => {
    try {
      await monthlySalaryService.deleteMonthlySalary(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete monthly salary');
    }
  }
);

// Reports Thunks
export const fetchWeeklyReport = createAsyncThunk(
  'work/fetchWeeklyReport',
  async (params: WorkReportParams, { rejectWithValue }) => {
    try {
      const data = await workReportService.getWeeklyReport(params);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch weekly report');
    }
  }
);

export const fetchMonthlyReport = createAsyncThunk(
  'work/fetchMonthlyReport',
  async (params: WorkReportParams, { rejectWithValue }) => {
    try {
      const data = await workReportService.getMonthlyReport(params);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch monthly report');
    }
  }
);

// Overtime Config Thunks
export const fetchOvertimeConfigs = createAsyncThunk(
  'work/fetchOvertimeConfigs',
  async (_, { rejectWithValue }) => {
    try {
      const data = await overtimeConfigService.getAllOvertimeConfigs();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch overtime configs');
    }
  }
);

export const fetchOvertimeConfigByWorkTypeId = createAsyncThunk(
  'work/fetchOvertimeConfigByWorkTypeId',
  async (workTypeId: string, { rejectWithValue }) => {
    try {
      const data = await overtimeConfigService.getOvertimeConfigByWorkTypeId(workTypeId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch overtime config');
    }
  }
);

export const createOvertimeConfig = createAsyncThunk(
  'work/createOvertimeConfig',
  async (data: CreateOvertimeConfigDto, { rejectWithValue }) => {
    try {
      const response = await overtimeConfigService.createOvertimeConfig(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create overtime config');
    }
  }
);

export const updateOvertimeConfig = createAsyncThunk(
  'work/updateOvertimeConfig',
  async (
    { workTypeId, data }: { workTypeId: string; data: UpdateOvertimeConfigDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await overtimeConfigService.updateOvertimeConfig(workTypeId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update overtime config');
    }
  }
);

export const deleteOvertimeConfig = createAsyncThunk(
  'work/deleteOvertimeConfig',
  async (workTypeId: string, { rejectWithValue }) => {
    try {
      await overtimeConfigService.deleteOvertimeConfig(workTypeId);
      return workTypeId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete overtime config');
    }
  }
);

const workSlice = createSlice({
  name: 'work',
  initialState,
  reducers: {
    setPagination: (state, action: PayloadAction<PaginationParams>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearReports: (state) => {
      state.weeklyReport = null;
      state.monthlyReport = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Work Types
      .addCase(fetchWorkTypes.pending, (state) => {
        state.isLoading = true;
        state.isLoadingFetch = true;
        state.error = null;
      })
      .addCase(fetchWorkTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingFetch = false;
        const uniqueMap = new Map<string, typeof action.payload[0]>();
        action.payload.forEach((workType) => {
          uniqueMap.set(workType.id, workType);
        });
        state.workTypes = Array.from(uniqueMap.values());
        state.error = null;
      })
      .addCase(fetchWorkTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingFetch = false;
        state.error = action.payload as string;
      })
      .addCase(createWorkType.pending, (state) => {
        state.isLoadingCreate = true;
        state.error = null;
      })
      .addCase(createWorkType.fulfilled, (state) => {
        state.isLoadingCreate = false;
        // Don't update state here - let fetchWorkTypes handle it
      })
      .addCase(createWorkType.rejected, (state, action) => {
        state.isLoadingCreate = false;
        state.error = action.payload as string;
      })
      .addCase(updateWorkType.pending, (state) => {
        state.isLoadingUpdate = true;
        state.error = null;
      })
      .addCase(updateWorkType.fulfilled, (state) => {
        state.isLoadingUpdate = false;
        // Don't update state here - let fetchWorkTypes handle it
      })
      .addCase(updateWorkType.rejected, (state, action) => {
        state.isLoadingUpdate = false;
        state.error = action.payload as string;
      })
      .addCase(deleteWorkType.pending, (state) => {
        state.isLoadingDelete = true;
        state.error = null;
      })
      .addCase(deleteWorkType.fulfilled, (state) => {
        state.isLoadingDelete = false;
        // Don't update state here - let fetchWorkTypes handle it
      })
      .addCase(deleteWorkType.rejected, (state, action) => {
        state.isLoadingDelete = false;
        state.error = action.payload as string;
      })
      // Work Items
      .addCase(fetchWorkItems.pending, (state) => {
        state.isLoading = true;
        state.isLoadingFetch = true;
        state.error = null;
      })
      .addCase(fetchWorkItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingFetch = false;
        state.workItems = action.payload;
        state.error = null;
      })
      .addCase(fetchWorkItems.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingFetch = false;
        state.error = action.payload as string;
      })
      .addCase(createWorkItem.pending, (state) => {
        state.isLoadingCreate = true;
        state.error = null;
      })
      .addCase(createWorkItem.fulfilled, (state, action) => {
        state.isLoadingCreate = false;
        state.workItems.push(action.payload);
      })
      .addCase(createWorkItem.rejected, (state, action) => {
        state.isLoadingCreate = false;
        state.error = action.payload as string;
      })
      .addCase(updateWorkItem.pending, (state) => {
        state.isLoadingUpdate = true;
        state.error = null;
      })
      .addCase(updateWorkItem.fulfilled, (state, action) => {
        state.isLoadingUpdate = false;
        const index = state.workItems.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.workItems[index] = action.payload;
        }
      })
      .addCase(updateWorkItem.rejected, (state, action) => {
        state.isLoadingUpdate = false;
        state.error = action.payload as string;
      })
      .addCase(deleteWorkItem.pending, (state) => {
        state.isLoadingDelete = true;
        state.error = null;
      })
      .addCase(deleteWorkItem.fulfilled, (state, action) => {
        state.isLoadingDelete = false;
        state.workItems = state.workItems.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteWorkItem.rejected, (state, action) => {
        state.isLoadingDelete = false;
        state.error = action.payload as string;
      })
      // Work Records
      .addCase(fetchWorkRecords.pending, (state) => {
        state.isLoading = true;
        state.isLoadingFetch = true;
        state.error = null;
      })
      .addCase(fetchWorkRecords.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingFetch = false;
        state.workRecords = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchWorkRecords.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingFetch = false;
        state.error = action.payload as string;
      })
      .addCase(createWorkRecord.pending, (state) => {
        state.isLoadingCreate = true;
        state.error = null;
      })
      .addCase(createWorkRecord.fulfilled, (state, action) => {
        state.isLoadingCreate = false;
        state.workRecords.unshift(action.payload);
      })
      .addCase(createWorkRecord.rejected, (state, action) => {
        state.isLoadingCreate = false;
        state.error = action.payload as string;
      })
      .addCase(updateWorkRecord.pending, (state) => {
        state.isLoadingUpdate = true;
        state.error = null;
      })
      .addCase(updateWorkRecord.fulfilled, (state, action) => {
        state.isLoadingUpdate = false;
        const index = state.workRecords.findIndex((record) => record.id === action.payload.id);
        if (index !== -1) {
          state.workRecords[index] = action.payload;
        }
      })
      .addCase(updateWorkRecord.rejected, (state, action) => {
        state.isLoadingUpdate = false;
        state.error = action.payload as string;
      })
      .addCase(deleteWorkRecord.pending, (state) => {
        state.isLoadingDelete = true;
        state.error = null;
      })
      .addCase(deleteWorkRecord.fulfilled, (state, action) => {
        state.isLoadingDelete = false;
        state.workRecords = state.workRecords.filter((record) => record.id !== action.payload);
      })
      .addCase(deleteWorkRecord.rejected, (state, action) => {
        state.isLoadingDelete = false;
        state.error = action.payload as string;
      })
      .addCase(fetchWorkRecordsByEmployeeAndMonth.pending, (state) => {
        state.isLoading = true;
        state.isLoadingFetch = true;
        state.error = null;
      })
      .addCase(fetchWorkRecordsByEmployeeAndMonth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingFetch = false;
        state.workRecords = action.payload;
        state.error = null;
      })
      .addCase(fetchWorkRecordsByEmployeeAndMonth.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingFetch = false;
        state.error = action.payload as string;
      })
      // Monthly Salaries
      .addCase(fetchMonthlySalaries.pending, (state) => {
        state.isLoading = true;
        state.isLoadingFetch = true;
        state.error = null;
      })
      .addCase(fetchMonthlySalaries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingFetch = false;
        state.monthlySalaries = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchMonthlySalaries.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingFetch = false;
        state.error = action.payload as string;
      })
      .addCase(calculateMonthlySalary.pending, (state) => {
        state.isLoadingCreate = true;
        state.error = null;
      })
      .addCase(calculateMonthlySalary.fulfilled, (state, action) => {
        state.isLoadingCreate = false;
        const index = state.monthlySalaries.findIndex(
          (salary) => salary.id === action.payload.id
        );
        if (index !== -1) {
          state.monthlySalaries[index] = action.payload;
        } else {
          state.monthlySalaries.push(action.payload);
        }
      })
      .addCase(calculateMonthlySalary.rejected, (state, action) => {
        state.isLoadingCreate = false;
        state.error = action.payload as string;
      })
      .addCase(updateMonthlySalaryAllowances.pending, (state) => {
        state.isLoadingUpdate = true;
        state.error = null;
      })
      .addCase(updateMonthlySalaryAllowances.fulfilled, (state, action) => {
        state.isLoadingUpdate = false;
        const index = state.monthlySalaries.findIndex(
          (salary) => salary.id === action.payload.id
        );
        if (index !== -1) {
          state.monthlySalaries[index] = action.payload;
        }
      })
      .addCase(updateMonthlySalaryAllowances.rejected, (state, action) => {
        state.isLoadingUpdate = false;
        state.error = action.payload as string;
      })
      .addCase(payMonthlySalary.pending, (state) => {
        state.isLoadingUpdate = true;
        state.error = null;
      })
      .addCase(payMonthlySalary.fulfilled, (state, action) => {
        state.isLoadingUpdate = false;
        const index = state.monthlySalaries.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.monthlySalaries[index] = action.payload;
      })
      .addCase(payMonthlySalary.rejected, (state, action) => {
        state.isLoadingUpdate = false;
        state.error = action.payload as string;
      })
      .addCase(deleteMonthlySalary.pending, (state) => {
        state.isLoadingDelete = true;
        state.error = null;
      })
      .addCase(deleteMonthlySalary.fulfilled, (state, action) => {
        state.isLoadingDelete = false;
        state.monthlySalaries = state.monthlySalaries.filter((s) => s.id !== action.payload);
      })
      .addCase(deleteMonthlySalary.rejected, (state, action) => {
        state.isLoadingDelete = false;
        state.error = action.payload as string;
      })
      // Reports
      .addCase(fetchWeeklyReport.pending, (state) => {
        state.isLoading = true;
        state.isLoadingFetch = true;
        state.error = null;
      })
      .addCase(fetchWeeklyReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingFetch = false;
        state.weeklyReport = action.payload;
        state.error = null;
      })
      .addCase(fetchWeeklyReport.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingFetch = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMonthlyReport.pending, (state) => {
        state.isLoading = true;
        state.isLoadingFetch = true;
        state.error = null;
      })
      .addCase(fetchMonthlyReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingFetch = false;
        state.monthlyReport = action.payload;
        state.error = null;
      })
      .addCase(fetchMonthlyReport.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingFetch = false;
        state.error = action.payload as string;
      })
      // Overtime Configs
      .addCase(fetchOvertimeConfigs.pending, (state) => {
        state.isLoading = true;
        state.isLoadingFetch = true;
        state.error = null;
      })
      .addCase(fetchOvertimeConfigs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingFetch = false;
        state.overtimeConfigs = action.payload;
        state.error = null;
      })
      .addCase(fetchOvertimeConfigs.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingFetch = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOvertimeConfigByWorkTypeId.pending, (state) => {
        state.isLoadingFetch = true;
        state.error = null;
      })
      .addCase(fetchOvertimeConfigByWorkTypeId.fulfilled, (state, action) => {
        state.isLoadingFetch = false;
        const index = state.overtimeConfigs.findIndex(
          (config) => config.workTypeId === action.payload.workTypeId
        );
        if (index !== -1) {
          state.overtimeConfigs[index] = action.payload;
        } else {
          state.overtimeConfigs.push(action.payload);
        }
      })
      .addCase(fetchOvertimeConfigByWorkTypeId.rejected, (state, action) => {
        state.isLoadingFetch = false;
        state.error = action.payload as string;
      })
      .addCase(createOvertimeConfig.pending, (state) => {
        state.isLoadingCreate = true;
        state.error = null;
      })
      .addCase(createOvertimeConfig.fulfilled, (state, action) => {
        state.isLoadingCreate = false;
        const index = state.overtimeConfigs.findIndex(
          (config) => config.workTypeId === action.payload.workTypeId
        );
        if (index !== -1) {
          state.overtimeConfigs[index] = action.payload;
        } else {
          state.overtimeConfigs.push(action.payload);
        }
      })
      .addCase(createOvertimeConfig.rejected, (state, action) => {
        state.isLoadingCreate = false;
        state.error = action.payload as string;
      })
      .addCase(updateOvertimeConfig.pending, (state) => {
        state.isLoadingUpdate = true;
        state.error = null;
      })
      .addCase(updateOvertimeConfig.fulfilled, (state, action) => {
        state.isLoadingUpdate = false;
        const index = state.overtimeConfigs.findIndex(
          (config) => config.workTypeId === action.payload.workTypeId
        );
        if (index !== -1) {
          state.overtimeConfigs[index] = action.payload;
        } else {
          state.overtimeConfigs.push(action.payload);
        }
      })
      .addCase(updateOvertimeConfig.rejected, (state, action) => {
        state.isLoadingUpdate = false;
        state.error = action.payload as string;
      })
      .addCase(deleteOvertimeConfig.pending, (state) => {
        state.isLoadingDelete = true;
        state.error = null;
      })
      .addCase(deleteOvertimeConfig.fulfilled, (state, action) => {
        state.isLoadingDelete = false;
        state.overtimeConfigs = state.overtimeConfigs.filter(
          (config) => config.workTypeId !== action.payload
        );
      })
      .addCase(deleteOvertimeConfig.rejected, (state, action) => {
        state.isLoadingDelete = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPagination, clearError, clearReports } = workSlice.actions;
export default workSlice.reducer;

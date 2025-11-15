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
  error: null,
};

// Work Types Thunks
export const fetchWorkTypes = createAsyncThunk(
  'work/fetchWorkTypes',
  async (department?: string, { rejectWithValue }) => {
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
  async (difficultyLevel?: string, { rejectWithValue }) => {
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
      return rejectWithValue(error.response?.data?.message || 'Failed to calculate monthly salary');
    }
  }
);

export const updateMonthlySalaryStatus = createAsyncThunk(
  'work/updateMonthlySalaryStatus',
  async (
    { id, status }: { id: string; status: 'draft' | 'confirmed' | 'paid' },
    { rejectWithValue }
  ) => {
    try {
      const result = await monthlySalaryService.updateMonthlySalaryStatus(id, status);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update monthly salary status');
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
        state.error = null;
      })
      .addCase(fetchWorkTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        const uniqueMap = new Map<string, typeof action.payload[0]>();
        action.payload.forEach((workType) => {
          uniqueMap.set(workType.id, workType);
        });
        state.workTypes = Array.from(uniqueMap.values());
        state.error = null;
      })
      .addCase(fetchWorkTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createWorkType.fulfilled, (state) => {
        // Don't update state here - let fetchWorkTypes handle it
      })
      .addCase(updateWorkType.fulfilled, (state) => {
        // Don't update state here - let fetchWorkTypes handle it
      })
      .addCase(deleteWorkType.fulfilled, (state) => {
        // Don't update state here - let fetchWorkTypes handle it
      })
      // Work Items
      .addCase(fetchWorkItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workItems = action.payload;
        state.error = null;
      })
      .addCase(fetchWorkItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createWorkItem.fulfilled, (state, action) => {
        state.workItems.push(action.payload);
      })
      .addCase(updateWorkItem.fulfilled, (state, action) => {
        const index = state.workItems.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.workItems[index] = action.payload;
        }
      })
      .addCase(deleteWorkItem.fulfilled, (state, action) => {
        state.workItems = state.workItems.filter((item) => item.id !== action.payload);
      })
      // Work Records
      .addCase(fetchWorkRecords.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkRecords.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workRecords = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchWorkRecords.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createWorkRecord.fulfilled, (state, action) => {
        state.workRecords.unshift(action.payload);
      })
      .addCase(updateWorkRecord.fulfilled, (state, action) => {
        const index = state.workRecords.findIndex((record) => record.id === action.payload.id);
        if (index !== -1) {
          state.workRecords[index] = action.payload;
        }
      })
      .addCase(deleteWorkRecord.fulfilled, (state, action) => {
        state.workRecords = state.workRecords.filter((record) => record.id !== action.payload);
      })
      .addCase(fetchWorkRecordsByEmployeeAndMonth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkRecordsByEmployeeAndMonth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workRecords = action.payload;
        state.error = null;
      })
      .addCase(fetchWorkRecordsByEmployeeAndMonth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Monthly Salaries
      .addCase(fetchMonthlySalaries.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMonthlySalaries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.monthlySalaries = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchMonthlySalaries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(calculateMonthlySalary.fulfilled, (state, action) => {
        const index = state.monthlySalaries.findIndex(
          (salary) => salary.id === action.payload.id
        );
        if (index !== -1) {
          state.monthlySalaries[index] = action.payload;
        } else {
          state.monthlySalaries.push(action.payload);
        }
      })
      .addCase(updateMonthlySalaryStatus.fulfilled, (state, action) => {
        const index = state.monthlySalaries.findIndex(
          (salary) => salary.id === action.payload.id
        );
        if (index !== -1) {
          state.monthlySalaries[index] = action.payload;
        }
      })
      // Reports
      .addCase(fetchWeeklyReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWeeklyReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.weeklyReport = action.payload;
        state.error = null;
      })
      .addCase(fetchWeeklyReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMonthlyReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.monthlyReport = action.payload;
        state.error = null;
      })
      .addCase(fetchMonthlyReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Overtime Configs
      .addCase(fetchOvertimeConfigs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOvertimeConfigs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overtimeConfigs = action.payload;
        state.error = null;
      })
      .addCase(fetchOvertimeConfigs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOvertimeConfigByWorkTypeId.fulfilled, (state, action) => {
        const index = state.overtimeConfigs.findIndex(
          (config) => config.workTypeId === action.payload.workTypeId
        );
        if (index !== -1) {
          state.overtimeConfigs[index] = action.payload;
        } else {
          state.overtimeConfigs.push(action.payload);
        }
      })
      .addCase(createOvertimeConfig.fulfilled, (state, action) => {
        const index = state.overtimeConfigs.findIndex(
          (config) => config.workTypeId === action.payload.workTypeId
        );
        if (index !== -1) {
          state.overtimeConfigs[index] = action.payload;
        } else {
          state.overtimeConfigs.push(action.payload);
        }
      })
      .addCase(updateOvertimeConfig.fulfilled, (state, action) => {
        const index = state.overtimeConfigs.findIndex(
          (config) => config.workTypeId === action.payload.workTypeId
        );
        if (index !== -1) {
          state.overtimeConfigs[index] = action.payload;
        } else {
          state.overtimeConfigs.push(action.payload);
        }
      })
      .addCase(deleteOvertimeConfig.fulfilled, (state, action) => {
        state.overtimeConfigs = state.overtimeConfigs.filter(
          (config) => config.workTypeId !== action.payload
        );
      });
  },
});

export const { setPagination, clearError, clearReports } = workSlice.actions;
export default workSlice.reducer;

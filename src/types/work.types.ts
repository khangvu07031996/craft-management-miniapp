export enum CalculationType {
  WELD_COUNT = 'weld_count',
  HOURLY = 'hourly',
  DAILY = 'daily',
}

export enum DifficultyLevel {
  EASY = 'dễ',
  MEDIUM = 'trung bình',
  HARD = 'khó',
}

export type MonthlySalaryStatus = 'Tạm tính' | 'Thanh toán';

// Work Type
export interface WorkTypeResponse {
  id: string;
  name: string;
  department: string;
  calculationType: CalculationType;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkTypeDto {
  name: string;
  department: string;
  calculationType: CalculationType;
  unitPrice: number;
}

export interface UpdateWorkTypeDto {
  name?: string;
  department?: string;
  calculationType?: CalculationType;
  unitPrice?: number;
}

// Work Item
export interface WorkItemResponse {
  id: string;
  name: string;
  difficultyLevel: DifficultyLevel;
  pricePerWeld: number;
  totalQuantity: number;
  weldsPerItem: number;
  status: 'Tạo mới' | 'Đang sản xuất' | 'Hoàn thành';
  estimatedDeliveryDate?: string;
  quantityMade?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkItemDto {
  name: string;
  difficultyLevel: DifficultyLevel;
  pricePerWeld: number;
  totalQuantity: number;
  weldsPerItem: number;
  estimatedDeliveryDate?: string;
}

export interface UpdateWorkItemDto {
  name?: string;
  difficultyLevel?: DifficultyLevel;
  pricePerWeld?: number;
  totalQuantity?: number;
  weldsPerItem?: number;
  status?: string;
  estimatedDeliveryDate?: string;
}

// Work Record
export interface WorkRecordResponse {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  workDate: string;
  workTypeId: string;
  workType?: {
    id: string;
    name: string;
    calculationType: CalculationType;
  };
  workItemId?: string;
  workItem?: {
    id: string;
    name: string;
    difficultyLevel: DifficultyLevel;
  };
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  isOvertime: boolean;
  overtimeQuantity?: number;
  overtimeHours?: number;
  notes?: string;
  createdBy: string;
  createdByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkRecordDto {
  employeeId: string;
  workDate: string;
  workTypeId: string;
  workItemId?: string;
  quantity: number;
  unitPrice?: number;
  isOvertime?: boolean;
  overtimeQuantity?: number;
  overtimeHours?: number;
  notes?: string;
}

export interface UpdateWorkRecordDto {
  employeeId?: string;
  workDate?: string;
  workTypeId?: string;
  workItemId?: string;
  quantity?: number;
  unitPrice?: number;
  isOvertime?: boolean;
  overtimeQuantity?: number;
  overtimeHours?: number;
  notes?: string;
}

// Monthly Salary
export interface MonthlySalaryResponse {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  year: number;
  month: number;
  totalWorkDays: number;
  totalAmount: number;
  allowances?: number;
  status: MonthlySalaryStatus;
  paidAt?: string | null;
  calculatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CalculateMonthlySalaryDto {
  employeeId: string;
  year: number;
  month: number;
}

// Work Report
export interface WorkReport {
  period: string;
  totalEmployees: number;
  totalWorkDays: number;
  totalAmount: number;
  byDepartment: Array<{
    department: string;
    totalAmount: number;
    totalWorkDays: number;
  }>;
  byWorkType: Array<{
    workTypeName: string;
    totalAmount: number;
    count: number;
  }>;
}

export interface WorkReportParams {
  year: number;
  month?: number;
  week?: number;
  department?: string;
  employeeId?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
  totalPages?: number;
}


// Overtime Config
export interface OvertimeConfigResponse {
  id: string;
  workTypeId: string;
  workType?: {
    id: string;
    name: string;
    department: string;
    calculationType: CalculationType;
  };
  overtimePricePerWeld: number;
  overtimePercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOvertimeConfigDto {
  workTypeId: string;
  overtimePricePerWeld?: number;
  overtimePercentage?: number;
}

export interface UpdateOvertimeConfigDto {
  overtimePricePerWeld?: number;
  overtimePercentage?: number;
}

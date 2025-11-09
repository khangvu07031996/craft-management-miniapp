export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface EmployeeResponse {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  position: string;
  department: string;
  salary?: number;
  hireDate: string;
  managerId?: string;
  status: EmployeeStatus;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeDto {
  employeeId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  position: string;
  department: string;
  salary?: number;
  hireDate: string;
  managerId?: string;
  status?: EmployeeStatus;
}

export interface UpdateEmployeeDto {
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  position?: string;
  department?: string;
  salary?: number;
  hireDate?: string;
  managerId?: string;
  status?: EmployeeStatus;
}

export interface EmployeeFilters {
  email?: string;
  name?: string;
  phoneNumber?: string;
  department?: string;
  managerId?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}


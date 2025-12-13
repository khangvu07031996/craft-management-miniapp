export interface CreateEmployeeAccountDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  // Option 1: Link with existing employee
  employeeId?: string;
  // Option 2: Create new employee (if employeeId not provided)
  employeeData?: {
    employeeId?: string;
    email: string;
    phoneNumber?: string;
    position: string;
    department: string;
    salary?: number;
    hireDate: string;
    managerId?: string;
  };
}


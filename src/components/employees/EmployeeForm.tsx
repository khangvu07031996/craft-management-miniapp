import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { CreateEmployeeDto, UpdateEmployeeDto, EmployeeResponse } from '../../types/employee.types';
import { EmployeeStatus } from '../../types/employee.types';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { validateEmail, validateRequired, validateNumber, validateDate } from '../../utils/validation';
import { formatDateForInput } from '../../utils/date';

interface EmployeeFormProps {
  employee?: EmployeeResponse | null;
  onSubmit: (data: CreateEmployeeDto | UpdateEmployeeDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EmployeeForm = ({ employee, onSubmit, onCancel, isLoading }: EmployeeFormProps) => {
  const isEditMode = !!employee;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    position: '',
    department: '',
    salary: '',
    hireDate: '',
    managerId: '',
    status: EmployeeStatus.ACTIVE,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        phoneNumber: employee.phoneNumber || '',
        position: employee.position || '',
        department: employee.department || '',
        salary: employee.salary?.toString() || '',
        hireDate: employee.hireDate ? formatDateForInput(employee.hireDate) : '',
        managerId: employee.managerId || '',
        status: (employee.status as EmployeeStatus) || EmployeeStatus.ACTIVE,
      });
    } else {
      // Reset form when employee is cleared
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        position: '',
        department: '',
        salary: '',
        hireDate: '',
        managerId: '',
        status: EmployeeStatus.ACTIVE,
      });
    }
  }, [employee]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateRequired(formData.firstName)) {
      newErrors.firstName = 'Họ là bắt buộc';
    }

    if (!validateRequired(formData.lastName)) {
      newErrors.lastName = 'Tên là bắt buộc';
    }

    if (!validateRequired(formData.email)) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Định dạng email không hợp lệ';
    }

    if (!validateRequired(formData.position)) {
      newErrors.position = 'Vị trí là bắt buộc';
    }

    if (!validateRequired(formData.department)) {
      newErrors.department = 'Phòng ban là bắt buộc';
    }

    if (!validateRequired(formData.hireDate)) {
      newErrors.hireDate = 'Ngày bắt đầu làm việc là bắt buộc';
    } else if (!validateDate(formData.hireDate)) {
      newErrors.hireDate = 'Định dạng ngày không hợp lệ';
    }

    if (formData.salary && !validateNumber(formData.salary)) {
      newErrors.salary = 'Lương phải là số dương';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: CreateEmployeeDto | UpdateEmployeeDto = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      position: formData.position,
      department: formData.department,
      hireDate: formData.hireDate,
      status: formData.status,
      ...(formData.phoneNumber && { phoneNumber: formData.phoneNumber }),
      ...(formData.salary && { salary: parseFloat(formData.salary) }),
      ...(formData.managerId && { managerId: formData.managerId }),
    };

    onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Họ"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          required
        />
        <Input
          label="Tên"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
          required
        />
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
        <Input
          label="Số điện thoại"
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          error={errors.phoneNumber}
        />
        <Input
          label="Vị trí"
          name="position"
          value={formData.position}
          onChange={handleChange}
          error={errors.position}
          required
        />
        <Input
          label="Phòng ban"
          name="department"
          value={formData.department}
          onChange={handleChange}
          error={errors.department}
          required
        />
        <Input
          label="Lương"
          type="number"
          name="salary"
          value={formData.salary}
          onChange={handleChange}
          error={errors.salary}
        />
        <Input
          label="Ngày bắt đầu làm việc"
          type="date"
          name="hireDate"
          value={formData.hireDate}
          onChange={handleChange}
          error={errors.hireDate}
          required
        />
        <Input
          label="Mã người quản lý"
          name="managerId"
          value={formData.managerId}
          onChange={handleChange}
          error={errors.managerId}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Trạng thái
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.status ? 'border-red-500' : 'border-gray-200'
            }`}
          >
            <option value={EmployeeStatus.ACTIVE}>Đang làm việc</option>
            <option value={EmployeeStatus.INACTIVE}>Đã nghỉ việc</option>
          </select>
          {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEditMode ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  );
};


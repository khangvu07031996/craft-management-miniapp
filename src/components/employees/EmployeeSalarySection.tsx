import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import type { EmployeeResponse } from '../../types/employee.types';

interface EmployeeSalarySectionProps {
  employee: EmployeeResponse;
}

export const EmployeeSalarySection = ({ employee }: EmployeeSalarySectionProps) => {
  const [isSalaryVisible, setIsSalaryVisible] = useState(false);

  const formatSalary = (salary?: number): string => {
    if (!salary) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(salary);
  };

  const toggleSalaryVisibility = () => {
    setIsSalaryVisible(!isSalaryVisible);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Lương</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1.5">
          Mức lương
        </label>
        <div className="flex items-center gap-2">
          <p className="text-base font-semibold text-gray-900">
            {isSalaryVisible ? formatSalary(employee.salary) : '••••••••'}
          </p>
          <button
            onClick={toggleSalaryVisibility}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title={isSalaryVisible ? 'Ẩn lương' : 'Hiển thị lương'}
          >
            {isSalaryVisible ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


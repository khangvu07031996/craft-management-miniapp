import type { EmployeeResponse } from '../../types/employee.types';

interface EmployeePersonalInfoSectionProps {
  employee: EmployeeResponse;
}

export const EmployeePersonalInfoSection = ({ employee }: EmployeePersonalInfoSectionProps) => {

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">
              Họ Tên
            </label>
            <p className="text-base font-semibold text-gray-900">
              {employee.firstName} {employee.lastName}
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">
              Địa chỉ email
            </label>
            <p className="text-base font-semibold text-gray-900">{employee.email}</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">
              Số điện thoại
            </label>
            <p className="text-base font-semibold text-gray-900">
              {employee.phoneNumber || 'N/A'}
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">
              Tiểu sử
            </label>
            <p className="text-base font-semibold text-gray-900">
              {employee.position} {employee.department ? `tại ${employee.department}` : ''}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};


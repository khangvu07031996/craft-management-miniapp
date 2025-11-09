import type { EmployeeResponse } from '../../types/employee.types';

interface EmployeeAddressSectionProps {
  employee: EmployeeResponse;
}

export const EmployeeAddressSection = ({ employee }: EmployeeAddressSectionProps) => {

  // For now, we'll use placeholder data since address fields are not in the employee model
  // In a real application, you would extend the employee model to include these fields
  const addressData = {
    country: 'United States',
    cityState: employee.department ? `${employee.department}, United States` : 'United States',
    postalCode: employee.employeeId ? `ERT ${employee.employeeId.slice(-4)}` : 'N/A',
    taxId: employee.employeeId ? `AS${employee.employeeId.replace(/-/g, '').slice(-7)}` : 'N/A',
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Địa chỉ</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">
              Quốc gia
            </label>
            <p className="text-base font-semibold text-gray-900">{addressData.country}</p>
          </div>

          {/* City/State */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">
              Thành phố/Tỉnh
            </label>
            <p className="text-base font-semibold text-gray-900">{addressData.cityState}</p>
          </div>

          {/* Postal Code */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">
              Mã bưu điện
            </label>
            <p className="text-base font-semibold text-gray-900">{addressData.postalCode}</p>
          </div>

          {/* TAX ID */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">
              Mã số thuế
            </label>
            <p className="text-base font-semibold text-gray-900">{addressData.taxId}</p>
          </div>
        </div>
      </div>
    </>
  );
};


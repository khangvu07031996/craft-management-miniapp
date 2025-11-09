import type { MonthlySalaryResponse, MonthlySalaryStatus } from '../../types/work.types';

interface MonthlySalaryCardProps {
  monthlySalary: MonthlySalaryResponse;
  onViewDetails?: (id: string) => void;
  onUpdateStatus?: (id: string, status: MonthlySalaryStatus) => void;
}

export const MonthlySalaryCard = ({
  monthlySalary,
  onViewDetails,
  onUpdateStatus,
}: MonthlySalaryCardProps) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusColor = (status: MonthlySalaryStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: MonthlySalaryStatus) => {
    switch (status) {
      case 'draft':
        return 'Nháp';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'paid':
        return 'Đã thanh toán';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {monthlySalary.employee
              ? `${monthlySalary.employee.firstName} ${monthlySalary.employee.lastName}`
              : 'Nhân viên'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Tháng {monthlySalary.month}/{monthlySalary.year}
          </p>
        </div>
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
            monthlySalary.status
          )}`}
        >
          {getStatusLabel(monthlySalary.status)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Số ngày làm việc:</span>
          <span className="text-sm font-medium text-gray-900">{monthlySalary.totalWorkDays} ngày</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Tổng lương:</span>
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(monthlySalary.totalAmount)}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(monthlySalary.id)}
            className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Xem chi tiết
          </button>
        )}
        {onUpdateStatus && monthlySalary.status === 'draft' && (
          <button
            onClick={() => onUpdateStatus(monthlySalary.id, 'confirmed')}
            className="px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            Xác nhận
          </button>
        )}
        {onUpdateStatus && monthlySalary.status === 'confirmed' && (
          <button
            onClick={() => onUpdateStatus(monthlySalary.id, 'paid')}
            className="px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            Đã thanh toán
          </button>
        )}
      </div>
    </div>
  );
};


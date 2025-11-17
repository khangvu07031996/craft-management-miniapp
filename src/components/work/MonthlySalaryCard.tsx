import type { MonthlySalaryResponse, MonthlySalaryStatus } from '../../types/work.types';
import { formatDateTimeVN } from '../../utils/date';

interface MonthlySalaryCardProps {
  monthlySalary: MonthlySalaryResponse;
  onViewDetails?: (id: string) => void;
  onUpdateAllowances?: (id: string, allowances: number) => void;
  onPay?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const MonthlySalaryCard = ({
  monthlySalary,
  onViewDetails,
  onUpdateAllowances,
  onPay,
  onDelete,
}: MonthlySalaryCardProps) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusColor = (status: MonthlySalaryStatus) => {
    switch (status) {
      case 'Tạm tính':
        return 'bg-yellow-100 text-yellow-800';
      case 'Thanh toán':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: MonthlySalaryStatus) => {
    switch (status) {
      case 'Tạm tính':
        return 'Tạm tính';
      case 'Thanh toán':
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
        <div className="flex flex-col items-end gap-1">
          <span
            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
              monthlySalary.status
            )}`}
          >
            {getStatusLabel(monthlySalary.status)}
          </span>
          {monthlySalary.calculatedAt && (
            <span className="text-xs text-gray-500" title={`Raw: ${monthlySalary.calculatedAt}`}>
              {formatDateTimeVN(monthlySalary.calculatedAt)}
            </span>
          )}
        </div>
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
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-gray-600">Phụ cấp:</span>
          {monthlySalary.status === 'Tạm tính' ? (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                defaultValue={((monthlySalary.allowances || 0) / 1000).toFixed(0)}
                onBlur={(e) => {
                  const thousands = Math.max(0, Number(e.target.value || 0));
                  const vndValue = thousands * 1000;
                  if (onUpdateAllowances && vndValue !== (monthlySalary.allowances || 0)) {
                    onUpdateAllowances(monthlySalary.id, vndValue);
                  }
                }}
                className="w-16 text-right px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Phụ cấp (nghìn đồng)"
              />
              <span className="text-xs text-gray-600 whitespace-nowrap">.000đ</span>
            </div>
          ) : (
            <span className="text-sm font-medium text-gray-900">
              {(((monthlySalary.allowances || 0) / 1000) || 0).toLocaleString('vi-VN')}.000đ
            </span>
          )}
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
        {onPay && monthlySalary.status === 'Tạm tính' && (
          <button
            onClick={() => onPay(monthlySalary.id)}
            className="px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            Thanh toán
          </button>
        )}
        {onDelete && monthlySalary.status === 'Tạm tính' && (
          <button
            onClick={() => onDelete(monthlySalary.id)}
            className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            Xoá
          </button>
        )}
      </div>
    </div>
  );
};


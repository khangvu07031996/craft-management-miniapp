import { useState, useEffect } from 'react';
import type { MonthlySalaryResponse, MonthlySalaryStatus } from '../../types/work.types';
import { formatDateTimeVN, formatDate } from '../../utils/date';

interface MonthlySalaryCardProps {
  monthlySalary: MonthlySalaryResponse;
  onViewDetails?: (id: string) => void;
  onUpdateAllowances?: (id: string, allowances: number) => void;
  onUpdateAdvancePayment?: (id: string, advancePayment: number) => void;
  onPay?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const MonthlySalaryCard = ({
  monthlySalary,
  onViewDetails,
  onUpdateAllowances,
  onUpdateAdvancePayment,
  onPay,
  onDelete,
}: MonthlySalaryCardProps) => {
  const [allowancesInput, setAllowancesInput] = useState(
    ((monthlySalary.allowances || 0) / 1000).toFixed(0)
  );
  const [advancePaymentInput, setAdvancePaymentInput] = useState(
    ((monthlySalary.advancePayment || 0) / 1000).toFixed(0)
  );

  // Sync input value when monthlySalary.allowances changes
  useEffect(() => {
    setAllowancesInput(((monthlySalary.allowances || 0) / 1000).toFixed(0));
  }, [monthlySalary.allowances]);

  // Sync input value when monthlySalary.advancePayment changes
  useEffect(() => {
    setAdvancePaymentInput(((monthlySalary.advancePayment || 0) / 1000).toFixed(0));
  }, [monthlySalary.advancePayment]);
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusColor = (status: MonthlySalaryStatus) => {
    switch (status) {
      case 'Tạm tính':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'Thanh toán':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
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
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/50 p-6 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {monthlySalary.employee
              ? `${monthlySalary.employee.firstName} ${monthlySalary.employee.lastName}`
              : 'Nhân viên'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {monthlySalary.dateFrom && monthlySalary.dateTo
              ? `${formatDate(monthlySalary.dateFrom)} - ${formatDate(monthlySalary.dateTo)}`
              : `Tháng ${monthlySalary.month}/${monthlySalary.year}`}
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
            <span className="text-xs text-gray-500 dark:text-gray-400" title={`Raw: ${monthlySalary.calculatedAt}`}>
              {formatDateTimeVN(monthlySalary.calculatedAt)}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Số ngày làm việc:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{monthlySalary.totalWorkDays} ngày</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Tổng lương:</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(monthlySalary.totalAmount)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Phụ cấp:</span>
          {monthlySalary.status === 'Tạm tính' ? (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={allowancesInput}
                onChange={(e) => setAllowancesInput(e.target.value)}
                onBlur={(e) => {
                  const thousands = Math.max(0, Number(e.target.value || 0));
                  const vndValue = thousands * 1000;
                  if (onUpdateAllowances && vndValue !== (monthlySalary.allowances || 0)) {
                    onUpdateAllowances(monthlySalary.id, vndValue);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                className="w-16 text-right px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-label="Phụ cấp (nghìn đồng)"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">.000đ</span>
            </div>
          ) : (
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {(((monthlySalary.allowances || 0) / 1000) || 0).toLocaleString('vi-VN')}.000đ
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Tạm ứng:</span>
          {monthlySalary.status === 'Tạm tính' ? (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={advancePaymentInput}
                onChange={(e) => setAdvancePaymentInput(e.target.value)}
                onBlur={(e) => {
                  const thousands = Math.max(0, Number(e.target.value || 0));
                  const vndValue = thousands * 1000;
                  if (onUpdateAdvancePayment && vndValue !== (monthlySalary.advancePayment || 0)) {
                    onUpdateAdvancePayment(monthlySalary.id, vndValue);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                className="w-16 text-right px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-label="Tạm ứng (nghìn đồng)"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">.000đ</span>
            </div>
          ) : (
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {(((monthlySalary.advancePayment || 0) / 1000) || 0).toLocaleString('vi-VN')}.000đ
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(monthlySalary.id)}
            className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            Xem chi tiết
          </button>
        )}
        {onPay && monthlySalary.status === 'Tạm tính' && (
          <button
            onClick={() => onPay(monthlySalary.id)}
            className="px-3 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
          >
            Thanh toán
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(monthlySalary.id)}
            className="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
          >
            Xoá
          </button>
        )}
      </div>
    </div>
  );
};


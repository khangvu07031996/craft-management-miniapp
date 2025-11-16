import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { MonthlySalaryResponse, WorkRecordResponse } from '../../types/work.types';
import { workRecordService } from '../../services/work.service';

interface MonthlySalaryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlySalary: MonthlySalaryResponse | null;
  onPay?: (id: string) => void;
}

export const MonthlySalaryDetailModal = ({
  isOpen,
  onClose,
  monthlySalary,
  onPay,
}: MonthlySalaryDetailModalProps) => {
  const [workRecords, setWorkRecords] = useState<WorkRecordResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && monthlySalary) {
      loadWorkRecords();
    } else {
      setWorkRecords([]);
      setError(null);
    }
  }, [isOpen, monthlySalary]);

  const loadWorkRecords = async () => {
    if (!monthlySalary) return;

    setIsLoading(true);
    setError(null);

    try {
      const records = await workRecordService.getWorkRecordsByEmployeeAndMonth(
        monthlySalary.employeeId,
        monthlySalary.year,
        monthlySalary.month
      );
      setWorkRecords(records);
    } catch (err: any) {
      setError(err.message || 'Không thể tải chi tiết công việc');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (!isOpen || !monthlySalary) return null;

  const totalAmount = workRecords.reduce((sum, record) => sum + record.totalAmount, 0);
  // const overtimeTotal = workRecords
  //   .filter((r) => r.isOvertime)
  //   .reduce((sum, r) => sum + r.totalAmount, 0);
  // const baseTotal = totalAmount - overtimeTotal; // Not used but kept for clarity
  const allowances = monthlySalary.allowances || 0;
  const grandTotal = totalAmount + allowances;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
          onClick={onClose}
        />
        <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Chi tiết tính lương tháng {monthlySalary.month}/{monthlySalary.year}
              </h2>
              <p className="text-base font-semibold text-gray-900 mt-1">
                {monthlySalary.employee
                  ? `${monthlySalary.employee.firstName} ${monthlySalary.employee.lastName}`
                  : 'Nhân viên'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Đang tải chi tiết...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
              </div>
            ) : workRecords.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Không có bản ghi công việc</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại công việc</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại hàng</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tăng ca</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">SL/giờ TC</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn giá</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {workRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.workDate).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.workType?.name || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.workItem?.name || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                          {record.isOvertime ? 'Có' : 'Không'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                          {record.isOvertime
                            ? (record.overtimeQuantity ?? record.overtimeHours ?? 0)
                            : 0}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">{record.quantity}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(record.unitPrice)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">{formatCurrency(record.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={7} className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                        Tổng lương (chưa phụ cấp):
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(totalAmount)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={7} className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                        Phụ cấp:
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(allowances)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={7} className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        Tổng lương cần thanh toán:
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-green-600">
                        {formatCurrency(grandTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-end p-6 border-t border-gray-200">
            {monthlySalary.status === 'Tạm tính' && onPay && (
              <button
                onClick={() => onPay(monthlySalary.id)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thanh toán
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

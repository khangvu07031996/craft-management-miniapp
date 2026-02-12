import { useEffect, useState } from 'react';
import { XMarkIcon, DocumentArrowDownIcon, PrinterIcon } from '@heroicons/react/24/outline';
import type { MonthlySalaryResponse, WorkRecordResponse } from '../../types/work.types';
import { workRecordService, monthlySalaryService } from '../../services/work.service';
import { exportSalaryToPDF } from '../../utils/pdfExport';
import { printSalary } from '../../utils/printSalary';
import { formatDate } from '../../utils/date';

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
  const [salaryData, setSalaryData] = useState<MonthlySalaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && monthlySalary?.id) {
      // Always fetch fresh data when modal opens, don't rely on prop
      loadAllData(monthlySalary.id);
    } else {
      setWorkRecords([]);
      setSalaryData(null);
      setError(null);
    }
  }, [isOpen, monthlySalary?.id]); // Reload when modal opens or salary ID changes

  const loadAllData = async (salaryId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Always fetch fresh data from server, don't use prop
      const [fetchedSalary, records] = await Promise.all([
        monthlySalaryService.getMonthlySalaryById(salaryId),
        workRecordService.getWorkRecordsByMonthlySalaryId(salaryId),
      ]);
      
      setSalaryData(fetchedSalary);
      setWorkRecords(records);
    } catch (err: any) {
      console.error('Error loading salary details:', err);
      setError(err.message || 'Không thể tải chi tiết');
      // Fallback to prop only if fetch completely fails
      if (monthlySalary) {
        setSalaryData(monthlySalary);
      }
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

  // Always use fetched salary data, only use prop as initial fallback while loading
  const displaySalary = salaryData || (isLoading ? null : monthlySalary);

  if (!isOpen || !monthlySalary) return null;
  
  // Show loading state while fetching fresh data
  if (isLoading && !salaryData) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">Đang tải chi tiết...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!displaySalary) return null;

  const totalAmount = workRecords.reduce((sum, record) => sum + record.totalAmount, 0);
  const allowances = displaySalary.allowances || 0;
  const advancePayment = displaySalary.advancePayment || 0;
  const grandTotal = totalAmount + allowances - advancePayment;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
          onClick={onClose}
        />
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Chi tiết tính lương{' '}
                {displaySalary.dateFrom && displaySalary.dateTo
                  ? `${formatDate(displaySalary.dateFrom)} - ${formatDate(displaySalary.dateTo)}`
                  : `tháng ${displaySalary.month}/${displaySalary.year}`}
              </h2>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {displaySalary.employee
                  ? `${displaySalary.employee.firstName} ${displaySalary.employee.lastName}`
                  : 'Nhân viên'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Đang tải chi tiết...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 dark:text-red-400">{error}</p>
              </div>
            ) : workRecords.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Không có bản ghi công việc</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngày</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loại công việc</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sản phẩm</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mối hàn/SP</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tăng ca</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SL/giờ TC</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Số lượng</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Đơn giá</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {workRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {new Date(record.workDate).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{record.workType?.name || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{record.workItem?.name || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">
                          {record.workItem?.weldsPerItem ?? '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                          {record.isOvertime ? 'Có' : 'Không'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">
                          {record.isOvertime
                            ? (record.overtimeQuantity ?? record.overtimeHours ?? 0)
                            : 0}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">{record.quantity}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">{formatCurrency(record.unitPrice)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">{formatCurrency(record.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <td colSpan={8} className="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                        Tổng lương (chưa phụ cấp):
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(totalAmount)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={8} className="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                        Phụ cấp:
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(allowances)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={8} className="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                        Tạm ứng:
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        <span className={advancePayment > 0 ? 'text-red-600 dark:text-red-400' : ''}>
                          {advancePayment > 0 ? '-' : ''}{formatCurrency(advancePayment)}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={8} className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                        Tổng lương cần thanh toán:
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(grandTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700">
            {displaySalary.status === 'Tạm tính' && onPay && (
              <button
                onClick={() => onPay(displaySalary.id)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Thanh toán
              </button>
            )}
            <button
              onClick={async () => {
                try {
                  await exportSalaryToPDF(displaySalary, workRecords);
                } catch (error: any) {
                  alert(error.message || 'Không thể xuất PDF. Vui lòng thử lại.');
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              Xuất PDF
            </button>
            <button
              onClick={() => {
                try {
                  printSalary(displaySalary, workRecords);
                } catch (error: any) {
                  alert(error.message || 'Không thể in phiếu lương. Vui lòng thử lại.');
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 dark:bg-green-500 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
            >
              <PrinterIcon className="w-4 h-4" />
              In phiếu lương
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

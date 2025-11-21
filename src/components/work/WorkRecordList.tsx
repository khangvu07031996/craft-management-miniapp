import { useMemo } from 'react';
import { formatDate } from '../../utils/date';
import type { WorkRecordResponse } from '../../types/work.types';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface WorkRecordListProps {
  workRecords: WorkRecordResponse[];
  onEdit?: (record: WorkRecordResponse) => void;
  onDelete?: (id: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  getSortIcon?: (column: string) => React.ReactNode;
}

interface GroupedRecord {
  record: WorkRecordResponse;
  isNewDate: boolean;
  isNewEmployee: boolean;
}

export const WorkRecordList = ({ 
  workRecords, 
  onEdit, 
  onDelete,
  sortBy: _sortBy,
  sortOrder: _sortOrder,
  onSort,
  getSortIcon
}: WorkRecordListProps) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDateKey = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  };

  const getEmployeeKey = (record: WorkRecordResponse): string => {
    if (record.employee) {
      const lastName = (record.employee.lastName || '').toLowerCase();
      const firstName = (record.employee.firstName || '').toLowerCase();
      return `${lastName}_${firstName}_${record.employeeId}`;
    }
    return record.employeeId || 'unknown';
  };

  const groupedRecords = useMemo((): GroupedRecord[] => {
    if (workRecords.length === 0) return [];

    const grouped: GroupedRecord[] = [];
    let lastDate: string | null = null;
    let lastEmployee: string | null = null;

    workRecords.forEach((record) => {
      const dateKey = formatDateKey(record.workDate);
      const employeeKey = getEmployeeKey(record);
      
      const isNewDate = lastDate !== dateKey;
      const isNewEmployee = isNewDate || lastEmployee !== employeeKey;

      grouped.push({
        record,
        isNewDate,
        isNewEmployee,
      });

      lastDate = dateKey;
      lastEmployee = employeeKey;
    });

    return grouped;
  }, [workRecords]);

  if (workRecords.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500 dark:text-gray-400">Không có công việc nào</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Card Layout */}
      <div className="md:hidden space-y-4">
        {groupedRecords.map(({ record, isNewDate, isNewEmployee }) => {
          const borderClass = isNewDate 
            ? 'border-t-2 border-gray-300 dark:border-gray-600' 
            : isNewEmployee 
            ? 'border-t border-gray-200 dark:border-gray-700' 
            : '';

          return (
            <div
              key={record.id}
              className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm ${borderClass}`}
            >
              {/* Header: Date and Employee */}
              <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Ngày</span>
                  {isNewDate && (
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {formatDate(record.workDate)}
                    </span>
                  )}
                </div>
                {isNewDate && (
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {formatDate(record.workDate)}
                  </div>
                )}
                {isNewEmployee && (
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {record.employee
                      ? `${record.employee.firstName} ${record.employee.lastName}`
                      : record.employeeId}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Loại công việc:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{record.workType?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Sản phẩm:</span>
                  <span className="text-gray-900 dark:text-gray-100">{record.workItem ? `${record.workItem.name}` : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Số lượng:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {record.workType?.calculationType === 'weld_count' 
                      ? `${record.quantity} SP` 
                      : record.quantity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Đơn giá:</span>
                  <span className="text-gray-900 dark:text-gray-100">{formatCurrency(record.unitPrice)}</span>
                </div>
                {record.isOvertime && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Tăng ca:</span>
                    <div className="flex flex-col items-end gap-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                        Có tăng ca
                      </span>
                      {record.workType?.calculationType === 'weld_count' && record.overtimeQuantity && (
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {record.overtimeQuantity} SP
                        </span>
                      )}
                      {record.workType?.calculationType === 'hourly' && record.overtimeHours && (
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {record.overtimeHours} giờ
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-gray-100 font-semibold">Tổng tiền:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-bold">{formatCurrency(record.totalAmount)}</span>
                </div>
              </div>

              {/* Actions */}
              {(onEdit || onDelete) && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(record)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-500 p-1"
                      aria-label="Edit"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(record.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-500 p-1"
                      aria-label="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tablet/Desktop: Table Layout with horizontal scroll */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th 
                className={`px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                  onSort ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none' : ''
                }`}
                onClick={() => onSort && onSort('workDate')}
              >
                Ngày {getSortIcon && getSortIcon('workDate')}
              </th>
              <th 
                className={`px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                  onSort ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none' : ''
                }`}
                onClick={() => onSort && onSort('employee')}
              >
                Nhân viên {getSortIcon && getSortIcon('employee')}
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Loại công việc
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Sản phẩm
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Số lượng
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Đơn giá
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tăng ca
              </th>
              <th 
                className={`px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                  onSort ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none' : ''
                }`}
                onClick={() => onSort && onSort('totalAmount')}
              >
                Tổng tiền {getSortIcon && getSortIcon('totalAmount')}
              </th>
              {(onEdit || onDelete) && (
                <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thao tác
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {groupedRecords.map(({ record, isNewDate, isNewEmployee }) => {
              const borderClass = isNewDate 
                ? 'border-t-2 border-gray-300 dark:border-gray-600' 
                : isNewEmployee 
                ? 'border-t border-gray-200 dark:border-gray-700' 
                : '';

              return (
                <tr 
                  key={record.id} 
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${borderClass}`}
                >
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(record.workDate)}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {record.employee
                      ? `${record.employee.firstName} ${record.employee.lastName}`
                      : record.employeeId}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {record.workType?.name || '-'}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {record.workItem ? `${record.workItem.name} (${record.workItem.difficultyLevel})` : '-'}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {record.workType?.calculationType === 'weld_count' 
                      ? `${record.quantity} SP` 
                      : record.quantity}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatCurrency(record.unitPrice)}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {record.isOvertime ? (
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                          Có tăng ca
                        </span>
                        {record.workType?.calculationType === 'weld_count' && record.overtimeQuantity && (
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {record.overtimeQuantity} SP
                          </span>
                        )}
                        {record.workType?.calculationType === 'hourly' && record.overtimeHours && (
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {record.overtimeHours} giờ
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(record.totalAmount)}
                  </td>
                  {(onEdit || onDelete) && (
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(record)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-500 p-1"
                            aria-label="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(record.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-500 p-1"
                            aria-label="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

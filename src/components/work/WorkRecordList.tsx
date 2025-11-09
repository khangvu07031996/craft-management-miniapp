import { useMemo } from 'react';
import { formatDate } from '../../utils/date';
import type { WorkRecordResponse } from '../../types/work.types';

interface WorkRecordListProps {
  workRecords: WorkRecordResponse[];
  onEdit?: (record: WorkRecordResponse) => void;
  onDelete?: (id: string) => void;
}

interface GroupedRecord {
  record: WorkRecordResponse;
  isNewDate: boolean;
  isNewEmployee: boolean;
}

export const WorkRecordList = ({ workRecords, onEdit, onDelete }: WorkRecordListProps) => {
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
        <p className="text-sm text-gray-500">Không có công việc nào</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nhân viên
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Loại công việc
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Loại hàng
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Số lượng
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Đơn giá
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tăng ca
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tổng tiền
            </th>
            {(onEdit || onDelete) && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {groupedRecords.map(({ record, isNewDate, isNewEmployee }) => {
            const borderClass = isNewDate 
              ? 'border-t-2 border-gray-300' 
              : isNewEmployee 
              ? 'border-t border-gray-200' 
              : '';

            return (
              <tr 
                key={record.id} 
                className={`hover:bg-gray-50 ${borderClass}`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(record.workDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.employee
                    ? `${record.employee.firstName} ${record.employee.lastName}`
                    : record.employeeId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.workType?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.workItem ? `${record.workItem.name} (${record.workItem.difficultyLevel})` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.workType?.calculationType === 'weld_count' 
                    ? `${record.quantity} SP` 
                    : record.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(record.unitPrice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.isOvertime ? (
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                        Có tăng ca
                      </span>
                      {record.workType?.calculationType === 'weld_count' && record.overtimeQuantity && (
                        <span className="text-xs text-gray-600">
                          {record.overtimeQuantity} SP
                        </span>
                      )}
                      {record.workType?.calculationType === 'hourly' && record.overtimeHours && (
                        <span className="text-xs text-gray-600">
                          {record.overtimeHours} giờ
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {formatCurrency(record.totalAmount)}
                </td>
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(record)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Sửa
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(record.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
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
  );
};

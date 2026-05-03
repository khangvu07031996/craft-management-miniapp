import { Fragment, useEffect, useMemo, useState } from 'react';
import { monthlySalaryService } from '../../services/work.service';
import type { MonthlySalaryResponse } from '../../types/work.types';
import { formatDateTimeVN, formatDate } from '../../utils/date';

interface SalaryPaymentHistoryProps {
  selectedEmployeeId?: string;
  onViewDetails: (salaryId: string) => void;
  refreshKey?: number;
}

const HISTORY_FETCH_LIMIT = 200;

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);

const getPeriodLabel = (salary: MonthlySalaryResponse): string => {
  if (salary.dateFrom && salary.dateTo) {
    return `${formatDate(salary.dateFrom)} - ${formatDate(salary.dateTo)}`;
  }
  return `Tháng ${salary.month}/${salary.year}`;
};

const getPaidSortTime = (salary: MonthlySalaryResponse): number =>
  salary.paidAt ? new Date(salary.paidAt).getTime() : 0;

const getDefaultSortTime = (salary: MonthlySalaryResponse): number => {
  if (salary.calculatedAt) return new Date(salary.calculatedAt).getTime();
  if (salary.createdAt) return new Date(salary.createdAt).getTime();
  return 0;
};

const getGroupMonthYear = (salary: MonthlySalaryResponse): { month: number; year: number } => {
  if (salary.dateTo) {
    const date = new Date(salary.dateTo);
    return { month: date.getMonth() + 1, year: date.getFullYear() };
  }
  return { month: salary.month, year: salary.year };
};

export const SalaryPaymentHistory = ({
  selectedEmployeeId,
  onViewDetails,
  refreshKey = 0,
}: SalaryPaymentHistoryProps) => {
  const [salaries, setSalaries] = useState<MonthlySalaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPaymentHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await monthlySalaryService.getAllMonthlySalaries(
          {
            employeeId: selectedEmployeeId && selectedEmployeeId.trim() !== '' ? selectedEmployeeId : undefined,
          },
          { page: 1, pageSize: HISTORY_FETCH_LIMIT }
        );
        setSalaries(result.data ?? []);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Không thể tải lịch sử thanh toán');
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentHistory();
  }, [selectedEmployeeId, refreshKey]);

  const groupedSalaries = useMemo(() => {
    const groupMap = new Map<
      string,
      {
        groupKey: string;
        employeeLabel: string;
        month: number;
        year: number;
        paidCount: number;
        latestTime: number;
        rows: MonthlySalaryResponse[];
      }
    >();

    for (const salary of salaries) {
      const employeeLabel = salary.employee
        ? `${salary.employee.firstName} ${salary.employee.lastName}`
        : 'Nhân viên';
      const employeeKey = salary.employeeId || 'unknown';
      const { month, year } = getGroupMonthYear(salary);
      const groupKey = `${employeeKey}-${year}-${month}`;
      const rowTime = salary.status === 'Thanh toán' ? getPaidSortTime(salary) : getDefaultSortTime(salary);

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          groupKey,
          employeeLabel,
          month,
          year,
          paidCount: 0,
          latestTime: rowTime,
          rows: [],
        });
      }

      const group = groupMap.get(groupKey)!;
      group.rows.push(salary);
      group.latestTime = Math.max(group.latestTime, rowTime);
      if (salary.status === 'Thanh toán') {
        group.paidCount += 1;
      }
    }

    const groups = Array.from(groupMap.values()).sort((a, b) => b.latestTime - a.latestTime);
    for (const group of groups) {
      group.rows.sort((a, b) => {
        const aTime = a.status === 'Thanh toán' ? getPaidSortTime(a) : getDefaultSortTime(a);
        const bTime = b.status === 'Thanh toán' ? getPaidSortTime(b) : getDefaultSortTime(b);
        return bTime - aTime;
      });
    }

    return groups;
  }, [salaries]);

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100">Lịch sử thanh toán</h2>
        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Nhóm theo tháng để theo dõi số lần thanh toán
        </span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/40 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">Đang tải lịch sử...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500 dark:text-red-400">{error}</div>
        ) : groupedSalaries.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">Chưa có dữ liệu lương</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nhân viên</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Kỳ lương</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Trạng thái</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Lương gốc</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Phụ cấp</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Tạm ứng</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Thực lĩnh</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Ngày thanh toán</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {groupedSalaries.map((group) => (
                  <Fragment key={group.groupKey}>
                    <tr key={`group-${group.groupKey}`} className="bg-indigo-50/60 dark:bg-indigo-900/20">
                      <td colSpan={9} className="px-4 py-2.5 text-sm font-medium text-indigo-700 dark:text-indigo-300">
                        {`${group.employeeLabel} - Tháng ${group.month}/${group.year} - Đã thanh toán ${group.paidCount} lần`}
                      </td>
                    </tr>
                    {group.rows.map((salary) => {
                      const allowances = salary.allowances || 0;
                      const advancePayment = salary.advancePayment || 0;
                      const netAmount = salary.totalAmount + allowances - advancePayment;
                      const statusClass =
                        salary.status === 'Thanh toán'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';

                      return (
                        <tr key={salary.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                            {salary.employee
                              ? `${salary.employee.firstName} ${salary.employee.lastName}`
                              : 'Nhân viên'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {getPeriodLabel(salary)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}>
                              {salary.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100 whitespace-nowrap">
                            {formatCurrency(salary.totalAmount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100 whitespace-nowrap">
                            {formatCurrency(allowances)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100 whitespace-nowrap">
                            {formatCurrency(advancePayment)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                            {formatCurrency(netAmount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {salary.paidAt ? formatDateTimeVN(salary.paidAt) : '-'}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <button
                              onClick={() => onViewDetails(salary.id)}
                              className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
                            >
                              Xem chi tiết
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};


import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Pagination } from '../components/employees/Pagination';
import { workReportService } from '../services/work.service';
import { formatDate } from '../utils/date';
import { formatEmployeeDisplayName } from '../utils/employeeDisplayName';
import {
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowsUpDownIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ClockIcon,
  CubeIcon,
  BoltIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';
import type { PayrollPeriodGranularity, PayrollPeriodReport } from '../types/work.types';

type ActivitySortKey =
  | 'employee'
  | 'department'
  | 'workDays'
  | 'overtimeHours'
  | 'overtimeQuantity'
  | 'productTypeCount'
  | 'totalQuantity';

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);

function formatMetricQty(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1);
}

function ActivitySortButton({
  active,
  dir,
  onClick,
  alignEnd,
  children,
}: {
  active: boolean;
  dir: 'asc' | 'desc';
  onClick: () => void;
  alignEnd?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-1.5 font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors w-full ${
        alignEnd ? 'justify-end' : 'justify-start'
      }`}
    >
      {children}
      {active ? (
        dir === 'asc' ? (
          <ChevronUpIcon className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden />
        ) : (
          <ChevronDownIcon className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden />
        )
      ) : (
        <ArrowsUpDownIcon className="w-3.5 h-3.5 shrink-0 text-gray-400 opacity-50 group-hover:opacity-80" aria-hidden />
      )}
    </button>
  );
}

export const WorkReportPage = () => {
  const [granularity, setGranularity] = useState<PayrollPeriodGranularity>('month');
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState(1);

  const [report, setReport] = useState<PayrollPeriodReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activitySortKey, setActivitySortKey] = useState<ActivitySortKey>('employee');
  const [activitySortDir, setActivitySortDir] = useState<'asc' | 'desc'>('asc');
  const [activityPage, setActivityPage] = useState(1);
  const [activityPageSize, setActivityPageSize] = useState(10);

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params =
        granularity === 'year'
          ? { granularity: 'year' as const, year }
          : granularity === 'quarter'
            ? { granularity: 'quarter' as const, year, quarter }
            : { granularity: 'month' as const, year, month };
      const data = await workReportService.getPayrollPeriodReport(params);
      setReport(data);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(msg || (err instanceof Error ? err.message : 'Không thể tải báo cáo'));
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  }, [granularity, year, month, quarter]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  const hasSalaryData = report && report.summary.paidSlipCount > 0;
  const hasActivityData = report && report.byEmployee.length > 0;

  useEffect(() => {
    setActivityPage(1);
    setActivitySortKey('employee');
    setActivitySortDir('asc');
  }, [report?.periodLabel, report?.dateFrom, report?.dateTo]);

  const sortedActivityRows = useMemo(() => {
    if (!report?.byEmployee.length) return [];
    const rows = [...report.byEmployee];
    const dir = activitySortDir === 'asc' ? 1 : -1;
    const cmpStr = (a: string, b: string) => a.localeCompare(b, 'vi', { sensitivity: 'base' }) * dir;
    const cmpNum = (a: number, b: number) => (a - b) * dir;

    rows.sort((a, b) => {
      switch (activitySortKey) {
        case 'employee': {
          const c = cmpStr(formatEmployeeDisplayName(a), formatEmployeeDisplayName(b));
          if (c !== 0) return c;
          return cmpStr(a.employeeCode, b.employeeCode);
        }
        case 'department':
          return cmpStr(a.department ?? '', b.department ?? '');
        case 'workDays':
          return cmpNum(a.workDays, b.workDays);
        case 'overtimeHours':
          return cmpNum(a.overtimeHours, b.overtimeHours);
        case 'overtimeQuantity':
          return cmpNum(a.overtimeQuantity, b.overtimeQuantity);
        case 'productTypeCount':
          return cmpNum(a.productTypeCount, b.productTypeCount);
        case 'totalQuantity':
          return cmpNum(a.totalQuantity, b.totalQuantity);
        default:
          return 0;
      }
    });
    return rows;
  }, [report?.byEmployee, activitySortKey, activitySortDir]);

  const activityTotal = sortedActivityRows.length;
  const activityTotalPages = Math.max(1, Math.ceil(activityTotal / activityPageSize));

  useEffect(() => {
    if (activityPage > activityTotalPages) {
      setActivityPage(activityTotalPages);
    }
  }, [activityPage, activityTotalPages]);

  const activityPagedRows = useMemo(() => {
    const start = (activityPage - 1) * activityPageSize;
    return sortedActivityRows.slice(start, start + activityPageSize);
  }, [sortedActivityRows, activityPage, activityPageSize]);

  const handleActivitySort = (key: ActivitySortKey) => {
    if (activitySortKey === key) {
      setActivitySortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setActivitySortKey(key);
      setActivitySortDir(key === 'employee' || key === 'department' ? 'asc' : 'desc');
    }
    setActivityPage(1);
  };

  const activityRangeFrom = activityTotal === 0 ? 0 : (activityPage - 1) * activityPageSize + 1;
  const activityRangeTo = activityTotal === 0 ? 0 : Math.min(activityPage * activityPageSize, activityTotal);

  return (
    <Layout>
      <div className="pt-8 lg:pt-10">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 overflow-x-auto">
          <Link
            to="/dashboard"
            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors whitespace-nowrap"
          >
            Trang chủ
          </Link>
          <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
          <span className="text-gray-900 dark:text-gray-100 font-medium whitespace-nowrap">Báo cáo</span>
        </div>

        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">Báo cáo lương &amp; công</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Tiền lương: chỉ phiếu <span className="font-medium text-gray-800 dark:text-gray-200">Đã thanh toán</span> có
            ngày thanh toán trong kỳ. Công việc: theo ngày làm trong kỳ (có thể khác kỳ thanh toán).
          </p>
        </div>

        <div className="mb-6 bg-gradient-to-br from-white dark:from-gray-800 to-gray-50 dark:to-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700 shadow-md dark:shadow-gray-900/50 shadow-gray-100/50 p-4 lg:p-6">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
            Kỳ báo cáo
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {(
              [
                { id: 'month' as const, label: 'Tháng' },
                { id: 'quarter' as const, label: 'Quý' },
                { id: 'year' as const, label: 'Năm' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setGranularity(opt.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  granularity === opt.id
                    ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                Năm
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10) || new Date().getFullYear())}
                className="w-full px-4 py-2.5 text-sm border border-gray-300/80 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
              />
            </div>

            {granularity === 'month' && (
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                  Tháng
                </label>
                <div className="relative">
                  <select
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                    className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-300/80 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 appearance-none cursor-pointer"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        Tháng {m}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {granularity === 'quarter' && (
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                  Quý
                </label>
                <div className="relative">
                  <select
                    value={quarter}
                    onChange={(e) => setQuarter(parseInt(e.target.value, 10))}
                    className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-300/80 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 appearance-none cursor-pointer"
                  >
                    {[1, 2, 3, 4].map((q) => (
                      <option key={q} value={q}>
                        Quý {q}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && <ErrorMessage message={error} className="mb-4" />}

        {isLoading ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">Đang tải báo cáo...</p>
          </div>
        ) : report ? (
          <div className="space-y-8">
            <div className="rounded-lg border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-100">
              <p className="font-medium">{report.periodLabel}</p>
              <p className="mt-0.5 text-blue-800/90 dark:text-blue-200/90">
                Khung ngày: {formatDate(report.dateFrom)} – {formatDate(report.dateTo)}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <BanknotesIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                Đã thanh toán trong kỳ
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Chỉ tính phiếu lương trạng thái <strong>Thanh toán</strong>, có ngày thanh toán trong kỳ. Chi tiết từng
                phiếu xem tại{' '}
                <Link to="/work/salaries" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                  Lương tháng
                </Link>
                .
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                <SummaryCard
                  label="Thực nhận (tổng)"
                  value={formatCurrency(report.summary.totalNetPaid)}
                  accent="purple"
                />
                <SummaryCard
                  label="Tổng tiền lương (bản ghi)"
                  value={formatCurrency(report.summary.totalAmountSum)}
                  accent="blue"
                />
                <SummaryCard
                  label="Tổng phụ cấp"
                  value={formatCurrency(report.summary.totalAllowancesSum)}
                  accent="green"
                />
                <SummaryCard
                  label="Tổng ứng lương"
                  value={formatCurrency(report.summary.totalAdvanceSum)}
                  accent="amber"
                />
                <SummaryCard
                  label="Số phiếu đã TT"
                  value={String(report.summary.paidSlipCount)}
                  accent="slate"
                  isCount
                />
              </div>

              {!hasSalaryData && (
                <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                  Không có phiếu lương đã thanh toán trong kỳ này.
                </p>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                Hoạt động trong kỳ
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                Dựa trên các bản ghi công việc có <span className="font-medium text-gray-700 dark:text-gray-300">ngày làm</span>{' '}
                nằm trong kỳ báo cáo: số <span className="font-medium text-gray-700 dark:text-gray-300">ngày làm không trùng nhau</span>
                , <span className="font-medium text-gray-700 dark:text-gray-300">tổng giờ làm tăng ca</span>,{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">tổng số lượng làm thêm trong giờ tăng ca</span>,{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  số loại sản phẩm khác nhau có trên bản ghi (bản ghi gắn sản phẩm trong hệ thống)
                </span>
                , và <span className="font-medium text-gray-700 dark:text-gray-300">tổng số lượng</span> đã ghi trên từng bản ghi
                (giờ làm thường, sản phẩm làm được, v.v. — tùy loại công việc).
              </p>

              {!hasActivityData ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                  Không có bản ghi công việc trong kỳ này.
                </p>
              ) : (
                <div className="rounded-xl border border-gray-200/60 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800/80">
                        <tr>
                          <th className="px-3 py-3 text-left">
                            <ActivitySortButton
                              active={activitySortKey === 'employee'}
                              dir={activitySortDir}
                              onClick={() => handleActivitySort('employee')}
                            >
                              <UserGroupIcon className="w-4 h-4 shrink-0" aria-hidden />
                              Nhân viên
                            </ActivitySortButton>
                          </th>
                          <th className="px-3 py-3 text-left">
                            <ActivitySortButton
                              active={activitySortKey === 'department'}
                              dir={activitySortDir}
                              onClick={() => handleActivitySort('department')}
                            >
                              Phòng ban
                            </ActivitySortButton>
                          </th>
                          <th className="px-3 py-3 text-right">
                            <ActivitySortButton
                              active={activitySortKey === 'workDays'}
                              dir={activitySortDir}
                              onClick={() => handleActivitySort('workDays')}
                              alignEnd
                            >
                              <ClipboardDocumentListIcon className="w-4 h-4 shrink-0" aria-hidden />
                              Số ngày làm
                            </ActivitySortButton>
                          </th>
                          <th className="px-3 py-3 text-right">
                            <ActivitySortButton
                              active={activitySortKey === 'overtimeHours'}
                              dir={activitySortDir}
                              onClick={() => handleActivitySort('overtimeHours')}
                              alignEnd
                            >
                              <ClockIcon className="w-4 h-4 shrink-0" aria-hidden />
                              Giờ tăng ca
                            </ActivitySortButton>
                          </th>
                          <th className="px-3 py-3 text-right">
                            <ActivitySortButton
                              active={activitySortKey === 'overtimeQuantity'}
                              dir={activitySortDir}
                              onClick={() => handleActivitySort('overtimeQuantity')}
                              alignEnd
                            >
                              <BoltIcon className="w-4 h-4 shrink-0" aria-hidden />
                              Số lượng tăng ca
                            </ActivitySortButton>
                          </th>
                          <th className="px-3 py-3 text-right">
                            <ActivitySortButton
                              active={activitySortKey === 'productTypeCount'}
                              dir={activitySortDir}
                              onClick={() => handleActivitySort('productTypeCount')}
                              alignEnd
                            >
                              <RectangleStackIcon className="w-4 h-4 shrink-0" aria-hidden />
                              Số loại sản phẩm
                            </ActivitySortButton>
                          </th>
                          <th className="px-3 py-3 text-right">
                            <ActivitySortButton
                              active={activitySortKey === 'totalQuantity'}
                              dir={activitySortDir}
                              onClick={() => handleActivitySort('totalQuantity')}
                              alignEnd
                            >
                              <CubeIcon className="w-4 h-4 shrink-0" aria-hidden />
                              Tổng số lượng
                            </ActivitySortButton>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900/40">
                        {activityPagedRows.map((row) => (
                          <tr key={row.employeeId} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50">
                            <td className="px-3 py-2.5 text-gray-900 dark:text-gray-100 whitespace-nowrap">
                              {formatEmployeeDisplayName(row)}
                              <span className="block text-xs text-gray-500 dark:text-gray-400">{row.employeeCode}</span>
                            </td>
                            <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{row.department || '—'}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums">{row.workDays}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums">
                              {formatMetricQty(row.overtimeHours)}
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums">
                              {formatMetricQty(row.overtimeQuantity)}
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums">{row.productTypeCount}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums">
                              {formatMetricQty(row.totalQuantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex flex-wrap items-center gap-3">
                      <span>
                        Hiển thị{' '}
                        <span className="font-medium text-gray-900 dark:text-gray-100">{activityRangeFrom}</span>
                        {' – '}
                        <span className="font-medium text-gray-900 dark:text-gray-100">{activityRangeTo}</span> trong{' '}
                        <span className="font-medium text-gray-900 dark:text-gray-100">{activityTotal}</span> nhân viên
                      </span>
                      <label className="inline-flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-500">Số dòng/trang</span>
                        <select
                          value={activityPageSize}
                          onChange={(e) => {
                            setActivityPageSize(parseInt(e.target.value, 10));
                            setActivityPage(1);
                          }}
                          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100 text-xs sm:text-sm"
                        >
                          {[5, 10, 25, 50, 100].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    {activityTotalPages > 1 && (
                      <Pagination
                        currentPage={activityPage}
                        totalPages={activityTotalPages}
                        hasNextPage={activityPage < activityTotalPages}
                        hasPreviousPage={activityPage > 1}
                        onPageChange={setActivityPage}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

function SummaryCard({
  label,
  value,
  accent,
  isCount,
}: {
  label: string;
  value: string;
  accent: 'purple' | 'blue' | 'green' | 'amber' | 'slate';
  isCount?: boolean;
}) {
  const ring =
    accent === 'purple'
      ? 'from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/20 border-purple-100 dark:border-purple-900/40'
      : accent === 'blue'
        ? 'from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/20 border-blue-100 dark:border-blue-900/40'
        : accent === 'green'
          ? 'from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20 border-emerald-100 dark:border-emerald-900/40'
          : accent === 'amber'
            ? 'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 border-amber-100 dark:border-amber-900/40'
            : 'from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-900/30 border-gray-200 dark:border-gray-600';

  return (
    <div className={`rounded-xl border bg-gradient-to-br p-4 shadow-sm ${ring}`}>
      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</p>
      <p
        className={`mt-1 font-bold text-gray-900 dark:text-gray-100 ${isCount ? 'text-xl' : 'text-base'} break-words`}
      >
        {value}
      </p>
    </div>
  );
}
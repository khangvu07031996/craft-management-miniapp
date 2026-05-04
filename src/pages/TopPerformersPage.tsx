import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchEmployees } from '../store/slices/employeeSlice';
import { Layout } from '../components/layout/Layout';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { workReportService } from '../services/work.service';
import { formatDate } from '../utils/date';
import type {
  TopPerformersReport,
  TopPerformerMetricKey,
  PayrollPeriodGranularity,
} from '../types/work.types';
import {
  ChevronRightIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

const METRIC_LABELS: Record<TopPerformerMetricKey, string> = {
  totalQuantity: 'Tổng số lượng (ghi trên bản ghi)',
  totalAmount: 'Tổng giá trị công làm được',
  productTypeCount: 'Số loại sản phẩm (sản phẩm có mã trong hệ thống)',
  workDays: 'Số ngày làm (ngày khác nhau)',
  overtimeHours: 'Tổng giờ tăng ca',
  overtimeQuantity: 'Tổng số lượng làm trong giờ tăng ca',
  weekAttendanceRatio: 'Tỷ lệ tuần có công',
};

const METRICS_PRODUCTIVITY: TopPerformerMetricKey[] = [
  'totalQuantity',
  'totalAmount',
  'productTypeCount',
  'overtimeHours',
  'overtimeQuantity',
];

const METRICS_DILIGENCE: TopPerformerMetricKey[] = ['workDays', 'weekAttendanceRatio'];

const ALL_METRICS: TopPerformerMetricKey[] = [...METRICS_PRODUCTIVITY, ...METRICS_DILIGENCE];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

function formatMetricValue(metric: TopPerformerMetricKey, value: number, weeksInPeriod?: number): string {
  if (metric === 'totalAmount') return formatCurrency(value);
  if (metric === 'weekAttendanceRatio') {
    const pct = `${(value * 100).toFixed(1)}%`;
    if (weeksInPeriod != null) return `${pct} (${weeksInPeriod} tuần trong kỳ)`;
    return pct;
  }
  if (metric === 'overtimeHours' || metric === 'overtimeQuantity' || metric === 'totalQuantity') {
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(2);
  }
  return String(value);
}

/** Chip “Đề xuất”: không hiển thị “Giờ TC: hạng 1 (0)” — nếu có bảng “Lượng TC” thì thay bằng hạng/giá trị lượng tăng ca. */
function suggestionBadgeReasons(
  report: TopPerformersReport,
  employeeId: string,
  reasons: ReadonlyArray<{ metric: TopPerformerMetricKey; rank: number; value: number }>,
  limit: number
): Array<{ metric: TopPerformerMetricKey; rank: number; value: number }> {
  const projected = reasons
    .map((reason): { metric: TopPerformerMetricKey; rank: number; value: number } | null => {
      if (reason.metric === 'overtimeHours' && reason.value <= 0) {
        const row = report.rankings.overtimeQuantity?.find((r) => r.employeeId === employeeId);
        if (row) return { metric: 'overtimeQuantity', rank: row.rank, value: row.value };
        return null;
      }
      return reason;
    })
    .filter((r): r is { metric: TopPerformerMetricKey; rank: number; value: number } => Boolean(r));

  const dedup = new Map<TopPerformerMetricKey, { metric: TopPerformerMetricKey; rank: number; value: number }>();
  for (const r of projected) {
    const prev = dedup.get(r.metric);
    if (!prev || r.rank < prev.rank) dedup.set(r.metric, r);
  }

  return [...dedup.values()].sort((a, b) => a.rank - b.rank).slice(0, limit);
}

/** Chỉ tiêu có chênh lệch thật trong kỳ (backend gửi scoringEligibleByMetric; thiếu thì suy từ bảng top). */
function isMetricScoringEligible(report: TopPerformersReport, metric: TopPerformerMetricKey): boolean {
  const flag = report.scoringEligibleByMetric?.[metric];
  if (flag === false) return false;
  if (flag === true) return true;
  const rows = report.rankings[metric] ?? [];
  if (rows.length < 2) return false;
  let minV = Infinity;
  let maxV = -Infinity;
  for (const r of rows) {
    const v = r.value;
    if (v < minV) minV = v;
    if (v > maxV) maxV = v;
  }
  return maxV - minV > 1e-6;
}

export const TopPerformersPage = () => {
  const dispatch = useAppDispatch();
  const { employees } = useAppSelector((s) => s.employees);

  const [granularity, setGranularity] = useState<PayrollPeriodGranularity>('month');
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState(1);
  const [department, setDepartment] = useState('');
  const [topN, setTopN] = useState(10);
  const [onlyPaid, setOnlyPaid] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<Set<TopPerformerMetricKey>>(
    () => new Set(ALL_METRICS)
  );

  const [report, setReport] = useState<TopPerformersReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasReportRef = useRef(false);

  useEffect(() => {
    hasReportRef.current = Boolean(report);
  }, [report]);

  useEffect(() => {
    dispatch(fetchEmployees({ filters: {}, pagination: { page: 1, pageSize: 1000 }, sort: {} }));
  }, [dispatch]);

  const departments = useMemo(() => {
    const d = new Set<string>();
    for (const e of employees) {
      if (e.department?.trim()) d.add(e.department.trim());
    }
    return [...d].sort((a, b) => a.localeCompare(b, 'vi'));
  }, [employees]);

  const metricsArray = useMemo(
    () => Array.from(selectedMetrics).sort() as TopPerformerMetricKey[],
    [selectedMetrics]
  );

  /** KPI gửi backend: có thể thêm lượng tăng ca (ẩn) khi chỉ bật giờ TC — để chip đề xuất có dữ liệu thực thay rank (0). */
  const metricsForApi = useMemo(() => {
    const set = new Set<TopPerformerMetricKey>(metricsArray);
    if (set.has('overtimeHours') && !set.has('overtimeQuantity')) set.add('overtimeQuantity');
    return [...set].sort() as TopPerformerMetricKey[];
  }, [metricsArray]);

  const load = useCallback(async () => {
    if (metricsArray.length === 0) {
      setError('Vui lòng chọn ít nhất một chỉ tiêu xếp hạng');
      return;
    }
    if (hasReportRef.current) setIsRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const params =
        granularity === 'year'
          ? { granularity: 'year' as const, year }
          : granularity === 'quarter'
            ? { granularity: 'quarter' as const, year, quarter }
            : { granularity: 'month' as const, year, month };
      const data = await workReportService.getTopPerformersReport({
        ...params,
        department: department.trim() || undefined,
        top: topN,
        metrics: metricsForApi,
        onlyPaidEmployees: onlyPaid,
      });
      setReport(data);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(msg || (err instanceof Error ? err.message : 'Không thể tải dữ liệu'));
      setReport(null);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [granularity, year, month, quarter, department, topN, onlyPaid, metricsArray, metricsForApi]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const toggleMetric = (key: TopPerformerMetricKey) => {
    setSelectedMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectGroup = (keys: TopPerformerMetricKey[], checked: boolean) => {
    setSelectedMetrics((prev) => {
      const next = new Set(prev);
      for (const k of keys) {
        if (checked) next.add(k);
        else next.delete(k);
      }
      return next;
    });
  };

  const exportCsv = () => {
    if (!report) return;
    const lines: string[] = ['\ufeff']; // BOM
    lines.push(`Báo cáo top nhân viên — ${report.periodLabel}`);
    lines.push(`Từ ${formatDate(report.dateFrom)} đến ${formatDate(report.dateTo)}`);
    lines.push(`Top ${report.top}${report.onlyPaidEmployees ? ' — chỉ NV có lương đã TT trong kỳ' : ''}`);
    lines.push('');

    for (const key of ALL_METRICS) {
      if (!selectedMetrics.has(key)) continue;
      const rows = report.rankings[key];
      if (!rows?.length) continue;
      lines.push(METRIC_LABELS[key]);
      lines.push('Hạng,Nhân viên,Mã NV,Phòng ban,Giá trị');
      for (const r of rows) {
        const val = formatMetricValue(key, r.value, report.weeksInPeriod);
        const name = `"${r.lastName} ${r.firstName}"`;
        const dept = `"${(r.department ?? '').replace(/"/g, '""')}"`;
        lines.push(`${r.rank},${name},"${r.employeeCode}",${dept},"${String(val).replace(/"/g, '""')}"`);
      }
      lines.push('');
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `top-nhan-vien-${report.dateFrom}-${report.dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const bestPerformerSuggestion = useMemo(() => {
    if (!report) return null;

    const activeProductivityMetrics = METRICS_PRODUCTIVITY.filter((m) => selectedMetrics.has(m));
    if (activeProductivityMetrics.length === 0) return null;

    const eligibleMetrics = activeProductivityMetrics.filter((m) => isMetricScoringEligible(report, m));
    if (eligibleMetrics.length === 0) return null;

    const scoreMap = new Map<
      string,
      {
        employeeId: string;
        firstName: string;
        lastName: string;
        employeeCode: string;
        department: string | null;
        score: number;
        reasons: Array<{ metric: TopPerformerMetricKey; rank: number; value: number }>;
      }
    >();

    for (const metric of eligibleMetrics) {
      const rows = report.rankings[metric] ?? [];
      for (const row of rows) {
        const points = Math.max(0, topN + 1 - row.rank);
        const existing = scoreMap.get(row.employeeId);
        if (!existing) {
          scoreMap.set(row.employeeId, {
            employeeId: row.employeeId,
            firstName: row.firstName,
            lastName: row.lastName,
            employeeCode: row.employeeCode,
            department: row.department,
            score: points,
            reasons: [{ metric, rank: row.rank, value: row.value }],
          });
        } else {
          existing.score += points;
          existing.reasons.push({ metric, rank: row.rank, value: row.value });
        }
      }
    }

    const ranked = Array.from(scoreMap.values()).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const an = `${a.lastName} ${a.firstName}`;
      const bn = `${b.lastName} ${b.firstName}`;
      return an.localeCompare(bn, 'vi', { sensitivity: 'base' });
    });
    if (ranked.length === 0) return null;

    const best = ranked[0];
    best.reasons.sort((a, b) => a.rank - b.rank);

    return {
      ...best,
      metricsUsedInScore: eligibleMetrics,
      metricsSelectedProductivity: activeProductivityMetrics,
      maxScore: eligibleMetrics.length * topN,
    };
  }, [report, selectedMetrics, topN]);

  const suggestionNoDiscrimination = useMemo(() => {
    if (!report) return false;
    const active = METRICS_PRODUCTIVITY.filter((m) => selectedMetrics.has(m));
    const eligible = active.filter((m) => isMetricScoringEligible(report, m));
    return active.length > 0 && eligible.length === 0;
  }, [report, selectedMetrics]);

  const suggestionBadges =
    report && bestPerformerSuggestion
      ? suggestionBadgeReasons(report, bestPerformerSuggestion.employeeId, bestPerformerSuggestion.reasons, 4)
      : [];

  return (
    <Layout>
      <div className="pt-8 lg:pt-10">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 overflow-x-auto">
          <Link to="/dashboard" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors whitespace-nowrap">
            Trang chủ
          </Link>
          <ChevronRightIcon className="w-4 h-4 shrink-0" />
          <span className="text-gray-900 dark:text-gray-100 font-medium whitespace-nowrap">Top nhân viên</span>
        </div>

        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <TrophyIcon className="w-7 h-7 text-amber-500" />
            Gợi ý nhân viên tiêu biểu
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
            Xếp hạng theo từng chỉ tiêu trong kỳ chọn — nên đọc tách <strong>năng suất</strong> và{' '}
            <strong>chuyên cần</strong>. Không gộp thành một điểm duy nhất (tránh bias giữa xưởng và VP).
            Có thể lọc phòng ban và chỉ nhân viên có <strong>lương đã thanh toán trong kỳ</strong>.
          </p>
        </div>

        <div className="mb-6 bg-gradient-to-br from-white dark:from-gray-800 to-gray-50 dark:to-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700 shadow-md p-4 lg:p-6 space-y-4">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            Điều kiện
          </p>
          <div className="flex flex-wrap gap-2">
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
                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Năm</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10) || new Date().getFullYear())}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            {granularity === 'month' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Tháng</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {granularity === 'quarter' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Quý</label>
                <select
                  value={quarter}
                  onChange={(e) => setQuarter(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  {[1, 2, 3, 4].map((q) => (
                    <option key={q} value={q}>
                      Quý {q}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Phòng ban</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="">Tất cả</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Top N</label>
              <select
                value={topN}
                onChange={(e) => setTopN(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                {[5, 10, 15, 20, 30, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyPaid}
              onChange={(e) => setOnlyPaid(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            Chỉ nhân viên có ít nhất một phiếu lương <strong className="font-medium">Đã thanh toán</strong> (theo
            ngày thanh toán trong kỳ)
          </label>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
              Chỉ tiêu xếp hạng
            </p>
            <div className="flex flex-wrap gap-3 mb-3">
              <button
                type="button"
                onClick={() => selectGroup(METRICS_PRODUCTIVITY, true)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Chọn nhóm năng suất
              </button>
              <button
                type="button"
                onClick={() => selectGroup(METRICS_DILIGENCE, true)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Chọn nhóm chuyên cần
              </button>
              <button
                type="button"
                onClick={() => setSelectedMetrics(new Set(ALL_METRICS))}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Chọn tất cả
              </button>
              <button
                type="button"
                onClick={() => setSelectedMetrics(new Set())}
                className="text-xs text-gray-600 dark:text-gray-400 hover:underline"
              >
                Bỏ chọn
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ALL_METRICS.map((key) => (
                <label
                  key={key}
                  className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/80 p-1.5 -m-1.5"
                >
                  <input
                    type="checkbox"
                    checked={selectedMetrics.has(key)}
                    onChange={() => toggleMetric(key)}
                    className="mt-0.5 rounded border-gray-300 dark:border-gray-600 shrink-0"
                  />
                  <span>
                    {key === 'weekAttendanceRatio'
                      ? 'Tỷ lệ tuần có công (tuần có ≥1 ngày làm / số tuần có ít nhất một ngày thuộc kỳ — xem số tuần ở ghi chú sau khi tải)'
                      : METRIC_LABELS[key]}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Ghi chú: so sánh <strong>tổng số lượng</strong> khác nhau giữa loại công việc đếm mối hàn / giờ / ngày —
              nên ưu tiên xếp trong cùng phòng ban hoặc cùng loại CV.
            </p>
            {isRefreshing && report && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Đang cập nhật kết quả theo bộ lọc...</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading || isRefreshing}
              className="inline-flex items-center rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading || isRefreshing ? 'Đang tải…' : 'Tải lại'}
            </button>
            <button
              type="button"
              onClick={exportCsv}
              disabled={!report || loading || isRefreshing}
              className="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              Xuất CSV
            </button>
          </div>
        </div>

        {error && <ErrorMessage message={error} className="mb-4" />}

        {loading && (
          <p className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">Đang tải báo cáo…</p>
        )}

        {report && (
          <div className="relative space-y-6">
            {isRefreshing && (
              <div className="absolute inset-0 z-10 bg-white/65 dark:bg-gray-900/55 backdrop-blur-[1px] rounded-xl pointer-events-none flex items-start justify-center pt-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Đang cập nhật...
                </div>
              </div>
            )}
            <div className="rounded-lg border border-amber-200 bg-amber-50/90 dark:border-amber-900/40 dark:bg-amber-950/25 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
              <p className="font-medium">{report.periodLabel}</p>
              <p className="mt-0.5">
                Ngày: {formatDate(report.dateFrom)} – {formatDate(report.dateTo)} · Số tuần dùng làm mẫu cho “tỷ lệ tuần có
                công”: <strong>{report.weeksInPeriod}</strong> (mỗi tuần theo máy chủ DB, chỉ đếm tuần có ít nhất một
                ngày nằm trong kỳ)
              </p>
            </div>

            {suggestionNoDiscrimination && (
              <div className="rounded-xl border border-gray-200 bg-gray-50/90 dark:border-gray-700 dark:bg-gray-800/60 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="font-medium text-gray-900 dark:text-gray-100">Chưa thể đề xuất theo điểm tổng hợp</p>
                <p className="mt-1 text-xs leading-relaxed">
                  Các chỉ tiêu năng suất đang chọn không có chênh lệch giữa nhân viên trong kỳ (ví dụ mọi người cùng{' '}
                  <strong>0</strong> giờ tăng ca) — không có cơ sở xếp hạng, nên hệ thống không cộng điểm để tránh chọn
                  nhầm theo thứ tự tên.
                </p>
              </div>
            )}

            {bestPerformerSuggestion && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/40 dark:bg-emerald-950/25 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Đề xuất nhân viên xuất sắc nhất ({report.periodLabel})
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-base font-semibold text-emerald-900 dark:text-emerald-100">
                    {bestPerformerSuggestion.lastName} {bestPerformerSuggestion.firstName}
                  </p>
                  <span className="text-sm text-emerald-800/90 dark:text-emerald-200/90">
                    {bestPerformerSuggestion.employeeCode}
                  </span>
                  <span className="text-sm text-emerald-800/90 dark:text-emerald-200/90">
                    {bestPerformerSuggestion.department || '—'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-emerald-900 dark:text-emerald-100">
                  Điểm tổng hợp: <strong>{bestPerformerSuggestion.score}</strong> / {bestPerformerSuggestion.maxScore}.{' '}
                  Tính trên {bestPerformerSuggestion.metricsUsedInScore.length} chỉ tiêu có chênh lệch trong kỳ
                  {bestPerformerSuggestion.metricsSelectedProductivity.length >
                    bestPerformerSuggestion.metricsUsedInScore.length && (
                    <>
                      {' '}
                      (đang chọn {bestPerformerSuggestion.metricsSelectedProductivity.length} chỉ tiêu năng suất; phần
                      không phân hạng được đã bỏ qua khi chấm điểm)
                    </>
                  )}
                  .
                </p>
                <p className="mt-1 text-xs text-emerald-800/90 dark:text-emerald-200/90">
                  Cách tính điểm: với mỗi KPI được tính, hạng 1 nhận {topN} điểm, hạng 2 nhận {Math.max(0, topN - 1)} điểm,
                  … đến hạng {topN} nhận 1 điểm; hạng hòa (cùng giá trị) dùng chung số hạng theo bảng xếp hạng.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {suggestionBadges.map((reason) => (
                    <span
                      key={`${bestPerformerSuggestion.employeeId}-${reason.metric}`}
                      className="inline-flex items-center rounded-full bg-white/80 dark:bg-emerald-900/40 border border-emerald-200/80 dark:border-emerald-800 px-2.5 py-1 text-xs text-emerald-900 dark:text-emerald-100"
                    >
                      {METRIC_LABELS[reason.metric]}: hạng {reason.rank} (
                      {formatMetricValue(reason.metric, reason.value, report.weeksInPeriod)})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {ALL_METRICS.filter((metricKey) => selectedMetrics.has(metricKey)).map((metricKey) => {
              const ranked = report.rankings[metricKey];
              if (!ranked?.length) return null;
              const title =
                metricKey === 'weekAttendanceRatio'
                  ? `${METRIC_LABELS[metricKey]} (mẫu: ${report.weeksInPeriod} tuần trong kỳ)`
                  : METRIC_LABELS[metricKey];

              return (
                <div
                  key={metricKey}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
                >
                  <div className="bg-gray-50 dark:bg-gray-800/90 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed min-w-[640px] divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                      <colgroup>
                        <col style={{ width: '3.5rem' }} />
                        <col style={{ width: '36%' }} />
                        <col style={{ width: '24%' }} />
                        <col />
                      </colgroup>
                      <thead className="bg-gray-50/80 dark:bg-gray-900/40">
                        <tr>
                          <th className="px-4 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300">
                            Hạng
                          </th>
                          <th className="px-4 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300">
                            Nhân viên
                          </th>
                          <th className="px-4 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300">
                            Phòng ban
                          </th>
                          <th className="px-4 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-300">
                            Giá trị
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {ranked.map((row) => (
                          <tr key={`${metricKey}-${row.employeeId}`} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
                            <td className="px-4 py-2 tabular-nums font-medium align-top">{row.rank}</td>
                            <td className="px-4 py-2 align-top min-w-0">
                              <span className="text-gray-900 dark:text-gray-100 break-words">
                                {row.lastName} {row.firstName}
                              </span>
                              <span className="block text-xs text-gray-500 break-all">{row.employeeCode}</span>
                            </td>
                            <td className="px-4 py-2 text-gray-700 dark:text-gray-300 align-top break-words">
                              {row.department || '—'}
                            </td>
                            <td className="px-4 py-2 text-right tabular-nums font-medium text-gray-900 dark:text-gray-100 align-top whitespace-normal break-words">
                              {formatMetricValue(metricKey, row.value, report.weeksInPeriod)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

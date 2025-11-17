import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMonthlyReport } from '../store/slices/workSlice';
import { Layout } from '../components/layout/Layout';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import type { WorkReportParams } from '../types/work.types';

export const WorkReportPage = () => {
  const dispatch = useAppDispatch();
  const { monthlyReport, isLoading, error } = useAppSelector((state) => state.work);

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    loadMonthlyReport();
  }, [year, month]);

  const loadMonthlyReport = () => {
    const params: WorkReportParams = {
      year,
      month,
    };
    dispatch(fetchMonthlyReport(params));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const renderReport = (report: typeof monthlyReport) => {
    if (!report) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Kỳ báo cáo</p>
              <p className="text-xl font-bold text-gray-900">{report.period}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Tổng nhân viên</p>
              <p className="text-xl font-bold text-gray-900">{report.totalEmployees}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">Tổng số ngày làm việc</p>
              <p className="text-xl font-bold text-gray-900">{report.totalWorkDays}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg md:col-span-3">
              <p className="text-sm text-gray-600">Tổng lương</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(report.totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Theo phòng ban</h3>
            <div className="space-y-3">
              {report.byDepartment.map((dept, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{dept.department}</p>
                    <p className="text-sm text-gray-500">{dept.totalWorkDays} ngày</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(dept.totalAmount)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Theo loại công việc</h3>
            <div className="space-y-3">
              {report.byWorkType.map((workType, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{workType.workTypeName}</p>
                    <p className="text-sm text-gray-500">{workType.count} bản ghi</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(workType.totalAmount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="pt-8 lg:pt-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-4 overflow-x-auto">
          <Link to="/dashboard" className="hover:text-gray-700 transition-colors whitespace-nowrap">
            Trang chủ
          </Link>
          <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
          <span className="text-gray-900 font-medium whitespace-nowrap">Báo cáo</span>
        </div>

        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Báo cáo</h1>
        </div>

        <div className="mb-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200/60 shadow-md shadow-gray-100/50 p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">
                Năm
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 text-sm border border-gray-300/80 rounded-lg bg-white text-gray-700 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">
                Tháng
              </label>
              <div className="relative">
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-300/80 rounded-lg bg-white text-gray-700 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && <ErrorMessage message={error} className="mb-4" />}

        {isLoading ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Đang tải báo cáo...</p>
          </div>
        ) : monthlyReport && monthlyReport.totalEmployees > 0 ? (
          renderReport(monthlyReport)
        ) : (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-500">
              Chưa có số liệu cho tháng {month}/{year}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};


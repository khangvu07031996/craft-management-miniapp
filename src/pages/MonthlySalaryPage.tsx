import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchMonthlySalaries,
  calculateMonthlySalary,
  calculateMonthlySalaryForAll,
  updateMonthlySalaryAllowances,
  payMonthlySalary,
  deleteMonthlySalary,
  setPagination,
} from '../store/slices/workSlice';
import { fetchEmployees } from '../store/slices/employeeSlice';
import { Layout } from '../components/layout/Layout';
import { MonthlySalaryCard } from '../components/work/MonthlySalaryCard';
import { MonthlySalaryDetailModal } from '../components/work/MonthlySalaryDetailModal';
import { Pagination } from '../components/employees/Pagination';
import { CalendarDaysIcon, UserGroupIcon, CalculatorIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { MonthlySalaryResponse } from '../types/work.types';
import { SalaryPayConfirm } from '../components/work/SalaryPayConfirm';
import { SalaryDeleteConfirm } from '../components/work/SalaryDeleteConfirm';
import { SalaryNoEmployeeModal } from '../components/work/SalaryNoEmployeeModal';
import { SalaryNoDataModal } from '../components/work/SalaryNoDataModal';

export const MonthlySalaryPage = () => {
  const dispatch = useAppDispatch();
  const { monthlySalaries, pagination, isLoading } = useAppSelector((state) => state.work);
  const { employees } = useAppSelector((state) => state.employees);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<MonthlySalaryResponse | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNoEmployeeModalOpen, setIsNoEmployeeModalOpen] = useState(false);
  const [isNoDataModalOpen, setIsNoDataModalOpen] = useState(false);
  const [noDataEmployeeName, setNoDataEmployeeName] = useState('');
  const [isCalculatingAll, setIsCalculatingAll] = useState(false);

  useEffect(() => {
    dispatch(fetchEmployees({ filters: {}, pagination: { page: 1, pageSize: 1000 }, sort: {} }));
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, selectedMonth, selectedEmployeeId]);

  useEffect(() => {
    const filters: {
      year: number;
      month: number;
      employeeId?: string;
    } = {
      year: selectedYear,
      month: selectedMonth,
    };

    if (selectedEmployeeId && selectedEmployeeId.trim() !== '') {
      filters.employeeId = selectedEmployeeId;
    }

    dispatch(
      fetchMonthlySalaries({
        filters,
        pagination: {
          page: currentPage,
          pageSize: pagination.pageSize,
        },
      })
    );
  }, [selectedYear, selectedMonth, selectedEmployeeId, currentPage, pagination.pageSize, dispatch]);

  useEffect(() => {
    if (pagination.page !== currentPage && pagination.page > 0) {
      setCurrentPage(pagination.page);
    }
  }, [pagination.page, currentPage]);

  const handleCalculateSalary = async () => {
    // If "Tất cả nhân viên" is selected (value is empty string "")
    // Calculate for all active employees
    if (!selectedEmployeeId || selectedEmployeeId.trim() === '') {
      setIsCalculatingAll(true);
      try {
        await dispatch(
          calculateMonthlySalaryForAll({
            year: selectedYear,
            month: selectedMonth,
          })
        ).unwrap();
        refreshList();
      } catch (error: any) {
        console.error('Error calculating monthly salary for all:', error);
      } finally {
        setIsCalculatingAll(false);
      }
      return;
    }

    // Calculate for single employee
    try {
      await dispatch(
        calculateMonthlySalary({
          employeeId: selectedEmployeeId,
          year: selectedYear,
          month: selectedMonth,
        })
      ).unwrap();
      refreshList();
    } catch (error: any) {
      console.error('Error calculating monthly salary:', error);
      // Check if error is about no salary data
      // When using unwrap(), rejectWithValue returns the value in error.payload or error itself
      // The error from unwrap() can be the string directly or an object with payload
      let errorMessage = '';
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.payload) {
        errorMessage = error.payload;
      } else if (error?.message) {
        errorMessage = error.message;
      } else {
        errorMessage = String(error);
      }
      
      if (errorMessage.includes('Không có dữ liệu lương cho nhân viên')) {
        // Extract employee name from error message or get from employees list
        const employee = employees.find(emp => emp.id === selectedEmployeeId);
        const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : 'nhân viên này';
        setNoDataEmployeeName(employeeName);
        setIsNoDataModalOpen(true);
      }
    }
  };

  const refreshList = () => {
    const filters: { year?: number; month?: number; employeeId?: string } = {
      year: selectedYear,
      month: selectedMonth,
    };
    if (selectedEmployeeId && selectedEmployeeId.trim() !== '') {
      filters.employeeId = selectedEmployeeId;
    }
    dispatch(
      fetchMonthlySalaries({
        filters,
        pagination: { page: currentPage, pageSize: pagination.pageSize },
      })
    );
  };

  const handleUpdateAllowances = async (id: string, allowances: number) => {
    try {
      await dispatch(updateMonthlySalaryAllowances({ id, allowances })).unwrap();
      refreshList();
    } catch (error) {
      console.error('Error updating allowances:', error);
    }
  };

  const handlePay = (id: string) => {
    const salary = monthlySalaries.find((s) => s.id === id) || null;
    setSelectedSalary(salary);
    setIsPayModalOpen(true);
  };

  const confirmPay = async () => {
    if (!selectedSalary) return;
    try {
      await dispatch(payMonthlySalary(selectedSalary.id)).unwrap();
      setIsPayModalOpen(false);
      setSelectedSalary(null);
      refreshList();
    } catch (error) {
      console.error('Error paying monthly salary:', error);
    }
  };

  const handleDelete = (id: string) => {
    const salary = monthlySalaries.find((s) => s.id === id) || null;
    setSelectedSalary(salary);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSalary) return;
    try {
      await dispatch(deleteMonthlySalary(selectedSalary.id)).unwrap();
      setIsDeleteModalOpen(false);
      setSelectedSalary(null);
      refreshList();
    } catch (error) {
      console.error('Error deleting monthly salary:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    dispatch(setPagination({ ...pagination, page }));
  };

  const handleViewDetails = (salaryId: string) => {
    const salary = monthlySalaries.find((s) => s.id === salaryId);
    if (salary) {
      setSelectedSalary(salary);
      setIsDetailModalOpen(true);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedSalary(null);
  };

  return (
    <Layout>
      <div className="pt-8 lg:pt-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 overflow-x-auto">
          <Link to="/dashboard" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors whitespace-nowrap">
            Trang chủ
          </Link>
          <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
          <span className="text-gray-900 dark:text-gray-100 font-medium whitespace-nowrap">Lương tháng</span>
        </div>

        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">Lương tháng</h1>
        </div>

        {/* Filter Section */}
        <div className="mb-4 lg:mb-6 bg-gradient-to-br from-white dark:from-gray-800 to-gray-50 dark:to-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700 shadow-md dark:shadow-gray-900/50 shadow-gray-100/50 p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                <CalendarDaysIcon className="w-3.5 h-3.5" />
                Năm
              </label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => {
                  const year = parseInt(e.target.value) || new Date().getFullYear();
                  setSelectedYear(year);
                }}
                className="w-full px-4 py-2.5 text-sm border border-gray-300/80 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                <CalendarDaysIcon className="w-3.5 h-3.5" />
                Tháng
              </label>
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(parseInt(e.target.value));
                  }}
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-300/80 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 appearance-none cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      Tháng {month}
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

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                <UserGroupIcon className="w-3.5 h-3.5" />
                Nhân viên
              </label>
              <div className="relative">
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => {
                    setSelectedEmployeeId(e.target.value);
                  }}
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-300/80 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">Tất cả nhân viên</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
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

            <div className="flex items-end">
              <button
                onClick={handleCalculateSalary}
                disabled={isCalculatingAll}
                className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <CalculatorIcon className="w-5 h-5" />
                <span>{isCalculatingAll ? 'Đang tính lương...' : 'Tính lương'}</span>
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">Đang tải...</p>
          </div>
        ) : monthlySalaries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Không có dữ liệu lương tháng</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {monthlySalaries.map((salary) => (
                <MonthlySalaryCard
                  key={salary.id}
                  monthlySalary={salary}
                  onViewDetails={handleViewDetails}
                  onUpdateAllowances={handleUpdateAllowances}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {pagination.totalPages && pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={pagination.page || 1}
                  totalPages={pagination.totalPages}
                  hasNextPage={(pagination.page || 1) < pagination.totalPages}
                  hasPreviousPage={(pagination.page || 1) > 1}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}

        <MonthlySalaryDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          monthlySalary={selectedSalary}
          onPay={(id) => {
            handlePay(id);
          }}
        />
        <SalaryPayConfirm
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          monthlySalary={selectedSalary}
          onConfirm={confirmPay}
        />
        <SalaryDeleteConfirm
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          monthlySalary={selectedSalary}
          onConfirm={confirmDelete}
        />
        <SalaryNoEmployeeModal
          isOpen={isNoEmployeeModalOpen}
          onClose={() => setIsNoEmployeeModalOpen(false)}
        />
        <SalaryNoDataModal
          isOpen={isNoDataModalOpen}
          onClose={() => setIsNoDataModalOpen(false)}
          employeeName={noDataEmployeeName}
        />
      </div>
    </Layout>
  );
};

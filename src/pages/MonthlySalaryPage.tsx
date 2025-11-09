import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchMonthlySalaries,
  calculateMonthlySalary,
  updateMonthlySalaryStatus,
  setPagination,
} from '../store/slices/workSlice';
import { fetchEmployees } from '../store/slices/employeeSlice';
import { Layout } from '../components/layout/Layout';
import { MonthlySalaryCard } from '../components/work/MonthlySalaryCard';
import { MonthlySalaryDetailModal } from '../components/work/MonthlySalaryDetailModal';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Pagination } from '../components/employees/Pagination';
import type { MonthlySalaryStatus, MonthlySalaryResponse } from '../types/work.types';

export const MonthlySalaryPage = () => {
  const dispatch = useAppDispatch();
  const { monthlySalaries, pagination, isLoading, error } = useAppSelector((state) => state.work);
  const { employees } = useAppSelector((state) => state.employees);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<MonthlySalaryResponse | null>(null);

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

  const handleCalculateSalary = async (employeeId: string) => {
    try {
      await dispatch(
        calculateMonthlySalary({
          employeeId,
          year: selectedYear,
          month: selectedMonth,
        })
      ).unwrap();
      const filters: {
        year?: number;
        month?: number;
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
    } catch (error) {
      console.error('Error calculating monthly salary:', error);
    }
  };

  const handleUpdateStatus = async (id: string, status: MonthlySalaryStatus) => {
    try {
      await dispatch(updateMonthlySalaryStatus({ id, status })).unwrap();
      const filters: {
        year?: number;
        month?: number;
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
    } catch (error) {
      console.error('Error updating status:', error);
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
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Lương tháng</h1>
        </div>

        <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Năm</label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => {
                  const year = parseInt(e.target.value) || new Date().getFullYear();
                  setSelectedYear(year);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tháng</label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(parseInt(e.target.value));
                }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    Tháng {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nhân viên</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => {
                  setSelectedEmployeeId(e.target.value);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả nhân viên</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  if (selectedEmployeeId) {
                    handleCalculateSalary(selectedEmployeeId);
                  } else {
                    alert('Vui lòng chọn nhân viên để tính lương');
                  }
                }}
                size="sm"
                className="w-full"
              >
                Tính lương
              </Button>
            </div>
          </div>
        </div>

        {error && <ErrorMessage message={error} className="mb-4" />}

        {isLoading ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Đang tải...</p>
          </div>
        ) : monthlySalaries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-500">Không có dữ liệu lương tháng</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {monthlySalaries.map((salary) => (
                <MonthlySalaryCard
                  key={salary.id}
                  monthlySalary={salary}
                  onViewDetails={handleViewDetails}
                  onUpdateStatus={handleUpdateStatus}
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
        />
      </div>
    </Layout>
  );
};

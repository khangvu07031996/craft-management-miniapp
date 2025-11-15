import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchWorkRecords,
  deleteWorkRecord,
  setPagination,
} from '../store/slices/workSlice';
import { fetchEmployees } from '../store/slices/employeeSlice';
import { Layout } from '../components/layout/Layout';
import { WorkRecordForm } from '../components/work/WorkRecordForm';
import { WorkRecordList } from '../components/work/WorkRecordList';
import { WorkRecordDeleteConfirm } from '../components/work/WorkRecordDeleteConfirm';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { Pagination } from '../components/employees/Pagination';
import type { WorkRecordResponse } from '../types/work.types';
import { PencilIcon, TrashIcon, FunnelIcon, CalendarDaysIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/solid';

export const WorkRecordPage = () => {
  const dispatch = useAppDispatch();
  const { workRecords, pagination, isLoadingFetch, isLoadingDelete, error } = useAppSelector((state) => state.work);
  const { employees } = useAppSelector((state) => state.employees);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WorkRecordResponse | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<WorkRecordResponse | null>(null);
  const [filterType, setFilterType] = useState<'single' | 'range' | 'all'>('single');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch employees on mount
  useEffect(() => {
    dispatch(fetchEmployees({ filters: {}, pagination: { page: 1, pageSize: 1000 }, sort: {} }));
  }, [dispatch]);

  // Reset to page 1 when filters change (but not when currentPage changes)
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, selectedDate, dateFrom, dateTo, selectedEmployeeId]);

  // Load work records when filters or pagination changes
  useEffect(() => {
    loadWorkRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, selectedDate, dateFrom, dateTo, selectedEmployeeId, currentPage]);

  const loadWorkRecords = () => {
    const filters: {
      dateFrom?: string;
      dateTo?: string;
      employeeId?: string;
    } = {};

    if (filterType === 'single') {
      filters.dateFrom = selectedDate;
      filters.dateTo = selectedDate;
    } else if (filterType === 'range') {
      filters.dateFrom = dateFrom;
      filters.dateTo = dateTo;
    }
    // If filterType is 'all', no date filters are applied

    // Add employee filter if selected
    if (selectedEmployeeId && selectedEmployeeId.trim() !== '') {
      filters.employeeId = selectedEmployeeId;
    }

    console.log('WorkRecordPage.loadWorkRecords - Filter type:', filterType);
    console.log('WorkRecordPage.loadWorkRecords - Filters:', filters);
    console.log('WorkRecordPage.loadWorkRecords - Selected date:', selectedDate);
    console.log('WorkRecordPage.loadWorkRecords - Selected employee:', selectedEmployeeId);

    dispatch(
      fetchWorkRecords({
        filters,
        pagination: {
          page: currentPage,
          pageSize: 10, // Always 10 items per page
        },
      })
    );
  };

  // Sync currentPage with Redux pagination after fetch
  useEffect(() => {
    if (pagination.page !== currentPage && pagination.page > 0) {
      setCurrentPage(pagination.page);
    }
  }, [pagination.page]);

  const handleCreate = () => {
    setSelectedRecord(null);
    setIsFormOpen(true);
  };

  const handleEdit = (record: WorkRecordResponse) => {
    setSelectedRecord(record);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    const record = workRecords.find((r) => r.id === id);
    if (record) {
      setRecordToDelete(record);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (recordToDelete) {
      try {
        await dispatch(deleteWorkRecord(recordToDelete.id)).unwrap();
        setIsDeleteModalOpen(false);
        setRecordToDelete(null);
        loadWorkRecords();
      } catch (error) {
        console.error('Error deleting work record:', error);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedRecord(null);
    loadWorkRecords();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedRecord(null);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value as 'single' | 'range' | 'all');
    setCurrentPage(1);
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFrom(e.target.value);
    setCurrentPage(1);
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateTo(e.target.value);
    setCurrentPage(1);
  };

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmployeeId(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    dispatch(setPagination({ ...pagination, page, pageSize: 10 }));
  };

  return (
    <Layout>
      <div className="pt-4 lg:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Nhập công việc</h1>
          <button
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm sm:text-base font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Thêm công việc</span>
          </button>
        </div>

        {error && <ErrorMessage message={error} className="mb-4" />}

        {isFormOpen && (
          <div className="mb-4 lg:mb-6 bg-white rounded-lg border border-gray-200 shadow-sm p-4 lg:p-6">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">
              {selectedRecord ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
            </h2>
            <WorkRecordForm
              workRecord={selectedRecord}
              onCancel={handleFormCancel}
              onSuccess={handleFormSuccess}
            />
          </div>
        )}

        <div className="mb-4 lg:mb-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200/60 shadow-md shadow-gray-100/50 p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">
                <FunnelIcon className="w-3.5 h-3.5" />
                Loại lọc
              </label>
              <div className="relative">
                <select
                  value={filterType}
                  onChange={handleFilterTypeChange}
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-300/80 rounded-lg bg-white text-gray-700 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="single">Một ngày</option>
                  <option value="range">Khoảng ngày</option>
                  <option value="all">Tất cả</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {filterType === 'single' && (
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">
                  <CalendarDaysIcon className="w-3.5 h-3.5" />
                  Chọn ngày
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300/80 rounded-lg bg-white text-gray-700 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            )}

            {filterType === 'range' && (
              <>
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">
                    <CalendarDaysIcon className="w-3.5 h-3.5" />
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={handleDateFromChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300/80 rounded-lg bg-white text-gray-700 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">
                    <CalendarDaysIcon className="w-3.5 h-3.5" />
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={handleDateToChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300/80 rounded-lg bg-white text-gray-700 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </>
            )}

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">
                <UserGroupIcon className="w-3.5 h-3.5" />
                Nhân viên
              </label>
              <div className="relative">
                <select
                  value={selectedEmployeeId}
                  onChange={handleEmployeeChange}
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-300/80 rounded-lg bg-white text-gray-700 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">Tất cả nhân viên</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
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

        <LoadingOverlay isLoading={isLoadingFetch}>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <WorkRecordList
              workRecords={workRecords}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            {pagination.totalPages && pagination.totalPages > 1 && (
              <div className="flex justify-center py-4 border-t border-gray-200">
                <Pagination
                  currentPage={pagination.page || 1}
                  totalPages={pagination.totalPages}
                  hasNextPage={(pagination.page || 1) < pagination.totalPages}
                  hasPreviousPage={(pagination.page || 1) > 1}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </LoadingOverlay>
      </div>

      {/* Delete Confirmation Modal */}
      <WorkRecordDeleteConfirm
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setRecordToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        workRecord={recordToDelete}
        isLoading={isLoadingDelete}
      />
    </Layout>
  );
};


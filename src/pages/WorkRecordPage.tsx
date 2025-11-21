import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
import { ErrorMessage } from '../components/common/ErrorMessage';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { Pagination } from '../components/employees/Pagination';
import type { WorkRecordResponse } from '../types/work.types';
import { FunnelIcon, CalendarDaysIcon, UserGroupIcon, ChevronRightIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/solid';

export const WorkRecordPage = () => {
  const dispatch = useAppDispatch();
  const { workRecords, pagination, isLoadingFetch, isLoadingDelete, error } = useAppSelector((state) => state.work);
  const { employees } = useAppSelector((state) => state.employees);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WorkRecordResponse | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<WorkRecordResponse | null>(null);
  const [filterType, setFilterType] = useState<'single' | 'range' | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'Tạo mới' | 'Đã thanh toán' | 'all'>('Tạo mới');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch employees on mount
  useEffect(() => {
    dispatch(fetchEmployees({ filters: {}, pagination: { page: 1, pageSize: 1000 }, sort: {} }));
  }, [dispatch]);

  // Reset to page 1 when filters change (but not when currentPage changes)
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, selectedDate, dateFrom, dateTo, selectedEmployeeId, statusFilter]);

  // Load work records when filters or pagination changes
  useEffect(() => {
    loadWorkRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, selectedDate, dateFrom, dateTo, selectedEmployeeId, statusFilter, currentPage]);

  const loadWorkRecords = () => {
    const filters: {
      dateFrom?: string;
      dateTo?: string;
      employeeId?: string;
      status?: string;
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

    // Add status filter if not 'all'
    if (statusFilter !== 'all') {
      filters.status = statusFilter;
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

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? (
      <ArrowUpIcon className="w-4 h-4 inline ml-1" />
    ) : (
      <ArrowDownIcon className="w-4 h-4 inline ml-1" />
    );
  };

  // Sort work records
  const sortedWorkRecords = useMemo(() => {
    if (!sortBy) return workRecords;
    
    const sorted = [...workRecords].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortBy === 'workDate') {
        aValue = new Date(a.workDate).getTime();
        bValue = new Date(b.workDate).getTime();
      } else if (sortBy === 'employee') {
        const aName = a.employee 
          ? `${a.employee.lastName} ${a.employee.firstName}`.toLowerCase()
          : a.employeeId?.toLowerCase() || '';
        const bName = b.employee 
          ? `${b.employee.lastName} ${b.employee.firstName}`.toLowerCase()
          : b.employeeId?.toLowerCase() || '';
        aValue = aName;
        bValue = bName;
      } else if (sortBy === 'totalAmount') {
        aValue = a.totalAmount || 0;
        bValue = b.totalAmount || 0;
      } else {
        return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [workRecords, sortBy, sortOrder]);

  return (
    <Layout>
      <div className="pt-8 lg:pt-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-4 overflow-x-auto">
          <Link to="/dashboard" className="hover:text-gray-700 transition-colors whitespace-nowrap">
            Trang chủ
          </Link>
          <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
          <span className="text-gray-900 font-medium whitespace-nowrap">Nhập công việc</span>
        </div>

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
          <div className="mb-4 lg:mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/50 p-4 lg:p-6">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {selectedRecord ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
            </h2>
            <WorkRecordForm
              workRecord={selectedRecord}
              onCancel={handleFormCancel}
              onSuccess={handleFormSuccess}
            />
          </div>
        )}

        <div className="mb-4 lg:mb-6 bg-gradient-to-br from-white dark:from-gray-800 to-gray-50 dark:to-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700 shadow-md dark:shadow-gray-900/50 shadow-gray-100/50 p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                <FunnelIcon className="w-3.5 h-3.5" />
                Loại lọc
              </label>
              <div className="relative">
                <select
                  value={filterType}
                  onChange={handleFilterTypeChange}
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-300/80 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="single">Một ngày</option>
                  <option value="range">Khoảng ngày</option>
                  <option value="all">Tất cả</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {filterType === 'single' && (
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                  <CalendarDaysIcon className="w-3.5 h-3.5" />
                  Chọn ngày
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300/80 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
                />
              </div>
            )}

            {filterType === 'range' && (
              <>
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                    <CalendarDaysIcon className="w-3.5 h-3.5" />
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={handleDateFromChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300/80 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                    <CalendarDaysIcon className="w-3.5 h-3.5" />
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={handleDateToChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300/80 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
                  />
                </div>
              </>
            )}

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                <UserGroupIcon className="w-3.5 h-3.5" />
                Trạng thái
              </label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'Tạo mới' | 'Đã thanh toán' | 'all')}
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-300/80 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="Tạo mới">Tạo mới</option>
                  <option value="Đã thanh toán">Đã thanh toán</option>
                  <option value="all">Tất cả</option>
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
                  onChange={handleEmployeeChange}
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
          </div>
        </div>

        <LoadingOverlay isLoading={isLoadingFetch}>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/50 overflow-hidden">
            <WorkRecordList
              workRecords={sortedWorkRecords}
              onEdit={handleEdit}
              onDelete={handleDelete}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              getSortIcon={getSortIcon}
            />
            {(pagination.totalPages ?? 0) > 1 && (
              <div className="flex justify-center py-4 border-t border-gray-200 dark:border-gray-700">
                <Pagination
                  currentPage={pagination.page || 1}
                  totalPages={pagination.totalPages || 1}
                  hasNextPage={(pagination.page || 1) < (pagination.totalPages || 1)}
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


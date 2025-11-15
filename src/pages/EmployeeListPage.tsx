import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchEmployees, setPagination, setFilters, createEmployee, updateEmployee, clearCurrentEmployee } from '../store/slices/employeeSlice';
import { Layout } from '../components/layout/Layout';
import { EmployeeList } from '../components/employees/EmployeeList';
import { Pagination } from '../components/employees/Pagination';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { EmployeeModal } from '../components/employees/EmployeeModal';
import { ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/solid';
import type { CreateEmployeeDto, UpdateEmployeeDto } from '../types/employee.types';

export const EmployeeListPage = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { employees, filters, pagination, error, isLoadingFetch, isLoadingDelete } = useAppSelector(
    (state) => state.employees
  );
  const { user } = useAppSelector((state) => state.auth);
  const { sort } = useAppSelector((state) => state.employees);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeResponse | null>(null);
  const [searchValue, setSearchValue] = useState(filters.name || '');

  // Check for department filter from URL and update filters
  useEffect(() => {
    const department = searchParams.get('department');
    if (department && department !== filters.department) {
      const newFilters = { department };
      dispatch(setFilters(newFilters));
      dispatch(setPagination({ ...pagination, page: 1 }));
      dispatch(fetchEmployees({ filters: newFilters, pagination: { ...pagination, page: 1 }, sort }));
    } else if (!department && filters.department) {
      // Clear department filter if not in URL
      const newFilters = { ...filters };
      delete newFilters.department;
      dispatch(setFilters(newFilters));
      dispatch(setPagination({ ...pagination, page: 1 }));
      dispatch(fetchEmployees({ filters: newFilters, pagination: { ...pagination, page: 1 }, sort }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Initial fetch on mount
  useEffect(() => {
    console.log('EmployeeListPage mounted, fetching employees...');
    console.log('Current user:', user);
    const department = searchParams.get('department');
    const initialFilters = department ? { department } : filters;
    dispatch(fetchEmployees({ filters: initialFilters, pagination, sort }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // Fetch employees when page, pageSize, or filters change
  useEffect(() => {
    const department = searchParams.get('department');
    const currentFilters = department ? { department } : filters;
    dispatch(fetchEmployees({ filters: currentFilters, pagination, sort }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, pagination.page, pagination.pageSize, filters.department]);

  const handlePageChange = (page: number) => {
    dispatch(setPagination({ ...pagination, page }));
  };

  const handleCreate = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
    dispatch(clearCurrentEmployee());
  };

  const handleModalSubmit = async (data: CreateEmployeeDto | UpdateEmployeeDto) => {
    try {
      if (selectedEmployee) {
        await dispatch(updateEmployee({ id: selectedEmployee.id, employeeData: data as UpdateEmployeeDto })).unwrap();
      } else {
        await dispatch(createEmployee(data as CreateEmployeeDto)).unwrap();
      }
      setIsModalOpen(false);
      setSelectedEmployee(null);
      dispatch(clearCurrentEmployee());
      // Refresh the list
      dispatch(fetchEmployees({ filters, pagination, sort }));
    } catch (error) {
      // Error is handled by Redux slice
    }
  };

  // Sync search value with filters
  useEffect(() => {
    setSearchValue(filters.name || '');
  }, [filters.name]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const newNameFilter = searchValue.trim() || undefined;
      const currentNameFilter = filters.name || undefined;
      
      // Only update if filters actually changed
      if (newNameFilter !== currentNameFilter) {
        const newFilters = { ...filters };
        if (newNameFilter) {
          newFilters.name = newNameFilter;
        } else {
          delete newFilters.name;
        }
        dispatch(setFilters(newFilters));
        dispatch(setPagination({ ...pagination, page: 1 }));
        dispatch(fetchEmployees({ filters: newFilters, pagination: { ...pagination, page: 1 }, sort }));
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  if (isLoadingFetch && employees.length === 0) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-gray-500">Đang tải nhân viên...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-4 lg:pt-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-4 overflow-x-auto">
          <Link to="/dashboard" className="hover:text-gray-700 transition-colors whitespace-nowrap">
            Trang chủ
          </Link>
          <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
          <Link to="/employees" className="hover:text-gray-700 transition-colors whitespace-nowrap">
            Nhân viên
          </Link>
          {filters.department && (
            <>
              <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
              <span className="text-gray-900 font-medium whitespace-nowrap">{filters.department}</span>
            </>
          )}
        </div>

        {/* Header with Title and Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Nhân viên</h1>
          <button
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm sm:text-base font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Thêm nhân viên</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4 lg:mb-6">
          <div className="relative w-full max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchValue}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300/80 rounded-lg bg-white text-gray-700 placeholder-gray-400 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
            />
          </div>
        </div>

        {error && <ErrorMessage message={error} className="mb-4" />}

        {/* Table Card */}
        <LoadingOverlay isLoading={isLoadingFetch}>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <EmployeeList hideControls={true} />

            {/* Pagination Footer */}
            {pagination.total > 0 && (
              <div className="px-4 lg:px-6 py-4 border-t border-gray-200 bg-white rounded-b-lg">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Hiển thị <span className="font-medium">{((pagination.page - 1) * pagination.pageSize) + 1}</span> đến{' '}
                    <span className="font-medium">{Math.min(pagination.page * pagination.pageSize, pagination.total)}</span> trong tổng số{' '}
                    <span className="font-medium">{pagination.total}</span> bản ghi
                  </p>
                  {pagination.totalPages > 1 && (
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      hasNextPage={pagination.hasNextPage}
                      hasPreviousPage={pagination.hasPreviousPage}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </LoadingOverlay>

        {/* Employee Modal */}
        <EmployeeModal
          isOpen={isModalOpen}
          employee={selectedEmployee}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          isLoading={isLoadingFetch || isLoadingDelete}
        />
      </div>
    </Layout>
  );
};


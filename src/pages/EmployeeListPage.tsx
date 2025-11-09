import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchEmployees, setPagination, setFilters } from '../store/slices/employeeSlice';
import { Layout } from '../components/layout/Layout';
import { EmployeeList } from '../components/employees/EmployeeList';
import { Pagination } from '../components/employees/Pagination';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export const EmployeeListPage = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { employees, filters, pagination, error, isLoading } = useAppSelector(
    (state) => state.employees
  );
  const { user } = useAppSelector((state) => state.auth);

  const { sort } = useAppSelector((state) => state.employees);

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

  if (isLoading && employees.length === 0) {
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
      <div>
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
          <Link to="/dashboard" className="hover:text-gray-700 transition-colors">
            Trang chủ
          </Link>
          <ChevronRightIcon className="w-4 h-4" />
          <Link to="/employees" className="hover:text-gray-700 transition-colors">
            Nhân viên
          </Link>
          {filters.department && (
            <>
              <ChevronRightIcon className="w-4 h-4" />
              <span className="text-gray-900 font-medium">{filters.department}</span>
            </>
          )}
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Nhân viên</h1>
        </div>

        {error && <ErrorMessage message={error} className="mb-4" />}

        {/* Table Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <EmployeeList />

          {/* Pagination Footer */}
          {pagination.total > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-white rounded-b-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600 whitespace-nowrap">
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
      </div>
    </Layout>
  );
};


import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDepartmentStats } from '../store/slices/employeeSlice';
import { Layout } from '../components/layout/Layout';
import { DepartmentCard } from '../components/dashboard/DepartmentCard';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { departmentStats, isLoading, error } = useAppSelector((state) => state.employees);

  useEffect(() => {
    dispatch(fetchDepartmentStats());
  }, [dispatch]);

  const handleCardClick = (department: string) => {
    navigate(`/employees?department=${encodeURIComponent(department)}`);
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
          <span className="text-gray-900 dark:text-gray-100 font-medium whitespace-nowrap">Bảng điều khiển</span>
        </div>

        {/* Page Title */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">Bảng điều khiển</h1>
        </div>

        {error && <ErrorMessage message={error} className="mb-4" />}

        {/* Department Cards */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</div>
          </div>
        ) : departmentStats.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Không có dữ liệu phòng ban</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {departmentStats.map((stat) => (
              <DepartmentCard
                key={stat.department}
                department={stat.department}
                count={stat.count}
                onClick={() => handleCardClick(stat.department)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};


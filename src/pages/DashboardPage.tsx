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
      <div>
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
          <Link to="/dashboard" className="hover:text-gray-700 transition-colors">
            Trang chủ
          </Link>
          <ChevronRightIcon className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Bảng điều khiển</span>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển</h1>
        </div>

        {error && <ErrorMessage message={error} className="mb-4" />}

        {/* Department Cards */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Đang tải dữ liệu...</div>
          </div>
        ) : departmentStats.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không có dữ liệu phòng ban</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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


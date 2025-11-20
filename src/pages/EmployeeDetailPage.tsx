import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchEmployeeById, clearCurrentEmployee } from '../store/slices/employeeSlice';
import { Layout } from '../components/layout/Layout';
import { EmployeeProfileSection } from '../components/employees/EmployeeProfileSection';
import { EmployeePersonalInfoSection } from '../components/employees/EmployeePersonalInfoSection';
import { EmployeeAddressSection } from '../components/employees/EmployeeAddressSection';
import { EmployeeSalarySection } from '../components/employees/EmployeeSalarySection';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export const EmployeeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentEmployee, isLoading, error } = useAppSelector((state) => state.employees);

  useEffect(() => {
    if (id) {
      dispatch(fetchEmployeeById(id));
    }
    // Cleanup when component unmounts
    return () => {
      dispatch(clearCurrentEmployee());
    };
  }, [id, dispatch]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-gray-500 dark:text-gray-400">Đang tải thông tin nhân viên...</div>
        </div>
      </Layout>
    );
  }

  if (error || !currentEmployee) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <ErrorMessage message={error || 'Không tìm thấy nhân viên'} />
          <button
            onClick={() => navigate('/employees')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại danh sách nhân viên
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-8 lg:pt-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-4 overflow-x-auto">
          <Link to="/dashboard" className="hover:text-gray-700 transition-colors whitespace-nowrap">
            Trang chủ
          </Link>
          <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
          <Link to="/employees" className="hover:text-gray-700 transition-colors whitespace-nowrap">
            Nhân viên
          </Link>
          <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
          <span className="text-gray-900 font-medium whitespace-nowrap">Hồ sơ</span>
        </div>

        {/* Page Title */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Hồ sơ</h1>
        </div>

        {/* Profile Section */}
        <div className="mb-6">
          <EmployeeProfileSection employee={currentEmployee} />
        </div>

        {/* Personal Information Section */}
        <div className="mb-6">
          <EmployeePersonalInfoSection employee={currentEmployee} />
        </div>

        {/* Salary Section */}
        <div className="mb-6">
          <EmployeeSalarySection employee={currentEmployee} />
        </div>

        {/* Address Section */}
        <div className="mb-6">
          <EmployeeAddressSection employee={currentEmployee} />
        </div>
      </div>
    </Layout>
  );
};


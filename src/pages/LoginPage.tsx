import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { UserRole } from '../types/auth.types';
import { LoginForm } from '../components/auth/LoginForm';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);
  const hasToken = !!localStorage.getItem('token');

  useEffect(() => {
    // Redirect based on user role
    if (!isLoading && isAuthenticated && user) {
      if (user.role === UserRole.ADMIN) {
        navigate('/employees');
      } else if (user.role === UserRole.EMPLOYEE) {
        navigate('/work/records');
      }
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  const handleClearSession = () => {
    dispatch(logout());
    localStorage.clear();
    window.location.reload();
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Thủ công mỹ nghệ việt</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Đăng nhập vào tài khoản của bạn</p>
        </div>
        <Card>
          {hasToken && !isAuthenticated && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
                Phiên đăng nhập không hợp lệ hoặc đã hết hạn.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSession}
                className="w-full"
              >
                Xóa phiên & Đăng nhập
              </Button>
            </div>
          )}
          {isAuthenticated && user && user.role !== UserRole.ADMIN && user.role !== UserRole.EMPLOYEE && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-300 mb-2">
                Bạn đã đăng nhập với tư cách <strong>{user.firstName} {user.lastName}</strong>, nhưng bạn không có quyền truy cập trang này.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSession}
                className="w-full"
              >
                Đăng xuất
              </Button>
            </div>
          )}
          <LoginForm />
        </Card>
      </div>
    </div>
  );
};


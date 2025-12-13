import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { UserRole } from '../../types/auth.types';

interface EmployeeRouteProps {
  children: React.ReactNode;
}

export const EmployeeRoute = ({ children }: EmployeeRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to login if user doesn't exist
  if (!user) {
    console.error('User is not available');
    return <Navigate to="/login" replace />;
  }

  // Allow employee or admin
  if (user.role !== UserRole.EMPLOYEE && user.role !== UserRole.ADMIN) {
    console.warn('User does not have employee or admin role:', user.role);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};


import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { UserRole as UserRoleConst } from '../../types/auth.types';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);

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

  // Redirect to login if user doesn't have admin role
  if (user.role !== UserRoleConst.ADMIN) {
    console.warn('User does not have admin role:', user.role);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};


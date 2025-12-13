import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { UserRole } from '../../types/auth.types';

export const RedirectToRolePage = () => {
  const { user, isLoading } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === UserRole.EMPLOYEE) {
    return <Navigate to="/work/records" replace />;
  }

  if (user.role === UserRole.ADMIN) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};


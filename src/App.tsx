import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { checkAuth } from './store/slices/authSlice';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeeListPage } from './pages/EmployeeListPage';
import { EmployeeDetailPage } from './pages/EmployeeDetailPage';
import { WorkTypePage } from './pages/WorkTypePage';
import { WorkItemPage } from './pages/WorkItemPage';
import { WorkRecordPage } from './pages/WorkRecordPage';
import { MonthlySalaryPage } from './pages/MonthlySalaryPage';
import { WorkReportPage } from './pages/WorkReportPage';
import { OvertimeConfigPage } from './pages/OvertimeConfigPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function App() {
  const dispatch = useAppDispatch();

  // Check authentication status on app mount
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <DashboardPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <EmployeeListPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees/:id"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <EmployeeDetailPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/work/types"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <WorkTypePage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/work/overtime-configs"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <OvertimeConfigPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/work/items"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <WorkItemPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/work/records"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <WorkRecordPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/work/salaries"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <MonthlySalaryPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/work/reports"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <WorkReportPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

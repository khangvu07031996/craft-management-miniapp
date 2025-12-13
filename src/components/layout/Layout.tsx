import { useState, useEffect, type ReactNode } from 'react';
import { useAppSelector } from '../../store/hooks';
import { UserRole } from '../../types/auth.types';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const isEmployee = user?.role === UserRole.EMPLOYEE;
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Load from localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Load from localStorage
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Backdrop overlay for mobile - only show if sidebar exists */}
      {!isEmployee && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - only show for non-employee users */}
      {!isEmployee && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={closeSidebar}
          isCollapsed={isCollapsed}
        />
      )}
      
      {/* Header - simplified for employee */}
      {isEmployee ? (
        <Header 
          onMenuClick={() => {}} 
          isCollapsed={false}
          onToggleCollapse={() => {}}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          hideMenu={true}
        />
      ) : (
        <Header 
          onMenuClick={toggleSidebar} 
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      )}
      
      {/* Main content - adjust margin for employee (no sidebar) */}
      <main className={`pt-14 min-h-screen p-4 lg:p-6 transition-all duration-300 dark:bg-gray-900 ${isEmployee ? 'lg:ml-0' : isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {children}
      </main>
    </div>
  );
};


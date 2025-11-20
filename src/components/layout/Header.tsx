import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import {
  Bars3Icon,
  BellIcon,
  MoonIcon,
  SunIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface HeaderProps {
  onMenuClick: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header = ({ onMenuClick, isCollapsed, onToggleCollapse, isDarkMode, onToggleDarkMode }: HeaderProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setIsUserMenuOpen(false);
  };

  const getUserInitials = () => {
    if (user) {
      return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
    }
    return 'U';
  };

  return (
    <header className={`fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-20 transition-all duration-300 ${isCollapsed ? 'lg:left-20' : 'lg:left-64'}`}>
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left side - Menu and Toggle */}
        <div className="flex items-center gap-2 lg:gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle menu"
          >
            <Bars3Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          {/* Toggle sidebar collapse for desktop */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Bars3Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Right side - Icons and User */}
        <div className="flex items-center gap-1 lg:gap-2">
          {/* Dark Mode Toggle */}
          <button 
            onClick={onToggleDarkMode}
            className="p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" 
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <SunIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" aria-label="Notifications">
            <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-white dark:border-gray-800"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 lg:gap-2.5 px-1 lg:px-2 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {getUserInitials()}
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 hidden lg:block">
                {user ? `${user.firstName} ${user.lastName}` : 'Người dùng'}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 hidden lg:block" />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsUserMenuOpen(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1.5 z-20">
                  <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {user ? `${user.firstName} ${user.lastName}` : 'Người dùng'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};


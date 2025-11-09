import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  MoonIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

export const Header = () => {
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
    <header className="fixed top-0 left-64 right-0 h-14 bg-white border-b border-gray-200 z-20">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side - Menu and Search */}
        <div className="flex items-center gap-3 flex-1">
          <button className="lg:hidden p-2 rounded-md hover:bg-gray-50 transition-colors">
            <Bars3Icon className="w-5 h-5 text-gray-600" />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-9 pr-20 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <kbd className="px-2 py-1 text-[10px] font-medium text-gray-500 bg-white border border-gray-200 rounded shadow-sm">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right side - Icons and User */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button className="p-2 rounded-md hover:bg-gray-50 transition-colors">
            <MoonIcon className="w-5 h-5 text-gray-600" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-md hover:bg-gray-50 transition-colors">
            <BellIcon className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {getUserInitials()}
              </div>
              <span className="text-sm font-medium text-gray-900 hidden md:block">
                {user ? `${user.firstName} ${user.lastName}` : 'Người dùng'}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-gray-400 hidden md:block" />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsUserMenuOpen(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1.5 z-20">
                  <div className="px-4 py-2.5 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">
                      {user ? `${user.firstName} ${user.lastName}` : 'Người dùng'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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


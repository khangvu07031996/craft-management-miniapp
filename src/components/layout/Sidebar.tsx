import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { UserRole } from '../../types/auth.types';
import {
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ChartBarSquareIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const menuItems: MenuItem[] = [
  {
    name: 'Bảng điều khiển',
    path: '/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Nhân viên',
    path: '/employees',
    icon: UserGroupIcon,
  },
  {
    name: 'Loại công việc',
    path: '/work/types',
    icon: WrenchScrewdriverIcon,
  },
  {
    name: 'Cấu hình tăng ca',
    path: '/work/overtime-configs',
    icon: ClockIcon,
  },
  {
    name: 'Sản phẩm',
    path: '/work/items',
    icon: ClipboardDocumentListIcon,
  },
  {
    name: 'Bản ghi công việc',
    path: '/work/records',
    icon: DocumentTextIcon,
  },
  {
    name: 'Lương tháng',
    path: '/work/salaries',
    icon: BanknotesIcon,
  },
  {
    name: 'Báo cáo',
    path: '/work/reports',
    icon: ChartBarSquareIcon,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
}

export const Sidebar = ({ isOpen, onClose, isCollapsed }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const isActive = (path: string) => location.pathname === path;

  // Filter menu items based on user role
  const menuItemsToShow = user?.role === UserRole.EMPLOYEE
    ? menuItems.filter(item => item.path === '/work/records')
    : menuItems;

  // Close sidebar when clicking on a link (mobile only)
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Sidebar: Mobile slide-in, Desktop always visible */}
      <div
        className={`
          fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 overflow-y-auto
          transform transition-all duration-300 ease-in-out
          lg:translate-x-0 lg:z-30
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-2.5 px-4 lg:px-6 h-14 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center gap-2.5 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
              <ChartBarIcon className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">Mỹ nghệ việt</span>
            )}
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close menu"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Menu */}
        <nav className={`py-4 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                MENU
              </p>
            )}
            <div className="space-y-0.5">
              {menuItemsToShow.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`
                      flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150
                      ${isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}
                      ${
                        active
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                      }
                    `}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                    {!isCollapsed && (
                      <span className={`whitespace-nowrap ${active ? 'font-semibold' : 'font-medium'}`}>
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};


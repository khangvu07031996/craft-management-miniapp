import { Link, useLocation } from 'react-router-dom';
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
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

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
          fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-50 overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:z-30
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-2.5 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">CraftManagement</span>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Menu */}
        <nav className="px-3 py-4">
          <div>
            <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              MENU
            </p>
            <div className="space-y-0.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                      ${
                        active
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={active ? 'font-semibold' : 'font-medium'}>{item.name}</span>
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


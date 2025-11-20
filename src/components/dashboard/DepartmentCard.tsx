import {
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  PaintBrushIcon,
  ComputerDesktopIcon,
  TruckIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

interface DepartmentCardProps {
  department: string;
  count: number;
  onClick: () => void;
}

const getDepartmentIcon = (department: string) => {
  const deptLower = department.toLowerCase();
  
  if (deptLower.includes('xưởng') || deptLower.includes('sắt') || deptLower.includes('sản xuất')) {
    return WrenchScrewdriverIcon;
  }
  if (deptLower.includes('bèo') || deptLower.includes('nhựa')) {
    return PaintBrushIcon;
  }
  if (deptLower.includes('it') || deptLower.includes('công nghệ') || deptLower.includes('kỹ thuật')) {
    return ComputerDesktopIcon;
  }
  if (deptLower.includes('vận chuyển') || deptLower.includes('logistics')) {
    return TruckIcon;
  }
  if (deptLower.includes('kỹ thuật') || deptLower.includes('maintenance')) {
    return CogIcon;
  }
  
  return BuildingOfficeIcon;
};

export const DepartmentCard = ({ department, count, onClick }: DepartmentCardProps) => {
  const Icon = getDepartmentIcon(department);

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/50 p-6 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{department}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{count} nhân viên</p>
          </div>
        </div>
      </div>
    </div>
  );
};


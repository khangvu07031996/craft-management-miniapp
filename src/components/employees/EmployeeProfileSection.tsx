import type { EmployeeResponse } from '../../types/employee.types';

interface EmployeeProfileSectionProps {
  employee: EmployeeResponse;
}

export const EmployeeProfileSection = ({ employee }: EmployeeProfileSectionProps) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Hồ sơ</h2>
        </div>

        <div className="flex items-start gap-6">
          {/* Profile Picture */}
          <div className="relative flex-shrink-0">
            <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
              {getInitials(employee.firstName, employee.lastName)}
            </div>
            <div className="absolute bottom-0 left-0 h-7 w-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-semibold border-2 border-white shadow-sm">
              {employee.employeeId?.slice(-4).toUpperCase() || 'EMP'}
            </div>
          </div>

          {/* Name and Info */}
          <div className="flex-1">
            <div className="mb-2">
              <h3 className="text-2xl font-bold text-gray-900">
                {employee.firstName} {employee.lastName}
              </h3>
            </div>
            <div className="mb-1">
              <span className="text-base font-medium text-gray-700">{employee.position}</span>
              {employee.department && (
                <>
                  <span className="mx-2 text-gray-400">|</span>
                  <span className="text-base text-gray-600">{employee.department}</span>
                </>
              )}
            </div>
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center gap-2">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
              title="Facebook"
              onClick={(e) => e.preventDefault()}
            >
              <span className="text-sm font-semibold">f</span>
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
              title="Twitter"
              onClick={(e) => e.preventDefault()}
            >
              <span className="text-sm font-semibold">X</span>
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
              title="LinkedIn"
              onClick={(e) => e.preventDefault()}
            >
              <span className="text-sm font-semibold">in</span>
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
              title="Instagram"
              onClick={(e) => e.preventDefault()}
            >
              <span className="text-xs">📷</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};


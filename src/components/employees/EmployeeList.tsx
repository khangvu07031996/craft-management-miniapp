import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  deleteEmployee,
  createEmployee,
  updateEmployee,
  fetchEmployees,
  clearCurrentEmployee,
  setFilters,
  setPagination,
  setSort,
} from '../../store/slices/employeeSlice';
import type { CreateEmployeeDto, UpdateEmployeeDto, EmployeeResponse } from '../../types/employee.types';
import { EmployeeModal } from './EmployeeModal';
import { EmployeeDeleteConfirm } from './EmployeeDeleteConfirm';
import { Button } from '../common/Button';
import { calculateWorkingDuration } from '../../utils/date';
import { PencilIcon, TrashIcon, ArrowsUpDownIcon, MagnifyingGlassIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface EmployeeListProps {
  hideControls?: boolean;
}

export const EmployeeList = ({ hideControls = false }: EmployeeListProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { employees, pagination, filters, sort, isLoading } = useAppSelector((state) => state.employees);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeResponse | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeResponse | null>(null);
  const [searchValue, setSearchValue] = useState(filters.name || '');

  const handleCreate = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleEdit = (employee: EmployeeResponse) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDelete = (employee: EmployeeResponse) => {
    setEmployeeToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (employeeToDelete) {
      try {
            await dispatch(deleteEmployee(employeeToDelete.id)).unwrap();
            setIsDeleteModalOpen(false);
            setEmployeeToDelete(null);
            // Refresh the list with current filters and pagination
            await dispatch(fetchEmployees({ filters, pagination, sort }));
      } catch (error) {
        // Error is handled by Redux slice
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
    dispatch(clearCurrentEmployee());
  };

  const handleModalSubmit = async (data: CreateEmployeeDto | UpdateEmployeeDto) => {
    try {
      if (selectedEmployee) {
        await dispatch(
          updateEmployee({ id: selectedEmployee.id, employeeData: data as UpdateEmployeeDto })
        ).unwrap();
      } else {
        await dispatch(createEmployee(data as CreateEmployeeDto)).unwrap();
      }
      setIsModalOpen(false);
      setSelectedEmployee(null);
      // Refresh the list with current filters and pagination
      await dispatch(fetchEmployees({ filters, pagination, sort }));
    } catch (error) {
      // Error is handled by Redux slice
    }
  };

  // Debounced search effect - auto filter when user types
  useEffect(() => {
    const timer = setTimeout(() => {
      const newNameFilter = searchValue.trim() || undefined;
      const currentNameFilter = filters.name || undefined;
      
      // Only update if filters actually changed
      if (newNameFilter !== currentNameFilter) {
        const newFilters = newNameFilter ? { name: newNameFilter } : {};
        dispatch(setFilters(newFilters));
        dispatch(setPagination({ ...pagination, page: 1 }));
        dispatch(fetchEmployees({ filters: newFilters, pagination: { ...pagination, page: 1, pageSize: pagination.pageSize }, sort }));
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]); // Only depend on searchValue

  // Handle sort
  const handleSort = (field: string) => {
    const backendFieldMap: Record<string, string> = {
      'firstName': 'first_name',
      'lastName': 'last_name',
      'email': 'email',
      'position': 'position',
      'department': 'department',
      'hireDate': 'hire_date',
    };

    const backendField = backendFieldMap[field] || field;
    let newSortOrder: 'asc' | 'desc' = 'asc';

    if (sort.sortBy === backendField) {
      // Toggle sort order if same field
      newSortOrder = sort.sortOrder === 'asc' ? 'desc' : 'asc';
    }

    const newSort = { sortBy: backendField, sortOrder: newSortOrder };
    dispatch(setSort(newSort));
    dispatch(setPagination({ ...pagination, page: 1 }));
    dispatch(fetchEmployees({ filters, pagination: { ...pagination, page: 1 }, sort: newSort }));
  };

  // Get sort icon for a field
  const getSortIcon = (field: string) => {
    const backendFieldMap: Record<string, string> = {
      'firstName': 'first_name',
      'lastName': 'last_name',
      'email': 'email',
      'position': 'position',
      'department': 'department',
      'hireDate': 'hire_date',
    };
    const backendField = backendFieldMap[field] || field;

    if (sort.sortBy === backendField) {
      return sort.sortOrder === 'asc' ? (
        <ArrowUpIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
      ) : (
        <ArrowDownIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
      );
    }
      return <ArrowsUpDownIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  if (isLoading && employees.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Đang tải nhân viên...</div>
        </div>
      );
  }

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'pending':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      case 'inactive':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div>
      {/* Table Controls - Only show if not hidden */}
      {!hideControls && (
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3 flex-1 sm:flex-none">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchValue}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            <Button onClick={handleCreate} size="sm" className="whitespace-nowrap flex-shrink-0">Thêm nhân viên</Button>
          </div>
        </div>
      )}

      {employees.length === 0 ? (
        <div className="px-4 lg:px-6 py-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Không tìm thấy nhân viên</p>
          {searchValue && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Thử điều chỉnh tiêu chí tìm kiếm
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Mobile: Card Layout */}
          <div className="md:hidden space-y-3 px-4 py-2">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
              >
                {/* Header: Avatar, Name, and Actions */}
                <div className="flex items-start gap-3 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex-shrink-0 h-12 w-12">
                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                      {getInitials(employee.firstName, employee.lastName)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <button
                      onClick={() => navigate(`/employees/${employee.id}`)}
                      className="text-base font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left block w-full truncate"
                    >
                      {employee.firstName} {employee.lastName}
                    </button>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 w-full truncate">{employee.email}</div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 flex-shrink-0"
                      aria-label="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(employee)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 flex-shrink-0"
                      aria-label="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">Vị trí:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium text-right break-words">{employee.position}</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">Phòng ban:</span>
                    <span className="text-gray-900 dark:text-gray-100 text-right break-words">{employee.department}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">Trạng thái:</span>
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                        employee.status
                      )}`}
                    >
                      {employee.status === 'active' ? 'Đang làm việc' : 'Đã nghỉ việc'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">Thời gian làm việc:</span>
                    <span className="text-gray-900 dark:text-gray-100 text-right">{calculateWorkingDuration(employee.hireDate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tablet/Desktop: Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-white dark:bg-gray-800">
                <tr>
                  <th className="px-4 lg:px-6 py-3.5 text-left">
                    <button
                      onClick={() => handleSort('firstName')}
                      className="flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 -ml-1 px-1 py-1 rounded transition-colors group"
                    >
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nhân viên</span>
                      {getSortIcon('firstName')}
                    </button>
                  </th>
                  <th className="px-4 lg:px-6 py-3.5 text-left">
                    <button
                      onClick={() => handleSort('position')}
                      className="flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 -ml-1 px-1 py-1 rounded transition-colors group"
                    >
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Vị trí</span>
                      {getSortIcon('position')}
                    </button>
                  </th>
                  <th className="px-4 lg:px-6 py-3.5 text-left">
                    <button
                      onClick={() => handleSort('department')}
                      className="flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 -ml-1 px-1 py-1 rounded transition-colors group"
                    >
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Phòng ban</span>
                      {getSortIcon('department')}
                    </button>
                  </th>
                  <th className="px-4 lg:px-6 py-3.5 text-left">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Trạng thái</span>
                  </th>
                  <th className="px-4 lg:px-6 py-3.5 text-left">
                    <button
                      onClick={() => handleSort('hireDate')}
                      className="flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 -ml-1 px-1 py-1 rounded transition-colors group"
                    >
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Thời gian làm việc</span>
                      {getSortIcon('hireDate')}
                    </button>
                  </th>
                  <th className="px-4 lg:px-6 py-3.5 text-right">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-9 w-9">
                          <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                            {getInitials(employee.firstName, employee.lastName)}
                          </div>
                        </div>
                        <div className="ml-3">
                          <button
                            onClick={() => navigate(`/employees/${employee.id}`)}
                            className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                          >
                            {employee.firstName} {employee.lastName}
                          </button>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{employee.position}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{employee.department}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          employee.status
                        )}`}
                      >
                        {employee.status === 'active' ? 'Đang làm việc' : 'Đã nghỉ việc'}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{calculateWorkingDuration(employee.hireDate)}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30"
                          title="Xóa"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <EmployeeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        employee={selectedEmployee}
        onSubmit={handleModalSubmit}
        isLoading={isLoading}
      />

      <EmployeeDeleteConfirm
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setEmployeeToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        employeeName={
          employeeToDelete
            ? `${employeeToDelete.firstName} ${employeeToDelete.lastName}`
            : undefined
        }
        isLoading={isLoading}
      />
    </div>
  );
};


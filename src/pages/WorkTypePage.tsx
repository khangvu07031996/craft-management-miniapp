import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchWorkTypes, deleteWorkType } from '../store/slices/workSlice';
import { WorkTypeForm } from '../components/work/WorkTypeForm';
import { Layout } from '../components/layout/Layout';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { PencilIcon, TrashIcon, BuildingOfficeIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/solid';
import type { WorkTypeResponse, CalculationType } from '../types/work.types';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const getCalculationTypeLabel = (type: CalculationType) => {
  switch (type) {
    case 'weld_count':
      return 'Số mối hàn';
    case 'hourly':
      return 'Theo giờ';
    case 'daily':
      return 'Theo ngày';
    default:
      return type;
  }
};

export const WorkTypePage = () => {
  const dispatch = useAppDispatch();
  const { workTypes, isLoadingFetch } = useAppSelector((state) => state.work);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<WorkTypeResponse | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>('');

  useEffect(() => {
    dispatch(fetchWorkTypes());
  }, [dispatch]);

  const handleAdd = () => {
    setSelectedType(null);
    setShowForm(true);
  };

  const handleEdit = (workType: WorkTypeResponse) => {
    setSelectedType(workType);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa loại công việc này?')) {
      try {
        await dispatch(deleteWorkType(id)).unwrap();
        dispatch(fetchWorkTypes());
      } catch (error: any) {
        alert('Không thể xóa loại công việc: ' + (error.message || 'Có lỗi xảy ra'));
      }
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedType(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedType(null);
    dispatch(fetchWorkTypes());
  };

  const filteredTypes = departmentFilter
    ? workTypes.filter((type) => type.department === departmentFilter)
    : workTypes;

  const uniqueDepartments = Array.from(new Set(workTypes.map((type) => type.department)));

  return (
    <Layout>
      <div className="pt-8 lg:pt-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-4 overflow-x-auto">
          <Link to="/dashboard" className="hover:text-gray-700 transition-colors whitespace-nowrap">
            Trang chủ
          </Link>
          <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
          <span className="text-gray-900 font-medium whitespace-nowrap">Quản lý Loại công việc</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Quản lý Loại công việc</h1>
          <button
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm sm:text-base font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Thêm loại công việc</span>
          </button>
        </div>

        {/* Filter */}
        <div className="mb-4 lg:mb-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200/60 shadow-md shadow-gray-100/50 p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">
                <BuildingOfficeIcon className="w-3.5 h-3.5" />
                Phòng ban
              </label>
              <div className="relative">
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-300/80 rounded-lg bg-white text-gray-700 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">Tất cả phòng ban</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-4 lg:mb-6 bg-white rounded-lg border border-gray-200 shadow-sm p-4 lg:p-6">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">
              {selectedType ? 'Chỉnh sửa loại công việc' : 'Thêm loại công việc mới'}
            </h2>
            <WorkTypeForm
              workType={selectedType}
              onCancel={handleFormCancel}
              onSuccess={handleFormSuccess}
            />
          </div>
        )}

        {/* Table */}
        <LoadingOverlay isLoading={isLoadingFetch}>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {filteredTypes.length === 0 && !isLoadingFetch ? (
              <div className="p-12 text-center">
                <p className="text-sm text-gray-500">Không có loại công việc nào</p>
              </div>
            ) : (
              <>
                {/* Mobile: Card Layout */}
                <div className="md:hidden space-y-3 px-4 py-2">
                  {filteredTypes.map((type) => (
                    <div
                      key={type.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      {/* Header: Name and Actions */}
                      <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200">
                        <h3 className="text-base font-semibold text-gray-900 flex-1 pr-2">
                          {type.name}
                        </h3>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(type)}
                            className="text-blue-600 hover:text-blue-700 transition-colors p-1.5 rounded-md hover:bg-blue-50 flex-shrink-0"
                            aria-label="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(type.id)}
                            className="text-red-600 hover:text-red-700 transition-colors p-1.5 rounded-md hover:bg-red-50 flex-shrink-0"
                            aria-label="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-gray-500 flex-shrink-0">Phòng ban:</span>
                          <span className="text-gray-900 text-right break-words">{type.department}</span>
                        </div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-gray-500 flex-shrink-0">Loại tính toán:</span>
                          <span className="text-gray-900 text-right">{getCalculationTypeLabel(type.calculationType)}</span>
                        </div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-gray-500 flex-shrink-0">Giá đơn vị:</span>
                          <span className="text-gray-900 font-medium text-right break-words">
                            {type.calculationType === 'weld_count' ? '-' : formatCurrency(type.unitPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tablet/Desktop: Table Layout */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tên loại công việc
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phòng ban
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Loại tính toán
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Giá đơn vị
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTypes.map((type) => (
                        <tr key={type.id} className="hover:bg-gray-50">
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {type.name}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {type.department}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getCalculationTypeLabel(type.calculationType)}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {type.calculationType === 'weld_count' ? '-' : formatCurrency(type.unitPrice)}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(type)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(type.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="w-4 h-4" />
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
          </div>
        </LoadingOverlay>
      </div>
    </Layout>
  );
};


import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchWorkTypes, createWorkType, updateWorkType, deleteWorkType } from '../store/slices/workSlice';
import { WorkTypeForm } from '../components/work/WorkTypeForm';
import { Layout } from '../components/layout/Layout';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { PencilIcon, TrashIcon, FunnelIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
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
  const { workTypes, isLoadingFetch, isLoadingDelete } = useAppSelector((state) => state.work);
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
      <div className="pt-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Loại công việc</h1>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Thêm loại công việc</span>
          </button>
        </div>

        {/* Filter */}
        <div className="mb-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200/60 shadow-md shadow-gray-100/50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
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
          <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên loại công việc
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phòng ban
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loại tính toán
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá đơn vị
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTypes.map((type) => (
                      <tr key={type.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {type.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {type.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getCalculationTypeLabel(type.calculationType)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {type.calculationType === 'weld_count' ? '-' : formatCurrency(type.unitPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
            )}
          </div>
        </LoadingOverlay>
      </div>
    </Layout>
  );
};


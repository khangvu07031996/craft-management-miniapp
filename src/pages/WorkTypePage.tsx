import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchWorkTypes, createWorkType, updateWorkType, deleteWorkType } from '../store/slices/workSlice';
import { WorkTypeForm } from '../components/work/WorkTypeForm';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/common/Button';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
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
  const { workTypes, isLoading } = useAppSelector((state) => state.work);
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý Loại công việc</h1>
          <Button onClick={handleAdd}>Thêm loại công việc</Button>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Lọc theo phòng ban
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả phòng ban</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
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
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">Đang tải...</p>
            </div>
          ) : filteredTypes.length === 0 ? (
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
      </div>
    </Layout>
  );
};


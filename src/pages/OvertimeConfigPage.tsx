import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchWorkTypes,
  fetchOvertimeConfigs,
  updateOvertimeConfig,
  createOvertimeConfig,
} from '../store/slices/workSlice';
import { OvertimeConfigForm } from '../components/work/OvertimeConfigForm';
import { Layout } from '../components/layout/Layout';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { PencilIcon } from '@heroicons/react/24/outline';
import type { WorkTypeResponse, OvertimeConfigResponse, CalculationType } from '../types/work.types';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const getCalculationTypeLabel = (type: CalculationType) => {
  switch (type) {
    case 'weld_count':
      return 'Thợ hàn';
    case 'hourly':
      return 'Theo giờ';
    case 'daily':
      return 'Theo ngày';
    default:
      return type;
  }
};

export const OvertimeConfigPage = () => {
  const dispatch = useAppDispatch();
  const { workTypes, overtimeConfigs, isLoading, error } = useAppSelector((state) => state.work);
  const [editingWorkTypeId, setEditingWorkTypeId] = useState<string | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>('');

  useEffect(() => {
    dispatch(fetchWorkTypes());
    dispatch(fetchOvertimeConfigs());
  }, [dispatch]);

  const handleEdit = (workTypeId: string) => {
    setEditingWorkTypeId(workTypeId);
  };

  const handleCancel = () => {
    setEditingWorkTypeId(null);
  };

  const handleSave = async (workTypeId: string, data: any) => {
    try {
      // Check if config exists
      const existingConfig = overtimeConfigs.find((config) => config.workTypeId === workTypeId);
      
      if (existingConfig) {
        await dispatch(updateOvertimeConfig({ workTypeId, data })).unwrap();
      } else {
        await dispatch(createOvertimeConfig({ workTypeId, ...data })).unwrap();
      }
      
      // Refresh configs
      await dispatch(fetchOvertimeConfigs()).unwrap();
      setEditingWorkTypeId(null);
    } catch (error: any) {
      throw error;
    }
  };

  // Filter work types by department and only show weld_count and hourly
  const supportedTypes = workTypes.filter(
    (type) => type.calculationType === 'weld_count' || type.calculationType === 'hourly'
  );
  
  const filteredTypes = departmentFilter
    ? supportedTypes.filter((type) => type.department === departmentFilter)
    : supportedTypes;

  // Create a map of workTypeId -> overtimeConfig for quick lookup
  const configMap = new Map<string, OvertimeConfigResponse>();
  overtimeConfigs.forEach((config) => {
    configMap.set(config.workTypeId, config);
  });

  const uniqueDepartments = Array.from(new Set(supportedTypes.map((type) => type.department)));

  const getOvertimeConfigDisplay = (workType: WorkTypeResponse): string => {
    const config = configMap.get(workType.id);
    
    if (!config) {
      return 'Chưa cấu hình';
    }

    if (workType.calculationType === 'weld_count') {
      if (config.overtimePricePerWeld > 0) {
        return `${formatCurrency(config.overtimePricePerWeld)}/mối hàn`;
      }
      return 'Chưa cấu hình';
    } else if (workType.calculationType === 'hourly') {
      if (config.overtimePercentage > 0) {
        return `${config.overtimePercentage}%`;
      }
      return 'Chưa cấu hình';
    }

    return 'N/A';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Cấu hình Tăng ca</h1>
        </div>

        {error && <ErrorMessage message={error} className="mb-4" />}

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

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">Đang tải...</p>
            </div>
          ) : filteredTypes.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-500">
                Không có loại công việc nào hỗ trợ cấu hình tăng ca
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Chỉ các loại công việc "Thợ hàn" và "Theo giờ" mới hỗ trợ cấu hình tăng ca
              </p>
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
                      Cấu hình tăng ca
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTypes.map((workType) => {
                    const isEditing = editingWorkTypeId === workType.id;
                    const config = configMap.get(workType.id);

                    return (
                      <tr key={workType.id} className="hover:bg-gray-50">
                        {!isEditing ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {workType.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {workType.department}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {getCalculationTypeLabel(workType.calculationType)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  config &&
                                  ((workType.calculationType === 'weld_count' &&
                                    config.overtimePricePerWeld > 0) ||
                                    (workType.calculationType === 'hourly' &&
                                      config.overtimePercentage > 0))
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {getOvertimeConfigDisplay(workType)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEdit(workType.id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Chỉnh sửa cấu hình"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                            </td>
                          </>
                        ) : (
                          <td colSpan={5} className="px-6 py-4">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                Chỉnh sửa cấu hình tăng ca
                              </h3>
                              <OvertimeConfigForm
                                workType={workType}
                                overtimeConfig={config}
                                onSave={handleSave}
                                onCancel={handleCancel}
                              />
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};


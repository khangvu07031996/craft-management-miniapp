import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { PencilIcon, BuildingOfficeIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
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
      <div className="pt-8 lg:pt-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 overflow-x-auto">
          <Link to="/dashboard" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors whitespace-nowrap">
            Trang chủ
          </Link>
          <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
          <span className="text-gray-900 dark:text-gray-100 font-medium whitespace-nowrap">Cấu hình Tăng ca</span>
        </div>

        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">Cấu hình Tăng ca</h1>
        </div>

        {error && <ErrorMessage message={error} className="mb-4" />}

        {/* Filter */}
        <div className="mb-4 lg:mb-6 bg-gradient-to-br from-white dark:from-gray-800 to-gray-50 dark:to-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700 shadow-md dark:shadow-gray-900/50 shadow-gray-100/50 p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                <BuildingOfficeIcon className="w-3.5 h-3.5" />
                Phòng ban
              </label>
              <div className="relative">
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-300/80 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">Tất cả phòng ban</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
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
            <>
              {/* Mobile: Card Layout */}
              <div className="md:hidden space-y-3 px-4 py-2">
                {filteredTypes.map((workType) => {
                  const isEditing = editingWorkTypeId === workType.id;
                  const config = configMap.get(workType.id);

                  if (isEditing) {
                    return (
                      <div
                        key={workType.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                      >
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                          Chỉnh sửa cấu hình tăng ca
                        </h3>
                        <OvertimeConfigForm
                          workType={workType}
                          overtimeConfig={config}
                          onSave={handleSave}
                          onCancel={handleCancel}
                        />
                      </div>
                    );
                  }

                  return (
                    <div
                      key={workType.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      {/* Header: Name and Actions */}
                      <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200">
                        <h3 className="text-base font-semibold text-gray-900 flex-1 pr-2">
                          {workType.name}
                        </h3>
                        <button
                          onClick={() => handleEdit(workType.id)}
                          className="text-blue-600 hover:text-blue-700 transition-colors p-1.5 rounded-md hover:bg-blue-50 flex-shrink-0"
                          aria-label="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Details */}
                      <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">Phòng ban:</span>
                          <span className="text-gray-900 dark:text-gray-100 text-right break-words">{workType.department}</span>
                        </div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-gray-500 flex-shrink-0">Loại tính toán:</span>
                          <span className="text-gray-900 text-right">{getCalculationTypeLabel(workType.calculationType)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-gray-500 flex-shrink-0">Cấu hình tăng ca:</span>
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
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
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                        Cấu hình tăng ca
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {workType.name}
                              </td>
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {workType.department}
                              </td>
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {getCalculationTypeLabel(workType.calculationType)}
                              </td>
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                            <td colSpan={5} className="px-4 lg:px-6 py-4">
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
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};


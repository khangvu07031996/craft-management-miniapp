import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchWorkTypes,
  fetchWorkItems,
  createWorkRecord,
  updateWorkRecord,
  fetchOvertimeConfigByWorkTypeId,
} from '../../store/slices/workSlice';
import { fetchEmployees } from '../../store/slices/employeeSlice';
import type {
  CreateWorkRecordDto,
  UpdateWorkRecordDto,
  WorkRecordResponse,
} from '../../types/work.types';
import type { EmployeeResponse } from '../../types/employee.types';
import { CalculationType } from '../../types/work.types';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { formatDateForInput } from '../../utils/date';

interface WorkRecordFormProps {
  workRecord?: WorkRecordResponse | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export const WorkRecordForm = ({ workRecord, onCancel, onSuccess }: WorkRecordFormProps) => {
  const dispatch = useAppDispatch();
  const { workTypes, workItems, overtimeConfigs } = useAppSelector((state) => state.work);
  const { employees } = useAppSelector((state) => state.employees);
  const { isLoading } = useAppSelector((state) => state.work);

  const isEditMode = !!workRecord;

  const [formData, setFormData] = useState({
    employeeId: '',
    workDate: new Date().toISOString().split('T')[0],
    workTypeId: '',
    workItemId: '',
    quantity: '',
    unitPrice: '',
    isOvertime: false,
    overtimeQuantity: '',
    overtimeHours: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedWorkType, setSelectedWorkType] = useState<CalculationType | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeResponse | null>(null);
  const [selectedWorkItem, setSelectedWorkItem] = useState<any>(null);
  const [overtimeConfig, setOvertimeConfig] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchWorkTypes());
    dispatch(fetchEmployees({ filters: {}, pagination: { page: 1, pageSize: 1000 }, sort: {} }));
  }, [dispatch]);

  useEffect(() => {
    if (workRecord) {
      setFormData({
        employeeId: workRecord.employeeId,
        workDate: workRecord.workDate.split('T')[0],
        workTypeId: workRecord.workTypeId,
        workItemId: workRecord.workItemId || '',
        quantity: workRecord.quantity.toString(),
        unitPrice: workRecord.unitPrice.toString(),
        isOvertime: workRecord.isOvertime || false,
        overtimeQuantity: workRecord.overtimeQuantity?.toString() || '',
        overtimeHours: workRecord.overtimeHours?.toString() || '',
        notes: workRecord.notes || '',
      });
      const workType = workTypes.find((wt) => wt.id === workRecord.workTypeId);
      if (workType) {
        setSelectedWorkType(workType.calculationType);
      }
      // Set selected employee for edit mode
      const employee = employees.find((emp) => emp.id === workRecord.employeeId);
      if (employee) {
        setSelectedEmployee(employee);
      }
      // Set selected work item for edit mode
      if (workRecord.workItemId) {
        const item = workItems.find((i) => i.id === workRecord.workItemId);
        if (item) {
          setSelectedWorkItem(item);
        }
      }
    } else {
      setFormData({
        employeeId: '',
        workDate: new Date().toISOString().split('T')[0],
        workTypeId: '',
        workItemId: '',
        quantity: '',
        unitPrice: '',
        isOvertime: false,
        overtimeQuantity: '',
        overtimeHours: '',
        notes: '',
      });
      setSelectedWorkType(null);
      setSelectedEmployee(null);
      setSelectedWorkItem(null);
    }
  }, [workRecord, workTypes, employees]);

  // Effect: When employee is selected, filter and auto-select work type
  useEffect(() => {
    // Skip if in edit mode and workRecord exists (already handled in previous effect)
    if (isEditMode && workRecord) {
      return;
    }

    if (formData.employeeId) {
      const employee = employees.find((emp) => emp.id === formData.employeeId);
      if (employee) {
        setSelectedEmployee(employee);
        
        // Auto-select work type if employee has workTypeId and workTypeId is not already set
        if (employee.workTypeId && !formData.workTypeId) {
          setFormData((prev) => ({ ...prev, workTypeId: employee.workTypeId! }));
        }
        // If no workTypeId but only one work type in department, auto-select it
        else if (!employee.workTypeId && !formData.workTypeId) {
          const departmentWorkTypes = workTypes.filter((wt) => wt.department === employee.department);
          if (departmentWorkTypes.length === 1) {
            setFormData((prev) => ({ ...prev, workTypeId: departmentWorkTypes[0].id }));
          }
        }
      }
    } else {
      setSelectedEmployee(null);
    }
  }, [formData.employeeId, employees, workTypes, isEditMode, workRecord]);

  useEffect(() => {
    if (formData.workTypeId) {
      const workType = workTypes.find((wt) => wt.id === formData.workTypeId);
      if (workType) {
        setSelectedWorkType(workType.calculationType);
        if (workType.calculationType === CalculationType.WELD_COUNT) {
          dispatch(fetchWorkItems());
        }
        if (workType.calculationType !== CalculationType.WELD_COUNT && !formData.unitPrice) {
          setFormData((prev) => ({ ...prev, unitPrice: workType.unitPrice.toString() }));
        }
        // Fetch overtime config if weld_count or hourly
        if (workType.calculationType === CalculationType.WELD_COUNT || workType.calculationType === CalculationType.HOURLY) {
          dispatch(fetchOvertimeConfigByWorkTypeId(workType.id));
        }
      }
    } else {
      setSelectedWorkType(null);
      setOvertimeConfig(null);
    }
  }, [formData.workTypeId, workTypes, dispatch]);

  // Update overtime config when it's fetched or workTypeId changes
  useEffect(() => {
    if (formData.workTypeId) {
      const config = overtimeConfigs.find((oc) => oc.workTypeId === formData.workTypeId);
      setOvertimeConfig(config || null);
    } else {
      setOvertimeConfig(null);
    }
  }, [formData.workTypeId, overtimeConfigs]);

  // Update selectedWorkItem when workItems are loaded and workItemId is set
  useEffect(() => {
    if (formData.workItemId && workItems.length > 0) {
      const item = workItems.find((i) => i.id === formData.workItemId);
      if (item) {
        setSelectedWorkItem(item);
      }
    }
  }, [formData.workItemId, workItems]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Nhân viên là bắt buộc';
    }

    if (!formData.workDate) {
      newErrors.workDate = 'Ngày làm việc là bắt buộc';
    }

    if (!formData.workTypeId) {
      newErrors.workTypeId = 'Loại công việc là bắt buộc';
    }

    if (selectedWorkType === CalculationType.WELD_COUNT && !formData.workItemId) {
      newErrors.workItemId = 'Loại hàng là bắt buộc cho thợ hàn';
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Số lượng phải lớn hơn 0';
    }
    
    // For weld_count, quantity must be a whole number >= 1
    if (selectedWorkType === CalculationType.WELD_COUNT) {
      const quantityNum = parseFloat(formData.quantity);
      if (!Number.isInteger(quantityNum) || quantityNum < 1) {
        newErrors.quantity = 'Số sản phẩm phải là số nguyên lớn hơn hoặc bằng 1';
      }
    }

    // Validate overtime fields
    if (formData.isOvertime) {
      if (selectedWorkType === CalculationType.WELD_COUNT) {
        if (!formData.overtimeQuantity || parseFloat(formData.overtimeQuantity) <= 0) {
          newErrors.overtimeQuantity = 'Số lượng hàng tăng ca là bắt buộc và phải lớn hơn 0';
        } else {
          const overtimeQtyNum = parseFloat(formData.overtimeQuantity);
          if (!Number.isInteger(overtimeQtyNum) || overtimeQtyNum < 1) {
            newErrors.overtimeQuantity = 'Số lượng hàng tăng ca phải là số nguyên lớn hơn hoặc bằng 1';
          }
        }
      } else if (selectedWorkType === CalculationType.HOURLY) {
        if (!formData.overtimeHours || parseFloat(formData.overtimeHours) <= 0) {
          newErrors.overtimeHours = 'Số giờ tăng ca là bắt buộc và phải lớn hơn 0';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData: CreateWorkRecordDto | UpdateWorkRecordDto = {
        employeeId: formData.employeeId,
        workDate: formData.workDate,
        workTypeId: formData.workTypeId,
        workItemId: selectedWorkType === CalculationType.WELD_COUNT ? formData.workItemId : undefined,
        quantity: parseFloat(formData.quantity),
        unitPrice: selectedWorkType !== CalculationType.WELD_COUNT && formData.unitPrice
          ? parseFloat(formData.unitPrice)
          : undefined,
        isOvertime: formData.isOvertime,
        overtimeQuantity: formData.isOvertime && selectedWorkType === CalculationType.WELD_COUNT && formData.overtimeQuantity
          ? parseFloat(formData.overtimeQuantity)
          : undefined,
        overtimeHours: formData.isOvertime && selectedWorkType === CalculationType.HOURLY && formData.overtimeHours
          ? parseFloat(formData.overtimeHours)
          : undefined,
        notes: formData.notes || undefined,
      };

      if (isEditMode && workRecord) {
        await dispatch(updateWorkRecord({ id: workRecord.id, data: submitData })).unwrap();
      } else {
        await dispatch(createWorkRecord(submitData as CreateWorkRecordDto)).unwrap();
      }

      onSuccess();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Có lỗi xảy ra khi lưu công việc' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    // Handle checkbox separately
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
      
      // Reset overtime fields when isOvertime is unchecked
      if (name === 'isOvertime' && !checked) {
        setFormData((prev) => ({ ...prev, overtimeQuantity: '', overtimeHours: '' }));
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.overtimeQuantity;
          delete newErrors.overtimeHours;
          return newErrors;
        });
      }
      return;
    }
    
    // Handle other input types
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    // Reset work type and work item when employee changes
    if (name === 'employeeId') {
      setFormData((prev) => ({ ...prev, workTypeId: '', workItemId: '', unitPrice: '', isOvertime: false, overtimeQuantity: '', overtimeHours: '' }));
      setSelectedWorkType(null);
      setSelectedWorkItem(null);
    }
    
    // Update selected work item when workItemId changes
    if (name === 'workItemId') {
      const item = workItems.find((i) => i.id === value);
      setSelectedWorkItem(item || null);
    }
  };

  // Filter work types based on selected employee
  const getFilteredWorkTypes = () => {
    if (!selectedEmployee) {
      // Remove duplicates by (name, department) - defensive programming
      const uniqueMap = new Map<string, typeof workTypes[0]>();
      workTypes.forEach((wt) => {
        const key = `${wt.name.toLowerCase()}|${wt.department}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, wt);
        }
      });
      return Array.from(uniqueMap.values()).sort((a, b) => {
        if (a.department !== b.department) {
          return a.department.localeCompare(b.department);
        }
        return a.name.localeCompare(b.name);
      });
    }

    // Filter by department
    let departmentWorkTypes = workTypes.filter((wt) => wt.department === selectedEmployee.department);
    
    // Remove duplicates by (name, department) - defensive programming
    const uniqueMap = new Map<string, typeof workTypes[0]>();
    departmentWorkTypes.forEach((wt) => {
      const key = `${wt.name.toLowerCase()}|${wt.department}`;
      // Keep the first one or prefer the one matching employee's workTypeId
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, wt);
      } else if (selectedEmployee.workTypeId && wt.id === selectedEmployee.workTypeId) {
        uniqueMap.set(key, wt);
      }
    });
    departmentWorkTypes = Array.from(uniqueMap.values());

    // If employee has workTypeId, prioritize that work type
    if (selectedEmployee.workTypeId) {
      // Sort: employee's work type first, then others
      return departmentWorkTypes.sort((a, b) => {
        if (a.id === selectedEmployee.workTypeId) return -1;
        if (b.id === selectedEmployee.workTypeId) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    // Sort alphabetically by name
    return departmentWorkTypes.sort((a, b) => a.name.localeCompare(b.name));
  };

  const filteredWorkItems = workItems.filter((item) => {
    if (!formData.workItemId) return true;
    return item.id === formData.workItemId;
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nhân viên
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.employeeId ? 'border-red-500' : 'border-gray-200'
            }`}
          >
            <option value="">Chọn nhân viên</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName} - {emp.department}
              </option>
            ))}
          </select>
          {errors.employeeId && <p className="mt-1 text-xs text-red-600">{errors.employeeId}</p>}
        </div>

        <div>
          <Input
            label="Ngày làm việc"
            type="date"
            name="workDate"
            value={formData.workDate}
            onChange={handleChange}
            error={errors.workDate}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Loại công việc
            <span className="text-red-500 ml-1">*</span>
            {selectedEmployee && (
              <span className="text-xs text-gray-500 font-normal ml-2">
                (Vị trí: {selectedEmployee.position})
              </span>
            )}
          </label>
          <select
            name="workTypeId"
            value={formData.workTypeId}
            onChange={handleChange}
            disabled={!formData.employeeId}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.workTypeId ? 'border-red-500' : 'border-gray-200'
            } ${!formData.employeeId ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          >
            <option value="">
              {!formData.employeeId 
                ? 'Chọn nhân viên trước' 
                : getFilteredWorkTypes().length === 0 
                  ? 'Không có loại công việc phù hợp' 
                  : 'Chọn loại công việc'}
            </option>
            {getFilteredWorkTypes().map((wt) => (
              <option key={wt.id} value={wt.id}>
                {wt.name} ({wt.department})
              </option>
            ))}
          </select>
          {errors.workTypeId && <p className="mt-1 text-xs text-red-600">{errors.workTypeId}</p>}
          {selectedEmployee && getFilteredWorkTypes().length === 0 && (
            <p className="mt-1 text-xs text-yellow-600">
              Không tìm thấy loại công việc nào cho phòng ban "{selectedEmployee.department}". Vui lòng tạo loại công việc mới trong phần Quản lý Loại công việc.
            </p>
          )}
          {selectedEmployee && selectedEmployee.workTypeId && (
            <p className="mt-1 text-xs text-gray-500">
              Loại công việc đã được tự động chọn dựa trên thông tin nhân viên.
            </p>
          )}
        </div>

        {selectedWorkType === CalculationType.WELD_COUNT && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Loại hàng
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="workItemId"
                value={formData.workItemId}
                onChange={(e) => {
                  handleChange(e);
                  const item = workItems.find((i) => i.id === e.target.value);
                  setSelectedWorkItem(item || null);
                }}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.workItemId ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <option value="">Chọn loại hàng</option>
                {workItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.difficultyLevel})
                  </option>
                ))}
              </select>
              {errors.workItemId && <p className="mt-1 text-xs text-red-600">{errors.workItemId}</p>}
              {selectedWorkItem && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Số mối hàn/SP:</span> {selectedWorkItem.weldsPerItem} mối
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="font-medium">Giá/mối hàn:</span> {selectedWorkItem.pricePerWeld.toLocaleString('vi-VN')} ₫
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        <div>
          <Input
            label={selectedWorkType === CalculationType.WELD_COUNT ? 'Số sản phẩm làm được' : selectedWorkType === CalculationType.HOURLY ? 'Số giờ' : 'Số ngày'}
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            error={errors.quantity}
            required
            step="1"
            min="1"
          />
        </div>

        {selectedWorkType !== CalculationType.WELD_COUNT && (
          <div>
            <Input
              label="Giá đơn vị (₫)"
              type="number"
              name="unitPrice"
              value={formData.unitPrice}
              onChange={handleChange}
              error={errors.unitPrice}
              step="0.01"
              min="0"
            />
          </div>
        )}

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isOvertime"
              checked={formData.isOvertime}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Tăng ca</span>
          </label>
        </div>

        {formData.isOvertime && selectedWorkType === CalculationType.WELD_COUNT && (
          <div>
            <Input
              label="Số lượng hàng tăng ca"
              type="number"
              name="overtimeQuantity"
              value={formData.overtimeQuantity}
              onChange={handleChange}
              error={errors.overtimeQuantity}
              required
              step="1"
              min="1"
            />
            {/* Calculate and display total amount for weld_count with overtime */}
            {selectedWorkItem && formData.quantity && parseFloat(formData.quantity) > 0 && formData.overtimeQuantity && parseFloat(formData.overtimeQuantity) > 0 && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-1">Tổng tiền dự kiến:</p>
                <p className="text-lg font-bold text-green-700">
                  {(() => {
                    const baseAmount = parseFloat(formData.quantity) * selectedWorkItem.weldsPerItem * selectedWorkItem.pricePerWeld;
                    let overtimeAmount = 0;
                    if (overtimeConfig && overtimeConfig.overtimePricePerWeld > 0) {
                      overtimeAmount = parseFloat(formData.overtimeQuantity) * selectedWorkItem.weldsPerItem * (selectedWorkItem.pricePerWeld + overtimeConfig.overtimePricePerWeld);
                    }
                    return (baseAmount + overtimeAmount).toLocaleString('vi-VN');
                  })()} ₫
                </p>
                <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                  <p>
                    Tiền giờ thường: {formData.quantity} SP × {selectedWorkItem.weldsPerItem} mối/SP × {selectedWorkItem.pricePerWeld.toLocaleString('vi-VN')} ₫/mối = {(parseFloat(formData.quantity) * selectedWorkItem.weldsPerItem * selectedWorkItem.pricePerWeld).toLocaleString('vi-VN')} ₫
                  </p>
                  {overtimeConfig && overtimeConfig.overtimePricePerWeld > 0 && formData.overtimeQuantity && parseFloat(formData.overtimeQuantity) > 0 && (
                    <p>
                      Tiền tăng ca: {formData.overtimeQuantity} SP × {selectedWorkItem.weldsPerItem} mối/SP × {(selectedWorkItem.pricePerWeld + overtimeConfig.overtimePricePerWeld).toLocaleString('vi-VN')} ₫/mối = {(parseFloat(formData.overtimeQuantity) * selectedWorkItem.weldsPerItem * (selectedWorkItem.pricePerWeld + overtimeConfig.overtimePricePerWeld)).toLocaleString('vi-VN')} ₫
                    </p>
                  )}
                </div>
              </div>
            )}
            {/* Show base amount if no overtime quantity yet */}
            {selectedWorkItem && formData.quantity && parseFloat(formData.quantity) > 0 && (!formData.overtimeQuantity || parseFloat(formData.overtimeQuantity) <= 0) && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-1">Tổng tiền dự kiến:</p>
                <p className="text-lg font-bold text-green-700">
                  {(
                    parseFloat(formData.quantity) *
                    selectedWorkItem.weldsPerItem *
                    selectedWorkItem.pricePerWeld
                  ).toLocaleString('vi-VN')} ₫
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  ({formData.quantity} SP × {selectedWorkItem.weldsPerItem} mối/SP × {selectedWorkItem.pricePerWeld.toLocaleString('vi-VN')} ₫/mối)
                </p>
              </div>
            )}
          </div>
        )}

        {formData.isOvertime && selectedWorkType === CalculationType.HOURLY && (
          <div>
            <Input
              label="Số giờ tăng ca"
              type="number"
              name="overtimeHours"
              value={formData.overtimeHours}
              onChange={handleChange}
              error={errors.overtimeHours}
              required
              step="0.5"
              min="0.5"
            />
            {/* Calculate and display total amount for hourly with overtime */}
            {formData.quantity && parseFloat(formData.quantity) > 0 && formData.unitPrice && parseFloat(formData.unitPrice) > 0 && formData.overtimeHours && parseFloat(formData.overtimeHours) > 0 && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-1">Tổng tiền dự kiến:</p>
                <p className="text-lg font-bold text-green-700">
                  {(() => {
                    const baseAmount = parseFloat(formData.quantity) * parseFloat(formData.unitPrice);
                    let overtimeAmount = 0;
                    if (overtimeConfig && overtimeConfig.overtimePercentage > 0) {
                      // Tiền tăng ca = số giờ tăng ca × (unitPrice + unitPrice × overtime_percentage/100)
                      // = số giờ tăng ca × unitPrice × (1 + overtime_percentage/100)
                      overtimeAmount = parseFloat(formData.overtimeHours) * parseFloat(formData.unitPrice) * (1 + overtimeConfig.overtimePercentage / 100);
                    }
                    return (baseAmount + overtimeAmount).toLocaleString('vi-VN');
                  })()} ₫
                </p>
                <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                  <p>
                    Tiền giờ thường: {formData.quantity} giờ × {parseFloat(formData.unitPrice).toLocaleString('vi-VN')} ₫/giờ = {(parseFloat(formData.quantity) * parseFloat(formData.unitPrice)).toLocaleString('vi-VN')} ₫
                  </p>
                  {overtimeConfig && overtimeConfig.overtimePercentage > 0 && formData.overtimeHours && parseFloat(formData.overtimeHours) > 0 && (
                    <p>
                      Tiền tăng ca: {formData.overtimeHours} giờ × ({parseFloat(formData.unitPrice).toLocaleString('vi-VN')} ₫/giờ × {overtimeConfig.overtimePercentage}% + {parseFloat(formData.unitPrice).toLocaleString('vi-VN')}) = {(parseFloat(formData.overtimeHours) * parseFloat(formData.unitPrice) * (1 + overtimeConfig.overtimePercentage / 100)).toLocaleString('vi-VN')} ₫
                    </p>
                  )}
                </div>
              </div>
            )}
            {/* Show base amount if no overtime hours yet */}
            {formData.quantity && parseFloat(formData.quantity) > 0 && formData.unitPrice && parseFloat(formData.unitPrice) > 0 && (!formData.overtimeHours || parseFloat(formData.overtimeHours) <= 0) && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-1">Tổng tiền dự kiến:</p>
                <p className="text-lg font-bold text-green-700">
                  {(parseFloat(formData.quantity) * parseFloat(formData.unitPrice)).toLocaleString('vi-VN')} ₫
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  ({formData.quantity} giờ × {parseFloat(formData.unitPrice).toLocaleString('vi-VN')} ₫/giờ)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Show total amount for weld_count without overtime */}
        {!formData.isOvertime && selectedWorkType === CalculationType.WELD_COUNT && selectedWorkItem && formData.quantity && parseFloat(formData.quantity) > 0 && (
          <div className="md:col-span-2">
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-1">Tổng tiền dự kiến:</p>
              <p className="text-lg font-bold text-green-700">
                {(
                  parseFloat(formData.quantity) *
                  selectedWorkItem.weldsPerItem *
                  selectedWorkItem.pricePerWeld
                ).toLocaleString('vi-VN')} ₫
              </p>
              <p className="text-xs text-gray-600 mt-1">
                ({formData.quantity} SP × {selectedWorkItem.weldsPerItem} mối/SP × {selectedWorkItem.pricePerWeld.toLocaleString('vi-VN')} ₫/mối)
              </p>
            </div>
          </div>
        )}

        {/* Show total amount for hourly without overtime */}
        {!formData.isOvertime && selectedWorkType === CalculationType.HOURLY && formData.quantity && parseFloat(formData.quantity) > 0 && formData.unitPrice && parseFloat(formData.unitPrice) > 0 && (
          <div className="md:col-span-2">
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-1">Tổng tiền dự kiến:</p>
              <p className="text-lg font-bold text-green-700">
                {(parseFloat(formData.quantity) * parseFloat(formData.unitPrice)).toLocaleString('vi-VN')} ₫
              </p>
              <p className="text-xs text-gray-600 mt-1">
                ({formData.quantity} giờ × {parseFloat(formData.unitPrice).toLocaleString('vi-VN')} ₫/giờ)
              </p>
            </div>
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Ghi chú
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEditMode ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  );
};


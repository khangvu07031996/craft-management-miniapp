import { useState, useEffect, Fragment, useMemo } from 'react';
import type { FormEvent } from 'react';
import { Dialog, Transition, Combobox } from '@headlessui/react';
import { ExclamationTriangleIcon, ChevronUpDownIcon, CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchWorkTypes,
  fetchWorkItems,
  createWorkRecord,
  updateWorkRecord,
  fetchOvertimeConfigByWorkTypeId,
  fetchTotalQuantityMadeByWorkItem,
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
  const [totalQuantityMade, setTotalQuantityMade] = useState<number>(0);
  const [showQuantityExceedModal, setShowQuantityExceedModal] = useState(false);
  const [workItemSearchQuery, setWorkItemSearchQuery] = useState('');
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');

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
        setEmployeeSearchQuery(`${employee.firstName} ${employee.lastName} - ${employee.department}`);
      } else {
        setEmployeeSearchQuery('');
      }
      // Set selected work item for edit mode
      if (workRecord.workItemId) {
        const item = workItems.find((i) => i.id === workRecord.workItemId);
        if (item) {
          setSelectedWorkItem(item);
          setWorkItemSearchQuery(item.name);
        }
      } else {
        setSelectedWorkItem(null);
        setWorkItemSearchQuery('');
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
      setWorkItemSearchQuery('');
      setEmployeeSearchQuery('');
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
        setEmployeeSearchQuery(`${employee.firstName} ${employee.lastName} - ${employee.department}`);
        
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
      setEmployeeSearchQuery('');
    }
  }, [formData.employeeId, employees, workTypes, isEditMode, workRecord]);

  useEffect(() => {
    if (formData.workTypeId) {
      const workType = workTypes.find((wt) => wt.id === formData.workTypeId);
      if (workType) {
        setSelectedWorkType(workType.calculationType);
        if (workType.calculationType === CalculationType.WELD_COUNT) {
          dispatch(fetchWorkItems());
        } else {
          // Reset work item when switching away from weld_count
          setFormData((prev) => ({ ...prev, workItemId: '' }));
          setSelectedWorkItem(null);
          setWorkItemSearchQuery('');
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
      setSelectedWorkItem(null);
      setWorkItemSearchQuery('');
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
        setWorkItemSearchQuery(item.name);
      }
    } else if (!formData.workItemId) {
      setSelectedWorkItem(null);
      setWorkItemSearchQuery('');
    }
  }, [formData.workItemId, workItems]);

  // Fetch total quantity made when workItemId changes (for weld_count only)
  useEffect(() => {
    if (selectedWorkType === CalculationType.WELD_COUNT && formData.workItemId) {
      const excludeRecordId = isEditMode && workRecord ? workRecord.id : undefined;
      dispatch(fetchTotalQuantityMadeByWorkItem({ workItemId: formData.workItemId, excludeRecordId }))
        .unwrap()
        .then((result) => {
          setTotalQuantityMade(result.totalQuantity);
        })
        .catch((error) => {
          console.error('Error fetching total quantity made:', error);
          setTotalQuantityMade(0);
        });
    } else {
      setTotalQuantityMade(0);
    }
  }, [formData.workItemId, selectedWorkType, dispatch, isEditMode, workRecord]);

  // Real-time validation for quantity exceeding totalQuantity (only for weld_count)
  useEffect(() => {
    if (selectedWorkType === CalculationType.WELD_COUNT && selectedWorkItem && totalQuantityMade !== undefined && formData.quantity) {
      const currentQuantity = parseFloat(formData.quantity) || 0;
      const remaining = selectedWorkItem.totalQuantity - totalQuantityMade;
      
      setErrors((prev) => {
        const newErrors = { ...prev };
        
        // Check if quantity alone exceeds remaining
        if (currentQuantity > remaining) {
          // Set error in quantity field
          newErrors.quantity = `Số lượng sản phẩm (${currentQuantity} SP) vượt quá số lượng còn lại (${remaining} SP). Tổng đã làm: ${totalQuantityMade} SP / Cần làm: ${selectedWorkItem.totalQuantity} SP`;
          // Clear overtime quantity error if exists (quantity already exceeds, no need to check overtime)
          if (newErrors.overtimeQuantity && newErrors.overtimeQuantity.includes('vượt quá số lượng cần làm')) {
            delete newErrors.overtimeQuantity;
          }
        } else {
          // Quantity is OK, clear quantity error if it was the exceeded error
          if (newErrors.quantity && newErrors.quantity.includes('vượt quá số lượng còn lại')) {
            delete newErrors.quantity;
          }
          
          // If overtime is enabled, check if quantity + overtimeQuantity exceeds total
          if (formData.isOvertime && formData.overtimeQuantity) {
            const currentOvertimeQuantity = parseFloat(formData.overtimeQuantity) || 0;
            const newQuantity = currentQuantity + currentOvertimeQuantity;
            const newTotal = totalQuantityMade + newQuantity;
            
            if (newTotal > selectedWorkItem.totalQuantity) {
              // Set error in overtimeQuantity field
              newErrors.overtimeQuantity = `Tổng số lượng (${totalQuantityMade} + ${newQuantity} = ${newTotal} SP) vượt quá số lượng cần làm (${selectedWorkItem.totalQuantity} SP). Số lượng còn lại: ${remaining} SP`;
            } else {
              // Clear overtime quantity error if valid
              if (newErrors.overtimeQuantity && newErrors.overtimeQuantity.includes('vượt quá số lượng cần làm')) {
                delete newErrors.overtimeQuantity;
              }
            }
          } else {
            // Clear overtime quantity error when overtime is unchecked or cleared
            if (newErrors.overtimeQuantity && newErrors.overtimeQuantity.includes('vượt quá số lượng cần làm')) {
              delete newErrors.overtimeQuantity;
            }
          }
        }
        
        return newErrors;
      });
    } else if (!formData.quantity) {
      // Clear errors when quantity is cleared
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors.quantity && newErrors.quantity.includes('vượt quá số lượng còn lại')) {
          delete newErrors.quantity;
        }
        if (newErrors.overtimeQuantity && newErrors.overtimeQuantity.includes('vượt quá số lượng cần làm')) {
          delete newErrors.overtimeQuantity;
        }
        return newErrors;
      });
    }
  }, [formData.quantity, formData.overtimeQuantity, formData.isOvertime, selectedWorkType, selectedWorkItem, totalQuantityMade]);

  const validateForm = (): { isValid: boolean; errors: Record<string, string> } => {
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
      
      // Validate total quantity doesn't exceed work item's totalQuantity
      if (selectedWorkItem && totalQuantityMade !== undefined) {
        const currentQuantity = parseFloat(formData.quantity) || 0;
        const remaining = selectedWorkItem.totalQuantity - totalQuantityMade;
        
        // First check if quantity alone exceeds remaining
        if (currentQuantity > remaining) {
          newErrors.quantity = `Số lượng sản phẩm (${currentQuantity} SP) vượt quá số lượng còn lại (${remaining} SP). Tổng đã làm: ${totalQuantityMade} SP / Cần làm: ${selectedWorkItem.totalQuantity} SP`;
        } else if (formData.isOvertime && formData.overtimeQuantity) {
          // Quantity is OK, check if quantity + overtimeQuantity exceeds total
          const currentOvertimeQuantity = parseFloat(formData.overtimeQuantity) || 0;
          const newQuantity = currentQuantity + currentOvertimeQuantity;
          const newTotal = totalQuantityMade + newQuantity;
          
          if (newTotal > selectedWorkItem.totalQuantity) {
            // Only set error in overtimeQuantity field if quantity itself is OK
            newErrors.overtimeQuantity = `Tổng số lượng (${totalQuantityMade} + ${newQuantity} = ${newTotal} SP) vượt quá số lượng cần làm (${selectedWorkItem.totalQuantity} SP). Số lượng còn lại: ${remaining} SP`;
          }
        }
      }
    }

    // Validate overtime fields
    if (formData.isOvertime) {
      if (selectedWorkType === CalculationType.WELD_COUNT) {
        if (!formData.overtimeQuantity || parseFloat(formData.overtimeQuantity) <= 0) {
          // Only set this error if overtimeQuantity doesn't already have an exceeded error
          if (!newErrors.overtimeQuantity || !newErrors.overtimeQuantity.includes('vượt quá số lượng cần làm')) {
            newErrors.overtimeQuantity = 'Số lượng hàng tăng ca là bắt buộc và phải lớn hơn 0';
          }
        } else {
          const overtimeQtyNum = parseFloat(formData.overtimeQuantity);
          if (!Number.isInteger(overtimeQtyNum) || overtimeQtyNum < 1) {
            // Only set this error if overtimeQuantity doesn't already have an exceeded error
            if (!newErrors.overtimeQuantity || !newErrors.overtimeQuantity.includes('vượt quá số lượng cần làm')) {
              newErrors.overtimeQuantity = 'Số lượng hàng tăng ca phải là số nguyên lớn hơn hoặc bằng 1';
            }
          }
        }
      } else if (selectedWorkType === CalculationType.HOURLY) {
        if (!formData.overtimeHours || parseFloat(formData.overtimeHours) <= 0) {
          newErrors.overtimeHours = 'Số giờ tăng ca là bắt buộc và phải lớn hơn 0';
        }
      }
    }

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Check for quantity exceeded errors before validation
    const hasQuantityExceededError = 
      (errors.quantity && errors.quantity.includes('vượt quá số lượng còn lại')) ||
      (errors.overtimeQuantity && errors.overtimeQuantity.includes('vượt quá số lượng cần làm'));

    if (hasQuantityExceededError) {
      setShowQuantityExceedModal(true);
      return;
    }

    const validationResult = validateForm();
    if (!validationResult.isValid) {
      // Check for quantity exceeded errors in validation result
      const hasQuantityExceeded = 
        (validationResult.errors.quantity && validationResult.errors.quantity.includes('vượt quá số lượng còn lại')) ||
        (validationResult.errors.overtimeQuantity && validationResult.errors.overtimeQuantity.includes('vượt quá số lượng cần làm'));
      
      if (hasQuantityExceeded) {
        setShowQuantityExceedModal(true);
      }
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

  // Filter work items based on search query
  const filteredWorkItems = useMemo(() => {
    if (!workItemSearchQuery.trim()) {
      return workItems;
    }
    const query = workItemSearchQuery.toLowerCase();
    return workItems.filter((item) => 
      item.name.toLowerCase().includes(query) ||
      item.difficultyLevel.toLowerCase().includes(query)
    );
  }, [workItems, workItemSearchQuery]);

  // Filter employees based on search query
  const filteredEmployees = useMemo(() => {
    if (!employeeSearchQuery.trim()) {
      return employees;
    }
    const query = employeeSearchQuery.toLowerCase();
    return employees.filter((emp) => 
      emp.firstName.toLowerCase().includes(query) ||
      emp.lastName.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query)
    );
  }, [employees, employeeSearchQuery]);

  return (
    <>
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
          <Combobox
            value={selectedEmployee}
            onChange={(employee: EmployeeResponse | null) => {
              if (employee) {
                setFormData((prev) => ({ ...prev, employeeId: employee.id }));
                setSelectedEmployee(employee);
                setEmployeeSearchQuery(`${employee.firstName} ${employee.lastName} - ${employee.department}`);
                // Reset work type and work item when employee changes
                setFormData((prev) => ({ ...prev, workTypeId: '', workItemId: '', unitPrice: '', isOvertime: false, overtimeQuantity: '', overtimeHours: '' }));
                setSelectedWorkType(null);
                setSelectedWorkItem(null);
                setWorkItemSearchQuery('');
                if (errors.employeeId) {
                  setErrors((prev) => ({ ...prev, employeeId: '' }));
                }
                // Auto-select work type if employee has workTypeId
                if (employee.workTypeId) {
                  setFormData((prev) => ({ ...prev, workTypeId: employee.workTypeId! }));
                }
                // If no workTypeId but only one work type in department, auto-select it
                else {
                  const departmentWorkTypes = workTypes.filter((wt) => wt.department === employee.department);
                  if (departmentWorkTypes.length === 1) {
                    setFormData((prev) => ({ ...prev, workTypeId: departmentWorkTypes[0].id }));
                  }
                }
              } else {
                setFormData((prev) => ({ ...prev, employeeId: '', workTypeId: '', workItemId: '', unitPrice: '', isOvertime: false, overtimeQuantity: '', overtimeHours: '' }));
                setSelectedEmployee(null);
                setEmployeeSearchQuery('');
                setSelectedWorkType(null);
                setSelectedWorkItem(null);
                setWorkItemSearchQuery('');
              }
            }}
          >
            <div className="relative">
              <div className="relative">
                <Combobox.Input
                  className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.employeeId ? 'border-red-500' : 'border-gray-200'
                  }`}
                  displayValue={(employee: EmployeeResponse | null) => 
                    employee ? `${employee.firstName} ${employee.lastName} - ${employee.department}` : ''
                  }
                  onChange={(event) => {
                    setEmployeeSearchQuery(event.target.value);
                    if (event.target.value === '') {
                      setFormData((prev) => ({ ...prev, employeeId: '', workTypeId: '', workItemId: '', unitPrice: '', isOvertime: false, overtimeQuantity: '', overtimeHours: '' }));
                      setSelectedEmployee(null);
                      setSelectedWorkType(null);
                      setSelectedWorkItem(null);
                      setWorkItemSearchQuery('');
                    }
                  }}
                  placeholder="Tìm kiếm nhân viên..."
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </Combobox.Button>
              </div>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                afterLeave={() => setEmployeeSearchQuery('')}
              >
                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {filteredEmployees.length === 0 && employeeSearchQuery !== '' ? (
                    <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                      Không tìm thấy nhân viên nào.
                    </div>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <Combobox.Option
                        key={employee.id}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-blue-600 text-white' : 'text-gray-900'
                          }`
                        }
                        value={employee}
                      >
                        {({ selected, active }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              {employee.firstName} {employee.lastName} - {employee.department}
                            </span>
                            {selected ? (
                              <span
                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                  active ? 'text-white' : 'text-blue-600'
                                }`}
                              >
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Combobox.Option>
                    ))
                  )}
                </Combobox.Options>
              </Transition>
            </div>
          </Combobox>
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
              <Combobox
                value={selectedWorkItem}
                onChange={(item: any) => {
                  if (item) {
                    setFormData((prev) => ({ ...prev, workItemId: item.id }));
                    setSelectedWorkItem(item);
                    setWorkItemSearchQuery(item.name);
                    if (errors.workItemId) {
                      setErrors((prev) => ({ ...prev, workItemId: '' }));
                    }
                  } else {
                    setFormData((prev) => ({ ...prev, workItemId: '' }));
                    setSelectedWorkItem(null);
                    setWorkItemSearchQuery('');
                  }
                }}
              >
                <div className="relative">
                  <div className="relative">
                    <Combobox.Input
                      className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.workItemId ? 'border-red-500' : 'border-gray-200'
                      }`}
                      displayValue={(item: any) => item ? `${item.name} (${item.difficultyLevel})` : ''}
                      onChange={(event) => {
                        setWorkItemSearchQuery(event.target.value);
                        if (event.target.value === '') {
                          setFormData((prev) => ({ ...prev, workItemId: '' }));
                          setSelectedWorkItem(null);
                        }
                      }}
                      placeholder="Tìm kiếm loại hàng..."
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </Combobox.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setWorkItemSearchQuery('')}
                  >
                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {filteredWorkItems.length === 0 && workItemSearchQuery !== '' ? (
                        <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                          Không tìm thấy loại hàng nào.
                        </div>
                      ) : (
                        filteredWorkItems.map((item) => (
                          <Combobox.Option
                            key={item.id}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-blue-600 text-white' : 'text-gray-900'
                              }`
                            }
                            value={item}
                          >
                            {({ selected, active }) => (
                              <>
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {item.name} ({item.difficultyLevel})
                                </span>
                                {selected ? (
                                  <span
                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                      active ? 'text-white' : 'text-blue-600'
                                    }`}
                                  >
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Combobox.Option>
                        ))
                      )}
                    </Combobox.Options>
                  </Transition>
                </div>
              </Combobox>
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
          {/* Display remaining quantity for weld_count */}
          {selectedWorkType === CalculationType.WELD_COUNT && selectedWorkItem && totalQuantityMade !== undefined && (
            <div className="mt-2 text-xs text-gray-600">
              <p>
                <span className="font-medium">Đã làm:</span> {totalQuantityMade.toLocaleString('vi-VN')} SP /{' '}
                <span className="font-medium">Cần làm:</span> {selectedWorkItem.totalQuantity.toLocaleString('vi-VN')} SP
              </p>
              <p className="mt-0.5">
                <span className="font-medium">Số lượng còn lại:</span>{' '}
                <span className={selectedWorkItem.totalQuantity - totalQuantityMade <= 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                  {Math.max(0, selectedWorkItem.totalQuantity - totalQuantityMade).toLocaleString('vi-VN')} SP
                </span>
              </p>
            </div>
          )}
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

    {/* Quantity Exceeded Modal */}
    <Transition appear show={showQuantityExceedModal} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setShowQuantityExceedModal(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Cảnh báo số lượng vượt quá
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {errors.quantity && errors.quantity.includes('vượt quá số lượng còn lại') ? (
                          <>
                            Số lượng sản phẩm làm được vượt quá số lượng cần làm. Vui lòng điều chỉnh số lượng hoặc số lượng tăng ca cho phù hợp.
                            <br />
                            <span className="mt-2 inline-block text-xs text-gray-600 font-medium">
                              {errors.quantity}
                            </span>
                          </>
                        ) : errors.overtimeQuantity && errors.overtimeQuantity.includes('vượt quá số lượng cần làm') ? (
                          <>
                            Tổng số lượng sản phẩm (bao gồm tăng ca) vượt quá số lượng cần làm. Vui lòng điều chỉnh số lượng tăng ca cho phù hợp.
                            <br />
                            <span className="mt-2 inline-block text-xs text-gray-600 font-medium">
                              {errors.overtimeQuantity}
                            </span>
                          </>
                        ) : (
                          'Số lượng sản phẩm vượt quá số lượng cần làm. Vui lòng điều chỉnh lại.'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowQuantityExceedModal(false)}>
                    Hủy bỏ
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
    </>
  );
};


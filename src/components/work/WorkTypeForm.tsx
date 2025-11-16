import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createWorkType, updateWorkType } from '../../store/slices/workSlice';
import type { CreateWorkTypeDto, UpdateWorkTypeDto, WorkTypeResponse, CalculationType } from '../../types/work.types';
import { CalculationType as CalculationTypeEnum } from '../../types/work.types';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface WorkTypeFormProps {
  workType?: WorkTypeResponse | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export const WorkTypeForm = ({ workType, onCancel, onSuccess }: WorkTypeFormProps) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.work);

  const isEditMode = !!workType;

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    calculationType: 'weld_count' as CalculationType,
    unitPrice: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (workType) {
      setFormData({
        name: workType.name,
        department: workType.department,
        calculationType: workType.calculationType,
        unitPrice: workType.unitPrice.toString(),
      });
    } else {
      setFormData({
        name: '',
        department: '',
        calculationType: CalculationTypeEnum.WELD_COUNT,
        unitPrice: '0',
      });
    }
  }, [workType]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên loại công việc là bắt buộc';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Phòng ban là bắt buộc';
    }

    if (formData.unitPrice === '' || parseFloat(formData.unitPrice) < 0) {
      newErrors.unitPrice = 'Giá đơn vị phải lớn hơn hoặc bằng 0';
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
      const submitData: CreateWorkTypeDto | UpdateWorkTypeDto = {
        name: formData.name.trim(),
        department: formData.department.trim(),
        calculationType: formData.calculationType,
        unitPrice: parseFloat(formData.unitPrice),
      };

      if (isEditMode && workType) {
        await dispatch(updateWorkType({ id: workType.id, data: submitData })).unwrap();
      } else {
        await dispatch(createWorkType(submitData as CreateWorkTypeDto)).unwrap();
      }

      onSuccess();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Có lỗi xảy ra khi lưu loại công việc' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Tên loại công việc"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />
        </div>

        <div>
          <Input
            label="Phòng ban"
            name="department"
            value={formData.department}
            onChange={handleChange}
            error={errors.department}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Loại tính toán
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            name="calculationType"
            value={formData.calculationType}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.calculationType ? 'border-red-500' : 'border-gray-200'
            }`}
          >
            <option value="weld_count">Số mối hàn</option>
            <option value="hourly">Theo giờ</option>
            <option value="daily">Theo ngày</option>
          </select>
          {errors.calculationType && (
            <p className="mt-1 text-xs text-red-600">{errors.calculationType}</p>
          )}
        </div>

        <div>
          <Input
            label="Giá đơn vị (₫)"
            type="number"
            name="unitPrice"
            value={formData.unitPrice}
            onChange={handleChange}
            error={errors.unitPrice}
            required
            step="0.01"
            min="0"
            disabled={formData.calculationType === 'weld_count'}
          />
          {formData.calculationType === 'weld_count' && (
            <p className="mt-1 text-xs text-gray-500">
              Giá đơn vị được lấy từ loại hàng (work item)
            </p>
          )}
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


import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createWorkItem, updateWorkItem } from '../../store/slices/workSlice';
import type { CreateWorkItemDto, UpdateWorkItemDto, WorkItemResponse, DifficultyLevel } from '../../types/work.types';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface WorkItemFormProps {
  workItem?: WorkItemResponse | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export const WorkItemForm = ({ workItem, onCancel, onSuccess }: WorkItemFormProps) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.work);

  const isEditMode = !!workItem;

  const [formData, setFormData] = useState({
    name: '',
    difficultyLevel: 'dễ' as DifficultyLevel,
    pricePerWeld: '',
    totalQuantity: '',
    weldsPerItem: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (workItem) {
      setFormData({
        name: workItem.name,
        difficultyLevel: workItem.difficultyLevel,
        pricePerWeld: workItem.pricePerWeld.toString(),
        totalQuantity: workItem.totalQuantity.toString(),
        weldsPerItem: workItem.weldsPerItem.toString(),
      });
    } else {
      setFormData({
        name: '',
        difficultyLevel: 'dễ',
        pricePerWeld: '',
        totalQuantity: '0',
        weldsPerItem: '0',
      });
    }
  }, [workItem]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên loại hàng là bắt buộc';
    }

    if (!formData.pricePerWeld || parseFloat(formData.pricePerWeld) < 0) {
      newErrors.pricePerWeld = 'Giá mỗi mối hàn phải lớn hơn hoặc bằng 0';
    }

    if (formData.totalQuantity === '' || parseInt(formData.totalQuantity) < 0) {
      newErrors.totalQuantity = 'Tổng số lượng hàng phải lớn hơn hoặc bằng 0';
    }

    if (formData.weldsPerItem === '' || parseInt(formData.weldsPerItem) < 0) {
      newErrors.weldsPerItem = 'Số mối hàn trên 1 sản phẩm phải lớn hơn hoặc bằng 0';
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
      const submitData: CreateWorkItemDto | UpdateWorkItemDto = {
        name: formData.name.trim(),
        difficultyLevel: formData.difficultyLevel,
        pricePerWeld: parseFloat(formData.pricePerWeld),
        totalQuantity: parseInt(formData.totalQuantity),
        weldsPerItem: parseInt(formData.weldsPerItem),
      };

      if (isEditMode && workItem) {
        await dispatch(updateWorkItem({ id: workItem.id, data: submitData })).unwrap();
      } else {
        await dispatch(createWorkItem(submitData as CreateWorkItemDto)).unwrap();
      }

      onSuccess();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Có lỗi xảy ra khi lưu loại hàng' });
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
            label="Tên loại hàng"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Độ khó
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            name="difficultyLevel"
            value={formData.difficultyLevel}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.difficultyLevel ? 'border-red-500' : 'border-gray-200'
            }`}
          >
            <option value="dễ">Dễ</option>
            <option value="trung bình">Trung bình</option>
            <option value="khó">Khó</option>
          </select>
          {errors.difficultyLevel && (
            <p className="mt-1 text-xs text-red-600">{errors.difficultyLevel}</p>
          )}
        </div>

        <div>
          <Input
            label="Giá mỗi mối hàn (₫)"
            type="number"
            name="pricePerWeld"
            value={formData.pricePerWeld}
            onChange={handleChange}
            error={errors.pricePerWeld}
            required
            step="0.01"
            min="0"
          />
        </div>

        <div>
          <Input
            label="Tổng số lượng hàng cần làm"
            type="number"
            name="totalQuantity"
            value={formData.totalQuantity}
            onChange={handleChange}
            error={errors.totalQuantity}
            required
            step="1"
            min="0"
          />
        </div>

        <div>
          <Input
            label="Số mối hàn trên 1 sản phẩm"
            type="number"
            name="weldsPerItem"
            value={formData.weldsPerItem}
            onChange={handleChange}
            error={errors.weldsPerItem}
            required
            step="1"
            min="0"
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


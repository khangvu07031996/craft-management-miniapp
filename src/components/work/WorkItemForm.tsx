import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createWorkItem, updateWorkItem } from '../../store/slices/workSlice';
import type { CreateWorkItemDto, UpdateWorkItemDto, WorkItemResponse, DifficultyLevel } from '../../types/work.types';
import { DifficultyLevel as DifficultyLevelEnum } from '../../types/work.types';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { workItemService } from '../../services/work.service';

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
    description: '',
    shape: '',
    sizes: [] as string[],
    difficultyLevel: 'dễ' as DifficultyLevel,
    pricePerWeld: '',
    totalQuantity: '',
    weldsPerItem: '',
    estimatedDeliveryDate: '',
    weight: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // STT selection state
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [sequences, setSequences] = useState<Array<{
    sequence: number;
    sizes: string[];
    productCodes: string[];
    description?: string;
    shape?: string;
  }>>([]);
  const [selectedSequence, setSelectedSequence] = useState<{
    sequence: number;
    sizes: string[];
    productCodes: string[];
    description?: string;
    shape?: string;
  } | null>(null);
  const [sttSearchQuery, setSttSearchQuery] = useState('');

  // Fetch sequences on mount (create mode only)
  useEffect(() => {
    if (!isEditMode) {
      const now = new Date();
      workItemService.getSequencesInMonth(now.getFullYear(), now.getMonth() + 1)
        .then(setSequences)
        .catch(console.error);
    }
  }, [isEditMode]);

  useEffect(() => {
    if (workItem) {
      setFormData({
        description: workItem.description || '',
        shape: workItem.shape || '',
        sizes: workItem.size ? [workItem.size] : [], // Edit mode: show current size (read-only)
        difficultyLevel: workItem.difficultyLevel,
        pricePerWeld: workItem.pricePerWeld.toString(),
        totalQuantity: workItem.totalQuantity.toString(),
        weldsPerItem: workItem.weldsPerItem.toString(),
        estimatedDeliveryDate: workItem.estimatedDeliveryDate || '',
        weight: workItem.weight !== undefined ? workItem.weight.toString() : '',
      });
    } else {
      setFormData({
        description: '',
        shape: '',
        sizes: [],
        difficultyLevel: DifficultyLevelEnum.EASY,
        pricePerWeld: '',
        totalQuantity: '0',
        weldsPerItem: '0',
        estimatedDeliveryDate: '',
        weight: '',
      });
    }
  }, [workItem]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Description and shape are optional - no validation needed

    // Validate STT selection when mode is 'existing'
    if (!isEditMode && mode === 'existing' && !selectedSequence) {
      newErrors.sequence = 'Phải chọn STT';
    }

    // Sizes are required (only for create mode)
    if (!isEditMode && (!formData.sizes || formData.sizes.length === 0)) {
      newErrors.sizes = 'Phải chọn ít nhất 1 cỡ sản phẩm';
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

    if (formData.weight !== '' && (isNaN(parseFloat(formData.weight)) || parseFloat(formData.weight) < 0)) {
      newErrors.weight = 'Cân nặng phải lớn hơn hoặc bằng 0';
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
      if (isEditMode && workItem) {
        // Edit mode: update existing item (no sizes field)
        const submitData: UpdateWorkItemDto = {
          description: formData.description.trim() || undefined,
          shape: formData.shape || undefined,
          difficultyLevel: formData.difficultyLevel,
          pricePerWeld: parseFloat(formData.pricePerWeld),
          totalQuantity: parseInt(formData.totalQuantity),
          weldsPerItem: parseInt(formData.weldsPerItem),
          estimatedDeliveryDate: formData.estimatedDeliveryDate || undefined,
          weight: formData.weight !== '' ? parseFloat(formData.weight) : undefined,
        };
        await dispatch(updateWorkItem({ id: workItem.id, data: submitData })).unwrap();
      } else {
        // Create mode: create new items with sizes
        const submitData: CreateWorkItemDto = {
          description: formData.description.trim() || undefined,
          shape: formData.shape || undefined,
          sizes: formData.sizes,
          existingSequence: mode === 'existing' && selectedSequence ? selectedSequence.sequence : undefined,
          difficultyLevel: formData.difficultyLevel,
          pricePerWeld: parseFloat(formData.pricePerWeld),
          totalQuantity: parseInt(formData.totalQuantity),
          weldsPerItem: parseInt(formData.weldsPerItem),
          estimatedDeliveryDate: formData.estimatedDeliveryDate || undefined,
          weight: formData.weight !== '' ? parseFloat(formData.weight) : undefined,
        };
        await dispatch(createWorkItem(submitData)).unwrap();
      }

      onSuccess();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Có lỗi xảy ra khi lưu sản phẩm' });
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
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-300">
          {errors.submit}
        </div>
      )}

      {/* Description and Shape - Mobile optimized */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            Chú thích
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(Tùy chọn)</span>
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="VD: Con Thỏ, Con Gà..."
            className="w-full px-4 py-3 text-base border-2 border-gray-300/80 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hình dáng
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(Tùy chọn)</span>
          </label>
          <select
            name="shape"
            value={formData.shape}
            onChange={handleChange}
            className="w-full px-4 py-3 text-base border-2 border-gray-300/80 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
          >
            <option value="">-- Không chọn --</option>
            <option value="Tròn">Tròn</option>
            <option value="Vuông">Vuông</option>
            <option value="Chữ nhật">Chữ nhật</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
      </div>

      {/* STT Selection Mode - Only in create mode */}
      {!isEditMode && (
        <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
          <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
            Chọn cách tạo mã sản phẩm
          </label>
          
          {/* Radio: New STT */}
          <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer mb-2 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
            <input
              type="radio"
              checked={mode === 'new'}
              onChange={() => {
                setMode('new');
                setSelectedSequence(null);
                setFormData(prev => ({ ...prev, sizes: [] }));
              }}
              className="w-5 h-5 text-blue-600"
            />
            <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">Tạo STT mới</span>
          </label>
          
          {/* Radio: Existing STT */}
          <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
            <input
              type="radio"
              checked={mode === 'existing'}
              onChange={() => {
                setMode('existing');
                setFormData(prev => ({ ...prev, sizes: [] }));
              }}
              className="w-5 h-5 text-blue-600"
            />
            <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
              Thêm vào STT có sẵn
            </span>
          </label>
          
          {/* Combobox STT - Show when mode = existing */}
          {mode === 'existing' && (
            <div className="mt-3">
              {sequences.length > 0 ? (
                <Combobox value={selectedSequence} onChange={setSelectedSequence}>
                  <div className="relative">
                    <Combobox.Input
                      className="w-full px-4 py-3 text-base border-2 border-gray-300/80 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      displayValue={(seq: typeof selectedSequence) => {
                        if (!seq) return '';
                        return `STT ${seq.sequence} (Đã có: ${seq.sizes.join(', ')})`;
                      }}
                      onChange={(e) => setSttSearchQuery(e.target.value)}
                      placeholder="Tìm hoặc chọn STT..."
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </Combobox.Button>
                    
                    <Combobox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-gray-800 shadow-xl border-2 border-gray-200 dark:border-gray-700">
                      {sequences
                        .filter(seq => {
                          if (!sttSearchQuery) return true;
                          return seq.sequence.toString().includes(sttSearchQuery) ||
                                 seq.productCodes.some(code => code.includes(sttSearchQuery));
                        })
                        .slice(0, sttSearchQuery ? undefined : 5)
                        .map(seq => (
                          <Combobox.Option
                            key={seq.sequence}
                            value={seq}
                            className={({ active }) => `
                              px-4 py-3 cursor-pointer
                              ${active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-gray-100'}
                            `}
                          >
                            {({ selected, active }) => (
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">STT {seq.sequence}</span>
                                  {selected && (
                                    <CheckIcon className={`w-5 h-5 ${active ? 'text-white' : 'text-blue-600'}`} />
                                  )}
                                </div>
                                <div className={`text-xs mt-0.5 ${active ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
                                  Đã có: {seq.sizes.join(', ')} | {seq.productCodes[0]}
                                </div>
                                {(seq.description || seq.shape) && (
                                  <div className={`text-xs mt-0.5 ${active ? 'text-white/75' : 'text-gray-400 dark:text-gray-500'}`}>
                                    {seq.description} {seq.shape}
                                  </div>
                                )}
                              </div>
                            )}
                          </Combobox.Option>
                        ))
                      }
                      {!sttSearchQuery && sequences.length > 5 && (
                        <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                          ... và {sequences.length - 5} STT nữa (dùng tìm kiếm)
                        </div>
                      )}
                    </Combobox.Options>
                  </div>
                </Combobox>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  Chưa có sản phẩm nào trong tháng này. Vui lòng chọn "Tạo STT mới".
                </p>
              )}
              {errors.sequence && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.sequence}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sizes - Large touch-friendly checkboxes */}
      {!isEditMode && (
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cỡ sản phẩm
            <span className="text-red-500 dark:text-red-400 ml-1">*</span>
          </label>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['A', 'B', 'C', 'D', 'E', 'F'].map(size => {
              // Check if this size already exists in selected STT
              const existingSizes = mode === 'existing' && selectedSequence ? selectedSequence.sizes : [];
              const isDisabled = existingSizes.includes(size);
              
              return (
                <label 
                  key={size} 
                  className={`
                    flex items-center justify-center gap-3 p-4 border-2 rounded-lg transition-all
                    ${isDisabled 
                      ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600' 
                      : 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-700'
                    }
                    ${formData.sizes.includes(size) && !isDisabled
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                      : !isDisabled && 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    disabled={isDisabled}
                    checked={formData.sizes.includes(size)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, sizes: [...prev.sizes, size] }));
                      } else {
                        setFormData(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== size) }));
                      }
                      if (errors.sizes) {
                        setErrors(prev => ({ ...prev, sizes: '' }));
                      }
                    }}
                    className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-0 disabled:cursor-not-allowed"
                  />
                  <span className={`text-base sm:text-lg font-semibold ${isDisabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                    {size} {isDisabled && <span className="text-xs">(Đã có)</span>}
                  </span>
                </label>
              );
            })}
          </div>
          
          {errors.sizes && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.sizes}</p>
          )}
          
          {/* Preview of products to be created */}
          {formData.sizes.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-200 mb-1.5">
                Sẽ tạo {formData.sizes.length} sản phẩm:
              </p>
              <div className="space-y-1">
                {formData.sizes.slice(0, 3).map((size) => {
                  // All sizes share the same STT (sequence number)
                  const previewParts = [`Mã: YYMM1${size}`];
                  if (formData.description?.trim()) previewParts.push(formData.description.trim());
                  if (formData.shape && formData.shape !== '') previewParts.push(formData.shape);
                  
                  return (
                    <p key={size} className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                      • {previewParts.join(' ')}
                    </p>
                  );
                })}
                {formData.sizes.length > 3 && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    ... và {formData.sizes.length - 3} sản phẩm nữa
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit mode: show current size (read-only) */}
      {isEditMode && workItem?.size && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cỡ sản phẩm
          </label>
          <div className="px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
            <span className="text-base font-medium text-gray-700 dark:text-gray-300">
              {workItem.size} <span className="text-xs text-gray-500 dark:text-gray-400">(Không thể thay đổi)</span>
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Độ khó
            <span className="text-red-500 dark:text-red-400 ml-1">*</span>
          </label>
          <select
            name="difficultyLevel"
            value={formData.difficultyLevel}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all ${
              errors.difficultyLevel ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-600'
            }`}
          >
            <option value="dễ">Dễ</option>
            <option value="trung bình">Trung bình</option>
            <option value="khó">Khó</option>
          </select>
          {errors.difficultyLevel && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.difficultyLevel}</p>
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

        <div>
          <Input
            label="Ngày ước tính cần xuất hàng"
            type="date"
            name="estimatedDeliveryDate"
            value={formData.estimatedDeliveryDate}
            onChange={handleChange}
            error={errors.estimatedDeliveryDate}
          />
        </div>

        <div>
          <Input
            label="Cân nặng (kg)"
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            error={errors.weight}
            step="0.01"
            min="0"
          />
        </div>
      </div>

      {/* Submit buttons - Mobile optimized */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          className="w-full sm:w-auto py-3 text-base font-semibold"
        >
          Hủy
        </Button>
        <Button 
          type="submit" 
          isLoading={isLoading}
          disabled={isLoading || (!isEditMode && formData.sizes.length === 0)}
          className="w-full sm:w-auto py-3 text-base font-semibold"
        >
          {isEditMode 
            ? 'Cập nhật' 
            : `Thêm ${formData.sizes.length > 0 ? formData.sizes.length + ' ' : ''}sản phẩm`
          }
        </Button>
      </div>
    </form>
  );
};


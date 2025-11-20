import { useState, useEffect } from 'react';
import type { OvertimeConfigResponse, UpdateOvertimeConfigDto, WorkTypeResponse } from '../../types/work.types';
import { CalculationType } from '../../types/work.types';
import { Button } from '../common/Button';

interface OvertimeConfigFormProps {
  workType: WorkTypeResponse;
  overtimeConfig?: OvertimeConfigResponse | null;
  onSave: (workTypeId: string, data: UpdateOvertimeConfigDto) => Promise<void>;
  onCancel: () => void;
}

export const OvertimeConfigForm = ({
  workType,
  overtimeConfig,
  onSave,
  onCancel,
}: OvertimeConfigFormProps) => {
  const [overtimePricePerWeld, setOvertimePricePerWeld] = useState<string>('0');
  const [overtimePercentage, setOvertimePercentage] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (overtimeConfig) {
      setOvertimePricePerWeld(overtimeConfig.overtimePricePerWeld.toString());
      setOvertimePercentage(overtimeConfig.overtimePercentage.toString());
    } else {
      setOvertimePricePerWeld('0');
      setOvertimePercentage('0');
    }
  }, [overtimeConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (workType.calculationType === CalculationType.WELD_COUNT) {
      const price = parseFloat(overtimePricePerWeld);
      if (isNaN(price) || price < 0) {
        setError('Giá tiền tăng ca/mối hàn phải >= 0');
        return;
      }
    } else if (workType.calculationType === CalculationType.HOURLY) {
      const percentage = parseFloat(overtimePercentage);
      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        setError('Phần trăm tăng ca phải từ 0-100');
        return;
      }
    }

    setIsLoading(true);
    try {
      const data: UpdateOvertimeConfigDto = {};
      
      if (workType.calculationType === CalculationType.WELD_COUNT) {
        data.overtimePricePerWeld = parseFloat(overtimePricePerWeld);
      } else if (workType.calculationType === CalculationType.HOURLY) {
        data.overtimePercentage = parseFloat(overtimePercentage);
      }

      await onSave(workType.id, data);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lưu cấu hình');
    } finally {
      setIsLoading(false);
    }
  };

  const isWeldCount = workType.calculationType === CalculationType.WELD_COUNT;
  const isHourly = workType.calculationType === CalculationType.HOURLY;
  const isSupported = isWeldCount || isHourly;

  if (!isSupported) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Loại công việc "{workType.name}" không hỗ trợ cấu hình tăng ca.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Chỉ các loại công việc "Thợ hàn" (weld_count) và "Theo giờ" (hourly) mới hỗ trợ cấu hình tăng ca.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Loại công việc
        </label>
        <p className="text-sm text-gray-900 dark:text-gray-100 font-semibold">{workType.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{workType.department}</p>
      </div>

      {isWeldCount && (
        <div>
          <label htmlFor="overtimePricePerWeld" className="block text-sm font-medium text-gray-700 mb-1">
            Giá tiền tăng ca/mối hàn (VNĐ)
          </label>
          <input
            type="number"
            id="overtimePricePerWeld"
            min="0"
            step="0.01"
            value={overtimePricePerWeld}
            onChange={(e) => setOvertimePricePerWeld(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            required
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Số tiền cộng thêm cho mỗi mối hàn khi làm tăng ca (VNĐ)
          </p>
        </div>
      )}

      {isHourly && (
        <div>
          <label htmlFor="overtimePercentage" className="block text-sm font-medium text-gray-700 mb-1">
            Phần trăm tăng ca/giờ (%)
          </label>
          <input
            type="number"
            id="overtimePercentage"
            min="0"
            max="100"
            step="0.01"
            value={overtimePercentage}
            onChange={(e) => setOvertimePercentage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            required
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Phần trăm cộng thêm vào giá giờ khi làm tăng ca (0-100%)
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Đang lưu...' : 'Lưu cấu hình'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Hủy
        </Button>
      </div>
    </form>
  );
};

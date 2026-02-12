import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import { workRecordService } from '../../services/work.service';
import type { EmployeeProductAggregation, WorkItemResponse } from '../../types/work.types';
import { LoadingOverlay } from '../common/LoadingOverlay';

interface WorkItemRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workItem: WorkItemResponse | null;
}

export const WorkItemRecordsModal = ({
  isOpen,
  onClose,
  workItem,
}: WorkItemRecordsModalProps) => {
  const [byEmployee, setByEmployee] = useState<EmployeeProductAggregation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && workItem?.id) {
      loadData(workItem.id);
    } else {
      setByEmployee([]);
      setError(null);
    }
  }, [isOpen, workItem?.id]);

  const loadData = async (workItemId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await workRecordService.getAllWorkRecords(
        { workItemId },
        { page: 1, pageSize: 1 }
      );
      setByEmployee(result.aggregations?.byEmployeeProduct ?? []);
    } catch (err: any) {
      console.error('Error loading work records:', err);
      setError(err.message || 'Không thể tải dữ liệu');
      setByEmployee([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 dark:bg-black/50" />
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded bg-white dark:bg-gray-800 shadow-xl transition-all">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                  <div>
                    <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Số lượng theo nhân viên - {workItem?.name || workItem?.productCode || 'Sản phẩm'}
                    </Dialog.Title>
                    {workItem?.productCode && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono">
                        Mã: {workItem.productCode}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Đóng"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                  <LoadingOverlay isLoading={isLoading}>
                    {error ? (
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    ) : byEmployee.length === 0 && !isLoading ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                        Chưa có nhân viên nào làm sản phẩm này
                      </p>
                    ) : (
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {byEmployee.map((agg) => (
                          <li
                            key={agg.employeeId}
                            className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                              </div>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {agg.employeeName}
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              {agg.calculationType === 'weld_count'
                                ? `${Math.round(agg.totalQuantity)} SP`
                                : agg.calculationType === 'hourly'
                                  ? `${agg.totalQuantity.toFixed(1)} giờ`
                                  : `${Math.round(agg.totalQuantity)}`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </LoadingOverlay>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

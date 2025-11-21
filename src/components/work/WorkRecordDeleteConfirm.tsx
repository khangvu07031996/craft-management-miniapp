import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '../common/Button';
import type { WorkRecordResponse } from '../../types/work.types';
import { formatDate } from '../../utils/date';

interface WorkRecordDeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  workRecord?: WorkRecordResponse | null;
  isLoading?: boolean;
}

export const WorkRecordDeleteConfirm = ({
  isOpen,
  onClose,
  onConfirm,
  workRecord,
  isLoading,
}: WorkRecordDeleteConfirmProps) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-4 sm:p-6 text-left align-middle shadow-xl dark:shadow-gray-900/50 transition-all mx-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-10 w-10 sm:h-12 sm:w-12 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Dialog.Title as="h3" className="text-base sm:text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                      Xóa công việc
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Bạn có chắc chắn muốn xóa công việc này? Hành động này không thể hoàn tác.
                      </p>
                      {workRecord && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                            <p>
                              <span className="font-medium">Ngày:</span> {formatDate(workRecord.workDate)}
                            </p>
                            {workRecord.employee && (
                              <p>
                                <span className="font-medium">Nhân viên:</span> {workRecord.employee.firstName} {workRecord.employee.lastName}
                              </p>
                            )}
                            {workRecord.workType && (
                              <p>
                                <span className="font-medium">Loại công việc:</span> {workRecord.workType.name}
                              </p>
                            )}
                            {workRecord.workItem && (
                              <p>
                                <span className="font-medium">Sản phẩm:</span> {workRecord.workItem.name}
                              </p>
                            )}
                            <p>
                              <span className="font-medium">Tổng tiền:</span> {formatCurrency(workRecord.totalAmount)}
                            </p>
                            {workRecord.status && (
                              <p>
                                <span className="font-medium">Trạng thái:</span>{' '}
                                <span
                                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                    workRecord.status === 'Tạo mới'
                                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                  }`}
                                >
                                  {workRecord.status}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-2">
                  <Button variant="outline" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">
                    Hủy
                  </Button>
                  <Button variant="danger" onClick={onConfirm} isLoading={isLoading} className="w-full sm:w-auto">
                    Xóa
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};


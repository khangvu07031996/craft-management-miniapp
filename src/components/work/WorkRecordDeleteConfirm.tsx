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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Xóa công việc
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Bạn có chắc chắn muốn xóa công việc này? Hành động này không thể hoàn tác.
                      </p>
                      {workRecord && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="space-y-1 text-xs text-gray-600">
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
                                <span className="font-medium">Loại hàng:</span> {workRecord.workItem.name}
                              </p>
                            )}
                            <p>
                              <span className="font-medium">Tổng tiền:</span> {formatCurrency(workRecord.totalAmount)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose} disabled={isLoading}>
                    Hủy
                  </Button>
                  <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
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


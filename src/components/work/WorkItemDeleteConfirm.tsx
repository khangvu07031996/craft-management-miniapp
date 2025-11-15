import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '../common/Button';
import type { WorkItemResponse } from '../../types/work.types';

interface WorkItemDeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  workItem?: WorkItemResponse | null;
  isLoading?: boolean;
}

export const WorkItemDeleteConfirm = ({
  isOpen,
  onClose,
  onConfirm,
  workItem,
  isLoading,
}: WorkItemDeleteConfirmProps) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Tạo mới':
        return 'bg-green-100 text-green-800';
      case 'Đang sản xuất':
        return 'bg-blue-100 text-blue-800';
      case 'Hoàn thành':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case 'dễ':
        return 'bg-green-100 text-green-800';
      case 'trung bình':
        return 'bg-yellow-100 text-yellow-800';
      case 'khó':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
                      Xác nhận xóa loại hàng
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Bạn có chắc chắn muốn xóa loại hàng này? Hành động này không thể hoàn tác.
                      </p>
                      {workItem && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-700">
                          <p><span className="font-medium">Tên loại hàng:</span> {workItem.name}</p>
                          <p>
                            <span className="font-medium">Độ khó:</span>{' '}
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyBadgeColor(workItem.difficultyLevel)}`}>
                              {workItem.difficultyLevel}
                            </span>
                          </p>
                          <p><span className="font-medium">Giá mỗi mối hàn:</span> {formatCurrency(workItem.pricePerWeld)}</p>
                          <p><span className="font-medium">Số lượng cần làm:</span> {workItem.totalQuantity.toLocaleString('vi-VN')} SP</p>
                          {workItem.quantityMade !== undefined && (
                            <p>
                              <span className="font-medium">Số lượng đã sản xuất:</span> {workItem.quantityMade.toLocaleString('vi-VN')} SP
                            </p>
                          )}
                          <p>
                            <span className="font-medium">Trạng thái:</span>{' '}
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(workItem.status)}`}>
                              {workItem.status}
                            </span>
                          </p>
                          {workItem.estimatedDeliveryDate && (
                            <p><span className="font-medium">Ngày ước tính xuất hàng:</span> {new Date(workItem.estimatedDeliveryDate).toLocaleDateString('vi-VN')}</p>
                          )}
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


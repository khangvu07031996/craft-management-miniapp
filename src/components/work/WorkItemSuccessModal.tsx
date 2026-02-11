import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '../common/Button';

interface WorkItemSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: 'create' | 'update';
}

export const WorkItemSuccessModal = ({
  isOpen,
  onClose,
  variant,
}: WorkItemSuccessModalProps) => {
  const message =
    variant === 'create'
      ? 'Thêm sản phẩm thành công'
      : 'Cập nhật sản phẩm thành công';

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
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
                    <CheckCircleIcon className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Dialog.Title
                      as="h3"
                      className="text-base sm:text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                    >
                      {message}
                    </Dialog.Title>
                  </div>
                </div>
                <div className="mt-4 sm:mt-6 flex justify-end">
                  <Button variant="primary" onClick={onClose} className="w-full sm:w-auto">
                    Đóng
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

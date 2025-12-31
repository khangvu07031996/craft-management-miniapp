import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { EmployeeForm } from './EmployeeForm';
import type { CreateEmployeeDto, UpdateEmployeeDto, EmployeeResponse } from '../../types/employee.types';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: EmployeeResponse | null;
  onSubmit: (data: CreateEmployeeDto | UpdateEmployeeDto) => void;
  isLoading?: boolean;
}

export const EmployeeModal = ({
  isOpen,
  onClose,
  employee,
  onSubmit,
  isLoading,
}: EmployeeModalProps) => {
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-4 sm:p-6 pb-6 sm:pb-6 text-left align-middle shadow-xl dark:shadow-gray-900/50 transition-all mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-base sm:text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                    {employee ? 'Chỉnh sửa nhân viên' : 'Tạo nhân viên mới'}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 p-1"
                    onClick={onClose}
                    aria-label="Close"
                  >
                    <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>

                <EmployeeForm
                  employee={employee}
                  onSubmit={onSubmit}
                  onCancel={onClose}
                  isLoading={isLoading}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};


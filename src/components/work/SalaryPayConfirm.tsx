import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { MonthlySalaryResponse } from '../../types/work.types';
import { Button } from '../common/Button';

interface SalaryPayConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  monthlySalary: MonthlySalaryResponse | null;
  error?: string | null;
  isSubmitting?: boolean;
}

export const SalaryPayConfirm = ({
  isOpen,
  onClose,
  onConfirm,
  monthlySalary,
  error = null,
  isSubmitting = false,
}: SalaryPayConfirmProps) => {
  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const totalDisplay = formatCurrency(
    (monthlySalary?.totalAmount || 0) + (monthlySalary?.allowances || 0)
  );

  const periodLabel =
    monthlySalary?.dateFrom && monthlySalary?.dateTo
      ? `${monthlySalary.dateFrom} → ${monthlySalary.dateTo}`
      : `Tháng ${monthlySalary?.month}/${monthlySalary?.year}`;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[70]" onClose={isSubmitting ? () => undefined : onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
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
                    <ExclamationTriangleIcon className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Dialog.Title as="h3" className="text-base sm:text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                      Xác nhận thanh toán
                    </Dialog.Title>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      <p>
                        Nhân viên:{' '}
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {monthlySalary?.employee
                            ? `${monthlySalary.employee.firstName} ${monthlySalary.employee.lastName}`
                            : '—'}
                        </span>
                      </p>
                      <p>
                        Kỳ lương:{' '}
                        <span className="font-medium text-gray-900 dark:text-gray-100">{periodLabel}</span>
                      </p>
                      <p>
                        Tổng lương (gồm phụ cấp):{' '}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{totalDisplay}</span>
                      </p>
                    </div>
                    {error && (
                      <div
                        role="alert"
                        className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
                      >
                        {error}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-2">
                  <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto">
                    {error ? 'Đóng' : 'Hủy'}
                  </Button>
                  <Button onClick={onConfirm} disabled={isSubmitting || !monthlySalary} className="w-full sm:w-auto">
                    {isSubmitting ? 'Đang thanh toán...' : 'Xác nhận thanh toán'}
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

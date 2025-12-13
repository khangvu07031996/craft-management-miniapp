import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { userService } from '../../services/user.service';
import type { CreateEmployeeAccountDto } from '../../types/user.types';
import type { EmployeeResponse } from '../../types/employee.types';

interface EmployeeAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: EmployeeResponse | null;
  onSuccess?: () => void;
}

export const EmployeeAccountModal = ({ isOpen, onClose, employee, onSuccess }: EmployeeAccountModalProps) => {
  const [formData, setFormData] = useState<CreateEmployeeAccountDto>({
    email: employee?.email || '',
    password: '',
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    phoneNumber: employee?.phoneNumber || '',
    employeeId: employee?.id,
  });
  const [accountType, setAccountType] = useState<'existing' | 'new'>('existing');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data: CreateEmployeeAccountDto = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
      };

      if (accountType === 'existing' && employee) {
        data.employeeId = employee.id;
      } else {
        // Create new employee
        data.employeeData = {
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          position: formData.employeeData?.position || '',
          department: formData.employeeData?.department || '',
          salary: formData.employeeData?.salary,
          hireDate: formData.employeeData?.hireDate || new Date().toISOString().split('T')[0],
          managerId: formData.employeeData?.managerId,
        };
      }

      await userService.createEmployeeAccount(data);
      onSuccess?.();
      onClose();
      // Reset form
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể tạo tài khoản. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition show={isOpen} as="div">
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-lg w-full rounded-lg bg-white dark:bg-gray-800 shadow-xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Tạo tài khoản cho nhân viên
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                    {error}
                  </div>
                )}

                {employee ? (
                  <div className="p-3 text-sm text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg">
                    Đang tạo tài khoản cho: <strong>{employee.firstName} {employee.lastName}</strong> ({employee.employeeId})
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Loại tài khoản
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="existing"
                            checked={accountType === 'existing'}
                            onChange={(e) => setAccountType(e.target.value as 'existing' | 'new')}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Link với nhân viên có sẵn</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="new"
                            checked={accountType === 'new'}
                            onChange={(e) => setAccountType(e.target.value as 'existing' | 'new')}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Tạo nhân viên mới</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Họ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Tối thiểu 6 ký tự</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber || ''}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                {accountType === 'new' && !employee && (
                  <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Thông tin nhân viên</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Vị trí <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required={accountType === 'new'}
                          value={formData.employeeData?.position || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              employeeData: {
                                ...formData.employeeData,
                                position: e.target.value,
                                email: formData.email,
                                phoneNumber: formData.phoneNumber,
                                department: formData.employeeData?.department || '',
                                hireDate: formData.employeeData?.hireDate || new Date().toISOString().split('T')[0],
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phòng ban <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required={accountType === 'new'}
                          value={formData.employeeData?.department || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              employeeData: {
                                ...formData.employeeData,
                                department: e.target.value,
                                email: formData.email,
                                phoneNumber: formData.phoneNumber,
                                position: formData.employeeData?.position || '',
                                hireDate: formData.employeeData?.hireDate || new Date().toISOString().split('T')[0],
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ngày vào làm <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required={accountType === 'new'}
                        value={formData.employeeData?.hireDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            employeeData: {
                              ...formData.employeeData,
                              hireDate: e.target.value,
                              email: formData.email,
                              phoneNumber: formData.phoneNumber,
                              position: formData.employeeData?.position || '',
                              department: formData.employeeData?.department || '',
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Đang tạo...' : 'Tạo tài khoản'}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};


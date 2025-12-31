import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { passwordService } from '../../services/password.service';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userEmail: string;
}

export const ResetPasswordModal = ({ isOpen, onClose, userId, userName, userEmail }: ResetPasswordModalProps) => {
  const [step, setStep] = useState<'confirm' | 'success'>('confirm');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleConfirm = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await passwordService.resetUserPassword(userId);
      setNewPassword(result.data.newPassword);
      setStep('success');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Không thể reset mật khẩu. Vui lòng thử lại.';
      
      // Check if error is because user doesn't exist
      if (errorMessage.includes('not found') || err.response?.status === 404) {
        setError('Nhân viên này chưa có tài khoản. Vui lòng tạo tài khoản cho nhân viên trước khi reset mật khẩu.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setError(null);
    setNewPassword('');
    setCopied(false);
    onClose();
  };

  return (
    <Transition show={isOpen} as="div">
      <Dialog onClose={handleClose} className="relative z-50">
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
            <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white dark:bg-gray-800 shadow-xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {step === 'confirm' ? 'Reset mật khẩu' : 'Mật khẩu mới'}
                </Dialog.Title>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                {step === 'confirm' ? (
                  <div className="space-y-4">
                    {error && (
                      <div className="p-3 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                        {error}
                      </div>
                    )}

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                        Bạn có chắc muốn reset mật khẩu cho người dùng này?
                      </p>
                      <div className="mt-3 space-y-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {userName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {userEmail}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        ⚠️ Mật khẩu mới sẽ được tạo tự động và chỉ hiển thị một lần. Hãy đảm bảo sao chép và gửi cho người dùng.
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-500 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Đang xử lý...' : 'Reset mật khẩu'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                        ✓ Mật khẩu đã được reset thành công!
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Mật khẩu mới:
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono">
                            {newPassword}
                          </code>
                          <button
                            onClick={handleCopyPassword}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                            title="Sao chép"
                          >
                            {copied ? (
                              <CheckIcon className="w-5 h-5 text-green-600" />
                            ) : (
                              <ClipboardDocumentIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        ⚠️ Hãy gửi mật khẩu này cho người dùng ngay. Sau khi đóng cửa sổ này, bạn sẽ không thể xem lại mật khẩu.
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

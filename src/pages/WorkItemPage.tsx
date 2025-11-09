import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchWorkItems, deleteWorkItem } from '../store/slices/workSlice';
import { Layout } from '../components/layout/Layout';
import { WorkItemForm } from '../components/work/WorkItemForm';
import { ErrorMessage } from '../components/common/ErrorMessage';
import type { WorkItemResponse, DifficultyLevel } from '../types/work.types';
import { PencilIcon, TrashIcon, FunnelIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/solid';

export const WorkItemPage = () => {
  const dispatch = useAppDispatch();
  const { workItems, isLoading, error } = useAppSelector((state) => state.work);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WorkItemResponse | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<DifficultyLevel | ''>('');

  useEffect(() => {
    loadWorkItems();
  }, [filterDifficulty]);

  const loadWorkItems = () => {
    dispatch(fetchWorkItems(filterDifficulty || undefined));
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: WorkItemResponse) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa loại hàng này?')) {
      try {
        await dispatch(deleteWorkItem(id)).unwrap();
        loadWorkItems();
      } catch (error) {
        console.error('Error deleting work item:', error);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedItem(null);
    loadWorkItems();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedItem(null);
  };

  const filteredItems = filterDifficulty
    ? workItems.filter((item) => item.difficultyLevel === filterDifficulty)
    : workItems;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <Layout>
      <div className="pt-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý loại hàng</h1>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Thêm loại hàng</span>
          </button>
        </div>

        {/* Filter */}
        <div className="mb-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200/60 shadow-md shadow-gray-100/50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">
                <ChartBarIcon className="w-3.5 h-3.5" />
                Độ khó
              </label>
              <div className="relative">
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value as DifficultyLevel | '')}
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-300/80 rounded-lg bg-white text-gray-700 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">Tất cả</option>
                  <option value="dễ">Dễ</option>
                  <option value="trung bình">Trung bình</option>
                  <option value="khó">Khó</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && <ErrorMessage message={error} className="mb-4" />}

        {isFormOpen && (
          <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedItem ? 'Chỉnh sửa loại hàng' : 'Thêm loại hàng mới'}
            </h2>
            <WorkItemForm
              workItem={selectedItem}
              onCancel={handleFormCancel}
              onSuccess={handleFormSuccess}
            />
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">Đang tải...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-500">Không có loại hàng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên loại hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Độ khó
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá mỗi mối hàn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số lượng cần làm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mối hàn/SP
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            item.difficultyLevel === 'dễ'
                              ? 'bg-green-100 text-green-800'
                              : item.difficultyLevel === 'trung bình'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.difficultyLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.pricePerWeld)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.totalQuantity.toLocaleString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.weldsPerItem}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};


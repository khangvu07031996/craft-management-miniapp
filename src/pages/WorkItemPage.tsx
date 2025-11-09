import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchWorkItems, deleteWorkItem } from '../store/slices/workSlice';
import { Layout } from '../components/layout/Layout';
import { WorkItemForm } from '../components/work/WorkItemForm';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';
import type { WorkItemResponse, DifficultyLevel } from '../types/work.types';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

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
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý loại hàng</h1>
          <Button onClick={handleCreate} size="sm">
            <PlusIcon className="w-4 h-4 mr-1.5" />
            Thêm loại hàng
          </Button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Lọc theo độ khó
          </label>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value as DifficultyLevel | '')}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả</option>
            <option value="dễ">Dễ</option>
            <option value="trung bình">Trung bình</option>
            <option value="khó">Khó</option>
          </select>
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


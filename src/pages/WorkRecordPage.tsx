import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchWorkRecords,
  deleteWorkRecord,
  setPagination,
} from '../store/slices/workSlice';
import { Layout } from '../components/layout/Layout';
import { WorkRecordForm } from '../components/work/WorkRecordForm';
import { WorkRecordList } from '../components/work/WorkRecordList';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';
import type { WorkRecordResponse } from '../types/work.types';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

export const WorkRecordPage = () => {
  const dispatch = useAppDispatch();
  const { workRecords, pagination, isLoading, error } = useAppSelector((state) => state.work);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WorkRecordResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadWorkRecords();
  }, [selectedDate, pagination.page]);

  const loadWorkRecords = () => {
    dispatch(
      fetchWorkRecords({
        filters: {
          dateFrom: selectedDate,
          dateTo: selectedDate,
        },
        pagination: {
          page: pagination.page,
          pageSize: pagination.pageSize,
        },
      })
    );
  };

  const handleCreate = () => {
    setSelectedRecord(null);
    setIsFormOpen(true);
  };

  const handleEdit = (record: WorkRecordResponse) => {
    setSelectedRecord(record);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      try {
        await dispatch(deleteWorkRecord(id)).unwrap();
        loadWorkRecords();
      } catch (error) {
        console.error('Error deleting work record:', error);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedRecord(null);
    loadWorkRecords();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedRecord(null);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    dispatch(setPagination({ ...pagination, page: 1 }));
  };

  return (
    <Layout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Nhập công việc</h1>
          <Button onClick={handleCreate} size="sm">
            <PlusIcon className="w-4 h-4 mr-1.5" />
            Thêm công việc
          </Button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Chọn ngày
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {error && <ErrorMessage message={error} className="mb-4" />}

        {isFormOpen && (
          <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedRecord ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
            </h2>
            <WorkRecordForm
              workRecord={selectedRecord}
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
          ) : (
            <WorkRecordList
              workRecords={workRecords}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};


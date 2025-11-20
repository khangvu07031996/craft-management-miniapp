import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchWorkItems, deleteWorkItem } from '../store/slices/workSlice';
import { Layout } from '../components/layout/Layout';
import { WorkItemForm } from '../components/work/WorkItemForm';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { WorkItemDeleteConfirm } from '../components/work/WorkItemDeleteConfirm';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { Pagination } from '../components/employees/Pagination';
import type { WorkItemResponse, DifficultyLevel } from '../types/work.types';
import { PencilIcon, TrashIcon, FunnelIcon, ChartBarIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, ArrowUpIcon, ArrowDownIcon, ChevronUpDownIcon, CheckIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/solid';
import { Combobox } from '@headlessui/react';

export const WorkItemPage = () => {
  const dispatch = useAppDispatch();
  const { workItems, isLoadingFetch, isLoadingDelete, error } = useAppSelector((state) => state.work);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WorkItemResponse | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<DifficultyLevel | ''>('');
  const [filterName, setFilterName] = useState('');
  const [filterNameQuery, setFilterNameQuery] = useState('');
  const [selectedWorkItemForFilter, setSelectedWorkItemForFilter] = useState<WorkItemResponse | null>(null);
  const [filterStatus, setFilterStatus] = useState<'Tạo mới' | 'Đang sản xuất' | 'Hoàn thành' | ''>('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<WorkItemResponse | null>(null);

  useEffect(() => {
    loadWorkItems();
  }, [filterDifficulty]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDifficulty, filterName, filterStatus, filterDateFrom, filterDateTo]);

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

  const handleDelete = (id: string) => {
    const item = workItems.find((i) => i.id === id);
    if (item) {
      setItemToDelete(item);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      try {
        await dispatch(deleteWorkItem(itemToDelete.id)).unwrap();
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
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

  // Filter work items for autocomplete suggestions
  const filteredWorkItemsForAutocomplete = useMemo(() => {
    if (!filterNameQuery.trim()) {
      return workItems;
    }
    const query = filterNameQuery.toLowerCase().trim();
    return workItems.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [workItems, filterNameQuery]);

  // Apply all filters
  const filteredItems = useMemo(() => {
    let filtered = [...workItems];

    // Filter by difficulty
    if (filterDifficulty) {
      filtered = filtered.filter((item) => item.difficultyLevel === filterDifficulty);
    }

    // Filter by name (case-insensitive search)
    if (filterName.trim()) {
      const searchTerm = filterName.toLowerCase().trim();
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter((item) => item.status === filterStatus);
    }

    // Filter by estimated delivery date
    if (filterDateFrom || filterDateTo) {
      filtered = filtered.filter((item) => {
        if (!item.estimatedDeliveryDate) return false;
        const itemDate = new Date(item.estimatedDeliveryDate);
        itemDate.setHours(0, 0, 0, 0);

        if (filterDateFrom && filterDateTo) {
          const fromDate = new Date(filterDateFrom);
          fromDate.setHours(0, 0, 0, 0);
          const toDate = new Date(filterDateTo);
          toDate.setHours(23, 59, 59, 999);
          return itemDate >= fromDate && itemDate <= toDate;
        } else if (filterDateFrom) {
          const fromDate = new Date(filterDateFrom);
          fromDate.setHours(0, 0, 0, 0);
          return itemDate >= fromDate;
        } else if (filterDateTo) {
          const toDate = new Date(filterDateTo);
          toDate.setHours(23, 59, 59, 999);
          return itemDate <= toDate;
        }
        return true;
      });
    }

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'difficulty':
            const difficultyOrder = { 'dễ': 1, 'trung bình': 2, 'khó': 3 };
            aValue = difficultyOrder[a.difficultyLevel as keyof typeof difficultyOrder] || 0;
            bValue = difficultyOrder[b.difficultyLevel as keyof typeof difficultyOrder] || 0;
            break;
          case 'totalQuantity':
            aValue = a.totalQuantity;
            bValue = b.totalQuantity;
            break;
          case 'quantityMade':
            aValue = a.quantityMade || 0;
            bValue = b.quantityMade || 0;
            break;
          case 'status':
            const statusOrder = { 'Tạo mới': 1, 'Đang sản xuất': 2, 'Hoàn thành': 3 };
            aValue = statusOrder[a.status as keyof typeof statusOrder] || 0;
            bValue = statusOrder[b.status as keyof typeof statusOrder] || 0;
            break;
          case 'estimatedDeliveryDate':
            aValue = a.estimatedDeliveryDate ? new Date(a.estimatedDeliveryDate).getTime() : 0;
            bValue = b.estimatedDeliveryDate ? new Date(b.estimatedDeliveryDate).getTime() : 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [workItems, filterDifficulty, filterName, filterStatus, filterDateFrom, filterDateTo, sortBy, sortOrder]);

  // Pagination calculations
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? (
      <ArrowUpIcon className="w-4 h-4 inline ml-1" />
    ) : (
      <ArrowDownIcon className="w-4 h-4 inline ml-1" />
    );
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatDifficultyLevel = (level: string): string => {
    if (!level) return level;
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  // Calculate items approaching delivery date (within 3 days and not completed)
  const itemsApproachingDelivery = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return filteredItems.filter((item) => {
      if (!item.estimatedDeliveryDate) {
        return false;
      }

      // Check if item is actually completed based on quantityMade vs totalQuantity
      const isCompleted = item.quantityMade !== undefined && 
                         item.totalQuantity > 0 && 
                         item.quantityMade >= item.totalQuantity;
      
      if (isCompleted) {
        return false;
      }

      const deliveryDate = new Date(item.estimatedDeliveryDate);
      deliveryDate.setHours(0, 0, 0, 0);

      const diffTime = deliveryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays <= 3 && diffDays >= -1; // Within 3 days or overdue by 1 day
    });
  }, [filteredItems]);

  const getDaysRemaining = (dateString: string): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deliveryDate = new Date(dateString);
    deliveryDate.setHours(0, 0, 0, 0);

    const diffTime = deliveryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Quá hạn ${Math.abs(diffDays)} ngày`;
    } else if (diffDays === 0) {
      return 'Hôm nay';
    } else if (diffDays === 1) {
      return 'Còn 1 ngày';
    } else {
      return `Còn ${diffDays} ngày`;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Tạo mới':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'Đang sản xuất':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'Hoàn thành':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <Layout>
      <div className="pt-8 lg:pt-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-4 overflow-x-auto">
          <Link to="/dashboard" className="hover:text-gray-700 transition-colors whitespace-nowrap">
            Trang chủ
          </Link>
          <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
          <span className="text-gray-900 font-medium whitespace-nowrap">Quản lý loại hàng</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Quản lý loại hàng</h1>
          <button
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm sm:text-base font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Thêm loại hàng</span>
          </button>
        </div>

        {/* Filter */}
        <div className="mb-4 lg:mb-6 bg-gradient-to-br from-white dark:from-gray-800 to-gray-50 dark:to-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700 shadow-md dark:shadow-gray-900/50 shadow-gray-100/50 p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                <MagnifyingGlassIcon className="w-3.5 h-3.5" />
                Tên loại hàng
              </label>
              <Combobox
                value={selectedWorkItemForFilter}
                onChange={(item: WorkItemResponse | null) => {
                  setSelectedWorkItemForFilter(item);
                  if (item) {
                    setFilterName(item.name);
                    setFilterNameQuery(item.name);
                  } else {
                    setFilterName('');
                    setFilterNameQuery('');
                  }
                }}
              >
                <div className="relative">
                  <div className="relative w-full">
                    <Combobox.Input
                      className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-300/80 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
                      displayValue={(item: WorkItemResponse | null) => item ? item.name : filterNameQuery}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFilterNameQuery(value);
                        setFilterName(value);
                        setSelectedWorkItemForFilter(null);
                      }}
                      placeholder="Tìm kiếm theo tên..."
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400 dark:text-gray-500"
                        aria-hidden="true"
                      />
                    </Combobox.Button>
                  </div>
                  <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg dark:shadow-gray-900/50 ring-1 ring-black dark:ring-gray-700 ring-opacity-5 dark:ring-opacity-50 focus:outline-none sm:text-sm">
                    {filteredWorkItemsForAutocomplete.length === 0 && filterNameQuery !== '' ? (
                      <div className="relative cursor-default select-none px-4 py-2 text-gray-700 dark:text-gray-300">
                        Không tìm thấy loại hàng nào.
                      </div>
                    ) : (
                      filteredWorkItemsForAutocomplete.map((item) => (
                        <Combobox.Option
                          key={item.id}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-100'
                            }`
                          }
                          value={item}
                        >
                          {({ selected, active }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? 'font-medium' : 'font-normal'
                                }`}
                              >
                                {item.name}
                              </span>
                              {selected ? (
                                <span
                                  className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                    active ? 'text-white' : 'text-blue-600'
                                  }`}
                                >
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Combobox.Option>
                      ))
                    )}
                  </Combobox.Options>
                </div>
              </Combobox>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                <ChartBarIcon className="w-3.5 h-3.5" />
                Độ khó
              </label>
              <div className="relative">
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value as DifficultyLevel | '')}
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-300/80 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">Tất cả</option>
                  <option value="dễ">Dễ</option>
                  <option value="trung bình">Trung bình</option>
                  <option value="khó">Khó</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                <FunnelIcon className="w-3.5 h-3.5" />
                Trạng thái
              </label>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'Tạo mới' | 'Đang sản xuất' | 'Hoàn thành' | '')}
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-300/80 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">Tất cả</option>
                  <option value="Tạo mới">Tạo mới</option>
                  <option value="Đang sản xuất">Đang sản xuất</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                <ChartBarIcon className="w-3.5 h-3.5" />
                Ngày xuất hàng từ
              </label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full pl-4 pr-4 py-2.5 text-sm border border-gray-300/80 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                <ChartBarIcon className="w-3.5 h-3.5" />
                Ngày xuất hàng đến
              </label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full pl-4 pr-4 py-2.5 text-sm border border-gray-300/80 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {error && <ErrorMessage message={error} className="mb-4" />}

        {/* Alert for items approaching delivery date */}
        {itemsApproachingDelivery.length > 0 && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">
                  Cảnh báo: Có {itemsApproachingDelivery.length} loại hàng sắp đến ngày xuất hàng
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-yellow-700">
                  {itemsApproachingDelivery.map((item) => (
                    <li key={item.id} className="pl-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-yellow-600">•</span>
                        <span>Trạng thái: <span className="font-medium">{item.status}</span></span>
                        <span className="text-yellow-600">•</span>
                        <span>Sản xuất: <span className="font-medium">{(item.quantityMade || 0).toLocaleString('vi-VN')}</span> / <span className="font-medium">{item.totalQuantity.toLocaleString('vi-VN')}</span> SP</span>
                        <span className="text-yellow-600">•</span>
                        <span className={getDaysRemaining(item.estimatedDeliveryDate!).includes('Quá hạn') ? 'text-red-600 font-medium' : ''}>
                          {getDaysRemaining(item.estimatedDeliveryDate!)} ({formatDate(item.estimatedDeliveryDate)})
                        </span>
                      </div>
                      {item.totalQuantity > 0 && item.quantityMade !== undefined && (
                        <div className="mt-1 ml-4">
                          <div className="w-full bg-yellow-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                (item.quantityMade / item.totalQuantity) >= 1
                                  ? 'bg-green-500'
                                  : (item.quantityMade / item.totalQuantity) >= 0.8
                                  ? 'bg-blue-500'
                                  : 'bg-yellow-500'
                              }`}
                              style={{ width: `${Math.min((item.quantityMade / item.totalQuantity) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {isFormOpen && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/50 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {selectedItem ? 'Chỉnh sửa loại hàng' : 'Thêm loại hàng mới'}
            </h2>
            <WorkItemForm
              workItem={selectedItem}
              onCancel={handleFormCancel}
              onSuccess={handleFormSuccess}
            />
          </div>
        )}

        <LoadingOverlay isLoading={isLoadingFetch}>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {filteredItems.length === 0 && !isLoadingFetch ? (
              <div className="p-12 text-center">
                <p className="text-sm text-gray-500">Không có loại hàng nào</p>
              </div>
            ) : (
              <>
              {/* Mobile: Card Layout */}
              <div className="md:hidden space-y-4 p-4">
                {paginatedItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
                  >
                    {/* Header: Name and Actions */}
                    <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex-1 pr-2">
                        {item.name}
                      </h3>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-500 p-1"
                          aria-label="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-500 p-1"
                          aria-label="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">Độ khó:</span>
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            item.difficultyLevel === 'dễ'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : item.difficultyLevel === 'trung bình'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}
                        >
                          {formatDifficultyLevel(item.difficultyLevel)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Giá mỗi mối hàn:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">{formatCurrency(item.pricePerWeld)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Số lượng cần làm:</span>
                        <span className="text-gray-900 font-medium">{item.totalQuantity.toLocaleString('vi-VN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Số lượng đã sản xuất:</span>
                        <div className="text-right">
                          <span className="text-gray-900 font-medium">
                            {(item.quantityMade || 0).toLocaleString('vi-VN')}
                          </span>
                          {item.totalQuantity > 0 && item.quantityMade !== undefined && (
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              ({Math.round((item.quantityMade / item.totalQuantity) * 100)}%)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Mối hàn/SP:</span>
                        <span className="text-gray-900">{item.weldsPerItem}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Trạng thái:</span>
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      {item.estimatedDeliveryDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Ngày xuất hàng:</span>
                          <span className={itemsApproachingDelivery.some(i => i.id === item.id) ? 'font-medium text-yellow-600' : 'text-gray-900'}>
                            {formatDate(item.estimatedDeliveryDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tablet/Desktop: Table Layout */}
              <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th 
                      className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                      onClick={() => handleSort('name')}
                    >
                      Tên loại hàng {getSortIcon('name')}
                    </th>
                    <th 
                      className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                      onClick={() => handleSort('difficulty')}
                    >
                      Độ khó {getSortIcon('difficulty')}
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Giá mỗi mối hàn
                    </th>
                    <th 
                      className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                      onClick={() => handleSort('totalQuantity')}
                    >
                      Số lượng cần làm {getSortIcon('totalQuantity')}
                    </th>
                    <th 
                      className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                      onClick={() => handleSort('quantityMade')}
                    >
                      Số lượng đã sản xuất {getSortIcon('quantityMade')}
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Mối hàn/SP
                    </th>
                    <th 
                      className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                      onClick={() => handleSort('status')}
                    >
                      Trạng thái {getSortIcon('status')}
                    </th>
                    <th 
                      className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                      onClick={() => handleSort('estimatedDeliveryDate')}
                    >
                      Ngày ước tính xuất hàng {getSortIcon('estimatedDeliveryDate')}
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.name}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            item.difficultyLevel === 'dễ'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : item.difficultyLevel === 'trung bình'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}
                        >
                          {formatDifficultyLevel(item.difficultyLevel)}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.pricePerWeld)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {item.totalQuantity.toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <span className={item.quantityMade !== undefined && item.quantityMade > 0 ? 'font-medium' : ''}>
                          {(item.quantityMade || 0).toLocaleString('vi-VN')}
                        </span>
                        {item.totalQuantity > 0 && item.quantityMade !== undefined && (
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            ({Math.round((item.quantityMade / item.totalQuantity) * 100)}%)
                          </span>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {item.weldsPerItem}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {item.estimatedDeliveryDate ? (
                            <span className={itemsApproachingDelivery.some(i => i.id === item.id) ? 'font-medium text-yellow-600 dark:text-yellow-400' : ''}>
                            {formatDate(item.estimatedDeliveryDate)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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

              {/* Pagination Footer */}
              {totalItems > 0 && (
                <div className="px-4 lg:px-6 py-4 border-t border-gray-200 bg-white rounded-b-lg">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs sm:text-sm text-gray-600">
                      Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{' '}
                      <span className="font-medium">{Math.min(endIndex, totalItems)}</span> trong tổng số{' '}
                      <span className="font-medium">{totalItems}</span> bản ghi
                    </p>
                    {totalPages > 1 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        hasNextPage={hasNextPage}
                        hasPreviousPage={hasPreviousPage}
                        onPageChange={handlePageChange}
                      />
                    )}
                  </div>
                </div>
              )}
              </>
            )}
          </div>
        </LoadingOverlay>

        {/* Delete Confirmation Modal */}
        <WorkItemDeleteConfirm
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          workItem={itemToDelete}
          isLoading={isLoadingDelete}
        />
      </div>
    </Layout>
  );
};


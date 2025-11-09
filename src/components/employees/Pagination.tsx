import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
}: PaginationProps) => {
  // Calculate visible page numbers
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const pages: (number | string)[] = [];

    // Always show first page
    pages.push(1);

    // Calculate start and end of visible range
    let start = Math.max(2, currentPage - delta);
    let end = Math.min(totalPages - 1, currentPage + delta);

    // Adjust if we're near the start
    if (currentPage <= delta + 1) {
      end = Math.min(2 * delta + 2, totalPages - 1);
    }

    // Adjust if we're near the end
    if (currentPage >= totalPages - delta) {
      start = Math.max(2, totalPages - 2 * delta - 1);
    }

    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('ellipsis-start');
    }

    // Add visible page numbers
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Add ellipsis before last page if needed
    if (end < totalPages - 1) {
      pages.push('ellipsis-end');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPreviousPage}
        className={`
          flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors
          ${
            hasPreviousPage
              ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        <ChevronLeftIcon className="w-4 h-4" />
        <span className="ml-1 hidden sm:inline">Trước</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {visiblePages.map((page, index) => {
          if (page === 'ellipsis-start' || page === 'ellipsis-end') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-sm font-medium text-gray-500"
              >
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={`
                min-w-[2.5rem] px-3 py-2 text-sm font-medium rounded-lg border transition-colors
                ${
                  isActive
                    ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }
              `}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className={`
          flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors
          ${
            hasNextPage
              ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        <span className="mr-1 hidden sm:inline">Sau</span>
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
};


import { useState, useMemo } from 'react';
import type { EmployeeProductAggregation } from '../../types/work.types';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface WorkRecordSummaryPanelProps {
  aggregations: EmployeeProductAggregation[];
}

const SHOW_INITIAL = 5;

const formatQuantity = (quantity: number, calculationType: string): string => {
  if (calculationType === 'weld_count') {
    return `${Math.round(quantity)} SP`;
  }
  if (calculationType === 'hourly') {
    return `${quantity.toFixed(1)} giờ`;
  }
  return `${Math.round(quantity)}`;
};

export const WorkRecordSummaryPanel = ({ aggregations }: WorkRecordSummaryPanelProps) => {
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());

  const groupedByEmployee = useMemo(() => {
    const map = new Map<string, EmployeeProductAggregation[]>();
    for (const agg of aggregations) {
      const list = map.get(agg.employeeId) ?? [];
      list.push(agg);
      map.set(agg.employeeId, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => {
        const da = a.lastWorkDate ?? '';
        const db = b.lastWorkDate ?? '';
        return db.localeCompare(da);
      });
    }
    return Array.from(map.entries()).map(([employeeId, products]) => ({
      employeeId,
      employeeName: products[0]?.employeeName ?? '',
      products,
    }));
  }, [aggregations]);

  const toggleExpand = (employeeId: string) => {
    setExpandedEmployees((prev) => {
      const next = new Set(prev);
      if (next.has(employeeId)) {
        next.delete(employeeId);
      } else {
        next.add(employeeId);
      }
      return next;
    });
  };

  if (aggregations.length === 0) return null;

  return (
    <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Tổng theo nhân viên - sản phẩm
        </h3>
      </div>
      <div className="overflow-x-auto max-h-64 overflow-y-auto">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {groupedByEmployee.map(({ employeeId, employeeName, products }) => {
            const isExpanded = expandedEmployees.has(employeeId);
            const showCount = isExpanded ? products.length : Math.min(SHOW_INITIAL, products.length);
            const visibleProducts = products.slice(0, showCount);
            const remainingCount = products.length - SHOW_INITIAL;

            return (
              <div key={employeeId} className="px-4 py-3">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {employeeName}
                </div>
                <table className="min-w-full text-sm">
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {visibleProducts.map((agg) => (
                      <tr key={`${agg.employeeId}-${agg.workItemId}`}>
                        <td className="py-1.5 pr-4 text-gray-700 dark:text-gray-300">
                          {agg.workItemName}
                        </td>
                        <td className="py-1.5 text-right font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {formatQuantity(agg.totalQuantity, agg.calculationType)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {remainingCount > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleExpand(employeeId)}
                    className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUpIcon className="w-4 h-4" />
                        Thu gọn
                      </>
                    ) : (
                      <>
                        <ChevronDownIcon className="w-4 h-4" />
                        Xem thêm ({remainingCount} sản phẩm)
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

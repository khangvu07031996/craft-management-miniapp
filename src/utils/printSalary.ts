import type { MonthlySalaryResponse, WorkRecordResponse } from '../types/work.types';

/**
 * Format currency to VND format
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format date to Vietnamese format
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

/**
 * Format datetime to Vietnamese format
 */
const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN');
};

/**
 * Print monthly salary
 */
export const printSalary = (
  salary: MonthlySalaryResponse,
  workRecords: WorkRecordResponse[]
): void => {
  try {
    if (!salary) {
      throw new Error('Không có dữ liệu lương để in');
    }

    const employeeName = salary.employee
      ? `${salary.employee.firstName} ${salary.employee.lastName}`
      : 'Nhân viên';

    const totalAmount = workRecords.reduce((sum, record) => sum + record.totalAmount, 0);
    const allowances = salary.allowances || 0;
    const grandTotal = totalAmount + allowances;

    // Create print HTML
    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Phiếu lương tháng ${salary.month}/${salary.year}</title>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 15mm;
      }
      body {
        margin: 0;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
    @media screen {
      body {
        margin: 20px;
        font-family: Arial, sans-serif;
      }
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.5;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .header h1 {
      font-size: 20px;
      font-weight: bold;
      margin: 0 0 5px 0;
    }
    .header h2 {
      font-size: 16px;
      margin: 0;
    }
    .info-section {
      margin-bottom: 15px;
    }
    .info-section p {
      margin: 5px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 10px;
    }
    table th {
      background-color: #4285f4;
      color: white;
      padding: 8px 4px;
      text-align: left;
      font-weight: bold;
      border: 1px solid #ddd;
    }
    table th.text-center {
      text-align: center;
    }
    table th.text-right {
      text-align: right;
    }
    table td {
      padding: 6px 4px;
      border: 1px solid #ddd;
    }
    table td.text-center {
      text-align: center;
    }
    table td.text-right {
      text-align: right;
    }
    table tbody tr:nth-child(even) {
      background-color: #f5f5f5;
    }
    .summary {
      margin-top: 20px;
      font-size: 11px;
    }
    .summary-row {
      margin: 8px 0;
    }
    .summary-total {
      font-weight: bold;
      font-size: 12px;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 2px solid #333;
    }
    .footer {
      margin-top: 20px;
      font-size: 9px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>PHIẾU LƯƠNG THÁNG</h1>
    <h2>Tháng ${salary.month}/${salary.year}</h2>
  </div>

  <div class="info-section">
    <p><strong>Nhân viên:</strong> ${employeeName}</p>
    <p><strong>Số ngày làm việc:</strong> ${salary.totalWorkDays} ngày</p>
    <p><strong>Trạng thái:</strong> ${salary.status}</p>
  </div>

  <div>
    <h3 style="margin: 15px 0 10px 0; font-size: 11px;">BẢNG CHI TIẾT CÔNG VIỆC</h3>
    <table>
      <thead>
        <tr>
          <th>Ngày</th>
          <th>Loại công việc</th>
          <th>Sản phẩm</th>
          <th class="text-center">Tăng ca</th>
          <th class="text-right">SL/giờ TC</th>
          <th class="text-right">Số lượng</th>
          <th class="text-right">Đơn giá</th>
          <th class="text-right">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${
          workRecords && workRecords.length > 0
            ? workRecords
                .map(
                  (record) => `
          <tr>
            <td>${formatDate(record.workDate)}</td>
            <td>${record.workType?.name || '-'}</td>
            <td>${record.workItem?.name || '-'}</td>
            <td class="text-center">${record.isOvertime ? 'Có' : 'Không'}</td>
            <td class="text-right">${
              record.isOvertime
                ? record.overtimeQuantity ?? record.overtimeHours ?? 0
                : 0
            }</td>
            <td class="text-right">${record.quantity}</td>
            <td class="text-right">${formatCurrency(record.unitPrice)}</td>
            <td class="text-right">${formatCurrency(record.totalAmount)}</td>
          </tr>
        `
                )
                .join('')
            : `
          <tr>
            <td colspan="8" style="text-align: center; font-style: italic; padding: 20px;">
              Không có bản ghi công việc
            </td>
          </tr>
        `
        }
      </tbody>
    </table>
  </div>

  <div class="summary">
    <div class="summary-row">
      <strong>Tổng lương (chưa phụ cấp):</strong> ${formatCurrency(totalAmount)}
    </div>
    <div class="summary-row">
      <strong>Phụ cấp:</strong> ${formatCurrency(allowances)}
    </div>
    <div class="summary-total">
      <strong>Tổng lương cần thanh toán:</strong> ${formatCurrency(grandTotal)}
    </div>
  </div>

  ${salary.calculatedAt ? `<div class="footer">Ngày tạo: ${formatDateTime(salary.calculatedAt)}</div>` : ''}
</body>
</html>
    `;

    // Create new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Không thể mở cửa sổ in. Vui lòng cho phép popup.');
    }

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Close window after printing (optional, user can cancel)
        // printWindow.close();
      }, 250);
    };
  } catch (error: any) {
    console.error('Error printing salary:', error);
    throw new Error(error.message || 'Không thể in phiếu lương. Vui lòng thử lại.');
  }
};


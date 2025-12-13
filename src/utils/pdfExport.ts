import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
 * Sanitize filename by removing special characters
 */
const sanitizeFilename = (name: string): string => {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .trim();
};

/**
 * Export monthly salary to PDF using HTML to Canvas to PDF
 */
export const exportSalaryToPDF = async (
  salary: MonthlySalaryResponse,
  workRecords: WorkRecordResponse[]
): Promise<void> => {
  try {
    if (!salary) {
      throw new Error('Không có dữ liệu lương để xuất PDF');
    }

    const employeeName = salary.employee
      ? `${salary.employee.firstName} ${salary.employee.lastName}`
      : 'Nhân viên';

    const totalAmount = workRecords.reduce((sum, record) => sum + record.totalAmount, 0);
    const allowances = salary.allowances || 0;
    const grandTotal = totalAmount + allowances;

    // Create HTML content for PDF (same as print function)
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Phiếu lương tháng ${salary.month}/${salary.year}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, 'DejaVu Sans', sans-serif;
      font-size: 12px;
      line-height: 1.5;
      padding: 20px;
      color: #000;
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

    // Create a temporary container in the main document
    const container = document.createElement('div');
    container.id = 'pdf-export-container';
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '210mm';
    container.style.minHeight = '297mm';
    container.style.padding = '20px';
    container.style.backgroundColor = 'white';
    container.style.zIndex = '10000';
    container.style.overflow = 'visible';
    container.innerHTML = htmlContent;
    
    // Append to body
    document.body.appendChild(container);

    // Wait for content to render and images to load
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: container.scrollWidth,
        height: container.scrollHeight,
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // If content is taller than one page, split into multiple pages
      const pageHeight = 297; // A4 height in mm
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename
      const sanitizedName = sanitizeFilename(employeeName);
      const filename = `PhieuLuong_${sanitizedName}_${salary.month}_${salary.year}.pdf`;

      // Save PDF
      pdf.save(filename);
    } finally {
      // Clean up
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    }
  } catch (error: any) {
    console.error('Error exporting PDF:', error);
    throw new Error(error.message || 'Không thể xuất PDF. Vui lòng thử lại.');
  }
};


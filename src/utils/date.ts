export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateForInput = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculate working duration from hire date to now
 * Returns format: "X năm Y tháng Z ngày"
 */
export const calculateWorkingDuration = (hireDate: string | Date): string => {
  const hireDateObj = typeof hireDate === 'string' ? new Date(hireDate) : hireDate;
  const now = new Date();
  
  // Set time to 00:00:00 to avoid timezone issues
  const hire = new Date(hireDateObj.getFullYear(), hireDateObj.getMonth(), hireDateObj.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (hire > today) {
    return 'Chưa bắt đầu';
  }
  
  let years = today.getFullYear() - hire.getFullYear();
  let months = today.getMonth() - hire.getMonth();
  let days = today.getDate() - hire.getDate();
  
  // Adjust for negative days
  if (days < 0) {
    months--;
    const daysInPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += daysInPreviousMonth;
  }
  
  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }
  
  // Build result string
  const parts: string[] = [];
  if (years > 0) {
    parts.push(`${years} năm`);
  }
  if (months > 0) {
    parts.push(`${months} tháng`);
  }
  if (days > 0 || parts.length === 0) {
    parts.push(`${days} ngày`);
  }
  
  return parts.join(' ');
};


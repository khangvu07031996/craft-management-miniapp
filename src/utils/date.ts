export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
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

/**
 * Format datetime with Vietnam timezone (UTC+7)
 * Returns format: "dd/mm/yyyy, hh:mm"
 * Simply adds 7 hours to UTC timestamp
 */
export const formatDateTimeVN = (date: string | Date): string => {
  // Ensure we have a Date object
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // Backend returns UTC ISO string (e.g., "2025-11-17T18:11:37.911Z")
    // Parse it directly as UTC
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  // Get UTC time in milliseconds
  const utcTimeMs = dateObj.getTime();
  
  // Add 7 hours (7 * 60 * 60 * 1000 = 25,200,000 milliseconds) to convert UTC to Vietnam time (UTC+7)
  const SEVEN_HOURS_MS = 7 * 60 * 60 * 1000;
  const vnTimeMs = utcTimeMs + SEVEN_HOURS_MS;
  
  // Create new Date object with the adjusted time
  const vnTime = new Date(vnTimeMs);
  
  // Extract UTC components (after adding 7 hours, these represent Vietnam time)
  const day = String(vnTime.getUTCDate()).padStart(2, '0');
  const month = String(vnTime.getUTCMonth() + 1).padStart(2, '0');
  const year = vnTime.getUTCFullYear();
  const hour = String(vnTime.getUTCHours()).padStart(2, '0');
  const minute = String(vnTime.getUTCMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year}, ${hour}:${minute}`;
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


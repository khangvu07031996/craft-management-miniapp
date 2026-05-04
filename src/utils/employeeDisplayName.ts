/**
 * Chuỗi hiển thị đúng thứ tự Việt Nam (Họ rồi Tên).
 * Trong `EmployeeForm`, trường "Họ" lưu `firstName`, "Tên" lưu `lastName` (cột DB `first_name` / `last_name`).
 */
export function formatEmployeeDisplayName(e: {
  firstName?: string | null;
  lastName?: string | null;
}): string {
  const ho = (e.firstName ?? '').trim();
  const ten = (e.lastName ?? '').trim();
  if (!ho) return ten;
  if (!ten) return ho;
  return `${ho} ${ten}`;
}

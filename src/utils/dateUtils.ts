/**
 * Timezone-safe date utility for Indonesia (WIB / Asia/Jakarta, UTC+7).
 * Ensures date comparisons and 'Hari Ini' calculations do not suffer from UTC leakage
 * between 00:00 - 06:59 WIB.
 */

export function getJakartaDateString(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  } catch {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

export function getTodayDateString(): string {
  return getJakartaDateString(new Date());
}

export function formatToJakartaDateString(val?: string | number | Date | null): string {
  if (!val) return '';
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val.trim())) {
    return val.trim();
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return getJakartaDateString(d);
}

export function isTodayVisit(
  v: { visitDate?: string; timestamp?: string | number | Date } | null | undefined,
  refDate: Date = new Date()
): boolean {
  if (!v) return false;
  const todayStr = getJakartaDateString(refDate);

  // Jika memiliki timestamp ISO (misal saat dibuat di Firestore), konversi ke tanggal Jakarta
  if (v.timestamp) {
    const d = new Date(v.timestamp);
    if (!isNaN(d.getTime())) {
      return getJakartaDateString(d) === todayStr;
    }
  }

  // Fallback ke visitDate jika timestamp tidak valid
  if (v.visitDate) {
    return v.visitDate.trim().slice(0, 10) === todayStr;
  }

  return false;
}

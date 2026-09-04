// Offline Data Manager for Libra (Online-First Architecture)
// Stores downloaded cache in LocalStorage/IndexedDB, strictly used ONLY when Firestore is unreachable.

const CACHE_KEYS = {
  BOOKS: 'libra_offline_books',
  CATEGORIES: 'libra_offline_categories',
  SHELVES: 'libra_offline_shelves',
  MEMBERS: 'libra_offline_members',
  LOANS: 'libra_offline_loans',
  BOOKINGS: 'libra_offline_bookings',
  CONFIG: 'libra_offline_config',
  NOTIFICATIONS: 'libra_offline_notifications',
  OFFLINE_QUEUE: 'libra_pending_mutations_queue',
  LAST_DOWNLOADED: 'libra_offline_last_downloaded'
};

export interface PendingMutation {
  id: string;
  action: 'saveBook' | 'deleteBook' | 'saveShelf' | 'deleteShelf' | 'saveCategory' | 'deleteCategory' | 'saveMember' | 'deleteMember' | 'saveLoan' | 'saveBooking' | 'saveConfig' | 'saveNotification' | 'deleteNotification';
  collection: string;
  docId: string;
  data?: any;
  timestamp: number;
}

export function saveToOfflineStorage(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to local offline cache:', e);
  }
}

export function getFromOfflineStorage<T = any>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function downloadAllForOfflineAccess(data: {
  books: any[];
  categories: any[];
  shelves: any[];
  members: any[];
  loans: any[];
  bookings: any[];
  notifications?: any[];
  config?: any;
}) {
  saveToOfflineStorage(CACHE_KEYS.BOOKS, data.books || []);
  saveToOfflineStorage(CACHE_KEYS.CATEGORIES, data.categories || []);
  saveToOfflineStorage(CACHE_KEYS.SHELVES, data.shelves || []);
  saveToOfflineStorage(CACHE_KEYS.MEMBERS, data.members || []);
  saveToOfflineStorage(CACHE_KEYS.LOANS, data.loans || []);
  saveToOfflineStorage(CACHE_KEYS.BOOKINGS, data.bookings || []);
  if (data.notifications) saveToOfflineStorage(CACHE_KEYS.NOTIFICATIONS, data.notifications);
  if (data.config) saveToOfflineStorage(CACHE_KEYS.CONFIG, data.config);
  saveToOfflineStorage(CACHE_KEYS.LAST_DOWNLOADED, new Date().toISOString());
}

export function getOfflineLastDownloaded(): string | null {
  return localStorage.getItem(CACHE_KEYS.LAST_DOWNLOADED);
}

export function getOfflineCachedData() {
  return {
    books: getFromOfflineStorage<any[]>(CACHE_KEYS.BOOKS) || [],
    categories: getFromOfflineStorage<any[]>(CACHE_KEYS.CATEGORIES) || [],
    shelves: getFromOfflineStorage<any[]>(CACHE_KEYS.SHELVES) || [],
    members: getFromOfflineStorage<any[]>(CACHE_KEYS.MEMBERS) || [],
    loans: getFromOfflineStorage<any[]>(CACHE_KEYS.LOANS) || [],
    bookings: getFromOfflineStorage<any[]>(CACHE_KEYS.BOOKINGS) || [],
    notifications: getFromOfflineStorage<any[]>(CACHE_KEYS.NOTIFICATIONS) || [],
    config: getFromOfflineStorage<any>(CACHE_KEYS.CONFIG) || null
  };
}

export function queueOfflineMutation(mutation: Omit<PendingMutation, 'id' | 'timestamp'>) {
  const current = getFromOfflineStorage<PendingMutation[]>(CACHE_KEYS.OFFLINE_QUEUE) || [];
  const item: PendingMutation = {
    ...mutation,
    id: `queue_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now()
  };
  current.push(item);
  saveToOfflineStorage(CACHE_KEYS.OFFLINE_QUEUE, current);
  return item;
}

export function getPendingOfflineMutations(): PendingMutation[] {
  return getFromOfflineStorage<PendingMutation[]>(CACHE_KEYS.OFFLINE_QUEUE) || [];
}

export function clearPendingOfflineMutations() {
  localStorage.removeItem(CACHE_KEYS.OFFLINE_QUEUE);
}

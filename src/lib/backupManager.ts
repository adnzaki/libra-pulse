import { 
  collection, 
  getDocs, 
  writeBatch, 
  doc, 
  setDoc 
} from 'firebase/firestore';
import { db } from './firebase.js';

export interface LibraryBackupData {
  version: string;
  exportedAt: string;
  app: string;
  appName: string;
  collections: {
    books: any[];
    members: any[];
    shelves: any[];
    categories: any[];
    loans: any[];
    bookings: any[];
    notifications: any[];
    config?: any;
  };
  summary: {
    totalBooks: number;
    totalMembers: number;
    totalShelves: number;
    totalCategories: number;
    totalLoans: number;
    totalBookings: number;
    totalNotifications: number;
  };
}

/**
 * Mengambil seluruh data langsung dari Cloud Firestore atau Store lokal untuk di-backup ke file JSON
 */
export async function exportFirestoreDatabase(fallbackData?: {
  books?: any[];
  members?: any[];
  shelves?: any[];
  categories?: any[];
  loans?: any[];
  bookings?: any[];
  notifications?: any[];
  config?: any;
}): Promise<LibraryBackupData> {
  const fetchCol = async (colName: string, fallback: any[] = []): Promise<any[]> => {
    try {
      const snap = await getDocs(collection(db, colName));
      if (!snap.empty) {
        const items: any[] = [];
        snap.forEach(d => {
          items.push({ id: d.id, ...d.data() });
        });
        return items;
      }
    } catch (err) {
      console.warn(`Gagal membaca koleksi "${colName}" langsung dari Firestore, gunakan data memori:`, err);
    }
    return fallback;
  };

  const [
    books,
    members,
    shelves,
    categories,
    loans,
    bookings,
    notifications
  ] = await Promise.all([
    fetchCol('books', fallbackData?.books || []),
    fetchCol('members', fallbackData?.members || []),
    fetchCol('shelves', fallbackData?.shelves || []),
    fetchCol('categories', fallbackData?.categories || []),
    fetchCol('loans', fallbackData?.loans || []),
    fetchCol('bookings', fallbackData?.bookings || []),
    fetchCol('notifications', fallbackData?.notifications || []),
  ]);

  let configData = fallbackData?.config || null;
  try {
    const configSnap = await getDocs(collection(db, 'config'));
    if (!configSnap.empty) {
      configData = configSnap.docs[0].data();
    }
  } catch (e) {
    console.warn('Gagal membaca config dari Firestore:', e);
  }

  const backup: LibraryBackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    app: 'libra-library-pwa',
    appName: 'Libra Digital Library',
    collections: {
      books,
      members,
      shelves,
      categories,
      loans,
      bookings,
      notifications,
      config: configData
    },
    summary: {
      totalBooks: books.length,
      totalMembers: members.length,
      totalShelves: shelves.length,
      totalCategories: categories.length,
      totalLoans: loans.length,
      totalBookings: bookings.length,
      totalNotifications: notifications.length
    }
  };

  return backup;
}

/**
 * Mengimpor/Restore data backup ke dalam Cloud Firestore
 * Menggunakan chunking batch (Firestore membatasi 500 operasi per batch commit)
 */
export async function restoreFirestoreDatabase(
  backupData: LibraryBackupData,
  onProgress?: (progressText: string, percent: number) => void
): Promise<{ success: boolean; message: string; details?: any }> {
  if (!backupData || !backupData.collections) {
    throw new Error('Format file backup tidak valid. Objek "collections" tidak ditemukan.');
  }

  const {
    books = [],
    members = [],
    shelves = [],
    categories = [],
    loans = [],
    bookings = [],
    notifications = [],
    config = null
  } = backupData.collections;

  const allOps: Array<{ collection: string; id: string; data: any }> = [];

  // Tambahkan semua dokumen ke daftar operasi
  categories.forEach(item => {
    if (item.id) allOps.push({ collection: 'categories', id: item.id, data: item });
  });

  shelves.forEach(item => {
    if (item.id) allOps.push({ collection: 'shelves', id: item.id, data: item });
  });

  members.forEach(item => {
    if (item.id) allOps.push({ collection: 'members', id: item.id, data: item });
  });

  books.forEach(item => {
    if (item.id) allOps.push({ collection: 'books', id: item.id, data: item });
  });

  loans.forEach(item => {
    if (item.id) allOps.push({ collection: 'loans', id: item.id, data: item });
  });

  bookings.forEach(item => {
    if (item.id) allOps.push({ collection: 'bookings', id: item.id, data: item });
  });

  notifications.forEach(item => {
    if (item.id) allOps.push({ collection: 'notifications', id: item.id, data: item });
  });

  const totalOps = allOps.length + (config ? 1 : 0);
  if (totalOps === 0) {
    throw new Error('File backup kosong tidak berisi dokumen apapun.');
  }

  // Tulis ke Firestore dalam batch berukuran maks 400
  const CHUNK_SIZE = 400;
  let processedOps = 0;

  for (let i = 0; i < allOps.length; i += CHUNK_SIZE) {
    const chunk = allOps.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);

    for (const op of chunk) {
      const docRef = doc(db, op.collection, op.id);
      batch.set(docRef, op.data, { merge: true });
    }

    await batch.commit();
    processedOps += chunk.length;

    if (onProgress) {
      const pct = Math.round((processedOps / totalOps) * 100);
      onProgress(`Memulihkan dokumen (${processedOps}/${totalOps})...`, pct);
    }
  }

  // Simpan config jika ada
  if (config) {
    await setDoc(doc(db, 'config', 'suspend_config'), config, { merge: true });
    processedOps += 1;
    if (onProgress) {
      onProgress('Menyimpan konfigurasi sistem...', 100);
    }
  }

  return {
    success: true,
    message: `Berhasil memulihkan ${processedOps} data dokumen ke Cloud Firestore!`,
    details: {
      booksCount: books.length,
      membersCount: members.length,
      shelvesCount: shelves.length,
      categoriesCount: categories.length,
      loansCount: loans.length,
      bookingsCount: bookings.length,
      notificationsCount: notifications.length
    }
  };
}

/**
 * Helper browser untuk memicu unduhan file JSON secara otomatis
 */
export function downloadJsonFile(filename: string, data: any) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

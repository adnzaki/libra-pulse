import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection,
  getDocs,
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { initialBooks, initialCategories, initialShelves, initialMembers, defaultSuspendConfig } from './default-catalog';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with specific database ID from config (or default database)
export const db = (!firebaseConfig.firestoreDatabaseId || firebaseConfig.firestoreDatabaseId === '(default)')
  ? getFirestore(app)
  : getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await firebaseSignOut(auth);
  } catch (e) {
    console.warn('Firebase sign out error:', e);
  }
}

let quotaExhausted = false;
const quotaCallbacks = new Set<(status: boolean) => void>();
const activeListeners = new Set<() => void>();

export function isFirestoreQuotaExhausted(): boolean {
  return quotaExhausted;
}

export function resetFirestoreQuotaStatus() {
  quotaExhausted = false;
  quotaCallbacks.forEach(cb => {
    try { cb(false); } catch {}
  });
}

export function setFirestoreQuotaExhausted(status: boolean) {
  if (quotaExhausted === status) return;
  quotaExhausted = status;
  if (status) {
    console.warn('[Firestore] Kuota Firestore tercapai. Mengaktifkan mode offline lokal & menghentikan listener real-time untuk mencegah beban berlebih.');
    unsubscribeAllFirestoreListeners();
  }
  quotaCallbacks.forEach(cb => {
    try { cb(status); } catch {}
  });
}

export function onFirestoreQuotaChange(cb: (status: boolean) => void): () => void {
  quotaCallbacks.add(cb);
  return () => quotaCallbacks.delete(cb);
}

export function unsubscribeAllFirestoreListeners() {
  activeListeners.forEach(unsub => {
    try { unsub(); } catch {}
  });
  activeListeners.clear();
}

export function isQuotaError(err: any): boolean {
  if (!err) return false;
  const code = err?.code || '';
  const msg = err?.message || String(err);
  return (
    code === 'resource-exhausted' ||
    msg.includes('resource-exhausted') ||
    msg.includes('Quota exceeded') ||
    msg.includes('QUOTA_EXCEEDED')
  );
}

export function handlePossibleQuotaError(err: any) {
  if (isQuotaError(err)) {
    setFirestoreQuotaExhausted(true);
  }
}

export function withTimeout<T>(promise: Promise<T>, timeoutMs = 7000): Promise<T> {
  if (quotaExhausted) {
    return Promise.reject(new Error('Firestore quota exceeded (offline mode active)'));
  }
  return Promise.race([
    promise.catch(err => {
      handlePossibleQuotaError(err);
      throw err;
    }),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Firestore request timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

export async function checkAndSeedFirestore() {
  try {
    const booksSnap = await withTimeout(getDocs(collection(db, 'books')), 8000);
    if (!booksSnap.empty) {
      return false;
    }

    console.log('Firestore is empty. Bootstrapping default library catalog directly into Firestore...');
    const batch = writeBatch(db);

    for (const cat of initialCategories) {
      batch.set(doc(db, 'categories', cat.id), cat);
    }

    for (const shelf of initialShelves) {
      batch.set(doc(db, 'shelves', shelf.id), shelf);
    }

    for (const member of initialMembers) {
      const sanitized = { ...member };
      batch.set(doc(db, 'members', member.id), sanitized);
    }

    for (const book of initialBooks) {
      batch.set(doc(db, 'books', book.id), book);
    }

    batch.set(doc(db, 'config', 'suspend_config'), defaultSuspendConfig);

    await withTimeout(batch.commit(), 10000);
    console.log('Firestore bootstrap seed completed successfully!');
    return true;
  } catch (error) {
    console.error('Failed to seed initial Firestore data:', error);
    return false;
  }
}

/**
 * Direct CRUD operations to Firestore
 */
/**
 * Recursively remove `undefined` fields from an object before sending to Firestore.
 * Firestore strictly forbids `undefined` values anywhere in the document payload.
 */
export function sanitizeForFirestore<T = any>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as any;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean as any;
  }
  return data;
}

export async function syncBookDoc(book: any) {
  if (!book?.id) return;
  const clean = sanitizeForFirestore(book);
  await withTimeout(setDoc(doc(db, 'books', book.id), clean, { merge: true }), 7000);
}

export async function removeBookDoc(bookId: string) {
  if (!bookId) return;
  await withTimeout(deleteDoc(doc(db, 'books', bookId)), 7000);
}

export async function syncShelfDoc(shelf: any) {
  if (!shelf?.id) return;
  const clean = sanitizeForFirestore(shelf);
  await withTimeout(setDoc(doc(db, 'shelves', shelf.id), clean, { merge: true }), 7000);
}

export async function removeShelfDoc(shelfId: string) {
  if (!shelfId) return;
  await withTimeout(deleteDoc(doc(db, 'shelves', shelfId)), 7000);
}

export async function syncMemberDoc(member: any) {
  if (!member?.id) return;
  const sanitized = sanitizeForFirestore({ ...member });
  if (sanitized.password && !sanitized.password.startsWith('$sha256$')) {
    const { hashPassword } = await import('./crypto.js');
    sanitized.password = await hashPassword(sanitized.password);
  }
  if (!sanitized.isSuspended) {
    sanitized.isSuspended = false;
    sanitized.suspendReason = '';
    sanitized.suspendedUntil = null;
  }
  await withTimeout(setDoc(doc(db, 'members', member.id), sanitized, { merge: true }), 7000);
}

export async function removeMemberDoc(memberId: string) {
  if (!memberId) return;
  await withTimeout(deleteDoc(doc(db, 'members', memberId)), 7000);
}

export async function syncCategoryDoc(category: any) {
  if (!category?.id) return;
  const clean = sanitizeForFirestore(category);
  await withTimeout(setDoc(doc(db, 'categories', category.id), clean, { merge: true }), 7000);
}

export async function removeCategoryDoc(categoryId: string) {
  if (!categoryId) return;
  await withTimeout(deleteDoc(doc(db, 'categories', categoryId)), 7000);
}

export async function syncLoanDoc(loan: any) {
  if (!loan?.id) return;
  const clean = sanitizeForFirestore(loan);
  await withTimeout(setDoc(doc(db, 'loans', loan.id), clean, { merge: true }), 7000);
}

export async function syncBookingDoc(booking: any) {
  if (!booking?.id) return;
  const clean = sanitizeForFirestore(booking);
  await withTimeout(setDoc(doc(db, 'bookings', booking.id), clean, { merge: true }), 7000);
}

export async function syncConfigDoc(config: any) {
  const clean = sanitizeForFirestore(config);
  await withTimeout(setDoc(doc(db, 'config', 'suspend_config'), clean, { merge: true }), 7000);
}

export async function syncNotificationDoc(notif: any) {
  if (!notif?.id) return;
  const clean = sanitizeForFirestore(notif);
  await withTimeout(setDoc(doc(db, 'notifications', notif.id), clean, { merge: true }), 7000);
}

export async function removeNotificationDoc(id: string) {
  if (!id) return;
  await withTimeout(deleteDoc(doc(db, 'notifications', id)), 7000);
}

export async function syncTeacherRequestDoc(req: any) {
  if (!req?.id) return;
  const clean = sanitizeForFirestore(req);
  await withTimeout(setDoc(doc(db, 'teacher_requests', req.id), clean), 7000);
}

export async function removeTeacherRequestDoc(id: string) {
  if (!id) return;
  await withTimeout(deleteDoc(doc(db, 'teacher_requests', id)), 7000);
}

export async function syncDeviceSessionDoc(session: any) {
  if (!session?.id) return;
  const clean = sanitizeForFirestore(session);
  await withTimeout(setDoc(doc(db, 'device_sessions', session.id), clean, { merge: true }), 7000);
}

export async function removeDeviceSessionDoc(sessionId: string) {
  if (!sessionId) return;
  await withTimeout(deleteDoc(doc(db, 'device_sessions', sessionId)), 7000);
}

/**
 * Direct Firestore Fetch Collection Helper
 */
export async function getFirestoreCollection<T = any>(collectionName: string): Promise<T[]> {
  if (quotaExhausted) return [];
  try {
    const snap = await withTimeout(getDocs(collection(db, collectionName)), 9000);
    const items: T[] = [];
    snap.forEach((d) => {
      items.push(d.data() as T);
    });
    return items;
  } catch (err: any) {
    handlePossibleQuotaError(err);
    if (!isQuotaError(err)) {
      console.warn(`getFirestoreCollection error for ${collectionName}:`, err?.message || err);
    }
    return [];
  }
}

/**
 * Real-time Firestore Collection Listener with quota protection
 */
export function subscribeToFirestoreCollection<T = any>(
  collectionName: string,
  onUpdate: (items: T[]) => void,
  onError?: (err: any) => void
): () => void {
  if (quotaExhausted) {
    return () => {};
  }
  try {
    let hasUnsubscribed = false;
    let unsubSnapshot: (() => void) | null = null;

    const cleanup = () => {
      if (hasUnsubscribed) return;
      hasUnsubscribed = true;
      if (unsubSnapshot) {
        try { unsubSnapshot(); } catch {}
        unsubSnapshot = null;
      }
      activeListeners.delete(cleanup);
    };

    unsubSnapshot = onSnapshot(
      collection(db, collectionName),
      (snap) => {
        if (hasUnsubscribed) return;
        const items: T[] = [];
        snap.forEach((d) => {
          items.push(d.data() as T);
        });
        onUpdate(items);
      },
      (error) => {
        if (hasUnsubscribed) return;
        if (isQuotaError(error)) {
          cleanup();
          handlePossibleQuotaError(error);
        } else {
          console.warn(`Firestore listener warning for ${collectionName}:`, error);
        }
        if (onError) onError(error);
      }
    );

    activeListeners.add(cleanup);
    return cleanup;
  } catch (err) {
    handlePossibleQuotaError(err);
    console.warn(`Error setting up Firestore listener for ${collectionName}:`, err);
    return () => {};
  }
}

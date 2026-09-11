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

export async function checkAndSeedFirestore() {
  try {
    const booksSnap = await getDocs(collection(db, 'books'));
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

    await batch.commit();
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
  await setDoc(doc(db, 'books', book.id), clean, { merge: true });
}

export async function removeBookDoc(bookId: string) {
  if (!bookId) return;
  await deleteDoc(doc(db, 'books', bookId));
}

export async function syncShelfDoc(shelf: any) {
  if (!shelf?.id) return;
  const clean = sanitizeForFirestore(shelf);
  await setDoc(doc(db, 'shelves', shelf.id), clean, { merge: true });
}

export async function removeShelfDoc(shelfId: string) {
  if (!shelfId) return;
  await deleteDoc(doc(db, 'shelves', shelfId));
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
  await setDoc(doc(db, 'members', member.id), sanitized, { merge: true });
}

export async function removeMemberDoc(memberId: string) {
  if (!memberId) return;
  await deleteDoc(doc(db, 'members', memberId));
}

export async function syncCategoryDoc(category: any) {
  if (!category?.id) return;
  const clean = sanitizeForFirestore(category);
  await setDoc(doc(db, 'categories', category.id), clean, { merge: true });
}

export async function removeCategoryDoc(categoryId: string) {
  if (!categoryId) return;
  await deleteDoc(doc(db, 'categories', categoryId));
}

export async function syncLoanDoc(loan: any) {
  if (!loan?.id) return;
  const clean = sanitizeForFirestore(loan);
  await setDoc(doc(db, 'loans', loan.id), clean, { merge: true });
}

export async function syncBookingDoc(booking: any) {
  if (!booking?.id) return;
  const clean = sanitizeForFirestore(booking);
  await setDoc(doc(db, 'bookings', booking.id), clean, { merge: true });
}

export async function syncConfigDoc(config: any) {
  const clean = sanitizeForFirestore(config);
  await setDoc(doc(db, 'config', 'suspend_config'), clean, { merge: true });
}

export async function syncNotificationDoc(notif: any) {
  if (!notif?.id) return;
  const clean = sanitizeForFirestore(notif);
  await setDoc(doc(db, 'notifications', notif.id), clean, { merge: true });
}

export async function removeNotificationDoc(id: string) {
  await deleteDoc(doc(db, 'notifications', id));
}

export async function syncTeacherRequestDoc(req: any) {
  if (!req?.id) return;
  const clean = sanitizeForFirestore(req);
  await setDoc(doc(db, 'teacher_requests', req.id), clean);
}

export async function removeTeacherRequestDoc(id: string) {
  if (!id) return;
  await deleteDoc(doc(db, 'teacher_requests', id));
}

export async function syncDeviceSessionDoc(session: any) {
  if (!session?.id) return;
  const clean = sanitizeForFirestore(session);
  await setDoc(doc(db, 'device_sessions', session.id), clean, { merge: true });
}

export async function removeDeviceSessionDoc(sessionId: string) {
  if (!sessionId) return;
  await deleteDoc(doc(db, 'device_sessions', sessionId));
}

/**
 * Direct Firestore Fetch Collection Helper
 */
export async function getFirestoreCollection<T = any>(collectionName: string): Promise<T[]> {
  const snap = await getDocs(collection(db, collectionName));
  const items: T[] = [];
  snap.forEach((d) => {
    items.push(d.data() as T);
  });
  return items;
}

/**
 * Real-time Firestore Collection Listener
 */
export function subscribeToFirestoreCollection<T = any>(
  collectionName: string,
  onUpdate: (items: T[]) => void
): () => void {
  try {
    const unsubscribe = onSnapshot(
      collection(db, collectionName),
      (snap) => {
        const items: T[] = [];
        snap.forEach((d) => {
          items.push(d.data() as T);
        });
        onUpdate(items);
      },
      (error) => {
        console.warn(`Firestore listener warning for ${collectionName}:`, error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn(`Error setting up Firestore listener for ${collectionName}:`, err);
    return () => {};
  }
}

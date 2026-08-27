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
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with specific database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection to Firestore as required by skill guidelines
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration or network status.');
    } else {
      console.warn('Firestore connection check notice:', error);
    }
    return false;
  }
}

// Sign in with Google Popup
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign In failed:', error);
    throw error;
  }
}

// Sign Out
export async function logoutUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

// Full Synchronize helper to Firestore
export async function syncAllToFirestore(data: {
  categories: any[];
  shelves: any[];
  books: any[];
  members: any[];
  loans: any[];
  bookings: any[];
  notifications: any[];
}): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Sync Categories
    for (const cat of data.categories) {
      if (cat.id) await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
    }

    // 2. Sync Shelves
    for (const shelf of data.shelves) {
      if (shelf.id) await setDoc(doc(db, 'shelves', shelf.id), shelf, { merge: true });
    }

    // 3. Sync Books
    for (const book of data.books) {
      if (book.id) await setDoc(doc(db, 'books', book.id), book, { merge: true });
    }

    // 4. Sync Members
    for (const member of data.members) {
      if (member.id) await setDoc(doc(db, 'members', member.id), member, { merge: true });
    }

    // 5. Sync Loans
    for (const loan of data.loans) {
      if (loan.id) await setDoc(doc(db, 'loans', loan.id), loan, { merge: true });
    }

    // 6. Sync Bookings
    for (const booking of data.bookings) {
      if (booking.id) await setDoc(doc(db, 'bookings', booking.id), booking, { merge: true });
    }

    console.log('✅ Firestore sync finished successfully.');
    return { success: true, message: 'Semua data buku, rak, dan anggota berhasil disinkronkan ke Firestore!' };
  } catch (err: any) {
    console.error('Firestore sync error:', err);
    return { success: false, message: err?.message || 'Gagal sinkronisasi ke Firestore' };
  }
}

// Single Document Sync Helpers for Realtime Firestore Persistence
export async function syncBookDoc(book: any) {
  try {
    if (book?.id) {
      await setDoc(doc(db, 'books', book.id), book, { merge: true });
    }
  } catch (e) {
    console.warn('Sync book to Firestore warning:', e);
  }
}

export async function removeBookDoc(bookId: string) {
  try {
    if (bookId) {
      await deleteDoc(doc(db, 'books', bookId));
    }
  } catch (e) {
    console.warn('Delete book from Firestore warning:', e);
  }
}

export async function syncShelfDoc(shelf: any) {
  try {
    if (shelf?.id) {
      await setDoc(doc(db, 'shelves', shelf.id), shelf, { merge: true });
    }
  } catch (e) {
    console.warn('Sync shelf to Firestore warning:', e);
  }
}

export async function removeShelfDoc(shelfId: string) {
  try {
    if (shelfId) {
      await deleteDoc(doc(db, 'shelves', shelfId));
    }
  } catch (e) {
    console.warn('Delete shelf from Firestore warning:', e);
  }
}

export async function syncMemberDoc(member: any) {
  try {
    if (member?.id) {
      const sanitized = { ...member };
      if (sanitized.password) {
        const { hashPassword } = await import('./crypto.js');
        sanitized.password = await hashPassword(sanitized.password);
      }
      await setDoc(doc(db, 'members', member.id), sanitized, { merge: true });
    }
  } catch (e) {
    console.warn('Sync member to Firestore warning:', e);
  }
}

export async function removeMemberDoc(memberId: string) {
  try {
    if (memberId) {
      await deleteDoc(doc(db, 'members', memberId));
    }
  } catch (e) {
    console.warn('Delete member from Firestore warning:', e);
  }
}

export async function syncCategoryDoc(category: any) {
  try {
    if (category?.id) {
      await setDoc(doc(db, 'categories', category.id), category, { merge: true });
    }
  } catch (e) {
    console.warn('Sync category to Firestore warning:', e);
  }
}

export async function removeCategoryDoc(categoryId: string) {
  try {
    if (categoryId) {
      await deleteDoc(doc(db, 'categories', categoryId));
    }
  } catch (e) {
    console.warn('Delete category from Firestore warning:', e);
  }
}

export async function syncLoanDoc(loan: any) {
  try {
    if (loan?.id) {
      await setDoc(doc(db, 'loans', loan.id), loan, { merge: true });
    }
  } catch (e) {
    console.warn('Sync loan to Firestore warning:', e);
  }
}

export async function syncBookingDoc(booking: any) {
  try {
    if (booking?.id) {
      await setDoc(doc(db, 'bookings', booking.id), booking, { merge: true });
    }
  } catch (e) {
    console.warn('Sync booking to Firestore warning:', e);
  }
}

export async function syncConfigDoc(config: any) {
  try {
    await setDoc(doc(db, 'config', 'suspend_config'), config, { merge: true });
  } catch (e) {
    console.warn('Sync config to Firestore warning:', e);
  }
}

export async function syncNotificationDoc(notif: any) {
  try {
    if (notif?.id) {
      await setDoc(doc(db, 'notifications', notif.id), notif, { merge: true });
    }
  } catch (e) {
    console.warn('Sync notification to Firestore warning:', e);
  }
}

// Direct Firestore Fetch Collection Helpers
export async function getFirestoreCollection<T = any>(collectionName: string): Promise<T[]> {
  try {
    const snap = await getDocs(collection(db, collectionName));
    const items: T[] = [];
    snap.forEach((d) => {
      items.push(d.data() as T);
    });
    return items;
  } catch (error) {
    console.warn(`Firestore getDocs failed for ${collectionName}:`, error);
    return [];
  }
}

// Real-time Firestore Collection Listener
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



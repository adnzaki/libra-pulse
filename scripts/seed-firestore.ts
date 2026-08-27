import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc,
  collection,
  getDocs
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import fs from 'fs';
import path from 'path';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function seedFirestore() {
  console.log(`Starting Firestore Seeding to database: ${firebaseConfig.firestoreDatabaseId}...`);
  
  // Load current library data from library-data.json or fallback
  const dataPath = path.join(process.cwd(), 'library-data.json');
  let data: any = {};
  if (fs.existsSync(dataPath)) {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  }

  const initialCategories = [
    { id: 'CAT-01', name: 'Teknologi & Komputer', description: 'Rekayasa perangkat lunak, AI, basis data, dan arsitektur cloud', color: '#3b82f6' },
    { id: 'CAT-02', name: 'Sains & Matematika', description: 'Koleksi sains modern, fisika kuantum, kalkulus, dan bioteknologi', color: '#10b981' },
    { id: 'CAT-03', name: 'Sastra & Fiksi', description: 'Novel sastra karya legendaris, antologi puisi, dan roman Nusantara', color: '#f59e0b' },
    { id: 'CAT-04', name: 'Pengembangan Diri', description: 'Psikologi populer, produktivitas harian, kepemimpinan, dan kebiasaan', color: '#ec4899' },
    { id: 'CAT-05', name: 'Sejarah & Filsafat', description: 'Sejarah peradaban dunia, kebudayaan nusantara, dan dialektika filsafat', color: '#8b5cf6' },
    { id: 'CAT-06', name: 'Bisnis & Manajemen', description: 'Strategi bisnis, startup, analisis pasar modal, dan manajemen keuangan', color: '#06b6d4' },
    { id: 'CAT-07', name: 'Referensi Umum', description: 'Ensiklopedia umum, kamus multi-bahasa, dan pedoman kepustakaan', color: '#64748b' }
  ];

  const categories = data.categories?.length ? data.categories : initialCategories;
  const shelves = data.shelves?.length ? data.shelves : [];
  const books = data.books?.length ? data.books : [];
  const members = data.members?.length ? data.members : [];
  const loans = data.loans || [];
  const bookings = data.bookings || [];
  const suspendConfig = data.suspendConfig || {
    defaultSuspendDays: 7,
    autoSuspendOnOverdue: true,
    maxActiveLoans: 3,
    maxHoldHours: 24
  };
  const notifications = data.notifications || [];

  // Seed Categories
  console.log(`Writing ${categories.length} categories...`);
  for (const cat of categories) {
    try {
      await setDoc(doc(db, 'categories', cat.id), cat);
      console.log(`✓ Category: ${cat.name}`);
    } catch (e: any) {
      console.error(`✗ Category ${cat.id} failed:`, e.message);
    }
  }

  // Seed Shelves
  console.log(`Writing ${shelves.length} shelves...`);
  for (const shelf of shelves) {
    try {
      await setDoc(doc(db, 'shelves', shelf.id), shelf);
      console.log(`✓ Shelf: ${shelf.code}`);
    } catch (e: any) {
      console.error(`✗ Shelf ${shelf.id} failed:`, e.message);
    }
  }

  // Seed Books
  console.log(`Writing ${books.length} books...`);
  for (const book of books) {
    try {
      await setDoc(doc(db, 'books', book.id), book);
      console.log(`✓ Book: ${book.title}`);
    } catch (e: any) {
      console.error(`✗ Book ${book.id} failed:`, e.message);
    }
  }

  // Seed Members
  console.log(`Writing ${members.length} members...`);
  for (const member of members) {
    try {
      await setDoc(doc(db, 'members', member.id), member);
      console.log(`✓ Member: ${member.name}`);
    } catch (e: any) {
      console.error(`✗ Member ${member.id} failed:`, e.message);
    }
  }

  // Seed Loans if any
  console.log(`Writing ${loans.length} loans...`);
  for (const loan of loans) {
    try {
      await setDoc(doc(db, 'loans', loan.id), loan);
      console.log(`✓ Loan: ${loan.id}`);
    } catch (e: any) {
      console.error(`✗ Loan ${loan.id} failed:`, e.message);
    }
  }

  // Seed Bookings if any
  console.log(`Writing ${bookings.length} bookings...`);
  for (const booking of bookings) {
    try {
      await setDoc(doc(db, 'bookings', booking.id), booking);
      console.log(`✓ Booking: ${booking.id}`);
    } catch (e: any) {
      console.error(`✗ Booking ${booking.id} failed:`, e.message);
    }
  }

  // Seed Suspend Config
  console.log('Writing system config...');
  try {
    await setDoc(doc(db, 'config', 'suspend_config'), suspendConfig);
    console.log('✓ Config');
  } catch (e: any) {
    console.error('✗ Config failed:', e.message);
  }

  // Seed Notifications
  console.log(`Writing ${notifications.length} notifications...`);
  for (const notif of notifications) {
    try {
      await setDoc(doc(db, 'notifications', notif.id), notif);
      console.log(`✓ Notification: ${notif.id}`);
    } catch (e: any) {
      console.error(`✗ Notification ${notif.id} failed:`, e.message);
    }
  }

  console.log('✅ Firestore Seeding Completed Successfully!');
  process.exit(0);
}

seedFirestore().catch((err) => {
  console.error('Error seeding Firestore:', err);
  process.exit(1);
});

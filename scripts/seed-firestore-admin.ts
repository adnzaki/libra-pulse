import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import fs from 'fs';
import path from 'path';

if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

// In firebase-admin, getFirestore takes databaseId as second argument in modern versions:
// getFirestore(app, databaseId) or getFirestore(databaseId)
const db = getFirestore(firebaseConfig.firestoreDatabaseId);

async function seed() {
  console.log(`Writing to Firestore database: ${firebaseConfig.firestoreDatabaseId} via Admin SDK...`);

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
  const shelves = data.shelves || [];
  const books = data.books || [];
  const members = data.members || [];
  const loans = data.loans || [];
  const bookings = data.bookings || [];
  const suspendConfig = data.suspendConfig || {
    defaultSuspendDays: 7,
    autoSuspendOnOverdue: true,
    maxActiveLoans: 3,
    maxHoldHours: 24
  };
  const notifications = data.notifications || [];

  console.log(`Writing ${categories.length} categories...`);
  for (const cat of categories) {
    await db.collection('categories').doc(cat.id).set(cat);
  }

  console.log(`Writing ${shelves.length} shelves...`);
  for (const shelf of shelves) {
    await db.collection('shelves').doc(shelf.id).set(shelf);
  }

  console.log(`Writing ${books.length} books...`);
  for (const book of books) {
    await db.collection('books').doc(book.id).set(book);
  }

  console.log(`Writing ${members.length} members...`);
  for (const member of members) {
    await db.collection('members').doc(member.id).set(member);
  }

  console.log(`Writing ${loans.length} loans...`);
  for (const loan of loans) {
    await db.collection('loans').doc(loan.id).set(loan);
  }

  console.log(`Writing ${bookings.length} bookings...`);
  for (const booking of bookings) {
    await db.collection('bookings').doc(booking.id).set(booking);
  }

  console.log('Writing config...');
  await db.collection('config').doc('suspend_config').set(suspendConfig);

  console.log(`Writing ${notifications.length} notifications...`);
  for (const notif of notifications) {
    await db.collection('notifications').doc(notif.id).set(notif);
  }

  console.log('🎉 Successfully seeded Firestore database!');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

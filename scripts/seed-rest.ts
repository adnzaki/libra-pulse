import axios from 'axios';
import firebaseConfig from '../firebase-applet-config.json';
import fs from 'fs';
import path from 'path';

const { projectId, firestoreDatabaseId, apiKey } = firebaseConfig;
const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents`;

// Helper to convert JS object to Firestore document format
function toFirestoreFields(obj: any): any {
  const fields: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      fields[key] = { nullValue: null };
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        fields[key] = { integerValue: value.toString() };
      } else {
        fields[key] = { doubleValue: value };
      }
    } else if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map(v => {
            if (typeof v === 'string') return { stringValue: v };
            if (typeof v === 'number') return { integerValue: v.toString() };
            if (typeof v === 'boolean') return { booleanValue: v };
            return { stringValue: JSON.stringify(v) };
          })
        }
      };
    } else if (typeof value === 'object') {
      fields[key] = {
        mapValue: {
          fields: toFirestoreFields(value)
        }
      };
    }
  }
  return fields;
}

async function saveDoc(collectionName: string, docId: string, data: any) {
  const url = `${baseUrl}/${collectionName}/${docId}?key=${apiKey}`;
  const payload = {
    fields: toFirestoreFields(data)
  };
  const res = await axios.patch(url, payload);
  return res.data;
}

async function runSeed() {
  console.log(`Seeding to Firestore via REST API: ${firestoreDatabaseId}...`);
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
    try {
      await saveDoc('categories', cat.id, cat);
      console.log(`✓ Category: ${cat.name}`);
    } catch (e: any) {
      console.error(`Failed category ${cat.id}:`, e.response?.data || e.message);
    }
  }

  console.log(`Writing ${shelves.length} shelves...`);
  for (const shelf of shelves) {
    try {
      await saveDoc('shelves', shelf.id, shelf);
      console.log(`✓ Shelf: ${shelf.code}`);
    } catch (e: any) {
      console.error(`Failed shelf ${shelf.id}:`, e.response?.data || e.message);
    }
  }

  console.log(`Writing ${books.length} books...`);
  for (const book of books) {
    try {
      await saveDoc('books', book.id, book);
      console.log(`✓ Book: ${book.title}`);
    } catch (e: any) {
      console.error(`Failed book ${book.id}:`, e.response?.data || e.message);
    }
  }

  console.log(`Writing ${members.length} members...`);
  for (const member of members) {
    try {
      await saveDoc('members', member.id, member);
      console.log(`✓ Member: ${member.name}`);
    } catch (e: any) {
      console.error(`Failed member ${member.id}:`, e.response?.data || e.message);
    }
  }

  console.log(`Writing ${loans.length} loans...`);
  for (const loan of loans) {
    try {
      await saveDoc('loans', loan.id, loan);
      console.log(`✓ Loan: ${loan.id}`);
    } catch (e: any) {
      console.error(`Failed loan ${loan.id}:`, e.response?.data || e.message);
    }
  }

  console.log(`Writing ${bookings.length} bookings...`);
  for (const booking of bookings) {
    try {
      await saveDoc('bookings', booking.id, booking);
      console.log(`✓ Booking: ${booking.id}`);
    } catch (e: any) {
      console.error(`Failed booking ${booking.id}:`, e.response?.data || e.message);
    }
  }

  console.log('Writing config...');
  try {
    await saveDoc('config', 'suspend_config', suspendConfig);
    console.log('✓ Config');
  } catch (e: any) {
    console.error('Failed config:', e.response?.data || e.message);
  }

  console.log(`Writing ${notifications.length} notifications...`);
  for (const notif of notifications) {
    try {
      await saveDoc('notifications', notif.id, notif);
      console.log(`✓ Notification: ${notif.id}`);
    } catch (e: any) {
      console.error(`Failed notification ${notif.id}:`, e.response?.data || e.message);
    }
  }

  console.log('🎉 Seeding done!');
}

runSeed();

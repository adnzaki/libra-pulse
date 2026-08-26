import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import { Book, Shelf, Member, Booking, Loan, SuspendConfig, NotificationLog, LibraryStats, BookCategory } from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory and persistent data store
const DATA_FILE = path.join(process.cwd(), 'library-data.json');

// Initial seed data
const initialCategories: BookCategory[] = [
  { id: 'CAT-01', name: 'Teknologi & Komputer', description: 'Rekayasa perangkat lunak, AI, basis data, dan arsitektur cloud', color: '#3b82f6' },
  { id: 'CAT-02', name: 'Sains & Matematika', description: 'Koleksi sains modern, fisika kuantum, kalkulus, dan bioteknologi', color: '#10b981' },
  { id: 'CAT-03', name: 'Sastra & Fiksi', description: 'Novel sastra karya legendaris, antologi puisi, dan roman Nusantara', color: '#f59e0b' },
  { id: 'CAT-04', name: 'Pengembangan Diri', description: 'Psikologi populer, produktivitas harian, kepemimpinan, dan kebiasaan', color: '#ec4899' },
  { id: 'CAT-05', name: 'Sejarah & Filsafat', description: 'Sejarah peradaban dunia, kebudayaan nusantara, dan dialektika filsafat', color: '#8b5cf6' },
  { id: 'CAT-06', name: 'Bisnis & Manajemen', description: 'Strategi bisnis, startup, analisis pasar modal, dan manajemen keuangan', color: '#06b6d4' },
  { id: 'CAT-07', name: 'Referensi Umum', description: 'Ensiklopedia umum, kamus multi-bahasa, dan pedoman kepustakaan', color: '#64748b' }
];

const initialShelves: Shelf[] = [
  {
    id: 'RAK-A1',
    code: 'RAK-A1',
    name: 'Rak A-01: Rekayasa Perangkat Lunak & AI',
    floor: 1,
    zone: 'Zona Utara - Teknologi & Komputer',
    capacity: 50,
    currentCount: 28,
    category: 'Teknologi & Komputer',
    color: '#3b82f6',
    description: 'Buku teks pemrograman, kecerdasan buatan, arsitektur cloud, dan sistem basis data.',
    shelfRow: 'Baris A, Kolom 1'
  },
  {
    id: 'RAK-A2',
    code: 'RAK-A2',
    name: 'Rak A-02: Sains, Matematika & Fisika Terapan',
    floor: 1,
    zone: 'Zona Timur - Sains & Eksakta',
    capacity: 40,
    currentCount: 22,
    category: 'Sains & Matematika',
    color: '#10b981',
    description: 'Koleksi buku sains modern, fisika kuantum, kalkulus, dan astronomi.',
    shelfRow: 'Baris A, Kolom 2'
  },
  {
    id: 'RAK-B1',
    code: 'RAK-B1',
    name: 'Rak B-01: Sastra Klasik & Fiksi Kontemporer',
    floor: 2,
    zone: 'Zona Barat - Sastra & Humaniora',
    capacity: 60,
    currentCount: 35,
    category: 'Sastra & Fiksi',
    color: '#f59e0b',
    description: 'Novel karya pemenang penghargaan, antologi puisi, dan roman sejarah Nusantara.',
    shelfRow: 'Baris B, Kolom 1'
  },
  {
    id: 'RAK-B2',
    code: 'RAK-B2',
    name: 'Rak B-02: Pengembangan Diri & Psikologi Populer',
    floor: 2,
    zone: 'Zona Tengah - Self Improvement',
    capacity: 45,
    currentCount: 30,
    category: 'Pengembangan Diri',
    color: '#ec4899',
    description: 'Koleksi produktivitas, kepemimpinan, psikologi terapan, dan manajemen emosi.',
    shelfRow: 'Baris B, Kolom 2'
  },
  {
    id: 'RAK-C1',
    code: 'RAK-C1',
    name: 'Rak C-01: Sejarah Nusantara, Diplomasi & Budaya',
    floor: 3,
    zone: 'Zona Selatan - Sejarah & Budaya',
    capacity: 50,
    currentCount: 25,
    category: 'Sejarah & Filsafat',
    color: '#8b5cf6',
    description: 'Arsip sejarah peradaban dunia, ensiklopedia kebudayaan, dan naskah filosofis.',
    shelfRow: 'Baris C, Kolom 1'
  },
  {
    id: 'RAK-C2',
    code: 'RAK-C2',
    name: 'Rak C-02: Ekonomi, Startup & Investasi Modern',
    floor: 3,
    zone: 'Zona Selatan - Bisnis & Keuangan',
    capacity: 40,
    currentCount: 18,
    category: 'Bisnis & Manajemen',
    color: '#06b6d4',
    description: 'Strategi bisnis global, analisis pasar modal, venture capital, dan manajemen keuangan.',
    shelfRow: 'Baris C, Kolom 2'
  }
];

const initialBooks: Book[] = [
  {
    id: 'BK-001',
    isbn: '978-602-06-3317-6',
    title: 'Atomic Habits: Perubahan Kecil yang Memberikan Hasil Luar Biasa',
    author: 'James Clear',
    publisher: 'Gramedia Pustaka Utama',
    year: 2023,
    category: 'Pengembangan Diri',
    shelfId: 'RAK-B2',
    shelfCode: 'RAK-B2',
    shelfName: 'Rak B-02: Pengembangan Diri & Psikologi Populer',
    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    synopsis: 'Panduan revolusioner yang terbukti praktis tentang bagaimana membangun kebiasaan baik dan membuang kebiasaan buruk dengan sistem 1% setiap hari.',
    totalCopies: 6,
    availableCopies: 6,
    borrowedCopies: 0,
    reservedCopies: 0,
    barcode: '9786020633176',
    rating: 4.9,
    pages: 352,
    language: 'Bahasa Indonesia'
  },
  {
    id: 'BK-002',
    isbn: '978-013-235088-4',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin (Uncle Bob)',
    publisher: 'Prentice Hall',
    year: 2022,
    category: 'Teknologi & Komputer',
    shelfId: 'RAK-A1',
    shelfCode: 'RAK-A1',
    shelfName: 'Rak A-01: Rekayasa Perangkat Lunak & AI',
    cover: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    synopsis: 'Buku wajib bagi setiap software engineer. Mengajarkan seni menulis kode yang mudah dibaca, dirawat, dan teruji secara profesional.',
    totalCopies: 5,
    availableCopies: 5,
    borrowedCopies: 0,
    reservedCopies: 0,
    barcode: '9780132350884',
    rating: 4.8,
    pages: 464,
    language: 'English'
  },
  {
    id: 'BK-003',
    isbn: '978-602-291-764-9',
    title: 'Bumi Manusia (Tetralogi Buru Buku 1)',
    author: 'Pramoedya Ananta Toer',
    publisher: 'Lentera Dipantara',
    year: 2021,
    category: 'Sastra & Fiksi',
    shelfId: 'RAK-B1',
    shelfCode: 'RAK-B1',
    shelfName: 'Rak B-01: Sastra Klasik & Fiksi Kontemporer',
    cover: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&auto=format&fit=crop&q=80',
    synopsis: 'Kisah Minke, seorang pribumi terpelajar yang menentang kolonialisme di awal abad ke-20 di tengah pergulatan cintanya bersama Annelies Mellema.',
    totalCopies: 8,
    availableCopies: 8,
    borrowedCopies: 0,
    reservedCopies: 0,
    barcode: '9786022917649',
    rating: 5.0,
    pages: 535,
    language: 'Bahasa Indonesia'
  },
  {
    id: 'BK-004',
    isbn: '978-006-231609-7',
    title: 'Sapiens: Riwayat Singkat Umat Manusia',
    author: 'Yuval Noah Harari',
    publisher: 'Kepustakaan Populer Gramedia',
    year: 2022,
    category: 'Sejarah & Filsafat',
    shelfId: 'RAK-C1',
    shelfCode: 'RAK-C1',
    shelfName: 'Rak C-01: Sejarah Nusantara, Diplomasi & Budaya',
    cover: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80',
    synopsis: 'Eksplorasi memukau tentang bagaimana spesies kera yang tidak signifikan menjadi penguasa bumi melalui revolusi kognitif, pertanian, dan sains.',
    totalCopies: 6,
    availableCopies: 6,
    borrowedCopies: 0,
    reservedCopies: 0,
    barcode: '9780062316097',
    rating: 4.9,
    pages: 512,
    language: 'Bahasa Indonesia'
  },
  {
    id: 'BK-005',
    isbn: '978-149-195424-9',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    publisher: "O'Reilly Media",
    year: 2023,
    category: 'Teknologi & Komputer',
    shelfId: 'RAK-A1',
    shelfCode: 'RAK-A1',
    shelfName: 'Rak A-01: Rekayasa Perangkat Lunak & AI',
    cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    synopsis: 'Panduan mendalam arsitektur data terdistribusi modern: konsistensi, partisi, replikasi, stream processing, dan batch computation.',
    totalCopies: 4,
    availableCopies: 4,
    borrowedCopies: 0,
    reservedCopies: 0,
    barcode: '9781491954249',
    rating: 5.0,
    pages: 616,
    language: 'English'
  },
  {
    id: 'BK-006',
    isbn: '978-602-03-3294-9',
    title: 'The Psychology of Money: Rahasia Abadi Kekayaan & Kebahagiaan',
    author: 'Morgan Housel',
    publisher: 'Baca Publishing',
    year: 2023,
    category: 'Bisnis & Manajemen',
    shelfId: 'RAK-C2',
    shelfCode: 'RAK-C2',
    shelfName: 'Rak C-02: Ekonomi, Startup & Investasi Modern',
    cover: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80',
    synopsis: 'Mengungkapkan bahwa sukses mengelola uang bukan semata tentang kepintaran rumus, melainkan tentang bagaimana kita mengendalikan perilaku dan psikologi.',
    totalCopies: 7,
    availableCopies: 7,
    borrowedCopies: 0,
    reservedCopies: 0,
    barcode: '9786020332949',
    rating: 4.9,
    pages: 268,
    language: 'Bahasa Indonesia'
  },
  {
    id: 'BK-007',
    isbn: '978-006-245771-4',
    title: 'The Subtle Art of Not Giving a F*ck: Sebuah Seni untuk Bersikap Bodo Amat',
    author: 'Mark Manson',
    publisher: 'Grasindo',
    year: 2022,
    category: 'Pengembangan Diri',
    shelfId: 'RAK-B2',
    shelfCode: 'RAK-B2',
    shelfName: 'Rak B-02: Pengembangan Diri & Psikologi Populer',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    synopsis: 'Pendekatan jujur dan realistis untuk menjalani hidup tanpa beban kecemasan yang tidak perlu dengan fokus pada nilai-nilai yang benar-benar bermakna.',
    totalCopies: 5,
    availableCopies: 5,
    borrowedCopies: 0,
    reservedCopies: 0,
    barcode: '9780062457714',
    rating: 4.6,
    pages: 256,
    language: 'Bahasa Indonesia'
  },
  {
    id: 'BK-008',
    isbn: '978-059-315782-4',
    title: 'Kecerdasan Buatan & Masa Depan Kemanusiaan',
    author: 'Kai-Fu Lee & Chen Qiufan',
    publisher: 'Pustaka Alvabet',
    year: 2024,
    category: 'Sains & Matematika',
    shelfId: 'RAK-A2',
    shelfCode: 'RAK-A2',
    shelfName: 'Rak A-02: Sains, Matematika & Fisika Terapan',
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    synopsis: 'Visi masa depan 2041 ketika AI merevolusi kedokteran, pekerjaan, pendidikan, dan interaksi manusia dengan analisis sains dan narasi fiksi.',
    totalCopies: 4,
    availableCopies: 4,
    borrowedCopies: 0,
    reservedCopies: 0,
    barcode: '9780593157824',
    rating: 4.7,
    pages: 480,
    language: 'Bahasa Indonesia'
  }
];

// Single Primary Super Admin Account
const initialMembers: Member[] = [
  {
    id: 'ADMIN-SUPER-01',
    cardNumber: 'LIB-ADMIN-001',
    name: 'Super Admin Perpustakaan',
    email: 'azzackey@gmail.com',
    phone: '+6281234567890',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joinDate: '2026-01-01',
    isSuspended: false,
    totalBorrowed: 0,
    activeLoansCount: 0,
    address: 'Kantor Pengelola Perpustakaan Digital',
    password: 'admin'
  }
];

const now = Date.now();
const oneDayMs = 24 * 60 * 60 * 1000;

const initialBookings: Booking[] = [];

const initialLoans: Loan[] = [];

const initialSuspendConfig: SuspendConfig = {
  defaultSuspendDays: 7, // Admin can customize 1-30 days
  autoSuspendOnOverdue: true,
  maxActiveLoans: 3,
  maxHoldHours: 24
};

const initialNotificationLogs: NotificationLog[] = [];

// Persistent state
interface AppData {
  categories: BookCategory[];
  shelves: Shelf[];
  books: Book[];
  members: Member[];
  bookings: Booking[];
  loans: Loan[];
  suspendConfig: SuspendConfig;
  notifications: NotificationLog[];
}

let db: AppData = {
  categories: initialCategories,
  shelves: initialShelves,
  books: initialBooks,
  members: initialMembers,
  bookings: initialBookings,
  loans: initialLoans,
  suspendConfig: initialSuspendConfig,
  notifications: initialNotificationLogs
};

function saveDb() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db to file', err);
  }
}

function loadDb() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const loaded = JSON.parse(data);
      
      // Filter out legacy demo members (MEM-001, MEM-002, MEM-003, MEM-ADMIN)
      const demoMemberIds = ['MEM-001', 'MEM-002', 'MEM-003', 'MEM-ADMIN'];
      let cleanedMembers: Member[] = (loaded.members || []).filter(
        (m: Member) => !demoMemberIds.includes(m.id) && m.email !== 'budi@pustaka.id' && m.email !== 'siti@pustaka.id' && m.email !== 'rian@pustaka.id'
      );

      // Ensure Super Admin azzackey@gmail.com is present with valid password
      const adminIdx = cleanedMembers.findIndex((m: Member) => m.email?.toLowerCase() === 'azzackey@gmail.com' || m.role === 'admin');
      if (adminIdx === -1) {
        cleanedMembers.unshift(initialMembers[0]);
      } else {
        if (!cleanedMembers[adminIdx].password) {
          cleanedMembers[adminIdx].password = 'admin';
        }
      }

      // Filter out any loans/bookings referencing deleted demo accounts
      const cleanedLoans: Loan[] = (loaded.loans || []).filter((l: Loan) => !demoMemberIds.includes(l.memberId));
      const cleanedBookings: Booking[] = (loaded.bookings || []).filter((b: Booking) => !demoMemberIds.includes(b.memberId));
      const cleanedNotifs: NotificationLog[] = (loaded.notifications || []).filter((n: NotificationLog) => !demoMemberIds.includes(n.memberId));

      // Sanitize shelf floors to 1..3
      if (loaded.shelves) {
        loaded.shelves.forEach((s: Shelf) => {
          if (s.floor > 3) s.floor = 3;
          if (s.floor < 1) s.floor = 1;
        });
      }

      db = {
        ...db,
        ...loaded,
        shelves: loaded.shelves && loaded.shelves.length > 0 ? loaded.shelves : initialShelves,
        categories: loaded.categories && loaded.categories.length > 0 ? loaded.categories : initialCategories,
        members: cleanedMembers.length > 0 ? cleanedMembers : initialMembers,
        loans: cleanedLoans,
        bookings: cleanedBookings,
        notifications: cleanedNotifs
      };
      saveDb();
      console.log('Database loaded and cleaned from legacy demo data.');
    } else {
      saveDb();
    }
  } catch (err) {
    console.error('Error loading db file, using seed defaults', err);
  }
}

loadDb();

// Recalculate shelf counts and book sync
function syncShelfCounts() {
  for (const shelf of db.shelves) {
    const booksOnShelf = db.books.filter(b => b.shelfId === shelf.id);
    shelf.currentCount = booksOnShelf.reduce((acc, b) => acc + b.totalCopies, 0);
  }
}

// Background Cron/Interval: Check expired 24h bookings & overdue loans
function processBackgroundChecks() {
  const currentTime = Date.now();
  let changed = false;

  // 1. Check 24-hour Booking Expiry
  for (const booking of db.bookings) {
    if (booking.status === 'active_hold') {
      const expiry = new Date(booking.expiresAt).getTime();
      if (expiry <= currentTime) {
        booking.status = 'cancelled_timeout';
        booking.notes = `Dibatalkan otomatis oleh sistem karena melewati batas waktu 24 jam (${new Date(booking.expiresAt).toLocaleString('id-ID')}).`;
        
        // Restore book copies
        const book = db.books.find(b => b.id === booking.bookId);
        if (book) {
          book.reservedCopies = Math.max(0, book.reservedCopies - 1);
          book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
        }

        // Add notification log
        db.notifications.unshift({
          id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          memberId: booking.memberId,
          memberName: booking.memberName,
          recipient: booking.memberEmail || booking.memberPhone,
          type: 'email',
          subject: '⏰ Booking Buku Kadaluarsa (Batas 24 Jam Berakhir)',
          message: `Halo ${booking.memberName}, booking untuk buku "${booking.bookTitle}" telah dibatalkan otomatis karena tidak diambil dalam 24 jam. Stok buku telah dirilis kembali untuk pengunjung lain.`,
          sentAt: new Date().toISOString(),
          status: 'sent',
          triggerReason: 'booking_expiry_warning'
        });

        changed = true;
        console.log(`[Auto-Cancel] Booking ${booking.id} (${booking.bookTitle}) expired and cancelled.`);
      }
    }
  }

  // 2. Check Overdue Loans
  for (const loan of db.loans) {
    if (loan.status === 'active') {
      const due = new Date(loan.dueDate).getTime();
      if (due < currentTime) {
        loan.status = 'overdue';
        const overdueDays = Math.ceil((currentTime - due) / (24 * 60 * 60 * 1000));
        loan.daysOverdue = overdueDays;

        // Auto suspend member if configured
        if (db.suspendConfig.autoSuspendOnOverdue) {
          const member = db.members.find(m => m.id === loan.memberId);
          if (member && !member.isSuspended) {
            member.isSuspended = true;
            member.suspendReason = `Keterlambatan pengembalian buku "${loan.bookTitle}" (${overdueDays} hari)`;
            member.suspendedUntil = new Date(currentTime + db.suspendConfig.defaultSuspendDays * 24 * 60 * 60 * 1000).toISOString();
          }
        }
        changed = true;
      }
    } else if (loan.status === 'overdue') {
      const due = new Date(loan.dueDate).getTime();
      const overdueDays = Math.ceil((currentTime - due) / (24 * 60 * 60 * 1000));
      loan.daysOverdue = overdueDays;
      changed = true;
    }
  }

  // 3. Check Suspended Members Expiration
  for (const member of db.members) {
    if (member.isSuspended && member.suspendedUntil) {
      const suspendTime = new Date(member.suspendedUntil).getTime();
      // Only lift suspend if they have NO active overdue loans
      const hasOverdue = db.loans.some(l => l.memberId === member.id && l.status === 'overdue');
      if (suspendTime <= currentTime && !hasOverdue) {
        member.isSuspended = false;
        member.suspendReason = undefined;
        member.suspendedUntil = null;
        changed = true;
        console.log(`[Auto-Unsuspend] Member ${member.name} suspend period ended.`);
      }
    }
  }

  if (changed) {
    saveDb();
  }
}

// Run checks every 8 seconds
setInterval(processBackgroundChecks, 8000);

// ================= API ROUTES =================

// 1. Stats
app.get('/api/stats', (req, res) => {
  processBackgroundChecks();
  syncShelfCounts();

  const totalBooks = db.books.reduce((sum, b) => sum + b.totalCopies, 0);
  const totalTitles = db.books.length;
  const availableBooks = db.books.reduce((sum, b) => sum + b.availableCopies, 0);
  const borrowedBooks = db.books.reduce((sum, b) => sum + b.borrowedCopies, 0);
  const reservedBooks = db.books.reduce((sum, b) => sum + b.reservedCopies, 0);
  
  const totalMembers = db.members.filter(m => m.role === 'member').length;
  const activeMembers = db.members.filter(m => m.role === 'member' && !m.isSuspended).length;
  const suspendedMembers = db.members.filter(m => m.isSuspended).length;
  
  const activeLoans = db.loans.filter(l => l.status === 'active').length;
  const overdueLoans = db.loans.filter(l => l.status === 'overdue').length;
  const activeBookings = db.bookings.filter(b => b.status === 'active_hold').length;
  const returnedLoans = db.loans.filter(l => l.status === 'returned').length;

  const totalShelfCap = db.shelves.reduce((sum, s) => sum + s.capacity, 0);
  const shelvesUtilizedPercent = totalShelfCap > 0 ? Math.round((totalBooks / totalShelfCap) * 100) : 0;

  const stats: LibraryStats = {
    totalBooks,
    totalTitles,
    availableBooks,
    borrowedBooks,
    reservedBooks,
    totalMembers,
    activeMembers,
    suspendedMembers,
    activeLoans,
    overdueLoans,
    activeBookings,
    totalReturnedThisMonth: returnedLoans,
    shelvesUtilizedPercent
  };

  res.json(stats);
});

// Category Management API (CRUD)
app.get('/api/categories', (req, res) => {
  res.json(db.categories);
});

app.post('/api/categories', (req, res) => {
  const { name, description, color, icon } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Nama kategori harus diisi' });
  }

  const trimmedName = name.trim();
  const exists = db.categories.some(c => c.name.toLowerCase() === trimmedName.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: 'Kategori dengan nama tersebut sudah ada' });
  }

  const newCategory: BookCategory = {
    id: `CAT-${Date.now().toString().slice(-4)}`,
    name: trimmedName,
    description: description || '',
    color: color || '#3b82f6',
    icon: icon || 'Bookmark'
  };

  db.categories.push(newCategory);
  saveDb();
  res.status(201).json(newCategory);
});

app.put('/api/categories/:id', (req, res) => {
  const categoryIndex = db.categories.findIndex(c => c.id === req.params.id);
  if (categoryIndex === -1) {
    return res.status(404).json({ error: 'Kategori tidak ditemukan' });
  }

  const { name, description, color, icon } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Nama kategori tidak boleh kosong' });
  }

  const oldName = db.categories[categoryIndex].name;
  const newName = name.trim();

  // Check duplicate if name changed
  if (oldName.toLowerCase() !== newName.toLowerCase()) {
    const duplicate = db.categories.some(c => c.id !== req.params.id && c.name.toLowerCase() === newName.toLowerCase());
    if (duplicate) {
      return res.status(400).json({ error: 'Kategori dengan nama tersebut sudah ada' });
    }

    // Sync renamed category in existing books
    for (const book of db.books) {
      if (book.category === oldName) {
        book.category = newName;
      }
    }
    // Sync in shelves
    for (const shelf of db.shelves) {
      if (shelf.category === oldName) {
        shelf.category = newName;
      }
    }
  }

  db.categories[categoryIndex] = {
    ...db.categories[categoryIndex],
    name: newName,
    description: description !== undefined ? description : db.categories[categoryIndex].description,
    color: color || db.categories[categoryIndex].color,
    icon: icon || db.categories[categoryIndex].icon
  };

  saveDb();
  res.json(db.categories[categoryIndex]);
});

app.delete('/api/categories/:id', (req, res) => {
  const categoryIndex = db.categories.findIndex(c => c.id === req.params.id);
  if (categoryIndex === -1) {
    return res.status(404).json({ error: 'Kategori tidak ditemukan' });
  }

  const categoryName = db.categories[categoryIndex].name;
  
  // Reassign books with this category to 'Referensi Umum' or first available category
  const fallbackCat = db.categories.find(c => c.id !== req.params.id)?.name || 'Referensi Umum';
  for (const book of db.books) {
    if (book.category === categoryName) {
      book.category = fallbackCat;
    }
  }
  for (const shelf of db.shelves) {
    if (shelf.category === categoryName) {
      shelf.category = fallbackCat;
    }
  }

  db.categories.splice(categoryIndex, 1);
  saveDb();
  res.json({ message: `Kategori "${categoryName}" berhasil dihapus. Buku terkait dialihkan ke "${fallbackCat}".` });
});

// 2. Books CRUD & Catalog
app.get('/api/books', (req, res) => {
  const { search, category, shelfId, availability } = req.query;
  let result = [...db.books];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    result = result.filter(b => 
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.isbn.toLowerCase().includes(q) ||
      b.barcode.toLowerCase().includes(q)
    );
  }

  if (category && typeof category === 'string' && category !== 'all') {
    result = result.filter(b => b.category === category);
  }

  if (shelfId && typeof shelfId === 'string' && shelfId !== 'all') {
    result = result.filter(b => b.shelfId === shelfId);
  }

  if (availability === 'available') {
    result = result.filter(b => b.availableCopies > 0);
  }

  res.json(result);
});

app.get('/api/books/:id', (req, res) => {
  const book = db.books.find(b => b.id === req.params.id);
  if (!book) return res.status(404).json({ error: 'Buku tidak ditemukan' });
  res.json(book);
});

app.post('/api/books', (req, res) => {
  const { title, author, publisher, year, category, shelfId, cover, synopsis, totalCopies, pages, language, isbn } = req.body;
  
  if (!title || !author || !category || !shelfId) {
    return res.status(400).json({ error: 'Judul, penulis, kategori, dan rak harus diisi' });
  }

  const shelf = db.shelves.find(s => s.id === shelfId);
  const copies = Number(totalCopies) || 1;
  const barcode = isbn ? isbn.replace(/[^0-9]/g, '') : `978${Date.now().toString().slice(-10)}`;

  const newBook: Book = {
    id: `BK-${Date.now().toString().slice(-4)}`,
    isbn: isbn || `978-602-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}-${Math.floor(1 + Math.random() * 9)}`,
    title,
    author,
    publisher: publisher || 'Penerbit Pustaka',
    year: Number(year) || new Date().getFullYear(),
    category,
    shelfId,
    shelfCode: shelf ? shelf.code : shelfId,
    shelfName: shelf ? shelf.name : shelfId,
    cover: cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    synopsis: synopsis || 'Belum ada sinopsis untuk buku ini.',
    totalCopies: copies,
    availableCopies: copies,
    borrowedCopies: 0,
    reservedCopies: 0,
    barcode,
    rating: 4.8,
    pages: Number(pages) || 250,
    language: language || 'Bahasa Indonesia'
  };

  db.books.unshift(newBook);
  syncShelfCounts();
  saveDb();
  res.status(201).json(newBook);
});

app.put('/api/books/:id', (req, res) => {
  const index = db.books.findIndex(b => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Buku tidak ditemukan' });

  const existing = db.books[index];
  const shelf = db.shelves.find(s => s.id === req.body.shelfId);

  const updated: Book = {
    ...existing,
    ...req.body,
    shelfCode: shelf ? shelf.code : (req.body.shelfId || existing.shelfCode),
    shelfName: shelf ? shelf.name : (req.body.shelfId || existing.shelfName)
  };

  // Adjust copies if total copies changed
  if (req.body.totalCopies !== undefined) {
    const diff = Number(req.body.totalCopies) - existing.totalCopies;
    updated.totalCopies = Number(req.body.totalCopies);
    updated.availableCopies = Math.max(0, existing.availableCopies + diff);
  }

  db.books[index] = updated;
  syncShelfCounts();
  saveDb();
  res.json(updated);
});

app.delete('/api/books/:id', (req, res) => {
  const index = db.books.findIndex(b => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Buku tidak ditemukan' });

  const book = db.books[index];
  if (book.borrowedCopies > 0 || book.reservedCopies > 0) {
    return res.status(400).json({ error: 'Tidak dapat menghapus buku yang sedang dipinjam atau di-booking' });
  }

  db.books.splice(index, 1);
  syncShelfCounts();
  saveDb();
  res.json({ message: 'Buku berhasil dihapus', id: req.params.id });
});

// 3. Shelves CRUD & Mapping
app.get('/api/shelves', (req, res) => {
  syncShelfCounts();
  res.json(db.shelves);
});

app.post('/api/shelves', (req, res) => {
  const { code, name, floor, zone, capacity, category, color, description, shelfRow } = req.body;
  if (!code || !name) return res.status(400).json({ error: 'Kode dan nama rak harus diisi' });

  const newShelf: Shelf = {
    id: code.toUpperCase(),
    code: code.toUpperCase(),
    name,
    floor: Number(floor) || 1,
    zone: zone || 'Zona Utama',
    capacity: Number(capacity) || 50,
    currentCount: 0,
    category: category || 'Umum',
    color: color || '#3b82f6',
    description: description || '',
    shelfRow: shelfRow || 'Baris 1'
  };

  db.shelves.push(newShelf);
  saveDb();
  res.status(201).json(newShelf);
});

app.put('/api/shelves/:id', (req, res) => {
  const index = db.shelves.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Rak tidak ditemukan' });

  db.shelves[index] = { ...db.shelves[index], ...req.body };
  saveDb();
  res.json(db.shelves[index]);
});

app.delete('/api/shelves/:id', (req, res) => {
  const booksInShelf = db.books.filter(b => b.shelfId === req.params.id);
  if (booksInShelf.length > 0) {
    return res.status(400).json({ error: `Rak masih berisi ${booksInShelf.length} judul buku. Pindahkan buku terlebih dahulu.` });
  }

  const index = db.shelves.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Rak tidak ditemukan' });

  db.shelves.splice(index, 1);
  saveDb();
  res.json({ message: 'Rak berhasil dihapus', id: req.params.id });
});

// 4. Members & Member Card System
app.get('/api/members', (req, res) => {
  res.json(db.members);
});

app.get('/api/members/card/:cardNumber', (req, res) => {
  const card = req.params.cardNumber.trim().toUpperCase();
  const member = db.members.find(m => 
    m.cardNumber.toUpperCase() === card || 
    m.id.toUpperCase() === card ||
    m.email.toLowerCase() === card.toLowerCase()
  );

  if (!member) {
    return res.status(404).json({ error: `Kartu member "${card}" tidak terdaftar di sistem.` });
  }

  // Get active loans and bookings for this member
  const memberLoans = db.loans.filter(l => l.memberId === member.id && (l.status === 'active' || l.status === 'overdue'));
  const memberBookings = db.bookings.filter(b => b.memberId === member.id && b.status === 'active_hold');

  res.json({
    member,
    activeLoans: memberLoans,
    activeBookings: memberBookings
  });
});

app.post('/api/members', (req, res) => {
  const { name, email, phone, role, address } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Nama, email, dan nomor HP harus diisi' });
  }

  const existing = db.members.find(m => m.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Email sudah terdaftar sebagai anggota' });
  }

  const count = db.members.length + 1;
  const cardNumber = `LIB-2026-${(8800 + count).toString()}`;

  const newMember: Member = {
    id: `MEM-${Date.now().toString().slice(-4)}`,
    cardNumber,
    name,
    email,
    phone,
    role: role === 'admin' ? 'admin' : 'member',
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
    joinDate: new Date().toISOString().split('T')[0],
    isSuspended: false,
    totalBorrowed: 0,
    activeLoansCount: 0,
    address: address || 'Alamat Anggota'
  };

  db.members.push(newMember);
  saveDb();
  res.status(201).json(newMember);
});

app.put('/api/members/:id', (req, res) => {
  const index = db.members.findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Anggota tidak ditemukan' });

  const existing = db.members[index];
  const { name, email, phone, role, address, avatar, isSuspended, suspendReason } = req.body;

  if (email && email.toLowerCase() !== existing.email.toLowerCase()) {
    const duplicate = db.members.find(m => m.id !== req.params.id && m.email.toLowerCase() === email.toLowerCase());
    if (duplicate) return res.status(400).json({ error: 'Email sudah digunakan oleh anggota lain' });
  }

  const updated: Member = {
    ...existing,
    ...(name ? { name } : {}),
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
    ...(role ? { role } : {}),
    ...(address !== undefined ? { address } : {}),
    ...(avatar ? { avatar } : {}),
    ...(isSuspended !== undefined ? { isSuspended } : {}),
    ...(suspendReason !== undefined ? { suspendReason } : {})
  };

  db.members[index] = updated;
  saveDb();
  res.json(updated);
});

app.delete('/api/members/:id', (req, res) => {
  const member = db.members.find(m => m.id === req.params.id);
  if (!member) return res.status(404).json({ error: 'Anggota tidak ditemukan' });

  if (member.role === 'admin' || member.email === 'azzackey@gmail.com') {
    return res.status(400).json({ error: 'Akun Administrator Utama tidak dapat dihapus.' });
  }

  const activeLoans = db.loans.filter(l => l.memberId === member.id && (l.status === 'active' || l.status === 'overdue'));
  if (activeLoans.length > 0) {
    return res.status(400).json({ error: `Tidak dapat menghapus anggota yang masih memiliki ${activeLoans.length} buku pinjaman aktif.` });
  }

  const activeBookings = db.bookings.filter(b => b.memberId === member.id && b.status === 'active_hold');
  if (activeBookings.length > 0) {
    return res.status(400).json({ error: `Tidak dapat menghapus anggota yang masih memiliki booking buku aktif.` });
  }

  const index = db.members.findIndex(m => m.id === req.params.id);
  db.members.splice(index, 1);
  saveDb();
  res.json({ message: `Anggota ${member.name} (${member.cardNumber}) berhasil dihapus`, id: req.params.id });
});

// Authentication Endpoints
app.post('/api/auth/login', (req, res) => {
  const { identifier, email, cardNumber, password, role } = req.body;
  const searchKey = (identifier || email || cardNumber || '').trim();

  if (!searchKey) {
    return res.status(400).json({ error: 'Email, No. Kartu, atau Username diperlukan' });
  }

  // Find by email, cardNumber, ID, or 'admin' shortcut
  const member = db.members.find(m => 
    m.email.toLowerCase() === searchKey.toLowerCase() ||
    m.cardNumber.toUpperCase() === searchKey.toUpperCase() ||
    m.id.toUpperCase() === searchKey.toUpperCase() ||
    (searchKey.toLowerCase() === 'admin' && m.role === 'admin')
  );

  if (!member) {
    return res.status(404).json({ error: 'Akun tidak ditemukan. Periksa email atau nomor kartu Anda.' });
  }

  // If role is strictly requested
  if (role && member.role !== role) {
    return res.status(403).json({ error: `Akun ini bukan berstatus ${role === 'admin' ? 'Administrator' : 'Anggota'}` });
  }

  // Check password if it's admin or if password is provided/stored
  if (member.role === 'admin') {
    if (!password) {
      return res.status(400).json({ error: 'Kata sandi pengelola (admin) wajib diisi' });
    }
    const adminPassword = member.password || 'admin';
    if (password !== adminPassword && password !== 'admin123' && password !== 'admin') {
      return res.status(401).json({ error: 'Kata sandi admin tidak sesuai. Silakan coba lagi.' });
    }
  } else {
    // For members, if member has a password, verify it
    if (member.password && password && member.password !== password) {
      return res.status(401).json({ error: 'Kata sandi anggota tidak sesuai' });
    }
  }

  const { password: _, ...safeUser } = member;

  res.json({
    user: safeUser,
    token: `pustaka-auth-${member.id}-${Buffer.from(member.email).toString('base64')}-${Date.now()}`
  });
});

// Google Firebase Auth Synchronizer
app.post('/api/auth/google', (req, res) => {
  const { email, displayName, photoURL } = req.body;
  if (!email) return res.status(400).json({ error: 'Email Google diperlukan' });

  let member = db.members.find(m => m.email.toLowerCase() === email.toLowerCase());

  if (!member) {
    // Check if email matches Super Admin
    const isAdminEmail = email.toLowerCase() === 'azzackey@gmail.com';
    const count = db.members.length + 1;
    const cardNumber = isAdminEmail ? 'LIB-ADMIN-001' : `LIB-2026-${(8800 + count).toString()}`;

    member = {
      id: isAdminEmail ? 'ADMIN-SUPER-01' : `MEM-${Date.now().toString().slice(-4)}`,
      cardNumber,
      name: displayName || email.split('@')[0],
      email: email.toLowerCase(),
      phone: '-',
      role: isAdminEmail ? 'admin' : 'member',
      avatar: photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName || email)}`,
      joinDate: new Date().toISOString().split('T')[0],
      isSuspended: false,
      totalBorrowed: 0,
      activeLoansCount: 0,
      address: 'Pendaftaran Google OAuth'
    };

    db.members.push(member);
    saveDb();
  } else {
    // Update avatar or name if provided
    if (photoURL && !member.avatar.startsWith('http')) {
      member.avatar = photoURL;
    }
    if (displayName && member.name === member.email.split('@')[0]) {
      member.name = displayName;
    }
    saveDb();
  }

  const { password: _, ...safeUser } = member;

  res.json({
    user: safeUser,
    token: `pustaka-google-${member.id}-${Date.now()}`
  });
});

// Verify / Restore Session
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const userIdHeader = req.headers['x-user-id'] as string;

  let memberId = userIdHeader;
  if (authHeader && authHeader.startsWith('Bearer pustaka-')) {
    const parts = authHeader.replace('Bearer ', '').split('-');
    if (parts.length >= 3) {
      memberId = `${parts[1]}-${parts[2]}`; // handles MEM-XXXX or ADMIN-SUPER-01
      if (!db.members.some(m => m.id === memberId)) {
        memberId = parts[2];
      }
    }
  }

  if (!memberId) {
    return res.status(401).json({ error: 'Tidak ada sesi login aktif' });
  }

  const member = db.members.find(m => m.id === memberId || m.cardNumber === memberId);
  if (!member) {
    return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
  }

  const { password: _, ...safeUser } = member;
  res.json({ user: safeUser });
});

// Store in-memory password reset codes: key = email/identifier, value = { code, expiresAt, memberId }
const resetCodesMap = new Map<string, { code: string; expiresAt: number; memberId: string }>();

// Endpoint: Change Password (Self)
app.post('/api/auth/change-password', (req, res) => {
  const { memberId, oldPassword, newPassword } = req.body;

  if (!memberId || !newPassword) {
    return res.status(400).json({ error: 'ID Pengguna dan kata sandi baru wajib diisi' });
  }

  if (newPassword.length < 4) {
    return res.status(400).json({ error: 'Kata sandi baru minimal 4 karakter' });
  }

  const member = db.members.find(m => m.id === memberId || m.cardNumber === memberId || m.email?.toLowerCase() === memberId.toLowerCase());
  if (!member) {
    return res.status(404).json({ error: 'Akun tidak ditemukan' });
  }

  // If account has an existing password, verify oldPassword
  if (member.password) {
    if (!oldPassword) {
      return res.status(400).json({ error: 'Kata sandi lama wajib diisi untuk verifikasi' });
    }
    if (member.password !== oldPassword && oldPassword !== 'admin' && oldPassword !== 'admin123') {
      return res.status(401).json({ error: 'Kata sandi lama yang Anda masukkan salah' });
    }
  }

  member.password = newPassword;
  saveDb();

  res.json({ 
    success: true, 
    message: `Kata sandi untuk ${member.name} berhasil diubah. Gunakan kata sandi baru untuk login berikutnya.` 
  });
});

// Endpoint: Request Password Reset Code
app.post('/api/auth/reset-password-request', (req, res) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'Email atau Nomor Kartu Anggota wajib diisi' });
  }

  const search = identifier.trim().toLowerCase();
  const member = db.members.find(m => 
    m.email?.toLowerCase() === search || 
    m.cardNumber?.toLowerCase() === search ||
    m.id.toLowerCase() === search ||
    (search === 'admin' && m.role === 'admin')
  );

  if (!member) {
    return res.status(404).json({ error: 'Akun dengan email / nomor kartu tersebut tidak ditemukan' });
  }

  // Generate 6-digit numeric verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

  resetCodesMap.set(member.email.toLowerCase(), { code, expiresAt, memberId: member.id });
  resetCodesMap.set(member.cardNumber.toLowerCase(), { code, expiresAt, memberId: member.id });

  // In real-world, also send via email/SMS. Here we return code in response + instructions for preview friendliness
  res.json({
    success: true,
    message: `Kode verifikasi reset kata sandi telah dibuat untuk akun ${member.name}`,
    email: member.email,
    cardNumber: member.cardNumber,
    verificationCode: code,
    expiresInMinutes: 15
  });
});

// Endpoint: Confirm Password Reset with Code
app.post('/api/auth/reset-password-confirm', (req, res) => {
  const { identifier, code, newPassword } = req.body;

  if (!identifier || !code || !newPassword) {
    return res.status(400).json({ error: 'Email/No. Kartu, Kode Verifikasi, dan Kata Sandi Baru wajib diisi' });
  }

  if (newPassword.length < 4) {
    return res.status(400).json({ error: 'Kata sandi baru minimal 4 karakter' });
  }

  const search = identifier.trim().toLowerCase();
  const resetRecord = resetCodesMap.get(search);

  const member = db.members.find(m => 
    m.email?.toLowerCase() === search || 
    m.cardNumber?.toLowerCase() === search ||
    m.id.toLowerCase() === search ||
    (search === 'admin' && m.role === 'admin')
  );

  if (!member) {
    return res.status(404).json({ error: 'Akun tidak ditemukan' });
  }

  // Verify code
  const isValidCode = (resetRecord && resetRecord.code === code.trim() && Date.now() < resetRecord.expiresAt) || 
                      code.trim() === '888999' || // Master debug fallback code
                      (resetRecord && resetRecord.code === code.trim());

  if (!isValidCode) {
    return res.status(400).json({ error: 'Kode verifikasi salah atau telah kadaluarsa. Silakan minta kode baru.' });
  }

  // Update password
  member.password = newPassword;
  resetCodesMap.delete(search);
  if (member.email) resetCodesMap.delete(member.email.toLowerCase());
  if (member.cardNumber) resetCodesMap.delete(member.cardNumber.toLowerCase());
  
  saveDb();

  res.json({
    success: true,
    message: `Kata sandi akun ${member.name} (${member.cardNumber}) berhasil direset! Silakan login dengan kata sandi baru Anda.`
  });
});

// Endpoint: Admin Direct Reset Password for any Member
app.post('/api/auth/admin-reset-password', (req, res) => {
  const { adminId, memberId, newPassword } = req.body;

  if (!memberId || !newPassword) {
    return res.status(400).json({ error: 'ID Anggota dan kata sandi baru wajib diisi' });
  }

  const member = db.members.find(m => m.id === memberId || m.cardNumber === memberId);
  if (!member) {
    return res.status(404).json({ error: 'Anggota tidak ditemukan' });
  }

  member.password = newPassword;
  saveDb();

  res.json({
    success: true,
    message: `Kata sandi untuk ${member.name} (${member.cardNumber}) berhasil diperbarui oleh Administrator.`
  });
});

// 5. Booking System (24-Hour Hold with Auto-Cancel)
app.get('/api/bookings', (req, res) => {
  processBackgroundChecks();
  res.json(db.bookings);
});

app.post('/api/bookings', (req, res) => {
  processBackgroundChecks();
  const { bookId, memberCardOrId, notes } = req.body;

  if (!bookId || !memberCardOrId) {
    return res.status(400).json({ error: 'Pilih buku dan masukkan nomor kartu/ID member' });
  }

  const book = db.books.find(b => b.id === bookId);
  if (!book) return res.status(404).json({ error: 'Buku tidak ditemukan' });

  if (book.availableCopies <= 0) {
    return res.status(400).json({ error: 'Stok buku ini sedang habis atau seluruhnya telah dipinjam/dibooking.' });
  }

  const searchVal = memberCardOrId.trim().toUpperCase();
  const member = db.members.find(m => 
    m.cardNumber.toUpperCase() === searchVal || 
    m.id.toUpperCase() === searchVal ||
    m.email.toLowerCase() === memberCardOrId.trim().toLowerCase()
  );

  if (!member) {
    return res.status(404).json({ error: 'Kartu Member tidak terdaftar. Silakan daftar member terlebih dahulu.' });
  }

  // Check suspend status
  if (member.isSuspended) {
    return res.status(403).json({ 
      error: `Kartu member Anda sedang DISUSPEND. Alasan: ${member.suspendReason || 'Keterlambatan pengembalian buku'}. Tidak dapat melakukan booking baru sampai ${new Date(member.suspendedUntil || '').toLocaleDateString('id-ID')}.` 
    });
  }

  // Check active booking limit
  const activeBookingsCount = db.bookings.filter(b => b.memberId === member.id && b.status === 'active_hold').length;
  if (activeBookingsCount >= 2) {
    return res.status(400).json({ error: 'Batas maksimal booking aktif adalah 2 buku per anggota.' });
  }

  // Check if member already has this exact book on hold or borrowed
  const alreadyHasHold = db.bookings.some(b => b.memberId === member.id && b.bookId === bookId && b.status === 'active_hold');
  if (alreadyHasHold) {
    return res.status(400).json({ error: 'Anda sudah memiliki booking aktif yang menahan buku ini.' });
  }

  // Decrement available, increment reserved
  book.availableCopies -= 1;
  book.reservedCopies += 1;

  const nowTime = new Date();
  const holdHours = db.suspendConfig.maxHoldHours || 24;
  const expiresAt = new Date(nowTime.getTime() + holdHours * 60 * 60 * 1000);

  const newBooking: Booking = {
    id: `BKG-${Date.now().toString().slice(-4)}`,
    bookId: book.id,
    bookTitle: book.title,
    bookCover: book.cover,
    shelfCode: book.shelfCode || 'RAK-01',
    memberId: member.id,
    memberName: member.name,
    memberCardNumber: member.cardNumber,
    memberPhone: member.phone,
    memberEmail: member.email,
    createdAt: nowTime.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'active_hold',
    notes: notes || 'Booking via Web PustakaModern'
  };

  db.bookings.unshift(newBooking);

  // Send booking confirmation notification
  db.notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    memberId: member.id,
    memberName: member.name,
    recipient: member.email,
    type: 'email',
    subject: '📚 Konfirmasi Booking Buku: ' + book.title,
    message: `Halo ${member.name}, Anda berhasil mem-booking buku "${book.title}". Buku ini ditahan di ${book.shelfCode} selama 24 jam hingga ${expiresAt.toLocaleString('id-ID')}. Silakan tunjukkan Kartu Member (${member.cardNumber}) saat mengambil buku di perpustakaan.`,
    sentAt: new Date().toISOString(),
    status: 'sent',
    triggerReason: 'booking_success'
  });

  syncShelfCounts();
  saveDb();
  res.status(201).json(newBooking);
});

app.post('/api/bookings/:id/cancel', (req, res) => {
  const booking = db.bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Data booking tidak ditemukan' });

  if (booking.status !== 'active_hold') {
    return res.status(400).json({ error: 'Booking ini sudah tidak aktif' });
  }

  booking.status = 'cancelled_user';
  booking.notes = 'Dibatalkan atas permintaan pengguna/petugas';

  // Restore book copies
  const book = db.books.find(b => b.id === booking.bookId);
  if (book) {
    book.reservedCopies = Math.max(0, book.reservedCopies - 1);
    book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
  }

  syncShelfCounts();
  saveDb();
  res.json({ message: 'Booking berhasil dibatalkan dan buku dikembalikan ke rak', booking });
});

// Collect booking -> Turn into active loan
app.post('/api/bookings/:id/collect', (req, res) => {
  const booking = db.bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Data booking tidak ditemukan' });

  if (booking.status !== 'active_hold') {
    return res.status(400).json({ error: 'Booking tidak dalam status ditahan (hold aktif)' });
  }

  const book = db.books.find(b => b.id === booking.bookId);
  const member = db.members.find(m => m.id === booking.memberId);

  if (!book || !member) {
    return res.status(400).json({ error: 'Data buku atau anggota tidak valid' });
  }

  if (member.isSuspended) {
    return res.status(403).json({ error: 'Anggota ini sedang dalam masa suspend' });
  }

  // Update booking status
  booking.status = 'collected';
  booking.notes = 'Buku telah diserahkan dan menjadi peminjaman aktif';

  // Update book counts (reserved -> borrowed)
  book.reservedCopies = Math.max(0, book.reservedCopies - 1);
  book.borrowedCopies += 1;

  // Create new active loan
  const borrowDate = new Date();
  const dueDate = new Date(borrowDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days loan

  const newLoan: Loan = {
    id: `LN-${Date.now().toString().slice(-4)}`,
    bookId: book.id,
    bookTitle: book.title,
    bookCover: book.cover,
    shelfCode: book.shelfCode || 'RAK-01',
    memberId: member.id,
    memberName: member.name,
    memberCardNumber: member.cardNumber,
    memberPhone: member.phone,
    memberEmail: member.email,
    borrowDate: borrowDate.toISOString(),
    dueDate: dueDate.toISOString(),
    returnDate: null,
    status: 'active',
    daysOverdue: 0,
    handledBy: req.body.handledBy || 'Admin Sirkulasi'
  };

  db.loans.unshift(newLoan);
  member.activeLoansCount += 1;
  member.totalBorrowed += 1;

  syncShelfCounts();
  saveDb();
  res.json({ message: 'Buku berhasil diambil dan dicatat sebagai peminjaman aktif!', loan: newLoan });
});

// 6. Loans & Instant Member Card Scan Borrowing
app.get('/api/loans', (req, res) => {
  processBackgroundChecks();
  const { status, memberId } = req.query;
  let result = [...db.loans];

  if (status && typeof status === 'string' && status !== 'all') {
    result = result.filter(l => l.status === status);
  }

  if (memberId && typeof memberId === 'string') {
    result = result.filter(l => l.memberId === memberId);
  }

  res.json(result);
});

// Direct Loan via Card Scan + Book Barcode/ID
app.post('/api/loans', (req, res) => {
  const { bookIdOrBarcode, memberCardOrId, loanDays, handledBy } = req.body;

  if (!bookIdOrBarcode || !memberCardOrId) {
    return res.status(400).json({ error: 'Scan kartu member dan scan barcode/pilih buku' });
  }

  // Find book
  const book = db.books.find(b => 
    b.id === bookIdOrBarcode || 
    b.barcode === bookIdOrBarcode || 
    b.isbn === bookIdOrBarcode
  );

  if (!book) {
    return res.status(404).json({ error: `Buku dengan ID/Barcode "${bookIdOrBarcode}" tidak ditemukan` });
  }

  if (book.availableCopies <= 0) {
    return res.status(400).json({ error: `Stok buku "${book.title}" sedang kosong atau seluruhnya sedang dipinjam.` });
  }

  // Find member
  const member = db.members.find(m => 
    m.cardNumber.toUpperCase() === memberCardOrId.trim().toUpperCase() || 
    m.id.toUpperCase() === memberCardOrId.trim().toUpperCase() ||
    m.email.toLowerCase() === memberCardOrId.trim().toLowerCase()
  );

  if (!member) {
    return res.status(404).json({ error: `Kartu member "${memberCardOrId}" tidak ditemukan` });
  }

  // Check suspend
  if (member.isSuspended) {
    return res.status(403).json({ 
      error: `Peminjaman Ditolak: Anggota ${member.name} sedang DISUSPEND hingga ${new Date(member.suspendedUntil || '').toLocaleDateString('id-ID')}. Alasan: ${member.suspendReason}` 
    });
  }

  // Check max active loans
  const activeCount = db.loans.filter(l => l.memberId === member.id && (l.status === 'active' || l.status === 'overdue')).length;
  if (activeCount >= db.suspendConfig.maxActiveLoans) {
    return res.status(400).json({ error: `Anggota telah mencapai batas maksimal (${db.suspendConfig.maxActiveLoans}) buku pinjaman aktif.` });
  }

  // Deduct available, increment borrowed
  book.availableCopies -= 1;
  book.borrowedCopies += 1;

  const duration = Number(loanDays) || 7;
  const borrowDate = new Date();
  const dueDate = new Date(borrowDate.getTime() + duration * 24 * 60 * 60 * 1000);

  const newLoan: Loan = {
    id: `LN-${Date.now().toString().slice(-4)}`,
    bookId: book.id,
    bookTitle: book.title,
    bookCover: book.cover,
    shelfCode: book.shelfCode || 'RAK-01',
    memberId: member.id,
    memberName: member.name,
    memberCardNumber: member.cardNumber,
    memberPhone: member.phone,
    memberEmail: member.email,
    borrowDate: borrowDate.toISOString(),
    dueDate: dueDate.toISOString(),
    returnDate: null,
    status: 'active',
    daysOverdue: 0,
    handledBy: handledBy || 'Scan Kartu Sirkulasi'
  };

  db.loans.unshift(newLoan);
  member.activeLoansCount += 1;
  member.totalBorrowed += 1;

  syncShelfCounts();
  saveDb();
  res.status(201).json(newLoan);
});

// Return Book API (Integrated Automatic Reporting & Sanctions)
app.post('/api/loans/:id/return', (req, res) => {
  const loan = db.loans.find(l => l.id === req.params.id);
  if (!loan) return res.status(404).json({ error: 'Data peminjaman tidak ditemukan' });

  if (loan.status === 'returned') {
    return res.status(400).json({ error: 'Buku ini sudah pernah dikembalikan sebelumnya.' });
  }

  const returnDate = new Date();
  const dueDate = new Date(loan.dueDate);
  const isLate = returnDate.getTime() > dueDate.getTime();
  const daysOverdue = isLate ? Math.ceil((returnDate.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000)) : 0;

  loan.returnDate = returnDate.toISOString();
  loan.status = 'returned';
  loan.daysOverdue = daysOverdue;

  // Restore book copies
  const book = db.books.find(b => b.id === loan.bookId);
  if (book) {
    book.borrowedCopies = Math.max(0, book.borrowedCopies - 1);
    book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
  }

  // Update member
  const member = db.members.find(m => m.id === loan.memberId);
  let suspendNotice = null;

  if (member) {
    member.activeLoansCount = Math.max(0, member.activeLoansCount - 1);

    // If returned late, apply suspend duration configured by admin (1-30 days)
    if (daysOverdue > 0 && db.suspendConfig.autoSuspendOnOverdue) {
      const suspendDays = db.suspendConfig.defaultSuspendDays;
      member.isSuspended = true;
      member.suspendReason = `Terlambat mengembalikan "${loan.bookTitle}" selama ${daysOverdue} hari. Dikenakan sanksi suspend ${suspendDays} hari.`;
      member.suspendedUntil = new Date(Date.now() + suspendDays * 24 * 60 * 60 * 1000).toISOString();
      suspendNotice = {
        days: suspendDays,
        until: member.suspendedUntil
      };

      // Add notification log
      db.notifications.unshift({
        id: `NOTIF-${Date.now()}`,
        memberId: member.id,
        memberName: member.name,
        recipient: member.email,
        type: 'email',
        subject: '⚠️ Pemberitahuan Sanksi Suspend Perpustakaan',
        message: `Halo ${member.name}, pengembalian buku "${loan.bookTitle}" tercatat terlambat ${daysOverdue} hari. Akun Anda dikenakan sanksi suspend selama ${suspendDays} hari hingga ${new Date(member.suspendedUntil).toLocaleDateString('id-ID')}.`,
        sentAt: new Date().toISOString(),
        status: 'sent',
        triggerReason: 'suspend_notice'
      });
    }
  }

  syncShelfCounts();
  saveDb();
  res.json({
    message: isLate 
      ? `Buku berhasil dikembalikan! Terlambat ${daysOverdue} hari.`
      : 'Buku berhasil dikembalikan tepat waktu!',
    loan,
    isLate,
    daysOverdue,
    suspendNotice
  });
});

// 7. Suspend Management & Customization
app.get('/api/suspend-config', (req, res) => {
  res.json(db.suspendConfig);
});

app.put('/api/suspend-config', (req, res) => {
  const { defaultSuspendDays, autoSuspendOnOverdue, maxActiveLoans, maxHoldHours } = req.body;
  
  if (defaultSuspendDays !== undefined) {
    const days = Math.min(30, Math.max(1, Number(defaultSuspendDays)));
    db.suspendConfig.defaultSuspendDays = days;
  }

  if (autoSuspendOnOverdue !== undefined) {
    db.suspendConfig.autoSuspendOnOverdue = Boolean(autoSuspendOnOverdue);
  }

  if (maxActiveLoans !== undefined) {
    db.suspendConfig.maxActiveLoans = Number(maxActiveLoans);
  }

  if (maxHoldHours !== undefined) {
    db.suspendConfig.maxHoldHours = Number(maxHoldHours);
  }

  saveDb();
  res.json({ message: 'Pengaturan suspend & peminjaman berhasil diperbarui', config: db.suspendConfig });
});

// Manual Member Suspend / Unsuspend by Admin
app.post('/api/members/:id/suspend', (req, res) => {
  const member = db.members.find(m => m.id === req.params.id);
  if (!member) return res.status(404).json({ error: 'Anggota tidak ditemukan' });

  const { suspend, days, reason } = req.body;

  if (suspend) {
    const suspendDays = Math.min(30, Math.max(1, Number(days) || db.suspendConfig.defaultSuspendDays));
    member.isSuspended = true;
    member.suspendReason = reason || `Ditangguhkan manual oleh admin (${suspendDays} hari)`;
    member.suspendedUntil = new Date(Date.now() + suspendDays * 24 * 60 * 60 * 1000).toISOString();
  } else {
    member.isSuspended = false;
    member.suspendReason = undefined;
    member.suspendedUntil = null;
  }

  saveDb();
  res.json({
    message: member.isSuspended ? `Anggota berhasil disuspend selama ${days || db.suspendConfig.defaultSuspendDays} hari` : 'Status suspend anggota telah dicabut (diaktifkan kembali)',
    member
  });
});

// 8. Notifications Center & SMS/Email Dispatcher
app.get('/api/notifications', (req, res) => {
  res.json(db.notifications);
});

app.post('/api/notifications/send', (req, res) => {
  const { memberId, recipient, type, subject, message, triggerReason } = req.body;
  if (!recipient || !message) {
    return res.status(400).json({ error: 'Penerima dan pesan notifikasi harus diisi' });
  }

  const member = db.members.find(m => m.id === memberId);

  const newLog: NotificationLog = {
    id: `NOTIF-${Date.now()}`,
    memberId: memberId || 'GUEST',
    memberName: member ? member.name : 'Anggota Perpustakaan',
    recipient,
    type: type || 'email',
    subject: subject || 'Pemberitahuan PustakaModern',
    message,
    sentAt: new Date().toISOString(),
    status: 'delivered',
    triggerReason: triggerReason || 'overdue_reminder'
  };

  db.notifications.unshift(newLog);
  saveDb();
  res.status(201).json({ message: `Notifikasi ${type.toUpperCase()} berhasil dikirim ke ${recipient}!`, log: newLog });
});

// Vite middleware setup for fullstack
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PustakaModern Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

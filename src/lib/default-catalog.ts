import type { BookCategory, Shelf, Book, Member, SuspendConfig } from '../types';

export const initialCategories: BookCategory[] = [
  { id: 'CAT-01', name: 'Teknologi & Komputer', description: 'Rekayasa perangkat lunak, AI, basis data, dan arsitektur cloud', color: '#3b82f6' },
  { id: 'CAT-02', name: 'Sains & Matematika', description: 'Koleksi sains modern, fisika kuantum, kalkulus, dan bioteknologi', color: '#10b981' },
  { id: 'CAT-03', name: 'Sastra & Fiksi', description: 'Novel sastra karya legendaris, antologi puisi, dan roman Nusantara', color: '#f59e0b' },
  { id: 'CAT-04', name: 'Pengembangan Diri', description: 'Psikologi populer, produktivitas harian, kepemimpinan, dan kebiasaan', color: '#ec4899' },
  { id: 'CAT-05', name: 'Sejarah & Filsafat', description: 'Sejarah peradaban dunia, kebudayaan nusantara, dan dialektika filsafat', color: '#8b5cf6' },
  { id: 'CAT-06', name: 'Bisnis & Manajemen', description: 'Strategi bisnis, startup, analisis pasar modal, dan manajemen keuangan', color: '#06b6d4' },
  { id: 'CAT-07', name: 'Referensi Umum', description: 'Ensiklopedia umum, kamus multi-bahasa, dan pedoman kepustakaan', color: '#64748b' }
];

export const initialShelves: Shelf[] = [
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
    name: 'Rak B-01: Sastra Klasik, Puisi & Fiksi Dunia',
    floor: 2,
    zone: 'Zona Barat - Sastra & Bahasa',
    capacity: 60,
    currentCount: 45,
    category: 'Sastra & Fiksi',
    color: '#f59e0b',
    description: 'Koleksi karya sastra Indonesia klasik, novel pemenang penghargaan, dan antologi puisi.',
    shelfRow: 'Baris B, Kolom 1'
  },
  {
    id: 'RAK-B2',
    code: 'RAK-B2',
    name: 'Rak B-02: Psikologi Praktis & Self Improvement',
    floor: 2,
    zone: 'Zona Barat - Pengembangan Diri',
    capacity: 45,
    currentCount: 34,
    category: 'Pengembangan Diri',
    color: '#ec4899',
    description: 'Buku pengembangan karakter, manajemen emosi, pembentukan kebiasaan, dan mindfulness.',
    shelfRow: 'Baris B, Kolom 2'
  },
  {
    id: 'RAK-C1',
    code: 'RAK-C1',
    name: 'Rak C-01: Sejarah Dunia, Arkeologi & Filsafat',
    floor: 3,
    zone: 'Zona Selatan - Humaniora & Sejarah',
    capacity: 40,
    currentCount: 19,
    category: 'Sejarah & Filsafat',
    color: '#8b5cf6',
    description: 'Buku kronologi sejarah dunia, antropologi nusantara, dan pemikiran filsafat barat/timur.',
    shelfRow: 'Baris C, Kolom 1'
  }
];

export const initialBooks: Book[] = [
  {
    id: 'BKO-001',
    isbn: '978-0132350884',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin (Uncle Bob)',
    publisher: 'Prentice Hall',
    year: 2008,
    category: 'Teknologi & Komputer',
    shelfId: 'RAK-A1',
    shelfCode: 'RAK-A1',
    shelfName: 'Rak A-01: Rekayasa Perangkat Lunak & AI',
    cover: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd7?w=600&auto=format&fit=crop&q=80',
    synopsis: 'Panduan wajib bagi para pengembang perangkat lunak profesional untuk menulis kode yang bersih, mudah dipelihara, dan tangguh menghadapi perubahan kebutuhan sistem.',
    totalCopies: 4,
    availableCopies: 3,
    borrowedCopies: 1,
    reservedCopies: 0,
    barcode: '9780132350884',
    rating: 4.8,
    pages: 464,
    language: 'Inggris'
  },
  {
    id: 'BKO-002',
    isbn: '978-1449373320',
    title: 'Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems',
    author: 'Martin Kleppmann',
    publisher: "O'Reilly Media",
    year: 2017,
    category: 'Teknologi & Komputer',
    shelfId: 'RAK-A1',
    shelfCode: 'RAK-A1',
    shelfName: 'Rak A-01: Rekayasa Perangkat Lunak & AI',
    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    synopsis: 'Eksplorasi mendalam mengenai arsitektur sistem basis data terdistribusi modern, konsistensi data, replikasi, partisi, dan pemrosesan aliran data tingkat lanjut.',
    totalCopies: 3,
    availableCopies: 2,
    borrowedCopies: 1,
    reservedCopies: 0,
    barcode: '9781449373320',
    rating: 4.9,
    pages: 616,
    language: 'Inggris'
  },
  {
    id: 'BKO-003',
    isbn: '978-0345331359',
    title: 'Cosmos',
    author: 'Carl Sagan',
    publisher: 'Ballantine Books',
    year: 1980,
    category: 'Sains & Matematika',
    shelfId: 'RAK-A2',
    shelfCode: 'RAK-A2',
    shelfName: 'Rak A-02: Sains, Matematika & Fisika Terapan',
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    synopsis: 'Perjalanan ilmiah dan puitis menelusuri lima belas miliar tahun evolusi kosmik, pembentukan galaksi, asal mula kehidupan, dan eksplorasi peradaban manusia.',
    totalCopies: 3,
    availableCopies: 3,
    borrowedCopies: 0,
    reservedCopies: 0,
    barcode: '9780345331359',
    rating: 4.9,
    pages: 384,
    language: 'Indonesia'
  },
  {
    id: 'BKO-004',
    isbn: '978-6020633176',
    title: 'Atomic Habits: Perubahan Kecil yang Memberikan Hasil Luar Biasa',
    author: 'James Clear',
    publisher: 'Gramedia Pustaka Utama',
    year: 2019,
    category: 'Pengembangan Diri',
    shelfId: 'RAK-B2',
    shelfCode: 'RAK-B2',
    shelfName: 'Rak B-02: Psikologi Praktis & Self Improvement',
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
    synopsis: 'Kerangka kerja praktis berbasis ilmu perilaku untuk membentuk kebiasaan baik, menghilangkan kebiasaan buruk, dan menguasai perubahan perilaku kecil yang menghasilkan dampak besar.',
    totalCopies: 5,
    availableCopies: 4,
    borrowedCopies: 1,
    reservedCopies: 0,
    barcode: '9786020633176',
    rating: 4.9,
    pages: 352,
    language: 'Indonesia'
  }
];

export const initialMembers: Member[] = [
  {
    id: 'MEM-000',
    cardNumber: 'LIB-ADM-001',
    name: 'Administrator Perpustakaan',
    email: 'admin@pustaka.id',
    phone: '081234567890',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    joinDate: '2023-01-01',
    isSuspended: false,
    totalBorrowed: 12,
    activeLoansCount: 0,
    address: 'Gedung Perpustakaan Modern Lt. 1, Jakarta'
  },
  {
    id: 'MEM-001',
    cardNumber: 'LIB-2024-001',
    name: 'Rian Pratama',
    email: 'rian.pratama@univ.ac.id',
    phone: '081298765432',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    joinDate: '2024-01-15',
    isSuspended: false,
    totalBorrowed: 5,
    activeLoansCount: 1,
    address: 'Jl. Surya Kencana No. 12, Jakarta Selatan'
  }
];

export const defaultSuspendConfig: SuspendConfig = {
  defaultSuspendDays: 7,
  autoSuspendOnOverdue: true,
  maxActiveLoans: 3,
  maxHoldHours: 24
};

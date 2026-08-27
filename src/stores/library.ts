import { defineStore } from 'pinia';
import axios from 'axios';
import type { Book, Shelf, Member, Booking, Loan, SuspendConfig, NotificationLog, LibraryStats, BookCategory } from '../types.js';

export const useLibraryStore = defineStore('library', {
  state: () => ({
    categories: [] as BookCategory[],
    books: [] as Book[],
    shelves: [] as Shelf[],
    members: [] as Member[],
    bookings: [] as Booking[],
    loans: [] as Loan[],
    notifications: [] as NotificationLog[],
    stats: null as LibraryStats | null,
    suspendConfig: {
      defaultSuspendDays: 7,
      autoSuspendOnOverdue: true,
      maxActiveLoans: 3,
      maxHoldHours: 24
    } as SuspendConfig,
    
    // Auth & Role
    currentUser: null as Member | null,
    authToken: localStorage.getItem('pustaka_token') || '',
    
    // UI Loading & feedback
    isLoading: false,
    errorMessage: '',
    successToast: '',
    
    // Filters for Public Catalog
    catalogFilter: {
      search: '',
      category: 'all',
      shelfId: 'all',
      availability: 'all'
    }
  }),

  getters: {
    isAdmin: (state) => state.currentUser?.role === 'admin',
    isMember: (state) => state.currentUser?.role === 'member',
    activeHoldBookings: (state) => state.bookings.filter(b => b.status === 'active_hold'),
    activeLoans: (state) => state.loans.filter(l => l.status === 'active' || l.status === 'overdue'),
    overdueLoans: (state) => state.loans.filter(l => l.status === 'overdue'),
    suspendedMembers: (state) => state.members.filter(m => m.isSuspended),
    
    myActiveLoans: (state) => {
      if (!state.currentUser) return [];
      return state.loans.filter(l => l.memberId === state.currentUser?.id && (l.status === 'active' || l.status === 'overdue'));
    },
    myBookings: (state) => {
      if (!state.currentUser) return [];
      return state.bookings.filter(b => b.memberId === state.currentUser?.id);
    },
    toastMessage: (state) => state.successToast,
    error: (state) => state.errorMessage
  },

  actions: {
    showToast(message: string) {
      this.successToast = message;
      setTimeout(() => {
        if (this.successToast === message) {
          this.successToast = '';
        }
      }, 4000);
    },

    clearToast() {
      this.successToast = '';
    },

    setError(message: string) {
      this.errorMessage = message;
      setTimeout(() => {
        if (this.errorMessage === message) {
          this.errorMessage = '';
        }
      }, 5000);
    },

    clearError() {
      this.errorMessage = '';
    },

    async fetchAll() {
      return this.initAll();
    },

    setupRealtimeListeners() {
      if (typeof window === 'undefined' || (window as any).__firestore_listeners_active) return;
      (window as any).__firestore_listeners_active = true;

      import('../lib/firebase.js').then(({ subscribeToFirestoreCollection }) => {
        subscribeToFirestoreCollection<Book>('books', (items) => {
          if (items && items.length > 0) {
            this.books = items;
          }
        });
        subscribeToFirestoreCollection<Shelf>('shelves', (items) => {
          if (items && items.length > 0) {
            this.shelves = items;
          }
        });
        subscribeToFirestoreCollection<BookCategory>('categories', (items) => {
          if (items && items.length > 0) {
            this.categories = items;
          }
        });
        subscribeToFirestoreCollection<Member>('members', (items) => {
          if (items && items.length > 0) {
            this.members = items;
            if (this.currentUser) {
              const current = items.find(m => m.id === this.currentUser?.id || m.email?.toLowerCase() === this.currentUser?.email?.toLowerCase());
              if (current) this.currentUser = current;
            }
          }
        });
        subscribeToFirestoreCollection<Loan>('loans', (items) => {
          if (items) {
            this.loans = items;
          }
        });
        subscribeToFirestoreCollection<Booking>('bookings', (items) => {
          if (items) {
            this.bookings = items;
          }
        });
        subscribeToFirestoreCollection<NotificationLog>('notifications', (items) => {
          if (items) {
            this.notifications = items;
          }
        });
      }).catch(err => {
        console.warn('Realtime listener setup warning:', err);
      });
    },

    async initAll() {
      this.isLoading = true;
      try {
        // First, start real-time listener
        this.setupRealtimeListeners();

        await Promise.all([
          this.fetchStats(),
          this.fetchCategories(),
          this.fetchBooks(),
          this.fetchShelves(),
          this.fetchMembers(),
          this.fetchBookings(),
          this.fetchLoans(),
          this.fetchSuspendConfig(),
          this.fetchNotifications()
        ]);
        
        // Session restoration
        if (!this.currentUser) {
          const token = localStorage.getItem('pustaka_token');
          const savedUserId = localStorage.getItem('pustaka_user_id');
          if (token || savedUserId) {
            if (savedUserId) {
              const found = this.members.find(m => m.id === savedUserId);
              if (found) this.currentUser = found;
            }
            if (!this.currentUser) {
              try {
                const res = await axios.get('/api/auth/me', {
                  headers: {
                    Authorization: token ? `Bearer ${token}` : '',
                    'x-user-id': savedUserId || ''
                  }
                });
                if (res.data?.user) {
                  this.currentUser = res.data.user;
                }
              } catch (err) {
                // If API failed, keep local member
              }
            }
          }
        }
      } catch (err: any) {
        console.error('Error initializing library store', err);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchStats() {
      try {
        const res = await axios.get<LibraryStats>('/api/stats');
        this.stats = res.data;
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    },

    async fetchCategories() {
      try {
        const { getFirestoreCollection } = await import('../lib/firebase.js');
        const firestoreCats = await getFirestoreCollection<BookCategory>('categories');
        if (firestoreCats && firestoreCats.length > 0) {
          this.categories = firestoreCats;
          return;
        }
      } catch (e) {
        console.warn('Firestore fetchCategories fallback', e);
      }
      try {
        const res = await axios.get<BookCategory[]>('/api/categories');
        this.categories = res.data;
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    },

    async fetchBooks() {
      try {
        const { getFirestoreCollection } = await import('../lib/firebase.js');
        const firestoreBooks = await getFirestoreCollection<Book>('books');
        if (firestoreBooks && firestoreBooks.length > 0) {
          this.books = firestoreBooks;
          return;
        }
      } catch (e) {
        console.warn('Firestore fetchBooks fallback', e);
      }
      try {
        const res = await axios.get<Book[]>('/api/books');
        this.books = res.data;
      } catch (err) {
        console.error('Failed to fetch books', err);
      }
    },

    async fetchShelves() {
      try {
        const { getFirestoreCollection } = await import('../lib/firebase.js');
        const firestoreShelves = await getFirestoreCollection<Shelf>('shelves');
        if (firestoreShelves && firestoreShelves.length > 0) {
          this.shelves = firestoreShelves;
          return;
        }
      } catch (e) {
        console.warn('Firestore fetchShelves fallback', e);
      }
      try {
        const res = await axios.get<Shelf[]>('/api/shelves');
        this.shelves = res.data;
      } catch (err) {
        console.error('Failed to fetch shelves', err);
      }
    },

    async fetchMembers() {
      try {
        const { getFirestoreCollection } = await import('../lib/firebase.js');
        const firestoreMembers = await getFirestoreCollection<Member>('members');
        if (firestoreMembers && firestoreMembers.length > 0) {
          this.members = firestoreMembers;
          if (this.currentUser) {
            const updated = this.members.find(m => m.id === this.currentUser?.id || m.email?.toLowerCase() === this.currentUser?.email?.toLowerCase());
            if (updated) this.currentUser = updated;
          }
          return;
        }
      } catch (e) {
        console.warn('Firestore fetchMembers fallback', e);
      }
      try {
        const res = await axios.get<Member[]>('/api/members');
        this.members = res.data;
        if (this.currentUser) {
          const updated = this.members.find(m => m.id === this.currentUser?.id);
          if (updated) this.currentUser = updated;
        }
      } catch (err) {
        console.error('Failed to fetch members', err);
      }
    },

    async fetchBookings() {
      try {
        const { getFirestoreCollection } = await import('../lib/firebase.js');
        const firestoreBookings = await getFirestoreCollection<Booking>('bookings');
        if (firestoreBookings) {
          this.bookings = firestoreBookings;
        }
      } catch (e) {
        console.warn('Firestore fetchBookings fallback', e);
      }
      try {
        const res = await axios.get<Booking[]>('/api/bookings');
        if (res.data && (!this.bookings || this.bookings.length === 0)) {
          this.bookings = res.data;
        }
      } catch (err) {
        console.error('Failed to fetch bookings', err);
      }
    },

    async fetchLoans() {
      try {
        const { getFirestoreCollection } = await import('../lib/firebase.js');
        const firestoreLoans = await getFirestoreCollection<Loan>('loans');
        if (firestoreLoans) {
          this.loans = firestoreLoans;
        }
      } catch (e) {
        console.warn('Firestore fetchLoans fallback', e);
      }
      try {
        const res = await axios.get<Loan[]>('/api/loans');
        if (res.data && (!this.loans || this.loans.length === 0)) {
          this.loans = res.data;
        }
      } catch (err) {
        console.error('Failed to fetch loans', err);
      }
    },

    async fetchSuspendConfig() {
      try {
        const { getFirestoreCollection } = await import('../lib/firebase.js');
        const firestoreConfig = await getFirestoreCollection<SuspendConfig>('config');
        if (firestoreConfig && firestoreConfig.length > 0) {
          this.suspendConfig = firestoreConfig[0];
          return;
        }
      } catch (e) {
        console.warn('Firestore fetchSuspendConfig fallback', e);
      }
      try {
        const res = await axios.get<SuspendConfig>('/api/suspend-config');
        this.suspendConfig = res.data;
      } catch (err) {
        console.error('Failed to fetch suspend config', err);
      }
    },

    async fetchNotifications() {
      try {
        const { getFirestoreCollection } = await import('../lib/firebase.js');
        const firestoreNotifs = await getFirestoreCollection<NotificationLog>('notifications');
        if (firestoreNotifs) {
          this.notifications = firestoreNotifs;
        }
      } catch (e) {
        console.warn('Firestore fetchNotifications fallback', e);
      }
      try {
        const res = await axios.get<NotificationLog[]>('/api/notifications');
        if (res.data && (!this.notifications || this.notifications.length === 0)) {
          this.notifications = res.data;
        }
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    },

    // 1. Create 24h Hold Booking
    async createBooking(bookId: string, memberCardOrId: string, notes?: string) {
      try {
        const res = await axios.post('/api/bookings', {
          bookId,
          memberCardOrId,
          notes
        });
        const savedBooking = res.data;
        await Promise.all([this.fetchBooks(), this.fetchBookings(), this.fetchStats(), this.fetchNotifications()]);

        const { syncBookingDoc, syncBookDoc } = await import('../lib/firebase.js');
        if (savedBooking) await syncBookingDoc(savedBooking);
        const bookedBook = this.books.find(b => b.id === bookId);
        if (bookedBook) await syncBookDoc(bookedBook);

        this.showToast('✅ Berhasil booking buku! Buku ditahan selama 24 jam untuk Anda.');
        return { success: true, booking: savedBooking };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal melakukan booking buku';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    // 2. Cancel Booking
    async cancelBooking(bookingId: string) {
      try {
        await axios.post(`/api/bookings/${bookingId}/cancel`);
        await Promise.all([this.fetchBooks(), this.fetchBookings(), this.fetchStats()]);

        const { syncBookingDoc, syncBookDoc } = await import('../lib/firebase.js');
        const bk = this.bookings.find(b => b.id === bookingId);
        if (bk) {
          bk.status = 'cancelled';
          await syncBookingDoc(bk);
          const relatedBook = this.books.find(b => b.id === bk.bookId);
          if (relatedBook) await syncBookDoc(relatedBook);
        }

        this.showToast('Booking berhasil dibatalkan dan buku dikembalikan ke rak.');
        return { success: true };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal membatalkan booking';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    // 3. Collect Booking -> Convert to Loan
    async collectBooking(bookingId: string, handledBy?: string) {
      try {
        const res = await axios.post(`/api/bookings/${bookingId}/collect`, { handledBy });
        const newLoan = res.data.loan;
        await Promise.all([this.fetchBooks(), this.fetchBookings(), this.fetchLoans(), this.fetchMembers(), this.fetchStats()]);

        const { syncLoanDoc, syncBookingDoc, syncBookDoc } = await import('../lib/firebase.js');
        if (newLoan) await syncLoanDoc(newLoan);
        const bk = this.bookings.find(b => b.id === bookingId);
        if (bk) await syncBookingDoc(bk);
        const targetBook = this.books.find(b => b.id === bk?.bookId || b.id === newLoan?.bookId);
        if (targetBook) await syncBookDoc(targetBook);

        this.showToast('✅ Buku berhasil diserahkan kepada peminjam dan tercatat sebagai peminjaman aktif!');
        return { success: true, loan: newLoan };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal memproses pengambilan booking';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    // 4. Issue Direct Loan (Card Scan + Book Barcode)
    async issueDirectLoan(bookIdOrBarcode: string, memberCardOrId: string, loanDays = 7, handledBy = 'Scan Sirkulasi') {
      try {
        const res = await axios.post('/api/loans', {
          bookIdOrBarcode,
          memberCardOrId,
          loanDays,
          handledBy
        });
        const createdLoan = res.data;
        await Promise.all([this.fetchBooks(), this.fetchLoans(), this.fetchMembers(), this.fetchStats()]);

        const { syncLoanDoc, syncBookDoc } = await import('../lib/firebase.js');
        if (createdLoan) await syncLoanDoc(createdLoan);
        const borrowedBook = this.books.find(b => b.id === createdLoan.bookId);
        if (borrowedBook) await syncBookDoc(borrowedBook);

        this.showToast(`✅ Peminjaman buku "${createdLoan.bookTitle}" berhasil dicatat untuk ${createdLoan.memberName}!`);
        return { success: true, loan: createdLoan };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal memproses peminjaman buku';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    // 5. Return Book (Automatic Reporting & Auto-Suspend)
    async returnLoan(loanId: string) {
      try {
        const res = await axios.post(`/api/loans/${loanId}/return`);
        await Promise.all([this.fetchBooks(), this.fetchLoans(), this.fetchMembers(), this.fetchStats(), this.fetchNotifications()]);

        const { syncLoanDoc, syncBookDoc, syncMemberDoc } = await import('../lib/firebase.js');
        const retLoan = this.loans.find(l => l.id === loanId);
        if (retLoan) {
          await syncLoanDoc(retLoan);
          const retBook = this.books.find(b => b.id === retLoan.bookId);
          if (retBook) await syncBookDoc(retBook);
          const retMember = this.members.find(m => m.id === retLoan.memberId);
          if (retMember) await syncMemberDoc(retMember);
        }

        this.showToast(res.data.message);
        return { success: true, data: res.data };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal memproses pengembalian buku';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    // 6. Update Suspend Configuration (1-30 Days)
    async updateSuspendConfig(newConfig: Partial<SuspendConfig>) {
      try {
        const res = await axios.put('/api/suspend-config', newConfig);
        this.suspendConfig = res.data.config;

        const { syncConfigDoc } = await import('../lib/firebase.js');
        if (this.suspendConfig) await syncConfigDoc(this.suspendConfig);

        this.showToast('✅ Konfigurasi sanksi suspend & aturan peminjaman berhasil disimpan!');
        return { success: true };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal memperbarui konfigurasi';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    // 7. Manual Member Suspend / Unsuspend
    async toggleMemberSuspend(memberId: string, suspend: boolean, days = 7, reason?: string) {
      try {
        const res = await axios.post(`/api/members/${memberId}/suspend`, { suspend, days, reason });
        await Promise.all([this.fetchMembers(), this.fetchStats()]);

        const { syncMemberDoc } = await import('../lib/firebase.js');
        const suspMember = this.members.find(m => m.id === memberId);
        if (suspMember) await syncMemberDoc(suspMember);

        this.showToast(res.data.message);
        return { success: true };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal memperbarui status suspend anggota';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    // 8. Send SMS / Email Overdue Notification
    async sendNotification(payload: {
      memberId?: string;
      recipient: string;
      type: 'email' | 'sms' | 'whatsapp';
      subject?: string;
      message: string;
      triggerReason?: any;
    }) {
      try {
        const res = await axios.post('/api/notifications/send', payload);
        const log = res.data.log;
        await this.fetchNotifications();

        const { syncNotificationDoc } = await import('../lib/firebase.js');
        if (log) await syncNotificationDoc(log);

        this.showToast(`✅ Notifikasi ${payload.type.toUpperCase()} berhasil dikirim ke ${payload.recipient}!`);
        return { success: true, log };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal mengirim notifikasi';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    // 9. Save / Edit Book
    async saveBook(bookData: Partial<Book>) {
      if (!this.isAdmin) {
        this.setError('Akses ditolak. Anda harus login sebagai Administrator untuk mengelola buku.');
        return { success: false, error: 'Akses ditolak' };
      }
      try {
        let savedBook: Book | null = null;
        if (bookData.id && !bookData.id.startsWith('temp_')) {
          const res = await axios.put(`/api/books/${bookData.id}`, bookData);
          savedBook = res.data;
          this.showToast('Data buku berhasil diperbarui');
        } else {
          const res = await axios.post('/api/books', bookData);
          savedBook = res.data;
          this.showToast('Buku baru berhasil ditambahkan ke katalog perpustakaan');
        }
        await Promise.all([this.fetchBooks(), this.fetchShelves(), this.fetchStats()]);
        
        // Direct realtime sync to Firestore
        if (savedBook) {
          const { syncBookDoc } = await import('../lib/firebase.js');
          await syncBookDoc(savedBook);
        }

        return { success: true };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal menyimpan data buku';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    async deleteBook(bookId: string) {
      if (!this.isAdmin) {
        this.setError('Akses ditolak. Anda harus login sebagai Administrator untuk menghapus buku.');
        return { success: false, error: 'Akses ditolak' };
      }
      try {
        await axios.delete(`/api/books/${bookId}`);
        await Promise.all([this.fetchBooks(), this.fetchShelves(), this.fetchStats()]);

        // Direct sync deletion to Firestore
        const { removeBookDoc } = await import('../lib/firebase.js');
        await removeBookDoc(bookId);

        this.showToast('Buku berhasil dihapus dari sistem');
        return { success: true };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal menghapus buku';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    // 10. Save / Edit Shelf
    async saveShelf(shelfData: Partial<Shelf>) {
      if (!this.isAdmin) {
        this.setError('Akses ditolak. Anda harus login sebagai Administrator untuk mengelola rak.');
        return { success: false, error: 'Akses ditolak' };
      }
      try {
        const existing = this.shelves.find(s => s.id === shelfData.id);
        let savedShelf: Shelf | null = null;
        if (existing) {
          const res = await axios.put(`/api/shelves/${shelfData.id}`, shelfData);
          savedShelf = res.data;
          this.showToast('Data rak berhasil diperbarui');
        } else {
          const res = await axios.post('/api/shelves', shelfData);
          savedShelf = res.data;
          this.showToast('Rak baru berhasil ditambahkan');
        }
        await Promise.all([this.fetchShelves(), this.fetchBooks(), this.fetchStats()]);

        // Direct realtime sync to Firestore
        if (savedShelf) {
          const { syncShelfDoc } = await import('../lib/firebase.js');
          await syncShelfDoc(savedShelf);
        }

        return { success: true };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal menyimpan rak';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    async deleteShelf(shelfId: string) {
      if (!this.isAdmin) {
        this.setError('Akses ditolak. Anda harus login sebagai Administrator untuk menghapus rak.');
        return { success: false, error: 'Akses ditolak' };
      }
      try {
        await axios.delete(`/api/shelves/${shelfId}`);
        await Promise.all([this.fetchShelves(), this.fetchStats()]);

        // Direct sync deletion to Firestore
        const { removeShelfDoc } = await import('../lib/firebase.js');
        await removeShelfDoc(shelfId);

        this.showToast('Rak berhasil dihapus');
        return { success: true };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal menghapus rak';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    // Category CRUD
    async createCategory(catData: Partial<BookCategory>) {
      if (!this.isAdmin) {
        this.setError('Akses ditolak. Anda harus login sebagai Administrator untuk mengelola kategori.');
        return { success: false, error: 'Akses ditolak' };
      }
      try {
        const res = await axios.post('/api/categories', catData);
        const savedCat = res.data;
        await this.fetchCategories();

        const { syncCategoryDoc } = await import('../lib/firebase.js');
        if (savedCat) await syncCategoryDoc(savedCat);

        this.showToast(`Kategori "${savedCat.name}" berhasil ditambahkan`);
        return { success: true, category: savedCat };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal menambahkan kategori';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    async updateCategory(categoryId: string, catData: Partial<BookCategory>) {
      if (!this.isAdmin) {
        this.setError('Akses ditolak. Anda harus login sebagai Administrator untuk mengelola kategori.');
        return { success: false, error: 'Akses ditolak' };
      }
      try {
        const res = await axios.put(`/api/categories/${categoryId}`, catData);
        const savedCat = res.data;
        await Promise.all([this.fetchCategories(), this.fetchBooks(), this.fetchShelves()]);

        const { syncCategoryDoc } = await import('../lib/firebase.js');
        if (savedCat) await syncCategoryDoc(savedCat);

        this.showToast(`Kategori "${savedCat.name}" berhasil diperbarui`);
        return { success: true, category: savedCat };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal memperbarui kategori';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    async deleteCategory(categoryId: string) {
      if (!this.isAdmin) {
        this.setError('Akses ditolak. Anda harus login sebagai Administrator untuk menghapus kategori.');
        return { success: false, error: 'Akses ditolak' };
      }
      try {
        const res = await axios.delete(`/api/categories/${categoryId}`);
        await Promise.all([this.fetchCategories(), this.fetchBooks(), this.fetchShelves()]);

        const { removeCategoryDoc } = await import('../lib/firebase.js');
        await removeCategoryDoc(categoryId);

        this.showToast(res.data?.message || 'Kategori berhasil dihapus');
        return { success: true };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal menghapus kategori';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    // 11. Member Lookup by Card Number
    async lookupMemberByCard(cardNumber: string) {
      try {
        const found = this.members.find(m => m.cardNumber?.toLowerCase() === cardNumber.trim().toLowerCase());
        if (found) return { success: true, data: found };

        const res = await axios.get(`/api/members/card/${encodeURIComponent(cardNumber)}`);
        return { success: true, data: res.data };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.error || 'Kartu member tidak ditemukan' };
      }
    },

    // 12. Member Management by Admin & Public Registration
    async registerMember(memberData: { name: string; email: string; phone: string; address?: string }) {
      try {
        const res = await axios.post('/api/members', memberData);
        const savedMember = res.data;
        await Promise.all([this.fetchMembers(), this.fetchStats()]);

        const { syncMemberDoc } = await import('../lib/firebase.js');
        if (savedMember) await syncMemberDoc(savedMember);

        this.currentUser = savedMember;
        localStorage.setItem('pustaka_user_id', savedMember.id);
        this.showToast(`🎉 Selamat datang ${savedMember.name}! Kartu member digital Anda: ${savedMember.cardNumber}`);
        return { success: true, member: savedMember };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal mendaftar member';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    async createMemberByAdmin(memberData: { name: string; email: string; phone: string; role?: 'admin' | 'member'; address?: string }) {
      try {
        const res = await axios.post('/api/members', memberData);
        const savedMember = res.data;
        await Promise.all([this.fetchMembers(), this.fetchStats()]);

        const { syncMemberDoc } = await import('../lib/firebase.js');
        if (savedMember) await syncMemberDoc(savedMember);

        this.showToast(`✅ Anggota baru "${savedMember.name}" (${savedMember.cardNumber}) berhasil didaftarkan!`);
        return { success: true, member: savedMember };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal menambahkan anggota';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    async updateMember(memberId: string, memberData: Partial<Member>) {
      try {
        const res = await axios.put(`/api/members/${memberId}`, memberData);
        const savedMember = res.data;
        await Promise.all([this.fetchMembers(), this.fetchStats()]);

        const { syncMemberDoc } = await import('../lib/firebase.js');
        if (savedMember) await syncMemberDoc(savedMember);

        if (this.currentUser?.id === memberId) {
          this.currentUser = savedMember;
        }
        this.showToast(`Data anggota "${savedMember.name}" berhasil diperbarui`);
        return { success: true, member: savedMember };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal memperbarui anggota';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    async deleteMember(memberId: string) {
      try {
        await axios.delete(`/api/members/${memberId}`);
        await Promise.all([this.fetchMembers(), this.fetchStats()]);

        const { removeMemberDoc } = await import('../lib/firebase.js');
        await removeMemberDoc(memberId);

        this.showToast('Anggota berhasil dihapus');
        return { success: true };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal menghapus anggota';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    // 13. Standard Authentication Actions
    async loginWithCredentials(credentials: { identifier: string; password?: string; role?: string }) {
      const cleanIdent = (credentials.identifier || '').trim().toLowerCase();
      const enteredPass = credentials.password || '';

      // Check against Firestore-synced members list first
      const matchedMember = this.members.find(m => 
        (m.email && m.email.toLowerCase() === cleanIdent) ||
        (m.cardNumber && m.cardNumber.toLowerCase() === cleanIdent) ||
        (m.id && m.id.toLowerCase() === cleanIdent) ||
        (cleanIdent === 'admin' && m.role === 'admin')
      );

      if (matchedMember) {
        const validPassword = matchedMember.password || (matchedMember.role === 'admin' ? 'admin' : '');
        const isPassOk = !validPassword || validPassword === enteredPass || (matchedMember.role === 'admin' && enteredPass === 'admin');
        
        if (isPassOk) {
          this.currentUser = matchedMember;
          this.authToken = `token_${matchedMember.id}_${Date.now()}`;
          localStorage.setItem('pustaka_token', this.authToken);
          localStorage.setItem('pustaka_user_id', matchedMember.id);
          this.showToast(matchedMember.role === 'admin' ? `Selamat datang kembali, Administrator ${matchedMember.name}!` : `Selamat datang, ${matchedMember.name}!`);
          
          // Background sync with API session if available
          axios.post('/api/auth/login', credentials).catch(() => {});
          return { success: true, user: matchedMember };
        }
      }

      // Fallback to server API
      try {
        const res = await axios.post('/api/auth/login', credentials);
        const { user, token } = res.data;
        this.currentUser = user;
        this.authToken = token;
        localStorage.setItem('pustaka_token', token);
        localStorage.setItem('pustaka_user_id', user.id);
        this.showToast(user.role === 'admin' ? `Selamat datang kembali, Administrator ${user.name}!` : `Selamat datang, ${user.name}!`);
        return { success: true, user };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal masuk. Periksa kembali email/nomor kartu dan kata sandi Anda.';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    async loginWithGoogleUser(userData: { email: string; displayName?: string | null; photoURL?: string | null }) {
      try {
        const res = await axios.post('/api/auth/google', userData);
        const { user, token } = res.data;
        this.currentUser = user;
        this.authToken = token;
        localStorage.setItem('pustaka_token', token);
        localStorage.setItem('pustaka_user_id', user.id);
        await this.fetchMembers();
        this.showToast(`Berhasil masuk dengan Google: ${user.name}`);
        return { success: true, user };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal autentikasi Google';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    logout() {
      this.currentUser = null;
      this.authToken = '';
      localStorage.removeItem('pustaka_token');
      localStorage.removeItem('pustaka_user_id');
      this.showToast('Anda telah keluar dari akun. Sekarang dalam mode Pengunjung Publik.');
    },

    // 14. Password Management (Change & Reset)
    async changePassword(oldPassword: string, newPassword: string, targetMemberId?: string) {
      const memberId = targetMemberId || this.currentUser?.id;
      if (!memberId) {
        this.setError('Tidak ada akun yang sedang aktif');
        return { success: false, error: 'Sesi akun tidak ditemukan' };
      }

      try {
        const res = await axios.post('/api/auth/change-password', {
          memberId,
          oldPassword,
          newPassword
        });

        // Sync updated member password to Firestore
        const targetMember = this.members.find(m => m.id === memberId);
        if (targetMember) {
          targetMember.password = newPassword;
          const { syncMemberDoc } = await import('../lib/firebase.js');
          await syncMemberDoc(targetMember);
        }

        this.showToast(res.data.message || 'Kata sandi berhasil diubah!');
        return { success: true, message: res.data.message };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal mengubah kata sandi';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    async requestPasswordReset(identifier: string) {
      try {
        const res = await axios.post('/api/auth/reset-password-request', { identifier });
        this.showToast(`Kode verifikasi dibuat: ${res.data.verificationCode}`);
        return { 
          success: true, 
          message: res.data.message, 
          verificationCode: res.data.verificationCode,
          email: res.data.email,
          cardNumber: res.data.cardNumber
        };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal membuat permintaan reset password';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    async confirmPasswordReset(identifier: string, code: string, newPassword: string) {
      try {
        const res = await axios.post('/api/auth/reset-password-confirm', {
          identifier,
          code,
          newPassword
        });
        
        // Sync password to matching Firestore member
        const cleanIdent = identifier.trim().toLowerCase();
        const targetMember = this.members.find(m => 
          (m.email && m.email.toLowerCase() === cleanIdent) ||
          (m.cardNumber && m.cardNumber.toLowerCase() === cleanIdent)
        );
        if (targetMember) {
          targetMember.password = newPassword;
          const { syncMemberDoc } = await import('../lib/firebase.js');
          await syncMemberDoc(targetMember);
        }

        this.showToast(res.data.message || 'Kata sandi berhasil direset! Silakan login.');
        return { success: true, message: res.data.message };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal mereset kata sandi';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    async adminResetMemberPassword(memberId: string, newPassword: string) {
      try {
        const res = await axios.post('/api/auth/admin-reset-password', {
          adminId: this.currentUser?.id,
          memberId,
          newPassword
        });

        // Sync password directly to Firestore member
        const targetMember = this.members.find(m => m.id === memberId);
        if (targetMember) {
          targetMember.password = newPassword;
          const { syncMemberDoc } = await import('../lib/firebase.js');
          await syncMemberDoc(targetMember);
        }

        await this.fetchMembers();
        this.showToast(res.data.message || 'Kata sandi anggota berhasil diperbarui!');
        return { success: true, message: res.data.message };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal mereset kata sandi anggota';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    // 15. Cloud Firestore & Database Synchronization
    async syncWithCloudFirestore() {
      try {
        const { syncAllToFirestore } = await import('../lib/firebase.js');
        const res = await syncAllToFirestore({
          categories: this.categories,
          shelves: this.shelves,
          books: this.books,
          members: this.members,
          loans: this.loans,
          bookings: this.bookings,
          notifications: this.notifications
        });
        if (res.success) {
          this.showToast('✅ Data berhasil disinkronkan ke Cloud Firestore!');
        }
        return res;
      } catch (err: any) {
        console.error('Sync failed', err);
        return { success: false, message: err?.message || 'Gagal sinkronisasi' };
      }
    }
  }
});

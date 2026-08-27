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

    async initAll() {
      this.isLoading = true;
      try {
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
              // If failed, check in local members array or clear
              if (savedUserId) {
                const found = this.members.find(m => m.id === savedUserId);
                if (found) this.currentUser = found;
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
        const res = await axios.get<BookCategory[]>('/api/categories');
        this.categories = res.data;
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    },

    async fetchBooks() {
      try {
        const res = await axios.get<Book[]>('/api/books');
        this.books = res.data;
      } catch (err) {
        console.error('Failed to fetch books', err);
      }
    },

    async fetchShelves() {
      try {
        const res = await axios.get<Shelf[]>('/api/shelves');
        this.shelves = res.data;
      } catch (err) {
        console.error('Failed to fetch shelves', err);
      }
    },

    async fetchMembers() {
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
        const res = await axios.get<Booking[]>('/api/bookings');
        this.bookings = res.data;
      } catch (err) {
        console.error('Failed to fetch bookings', err);
      }
    },

    async fetchLoans() {
      try {
        const res = await axios.get<Loan[]>('/api/loans');
        this.loans = res.data;
      } catch (err) {
        console.error('Failed to fetch loans', err);
      }
    },

    async fetchSuspendConfig() {
      try {
        const res = await axios.get<SuspendConfig>('/api/suspend-config');
        this.suspendConfig = res.data;
      } catch (err) {
        console.error('Failed to fetch suspend config', err);
      }
    },

    async fetchNotifications() {
      try {
        const res = await axios.get<NotificationLog[]>('/api/notifications');
        this.notifications = res.data;
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
        await Promise.all([this.fetchBooks(), this.fetchBookings(), this.fetchStats(), this.fetchNotifications()]);
        this.showToast('✅ Berhasil booking buku! Buku ditahan selama 24 jam untuk Anda.');
        return { success: true, booking: res.data };
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
        await Promise.all([this.fetchBooks(), this.fetchBookings(), this.fetchLoans(), this.fetchMembers(), this.fetchStats()]);
        this.showToast('✅ Buku berhasil diserahkan kepada peminjam dan tercatat sebagai peminjaman aktif!');
        return { success: true, loan: res.data.loan };
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
        await Promise.all([this.fetchBooks(), this.fetchLoans(), this.fetchMembers(), this.fetchStats()]);
        this.showToast(`✅ Peminjaman buku "${res.data.bookTitle}" berhasil dicatat untuk ${res.data.memberName}!`);
        return { success: true, loan: res.data };
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
        await this.fetchNotifications();
        this.showToast(`✅ Notifikasi ${payload.type.toUpperCase()} berhasil dikirim ke ${payload.recipient}!`);
        return { success: true, log: res.data.log };
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
        await this.fetchCategories();
        this.showToast(`Kategori "${res.data.name}" berhasil ditambahkan`);
        return { success: true, category: res.data };
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
        await Promise.all([this.fetchCategories(), this.fetchBooks(), this.fetchShelves()]);
        this.showToast(`Kategori "${res.data.name}" berhasil diperbarui`);
        return { success: true, category: res.data };
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
        await Promise.all([this.fetchMembers(), this.fetchStats()]);
        this.currentUser = res.data;
        localStorage.setItem('pustaka_user_id', res.data.id);
        this.showToast(`🎉 Selamat datang ${res.data.name}! Kartu member digital Anda: ${res.data.cardNumber}`);
        return { success: true, member: res.data };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal mendaftar member';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    async createMemberByAdmin(memberData: { name: string; email: string; phone: string; role?: 'admin' | 'member'; address?: string }) {
      try {
        const res = await axios.post('/api/members', memberData);
        await Promise.all([this.fetchMembers(), this.fetchStats()]);
        this.showToast(`✅ Anggota baru "${res.data.name}" (${res.data.cardNumber}) berhasil didaftarkan!`);
        return { success: true, member: res.data };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal menambahkan anggota';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    async updateMember(memberId: string, memberData: Partial<Member>) {
      try {
        const res = await axios.put(`/api/members/${memberId}`, memberData);
        await Promise.all([this.fetchMembers(), this.fetchStats()]);
        if (this.currentUser?.id === memberId) {
          this.currentUser = res.data;
        }
        this.showToast(`Data anggota "${res.data.name}" berhasil diperbarui`);
        return { success: true, member: res.data };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal memperbarui anggota';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    async deleteMember(memberId: string) {
      try {
        const res = await axios.delete(`/api/members/${memberId}`);
        await Promise.all([this.fetchMembers(), this.fetchStats()]);
        this.showToast(res.data?.message || 'Anggota berhasil dihapus');
        return { success: true };
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Gagal menghapus anggota';
        this.setError(msg);
        return { success: false, error: msg };
      }
    },

    // 13. Standard Authentication Actions
    async loginWithCredentials(credentials: { identifier: string; password?: string; role?: string }) {
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
        const msg = err.response?.data?.error || 'Gagal masuk. Periksa kembali kredensial Anda.';
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

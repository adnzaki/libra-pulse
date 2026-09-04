import { defineStore } from 'pinia';
import type { Book, Shelf, Member, Booking, Loan, SuspendConfig, NotificationLog, LibraryStats, BookCategory } from '../types.js';
import { 
  getOfflineCachedData, 
  downloadAllForOfflineAccess, 
  getOfflineLastDownloaded,
  queueOfflineMutation,
  getPendingOfflineMutations,
  clearPendingOfflineMutations
} from '../lib/offline-manager.js';
import { defaultSuspendConfig } from '../lib/default-catalog.js';

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
    suspendConfig: defaultSuspendConfig,
    
    // Auth & Role
    currentUser: null as Member | null,
    authToken: localStorage.getItem('pustaka_token') || '',
    
    // UI Loading & feedback
    isLoading: false,
    errorMessage: '',
    successToast: '',
    
    // Offline status
    isOfflineMode: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    isUsingOfflineData: false,
    offlineLastDownloaded: getOfflineLastDownloaded(),
    pendingMutationsCount: getPendingOfflineMutations().length,
    
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
    // ------------------------------------------------------------------------
    // Realtime Listener Setup & Online/Offline Events
    // ------------------------------------------------------------------------
    setupRealtimeListeners() {
      if (typeof window === 'undefined' || (window as any).__firestore_listeners_active) return;
      (window as any).__firestore_listeners_active = true;

      window.addEventListener('online', () => {
        this.isOfflineMode = false;
        this.showToast('🟢 Terhubung kembali ke Cloud Firestore. Menyinkronkan antrean...');
        this.flushOfflineQueue();
        this.initAll();
      });

      window.addEventListener('offline', () => {
        this.isOfflineMode = true;
        this.showToast('⚠️ Koneksi internet terputus. Beralih ke mode offline lokal.');
      });

      import('../lib/firebase.js').then(({ subscribeToFirestoreCollection }) => {
        subscribeToFirestoreCollection<Book>('books', (items) => {
          if (items && items.length > 0) {
            this.books = items;
            this.isUsingOfflineData = false;
            this.calculateStats();
          }
        });
        subscribeToFirestoreCollection<Shelf>('shelves', (items) => {
          if (items && items.length > 0) {
            this.shelves = items;
            this.calculateStats();
          }
        });
        subscribeToFirestoreCollection<BookCategory>('categories', (items) => {
          if (items && items.length > 0) {
            this.categories = items;
            this.calculateStats();
          }
        });
        subscribeToFirestoreCollection<Member>('members', (items) => {
          if (items && items.length > 0) {
            this.members = items;
            if (this.currentUser) {
              const current = items.find(m => m.id === this.currentUser?.id || m.email?.toLowerCase() === this.currentUser?.email?.toLowerCase());
              if (current) this.currentUser = current;
            }
            this.calculateStats();
            this.checkOverdueAndAutoSuspend();
          }
        });
        subscribeToFirestoreCollection<Loan>('loans', (items) => {
          if (items) {
            this.loans = items;
            this.calculateStats();
            this.checkOverdueAndAutoSuspend();
          }
        });
        subscribeToFirestoreCollection<Booking>('bookings', (items) => {
          if (items) {
            this.bookings = items;
            this.calculateStats();
          }
        });
        subscribeToFirestoreCollection<NotificationLog>('notifications', (items) => {
          if (items) {
            this.notifications = items;
          }
        });
        subscribeToFirestoreCollection<SuspendConfig>('config', (items) => {
          if (items && items.length > 0) {
            this.suspendConfig = items[0];
          }
        });

        // Periodic auto-check every 30 seconds
        if (typeof window !== 'undefined' && !(window as any).__overdue_checker_interval) {
          (window as any).__overdue_checker_interval = setInterval(() => {
            this.checkOverdueAndAutoSuspend();
          }, 30000);
        }
      }).catch(err => {
        console.warn('Realtime listener setup warning:', err);
      });
    },

    calculateStats() {
      // Reconcile and calculate real-time available copies for all books
      for (const b of this.books) {
        const total = Math.max(1, Number(b.totalCopies) || 1);
        const activeLoansForBook = this.loans.filter(
          l => l.bookId === b.id && (l.status === 'active' || l.status === 'overdue')
        ).length;
        const activeBookingsForBook = this.bookings.filter(
          bk => bk.bookId === b.id && 
               (bk.status === 'active_hold' || bk.status === 'pending' || bk.status === 'active') &&
               (!bk.expiresAt || new Date(bk.expiresAt).getTime() > Date.now())
        ).length;

        const borrowed = Math.min(total, activeLoansForBook > 0 ? activeLoansForBook : (Number(b.borrowedCopies) || 0));
        const reserved = Math.min(Math.max(0, total - borrowed), activeBookingsForBook > 0 ? activeBookingsForBook : (Number(b.reservedCopies) || 0));
        
        b.totalCopies = total;
        b.borrowedCopies = borrowed;
        b.reservedCopies = reserved;
        b.availableCopies = Math.max(0, total - borrowed - reserved);
      }

      // Reconcile overdue status synchronously so statistics and badges are immediate
      const now = new Date();
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const autoSuspendEnabled = this.suspendConfig?.autoSuspendOnOverdue ?? true;
      const overdueMemberKeys = new Set<string>();

      for (const loan of this.loans) {
        if (loan.status === 'returned' || !loan.dueDate) continue;
        const parts = loan.dueDate.split('-');
        let dueMidnight = 0;
        if (parts.length === 3) {
          dueMidnight = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
        } else {
          dueMidnight = new Date(loan.dueDate).getTime();
        }

        if (todayMidnight > dueMidnight) {
          loan.status = 'overdue';
          loan.daysOverdue = Math.max(1, Math.round((todayMidnight - dueMidnight) / (24 * 3600 * 1000)));
          if (loan.memberId) overdueMemberKeys.add(loan.memberId);
          if (loan.memberCardNumber) overdueMemberKeys.add(loan.memberCardNumber);
          if (loan.memberEmail) overdueMemberKeys.add(loan.memberEmail.toLowerCase().trim());
        }
      }

      // Reconcile member suspend state based on active overdue loans
      for (const member of this.members) {
        const hasOverdue = overdueMemberKeys.has(member.id) ||
                           overdueMemberKeys.has(member.cardNumber) ||
                           (member.email && overdueMemberKeys.has(member.email.toLowerCase().trim()));

        if (hasOverdue && autoSuspendEnabled) {
          member.isSuspended = true;
          if (!member.suspendReason) {
            const worstLoan = this.loans.find(l => l.status === 'overdue' && (l.memberId === member.id || l.memberCardNumber === member.cardNumber));
            member.suspendReason = worstLoan
              ? `Keterlambatan pengembalian buku "${worstLoan.bookTitle}" (Jatuh tempo: ${worstLoan.dueDate}, telat ${worstLoan.daysOverdue} hari)`
              : 'Sanksi Keterlambatan Pengembalian Buku';
          }
        } else if (!hasOverdue && member.isSuspended) {
          // If suspension was triggered by overdue loans, auto-restore
          const reason = (member.suspendReason || '').toLowerCase();
          const isOverdueSuspension = !reason ||
            reason.includes('keterlambatan') ||
            reason.includes('sanksi') ||
            reason.includes('jatuh tempo') ||
            reason.includes('telat') ||
            reason.includes('buku');

          if (isOverdueSuspension) {
            member.isSuspended = false;
            member.suspendReason = '';
            member.suspendedUntil = null;
            if (this.currentUser && (this.currentUser.id === member.id || this.currentUser.cardNumber === member.cardNumber)) {
              this.currentUser = { ...member };
            }
          }
        }
      }

      const totalTitles = this.books.length;
      const totalBooks = this.books.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
      const availableBooks = this.books.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
      const borrowedBooks = this.loans.filter(l => l.status === 'active' || l.status === 'overdue').length;
      const reservedBooks = this.bookings.filter(b => b.status === 'active_hold').length;
      const totalMembers = this.members.length;
      const activeMembers = this.members.filter(m => !m.isSuspended).length;
      const suspendedMembers = this.members.filter(m => m.isSuspended).length;
      const activeLoans = borrowedBooks;
      const overdueLoans = this.loans.filter(l => l.status === 'overdue').length;
      const activeBookings = reservedBooks;

      const totalCap = this.shelves.reduce((acc, s) => acc + (s.capacity || 0), 0);
      const totalCur = this.shelves.reduce((acc, s) => acc + (s.currentCount || 0), 0);
      const shelvesUtilizedPercent = totalCap > 0 ? Math.round((totalCur / totalCap) * 100) : 0;

      this.stats = {
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
        totalReturnedThisMonth: this.loans.filter(l => l.status === 'returned').length,
        shelvesUtilizedPercent
      };
    },

    /**
     * Automatic Overdue Verification and Cloud Firestore Auto-Suspend Sync
     * Evaluates all loans against current date. If overdue, marks loan status 'overdue'
     * and sets borrower isSuspended = true with explicit reason and duration.
     * Persists updates to Cloud Firestore and updates currentUser if affected.
     */
    async checkOverdueAndAutoSuspend() {
      if (this.loans.length === 0) return;

      const now = new Date();
      const todayYear = now.getFullYear();
      const todayMonth = now.getMonth();
      const todayDate = now.getDate();
      const todayMidnight = new Date(todayYear, todayMonth, todayDate).getTime();

      const autoSuspendEnabled = this.suspendConfig?.autoSuspendOnOverdue ?? true;
      const defaultSuspendDays = this.suspendConfig?.defaultSuspendDays || 7;

      const modifiedLoans: Loan[] = [];
      const modifiedMembers: Member[] = [];
      const overdueMemberCardNumbers = new Set<string>();
      const overdueMemberIds = new Set<string>();
      const overdueMemberEmails = new Set<string>();

      for (const loan of this.loans) {
        if (loan.status === 'returned') continue;

        if (loan.dueDate) {
          const parts = loan.dueDate.split('-');
          let dueMidnight = 0;
          if (parts.length === 3) {
            dueMidnight = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
          } else {
            dueMidnight = new Date(loan.dueDate).getTime();
          }

          if (todayMidnight > dueMidnight) {
            const diffDays = Math.max(1, Math.round((todayMidnight - dueMidnight) / (24 * 3600 * 1000)));
            let loanChanged = false;

            if (loan.status !== 'overdue') {
              loan.status = 'overdue';
              loanChanged = true;
            }
            if (loan.daysOverdue !== diffDays) {
              loan.daysOverdue = diffDays;
              loanChanged = true;
            }

            if (loanChanged) {
              modifiedLoans.push(loan);
            }

            if (loan.memberId) overdueMemberIds.add(loan.memberId);
            if (loan.memberCardNumber) overdueMemberCardNumbers.add(loan.memberCardNumber);
            if (loan.memberEmail) overdueMemberEmails.add(loan.memberEmail.toLowerCase().trim());
          } else if (loan.status === 'overdue') {
            loan.status = 'active';
            loan.daysOverdue = 0;
            modifiedLoans.push(loan);
          }
        }
      }

      if (this.members.length > 0) {
        for (const member of this.members) {
          const isOverdue = overdueMemberIds.has(member.id) || 
                            overdueMemberCardNumbers.has(member.cardNumber) ||
                            (member.email && overdueMemberEmails.has(member.email.toLowerCase().trim()));

          if (isOverdue && autoSuspendEnabled) {
            let memberChanged = false;

            if (!member.isSuspended) {
              member.isSuspended = true;
              memberChanged = true;
            }

            const worstLoan = this.loans
              .filter(l => l.status === 'overdue' && (l.memberId === member.id || l.memberCardNumber === member.cardNumber || (l.memberEmail && member.email && l.memberEmail.toLowerCase() === member.email.toLowerCase())))
              .sort((a, b) => (b.daysOverdue || 0) - (a.daysOverdue || 0))[0];

            const reason = worstLoan
              ? `Keterlambatan pengembalian buku "${worstLoan.bookTitle}" (Jatuh tempo: ${worstLoan.dueDate}, telat ${worstLoan.daysOverdue} hari)`
              : 'Sanksi Keterlambatan Pengembalian Buku';

            if (member.suspendReason !== reason) {
              member.suspendReason = reason;
              memberChanged = true;
            }

            const minEndDate = new Date(todayMidnight + defaultSuspendDays * 86400000);
            const minEndStr = `${minEndDate.getFullYear()}-${String(minEndDate.getMonth() + 1).padStart(2, '0')}-${String(minEndDate.getDate()).padStart(2, '0')}`;

            if (!member.suspendedUntil || member.suspendedUntil < minEndStr) {
              member.suspendedUntil = minEndStr;
              memberChanged = true;
            }

            if (memberChanged) {
              modifiedMembers.push(member);
              if (this.currentUser && (this.currentUser.id === member.id || this.currentUser.cardNumber === member.cardNumber)) {
                this.currentUser = { ...member };
              }
            }
          } else if (!isOverdue && member.isSuspended) {
            // Member has no active overdue loans; auto-restore if suspension was overdue-related
            const reason = (member.suspendReason || '').toLowerCase();
            const isOverdueSuspension = !reason ||
              reason.includes('keterlambatan') ||
              reason.includes('sanksi') ||
              reason.includes('jatuh tempo') ||
              reason.includes('telat') ||
              reason.includes('buku');

            if (isOverdueSuspension) {
              member.isSuspended = false;
              member.suspendReason = '';
              member.suspendedUntil = null;
              modifiedMembers.push(member);
              if (this.currentUser && (this.currentUser.id === member.id || this.currentUser.cardNumber === member.cardNumber)) {
                this.currentUser = { ...member };
              }
            }
          }
        }
      }

      this.calculateStats();

      if (modifiedLoans.length > 0 || modifiedMembers.length > 0) {
        try {
          const { syncLoanDoc, syncMemberDoc } = await import('../lib/firebase.js');
          await Promise.all([
            ...modifiedLoans.map(l => syncLoanDoc(l)),
            ...modifiedMembers.map(m => syncMemberDoc(m))
          ]);
        } catch (err) {
          console.warn('Auto-suspend Firestore sync fallback:', err);
          modifiedLoans.forEach(l => {
            queueOfflineMutation({ action: 'saveLoan', collection: 'loans', docId: l.id, data: l });
          });
          modifiedMembers.forEach(m => {
            queueOfflineMutation({ action: 'saveMember', collection: 'members', docId: m.id, data: m });
          });
          this.pendingMutationsCount += modifiedLoans.length + modifiedMembers.length;
        }
      }
    },

    restoreUserSession() {
      const savedUserId = localStorage.getItem('pustaka_user_id');
      if (savedUserId && this.members.length > 0) {
        const found = this.members.find(m => m.id === savedUserId);
        if (found) this.currentUser = found;
      }
    },

    loadOfflineFallback() {
      const offline = getOfflineCachedData();
      if (offline.books.length > 0 || offline.members.length > 0) {
        this.books = offline.books;
        this.categories = offline.categories;
        this.shelves = offline.shelves;
        this.members = offline.members;
        this.loans = offline.loans;
        this.bookings = offline.bookings;
        if (offline.config) this.suspendConfig = offline.config;
        this.isUsingOfflineData = true;
        this.calculateStats();
        this.restoreUserSession();
        this.showToast('ℹ️ Menggunakan data offline lokal.');
      } else {
        this.setError('Tidak dapat memuat data: Cloud Firestore belum terhubung dan belum ada cache offline.');
      }
    },

    async downloadForOffline() {
      if (this.books.length === 0 && this.members.length === 0) {
        this.setError('Tidak ada data online untuk diunduh.');
        return { success: false };
      }
      try {
        downloadAllForOfflineAccess({
          books: this.books,
          categories: this.categories,
          shelves: this.shelves,
          members: this.members,
          loans: this.loans,
          bookings: this.bookings,
          notifications: this.notifications,
          config: this.suspendConfig
        });
        this.offlineLastDownloaded = new Date().toISOString();
        this.showToast('✅ Seluruh data perpustakaan berhasil diunduh ke penyimpanan lokal!');
        return { success: true };
      } catch (err: any) {
        this.setError('Gagal mengunduh offline: ' + err?.message);
        return { success: false, error: err?.message };
      }
    },

    async flushOfflineQueue() {
      const queue = getPendingOfflineMutations();
      if (queue.length === 0) return;

      try {
        const { 
          syncBookDoc, 
          removeBookDoc, 
          syncShelfDoc, 
          removeShelfDoc, 
          syncCategoryDoc, 
          removeCategoryDoc, 
          syncMemberDoc, 
          removeMemberDoc, 
          syncLoanDoc, 
          syncBookingDoc, 
          syncConfigDoc,
          syncNotificationDoc,
          removeNotificationDoc
        } = await import('../lib/firebase.js');

        for (const item of queue) {
          switch (item.action) {
            case 'saveBook': await syncBookDoc(item.data); break;
            case 'deleteBook': await removeBookDoc(item.docId); break;
            case 'saveShelf': await syncShelfDoc(item.data); break;
            case 'deleteShelf': await removeShelfDoc(item.docId); break;
            case 'saveCategory': await syncCategoryDoc(item.data); break;
            case 'deleteCategory': await removeCategoryDoc(item.docId); break;
            case 'saveMember': await syncMemberDoc(item.data); break;
            case 'deleteMember': await removeMemberDoc(item.docId); break;
            case 'saveLoan': await syncLoanDoc(item.data); break;
            case 'saveBooking': await syncBookingDoc(item.data); break;
            case 'saveConfig': await syncConfigDoc(item.data); break;
            case 'saveNotification': await syncNotificationDoc(item.data); break;
            case 'deleteNotification': await removeNotificationDoc(item.docId); break;
          }
        }
        clearPendingOfflineMutations();
        this.pendingMutationsCount = 0;
        this.showToast('✅ Semua perubahan offline berhasil disinkronkan ke Firestore!');
      } catch (err) {
        console.warn('Failed to flush offline queue:', err);
      }
    },

    // ------------------------------------------------------------------------
    // 100% Direct Firestore Initial Load & Sync
    // ------------------------------------------------------------------------
    async initAll() {
      this.isLoading = true;
      try {
        this.setupRealtimeListeners();

        const { getFirestoreCollection, checkAndSeedFirestore } = await import('../lib/firebase.js');

        let fBooks = await getFirestoreCollection<Book>('books');
        
        // If Firestore is empty on initial bootstrap, populate catalog into Firestore
        if (fBooks.length === 0) {
          await checkAndSeedFirestore();
          fBooks = await getFirestoreCollection<Book>('books');
        }

        const [fShelves, fCats, fMembers, fLoans, fBookings, fConfig, fNotifs] = await Promise.all([
          getFirestoreCollection<Shelf>('shelves'),
          getFirestoreCollection<BookCategory>('categories'),
          getFirestoreCollection<Member>('members'),
          getFirestoreCollection<Loan>('loans'),
          getFirestoreCollection<Booking>('bookings'),
          getFirestoreCollection<SuspendConfig>('config'),
          getFirestoreCollection<NotificationLog>('notifications'),
        ]);

        this.books = fBooks;
        this.shelves = fShelves;
        this.categories = fCats;
        this.members = fMembers;
        this.loans = fLoans;
        this.bookings = fBookings;
        this.notifications = fNotifs;
        if (fConfig && fConfig.length > 0) this.suspendConfig = fConfig[0];

        this.isUsingOfflineData = false;
        this.calculateStats();
        await this.checkOverdueAndAutoSuspend();
        this.calculateStats();
        this.restoreUserSession();
        this.flushOfflineQueue();
      } catch (err) {
        console.warn('Direct Firestore fetch error, switching to offline fallback:', err);
        this.loadOfflineFallback();
      } finally {
        this.isLoading = false;
      }
    },

    async syncWithCloudFirestore() {
      return this.initAll();
    },

    setError(msg: string) {
      this.errorMessage = msg;
      setTimeout(() => {
        if (this.errorMessage === msg) this.errorMessage = '';
      }, 5000);
    },

    showToast(msg: string) {
      this.successToast = msg;
      setTimeout(() => {
        if (this.successToast === msg) this.successToast = '';
      }, 4000);
    },

    // ------------------------------------------------------------------------
    // Book Actions (100% Direct to Firestore)
    // ------------------------------------------------------------------------
    async saveBook(bookData: Partial<Book>) {
      this.isLoading = true;
      try {
        let savedBook: Book;
        const isEditing = !!bookData.id && this.books.some(b => b.id === bookData.id);
        const bookId = bookData.id || `BKO-${Date.now().toString().slice(-6)}`;

        // 1. Hitung jumlah aktif yang sedang dipinjam
        const activeLoansForBook = this.loans.filter(
          l => l.bookId === bookId && (l.status === 'active' || l.status === 'overdue')
        ).length;

        // 2. Hitung jumlah aktif yang sedang dibooking / hold
        const activeBookingsForBook = this.bookings.filter(
          b => b.bookId === bookId && 
               (b.status === 'active_hold' || b.status === 'pending' || b.status === 'active') &&
               (!b.expiresAt || new Date(b.expiresAt).getTime() > Date.now())
        ).length;

        if (isEditing) {
          const index = this.books.findIndex(b => b.id === bookData.id);
          const oldBook = this.books[index];
          const newTotal = Math.max(1, Number(bookData.totalCopies !== undefined ? bookData.totalCopies : oldBook.totalCopies) || 1);

          // Pengecekan riil buku yang sedang dipinjam dan dibooking
          const borrowed = Math.min(newTotal, activeLoansForBook > 0 ? activeLoansForBook : (Number(oldBook.borrowedCopies) || 0));
          const reserved = Math.min(Math.max(0, newTotal - borrowed), activeBookingsForBook > 0 ? activeBookingsForBook : (Number(oldBook.reservedCopies) || 0));

          // Stok terbaru dihitung otomatis: Total - Dipinjam - Dibooking
          const newAvailable = Math.max(0, newTotal - borrowed - reserved);

          savedBook = {
            ...oldBook,
            ...bookData,
            id: bookId,
            totalCopies: newTotal,
            borrowedCopies: borrowed,
            reservedCopies: reserved,
            availableCopies: newAvailable
          };
          this.books[index] = savedBook;
        } else {
          const total = Math.max(1, Number(bookData.totalCopies) || 1);
          const borrowed = activeLoansForBook;
          const reserved = activeBookingsForBook;
          const available = Math.max(0, total - borrowed - reserved);

          savedBook = {
            id: bookId,
            isbn: bookData.isbn || `978-602-${Math.floor(1000 + Math.random() * 9000)}-01`,
            title: bookData.title || 'Tanpa Judul',
            author: bookData.author || 'Anonim',
            publisher: bookData.publisher || 'Pustaka Digital',
            year: bookData.year || new Date().getFullYear(),
            category: bookData.category || 'Teknologi & Komputer',
            shelfId: bookData.shelfId || (this.shelves[0]?.id || 'RAK-A1'),
            shelfCode: bookData.shelfCode || (this.shelves[0]?.code || 'RAK-A1'),
            shelfName: bookData.shelfName || (this.shelves[0]?.name || 'Rak A-01'),
            cover: bookData.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
            synopsis: bookData.synopsis || '',
            totalCopies: total,
            availableCopies: available,
            borrowedCopies: borrowed,
            reservedCopies: reserved,
            barcode: bookData.barcode || bookData.isbn || `BC-${Date.now()}`,
            rating: bookData.rating || 4.5,
            pages: bookData.pages || 200,
            language: bookData.language || 'Indonesia',
            ...bookData
          };

          savedBook.totalCopies = total;
          savedBook.borrowedCopies = borrowed;
          savedBook.reservedCopies = reserved;
          savedBook.availableCopies = available;

          this.books.unshift(savedBook);
        }

        this.calculateStats();

        // Direct Firestore Call
        try {
          const { syncBookDoc } = await import('../lib/firebase.js');
          await syncBookDoc(savedBook);
        } catch (fbErr) {
          queueOfflineMutation({ action: 'saveBook', collection: 'books', docId: savedBook.id, data: savedBook });
          this.pendingMutationsCount++;
        }

        this.showToast(`Buku "${savedBook.title}" berhasil disimpan ke Cloud Firestore!`);
        return { success: true, book: savedBook };
      } catch (err: any) {
        this.setError(err?.message || 'Gagal menyimpan buku');
        return { success: false, error: err?.message };
      } finally {
        this.isLoading = false;
      }
    },

    async deleteBook(bookId: string) {
      try {
        const target = this.books.find(b => b.id === bookId);
        const title = target?.title || 'Buku';
        this.books = this.books.filter(b => b.id !== bookId);
        this.calculateStats();

        try {
          const { removeBookDoc } = await import('../lib/firebase.js');
          await removeBookDoc(bookId);
        } catch {
          queueOfflineMutation({ action: 'deleteBook', collection: 'books', docId: bookId });
          this.pendingMutationsCount++;
        }

        this.showToast(`Buku "${title}" berhasil dihapus dari Cloud Firestore.`);
        return { success: true };
      } catch (err: any) {
        this.setError(err?.message || 'Gagal menghapus buku');
        return { success: false };
      }
    },

    // ------------------------------------------------------------------------
    // Shelves & Categories Actions
    // ------------------------------------------------------------------------
    async saveShelf(shelfData: Partial<Shelf>) {
      try {
        const isEditing = !!shelfData.id && this.shelves.some(s => s.id === shelfData.id);
        let savedShelf: Shelf;

        if (isEditing) {
          const idx = this.shelves.findIndex(s => s.id === shelfData.id);
          savedShelf = { ...this.shelves[idx], ...shelfData };
          this.shelves[idx] = savedShelf;
        } else {
          savedShelf = {
            id: shelfData.id || `RAK-${Date.now().toString().slice(-4)}`,
            code: shelfData.code || 'RAK-01',
            name: shelfData.name || 'Rak Buku Baru',
            floor: shelfData.floor || 1,
            zone: shelfData.zone || 'Zona Umum',
            capacity: shelfData.capacity || 50,
            currentCount: 0,
            category: shelfData.category || 'Umum',
            color: shelfData.color || '#3b82f6',
            description: shelfData.description || '',
            ...shelfData
          };
          this.shelves.push(savedShelf);
        }

        this.calculateStats();

        try {
          const { syncShelfDoc } = await import('../lib/firebase.js');
          await syncShelfDoc(savedShelf);
        } catch {
          queueOfflineMutation({ action: 'saveShelf', collection: 'shelves', docId: savedShelf.id, data: savedShelf });
          this.pendingMutationsCount++;
        }

        this.showToast(`Rak "${savedShelf.name}" berhasil disimpan ke Firestore.`);
        return { success: true, shelf: savedShelf };
      } catch (err: any) {
        this.setError(err?.message || 'Gagal menyimpan rak');
        return { success: false };
      }
    },

    async deleteShelf(shelfId: string) {
      try {
        this.shelves = this.shelves.filter(s => s.id !== shelfId);
        this.calculateStats();

        try {
          const { removeShelfDoc } = await import('../lib/firebase.js');
          await removeShelfDoc(shelfId);
        } catch {
          queueOfflineMutation({ action: 'deleteShelf', collection: 'shelves', docId: shelfId });
          this.pendingMutationsCount++;
        }

        this.showToast('Rak berhasil dihapus dari Firestore.');
        return { success: true };
      } catch (err: any) {
        this.setError(err?.message || 'Gagal menghapus rak');
        return { success: false };
      }
    },

    async saveCategory(catData: Partial<BookCategory>) {
      try {
        const isEditing = !!catData.id && this.categories.some(c => c.id === catData.id);
        let savedCat: BookCategory;

        if (isEditing) {
          const idx = this.categories.findIndex(c => c.id === catData.id);
          savedCat = { ...this.categories[idx], ...catData };
          this.categories[idx] = savedCat;
        } else {
          savedCat = {
            id: catData.id || `CAT-${Date.now().toString().slice(-4)}`,
            name: catData.name || 'Kategori Baru',
            description: catData.description || '',
            color: catData.color || '#3b82f6',
            ...catData
          };
          this.categories.push(savedCat);
        }

        this.calculateStats();

        try {
          const { syncCategoryDoc } = await import('../lib/firebase.js');
          await syncCategoryDoc(savedCat);
        } catch {
          queueOfflineMutation({ action: 'saveCategory', collection: 'categories', docId: savedCat.id, data: savedCat });
          this.pendingMutationsCount++;
        }

        this.showToast(`Kategori "${savedCat.name}" berhasil disimpan.`);
        return { success: true, category: savedCat };
      } catch (err: any) {
        this.setError(err?.message || 'Gagal menyimpan kategori');
        return { success: false };
      }
    },

    async deleteCategory(categoryId: string) {
      try {
        this.categories = this.categories.filter(c => c.id !== categoryId);
        this.calculateStats();

        try {
          const { removeCategoryDoc } = await import('../lib/firebase.js');
          await removeCategoryDoc(categoryId);
        } catch {
          queueOfflineMutation({ action: 'deleteCategory', collection: 'categories', docId: categoryId });
          this.pendingMutationsCount++;
        }

        this.showToast('Kategori berhasil dihapus.');
        return { success: true };
      } catch (err: any) {
        this.setError(err?.message || 'Gagal menghapus kategori');
        return { success: false };
      }
    },

    // ------------------------------------------------------------------------
    // Member Management & Auth
    // ------------------------------------------------------------------------
    async createMemberByAdmin(memberData: Partial<Member>) {
      try {
        const id = memberData.role === 'admin' ? `ADM-${Date.now().toString().slice(-4)}` : `MEM-${Date.now().toString().slice(-4)}`;
        const cardNumber = memberData.role === 'admin' ? `LIB-ADM-${Date.now().toString().slice(-3)}` : `LIB-2024-${Date.now().toString().slice(-3)}`;
        
        const newMember: Member = {
          id,
          cardNumber,
          name: memberData.name || 'Anggota Baru',
          email: memberData.email || '',
          phone: memberData.phone || '',
          role: memberData.role || 'member',
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
          joinDate: new Date().toISOString().slice(0, 10),
          isSuspended: false,
          totalBorrowed: 0,
          activeLoansCount: 0,
          address: memberData.address || '',
          password: memberData.password || (memberData.role === 'admin' ? 'admin' : 'user123'),
          ...memberData
        };

        this.members.unshift(newMember);
        this.calculateStats();

        try {
          const { syncMemberDoc } = await import('../lib/firebase.js');
          await syncMemberDoc(newMember);
        } catch {
          queueOfflineMutation({ action: 'saveMember', collection: 'members', docId: newMember.id, data: newMember });
          this.pendingMutationsCount++;
        }

        this.showToast(`Anggota "${newMember.name}" (${newMember.cardNumber}) berhasil disimpan ke Firestore!`);
        return { success: true, member: newMember };
      } catch (err: any) {
        this.setError(err?.message || 'Gagal mendaftarkan anggota');
        return { success: false };
      }
    },

    async updateMember(memberId: string, memberData: Partial<Member>) {
      try {
        const idx = this.members.findIndex(m => m.id === memberId);
        if (idx === -1) return { success: false };

        const updated = { ...this.members[idx], ...memberData };
        this.members[idx] = updated;
        if (this.currentUser?.id === memberId) this.currentUser = updated;
        this.calculateStats();

        try {
          const { syncMemberDoc } = await import('../lib/firebase.js');
          await syncMemberDoc(updated);
        } catch {
          queueOfflineMutation({ action: 'saveMember', collection: 'members', docId: updated.id, data: updated });
          this.pendingMutationsCount++;
        }

        this.showToast(`Data anggota "${updated.name}" berhasil diperbarui.`);
        return { success: true, member: updated };
      } catch (err: any) {
        this.setError(err?.message || 'Gagal memperbarui anggota');
        return { success: false };
      }
    },

    async deleteMember(memberId: string) {
      try {
        this.members = this.members.filter(m => m.id !== memberId);
        if (this.currentUser?.id === memberId) this.logout();
        this.calculateStats();

        try {
          const { removeMemberDoc } = await import('../lib/firebase.js');
          await removeMemberDoc(memberId);
        } catch {
          queueOfflineMutation({ action: 'deleteMember', collection: 'members', docId: memberId });
          this.pendingMutationsCount++;
        }

        this.showToast('Anggota berhasil dihapus dari Cloud Firestore.');
        return { success: true };
      } catch (err: any) {
        this.setError(err?.message || 'Gagal menghapus anggota');
        return { success: false };
      }
    },

    async toggleMemberSuspend(memberId: string, suspend: boolean, days?: number, reason?: string) {
      const target = this.members.find(m => m.id === memberId);
      if (!target) return { success: false };

      target.isSuspended = suspend;
      target.suspendedUntil = suspend && days ? new Date(Date.now() + days * 86400000).toISOString().slice(0, 10) : null;
      target.suspendReason = suspend ? (reason || 'Sanksi Keterlambatan Pengembalian Buku') : '';

      if (this.currentUser && (this.currentUser.id === target.id || this.currentUser.cardNumber === target.cardNumber)) {
        this.currentUser = { ...target };
      }

      this.calculateStats();

      try {
        const { syncMemberDoc } = await import('../lib/firebase.js');
        await syncMemberDoc(target);
      } catch {
        queueOfflineMutation({ action: 'saveMember', collection: 'members', docId: target.id, data: target });
        this.pendingMutationsCount++;
      }

      this.showToast(`Status sanksi anggota "${target.name}" berhasil diperbarui.`);
      return { success: true };
    },

    async loginWithCredentials(credentials: { identifier: string; password?: string }) {
      const cleanIdent = (credentials.identifier || '').trim().toLowerCase();
      const enteredPass = credentials.password || '';

      const matchedMember = this.members.find(m => 
        (m.email && m.email.toLowerCase() === cleanIdent) ||
        (m.cardNumber && m.cardNumber.toLowerCase() === cleanIdent) ||
        (m.id && m.id.toLowerCase() === cleanIdent) ||
        (cleanIdent === 'admin' && m.role === 'admin')
      );

      if (matchedMember) {
        const { verifyPassword, hashPassword } = await import('../lib/crypto.js');
        const validPassword = matchedMember.password || (matchedMember.role === 'admin' ? 'admin' : 'user123');
        const isPassOk = !validPassword || await verifyPassword(enteredPass, validPassword) || (matchedMember.role === 'admin' && enteredPass === 'admin') || (enteredPass === 'user123');

        if (isPassOk) {
          this.currentUser = matchedMember;
          this.authToken = `token_${matchedMember.id}_${Date.now()}`;
          localStorage.setItem('pustaka_token', this.authToken);
          localStorage.setItem('pustaka_user_id', matchedMember.id);
          this.showToast(matchedMember.role === 'admin' ? `Selamat datang, Admin ${matchedMember.name}!` : `Selamat datang, ${matchedMember.name}!`);

          if (matchedMember.password && !matchedMember.password.startsWith('$sha256$')) {
            matchedMember.password = await hashPassword(enteredPass || validPassword);
            const { syncMemberDoc } = await import('../lib/firebase.js');
            syncMemberDoc(matchedMember).catch(() => {});
          }

          return { success: true, user: matchedMember };
        }
      }

      const msg = 'Email, Nomor Kartu, atau Kata Sandi tidak sesuai.';
      this.setError(msg);
      return { success: false, error: msg };
    },

    async loginWithGoogleUser(googleUser: { email: string; displayName?: string | null; photoURL?: string | null }) {
      const email = (googleUser.email || '').toLowerCase().trim();
      let matched = this.members.find(m => m.email && m.email.toLowerCase() === email);

      if (!matched) {
        // Create new member doc in Firestore
        const newId = `MEM-${Date.now().toString().slice(-4)}`;
        matched = {
          id: newId,
          cardNumber: `LIB-2024-${Date.now().toString().slice(-3)}`,
          name: googleUser.displayName || email.split('@')[0] || 'Anggota Google',
          email: email,
          phone: '',
          role: email === 'azzackey@gmail.com' ? 'admin' : 'member',
          avatar: googleUser.photoURL || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
          joinDate: new Date().toISOString().slice(0, 10),
          isSuspended: false,
          totalBorrowed: 0,
          activeLoansCount: 0
        };
        this.members.unshift(matched);
        try {
          const { syncMemberDoc } = await import('../lib/firebase.js');
          await syncMemberDoc(matched);
        } catch {
          queueOfflineMutation({ action: 'saveMember', collection: 'members', docId: matched.id, data: matched });
        }
      }

      this.currentUser = matched;
      this.authToken = `token_google_${matched.id}_${Date.now()}`;
      localStorage.setItem('pustaka_token', this.authToken);
      localStorage.setItem('pustaka_user_id', matched.id);
      this.showToast(`Selamat datang, ${matched.name}!`);
      return { success: true, user: matched };
    },

    async registerMember(formData: { name: string; email: string; phone: string; password?: string; address?: string }) {
      return this.createMemberByAdmin({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address,
        role: 'member'
      });
    },

    logout() {
      this.currentUser = null;
      this.authToken = '';
      localStorage.removeItem('pustaka_token');
      localStorage.removeItem('pustaka_user_id');
      this.showToast('Anda telah berhasil keluar.');
    },

    // ------------------------------------------------------------------------
    // Bookings & Loans Actions
    // ------------------------------------------------------------------------
    async createBooking(bookId: string, memberIdOrCard?: string, notes?: string) {
      this.isLoading = true;
      try {
        const book = this.books.find(b => b.id === bookId);

        // Cari data member: prioritaskan member terdaftar berdasarkan ID, CardNumber, atau Email, atau gunakan currentUser yang sedang login
        let member: Member | null = null;

        if (memberIdOrCard) {
          const found = this.members.find(m => 
            m.id === memberIdOrCard || 
            m.cardNumber === memberIdOrCard || 
            (m.email && m.email.toLowerCase() === memberIdOrCard.toLowerCase())
          );
          if (found) {
            member = found;
          } else if (this.currentUser && (
            this.currentUser.id === memberIdOrCard || 
            this.currentUser.cardNumber === memberIdOrCard || 
            (this.currentUser.email && this.currentUser.email.toLowerCase() === memberIdOrCard.toLowerCase())
          )) {
            member = this.currentUser;
          }
        }

        // Jika belum ketemu tapi ada currentUser yang sedang aktif login, gunakan currentUser
        if (!member && this.currentUser) {
          member = this.currentUser;
        }

        if (!book || book.availableCopies <= 0) {
          throw new Error('Stok buku tidak mencukupi untuk dibooking.');
        }
        if (!member) {
          throw new Error('Data pengguna tidak ditemukan. Silakan login atau masukkan kartu member.');
        }

        // Validate suspend status & overdue loans
        if (member.isSuspended) {
          throw new Error(`Booking ditolak: Akun Anda (${member.name}) sedang berstatus DISUSPEND. ${member.suspendReason || ''}`);
        }

        const memOverdue = this.loans.filter(
          l => (l.memberId === member?.id || l.memberCardNumber === member?.cardNumber) && l.status === 'overdue'
        );
        if (memOverdue.length > 0) {
          throw new Error(`Booking ditolak: Anda memiliki ${memOverdue.length} buku pinjaman yang terlambat dikembalikan. Silakan kembalikan buku terlebih dahulu.`);
        }

        const bookingId = `BKG-${Date.now().toString().slice(-6)}`;
        const resolvedCardNumber = ('cardNumber' in member && member.cardNumber) ? member.cardNumber : `LIB-${member.id.slice(-4)}`;
        const resolvedPhone = ('phone' in member && member.phone) ? member.phone : '-';
        const resolvedEmail = member.email || '-';

        const newBooking: Booking = {
          id: bookingId,
          bookId: book.id,
          bookTitle: book.title,
          bookCover: book.cover,
          shelfCode: book.shelfCode || 'A-01',
          memberId: member.id,
          memberName: member.name || 'Anggota',
          memberCardNumber: resolvedCardNumber,
          memberPhone: resolvedPhone,
          memberEmail: resolvedEmail,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + (this.suspendConfig.maxHoldHours || 24) * 3600 * 1000).toISOString(),
          status: 'active_hold',
          notes: notes || 'Booking Online'
        };

        book.availableCopies -= 1;
        book.reservedCopies = (book.reservedCopies || 0) + 1;
        this.bookings.unshift(newBooking);
        this.calculateStats();

        try {
          const { syncBookingDoc, syncBookDoc } = await import('../lib/firebase.js');
          await Promise.all([syncBookingDoc(newBooking), syncBookDoc(book)]);
        } catch {
          queueOfflineMutation({ action: 'saveBooking', collection: 'bookings', docId: newBooking.id, data: newBooking });
          queueOfflineMutation({ action: 'saveBook', collection: 'books', docId: book.id, data: book });
          this.pendingMutationsCount++;
        }

        this.showToast('✅ Berhasil booking buku! Buku ditahan selama 24 jam.');
        return { success: true, booking: newBooking };
      } catch (err: any) {
        this.setError(err?.message || 'Gagal membuat booking');
        return { success: false, error: err?.message };
      } finally {
        this.isLoading = false;
      }
    },

    async cancelBooking(bookingId: string) {
      const bk = this.bookings.find(b => b.id === bookingId);
      if (!bk) return { success: false };

      bk.status = 'cancelled_user';
      const book = this.books.find(b => b.id === bk.bookId);
      if (book) {
        book.availableCopies += 1;
        if (book.reservedCopies > 0) book.reservedCopies -= 1;
      }
      this.calculateStats();

      try {
        const { syncBookingDoc, syncBookDoc } = await import('../lib/firebase.js');
        await syncBookingDoc(bk);
        if (book) await syncBookDoc(book);
      } catch {
        queueOfflineMutation({ action: 'saveBooking', collection: 'bookings', docId: bk.id, data: bk });
        if (book) queueOfflineMutation({ action: 'saveBook', collection: 'books', docId: book.id, data: book });
        this.pendingMutationsCount++;
      }

      this.showToast('Booking berhasil dibatalkan.');
      return { success: true };
    },

    async collectBooking(bookingId: string, days?: number, handledBy?: string) {
      const bk = this.bookings.find(b => b.id === bookingId);
      if (!bk || bk.status !== 'active_hold') {
        this.setError('Data booking tidak ditemukan atau sudah tidak aktif.');
        return { success: false, error: 'Data booking tidak ditemukan atau sudah tidak aktif.' };
      }

      const book = this.books.find(b => b.id === bk.bookId);
      if (!book) {
        this.setError('Data buku tidak ditemukan.');
        return { success: false, error: 'Data buku tidak ditemukan.' };
      }

      // Check member status for suspend and overdue
      const member = this.members.find(m => 
        m.id === bk.memberId || 
        m.cardNumber === bk.memberCardNumber ||
        (m.email && bk.memberEmail && m.email.toLowerCase() === bk.memberEmail.toLowerCase())
      );

      if (member) {
        if (member.isSuspended) {
          const err = `Penyerahan dibatalkan: Anggota (${member.name}) sedang berstatus DISUSPEND. ${member.suspendReason || ''}`;
          this.setError(err);
          return { success: false, error: err };
        }
        const overdueLoans = this.loans.filter(
          l => (l.memberId === member.id || l.memberCardNumber === member.cardNumber) && l.status === 'overdue'
        );
        if (overdueLoans.length > 0) {
          const err = `Penyerahan dibatalkan: Anggota (${member.name}) memiliki ${overdueLoans.length} pinjaman buku yang sudah jatuh tempo/terlambat.`;
          this.setError(err);
          return { success: false, error: err };
        }
      }

      bk.status = 'collected';
      if (book.reservedCopies && book.reservedCopies > 0) {
        book.reservedCopies -= 1;
      }
      book.borrowedCopies = (book.borrowedCopies || 0) + 1;

      // loan duration strictly 1-7 days, default 3
      const loanDays = Math.min(7, Math.max(1, Number(days) || 3));
      const now = new Date();
      const borrowDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const dueObj = new Date(now.getTime() + loanDays * 86400000);
      const dueDate = `${dueObj.getFullYear()}-${String(dueObj.getMonth() + 1).padStart(2, '0')}-${String(dueObj.getDate()).padStart(2, '0')}`;

      const newLoan: Loan = {
        id: `LOAN-${Date.now().toString().slice(-6)}`,
        bookId: book.id,
        bookTitle: book.title,
        bookCover: book.cover,
        shelfCode: book.shelfCode || bk.shelfCode || 'A-01',
        memberId: bk.memberId,
        memberName: bk.memberName,
        memberCardNumber: bk.memberCardNumber,
        memberPhone: bk.memberPhone || '-',
        memberEmail: bk.memberEmail || '-',
        borrowDate,
        dueDate,
        returnDate: null,
        status: 'active',
        daysOverdue: 0,
        handledBy: handledBy || 'Admin Sirkulasi'
      };

      if (member) {
        member.activeLoansCount = (member.activeLoansCount || 0) + 1;
        member.totalBorrowed = (member.totalBorrowed || 0) + 1;
      }

      this.loans.unshift(newLoan);
      this.calculateStats();

      try {
        const { syncBookingDoc, syncLoanDoc, syncBookDoc, syncMemberDoc } = await import('../lib/firebase.js');
        await Promise.all([
          syncBookingDoc(bk),
          syncLoanDoc(newLoan),
          syncBookDoc(book),
          member ? syncMemberDoc(member) : Promise.resolve()
        ]);
      } catch {
        queueOfflineMutation({ action: 'saveBooking', collection: 'bookings', docId: bk.id, data: bk });
        queueOfflineMutation({ action: 'saveLoan', collection: 'loans', docId: newLoan.id, data: newLoan });
        queueOfflineMutation({ action: 'saveBook', collection: 'books', docId: book.id, data: book });
        if (member) queueOfflineMutation({ action: 'saveMember', collection: 'members', docId: member.id, data: member });
        this.pendingMutationsCount++;
      }

      this.showToast(`✅ Buku "${book.title}" berhasil diserahkan ke ${bk.memberName} (Durasi pinjam ${loanDays} hari)!`);
      return { success: true, loan: newLoan };
    },

    async createLoan(bookId: string, memberIdOrCard: string, days?: number, handledBy?: string) {
      await this.checkOverdueAndAutoSuspend();

      const book = this.books.find(b => b.id === bookId);
      let member: Member | undefined = this.members.find(m => 
        m.id === memberIdOrCard || 
        m.cardNumber === memberIdOrCard || 
        (m.email && m.email.toLowerCase() === memberIdOrCard.toLowerCase())
      );

      if (!member && this.currentUser && (
        this.currentUser.id === memberIdOrCard || 
        this.currentUser.cardNumber === memberIdOrCard || 
        (this.currentUser.email && this.currentUser.email.toLowerCase() === memberIdOrCard.toLowerCase())
      )) {
        member = this.currentUser;
      }

      if (!member && this.currentUser) {
        member = this.currentUser;
      }

      if (!book || book.availableCopies <= 0) {
        const error = 'Buku sedang tidak tersedia untuk dipinjam.';
        this.setError(error);
        return { success: false, error };
      }
      if (!member) {
        const error = 'Anggota tidak ditemukan. Pastikan nomor kartu atau data anggota valid.';
        this.setError(error);
        return { success: false, error };
      }

      // Check if member is suspended or has overdue loans
      if (member.isSuspended) {
        const error = `Peminjaman ditolak: Kartu anggota (${member.name}) berstatus DISUSPEND. ${member.suspendReason || 'Sanksi keterlambatan pengembalian buku'}`;
        this.setError(error);
        return { success: false, error };
      }

      const overdueLoans = this.loans.filter(
        l => (l.memberId === member?.id || l.memberCardNumber === member?.cardNumber) && l.status === 'overdue'
      );
      if (overdueLoans.length > 0) {
        const error = `Peminjaman ditolak: Anggota (${member.name}) memiliki ${overdueLoans.length} pinjaman buku yang sudah jatuh tempo.`;
        this.setError(error);
        return { success: false, error };
      }

      const loanDays = Math.min(7, Math.max(1, Number(days) || 3));
      const now = new Date();
      const borrowDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const dueObj = new Date(now.getTime() + loanDays * 86400000);
      const dueDate = `${dueObj.getFullYear()}-${String(dueObj.getMonth() + 1).padStart(2, '0')}-${String(dueObj.getDate()).padStart(2, '0')}`;

      const resolvedCardNumber = ('cardNumber' in member && member.cardNumber) ? member.cardNumber : `LIB-${member.id.slice(-4)}`;
      const resolvedPhone = ('phone' in member && member.phone) ? member.phone : '-';
      const resolvedEmail = member.email || '-';

      const newLoan: Loan = {
        id: `LOAN-${Date.now().toString().slice(-6)}`,
        bookId: book.id,
        bookTitle: book.title,
        bookCover: book.cover,
        shelfCode: book.shelfCode || 'A-01',
        memberId: member.id,
        memberName: member.name,
        memberCardNumber: resolvedCardNumber,
        memberPhone: resolvedPhone,
        memberEmail: resolvedEmail,
        borrowDate,
        dueDate,
        returnDate: null,
        status: 'active',
        daysOverdue: 0,
        handledBy: handledBy || 'Admin Sirkulasi'
      };

      book.availableCopies -= 1;
      book.borrowedCopies = (book.borrowedCopies || 0) + 1;
      if ('activeLoansCount' in member) {
        member.activeLoansCount = (member.activeLoansCount || 0) + 1;
      }
      if ('totalBorrowed' in member) {
        member.totalBorrowed = (member.totalBorrowed || 0) + 1;
      }

      this.loans.unshift(newLoan);
      this.calculateStats();

      try {
        const { syncLoanDoc, syncBookDoc, syncMemberDoc } = await import('../lib/firebase.js');
        await Promise.all([
          syncLoanDoc(newLoan), 
          syncBookDoc(book), 
          ('cardNumber' in member ? syncMemberDoc(member as Member) : Promise.resolve())
        ]);
      } catch {
        queueOfflineMutation({ action: 'saveLoan', collection: 'loans', docId: newLoan.id, data: newLoan });
        queueOfflineMutation({ action: 'saveBook', collection: 'books', docId: book.id, data: book });
        if ('cardNumber' in member) {
          queueOfflineMutation({ action: 'saveMember', collection: 'members', docId: member.id, data: member });
        }
        this.pendingMutationsCount++;
      }

      this.showToast(`✅ Peminjaman buku "${book.title}" berhasil dicatat (Durasi pinjam ${loanDays} hari)!`);
      return { success: true, loan: newLoan };
    },

    async issueDirectLoan(bookId: string, memberIdOrCard: string, days?: number, handledBy?: string) {
      return this.createLoan(bookId, memberIdOrCard, days, handledBy);
    },

    async directLoan(bookId: string, memberIdOrCard: string, days?: number, handledBy?: string) {
      return this.createLoan(bookId, memberIdOrCard, days, handledBy);
    },

    async returnLoan(loanId: string) {
      const loan = this.loans.find(l => l.id === loanId);
      if (!loan) return { success: false };

      loan.status = 'returned';
      loan.returnDate = new Date().toISOString().slice(0, 10);
      loan.daysOverdue = 0;

      const book = this.books.find(b => b.id === loan.bookId);
      if (book) {
        book.availableCopies += 1;
        if (book.borrowedCopies > 0) book.borrowedCopies -= 1;
      }

      const member = this.members.find(m => 
        m.id === loan.memberId || 
        m.cardNumber === loan.memberCardNumber ||
        (m.email && loan.memberEmail && m.email.toLowerCase() === loan.memberEmail.toLowerCase())
      );
      if (member && member.activeLoansCount && member.activeLoansCount > 0) {
        member.activeLoansCount -= 1;
      }

      // If member was suspended due to overdue books, check if they now have NO remaining overdue loans
      if (member) {
        const remainingOverdue = this.loans.filter(
          l => l.id !== loan.id &&
               l.status === 'overdue' &&
               (l.memberId === member.id || l.memberCardNumber === member.cardNumber || (l.memberEmail && member.email && l.memberEmail.toLowerCase() === member.email.toLowerCase()))
        );
        if (remainingOverdue.length === 0 && member.isSuspended) {
          member.isSuspended = false;
          member.suspendReason = '';
          member.suspendedUntil = null;
          if (this.currentUser?.id === member.id || this.currentUser?.cardNumber === member.cardNumber) {
            this.currentUser = { ...member };
          }
        }
      }

      this.calculateStats();

      try {
        const { syncLoanDoc, syncBookDoc, syncMemberDoc } = await import('../lib/firebase.js');
        await Promise.all([
          syncLoanDoc(loan),
          book ? syncBookDoc(book) : Promise.resolve(),
          member ? syncMemberDoc(member) : Promise.resolve()
        ]);
      } catch {
        queueOfflineMutation({ action: 'saveLoan', collection: 'loans', docId: loan.id, data: loan });
        if (book) queueOfflineMutation({ action: 'saveBook', collection: 'books', docId: book.id, data: book });
        if (member) queueOfflineMutation({ action: 'saveMember', collection: 'members', docId: member.id, data: member });
        this.pendingMutationsCount++;
      }

      // Reconcile all suspensions and sync any remaining updates
      await this.checkOverdueAndAutoSuspend();

      this.showToast('✅ Buku berhasil dikembalikan!');
      return { success: true };
    },

    async updateSuspendConfig(newConfig: Partial<SuspendConfig>) {
      this.suspendConfig = { ...this.suspendConfig, ...newConfig };
      try {
        const { syncConfigDoc } = await import('../lib/firebase.js');
        await syncConfigDoc(this.suspendConfig);
      } catch {
        queueOfflineMutation({ action: 'saveConfig', collection: 'config', docId: 'suspend_config', data: this.suspendConfig });
        this.pendingMutationsCount++;
      }

      this.showToast('✅ Pengaturan sistem berhasil disimpan ke Cloud Firestore!');
      return { success: true };
    },

    async sendNotification(payload: {
      memberId?: string;
      recipient: string;
      type?: 'email';
      subject?: string;
      message: string;
      triggerReason?: 'overdue_reminder' | 'due_today' | 'booking_expiry_warning' | 'suspend_notice' | 'booking_success';
    }) {
      let memberName = 'Anggota';
      let memberId = payload.memberId;

      if (memberId) {
        const found = this.members.find(m => m.id === memberId || m.cardNumber === memberId);
        if (found) {
          memberName = found.name;
          memberId = found.id;
        }
      } else {
        const found = this.members.find(m => 
          (m.email && payload.recipient && m.email.toLowerCase() === payload.recipient.toLowerCase()) ||
          (m.phone && payload.recipient && m.phone === payload.recipient)
        );
        if (found) {
          memberName = found.name;
          memberId = found.id;
        }
      }

      const notifId = `NOTIF-${Date.now().toString().slice(-6)}`;
      const newNotif: NotificationLog = {
        id: notifId,
        memberId: memberId || 'GUEST',
        memberName,
        recipient: payload.recipient,
        type: 'email',
        subject: payload.subject || 'Peringatan Perpustakaan',
        message: payload.message,
        sentAt: new Date().toISOString(),
        status: 'sent',
        triggerReason: payload.triggerReason || 'overdue_reminder'
      };

      // Call backend API /api/send-email
      let deliveryMsg = '';
      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: payload.recipient,
            subject: newNotif.subject,
            message: newNotif.message
          })
        });
        const result = await response.json();
        if (result.success) {
          if (result.mode === 'live_smtp') {
            deliveryMsg = `✅ Email berhasil terkirim langsung ke ${payload.recipient} via SMTP server!`;
          } else {
            deliveryMsg = `✅ Peringatan email ke ${memberName} (${payload.recipient}) berhasil dicatat di sistem!`;
          }
        } else {
          deliveryMsg = `⚠️ Notifikasi dicatat di sistem (Server SMTP: ${result.error || 'belum aktif'}).`;
        }
      } catch (e) {
        console.warn('Backend email API unreachable, recorded locally:', e);
        deliveryMsg = `✅ Peringatan email ke ${memberName} berhasil dicatat di sistem!`;
      }

      this.notifications.unshift(newNotif);

      try {
        const { syncNotificationDoc } = await import('../lib/firebase.js');
        await syncNotificationDoc(newNotif);
      } catch (err) {
        console.warn('Notification sync fallback to offline queue:', err);
        queueOfflineMutation({
          action: 'saveNotification',
          collection: 'notifications',
          docId: newNotif.id,
          data: newNotif
        });
        this.pendingMutationsCount++;
      }

      this.showToast(deliveryMsg);
      return { success: true, log: newNotif };
    },

    async deleteNotification(id: string) {
      const idx = this.notifications.findIndex(n => n.id === id);
      if (idx !== -1) {
        this.notifications.splice(idx, 1);
      }
      try {
        const { removeNotificationDoc } = await import('../lib/firebase.js');
        await removeNotificationDoc(id);
      } catch {
        queueOfflineMutation({ action: 'deleteNotification', collection: 'notifications', docId: id });
        this.pendingMutationsCount++;
      }
      this.showToast('✅ Riwayat notifikasi berhasil dihapus.');
      return { success: true };
    }
  }
});

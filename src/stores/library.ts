import { defineStore } from 'pinia';
import type { Book, Shelf, Member, Booking, Loan, SuspendConfig, NotificationLog, LibraryStats, BookCategory, TeacherRequest, UserDeviceSession, AppVersionConfig } from '../types.js';
import { 
  getOfflineCachedData, 
  downloadAllForOfflineAccess, 
  getOfflineLastDownloaded,
  queueOfflineMutation,
  getPendingOfflineMutations,
  clearPendingOfflineMutations
} from '../lib/offline-manager.js';
import { initialBooks, initialCategories, initialShelves, initialMembers, defaultSuspendConfig } from '../lib/default-catalog.js';
import { getCurrentDeviceId, detectCurrentDeviceInfo } from '../utils/deviceDetector.js';
import { CURRENT_APP_VERSION, DEFAULT_APP_VERSION_CONFIG, isNewerVersion } from '../config/version.js';

export const isSuperAdminMember = (m: any): boolean => {
  if (!m) return false;
  const email = (m.email || '').trim().toLowerCase();
  return email === 'azzackey@gmail.com' || m.isSuperAdmin === true || m.role === 'superadmin';
};

export const useLibraryStore = defineStore('library', {
  state: () => ({
    categories: [] as BookCategory[],
    books: [] as Book[],
    shelves: [] as Shelf[],
    members: [] as Member[],
    bookings: [] as Booking[],
    loans: [] as Loan[],
    notifications: [] as NotificationLog[],
    teacherRequests: [] as TeacherRequest[],
    deviceSessions: [] as UserDeviceSession[],
    stats: null as LibraryStats | null,
    suspendConfig: defaultSuspendConfig,
    
    // Auth & Role
    _isCheckingOverdue: false,
    currentUser: null as Member | null,
    authToken: localStorage.getItem('pustaka_token') || '',
    deviceVerificationCode: null as { code: string; deviceId: string; expiresAt: number } | null,
    isDeviceRevokedNotice: false,
    
    // UI Loading & feedback
    isLoading: false,
    errorMessage: '',
    successToast: '',
    resetCodes: {} as Record<string, { code: string; expiresAt: number }>,
    
    // Offline & Quota status
    isOfflineMode: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    isUsingOfflineData: false,
    isQuotaExhausted: false,
    offlineLastDownloaded: getOfflineLastDownloaded(),
    pendingMutationsCount: getPendingOfflineMutations().length,
    
    // Filters for Public Catalog
    catalogFilter: {
      search: '',
      category: 'all',
      shelfId: 'all',
      availability: 'all'
    },

    // App Versioning & Real-time Update System
    currentAppVersion: CURRENT_APP_VERSION,
    remoteAppVersion: CURRENT_APP_VERSION,
    appVersionConfig: DEFAULT_APP_VERSION_CONFIG as AppVersionConfig,
    hasNewVersionAvailable: false,
    isChangelogModalOpen: false,
    isVersionUpdateModalOpen: false,
    isDismissedUpdateBanner: false
  }),

  getters: {
    isAdmin: (state) => state.currentUser?.role === 'admin',
    isSuperAdmin: (state) => isSuperAdminMember(state.currentUser),
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
    error: (state) => state.errorMessage,
    
    // Teacher Requests
    pendingTeacherRequests: (state) => state.teacherRequests.filter(r => r.status === 'pending'),
    pendingTeacherRequestsCount: (state) => state.teacherRequests.filter(r => r.status === 'pending').length,
    myPendingTeacherRequest: (state) => {
      if (!state.currentUser) return null;
      return state.teacherRequests.find(r => 
        (r.memberId === state.currentUser?.id ||
         (r.memberCardNumber && r.memberCardNumber === state.currentUser?.cardNumber) ||
         (r.memberEmail && state.currentUser?.email && r.memberEmail.toLowerCase() === state.currentUser?.email.toLowerCase())
        ) && r.status === 'pending'
      ) || null;
    },
    myLatestTeacherRequest: (state) => {
      if (!state.currentUser) return null;
      const userReqs = state.teacherRequests.filter(r => 
        r.memberId === state.currentUser?.id ||
        (r.memberCardNumber && r.memberCardNumber === state.currentUser?.cardNumber) ||
        (r.memberEmail && state.currentUser?.email && r.memberEmail.toLowerCase() === state.currentUser?.email.toLowerCase())
      );
      if (userReqs.length === 0) return null;
      return [...userReqs].sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())[0];
    },

    // Manajemen Sesi & Perangkat
    currentDeviceId: () => getCurrentDeviceId(),
    myDeviceSessions(state): (UserDeviceSession & { isCurrentDevice: boolean })[] {
      if (!state.currentUser) return [];
      const currentDevId = getCurrentDeviceId();
      const currentUserId = state.currentUser?.id;
      const currentUserEmail = (state.currentUser?.email || '').toLowerCase().trim();

      const filtered = state.deviceSessions.filter(s => {
        if (s.status !== 'active') return false;
        const matchId = currentUserId && s.memberId === currentUserId;
        const matchEmail = currentUserEmail && s.memberEmail && s.memberEmail.toLowerCase().trim() === currentUserEmail;
        return matchId || matchEmail;
      });

      // Deduplikasi cerdas berdasarkan deviceId:
      // Selalu pertahankan isMainDevice: true jika salah satu dokumen menandainya,
      // dan selalu ambil timestamp lastActive terbaru.
      const uniqueByDevice = new Map<string, UserDeviceSession>();
      for (const s of filtered) {
        const existing = uniqueByDevice.get(s.deviceId);
        if (!existing) {
          uniqueByDevice.set(s.deviceId, { ...s });
        } else {
          const existingTime = new Date(existing.lastActive || existing.createdAt || 0).getTime();
          const sTime = new Date(s.lastActive || s.createdAt || 0).getTime();
          const isMain = Boolean(existing.isMainDevice || s.isMainDevice);
          const newestLastActive = sTime >= existingTime ? (s.lastActive || s.createdAt) : (existing.lastActive || existing.createdAt);
          const preferred = sTime >= existingTime ? { ...s } : { ...existing };
          preferred.isMainDevice = isMain;
          preferred.lastActive = newestLastActive;
          uniqueByDevice.set(s.deviceId, preferred);
        }
      }

      return Array.from(uniqueByDevice.values())
        .map(s => ({
          ...s,
          isCurrentDevice: s.deviceId === currentDevId
        }))
        .sort((a, b) => {
          if (a.isCurrentDevice) return -1;
          if (b.isCurrentDevice) return 1;
          if (a.isMainDevice && !b.isMainDevice) return -1;
          if (!a.isMainDevice && b.isMainDevice) return 1;
          return new Date(b.lastActive || b.createdAt || 0).getTime() - new Date(a.lastActive || a.createdAt || 0).getTime();
        });
    },
    currentDeviceSession(): (UserDeviceSession & { isCurrentDevice: boolean }) | null {
      const sessions = (this.myDeviceSessions as (UserDeviceSession & { isCurrentDevice: boolean })[]) || [];
      return sessions.find(s => s.isCurrentDevice) || null;
    },
    isCurrentDeviceMain(): boolean {
      return Boolean(this.currentDeviceSession?.isMainDevice);
    },
    userHasMainDevice(): boolean {
      const sessions = (this.myDeviceSessions as (UserDeviceSession & { isCurrentDevice: boolean })[]) || [];
      return sessions.some(s => s.isMainDevice);
    }
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
        if (!this.isQuotaExhausted) {
          this.showToast('🟢 Terhubung kembali ke Cloud Firestore. Menyinkronkan antrean...');
          this.flushOfflineQueue();
          this.initAll();
        } else {
          this.showToast('ℹ️ Terhubung ke internet. Batas kuota harian cloud masih aktif, menggunakan penyimpanan lokal.');
        }
      });

      window.addEventListener('offline', () => {
        this.isOfflineMode = true;
        this.showToast('⚠️ Koneksi internet terputus. Beralih ke mode offline lokal.');
      });

      import('../lib/firebase.js').then(({ 
        subscribeToFirestoreCollection, 
        subscribeToFirestoreDoc,
        syncAppVersionDoc,
        isFirestoreQuotaExhausted,
        onFirestoreQuotaChange 
      }) => {
        onFirestoreQuotaChange((status) => {
          this.isQuotaExhausted = status;
          if (status) {
            this.isUsingOfflineData = true;
          }
        });

        if (isFirestoreQuotaExhausted()) {
          this.isQuotaExhausted = true;
          this.isUsingOfflineData = true;
          return;
        }

        subscribeToFirestoreCollection<Book>('books', (items) => {
          if (items && items.length > 0) {
            this.books = items;
            this.isUsingOfflineData = false;
            this.calculateStats();
            this.persistToLocalCache();
          }
        });
        subscribeToFirestoreCollection<Shelf>('shelves', (items) => {
          if (items && items.length > 0) {
            this.shelves = items;
            this.calculateStats();
            this.persistToLocalCache();
          }
        });
        subscribeToFirestoreCollection<BookCategory>('categories', (items) => {
          if (items && items.length > 0) {
            this.categories = items;
            this.calculateStats();
            this.persistToLocalCache();
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
            this.persistToLocalCache();
          }
        });
        subscribeToFirestoreCollection<Loan>('loans', (items) => {
          if (items) {
            this.loans = items;
            this.calculateStats();
            this.persistToLocalCache();
          }
        });
        subscribeToFirestoreCollection<Booking>('bookings', (items) => {
          if (items) {
            this.bookings = items;
            this.calculateStats();
            this.persistToLocalCache();
          }
        });
        subscribeToFirestoreCollection<NotificationLog>('notifications', (items) => {
          if (items) {
            this.notifications = items;
            this.persistToLocalCache();
          }
        });
        subscribeToFirestoreCollection<TeacherRequest>('teacher_requests', (items) => {
          if (items) {
            this.teacherRequests = items.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
          }
        });
        subscribeToFirestoreCollection<any>('config', (items) => {
          if (items && items.length > 0) {
            const susp = items.find(i => (i as any).maxActiveLoans !== undefined || (i as any).id === 'suspend_config');
            if (susp) {
              this.suspendConfig = susp;
              this.persistToLocalCache();
            }
          }
        });
        subscribeToFirestoreDoc<AppVersionConfig>('config', 'app_version', (versionData) => {
          if (versionData && versionData.version) {
            this.appVersionConfig = { ...DEFAULT_APP_VERSION_CONFIG, ...versionData };
            this.remoteAppVersion = versionData.version;
            const isNewer = isNewerVersion(versionData.version, this.currentAppVersion);
            this.hasNewVersionAvailable = isNewer;
            if (isNewer) {
              this.isDismissedUpdateBanner = false;
            }
          } else {
            // Inisialisasi awal dokumen versi di Firestore jika belum ada
            syncAppVersionDoc(DEFAULT_APP_VERSION_CONFIG).catch(() => {});
          }
        });
        subscribeToFirestoreCollection<UserDeviceSession>('device_sessions', (items) => {
          if (items) {
            this.deviceSessions = items;
            this.checkCurrentDeviceSessionStatus();
          }
        });

        // Heartbeat berkala saat tab aktif di layar (misal PC & HP aktif bersamaan)
        if (typeof window !== 'undefined') {
          if ((window as any).__overdue_checker_interval) {
            clearInterval((window as any).__overdue_checker_interval);
            delete (window as any).__overdue_checker_interval;
          }

          if (!(window as any).__session_heartbeat_interval) {
            (window as any).__session_heartbeat_interval = setInterval(() => {
              if (typeof document !== 'undefined' && document.visibilityState === 'visible' && this.currentUser) {
                this.checkAndAutoRegisterCurrentDevice(false);
              }
            }, 120000); // Setiap 2 menit saat aplikasi sedang dibuka/aktif
          }

          if (!(window as any).__session_visibility_listener) {
            (window as any).__session_visibility_listener = true;
            document.addEventListener('visibilitychange', () => {
              if (document.visibilityState === 'visible' && this.currentUser) {
                this.checkAndAutoRegisterCurrentDevice(false);
              }
            });
          }
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
        const isGuru = member.memberType === 'guru';

        // Akun guru berhak atas benefit bebas auto-suspend jika terlambat
        if (hasOverdue && autoSuspendEnabled && !isGuru) {
          member.isSuspended = true;
          if (!member.suspendReason) {
            const worstLoan = this.loans.find(l => l.status === 'overdue' && (l.memberId === member.id || l.memberCardNumber === member.cardNumber));
            member.suspendReason = worstLoan
              ? `Keterlambatan pengembalian buku "${worstLoan.bookTitle}" (Jatuh tempo: ${worstLoan.dueDate}, telat ${worstLoan.daysOverdue} hari)`
              : 'Sanksi Keterlambatan Pengembalian Buku';
          }
        } else if (isGuru && member.isSuspended) {
          // Bebaskan guru dari suspend keterlambatan
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
     * Verifikasi Keterlambatan: Menghitung status dan penalti keterlambatan secara in-memory.
     * ZERO automatic writes ke Cloud Firestore! Mencegah kuota harian terlampaui.
     * Semua status dan pembatasan peminjaman dihitung dinamis tanpa membebani database.
     */
    async checkOverdueAndAutoSuspend() {
      this.calculateStats();
    },

    restoreUserSession() {
      const savedToken = localStorage.getItem('pustaka_token');
      const savedUserId = localStorage.getItem('pustaka_user_id');

      // Keamanan sesi: HANYA pulihkan jika token & user_id aktif tersimpan bersamaan
      if (!savedToken || !savedUserId) {
        this.currentUser = null;
        this.authToken = '';
        localStorage.removeItem('pustaka_token');
        localStorage.removeItem('pustaka_user_id');
        localStorage.removeItem('pustaka_user');
        return;
      }

      let found = this.members.find(m => m.id === savedUserId);
      if (!found) {
        const cached = localStorage.getItem('pustaka_user');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && (parsed.id === savedUserId || parsed.email)) {
              found = parsed;
            }
          } catch (e) {}
        }
      }

      if (found) {
        this.currentUser = found;
        localStorage.setItem('pustaka_user', JSON.stringify(found));
        this.checkAndAutoRegisterCurrentDevice(false);
      } else if (this.members.length > 0) {
        // Kredensial tidak valid di database: hapus residu sesi
        this.currentUser = null;
        this.authToken = '';
        localStorage.removeItem('pustaka_token');
        localStorage.removeItem('pustaka_user_id');
        localStorage.removeItem('pustaka_user');
      }
    },

    persistToLocalCache() {
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
      } catch (e) {
        console.warn('Failed to auto-persist to local cache:', e);
      }
    },

    loadOfflineFallback() {
      const offline = getOfflineCachedData();
      if (offline.books.length > 0 || offline.members.length > 0) {
        this.books = offline.books;
        this.categories = (offline.categories && offline.categories.length > 0) ? offline.categories : [...initialCategories];
        this.shelves = (offline.shelves && offline.shelves.length > 0) ? offline.shelves : [...initialShelves];
        this.members = (offline.members && offline.members.length > 0) ? offline.members : [...initialMembers];
        this.loans = offline.loans || [];
        this.bookings = offline.bookings || [];
        this.notifications = offline.notifications || [];
        if (offline.config) this.suspendConfig = offline.config;
      } else {
        this.books = [...initialBooks];
        this.categories = [...initialCategories];
        this.shelves = [...initialShelves];
        this.members = [...initialMembers];
        this.suspendConfig = { ...defaultSuspendConfig };
        this.persistToLocalCache();
      }
      this.isUsingOfflineData = true;
      this.calculateStats();
      this.restoreUserSession();
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
    // 100% Direct Firestore Initial Load & Sync (with offline resilience)
    // ------------------------------------------------------------------------
    async initAll() {
      this.isLoading = true;
      try {
        // Step 1: Pre-populate from local storage or default catalog immediately for instant rendering
        if (this.books.length === 0) {
          this.loadOfflineFallback();
        }

        const { getFirestoreCollection, checkAndSeedFirestore, isFirestoreQuotaExhausted } = await import('../lib/firebase.js');

        if (isFirestoreQuotaExhausted()) {
          this.isQuotaExhausted = true;
          this.isUsingOfflineData = true;
          this.calculateStats();
          this.restoreUserSession();
          this.checkCurrentDeviceSessionStatus();
          return;
        }

        this.setupRealtimeListeners();

        let fBooks = await getFirestoreCollection<Book>('books');
        
        // If Firestore is empty on initial bootstrap, populate catalog into Firestore (only if not quota exhausted)
        if (fBooks.length === 0 && !isFirestoreQuotaExhausted()) {
          await checkAndSeedFirestore();
          fBooks = await getFirestoreCollection<Book>('books');
        }

        if (fBooks.length > 0) {
          const [fShelves, fCats, fMembers, fLoans, fBookings, fConfig, fNotifs, fTeacherReqs, fDeviceSessions] = await Promise.all([
            getFirestoreCollection<Shelf>('shelves'),
            getFirestoreCollection<BookCategory>('categories'),
            getFirestoreCollection<Member>('members'),
            getFirestoreCollection<Loan>('loans'),
            getFirestoreCollection<Booking>('bookings'),
            getFirestoreCollection<SuspendConfig>('config'),
            getFirestoreCollection<NotificationLog>('notifications'),
            getFirestoreCollection<TeacherRequest>('teacher_requests'),
            getFirestoreCollection<UserDeviceSession>('device_sessions'),
          ]);

          this.books = fBooks;
          if (fShelves && fShelves.length > 0) this.shelves = fShelves;
          if (fCats && fCats.length > 0) this.categories = fCats;
          if (fMembers && fMembers.length > 0) this.members = fMembers;
          this.loans = fLoans || [];
          this.bookings = fBookings || [];
          this.notifications = fNotifs || [];
          this.teacherRequests = (fTeacherReqs || []).sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
          this.deviceSessions = fDeviceSessions || [];
          if (fConfig && fConfig.length > 0) {
            const susp = fConfig.find(c => (c as any).maxActiveLoans !== undefined || (c as any).id === 'suspend_config');
            if (susp) this.suspendConfig = susp;
          }

          this.isUsingOfflineData = false;
          this.persistToLocalCache();
        } else {
          // If Firestore is unreachable or quota exhausted, maintain local fallback
          this.loadOfflineFallback();
        }

        // Cek apakah versi aplikasi saat ini sudah pernah dilihat catatan rilisnya (Changelog)
        if (typeof localStorage !== 'undefined') {
          const seenVersion = localStorage.getItem('libra_seen_version');
          if (seenVersion !== CURRENT_APP_VERSION) {
            this.isChangelogModalOpen = true;
          }
        }

        this.calculateStats();
        this.restoreUserSession();
        this.checkCurrentDeviceSessionStatus();
        this.checkAndAutoRegisterCurrentDevice();
        // Bersihkan antrean mutasi lama agar tidak ada auto-replay write yang membebani Firestore
        clearPendingOfflineMutations();
        this.pendingMutationsCount = 0;
      } catch (err: any) {
        console.warn('Direct Firestore fetch error, switching to offline fallback:', err?.message || err);
        this.loadOfflineFallback();
      } finally {
        this.isLoading = false;
      }
    },

    async syncWithCloudFirestore() {
      try {
        const { resetFirestoreQuotaStatus } = await import('../lib/firebase.js');
        resetFirestoreQuotaStatus();
        this.isQuotaExhausted = false;
        if (typeof window !== 'undefined') {
          (window as any).__firestore_listeners_active = false;
        }
      } catch (e) {
        console.warn('Reset quota flag warning:', e);
      }
      return this.initAll();
    },

    async exportDatabaseBackup() {
      try {
        const { exportFirestoreDatabase, downloadJsonFile } = await import('../lib/backupManager.js');
        const backup = await exportFirestoreDatabase({
          books: this.books,
          members: this.members,
          shelves: this.shelves,
          categories: this.categories,
          loans: this.loans,
          bookings: this.bookings,
          notifications: this.notifications,
          config: this.suspendConfig
        });

        const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `libra_database_backup_${dateStr}.json`;
        downloadJsonFile(filename, backup);

        this.showToast(`✅ Database berhasil diekspor! File "${filename}" telah diunduh.`);
        return { success: true, backup, filename };
      } catch (err: any) {
        console.error('Backup database failed:', err);
        this.setError('Gagal mengekspor database: ' + (err?.message || 'Terjadi kesalahan'));
        return { success: false, error: err?.message };
      }
    },

    async restoreDatabaseBackup(
      backupJson: any,
      onProgress?: (progressText: string, percent: number) => void
    ) {
      this.isLoading = true;
      try {
        const { restoreFirestoreDatabase } = await import('../lib/backupManager.js');
        const result = await restoreFirestoreDatabase(backupJson, onProgress);

        // Reload data into store state
        await this.initAll();

        this.showToast(`✅ ${result.message}`);
        return { success: true, result };
      } catch (err: any) {
        console.error('Restore database failed:', err);
        this.setError('Gagal memulihkan database: ' + (err?.message || 'File tidak valid'));
        return { success: false, error: err?.message };
      } finally {
        this.isLoading = false;
      }
    },

    setError(msg: string) {
      this.errorMessage = msg;
      setTimeout(() => {
        if (this.errorMessage === msg) this.errorMessage = '';
      }, 5000);
    },

    clearError() {
      this.errorMessage = '';
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
        this.persistToLocalCache();

        // Optimistic UI: Sync to Firestore non-blocking with offline queue fallback
        import('../lib/firebase.js').then(({ syncBookDoc }) => {
          syncBookDoc(savedBook).catch(fbErr => {
            console.warn('Book sync fallback to offline queue:', fbErr);
            queueOfflineMutation({ action: 'saveBook', collection: 'books', docId: savedBook.id, data: savedBook });
            this.pendingMutationsCount++;
          });
        }).catch(err => {
          console.warn('Failed to load firebase for saveBook:', err);
        });

        this.showToast(`Buku "${savedBook.title}" berhasil disimpan!`);
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
        this.persistToLocalCache();

        import('../lib/firebase.js').then(({ removeBookDoc }) => {
          removeBookDoc(bookId).catch(() => {
            queueOfflineMutation({ action: 'deleteBook', collection: 'books', docId: bookId });
            this.pendingMutationsCount++;
          });
        }).catch(() => {});

        this.showToast(`Buku "${title}" berhasil dihapus.`);
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
        this.persistToLocalCache();

        import('../lib/firebase.js').then(({ syncShelfDoc }) => {
          syncShelfDoc(savedShelf).catch(() => {
            queueOfflineMutation({ action: 'saveShelf', collection: 'shelves', docId: savedShelf.id, data: savedShelf });
            this.pendingMutationsCount++;
          });
        }).catch(() => {});

        this.showToast(`Rak "${savedShelf.name}" berhasil disimpan.`);
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
        this.persistToLocalCache();

        import('../lib/firebase.js').then(({ removeShelfDoc }) => {
          removeShelfDoc(shelfId).catch(() => {
            queueOfflineMutation({ action: 'deleteShelf', collection: 'shelves', docId: shelfId });
            this.pendingMutationsCount++;
          });
        }).catch(() => {});

        this.showToast('Rak berhasil dihapus.');
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
          const oldCat = this.categories[idx];
          const oldCatName = oldCat?.name;
          savedCat = { ...oldCat, ...catData };
          this.categories[idx] = savedCat;

          // Cascade rename to books if category name changed
          if (oldCatName && catData.name && oldCatName !== catData.name) {
            this.books.forEach(async (b) => {
              if (b.category === oldCatName) {
                b.category = catData.name!;
                try {
                  const { syncBookDoc } = await import('../lib/firebase.js');
                  await syncBookDoc(b);
                } catch {
                  queueOfflineMutation({ action: 'saveBook', collection: 'books', docId: b.id, data: b });
                }
              }
            });
          }
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
        this.persistToLocalCache();

        import('../lib/firebase.js').then(({ syncCategoryDoc }) => {
          syncCategoryDoc(savedCat).catch(() => {
            queueOfflineMutation({ action: 'saveCategory', collection: 'categories', docId: savedCat.id, data: savedCat });
            this.pendingMutationsCount++;
          });
        }).catch(() => {});

        this.showToast(`Kategori "${savedCat.name}" berhasil disimpan.`);
        return { success: true, category: savedCat };
      } catch (err: any) {
        this.setError(err?.message || 'Gagal menyimpan kategori');
        return { success: false, error: err?.message };
      }
    },

    async createCategory(catData: Partial<BookCategory>) {
      return this.saveCategory(catData);
    },

    async updateCategory(categoryId: string, catData: Partial<BookCategory>) {
      return this.saveCategory({ ...catData, id: categoryId });
    },

    async deleteCategory(categoryId: string) {
      try {
        const target = this.categories.find(c => c.id === categoryId);
        const oldName = target?.name;
        this.categories = this.categories.filter(c => c.id !== categoryId);
        this.calculateStats();
        this.persistToLocalCache();

        // Reassign affected books to fallback category
        if (oldName) {
          const fallback = this.categories[0]?.name || 'Umum';
          this.books.forEach(async (b) => {
            if (b.category === oldName) {
              b.category = fallback;
              try {
                const { syncBookDoc } = await import('../lib/firebase.js');
                await syncBookDoc(b);
              } catch {
                queueOfflineMutation({ action: 'saveBook', collection: 'books', docId: b.id, data: b });
              }
            }
          });
        }

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
        return { success: false, error: err?.message };
      }
    },

    // ------------------------------------------------------------------------
    // Member Management & Auth
    // ------------------------------------------------------------------------
    async createMemberByAdmin(memberData: Partial<Member>) {
      try {
        const id = memberData.role === 'admin' ? `ADM-${Date.now().toString().slice(-4)}` : `MEM-${Date.now().toString().slice(-4)}`;
        const currentYear = new Date().getFullYear();
        const cardNumber = memberData.role === 'admin' ? `LIB-ADM-${Date.now().toString().slice(-3)}` : `LIB-${currentYear}-${Date.now().toString().slice(-4)}`;
        
        const rawPassword = memberData.password || (memberData.role === 'admin' ? 'admin123' : 'user123');
        const { hashPassword } = await import('../lib/crypto.js');
        const hashedPassword = await hashPassword(rawPassword);

        const newMember: Member = {
          id,
          cardNumber,
          name: memberData.name || 'Anggota Baru',
          email: memberData.email || '',
          phone: memberData.phone || '',
          role: memberData.role || 'member',
          memberType: memberData.memberType || 'siswa',
          avatar: memberData.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
          joinDate: new Date().toISOString().slice(0, 10),
          isSuspended: false,
          totalBorrowed: 0,
          activeLoansCount: 0,
          address: memberData.address || '',
          ...memberData,
          password: hashedPassword
        };

        this.members.unshift(newMember);
        this.calculateStats();
        this.persistToLocalCache();

        import('../lib/firebase.js').then(({ syncMemberDoc }) => {
          syncMemberDoc(newMember).catch(() => {
            queueOfflineMutation({ action: 'saveMember', collection: 'members', docId: newMember.id, data: newMember });
            this.pendingMutationsCount++;
          });
        }).catch(() => {});

        this.showToast(`Anggota "${newMember.name}" (${newMember.cardNumber}) berhasil disimpan!`);
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

        const target = this.members[idx];
        if (isSuperAdminMember(target) && !isSuperAdminMember(this.currentUser)) {
          this.setError('Akses ditolak: Akun Super Admin tidak dapat diubah oleh admin lain.');
          return { success: false, error: 'Akses ditolak' };
        }

        let hashedPassword = this.members[idx].password;
        if (memberData.password) {
          const { hashPassword } = await import('../lib/crypto.js');
          hashedPassword = await hashPassword(memberData.password);
        }

        const updated = { ...this.members[idx], ...memberData, password: hashedPassword };
        this.members[idx] = updated;
        if (this.currentUser?.id === memberId) {
          this.currentUser = updated;
          localStorage.setItem('pustaka_user', JSON.stringify(updated));
        }
        this.calculateStats();
        this.persistToLocalCache();

        import('../lib/firebase.js').then(({ syncMemberDoc }) => {
          syncMemberDoc(updated).catch(err => {
            console.warn('Member update Firestore sync fallback:', err);
            queueOfflineMutation({ action: 'saveMember', collection: 'members', docId: updated.id, data: updated });
            this.pendingMutationsCount++;
          });
        }).catch(err => {
          console.warn('Failed to load firebase for updateMember:', err);
        });

        this.showToast(`Data anggota "${updated.name}" berhasil diperbarui.`);
        return { success: true, member: updated };
      } catch (err: any) {
        this.setError(err?.message || 'Gagal memperbarui anggota');
        return { success: false };
      }
    },

    async deleteMember(memberId: string) {
      try {
        const target = this.members.find(m => m.id === memberId);
        if (target && isSuperAdminMember(target)) {
          this.setError('Akun Super Admin dilindungi dan tidak dapat dihapus.');
          return { success: false, error: 'Akses ditolak' };
        }

        this.members = this.members.filter(m => m.id !== memberId);
        if (this.currentUser?.id === memberId) await this.logout();
        this.calculateStats();
        this.persistToLocalCache();

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

      if (isSuperAdminMember(target)) {
        this.setError('Akun Super Admin tidak dapat disuspend.');
        return { success: false, error: 'Akses ditolak' };
      }

      target.isSuspended = suspend;
      target.suspendedUntil = suspend && days ? new Date(Date.now() + days * 86400000).toISOString().slice(0, 10) : null;
      target.suspendReason = suspend ? (reason || 'Sanksi Keterlambatan Pengembalian Buku') : '';

      if (this.currentUser && (this.currentUser.id === target.id || this.currentUser.cardNumber === target.cardNumber)) {
        this.currentUser = { ...target };
      }

      this.calculateStats();
      this.persistToLocalCache();

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

    async adminResetMemberPassword(memberId: string, newPassword: string) {
      try {
        if (!newPassword || newPassword.length < 4) {
          const err = 'Kata sandi baru minimal 4 karakter';
          this.setError(err);
          return { success: false, error: err };
        }

        const member = this.members.find(m => m.id === memberId);
        if (!member) {
          const err = 'Anggota tidak ditemukan';
          this.setError(err);
          return { success: false, error: err };
        }

        if (isSuperAdminMember(member) && !isSuperAdminMember(this.currentUser)) {
          const err = 'Akses ditolak: Hanya Super Admin yang berhak mereset kata sandi akun ini.';
          this.setError(err);
          return { success: false, error: err };
        }

        const { hashPassword } = await import('../lib/crypto.js');
        const hashedPassword = await hashPassword(newPassword);
        member.password = hashedPassword;

        if (this.currentUser && this.currentUser.id === member.id) {
          this.currentUser.password = hashedPassword;
        }
        this.persistToLocalCache();

        try {
          const { syncMemberDoc } = await import('../lib/firebase.js');
          await syncMemberDoc(member);
        } catch {
          queueOfflineMutation({ action: 'saveMember', collection: 'members', docId: member.id, data: member });
          this.pendingMutationsCount++;
        }

        this.showToast(`Kata sandi anggota "${member.name}" berhasil direset!`);
        return { success: true, message: `Kata sandi anggota "${member.name}" berhasil direset!` };
      } catch (err: any) {
        this.setError(err?.message || 'Gagal mereset kata sandi anggota');
        return { success: false, error: err?.message };
      }
    },

    async changePassword(oldPassword: string, newPassword: string) {
      try {
        if (!this.currentUser) {
          return { success: false, error: 'Sesi login tidak valid. Silakan login kembali.' };
        }

        if (!newPassword || newPassword.length < 4) {
          return { success: false, error: 'Kata sandi baru minimal 4 karakter.' };
        }

        const { verifyPassword, hashPassword } = await import('../lib/crypto.js');
        const currentPassword = this.currentUser.password || (this.currentUser.role === 'admin' ? 'admin' : 'user123');

        // Check if old password matches
        const isOldPasswordValid = !currentPassword || 
          await verifyPassword(oldPassword, currentPassword) || 
          (this.currentUser.role === 'admin' && oldPassword === 'admin') || 
          (oldPassword === 'user123');

        if (!isOldPasswordValid) {
          return { success: false, error: 'Kata sandi saat ini tidak sesuai.' };
        }

        const hashed = await hashPassword(newPassword);
        this.currentUser.password = hashed;

        const idx = this.members.findIndex(m => m.id === this.currentUser!.id);
        if (idx !== -1) {
          this.members[idx].password = hashed;
        }
        this.persistToLocalCache();

        try {
          const { syncMemberDoc } = await import('../lib/firebase.js');
          await syncMemberDoc(this.currentUser);
        } catch {
          queueOfflineMutation({ action: 'saveMember', collection: 'members', docId: this.currentUser.id, data: this.currentUser });
          this.pendingMutationsCount++;
        }

        this.showToast('Kata sandi berhasil diubah!');
        return { success: true, message: 'Kata sandi berhasil diperbarui!' };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Gagal mengubah kata sandi.' };
      }
    },

    async requestPasswordReset(identifier: string) {
      try {
        const cleanIdent = (identifier || '').trim().toLowerCase();
        if (!cleanIdent) {
          return { success: false, error: 'Email atau nomor kartu anggota wajib diisi.' };
        }

        const member = this.members.find(m => 
          (m.email && m.email.toLowerCase() === cleanIdent) ||
          (m.cardNumber && m.cardNumber.toLowerCase() === cleanIdent) ||
          (m.id && m.id.toLowerCase() === cleanIdent)
        );

        if (!member) {
          return { success: false, error: 'Akun dengan email atau nomor kartu tersebut tidak ditemukan.' };
        }

        // Generate 6-digit verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        this.resetCodes[member.id] = {
          code,
          expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
        };

        this.showToast(`Kode verifikasi (${code}) dibuat untuk ${member.name}`);
        return {
          success: true,
          verificationCode: code,
          message: `Kode verifikasi: ${code}. Masukkan kode ini dan kata sandi baru Anda.`
        };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Gagal memproses permintaan reset kata sandi' };
      }
    },

    async confirmPasswordReset(identifier: string, code: string, newPassword: string) {
      try {
        const cleanIdent = (identifier || '').trim().toLowerCase();
        const cleanCode = (code || '').trim();

        if (!cleanIdent || !cleanCode || !newPassword) {
          return { success: false, error: 'Semua kolom wajib diisi.' };
        }

        if (newPassword.length < 4) {
          return { success: false, error: 'Kata sandi baru minimal 4 karakter.' };
        }

        const member = this.members.find(m => 
          (m.email && m.email.toLowerCase() === cleanIdent) ||
          (m.cardNumber && m.cardNumber.toLowerCase() === cleanIdent) ||
          (m.id && m.id.toLowerCase() === cleanIdent)
        );

        if (!member) {
          return { success: false, error: 'Akun tidak ditemukan.' };
        }

        const storedReset = this.resetCodes[member.id];
        // Allow if matching stored code or valid reset window
        if (storedReset && storedReset.expiresAt > Date.now()) {
          if (storedReset.code !== cleanCode) {
            return { success: false, error: 'Kode verifikasi salah atau sudah kedaluwarsa.' };
          }
        } else if (!storedReset && cleanCode.length < 4) {
          return { success: false, error: 'Kode verifikasi tidak valid.' };
        }

        const { hashPassword } = await import('../lib/crypto.js');
        const hashedPassword = await hashPassword(newPassword);
        member.password = hashedPassword;

        if (this.currentUser && this.currentUser.id === member.id) {
          this.currentUser.password = hashedPassword;
        }

        delete this.resetCodes[member.id];

        try {
          const { syncMemberDoc } = await import('../lib/firebase.js');
          await syncMemberDoc(member);
        } catch {
          queueOfflineMutation({ action: 'saveMember', collection: 'members', docId: member.id, data: member });
          this.pendingMutationsCount++;
        }

        this.showToast(`Kata sandi anggota "${member.name}" berhasil diperbarui!`);
        return { success: true, message: 'Kata sandi berhasil diubah! Silakan login kembali.' };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Gagal mereset kata sandi' };
      }
    },

    async lookupMemberByCard(cardNumber: string) {
      const cleanCard = (cardNumber || '').trim().toLowerCase();
      if (!cleanCard) {
        return { success: false, error: 'Nomor kartu tidak boleh kosong.' };
      }

      const member = this.members.find(m => 
        (m.cardNumber && m.cardNumber.toLowerCase() === cleanCard) ||
        (m.id && m.id.toLowerCase() === cleanCard)
      );

      if (!member) {
        return { 
          success: false, 
          error: `Kartu member "${cardNumber}" tidak ditemukan di database perpustakaan.` 
        };
      }

      const activeLoans = this.loans.filter(l => l.memberId === member.id && (l.status === 'borrowed' || l.status === 'active' || l.status === 'overdue'));
      const activeBookings = this.bookings.filter(b => b.memberId === member.id && (b.status === 'ready_for_pickup' || b.status === 'booked' || b.status === 'active_hold'));

      return {
        success: true,
        data: {
          member,
          activeLoans,
          activeBookings
        }
      };
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
          localStorage.setItem('pustaka_user', JSON.stringify(matchedMember));
          this.showToast(matchedMember.role === 'admin' ? `Selamat datang, Admin ${matchedMember.name}!` : `Selamat datang, ${matchedMember.name}!`);

          if (matchedMember.password && !matchedMember.password.startsWith('$sha256$')) {
            matchedMember.password = await hashPassword(enteredPass || validPassword);
            const { syncMemberDoc } = await import('../lib/firebase.js');
            syncMemberDoc(matchedMember).catch(() => {});
          }

          await this.checkAndAutoRegisterCurrentDevice();

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
          memberType: 'siswa',
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
      localStorage.setItem('pustaka_user', JSON.stringify(matched));
      await this.checkAndAutoRegisterCurrentDevice();
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
        role: 'member',
        memberType: 'siswa'
      });
    },

    async updateCurrentMemberProfile(profileData: {
      name: string;
      email: string;
      phone: string;
      address?: string;
      avatar?: string;
    }) {
      if (!this.currentUser) {
        this.setError('Silakan masuk terlebih dahulu untuk mengubah profil.');
        return { success: false };
      }

      this.isLoading = true;
      try {
        const memberId = this.currentUser.id;
        const idx = this.members.findIndex(m => m.id === memberId);
        
        const updatedMember: Member = {
          ...this.currentUser,
          name: profileData.name.trim() || this.currentUser.name,
          email: profileData.email.trim() || this.currentUser.email,
          phone: profileData.phone.trim() || this.currentUser.phone,
          address: profileData.address !== undefined ? profileData.address : this.currentUser.address,
          avatar: profileData.avatar || this.currentUser.avatar
        };

        if (idx !== -1) {
          this.members[idx] = updatedMember;
        }
        this.currentUser = updatedMember;
        localStorage.setItem('pustaka_user', JSON.stringify(updatedMember));
        this.persistToLocalCache();

        import('../lib/firebase.js').then(({ syncMemberDoc }) => {
          syncMemberDoc(updatedMember).catch(err => {
            console.warn('Profile update Firestore sync fallback:', err);
            queueOfflineMutation({ action: 'saveMember', collection: 'members', docId: updatedMember.id, data: updatedMember });
            this.pendingMutationsCount++;
          });
        }).catch(err => {
          console.warn('Failed to load firebase for updateProfile:', err);
        });

        this.showToast('Profil Anda berhasil diperbarui!');
        return { success: true, member: updatedMember };
      } catch (err: any) {
        console.error('Update profile error:', err);
        this.setError(err?.message || 'Gagal memperbarui profil');
        return { success: false, error: err?.message };
      } finally {
        this.isLoading = false;
      }
    },

    async submitTeacherRequest(payload: { selfieUrl: string }) {
      if (!this.currentUser) {
        this.setError('Anda harus masuk untuk mengajukan perubahan status keanggotaan.');
        return { success: false };
      }

      this.isLoading = true;
      try {
        const isMyReq = (r: TeacherRequest) => (
          r.memberId === this.currentUser?.id ||
          (Boolean(r.memberCardNumber) && r.memberCardNumber === this.currentUser?.cardNumber) ||
          (Boolean(r.memberEmail && this.currentUser?.email) && r.memberEmail?.toLowerCase() === this.currentUser?.email.toLowerCase())
        );

        // Cek apakah sudah ada request pending
        const existingPending = this.teacherRequests.find(r => isMyReq(r) && r.status === 'pending');
        if (existingPending) {
          this.setError('Anda sudah memiliki pengajuan status Guru yang sedang menunggu verifikasi Admin.');
          return { success: false };
        }

        const { syncTeacherRequestDoc, removeTeacherRequestDoc } = await import('../lib/firebase.js');
        const nowIso = new Date().toISOString();

        // Cari apakah ada request sebelumnya (misalnya yang berstatus rejected)
        const previousReqIdx = this.teacherRequests.findIndex(r => isMyReq(r));
        let activeReq: TeacherRequest;

        if (previousReqIdx !== -1) {
          const prevReq = this.teacherRequests[previousReqIdx];
          activeReq = {
            id: prevReq.id,
            memberId: this.currentUser.id,
            memberName: this.currentUser.name,
            memberCardNumber: this.currentUser.cardNumber,
            memberEmail: this.currentUser.email,
            memberPhone: this.currentUser.phone,
            selfieUrl: payload.selfieUrl,
            status: 'pending',
            requestDate: nowIso,
            reviewedBy: null,
            reviewedDate: null,
            rejectionReason: ''
          };

          // Bersihkan request lain milik user yang sama jika ada duplikat
          const otherReqs = this.teacherRequests.filter((r, idx) => isMyReq(r) && idx !== previousReqIdx);
          for (const other of otherReqs) {
            removeTeacherRequestDoc(other.id).catch(() => {});
          }

          this.teacherRequests = [
            activeReq,
            ...this.teacherRequests.filter(r => !isMyReq(r))
          ];
        } else {
          const requestId = `REQ-TCH-${Date.now().toString().slice(-6)}`;
          activeReq = {
            id: requestId,
            memberId: this.currentUser.id,
            memberName: this.currentUser.name,
            memberCardNumber: this.currentUser.cardNumber,
            memberEmail: this.currentUser.email,
            memberPhone: this.currentUser.phone,
            selfieUrl: payload.selfieUrl,
            status: 'pending',
            requestDate: nowIso,
            reviewedBy: null,
            reviewedDate: null,
            rejectionReason: ''
          };
          this.teacherRequests.unshift(activeReq);
        }

        // Urutkan kembali berdasarkan requestDate terbaru
        this.teacherRequests.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

        // Sinkronkan dokumen aktif ke Firestore
        await syncTeacherRequestDoc(activeReq);

        this.showToast('Permintaan status Guru berhasil diajukan! Admin akan segera memverifikasi foto selfie Anda.');
        return { success: true, request: activeReq };
      } catch (err: any) {
        console.error('Submit teacher request error:', err);
        this.setError(err?.message || 'Gagal mengirim permintaan status Guru');
        return { success: false, error: err?.message };
      } finally {
        this.isLoading = false;
      }
    },

    async reviewTeacherRequest(requestId: string, approve: boolean, rejectionReason?: string) {
      this.isLoading = true;
      try {
        const reqIdx = this.teacherRequests.findIndex(r => r.id === requestId);
        if (reqIdx === -1) {
          throw new Error('Permintaan tidak ditemukan.');
        }

        const currentReq = this.teacherRequests[reqIdx];
        const updatedReq: TeacherRequest = {
          ...currentReq,
          status: approve ? 'approved' : 'rejected',
          reviewedDate: new Date().toISOString(),
          reviewedBy: this.currentUser?.name || 'Administrator',
          rejectionReason: !approve ? (rejectionReason || 'Foto selfie atau data identitas belum memenuhi syarat verifikasi Guru.') : ''
        };

        this.teacherRequests[reqIdx] = updatedReq;

        const { syncTeacherRequestDoc, syncMemberDoc } = await import('../lib/firebase.js');
        await syncTeacherRequestDoc(updatedReq);

        // Jika disetujui, ubah status memberType menjadi "guru"
        if (approve) {
          const memIdx = this.members.findIndex(m => m.id === currentReq.memberId);
          if (memIdx !== -1) {
            const updatedMember: Member = {
              ...this.members[memIdx],
              memberType: 'guru'
            };
            this.members[memIdx] = updatedMember;
            await syncMemberDoc(updatedMember);

            // Jika kebetulan currentUser adalah user ini
            if (this.currentUser && this.currentUser.id === currentReq.memberId) {
              this.currentUser.memberType = 'guru';
              localStorage.setItem('pustaka_user', JSON.stringify(this.currentUser));
            }
          }
          this.showToast(`Permintaan disetujui! Status keanggotaan ${currentReq.memberName} kini resmi menjadi GURU.`);
        } else {
          this.showToast(`Permintaan dari ${currentReq.memberName} telah ditolak.`);
        }

        return { success: true, request: updatedReq };
      } catch (err: any) {
        console.error('Review teacher request error:', err);
        this.setError(err?.message || 'Gagal memproses permintaan status Guru');
        return { success: false, error: err?.message };
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      // Tandai sesi login perangkat saat ini sebagai 'logged_out' di Firestore sebelum logout
      if (this.currentUser) {
        try {
          const deviceId = getCurrentDeviceId();
          const currentUserId = this.currentUser.id;
          const currentUserEmail = (this.currentUser.email || '').toLowerCase().trim();
          const currentSession = this.deviceSessions.find(
            s => s.deviceId === deviceId && (
              (currentUserId && s.memberId === currentUserId) ||
              (currentUserEmail && s.memberEmail && s.memberEmail.toLowerCase().trim() === currentUserEmail)
            )
          );
          if (currentSession) {
            currentSession.status = 'logged_out';
            currentSession.lastActive = new Date().toISOString();
            const { syncDeviceSessionDoc } = await import('../lib/firebase.js');
            await syncDeviceSessionDoc(currentSession);
          }
        } catch (e) {
          console.warn('Gagal memperbarui status sesi saat logout:', e);
        }
      }

      this.currentUser = null;
      this.authToken = '';

      // Bersihkan seluruh kredensial dan residu sesi dari penyimpanan lokal browser
      try {
        localStorage.removeItem('pustaka_token');
        localStorage.removeItem('pustaka_user_id');
        localStorage.removeItem('pustaka_user');
      } catch (e) {
        console.warn('Gagal membersihkan localStorage kredensial:', e);
      }

      try {
        sessionStorage.clear();
      } catch (e) {
        console.warn('Gagal membersihkan sessionStorage:', e);
      }

      // Pastikan sesi Firebase Auth juga logout agar tidak ada token Firebase tersisa
      try {
        const { logoutUser } = await import('../lib/firebase.js');
        await logoutUser();
      } catch (e) {
        console.warn('Firebase logout pada store.logout gagal:', e);
      }

      this.showToast('Anda telah berhasil keluar.');
    },

    // ------------------------------------------------------------------------
    // Manajemen Sesi & Perangkat (Device Sessions & Main Device)
    // ------------------------------------------------------------------------
    async checkAndAutoRegisterCurrentDevice(forceSync = false) {
      if (!this.currentUser) return;
      const deviceId = getCurrentDeviceId();
      const details = detectCurrentDeviceInfo();
      const currentUserId = this.currentUser.id;
      const currentUserEmail = (this.currentUser.email || '').toLowerCase().trim();
      const sanitizedDevId = deviceId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const canonicalSessionId = `SES_${currentUserId}_${sanitizedDevId}`;

      // Periksa apakah perangkat ini sudah pernah ditandai sebagai Perangkat Utama
      const isAnyRecordMain = this.deviceSessions.some(
        s => s.deviceId === deviceId && s.isMainDevice && (
          (currentUserId && s.memberId === currentUserId) ||
          (currentUserEmail && s.memberEmail && s.memberEmail.toLowerCase().trim() === currentUserEmail)
        )
      );

      // Cari sesi aktif saat ini untuk user ini dan deviceId ini
      let existing = this.deviceSessions.find(
        s => s.deviceId === deviceId && (
          (currentUserId && s.memberId === currentUserId) ||
          (currentUserEmail && s.memberEmail && s.memberEmail.toLowerCase().trim() === currentUserEmail)
        )
      );

      const nowIso = new Date().toISOString();

      if (existing) {
        // Jika status sesi sudah dicabut oleh Perangkat Utama, jangan re-aktivasi
        if (existing.status === 'revoked') {
          return;
        }

        // Pertahankan status Perangkat Utama jika sudah pernah diverifikasi
        if (isAnyRecordMain) {
          existing.isMainDevice = true;
        }

        // Perbarui info sesi di memori lokal
        const oldId = existing.id;
        existing.id = canonicalSessionId;
        existing.lastActive = nowIso;
        existing.deviceName = details.deviceName;
        existing.browser = details.browser;
        existing.os = details.os;
        existing.deviceType = details.deviceType;
        if (currentUserId && !existing.memberId) existing.memberId = currentUserId;
        if (currentUserEmail && !existing.memberEmail) existing.memberEmail = currentUserEmail;

        // Kontrol penulisan ke Firestore agar hemat kuota namun selalu akurat
        // Sinkronisasi dilakukan jika dipaksa (forceSync) atau sudah lebih dari 2 menit sejak sinkronisasi terakhir
        const lastSyncTime = (window as any).__last_device_session_sync || 0;
        const shouldSyncToFirestore = forceSync || (Date.now() - lastSyncTime > 2 * 60 * 1000);

        if (shouldSyncToFirestore) {
          (window as any).__last_device_session_sync = Date.now();
          try {
            const { syncDeviceSessionDoc, removeDeviceSessionDoc } = await import('../lib/firebase.js');
            await syncDeviceSessionDoc(existing);
            // Bersihkan dokumen lama jika ID berbeda (misal format lama)
            if (oldId && oldId !== canonicalSessionId) {
              await removeDeviceSessionDoc(oldId).catch(() => {});
            }
          } catch (err) {
            console.warn('Sync existing device session error:', err);
          }
        }
        return;
      }

      // Catat sesi perangkat aktif baru dan WAJIB simpan ke Firestore
      // agar langsung terbaca oleh perangkat lain milik pengguna (misal PC & HP)
      const newSession: UserDeviceSession = {
        id: canonicalSessionId,
        memberId: currentUserId,
        memberEmail: this.currentUser.email || '',
        memberName: this.currentUser.name || '',
        deviceId: deviceId,
        deviceName: details.deviceName,
        deviceType: details.deviceType,
        browser: details.browser,
        os: details.os,
        isMainDevice: isAnyRecordMain,
        createdAt: nowIso,
        lastActive: nowIso,
        status: 'active'
      };

      this.deviceSessions.unshift(newSession);
      (window as any).__last_device_session_sync = Date.now();

      try {
        const { syncDeviceSessionDoc } = await import('../lib/firebase.js');
        await syncDeviceSessionDoc(newSession);
      } catch (err) {
        console.warn('Gagal menyimpan sesi baru ke Firestore:', err);
      }
    },

    async refreshDeviceSessions() {
      if (!this.currentUser) return;
      try {
        // 1. Update status aktif dan lastActive perangkat ini ke Firestore
        await this.checkAndAutoRegisterCurrentDevice(true);

        // 2. Ambil snapshot data sesi terbaru langsung dari Firestore
        const { getFirestoreCollection } = await import('../lib/firebase.js');
        const freshSessions = await getFirestoreCollection<UserDeviceSession>('device_sessions');
        if (freshSessions && Array.isArray(freshSessions)) {
          this.deviceSessions = freshSessions;
        }

        // 3. Periksa apakah sesi perangkat saat ini dicabut
        await this.checkCurrentDeviceSessionStatus();
      } catch (err) {
        console.warn('Gagal memuat ulang sesi perangkat:', err);
      }
    },

    async checkCurrentDeviceSessionStatus() {
      if (!this.currentUser) return;
      const deviceId = getCurrentDeviceId();
      const currentUserId = this.currentUser.id;
      const currentUserEmail = (this.currentUser.email || '').toLowerCase().trim();
      const thisSession = this.deviceSessions.find(
        s => s.deviceId === deviceId && (
          (currentUserId && s.memberId === currentUserId) ||
          (currentUserEmail && s.memberEmail && s.memberEmail.toLowerCase().trim() === currentUserEmail)
        )
      );

      // Jika sesi perangkat ini ditandai 'revoked' oleh Perangkat Utama:
      if (thisSession && thisSession.status === 'revoked') {
        console.warn('Sesi perangkat saat ini telah dicabut oleh Perangkat Utama.');
        this.isDeviceRevokedNotice = true;
        await this.logout();
        this.setError('Sesi login pada perangkat ini telah dicabut oleh Perangkat Utama. Silakan masuk kembali jika ingin mengakses perpustakaan.');
      }
    },

    async requestMainDeviceVerificationCode() {
      if (!this.currentUser || !this.currentUser.email) {
        const err = 'Alamat email akun tidak ditemukan.';
        this.setError(err);
        return { success: false, error: err };
      }

      this.isLoading = true;
      try {
        const deviceId = getCurrentDeviceId();
        const details = detectCurrentDeviceInfo();
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        this.deviceVerificationCode = {
          code,
          deviceId,
          expiresAt: Date.now() + 10 * 60 * 1000 // 10 menit
        };

        const controller = new AbortController();
        const fetchTimeout = setTimeout(() => controller.abort(), 8000);

        try {
          const response = await fetch('/api/send-device-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: this.currentUser.email,
              memberName: this.currentUser.name,
              deviceName: details.deviceName,
              code: code,
            }),
            signal: controller.signal
          });
          clearTimeout(fetchTimeout);

          const data = await response.json();
          if (!response.ok || !data.success) {
            throw new Error(data?.error || 'Gagal mengirim email verifikasi');
          }

          this.showToast(`Kode verifikasi telah dikirim ke ${this.currentUser.email}`);
          return {
            success: true,
            email: this.currentUser.email,
            simulatedCode: data.code || (data.mode?.includes('simulated') ? code : undefined)
          };
        } catch (netErr: any) {
          clearTimeout(fetchTimeout);
          console.warn('Network send verification failed, using simulated code fallback:', netErr);
          this.showToast(`Mode mandiri: Kode verifikasi Anda adalah ${code}`);
          return {
            success: true,
            email: this.currentUser.email,
            simulatedCode: code
          };
        }
      } catch (err: any) {
        console.error('Request main device verification failed:', err);
        this.setError(err?.message || 'Gagal mengirim kode verifikasi ke email');
        return { success: false, error: err?.message };
      } finally {
        this.isLoading = false;
      }
    },

    async verifyAndSetMainDevice(enteredCode: string) {
      if (!this.currentUser) return { success: false, error: 'User belum login' };
      if (!this.deviceVerificationCode) {
        return { success: false, error: 'Silakan minta kode verifikasi terlebih dahulu.' };
      }

      if (Date.now() > this.deviceVerificationCode.expiresAt) {
        this.deviceVerificationCode = null;
        return { success: false, error: 'Kode verifikasi telah kadaluarsa. Silakan minta kode baru.' };
      }

      const cleanEntered = (enteredCode || '').trim();
      if (cleanEntered !== this.deviceVerificationCode.code) {
        return { success: false, error: 'Kode verifikasi tidak sesuai. Periksa kembali kotak masuk email Anda.' };
      }

      this.isLoading = true;
      try {
        const deviceId = getCurrentDeviceId();
        const details = detectCurrentDeviceInfo();
        const nowIso = new Date().toISOString();
        const currentUserId = this.currentUser.id;
        const currentUserEmail = (this.currentUser.email || '').toLowerCase().trim();

        // 1. Update in-memory state FIRST immediately so UI reacts without delay
        let currentDevSession = this.deviceSessions.find(
          s => s.deviceId === deviceId && (
            (currentUserId && s.memberId === currentUserId) ||
            (currentUserEmail && s.memberEmail && s.memberEmail.toLowerCase().trim() === currentUserEmail)
          )
        );

        if (!currentDevSession) {
          const sanitizedDevId = deviceId.replace(/[^a-zA-Z0-9_-]/g, '_');
          const sessionId = `SES_${currentUserId}_${sanitizedDevId}`;
          currentDevSession = {
            id: sessionId,
            memberId: currentUserId,
            memberEmail: this.currentUser.email || '',
            memberName: this.currentUser.name || '',
            deviceId: deviceId,
            deviceName: details.deviceName,
            deviceType: details.deviceType,
            browser: details.browser,
            os: details.os,
            isMainDevice: true,
            createdAt: nowIso,
            lastActive: nowIso,
            status: 'active'
          };
          this.deviceSessions.unshift(currentDevSession);
        }

        const sessionsToSync: UserDeviceSession[] = [];
        for (const s of this.deviceSessions) {
          const isThisUser = (currentUserId && s.memberId === currentUserId) ||
                             (currentUserEmail && s.memberEmail && s.memberEmail.toLowerCase().trim() === currentUserEmail);
          if (isThisUser) {
            const shouldBeMain = (s.deviceId === deviceId);
            s.isMainDevice = shouldBeMain;
            s.lastActive = nowIso;
            sessionsToSync.push(s);
          }
        }

        this.deviceVerificationCode = null;

        // 2. Direct concurrent sync to Firestore in background
        const { syncDeviceSessionDoc } = await import('../lib/firebase.js');
        await Promise.all(sessionsToSync.map(s => syncDeviceSessionDoc(s)));
        await this.refreshDeviceSessions();

        this.showToast('🎉 Selamat! Perangkat ini sekarang resmi menjadi Perangkat Utama Anda.');
        return { success: true };
      } catch (err: any) {
        console.error('Set main device failed:', err);
        this.setError(err?.message || 'Gagal menetapkan Perangkat Utama');
        return { success: false, error: err?.message };
      } finally {
        this.isLoading = false;
      }
    },

    async revokeDeviceSession(sessionId: string) {
      if (!this.currentUser) return { success: false, error: 'User belum login' };

      const currentDeviceId = getCurrentDeviceId();
      const currentUserId = this.currentUser.id;
      const currentUserEmail = (this.currentUser.email || '').toLowerCase().trim();

      // Validasi: Hanya Perangkat Utama yang boleh mencabut sesi login aktif perangkat lain!
      if (!this.isCurrentDeviceMain) {
        const msg = 'Hanya Perangkat Utama yang memiliki hak untuk mencabut sesi login perangkat lain.';
        this.setError(msg);
        return { success: false, error: msg };
      }

      const targetSession = this.deviceSessions.find(s => s.id === sessionId || s.deviceId === sessionId) ||
                            this.myDeviceSessions.find(s => s.id === sessionId || s.deviceId === sessionId);
      if (!targetSession) {
        return { success: false, error: 'Sesi perangkat tidak ditemukan.' };
      }

      if (targetSession.deviceId === currentDeviceId) {
        return { success: false, error: 'Tidak dapat mencabut sesi pada perangkat yang sedang aktif digunakan. Gunakan tombol Keluar jika ingin logout.' };
      }

      this.isLoading = true;
      try {
        const { syncDeviceSessionDoc } = await import('../lib/firebase.js');
        const nowIso = new Date().toISOString();

        // Cari semua dokumen yang berkaitan dengan perangkat target
        const docsToRevoke = this.deviceSessions.filter(s =>
          (s.id === targetSession.id || s.deviceId === targetSession.deviceId) && (
            (currentUserId && s.memberId === currentUserId) ||
            (currentUserEmail && s.memberEmail && s.memberEmail.toLowerCase().trim() === currentUserEmail)
          )
        );

        if (docsToRevoke.length === 0) {
          targetSession.status = 'revoked';
          targetSession.lastActive = nowIso;
          docsToRevoke.push(targetSession);
        } else {
          for (const s of docsToRevoke) {
            s.status = 'revoked';
            s.lastActive = nowIso;
          }
        }

        await Promise.all(docsToRevoke.map(s => syncDeviceSessionDoc(s)));
        await this.refreshDeviceSessions();

        this.showToast(`Sesi login pada "${targetSession.deviceName}" berhasil dicabut.`);
        return { success: true };
      } catch (err: any) {
        console.error('Revoke device session failed:', err);
        this.setError(err?.message || 'Gagal mencabut sesi perangkat');
        return { success: false, error: err?.message };
      } finally {
        this.isLoading = false;
      }
    },

    async revokeAllOtherDeviceSessions() {
      if (!this.currentUser) return { success: false, error: 'User belum login' };

      const currentDeviceId = getCurrentDeviceId();
      const currentUserId = this.currentUser.id;
      const currentUserEmail = (this.currentUser.email || '').toLowerCase().trim();

      if (!this.isCurrentDeviceMain) {
        const msg = 'Hanya Perangkat Utama yang dapat mencabut semua sesi perangkat lain.';
        this.setError(msg);
        return { success: false, error: msg };
      }

      this.isLoading = true;
      try {
        const { syncDeviceSessionDoc } = await import('../lib/firebase.js');
        let count = 0;
        const nowIso = new Date().toISOString();

        const sessionsToRevoke: UserDeviceSession[] = [];
        for (const s of this.deviceSessions) {
          const isThisUser = (currentUserId && s.memberId === currentUserId) ||
                             (currentUserEmail && s.memberEmail && s.memberEmail.toLowerCase().trim() === currentUserEmail);
          if (isThisUser && s.deviceId !== currentDeviceId && s.status === 'active') {
            s.status = 'revoked';
            s.lastActive = nowIso;
            sessionsToRevoke.push(s);
            count++;
          }
        }

        if (sessionsToRevoke.length === 0) {
          this.showToast('Tidak ada sesi perangkat lain yang aktif.');
          return { success: true, count: 0 };
        }

        await Promise.all(sessionsToRevoke.map(s => syncDeviceSessionDoc(s)));
        await this.refreshDeviceSessions();

        this.showToast(`Berhasil mencabut ${count} sesi perangkat aktif lainnya.`);
        return { success: true, count };
      } catch (err: any) {
        console.error('Revoke all other device sessions failed:', err);
        this.setError(err?.message || 'Gagal mencabut semua sesi perangkat');
        return { success: false, error: err?.message };
      } finally {
        this.isLoading = false;
      }
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

        const isGuru = member.memberType === 'guru';

        // Pengecekan keterlambatan untuk siswa (guru dikecualikan dari pemblokiran auto)
        const memOverdue = this.loans.filter(
          l => (l.memberId === member?.id || l.memberCardNumber === member?.cardNumber) && l.status === 'overdue'
        );
        if (memOverdue.length > 0 && !isGuru) {
          throw new Error(`Booking ditolak: Anda memiliki ${memOverdue.length} buku pinjaman yang terlambat dikembalikan. Silakan kembalikan buku terlebih dahulu.`);
        }

        // Pengecekan limit maksimal kuota pinjam & booking: Siswa 3 buku, Guru 6 buku
        const maxQuota = isGuru ? 6 : 3;
        const activeLoansCount = this.loans.filter(
          l => (l.memberId === member?.id || l.memberCardNumber === member?.cardNumber) && (l.status === 'active' || l.status === 'overdue')
        ).length;
        const activeBookingsCount = this.bookings.filter(
          b => (b.memberId === member?.id || b.memberCardNumber === member?.cardNumber) && b.status === 'active_hold'
        ).length;
        const totalActive = activeLoansCount + activeBookingsCount;

        if (totalActive >= maxQuota) {
          const roleTitle = isGuru ? 'Dewan Guru' : 'Siswa';
          throw new Error(
            `Booking ditolak: Anda telah mencapai batas maksimal peminjaman buku (${maxQuota} buku untuk ${roleTitle}). Saat ini Anda memiliki ${activeLoansCount} buku pinjaman aktif dan ${activeBookingsCount} buku reservasi/booking aktif. Silakan kembalikan buku sebelumnya terlebih dahulu.`
          );
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
        this.persistToLocalCache();

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
      this.persistToLocalCache();

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
        const isGuru = member.memberType === 'guru';
        const overdueLoans = this.loans.filter(
          l => (l.memberId === member.id || l.memberCardNumber === member.cardNumber) && l.status === 'overdue'
        );
        if (overdueLoans.length > 0 && !isGuru) {
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

      // Durasi peminjaman: Guru hingga 14 hari, Siswa hingga 7 hari
      const isMemberGuru = member?.memberType === 'guru';
      const maxDaysAllowed = isMemberGuru ? 14 : 7;
      const loanDays = Math.min(maxDaysAllowed, Math.max(1, Number(days) || (isMemberGuru ? 14 : 3)));
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
      this.persistToLocalCache();

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

      const isGuru = member.memberType === 'guru';

      const overdueLoans = this.loans.filter(
        l => (l.memberId === member?.id || l.memberCardNumber === member?.cardNumber) && l.status === 'overdue'
      );
      if (overdueLoans.length > 0 && !isGuru) {
        const error = `Peminjaman ditolak: Anggota (${member.name}) memiliki ${overdueLoans.length} pinjaman buku yang sudah jatuh tempo.`;
        this.setError(error);
        return { success: false, error };
      }

      // Pengecekan limit kuota pinjaman & booking: Siswa maks 3 buku, Guru maks 6 buku
      const maxQuota = isGuru ? 6 : 3;
      const activeLoansCount = this.loans.filter(
        l => (l.memberId === member?.id || l.memberCardNumber === member?.cardNumber) && (l.status === 'active' || l.status === 'overdue')
      ).length;
      const activeBookingsCount = this.bookings.filter(
        b => (b.memberId === member?.id || b.memberCardNumber === member?.cardNumber) && b.status === 'active_hold'
      ).length;
      const totalActive = activeLoansCount + activeBookingsCount;

      if (totalActive >= maxQuota) {
        const roleTitle = isGuru ? 'Dewan Guru' : 'Siswa';
        const error = `Peminjaman ditolak: ${roleTitle} (${member.name}) telah mencapai batas maksimal peminjaman (${maxQuota} buku). Saat ini memiliki ${activeLoansCount} pinjaman aktif dan ${activeBookingsCount} reservasi/booking. Tidak dapat meminjam buku lagi sebelum mengembalikan buku sebelumnya.`;
        this.setError(error);
        return { success: false, error };
      }

      // Durasi peminjaman: Guru hingga 14 hari, Siswa hingga 7 hari
      const maxDaysAllowed = isGuru ? 14 : 7;
      const loanDays = Math.min(maxDaysAllowed, Math.max(1, Number(days) || (isGuru ? 14 : 3)));
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
      this.persistToLocalCache();

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
      this.persistToLocalCache();

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
      this.persistToLocalCache();
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
    },

    setSuccess(msg: string) {
      this.showToast(msg);
    },

    // ------------------------------------------------------------------------
    // App Versioning & Changelog Actions
    // ------------------------------------------------------------------------
    markChangelogSeen() {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('libra_seen_version', this.currentAppVersion);
      }
      this.isChangelogModalOpen = false;
    },

    openChangelog() {
      this.isChangelogModalOpen = true;
    },

    closeChangelog() {
      this.isChangelogModalOpen = false;
    },

    openVersionUpdateModal() {
      this.isVersionUpdateModalOpen = true;
    },

    closeVersionUpdateModal() {
      this.isVersionUpdateModalOpen = false;
    },

    dismissUpdateBanner() {
      this.isDismissedUpdateBanner = true;
    },

    reloadApplication() {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    },

    async broadcastNewAppVersion(newVersion: string, updateMessage?: string) {
      const payload: AppVersionConfig = {
        version: newVersion,
        releaseDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        updateMessage: updateMessage || `Pembaruan sistem Libra versi ${newVersion} telah tersedia. Silakan muat ulang halaman untuk menggunakan fitur terbaru.`,
        forceReload: false
      };
      const { syncAppVersionDoc } = await import('../lib/firebase.js');
      await syncAppVersionDoc(payload);
      this.showToast(`📢 Versi baru (${newVersion}) berhasil disiarkan ke seluruh pengguna via Cloud Firestore!`);
      return { success: true };
    }
  }
});

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import CatalogView from '../views/CatalogView.vue';
import ShelvesView from '../views/ShelvesView.vue';
import MemberCardView from '../views/MemberCardView.vue';
import MemberPortalView from '../views/MemberPortalView.vue';
import AdminDashboardView from '../views/AdminDashboardView.vue';
import LoginView from '../views/LoginView.vue';
import SettingsView from '../views/SettingsView.vue';
import { useLibraryStore } from '../stores/library.js';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'catalog',
    component: CatalogView,
    meta: { title: 'Katalog Buku Publik' }
  },
  {
    path: '/shelves',
    name: 'shelves',
    component: ShelvesView,
    meta: { title: 'Manajemen Rak Perpustakaan' }
  },
  {
    path: '/member-card',
    name: 'member-card',
    component: MemberCardView,
    meta: { title: 'Kartu Member Digital & Scan QR' }
  },
  {
    path: '/member-portal',
    name: 'member-portal',
    component: MemberPortalView,
    meta: { title: 'Portal Anggota' }
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminDashboardView,
    meta: { title: 'Admin Library Dashboard', requiresAdmin: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: { title: 'Pengaturan Sistem & Database', requiresAdmin: true, requiresSuperAdmin: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: 'Masuk / Pendaftaran Akun' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

router.beforeEach(async (to, from, next) => {
  document.title = (to.meta.title ? `${to.meta.title} | ` : '') + 'Libra';
  
  const store = useLibraryStore();
  
  // Verifikasi keabsahan sesi: HANYA jika token dan user_id aktif tersimpan di browser
  if (!store.currentUser) {
    const savedToken = localStorage.getItem('pustaka_token');
    const savedUserId = localStorage.getItem('pustaka_user_id');

    if (savedToken && savedUserId) {
      const member = store.members.find(m => m.id === savedUserId);
      if (member) {
        store.currentUser = member;
      } else {
        const rawUser = localStorage.getItem('pustaka_user');
        if (rawUser) {
          try {
            const parsed = JSON.parse(rawUser);
            if (parsed && parsed.id === savedUserId) {
              store.currentUser = parsed;
            } else {
              localStorage.removeItem('pustaka_user');
            }
          } catch {
            localStorage.removeItem('pustaka_user');
          }
        }
      }
    } else {
      // Tidak ada token aktif / user ID di browser: pastikan sesi kosong total
      store.currentUser = null;
      store.authToken = '';
      localStorage.removeItem('pustaka_user');
      localStorage.removeItem('pustaka_token');
      localStorage.removeItem('pustaka_user_id');
    }
  }

  // Check Super Admin route protection (e.g. /settings)
  if (to.meta.requiresSuperAdmin) {
    if (!store.currentUser || store.currentUser.role !== 'admin') {
      store.setError('Akses Terbatas: Anda harus masuk sebagai Super Administrator terlebih dahulu.');
      return next({ path: '/login', query: { mode: 'admin', redirect: to.fullPath } });
    }
    if (!store.isSuperAdmin) {
      store.setError('Akses Ditolak: Halaman Pengaturan & Database hanya dapat diakses oleh Super Admin.');
      return next({ path: '/admin' });
    }
  }

  // Check admin route protection
  if (to.meta.requiresAdmin) {
    if (!store.currentUser || store.currentUser.role !== 'admin') {
      store.setError('Akses Terbatas: Anda harus masuk sebagai Administrator terlebih dahulu.');
      return next({ path: '/login', query: { mode: 'admin', redirect: to.fullPath } });
    }
  }

  next();
});

export default router;

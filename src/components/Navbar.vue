<template>
  <header class="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        
        <!-- Brand / Logo -->
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-md group-hover:scale-105 transition duration-200">
            B
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-xl tracking-tight text-white group-hover:text-blue-400 transition">Libra</span>
            </div>
          </div>
        </router-link>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-1.5">
          <router-link 
            to="/" 
            class="px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2"
            :class="$route.name === 'catalog' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'"
          >
            <BookMarked class="w-4 h-4" />
            Katalog Publik
          </router-link>

          <router-link 
            to="/shelves" 
            class="px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2"
            :class="$route.name === 'shelves' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'"
          >
            <Layers class="w-4 h-4" />
            Peta Rak
          </router-link>

          <router-link 
            to="/member-card" 
            class="px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2"
            :class="$route.name === 'member-card' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'"
          >
            <QrCode class="w-4 h-4" />
            Kartu Member QR
          </router-link>

          <router-link 
            v-if="store.currentUser"
            to="/member-portal" 
            class="px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 relative"
            :class="$route.name === 'member-portal' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'"
          >
            <UserCheck class="w-4 h-4" />
            Portal Saya
            <span v-if="store.myActiveLoans.length" class="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-400 text-slate-950 font-bold">
              {{ store.myActiveLoans.length }}
            </span>
            <span v-if="store.currentUser.isSuspended" class="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute -top-0.5 -right-0.5"></span>
          </router-link>

          <router-link 
            v-if="store.isAdmin"
            to="/admin" 
            class="px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 relative"
            :class="$route.name === 'admin' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'"
          >
            <ShieldCheck class="w-4 h-4 text-blue-300" />
            Admin Panel
            <span v-if="store.overdueLoans.length" class="px-1.5 py-0.2 text-[10px] rounded-full bg-rose-500 text-white font-bold animate-pulse">
              {{ store.overdueLoans.length }} Telat
            </span>
          </router-link>
        </nav>

        <!-- Right Side: Scanner Ready Pill & Role Switcher -->
        <div class="flex items-center gap-3">
          
          <!-- Scanner Status Pill Indicator -->
          <router-link 
            to="/member-card"
            class="hidden sm:flex items-center gap-2.5 bg-slate-800/80 hover:bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-700/80 transition"
          >
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-300">Scanner Ready</span>
            <div class="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
          </router-link>

            <!-- User Auth Dropdown -->
            <div class="relative">
              <button 
                @click="toggleUserMenu"
                class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs transition cursor-pointer"
              >
                <template v-if="store.currentUser">
                  <img :src="store.currentUser.avatar" class="w-6 h-6 rounded-full object-cover border border-blue-400" alt="Avatar" />
                  <div class="text-left hidden lg:block">
                    <div class="font-semibold text-white flex items-center gap-1.5">
                      {{ store.currentUser.name }}
                      <span v-if="store.currentUser.role === 'admin'" class="text-[9px] px-1.5 py-0.2 bg-blue-500/30 text-blue-300 border border-blue-500/40 rounded-full font-bold">ADMIN</span>
                      <span v-else-if="store.currentUser.isSuspended" class="text-[9px] px-1.5 py-0.2 bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-full font-bold">SUSPEND</span>
                    </div>
                    <div class="text-[10px] text-blue-400 uppercase font-mono">{{ store.currentUser.cardNumber }}</div>
                  </div>
                </template>
                <template v-else>
                  <User class="w-4 h-4 text-slate-400" />
                  <span class="font-medium text-slate-300 hidden lg:inline">Masuk / Akun</span>
                </template>
                <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
              </button>

              <!-- Dropdown Options -->
              <div 
                v-if="isUserMenuOpen" 
                class="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 text-xs space-y-1"
                @click="isUserMenuOpen = false"
              >
                <!-- If Logged In -->
                <div v-if="store.currentUser" class="px-3.5 py-2.5 border-b border-slate-800 bg-slate-800/40 rounded-t-xl">
                  <div class="flex items-center gap-2.5">
                    <img :src="store.currentUser.avatar" class="w-9 h-9 rounded-full object-cover border-2 border-blue-500" alt="Avatar" />
                    <div class="overflow-hidden">
                      <div class="font-bold text-white text-xs truncate">{{ store.currentUser.name }}</div>
                      <div class="text-[10px] text-slate-400 truncate">{{ store.currentUser.email || store.currentUser.phone }}</div>
                      <div class="text-[10px] text-blue-400 font-mono font-semibold">{{ store.currentUser.cardNumber }}</div>
                    </div>
                  </div>
                </div>

                <!-- Admin Controls if Admin -->
                <div v-if="store.isAdmin" class="p-1 space-y-1">
                  <router-link 
                    to="/admin" 
                    class="w-full text-left px-3.5 py-2 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-blue-300 font-semibold transition"
                  >
                    <ShieldCheck class="w-4 h-4 text-blue-400" />
                    Admin Console Hub
                  </router-link>
                  <router-link 
                    to="/shelves" 
                    class="w-full text-left px-3.5 py-2 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-slate-200 transition"
                  >
                    <Layers class="w-4 h-4 text-slate-400" />
                    Kelola Rak & Koleksi
                  </router-link>
                  <router-link 
                    to="/settings" 
                    class="w-full text-left px-3.5 py-2 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-slate-200 transition"
                  >
                    <Settings class="w-4 h-4 text-slate-400" />
                    Pengaturan & Database
                  </router-link>
                </div>

                <!-- Member Controls if Member -->
                <div v-else-if="store.currentUser" class="p-1 space-y-1">
                  <router-link 
                    to="/member-portal" 
                    class="w-full text-left px-3.5 py-2 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-slate-200 transition"
                  >
                    <UserCheck class="w-4 h-4 text-emerald-400" />
                    Portal Pinjaman Saya
                  </router-link>
                  <router-link 
                    to="/member-card" 
                    class="w-full text-left px-3.5 py-2 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-slate-200 transition"
                  >
                    <QrCode class="w-4 h-4 text-blue-400" />
                    Kartu Digital Member QR
                  </router-link>
                </div>

                <!-- If Guest / Not Logged In -->
                <div v-if="!store.currentUser" class="p-2 space-y-1.5">
                  <div class="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Akses Masuk Autentikasi
                  </div>

                  <!-- Standard Login Link -->
                  <router-link 
                    to="/login"
                    class="w-full text-left px-3 py-2.5 hover:bg-blue-600 bg-blue-600/90 text-white rounded-xl flex items-center gap-2.5 transition font-bold"
                  >
                    <LogIn class="w-4 h-4" />
                    <span>Masuk / Login Akun</span>
                  </router-link>

                  <!-- Admin Login Link -->
                  <router-link 
                    to="/login?mode=admin"
                    class="w-full text-left px-3 py-2 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center gap-2.5 transition text-slate-300 font-medium"
                  >
                    <ShieldCheck class="w-4 h-4 text-blue-400" />
                    <span>Login Administrator</span>
                  </router-link>

                  <!-- Register Link -->
                  <router-link 
                    to="/login?mode=register"
                    class="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl flex items-center gap-2.5 transition text-[11px]"
                  >
                    <UserPlus class="w-4 h-4 text-slate-400" />
                    <span>Daftar Anggota Baru</span>
                  </router-link>
                </div>

                <!-- Logout / Switch to Public Mode Button -->
                <div v-if="store.currentUser" class="border-t border-slate-800 pt-1 px-1">
                  <button 
                    @click="handleLogoutClick"
                    class="w-full text-left px-3 py-2 hover:bg-rose-950/40 text-rose-300 rounded-xl flex items-center gap-2.5 transition cursor-pointer font-semibold"
                  >
                    <LogOut class="w-4 h-4 text-rose-400" />
                    Keluar / Logout
                  </button>
                </div>

              </div>
            </div>

          <!-- Mobile Hamburger Toggle -->
          <button 
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            aria-label="Menu"
          >
            <Menu v-if="!isMobileMenuOpen" class="w-5 h-5" />
            <X v-else class="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>

    <!-- Mobile Nav Drawer -->
    <div v-if="isMobileMenuOpen" class="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
      <router-link 
        to="/" 
        @click="isMobileMenuOpen = false"
        class="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800"
      >
        📖 Katalog Publik
      </router-link>
      <router-link 
        to="/shelves" 
        @click="isMobileMenuOpen = false"
        class="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800"
      >
        🗄️ Peta Rak
      </router-link>
      <router-link 
        to="/member-card" 
        @click="isMobileMenuOpen = false"
        class="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800"
      >
        💳 Kartu Member QR
      </router-link>
      <router-link 
        v-if="store.currentUser"
        to="/member-portal" 
        @click="isMobileMenuOpen = false"
        class="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800"
      >
        👤 Portal Pinjaman Saya
      </router-link>
      <router-link 
        v-if="store.isAdmin"
        to="/admin" 
        @click="isMobileMenuOpen = false"
        class="block px-3 py-2 rounded-xl text-xs font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/20"
      >
        ⚡ Admin Dashboard Console
      </router-link>
      <router-link 
        v-if="!store.currentUser"
        to="/login" 
        @click="isMobileMenuOpen = false"
        class="block px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-600"
      >
        🔑 Masuk / Daftar Akun
      </router-link>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import { 
  BookMarked, Layers, QrCode, UserCheck, 
  ShieldCheck, User, ChevronDown, Menu, X, LogIn, UserPlus, LogOut, Settings
} from 'lucide-vue-next';
import { logoutUser } from '../lib/firebase.js';

const store = useLibraryStore();
const isUserMenuOpen = ref(false);
const isMobileMenuOpen = ref(false);

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const handleLogoutClick = async () => {
  try {
    await logoutUser().catch(() => {});
  } finally {
    store.logout();
    isUserMenuOpen.value = false;
  }
};
</script>

<template>
  <div 
    class="min-h-screen flex flex-col selection:bg-blue-500 selection:text-white font-sans antialiased transition-colors duration-200"
    :class="{
      'bg-slate-50 text-slate-900': store.currentTheme === 'light',
      'bg-[#0b0f19] text-slate-100': store.currentTheme === 'dark',
      'bg-[#070d1e] text-slate-100': store.currentTheme === 'elegant'
    }"
  >
    
    <!-- Navigation Bar -->
    <Navbar />

    <!-- Toast Notification Banner -->
    <div 
      v-if="store.toastMessage"
      class="fixed bottom-20 md:bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-[100] px-4 sm:px-5 py-3.5 bg-slate-900/95 text-white font-semibold rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 text-xs border border-slate-800 backdrop-blur-md"
    >
      <div class="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center text-white shrink-0">
        <Bell class="w-3.5 h-3.5" />
      </div>
      <span class="flex-1 line-clamp-2">{{ store.toastMessage }}</span>
    </div>

    <!-- Error Alert Toast -->
    <div 
      v-if="store.error"
      class="fixed bottom-20 md:bottom-6 left-4 sm:left-6 right-4 sm:right-auto z-[100] px-4 sm:px-5 py-3.5 bg-rose-600/95 text-white font-semibold rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300 text-xs border border-rose-500 max-w-md backdrop-blur-md"
    >
      <div class="flex items-center gap-2">
        <AlertCircle class="w-4 h-4 shrink-0 text-white" />
        <span class="line-clamp-2">{{ store.error }}</span>
      </div>
      <button @click="store.clearError" class="p-1 rounded-lg hover:bg-rose-700 text-white cursor-pointer">✕</button>
    </div>

    <!-- Main View Content -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-12">
      
      <!-- PWA Install Prompt Banner -->
      <PwaInstallBanner class="mb-4 sm:mb-6" />

      <!-- Cloud Quota Exceeded Friendly Banner -->
      <div 
        v-if="store.isQuotaExhausted"
        class="mb-4 sm:mb-6 p-3.5 sm:p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-amber-900 shadow-xs"
      >
        <div class="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm">
          <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
            <Database class="w-4 h-4" />
          </div>
          <div>
            <span class="font-bold">Mode Penyimpanan Lokal Aktif:</span>
            <span class="text-amber-800 ml-1">Batas kuota harian Cloud Firestore telah tercapai. Aplikasi tetap berfungsi normal, data buku dan transaksi tersimpan aman di penyimpanan lokal perangkat.</span>
          </div>
        </div>
        <button 
          @click="store.exportDatabaseBackup()"
          class="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Unduh cadangan data JSON"
        >
          <Download class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Cadangkan Data</span>
        </button>
      </div>

      <!-- Active View -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Bottom Navigation Bar for Mobile -->
    <BottomNav />

    <!-- Real-time App Version Notification & Modals -->
    <NewVersionBanner />
    <VersionCacheGuideModal />
    <ChangelogModal />

    <!-- Footer (Hidden on small mobile screens to keep clean native app feel, shown on tablet/desktop) -->
    <footer 
      class="hidden md:block border-t mt-auto py-8 text-xs transition-colors duration-200"
      :class="{
        'border-slate-200/80 bg-white text-slate-500': store.currentTheme === 'light',
        'border-slate-800 bg-[#0e1422] text-slate-400': store.currentTheme === 'dark',
        'border-blue-500/20 bg-[#070d1e] text-slate-400': store.currentTheme === 'elegant'
      }"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div class="flex items-center gap-3">
          <div 
            class="w-9 h-9 rounded-xl overflow-hidden group-hover:scale-105 transition duration-200 flex items-center justify-center border"
            :class="store.currentTheme === 'light' ? 'bg-blue-50 border-blue-100' : 'bg-slate-900 border-slate-700'"
          >
            <img :src="'/pwa-192x192.png'" alt="Libra Logo" class="w-full h-full object-cover" />
          </div>
          <div>
            <div 
              class="font-bold tracking-tight"
              :class="store.currentTheme === 'light' ? 'text-slate-800' : 'text-slate-100'"
            >
              Libra • Smart Library
            </div>
            <div class="text-[11px]" :class="store.currentTheme === 'light' ? 'text-slate-400' : 'text-slate-500'">
              Sistem Otomasi & Sirkulasi Perpustakaan
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4 text-[11px]">
          <div 
            class="flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-colors"
            :class="{
              'bg-slate-50 border-slate-200 text-slate-700': store.currentTheme === 'light',
              'bg-slate-900 border-slate-700 text-slate-300': store.currentTheme === 'dark',
              'bg-slate-900/60 border-blue-500/20 text-slate-300': store.currentTheme === 'elegant'
            }"
          >
            <span 
              class="w-2 h-2 rounded-full"
              :class="store.isQuotaExhausted ? 'bg-amber-500' : (store.isUsingOfflineData ? 'bg-amber-500' : 'bg-green-500 animate-pulse')"
            ></span>
            <span class="font-medium">
              {{ store.isQuotaExhausted ? 'Penyimpanan Offline Lokal Aktif (Batas Kuota Cloud Harian)' : (store.isUsingOfflineData ? 'Mode Offline Lokal' : 'Sinkronisasi Otomatis Cloud Aktif (Hold 24h & Auto-Suspend)') }}
            </span>
          </div>

          <button 
            @click="store.openChangelog()"
            class="px-3 py-1 rounded-full font-semibold border transition cursor-pointer flex items-center gap-1.5"
            :class="store.currentTheme === 'light' 
              ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' 
              : 'bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border-blue-800/60'"
            title="Buka Catatan Rilis & Riwayat Pembaruan"
          >
            <Sparkles class="w-3.5 h-3.5 text-blue-500" />
            <span>v{{ store.currentAppVersion }}</span>
          </button>
        </div>

        <div class="text-[11px]" :class="store.currentTheme === 'light' ? 'text-slate-400' : 'text-slate-500'">
          © {{ new Date().getFullYear() }} SDN Pengasinan VII Kota Bekasi
        </div>

      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useLibraryStore } from './stores/library.js';
import Navbar from './components/Navbar.vue';
import BottomNav from './components/BottomNav.vue';
import PwaInstallBanner from './components/PwaInstallBanner.vue';
import NewVersionBanner from './components/NewVersionBanner.vue';
import VersionCacheGuideModal from './components/VersionCacheGuideModal.vue';
import ChangelogModal from './components/ChangelogModal.vue';
import { Bell, AlertCircle, Database, Download, Sparkles } from 'lucide-vue-next';

const store = useLibraryStore();

onMounted(async () => {
  store.initTheme();
  await store.initAll();

  if (typeof window !== 'undefined') {
    window.addEventListener('focus', () => {
      if (store.currentUser) {
        store.checkAndAutoRegisterCurrentDevice(false);
      }
    });
  }
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

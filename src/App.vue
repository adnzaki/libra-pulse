<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-500 selection:text-white font-sans antialiased">
    
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
    <footer class="hidden md:block border-t border-slate-200/80 bg-white mt-auto py-8 text-xs text-slate-500">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-sm">
            L
          </div>
          <div>
            <div class="font-bold text-slate-800 tracking-tight">Libra • Smart Library</div>
            <div class="text-[11px] text-slate-400">Sistem Otomasi & Sirkulasi Perpustakaan</div>
          </div>
        </div>

        <div class="flex items-center gap-4 text-[11px]">
          <div class="flex items-center gap-2 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200">
            <span 
              class="w-2 h-2 rounded-full"
              :class="store.isQuotaExhausted ? 'bg-amber-500' : (store.isUsingOfflineData ? 'bg-amber-500' : 'bg-green-500 animate-pulse')"
            ></span>
            <span class="font-medium text-slate-700">
              {{ store.isQuotaExhausted ? 'Penyimpanan Offline Lokal Aktif (Batas Kuota Cloud Harian)' : (store.isUsingOfflineData ? 'Mode Offline Lokal' : 'Sinkronisasi Otomatis Cloud Aktif (Hold 24h & Auto-Suspend)') }}
            </span>
          </div>

          <button 
            @click="store.openChangelog()"
            class="px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 transition cursor-pointer flex items-center gap-1.5"
            title="Buka Catatan Rilis & Riwayat Pembaruan"
          >
            <Sparkles class="w-3.5 h-3.5 text-blue-600" />
            <span>v{{ store.currentAppVersion }} • Catatan Rilis</span>
          </button>
        </div>

        <div class="text-[11px] text-slate-400">
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
  await store.initAll();
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

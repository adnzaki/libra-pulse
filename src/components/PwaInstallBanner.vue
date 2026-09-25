<template>
  <div>
    <!-- Sticky / Floating Top Notification Banner -->
    <div 
      v-if="showBanner && !isInstalled" 
      class="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 text-white px-3.5 sm:px-4 py-3 shadow-lg flex items-center justify-between z-40 sticky top-0 text-xs border-b border-blue-500/30 backdrop-blur-md"
    >
      <div class="flex items-center gap-3 min-w-0 pr-2">
        <!-- Libra App Icon Preview -->
        <div class="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-blue-400/40 shadow-md shadow-blue-500/20 bg-slate-950 p-0.5">
          <img :src="'/pwa-192x192.png'" alt="Libra Logo" class="w-full h-full object-cover rounded-lg" />
        </div>

        <div class="min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="font-bold text-white text-xs sm:text-sm">Pasang Libra ke Layar Utama:</span>
            <span class="px-1.5 py-0.2 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] rounded-md font-semibold">
              PWA Resmi
            </span>
          </div>
          <p class="text-slate-300 text-[11px] sm:text-xs truncate sm:whitespace-normal">
            Akses langsung dengan ikon Libra di homescreen HP tanpa repot buka browser.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button 
          @click="handleInstallClick"
          class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold px-3 sm:px-4 py-1.5 rounded-xl text-xs transition shadow-md shadow-blue-900/40 flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Download class="w-3.5 h-3.5" />
          <span>{{ deferredPrompt ? 'Pasang Sekarang' : 'Petunjuk Pasang' }}</span>
        </button>
        <button 
          @click="dismissBanner" 
          class="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/80 transition cursor-pointer"
          aria-label="Tutup Banner"
          title="Tutup banner"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Modal Panduan Instalasi Homescreen -->
    <div 
      v-if="isGuideModalOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      @click.self="isGuideModalOpen = false"
    >
      <div class="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl overflow-hidden border border-cyan-400/40 shadow-lg shadow-cyan-500/20 bg-slate-950 p-0.5 shrink-0">
              <img :src="'/pwa-192x192.png'" alt="Libra App Icon" class="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <h3 class="font-bold text-base text-white flex items-center gap-1.5">
                Pasang Libra ke Homescreen
                <CheckCircle2 class="w-4 h-4 text-emerald-400" />
              </h3>
              <p class="text-xs text-slate-400">SDN Pengasinan VII Smart Library</p>
            </div>
          </div>
          <button 
            @click="isGuideModalOpen = false" 
            class="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Content -->
        <div class="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          <!-- Homescreen Icon Preview Card -->
          <div class="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
            <div class="flex flex-col items-center gap-1.5 shrink-0">
              <div class="w-14 h-14 rounded-2xl overflow-hidden shadow-lg shadow-blue-600/30 border border-cyan-400/50 bg-slate-950 flex items-center justify-center">
                <img :src="'/pwa-192x192.png'" alt="Logo Libra Homescreen" class="w-full h-full object-cover" />
              </div>
              <span class="text-[11px] font-semibold text-slate-300">Libra</span>
            </div>
            <div class="text-xs text-slate-300 space-y-1">
              <p class="font-semibold text-white flex items-center gap-1">
                <Sparkles class="w-3.5 h-3.5 text-amber-400" />
                Tampilan Ikon di HP
              </p>
              <p class="text-slate-400 text-[11px] leading-relaxed">
                Ikon resmi Libra dengan lambang buku sayap & logo bercahaya ini akan langsung muncul di Layar Utama HP Anda setelah dipasang.
              </p>
            </div>
          </div>

          <!-- Platform Selector Tabs -->
          <div class="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button 
              @click="activeTab = 'android'"
              class="py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              :class="activeTab === 'android' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            >
              <Smartphone class="w-4 h-4" />
              Android (Chrome)
            </button>
            <button 
              @click="activeTab = 'ios'"
              class="py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              :class="activeTab === 'ios' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            >
              <Apple class="w-4 h-4" />
              iPhone / iPad (Safari)
            </button>
          </div>

          <!-- Tab 1: Android Chrome Instructions -->
          <div v-if="activeTab === 'android'" class="space-y-3">
            <div v-if="deferredPrompt" class="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-between">
              <div>
                <p class="font-bold text-xs text-blue-300">Dukungan Otomatis Terdeteksi</p>
                <p class="text-[11px] text-slate-400">Browser Anda siap memasang langsung.</p>
              </div>
              <button 
                @click="triggerNativePrompt"
                class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Download class="w-3.5 h-3.5" />
                Pasang Langsung
              </button>
            </div>

            <div class="space-y-2 text-xs">
              <p class="font-bold text-slate-200 flex items-center gap-1.5">
                <span class="w-5 h-5 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center font-bold text-[11px]">1</span>
                Ketuk Menu Titik Tiga (⋮)
              </p>
              <p class="text-slate-400 pl-6 text-[11px]">
                Di browser Google Chrome Android, ketuk ikon titik tiga di sudut kanan atas layar.
              </p>

              <p class="font-bold text-slate-200 flex items-center gap-1.5 pt-1">
                <span class="w-5 h-5 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center font-bold text-[11px]">2</span>
                Pilih "Instal aplikasi" atau "Tambahkan ke Layar Utama"
              </p>
              <p class="text-slate-400 pl-6 text-[11px]">
                Cari menu bertuliskan <strong>"Instal aplikasi"</strong> (atau <em>Add to Home Screen</em>).
              </p>

              <p class="font-bold text-slate-200 flex items-center gap-1.5 pt-1">
                <span class="w-5 h-5 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center font-bold text-[11px]">3</span>
                Konfirmasi Instalasi
              </p>
              <p class="text-slate-400 pl-6 text-[11px]">
                Tekan tombol <strong>"Instal"</strong>. Tunggu beberapa detik, Chrome akan membuat aplikasi WebAPK dengan logo Libra di homescreen HP Anda.
              </p>
            </div>

            <!-- Fix Note Info -->
            <div class="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
              <Info class="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Info Pembaruan PWA:</strong> Masalah <em>"cannot be installed"</em> sebelumnya telah diperbaiki dengan konfigurasi Web App Manifest standar, ikon lokal resolusi tinggi (192x192 & 512x512), dan Service Worker offline aktif.
              </span>
            </div>
          </div>

          <!-- Tab 2: iOS Safari Instructions -->
          <div v-else-if="activeTab === 'ios'" class="space-y-3">
            <div class="space-y-2 text-xs">
              <p class="font-bold text-slate-200 flex items-center gap-1.5">
                <span class="w-5 h-5 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center font-bold text-[11px]">1</span>
                Buka Menu Bagikan (Share)
              </p>
              <p class="text-slate-400 pl-6 text-[11px]">
                Di Safari pada iPhone atau iPad, ketuk tombol <strong>Share</strong> (ikon kotak dengan panah ke atas) di bilah bawah.
              </p>

              <p class="font-bold text-slate-200 flex items-center gap-1.5 pt-1">
                <span class="w-5 h-5 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center font-bold text-[11px]">2</span>
                Pilih "Tambahkan ke Layar Utama"
              </p>
              <p class="text-slate-400 pl-6 text-[11px]">
                Gulir ke bawah pada menu opsi lalu ketuk <strong>"Tambahkan ke Layar Utama"</strong> (<em>Add to Home Screen</em>).
              </p>

              <p class="font-bold text-slate-200 flex items-center gap-1.5 pt-1">
                <span class="w-5 h-5 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center font-bold text-[11px]">3</span>
                Ketuk "Tambah" di Pojok Kanan Atas
              </p>
              <p class="text-slate-400 pl-6 text-[11px]">
                Ikon Libra resmi akan langsung muncul di Homescreen iPhone/iPad Anda.
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span class="text-[11px] text-slate-500">Libra PWA • Bebas Iklan & Cepat</span>
          <button 
            @click="isGuideModalOpen = false" 
            class="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { 
  Download, X, Sparkles, Smartphone, CheckCircle2, 
  Info 
} from 'lucide-vue-next';
import { useLibraryStore } from '../stores/library.js';

// SVG icon for Apple tab
const Apple = {
  template: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>`
};

const store = useLibraryStore();
const showBanner = ref(false);
const isInstalled = ref(false);
const isGuideModalOpen = ref(false);
const activeTab = ref<'android' | 'ios'>('android');
const deferredPrompt = ref<any>(null);

const checkIfInstalled = () => {
  const isStandalone = 
    window.matchMedia('(display-mode: standalone)').matches || 
    (window.navigator as any).standalone === true;
  isInstalled.value = isStandalone;
  return isStandalone;
};

const handleBeforeInstallPrompt = (e: Event) => {
  e.preventDefault();
  deferredPrompt.value = e;
  if (!checkIfInstalled()) {
    showBanner.value = true;
  }
};

const handleAppInstalled = () => {
  isInstalled.value = true;
  showBanner.value = false;
  deferredPrompt.value = null;
  isGuideModalOpen.value = false;
  store.showToast('Selamat! Libra telah berhasil dipasang ke layar utama.');
};

const openGuide = () => {
  // Detect OS for default tab
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) {
    activeTab.value = 'ios';
  } else {
    activeTab.value = 'android';
  }
  isGuideModalOpen.value = true;
};

const handleInstallClick = async () => {
  if (deferredPrompt.value) {
    await triggerNativePrompt();
  } else {
    openGuide();
  }
};

const triggerNativePrompt = async () => {
  if (!deferredPrompt.value) return;
  try {
    deferredPrompt.value.prompt();
    const choice = await deferredPrompt.value.userChoice;
    if (choice.outcome === 'accepted') {
      showBanner.value = false;
      isGuideModalOpen.value = false;
      store.showToast('Memasang Libra ke layar utama...');
    }
    deferredPrompt.value = null;
  } catch (err) {
    console.error('PWA install prompt error:', err);
    openGuide();
  }
};

const dismissBanner = () => {
  showBanner.value = false;
  sessionStorage.setItem('pwa_banner_dismissed_session', 'true');
};

const onCustomOpenEvent = () => {
  openGuide();
};

onMounted(() => {
  checkIfInstalled();

  // Listen for Chrome / Android PWA prompt event
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);
  window.addEventListener('open-pwa-install-modal', onCustomOpenEvent);

  // Show banner if in browser and not dismissed this session
  if (!isInstalled.value && !sessionStorage.getItem('pwa_banner_dismissed_session')) {
    setTimeout(() => {
      if (!isInstalled.value) {
        showBanner.value = true;
      }
    }, 1500);
  }
});

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.removeEventListener('appinstalled', handleAppInstalled);
  window.removeEventListener('open-pwa-install-modal', onCustomOpenEvent);
});
</script>

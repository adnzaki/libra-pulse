<template>
  <div v-if="showBanner" class="bg-slate-900 text-white px-4 py-2.5 shadow-md flex items-center justify-between z-50 sticky top-0 text-xs border-b border-slate-800">
    <div class="flex items-center gap-3">
      <span class="p-1.5 bg-blue-500/20 text-blue-400 rounded-xl">
        <Sparkles class="w-4 h-4" />
      </span>
      <div>
        <span class="font-bold text-white">Install PustakaModern PWA:</span>
        <span class="text-slate-300 ml-1">Akses cepat katalog, kartu digital QR & scan offline langsung dari layar utama perangkat Anda!</span>
      </div>
    </div>
    <div class="flex items-center gap-2 shrink-0">
      <button 
        @click="installPwa"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-full text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
      >
        <Download class="w-3.5 h-3.5" />
        Install Aplikasi
      </button>
      <button 
        @click="dismissBanner" 
        class="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition cursor-pointer"
        aria-label="Tutup"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Sparkles, Download, X } from 'lucide-vue-next';

const showBanner = ref(false);
let deferredPrompt: any = null;

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showBanner.value = true;
  });

  // Check if dismissed previously
  if (!localStorage.getItem('pwa_dismissed')) {
    // Show polite prompt demo indicator if in browser
    setTimeout(() => {
      if (!deferredPrompt && window.matchMedia('(display-mode: browser)').matches) {
        showBanner.value = true;
      }
    }, 2000);
  }
});

const installPwa = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      showBanner.value = false;
    }
    deferredPrompt = null;
  } else {
    alert('Untuk menginstal aplikasi: Klik tombol Menu browser (tiga titik di kanan atas) lalu pilih "Tambahkan ke Layar Utama" / "Install App".');
    showBanner.value = false;
  }
};

const dismissBanner = () => {
  showBanner.value = false;
  localStorage.setItem('pwa_dismissed', 'true');
};
</script>

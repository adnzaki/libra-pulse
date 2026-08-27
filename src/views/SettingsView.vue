<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Settings class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Pengaturan Sistem & Database</h1>
          <p class="text-xs text-slate-500 mt-0.5">Kelola sinkronisasi Cloud Firestore, unduhan offline lokal, dan backup data.</p>
        </div>
      </div>
    </div>

    <!-- Storage & Offline Management -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Cloud Firestore Sync Card -->
      <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">Cloud Firestore</span>
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          <h3 class="font-bold text-slate-900 text-base">Sinkronisasi Cloud</h3>
          <p class="text-xs text-slate-500 leading-relaxed">
            Sinkronkan data katalog buku, transaksi peminjaman, rak, dan anggota perpustakaan secara dua arah dengan database cloud Firestore.
          </p>
        </div>
        <button 
          @click="handleSyncCloud"
          :disabled="isSyncingCloud"
          class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isSyncingCloud }" />
          <span>{{ isSyncingCloud ? 'Menyinkronkan...' : 'Sinkronkan Sekarang' }}</span>
        </button>
      </div>

      <!-- Offline Download Card -->
      <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">Akses Lokal</span>
            <Download class="w-4 h-4 text-indigo-600" />
          </div>
          <h3 class="font-bold text-slate-900 text-base">Unduh Data untuk Offline</h3>
          <p class="text-xs text-slate-500 leading-relaxed">
            Simpan seluruh katalog buku, status sirkulasi, dan direktori ke IndexedDB / LocalStorage perangkat agar dapat diakses tanpa koneksi internet.
          </p>
        </div>
        <button 
          @click="handleDownloadOffline"
          :disabled="isDownloadingOffline"
          class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <Download class="w-4 h-4" :class="{ 'animate-bounce': isDownloadingOffline }" />
          <span>{{ isDownloadingOffline ? 'Mengunduh...' : 'Unduh ke Lokal' }}</span>
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
      <h3 class="font-bold text-sm text-slate-200">Ringkasan Data Tersimpan</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div class="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50">
          <div class="text-slate-400 text-[10px] uppercase font-bold">Total Buku</div>
          <div class="text-xl font-extrabold text-white mt-1">{{ store.books.length }}</div>
        </div>
        <div class="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50">
          <div class="text-slate-400 text-[10px] uppercase font-bold">Anggota</div>
          <div class="text-xl font-extrabold text-white mt-1">{{ store.members.length }}</div>
        </div>
        <div class="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50">
          <div class="text-slate-400 text-[10px] uppercase font-bold">Rak Buku</div>
          <div class="text-xl font-extrabold text-white mt-1">{{ store.shelves.length }}</div>
        </div>
        <div class="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50">
          <div class="text-slate-400 text-[10px] uppercase font-bold">Pinjaman Aktif</div>
          <div class="text-xl font-extrabold text-white mt-1">{{ store.activeLoans.length }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import { Settings, RefreshCw, Download } from 'lucide-vue-next';

const store = useLibraryStore();
const isSyncingCloud = ref(false);
const isDownloadingOffline = ref(false);

const handleSyncCloud = async () => {
  isSyncingCloud.value = true;
  try {
    await store.syncWithCloudFirestore();
  } finally {
    isSyncingCloud.value = false;
  }
};

const handleDownloadOffline = async () => {
  isDownloadingOffline.value = true;
  try {
    await store.downloadForOffline();
  } finally {
    isDownloadingOffline.value = false;
  }
};
</script>

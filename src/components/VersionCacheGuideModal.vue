<template>
  <div 
    v-if="store.isVersionUpdateModalOpen" 
    class="fixed inset-0 z-80 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
    @click.self="store.closeVersionUpdateModal()"
  >
    <div 
      class="bg-white text-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[92dvh] flex flex-col"
    >
      <!-- Modal Header -->
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50 shrink-0">
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div class="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs shrink-0">
            <HelpCircle class="w-5 h-5 text-slate-950" />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="font-extrabold text-sm sm:text-base text-slate-900 truncate">Panduan Pembaruan Aplikasi</h3>
            <p class="text-xs text-slate-500 truncate">Langkah jika versi aplikasi belum berubah setelah muat ulang</p>
          </div>
        </div>
        <button 
          @click="store.closeVersionUpdateModal()"
          class="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer shrink-0"
          aria-label="Tutup"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Modal Content: Step-by-step instructions -->
      <div class="p-5 overflow-y-auto flex-1 space-y-4 text-xs text-slate-600 leading-relaxed">
        
        <!-- Explanation Note -->
        <div class="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-3">
          <Info class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p>
            Peramban web (browser) sering kali menyimpan salinan sementara file aplikasi (<strong>Cache & Cookies</strong>) untuk mempercepat loading. Jika Anda telah memuat ulang namun versi belum berganti, ikuti salah satu langkah mudah berikut:
          </p>
        </div>

        <!-- Step 1: Shortcut Keyboard (Desktop) -->
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div class="flex items-center gap-2 font-bold text-slate-900 text-xs">
            <span class="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
            <span>Muat Ulang Keras (Hard Reload) — Laptop / Komputer</span>
          </div>
          <p class="text-slate-600 pl-7">
            Tekan kombinasi tombol keyboard berikut pada halaman aplikasi:
          </p>
          <div class="pl-7 flex flex-wrap gap-2 pt-1">
            <kbd class="px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-800 shadow-2xs">
              Ctrl + F5
            </kbd>
            <span class="text-slate-400 self-center">atau</span>
            <kbd class="px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-800 shadow-2xs">
              Ctrl + Shift + R
            </kbd>
            <span class="text-slate-400 self-center text-[11px]">(Windows / Linux)</span>
          </div>
          <div class="pl-7 flex items-center gap-2 pt-0.5">
            <kbd class="px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-800 shadow-2xs">
              Cmd + Shift + R
            </kbd>
            <span class="text-slate-400 text-[11px]">(macOS Safari & Chrome)</span>
          </div>
        </div>

        <!-- Step 2: Hapus Cache & Cookie Browser (Mobile & Desktop) -->
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div class="flex items-center gap-2 font-bold text-slate-900 text-xs">
            <span class="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
            <span>Hapus Cache & Cookie Browser (Google Chrome / Edge)</span>
          </div>
          <ul class="list-disc pl-11 space-y-1 text-slate-600">
            <li>Klik menu <strong>Titik Tiga (⋮)</strong> di pojok kanan atas browser.</li>
            <li>Pilih <strong>Histori / Riwayat</strong> lalu klik <strong>Hapus Data Penjelajahan</strong>.</li>
            <li>Pilih rentang waktu <strong>Semua Waktu (All Time)</strong>.</li>
            <li>Centang kotak <strong>"Gambar dan file dalam cache"</strong> serta <strong>"Cookie dan data situs"</strong>.</li>
            <li>Klik tombol <strong>Hapus Data</strong>, lalu buka kembali aplikasi Libra.</li>
          </ul>
        </div>

        <!-- Step 3: Pengguna Ponsel / PWA (Aplikasi Layar Utama) -->
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div class="flex items-center gap-2 font-bold text-slate-900 text-xs">
            <span class="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
            <span>Pengguna Aplikasi Layar Utama (PWA / Android / iOS)</span>
          </div>
          <ul class="list-disc pl-11 space-y-1 text-slate-600">
            <li>Tutup aplikasi Libra sepenuhnya dari menu aplikasi terkini (Swipe Up / Recent Apps).</li>
            <li>Di Android: Buka <strong>Pengaturan HP &gt; Aplikasi &gt; Libra &gt; Penyimpanan &gt; Hapus Cache</strong>.</li>
            <li>Di iOS (iPhone/iPad): Buka <strong>Pengaturan &gt; Safari &gt; Bersihkan Riwayat dan Data Situs Web</strong>.</li>
            <li>Buka kembali aplikasi Libra.</li>
          </ul>
        </div>

        <!-- Step 4: Mode Penyamaran (Incognito) -->
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div class="flex items-center gap-2 font-bold text-slate-900 text-xs">
            <span class="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">4</span>
            <span>Uji Coba Tab Samaran (Incognito / InPrivate)</span>
          </div>
          <p class="text-slate-600 pl-7">
            Buka tautan aplikasi di <strong>Tab Penyamaran Baru</strong>. Mode penyamaran tidak menggunakan cache lama sehingga versi terbaru dijamin langsung termuat 100%.
          </p>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 shrink-0">
        <button 
          @click="store.closeVersionUpdateModal()"
          class="w-full sm:w-auto px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-full text-xs transition cursor-pointer text-center"
        >
          Tutup Panduan
        </button>
        <button 
          @click="store.reloadApplication()"
          class="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-200 active:scale-95 text-center"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          <span>Muat Ulang Halaman Sekarang</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useLibraryStore } from '../stores/library.js';
import { HelpCircle, RefreshCw, X, Info } from 'lucide-vue-next';

const store = useLibraryStore();
</script>

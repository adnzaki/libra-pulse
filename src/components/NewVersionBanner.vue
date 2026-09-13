<template>
  <div 
    v-if="store.hasNewVersionAvailable && !store.isDismissedUpdateBanner"
    class="fixed top-2 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-70 animate-in slide-in-from-top-4 duration-300"
  >
    <div class="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-blue-400/40 backdrop-blur-md">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-amber-300 shrink-0 shadow-xs">
            <Sparkles class="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold uppercase tracking-wider text-blue-200">Pembaruan Tersedia</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold font-mono shadow-xs">
                v{{ store.appVersionConfig.version }}
              </span>
            </div>
            <h4 class="font-bold text-sm text-white mt-0.5">Versi Baru Aplikasi Terdeteksi!</h4>
            <p class="text-xs text-blue-100/90 mt-1 leading-relaxed">
              {{ store.appVersionConfig.updateMessage || 'Tersedia versi baru dengan perbaikan dan fitur mutakhir.' }}
            </p>
            <div class="text-[11px] text-blue-200/80 mt-1 flex items-center gap-1 font-mono">
              <span>Versi aktif Anda:</span>
              <span class="font-bold text-white bg-blue-900/60 px-1.5 py-0.2 rounded-md">v{{ store.currentAppVersion }}</span>
            </div>
          </div>
        </div>

        <button 
          @click="store.dismissUpdateBanner()"
          class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80 flex items-center justify-center transition shrink-0 cursor-pointer"
          title="Tutup notifikasi sementara"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Action Buttons -->
      <div class="mt-3.5 pt-3 border-t border-white/15 flex flex-wrap items-center gap-2">
        <button 
          @click="store.reloadApplication()"
          class="flex-1 min-w-[140px] px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/20 active:scale-95 cursor-pointer"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          <span>Muat Ulang Halaman</span>
        </button>

        <button 
          @click="store.openVersionUpdateModal()"
          class="px-3 py-2 bg-white/15 hover:bg-white/25 text-white font-medium rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
          title="Langkah jika setelah reload versi belum berganti"
        >
          <HelpCircle class="w-3.5 h-3.5 text-blue-200" />
          <span>Versi Belum Berubah?</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLibraryStore } from '../stores/library.js';
import { Sparkles, RefreshCw, HelpCircle, X } from 'lucide-vue-next';

const store = useLibraryStore();
</script>

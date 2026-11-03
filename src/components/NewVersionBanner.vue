<template>
  <div 
    v-if="store.hasNewVersionAvailable && !store.isDismissedUpdateBanner"
    class="fixed top-3 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-70 animate-in slide-in-from-top-4 duration-300"
  >
    <div class="relative overflow-hidden bg-slate-900/95 text-slate-100 p-4 sm:p-5 rounded-3xl shadow-2xl shadow-slate-950/40 border border-slate-700/60 backdrop-blur-xl">
      <!-- Ambient Calm Glow -->
      <div class="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
      <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
      <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>

      <div class="relative flex items-start justify-between gap-3">
        <div class="flex items-start gap-3 min-w-0">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-slate-800 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0 shadow-inner mt-0.5">
            <Sparkles class="w-5 h-5 text-blue-400" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Pembaruan Tersedia</span>
              <span class="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold tracking-wide">
                v{{ store.appVersionConfig.version }} (Build {{ store.appVersionConfig.buildNumber || '10001' }})
              </span>
            </div>

            <h4 class="font-bold text-sm text-white tracking-tight mt-1">Versi Stabil Baru Siap Digunakan</h4>
            <p class="text-xs text-slate-300/90 mt-1.5 leading-relaxed font-normal">
              {{ store.appVersionConfig.updateMessage || 'Tersedia versi baru dengan peningkatan performa, stabilitas sistem, dan fitur mutakhir.' }}
            </p>

            <div class="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5 font-mono">
              <span>Versi aktif:</span>
              <span class="font-semibold text-slate-200 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">v{{ store.currentAppVersion }}</span>
            </div>
          </div>
        </div>

        <button 
          @click="store.dismissUpdateBanner()"
          class="w-7 h-7 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
          title="Tutup notifikasi sementara"
          aria-label="Tutup"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Action Buttons -->
      <div class="relative mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
        <button 
          @click="store.reloadApplication()"
          class="flex-1 min-w-[140px] px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/25 active:scale-95 cursor-pointer"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          <span>Muat Ulang Halaman</span>
        </button>

        <button 
          @click="store.openVersionUpdateModal()"
          class="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
          title="Petunjuk jika setelah muat ulang versi belum berganti"
        >
          <HelpCircle class="w-3.5 h-3.5 text-slate-400" />
          <span>Bantuan Versi</span>
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

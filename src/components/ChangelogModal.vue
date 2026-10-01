<template>
  <div 
    v-if="store.isChangelogModalOpen" 
    class="fixed inset-0 z-80 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
    @click.self="store.markChangelogSeen()"
  >
    <div 
      class="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 max-h-[92dvh] flex flex-col"
    >
      <!-- Modal Header -->
      <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-slate-50 dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-900 shrink-0">
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div class="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-slate-900/25 shrink-0">
            <Sparkles class="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">Catatan Rilis (Changelog)</h3>
              <span class="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-mono font-bold shadow-xs">
                v{{ CURRENT_APP_VERSION }}
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Rilis resmi: {{ APP_RELEASE_DATE }} • {{ APP_RELEASE_CODENAME }}
            </p>
          </div>
        </div>
        <button 
          @click="store.markChangelogSeen()"
          class="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600/80 flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs"
          aria-label="Tutup"
        >
          <X class="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      <!-- Target Audience Filter Tabs -->
      <div class="px-4 sm:px-5 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs">
        <button 
          @click="selectedTab = 'all'"
          class="px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap cursor-pointer"
          :class="selectedTab === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'"
        >
          Semua Perubahan ({{ CHANGELOG_LIST.length }})
        </button>
        <button 
          @click="selectedTab = 'member'"
          class="px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          :class="selectedTab === 'member' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'"
        >
          <span>👨‍🎓 Khusus Siswa & Guru</span>
          <span class="text-[10px] font-bold opacity-90">({{ countByAudience('member') }})</span>
        </button>
        <button 
          @click="selectedTab = 'admin'"
          class="px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          :class="selectedTab === 'admin' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'"
        >
          <span>🛡️ Khusus Admin</span>
          <span class="text-[10px] font-bold opacity-90">({{ countByAudience('admin') }})</span>
        </button>
        <button 
          @click="selectedTab = 'common'"
          class="px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          :class="selectedTab === 'common' ? 'bg-blue-700 text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'"
        >
          <span>👥 Semua Pengguna</span>
          <span class="text-[10px] font-bold opacity-90">({{ countByAudience('all') }})</span>
        </button>
      </div>

      <!-- Changelog Items List -->
      <div class="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3.5">
        
        <div 
          v-for="item in filteredChangelog" 
          :key="item.id"
          class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/60 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition space-y-2"
        >
          <div class="flex items-start justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-2 flex-wrap">
              <!-- Target Audience Pill -->
              <span 
                class="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
                :class="getAudienceBadgeClass(item.targetAudience)"
              >
                {{ item.targetAudienceLabel }}
              </span>

              <!-- Category Badge -->
              <span class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold">
                {{ item.badge }}
              </span>
            </div>

            <!-- Icon indicator based on category -->
            <span class="text-xs text-slate-400 dark:text-slate-400">
              <span v-if="item.category === 'feature'">✨ Fitur Baru</span>
              <span v-else-if="item.category === 'security'">🔒 Keamanan</span>
              <span v-else-if="item.category === 'improvement'">⚡ Peningkatan</span>
              <span v-else>🛠️ Perbaikan</span>
            </span>
          </div>

          <h4 class="font-bold text-sm text-slate-900 dark:text-white leading-snug">
            {{ item.title }}
          </h4>

          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {{ item.description }}
          </p>
        </div>

        <!-- Information Card: Where to view changelog again -->
        <div class="p-4 rounded-2xl bg-blue-50/80 dark:bg-slate-850/90 border border-blue-200/80 dark:border-blue-900/40 text-slate-800 dark:text-slate-200 space-y-2 mt-4 shadow-2xs">
          <div class="flex items-center gap-2 font-bold text-xs text-blue-900 dark:text-blue-300">
            <Bookmark class="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span class="text-slate-900 dark:text-white font-extrabold">Dimana Anda bisa melihat Catatan Rilis ini kembali?</span>
          </div>
          <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
            Jika modal ini ditutup, Anda tetap dapat membukanya kembali kapan saja melalui beberapa akses mudah berikut:
          </p>
          <ul class="list-disc pl-10 space-y-1 text-xs text-slate-700 dark:text-slate-300">
            <li>
              <strong class="text-slate-900 dark:text-white font-bold">Menu Akun / Profil Saya</strong> &gt; pilih menu <strong class="text-blue-600 dark:text-blue-400 font-bold">Catatan Rilis (v{{ CURRENT_APP_VERSION }})</strong>.
            </li>
            <li>
              <strong class="text-slate-900 dark:text-white font-bold">Halaman Pengaturan &amp; Database</strong> (bagi Administrator) atau menu navigasi ponsel.
            </li>
          </ul>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
        <span class="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline font-mono">
          Libra v{{ CURRENT_APP_VERSION }}
        </span>
        <button 
          @click="store.markChangelogSeen()"
          class="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-slate-900/25 active:scale-95 text-center"
        >
          <Check class="w-4 h-4" />
          <span>Mengerti &amp; Tutup Catatan Rilis</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import { CURRENT_APP_VERSION, APP_RELEASE_DATE, APP_RELEASE_CODENAME, CHANGELOG_LIST } from '../config/version.js';
import { Sparkles, X, Check, Bookmark } from 'lucide-vue-next';

const store = useLibraryStore();
const selectedTab = ref<'all' | 'member' | 'admin' | 'common'>('all');

const countByAudience = (audience: 'member' | 'admin' | 'all') => {
  return CHANGELOG_LIST.filter(item => item.targetAudience === audience).length;
};

const filteredChangelog = computed(() => {
  if (selectedTab.value === 'all') return CHANGELOG_LIST;
  if (selectedTab.value === 'common') return CHANGELOG_LIST.filter(item => item.targetAudience === 'all');
  return CHANGELOG_LIST.filter(item => item.targetAudience === selectedTab.value);
});

const getAudienceBadgeClass = (target: 'all' | 'member' | 'admin') => {
  switch (target) {
    case 'member':
      return 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60 font-bold';
    case 'admin':
      return 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/60 font-bold';
    default:
      return 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700/60 font-bold';
  }
};
</script>

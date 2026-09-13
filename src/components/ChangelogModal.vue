<template>
  <div 
    v-if="store.isChangelogModalOpen" 
    class="fixed inset-0 z-80 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
    @click.self="store.markChangelogSeen()"
  >
    <div 
      class="bg-white text-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[92dvh] flex flex-col"
    >
      <!-- Modal Header -->
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-slate-50 shrink-0">
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div class="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-200 shrink-0">
            <Sparkles class="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">Catatan Rilis (Changelog)</h3>
              <span class="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-mono font-bold shadow-xs">
                v{{ CURRENT_APP_VERSION }}
              </span>
            </div>
            <p class="text-xs text-slate-500 truncate mt-0.5">
              Rilis resmi: {{ APP_RELEASE_DATE }} • {{ APP_RELEASE_CODENAME }}
            </p>
          </div>
        </div>
        <button 
          @click="store.markChangelogSeen()"
          class="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer shrink-0"
          aria-label="Tutup"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Target Audience Filter Tabs -->
      <div class="px-4 sm:px-5 py-2.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs">
        <button 
          @click="selectedTab = 'all'"
          class="px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap cursor-pointer"
          :class="selectedTab === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
        >
          Semua Perubahan ({{ CHANGELOG_LIST.length }})
        </button>
        <button 
          @click="selectedTab = 'member'"
          class="px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          :class="selectedTab === 'member' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
        >
          <span>👨‍🎓 Khusus Siswa & Guru</span>
          <span class="text-[10px] opacity-80">({{ countByAudience('member') }})</span>
        </button>
        <button 
          @click="selectedTab = 'admin'"
          class="px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          :class="selectedTab === 'admin' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
        >
          <span>🛡️ Khusus Admin</span>
          <span class="text-[10px] opacity-80">({{ countByAudience('admin') }})</span>
        </button>
        <button 
          @click="selectedTab = 'common'"
          class="px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          :class="selectedTab === 'common' ? 'bg-blue-700 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
        >
          <span>👥 Semua Pengguna</span>
          <span class="text-[10px] opacity-80">({{ countByAudience('all') }})</span>
        </button>
      </div>

      <!-- Changelog Items List -->
      <div class="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3.5">
        
        <div 
          v-for="item in filteredChangelog" 
          :key="item.id"
          class="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-2"
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
              <span class="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-semibold">
                {{ item.badge }}
              </span>
            </div>

            <!-- Icon indicator based on category -->
            <span class="text-xs text-slate-400">
              <span v-if="item.category === 'feature'">✨ Fitur Baru</span>
              <span v-else-if="item.category === 'security'">🔒 Keamanan</span>
              <span v-else-if="item.category === 'improvement'">⚡ Peningkatan</span>
              <span v-else>🛠️ Perbaikan</span>
            </span>
          </div>

          <h4 class="font-bold text-sm text-slate-900 leading-snug">
            {{ item.title }}
          </h4>

          <p class="text-xs text-slate-600 leading-relaxed">
            {{ item.description }}
          </p>
        </div>

        <!-- Information Card: Where to view changelog again -->
        <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2 mt-4">
          <div class="flex items-center gap-2 font-bold text-xs text-amber-900">
            <Bookmark class="w-4 h-4 text-amber-600 shrink-0" />
            <span>Dimana Anda bisa melihat Catatan Rilis ini kembali?</span>
          </div>
          <p class="text-xs text-amber-900/90 leading-relaxed pl-6">
            Jika modal ini ditutup, Anda tetap dapat membukanya kembali kapan saja melalui beberapa akses mudah berikut:
          </p>
          <ul class="list-disc pl-10 space-y-1 text-xs text-amber-900/90">
            <li>
              <strong>Klik Label Versi (v{{ CURRENT_APP_VERSION }})</strong> yang ada pada bilah navigasi atas (Navbar) tepat di sebelah logo Libra.
            </li>
            <li>
              <strong>Menu Akun / Profil Saya</strong> &gt; pilih menu <strong>Catatan Rilis (v{{ CURRENT_APP_VERSION }})</strong>.
            </li>
            <li>
              <strong>Halaman Pengaturan &amp; Database</strong> (bagi Administrator) atau menu navigasi ponsel.
            </li>
          </ul>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
        <span class="text-[11px] text-slate-500 hidden sm:inline font-mono">
          Libra v{{ CURRENT_APP_VERSION }}
        </span>
        <button 
          @click="store.markChangelogSeen()"
          class="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-200 active:scale-95 text-center"
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
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    case 'admin':
      return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
    default:
      return 'bg-blue-100 text-blue-800 border border-blue-200';
  }
};
</script>

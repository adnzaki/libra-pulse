<template>
  <div class="space-y-4 sm:space-y-6">
    
    <!-- Top Header Bento Card -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div>
        <div class="flex items-center gap-1.5 text-blue-600 text-[10px] font-bold uppercase tracking-widest">
          <Layers class="w-3.5 h-3.5" />
          Tata Letak & Sirkulasi Koleksi
        </div>
        <h1 class="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Manajemen Rak Perpustakaan
        </h1>
        <p class="text-xs text-slate-500 mt-0.5">
          Pemetaan rak 3 lantai, monitoring kapasitas fisik real-time, dan direktori letak buku presisi.
        </p>
      </div>

      <!-- Add Shelf Button (Admin Only) -->
      <button 
        v-if="store.isAdmin"
        @click="openAddShelfModal"
        class="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-200 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
      >
        <Plus class="w-4 h-4" />
        Tambah Rak Baru
      </button>
      <div v-else class="text-right">
        <span class="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
          <Layers class="w-3 h-3 text-slate-400" />
          Mode Katalog Publik
        </span>
      </div>
    </div>

    <!-- Floor Selector Tabs (Flex-wrap, responsive layout) -->
    <div class="flex flex-wrap items-center gap-2 py-1">
      <button 
        v-for="floor in [0, 1, 2, 3]" 
        :key="floor"
        @click="selectedFloor = floor"
        class="px-3.5 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap active:scale-95"
        :class="selectedFloor === floor 
          ? 'bg-slate-900 text-white shadow-sm' 
          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
      >
        <Building2 class="w-3.5 h-3.5" />
        <span>{{ floor === 0 ? 'Semua Lantai' : `Lantai ${floor}` }}</span>
        <span 
          class="px-2 py-0.5 rounded-full text-[10px] font-bold"
          :class="selectedFloor === floor ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700'"
        >
          {{ floor === 0 ? store.shelves.length : store.shelves.filter(s => s.floor === floor).length }}
        </span>
      </button>
    </div>

    <!-- Shelves Bento Grid Map -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      <div 
        v-for="shelf in displayedShelves" 
        :key="shelf.id"
        class="bg-white border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
        :class="activeShelfId === shelf.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-100'"
      >
        <div>
          <!-- Header of Shelf Card -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-3">
              <div 
                class="w-11 h-11 rounded-2xl flex items-center justify-center font-mono font-extrabold text-sm shadow-xs shrink-0 border select-none transition-transform hover:scale-105"
                :style="{ backgroundColor: `${shelf.color}15`, color: shelf.color, borderColor: `${shelf.color}30` }"
                :title="`Kode Lengkap Rak: ${shelf.code}`"
              >
                {{ getShortShelfCode(shelf.code) }}
              </div>
              <div>
                <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Lantai {{ shelf.floor }} • {{ shelf.zone }}
                </span>
                <h3 class="font-bold text-slate-900 text-sm mt-1 line-clamp-1">{{ shelf.name }}</h3>
              </div>
            </div>

            <!-- Shelf Row badge -->
            <span class="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 font-bold border border-slate-200">
              {{ shelf.shelfRow || 'Baris A1' }}
            </span>
          </div>

          <p class="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
            {{ shelf.description || `Koleksi kategori ${shelf.category}.` }}
          </p>

          <!-- Capacity Gauge Bento Widget -->
          <div class="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div class="flex justify-between text-xs">
              <span class="text-slate-500 font-medium">Kapasitas Rak</span>
              <span class="font-bold text-slate-800">
                {{ getBooksCountOnShelf(shelf.id) }} / {{ shelf.capacity }} Buku
                <span class="text-slate-400 font-normal">({{ Math.round((getBooksCountOnShelf(shelf.id) / shelf.capacity) * 100) }}%)</span>
              </span>
            </div>
            
            <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-500"
                :style="{ 
                  width: `${Math.min(100, (getBooksCountOnShelf(shelf.id) / shelf.capacity) * 100)}%`,
                  backgroundColor: shelf.color || '#2563eb'
                }"
              ></div>
            </div>

            <div class="flex justify-between text-[10px] text-slate-400 pt-0.5 font-medium">
              <span>Dominan: {{ shelf.category }}</span>
              <span>Sisa Slot: {{ Math.max(0, shelf.capacity - getBooksCountOnShelf(shelf.id)) }}</span>
            </div>
          </div>
        </div>

        <!-- Shelf Actions & Books Expand -->
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button 
            @click="toggleShelfDetails(shelf.id)"
            class="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>{{ activeShelfId === shelf.id ? 'Tutup Koleksi' : 'Lihat Isi Buku (' + getBooksOnShelf(shelf.id).length + ')' }}</span>
            <ChevronDown class="w-3.5 h-3.5 transition-transform" :class="activeShelfId === shelf.id ? 'rotate-180' : ''" />
          </button>

          <div v-if="store.isAdmin" class="flex items-center gap-1">
            <button 
              @click="openEditShelfModal(shelf)"
              class="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition cursor-pointer"
              title="Edit Rak"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>
            <button 
              @click="handleDeleteShelf(shelf.id)"
              class="p-2 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 text-xs transition cursor-pointer"
              title="Hapus Rak"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Expanded Books List Drawer on Card -->
        <div v-if="activeShelfId === shelf.id" class="mt-3 pt-3 border-t border-slate-100 space-y-2 animate-in fade-in duration-200">
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Koleksi di Rak {{ shelf.code }}:</div>
          <div v-if="getBooksOnShelf(shelf.id).length > 0" class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            <div 
              v-for="b in getBooksOnShelf(shelf.id)" 
              :key="b.id"
              class="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-xs border border-slate-100"
            >
              <div class="min-w-0 pr-2">
                <div class="font-bold text-slate-800 truncate">{{ b.title }}</div>
                <div class="text-[10px] text-slate-400">{{ b.author }} • {{ b.availableCopies }} tersedia</div>
              </div>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-blue-600 font-bold border border-slate-200 shrink-0">
                {{ b.id }}
              </span>
            </div>
          </div>
          <div v-else class="text-xs text-slate-400 italic py-2 text-center">
            Belum ada buku yang ditempatkan di rak ini.
          </div>
        </div>

      </div>
    </div>

    <!-- Shelf Modal -->
    <ShelfModal 
      :is-open="isShelfModalOpen"
      :shelf="selectedShelfForEdit"
      @close="isShelfModalOpen = false"
      @saved="handleShelfSaved"
    />

    <!-- Delete Shelf Confirm Modal -->
    <div v-if="shelfToDelete" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div class="bg-white w-full max-w-sm rounded-3xl border border-slate-200 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
        <div class="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <Trash2 class="w-7 h-7" />
        </div>
        <div class="space-y-1.5">
          <h3 class="text-base font-bold text-slate-900">Hapus Lokasi Rak</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin menghapus rak <strong class="text-slate-900 font-mono">{{ shelfToDelete }}</strong>?
          </p>
          <p class="text-[11px] text-slate-400">
            Buku yang tersimpan di rak ini akan dialihkan ke lokasi default.
          </p>
        </div>
        <div class="pt-2 flex items-center gap-3">
          <button 
            type="button" 
            @click="shelfToDelete = null"
            class="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer text-xs"
          >
            Batal
          </button>
          <button 
            type="button" 
            @click="confirmDeleteShelf"
            :disabled="isDeletingShelf"
            class="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-md shadow-rose-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <span>{{ isDeletingShelf ? 'Menghapus...' : 'Hapus Rak' }}</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import type { Shelf } from '../types.js';
import ShelfModal from '../components/ShelfModal.vue';
import { useModalBack } from '../composables/useModalBack.js';
import { Layers, Plus, Building2, ChevronDown, Pencil, Trash2 } from 'lucide-vue-next';

const store = useLibraryStore();
const selectedFloor = ref(0);
const activeShelfId = ref<string | null>(null);

const isShelfModalOpen = ref(false);
const selectedShelfForEdit = ref<Shelf | null>(null);

const displayedShelves = computed(() => {
  if (selectedFloor.value === 0) return store.shelves;
  return store.shelves.filter(s => s.floor === selectedFloor.value);
});

const getShortShelfCode = (code?: string) => {
  if (!code) return '';
  const trimmed = code.trim();
  // Extract trailing code segment (e.g. 'RAK-A1' -> 'A1', 'RAK-B2' -> 'B2')
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    return parts[parts.length - 1].trim();
  }
  if (trimmed.includes('_')) {
    const parts = trimmed.split('_');
    return parts[parts.length - 1].trim();
  }
  return trimmed.replace(/^RAK\s*/i, '').trim() || trimmed;
};

const getBooksOnShelf = (shelfId: string) => {
  return store.books.filter(b => b.shelfId === shelfId);
};

const getBooksCountOnShelf = (shelfId: string) => {
  const books = getBooksOnShelf(shelfId);
  return books.reduce((acc, b) => acc + b.totalCopies, 0);
};

const toggleShelfDetails = (shelfId: string) => {
  activeShelfId.value = activeShelfId.value === shelfId ? null : shelfId;
};

const openAddShelfModal = () => {
  if (!store.isAdmin) {
    store.setError('Akses ditolak. Anda harus masuk sebagai Administrator untuk menambah atau mengelola rak.');
    return;
  }
  selectedShelfForEdit.value = null;
  isShelfModalOpen.value = true;
};

const openEditShelfModal = (shelf: Shelf) => {
  if (!store.isAdmin) {
    store.setError('Akses ditolak. Anda harus masuk sebagai Administrator untuk mengedit rak.');
    return;
  }
  selectedShelfForEdit.value = shelf;
  isShelfModalOpen.value = true;
};

const shelfToDelete = ref<string | null>(null);
const isDeletingShelf = ref(false);

useModalBack(computed(() => !!shelfToDelete.value), () => { shelfToDelete.value = null; }, 'shelf_delete_confirm');

const handleDeleteShelf = (shelfId: string) => {
  if (!store.isAdmin) {
    store.setError('Akses ditolak. Anda harus masuk sebagai Administrator untuk menghapus rak.');
    return;
  }
  shelfToDelete.value = shelfId;
};

const confirmDeleteShelf = async () => {
  if (!shelfToDelete.value) return;
  isDeletingShelf.value = true;
  try {
    await store.deleteShelf(shelfToDelete.value);
    shelfToDelete.value = null;
  } finally {
    isDeletingShelf.value = false;
  }
};

const handleShelfSaved = () => {
  // auto refreshed by store
};
</script>


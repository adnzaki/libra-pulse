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

      <!-- Header Actions (Admin Only vs Public) -->
      <div v-if="store.isAdmin" class="flex flex-wrap items-center gap-2">
        <button 
          v-if="hasCustomOrder"
          @click="handleResetOrder"
          :disabled="isReordering"
          class="px-3.5 sm:px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 border border-slate-200 dark:border-slate-700"
          title="Kembalikan urutan rak ke urutan standar (kode/tanggal)"
        >
          <RotateCcw class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Reset Urutan</span>
        </button>

        <button 
          @click="openAddShelfModal"
          class="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-slate-900/25 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
        >
          <Plus class="w-4 h-4" />
          Tambah Rak Baru
        </button>
      </div>

      <div v-else class="text-right">
        <span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700">
          <Eye class="w-3.5 h-3.5 text-slate-400" />
          Mode Katalog Publik (Hanya Lihat)
        </span>
      </div>
    </div>

    <!-- Drag & Drop Sorting Info Banner (Admin vs Member) -->
    <div 
      v-if="store.isAdmin" 
      class="p-4 rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-white dark:from-slate-900/90 dark:via-blue-950/40 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
    >
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-slate-900/25">
          <GripVertical class="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <div class="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
            <span>Fitur Sorting Posisi Rak Aktif</span>
            <span class="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">Khusus Admin</span>
            <span v-if="hasCustomOrder" class="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[10px] font-bold">
              Urutan Kustom Tersimpan
            </span>
          </div>
          <p class="text-[11px] text-slate-600 mt-0.5">
            <strong>Tarik (drag)</strong> kartu rak untuk mengatur posisinya sesuai alur perpustakaan, atau klik tombol <strong>◀ / ▶</strong> pada kartu. Urutan baru otomatis tersimpan ke sistem.
          </p>
        </div>
      </div>

      <div class="text-[11px] text-slate-500 flex items-center gap-1.5 self-end sm:self-center shrink-0">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        <span class="font-medium">User biasa hanya dapat melihat urutan ini</span>
      </div>
    </div>

    <!-- Floor Selector Tabs (Flex-wrap, responsive layout) -->
    <div class="flex flex-wrap items-center justify-between gap-2 py-1">
      <div class="flex flex-wrap items-center gap-2">
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

      <span v-if="store.isAdmin && displayedShelves.length > 1" class="text-[11px] text-slate-400 font-medium">
        Tersedia {{ displayedShelves.length }} rak (dapat di-drag)
      </span>
    </div>

    <!-- Shelves Bento Grid Map with Drag & Drop Sorting -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      <div 
        v-for="(shelf, index) in displayedShelves" 
        :key="shelf.id"
        :draggable="store.isAdmin"
        @dragstart="handleDragStart(shelf, $event)"
        @dragover.prevent="handleDragOver(shelf, $event)"
        @dragenter.prevent="handleDragEnter(shelf)"
        @dragleave="handleDragLeave(shelf)"
        @drop.prevent="handleDrop(shelf)"
        @dragend="handleDragEnd"
        class="bg-white border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between relative group"
        :class="[
          activeShelfId === shelf.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-100',
          draggedShelfId === shelf.id ? 'opacity-40 scale-95 border-dashed border-blue-400 bg-blue-50/30' : '',
          dragOverShelfId === shelf.id && draggedShelfId !== shelf.id ? 'ring-2 ring-blue-500 scale-[1.02] shadow-lg border-blue-500 bg-blue-50/20' : '',
          store.isAdmin ? 'cursor-grab active:cursor-grabbing' : ''
        ]"
      >
        <div>
          <!-- Admin-Only Drag Handle & Position Toolbar -->
          <div 
            v-if="store.isAdmin" 
            class="mb-3.5 pb-2.5 border-b border-slate-100 flex items-center justify-between text-xs select-none"
          >
            <div 
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 font-mono text-[11px] font-bold border border-slate-200/80 transition"
              title="Tarik (drag) untuk memindahkan posisi rak"
            >
              <GripVertical class="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              <span>Urutan #{{ index + 1 }}</span>
            </div>

            <!-- Quick Step Shift Buttons (Arrow buttons for touch or precise reorder) -->
            <div class="flex items-center gap-1" @click.stop>
              <button 
                type="button"
                @click="moveShelfStep(shelf.id, 'prev')"
                :disabled="index === 0 || isReordering"
                class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                title="Geser rak ke posisi sebelumnya (Kiri/Atas)"
              >
                <ArrowLeft class="w-3.5 h-3.5" />
              </button>
              <button 
                type="button"
                @click="moveShelfStep(shelf.id, 'next')"
                :disabled="index === displayedShelves.length - 1 || isReordering"
                class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                title="Geser rak ke posisi berikutnya (Kanan/Bawah)"
              >
                <ArrowRight class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

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
            <span class="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 font-bold border border-slate-200 shrink-0">
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
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2" @click.stop>
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

    <!-- Empty State if no shelves match filter -->
    <div v-if="displayedShelves.length === 0" class="p-12 text-center bg-white rounded-3xl border border-slate-100 text-slate-400 text-xs space-y-2">
      <Layers class="w-8 h-8 text-slate-300 mx-auto" />
      <p class="font-bold text-slate-700">Tidak ada rak pada lantai ini.</p>
      <button 
        v-if="store.isAdmin"
        @click="openAddShelfModal"
        class="text-blue-600 font-bold hover:underline"
      >
        + Tambah Rak Baru Sekarang
      </button>
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
      <div class="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
        <div class="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center mx-auto shadow-xs">
          <Trash2 class="w-7 h-7" />
        </div>
        <div class="space-y-1.5">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Hapus Lokasi Rak</h3>
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Apakah Anda yakin ingin menghapus rak <strong class="text-slate-900 dark:text-white font-mono">{{ shelfToDelete }}</strong>?
          </p>
          <p class="text-[11px] text-slate-400 dark:text-slate-500">
            Buku yang tersimpan di rak ini akan dialihkan ke lokasi default.
          </p>
        </div>
        <div class="pt-2 flex items-center justify-center gap-3">
          <button 
            type="button" 
            @click="shelfToDelete = null"
            class="flex-1 sm:flex-initial px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-xs"
          >
            Batal
          </button>
          <button 
            type="button" 
            @click="confirmDeleteShelf"
            :disabled="isDeletingShelf"
            class="flex-1 sm:flex-initial px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-md shadow-slate-900/25 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
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
import { 
  Layers, Plus, Building2, ChevronDown, Pencil, Trash2,
  GripVertical, ArrowLeft, ArrowRight, RotateCcw, Eye
} from 'lucide-vue-next';

const store = useLibraryStore();
const selectedFloor = ref(0);
const activeShelfId = ref<string | null>(null);

const isShelfModalOpen = ref(false);
const selectedShelfForEdit = ref<Shelf | null>(null);

const displayedShelves = computed(() => {
  const list = store.sortedShelves || store.shelves;
  if (selectedFloor.value === 0) return list;
  return list.filter(s => s.floor === selectedFloor.value);
});

const hasCustomOrder = computed(() => {
  return store.shelves.some(s => typeof s.order === 'number');
});

// Drag & Drop State
const draggedShelfId = ref<string | null>(null);
const dragOverShelfId = ref<string | null>(null);
const isReordering = ref(false);

const handleDragStart = (shelf: Shelf, event: DragEvent) => {
  if (!store.isAdmin) return;
  draggedShelfId.value = shelf.id;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', shelf.id);
  }
};

const handleDragOver = (shelf: Shelf, event: DragEvent) => {
  if (!store.isAdmin) return;
  if (draggedShelfId.value === shelf.id) return;
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
};

const handleDragEnter = (shelf: Shelf) => {
  if (!store.isAdmin) return;
  if (draggedShelfId.value !== shelf.id) {
    dragOverShelfId.value = shelf.id;
  }
};

const handleDragLeave = (shelf: Shelf) => {
  if (dragOverShelfId.value === shelf.id) {
    dragOverShelfId.value = null;
  }
};

const handleDrop = async (targetShelf: Shelf) => {
  if (!store.isAdmin) return;
  const sourceId = draggedShelfId.value;
  const targetId = targetShelf.id;

  draggedShelfId.value = null;
  dragOverShelfId.value = null;

  if (!sourceId || sourceId === targetId) return;

  const currentList = [...displayedShelves.value];
  const sourceIndex = currentList.findIndex(s => s.id === sourceId);
  const targetIndex = currentList.findIndex(s => s.id === targetId);

  if (sourceIndex === -1 || targetIndex === -1) return;

  // Move element
  const [moved] = currentList.splice(sourceIndex, 1);
  currentList.splice(targetIndex, 0, moved);

  let finalOrderedList: Shelf[];
  if (selectedFloor.value === 0) {
    finalOrderedList = currentList;
  } else {
    // Preserve other floors and update current floor order
    const otherShelves = store.shelves.filter(s => s.floor !== selectedFloor.value);
    finalOrderedList = [...currentList, ...otherShelves];
  }

  isReordering.value = true;
  try {
    await store.reorderShelves(finalOrderedList);
  } finally {
    isReordering.value = false;
  }
};

const handleDragEnd = () => {
  draggedShelfId.value = null;
  dragOverShelfId.value = null;
};

// Alternative button step shift for mobile/touch
const moveShelfStep = async (shelfId: string, direction: 'prev' | 'next') => {
  if (!store.isAdmin) return;
  const currentList = [...displayedShelves.value];
  const index = currentList.findIndex(s => s.id === shelfId);
  if (index === -1) return;

  const targetIndex = direction === 'prev' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= currentList.length) return;

  const [moved] = currentList.splice(index, 1);
  currentList.splice(targetIndex, 0, moved);

  let finalOrderedList: Shelf[];
  if (selectedFloor.value === 0) {
    finalOrderedList = currentList;
  } else {
    const otherShelves = store.shelves.filter(s => s.floor !== selectedFloor.value);
    finalOrderedList = [...currentList, ...otherShelves];
  }

  isReordering.value = true;
  try {
    await store.reorderShelves(finalOrderedList);
  } finally {
    isReordering.value = false;
  }
};

const handleResetOrder = async () => {
  if (!store.isAdmin) return;
  isReordering.value = true;
  try {
    await store.resetShelvesOrder();
  } finally {
    isReordering.value = false;
  }
};

const getShortShelfCode = (code?: string) => {
  if (!code) return '';
  const trimmed = code.trim();
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

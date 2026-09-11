<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden sm:overflow-y-auto">
    <div class="bg-white border-0 sm:border sm:border-slate-100 w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-lg sm:rounded-3xl rounded-none shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
      
      <!-- Sticky Header -->
      <div class="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div class="flex items-center gap-3">
          <div class="w-9 sm:w-10 h-9 sm:h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-sm sm:text-base text-slate-900">{{ shelf ? 'Edit Data Rak' : 'Tambah Rak Baru' }}</h3>
            <p class="text-[11px] sm:text-xs text-slate-500">Manajemen Lokasi & Kapasitas Fisik Rak</p>
          </div>
        </div>
        <button 
          @click="$emit('close')" 
          type="button"
          aria-label="Tutup modal rak"
          class="p-2 sm:p-2.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 active:scale-95 transition cursor-pointer flex items-center justify-center shrink-0"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Scrollable Form Body -->
      <div class="p-4 sm:p-6 space-y-4 text-xs flex-1 overflow-y-auto">
        
        <!-- Kode Rak & Lantai (100% on mobile, 2 cols on sm+) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Kode Rak (Unik)</label>
            <input 
              v-model="form.code" 
              type="text" 
              placeholder="Misal: RAK-D1" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono uppercase focus:outline-none focus:border-blue-500 font-bold"
            />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Lantai Gedung</label>
            <select 
              v-model.number="form.floor" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option :value="1">Lantai 1</option>
              <option :value="2">Lantai 2</option>
              <option :value="3">Lantai 3</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Nama / Label Rak</label>
          <input 
            v-model="form.name" 
            type="text" 
            placeholder="Contoh: Rak A-01: Koleksi Komputer & Sains Terapan" 
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>

        <!-- Zona Perpustakaan & Kategori Buku Dominan (100% on mobile, 2 cols on sm+) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Zona Perpustakaan</label>
            <input 
              v-model="form.zone" 
              type="text" 
              placeholder="Zona Utara" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Kategori Buku Dominan</label>
            <select 
              v-model="form.category" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium truncate"
            >
              <option v-for="c in store.categories" :key="c.id" :value="c.name">
                {{ c.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Kapasitas, Posisi Baris, dan Warna Indikator (100% on mobile, 3 cols on sm+) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Kapasitas (Buku)</label>
            <input 
              v-model.number="form.capacity" 
              type="number" 
              min="10" 
              max="200" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Posisi Baris</label>
            <input 
              v-model="form.shelfRow" 
              type="text" 
              placeholder="Baris A, Kolom 1" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Warna Indikator</label>
            <div class="flex items-center gap-2">
              <input 
                v-model="form.color" 
                type="color" 
                class="w-12 h-10 p-1 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer shrink-0"
              />
              <span class="text-xs font-mono font-bold text-slate-600 uppercase">{{ form.color }}</span>
            </div>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Deskripsi Rak</label>
          <textarea 
            v-model="form.description" 
            rows="3" 
            placeholder="Informasi koleksi atau petunjuk pencarian di rak ini..." 
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
          ></textarea>
        </div>

      </div>

      <!-- Sticky Footer -->
      <div class="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-end gap-3 shrink-0 sticky bottom-0 z-20">
        <button 
          type="button" 
          @click="$emit('close')"
          class="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
        >
          Batal
        </button>
        <button 
          type="button"
          @click="handleSaveShelf"
          :disabled="!form.code || !form.name || isSubmitting"
          class="flex-1 sm:flex-initial px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save class="w-4 h-4" />
          {{ isSubmitting ? 'Menyimpan...' : 'Simpan Rak' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRef } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import type { Shelf } from '../types.js';
import { Layers, X, Save } from 'lucide-vue-next';
import { useModalBack } from '../composables/useModalBack.js';

const props = defineProps<{
  isOpen: boolean;
  shelf?: Shelf | null;
}>();

const emit = defineEmits(['close', 'saved']);

const store = useLibraryStore();
const isSubmitting = ref(false);

useModalBack(toRef(props, 'isOpen'), () => emit('close'), 'shelf_modal');

const form = ref<Partial<Shelf>>({
  code: '',
  name: '',
  floor: 1,
  zone: 'Zona Utara - Teknologi',
  category: 'Teknologi & Komputer',
  capacity: 50,
  color: '#3b82f6',
  description: '',
  shelfRow: 'Baris A, Kolom 1'
});

watch(() => props.shelf, (val) => {
  if (val) {
    form.value = { ...val };
  } else {
    form.value = {
      code: `RAK-${String.fromCharCode(65 + Math.floor(Math.random() * 4))}${Math.floor(1 + Math.random() * 4)}`,
      name: '',
      floor: 1,
      zone: 'Zona Utara',
      category: 'Umum',
      capacity: 50,
      color: '#3b82f6',
      description: '',
      shelfRow: 'Baris 1'
    };
  }
}, { immediate: true });

const handleSaveShelf = async () => {
  if (!form.value.code || !form.value.name) return;

  isSubmitting.value = true;
  try {
    const res = await store.saveShelf(form.value);
    if (res.success) {
      emit('saved');
      emit('close');
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>


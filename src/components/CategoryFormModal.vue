<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
    <div class="bg-white border border-slate-100 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
      
      <!-- Header -->
      <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div 
            class="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
            :style="{ backgroundColor: form.color || '#3b82f6' }"
          >
            <Tag class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-base text-slate-900">
              {{ category ? 'Edit Kategori Buku' : 'Tambah Kategori Baru' }}
            </h3>
            <p class="text-xs text-slate-500">Klasifikasi & Taksonomi Koleksi Pustaka</p>
          </div>
        </div>
        <button 
          @click="$emit('close')" 
          class="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form -->
      <div class="p-6 space-y-4 text-xs">
        
        <div>
          <label class="block font-bold text-slate-700 mb-1">Nama Kategori *</label>
          <input 
            v-model="form.name" 
            type="text" 
            placeholder="Contoh: Teknologi & Komputer, Filsafat & Agama" 
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-semibold"
          />
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
          <textarea 
            v-model="form.description" 
            rows="2" 
            placeholder="Cakupan topik atau sub-bidang keilmuan kategori ini..." 
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
          ></textarea>
        </div>

        <!-- Color Accent Selector -->
        <div>
          <label class="block font-bold text-slate-700 mb-2">Warna Identitas Kategori</label>
          <div class="flex items-center gap-3">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="colorOption in colorPalette"
                :key="colorOption"
                type="button"
                @click="form.color = colorOption"
                class="w-7 h-7 rounded-xl border-2 transition-transform cursor-pointer"
                :class="form.color === colorOption ? 'scale-110 border-slate-900 shadow-md ring-2 ring-blue-100' : 'border-transparent hover:scale-105'"
                :style="{ backgroundColor: colorOption }"
              ></button>
            </div>
            <input 
              v-model="form.color" 
              type="color" 
              class="w-8 h-8 rounded-xl border border-slate-200 bg-slate-50 p-0.5 cursor-pointer shrink-0"
              title="Pilih warna khusus"
            />
          </div>
        </div>

        <!-- Live Preview Bento Card -->
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pratinjau Badge Kategori:</span>
          <div class="flex items-center gap-2">
            <span 
              class="px-3 py-1 rounded-full text-xs font-bold shadow-sm"
              :style="{ backgroundColor: `${form.color || '#3b82f6'}18`, color: form.color || '#3b82f6', border: `1px solid ${form.color || '#3b82f6'}40` }"
            >
              {{ form.name || 'Nama Kategori' }}
            </span>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
        <button 
          type="button"
          @click="$emit('close')" 
          class="px-4 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
        >
          Batal
        </button>
        <button 
          type="button"
          @click="handleSave"
          :disabled="!form.name || isSubmitting"
          class="px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          <Save class="w-4 h-4" />
          {{ isSubmitting ? 'Menyimpan...' : 'Simpan Kategori' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import type { BookCategory } from '../types.js';
import { Tag, X, Save } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  category?: BookCategory | null;
}>();

const emit = defineEmits(['close', 'saved']);

const store = useLibraryStore();
const isSubmitting = ref(false);

const colorPalette = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#ef4444', // red
  '#64748b'  // slate
];

const form = ref<Partial<BookCategory>>({
  name: '',
  description: '',
  color: '#3b82f6'
});

watch(() => props.category, (val) => {
  if (val) {
    form.value = { ...val };
  } else {
    form.value = {
      name: '',
      description: '',
      color: colorPalette[Math.floor(Math.random() * colorPalette.length)]
    };
  }
}, { immediate: true });

const handleSave = async () => {
  if (!form.value.name?.trim()) return;

  isSubmitting.value = true;
  try {
    let res;
    if (props.category?.id) {
      res = await store.updateCategory(props.category.id, form.value);
    } else {
      res = await store.createCategory(form.value);
    }

    if (res?.success) {
      emit('saved');
      emit('close');
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

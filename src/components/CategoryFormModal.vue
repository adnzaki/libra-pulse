<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden sm:overflow-y-auto">
    <div class="bg-white border-0 sm:border sm:border-slate-100 w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-lg sm:rounded-3xl rounded-none shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
      
      <!-- Sticky Header -->
      <div class="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div class="flex items-center gap-3">
          <div 
            class="w-9 sm:w-10 h-9 sm:h-10 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
            :style="{ backgroundColor: form.color || '#3b82f6' }"
          >
            <Tag class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-sm sm:text-base text-slate-900">
              {{ category ? 'Edit Kategori Buku' : 'Tambah Kategori Baru' }}
            </h3>
            <p class="text-[11px] sm:text-xs text-slate-500">Klasifikasi & Taksonomi Koleksi Pustaka</p>
          </div>
        </div>
        <button 
          @click="$emit('close')" 
          type="button"
          aria-label="Tutup modal kategori"
          class="p-2 sm:p-2.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 active:scale-95 transition cursor-pointer flex items-center justify-center shrink-0"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form (Scrollable) -->
      <div class="p-4 sm:p-6 space-y-4 text-xs flex-1 overflow-y-auto">
        
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

      <!-- Sticky Footer -->
      <div class="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-end gap-3 shrink-0 sticky bottom-0 z-20">
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
          class="flex-1 sm:flex-initial px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save class="w-4 h-4" />
          {{ isSubmitting ? 'Menyimpan...' : 'Simpan Kategori' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRef } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import type { BookCategory } from '../types.js';
import { Tag, X, Save } from 'lucide-vue-next';
import { useModalBack } from '../composables/useModalBack.js';

const props = defineProps<{
  isOpen: boolean;
  category?: BookCategory | null;
}>();

const emit = defineEmits(['close', 'saved']);

useModalBack(toRef(props, 'isOpen'), () => emit('close'), 'category_form_modal');

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

const resetForm = () => {
  if (props.category) {
    form.value = { ...props.category };
  } else {
    form.value = {
      name: '',
      description: '',
      color: colorPalette[Math.floor(Math.random() * colorPalette.length)]
    };
  }
};

watch([() => props.isOpen, () => props.category], ([isOpen]) => {
  if (isOpen) {
    resetForm();
  }
}, { immediate: true });

const handleSave = async () => {
  if (!form.value.name?.trim()) return;

  isSubmitting.value = true;
  try {
    let res;
    if (props.category?.id) {
      res = await store.updateCategory(props.category.id, {
        ...form.value,
        id: props.category.id
      });
    } else {
      res = await store.createCategory(form.value);
    }

    if (res?.success) {
      resetForm();
      emit('saved');
      emit('close');
    }
  } catch (err: any) {
    store.setError(err?.message || 'Gagal menyimpan data kategori');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

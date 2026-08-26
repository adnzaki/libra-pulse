<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
    <div class="bg-white border border-slate-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
      
      <!-- Header -->
      <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookMarked class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-base text-slate-900">{{ book ? 'Edit Data Buku' : 'Tambah Buku Baru' }}</h3>
            <p class="text-xs text-slate-500">Katalogisasi, Penempatan Rak & Manajemen Stok</p>
          </div>
        </div>
        <button @click="$emit('close')" class="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form -->
      <div class="p-6 space-y-4 text-xs">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Judul Buku *</label>
            <input 
              v-model="form.title" 
              type="text" 
              placeholder="Judul lengkap buku" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 text-xs font-semibold"
            />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Penulis / Pengarang *</label>
            <input 
              v-model="form.author" 
              type="text" 
              placeholder="Nama penulis" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Penerbit</label>
            <input 
              v-model="form.publisher" 
              type="text" 
              placeholder="Gramedia / Lentera" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tahun Terbit</label>
            <input 
              v-model.number="form.year" 
              type="number" 
              placeholder="2024" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">ISBN / Barcode</label>
            <input 
              v-model="form.isbn" 
              type="text" 
              placeholder="978-602-..." 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Kategori Buku *</label>
            <select 
              v-model="form.category" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option v-for="c in store.categories" :key="c.id" :value="c.name">
                {{ c.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Penempatan Rak Perpustakaan *</label>
            <select 
              v-model="form.shelfId" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option v-for="s in store.shelves" :key="s.id" :value="s.id">
                [{{ s.code }}] {{ s.name }} (Lantai {{ s.floor }})
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Total Eksemplar (Stok)</label>
            <input 
              v-model.number="form.totalCopies" 
              type="number" 
              min="1" 
              max="50" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Jumlah Halaman</label>
            <input 
              v-model.number="form.pages" 
              type="number" 
              placeholder="350" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Bahasa</label>
            <input 
              v-model="form.language" 
              type="text" 
              placeholder="Bahasa Indonesia" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">URL Cover Buku (Unsplash / Gambar)</label>
          <input 
            v-model="form.cover" 
            type="text" 
            placeholder="https://images.unsplash.com/..." 
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Sinopsis & Ringkasan</label>
          <textarea 
            v-model="form.synopsis" 
            rows="3" 
            placeholder="Tuliskan sinopsis singkat mengenai buku ini..." 
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
          ></textarea>
        </div>

      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
        <button 
          type="button" 
          @click="$emit('close')"
          class="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
        >
          Batal
        </button>
        <button 
          type="button"
          @click="handleSaveBook"
          :disabled="!form.title || !form.author || isSubmitting"
          class="px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          <Save class="w-4 h-4" />
          {{ isSubmitting ? 'Menyimpan...' : 'Simpan Data Buku' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import type { Book } from '../types.js';
import { BookMarked, X, Save } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  book?: Book | null;
}>();

const emit = defineEmits(['close', 'saved']);

const store = useLibraryStore();
const isSubmitting = ref(false);

const form = ref<Partial<Book>>({
  title: '',
  author: '',
  publisher: 'Pustaka Utama',
  year: new Date().getFullYear(),
  isbn: '',
  category: 'Teknologi & Komputer',
  shelfId: 'RAK-A1',
  totalCopies: 5,
  pages: 320,
  language: 'Bahasa Indonesia',
  cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
  synopsis: ''
});

watch(() => props.book, (val) => {
  if (val) {
    form.value = { ...val };
  } else {
    form.value = {
      title: '',
      author: '',
      publisher: 'Gramedia Pustaka',
      year: new Date().getFullYear(),
      isbn: `978-602-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}-0`,
      category: 'Teknologi & Komputer',
      shelfId: store.shelves[0]?.id || 'RAK-A1',
      totalCopies: 5,
      pages: 320,
      language: 'Bahasa Indonesia',
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      synopsis: ''
    };
  }
}, { immediate: true });

const handleSaveBook = async () => {
  if (!form.value.title || !form.value.author) return;

  isSubmitting.value = true;
  try {
    const res = await store.saveBook(form.value);
    if (res.success) {
      emit('saved');
      emit('close');
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>


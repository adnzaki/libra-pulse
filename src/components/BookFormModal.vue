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
      <div class="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
        
        <!-- Cover Upload / Input Box -->
        <div class="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3">
          <div class="flex items-center justify-between">
            <label class="block font-bold text-slate-700">Sampul Buku (Cover)</label>
            <div class="flex items-center space-x-1 bg-slate-200/70 p-0.5 rounded-xl text-[11px]">
              <button 
                type="button"
                @click="coverSourceMode = 'upload'"
                :class="coverSourceMode === 'upload' ? 'bg-white text-blue-600 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 font-medium'"
                class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                <Upload class="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>
              <button 
                type="button"
                @click="coverSourceMode = 'url'"
                :class="coverSourceMode === 'url' ? 'bg-white text-blue-600 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 font-medium'"
                class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                <LinkIcon class="w-3.5 h-3.5" />
                <span>Tautan URL</span>
              </button>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 items-start">
            <!-- Preview Box -->
            <div class="w-24 h-32 rounded-xl bg-slate-200 overflow-hidden flex-shrink-0 shadow-sm border border-slate-200 relative group">
              <img 
                v-if="form.cover" 
                :src="form.cover" 
                alt="Cover Preview" 
                class="w-full h-full object-cover"
                @error="form.cover = ''"
              />
              <div v-else class="w-full h-full flex flex-col items-center justify-center p-2 text-center text-slate-400">
                <ImageIcon class="w-6 h-6 mb-1" />
                <span class="text-[10px]">No Cover</span>
              </div>
              <button
                v-if="form.cover"
                type="button"
                @click="form.cover = ''"
                class="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Hapus gambar"
              >
                <X class="w-3 h-3" />
              </button>
            </div>

            <!-- Upload Area -->
            <div class="flex-1 w-full space-y-2">
              <!-- Upload Mode -->
              <div v-if="coverSourceMode === 'upload'" class="space-y-2">
                <div 
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleDrop"
                  @click="triggerFileInput"
                  :class="[
                    isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-blue-400 bg-white',
                    isUploading ? 'opacity-60 pointer-events-none' : 'cursor-pointer'
                  ]"
                  class="border-2 border-dashed rounded-2xl p-4 text-center transition-all flex flex-col items-center justify-center gap-1.5"
                >
                  <input 
                    ref="fileInputRef" 
                    type="file" 
                    accept="image/png, image/jpeg, image/webp, image/gif" 
                    class="hidden" 
                    @change="handleFileChange"
                  />
                  <div v-if="isUploading" class="flex items-center gap-2 text-blue-600 py-2">
                    <Loader2 class="w-5 h-5 animate-spin" />
                    <span class="text-xs font-semibold">Mengunggah gambar cover...</span>
                  </div>
                  <template v-else>
                    <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <UploadCloud class="w-4 h-4" />
                    </div>
                    <p class="text-xs font-bold text-slate-700">
                      Klik untuk pilih gambar atau tarik file ke sini
                    </p>
                    <p class="text-[11px] text-slate-500">
                      PNG, JPG, WEBP hingga 5MB 
                    </p>
                  </template>
                </div>
                
                <!-- <div v-if="form.cover && form.cover.startsWith('/covers/')" class="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <span class="truncate font-medium">Tersimpan di: {{ form.cover }}</span>
                  <span class="font-bold text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded">Lokal</span>
                </div> -->
              </div>

              <!-- URL Mode -->
              <div v-else class="space-y-2">
                <div class="flex gap-2">
                  <input 
                    v-model="form.cover" 
                    type="url" 
                    placeholder="https://images.unsplash.com/... atau /covers/..." 
                    class="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                  />
                  <button 
                    type="button" 
                    @click="generateRandomCover" 
                    class="px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition whitespace-nowrap cursor-pointer"
                  >
                    Acak Unsplash
                  </button>
                </div>
                <p class="text-[11px] text-slate-500">Gunakan tautan gambar resolusi tinggi (Unsplash, CDN, atau path cover lokal)</p>
              </div>
            </div>
          </div>
        </div>
        
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

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="space-y-1">
            <label class="block font-bold text-slate-700">Total Eksemplar (Stok Fisik) *</label>
            <input 
              v-model.number="form.totalCopies" 
              type="number" 
              min="1" 
              max="100" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:border-blue-500 text-xs"
            />
            <p v-if="book" class="text-[10px] text-slate-500">
              Saat ini: Dipinjam {{ book.borrowedCopies || 0 }}, Dibooking {{ book.reservedCopies || 0 }}
            </p>
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
          :disabled="!form.title || !form.author || isSubmitting || isUploading"
          class="px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
          <Save v-else class="w-4 h-4" />
          {{ isSubmitting ? 'Menyimpan...' : 'Simpan Data Buku' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import axios from 'axios';
import { useLibraryStore } from '../stores/library.js';
import type { Book } from '../types.js';
import { 
  BookMarked, 
  X, 
  Save, 
  Upload, 
  UploadCloud, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Loader2 
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  book?: Book | null;
}>();

const emit = defineEmits(['close', 'saved']);

const store = useLibraryStore();
const isSubmitting = ref(false);
const isUploading = ref(false);
const isDragging = ref(false);
const coverSourceMode = ref<'upload' | 'url'>('upload');
const fileInputRef = ref<HTMLInputElement | null>(null);

const randomCovers = [
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1532012164546-f432f2e3edd7?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80'
];

const generateRandomCover = () => {
  const idx = Math.floor(Math.random() * randomCovers.length);
  form.value.cover = randomCovers[idx];
};

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
  cover: '',
  synopsis: ''
});

watch(() => props.book, (val) => {
  if (val) {
    form.value = { ...val };
    if (val.cover && !val.cover.startsWith('/covers/')) {
      coverSourceMode.value = 'url';
    } else {
      coverSourceMode.value = 'upload';
    }
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
      cover: '',
      synopsis: ''
    };
    coverSourceMode.value = 'upload';
  }
}, { immediate: true });

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    await uploadCoverFile(target.files[0]);
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
};

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    await uploadCoverFile(event.dataTransfer.files[0]);
  }
};

const uploadCoverFile = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    store.setError('Format file tidak didukung. Harap pilih gambar (JPG, PNG, WEBP, GIF).');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    store.setError('Ukuran gambar melebihi 5MB.');
    return;
  }

  isUploading.value = true;

  try {
    const cleanName = (form.value.title || file.name.replace(/\.[^/.]+$/, '')).slice(0, 20);

    // Buat FormData object
    const formData = new FormData();
    formData.append('cover', file);         // Harus cocok dengan field name di multer: upload.single('cover')
    formData.append('filename', cleanName);

    const res = await axios.post('/api/upload-cover', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (res.data?.success && res.data?.url) {
      form.value.cover = res.data.url;
      store.showToast('✅ Gambar sampul berhasil disimpan');
    } else {
      store.setError(res.data?.error || 'Gagal menyimpan gambar');
    }
  } catch (err: any) {
    console.error('Upload cover error:', err);
    store.setError(err.response?.data?.error || err.message || 'Gagal mengunggah cover');
  } finally {
    isUploading.value = false;
  }
};

const handleSaveBook = async () => {
  if (!form.value.title || !form.value.author) return;

  if (!form.value.cover) {
    generateRandomCover();
  }

  // Update shelf info
  const selectedShelf = store.shelves.find(s => s.id === form.value.shelfId);
  if (selectedShelf) {
    form.value.shelfCode = selectedShelf.code;
    form.value.shelfName = selectedShelf.name;
  }

  const payload = { ...form.value };
  delete payload.availableCopies;
  delete payload.borrowedCopies;
  delete payload.reservedCopies;

  isSubmitting.value = true;
  try {
    const res = await store.saveBook(payload);
    if (res.success) {
      emit('saved');
      emit('close');
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

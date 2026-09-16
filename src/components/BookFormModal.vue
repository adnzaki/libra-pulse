<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden sm:overflow-y-auto">
    <div class="bg-white border-0 sm:border sm:border-slate-100 w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl sm:rounded-3xl rounded-none shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
      
      <!-- Sticky Header -->
      <div class="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div class="flex items-center gap-3">
          <div class="w-9 sm:w-10 h-9 sm:h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BookMarked class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-sm sm:text-base text-slate-900">{{ book ? 'Edit Data Buku' : 'Tambah Buku Baru' }}</h3>
            <p class="text-[11px] sm:text-xs text-slate-500">Katalogisasi, Penempatan Rak & Manajemen Stok</p>
          </div>
        </div>
        <button 
          @click="handleClose" 
          type="button"
          aria-label="Tutup modal form buku"
          class="p-2 sm:p-2.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 active:scale-95 transition cursor-pointer flex items-center justify-center shrink-0"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Body (Scrollable) -->
      <div class="p-4 sm:p-6 space-y-4 text-xs flex-1 overflow-y-auto">
        
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

        <!-- TOGGLE SWITCH E-BOOK & PDF UPLOAD AREA -->
        <div class="p-4 rounded-2xl border transition-all" :class="form.isEbook ? 'bg-indigo-50/60 border-indigo-200' : 'bg-slate-50/90 border-slate-200/80'">
          <div class="flex items-center justify-between gap-3">
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <Smartphone class="w-4 h-4" :class="form.isEbook ? 'text-indigo-600' : 'text-slate-400'" />
                <span class="font-bold text-xs sm:text-sm text-slate-900">Format Buku: e-Book Digital</span>
                <span v-if="form.isEbook" class="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold tracking-wide uppercase">
                  e-Book Aktif
                </span>
              </div>
              <p class="text-[11px] text-slate-500">
                Aktifkan jika buku ini berupa dokumen digital (PDF atau ePub) yang dapat dibaca oleh anggota setelah booking disetujui.
              </p>
            </div>

            <!-- Toggle Switch Control -->
            <div class="shrink-0 flex items-center">
              <label class="relative inline-flex items-center cursor-pointer" :class="{ 'cursor-not-allowed opacity-80': isEbookPermanent }">
                <input 
                  type="checkbox" 
                  v-model="form.isEbook" 
                  :disabled="isEbookPermanent"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          <!-- Peringatan jika buku sudah tersimpan sebagai e-book -->
          <div v-if="isEbookPermanent" class="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-[11px] text-amber-800">
            <AlertCircle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Format e-Book Permanen:</strong> Buku ini sudah tersimpan sebagai e-Book dan tidak dapat diubah menjadi buku cetak fisik. Jika ingin mengganti format, silakan hapus buku ini dan buat kembali (file e-Book juga akan terhapus otomatis dari server).
            </p>
          </div>

          <!-- Area Upload Dokumen PDF / ePub e-Book jika Toggle ON -->
          <div v-if="form.isEbook" class="mt-3 pt-3 border-t border-indigo-100 space-y-3">
            <div class="flex items-center justify-between">
              <label class="block font-bold text-slate-800 text-xs">
                Dokumen File e-Book (PDF / ePub) *
              </label>
              <span v-if="form.ebookUrl" class="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                <CheckCircle2 class="w-3.5 h-3.5" />
                {{ (form.ebookFormat || (form.ebookFileName?.toLowerCase().endsWith('.epub') ? 'ePub' : 'PDF')).toUpperCase() }} Terunggah
              </span>
            </div>

            <!-- Box Upload File e-Book -->
            <div 
              @dragover.prevent="isPdfDragging = true"
              @dragleave.prevent="isPdfDragging = false"
              @drop.prevent="handlePdfDrop"
              @click="triggerPdfFileInput"
              :class="[
                isPdfDragging ? 'border-indigo-500 bg-indigo-100/50' : form.ebookUrl ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-300 hover:border-indigo-400 bg-white',
                isUploadingPdf ? 'opacity-60 pointer-events-none' : 'cursor-pointer'
              ]"
              class="border-2 border-dashed rounded-2xl p-4 text-center transition-all flex flex-col items-center justify-center gap-2"
            >
              <input 
                ref="pdfFileInputRef" 
                type="file" 
                accept="application/pdf,.pdf,application/epub+zip,.epub" 
                class="hidden" 
                @change="handlePdfFileChange"
              />

              <div v-if="isUploadingPdf" class="flex items-center gap-2 text-indigo-600 py-2">
                <Loader2 class="w-5 h-5 animate-spin" />
                <span class="text-xs font-semibold">Mengunggah file dokumen e-Book...</span>
              </div>

              <!-- State: Sudah ada file e-Book -->
              <template v-else-if="form.ebookUrl">
                <div class="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <FileText class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-xs font-bold text-slate-800">{{ form.ebookFileName || 'dokumen_ebook' }}</p>
                  <p class="text-[11px] text-slate-500">
                    {{ formatFileSize(form.ebookFileSize) }} • Klik untuk ganti file
                  </p>
                </div>
                <div class="flex items-center gap-2 pt-1">
                  <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                    Format {{ (form.ebookFormat || (form.ebookFileName?.toLowerCase().endsWith('.epub') ? 'ePub' : 'PDF')).toUpperCase() }} • Siap Dibaca In-App
                  </span>
                </div>
              </template>

              <!-- State: Belum ada file e-Book -->
              <template v-else>
                <div class="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
                  <UploadCloud class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-xs font-bold text-slate-800">
                    Pilih atau Tarik File PDF / ePub e-Book ke Sini
                  </p>
                  <p class="text-[11px] text-slate-500">
                    Mendukung format .PDF dan .ePub (hingga 100MB)
                  </p>
                </div>
              </template>
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

        <!-- Penerbit, Tahun Terbit, ISBN: 100% width each on mobile, 3 cols on sm+ -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            <label class="block font-bold text-slate-700 mb-1">
              {{ form.isEbook ? 'Format Lokasi' : 'Penempatan Rak Perpustakaan *' }}
            </label>
            <!-- Untuk buku digital (e-Book), tidak perlu isian rak fisik, langsung label Digital -->
            <div 
              v-if="form.isEbook" 
              class="w-full px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between"
            >
              <div class="flex items-center gap-2 text-indigo-900 font-bold text-xs sm:text-sm">
                <span class="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                <span>Digital</span>
              </div>
              <span class="text-[11px] font-semibold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                Koleksi e-Book Online
              </span>
            </div>
            <!-- Untuk buku cetak fisik, pilih rak perpustakaan -->
            <select 
              v-else
              v-model="form.shelfId" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option v-for="s in sortedShelves" :key="s.id" :value="s.id">
                [{{ s.code }}] {{ s.name }} (Lantai {{ s.floor }})
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="space-y-1">
            <label class="block font-bold text-slate-700">{{ form.isEbook ? 'Kuota Akses e-Book' : 'Total Eksemplar (Stok Fisik)' }}</label>
            <input 
              v-model.number="form.totalCopies" 
              type="number" 
              min="1" 
              max="100" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:border-blue-500 text-xs"
            />
            <p v-if="book" class="text-[10px] text-slate-500">
              {{ form.isEbook ? 'Saat ini diakses: ' : 'Saat ini: ' }} Dipinjam {{ book.borrowedCopies || 0 }}, Dibooking {{ book.reservedCopies || 0 }}
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
              placeholder="Indonesia" 
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

      <!-- Sticky Footer -->
      <div class="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-end gap-3 shrink-0 sticky bottom-0 z-20">
        <button 
          type="button" 
          @click="handleClose"
          class="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
        >
          Batal
        </button>
        <button 
          type="button"
          @click="handleSaveBook"
          :disabled="!form.title || !form.author || isSubmitting || isUploading"
          class="flex-1 sm:flex-initial px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
import { ref, watch, toRef, computed } from 'vue';
import axios from 'axios';
import { useLibraryStore } from '../stores/library.js';
import type { Book } from '../types.js';
import { useModalBack } from '../composables/useModalBack.js';
import { 
  BookMarked, 
  X, 
  Save, 
  Upload, 
  UploadCloud, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Loader2,
  Smartphone,
  FileText,
  AlertCircle,
  CheckCircle2
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  book?: Book | null;
}>();

const emit = defineEmits(['close', 'saved']);

const handleClose = () => {
  resetForm();
  emit('close');
};

useModalBack(toRef(props, 'isOpen'), handleClose, 'book_form_modal');

const store = useLibraryStore();
const sortedShelves = computed(() => store.sortedShelves || store.shelves);
const isSubmitting = ref(false);
const isUploading = ref(false);
const isDragging = ref(false);
const coverSourceMode = ref<'upload' | 'url'>('upload');
const fileInputRef = ref<HTMLInputElement | null>(null);

// e-Book PDF Upload States
const isUploadingPdf = ref(false);
const isPdfDragging = ref(false);
const pdfFileInputRef = ref<HTMLInputElement | null>(null);
const isEbookPermanent = computed(() => Boolean(props.book?.isEbook));

const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'Dokumen e-Book';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

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

const getBlankForm = (): Partial<Book> => ({
  title: '',
  author: '',
  publisher: '',
  year: new Date().getFullYear(),
  isbn: '',
  category: store.categories[0]?.name || 'Teknologi & Komputer',
  shelfId: sortedShelves.value[0]?.id || store.shelves[0]?.id || 'RAK-A1',
  totalCopies: 1,
  pages: undefined,
  language: 'Bahasa Indonesia',
  cover: '',
  synopsis: '',
  isEbook: false,
  ebookFormat: 'pdf',
  ebookUrl: '',
  ebookFileName: '',
  ebookFileSize: 0
});

const form = ref<Partial<Book>>(getBlankForm());

const resetForm = () => {
  if (props.book) {
    form.value = { 
      ...props.book,
      isEbook: Boolean(props.book.isEbook),
      ebookFormat: props.book.ebookFormat || (props.book.ebookFileName?.toLowerCase().endsWith('.epub') ? 'epub' : 'pdf'),
      ebookUrl: props.book.ebookUrl || '',
      ebookFileName: props.book.ebookFileName || '',
      ebookFileSize: props.book.ebookFileSize || 0
    };
    if (props.book.cover && !props.book.cover.startsWith('/covers/')) {
      coverSourceMode.value = 'url';
    } else {
      coverSourceMode.value = 'upload';
    }
  } else {
    form.value = getBlankForm();
    coverSourceMode.value = 'upload';
  }
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
  if (pdfFileInputRef.value) {
    pdfFileInputRef.value.value = '';
  }
};

watch(
  [() => props.isOpen, () => props.book],
  ([isOpen]) => {
    if (isOpen) {
      resetForm();
    }
  },
  { immediate: true }
);

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

const readFileAsOptimizedDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
            return;
          }
        } catch {
          // fallback to raw data url
        }
        resolve(e.target?.result as string || '');
      };
      img.onerror = () => {
        resolve(e.target?.result as string || '');
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
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

    const formData = new FormData();
    formData.append('cover', file);
    formData.append('filename', cleanName);

    let serverUrl = '';
    try {
      const res = await fetch('/api/upload-cover', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.url) {
          serverUrl = data.url;
        }
      }
    } catch (networkErr) {
      console.warn('Upload cover ke endpoint server mengalami kendala, beralih ke penyimpanan lokal:', networkErr);
    }

    if (serverUrl) {
      form.value.cover = serverUrl;
      store.showToast('✅ Gambar sampul berhasil disimpan');
    } else {
      // Fallback: baca sebagai data URL lokal yang terkompresi
      const dataUrl = await readFileAsOptimizedDataUrl(file);
      if (dataUrl) {
        form.value.cover = dataUrl;
        store.showToast('✅ Gambar sampul berhasil disimpan');
      } else {
        throw new Error('Gagal memproses file gambar sampul');
      }
    }
  } catch (err: any) {
    console.error('Upload cover error:', err);
    store.setError(err.message || 'Gagal mengunggah cover');
  } finally {
    isUploading.value = false;
  }
};

// e-Book PDF Upload Handler
const triggerPdfFileInput = () => {
  if (pdfFileInputRef.value) {
    pdfFileInputRef.value.click();
  }
};

const handlePdfFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    await uploadEbookPdf(target.files[0]);
    if (pdfFileInputRef.value) pdfFileInputRef.value.value = '';
  }
};

const handlePdfDrop = async (event: DragEvent) => {
  isPdfDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    await uploadEbookPdf(event.dataTransfer.files[0]);
  }
};

const uploadEbookPdf = async (file: File) => {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isEpub = file.type === 'application/epub+zip' || file.name.toLowerCase().endsWith('.epub');
  if (!isPdf && !isEpub) {
    store.setError('Hanya dokumen format PDF (.pdf) dan ePub (.epub) yang didukung untuk e-Book.');
    return;
  }

  if (file.size > 100 * 1024 * 1024) {
    store.setError('Ukuran file e-Book melebihi batas maksimal 100MB.');
    return;
  }

  isUploadingPdf.value = true;

  try {
    const cleanName = (form.value.title || file.name.replace(/\.[^/.]+$/, '')).slice(0, 30);
    const formData = new FormData();
    formData.append('ebook', file);
    formData.append('filename', cleanName);

    const res = await fetch('/api/upload-ebook', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Gagal mengunggah file dokumen e-Book');
    }

    form.value.ebookUrl = data.url;
    form.value.ebookFileName = data.filename;
    form.value.ebookFileSize = data.size;
    form.value.ebookFormat = isEpub ? 'epub' : 'pdf';
    store.showToast(`✅ File e-Book (${isEpub ? 'ePub' : 'PDF'}) "${file.name}" berhasil diunggah!`);
  } catch (err: any) {
    console.error('Upload e-book error:', err);
    store.setError(err.message || 'Gagal mengunggah file dokumen e-Book');
  } finally {
    isUploadingPdf.value = false;
  }
};

const handleSaveBook = async () => {
  if (!form.value.title || !form.value.author) return;

  // Validasi jika e-book dipilih, wajib ada file e-Book (PDF/ePub)
  if (form.value.isEbook && !form.value.ebookUrl) {
    store.setError('File e-Book (PDF atau ePub) wajib diunggah sebelum menyimpan buku digital.');
    return;
  }

  if (!form.value.cover) {
    generateRandomCover();
  }

  // Update shelf info
  if (form.value.isEbook) {
    form.value.shelfCode = 'DIGITAL';
    form.value.shelfName = 'Digital';
    form.value.shelfId = 'digital';
  } else {
    const selectedShelf = sortedShelves.value.find(s => s.id === form.value.shelfId) || store.shelves.find(s => s.id === form.value.shelfId);
    if (selectedShelf) {
      form.value.shelfCode = selectedShelf.code;
      form.value.shelfName = selectedShelf.name;
    }
  }

  const payload = { ...form.value };
  delete payload.availableCopies;
  delete payload.borrowedCopies;
  delete payload.reservedCopies;

  isSubmitting.value = true;
  try {
    const res = await store.saveBook(payload);
    if (res.success) {
      resetForm();
      emit('saved');
      emit('close');
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

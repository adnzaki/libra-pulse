<template>
  <div class="space-y-4 sm:space-y-6">
    
    <!-- Banner Notifikasi Peminjaman Disetujui Admin -->
    <div 
      v-if="approvedLoanBanner" 
      class="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-emerald-400/30 animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <div class="flex items-start gap-3.5">
        <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 text-2xl shadow-sm">
          🎉
        </div>
        <div class="space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-extrabold text-xs tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-white/25 text-white">
              Peminjaman Disetujui Admin
            </span>
            <span v-if="approvedLoanBanner.isEbook" class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 border border-emerald-300/30">
              📱 Akses e-Book Aktif
            </span>
          </div>
          <p class="text-xs sm:text-sm text-white/95 font-medium leading-relaxed">
            Peminjaman buku <strong class="text-white underline">{{ approvedLoanBanner.bookTitle }}</strong> Anda telah disetujui admin!
            <span v-if="approvedLoanBanner.isEbook"> Dokumen e-Book digital Anda sudah dapat langsung dibaca in-app di Portal Saya.</span>
            <span v-else> Silakan ambil fisik buku di loket perpustakaan.</span>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto shrink-0">
        <router-link 
          to="/member-portal"
          class="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <span>Buka Halaman Portal Saya →</span>
        </router-link>
        <button 
          @click="dismissApprovedBanner(approvedLoanBanner.id)"
          class="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
          title="Tutup notifikasi"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Hero Bento Banner -->
    <section class="bg-white rounded-3xl p-4 sm:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
      <div class="max-w-3xl space-y-3 sm:space-y-4">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] sm:text-xs font-bold uppercase tracking-wider border border-blue-100">
          <Sparkles class="w-3.5 h-3.5" />
          Katalog & Sistem Booking 24 Jam
        </div>

        <h1 class="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Eksplorasi & Reservasi Buku Perpustakaan
        </h1>

        <p class="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
          Temukan koleksi buku favorit dan amankan peminjaman instan dengan sistem <strong>Hold 24 Jam</strong> menggunakan kartu member digital.
        </p>

        <!-- Big Search Bar & Fast Scan Button -->
        <div class="pt-1 sm:pt-2 flex flex-col sm:flex-row gap-2 max-w-2xl">
          <div class="relative flex-1">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Cari judul, penulis, ISBN, barcode..."
              class="w-full pl-10 pr-8 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-xs shadow-inner"
            />
            <button 
              v-if="searchQuery" 
              @click="searchQuery = ''"
              class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 text-xs p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <button 
            @click="openDirectScan"
            class="px-5 py-2.5 sm:py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-200 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
          >
            <QrCode class="w-4 h-4" />
            Scan Kartu Member
          </button>
        </div>

        <!-- Quick Badges Highlights -->
        <div class="flex flex-wrap gap-2 pt-1 text-[11px] sm:text-xs">
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
            <span>{{ store.stats?.availableBooks || 0 }} Tersedia</span>
          </div>
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            <Clock class="w-3.5 h-3.5 text-amber-500" />
            <span>{{ store.stats?.activeBookings || 0 }} Hold 24h</span>
          </div>
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            <Layers class="w-3.5 h-3.5 text-blue-600" />
            <span>{{ store.shelves.length }} Rak</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Filters & Search Toolbar (Bento Card) -->
    <section class="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3.5">
      
      <!-- Filter Jenis Buku (Semua, Buku Cetak, e-Book) -->
      <div>
        <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Jenis Koleksi:</div>
        <div class="flex flex-wrap items-center gap-2">
          <button 
            type="button"
            @click="bookTypeFilter = 'all'"
            class="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer active:scale-95 flex items-center gap-1.5"
            :class="bookTypeFilter === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'"
          >
            <span>Semua</span>
            <span class="text-[10px] opacity-80 font-mono font-bold">({{ store.books.length }})</span>
          </button>
          <button 
            type="button"
            @click="bookTypeFilter = 'physical'"
            class="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer active:scale-95 flex items-center gap-1.5"
            :class="bookTypeFilter === 'physical' ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'"
          >
            <BookOpen class="w-3.5 h-3.5" />
            <span>Buku Cetak</span>
            <span class="text-[10px] opacity-80 font-mono font-bold">({{ physicalBooksCount }})</span>
          </button>
          <button 
            type="button"
            @click="bookTypeFilter = 'ebook'"
            class="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer active:scale-95 flex items-center gap-1.5"
            :class="bookTypeFilter === 'ebook' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'"
          >
            <Smartphone class="w-3.5 h-3.5" />
            <span>e-Book</span>
            <span class="text-[10px] opacity-80 font-mono font-bold">({{ ebooksCount }})</span>
          </button>
        </div>
      </div>

      <!-- Category Filter Tabs (Flex-wrap with clean spacing, never clipped or truncated) -->
      <div class="pt-2 border-t border-slate-100">
        <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Kategori Buku:</div>
        <div class="flex flex-wrap items-center gap-2">
          <button 
            v-for="cat in categories" 
            :key="cat"
            @click="selectedCategory = cat"
            class="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer active:scale-95"
            :class="selectedCategory === cat ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'"
          >
            {{ cat === 'all' ? 'Semua Kategori' : cat }}
          </button>
        </div>
      </div>

      <!-- Secondary Filters: Shelf, Availability, and Result Info -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div class="flex flex-wrap items-center gap-2 flex-1">
          <select 
            v-model="selectedShelfId"
            class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-full text-slate-700 text-xs focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="all">Semua Lokasi Rak</option>
            <option v-for="s in store.sortedShelves" :key="s.id" :value="s.id">
              {{ s.code }} - Lantai {{ s.floor }} ({{ s.zone }})
            </option>
          </select>

          <select 
            v-model="availabilityFilter"
            class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-full text-slate-700 text-xs focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="all">Semua Status Ketersediaan</option>
            <option value="available">Hanya Buku Tersedia</option>
          </select>
        </div>

        <div class="flex items-center justify-between sm:justify-end gap-3 text-[11px] sm:text-xs text-slate-400">
          <span>Menampilkan <strong class="text-slate-800">{{ filteredBooks.length }}</strong> buku</span>
          <button 
            v-if="selectedCategory !== 'all' || selectedShelfId !== 'all' || availabilityFilter !== 'all' || bookTypeFilter !== 'all' || searchQuery"
            @click="resetFilters" 
            class="text-blue-600 font-bold underline hover:text-blue-700 cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      </div>
    </section>

    <!-- Books Grid (Optimized 2-columns on mobile, 4-columns on desktop) -->
    <section>
      <div v-if="filteredBooks.length > 0" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        <div 
          v-for="book in filteredBooks" 
          :key="book.id"
          class="group bg-white border border-slate-100 hover:border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
        >
          <!-- Top: Book Cover & Badges -->
          <div>
            <div class="relative aspect-[3/4] overflow-hidden bg-slate-100">
              <img 
                :src="book.cover" 
                :alt="book.title"
                class="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent"></div>
              
              <!-- Badges Container (Category + e-Book Badge) -->
              <div class="absolute top-2 left-2 sm:top-3 sm:left-3 max-w-[75%] flex flex-col gap-1 z-10">
                <!-- Label Khusus e-Book -->
                <span 
                  v-if="book.isEbook" 
                  class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-indigo-600 text-white text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1 shrink-0"
                >
                  <Smartphone class="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  e-Book
                </span>
                
                <span class="px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[8px] sm:text-[9px] uppercase font-bold tracking-wider text-slate-800 shadow-sm border border-slate-100 truncate block">
                  {{ book.category }}
                </span>
              </div>

              <!-- Shelf Location or Format Badge -->
              <div class="absolute top-2 right-2 sm:top-3 sm:right-3">
                <span 
                  v-if="book.isEbook"
                  class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-indigo-950/85 backdrop-blur-md text-[9px] sm:text-[10px] font-mono font-bold text-indigo-200 flex items-center gap-1 shadow-sm border border-indigo-500/30"
                  title="Format Digital"
                >
                  <Smartphone class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-400" />
                  Digital
                </span>
                <router-link 
                  v-else
                  to="/shelves"
                  class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-[9px] sm:text-[10px] font-mono font-bold text-white flex items-center gap-1 hover:bg-slate-900 shadow-sm"
                  title="Lokasi Rak Fisik"
                >
                  <MapPin class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                  {{ book.shelfCode }}
                </router-link>
              </div>

              <!-- Availability Status Badge on Cover Bottom -->
              <div class="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 flex items-center justify-between text-[9px] sm:text-[10px] bg-white/95 backdrop-blur-md px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-sm">
                <div class="flex items-center gap-1">
                  <span 
                    class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" 
                    :class="book.availableCopies > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'"
                  ></span>
                  <span class="font-bold truncate" :class="book.availableCopies > 0 ? 'text-slate-900' : 'text-rose-600'">
                    {{ book.isEbook ? (book.availableCopies > 0 ? 'Akses Siap' : 'Penuh') : (book.availableCopies > 0 ? `${book.availableCopies} Ada` : 'Habis') }}
                  </span>
                </div>
                <span v-if="book.reservedCopies > 0" class="text-amber-600 font-bold shrink-0">
                  {{ book.reservedCopies }} hold
                </span>
              </div>
            </div>

            <!-- Card Info -->
            <div class="p-2.5 sm:p-4 space-y-1">
              <h3 
                @click="openDetail(book)"
                class="font-bold text-xs sm:text-sm text-slate-900 hover:text-blue-600 transition cursor-pointer line-clamp-2 leading-snug"
                :title="book.title"
              >
                {{ book.title }}
              </h3>
              <p class="text-[11px] sm:text-xs text-slate-500 truncate">Oleh {{ book.author }}</p>
              <p class="text-[10px] text-slate-400 line-clamp-2 leading-relaxed hidden sm:block pt-0.5">{{ book.synopsis }}</p>
            </div>
          </div>

          <!-- Bottom: Action Buttons -->
          <div class="p-2.5 sm:p-4 pt-0">
            <div class="flex gap-1.5 sm:gap-2">
              <button 
                @click="openDetail(book)"
                class="flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] sm:text-xs font-semibold transition cursor-pointer text-center active:scale-95"
              >
                Detail
              </button>
              <button 
                @click="openBooking(book)"
                :disabled="book.availableCopies <= 0"
                class="flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-full text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-sm active:scale-95"
                :class="book.availableCopies > 0 
                  ? (book.isEbook ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200') 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'"
              >
                <Bookmark class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span class="truncate">{{ book.availableCopies > 0 ? (book.isEbook ? 'Booking e-Book' : 'Hold 24h') : 'Habis' }}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 sm:py-16 px-4 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <BookX class="w-10 h-10 text-slate-300 mx-auto" />
        <h3 class="font-bold text-sm sm:text-base text-slate-800">Tidak Ada Buku yang Cocok</h3>
        <p class="text-xs text-slate-400 max-w-sm mx-auto">Coba ubah kata kunci pencarian atau reset filter kategori dan lokasi rak Anda.</p>
        <button 
          @click="resetFilters" 
          class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold transition cursor-pointer"
        >
          Reset Semua Filter
        </button>
      </div>
    </section>

    <!-- Modals -->
    <BookingModal 
      :is-open="isBookingModalOpen" 
      :book="selectedBookForBooking"
      @close="isBookingModalOpen = false"
      @booked="handleBookingSuccess"
    />

    <BookDetailModal 
      :is-open="isDetailModalOpen" 
      :book="selectedBookForDetail"
      @close="isDetailModalOpen = false"
      @book="openBookingFromDetail"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useLibraryStore } from '../stores/library.js';
import type { Book, Loan } from '../types.js';
import BookingModal from '../components/BookingModal.vue';
import BookDetailModal from '../components/BookDetailModal.vue';
import { 
  Search, QrCode, Sparkles, CheckCircle2, Clock, 
  Layers, MapPin, Bookmark, BookX, Smartphone, BookOpen, X
} from 'lucide-vue-next';

const router = useRouter();
const store = useLibraryStore();

const searchQuery = ref('');
const selectedCategory = ref('all');
const selectedShelfId = ref('all');
const availabilityFilter = ref('all');
const bookTypeFilter = ref<'all' | 'physical' | 'ebook'>('all');

const isBookingModalOpen = ref(false);
const selectedBookForBooking = ref<Book | null>(null);

const isDetailModalOpen = ref(false);
const selectedBookForDetail = ref<Book | null>(null);

// Counts for book types
const physicalBooksCount = computed(() => store.books.filter(b => !b.isEbook).length);
const ebooksCount = computed(() => store.books.filter(b => !!b.isEbook).length);

// Persisted Dismissal of Approved Loan Banner
const dismissedBanners = ref<string[]>([]);
try {
  dismissedBanners.value = JSON.parse(localStorage.getItem('dismissed_approved_banners') || '[]');
} catch {}

const approvedLoanBanner = computed<Loan | null>(() => {
  if (!store.currentUser) return null;
  const recentApproved = store.myActiveLoans.find(l => {
    if (l.status === 'returned') return false;
    if (dismissedBanners.value.includes(l.id)) return false;
    const borrowTime = new Date(l.borrowDate).getTime();
    return (Date.now() - borrowTime) < (7 * 24 * 60 * 60 * 1000);
  });
  return recentApproved || null;
});

const dismissApprovedBanner = (loanId: string) => {
  if (!dismissedBanners.value.includes(loanId)) {
    dismissedBanners.value.push(loanId);
    try {
      localStorage.setItem('dismissed_approved_banners', JSON.stringify(dismissedBanners.value));
    } catch {}
  }
};

const categories = computed(() => {
  const list = ['all'];
  if (store.categories && store.categories.length > 0) {
    store.categories.forEach(c => list.push(c.name));
  } else {
    list.push('Teknologi & Komputer', 'Sains & Matematika', 'Sastra & Fiksi', 'Pengembangan Diri', 'Sejarah & Filsafat', 'Bisnis & Manajemen');
  }
  return list;
});

const filteredBooks = computed(() => {
  let list = [...store.books];

  // Filter jenis buku: Semua / Buku Cetak / e-Book
  if (bookTypeFilter.value === 'physical') {
    list = list.filter(b => !b.isEbook);
  } else if (bookTypeFilter.value === 'ebook') {
    list = list.filter(b => !!b.isEbook);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(b => 
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.isbn.toLowerCase().includes(q) ||
      b.barcode.toLowerCase().includes(q)
    );
  }

  if (selectedCategory.value !== 'all') {
    list = list.filter(b => b.category === selectedCategory.value);
  }

  if (selectedShelfId.value !== 'all') {
    list = list.filter(b => b.shelfId === selectedShelfId.value);
  }

  if (availabilityFilter.value === 'available') {
    list = list.filter(b => b.availableCopies > 0);
  }

  return list;
});

const resetFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = 'all';
  selectedShelfId.value = 'all';
  availabilityFilter.value = 'all';
  bookTypeFilter.value = 'all';
};

const openBooking = (book: Book) => {
  selectedBookForBooking.value = book;
  isBookingModalOpen.value = true;
};

const openDetail = (book: Book) => {
  selectedBookForDetail.value = book;
  isDetailModalOpen.value = true;
};

const openBookingFromDetail = (book: Book) => {
  isDetailModalOpen.value = false;
  openBooking(book);
};

const openDirectScan = () => {
  router.push('/member-card');
};

const handleBookingSuccess = () => {
  // refresh
};
</script>


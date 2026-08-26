<template>
  <div class="space-y-4 sm:space-y-6">
    
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
    <section class="bg-white rounded-3xl p-3.5 sm:p-5 border border-slate-100 shadow-sm space-y-3">
      <div class="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        
        <!-- Category Filter Tabs (Smooth horizontal scrolling on mobile, zero page overflow) -->
        <div class="flex items-center gap-1.5 overflow-x-auto w-full no-scrollbar py-0.5 -mx-1 px-1 scroll-smooth">
          <button 
            v-for="cat in categories" 
            :key="cat"
            @click="selectedCategory = cat"
            class="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 active:scale-95"
            :class="selectedCategory === cat ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'"
          >
            {{ cat === 'all' ? 'Semua Kategori' : cat }}
          </button>
        </div>

        <!-- Shelf & Availability Dropdowns -->
        <div class="flex items-center gap-2 w-full lg:w-auto">
          <select 
            v-model="selectedShelfId"
            class="flex-1 lg:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-full text-slate-700 text-xs focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="all">Semua Lokasi Rak</option>
            <option v-for="s in store.shelves" :key="s.id" :value="s.id">
              {{ s.code }} - Lantai {{ s.floor }}
            </option>
          </select>

          <select 
            v-model="availabilityFilter"
            class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-full text-slate-700 text-xs focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="all">Semua Status</option>
            <option value="available">Tersedia</option>
          </select>
        </div>

      </div>

      <!-- Result Count Info -->
      <div class="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 pt-2 border-t border-slate-100">
        <span>Menampilkan <strong class="text-slate-800">{{ filteredBooks.length }}</strong> buku</span>
        <span v-if="selectedCategory !== 'all' || selectedShelfId !== 'all' || searchQuery" class="text-blue-600 font-medium">
          <button @click="resetFilters" class="underline hover:text-blue-700 cursor-pointer">Reset Filter</button>
        </span>
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
              
              <!-- Category Pill -->
              <div class="absolute top-2 left-2 sm:top-3 sm:left-3 max-w-[70%]">
                <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-white/95 backdrop-blur-md text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-800 shadow-sm border border-slate-100 truncate block">
                  {{ book.category }}
                </span>
              </div>

              <!-- Shelf Location Badge -->
              <div class="absolute top-2 right-2 sm:top-3 sm:right-3">
                <router-link 
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
                    {{ book.availableCopies > 0 ? `${book.availableCopies} Ada` : 'Habis' }}
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
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'"
              >
                <Bookmark class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span class="truncate">{{ book.availableCopies > 0 ? 'Hold 24h' : 'Habis' }}</span>
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
import type { Book } from '../types.js';
import BookingModal from '../components/BookingModal.vue';
import BookDetailModal from '../components/BookDetailModal.vue';
import { 
  Search, QrCode, Sparkles, CheckCircle2, Clock, 
  Layers, MapPin, Bookmark, BookX 
} from 'lucide-vue-next';

const router = useRouter();
const store = useLibraryStore();

const searchQuery = ref('');
const selectedCategory = ref('all');
const selectedShelfId = ref('all');
const availabilityFilter = ref('all');

const isBookingModalOpen = ref(false);
const selectedBookForBooking = ref<Book | null>(null);

const isDetailModalOpen = ref(false);
const selectedBookForDetail = ref<Book | null>(null);

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


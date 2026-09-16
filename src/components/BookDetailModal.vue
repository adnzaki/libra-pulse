<template>
  <div v-if="isOpen && book" class="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden sm:overflow-y-auto">
    <!-- Modal Card (Full screen on mobile, rounded card on sm+) -->
    <div class="bg-white border-0 sm:border sm:border-slate-100 w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl sm:rounded-3xl rounded-none shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
      
      <!-- Sticky Header -->
      <div class="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div class="flex items-center gap-2 overflow-hidden mr-2">
          <span class="px-2.5 sm:px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] sm:text-xs font-bold uppercase tracking-wider border border-blue-100 shrink-0">
            {{ book.category }}
          </span>
          <span class="text-[11px] sm:text-xs text-slate-400 font-mono truncate">ISBN: {{ book.isbn }}</span>
        </div>
        <button 
          @click="$emit('close')" 
          type="button"
          aria-label="Tutup detail buku"
          class="p-2 sm:p-2.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 active:scale-95 transition cursor-pointer flex items-center justify-center shrink-0"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Scrollable Main Content -->
      <div class="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 sm:space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          
          <!-- Left: Cover & Barcode Info -->
          <div class="space-y-3">
            <div class="relative group max-w-[220px] sm:max-w-none mx-auto">
              <img :src="book.cover" class="w-full aspect-[2/3] object-cover rounded-2xl shadow-md border border-slate-100" alt="Cover" />
              <div class="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-md p-2 rounded-xl text-center border border-white/10">
                <div class="text-[9px] text-slate-300 uppercase tracking-widest font-mono">Barcode ID</div>
                <div class="font-mono text-xs font-bold text-amber-300 tracking-wider mt-0.5">{{ book.barcode }}</div>
              </div>
            </div>

            <!-- Copies Availability Bar -->
            <div class="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2.5">
              <div class="flex justify-between font-bold">
                <span class="text-slate-600">Total Eksemplar</span>
                <span class="text-slate-900 font-extrabold">{{ book.totalCopies }} Buku</span>
              </div>
              <div class="h-2 bg-slate-200 rounded-full overflow-hidden flex">
                <div 
                  class="bg-emerald-500" 
                  :style="{ width: `${(book.availableCopies / book.totalCopies) * 100}%` }" 
                  title="Tersedia"
                ></div>
                <div 
                  class="bg-amber-400" 
                  :style="{ width: `${(book.reservedCopies / book.totalCopies) * 100}%` }" 
                  title="Ditahan (Booking 24h)"
                ></div>
                <div 
                  class="bg-blue-500" 
                  :style="{ width: `${(book.borrowedCopies / book.totalCopies) * 100}%` }" 
                  title="Sedang Dipinjam"
                ></div>
              </div>
              <div class="grid grid-cols-3 gap-1 text-[10px] text-center pt-1 font-semibold">
                <div class="text-emerald-700">Tersedia ({{ book.availableCopies }})</div>
                <div class="text-amber-700">Hold ({{ book.reservedCopies }})</div>
                <div class="text-blue-700">Pinjam ({{ book.borrowedCopies }})</div>
              </div>
            </div>
          </div>

          <!-- Right: Metadata, Location & Synopsis -->
          <div class="md:col-span-2 space-y-4">
            <div>
              <h2 class="font-extrabold text-lg sm:text-xl text-slate-900 leading-tight">{{ book.title }}</h2>
              <p class="text-xs sm:text-sm text-blue-600 font-bold mt-1">Penulis: {{ book.author }}</p>
              <p class="text-[11px] sm:text-xs text-slate-500 mt-0.5">Penerbit: {{ book.publisher }} (Tahun {{ book.year }}) • {{ book.pages }} Halaman • {{ book.language }}</p>
            </div>

            <!-- Shelf Location Locator Box (or Digital e-Book Badge) -->
            <div v-if="book.isEbook" class="p-3.5 sm:p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2">
              <div class="flex items-center gap-2 text-xs font-bold text-indigo-900">
                <Smartphone class="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Format Buku Digital (e-Book):</span>
              </div>
              <div class="p-3 rounded-xl bg-white border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                <div>
                  <div class="font-bold text-sm text-indigo-700 font-mono flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-xs font-extrabold uppercase">
                      {{ (book.ebookFormat || (book.ebookFileName?.toLowerCase().endsWith('.epub') ? 'epub' : 'pdf')).toUpperCase() }}
                    </span>
                    <span>Buku Digital In-App</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-0.5">Dapat dibaca langsung di browser / smartphone setelah peminjaman disetujui.</div>
                </div>
                <span class="text-xs px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-center shrink-0">
                  Label: Digital
                </span>
              </div>
            </div>

            <div v-else class="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div class="flex items-center gap-2 text-xs font-bold text-slate-800">
                <MapPin class="w-4 h-4 text-blue-600 shrink-0" />
                <span>Lokasi Rak Fisik Perpustakaan:</span>
              </div>
              <div class="p-3 rounded-xl bg-white border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                <div>
                  <div class="font-bold text-sm text-blue-600 font-mono">{{ book.shelfCode }}</div>
                  <div class="text-xs text-slate-500">{{ book.shelfName }}</div>
                </div>
                <router-link 
                  to="/shelves" 
                  @click="$emit('close')"
                  class="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition text-center"
                >
                  Lihat Peta Rak →
                </router-link>
              </div>
            </div>

            <!-- Synopsis -->
            <div>
              <h4 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Sinopsis & Ringkasan</h4>
              <p class="text-xs text-slate-600 leading-relaxed max-h-48 overflow-y-auto pr-1">
                {{ book.synopsis }}
              </p>
            </div>

          </div>

        </div>
      </div>

      <!-- Sticky Bottom Action Footer -->
      <div class="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/95 sm:bg-white backdrop-blur-md border-t border-slate-100 flex items-center justify-between gap-3 shrink-0 sticky bottom-0 z-20">
        <button 
          type="button" 
          @click="$emit('close')"
          class="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
        >
          Tutup
        </button>
        <button 
          @click="$emit('book', book)"
          :disabled="book.availableCopies <= 0"
          class="flex-1 sm:flex-initial px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Bookmark class="w-4 h-4 shrink-0" />
          <span>{{ book.availableCopies > 0 ? 'Booking Peminjaman (Hold 24 Jam)' : 'Stok Habis' }}</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue';
import type { Book } from '../types.js';
import { X, MapPin, Bookmark, Smartphone } from 'lucide-vue-next';
import { useModalBack } from '../composables/useModalBack.js';

const props = defineProps<{
  isOpen: boolean;
  book: Book | null;
}>();

const emit = defineEmits(['close', 'book']);

useModalBack(toRef(props, 'isOpen'), () => emit('close'), 'book_detail_modal');
</script>


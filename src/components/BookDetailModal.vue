<template>
  <div v-if="isOpen && book" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
    <div class="bg-white border border-slate-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
      
      <!-- Header -->
      <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-100">
            {{ book.category }}
          </span>
          <span class="text-xs text-slate-400 font-mono">ISBN: {{ book.isbn }}</span>
        </div>
        <button @click="$emit('close')" class="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Main Info -->
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Left: Cover & Barcode Info -->
          <div class="space-y-3">
            <div class="relative group">
              <img :src="book.cover" class="w-full aspect-[2/3] object-cover rounded-2xl shadow-md border border-slate-100" alt="Cover" />
              <div class="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-md p-2 rounded-xl text-center border border-white/10">
                <div class="text-[9px] text-slate-300 uppercase tracking-widest font-mono">Barcode ID</div>
                <div class="font-mono text-xs font-bold text-amber-300 tracking-wider mt-0.5">{{ book.barcode }}</div>
              </div>
            </div>

            <!-- Copies Availability Bar -->
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2.5">
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
              <h2 class="font-extrabold text-xl text-slate-900 leading-tight">{{ book.title }}</h2>
              <p class="text-sm text-blue-600 font-bold mt-1">Penulis: {{ book.author }}</p>
              <p class="text-xs text-slate-400 mt-0.5">Penerbit: {{ book.publisher }} (Tahun {{ book.year }}) • {{ book.pages }} Halaman • {{ book.language }}</p>
            </div>

            <!-- Shelf Location Locator Box -->
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div class="flex items-center gap-2 text-xs font-bold text-slate-800">
                <MapPin class="w-4 h-4 text-blue-600" />
                <span>Lokasi Rak Fisik Perpustakaan:</span>
              </div>
              <div class="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between shadow-sm">
                <div>
                  <div class="font-bold text-sm text-blue-600 font-mono">{{ book.shelfCode }}</div>
                  <div class="text-xs text-slate-500">{{ book.shelfName }}</div>
                </div>
                <router-link 
                  to="/shelves" 
                  @click="$emit('close')"
                  class="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Lihat Peta Rak →
                </router-link>
              </div>
            </div>

            <!-- Synopsis -->
            <div>
              <h4 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Sinopsis & Ringkasan</h4>
              <p class="text-xs text-slate-600 leading-relaxed max-h-40 overflow-y-auto pr-1">
                {{ book.synopsis }}
              </p>
            </div>

            <!-- Action buttons -->
            <div class="pt-3 border-t border-slate-100 flex flex-wrap gap-3">
              <button 
                @click="$emit('book', book)"
                :disabled="book.availableCopies <= 0"
                class="flex-1 px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bookmark class="w-4 h-4" />
                {{ book.availableCopies > 0 ? 'Booking Peminjaman (Hold 24 Jam)' : 'Stok Habis / Sedang Dipinjam' }}
              </button>
            </div>

          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import type { Book } from '../types.js';
import { X, MapPin, Bookmark } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
  book: Book | null;
}>();

defineEmits(['close', 'book']);
</script>


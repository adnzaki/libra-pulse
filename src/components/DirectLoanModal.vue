<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
    <div class="bg-white border border-slate-100 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
      
      <!-- Header -->
      <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookPlus class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-base text-slate-900">Peminjaman Buku Langsung (Scan Sirkulasi)</h3>
            <p class="text-xs text-slate-500">Integrasi scan kartu member & barcode buku</p>
          </div>
        </div>
        <button @click="$emit('close')" class="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form -->
      <div class="p-6 space-y-4 text-xs">
        
        <!-- Step 1: Member Card Identification -->
        <div class="space-y-1.5">
          <label class="block font-bold text-slate-700">1. Identifikasi Anggota (Scan / No. Kartu Member)</label>
          <div class="flex gap-2">
            <input 
              v-model="memberCardInput"
              type="text" 
              placeholder="Contoh: LIB-2026-8801"
              class="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs font-mono font-semibold focus:outline-none focus:border-blue-500 uppercase"
            />
            <select 
              v-model="memberCardInput"
              class="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-xs font-medium"
            >
              <option value="">Pilih Member Demo</option>
              <option v-for="m in store.members.filter(mem => mem.role === 'member')" :key="m.id" :value="m.cardNumber">
                {{ m.name }} ({{ m.isSuspended ? '⚠️ Suspend' : 'Aktif' }})
              </option>
            </select>
          </div>
        </div>

        <!-- Step 2: Book Selection / Barcode Scan -->
        <div class="space-y-1.5">
          <label class="block font-bold text-slate-700">2. Buku yang Dipinjam (Pilih atau Barcode)</label>
          <select 
            v-model="selectedBookId"
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="">-- Pilih Buku --</option>
            <option 
              v-for="b in store.books" 
              :key="b.id" 
              :value="b.id"
              :disabled="b.availableCopies <= 0"
            >
              {{ b.title }} (Tersedia: {{ b.availableCopies }} di {{ b.shelfCode }})
            </option>
          </select>
        </div>

        <!-- Loan Duration -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Durasi Peminjaman (Hari)</label>
            <input 
              v-model.number="loanDays" 
              type="number" 
              min="1" 
              max="30" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Petugas Sirkulasi</label>
            <input 
              v-model="handledBy" 
              type="text" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
        </div>

        <!-- Live Summary Box -->
        <div v-if="chosenBook" class="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-3.5">
          <img :src="chosenBook.cover" class="w-14 h-20 object-cover rounded-xl shadow-sm" alt="Cover" />
          <div class="flex-1 min-w-0">
            <span class="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold">{{ chosenBook.shelfCode }}</span>
            <h4 class="font-bold text-slate-900 text-sm mt-1 line-clamp-1">{{ chosenBook.title }}</h4>
            <p class="text-xs text-slate-400">Barcode: {{ chosenBook.barcode }}</p>
            <div class="text-[11px] text-emerald-600 font-bold mt-1">Stok saat ini: {{ chosenBook.availableCopies }} tersedia</div>
          </div>
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
          @click="handleIssueLoan"
          :disabled="!memberCardInput || !selectedBookId || isSubmitting"
          class="px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          <Check class="w-4 h-4" />
          {{ isSubmitting ? 'Memproses Transaksi...' : 'Konfirmasi Peminjaman' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import { BookPlus, X, Check } from 'lucide-vue-next';
import confetti from 'canvas-confetti';

const props = defineProps<{
  isOpen: boolean;
  preselectedCard?: string;
}>();

const emit = defineEmits(['close', 'issued']);

const store = useLibraryStore();
const memberCardInput = ref(props.preselectedCard || 'LIB-2026-8801');
const selectedBookId = ref('');
const loanDays = ref(7);
const handledBy = ref('Admin Sirkulasi');
const isSubmitting = ref(false);

const chosenBook = computed(() => {
  return store.books.find(b => b.id === selectedBookId.value) || null;
});

const handleIssueLoan = async () => {
  if (!memberCardInput.value || !selectedBookId.value) return;

  isSubmitting.value = true;
  try {
    const res = await store.issueDirectLoan(
      selectedBookId.value,
      memberCardInput.value,
      loanDays.value,
      handledBy.value
    );
    if (res.success) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
      emit('issued', res.loan);
      emit('close');
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>


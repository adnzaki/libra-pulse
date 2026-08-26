<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
    <div class="bg-white border border-slate-100 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
      
      <!-- Header -->
      <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-base text-slate-900">Proses Pengembalian Buku</h3>
            <p class="text-xs text-slate-500">Sirkulasi & Pelaporan Otomatis Terintegrasi</p>
          </div>
        </div>
        <button @click="$emit('close')" class="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-4">
        
        <!-- Loan Selection if not preselected -->
        <div v-if="!selectedLoan">
          <label class="block text-xs font-bold text-slate-700 mb-1.5">Pilih Peminjaman Aktif untuk Dikembalikan</label>
          <select 
            v-model="chosenLoanId"
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="">-- Pilih Buku & Peminjam --</option>
            <option 
              v-for="l in store.activeLoans" 
              :key="l.id" 
              :value="l.id"
            >
              [{{ l.id }}] {{ l.bookTitle }} • {{ l.memberName }} ({{ l.status === 'overdue' ? '⚠️ TERLAMBAT' : 'Aktif' }})
            </option>
          </select>
        </div>

        <!-- Selected Loan Details -->
        <div v-if="currentLoan" class="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3.5">
          <div class="flex gap-3.5">
            <img :src="currentLoan.bookCover" class="w-14 h-20 object-cover rounded-xl shadow-sm" alt="Cover" />
            <div class="flex-1 min-w-0">
              <span class="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold">{{ currentLoan.id }}</span>
              <h4 class="font-bold text-slate-900 text-sm mt-1 line-clamp-1">{{ currentLoan.bookTitle }}</h4>
              <p class="text-xs text-slate-500">Peminjam: <strong class="text-slate-800">{{ currentLoan.memberName }}</strong> ({{ currentLoan.memberCardNumber }})</p>
              <div class="flex items-center gap-3 text-xs mt-1 text-slate-400">
                <span>Pinjam: {{ new Date(currentLoan.borrowDate).toLocaleDateString('id-ID') }}</span>
                <span>Jatuh Tempo: <strong :class="isLate ? 'text-rose-600' : 'text-slate-700'">{{ new Date(currentLoan.dueDate).toLocaleDateString('id-ID') }}</strong></span>
              </div>
            </div>
          </div>

          <!-- Late / Overdue Calculation Box -->
          <div 
            class="p-4 rounded-2xl border text-xs"
            :class="isLate ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'"
          >
            <div class="flex items-center justify-between font-bold">
              <span>Status Pengembalian:</span>
              <span v-if="isLate" class="text-rose-600 font-extrabold">⚠️ Terlambat {{ calculatedDaysOverdue }} Hari</span>
              <span v-else class="text-emerald-700 font-extrabold">✅ Tepat Waktu</span>
            </div>

            <div v-if="isLate" class="mt-2.5 pt-2.5 border-t border-rose-200/80 space-y-1.5">
              <div class="flex justify-between text-[11px] text-amber-800">
                <span>Sanksi Suspend Otomatis:</span>
                <span class="font-bold">{{ store.suspendConfig.defaultSuspendDays }} Hari Penangguhan Akun</span>
              </div>
              <p class="text-[10px] text-slate-500 pt-1">Kartu member akan disuspend selama {{ store.suspendConfig.defaultSuspendDays }} hari karena keterlambatan pengembalian buku.</p>
            </div>
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
          @click="handleReturnSubmit"
          :disabled="!currentLoan || isSubmitting"
          class="px-5 py-2.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          <CheckCircle class="w-4 h-4" />
          {{ isSubmitting ? 'Memproses Pengembalian...' : 'Konfirmasi Terima Pengembalian' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import type { Loan } from '../types.js';
import { CheckCircle2, CheckCircle, X } from 'lucide-vue-next';
import confetti from 'canvas-confetti';

const props = defineProps<{
  isOpen: boolean;
  selectedLoan?: Loan | null;
}>();

const emit = defineEmits(['close', 'returned']);

const store = useLibraryStore();
const chosenLoanId = ref('');
const isSubmitting = ref(false);

watch(() => props.selectedLoan, (val) => {
  if (val) chosenLoanId.value = val.id;
}, { immediate: true });

const currentLoan = computed(() => {
  if (props.selectedLoan) return props.selectedLoan;
  return store.loans.find(l => l.id === chosenLoanId.value) || null;
});

const isLate = computed(() => {
  if (!currentLoan.value) return false;
  const due = new Date(currentLoan.value.dueDate).getTime();
  return Date.now() > due;
});

const calculatedDaysOverdue = computed(() => {
  if (!currentLoan.value || !isLate.value) return 0;
  const due = new Date(currentLoan.value.dueDate).getTime();
  return Math.ceil((Date.now() - due) / (24 * 60 * 60 * 1000));
});

const handleReturnSubmit = async () => {
  if (!currentLoan.value) return;

  isSubmitting.value = true;
  try {
    const res = await store.returnLoan(currentLoan.value.id);
    if (res.success) {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 }
      });
      emit('returned', res.data);
      emit('close');
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>


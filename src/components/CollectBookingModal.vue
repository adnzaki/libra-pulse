<template>
  <div 
    v-if="isOpen && booking" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
  >
    <div 
      class="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
    >
      <!-- Header -->
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <CheckCircle class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-base">Penyerahan Buku Booking</h3>
            <p class="text-xs text-slate-500">Konfirmasi serah-terima buku & tentukan durasi pinjam</p>
          </div>
        </div>
        <button 
          @click="closeModal" 
          class="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-200/50 transition cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto space-y-5">
        
        <!-- Error Alert -->
        <div v-if="modalError" class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
          <div class="flex-1 font-medium">{{ modalError }}</div>
          <button @click="modalError = ''" class="text-rose-500 hover:text-rose-800 text-xs font-bold">✕</button>
        </div>

        <!-- Book & Booking Info Card -->
        <div class="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex gap-3.5">
          <img 
            :src="booking.bookCover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80'" 
            class="w-16 h-22 object-cover rounded-xl shadow-sm border border-slate-200 shrink-0" 
            alt="Cover" 
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                Rak: {{ booking.shelfCode || 'A-01' }}
              </span>
              <span class="text-[10px] font-mono text-slate-400">ID: {{ booking.id }}</span>
            </div>
            <h4 class="font-bold text-slate-900 text-sm mt-1 line-clamp-2">{{ booking.bookTitle }}</h4>
            <div class="mt-2 text-xs text-slate-600">
              <span class="text-slate-400">Peminjam:</span> <strong class="text-slate-800">{{ booking.memberName }}</strong>
              <span class="text-slate-400 font-mono text-[11px] ml-1">({{ booking.memberCardNumber }})</span>
            </div>
            <div v-if="booking.notes" class="text-[11px] text-slate-500 italic mt-0.5">
              Catatan: "{{ booking.notes }}"
            </div>
          </div>
        </div>

        <!-- Member Status Check Banner -->
        <div 
          v-if="matchedMember" 
          class="p-3 rounded-2xl border flex items-center justify-between text-xs"
          :class="isMemberBlocked ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'"
        >
          <div class="flex items-center gap-2">
            <ShieldAlert v-if="isMemberBlocked" class="w-4 h-4 text-rose-600 shrink-0" />
            <CheckCircle v-else class="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span class="font-bold">Status Member:</span>
              <span class="ml-1 font-semibold" :class="isMemberBlocked ? 'text-rose-700' : 'text-emerald-700'">
                {{ isMemberBlocked ? 'TERKENA SANKSI / SUSPEND' : 'Aktif (Dapat Meminjam)' }}
              </span>
              <div v-if="matchedMember.isSuspended" class="text-[11px] text-rose-600 mt-0.5">
                Alasan: {{ matchedMember.suspendReason || 'Keterlambatan pengembalian' }}
              </div>
              <div v-if="overdueLoansCount > 0" class="text-[11px] text-rose-600 mt-0.5 font-bold">
                ⚠️ Memiliki {{ overdueLoansCount }} buku pinjaman yang sedang terlambat!
              </div>
            </div>
          </div>
          <span 
            class="px-2.5 py-0.5 rounded-full font-bold text-[10px] shrink-0"
            :class="isMemberBlocked ? 'bg-rose-200 text-rose-800' : 'bg-emerald-200 text-emerald-800'"
          >
            {{ isMemberBlocked ? 'DIBLOKIR' : 'MEMENUHI SYARAT' }}
          </span>
        </div>

        <!-- Form: Duration & Officer -->
        <div class="space-y-4">
          <!-- Loan Duration (1-7 days, default 3) -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                <Clock class="w-4 h-4 text-blue-600" />
                Durasi Peminjaman (1 - 7 Hari)
              </label>
              <span class="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                {{ loanDays }} Hari
              </span>
            </div>

            <div class="flex items-center gap-2">
              <input 
                v-model.number="loanDays"
                type="number"
                min="1"
                max="7"
                class="w-24 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-center font-bold text-slate-900 text-sm focus:outline-none focus:border-blue-500"
              />
              <div class="flex flex-wrap items-center gap-1.5 flex-1">
                <button 
                  v-for="d in [1, 2, 3, 5, 7]" 
                  :key="d" 
                  type="button"
                  @click="loanDays = d"
                  class="px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                  :class="loanDays === d ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
                >
                  {{ d }} Hari{{ d === 3 ? ' (Default)' : '' }}
                </button>
              </div>
            </div>
            <p class="text-[11px] text-slate-400 mt-1.5">
              Batas regulasi sirkulasi perpustakaan adalah 1 hingga maksimal 7 hari pinjam.
            </p>
          </div>

          <!-- Due Date Preview Box -->
          <div class="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs">
            <div class="flex items-center gap-2 text-blue-900">
              <Calendar class="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <div class="text-[11px] text-blue-700">Tanggal Jatuh Tempo Pengembalian:</div>
                <div class="font-bold text-sm text-blue-900">{{ dueDateFormatted }}</div>
              </div>
            </div>
            <span class="font-mono text-[10px] text-blue-600 bg-white px-2 py-1 rounded-lg border border-blue-200">
              {{ dueDateRaw }}
            </span>
          </div>

          <!-- Officer In Charge -->
          <div>
            <label class="block font-bold text-xs text-slate-700 mb-1">Petugas Sirkulasi</label>
            <input 
              v-model="handledBy" 
              type="text" 
              placeholder="Nama Petugas Sirkulasi"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
        <button 
          type="button" 
          @click="closeModal"
          class="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
        >
          Batal
        </button>
        <button 
          type="button" 
          @click="handleConfirmCollection"
          :disabled="isSubmitting || isMemberBlocked || loanDays < 1 || loanDays > 7"
          class="px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          <CheckCircle class="w-4 h-4" />
          {{ isSubmitting ? 'Memproses...' : 'Konfirmasi & Serahkan Buku' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import type { Booking, Member } from '../types.js';
import { CheckCircle, X, AlertCircle, Clock, Calendar, ShieldAlert } from 'lucide-vue-next';
import confetti from 'canvas-confetti';

const props = defineProps<{
  isOpen: boolean;
  booking: Booking | null;
}>();

const emit = defineEmits(['close', 'collected']);

const store = useLibraryStore();
const loanDays = ref(3); // Default 3 hari sesuai instruksi
const handledBy = ref('Admin Sirkulasi');
const isSubmitting = ref(false);
const modalError = ref('');

const matchedMember = computed<Member | null>(() => {
  if (!props.booking) return null;
  const bk = props.booking;
  return store.members.find(m => 
    m.id === bk.memberId || 
    m.cardNumber === bk.memberCardNumber ||
    (m.email && bk.memberEmail && m.email.toLowerCase() === bk.memberEmail.toLowerCase())
  ) || null;
});

const overdueLoansCount = computed(() => {
  if (!matchedMember.value) return 0;
  const memId = matchedMember.value.id;
  const cardNum = matchedMember.value.cardNumber;
  return store.loans.filter(l => 
    (l.memberId === memId || l.memberCardNumber === cardNum) && l.status === 'overdue'
  ).length;
});

const isMemberBlocked = computed(() => {
  if (matchedMember.value?.isSuspended) return true;
  if (overdueLoansCount.value > 0) return true;
  return false;
});

const calculatedDueDate = computed(() => {
  const days = Math.min(7, Math.max(1, Number(loanDays.value) || 3));
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
});

const dueDateRaw = computed(() => {
  const d = calculatedDueDate.value;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

const dueDateFormatted = computed(() => {
  return calculatedDueDate.value.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
});

const closeModal = () => {
  modalError.value = '';
  emit('close');
};

const handleConfirmCollection = async () => {
  if (!props.booking) return;
  modalError.value = '';

  if (loanDays.value < 1 || loanDays.value > 7) {
    modalError.value = 'Durasi peminjaman harus antara 1 sampai 7 hari.';
    return;
  }

  if (isMemberBlocked.value) {
    modalError.value = 'Penyerahan ditolak karena anggota berstatus suspend atau memiliki pinjaman yang terlambat.';
    return;
  }

  isSubmitting.value = true;
  try {
    const res = await store.collectBooking(
      props.booking.id,
      loanDays.value,
      handledBy.value
    );

    if (res.success) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
      emit('collected', res.loan);
      closeModal();
    } else {
      modalError.value = res.error || 'Gagal memproses penyerahan buku.';
    }
  } catch (err: any) {
    modalError.value = err.message || 'Terjadi kesalahan sistem.';
  } finally {
    isSubmitting.value = false;
  }
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loanDays.value = 3; // Reset to default 3 days
    handledBy.value = 'Admin Sirkulasi';
    modalError.value = '';
  }
});
</script>

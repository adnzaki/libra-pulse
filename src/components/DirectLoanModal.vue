<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden sm:overflow-y-auto">
    <div class="bg-white border-0 sm:border sm:border-slate-100 w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-xl sm:rounded-3xl rounded-none shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
      
      <!-- Sticky Header -->
      <div class="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div class="flex items-center gap-3">
          <div class="w-9 sm:w-10 h-9 sm:h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BookPlus class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-sm sm:text-base text-slate-900">Peminjaman Buku Langsung</h3>
            <p class="text-[11px] sm:text-xs text-slate-500">Scan QR kartu anggota & cari buku secara dinamis</p>
          </div>
        </div>
        <button 
          @click="closeModal" 
          type="button"
          aria-label="Tutup modal peminjaman"
          class="p-2 sm:p-2.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 active:scale-95 transition cursor-pointer flex items-center justify-center shrink-0"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Body (Scrollable) -->
      <div class="p-4 sm:p-6 space-y-4 text-xs flex-1 overflow-y-auto">

        <!-- Inline Modal Error Alert -->
        <div v-if="modalError" class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-2.5 animate-in fade-in">
          <div class="flex items-center gap-2">
            <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
            <span class="font-semibold leading-tight">{{ modalError }}</span>
          </div>
          <button @click="modalError = ''" type="button" class="text-rose-500 hover:text-rose-800 text-sm font-bold p-1 cursor-pointer">✕</button>
        </div>
        
        <!-- Step 1: Member Card Identification with QR Scanner -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="font-bold text-slate-700">1. Identifikasi Anggota (Scan QR / Nomor Kartu)</label>
            <button 
              type="button"
              @click="toggleCameraScanner"
              class="text-[11px] px-2.5 py-1 rounded-full font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              :class="isCameraActive ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'"
            >
              <Camera class="w-3.5 h-3.5" />
              <span>{{ isCameraActive ? 'Tutup Scanner' : 'Scan QR Kartu' }}</span>
            </button>
          </div>

          <!-- Embedded Camera QR Scanner Area -->
          <div v-if="isCameraActive" class="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2 animate-in fade-in">
            <div id="direct-loan-qr-reader" class="w-full max-h-52 rounded-xl overflow-hidden bg-slate-950 mx-auto"></div>
            <p class="text-[11px] text-slate-300">Arahkan kamera ke QR Code atau Barcode pada kartu anggota</p>
          </div>

          <div class="relative">
            <input 
              v-model="memberCardInput"
              @input="handleMemberCardInputChanged"
              type="text" 
              placeholder="Masukkan / scan nomor kartu anggota (cth: LIB-2026-XXXX)"
              class="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs font-mono font-semibold focus:outline-none focus:border-blue-500 uppercase"
            />
            <button 
              type="button"
              @click="toggleCameraScanner" 
              class="absolute right-3 top-2.5 text-slate-400 hover:text-blue-600 transition"
              title="Pindai QR Kartu"
            >
              <QrCode class="w-4 h-4" />
            </button>
          </div>

          <!-- Verified Member Info Pill -->
          <div v-if="matchedMember" class="p-3 rounded-2xl border flex items-center justify-between animate-in fade-in" :class="isMemberBlocked ? 'bg-rose-50 border-rose-200 text-rose-900' : (isMemberAtQuotaLimit ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900')">
            <div class="flex items-center gap-2.5">
              <img :src="matchedMember.avatar" class="w-8 h-8 rounded-full object-cover border" :class="isMemberBlocked ? 'border-rose-300' : (isMemberAtQuotaLimit ? 'border-amber-300' : 'border-emerald-300')" alt="Avatar" />
              <div>
                <div class="font-bold flex items-center gap-1.5">
                  {{ matchedMember.name }}
                  <span class="text-[10px] font-mono opacity-75">({{ matchedMember.cardNumber }})</span>
                  <span class="text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase" :class="isMatchedGuru ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'">
                    {{ isMatchedGuru ? '👨‍🏫 Guru' : '🎒 Siswa' }}
                  </span>
                </div>
                <div class="text-[10px] opacity-75">
                  Kuota: {{ memberTotalBorrowed }} / {{ memberMaxQuota }} Buku ({{ memberActiveLoansCount }} dipinjam, {{ memberActiveBookingsCount }} booking)
                </div>
              </div>
            </div>
            <span 
              class="text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0"
              :class="isMemberBlocked ? 'bg-rose-200 text-rose-800' : (isMemberAtQuotaLimit ? 'bg-amber-200 text-amber-800' : 'bg-emerald-200 text-emerald-800')"
            >
              {{ isMemberBlocked ? '⚠️ Suspend / Diblokir' : (isMemberAtQuotaLimit ? '⚠️ Kuota Penuh' : 'Anggota Aktif') }}
            </span>
          </div>

          <!-- Warning Banner if Member reached Max Borrowing Quota -->
          <div v-if="matchedMember && isMemberAtQuotaLimit" class="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-xs text-amber-950 space-y-1.5 animate-in fade-in">
            <div class="font-bold flex items-center gap-1.5 text-amber-800 text-sm">
              <AlertCircle class="w-4 h-4 text-amber-600 shrink-0" />
              <span>Batas Maksimal Kuota Buku Tercapai</span>
            </div>
            <p class="leading-relaxed">
              Anggota <strong class="text-slate-900">{{ matchedMember.name }}</strong> ({{ isMatchedGuru ? 'Dewan Guru' : 'Siswa' }}) telah mencapai batas maksimal peminjaman & reservasi <strong>{{ memberMaxQuota }} buku</strong>.
            </p>
            <div class="p-2 bg-white/90 rounded-xl border border-amber-200 text-[11px] text-slate-700 flex flex-wrap items-center gap-3">
              <span>Pinjaman Aktif: <strong>{{ memberActiveLoansCount }} buku</strong></span>
              <span>•</span>
              <span>Booking Aktif: <strong>{{ memberActiveBookingsCount }} buku</strong></span>
              <span>•</span>
              <span class="text-amber-800 font-bold">Total: {{ memberTotalBorrowed }} / {{ memberMaxQuota }} Buku</span>
            </div>
            <p class="text-[11px] text-amber-800 font-medium">
              ⛔ Anggota tidak dapat meminjam buku lagi sebelum mengembalikan buku pinjaman sebelumnya.
            </p>
          </div>

          <!-- Warning Banner if Member Suspended or has Overdue Loans -->
          <div v-if="matchedMember && isMemberBlocked" class="p-3.5 rounded-2xl bg-rose-100/80 border border-rose-300 text-xs text-rose-900 space-y-1">
            <div class="font-bold flex items-center gap-1.5 text-rose-800">
              <AlertCircle class="w-4 h-4 text-rose-600 shrink-0" />
              <span>Peminjaman Buku Ditolak</span>
            </div>
            <p v-if="matchedMember.isSuspended">
              <strong>Status:</strong> Akun ini sedang disuspend ({{ matchedMember.suspendReason || 'Keterlambatan pengembalian buku' }}).
              <span v-if="matchedMember.suspendedUntil" class="block font-mono text-[11px] text-rose-800 font-semibold mt-0.5">
                Masa sanksi berlaku hingga: {{ new Date(matchedMember.suspendedUntil).toLocaleDateString('id-ID') }}
              </span>
            </p>
            <p v-if="memberOverdueCount > 0 && !isMatchedGuru" class="font-semibold text-rose-800">
              ⚠️ Anggota memiliki {{ memberOverdueCount }} buku pinjaman yang sedang terlambat / melewati jatuh tempo. Harap kembalikan buku terlebih dahulu.
            </p>
          </div>
        </div>

        <!-- Step 2: Book Selection with 2-3s Debounced Search Dropdown -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="font-bold text-slate-700">2. Cari & Pilih Buku yang Dipinjam</label>
            <span v-if="selectedBookId" class="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <Check class="w-3 h-3" /> Buku Dipilih
            </span>
          </div>

          <!-- Book Search Input with Live Debounce Feedback -->
          <div class="space-y-1.5">
            <div class="relative">
              <input 
                v-model="bookSearchQuery"
                @input="handleBookSearchInput"
                @keydown.enter.prevent="executeImmediateSearch"
                type="text" 
                placeholder="Ketik judul buku / barcode / penulis..."
                class="w-full pl-9 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs font-medium focus:outline-none focus:border-blue-500"
              />
              <Search class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              
              <div class="absolute right-2 top-1.5 flex items-center gap-1">
                <button 
                  v-if="bookSearchQuery"
                  type="button"
                  @click="executeImmediateSearch"
                  class="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold transition cursor-pointer shadow-xs"
                >
                  Cari
                </button>
                <button 
                  v-if="bookSearchQuery"
                  type="button"
                  @click="clearBookSearch"
                  class="p-1 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              </div>
            </div>

            <!-- Debounce Pending State Indicator (2-3 seconds) -->
            <div v-if="isDebouncing" class="flex items-center gap-2 text-[11px] text-blue-600 font-medium px-2 py-1 bg-blue-50/70 rounded-xl animate-pulse">
              <Loader2 class="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Menunggu input selesai... melakukan pencarian dalam 2-3 detik</span>
            </div>

            <div v-else-if="isSearching" class="flex items-center gap-2 text-[11px] text-blue-600 font-medium px-2 py-1 bg-blue-50/70 rounded-xl">
              <Loader2 class="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Memproses pencarian buku...</span>
            </div>
          </div>

          <!-- Dynamic Search Results Dropdown List -->
          <div 
            v-if="hasSearched && isResultsDropdownOpen" 
            class="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg divide-y divide-slate-100 animate-in fade-in"
          >
            <div 
              v-for="b in searchResults" 
              :key="b.id"
              @click="b.availableCopies > 0 ? selectBook(b) : null"
              class="p-2.5 flex items-center gap-3 transition"
              :class="b.availableCopies > 0 ? 'hover:bg-blue-50/70 cursor-pointer' : 'opacity-50 bg-slate-50 cursor-not-allowed'"
            >
              <img :src="b.cover" class="w-10 h-14 object-cover rounded-lg shadow-xs shrink-0" alt="Cover" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-1">
                  <h5 class="font-bold text-slate-900 text-xs truncate">{{ b.title }}</h5>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold shrink-0">
                    {{ b.shelfCode }}
                  </span>
                </div>
                <div class="text-[11px] text-slate-500 truncate">{{ b.author }} ({{ b.year }})</div>
                <div class="flex items-center justify-between text-[10px] mt-1">
                  <span class="font-mono text-slate-400">Barcode: {{ b.barcode }}</span>
                  <span 
                    class="font-bold px-2 py-0.5 rounded-full"
                    :class="b.availableCopies > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'"
                  >
                    {{ b.availableCopies > 0 ? `Tersedia ${b.availableCopies} eks` : 'Stok Habis' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Empty Results Notice -->
            <div v-if="searchResults.length === 0" class="p-4 text-center text-slate-400 italic">
              Tidak ada buku yang cocok dengan kata kunci "{{ lastExecutedQuery }}".
            </div>
          </div>

          <!-- Chosen Book Preview Card -->
          <div v-if="chosenBook" class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex gap-3.5 animate-in fade-in">
            <img :src="chosenBook.cover" class="w-14 h-20 object-cover rounded-xl shadow-sm shrink-0" alt="Cover" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold">{{ chosenBook.shelfCode }}</span>
                <button 
                  type="button" 
                  @click="resetSelectedBook" 
                  class="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                >
                  Ganti Buku
                </button>
              </div>
              <h4 class="font-bold text-slate-900 text-sm mt-1 line-clamp-1">{{ chosenBook.title }}</h4>
              <p class="text-xs text-slate-500 truncate">{{ chosenBook.author }} • {{ chosenBook.publisher }}</p>
              <div class="text-[11px] text-emerald-600 font-bold mt-1">Stok saat ini: {{ chosenBook.availableCopies }} tersedia</div>
            </div>
          </div>
        </div>

        <!-- Loan Duration & Admin Handler -->
        <div class="space-y-3 pt-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block font-bold text-xs sm:text-sm text-slate-700">Durasi Peminjaman (1 - {{ maxLoanDaysAllowed }} Hari)</label>
                <span class="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">{{ loanDays }} Hari</span>
              </div>
              <div class="flex items-center gap-2">
                <input 
                  v-model.number="loanDays" 
                  type="number" 
                  min="1" 
                  :max="maxLoanDaysAllowed" 
                  class="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-center font-bold focus:outline-none focus:border-blue-500 text-sm"
                />
                <div class="flex items-center gap-1 flex-wrap">
                  <button 
                    v-for="d in quickLoanDayOptions" 
                    :key="d" 
                    type="button"
                    @click="loanDays = d"
                    class="px-2 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer"
                    :class="loanDays === d ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
                  >
                    {{ d }}h{{ (isMatchedGuru ? d === 14 : d === 3) ? '*' : '' }}
                  </button>
                </div>
              </div>
              <p class="text-[10px] text-slate-400 mt-1">
                {{ isMatchedGuru ? 'Benefit Guru: Durasi sirkulasi hingga maksimal 14 hari.' : 'Regulasi Siswa: Durasi pinjam maksimal 7 hari.' }}
              </p>
            </div>

            <div>
              <label class="block font-bold text-xs sm:text-sm text-slate-700 mb-1">Petugas Sirkulasi</label>
              <input 
                v-model="handledBy" 
                type="text" 
                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium text-xs sm:text-sm"
              />
            </div>
          </div>

          <!-- Due Date Preview Box -->
          <div class="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs text-blue-900">
            <span class="font-medium text-slate-600">Estimasi Jatuh Tempo:</span>
            <span class="font-bold text-blue-700">{{ dueDateFormatted }}</span>
          </div>
        </div>

      </div>

      <!-- Sticky Footer -->
      <div class="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-end gap-3 shrink-0 sticky bottom-0 z-20">
        <button 
          type="button" 
          @click="closeModal"
          class="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
        >
          Batal
        </button>
        <button 
          type="button"
          @click="handleIssueLoan"
          :disabled="!memberCardInput || !selectedBookId || isSubmitting || isMemberBlocked || isMemberAtQuotaLimit || loanDays < 1 || loanDays > maxLoanDaysAllowed"
          class="flex-1 sm:flex-initial px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check class="w-4 h-4" />
          {{ isSubmitting ? 'Memproses Transaksi...' : 'Konfirmasi Peminjaman' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, nextTick, toRef } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import type { Book, Member } from '../types.js';
import { BookPlus, X, Check, Camera, QrCode, Search, AlertCircle, Loader2 } from 'lucide-vue-next';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { useModalBack } from '../composables/useModalBack.js';

const props = defineProps<{
  isOpen: boolean;
  preselectedCard?: string;
}>();

const emit = defineEmits(['close', 'issued']);

useModalBack(toRef(props, 'isOpen'), () => emit('close'), 'direct_loan_modal');

const store = useLibraryStore();
const memberCardInput = ref(props.preselectedCard || '');
const selectedBookId = ref('');
const loanDays = ref(3); // Default 3 hari sesuai regulasi
const handledBy = ref('Admin Sirkulasi');
const isSubmitting = ref(false);
const modalError = ref('');

// QR Camera Scanner
const isCameraActive = ref(false);
let html5QrScanner: Html5Qrcode | null = null;

// Book Search & 2-3s Debounce
const bookSearchQuery = ref('');
const searchResults = ref<Book[]>([]);
const isSearching = ref(false);
const isDebouncing = ref(false);
const hasSearched = ref(false);
const isResultsDropdownOpen = ref(false);
const lastExecutedQuery = ref('');
let debounceTimer: any = null;

const matchedMember = computed<Member | null>(() => {
  const input = memberCardInput.value.trim().toUpperCase();
  if (input.length >= 3) {
    return store.members.find(m => m.cardNumber.toUpperCase() === input || m.id.toUpperCase() === input) || null;
  }
  return null;
});

const isMatchedGuru = computed(() => matchedMember.value?.memberType === 'guru');
const memberMaxQuota = computed(() => isMatchedGuru.value ? 6 : 3);

const memberActiveLoansCount = computed(() => {
  if (!matchedMember.value) return 0;
  const memId = matchedMember.value.id;
  const cardNum = matchedMember.value.cardNumber;
  return store.loans.filter(l => 
    (l.memberId === memId || l.memberCardNumber === cardNum) && (l.status === 'active' || l.status === 'overdue')
  ).length;
});

const memberActiveBookingsCount = computed(() => {
  if (!matchedMember.value) return 0;
  const memId = matchedMember.value.id;
  const cardNum = matchedMember.value.cardNumber;
  return store.bookings.filter(b => 
    (b.memberId === memId || b.memberCardNumber === cardNum) && b.status === 'active_hold'
  ).length;
});

const memberTotalBorrowed = computed(() => {
  return memberActiveLoansCount.value + memberActiveBookingsCount.value;
});

const isMemberAtQuotaLimit = computed(() => {
  if (!matchedMember.value) return false;
  return memberTotalBorrowed.value >= memberMaxQuota.value;
});

const maxLoanDaysAllowed = computed(() => isMatchedGuru.value ? 14 : 7);
const quickLoanDayOptions = computed(() => isMatchedGuru.value ? [1, 3, 7, 10, 14] : [1, 2, 3, 5, 7]);

const memberOverdueCount = computed(() => {
  if (!matchedMember.value) return 0;
  const memId = matchedMember.value.id;
  const cardNum = matchedMember.value.cardNumber;
  return store.loans.filter(l => 
    (l.memberId === memId || l.memberCardNumber === cardNum) && l.status === 'overdue'
  ).length;
});

const isMemberBlocked = computed(() => {
  if (matchedMember.value?.isSuspended) return true;
  // Akun berstatus Guru dikecualikan dari sanksi auto-suspend / blokir keterlambatan
  if (!isMatchedGuru.value && memberOverdueCount.value > 0) return true;
  return false;
});

const dueDateFormatted = computed(() => {
  const days = Math.min(maxLoanDaysAllowed.value, Math.max(1, Number(loanDays.value) || (isMatchedGuru.value ? 14 : 3)));
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
});

const chosenBook = computed(() => {
  return store.books.find(b => b.id === selectedBookId.value) || null;
});

const getActiveLoansCount = (memberId?: string) => {
  if (!memberId) return 0;
  return store.loans.filter(l => l.memberId === memberId && (l.status === 'active' || l.status === 'overdue')).length;
};

const handleMemberCardInputChanged = () => {
  modalError.value = '';
};

const toggleCameraScanner = async () => {
  modalError.value = '';
  if (isCameraActive.value) {
    await stopCamera();
  } else {
    await startCamera();
  }
};

const startCamera = async () => {
  try {
    isCameraActive.value = true;
    await nextTick();
    html5QrScanner = new Html5Qrcode('direct-loan-qr-reader');
    await html5QrScanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (decodedText) => {
        memberCardInput.value = decodedText.trim();
        modalError.value = '';
        stopCamera();
        nextTick(() => {
          if (matchedMember.value) {
            if (isMemberAtQuotaLimit.value) {
              const roleTitle = isMatchedGuru.value ? 'Guru' : 'Siswa';
              store.showToast(`⚠️ ${roleTitle} ${matchedMember.value.name} telah mencapai batas limit pinjam (${memberMaxQuota.value} buku)!`);
            } else {
              store.showToast(`Kartu member ${decodedText} berhasil dipindai!`);
            }
          } else {
            store.showToast(`Kartu member ${decodedText} berhasil dipindai!`);
          }
        });
      },
      () => {}
    );
  } catch (err: any) {
    console.error('Camera error', err);
    modalError.value = 'Tidak dapat membuka kamera. Pastikan izin kamera telah diberikan.';
    isCameraActive.value = false;
  }
};

const stopCamera = async () => {
  if (html5QrScanner && isCameraActive.value) {
    try {
      await html5QrScanner.stop();
      html5QrScanner = null;
    } catch (err) {
      console.error(err);
    }
  }
  isCameraActive.value = false;
};

// Book search debouncing: 2.5 seconds debounce
const handleBookSearchInput = () => {
  modalError.value = '';
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  const q = bookSearchQuery.value.trim();
  if (!q) {
    searchResults.value = [];
    isDebouncing.value = false;
    isSearching.value = false;
    hasSearched.value = false;
    isResultsDropdownOpen.value = false;
    return;
  }

  isDebouncing.value = true;
  debounceTimer = setTimeout(() => {
    runBookSearch(q);
  }, 2500); // 2.5 seconds debounce
};

const executeImmediateSearch = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  const q = bookSearchQuery.value.trim();
  if (q) {
    runBookSearch(q);
  }
};

const runBookSearch = (q: string) => {
  isDebouncing.value = false;
  isSearching.value = true;
  lastExecutedQuery.value = q;

  const lowerQ = q.toLowerCase();
  const results = store.books.filter(b => 
    b.title.toLowerCase().includes(lowerQ) ||
    b.author.toLowerCase().includes(lowerQ) ||
    b.barcode.toLowerCase().includes(lowerQ) ||
    b.shelfCode.toLowerCase().includes(lowerQ) ||
    b.category.toLowerCase().includes(lowerQ)
  );

  searchResults.value = results;
  isSearching.value = false;
  hasSearched.value = true;
  isResultsDropdownOpen.value = true;
};

const selectBook = (book: Book) => {
  selectedBookId.value = book.id;
  bookSearchQuery.value = book.title;
  isResultsDropdownOpen.value = false;
};

const resetSelectedBook = () => {
  selectedBookId.value = '';
  bookSearchQuery.value = '';
  isResultsDropdownOpen.value = false;
  hasSearched.value = false;
};

const clearBookSearch = () => {
  bookSearchQuery.value = '';
  searchResults.value = [];
  isResultsDropdownOpen.value = false;
  hasSearched.value = false;
  if (debounceTimer) clearTimeout(debounceTimer);
  isDebouncing.value = false;
};

const closeModal = () => {
  stopCamera();
  if (debounceTimer) clearTimeout(debounceTimer);
  modalError.value = '';
  emit('close');
};

const handleIssueLoan = async () => {
  modalError.value = '';
  const cleanCard = memberCardInput.value.trim();
  if (!cleanCard) {
    modalError.value = 'Silakan masukkan atau scan nomor kartu member.';
    return;
  }
  if (!selectedBookId.value) {
    modalError.value = 'Silakan pilih buku yang akan dipinjam.';
    return;
  }
  if (isMemberBlocked.value) {
    modalError.value = 'Peminjaman ditolak: Kartu anggota ini berstatus DISUSPEND atau memiliki buku yang sedang terlambat.';
    return;
  }
  if (isMemberAtQuotaLimit.value) {
    const roleTitle = isMatchedGuru.value ? 'Dewan Guru' : 'Siswa';
    modalError.value = `Peminjaman ditolak: ${roleTitle} (${matchedMember.value?.name}) telah mencapai batas kuota peminjaman (${memberMaxQuota.value} buku). Selesaikan pengembalian buku sebelumnya terlebih dahulu.`;
    return;
  }
  if (loanDays.value < 1 || loanDays.value > maxLoanDaysAllowed.value) {
    modalError.value = `Durasi peminjaman untuk ${isMatchedGuru.value ? 'Guru' : 'Siswa'} harus antara 1 sampai ${maxLoanDaysAllowed.value} hari.`;
    return;
  }

  isSubmitting.value = true;
  try {
    const res = await store.issueDirectLoan(
      selectedBookId.value,
      cleanCard,
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
      closeModal();
    } else {
      modalError.value = res.error || 'Gagal memproses peminjaman buku.';
    }
  } catch (err: any) {
    modalError.value = err.message || 'Terjadi kesalahan sistem saat peminjaman.';
  } finally {
    isSubmitting.value = false;
  }
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    memberCardInput.value = props.preselectedCard || '';
    modalError.value = '';
    selectedBookId.value = '';
    loanDays.value = 3; // Reset to 3 days default
    handledBy.value = 'Admin Sirkulasi';
    bookSearchQuery.value = '';
    searchResults.value = [];
    hasSearched.value = false;
  } else {
    stopCamera();
  }
});

watch(isMatchedGuru, (newIsGuru) => {
  if (newIsGuru) {
    if (loanDays.value <= 3) {
      loanDays.value = 14;
    }
  } else {
    if (loanDays.value > 7) {
      loanDays.value = 3;
    }
  }
});

onBeforeUnmount(() => {
  stopCamera();
  if (debounceTimer) clearTimeout(debounceTimer);
});
</script>



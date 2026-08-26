<template>
  <div class="space-y-6">
    
    <!-- Top Header Bento Card -->
    <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-blue-600 text-[10px] font-bold uppercase tracking-widest">
          <QrCode class="w-3.5 h-3.5" />
          Sistem Smart Member Card Digital
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Kartu Member & Scanner Sirkulasi
        </h1>
        <p class="text-xs text-slate-500 mt-0.5">
          Peminjaman buku kilat dengan scan kartu member QR tanpa perlu login manual.
        </p>
      </div>

      <!-- Quick Switcher to view another member's card -->
      <div class="flex items-center gap-2">
        <label class="text-xs text-slate-500 font-medium">Pilih Kartu:</label>
        <select 
          v-model="selectedMemberId" 
          class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-full text-slate-700 text-xs focus:outline-none focus:border-blue-500 font-semibold"
        >
          <option v-for="m in store.members.filter(mem => mem.role === 'member')" :key="m.id" :value="m.id">
            {{ m.name }} ({{ m.cardNumber }})
          </option>
        </select>
      </div>
    </div>

    <!-- Main Bento Grid: Left Digital Member Card, Right Scanner & Quick Loan -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Left Column: The Digital Card -->
      <div class="lg:col-span-5 space-y-4">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tampilan Kartu Member Digital</div>

        <!-- The Physical-style Hologram Card -->
        <div 
          id="member-card-canvas"
          class="relative w-full aspect-[1.586/1] rounded-3xl p-6 sm:p-7 shadow-lg overflow-hidden flex flex-col justify-between border transition duration-300"
          :class="activeMember?.isSuspended 
            ? 'bg-gradient-to-br from-rose-900 via-slate-900 to-rose-950 border-rose-500/40 text-rose-100 shadow-rose-950/20' 
            : 'bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 border-slate-700 text-slate-100 shadow-slate-900/20'"
        >
          <!-- Holographic Shimmer Accents -->
          <div class="absolute -right-16 -top-16 w-56 h-56 bg-blue-500/15 rounded-full blur-2xl pointer-events-none"></div>
          <div class="absolute -left-16 -bottom-16 w-56 h-56 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none"></div>

          <!-- Top Card Row: Library Logo & Chip -->
          <div class="flex items-start justify-between relative z-10">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center shadow-sm">
                <BookOpen class="w-4 h-4 text-white" />
              </div>
              <div>
                <div class="font-bold text-sm tracking-tight text-white">PustakaModern</div>
                <div class="text-[9px] uppercase tracking-widest text-blue-300 font-mono">Digital Member Pass</div>
              </div>
            </div>

            <!-- Status Pill on Card -->
            <div 
              class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1.5"
              :class="activeMember?.isSuspended ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              {{ activeMember?.isSuspended ? 'DISUSPEND' : 'AKTIF' }}
            </div>
          </div>

          <!-- Middle Card Row: Member Details & QR Code -->
          <div class="flex items-center justify-between gap-4 my-2 relative z-10">
            <div class="flex items-center gap-3 min-w-0">
              <img 
                :src="activeMember?.avatar" 
                class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 shadow-md shrink-0" 
                :class="activeMember?.isSuspended ? 'border-rose-400' : 'border-blue-400'"
                alt="Member Photo" 
              />
              <div class="min-w-0">
                <h3 class="font-bold text-base sm:text-lg truncate tracking-tight text-white">{{ activeMember?.name }}</h3>
                <div class="text-[11px] text-slate-300 truncate">{{ activeMember?.email }}</div>
                <div class="text-[10px] text-blue-300 mt-0.5">Bergabung: {{ activeMember?.joinDate }}</div>
              </div>
            </div>

            <!-- Dynamic QR Code rendered via canvas -->
            <div class="bg-white p-2 rounded-2xl shadow-lg shrink-0 flex flex-col items-center">
              <canvas ref="qrCanvas" class="w-16 h-16 sm:w-18 sm:h-18"></canvas>
            </div>
          </div>

          <!-- Bottom Card Row: Card Number & Barcode String -->
          <div class="flex items-end justify-between pt-2 border-t border-white/10 relative z-10">
            <div>
              <div class="text-[9px] uppercase tracking-widest text-slate-400 font-mono">Nomor Kartu Anggota</div>
              <div class="font-mono font-extrabold text-sm sm:text-base text-amber-300 tracking-wider">
                {{ activeMember?.cardNumber }}
              </div>
            </div>

            <div class="text-right">
              <div class="text-[9px] uppercase tracking-widest text-slate-400 font-mono">Pinjaman Aktif</div>
              <div class="font-bold text-xs text-white">
                {{ getActiveLoansCount(activeMember?.id) }} Buku
              </div>
            </div>
          </div>

        </div>

        <!-- Suspend Warning Notice if Suspended -->
        <div v-if="activeMember?.isSuspended" class="p-4 rounded-3xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1.5">
          <div class="font-bold flex items-center gap-1.5 text-rose-900">
            <AlertTriangle class="w-4 h-4 shrink-0 text-rose-600" />
            Kartu Member Ini Sedang Disuspend
          </div>
          <p>{{ activeMember?.suspendReason || 'Keterlambatan pengembalian buku.' }}</p>
          <p class="font-semibold text-rose-700">
            Masa sanksi berlaku hingga: {{ new Date(activeMember?.suspendedUntil || '').toLocaleDateString('id-ID') }}
          </p>
        </div>

        <!-- Action Tools for Member Card -->
        <div class="grid grid-cols-2 gap-2 text-xs">
          <button 
            @click="copyCardNumber"
            class="py-2.5 px-3 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Copy class="w-3.5 h-3.5 text-blue-600" />
            Salin No. Kartu
          </button>
          <button 
            @click="printCard"
            class="py-2.5 px-3 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Printer class="w-3.5 h-3.5 text-blue-600" />
            Cetak Kartu Member
          </button>
        </div>

        <!-- Member Borrowing History & Active Loans (Bento Card) -->
        <div class="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-800">Buku Sedang Dipinjam</span>
            <span class="text-blue-600 font-mono font-bold">{{ getMemberLoans(activeMember?.id).length }} Buku</span>
          </div>

          <div v-if="getMemberLoans(activeMember?.id).length > 0" class="space-y-2">
            <div 
              v-for="loan in getMemberLoans(activeMember?.id)" 
              :key="loan.id"
              class="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
            >
              <div class="min-w-0 pr-2">
                <div class="font-bold text-slate-800 truncate">{{ loan.bookTitle }}</div>
                <div class="text-[10px] text-slate-400">Jatuh Tempo: {{ new Date(loan.dueDate).toLocaleDateString('id-ID') }}</div>
              </div>
              <span 
                class="text-[10px] px-2.5 py-0.5 rounded-full font-bold shrink-0"
                :class="loan.status === 'overdue' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700 border border-blue-200'"
              >
                {{ loan.status === 'overdue' ? '⚠️ Telat' : 'Dipinjam' }}
              </span>
            </div>
          </div>
          <div v-else class="text-xs text-slate-400 italic text-center py-2">
            Tidak ada pinjaman buku aktif saat ini.
          </div>
        </div>

      </div>

      <!-- Right Column: Integrated Scanner & Quick Sirkulasi Desk -->
      <div class="lg:col-span-7 space-y-6">
        <MemberCardScanner @selected="handleScannerSelected" />

        <!-- Quick Direct Borrowing Trigger Bento Card -->
        <div class="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookPlus class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-bold text-base text-slate-900">Peminjaman Langsung di Counter</h3>
                <p class="text-xs text-slate-500">Lakukan peminjaman kilat untuk kartu terpilih</p>
              </div>
            </div>
            <button 
              @click="openDirectLoanModal"
              class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs transition shadow-md shadow-blue-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus class="w-4 h-4" />
              Pinjam Buku Sekarang
            </button>
          </div>

          <p class="text-xs text-slate-500 leading-relaxed">
            Petugas atau anggota dapat langsung memindai barcode buku yang diambil dari rak dan memasangkannya dengan kartu member ini tanpa memerlukan kata sandi.
          </p>
        </div>
      </div>

    </div>

    <!-- Direct Loan Modal -->
    <DirectLoanModal 
      :is-open="isDirectLoanOpen"
      :preselected-card="activeMember?.cardNumber"
      @close="isDirectLoanOpen = false"
      @issued="handleLoanIssued"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import type { Member } from '../types.js';
import QRCode from 'qrcode';
import MemberCardScanner from '../components/MemberCardScanner.vue';
import DirectLoanModal from '../components/DirectLoanModal.vue';
import { 
  QrCode, BookOpen, AlertTriangle, Copy, Printer, 
  BookPlus, Plus 
} from 'lucide-vue-next';

const store = useLibraryStore();
const selectedMemberId = ref(store.currentUser?.id || store.members.find(m => m.role === 'member')?.id || store.members[0]?.id || '');
const qrCanvas = ref<HTMLCanvasElement | null>(null);
const isDirectLoanOpen = ref(false);

const activeMember = computed(() => {
  if (selectedMemberId.value) {
    const found = store.members.find(m => m.id === selectedMemberId.value);
    if (found) return found;
  }
  return store.currentUser || store.members.find(m => m.role === 'member') || store.members[0] || null;
});

const generateQr = async () => {
  await nextTick();
  if (qrCanvas.value && activeMember.value) {
    try {
      await QRCode.toCanvas(qrCanvas.value, activeMember.value.cardNumber, {
        width: 100,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
    } catch (err) {
      console.error('Error generating QR', err);
    }
  }
};

watch(activeMember, () => {
  generateQr();
}, { immediate: true });

onMounted(() => {
  generateQr();
});

const getActiveLoansCount = (memberId?: string) => {
  if (!memberId) return 0;
  return store.loans.filter(l => l.memberId === memberId && (l.status === 'active' || l.status === 'overdue')).length;
};

const getMemberLoans = (memberId?: string) => {
  if (!memberId) return [];
  return store.loans.filter(l => l.memberId === memberId && (l.status === 'active' || l.status === 'overdue'));
};

const copyCardNumber = () => {
  if (activeMember.value) {
    navigator.clipboard.writeText(activeMember.value.cardNumber);
    store.showToast(`Nomor kartu ${activeMember.value.cardNumber} disalin ke clipboard!`);
  }
};

const printCard = () => {
  window.print();
};

const handleScannerSelected = (member: Member) => {
  selectedMemberId.value = member.id;
  store.showToast(`Kartu ${member.name} berhasil dipilih!`);
};

const openDirectLoanModal = () => {
  isDirectLoanOpen.value = true;
};

const handleLoanIssued = () => {
  // auto refreshed
};
</script>


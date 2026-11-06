<template>
  <div class="bg-white border border-slate-100 rounded-3xl p-4 sm:p-6 shadow-sm space-y-5 overflow-hidden">
    
    <!-- Title & Toggle (Responsive, Zero Overflow on Mobile) -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/60">
          <QrCode class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <h3 class="font-extrabold text-base text-slate-900 tracking-tight truncate">Scan Kartu Member</h3>
          <p class="text-xs text-slate-500 truncate">Peminjaman kilat tanpa login manual</p>
        </div>
      </div>

      <div class="flex rounded-2xl sm:rounded-full bg-slate-100 p-1 text-xs shrink-0 w-full sm:w-auto">
        <button 
          @click="mode = 'camera'"
          type="button"
          class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl sm:rounded-full font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          :class="mode === 'camera' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
        >
          <Camera class="w-3.5 h-3.5" />
          <span>Kamera QR</span>
        </button>
        <button 
          @click="mode = 'manual'"
          type="button"
          class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl sm:rounded-full font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          :class="mode === 'manual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
        >
          <Keyboard class="w-3.5 h-3.5" />
          <span>Input Manual</span>
        </button>
      </div>
    </div>

    <!-- Camera Mode -->
    <div v-if="mode === 'camera'" class="space-y-3">
      <!-- Inactive Camera Box (Normal Card Placeholder) -->
      <div class="bg-slate-900 rounded-2xl border border-slate-200 aspect-video flex flex-col items-center justify-center p-4 text-center space-y-3">
        <Camera class="w-10 h-10 text-slate-500 animate-pulse" />
        <p class="text-xs text-slate-300 max-w-xs">Arahkan kamera perangkat ke QR Code pada kartu member fisik atau digital</p>
        <button 
          @click="startCamera"
          type="button"
          class="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Sparkles class="w-3.5 h-3.5" />
          <span>{{ cameraActive ? 'Kamera Aktif...' : 'Aktifkan Scanner Kamera' }}</span>
        </button>
      </div>

      <!-- Teleport Fullscreen Camera to Body: Truly 100% of the entire viewport! -->
      <Teleport to="body">
        <div 
          v-if="cameraActive" 
          class="fixed inset-0 z-[99999] bg-slate-950 w-full h-[100dvh] flex flex-col justify-between overflow-hidden"
          style="position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100dvh !important;"
        >
          <!-- Scanner Video Container Fullscreen -->
          <div id="qr-reader" class="absolute inset-0 w-full h-full"></div>

          <!-- Top Bar Header -->
          <div class="absolute top-0 left-0 right-0 p-4 pt-6 bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-transparent z-20 flex items-center justify-between gap-3 text-white">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-9 h-9 rounded-xl bg-blue-600/80 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-md">
                <Scan class="w-5 h-5 animate-pulse text-cyan-300" />
              </div>
              <div class="min-w-0">
                <h4 class="font-extrabold text-sm sm:text-base tracking-tight text-white truncate">Pindai QR Kartu Anggota</h4>
                <p class="text-[11px] sm:text-xs text-slate-300 truncate">Arahkan kamera ke QR Code atau Barcode kartu</p>
              </div>
            </div>
            <button 
              @click="stopCamera"
              type="button"
              class="w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center transition cursor-pointer active:scale-95 shadow-md border border-white/10 shrink-0"
              title="Tutup Kamera"
            >
              <X class="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          <!-- Center Target Viewfinder Frame with Neon Corners & Animated Scan Line -->
          <div class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div class="relative w-72 h-72 sm:w-80 sm:h-80 rounded-3xl border-2 border-white/20">
              <!-- Corner brackets glowing neon -->
              <div class="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-2xl shadow-[0_0_15px_rgba(96,165,250,0.9)]"></div>
              <div class="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-2xl shadow-[0_0_15px_rgba(96,165,250,0.9)]"></div>
              <div class="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-2xl shadow-[0_0_15px_rgba(96,165,250,0.9)]"></div>
              <div class="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-2xl shadow-[0_0_15px_rgba(96,165,250,0.9)]"></div>

              <!-- Animated Laser Scan line -->
              <div class="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse shadow-[0_0_12px_#22d3ee] top-1/2 -translate-y-1/2"></div>
            </div>
          </div>

          <!-- Bottom Control Bar -->
          <div class="absolute bottom-0 left-0 right-0 p-5 pb-8 sm:pb-6 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent z-20 flex flex-col items-center gap-3">
            <p class="text-xs sm:text-sm text-slate-200 font-medium text-center">
              Posisikan QR Code kartu di tengah kotak pembidik
            </p>
            <div class="flex items-center gap-3 w-full max-w-sm">
              <button 
                @click="mode = 'manual'; stopCamera()"
                type="button"
                class="flex-1 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/10 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <Keyboard class="w-4 h-4" />
                <span>Ketik Manual</span>
              </button>
              <button 
                @click="stopCamera"
                type="button"
                class="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <X class="w-4 h-4" />
                <span>Tutup Scanner</span>
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <p class="text-[11px] text-slate-400 text-center">Mendukung pembacaan QR Code kartu member secara real-time.</p>
    </div>

    <!-- Manual Quick Scan Mode -->
    <div v-else class="space-y-4">
      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1.5">Nomor Kartu Member / Kode Barcode</label>
        <div class="flex flex-col sm:flex-row gap-2">
          <input 
            v-model="inputCardNumber" 
            @keyup.enter="handleManualLookup"
            type="text" 
            placeholder="Contoh: LIB-2026-8801"
            class="flex-1 min-w-0 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono font-bold"
          />
          <button 
            @click="handleManualLookup"
            :disabled="isLoading"
            type="button"
            class="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-2xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-blue-200 shrink-0 disabled:opacity-60"
          >
            <Scan class="w-4 h-4" />
            <span>{{ isLoading ? 'Mengecek...' : 'Validasi Kartu' }}</span>
          </button>
        </div>
      </div>

      <!-- Type-to-Search Member Picker for Admin (Zero Heavy DOM Dumps) -->
      <div v-if="store.isAdmin" class="space-y-2.5 pt-3 border-t border-slate-100">
        <!-- Quick Select Member List with Pagination & Instant Search -->
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            PILIH CEPAT ANGGOTA TERDAFTAR:
          </span>
          <span class="text-[10px] text-slate-400 font-medium font-mono">
            {{ totalMemberCount }} Anggota
          </span>
        </div>

        <!-- Search Input -->
        <div class="relative">
          <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input 
            v-model="memberSearchQuery"
            type="text"
            placeholder="Cari nama siswa/guru, nomor kartu (LIB-...), atau NIS..."
            class="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition"
          />
          <button 
            v-if="memberSearchQuery"
            @click="memberSearchQuery = ''"
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            aria-label="Bersihkan pencarian"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Paginated Member List -->
        <div v-if="paginatedMembers.length > 0" class="space-y-2.5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button 
              v-for="m in paginatedMembers" 
              :key="m.id"
              @click="selectQuickMember(m.cardNumber)"
              type="button"
              class="p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer active:scale-[0.99] group shadow-xs"
              :class="m.isSuspended ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300' : 'bg-slate-50/70 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'"
            >
              <div class="min-w-0 pr-2">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-bold text-slate-800 truncate group-hover:text-blue-600 transition">{{ m.name }}</span>
                  <span 
                    class="text-[9px] px-1.5 py-0.5 rounded-md font-bold shrink-0"
                    :class="m.memberType === 'guru' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'"
                  >
                    {{ m.memberType === 'guru' ? 'GURU' : 'SISWA' }}
                  </span>
                </div>
                <div class="text-[10px] font-mono text-blue-600 font-semibold mt-0.5">{{ m.cardNumber }}</div>
              </div>
              <span 
                class="text-[10px] px-2.5 py-0.5 rounded-full font-bold shrink-0"
                :class="m.isSuspended ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'"
              >
                {{ m.isSuspended ? 'SUSPEND' : 'AKTIF' }}
              </span>
            </button>
          </div>

          <!-- Pagination Navigation -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1.5 px-1 text-xs">
            <div class="flex items-center gap-2 text-[11px] text-slate-500 font-medium flex-wrap">
              <span>{{ ((currentPage - 1) * itemsPerPage) + 1 }}-{{ Math.min(currentPage * itemsPerPage, matchedMembers.length) }}</span>
              <span class="text-slate-400">dari</span>
              <span class="font-bold text-slate-700">{{ matchedMembers.length }}</span>
              <span class="text-slate-400">anggota</span>
              <div class="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <span class="text-[10px] text-slate-400">Per hal:</span>
                <div class="w-20">
                  <CustomSelect 
                    v-model="itemsPerPage"
                    :options="perPageOptions"
                    variant="compact"
                    size="sm"
                    placement="top"
                  />
                </div>
              </div>
            </div>

            <div v-if="totalPages > 1" class="flex items-center gap-1.5 self-end sm:self-auto">
              <button 
                type="button"
                @click="currentPage = 1"
                :disabled="currentPage <= 1"
                class="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Halaman Pertama"
              >
                <ChevronsLeft class="w-3.5 h-3.5" />
              </button>
              <button 
                type="button"
                @click="prevPage"
                :disabled="currentPage <= 1"
                class="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft class="w-3.5 h-3.5" />
              </button>

              <span class="text-[11px] font-bold text-slate-700 px-1.5 font-mono bg-slate-100 py-0.5 rounded-lg border border-slate-200">
                {{ currentPage }} / {{ totalPages }}
              </span>

              <button 
                type="button"
                @click="nextPage"
                :disabled="currentPage >= totalPages"
                class="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Halaman Selanjutnya"
              >
                <ChevronRight class="w-3.5 h-3.5" />
              </button>
              <button 
                type="button"
                @click="currentPage = totalPages"
                :disabled="currentPage >= totalPages"
                class="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Halaman Terakhir"
              >
                <ChevronsRight class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- No Results Found -->
        <div 
          v-else 
          class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-center text-xs text-amber-800 space-y-1.5"
        >
          <p class="font-bold">Tidak ada anggota yang cocok</p>
          <p class="text-[11px] text-amber-700">Tidak ditemukan anggota dengan kata kunci "{{ memberSearchQuery }}".</p>
          <button 
            type="button"
            @click="memberSearchQuery = ''"
            class="text-[11px] font-bold text-blue-600 hover:underline pt-0.5 cursor-pointer block mx-auto"
          >
            Tampilkan Semua Anggota
          </button>
        </div>
      </div>
    </div>

    <!-- Scanned Member Result Card (Bento Sub-Card) -->
    <div v-if="scannedResult" class="p-4 sm:p-5 rounded-3xl border animate-in fade-in duration-200 shadow-sm" :class="scannedResult.member.isSuspended ? 'bg-rose-50/50 border-rose-200' : 'bg-blue-50/40 border-blue-100'">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3.5 min-w-0">
          <img 
            :src="scannedResult.member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'" 
            @error="(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'; }"
            class="w-12 h-12 rounded-2xl object-cover border-2 shadow-sm shrink-0" 
            :class="scannedResult.member.isSuspended ? 'border-rose-400' : 'border-blue-400'" 
            alt="Avatar" 
          />
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h4 class="font-bold text-slate-900 text-sm truncate">{{ scannedResult.member.name }}</h4>
              <span class="text-[9px] font-mono px-2.5 py-0.5 rounded-full font-bold shrink-0" :class="scannedResult.member.isSuspended ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'">
                {{ scannedResult.member.isSuspended ? 'AKUN DISUSPEND' : 'MEMBER AKTIF' }}
              </span>
            </div>
            <div class="text-xs text-blue-600 font-mono font-semibold mt-0.5 truncate">{{ scannedResult.member.cardNumber }} • HP: {{ scannedResult.member.phone || '-' }}</div>
            <div class="text-xs text-slate-500 mt-1">
              Pinjaman Aktif: <strong class="text-slate-800">{{ scannedResult.activeLoans?.length || 0 }}</strong> • Booking Aktif: <strong class="text-slate-800">{{ scannedResult.activeBookings?.length || 0 }}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Suspend Warning Notice -->
      <div v-if="scannedResult.member.isSuspended" class="mt-3.5 p-3 rounded-2xl bg-rose-100/80 border border-rose-200 text-xs text-rose-900 space-y-1">
        <div class="font-bold flex items-center gap-1.5">
          <AlertTriangle class="w-4 h-4 text-rose-600 shrink-0" />
          <span>Peringatan: Anggota ini sedang dalam status Suspend</span>
        </div>
        <p class="text-[11px] text-rose-700">{{ scannedResult.member.suspendReason || 'Keterlambatan pengembalian buku.' }}</p>
        <p class="text-[11px] font-bold text-rose-800">Suspend berlaku sampai: {{ new Date(scannedResult.member.suspendedUntil || '').toLocaleDateString('id-ID') }}</p>
      </div>

      <div class="mt-4 flex gap-2">
        <button 
          @click="handleSelectMember(scannedResult.member)"
          :disabled="isSubmittingAction"
          type="button"
          class="flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 disabled:opacity-75"
          :class="scannedResult.member.isSuspended ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'"
        >
          <Loader2 v-if="isSubmittingAction" class="w-4 h-4 animate-spin text-white" />
          <UserCheck v-else class="w-4 h-4" />
          <span>{{ isSubmittingAction ? 'Memproses Konfirmasi...' : actionButtonText }}</span>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import { Html5Qrcode } from 'html5-qrcode';
import CustomSelect from './CustomSelect.vue';
import { 
  QrCode, Camera, Keyboard, Sparkles, Scan, 
  AlertTriangle, UserCheck, Search, X, Loader2,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  actionButtonText?: string;
  autoConfirm?: boolean;
}>(), {
  actionButtonText: 'Konfirmasi Akses & Sirkulasi',
  autoConfirm: false
});

const emit = defineEmits(['selected', 'scan-success']);

const isSubmittingAction = ref(false);

const handleSelectMember = async (member: any) => {
  if (!member || isSubmittingAction.value) return;
  isSubmittingAction.value = true;
  try {
    emit('selected', member);
  } finally {
    setTimeout(() => {
      isSubmittingAction.value = false;
    }, 1200);
  }
};

const store = useLibraryStore();
const perPageOptions = [
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' }
];
const mode = ref<'manual' | 'camera'>('manual');
const inputCardNumber = ref('');
const memberSearchQuery = ref('');
const isLoading = ref(false);
const scannedResult = ref<any>(null);
const cameraActive = ref(false);
let html5QrCode: Html5Qrcode | null = null;

// Pagination State (minimal 10 members per page)
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Total members in database
const totalMemberCount = computed(() => {
  return store.members.filter(mem => mem.role === 'member').length;
});

// Reset to page 1 whenever search query or itemsPerPage changes
watch([memberSearchQuery, itemsPerPage], () => {
  currentPage.value = 1;
});

// Real-time filtering: shows all members by default if query is empty
const matchedMembers = computed(() => {
  const allMembers = store.members.filter(m => m.role === 'member');
  const q = memberSearchQuery.value.toLowerCase().trim();
  if (!q) return allMembers;
  return allMembers.filter(m => (
    (m.name && m.name.toLowerCase().includes(q)) ||
    (m.cardNumber && m.cardNumber.toLowerCase().includes(q)) ||
    (m.email && m.email.toLowerCase().includes(q)) ||
    (m.nis && m.nis.toLowerCase().includes(q)) ||
    (m.phone && m.phone.toLowerCase().includes(q))
  ));
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(matchedMembers.value.length / itemsPerPage.value));
});

const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return matchedMembers.value.slice(start, start + itemsPerPage.value);
});

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

let isStartingCamera = false;

const startCamera = async () => {
  if (isStartingCamera || cameraActive.value) return;
  isStartingCamera = true;
  try {
    cameraActive.value = true;
    await nextTick();
    html5QrCode = new Html5Qrcode('qr-reader');
    const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
      const minEdgePercentage = 0.72;
      const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
      const qrboxSize = Math.max(200, Math.min(Math.floor(minEdgeSize * minEdgePercentage), 340));
      return {
        width: qrboxSize,
        height: qrboxSize
      };
    };
    await html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: qrboxFunction },
      (decodedText) => {
        handleCardFound(decodedText);
        stopCamera();
      },
      () => {}
    );
  } catch (err) {
    console.error('Camera QR error', err);
    store.setError('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.');
    cameraActive.value = false;
  } finally {
    isStartingCamera = false;
  }
};

const stopCamera = async () => {
  cameraActive.value = false;
  if (html5QrCode) {
    const scanner = html5QrCode;
    html5QrCode = null;
    try {
      if (typeof scanner.getState === 'function') {
        const state = scanner.getState();
        // State 2 = SCANNING, 3 = PAUSED
        if (state === 2 || state === 3) {
          await scanner.stop().catch(() => {});
        }
      } else {
        await scanner.stop().catch(() => {});
      }
    } catch (err: any) {
      if (!err?.message?.includes('Cannot stop') && !String(err).includes('Cannot stop')) {
        console.warn('Camera stop error:', err);
      }
    } finally {
      try {
        scanner.clear();
      } catch {}
    }
  }
};

const handleManualLookup = async () => {
  if (!inputCardNumber.value.trim()) return;
  await handleCardFound(inputCardNumber.value.trim());
};

const selectQuickMember = async (card: string) => {
  inputCardNumber.value = card;
  await handleCardFound(card);
};

const handleCardFound = async (cardNumber: string) => {
  isLoading.value = true;
  try {
    const res = await store.lookupMemberByCard(cardNumber);
    if (res.success) {
      scannedResult.value = res.data;
      if (props.autoConfirm) {
        emit('selected', res.data.member);
      }
      store.showToast(`Kartu ${res.data.member.name} (${res.data.member.cardNumber}) terdeteksi!`);
    } else {
      scannedResult.value = null;
      store.setError(res.error);
    }
  } finally {
    isLoading.value = false;
  }
};

onBeforeUnmount(() => {
  stopCamera();
});
</script>

<style scoped>
:deep(#qr-reader) {
  width: 100% !important;
  height: 100% !important;
  border: none !important;
  position: absolute !important;
  inset: 0 !important;
  background: #020617 !important;
}
:deep(#qr-reader video) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}
:deep(#qr-reader__scan_region) {
  background: transparent !important;
}
:deep(#qr-reader__dashboard) {
  display: none !important;
}
</style>

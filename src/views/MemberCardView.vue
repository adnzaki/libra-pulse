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
          Scan QR kartu member untuk validasi cepat, cek riwayat pinjaman, dan integrasi sirkulasi.
        </p>
      </div>

      <!-- Admin-Only Member Card Switcher -->
      <div v-if="store.isAdmin" class="flex items-center gap-2">
        <label class="text-xs text-slate-500 font-medium">Inspeksi Kartu (Admin):</label>
        <select 
          v-model="selectedMemberId" 
          class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-full text-slate-700 text-xs focus:outline-none focus:border-blue-500 font-semibold"
        >
          <option value="">-- Pilih Anggota --</option>
          <option v-for="m in store.members.filter(mem => mem.role === 'member')" :key="m.id" :value="m.id">
            {{ m.name }} ({{ m.cardNumber }})
          </option>
        </select>
      </div>
    </div>

    <!-- Main Bento Grid: Left Digital Member Card, Right Scanner -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Left Column: The Digital Card -->
      <div class="lg:col-span-5 space-y-4">
        <div class="flex items-center justify-between">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tampilan Kartu Member Digital</div>
          <span v-if="activeMember" class="text-[10px] text-blue-600 font-bold">Terverifikasi</span>
        </div>

        <!-- Case 1: Active Member Loaded (Logged In or Scanned) -->
        <div v-if="activeMember" class="space-y-4 animate-in fade-in duration-200">
          <!-- The Physical-style Hologram Card -->
          <div 
            id="member-card-canvas"
            class="relative w-full aspect-[1.586/1] rounded-3xl p-6 sm:p-7 shadow-xl overflow-hidden flex flex-col justify-between border transition duration-300 group"
            :class="activeMember.isSuspended 
              ? 'bg-gradient-to-br from-rose-950 via-slate-900 to-rose-900 border-rose-500/40 text-rose-100 shadow-rose-950/20' 
              : 'bg-gradient-to-br from-[#0b162c] via-[#09152e] to-[#060e20] border-slate-800 text-white shadow-slate-950/40'"
          >
            <!-- Holographic Shimmer Accents -->
            <div class="absolute -right-16 -top-16 w-56 h-56 bg-blue-500/15 rounded-full blur-2xl pointer-events-none"></div>
            <div class="absolute -left-16 -bottom-16 w-56 h-56 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none"></div>

            <!-- Top Card Row: Library Logo & Chip -->
            <div class="flex items-start justify-between relative z-10">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center shadow-md shadow-blue-900/30 shrink-0">
                  <BookOpen class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <div class="font-extrabold text-base tracking-tight text-white leading-tight">Libra</div>
                  <div class="text-[9px] uppercase tracking-widest text-blue-300 font-mono font-bold">DIGITAL MEMBER PASS</div>
                </div>
              </div>

              <!-- Status Pill on Card -->
              <div 
                class="px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5"
                :class="activeMember.isSuspended ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                {{ activeMember.isSuspended ? 'DISUSPEND' : 'AKTIF' }}
              </div>
            </div>

            <!-- Middle Card Row: Member Details & QR Code -->
            <div class="flex items-center justify-between gap-4 my-2 relative z-10">
              <div class="flex items-center gap-3 min-w-0">
                <img 
                  :src="activeMember.avatar" 
                  crossorigin="anonymous"
                  class="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 shadow-md shrink-0" 
                  :class="activeMember.isSuspended ? 'border-rose-400' : 'border-blue-400'"
                  alt="Member Photo" 
                />
                <div class="min-w-0">
                  <h3 class="font-extrabold text-base sm:text-lg truncate tracking-tight text-white">{{ activeMember.name }}</h3>
                  <div class="text-[11px] sm:text-xs text-slate-300 truncate font-medium">{{ activeMember.email }}</div>
                  <div class="text-[10px] text-blue-300 mt-0.5 font-medium">Bergabung: {{ activeMember.joinDate }}</div>
                </div>
              </div>

              <!-- Dynamic QR Code rendered via high-res image / canvas -->
              <div class="bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl shrink-0 flex items-center justify-center border border-slate-100">
                <img 
                  v-if="qrDataUrl"
                  :src="qrDataUrl" 
                  class="w-16 h-16 sm:w-20 sm:h-20 object-contain" 
                  alt="Member QR Code" 
                />
                <canvas v-else ref="qrCanvas" class="w-16 h-16 sm:w-20 sm:h-20"></canvas>
              </div>
            </div>

            <!-- Bottom Card Row: Card Number & Barcode String -->
            <div class="flex items-end justify-between pt-2.5 sm:pt-3 border-t border-white/15 relative z-10">
              <div>
                <div class="text-[9px] uppercase tracking-widest text-slate-400 font-mono font-medium">NOMOR KARTU ANGGOTA</div>
                <div class="font-mono font-black text-sm sm:text-lg text-amber-300 tracking-wider">
                  {{ activeMember.cardNumber }}
                </div>
              </div>

              <div class="text-right">
                <div class="text-[9px] uppercase tracking-widest text-slate-400 font-mono font-medium">PINJAMAN AKTIF</div>
                <div class="font-black text-xs sm:text-sm text-white">
                  {{ getActiveLoansCount(activeMember.id) }} Buku
                </div>
              </div>
            </div>

          </div>

          <!-- Suspend Warning Notice if Suspended -->
          <div v-if="activeMember.isSuspended" class="p-4 rounded-3xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1.5">
            <div class="font-bold flex items-center gap-1.5 text-rose-900">
              <AlertTriangle class="w-4 h-4 shrink-0 text-rose-600" />
              Kartu Member Ini Sedang Disuspend
            </div>
            <p>{{ activeMember.suspendReason || 'Keterlambatan pengembalian buku.' }}</p>
            <p class="font-semibold text-rose-700">
              Masa sanksi berlaku hingga: {{ new Date(activeMember.suspendedUntil || '').toLocaleDateString('id-ID') }}
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
              @click="openPrintModal"
              class="py-2.5 px-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
            >
              <Printer class="w-3.5 h-3.5" />
              Cetak / Unduh Kartu
            </button>
          </div>

          <!-- Member Borrowing History & Active Loans (Bento Card) -->
          <div class="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-slate-800">Buku Sedang Dipinjam</span>
              <span class="text-blue-600 font-mono font-bold">{{ getMemberLoans(activeMember.id).length }} Buku</span>
            </div>

            <div v-if="getMemberLoans(activeMember.id).length > 0" class="space-y-2">
              <div 
                v-for="loan in getMemberLoans(activeMember.id)" 
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

        <!-- Case 2: Guest State (No User Logged In & No Card Scanned Yet) -->
        <div v-else class="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm text-center space-y-4">
          <div class="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center shadow-inner">
            <CreditCard class="w-8 h-8" />
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-base">Kartu Member Digital Belum Dimuat</h3>
            <p class="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Anda saat ini belum login. Masuk ke akun Anda untuk melihat kartu member digital Anda, atau pindai kartu QR/Barcode melalui scanner di sebelah kanan.
            </p>
          </div>

          <div class="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <router-link 
              to="/login"
              class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition shadow-md shadow-blue-200 flex items-center justify-center gap-2"
            >
              <LogIn class="w-3.5 h-3.5" />
              Masuk / Login Akun
            </router-link>
            <router-link 
              to="/login?mode=register"
              class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <UserPlus class="w-3.5 h-3.5 text-slate-500" />
              Daftar Anggota
            </router-link>
          </div>
        </div>

      </div>

      <!-- Right Column: Integrated Scanner & Live Member Lookup -->
      <div class="lg:col-span-7 space-y-6">
        <MemberCardScanner @selected="handleScannerSelected" />
      </div>

    </div>

    <!-- Dedicated Print & Card Showcase Modal (Matches image.png with pixel perfection!) -->
    <div 
      v-if="isPrintModalOpen && activeMember" 
      class="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      @click.self="isPrintModalOpen = false"
    >
      <div class="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col my-auto animate-in zoom-in-95 duration-200">
        <!-- Modal Header -->
        <div class="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Printer class="w-4 h-4" />
            </div>
            <div>
              <h3 class="font-bold text-sm sm:text-base text-white">Cetak & Unduh Kartu Member</h3>
              <p class="text-[11px] text-slate-400">Pratinjau fisik kartu anggota resmi Libra Digital Pass</p>
            </div>
          </div>
          <button 
            @click="isPrintModalOpen = false"
            class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Modal Body: The Card Display (Matching image.png pixel for pixel!) -->
        <div class="p-4 sm:p-8 flex flex-col items-center justify-center bg-slate-950/70 select-none">
          
          <!-- Wrapper container for capturing or printing -->
          <div 
            id="printable-card-element"
            class="relative w-full aspect-[1.586/1] rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden flex flex-col justify-between border transition duration-300"
            :class="printTheme === 'light' 
              ? 'bg-white border-2 border-slate-200 text-slate-900 shadow-slate-950/10' 
              : (activeMember.isSuspended 
                  ? 'bg-gradient-to-br from-rose-950 via-slate-950 to-rose-900 border-rose-500/40 text-rose-100' 
                  : 'bg-gradient-to-br from-[#0b162c] via-[#09152e] to-[#060e20] border-slate-800 text-white shadow-slate-950/60')"
            :style="cardPrintSize === 'large' ? 'max-width: 540px;' : 'max-width: 460px;'"
          >
            <!-- Shimmer Background Glow (Dark theme only) -->
            <template v-if="printTheme === 'dark'">
              <div class="absolute -right-16 -top-16 w-56 h-56 bg-blue-500/15 rounded-full blur-2xl pointer-events-none"></div>
              <div class="absolute -left-16 -bottom-16 w-56 h-56 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none"></div>
            </template>

            <!-- Top Row: Logo & Status -->
            <div class="flex items-start justify-between relative z-10">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center shadow-md shadow-blue-900/30 shrink-0">
                  <BookOpen class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <div class="font-extrabold text-base tracking-tight leading-tight" :class="printTheme === 'light' ? 'text-slate-900' : 'text-white'">
                    Libra
                  </div>
                  <div class="text-[9px] uppercase tracking-widest font-mono font-bold" :class="printTheme === 'light' ? 'text-blue-600' : 'text-blue-300'">
                    DIGITAL MEMBER PASS
                  </div>
                </div>
              </div>

              <!-- Status Pill on Card -->
              <div 
                class="px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5"
                :class="activeMember.isSuspended ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                {{ activeMember.isSuspended ? 'DISUSPEND' : 'AKTIF' }}
              </div>
            </div>

            <!-- Middle Row: Member Info & QR Code -->
            <div class="flex items-center justify-between gap-4 my-2 relative z-10">
              <div class="flex items-center gap-3 min-w-0">
                <img 
                  :src="activeMember.avatar" 
                  crossorigin="anonymous"
                  class="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 shadow-md shrink-0" 
                  :class="activeMember.isSuspended ? 'border-rose-400' : (printTheme === 'light' ? 'border-blue-500' : 'border-blue-400')"
                  alt="Member Photo" 
                />
                <div class="min-w-0">
                  <h3 class="font-extrabold text-base sm:text-lg truncate tracking-tight" :class="printTheme === 'light' ? 'text-slate-900' : 'text-white'">
                    {{ activeMember.name }}
                  </h3>
                  <div class="text-[11px] sm:text-xs truncate font-medium" :class="printTheme === 'light' ? 'text-slate-600' : 'text-slate-300'">
                    {{ activeMember.email }}
                  </div>
                  <div class="text-[10px] mt-0.5 font-medium" :class="printTheme === 'light' ? 'text-blue-700' : 'text-blue-300'">
                    Bergabung: {{ activeMember.joinDate }}
                  </div>
                </div>
              </div>

              <!-- Dynamic Crisp QR Code rendered as high-res Base64 image -->
              <div class="bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl shrink-0 flex items-center justify-center border border-slate-100">
                <img 
                  v-if="qrDataUrl"
                  :src="qrDataUrl" 
                  class="w-16 h-16 sm:w-20 sm:h-20 object-contain" 
                  alt="Member QR Code" 
                />
                <canvas v-else ref="qrModalCanvas" class="w-16 h-16 sm:w-20 sm:h-20"></canvas>
              </div>
            </div>

            <!-- Bottom Row: Card Number & Active Loans -->
            <div 
              class="flex items-end justify-between pt-2.5 sm:pt-3 border-t relative z-10"
              :class="printTheme === 'light' ? 'border-slate-200' : 'border-white/15'"
            >
              <div>
                <div class="text-[9px] uppercase tracking-widest font-mono font-medium" :class="printTheme === 'light' ? 'text-slate-500' : 'text-slate-400'">
                  NOMOR KARTU ANGGOTA
                </div>
                <div class="font-mono font-black text-sm sm:text-lg tracking-wider" :class="printTheme === 'light' ? 'text-blue-700' : 'text-amber-300'">
                  {{ activeMember.cardNumber }}
                </div>
              </div>

              <div class="text-right">
                <div class="text-[9px] uppercase tracking-widest font-mono font-medium" :class="printTheme === 'light' ? 'text-slate-500' : 'text-slate-400'">
                  PINJAMAN AKTIF
                </div>
                <div class="font-black text-xs sm:text-sm" :class="printTheme === 'light' ? 'text-slate-900' : 'text-white'">
                  {{ getActiveLoansCount(activeMember.id) }} Buku
                </div>
              </div>
            </div>

          </div>

          <div class="text-[11px] text-slate-500 mt-3 text-center">
            Format: Standar Kartu Anggota Perpustakaan (CR-80 / 85.6 mm × 54 mm)
          </div>
        </div>

        <!-- Modal Controls & Actions -->
        <div class="p-5 sm:p-6 border-t border-slate-800 space-y-4 bg-slate-900">
          
          <!-- Customization Bar: Theme & Size -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2">
              <span class="text-slate-400 font-medium">Warna Cetak:</span>
              <div class="inline-flex rounded-xl p-1 bg-slate-800 border border-slate-700">
                <button 
                  @click="printTheme = 'dark'"
                  class="px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                  :class="printTheme === 'dark' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'"
                >
                  <Moon class="w-3 h-3" />
                  Gelap Original
                </button>
                <button 
                  @click="printTheme = 'light'"
                  class="px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                  :class="printTheme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'"
                >
                  <Sun class="w-3 h-3" />
                  Putih (Hemat Tinta)
                </button>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-slate-400 font-medium">Ukuran:</span>
              <select 
                v-model="cardPrintSize" 
                class="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="cr80">Standar ID Card (8.56 × 5.4 cm)</option>
                <option value="large">Landscape Besar (13 × 8.2 cm)</option>
              </select>
            </div>
          </div>

          <!-- Main Buttons -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button 
              @click="downloadCardAsPng"
              :disabled="isDownloading"
              class="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Download class="w-4 h-4 text-blue-400" />
              <span v-if="isDownloading">Membuat File Gambar...</span>
              <span v-else>Unduh Gambar (PNG HD)</span>
            </button>

            <button 
              @click="printCardDirectly"
              class="py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <Printer class="w-4 h-4" />
              Cetak ke Printer / PDF
            </button>
          </div>

        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import type { Member } from '../types.js';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import MemberCardScanner from '../components/MemberCardScanner.vue';
import { 
  QrCode, BookOpen, AlertTriangle, Copy, Printer, 
  CreditCard, LogIn, UserPlus, Download, X, Moon, Sun
} from 'lucide-vue-next';

const store = useLibraryStore();
const selectedMemberId = ref('');
const scannedMember = ref<Member | null>(null);
const qrCanvas = ref<HTMLCanvasElement | null>(null);
const qrModalCanvas = ref<HTMLCanvasElement | null>(null);
const qrDataUrl = ref('');

// Print & Download Modal State
const isPrintModalOpen = ref(false);
const printTheme = ref<'dark' | 'light'>('dark');
const cardPrintSize = ref<'cr80' | 'large'>('cr80');
const isDownloading = ref(false);

const activeMember = computed<Member | null>(() => {
  // If admin selected an ID
  if (store.isAdmin && selectedMemberId.value) {
    const found = store.members.find(m => m.id === selectedMemberId.value);
    if (found) return found;
  }
  // If a member is logged in
  if (store.currentUser) {
    return store.currentUser;
  }
  // If a guest scanned a card via QR scanner
  if (scannedMember.value) {
    return scannedMember.value;
  }
  // Otherwise, no active member card is shown for unauthenticated guests
  return null;
});

const generateQr = async () => {
  await nextTick();
  if (activeMember.value) {
    try {
      // 1. Generate high-resolution Base64 PNG image for crisp display, print & export
      qrDataUrl.value = await QRCode.toDataURL(activeMember.value.cardNumber, {
        width: 300,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });

      // 2. Also draw to primary canvas if rendered
      if (qrCanvas.value) {
        await QRCode.toCanvas(qrCanvas.value, activeMember.value.cardNumber, {
          width: 120,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        });
      }
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

const openPrintModal = async () => {
  if (!activeMember.value) return;
  await generateQr();
  isPrintModalOpen.value = true;
};

const downloadCardAsPng = async () => {
  if (!activeMember.value) return;
  isDownloading.value = true;
  try {
    const cardEl = document.getElementById('printable-card-element');
    if (!cardEl) throw new Error('Elemen kartu tidak ditemukan');

    const canvas = await html2canvas(cardEl, {
      scale: 3, // Crisp 300 DPI equivalent
      useCORS: true,
      allowTaint: true,
      backgroundColor: null, // Transparent background around rounded corners
      logging: false,
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Kartu-Member-${activeMember.value.cardNumber}.png`;
    link.href = dataUrl;
    link.click();

    store.showToast(`Kartu member ${activeMember.value.cardNumber} berhasil diunduh (PNG)!`);
  } catch (err) {
    console.error('Download PNG failed', err);
    store.showToast('Gagal mengunduh gambar kartu. Silakan gunakan opsi Cetak ke PDF.');
  } finally {
    isDownloading.value = false;
  }
};

const printCardDirectly = () => {
  if (!activeMember.value) return;
  const cardEl = document.getElementById('printable-card-element');
  if (!cardEl) {
    window.print();
    return;
  }

  // Create isolated invisible iframe to guarantee only this card gets printed with background colors
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  const cardHtml = cardEl.outerHTML;
  const cardWidth = cardPrintSize.value === 'cr80' ? '85.6mm' : '130mm';

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Kartu Member - ${activeMember.value.cardNumber}</title>
        <meta charset="utf-8">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #ffffff;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: auto;
            margin: 15mm;
          }
          .print-card-wrapper {
            width: ${cardWidth};
            max-width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          #printable-card-element {
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        </style>
        <!-- Include Tailwind CSS inside print iframe -->
        <link rel="stylesheet" href="${window.location.origin}/src/index.css">
      </head>
      <body>
        <div class="print-card-wrapper">
          ${cardHtml}
        </div>
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1500);
  }, 500);
};

const handleScannerSelected = (member: Member) => {
  scannedMember.value = member;
  if (store.isAdmin) {
    selectedMemberId.value = member.id;
  }
  store.showToast(`Kartu ${member.name} (${member.cardNumber}) berhasil dimuat!`);
};
</script>



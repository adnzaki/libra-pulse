<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
    <div class="bg-white border border-slate-100 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-auto">
      
      <!-- Header -->
      <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookmarkCheck class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-base text-slate-900">Booking Peminjaman Buku</h3>
            <p class="text-xs text-slate-500">Penahanan Stok Otomatis 24 Jam</p>
          </div>
        </div>
        <button @click="closeModal" class="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-4">
        
        <!-- Inline Modal Error Alert (Always on top & visible inside modal) -->
        <div v-if="modalError" class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-2.5 animate-in fade-in">
          <div class="flex items-center gap-2">
            <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
            <span class="font-semibold leading-tight">{{ modalError }}</span>
          </div>
          <button @click="modalError = ''" type="button" class="text-rose-500 hover:text-rose-800 text-sm font-bold p-1 cursor-pointer">✕</button>
        </div>

        <!-- Book Preview Card -->
        <div v-if="book" class="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <img :src="book.cover" class="w-16 h-22 object-cover rounded-xl shadow-sm shrink-0" alt="Cover" />
          <div class="flex-1 min-w-0">
            <div class="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{{ book.category }}</div>
            <h4 class="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">{{ book.title }}</h4>
            <p class="text-xs text-slate-500 mt-0.5">Oleh: {{ book.author }}</p>
            <div class="flex items-center gap-2 mt-2 text-[11px]">
              <span class="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 font-mono font-semibold">Lokasi: {{ book.shelfCode }}</span>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">Tersedia: {{ book.availableCopies }} buku</span>
            </div>
          </div>
        </div>

        <!-- 24-Hour Rule Banner -->
        <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
          <Clock class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span class="font-bold">Sistem Penahanan 24 Jam:</span> Buku akan ditahan khusus atas nama Anda selama 24 jam. Jika tidak diambil di perpustakaan dalam 24 jam, sistem otomatis membatalkan pemesanan dan mengembalikan stok.
          </div>
        </div>

        <!-- Booking Method Selection (if not logged in) -->
        <div v-if="!store.currentUser" class="space-y-4">
          <div class="flex rounded-full bg-slate-100 p-1 text-xs">
            <button 
              type="button"
              @click="setAuthMode('card')"
              class="flex-1 py-2 rounded-full font-bold transition cursor-pointer"
              :class="authMode === 'card' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
            >
              💳 Masukkan / Scan Kartu Member
            </button>
            <button 
              type="button"
              @click="setAuthMode('register')"
              class="flex-1 py-2 rounded-full font-bold transition cursor-pointer"
              :class="authMode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
            >
              ✨ Daftar Member Baru
            </button>
          </div>

          <!-- Card Input / QR Scan Mode -->
          <div v-if="authMode === 'card'" class="space-y-3">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-xs font-bold text-slate-700">Nomor Kartu Member atau ID</label>
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
              <div v-if="isCameraActive" class="mb-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
                <div id="booking-qr-reader" class="w-full max-h-52 rounded-xl overflow-hidden bg-slate-950 mx-auto"></div>
                <p class="text-[11px] text-slate-300">Arahkan kamera ke QR Code atau Barcode pada kartu anggota</p>
              </div>

              <div class="relative">
                <input 
                  v-model="cardNumberInput" 
                  @input="handleCardInputChanged"
                  type="text" 
                  placeholder="Contoh: LIB-2026-8801"
                  class="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 font-mono font-semibold uppercase"
                />
                <button 
                  type="button"
                  @click="toggleCameraScanner" 
                  class="absolute right-2.5 top-2.5 text-slate-400 hover:text-blue-600 transition"
                  title="Scan QR Code"
                >
                  <QrCode class="w-4 h-4" />
                </button>
              </div>
              
              <!-- Verified Member Preview Pill if found -->
              <div v-if="verifiedMember" class="mt-2 p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs animate-in fade-in">
                <div class="flex items-center gap-2.5">
                  <img :src="verifiedMember.avatar" class="w-7 h-7 rounded-full object-cover border border-emerald-300" alt="Avatar" />
                  <div>
                    <span class="font-bold text-emerald-950">{{ verifiedMember.name }}</span>
                    <span class="text-[10px] text-emerald-700 font-mono ml-1.5">({{ verifiedMember.cardNumber }})</span>
                  </div>
                </div>
                <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Terverifikasi</span>
              </div>
              <p v-else class="text-[11px] text-slate-400 mt-1">Gunakan nomor kartu terdaftar atau scan QR kartu anggota Anda.</p>
            </div>
          </div>

          <!-- Register Mode -->
          <div v-else-if="authMode === 'register'" class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
              <input 
                v-model="regForm.name" 
                @input="modalError = ''"
                type="text" 
                placeholder="Nama Lengkap Anda" 
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium" 
              />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                <input 
                  v-model="regForm.email" 
                  @input="modalError = ''"
                  type="email" 
                  placeholder="email@domain.com" 
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium" 
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp/HP *</label>
                <input 
                  v-model="regForm.phone" 
                  @input="modalError = ''"
                  type="text" 
                  placeholder="+62812..." 
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium" 
                />
              </div>
            </div>
          </div>
        </div>

        <!-- If Logged In -->
        <div v-else class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img :src="store.currentUser.avatar" class="w-10 h-10 rounded-full object-cover border-2 border-blue-500 shadow-sm" alt="Avatar" />
            <div>
              <div class="font-bold text-sm text-slate-900">{{ store.currentUser.name }}</div>
              <div class="text-xs text-blue-600 font-mono font-semibold">{{ store.currentUser.cardNumber }}</div>
            </div>
          </div>
          <span v-if="store.currentUser.isSuspended" class="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 font-bold">
            DISUSPEND
          </span>
          <span v-else class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold">
            Member Aktif
          </span>
        </div>

        <!-- Notes Input -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
          <input 
            v-model="bookingNotes" 
            type="text" 
            placeholder="Misal: Diambil sore ini pukul 15.00 WIB"
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>

        <!-- Warning if suspended -->
        <div v-if="isTargetMemberBlocked" class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle class="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <strong>Booking Ditolak:</strong> Anda tidak dapat melakukan booking baru karena akun sedang berstatus <strong>DISUSPEND</strong> atau masih memiliki pinjaman buku yang terlambat dikembalikan.
          </div>
        </div>

      </div>

      <!-- Footer Buttons -->
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
          @click="handleSubmitBooking"
          :disabled="isSubmitting || (book && book.availableCopies <= 0) || isTargetMemberBlocked"
          class="px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          <Bookmark class="w-4 h-4" />
          {{ isSubmitting ? 'Memproses...' : 'Konfirmasi Booking (Hold 24 Jam)' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, nextTick } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import type { Book, Member } from '../types.js';
import { BookmarkCheck, Bookmark, X, Clock, AlertCircle, Camera, QrCode } from 'lucide-vue-next';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';

const props = defineProps<{
  isOpen: boolean;
  book: Book | null;
}>();

const emit = defineEmits(['close', 'booked']);

const store = useLibraryStore();
const authMode = ref<'card' | 'register'>('card');
const cardNumberInput = ref('');
const bookingNotes = ref('');
const isSubmitting = ref(false);
const modalError = ref('');
const verifiedMember = ref<Member | null>(null);

const isCameraActive = ref(false);
let html5QrScanner: Html5Qrcode | null = null;

const regForm = ref({
  name: '',
  email: '',
  phone: ''
});

const isTargetMemberBlocked = computed(() => {
  if (store.currentUser) {
    if (store.currentUser.isSuspended) return true;
    const ov = store.loans.filter(l => 
      (l.memberId === store.currentUser?.id || l.memberCardNumber === store.currentUser?.cardNumber) && 
      l.status === 'overdue'
    );
    if (ov.length > 0) return true;
  }
  if (authMode.value === 'card' && verifiedMember.value) {
    if (verifiedMember.value.isSuspended) return true;
    const ov = store.loans.filter(l => 
      (l.memberId === verifiedMember.value?.id || l.memberCardNumber === verifiedMember.value?.cardNumber) && 
      l.status === 'overdue'
    );
    if (ov.length > 0) return true;
  }
  return false;
});

const isCurrentMemberSuspended = computed(() => {
  return isTargetMemberBlocked.value;
});

const setAuthMode = (mode: 'card' | 'register') => {
  authMode.value = mode;
  modalError.value = '';
  if (mode === 'register') {
    stopCamera();
  }
};

const handleCardInputChanged = () => {
  modalError.value = '';
  verifiedMember.value = null;
  const input = cardNumberInput.value.trim().toUpperCase();
  if (input.length >= 4) {
    const found = store.members.find(m => m.cardNumber.toUpperCase() === input || m.id === input);
    if (found) {
      verifiedMember.value = found;
    }
  }
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
    html5QrScanner = new Html5Qrcode('booking-qr-reader');
    await html5QrScanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (decodedText) => {
        cardNumberInput.value = decodedText.trim();
        handleCardInputChanged();
        store.showToast(`Kartu ${decodedText} berhasil dipindai!`);
        stopCamera();
      },
      () => {}
    );
  } catch (err: any) {
    console.error('Camera error', err);
    modalError.value = 'Tidak dapat mengakses kamera. Pastikan izin kamera telah diizinkan.';
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

const closeModal = () => {
  stopCamera();
  modalError.value = '';
  emit('close');
};

const handleSubmitBooking = async () => {
  if (!props.book) return;
  modalError.value = '';

  if (isTargetMemberBlocked.value) {
    modalError.value = 'Booking ditolak: Akun anggota sedang disuspend atau memiliki pinjaman yang terlambat.';
    return;
  }

  let targetCardNumber = '';

  if (store.currentUser) {
    targetCardNumber = store.currentUser.id || store.currentUser.cardNumber || '';
  } else if (authMode.value === 'card') {
    const cleanCard = cardNumberInput.value.trim();
    if (!cleanCard) {
      modalError.value = 'Silakan masukkan atau scan nomor kartu member Anda terlebih dahulu.';
      return;
    }
    targetCardNumber = cleanCard;
  } else if (authMode.value === 'register') {
    if (!regForm.value.name.trim() || !regForm.value.email.trim() || !regForm.value.phone.trim()) {
      modalError.value = 'Silakan lengkapi nama, email, dan nomor HP untuk pendaftaran member baru.';
      return;
    }
    isSubmitting.value = true;
    try {
      const regRes = await store.registerMember(regForm.value);
      if (!regRes.success) {
        modalError.value = regRes.error || 'Gagal mendaftarkan anggota baru.';
        isSubmitting.value = false;
        return;
      }
      targetCardNumber = regRes.member.cardNumber;
    } catch (e: any) {
      modalError.value = e.message || 'Terjadi kesalahan pendaftaran.';
      isSubmitting.value = false;
      return;
    }
  }

  isSubmitting.value = true;
  try {
    const res = await store.createBooking(props.book.id, targetCardNumber, bookingNotes.value);
    if (res.success) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      emit('booked', res.booking);
      closeModal();
    } else {
      modalError.value = res.error || 'Gagal melakukan booking buku.';
    }
  } catch (err: any) {
    modalError.value = err.message || 'Terjadi kesalahan saat memproses booking.';
  } finally {
    isSubmitting.value = false;
  }
};

onBeforeUnmount(() => {
  stopCamera();
});
</script>


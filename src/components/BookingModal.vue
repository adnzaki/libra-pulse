<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
    <div class="bg-white border border-slate-100 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
      
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
      <div class="p-6 space-y-5">
        
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
              @click="authMode = 'card'"
              class="flex-1 py-2 rounded-full font-bold transition cursor-pointer"
              :class="authMode === 'card' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
            >
              💳 Masukkan / Scan Kartu Member
            </button>
            <button 
              type="button"
              @click="authMode = 'register'"
              class="flex-1 py-2 rounded-full font-bold transition cursor-pointer"
              :class="authMode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
            >
              ✨ Daftar Member Baru
            </button>
          </div>

          <!-- Card Input Mode -->
          <div v-if="authMode === 'card'" class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Nomor Kartu Member atau ID</label>
              <div class="relative">
                <input 
                  v-model="cardNumberInput" 
                  type="text" 
                  placeholder="Contoh: LIB-2026-8801 atau LIB-2026-8803"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 font-mono font-semibold"
                />
                <button 
                  type="button"
                  @click="useDemoMember('LIB-2026-8801')" 
                  class="absolute right-2 top-2 text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-blue-600 font-bold transition shadow-sm cursor-pointer"
                >
                  Gunakan Demo
                </button>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">Kartu member langsung divalidasi tanpa perlu password manual.</p>
            </div>
          </div>

          <!-- Register Mode -->
          <div v-else-if="authMode === 'register'" class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
              <input v-model="regForm.name" type="text" placeholder="Nama Anda" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input v-model="regForm.email" type="email" placeholder="email@domain.com" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp/HP</label>
                <input v-model="regForm.phone" type="text" placeholder="+62812..." class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium" />
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
        <div v-if="isCurrentMemberSuspended" class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle class="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <strong>Akun Disuspend:</strong> Anda tidak dapat melakukan booking baru karena memiliki status suspend akibat keterlambatan pengembalian buku sebelumnya.
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
          :disabled="isSubmitting || (book && book.availableCopies <= 0)"
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
import { ref, computed } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import type { Book } from '../types.js';
import { BookmarkCheck, Bookmark, X, Clock, AlertCircle } from 'lucide-vue-next';
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

const regForm = ref({
  name: '',
  email: '',
  phone: ''
});

const isCurrentMemberSuspended = computed(() => {
  if (store.currentUser?.isSuspended) return true;
  return false;
});

const useDemoMember = (card: string) => {
  cardNumberInput.value = card;
};

const closeModal = () => {
  emit('close');
};

const handleSubmitBooking = async () => {
  if (!props.book) return;

  isSubmitting.value = true;
  try {
    let targetCardNumber = '';

    if (store.currentUser) {
      targetCardNumber = store.currentUser.cardNumber;
    } else if (authMode.value === 'card') {
      if (!cardNumberInput.value.trim()) {
        store.setError('Silakan masukkan nomor kartu member');
        isSubmitting.value = false;
        return;
      }
      targetCardNumber = cardNumberInput.value.trim();
    } else if (authMode.value === 'register') {
      if (!regForm.value.name || !regForm.value.email || !regForm.value.phone) {
        store.setError('Lengkapi semua data registrasi');
        isSubmitting.value = false;
        return;
      }
      const regRes = await store.registerMember(regForm.value);
      if (!regRes.success) {
        isSubmitting.value = false;
        return;
      }
      targetCardNumber = regRes.member.cardNumber;
    }

    const res = await store.createBooking(props.book.id, targetCardNumber, bookingNotes.value);
    if (res.success) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      emit('booked', res.booking);
      closeModal();
    }
  } catch (err: any) {
    console.error('Booking error', err);
  } finally {
    isSubmitting.value = false;
  }
};
</script>


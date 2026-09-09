<template>
  <div class="space-y-6">
    
    <!-- If not logged in as Member, show clean login / register options -->
    <div v-if="!store.currentUser" class="p-6 sm:p-10 rounded-3xl bg-white border border-slate-100 text-center space-y-6 max-w-lg mx-auto shadow-sm">
      <div class="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
        <UserCheck class="w-8 h-8" />
      </div>
      <div>
        <h2 class="font-extrabold text-2xl text-slate-900 tracking-tight">Portal Anggota Perpustakaan</h2>
        <p class="text-xs text-slate-500 mt-1">Masuk ke akun Anda untuk melihat status peminjaman aktif, riwayat denda, dan booking buku.</p>
      </div>

      <div class="space-y-3 pt-1 text-xs text-left">
        <!-- Direct Login Button -->
        <router-link 
          to="/login?redirect=/member-portal"
          class="w-full px-5 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center justify-center gap-2.5 shadow-md shadow-blue-200 cursor-pointer active:scale-95"
        >
          <LogIn class="w-4 h-4" />
          <span>Masuk ke Akun Member</span>
        </router-link>

        <div class="pt-2 text-center">
          <router-link 
            to="/login?mode=register&redirect=/member-portal"
            class="text-blue-600 hover:text-blue-700 font-bold text-xs cursor-pointer inline-flex items-center gap-1"
          >
            Belum punya akun anggota? Daftar sekarang →
          </router-link>
        </div>
      </div>
    </div>

    <!-- Active Member Portal (Bento Modules) -->
    <div v-else class="space-y-6">
      
      <!-- Top Member Profile Bento Card -->
      <div 
        class="p-6 sm:p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
        :class="store.currentUser.isSuspended ? 'bg-rose-50/50 border-rose-200' : 'bg-white border-slate-100'"
      >
        <div class="flex items-center gap-4">
          <img 
            :src="store.currentUser.avatar" 
            class="w-16 h-16 rounded-2xl object-cover border-2 shadow-sm"
            :class="store.currentUser.isSuspended ? 'border-rose-400' : 'border-blue-400'"
            alt="Avatar" 
          />
          <div>
            <div class="flex flex-wrap items-center gap-2.5">
              <h1 class="font-extrabold text-2xl text-slate-900 tracking-tight">{{ store.currentUser.name }}</h1>
              
              <!-- Badge Tipe Anggota: Guru atau Siswa -->
              <span 
                class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs"
                :class="store.currentUser.memberType === 'guru' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-blue-100 text-blue-800 border border-blue-200'"
              >
                <span v-if="store.currentUser.memberType === 'guru'">👨‍🏫 Guru</span>
                <span v-else>🎒 Siswa</span>
              </span>

              <!-- Badge Status Akun -->
              <span 
                class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                :class="store.currentUser.isSuspended ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'"
              >
                {{ store.currentUser.isSuspended ? 'AKUN DISUSPEND' : 'MEMBER AKTIF' }}
              </span>
            </div>
            <div class="text-xs text-blue-600 font-mono font-medium mt-1">
              No. Kartu: {{ store.currentUser.cardNumber }} • HP: {{ store.currentUser.phone || '-' }} • Email: {{ store.currentUser.email }}
            </div>
            <div class="text-[11px] text-slate-400 mt-1">
              Alamat: {{ store.currentUser.address || 'Belum diisi' }} • Bergabung sejak {{ new Date(store.currentUser.joinDate).toLocaleDateString('id-ID') }} • Total {{ store.currentUser.totalBorrowed }}x Meminjam Buku
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Tombol Ubah Profil (Sesuai panah biru di screenshot pengguna) -->
          <button 
            @click="openEditProfile('profile')"
            class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-200 active:scale-95 relative"
            title="Ubah Foto Profil, Nama, Email, HP, Alamat dan Status Keanggotaan"
          >
            <UserCog class="w-4 h-4" />
            <span>Ubah Profil</span>
            <span 
              v-if="store.myPendingTeacherRequest" 
              class="w-2 h-2 rounded-full bg-amber-300 animate-ping"
              title="Pengajuan status Guru sedang diproses"
            ></span>
            <span 
              v-else-if="myRejectedTeacherRequest" 
              class="w-2 h-2 rounded-full bg-rose-400"
              title="Pengajuan status Guru ditolak"
            ></span>
          </button>

          <button 
            @click="isChangePasswordOpen = true"
            class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <KeyRound class="w-4 h-4 text-slate-500" />
            Ganti Password
          </button>
          <router-link 
            to="/member-card"
            class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full text-xs transition flex items-center gap-2 shadow-sm"
          >
            <QrCode class="w-4 h-4 text-amber-300" />
            Buka Kartu QR
          </router-link>
        </div>
      </div>

      <!-- Quick Banner: Pending Teacher Request (Jika sedang proses verifikasi selfie) -->
      <div 
        v-if="store.myPendingTeacherRequest" 
        class="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900"
      >
        <div class="flex items-center gap-2.5">
          <Clock class="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
          <div>
            <strong class="font-bold">Pengajuan Status Guru Anda Sedang Diverifikasi Admin:</strong>
            <p class="text-[11px] text-amber-700 mt-0.5">Foto selfie dan data identitas Anda sedang ditinjau oleh pengelola perpustakaan.</p>
          </div>
        </div>
        <button 
          @click="openEditProfile('upgrade')"
          class="px-3.5 py-1.5 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-full font-bold text-[11px] transition shrink-0 cursor-pointer"
        >
          Lihat Status Pengajuan
        </button>
      </div>

      <!-- Notifikasi Langsung: Permohonan Perubahan Status Ditolak Admin (Tampil langsung tanpa harus buka ubah profil) -->
      <div 
        v-else-if="myRejectedTeacherRequest" 
        class="p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 text-xs text-rose-950 animate-in fade-in duration-200"
      >
        <div class="flex items-start gap-3 min-w-0">
          <div class="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertCircle class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <strong class="font-extrabold text-sm text-rose-900">Pemberitahuan: Permohonan Perubahan Status Guru Ditolak Admin</strong>
              <span class="px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 text-[10px] font-bold uppercase tracking-wider">
                Verifikasi Ditolak
              </span>
            </div>
            <p class="text-xs text-rose-800 mt-1">
              Alasan Penolakan: <strong class="font-semibold text-rose-950">{{ myRejectedTeacherRequest.rejectionReason || 'Foto selfie atau data identitas belum memenuhi syarat verifikasi Guru.' }}</strong>
            </p>
            <div class="text-[11px] text-rose-600 mt-1 flex flex-wrap items-center gap-x-2">
              <span>Ditinjau oleh: <strong>{{ myRejectedTeacherRequest.reviewedBy || 'Admin' }}</strong></span>
              <span>•</span>
              <span>Waktu: {{ formatDateTime(myRejectedTeacherRequest.reviewedDate) }}</span>
            </div>
          </div>
        </div>

        <button 
          @click="openEditProfile('upgrade')"
          class="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-rose-200 cursor-pointer flex items-center justify-center gap-2 shrink-0 active:scale-95"
        >
          <Camera class="w-4 h-4" />
          <span>Ajukan Ulang / Ambil Selfie Baru</span>
        </button>
      </div>

      <!-- Quick Banner: Status Guru Berhasil Disetujui -->
      <div 
        v-else-if="store.currentUser.memberType === 'guru' && store.myLatestTeacherRequest?.status === 'approved'"
        class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900"
      >
        <div class="flex items-center gap-2.5">
          <CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <strong class="font-bold">Status Keanggotaan Terverifikasi: Dewan Guru SDN Pengasinan VII</strong>
            <p class="text-[11px] text-emerald-700 mt-0.5">Permohonan Anda telah disetujui. Akun Anda memiliki hak akses peminjaman khusus Guru.</p>
          </div>
        </div>
      </div>

      <!-- Suspend Warning Notice & Countdown -->
      <div v-if="store.currentUser.isSuspended" class="p-5 rounded-3xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2">
        <div class="flex items-center gap-2 font-bold text-sm text-rose-900">
          <AlertTriangle class="w-5 h-5 text-rose-600" />
          Status Akun: Penangguhan (Suspended)
        </div>
        <p class="leading-relaxed text-rose-700">
          {{ store.currentUser.suspendReason || 'Akun Anda disuspend karena keterlambatan pengembalian buku.' }}
        </p>
        <div class="flex flex-wrap items-center gap-3 text-xs font-semibold pt-1">
          <span class="px-3 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-900 font-bold">
            Sanksi berakhir: {{ new Date(store.currentUser.suspendedUntil || '').toLocaleDateString('id-ID') }}
          </span>
          <span class="text-rose-600">
            Selama masa suspend, Anda tidak dapat melakukan booking atau peminjaman buku baru.
          </span>
        </div>
      </div>

      <!-- Section 1: Active 24-Hour Bookings (Hold with Real-Time Timers) -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Clock class="w-4 h-4 text-amber-500" />
            <h3 class="font-extrabold text-lg text-slate-900">Booking Aktif (Penahanan 24 Jam)</h3>
          </div>
          <span class="text-xs text-slate-400 font-medium">{{ activeHoldBookings.length }} booking menunggu pengambilan</span>
        </div>

        <div v-if="activeHoldBookings.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="b in activeHoldBookings" 
            :key="b.id"
            class="p-5 rounded-3xl bg-white border border-amber-200 shadow-sm space-y-4 relative overflow-hidden"
          >
            <div class="flex gap-3.5">
              <img :src="b.bookCover" class="w-16 h-22 object-cover rounded-2xl shadow-sm shrink-0" alt="Cover" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono font-bold text-amber-700 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                    {{ b.id }}
                  </span>
                  <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold">
                    Lokasi: {{ b.shelfCode }}
                  </span>
                </div>
                <h4 class="font-bold text-slate-900 text-sm mt-1.5 line-clamp-1">{{ b.bookTitle }}</h4>
                <p class="text-xs text-slate-400 mt-0.5">Dipesan: {{ new Date(b.createdAt).toLocaleTimeString('id-ID') }}</p>
                
                <!-- Live Countdown Clock -->
                <div class="mt-2.5 p-2.5 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center justify-between text-xs">
                  <span class="text-slate-600 flex items-center gap-1.5 font-medium">
                    <Timer class="w-3.5 h-3.5 text-amber-600" />
                    Sisa Waktu Ambil:
                  </span>
                  <span class="font-mono font-extrabold text-amber-700">
                    {{ formatCountdown(b.expiresAt) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Notes & Cancel action -->
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-slate-400 text-[11px] truncate max-w-xs">
                Tunjukkan kartu member saat mengambil di loket perpustakaan.
              </span>
              <button 
                @click="cancelMyBooking(b.id)"
                class="text-rose-600 hover:text-rose-700 font-bold text-xs transition cursor-pointer"
              >
                Batalkan Booking
              </button>
            </div>
          </div>
        </div>

        <div v-else class="p-8 rounded-3xl bg-white border border-slate-100 text-center text-xs text-slate-400 space-y-2 shadow-sm">
          <BookmarkCheck class="w-8 h-8 text-slate-300 mx-auto" />
          <p class="text-slate-600 font-medium">Tidak ada booking buku yang sedang ditahan untuk Anda.</p>
          <router-link to="/" class="inline-block text-blue-600 font-bold hover:underline">
            Jelajahi Katalog Buku & Booking Sekarang →
          </router-link>
        </div>
      </div>

      <!-- Section 2: Active Loans & Overdue Tracker -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <BookMarked class="w-4 h-4 text-emerald-600" />
            <h3 class="font-extrabold text-lg text-slate-900">Peminjaman Buku yang Sedang Berjalan</h3>
          </div>
          <span class="text-xs text-slate-400 font-medium">{{ store.myActiveLoans.length }} buku aktif</span>
        </div>

        <div v-if="store.myActiveLoans.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="l in store.myActiveLoans" 
            :key="l.id"
            class="p-5 rounded-3xl border shadow-sm flex flex-col justify-between"
            :class="l.status === 'overdue' ? 'bg-rose-50/50 border-rose-200' : 'bg-white border-slate-100'"
          >
            <div class="flex gap-3">
              <img :src="l.bookCover" class="w-14 h-20 object-cover rounded-2xl shadow-sm shrink-0" alt="Cover" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono text-slate-400 font-medium">{{ l.id }}</span>
                  <span 
                    class="text-[10px] px-2.5 py-0.5 rounded-full font-bold"
                    :class="l.status === 'overdue' ? 'bg-rose-600 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'"
                  >
                    {{ l.status === 'overdue' ? `⚠️ Telat ${l.daysOverdue} Hari` : 'Tepat Waktu' }}
                  </span>
                </div>
                <h4 class="font-bold text-slate-900 text-xs mt-1.5 line-clamp-2 leading-snug">{{ l.bookTitle }}</h4>
                <div class="text-[11px] text-slate-500 mt-2 space-y-0.5">
                  <div>Dipinjam: {{ new Date(l.borrowDate).toLocaleDateString('id-ID') }}</div>
                  <div>Jatuh Tempo: <strong :class="l.status === 'overdue' ? 'text-rose-600' : 'text-slate-800'">{{ new Date(l.dueDate).toLocaleDateString('id-ID') }}</strong></div>
                </div>
              </div>
            </div>

            <div v-if="l.status === 'overdue'" class="mt-3.5 p-3 rounded-2xl bg-rose-100/70 text-xs text-rose-900 flex justify-between items-center font-medium">
              <span>Status Peminjaman:</span>
              <strong class="text-rose-700 font-extrabold">Segera Kembalikan ke Loket</strong>
            </div>
          </div>
        </div>

        <div v-else class="p-8 rounded-3xl bg-white border border-slate-100 text-center text-xs text-slate-400 shadow-sm">
          Anda tidak memiliki buku yang sedang dipinjam saat ini.
        </div>
      </div>

    </div>

    <!-- Modal Ganti Kata Sandi -->
    <ChangePasswordModal 
      :is-open="isChangePasswordOpen"
      @close="isChangePasswordOpen = false"
    />

    <!-- Modal Ubah Profil Anggota -->
    <EditProfileModal 
      :is-open="isEditProfileOpen"
      :initial-tab="editProfileInitialTab"
      @close="isEditProfileOpen = false"
    />

  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import ChangePasswordModal from '../components/ChangePasswordModal.vue';
import EditProfileModal from '../components/EditProfileModal.vue';
import { 
  UserCheck, QrCode, AlertTriangle, Clock, 
  Timer, BookmarkCheck, BookMarked, LogIn, KeyRound, UserCog,
  AlertCircle, CheckCircle2, Camera
} from 'lucide-vue-next';

const store = useLibraryStore();
const now = ref(Date.now());
const isChangePasswordOpen = ref(false);
const isEditProfileOpen = ref(false);
const editProfileInitialTab = ref<'profile' | 'upgrade'>('profile');
let timerInterval: any = null;

const openEditProfile = (tab: 'profile' | 'upgrade' = 'profile') => {
  editProfileInitialTab.value = tab;
  isEditProfileOpen.value = true;
};

const myRejectedTeacherRequest = computed(() => {
  if (!store.currentUser || store.currentUser.memberType === 'guru') return null;
  const latest = store.myLatestTeacherRequest;
  if (latest && latest.status === 'rejected') {
    return latest;
  }
  return null;
});

const formatDateTime = (ts?: number | string) => {
  if (!ts) return '-';
  const d = new Date(ts);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  timerInterval = setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval);
});

const activeHoldBookings = computed(() => {
  return store.myBookings.filter(b => b.status === 'active_hold');
});

const formatCountdown = (expiresAtStr: string) => {
  const expiry = new Date(expiresAtStr).getTime();
  const diff = expiry - now.value;

  if (diff <= 0) return '00:00:00 (Kadaluarsa)';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const cancelMyBooking = async (bookingId: string) => {
  if (confirm('Apakah Anda ingin membatalkan booking ini? Buku akan dikembalikan ke rak untuk peminjam lain.')) {
    await store.cancelBooking(bookingId);
  }
};
</script>


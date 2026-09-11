<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
  >
    <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
      
      <!-- Modal Header -->
      <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-sm">
            <UserPlus v-if="!member" class="w-5 h-5" />
            <UserCheck v-else class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900">
              {{ member ? 'Edit Data Anggota' : 'Daftarkan Anggota Baru' }}
            </h3>
            <p class="text-xs text-slate-500">
              {{ member ? `Perbarui informasi ${member.name}` : 'Buat kartu digital & QR anggota baru perpustakaan' }}
            </p>
          </div>
        </div>
        <button 
          @click="$emit('close')"
          class="p-2 rounded-full hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 transition cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
        
        <!-- Avatar Upload Section -->
        <div>
          <label class="block font-bold text-slate-700 mb-1.5">Foto Profil Anggota</label>
          <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5">
            <div class="relative shrink-0">
              <img 
                :src="form.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'" 
                alt="Avatar" 
                class="w-14 h-14 rounded-2xl object-cover border border-slate-200 bg-white shadow-xs"
                referrerpolicy="no-referrer"
              />
              <div 
                v-if="isUploadingAvatar" 
                class="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center text-white"
              >
                <Loader2 class="w-4 h-4 animate-spin" />
              </div>
            </div>

            <div class="flex-1 space-y-1">
              <div class="flex items-center gap-2">
                <label 
                  class="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-[11px] cursor-pointer shadow-2xs transition flex items-center gap-1.5"
                  :class="{ 'opacity-50 pointer-events-none': isUploadingAvatar }"
                >
                  <Upload class="w-3.5 h-3.5 text-blue-600" />
                  <span>{{ isUploadingAvatar ? 'Mengunggah...' : 'Upload Foto Profil' }}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    class="hidden" 
                    @change="handleAvatarFileSelect"
                  />
                </label>
                <button 
                  v-if="form.avatar" 
                  type="button" 
                  @click="form.avatar = ''"
                  class="text-[11px] text-slate-400 hover:text-rose-600 transition"
                >
                  Hapus
                </button>
              </div>
              <p class="text-[10px] text-slate-400">Tersimpan di folder uploads/avatar perpustakaan.</p>
            </div>
          </div>
        </div>

        <!-- Full Name -->
        <div>
          <label class="block font-bold text-slate-700 mb-1">Nama Lengkap Anggota *</label>
          <input 
            v-model="form.name" 
            type="text" 
            required 
            placeholder="Contoh: Muhammad Farhan"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs transition"
          />
        </div>

        <!-- Tipe Pengguna: Guru atau Siswa (Default: Siswa) -->
        <div>
          <label class="block font-bold text-slate-700 mb-1">Tipe Pengguna / Keanggotaan Sekolah *</label>
          <div class="grid grid-cols-2 gap-3">
            <label 
              class="p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition"
              :class="form.memberType === 'siswa' ? 'bg-blue-50/80 border-blue-500 text-blue-900 font-bold shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-600'"
            >
              <input type="radio" v-model="form.memberType" value="siswa" class="text-blue-600" />
              <div>
                <div class="text-xs flex items-center gap-1">
                  <span>🎒</span>
                  <span>Siswa (Default)</span>
                </div>
                <div class="text-[10px] text-slate-400 font-normal">Siswa-siswi sekolah</div>
              </div>
            </label>

            <label 
              class="p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition"
              :class="form.memberType === 'guru' ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 font-bold shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-600'"
            >
              <input type="radio" v-model="form.memberType" value="guru" class="text-indigo-600" />
              <div>
                <div class="text-xs flex items-center gap-1">
                  <span>👨‍🏫</span>
                  <span>Guru</span>
                </div>
                <div class="text-[10px] text-slate-400 font-normal">Dewan Guru / Tenaga Pendidik</div>
              </div>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Email -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">Alamat Email *</label>
            <input 
              v-model="form.email" 
              type="email" 
              required 
              placeholder="farhan@gmail.com"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs transition"
            />
          </div>

          <!-- Phone -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">No. WhatsApp / HP *</label>
            <input 
              v-model="form.phone" 
              type="tel" 
              required 
              placeholder="+6281234567890"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs transition"
            />
          </div>
        </div>

        <!-- Role -->
        <div>
          <label class="block font-bold text-slate-700 mb-1">Hak Akses / Peran</label>
          <div class="grid grid-cols-2 gap-3">
            <label 
              class="p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition"
              :class="form.role === 'member' ? 'bg-blue-50/70 border-blue-500 text-blue-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'"
            >
              <input type="radio" v-model="form.role" value="member" class="text-blue-600" />
              <div>
                <div class="text-xs">Anggota Perpustakaan</div>
                <div class="text-[10px] text-slate-400 font-normal">Peminjaman & booking buku</div>
              </div>
            </label>

            <label 
              class="p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition"
              :class="form.role === 'admin' ? 'bg-blue-50/70 border-blue-500 text-blue-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'"
            >
              <input type="radio" v-model="form.role" value="admin" class="text-blue-600" />
              <div>
                <div class="text-xs">Pengelola / Admin</div>
                <div class="text-[10px] text-slate-400 font-normal">Akses penuh sirkulasi</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Address -->
        <div>
          <label class="block font-bold text-slate-700 mb-1">Alamat Domisili / Instansi</label>
          <textarea 
            v-model="form.address" 
            rows="2" 
            placeholder="Jl. Pustaka Indah No. 10, Jakarta"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs transition"
          ></textarea>
        </div>

        <!-- Section: Kata Sandi Akun & Konfirmasi -->
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <KeyRound class="w-4 h-4 text-blue-600" />
              <label class="block font-bold text-slate-800 text-xs">
                {{ member ? 'Ganti Kata Sandi Akun (Opsional)' : 'Kata Sandi Akun Anggota *' }}
              </label>
            </div>
            <span class="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              Min. 6 Karakter
            </span>
          </div>

          <p class="text-[11px] text-slate-500">
            {{ member ? 'Biarkan kosong jika tidak ingin mengubah kata sandi akun anggota ini.' : 'Kata sandi akan digunakan oleh anggota untuk login ke portal web atau kartu digital.' }}
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Input Password -->
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">
                {{ member ? 'Kata Sandi Baru' : 'Kata Sandi *' }}
              </label>
              <div class="relative">
                <input 
                  v-model="form.password" 
                  :type="showPassword ? 'text' : 'password'" 
                  :required="!member"
                  minlength="6"
                  placeholder="Minimal 6 karakter"
                  class="w-full pl-9 pr-9 py-2.5 rounded-xl border bg-white focus:ring-2 outline-none text-slate-800 text-xs transition"
                  :class="passwordError && (!member || form.password) ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'"
                />
                <Lock class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button 
                  type="button" 
                  @click="showPassword = !showPassword"
                  class="absolute right-2.5 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabindex="-1"
                >
                  <Eye v-if="!showPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Input Konfirmasi Password -->
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">
                Konfirmasi Kata Sandi {{ !member ? '*' : '' }}
              </label>
              <div class="relative">
                <input 
                  v-model="form.confirmPassword" 
                  :type="showConfirmPassword ? 'text' : 'password'" 
                  :required="!member || !!form.password"
                  minlength="6"
                  placeholder="Ulangi kata sandi"
                  class="w-full pl-9 pr-9 py-2.5 rounded-xl border bg-white focus:ring-2 outline-none text-slate-800 text-xs transition"
                  :class="passwordError && (!member || form.password) ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'"
                />
                <KeyRound class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button 
                  type="button" 
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-2.5 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabindex="-1"
                >
                  <Eye v-if="!showConfirmPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Indikator Validasi & Kekuatan Kata Sandi -->
          <div v-if="form.password || form.confirmPassword || passwordError" class="space-y-1.5 pt-1">
            <div v-if="passwordError" class="text-[11px] text-rose-600 flex items-center gap-1.5 font-semibold bg-rose-50 p-2 rounded-xl border border-rose-100">
              <AlertCircle class="w-3.5 h-3.5 shrink-0" />
              <span>{{ passwordError }}</span>
            </div>

            <div v-else-if="form.password && form.confirmPassword && form.password === form.confirmPassword && form.password.length >= 6" class="text-[11px] text-emerald-700 flex items-center gap-1.5 font-semibold bg-emerald-50 p-2 rounded-xl border border-emerald-100">
              <CheckCircle2 class="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span>Kata sandi cocok dan memenuhi syarat ({{ form.password.length }} karakter)</span>
            </div>

            <div class="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 pt-0.5">
              <span class="inline-flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full" :class="form.password.length >= 6 ? 'bg-emerald-500' : 'bg-slate-300'"></span>
                Min. 6 karakter
              </span>
              <span>•</span>
              <span class="inline-flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full" :class="/[0-9]/.test(form.password) ? 'bg-emerald-500' : 'bg-slate-300'"></span>
                Ada angka
              </span>
              <span>•</span>
              <span class="inline-flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full" :class="/[a-zA-Z]/.test(form.password) ? 'bg-emerald-500' : 'bg-slate-300'"></span>
                Ada huruf
              </span>
              <span>•</span>
              <span class="inline-flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full" :class="form.password && form.confirmPassword && form.password === form.confirmPassword ? 'bg-emerald-500' : 'bg-slate-300'"></span>
                Konfirmasi cocok
              </span>
            </div>
          </div>
        </div>

        <!-- Info Card -->
        <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-[11px] text-slate-600">
          <QrCode class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p>Nomor Kartu Anggota (misal: <strong class="text-slate-800 font-mono">LIB-2026-XXXX</strong>) dan barcode QR digital akan otomatis dibuat dan siap dicetak/di-scan.</p>
        </div>

        <!-- Action Buttons -->
        <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button 
            type="button" 
            @click="$emit('close')"
            class="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
          >
            Batal
          </button>
          <button 
            type="submit" 
            :disabled="isSubmitting"
            class="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            <Check class="w-4 h-4" />
            {{ member ? 'Simpan Perubahan' : 'Daftarkan Anggota' }}
          </button>
        </div>
      </form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import type { Member } from '../types.js';
import { 
  UserPlus, UserCheck, X, Check, QrCode, Upload, Loader2,
  Lock, KeyRound, Eye, EyeOff, AlertCircle, CheckCircle2 
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  member?: Member | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useLibraryStore();
const isSubmitting = ref(false);
const isUploadingAvatar = ref(false);

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const passwordError = ref('');

const form = ref({
  name: '',
  email: '',
  phone: '',
  role: 'member' as 'admin' | 'member',
  memberType: 'siswa' as 'guru' | 'siswa',
  avatar: '',
  address: '',
  password: '',
  confirmPassword: ''
});

watch(() => props.member, (newVal) => {
  passwordError.value = '';
  showPassword.value = false;
  showConfirmPassword.value = false;

  if (newVal) {
    form.value = {
      name: newVal.name,
      email: newVal.email,
      phone: newVal.phone,
      role: newVal.role,
      memberType: newVal.memberType || 'siswa',
      avatar: newVal.avatar || '',
      address: newVal.address || '',
      password: '',
      confirmPassword: ''
    };
  } else {
    form.value = {
      name: '',
      email: '',
      phone: '',
      role: 'member',
      memberType: 'siswa',
      avatar: '',
      address: '',
      password: '',
      confirmPassword: ''
    };
  }
}, { immediate: true });

async function handleAvatarFileSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  isUploadingAvatar.value = true;

  try {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('filename', `member_${Date.now()}`);

    const res = await fetch('/api/upload-avatar', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Gagal mengunggah foto profil');
    }

    form.value.avatar = data.url;
    store.showToast('Foto profil anggota berhasil diunggah!');
  } catch (err: any) {
    console.error('Upload avatar error:', err);
    store.setError(err?.message || 'Gagal mengunggah foto profil');
  } finally {
    isUploadingAvatar.value = false;
    target.value = '';
  }
}

const handleSubmit = async () => {
  if (!form.value.name || !form.value.email || !form.value.phone) return;

  passwordError.value = '';

  // Validasi password untuk anggota baru
  if (!props.member) {
    if (!form.value.password) {
      passwordError.value = 'Kata sandi wajib diisi untuk pendaftaran anggota baru.';
      return;
    }
    if (form.value.password.length < 6) {
      passwordError.value = 'Kata sandi minimal 6 karakter.';
      return;
    }
    if (form.value.password !== form.value.confirmPassword) {
      passwordError.value = 'Konfirmasi kata sandi tidak cocok. Pastikan kedua kolom sama.';
      return;
    }
  } else if (form.value.password) {
    // Validasi jika admin mengganti password saat edit data anggota
    if (form.value.password.length < 6) {
      passwordError.value = 'Kata sandi baru minimal 6 karakter.';
      return;
    }
    if (form.value.password !== form.value.confirmPassword) {
      passwordError.value = 'Konfirmasi kata sandi baru tidak cocok.';
      return;
    }
  }

  isSubmitting.value = true;

  try {
    const payload: any = {
      name: form.value.name.trim(),
      email: form.value.email.trim(),
      phone: form.value.phone.trim(),
      role: form.value.role,
      memberType: form.value.memberType,
      avatar: form.value.avatar,
      address: form.value.address
    };

    if (form.value.password) {
      payload.password = form.value.password;
    }

    if (props.member) {
      await store.updateMember(props.member.id, payload);
    } else {
      await store.createMemberByAdmin(payload);
    }
    emit('close');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

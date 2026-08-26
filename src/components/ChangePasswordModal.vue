<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
    <div class="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
      
      <!-- Modal Header -->
      <div class="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
            <KeyRound class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-extrabold text-sm sm:text-base">Ganti Kata Sandi</h3>
            <p class="text-[11px] text-slate-400">Perbarui kata sandi akun Anda secara berkala</p>
          </div>
        </div>
        <button 
          @click="$emit('close')"
          class="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4 text-xs">
        
        <div v-if="errorMsg" class="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
          <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
          <span>{{ errorMsg }}</span>
        </div>

        <div v-if="successMsg" class="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-start gap-2">
          <CheckCircle class="w-4 h-4 shrink-0 mt-0.5" />
          <span>{{ successMsg }}</span>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Kata Sandi Saat Ini / Lama</label>
          <div class="relative">
            <input 
              v-model="form.oldPassword"
              :type="showOld ? 'text' : 'password'"
              placeholder="Masukkan kata sandi lama Anda"
              class="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs"
            />
            <Lock class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <button 
              type="button" 
              @click="showOld = !showOld"
              class="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <Eye v-if="!showOld" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
            </button>
          </div>
          <div class="text-[10px] text-slate-400 mt-1">Kosongkan jika sebelumnya Anda belum memiliki kata sandi.</div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Kata Sandi Baru *</label>
          <div class="relative">
            <input 
              v-model="form.newPassword"
              :type="showNew ? 'text' : 'password'"
              required
              minlength="4"
              placeholder="Minimal 4 karakter"
              class="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs"
            />
            <KeyRound class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <button 
              type="button" 
              @click="showNew = !showNew"
              class="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <Eye v-if="!showNew" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Konfirmasi Kata Sandi Baru *</label>
          <div class="relative">
            <input 
              v-model="form.confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              required
              placeholder="Ulangi kata sandi baru"
              class="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs"
            />
            <Lock class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <button 
              type="button" 
              @click="showConfirm = !showConfirm"
              class="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <Eye v-if="!showConfirm" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="pt-2 flex gap-2.5">
          <button 
            type="button"
            @click="$emit('close')"
            class="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            Batal
          </button>
          <button 
            type="submit"
            :disabled="isLoading"
            class="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md shadow-blue-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Check class="w-4 h-4" />
            <span>{{ isLoading ? 'Menyimpan...' : 'Simpan Sandi' }}</span>
          </button>
        </div>

      </form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import { KeyRound, Lock, Eye, EyeOff, X, AlertCircle, CheckCircle, Check } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close']);
const store = useLibraryStore();

const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const showOld = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);

const isLoading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

const handleSubmit = async () => {
  if (form.value.newPassword !== form.value.confirmPassword) {
    errorMsg.value = 'Konfirmasi kata sandi baru tidak cocok';
    return;
  }

  if (form.value.newPassword.length < 4) {
    errorMsg.value = 'Kata sandi minimal 4 karakter';
    return;
  }

  isLoading.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    const res = await store.changePassword(form.value.oldPassword, form.value.newPassword);
    if (res.success) {
      successMsg.value = res.message || 'Kata sandi berhasil diperbarui!';
      form.value = { oldPassword: '', newPassword: '', confirmPassword: '' };
      setTimeout(() => {
        emit('close');
        successMsg.value = '';
      }, 1500);
    } else {
      errorMsg.value = res.error || 'Gagal mengubah kata sandi';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

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
import { UserPlus, UserCheck, X, Check, QrCode } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  member?: Member | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useLibraryStore();
const isSubmitting = ref(false);

const form = ref({
  name: '',
  email: '',
  phone: '',
  role: 'member' as 'admin' | 'member',
  address: ''
});

watch(() => props.member, (newVal) => {
  if (newVal) {
    form.value = {
      name: newVal.name,
      email: newVal.email,
      phone: newVal.phone,
      role: newVal.role,
      address: newVal.address || ''
    };
  } else {
    form.value = {
      name: '',
      email: '',
      phone: '',
      role: 'member',
      address: ''
    };
  }
}, { immediate: true });

const handleSubmit = async () => {
  if (!form.value.name || !form.value.email || !form.value.phone) return;
  isSubmitting.value = true;

  try {
    if (props.member) {
      await store.updateMember(props.member.id, form.value);
    } else {
      await store.createMemberByAdmin(form.value);
    }
    emit('close');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
    <div class="bg-white border border-slate-100 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
      
      <!-- Header -->
      <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <BellRing class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-base text-slate-900">Kirim Notifikasi Keterlambatan</h3>
            <p class="text-xs text-slate-500">Pengiriman Pesan Peringatan via Email atau SMS / WA</p>
          </div>
        </div>
        <button @click="$emit('close')" class="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form -->
      <div class="p-6 space-y-4 text-xs">
        
        <!-- Target Selection -->
        <div>
          <label class="block font-bold text-slate-700 mb-1.5">Pilih Anggota Terlambat</label>
          <select 
            v-model="selectedLoanId" 
            @change="autoPopulateTemplate"
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="">-- Pilih dari Peminjaman Overdue --</option>
            <option v-for="l in store.overdueLoans" :key="l.id" :value="l.id">
              {{ l.memberName }} • "{{ l.bookTitle }}" (Telat {{ l.daysOverdue }} Hari)
            </option>
          </select>
        </div>

        <!-- Channel Type -->
        <div>
          <label class="block font-bold text-slate-700 mb-1.5">Saluran Notifikasi</label>
          <div class="grid grid-cols-3 gap-2">
            <button 
              type="button" 
              @click="channelType = 'email'"
              class="py-2.5 px-3 rounded-2xl border flex items-center justify-center gap-2 transition cursor-pointer"
              :class="channelType === 'email' ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'border-slate-200 bg-slate-50 text-slate-600'"
            >
              <Mail class="w-4 h-4" />
              Email
            </button>
            <button 
              type="button" 
              @click="channelType = 'sms'"
              class="py-2.5 px-3 rounded-2xl border flex items-center justify-center gap-2 transition cursor-pointer"
              :class="channelType === 'sms' ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'border-slate-200 bg-slate-50 text-slate-600'"
            >
              <MessageSquare class="w-4 h-4" />
              SMS
            </button>
            <button 
              type="button" 
              @click="channelType = 'whatsapp'"
              class="py-2.5 px-3 rounded-2xl border flex items-center justify-center gap-2 transition cursor-pointer"
              :class="channelType === 'whatsapp' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' : 'border-slate-200 bg-slate-50 text-slate-600'"
            >
              <Smartphone class="w-4 h-4" />
              WhatsApp
            </button>
          </div>
        </div>

        <!-- Recipient & Subject -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Penerima ({{ channelType === 'email' ? 'Email' : 'No. HP' }})</label>
            <input 
              v-model="recipient" 
              type="text" 
              placeholder="budi@pustaka.id atau +6281..." 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
          <div v-if="channelType === 'email'">
            <label class="block font-bold text-slate-700 mb-1">Subjek Email</label>
            <input 
              v-model="subject" 
              type="text" 
              placeholder="Peringatan Keterlambatan..." 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
        </div>

        <!-- Message Body -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="font-bold text-slate-700">Isi Pesan Notifikasi</label>
            <button 
              type="button" 
              @click="applyTemplate('formal')" 
              class="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Gunakan Template Standar
            </button>
          </div>
          <textarea 
            v-model="message" 
            rows="4" 
            class="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-blue-500 text-xs font-medium"
          ></textarea>
        </div>

        <!-- Live Simulation Preview Bubble -->
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div class="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles class="w-3.5 h-3.5 text-blue-600" />
            Live Preview Notifikasi (Tampilan di Perangkat Anggota)
          </div>
          <div class="p-3.5 rounded-xl bg-white text-slate-800 font-mono text-[11px] border border-slate-200/80 whitespace-pre-wrap shadow-sm">
            <strong v-if="channelType === 'email'">Subjek: {{ subject }}</strong>
{{ message || '(Pesan kosong)' }}
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
        <button 
          type="button" 
          @click="$emit('close')"
          class="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
        >
          Tutup
        </button>
        <button 
          type="button"
          @click="handleSendNotification"
          :disabled="!recipient || !message || isSending"
          class="px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          <Send class="w-4 h-4" />
          {{ isSending ? 'Mengirim...' : 'Kirim Notifikasi Sekarang' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import type { Loan } from '../types.js';
import { BellRing, Mail, MessageSquare, Smartphone, Sparkles, Send, X } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  preselectedLoan?: Loan | null;
}>();

const emit = defineEmits(['close', 'sent']);

const store = useLibraryStore();
const selectedLoanId = ref('');
const channelType = ref<'email' | 'sms' | 'whatsapp'>('email');
const recipient = ref('');
const subject = ref('');
const message = ref('');
const isSending = ref(false);

watch(() => props.preselectedLoan, (val) => {
  if (val) {
    selectedLoanId.value = val.id;
    autoPopulateTemplate();
  }
}, { immediate: true });

function autoPopulateTemplate() {
  const loan = store.loans.find(l => l.id === selectedLoanId.value);
  if (!loan) return;

  if (channelType.value === 'email') {
    recipient.value = loan.memberEmail || 'anggota@pustaka.id';
  } else {
    recipient.value = loan.memberPhone || '+6281234567890';
  }

  subject.value = `⚠️ Peringatan Keterlambatan: Buku "${loan.bookTitle}"`;
  applyTemplate('formal');
}

function applyTemplate(type: string) {
  const loan = store.loans.find(l => l.id === selectedLoanId.value);
  const memberName = loan ? loan.memberName : 'Anggota';
  const bookTitle = loan ? loan.bookTitle : 'Buku Perpustakaan';
  const days = loan ? loan.daysOverdue : 3;

  if (channelType.value === 'email') {
    message.value = `Yth. ${memberName},\n\nKami menginformasikan bahwa buku "${bookTitle}" yang Anda pinjam telah melewati batas waktu pengembalian (${days} hari terlambat).\n\nSanksi penangguhan (suspend) kartu anggota aktif hingga buku dikembalikan.\n\nMohon segera mengembalikan buku ke loket sirkulasi perpustakaan.\n\nTerima kasih,\nTim Perpustakaan PustakaModern`;
  } else {
    message.value = `[PustakaModern] Peringatan: Halo ${memberName}, buku "${bookTitle}" terlambat ${days} hari. Segera kembalikan ke perpustakaan untuk mengaktifkan kembali status kartu member Anda.`;
  }
}

watch(channelType, () => {
  autoPopulateTemplate();
});

const handleSendNotification = async () => {
  if (!recipient.value || !message.value) return;

  isSending.value = true;
  try {
    const loan = store.loans.find(l => l.id === selectedLoanId.value);
    const res = await store.sendNotification({
      memberId: loan ? loan.memberId : undefined,
      recipient: recipient.value,
      type: channelType.value,
      subject: subject.value,
      message: message.value,
      triggerReason: 'overdue_reminder'
    });

    if (res.success) {
      emit('sent', res.log);
      emit('close');
    }
  } finally {
    isSending.value = false;
  }
};
</script>


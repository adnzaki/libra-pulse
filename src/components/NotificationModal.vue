<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
    <div class="bg-white border border-slate-100 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
      
      <!-- Header -->
      <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Mail class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-base text-slate-900">Kirim Peringatan Keterlambatan</h3>
            <p class="text-xs text-slate-500">Kirim Surat Peringatan Resmi via Email ke Anggota</p>
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

        <!-- Recipient & Subject -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Email Penerima</label>
            <input 
              v-model="recipient" 
              type="email" 
              placeholder="budi@example.com" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Subjek Email</label>
            <input 
              v-model="subject" 
              type="text" 
              placeholder="Peringatan Keterlambatan Buku..." 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
        </div>

        <!-- Message Body -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="font-bold text-slate-700">Isi Pesan Email Peringatan</label>
            <button 
              type="button" 
              @click="applyTemplate" 
              class="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Reset ke Template Standar
            </button>
          </div>
          <textarea 
            v-model="message" 
            rows="5" 
            class="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-blue-500 text-xs font-medium leading-relaxed"
          ></textarea>
        </div>

        <!-- Live Preview -->
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div class="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <Sparkles class="w-3.5 h-3.5 text-blue-600" />
              Preview Tampilan Email Anggota
            </span>
            <span class="text-slate-400 normal-case font-normal text-[10px]">Kepada: {{ recipient || '-' }}</span>
          </div>
          <div class="p-3.5 rounded-xl bg-white text-slate-800 text-[11px] border border-slate-200 whitespace-pre-wrap font-sans shadow-sm leading-relaxed">
            <div class="pb-2 mb-2 border-b border-slate-100 font-bold text-slate-900 text-xs">
              {{ subject || '(Tanpa Subjek)' }}
            </div>
{{ message || '(Pesan kosong)' }}
          </div>
        </div>

        <!-- Direct Email Launch Quick Link -->
        <div class="flex flex-wrap items-center justify-between gap-2 p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-blue-900 text-[11px]">
          <div class="flex items-center gap-2">
            <ExternalLink class="w-4 h-4 text-blue-600 shrink-0" />
            <span>Kirim via akun pribadi Anda sekarang juga:</span>
          </div>
          <div class="flex items-center gap-2">
            <a 
              :href="gmailWebUrl" 
              target="_blank" 
              rel="noopener noreferrer"
              class="px-3 py-1 bg-white hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition shadow-xs flex items-center gap-1.5"
            >
              Buka di Gmail Web
            </a>
            <a 
              :href="mailtoUrl"
              class="px-3 py-1 bg-white hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition shadow-xs flex items-center gap-1.5"
            >
              Buka di Mail Client
            </a>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
        <div class="text-[11px] text-slate-400">
          Saluran: <span class="font-bold text-slate-600">Email Resmi</span>
        </div>
        <div class="flex items-center gap-2">
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
            {{ isSending ? 'Mengirim...' : 'Kirim & Catat Email' }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import type { Loan } from '../types.js';
import { Mail, Sparkles, Send, X, ExternalLink } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  preselectedLoan?: Loan | null;
}>();

const emit = defineEmits(['close', 'sent']);

const store = useLibraryStore();
const selectedLoanId = ref('');
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

  const member = store.members.find(m => m.id === loan.memberId || m.cardNumber === loan.memberCardNumber);
  recipient.value = loan.memberEmail || member?.email || 'anggota@pustaka.id';
  subject.value = `⚠️ Peringatan Keterlambatan Pengembalian: Buku "${loan.bookTitle}"`;
  applyTemplate();
}

function applyTemplate() {
  const loan = store.loans.find(l => l.id === selectedLoanId.value);
  const memberName = loan ? loan.memberName : 'Anggota';
  const bookTitle = loan ? loan.bookTitle : 'Buku Perpustakaan';
  const days = loan ? loan.daysOverdue : 1;
  const dueDate = loan ? loan.dueDate : '-';

  message.value = `Yth. Sdr/i ${memberName},

Kami menginformasikan bahwa buku "${bookTitle}" yang Anda pinjam telah melewati tanggal jatuh tempo (${dueDate}) dan saat ini berstatus TERLAMBAT (${days} hari).

Sesuai ketentuan perpustakaan, kartu anggota Anda dalam status penangguhan (suspend) sementara hingga buku dikembalikan ke meja sirkulasi perpustakaan.

Mohon segera mengembalikan buku fisik ke loket sirkulasi agar kartu anggota dapat diaktifkan kembali secara otomatis.

Terima kasih atas perhatian dan kerja samanya.

Salam hormat,
Layanan Sirkulasi & Koleksi Perpustakaan`;
}

const gmailWebUrl = computed(() => {
  const to = encodeURIComponent(recipient.value || '');
  const su = encodeURIComponent(subject.value || '');
  const body = encodeURIComponent(message.value || '');
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${body}`;
});

const mailtoUrl = computed(() => {
  const to = encodeURIComponent(recipient.value || '');
  const su = encodeURIComponent(subject.value || '');
  const body = encodeURIComponent(message.value || '');
  return `mailto:${to}?subject=${su}&body=${body}`;
});

const handleSendNotification = async () => {
  if (!recipient.value || !message.value) return;

  isSending.value = true;
  try {
    const loan = store.loans.find(l => l.id === selectedLoanId.value);
    const res = await store.sendNotification({
      memberId: loan ? loan.memberId : undefined,
      recipient: recipient.value,
      type: 'email',
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

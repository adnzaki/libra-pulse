<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden sm:overflow-y-auto animate-in fade-in duration-200">
    <div class="bg-white border-0 sm:border sm:border-slate-100 w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-xl sm:rounded-3xl rounded-none shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
      
      <!-- Sticky Header -->
      <div class="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div class="flex items-center gap-3">
          <div class="w-9 sm:w-10 h-9 sm:h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
            <Mail class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-sm sm:text-base text-slate-900">Kirim Peringatan Keterlambatan</h3>
            <p class="text-[11px] sm:text-xs text-slate-500">Kirim Surat Peringatan Resmi via Email ke Anggota</p>
          </div>
        </div>
        <button 
          @click="$emit('close')" 
          type="button"
          aria-label="Tutup modal notifikasi"
          class="p-2 sm:p-2.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 active:scale-95 transition cursor-pointer flex items-center justify-center shrink-0"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form (Scrollable) -->
      <div class="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
        
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

        <!-- Quick Actions: WhatsApp & Direct Email -->
        <div class="space-y-2 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-700 flex items-center gap-1.5 text-[11px]">
              <Share2 class="w-3.5 h-3.5 text-blue-600" />
              Alternatif Saluran Pengingat Langsung:
            </span>
            <button 
              type="button" 
              @click="copyMessage" 
              class="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <Check v-if="copied" class="w-3.5 h-3.5 text-emerald-600" />
              <Copy v-else class="w-3.5 h-3.5" />
              <span>{{ copied ? 'Tersalin!' : 'Salin Teks Pesan' }}</span>
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-2 pt-1">
            <!-- WhatsApp Button -->
            <a 
              v-if="whatsAppUrl"
              :href="whatsAppUrl" 
              target="_blank" 
              rel="noopener noreferrer"
              class="w-full sm:w-auto px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 text-[11px]"
            >
              <MessageSquare class="w-3.5 h-3.5 shrink-0" />
              <span>Kirim via WhatsApp ({{ memberPhoneFormatted || 'Anggota' }})</span>
            </a>

            <!-- Gmail Web -->
            <a 
              :href="gmailWebUrl" 
              target="_blank" 
              rel="noopener noreferrer"
              class="w-full sm:w-auto px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 transition shadow-xs flex items-center justify-center gap-1.5 text-[11px]"
            >
              <ExternalLink class="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Buka di Gmail Web</span>
            </a>
          </div>
        </div>

      </div>

      <!-- Sticky Footer -->
      <div class="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/95 backdrop-blur-md border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 sticky bottom-0 z-20">
        <div class="text-[11px] text-slate-400 text-center sm:text-left">
          Status: <span class="font-bold text-slate-600">Email Server Otomatis</span>
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
            class="flex-1 sm:flex-initial px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send class="w-4 h-4" />
            {{ isSending ? 'Mengirim...' : 'Kirim Email via Server' }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, toRef } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import type { Loan } from '../types.js';
import { Mail, Sparkles, Send, X, ExternalLink, MessageSquare, Copy, Check, Share2 } from 'lucide-vue-next';
import { useModalBack } from '../composables/useModalBack.js';

const props = defineProps<{
  isOpen: boolean;
  preselectedLoan?: Loan | null;
}>();

const emit = defineEmits(['close', 'sent']);

useModalBack(toRef(props, 'isOpen'), () => emit('close'), 'notification_modal');

const store = useLibraryStore();
const selectedLoanId = ref('');
const recipient = ref('');
const subject = ref('');
const message = ref('');
const isSending = ref(false);
const copied = ref(false);

watch(() => props.preselectedLoan, (val) => {
  if (val) {
    selectedLoanId.value = val.id;
    autoPopulateTemplate();
  }
}, { immediate: true });

// Ambil data anggota yang meminjam buku terpilih
const activeMember = computed(() => {
  const loan = store.loans.find(l => l.id === selectedLoanId.value);
  if (!loan) return null;
  return store.members.find(m => m.id === loan.memberId || m.cardNumber === loan.memberCardNumber) || null;
});

const memberPhoneFormatted = computed(() => {
  const phone = activeMember.value?.phone?.trim() || '';
  return phone || null;
});

const whatsAppUrl = computed(() => {
  const rawPhone = activeMember.value?.phone?.trim() || '';
  if (!rawPhone) return null;

  // Bersihkan format (hilangkan +, -, spasi)
  let cleanPhone = rawPhone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('62')) {
    cleanPhone = '62' + cleanPhone;
  }

  const encodedText = encodeURIComponent(message.value || '');
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
});

const copyMessage = async () => {
  if (!message.value) return;
  try {
    await navigator.clipboard.writeText(message.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2500);
  } catch (err) {
    console.warn('Gagal menyalin:', err);
  }
};

function autoPopulateTemplate() {
  const loan = store.loans.find(l => l.id === selectedLoanId.value);
  if (!loan) return;

  const member = store.members.find(m => m.id === loan.memberId || m.cardNumber === loan.memberCardNumber);
  recipient.value = loan.memberEmail || member?.email || 'anggota@pustaka.id';
  // Gunakan subjek resmi institusi tanpa emoji/kata spammy agar tidak masuk spam
  subject.value = `Pemberitahuan Sirkulasi Buku: "${loan.bookTitle}" - Perpustakaan SDN Pengasinan VII`;
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

Sesuai ketentuan perpustakaan, kartu anggota Anda dalam status penangguhan (suspend) sementara hingga buku dikembalikan ke loket sirkulasi perpustakaan.

Mohon segera mengembalikan buku fisik ke loket sirkulasi agar kartu anggota dapat diaktifkan kembali secara otomatis.

Terima kasih atas perhatian dan kerja samanya.

Salam hormat,
Layanan Sirkulasi & Koleksi Perpustakaan SDN Pengasinan VII`;
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

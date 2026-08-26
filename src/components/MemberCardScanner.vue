<template>
  <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
    
    <!-- Title & Toggle -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <QrCode class="w-5 h-5" />
        </div>
        <div>
          <h3 class="font-bold text-base text-slate-900">Scan Kartu Member Perpustakaan</h3>
          <p class="text-xs text-slate-500">Peminjaman kilat tanpa login manual</p>
        </div>
      </div>

      <div class="flex rounded-full bg-slate-100 p-1 text-xs">
        <button 
          @click="mode = 'camera'"
          class="px-3 py-1 rounded-full font-bold transition flex items-center gap-1.5 cursor-pointer"
          :class="mode === 'camera' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
        >
          <Camera class="w-3.5 h-3.5" />
          Kamera QR
        </button>
        <button 
          @click="mode = 'manual'"
          class="px-3 py-1 rounded-full font-bold transition flex items-center gap-1.5 cursor-pointer"
          :class="mode === 'manual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
        >
          <Keyboard class="w-3.5 h-3.5" />
          Input Manual
        </button>
      </div>
    </div>

    <!-- Camera Mode -->
    <div v-if="mode === 'camera'" class="space-y-3">
      <div class="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 aspect-video flex flex-col items-center justify-center shadow-inner">
        <div id="qr-reader" class="w-full h-full max-h-64"></div>
        
        <div v-if="!cameraActive" class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-900/90 space-y-3">
          <Camera class="w-10 h-10 text-slate-500 animate-pulse" />
          <p class="text-xs text-slate-300 max-w-xs">Arahkan kamera perangkat ke QR Code pada kartu member fisik atau digital</p>
          <button 
            @click="startCamera"
            class="px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Sparkles class="w-3.5 h-3.5" />
            Aktifkan Scanner Kamera
          </button>
        </div>

        <div v-if="cameraActive" class="absolute top-3 right-3 z-10">
          <button 
            @click="stopCamera"
            class="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-md cursor-pointer"
          >
            Matikan Kamera
          </button>
        </div>
      </div>
      <p class="text-[11px] text-slate-400 text-center">Mendukung pembacaan QR Code kartu member secara real-time.</p>
    </div>

    <!-- Manual Quick Scan Mode -->
    <div v-else class="space-y-4">
      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1.5">Nomor Kartu Member / Kode Barcode</label>
        <div class="flex gap-2">
          <input 
            v-model="inputCardNumber" 
            @keyup.enter="handleManualLookup"
            type="text" 
            placeholder="Contoh: LIB-2026-8801"
            class="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 uppercase font-mono font-bold"
          />
          <button 
            @click="handleManualLookup"
            :disabled="isLoading"
            class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm shadow-blue-200"
          >
            <Scan class="w-4 h-4" />
            {{ isLoading ? 'Mengecek...' : 'Validasi Kartu' }}
          </button>
        </div>
      </div>

      <!-- Quick select for existing members if admin -->
      <div v-if="store.isAdmin && store.members.filter(mem => mem.role === 'member').length > 0" class="space-y-2">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pilih Cepat Member Terdaftar:</span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <button 
            v-for="m in store.members.filter(mem => mem.role === 'member')"
            :key="m.id"
            @click="selectQuickMember(m.cardNumber)"
            class="p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer"
            :class="m.isSuspended ? 'bg-rose-50 border-rose-200 hover:border-rose-300' : 'bg-slate-50 border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/50'"
          >
            <div>
              <div class="font-bold text-slate-800">{{ m.name }}</div>
              <div class="text-[10px] font-mono text-blue-600 font-semibold">{{ m.cardNumber }}</div>
            </div>
            <span 
              class="text-[10px] px-2.5 py-0.5 rounded-full font-bold"
              :class="m.isSuspended ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'"
            >
              {{ m.isSuspended ? 'SUSPEND' : 'AKTIF' }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Scanned Member Result Card (Bento Sub-Card) -->
    <div v-if="scannedResult" class="p-5 rounded-3xl border animate-in fade-in duration-200 shadow-sm" :class="scannedResult.member.isSuspended ? 'bg-rose-50/50 border-rose-200' : 'bg-blue-50/40 border-blue-100'">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3.5">
          <img :src="scannedResult.member.avatar" class="w-12 h-12 rounded-2xl object-cover border-2 shadow-sm" :class="scannedResult.member.isSuspended ? 'border-rose-400' : 'border-blue-400'" alt="Avatar" />
          <div>
            <div class="flex items-center gap-2">
              <h4 class="font-bold text-slate-900 text-sm">{{ scannedResult.member.name }}</h4>
              <span class="text-[9px] font-mono px-2.5 py-0.5 rounded-full font-bold" :class="scannedResult.member.isSuspended ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'">
                {{ scannedResult.member.isSuspended ? 'AKUN DISUSPEND' : 'MEMBER AKTIF' }}
              </span>
            </div>
            <div class="text-xs text-blue-600 font-mono font-semibold mt-0.5">{{ scannedResult.member.cardNumber }} • HP: {{ scannedResult.member.phone }}</div>
            <div class="text-xs text-slate-500 mt-1">
              Pinjaman Aktif: <strong class="text-slate-800">{{ scannedResult.activeLoans?.length || 0 }}</strong> • Booking Aktif: <strong class="text-slate-800">{{ scannedResult.activeBookings?.length || 0 }}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Suspend Warning Notice -->
      <div v-if="scannedResult.member.isSuspended" class="mt-3.5 p-3 rounded-2xl bg-rose-100/80 border border-rose-200 text-xs text-rose-900 space-y-1">
        <div class="font-bold flex items-center gap-1.5">
          <AlertTriangle class="w-4 h-4 text-rose-600" />
          Peringatan: Anggota ini sedang dalam status Suspend
        </div>
        <p class="text-[11px] text-rose-700">{{ scannedResult.member.suspendReason || 'Keterlambatan pengembalian buku.' }}</p>
        <p class="text-[11px] font-bold text-rose-800">Suspend berlaku sampai: {{ new Date(scannedResult.member.suspendedUntil || '').toLocaleDateString('id-ID') }}</p>
      </div>

      <div class="mt-4 flex gap-2">
        <button 
          @click="$emit('selected', scannedResult.member)"
          class="flex-1 py-2.5 px-4 rounded-full text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
          :class="scannedResult.member.isSuspended ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'"
        >
          <UserCheck class="w-4 h-4" />
          Gunakan Member Ini untuk Transaksi Sirkulasi
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, Camera, Keyboard, Sparkles, Scan, AlertTriangle, UserCheck } from 'lucide-vue-next';

const emit = defineEmits(['selected']);

const store = useLibraryStore();
const mode = ref<'manual' | 'camera'>('manual');
const inputCardNumber = ref('');
const isLoading = ref(false);
const scannedResult = ref<any>(null);
const cameraActive = ref(false);
let html5QrCode: Html5Qrcode | null = null;

const startCamera = async () => {
  try {
    cameraActive.value = true;
    html5QrCode = new Html5Qrcode('qr-reader');
    await html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        handleCardFound(decodedText);
        stopCamera();
      },
      () => {}
    );
  } catch (err) {
    console.error('Camera QR error', err);
    store.setError('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.');
    cameraActive.value = false;
  }
};

const stopCamera = async () => {
  if (html5QrCode && cameraActive.value) {
    try {
      await html5QrCode.stop();
      html5QrCode = null;
    } catch (err) {
      console.error(err);
    }
  }
  cameraActive.value = false;
};

const handleManualLookup = async () => {
  if (!inputCardNumber.value.trim()) return;
  await handleCardFound(inputCardNumber.value.trim());
};

const selectQuickMember = async (card: string) => {
  inputCardNumber.value = card;
  await handleCardFound(card);
};

const handleCardFound = async (cardNumber: string) => {
  isLoading.value = true;
  try {
    const res = await store.lookupMemberByCard(cardNumber);
    if (res.success) {
      scannedResult.value = res.data;
      store.showToast(`Kartu ${res.data.member.name} (${res.data.member.cardNumber}) terdeteksi!`);
    } else {
      scannedResult.value = null;
      store.setError(res.error);
    }
  } finally {
    isLoading.value = false;
  }
};

onBeforeUnmount(() => {
  stopCamera();
});
</script>


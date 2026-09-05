<template>
  <div class="space-y-6 max-w-4xl mx-auto pb-12">
    <!-- Header -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
            <Database class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Pengaturan Sistem & Database</h1>
            <p class="text-xs text-slate-500 mt-0.5">Kelola sinkronisasi Cloud Firestore, unduhan offline, serta cadangkan & pulihkan database.</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Cloud Firestore Terhubung
          </span>
        </div>
      </div>
    </div>

    <!-- Backup & Restore Section (Highlight Utama) -->
    <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50 space-y-6">
      <div class="flex items-start justify-between flex-wrap gap-4">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-400/30">
            <Archive class="w-3.5 h-3.5" />
            Migrasi & Cadangan Data
          </div>
          <h2 class="text-xl font-extrabold text-white">Cadangkan & Pulihkan Database (JSON)</h2>
          <p class="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Unduh seluruh data perpustakaan (koleksi buku, data siswa/anggota, rak, peminjaman aktif & riwayat) ke dalam satu file format JSON. Sangat berguna untuk arsip keamanan rutin maupun migrasi antar proyek Firebase.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <!-- Tombol Backup (Unduh JSON) -->
        <div class="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <div class="flex items-center gap-2.5 text-blue-400">
              <Download class="w-5 h-5" />
              <h3 class="font-bold text-white text-sm">Unduh Cadangan Database</h3>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed">
              Ekspor seluruh isi database saat ini menjadi berkas <code class="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded text-[11px]">.json</code> yang bisa disimpan di komputer/HP Anda.
            </p>
          </div>

          <button 
            @click="handleExportBackup"
            :disabled="isExporting"
            class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-md shadow-blue-900/40 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Loader2 v-if="isExporting" class="w-4 h-4 animate-spin" />
            <Download v-else class="w-4 h-4" />
            <span>{{ isExporting ? 'Mengekstrak Data...' : 'Unduh Cadangan (Backup JSON)' }}</span>
          </button>
        </div>

        <!-- Tombol Restore (Unggah & Pulihkan JSON) -->
        <div class="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/70 flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <div class="flex items-center gap-2.5 text-emerald-400">
              <UploadCloud class="w-5 h-5" />
              <h3 class="font-bold text-white text-sm">Pulihkan Database (Restore)</h3>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed">
              Unggah berkas <code class="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded text-[11px]">.json</code> hasil cadangan sebelumnya untuk mengisi kembali atau memulihkan data ke Cloud Firestore.
            </p>
          </div>

          <div>
            <!-- Hidden File Input -->
            <input 
              ref="fileInputRef"
              type="file" 
              accept=".json,application/json" 
              class="hidden" 
              @change="onFileSelectedForRestore"
            />
            
            <button 
              @click="triggerFileInput"
              :disabled="isRestoring"
              class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-900/40 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Loader2 v-if="isRestoring" class="w-4 h-4 animate-spin" />
              <UploadCloud v-else class="w-4 h-4" />
              <span>{{ isRestoring ? 'Memproses Berkas...' : 'Pilih File & Pulihkan (Restore JSON)' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Progress status saat restore -->
      <div v-if="isRestoring" class="p-4 bg-slate-950/70 rounded-2xl border border-emerald-500/40 space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="text-emerald-300 font-semibold">{{ restoreStatusText || 'Sedang memulihkan data ke Firestore...' }}</span>
          <span class="text-emerald-400 font-mono font-bold">{{ restoreProgress }}%</span>
        </div>
        <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            class="bg-emerald-500 h-full rounded-full transition-all duration-300"
            :style="{ width: `${restoreProgress}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Storage & Offline Management -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Cloud Firestore Sync Card -->
      <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">Cloud Firestore</span>
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          <h3 class="font-bold text-slate-900 text-base">Sinkronisasi Cloud Real-time</h3>
          <p class="text-xs text-slate-500 leading-relaxed">
            Muat ulang dan sinkronkan seluruh data terbaru dari server Cloud Firestore ke tampilan aplikasi Anda sekarang.
          </p>
        </div>
        <button 
          @click="handleSyncCloud"
          :disabled="isSyncingCloud"
          class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isSyncingCloud }" />
          <span>{{ isSyncingCloud ? 'Menyinkronkan...' : 'Sinkronkan Sekarang' }}</span>
        </button>
      </div>

      <!-- Offline Download Card -->
      <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">Akses Lokal Offline</span>
            <Download class="w-4 h-4 text-indigo-600" />
          </div>
          <h3 class="font-bold text-slate-900 text-base">Cache Offline Perangkat</h3>
          <p class="text-xs text-slate-500 leading-relaxed">
            Simpan data katalog dan sirkulasi ke penyimpanan browser lokal (LocalStorage / IndexedDB) agar tetap bisa dibuka tanpa sinyal internet.
          </p>
        </div>
        <button 
          @click="handleDownloadOffline"
          :disabled="isDownloadingOffline"
          class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <Download class="w-4 h-4" :class="{ 'animate-bounce': isDownloadingOffline }" />
          <span>{{ isDownloadingOffline ? 'Mengunduh...' : 'Simpan Cache Offline' }}</span>
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-sm text-slate-900">Ringkasan Data Saat Ini</h3>
        <span class="text-[11px] text-slate-400">Project: <code class="font-mono text-blue-600 font-semibold">libra-5dbb6 (default)</code></span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div class="text-slate-400 text-[10px] uppercase font-bold">Total Buku</div>
          <div class="text-xl font-extrabold text-slate-900 mt-1">{{ store.books.length }}</div>
        </div>
        <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div class="text-slate-400 text-[10px] uppercase font-bold">Anggota / Siswa</div>
          <div class="text-xl font-extrabold text-slate-900 mt-1">{{ store.members.length }}</div>
        </div>
        <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div class="text-slate-400 text-[10px] uppercase font-bold">Rak Koleksi</div>
          <div class="text-xl font-extrabold text-slate-900 mt-1">{{ store.shelves.length }}</div>
        </div>
        <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div class="text-slate-400 text-[10px] uppercase font-bold">Sirkulasi Aktif</div>
          <div class="text-xl font-extrabold text-slate-900 mt-1">{{ store.activeLoans.length }}</div>
        </div>
      </div>
    </div>

    <!-- SMTP Mail Server Status & Testing -->
    <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Mail class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-base flex items-center gap-2">
              Status Server Notifikasi Email (SMTP)
              <span 
                v-if="smtpStatus"
                class="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
                :class="smtpStatus.configured ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'"
              >
                {{ smtpStatus.configured ? 'AKTIF (Terdeteksi)' : 'BELUM AKTIF' }}
              </span>
            </h3>
            <p class="text-xs text-slate-500">
              Digunakan untuk mengirimkan email pengingat buku terlambat & rincian denda kepada siswa/guru.
            </p>
          </div>
        </div>
        <button 
          @click="checkSmtpStatus" 
          :disabled="isCheckingSmtp"
          class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isCheckingSmtp }" />
          <span>Segarkan Status</span>
        </button>
      </div>

      <!-- Detail Kredensial Terdeteksi -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          <span class="text-slate-400 text-[10px] uppercase font-bold block">Host & Port</span>
          <span class="font-mono font-bold text-slate-800 text-sm mt-0.5 block truncate">
            {{ smtpStatus?.host ? `${smtpStatus.host}:${smtpStatus.port}` : 'Belum diatur' }}
          </span>
        </div>
        <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          <span class="text-slate-400 text-[10px] uppercase font-bold block">Akun Pengirim (User)</span>
          <span class="font-mono font-bold text-slate-800 text-sm mt-0.5 block truncate">
            {{ smtpStatus?.user || 'Belum diatur' }}
          </span>
        </div>
        <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          <span class="text-slate-400 text-[10px] uppercase font-bold block">Label Pengirim (From)</span>
          <span class="font-medium text-slate-700 text-xs mt-1 block truncate">
            {{ smtpStatus?.from || 'Perpustakaan Libra (Default)' }}
          </span>
        </div>
      </div>

      <!-- Formulir Uji Coba Kirim Email -->
      <div class="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Send class="w-3.5 h-3.5 text-blue-600" />
            Uji Coba Kirim Email (Live Test)
          </span>
          <span class="text-[11px] text-slate-400">Pastikan email tujuan aktif</span>
        </div>

        <div class="flex flex-col sm:flex-row gap-2">
          <input 
            v-model="testRecipientEmail" 
            type="email" 
            placeholder="Masukkan email penerima tes (misal: azzackey@gmail.com)"
            class="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
          <button 
            @click="handleTestEmail" 
            :disabled="isTestingEmail || !testRecipientEmail"
            class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="isTestingEmail" class="w-4 h-4 animate-spin" />
            <Send v-else class="w-3.5 h-3.5" />
            <span>{{ isTestingEmail ? 'Sedang Mengirim...' : 'Kirim Email Tes' }}</span>
          </button>
        </div>

        <!-- Feedback Hasil Pengujian -->
        <div v-if="testResult" class="p-3 rounded-xl text-xs flex items-start gap-2" :class="testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'">
          <CheckCircle2 v-if="testResult.success" class="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <AlertTriangle v-else class="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div class="leading-relaxed">
            <p class="font-bold">{{ testResult.success ? 'Sukses!' : 'Gagal Mengirim Email' }}</p>
            <p class="text-[11px] mt-0.5">{{ testResult.message }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Restore -->
    <div v-if="showConfirmRestoreModal && selectedBackupData" class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in duration-200">
        <div class="flex items-center gap-3 text-amber-600">
          <div class="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
            <AlertTriangle class="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-base">Konfirmasi Pemulihan Database</h3>
            <p class="text-xs text-slate-500">Periksa ringkasan berkas cadangan sebelum melanjutkan.</p>
          </div>
        </div>

        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs space-y-2.5">
          <div class="flex justify-between py-1 border-b border-slate-200">
            <span class="text-slate-500">Tanggal Ekspor File:</span>
            <span class="font-mono font-semibold text-slate-800">{{ formatDate(selectedBackupData.exportedAt) }}</span>
          </div>
          <div class="grid grid-cols-2 gap-2 pt-1 text-[11px]">
            <div class="bg-white p-2 rounded-xl border border-slate-200">
              <span class="text-slate-500 block">Koleksi Buku:</span>
              <span class="font-extrabold text-sm text-blue-600">{{ selectedBackupData.summary?.totalBooks ?? selectedBackupData.collections?.books?.length ?? 0 }}</span>
            </div>
            <div class="bg-white p-2 rounded-xl border border-slate-200">
              <span class="text-slate-500 block">Anggota / Siswa:</span>
              <span class="font-extrabold text-sm text-emerald-600">{{ selectedBackupData.summary?.totalMembers ?? selectedBackupData.collections?.members?.length ?? 0 }}</span>
            </div>
            <div class="bg-white p-2 rounded-xl border border-slate-200">
              <span class="text-slate-500 block">Rak Koleksi:</span>
              <span class="font-extrabold text-sm text-indigo-600">{{ selectedBackupData.summary?.totalShelves ?? selectedBackupData.collections?.shelves?.length ?? 0 }}</span>
            </div>
            <div class="bg-white p-2 rounded-xl border border-slate-200">
              <span class="text-slate-500 block">Riwayat Peminjaman:</span>
              <span class="font-extrabold text-sm text-purple-600">{{ selectedBackupData.summary?.totalLoans ?? selectedBackupData.collections?.loans?.length ?? 0 }}</span>
            </div>
          </div>
        </div>

        <p class="text-xs text-slate-600 leading-relaxed">
          Semua data dari berkas cadangan ini akan disinkronkan dan disimpan ke Cloud Firestore. Apakah Anda ingin melanjutkan proses pemulihan sekarang?
        </p>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button 
            @click="cancelRestore"
            class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
          >
            Batal
          </button>
          <button 
            @click="executeRestore"
            class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 class="w-4 h-4" />
            Ya, Pulihkan Sekarang
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import type { LibraryBackupData } from '../lib/backupManager.js';
import { 
  Database, RefreshCw, Download, UploadCloud, Archive, 
  Loader2, AlertTriangle, CheckCircle2, Mail, Send 
} from 'lucide-vue-next';

const store = useLibraryStore();

const isSyncingCloud = ref(false);
const isDownloadingOffline = ref(false);
const isExporting = ref(false);
const isRestoring = ref(false);
const restoreStatusText = ref('');
const restoreProgress = ref(0);

const fileInputRef = ref<HTMLInputElement | null>(null);
const showConfirmRestoreModal = ref(false);
const selectedBackupData = ref<LibraryBackupData | null>(null);

const formatDate = (isoStr: string) => {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoStr;
  }
};

const handleSyncCloud = async () => {
  isSyncingCloud.value = true;
  try {
    await store.syncWithCloudFirestore();
    store.showToast('✅ Sinkronisasi dengan Cloud Firestore berhasil!');
  } finally {
    isSyncingCloud.value = false;
  }
};

const handleDownloadOffline = async () => {
  isDownloadingOffline.value = true;
  try {
    await store.downloadForOffline();
  } finally {
    isDownloadingOffline.value = false;
  }
};

const handleExportBackup = async () => {
  isExporting.value = true;
  try {
    await store.exportDatabaseBackup();
  } finally {
    isExporting.value = false;
  }
};

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
    fileInputRef.value.click();
  }
};

const onFileSelectedForRestore = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target?.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const parsed = JSON.parse(content);

      if (!parsed || (!parsed.collections && !parsed.books)) {
        throw new Error('Format file JSON tidak dikenali sebagai berkas backup Libra.');
      }

      // Normalisasi jika file berasal dari struktur berbeda
      if (!parsed.collections) {
        parsed.collections = {
          books: parsed.books || [],
          members: parsed.members || [],
          shelves: parsed.shelves || [],
          categories: parsed.categories || [],
          loans: parsed.loans || [],
          bookings: parsed.bookings || [],
          notifications: parsed.notifications || [],
          config: parsed.config || null
        };
      }

      selectedBackupData.value = parsed as LibraryBackupData;
      showConfirmRestoreModal.value = true;
    } catch (err: any) {
      console.error('JSON parse error:', err);
      store.setError('Gagal membaca file backup: ' + (err?.message || 'Format JSON tidak valid'));
    }
  };

  reader.onerror = () => {
    store.setError('Gagal membaca berkas dari penyimpanan Anda.');
  };

  reader.readAsText(file);
};

const cancelRestore = () => {
  showConfirmRestoreModal.value = false;
  selectedBackupData.value = null;
};

// ==================== SMTP Server Status & Testing ====================
interface SmtpStatusResponse {
  configured: boolean;
  host: string | null;
  port: string | number;
  user: string | null;
  from: string | null;
}

const smtpStatus = ref<SmtpStatusResponse | null>(null);
const isCheckingSmtp = ref(false);
const testRecipientEmail = ref('azzackey@gmail.com');
const isTestingEmail = ref(false);
const testResult = ref<{ success: boolean; message: string } | null>(null);

const checkSmtpStatus = async () => {
  isCheckingSmtp.value = true;
  try {
    const res = await fetch('/api/email-status');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      smtpStatus.value = await res.json();
    } else {
      console.warn('Endpoint /api/email-status mengembalikan respons non-JSON:', res.status);
      smtpStatus.value = {
        configured: false,
        host: null,
        port: '-',
        user: 'Server backend belum diperbarui (jalankan git pull & npm run build)',
        from: null,
      };
    }
  } catch (err: any) {
    console.warn('Gagal memeriksa status SMTP server:', err);
    smtpStatus.value = {
      configured: false,
      host: null,
      port: '-',
      user: 'Tidak dapat menghubungi server (' + (err?.message || 'Error') + ')',
      from: null,
    };
  } finally {
    isCheckingSmtp.value = false;
  }
};

const handleTestEmail = async () => {
  if (!testRecipientEmail.value) return;
  isTestingEmail.value = true;
  testResult.value = null;

  try {
    const res = await fetch('/api/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient: testRecipientEmail.value }),
    });
    const data = await res.json();

    if (data.success) {
      testResult.value = {
        success: true,
        message: data.message || `Email uji coba berhasil dikirim ke ${testRecipientEmail.value}! Silakan periksa kotak masuk/spam Anda.`,
      };
      store.showToast('✅ Email uji coba berhasil dikirim!');
    } else {
      testResult.value = {
        success: false,
        message: data.error || 'Gagal mengirim email uji coba. Periksa kredensial SMTP di server.',
      };
    }
  } catch (err: any) {
    testResult.value = {
      success: false,
      message: 'Koneksi ke backend server gagal: ' + (err?.message || 'Network error'),
    };
  } finally {
    isTestingEmail.value = false;
  }
};

onMounted(() => {
  checkSmtpStatus();
});

const executeRestore = async () => {
  if (!selectedBackupData.value) return;

  showConfirmRestoreModal.value = false;
  isRestoring.value = true;
  restoreProgress.value = 5;
  restoreStatusText.value = 'Menghubungi Cloud Firestore...';

  try {
    await store.restoreDatabaseBackup(selectedBackupData.value, (text, pct) => {
      restoreStatusText.value = text;
      restoreProgress.value = pct;
    });
  } finally {
    isRestoring.value = false;
    selectedBackupData.value = null;
  }
};
</script>

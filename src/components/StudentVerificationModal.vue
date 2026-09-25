<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden sm:overflow-y-auto">
    <div class="bg-white border-0 sm:border sm:border-slate-100 w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-xl sm:rounded-3xl rounded-none shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
      
      <!-- Sticky Header -->
      <div class="px-5 py-4 bg-slate-50/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
            <GraduationCap class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-base text-slate-900 flex items-center gap-2">
              <span>Verifikasi Siswa SDN Pengasinan VII</span>
            </h3>
            <p class="text-xs text-slate-500">Akses Peminjaman e-Book Berhak Cipta</p>
          </div>
        </div>
        <button 
          @click="handleClose" 
          type="button"
          aria-label="Tutup modal verifikasi"
          class="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 active:scale-95 transition cursor-pointer flex items-center justify-center shrink-0"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Scrollable Body -->
      <div class="p-5 sm:p-6 space-y-5 flex-1 overflow-y-auto">

        <!-- Error Alert -->
        <div v-if="modalError" class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-2.5 animate-in fade-in">
          <div class="flex items-center gap-2">
            <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
            <span class="font-semibold leading-tight">{{ modalError }}</span>
          </div>
          <button @click="modalError = ''" type="button" class="text-rose-500 hover:text-rose-800 text-sm font-bold p-1 cursor-pointer">✕</button>
        </div>

        <!-- Banner Hak Cipta e-Book -->
        <div class="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-3 text-xs text-blue-900">
          <ShieldCheck class="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div class="space-y-1">
            <span class="font-bold text-slate-900">Perlindungan Hak Cipta e-Book Digital</span>
            <p class="text-slate-600 leading-relaxed text-[11px]">
              Sesuai lisensi hak cipta digital, peminjaman e-Book hanya diperuntukkan bagi warga sekolah resmi SDN Pengasinan VII. Admin perpustakaan perlu memverifikasi kesesuaian NIS, NISN, dan foto selfie Anda.
            </p>
          </div>
        </div>

        <!-- Status: Already Verified -->
        <div v-if="currentVerificationStatus === 'verified'" class="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-3">
          <div class="flex items-center gap-2.5 text-emerald-800 font-bold text-sm">
            <CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Akun Siswa Terverifikasi Aktif</span>
          </div>
          <p class="text-slate-600 leading-relaxed text-xs">
            Selamat! Akun Anda telah terverifikasi sebagai siswa SDN Pengasinan VII. Anda dapat meminjam dan membaca seluruh koleksi e-Book berhak cipta.
          </p>
          <div class="p-3 rounded-xl bg-white border border-emerald-200/80 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span class="text-slate-400">NIS:</span>
              <div class="font-bold font-mono text-slate-800">{{ store.currentUser?.nis || '-' }}</div>
            </div>
            <div>
              <span class="text-slate-400">NISN:</span>
              <div class="font-bold font-mono text-slate-800">{{ store.currentUser?.nisn || '-' }}</div>
            </div>
          </div>
        </div>

        <!-- Status: Currently Pending Review -->
        <div v-else-if="currentVerificationStatus === 'pending'" class="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-3">
          <div class="flex items-center gap-2.5 text-amber-800 font-bold text-sm">
            <Clock class="w-5 h-5 text-amber-600 shrink-0 animate-spin" />
            <span>Permohonan Sedang Ditinjau Admin</span>
          </div>
          <p class="text-amber-800/90 leading-relaxed text-xs">
            Permohonan verifikasi siswa Anda telah terkirim dan sedang dalam antrean peninjauan oleh Admin Perpustakaan SDN Pengasinan VII. Mohon tunggu beberapa saat.
          </p>
          <div class="p-3.5 rounded-xl bg-white border border-amber-200/80 space-y-2 text-[11px]">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <span class="text-slate-400">NIS Terkirim:</span>
                <div class="font-bold font-mono text-slate-800">{{ pendingRequest?.nis || store.currentUser?.nis || '-' }}</div>
              </div>
              <div>
                <span class="text-slate-400">NISN Terkirim:</span>
                <div class="font-bold font-mono text-slate-800">{{ pendingRequest?.nisn || store.currentUser?.nisn || '-' }}</div>
              </div>
            </div>
            <div class="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>Waktu Pengajuan:</span>
              <span class="font-medium text-slate-600">{{ formatDateTime(pendingRequest?.requestDate) }}</span>
            </div>
          </div>
        </div>

        <!-- Status: Rejected Warning Banner -->
        <div v-else-if="currentVerificationStatus === 'rejected'" class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2">
          <div class="flex items-center gap-2 font-bold text-rose-800">
            <AlertCircle class="w-4 h-4 text-rose-600 shrink-0" />
            <span>Pengajuan Sebelumnya Belum Disetujui</span>
          </div>
          <p class="text-[11px] text-rose-700 leading-relaxed">
            Alasan penolakan: <strong>{{ rejectionReason || 'Data NIS/NISN atau foto selfie belum memenuhi kriteria verifikasi siswa SDN Pengasinan VII.' }}</strong>
          </p>
          <p class="text-[11px] text-slate-600">
            Silakan periksa kembali nomor NIS dan NISN Anda, lalu ambil foto selfie baru yang jelas di bawah ini untuk mengajukan ulang.
          </p>
        </div>

        <!-- Form Input Section (Displayed when unverified or rejected) -->
        <div v-if="currentVerificationStatus !== 'verified' && currentVerificationStatus !== 'pending'" class="space-y-4">
          
          <!-- Identity Number Inputs -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Nomor Induk Sekolah (NIS) *</span>
                <span class="text-[10px] text-slate-400 font-normal">Dari Sekolah</span>
              </label>
              <input 
                v-model="nisInput"
                type="text" 
                maxlength="20"
                placeholder="Contoh: 20241088"
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono font-semibold"
                @input="modalError = ''"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Nomor Induk Siswa Nasional (NISN) *</span>
                <span class="text-[10px] text-slate-400 font-normal">10 Digit</span>
              </label>
              <input 
                v-model="nisnInput"
                type="text" 
                maxlength="12"
                placeholder="Contoh: 0123456789"
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono font-semibold"
                @input="modalError = ''"
              />
            </div>
          </div>

          <!-- Selfie Verification Area -->
          <div class="space-y-2 pt-1">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Camera class="w-4 h-4 text-blue-600" />
                <span>Verifikasi Wajah (Foto Selfie) *</span>
              </label>
              <span class="text-[10px] text-slate-400">Pastikan wajah terlihat jelas & terang</span>
            </div>

            <!-- STEP 1: Idle / Not taken yet -->
            <div 
              v-if="cameraState === 'idle'" 
              class="p-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col items-center justify-center text-center space-y-3 cursor-pointer"
              @click="startCameraCapture"
            >
              <div class="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                <Camera class="w-6 h-6" />
              </div>
              <div>
                <div class="text-xs font-bold text-slate-800">Buka Kamera & Ambil Foto Selfie</div>
                <div class="text-[11px] text-slate-500 mt-0.5">Ambil foto selfie langsung untuk mencocokkan identitas siswa</div>
              </div>
              <button 
                type="button"
                @click.stop="startCameraCapture"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Camera class="w-3.5 h-3.5" />
                <span>Aktifkan Kamera</span>
              </button>
            </div>

            <!-- STEP 2: Live Camera Viewport -->
            <div v-else-if="cameraState === 'camera'" class="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative flex flex-col items-center">
              <div class="w-full max-h-72 overflow-hidden relative flex items-center justify-center bg-black">
                <video 
                  ref="videoRef" 
                  autoplay 
                  playsinline 
                  class="w-full h-full object-cover max-h-72 transform -scale-x-100"
                ></video>

                <!-- Face Oval Guide Overlay -->
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div class="w-40 h-52 border-2 border-dashed border-white/60 rounded-[50%] shadow-lg shadow-black/50"></div>
                </div>

                <div class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>Kamera Aktif</span>
                </div>
              </div>

              <!-- Camera Controls -->
              <div class="p-3 w-full bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
                <button 
                  type="button" 
                  @click="stopCameraAndReset"
                  class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Batal
                </button>

                <button 
                  type="button" 
                  @click="captureSelfie"
                  class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-900 transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Camera class="w-4 h-4" />
                  <span>Ambil Foto</span>
                </button>

                <!-- File upload fallback -->
                <label class="text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer underline">
                  <span>Pilih File</span>
                  <input type="file" accept="image/*" class="hidden" @change="handleFileUpload" />
                </label>
              </div>
            </div>

            <!-- STEP 3: Preview Captured Image -->
            <div v-else-if="cameraState === 'preview'" class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
              <div class="relative shrink-0">
                <img 
                  :src="capturedImageBase64" 
                  class="w-28 h-36 rounded-xl object-cover border-2 border-blue-500 shadow-md" 
                  alt="Selfie Preview" 
                />
                <span class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-bold">
                  Tersimpan
                </span>
              </div>
              <div class="flex-1 text-center sm:text-left space-y-2">
                <div class="text-xs font-bold text-slate-800">Foto Selfie Berhasil Diambil</div>
                <p class="text-[11px] text-slate-500 leading-relaxed">
                  Periksa apakah wajah Anda sudah terlihat jelas dan tidak buram sebelum mengirimkan permohonan.
                </p>
                <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button 
                    type="button" 
                    @click="retakeSelfie"
                    class="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw class="w-3.5 h-3.5" />
                    <span>Ambil Ulang</span>
                  </button>
                  <label class="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition cursor-pointer flex items-center gap-1.5">
                    <UploadCloud class="w-3.5 h-3.5" />
                    <span>Ganti File</span>
                    <input type="file" accept="image/*" class="hidden" @change="handleFileUpload" />
                  </label>
                </div>
              </div>
            </div>

            <!-- Secondary File Upload alternative when idle -->
            <div v-if="cameraState === 'idle'" class="text-center">
              <label class="text-[11px] text-slate-500 hover:text-blue-600 cursor-pointer inline-flex items-center gap-1">
                <UploadCloud class="w-3.5 h-3.5" />
                <span>Atau unggah foto selfie dari perangkat</span>
                <input type="file" accept="image/*" class="hidden" @change="handleFileUpload" />
              </label>
            </div>

          </div>

        </div>

      </div>

      <!-- Sticky Footer Actions -->
      <div class="px-5 py-3.5 bg-slate-50/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-between gap-3 shrink-0 sticky bottom-0 z-20">
        <button 
          type="button" 
          @click="handleClose"
          class="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
        >
          {{ currentVerificationStatus === 'verified' || currentVerificationStatus === 'pending' ? 'Tutup' : 'Batal' }}
        </button>

        <div v-if="currentVerificationStatus !== 'verified' && currentVerificationStatus !== 'pending'">
          <button 
            type="button" 
            @click="handleSubmitVerification"
            :disabled="isSubmitting || !nisInput.trim() || !nisnInput.trim() || !capturedImageBase64"
            class="px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Send class="w-4 h-4" v-if="!isSubmitting" />
            <RefreshCw class="w-4 h-4 animate-spin" v-else />
            <span>{{ isSubmitting ? 'Mengirim Permohonan...' : 'Kirim Verifikasi Siswa' }}</span>
          </button>
        </div>

        <div v-else-if="currentVerificationStatus === 'verified'">
          <button 
            type="button" 
            @click="handleClose"
            class="px-5 py-2.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 transition flex items-center gap-2 cursor-pointer"
          >
            <Check class="w-4 h-4" />
            <span>Selesai</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import { 
  X, 
  GraduationCap, 
  Camera, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  UploadCloud, 
  Send,
  Check
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submitted'): void;
}>();

const store = useLibraryStore();

const nisInput = ref('');
const nisnInput = ref('');
const modalError = ref('');
const isSubmitting = ref(false);

type CameraState = 'idle' | 'camera' | 'preview';
const cameraState = ref<CameraState>('idle');
const videoRef = ref<HTMLVideoElement | null>(null);
const capturedImageBase64 = ref('');
let mediaStream: MediaStream | null = null;

// Ambil status verifikasi siswa saat ini
const currentVerificationStatus = computed(() => {
  if (store.currentUser?.studentVerificationStatus) {
    return store.currentUser.studentVerificationStatus;
  }
  const myReq = store.myLatestStudentVerification;
  if (myReq) {
    return myReq.status;
  }
  return 'unverified';
});

const pendingRequest = computed(() => {
  return store.myPendingStudentVerification || store.myLatestStudentVerification;
});

const rejectionReason = computed(() => {
  return store.currentUser?.studentRejectReason || store.myLatestStudentVerification?.rejectionReason || '';
});

// Sync input saat modal dibuka
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    modalError.value = '';
    cameraState.value = 'idle';
    capturedImageBase64.value = '';

    // Isi dengan nilai yang sudah pernah disimpan jika ada
    if (store.currentUser?.nis) {
      nisInput.value = store.currentUser.nis;
    } else if (store.myLatestStudentVerification?.nis) {
      nisInput.value = store.myLatestStudentVerification.nis;
    }

    if (store.currentUser?.nisn) {
      nisnInput.value = store.currentUser.nisn;
    } else if (store.myLatestStudentVerification?.nisn) {
      nisnInput.value = store.myLatestStudentVerification.nisn;
    }
  } else {
    stopCamera();
  }
});

// Camera handlers
async function startCameraCapture() {
  modalError.value = '';
  cameraState.value = 'camera';

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 }
      },
      audio: false
    });

    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream;
      await videoRef.value.play();
    }
  } catch (err: any) {
    console.error('Camera access error:', err);
    modalError.value = 'Gagal mengakses kamera: ' + (err?.message || 'Izin kamera ditolak. Silakan berikan izin atau unggah file foto.');
    cameraState.value = 'idle';
  }
}

function captureSelfie() {
  if (!videoRef.value) return;

  const video = videoRef.value;
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Mirror effect horizontally
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  capturedImageBase64.value = canvas.toDataURL('image/jpeg', 0.85);

  stopCamera();
  cameraState.value = 'preview';
}

function retakeSelfie() {
  capturedImageBase64.value = '';
  startCameraCapture();
}

function handleFileUpload(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  if (!file.type.startsWith('image/')) {
    modalError.value = 'Harap pilih file gambar (JPG, PNG, WebP).';
    return;
  }

  const reader = new FileReader();
  reader.onload = (readEvent) => {
    capturedImageBase64.value = readEvent.target?.result as string;
    stopCamera();
    cameraState.value = 'preview';
  };
  reader.readAsDataURL(file);
}

function stopCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
}

function stopCameraAndReset() {
  stopCamera();
  cameraState.value = 'idle';
}

async function handleSubmitVerification() {
  modalError.value = '';

  const nis = nisInput.value.trim();
  const nisn = nisnInput.value.trim();

  if (!nis) {
    modalError.value = 'Nomor Induk Sekolah (NIS) wajib diisi.';
    return;
  }
  if (!nisn) {
    modalError.value = 'Nomor Induk Siswa Nasional (NISN) wajib diisi.';
    return;
  }
  if (!capturedImageBase64.value) {
    modalError.value = 'Foto selfie verifikasi wajah wajib diambil.';
    return;
  }

  isSubmitting.value = true;
  try {
    // 1. Upload foto selfie ke server /api/upload-selfie
    const res = await fetch('/api/upload-selfie', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageBase64: capturedImageBase64.value,
        memberId: store.currentUser?.id || 'siswa'
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Gagal mengunggah foto selfie ke server');
    }

    // 2. Simpan permohonan ke database
    const subRes = await store.submitStudentVerification({
      nis,
      nisn,
      selfieUrl: data.url
    });

    if (subRes.success) {
      stopCamera();
      emit('submitted');
    } else {
      modalError.value = subRes.error || store.errorMessage || 'Gagal mengajukan verifikasi';
    }
  } catch (err: any) {
    console.error('Submit student verification error:', err);
    modalError.value = err?.message || 'Terjadi kesalahan saat mengirim verifikasi';
  } finally {
    isSubmitting.value = false;
  }
}

function handleClose() {
  stopCamera();
  emit('close');
}

function formatDateTime(isoStr?: string | null) {
  if (!isoStr) return '-';
  try {
    return new Date(isoStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoStr;
  }
}

onBeforeUnmount(() => {
  stopCamera();
});
</script>

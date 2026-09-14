<template>
  <teleport to="body">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200 overflow-x-hidden"
      @click.self="handleClose"
    >
      <div 
        class="bg-white text-slate-900 w-full max-w-full sm:max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border-0 sm:border border-slate-200/80 animate-in zoom-in-95 duration-200"
      >
        <!-- Modal Header -->
        <div class="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between gap-2.5 bg-slate-50/90 shrink-0 w-full">
          <div class="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <Laptop class="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate sm:whitespace-normal">
                Manajemen Sesi & Perangkat
              </h2>
              <p class="text-[10px] sm:text-xs text-slate-500 line-clamp-1 sm:line-clamp-none">
                Pantau perangkat login aktif dan kelola hak akses Perangkat Utama
              </p>
            </div>
          </div>
          <button 
            @click="handleClose"
            class="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 active:bg-slate-400 text-slate-600 flex items-center justify-center transition cursor-pointer shrink-0 ml-1 active:scale-95"
            aria-label="Tutup Modal"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Modal Body Content -->
        <div class="p-3.5 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-5 overscroll-contain">
          
          <!-- Banner Status Perangkat Saat Ini -->
          <div 
            v-if="store.isCurrentDeviceMain"
            class="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900"
          >
            <div class="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div class="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
                <Crown class="w-4 h-4" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-bold flex flex-wrap items-center gap-1.5 text-emerald-950 text-xs sm:text-sm">
                  <span>Perangkat Ini Adalah Perangkat Utama</span>
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <p class="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                  Anda memiliki wewenang penuh untuk mencabut sesi login aktif pada perangkat lain demi mengamankan akun Anda.
                </p>
              </div>
            </div>

            <!-- Tombol Cabut Semua Perangkat Lain jika ada perangkat lain -->
            <button 
              v-if="otherSessionsCount > 0"
              @click="confirmRevokeAll"
              class="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-full text-xs transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs active:scale-95"
            >
              <LogOut class="w-3.5 h-3.5" />
              <span>Cabut Semua Perangkat Lain ({{ otherSessionsCount }})</span>
            </button>
          </div>

          <!-- Banner Jika Perangkat Ini Bukan Utama -->
          <div 
            v-else-if="store.userHasMainDevice"
            class="p-3.5 sm:p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900"
          >
            <div class="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div class="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200 mt-0.5 sm:mt-0">
                <ShieldAlert class="w-4 h-4" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-bold text-blue-950 text-xs sm:text-sm">Perangkat Ini Belum Menjadi Perangkat Utama</div>
                <p class="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                  Hanya Perangkat Utama yang dapat mencabut sesi login di perangkat lain. Ingin menjadikan perangkat ini sebagai yang utama?
                </p>
              </div>
            </div>

            <button 
              @click="openMakeMainModal"
              class="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs active:scale-95"
            >
              <Crown class="w-3.5 h-3.5 text-amber-300" />
              <span>Jadikan Perangkat Utama</span>
            </button>
          </div>

          <!-- Banner Jika Belum Ada Perangkat Utama Sama Sekali -->
          <div 
            v-else
            class="p-3.5 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900"
          >
            <div class="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 mt-0.5 sm:mt-0">
                <Crown class="w-4 h-4" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-bold text-amber-950 text-xs sm:text-sm">Belum Ada Perangkat Utama Ditetapkan</div>
                <p class="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                  Tetapkan perangkat ini sebagai Perangkat Utama dengan verifikasi email untuk mengontrol sesi akun Anda.
                </p>
              </div>
            </div>

            <button 
              @click="openMakeMainModal"
              class="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-full text-xs transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs active:scale-95"
            >
              <Crown class="w-3.5 h-3.5 text-amber-200" />
              <span>Jadikan Perangkat Utama</span>
            </button>
          </div>

          <!-- Section List Sesi Aktif -->
          <div>
            <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                <h3 class="font-extrabold text-[11px] sm:text-xs text-slate-700 uppercase tracking-wider">
                  Daftar Sesi Login Aktif ({{ store.myDeviceSessions.length }})
                </h3>
                <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] sm:text-[10px] font-bold whitespace-nowrap">
                  Cloud Firestore Real-time
                </span>
              </div>
              <button 
                @click="refreshSessions"
                type="button"
                :disabled="isRefreshing"
                class="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50 transition active:scale-95"
              >
                <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isRefreshing }" />
                <span class="text-[11px]">Perbarui</span>
              </button>
            </div>

            <!-- List of Sessions -->
            <div class="space-y-2.5">
              <div 
                v-for="session in store.myDeviceSessions" 
                :key="session.id"
                class="p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0"
                :class="session.isCurrentDevice ? 'bg-blue-50/40 border-blue-200 shadow-xs' : 'bg-white border-slate-200/80 hover:border-slate-300'"
              >
                <!-- Device Info & Icon -->
                <div class="flex items-start gap-3 min-w-0 flex-1">
                  <div 
                    class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border mt-0.5"
                    :class="session.isCurrentDevice ? 'bg-blue-600 text-white border-blue-700 shadow-xs' : 'bg-slate-100 text-slate-600 border-slate-200'"
                  >
                    <Smartphone v-if="session.deviceType === 'mobile'" class="w-4 h-4 sm:w-5 sm:h-5" />
                    <Tablet v-else-if="session.deviceType === 'tablet'" class="w-4 h-4 sm:w-5 sm:h-5" />
                    <Laptop v-else class="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>

                  <div class="space-y-1 min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span class="font-bold text-xs sm:text-sm text-slate-900 break-words">{{ session.deviceName }}</span>
                      
                      <!-- Badge Perangkat Ini -->
                      <span 
                        v-if="session.isCurrentDevice"
                        class="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1 whitespace-nowrap"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                        Perangkat Ini
                      </span>

                      <!-- Badge Perangkat Utama -->
                      <span 
                        v-if="session.isMainDevice"
                        class="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 whitespace-nowrap"
                      >
                        <Crown class="w-3 h-3 text-emerald-600" />
                        Perangkat Utama
                      </span>
                    </div>

                    <div class="text-[10px] sm:text-[11px] text-slate-500 flex flex-wrap items-center gap-y-1 gap-x-2.5">
                      <span>Peramban: <strong class="text-slate-700">{{ session.browser || 'Web' }}</strong></span>
                      <span>OS: <strong class="text-slate-700">{{ session.os || 'Lainnya' }}</strong></span>
                      <span class="flex items-center gap-1">
                        Terakhir Aktif:
                        <span v-if="isOnlineNow(session)" class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                        <strong :class="isOnlineNow(session) ? 'text-emerald-700 font-semibold' : 'text-slate-700'">{{ formatRelativeTime(session.lastActive, session.isCurrentDevice) }}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Actions per session -->
                <div class="flex items-center gap-2 self-stretch sm:self-center justify-end sm:justify-start shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  
                  <!-- Jika sesi ini adalah Perangkat Ini -->
                  <template v-if="session.isCurrentDevice">
                    <button 
                      v-if="!session.isMainDevice"
                      @click="openMakeMainModal"
                      class="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-full text-[11px] transition flex items-center gap-1 cursor-pointer active:scale-95"
                      title="Jadikan perangkat ini sebagai Perangkat Utama"
                    >
                      <Crown class="w-3.5 h-3.5 text-amber-500" />
                      <span>Jadikan Utama</span>
                    </button>
                    <span 
                      v-else
                      class="text-[11px] text-emerald-700 font-bold flex items-center gap-1 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200"
                    >
                      <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
                      <span>Aktif Sebagai Utama</span>
                    </span>
                  </template>

                  <!-- Jika sesi ini adalah Perangkat Lain -->
                  <template v-else>
                    <!-- Hanya Perangkat Utama yang dapat mencabut -->
                    <button 
                      v-if="store.isCurrentDeviceMain"
                      @click="confirmRevokeSession(session)"
                      class="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-full text-[11px] transition flex items-center gap-1 cursor-pointer active:scale-95"
                      title="Cabut sesi login perangkat ini"
                    >
                      <Trash2 class="w-3.5 h-3.5 text-rose-500" />
                      <span>Cabut Sesi</span>
                    </button>
                    
                    <span 
                      v-else
                      class="text-[10px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200"
                      title="Hanya Perangkat Utama yang dapat mencabut sesi ini"
                    >
                      Terkunci (Bukan Utama)
                    </span>
                  </template>

                </div>
              </div>
            </div>
          </div>

          <!-- Catatan Keamanan / Petunjuk Informasi -->
          <div class="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] space-y-1">
            <div class="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck class="w-4 h-4 text-blue-600 shrink-0" />
              <span>Tentang Keamanan Perangkat Utama</span>
            </div>
            <p class="text-slate-500 leading-relaxed">
              Perangkat Utama adalah perangkat terpercaya Anda. Ketika Anda mencabut sesi perangkat lain, pengguna di perangkat tersebut akan secara otomatis ter-logout dari sistem secara seketika (real-time).
            </p>
          </div>

        </div>

        <!-- Modal Footer -->
        <div class="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-end gap-2 shrink-0 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
          <button 
            @click="handleClose"
            class="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800 font-bold rounded-full text-xs transition cursor-pointer text-center"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- Sub-Modal: Konfirmasi & Input Kode Verifikasi Email (Jadikan Perangkat Utama) -->
    <div 
      v-if="isVerifyModalOpen" 
      class="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
      @click.self="isVerifyModalOpen = false"
    >
      <div 
        class="bg-white text-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[95dvh] flex flex-col"
      >
        <div class="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-slate-100 flex items-center justify-between gap-2 bg-blue-50/50 shrink-0">
          <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <div class="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Crown class="w-4 h-4 text-amber-300" />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-bold text-sm text-slate-900 truncate">Verifikasi Perangkat Utama</h3>
              <p class="text-[11px] text-slate-500 truncate">Kirim kode verifikasi ke email</p>
            </div>
          </div>
          <button 
            @click="isVerifyModalOpen = false"
            class="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer shrink-0"
            aria-label="Tutup"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          <!-- State: Sebelum Kode Dikirim atau Sedang Menunggu Input Kode -->
          <div class="text-xs text-slate-600 space-y-2">
            <p>
              Untuk menetapkan perangkat <strong>{{ currentDeviceName }}</strong> sebagai <strong>Perangkat Utama</strong>, sistem akan mengirimkan 6-digit kode verifikasi ke email akun Anda:
            </p>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono font-bold text-slate-800 text-center text-xs break-all">
              {{ maskedEmail }}
            </div>
          </div>

          <!-- Alert Error jika ada -->
          <div 
            v-if="verificationError"
            class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"
          >
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>{{ verificationError }}</span>
          </div>

          <!-- Simulated Code Notice untuk kemudahan preview -->
          <div 
            v-if="simulatedCodeNotice"
            class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-wrap items-center justify-between gap-2"
          >
            <span class="break-words">Kode pengujian (simulasi): <strong>{{ simulatedCodeNotice }}</strong></span>
            <button 
              @click="otpCode = simulatedCodeNotice"
              class="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 rounded-lg text-[10px] font-bold text-amber-900 cursor-pointer"
            >
              Isi Otomatis
            </button>
          </div>

          <!-- Form Input OTP -->
          <div class="space-y-1.5">
            <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Masukkan 6-Digit Kode Verifikasi
            </label>
            <input 
              v-model="otpCode"
              type="text"
              maxlength="6"
              placeholder="Contoh: 123456"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl text-center text-xl font-mono font-bold tracking-widest text-slate-900 outline-none transition"
              @keyup.enter="handleVerifySubmit"
              autofocus
            />
          </div>

          <!-- Resend Timer -->
          <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Tidak menerima email?</span>
            <button 
              v-if="resendCountdown === 0"
              @click="requestOtpCode"
              :disabled="isSendingOtp"
              class="text-blue-600 hover:text-blue-700 font-bold cursor-pointer transition disabled:opacity-50"
            >
              {{ isSendingOtp ? 'Mengirim...' : 'Kirim Ulang Kode' }}
            </button>
            <span v-else class="text-slate-400 font-medium">
              Kirim ulang dalam {{ resendCountdown }}s
            </span>
          </div>
        </div>

        <div class="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 shrink-0">
          <button 
            @click="isVerifyModalOpen = false"
            class="w-full sm:w-auto px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-full text-xs transition cursor-pointer text-center"
          >
            Batal
          </button>
          <button 
            @click="handleVerifySubmit"
            :disabled="isVerifying || !otpCode || otpCode.length < 6"
            class="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-center"
          >
            <Crown class="w-3.5 h-3.5 text-amber-300" />
            <span>{{ isVerifying ? 'Memverifikasi...' : 'Verifikasi & Jadikan Utama' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Sub-Modal: Dialog Konfirmasi Cabut Sesi -->
    <div 
      v-if="revokeTargetSession" 
      class="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
      @click.self="revokeTargetSession = null"
    >
      <div 
        class="bg-white text-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
      >
        <div class="p-5 sm:p-6 text-center space-y-3 sm:space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-xs">
            <Trash2 class="w-6 h-6" />
          </div>
          <div>
            <h3 class="font-extrabold text-base text-slate-900">Cabut Sesi Perangkat?</h3>
            <p class="text-xs text-slate-500 mt-1">
              Apakah Anda yakin ingin mencabut sesi login pada <strong class="text-slate-800 break-words">{{ revokeTargetSession.deviceName }}</strong>? Pengguna pada perangkat tersebut akan langsung dikeluarkan (logout) dari aplikasi.
            </p>
          </div>
        </div>

        <div class="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
          <button 
            @click="revokeTargetSession = null"
            class="w-full sm:w-auto px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-full text-xs transition cursor-pointer text-center"
          >
            Batal
          </button>
          <button 
            @click="executeRevokeSession"
            :disabled="isRevoking"
            class="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-full text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rose-200 disabled:opacity-50 active:scale-95 text-center"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>{{ isRevoking ? 'Mencabut...' : 'Ya, Cabut Sesi' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Sub-Modal: Dialog Konfirmasi Cabut SEMUA Sesi Lain -->
    <div 
      v-if="isRevokeAllConfirmOpen" 
      class="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
      @click.self="isRevokeAllConfirmOpen = false"
    >
      <div 
        class="bg-white text-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
      >
        <div class="p-5 sm:p-6 text-center space-y-3 sm:space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-xs">
            <LogOut class="w-6 h-6" />
          </div>
          <div>
            <h3 class="font-extrabold text-base text-slate-900">Cabut Semua Sesi Lain?</h3>
            <p class="text-xs text-slate-500 mt-1">
              Tindakan ini akan mengeluarkan (logout) akun Anda dari seluruh {{ otherSessionsCount }} perangkat lain yang sedang aktif. Hanya perangkat utama ini yang akan tetap login.
            </p>
          </div>
        </div>

        <div class="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
          <button 
            @click="isRevokeAllConfirmOpen = false"
            class="w-full sm:w-auto px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-full text-xs transition cursor-pointer text-center"
          >
            Batal
          </button>
          <button 
            @click="executeRevokeAll"
            :disabled="isRevoking"
            class="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-full text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rose-200 disabled:opacity-50 active:scale-95 text-center"
          >
            <LogOut class="w-3.5 h-3.5" />
            <span>{{ isRevoking ? 'Memproses...' : 'Ya, Cabut Semua' }}</span>
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import { useModalBack } from '../composables/useModalBack.js';
import { detectCurrentDeviceInfo, getCurrentDeviceId } from '../utils/deviceDetector.js';
import type { UserDeviceSession } from '../types.js';
import { 
  Laptop, Smartphone, Tablet, X, Crown, ShieldAlert, 
  ShieldCheck, RefreshCw, Trash2, CheckCircle2, AlertCircle, LogOut 
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useLibraryStore();

// Back Button Integration with Scroll Preservation
const isOpenRef = computed(() => props.isOpen);
useModalBack(isOpenRef, () => {
  emit('close');
}, 'device-sessions');

const isRefreshing = ref(false);
const isVerifyModalOpen = ref(false);
const isSendingOtp = ref(false);
const isVerifying = ref(false);
const isRevoking = ref(false);
const otpCode = ref('');
const verificationError = ref('');
const simulatedCodeNotice = ref('');
const resendCountdown = ref(0);
let countdownTimer: any = null;

const revokeTargetSession = ref<UserDeviceSession | null>(null);
const isRevokeAllConfirmOpen = ref(false);

const currentDeviceId = computed(() => getCurrentDeviceId());
const currentDeviceInfo = computed(() => detectCurrentDeviceInfo());
const currentDeviceName = computed(() => currentDeviceInfo.value.deviceName);

const otherSessionsCount = computed(() => {
  const currentDevId = currentDeviceId.value;
  return store.myDeviceSessions.filter(s => s.deviceId !== currentDevId).length;
});

const maskedEmail = computed(() => {
  const email = store.currentUser?.email || '';
  if (!email || !email.includes('@')) return email;
  const [user, domain] = email.split('@');
  if (user.length <= 3) {
    return `${user[0]}***@${domain}`;
  }
  return `${user.slice(0, 2)}***${user.slice(-2)}@${domain}`;
});

function handleClose() {
  isVerifyModalOpen.value = false;
  revokeTargetSession.value = null;
  isRevokeAllConfirmOpen.value = false;
  emit('close');
}

async function refreshSessions() {
  if (isRefreshing.value) return;
  isRefreshing.value = true;
  await store.refreshDeviceSessions();
  setTimeout(() => {
    isRefreshing.value = false;
  }, 400);
}

function startCountdown() {
  resendCountdown.value = 60;
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    if (resendCountdown.value > 0) {
      resendCountdown.value--;
    } else {
      clearInterval(countdownTimer);
    }
  }, 1000);
}

async function requestOtpCode() {
  isSendingOtp.value = true;
  verificationError.value = '';
  simulatedCodeNotice.value = '';
  
  const result = await store.requestMainDeviceVerificationCode();
  isSendingOtp.value = false;

  if (result.success) {
    startCountdown();
    if (result.simulatedCode) {
      simulatedCodeNotice.value = result.simulatedCode;
    }
  } else {
    verificationError.value = result.error || 'Gagal mengirim kode verifikasi.';
  }
}

async function openMakeMainModal() {
  otpCode.value = '';
  verificationError.value = '';
  simulatedCodeNotice.value = '';
  isVerifyModalOpen.value = true;
  await requestOtpCode();
}

async function handleVerifySubmit() {
  if (!otpCode.value || otpCode.value.trim().length < 6) {
    verificationError.value = 'Masukkan 6 digit kode verifikasi dengan benar.';
    return;
  }

  isVerifying.value = true;
  verificationError.value = '';

  const result = await store.verifyAndSetMainDevice(otpCode.value.trim());
  isVerifying.value = false;

  if (result.success) {
    isVerifyModalOpen.value = false;
    otpCode.value = '';
  } else {
    verificationError.value = result.error || 'Kode verifikasi tidak valid.';
  }
}

function confirmRevokeSession(session: UserDeviceSession) {
  revokeTargetSession.value = session;
}

async function executeRevokeSession() {
  if (!revokeTargetSession.value) return;
  isRevoking.value = true;
  await store.revokeDeviceSession(revokeTargetSession.value.id);
  isRevoking.value = false;
  revokeTargetSession.value = null;
}

function confirmRevokeAll() {
  isRevokeAllConfirmOpen.value = true;
}

async function executeRevokeAll() {
  isRevoking.value = true;
  await store.revokeAllOtherDeviceSessions();
  isRevoking.value = false;
  isRevokeAllConfirmOpen.value = false;
}

function isOnlineNow(session: UserDeviceSession) {
  if (session.isCurrentDevice) return true;
  if (!session.lastActive) return false;
  const diffSec = Math.floor((Date.now() - new Date(session.lastActive).getTime()) / 1000);
  return diffSec < 180; // Aktif dalam 3 menit terakhir
}

function formatRelativeTime(dateStr?: string, isCurrent = false) {
  if (isCurrent) return 'Baru saja (Sedang aktif)';
  if (!dateStr) return 'Baru saja';
  const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diffSec < 120) return 'Baru saja (Sedang aktif)';
  if (diffSec < 3600) return `${Math.max(1, Math.floor(diffSec / 60))} menit lalu`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

onMounted(() => {
  if (props.isOpen && store.currentUser) {
    refreshSessions();
  }
});

watch(() => props.isOpen, (newVal) => {
  if (newVal && store.currentUser) {
    refreshSessions();
  }
}, { immediate: true });

onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer);
});
</script>

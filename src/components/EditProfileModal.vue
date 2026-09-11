<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
  >
    <div class="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
      
      <!-- Modal Header -->
      <div class="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-sm">
            <UserCog class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900">Ubah Profil Anggota</h3>
            <p class="text-xs text-slate-500">Perbarui identitas kontak dan pengajuan status keanggotaan</p>
          </div>
        </div>
        <button 
          @click="handleClose"
          class="p-2 rounded-full hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 transition cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation Tabs Inside Modal -->
      <div class="flex border-b border-slate-100 bg-slate-50/40 px-5 sm:px-6 pt-2 gap-2 text-xs">
        <button 
          @click="activeTab = 'profile'"
          class="pb-2.5 px-3 font-bold transition flex items-center gap-1.5 cursor-pointer relative"
          :class="activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'"
        >
          <User class="w-4 h-4" />
          <span>Informasi Profil</span>
        </button>

        <button 
          @click="activeTab = 'upgrade'"
          class="pb-2.5 px-3 font-bold transition flex items-center gap-1.5 cursor-pointer relative"
          :class="activeTab === 'upgrade' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'"
        >
          <GraduationCap class="w-4 h-4" />
          <span>Status Keanggotaan</span>
          <span 
            v-if="store.myPendingTeacherRequest" 
            class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
            title="Ada pengajuan yang sedang diproses"
          ></span>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-5 sm:p-6 overflow-y-auto flex-1 text-xs">
        
        <!-- TAB 1: FORM UBAH PROFIL UTAMA -->
        <div v-if="activeTab === 'profile'" class="space-y-4">
          
          <!-- Foto Profil / Avatar Uploader (Disimpan di uploads/avatar) -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-center gap-4">
            <div class="relative group shrink-0">
              <img 
                :src="avatarPreview || form.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'" 
                alt="Foto Profil" 
                class="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md group-hover:opacity-90 transition bg-white"
                referrerpolicy="no-referrer"
              />
              <div 
                v-if="isUploadingAvatar" 
                class="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center text-white text-[10px] font-bold"
              >
                <Loader2 class="w-5 h-5 animate-spin" />
              </div>
            </div>

            <div class="flex-1 text-center sm:text-left space-y-1.5">
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span class="font-bold text-slate-800">Foto Profil Anggota</span>
                <!-- Status Keanggotaan Badge -->
                <span 
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"
                  :class="store.currentUser?.memberType === 'guru' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-blue-100 text-blue-800 border border-blue-200'"
                >
                  <span v-if="store.currentUser?.memberType === 'guru'">👨‍🏫 Guru</span>
                  <span v-else>🎒 Siswa</span>
                </span>
              </div>
              <p class="text-[11px] text-slate-500">
                Pilih foto formal atau foto selfie yang jelas. Format JPG, PNG, atau WebP (Maks 10MB).
              </p>

              <div class="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <label 
                  class="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer shadow-xs transition flex items-center gap-1.5"
                  :class="{ 'opacity-50 pointer-events-none': isUploadingAvatar }"
                >
                  <Upload class="w-3.5 h-3.5 text-blue-600" />
                  <span>{{ isUploadingAvatar ? 'Mengunggah...' : 'Pilih Foto Baru' }}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    class="hidden" 
                    @change="handleAvatarFileSelect"
                  />
                </label>

                <button 
                  v-if="avatarPreview && avatarPreview !== store.currentUser?.avatar"
                  type="button"
                  @click="resetAvatar"
                  class="px-2.5 py-1.5 text-[11px] text-slate-500 hover:text-rose-600 transition"
                >
                  Batalkan Foto
                </button>
              </div>
            </div>
          </div>

          <!-- Form Fields -->
          <form @submit.prevent="handleSubmitProfile" class="space-y-3.5">
            <!-- Full Name -->
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
              <div class="relative">
                <User class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input 
                  v-model="form.name" 
                  type="text" 
                  required 
                  placeholder="Nama lengkap Anda"
                  class="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs transition font-medium"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- Email -->
              <div>
                <label class="block font-bold text-slate-700 mb-1">Alamat Email *</label>
                <div class="relative">
                  <Mail class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    v-model="form.email" 
                    type="email" 
                    required 
                    placeholder="email@sdnpengasinan7.sch.id"
                    class="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs transition"
                  />
                </div>
              </div>

              <!-- Phone -->
              <div>
                <label class="block font-bold text-slate-700 mb-1">No. HP / WhatsApp *</label>
                <div class="relative">
                  <Phone class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    v-model="form.phone" 
                    type="tel" 
                    required 
                    placeholder="08123456789"
                    class="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs transition font-mono"
                  />
                </div>
              </div>
            </div>

            <!-- Home Address -->
            <div>
              <label class="block font-bold text-slate-700 mb-1">Alamat Rumah / Domisili</label>
              <div class="relative">
                <MapPin class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <textarea 
                  v-model="form.address" 
                  rows="2" 
                  placeholder="Jl. Pengasinan Raya No. 07, Rawalumbu, Kota Bekasi"
                  class="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs transition"
                ></textarea>
              </div>
            </div>

            <!-- Submit Profile Button -->
            <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button 
                type="button" 
                @click="handleClose"
                class="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
              >
                Batal
              </button>

              <button 
                type="submit" 
                :disabled="isSaving"
                class="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <Check class="w-4 h-4" />
                <span>{{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
              </button>
            </div>
          </form>
        </div>

        <!-- TAB 2: ALUR UBAH KEANGGOTAAN MENJADI GURU (TERPISAH DARI FORM LAINNYA) -->
        <div v-else-if="activeTab === 'upgrade'" class="space-y-4">
          
          <!-- Case A: Sudah Berstatus Guru -->
          <div 
            v-if="store.currentUser?.memberType === 'guru'"
            class="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm">
                <CheckCircle2 class="w-6 h-6" />
              </div>
              <div>
                <h4 class="font-extrabold text-sm text-emerald-900">Status Anda: Terverifikasi Sebagai Guru Resmi</h4>
                <p class="text-xs text-emerald-700">Peran Anda diakui sebagai Dewan Guru / Pengajar SDN Pengasinan VII.</p>
              </div>
            </div>

            <!-- Rincian Hak Istimewa Dewan Guru -->
            <div class="p-3.5 bg-white/80 rounded-2xl border border-emerald-200/80 space-y-2.5">
              <div class="font-extrabold text-xs text-emerald-950 flex items-center gap-1.5">
                <Sparkles class="w-4 h-4 text-emerald-600" />
                <span>Benefit & Fasilitas Khusus Akun Guru:</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div class="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-950">
                  <div class="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Batas Pinjam</div>
                  <div class="font-extrabold text-sm mt-0.5 text-slate-900">Maksimal 6 Buku</div>
                  <div class="text-[10px] text-slate-500 mt-0.5">Siswa maks 3 buku</div>
                </div>
                <div class="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-950">
                  <div class="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Durasi Sirkulasi</div>
                  <div class="font-extrabold text-sm mt-0.5 text-slate-900">Hingga 14 Hari</div>
                  <div class="text-[10px] text-slate-500 mt-0.5">Siswa hanya 7 hari</div>
                </div>
                <div class="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-950">
                  <div class="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Auto-Suspend</div>
                  <div class="font-extrabold text-sm mt-0.5 text-emerald-700">Bebas Sanksi</div>
                  <div class="text-[10px] text-slate-500 mt-0.5">Tidak terkena penangguhan</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Case B: Sedang Menunggu Verifikasi Admin (Status: Pending) -->
          <div 
            v-else-if="store.myPendingTeacherRequest"
            class="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3.5"
          >
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                <Clock class="w-5 h-5 animate-pulse" />
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h4 class="font-extrabold text-sm text-amber-900">Pengajuan Status Guru Sedang Diproses</h4>
                  <span class="px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 text-[10px] font-bold uppercase">
                    Menunggu Admin
                  </span>
                </div>
                <p class="text-xs text-amber-700 mt-1">
                  Foto selfie verifikasi dan permohonan status Guru Anda telah berhasil dikirimkan ke Admin Perpustakaan.
                </p>
              </div>
            </div>

            <!-- Preview Selfie yang dikirim -->
            <div class="p-3 bg-white rounded-xl border border-amber-200 flex items-center gap-3">
              <img 
                :src="store.myPendingTeacherRequest.selfieUrl" 
                alt="Selfie Verifikasi" 
                class="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs"
                referrerpolicy="no-referrer"
              />
              <div class="text-[11px] text-slate-600 space-y-0.5">
                <div class="font-bold text-slate-800">Foto Selfie Terverifikasi:</div>
                <div>ID Pengajuan: <span class="font-mono text-slate-700">{{ store.myPendingTeacherRequest.id }}</span></div>
                <div class="text-slate-400">Diajukan: {{ formatDate(store.myPendingTeacherRequest.requestDate) }}</div>
              </div>
            </div>

            <p class="text-[11px] text-amber-800">
              💡 Admin perpustakaan akan memeriksa kecocokan wajah dengan data kepegawaian sekolah. Notifikasi akan diperbarui secara otomatis.
            </p>
          </div>

          <!-- Case C: Belum Mengajukan (Status: Siswa) atau Sebelumnya Ditolak -->
          <div v-else class="space-y-4">
            
            <!-- Notif jika sebelumnya pernah ditolak -->
            <div 
              v-if="store.myLatestTeacherRequest?.status === 'rejected' && upgradeStep === 'idle'"
              class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1.5"
            >
              <div class="flex items-center gap-2 font-bold text-xs text-rose-800">
                <AlertCircle class="w-4 h-4 text-rose-600" />
                <span>Pengajuan Sebelumnya Ditolak</span>
              </div>
              <p class="text-[11px] text-rose-700">
                Alasan: <strong class="font-semibold">{{ store.myLatestTeacherRequest.rejectionReason || 'Foto selfie kurang jelas atau tidak dapat diverifikasi.' }}</strong>
              </p>
              <p class="text-[11px] text-rose-600">
                Anda dapat mengajukan kembali dengan memastikan foto selfie terlihat terang dan wajah tampak penuh.
              </p>
            </div>

            <!-- Step 0: Penjelasan & Tombol Ubah Keanggotaan Menjadi Guru -->
            <div v-if="upgradeStep === 'idle'" class="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                  <Sparkles class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="font-extrabold text-sm text-indigo-950">
                    {{ store.myLatestTeacherRequest?.status === 'rejected' ? 'Pengajuan Ulang Status Guru' : 'Ubah Status Keanggotaan Menjadi Guru' }}
                  </h4>
                  <p class="text-xs text-indigo-700">Khusus bagi Bapak/Ibu Dewan Guru & Pengajar SDN Pengasinan VII</p>
                </div>
              </div>

              <div class="p-3.5 bg-white rounded-xl border border-indigo-100 space-y-2 text-slate-600 text-[11px] leading-relaxed">
                <p>Saat mendaftar, akun Anda berstatus default sebagai <strong class="text-blue-600">"Siswa"</strong> (kuota maks. 3 buku, pinjam 7 hari). Tingkatkan ke <strong class="text-indigo-600">"Guru"</strong> untuk memperoleh hak istimewa:</p>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-medium text-slate-700 text-[11px]">
                  <div class="p-2 rounded-lg bg-indigo-50/60 border border-indigo-100">
                    <div class="font-bold text-indigo-800">📚 Maks 6 Buku</div>
                    <div class="text-[10px] text-slate-500">Kuota pinjam 2x lipat</div>
                  </div>
                  <div class="p-2 rounded-lg bg-indigo-50/60 border border-indigo-100">
                    <div class="font-bold text-indigo-800">⏱️ Durasi 14 Hari</div>
                    <div class="text-[10px] text-slate-500">2 minggu masa pinjam</div>
                  </div>
                  <div class="p-2 rounded-lg bg-indigo-50/60 border border-indigo-100">
                    <div class="font-bold text-emerald-700">🛡️ Bebas Auto-Suspend</div>
                    <div class="text-[10px] text-slate-500">Bebas sanksi telat</div>
                  </div>
                </div>
              </div>

              <div class="pt-2">
                <button 
                  type="button" 
                  @click="openConfirmationPrompt"
                  class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transition cursor-pointer active:scale-95"
                >
                  <GraduationCap class="w-4 h-4" />
                  <span>{{ store.myLatestTeacherRequest?.status === 'rejected' ? 'Ajukan Ulang / Ambil Selfie Baru' : 'Ubah Keanggotaan Menjadi Guru' }}</span>
                </button>
              </div>
            </div>

            <!-- Step 1: Prompt Konfirmasi Persetujuan Selfie -->
            <div 
              v-else-if="upgradeStep === 'confirm_prompt'"
              class="p-5 sm:p-6 rounded-2xl bg-white border-2 border-indigo-200 shadow-lg space-y-4 animate-in fade-in duration-200"
            >
              <div class="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto shadow-inner">
                <GraduationCap class="w-6 h-6" />
              </div>

              <div class="text-center space-y-2">
                <h4 class="font-extrabold text-base text-slate-900">Verifikasi Identitas Dewan Guru</h4>
                <p class="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Untuk memvalidasi peran Bapak/Ibu sebagai <strong>Dewan Guru SDN Pengasinan VII</strong> dan mengaktifkan hak akses khusus pendidik, sistem memerlukan foto selfie langsung yang akan ditinjau oleh Admin Perpustakaan.
                </p>
                <div class="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-800 flex items-center gap-2 text-left">
                  <Sparkles class="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Pastikan wajah terlihat jelas, menghadap lurus ke depan, serta pencahayaan ruangan cukup terang.</span>
                </div>
                <p class="text-xs font-semibold text-indigo-950 pt-1">
                  Apakah Bapak/Ibu bersedia melanjutkan pengambilan foto sekarang?
                </p>
              </div>

              <div class="grid grid-cols-2 gap-3 pt-2">
                <button 
                  type="button" 
                  @click="upgradeStep = 'idle'"
                  class="py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold transition cursor-pointer text-center text-xs"
                >
                  Nanti Saja
                </button>
                <button 
                  type="button" 
                  @click="startCameraCapture"
                  class="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-md shadow-indigo-200 cursor-pointer text-center flex items-center justify-center gap-1.5 text-xs active:scale-95"
                >
                  <Camera class="w-4 h-4" />
                  <span>Ya, Buka Kamera</span>
                </button>
              </div>
            </div>

            <!-- Step 2: Kamera Aktif / Pengambilan Foto Selfie -->
            <div 
              v-else-if="upgradeStep === 'camera'" 
              class="space-y-3 animate-in fade-in duration-200"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                  Kamera Aktif — Ambil Foto Selfie
                </span>
                <button 
                  @click="stopCameraAndReset"
                  class="text-[11px] text-slate-500 hover:text-slate-800 transition"
                >
                  Batalkan
                </button>
              </div>

              <!-- Viewfinder Video -->
              <div class="relative w-full aspect-4/3 bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                <video 
                  ref="videoRef" 
                  autoplay 
                  playsinline 
                  class="w-full h-full object-cover transform -scale-x-100"
                ></video>

                <!-- Oval Face Guide -->
                <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div class="w-44 h-56 border-2 border-white/60 border-dashed rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"></div>
                </div>

                <div class="absolute bottom-2.5 text-center text-white/90 text-[10px] font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-xs">
                  Posisikan wajah Anda di dalam lingkaran panduan
                </div>
              </div>

              <!-- Shutter Capture Button -->
              <div class="pt-1 flex justify-center">
                <button 
                  type="button" 
                  @click="captureSelfie"
                  class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-lg shadow-indigo-300 transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Camera class="w-5 h-5" />
                  <span>Ambil Foto Selfie</span>
                </button>
              </div>
            </div>

            <!-- Step 3: Hasil Foto Selfie (Ulangi Foto / Kirim Permintaan) -->
            <div 
              v-else-if="upgradeStep === 'preview'" 
              class="space-y-3.5 animate-in fade-in duration-200"
            >
              <div class="text-center space-y-1">
                <h4 class="font-bold text-sm text-slate-900">Periksa Hasil Foto Selfie</h4>
                <p class="text-xs text-slate-500">Pastikan wajah Anda tampak terang dan mudah dikenali oleh Admin</p>
              </div>

              <div class="relative w-full aspect-4/3 max-w-xs mx-auto bg-slate-100 rounded-2xl overflow-hidden shadow-md border-2 border-indigo-500">
                <img 
                  :src="capturedImageBase64" 
                  alt="Hasil Selfie" 
                  class="w-full h-full object-cover"
                />
              </div>

              <div class="grid grid-cols-2 gap-3 pt-2">
                <button 
                  type="button" 
                  @click="retakeSelfie"
                  class="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer flex items-center justify-center gap-1.5 text-xs"
                >
                  <RotateCcw class="w-4 h-4" />
                  <span>Ulangi Foto</span>
                </button>

                <button 
                  type="button" 
                  @click="sendTeacherRequest"
                  :disabled="isSubmittingRequest"
                  class="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-md shadow-indigo-200 cursor-pointer flex items-center justify-center gap-1.5 text-xs disabled:opacity-50"
                >
                  <Send class="w-4 h-4" />
                  <span>{{ isSubmittingRequest ? 'Mengirim...' : 'Kirim Permintaan' }}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onBeforeUnmount } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import { 
  UserCog, User, GraduationCap, X, Upload, Loader2, Check, Mail, Phone, 
  MapPin, CheckCircle2, Clock, AlertCircle, Sparkles, Camera, RotateCcw, Send 
} from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  isOpen: boolean;
  initialTab?: 'profile' | 'upgrade';
}>(), {
  initialTab: 'profile'
});

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useLibraryStore();

const activeTab = ref<'profile' | 'upgrade'>('profile');
const isSaving = ref(false);
const isUploadingAvatar = ref(false);
const avatarPreview = ref('');

// Upgrade to Teacher Flow State
type UpgradeStep = 'idle' | 'confirm_prompt' | 'camera' | 'preview';
const upgradeStep = ref<UpgradeStep>('idle');
const videoRef = ref<HTMLVideoElement | null>(null);
const capturedImageBase64 = ref('');
const isSubmittingRequest = ref(false);
let mediaStream: MediaStream | null = null;

const form = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
  avatar: ''
});

// Watch open state to populate form
watch(() => props.isOpen, (newVal) => {
  if (newVal && store.currentUser) {
    activeTab.value = props.initialTab || 'profile';
    form.name = store.currentUser.name || '';
    form.email = store.currentUser.email || '';
    form.phone = store.currentUser.phone || '';
    form.address = store.currentUser.address || '';
    form.avatar = store.currentUser.avatar || '';
    avatarPreview.value = form.avatar;
    upgradeStep.value = (props.initialTab === 'upgrade' && store.myLatestTeacherRequest?.status === 'rejected')
      ? 'confirm_prompt'
      : 'idle';
  } else {
    stopCamera();
    upgradeStep.value = 'idle';
    capturedImageBase64.value = '';
  }
});

// Avatar File Upload Handler (Simpan di uploads/avatar)
async function handleAvatarFileSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  isUploadingAvatar.value = true;

  try {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('filename', `user_${store.currentUser?.id || 'profile'}`);

    const res = await fetch('/api/upload-avatar', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Gagal mengunggah foto profil');
    }

    form.avatar = data.url;
    avatarPreview.value = data.url;
    store.showToast('Foto profil baru berhasil diunggah!');
  } catch (err: any) {
    console.error('Upload avatar error:', err);
    store.setError(err?.message || 'Gagal mengunggah foto profil');
  } finally {
    isUploadingAvatar.value = false;
    target.value = '';
  }
}

function resetAvatar() {
  form.avatar = store.currentUser?.avatar || '';
  avatarPreview.value = form.avatar;
}

// Submit Profile Changes
async function handleSubmitProfile() {
  if (!form.name.trim()) {
    store.setError('Nama lengkap tidak boleh kosong.');
    return;
  }
  if (!form.email.trim()) {
    store.setError('Alamat email tidak boleh kosong.');
    return;
  }

  isSaving.value = true;
  try {
    const res = await store.updateCurrentMemberProfile({
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      avatar: form.avatar
    });

    if (res.success) {
      emit('close');
    }
  } finally {
    isSaving.value = false;
  }
}

// ==========================================
// ALUR UBAH KEANGGOTAAN MENJADI GURU
// ==========================================
function openConfirmationPrompt() {
  upgradeStep.value = 'confirm_prompt';
}

async function startCameraCapture() {
  upgradeStep.value = 'camera';

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
    store.setError('Gagal mengakses kamera perangkat: ' + (err?.message || 'Izin kamera ditolak. Pastikan izin kamera aktif.'));
    upgradeStep.value = 'idle';
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

  // Mirror effect horizontally to match webcam display
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  capturedImageBase64.value = canvas.toDataURL('image/jpeg', 0.85);

  // Stop camera video stream
  stopCamera();
  upgradeStep.value = 'preview';
}

function retakeSelfie() {
  capturedImageBase64.value = '';
  startCameraCapture();
}

function stopCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
}

function stopCameraAndReset() {
  stopCamera();
  upgradeStep.value = 'idle';
}

async function sendTeacherRequest() {
  if (!capturedImageBase64.value) {
    store.setError('Foto selfie belum diambil.');
    return;
  }

  isSubmittingRequest.value = true;
  try {
    // 1. Upload foto selfie ke server /api/upload-selfie
    const res = await fetch('/api/upload-selfie', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageBase64: capturedImageBase64.value,
        memberId: store.currentUser?.id
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Gagal menyimpan foto selfie ke server');
    }

    // 2. Simpan permohonan ke Firestore
    const subRes = await store.submitTeacherRequest({
      selfieUrl: data.url
    });

    if (subRes.success) {
      stopCamera();
      upgradeStep.value = 'idle';
      capturedImageBase64.value = '';
    }
  } catch (err: any) {
    console.error('Send teacher request error:', err);
    store.setError(err?.message || 'Gagal mengirim permintaan status Guru');
  } finally {
    isSubmittingRequest.value = false;
  }
}

function handleClose() {
  stopCamera();
  emit('close');
}

function formatDate(isoStr: string) {
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

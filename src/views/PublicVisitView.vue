<template>
  <div class="min-h-screen py-4 sm:py-10 px-0 sm:px-6 w-[95%] sm:max-w-3xl mx-auto">
    <!-- Header Branding -->
    <div class="text-center space-y-2 mb-6 sm:mb-8 animate-in fade-in duration-300">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800 shadow-xs">
        <Sparkles class="w-3.5 h-3.5" />
        <span>Buku Tamu Digital Perpustakaan</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        Presensi Kunjungan Perpustakaan
      </h1>
      <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
        Selamat datang di Perpustakaan SDN Pengasinan VII. Silakan lengkapi presensi kehadiran Anda di bawah ini.
      </p>

      <!-- Today's Live Counter Badge -->
      <div class="pt-2 flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800/60">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{{ store.todayVisitsCount }} Pengunjung Hari Ini</span>
        </span>
        <span class="text-slate-300 dark:text-slate-700">•</span>
        <span>{{ formattedCurrentDate }}</span>
      </div>
    </div>

    <!-- MULTI-STATE VISITATION SCREEN (Menunggu Konfirmasi Admin / Diperbolehkan Masuk / Ditolak) -->
    <!-- STATE 1: MENUNGGU KONFIRMASI ADMIN -->
    <div 
      v-if="submittedVisit && submittedVisit.status === 'pending'"
      class="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 border-2 border-amber-300 dark:border-amber-700/80 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300 w-full"
    >
      <div class="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto">
        <div class="absolute inset-0 rounded-full bg-amber-400/20 animate-ping"></div>
        <div class="relative w-full h-full rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner border-2 border-amber-300 dark:border-amber-700">
          <Clock class="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
        </div>
      </div>

      <div class="space-y-2">
        <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-extrabold uppercase tracking-wider border border-amber-300 dark:border-amber-700 shadow-xs">
          <span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
          <span>Menunggu Konfirmasi Admin</span>
        </span>
        <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Mohon Menunggu di Meja Sirkulasi
        </h2>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
          Permintaan check-in Anda atas nama <strong>{{ submittedVisit.name }}</strong> telah masuk ke antrian buku tamu. Harap menunggu petugas perpustakaan menyetujui kedatangan Anda.
        </p>
      </div>

      <!-- Real-time Status Card -->
      <div class="bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl p-4 sm:p-5 border border-amber-200/80 dark:border-amber-800/80 text-left max-w-md mx-auto space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-amber-200 dark:border-amber-800/80 text-xs">
          <span class="text-slate-500 dark:text-slate-400 font-medium">Nomor Antrian:</span>
          <span class="font-mono font-bold text-amber-700 dark:text-amber-300">{{ submittedVisit.id }}</span>
        </div>
        <div class="grid grid-cols-2 gap-2.5 text-xs">
          <div>
            <span class="text-slate-400 dark:text-slate-500 block text-[11px]">Nama Anggota:</span>
            <span class="font-bold text-slate-800 dark:text-slate-200 truncate block">
              {{ submittedVisit.name }}
            </span>
          </div>
          <div>
            <span class="text-slate-400 dark:text-slate-500 block text-[11px]">ID / No. Kartu:</span>
            <span class="font-mono font-bold text-slate-800 dark:text-slate-200">
              {{ submittedVisit.memberCardNumber || '-' }}
            </span>
          </div>
          <div>
            <span class="text-slate-400 dark:text-slate-500 block text-[11px]">Tujuan Kunjungan:</span>
            <span class="font-bold text-blue-600 dark:text-blue-400">{{ submittedVisit.purpose }}</span>
          </div>
          <div>
            <span class="text-slate-400 dark:text-slate-500 block text-[11px]">Waktu Pengajuan:</span>
            <span class="font-medium text-slate-800 dark:text-slate-200">{{ formattedTime(submittedVisit.timestamp) }}</span>
          </div>
        </div>

        <div class="pt-2 border-t border-amber-200/80 dark:border-amber-800/60 flex items-center gap-2 text-[11px] text-amber-800 dark:text-amber-300">
          <Loader2 class="w-3.5 h-3.5 animate-spin shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Sistem terhubung real-time. Halaman akan otomatis terbuka ketika admin menekan <strong>Setujui</strong>.</span>
        </div>
      </div>

      <div class="flex items-center justify-center gap-3 pt-1">
        <button 
          @click="cancelPendingVisit"
          type="button"
          class="px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 text-xs font-bold transition cursor-pointer active:scale-95"
        >
          Batalkan Permintaan
        </button>
      </div>
    </div>

    <!-- STATE 2: APPROVED SCREEN ("Anda sudah diperbolehkan masuk") -->
    <div 
      v-else-if="submittedVisit && (submittedVisit.status === 'approved' || !submittedVisit.status)"
      class="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-8 border-2 border-emerald-300 dark:border-emerald-800 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300 w-full"
    >
      <div class="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto">
        <div class="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping"></div>
        <div class="relative w-full h-full rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner border-2 border-emerald-300 dark:border-emerald-700">
          <CheckCircle2 class="w-10 h-10 sm:w-12 sm:h-12" />
        </div>
      </div>

      <div class="space-y-2">
        <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold uppercase tracking-wider border border-emerald-300 dark:border-emerald-700 shadow-xs">
          <Sparkles class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Akses & Sirkulasi Dikonfirmasi (Diperbolehkan Masuk)</span>
        </span>
        <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Selamat Datang, {{ submittedVisit.name }}!
        </h2>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
          Kunjungan Anda telah dikonfirmasi dan disetujui oleh admin perpustakaan. Silakan masuk ke ruang perpustakaan dan gunakan fasilitas dengan tertib.
        </p>
      </div>

      <!-- Detail Ticket Card -->
      <div class="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 text-left max-w-md mx-auto space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700 text-xs">
          <span class="text-slate-400 dark:text-slate-500 font-medium">Nomor Presensi:</span>
          <span class="font-mono font-bold text-slate-800 dark:text-slate-200">{{ submittedVisit.id }}</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span class="text-slate-400 dark:text-slate-500 block text-[11px]">Kategori:</span>
            <span class="font-bold text-slate-800 dark:text-slate-200 capitalize">
              {{ submittedVisit.visitorType === 'member' ? 'Anggota Perpustakaan' : 'Tamu Umum' }}
            </span>
          </div>
          <div>
            <span class="text-slate-400 dark:text-slate-500 block text-[11px]">Tujuan:</span>
            <span class="font-bold text-blue-600 dark:text-blue-400">{{ submittedVisit.purpose }}</span>
          </div>
          <div>
            <span class="text-slate-400 dark:text-slate-500 block text-[11px]">Asal / Instansi:</span>
            <span class="font-semibold text-slate-800 dark:text-slate-200 truncate block">{{ submittedVisit.origin }}</span>
          </div>
          <div>
            <span class="text-slate-400 dark:text-slate-500 block text-[11px]">Waktu Masuk:</span>
            <span class="font-medium text-slate-800 dark:text-slate-200">{{ formattedTime(submittedVisit.approvedAt || submittedVisit.timestamp) }}</span>
          </div>
          <div v-if="submittedVisit.approvedBy" class="col-span-2 pt-1 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <span class="text-slate-400 dark:text-slate-500 text-[11px]">Dikonfirmasi Oleh:</span>
            <span class="font-bold text-emerald-700 dark:text-emerald-300 text-[11px]">
              {{ submittedVisit.approvedBy }}
            </span>
          </div>
          <div v-if="submittedVisit.tokenUsed" class="col-span-2 pt-1 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <span class="text-slate-400 dark:text-slate-500 text-[11px]">Kode Token Terverifikasi:</span>
            <span class="font-mono font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px]">
              {{ submittedVisit.tokenUsed }}
            </span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button 
          @click="resetForm"
          class="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-md shadow-emerald-500/20 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
        >
          <CheckCircle2 class="w-4 h-4" />
          <span>Selesai & Mengerti</span>
        </button>

        <router-link 
          to="/"
          class="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-full transition cursor-pointer flex items-center justify-center gap-2"
        >
          <BookOpen class="w-4 h-4" />
          <span>Jelajahi Katalog Buku</span>
        </router-link>

        <router-link 
          to="/member-portal"
          class="w-full sm:w-auto px-5 py-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-xs rounded-full transition cursor-pointer flex items-center justify-center gap-2"
        >
          <User class="w-4 h-4" />
          <span>Portal Pinjaman Saya</span>
        </router-link>
      </div>
    </div>

    <!-- STATE 3: REJECTED SCREEN -->
    <div 
      v-else-if="submittedVisit && submittedVisit.status === 'rejected'"
      class="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 border border-rose-300 dark:border-rose-800 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300 w-full"
    >
      <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner border border-rose-200 dark:border-rose-800">
        <AlertCircle class="w-10 h-10 sm:w-12 sm:h-12" />
      </div>

      <div class="space-y-2">
        <span class="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase tracking-wider border border-rose-300 dark:border-rose-700">
          Permintaan Belum Disetujui
        </span>
        <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Check-in Belum Disetujui Petugas
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Permintaan masuk Anda belum dapat disetujui oleh admin saat ini. Silakan langsung menemui petugas di meja sirkulasi perpustakaan.
        </p>
      </div>

      <div class="flex items-center justify-center gap-3 pt-2">
        <button 
          @click="resetForm"
          class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full shadow-md transition cursor-pointer active:scale-95"
        >
          Coba Lagi
        </button>
      </div>
    </div>

    <!-- MAIN FORM CONTAINER -->
    <div v-else class="bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-7 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6 w-full">
      
      <!-- Visitor Type Tabs: Non-Member vs Member -->
      <div class="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center gap-1">
        <button 
          type="button"
          @click="activeTab = 'non_member'"
          class="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          :class="activeTab === 'non_member' 
            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' 
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
        >
          <User class="w-4 h-4" />
          <span>Bukan Member / Tamu Umum</span>
        </button>
        <button 
          type="button"
          @click="activeTab = 'member'"
          class="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          :class="activeTab === 'member' 
            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' 
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
        >
          <QrCode class="w-4 h-4" />
          <span>Member Perpustakaan</span>
        </button>
      </div>

      <!-- TAB 1: FORM TAMU UMUM / NON-MEMBER -->
      <form v-if="activeTab === 'non_member'" @submit.prevent="submitNonMemberVisit" class="space-y-4 sm:space-y-5">
        
        <!-- Nama Lengkap -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Nama Lengkap <span class="text-rose-500">*</span>
          </label>
          <div class="relative">
            <User class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              v-model="guestForm.name"
              type="text"
              required
              placeholder="Masukkan nama lengkap Anda..."
              class="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        <!-- Asal Instansi / Organisasi / Daerah -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Asal (Institusi, Sekolah, Organisasi, atau Kota Asal) <span class="text-rose-500">*</span>
          </label>
          <div class="relative">
            <Building2 class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              v-model="guestForm.origin"
              type="text"
              required
              placeholder="Contoh: SMPN 1 Bekasi, Wali Murid Kelas 4, Umum..."
              class="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <!-- Quick Suggestion Chips -->
          <div class="flex flex-wrap items-center gap-1.5 pt-1">
            <span class="text-[10px] text-slate-400 mr-1">Rekomendasi Cepat:</span>
            <button 
              v-for="chip in quickOriginChips" 
              :key="chip"
              type="button"
              @click="guestForm.origin = chip"
              class="px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer active:scale-95"
              :class="guestForm.origin === chip 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'"
            >
              {{ chip }}
            </button>
          </div>
        </div>

        <!-- Kode Token Kunjungan (Didapat dari Admin / Petugas) -->
        <div class="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/60 space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-1">
            <label class="block text-xs font-bold text-amber-900 dark:text-amber-200">
              Kode Token Kunjungan <span class="text-rose-500">*</span>
            </label>
            <span class="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
              Minta kode ke meja petugas perpustakaan
            </span>
          </div>

          <div class="relative">
            <KeyRound class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400" />
            <input 
              v-model="guestForm.token"
              type="text"
              required
              placeholder="Contoh: LIB-8492"
              @input="tokenError = ''; guestForm.token = guestForm.token.toUpperCase()"
              class="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-white dark:bg-slate-800 border text-slate-800 dark:text-white placeholder-slate-400 font-mono font-bold tracking-wider text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 uppercase transition"
              :class="tokenError ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-amber-200 dark:border-amber-700'"
            />
          </div>

          <p v-if="tokenError" class="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium pt-0.5">
            <AlertCircle class="w-3.5 h-3.5 shrink-0" />
            <span>{{ tokenError }}</span>
          </p>
          <p v-else class="text-[11px] text-amber-800/80 dark:text-amber-300/80">
            Pengunjung non-member wajib memasukkan kode token resmi harian dari petugas perpustakaan.
          </p>
        </div>

        <!-- Tujuan Kunjungan -->
        <div class="space-y-2">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Tujuan Kunjungan <span class="text-rose-500">*</span>
          </label>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button 
              type="button"
              v-for="p in ['Membaca Buku', 'Observasi', 'Lainnya']"
              :key="p"
              @click="guestForm.purpose = p as any"
              class="p-3 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer active:scale-95"
              :class="guestForm.purpose === p 
                ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold shadow-xs' 
                : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-slate-300'"
            >
              <div class="flex items-center justify-between mb-1">
                <BookOpen v-if="p === 'Membaca Buku'" class="w-4 h-4 text-blue-600" />
                <Eye v-else-if="p === 'Observasi'" class="w-4 h-4 text-emerald-600" />
                <MoreHorizontal v-else class="w-4 h-4 text-amber-600" />
                <span v-if="guestForm.purpose === p" class="w-2 h-2 rounded-full bg-blue-600"></span>
              </div>
              <span class="text-xs">{{ p }}</span>
            </button>
          </div>

          <!-- Keterangan jika tujuan 'Lainnya' -->
          <div v-if="guestForm.purpose === 'Lainnya'" class="pt-1">
            <input 
              v-model="guestForm.purposeDetails"
              type="text"
              required
              placeholder="Sebutkan tujuan kunjungan Anda (misal: Bertemu Kepala Perpus, Studi Banding...)"
              class="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        <!-- Optional: Nomor WhatsApp / Kontak -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              No. WhatsApp / HP <span class="text-[11px] text-slate-400 font-normal">(Opsional)</span>
            </label>
            <div class="relative">
              <Phone class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                v-model="guestForm.phone"
                type="tel"
                placeholder="0812xxxxxxx"
                class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Catatan / Pesan Kesan <span class="text-[11px] text-slate-400 font-normal">(Opsional)</span>
            </label>
            <div class="relative">
              <MessageSquare class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                v-model="guestForm.notes"
                type="text"
                placeholder="Pesan, saran, atau tujuan khusus..."
                class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-2">
          <button 
            type="submit"
            :disabled="isSubmitting"
            class="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            <UserCheck class="w-4 h-4" />
            <span>{{ isSubmitting ? 'Menyimpan Presensi...' : 'Simpan Presensi Kunjungan' }}</span>
          </button>
        </div>
      </form>

      <!-- TAB 2: CHECK-IN MEMBER PERPUSTAKAAN -->
      <div v-else class="space-y-5">
        <!-- Banner Khusus Member yang Sedang Login (Otomatis Terkunci ke Diri Sendiri, Mencegah Manipulasi/Penyamaran) -->
        <div v-if="isLoggedInMember" class="p-4 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 space-y-1.5 shadow-xs">
          <div class="font-extrabold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
            <ShieldCheck class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Presensi Anggota Terverifikasi (Akun Pribadi)</span>
          </div>
          <p class="text-[11px] text-emerald-700 dark:text-emerald-300/90 leading-relaxed">
            Anda masuk sebagai <strong>{{ store.currentUser?.name }}</strong> ({{ store.currentUser?.cardNumber }}). Demi keamanan data dan mencegah peniruan identitas, presensi kunjungan otomatis atas nama akun Anda sendiri.
          </p>
        </div>

        <!-- Mode Scanner & Pencarian Member (HANYA MUNCUL JIKA BELUM LOGIN / ADMIN, HILANGKAN UNTUK MEMBER LOGIN) -->
        <template v-else>
          <div class="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 space-y-1">
            <div class="font-bold flex items-center gap-1.5">
              <QrCode class="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Presensi Anggota Cepat</span>
            </div>
            <p class="text-[11px] text-blue-700 dark:text-blue-300">
              Arahkan kamera ke QR Code Kartu Member Digital Anda atau ketik Nomor Kartu Anggota (contoh: <code>LIB-001</code>).
            </p>
          </div>

          <!-- Banner Ajakan Login untuk Member yang Belum Masuk -->
          <div v-if="!store.currentUser" class="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="space-y-0.5">
              <div class="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <UserCheck class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Sudah Punya Akun Anggota?</span>
              </div>
              <p class="text-[11px] text-amber-700 dark:text-amber-300/90">
                Masuk ke akun Anda agar presensi tercatat otomatis dan terverifikasi secara resmi.
              </p>
            </div>
            <router-link 
              to="/login?redirect=/kunjungan"
              class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer active:scale-95 shrink-0 text-center"
            >
              Masuk Sekarang
            </router-link>
          </div>

          <!-- Member Scanner or Input Toggle (Full Width 100% on Mobile) -->
          <div class="flex items-center justify-center gap-2 w-full">
            <button 
              type="button"
              @click="memberScanMode = 'manual'"
              class="flex-1 py-2.5 px-3 rounded-full text-xs font-bold transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
              :class="memberScanMode === 'manual' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'"
            >
              <Search class="w-3.5 h-3.5 shrink-0" />
              <span>Ketik Nama / ID Member</span>
            </button>
            <button 
              type="button"
              @click="memberScanMode = 'camera'"
              class="flex-1 py-2.5 px-3 rounded-full text-xs font-bold transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
              :class="memberScanMode === 'camera' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'"
            >
              <Camera class="w-3.5 h-3.5 shrink-0" />
              <span>Scan QR Kamera</span>
            </button>
          </div>

          <!-- Camera Scanner Component -->
          <div v-if="memberScanMode === 'camera'" class="animate-in fade-in duration-200">
            <MemberCardScanner 
              @scan-success="handleMemberCodeScanned"
              @selected="handleMemberScannerSelected"
            />
          </div>

          <!-- Manual Card Lookup Form (Search by Name or Card Number) -->
          <div v-else class="space-y-3">
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nama Member / Nomor Kartu (ID Member)
                </label>
                <span v-if="matchedMember" class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 class="w-3.5 h-3.5" /> Data Ditemukan
                </span>
              </div>
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    v-model="memberSearchKey"
                    type="text"
                    placeholder="Ketik minimal 3 karakter nama lengkap, atau nomor kartu (LIB-001)..."
                    @keydown.enter.prevent="lookupMember"
                    @input="onMemberSearchInput"
                    class="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <Loader2 v-if="isSearchingMember" class="w-4 h-4 text-blue-500 animate-spin" />
                    <button 
                      v-else-if="memberSearchKey"
                      type="button"
                      @click="clearMemberSearch"
                      class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full cursor-pointer"
                      title="Hapus pencarian"
                    >
                      <X class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <button 
                  type="button"
                  @click="lookupMember"
                  :disabled="isSearchingMember"
                  class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-sm transition cursor-pointer active:scale-95 shrink-0 flex items-center gap-1.5 disabled:opacity-75"
                >
                  <Loader2 v-if="isSearchingMember" class="w-3.5 h-3.5 animate-spin" />
                  <Search v-else class="w-3.5 h-3.5" />
                  <span>{{ isSearchingMember ? 'Mencari...' : 'Cari' }}</span>
                </button>
              </div>
              <div class="flex flex-wrap items-center justify-between text-[11px] gap-1 pt-0.5">
                <p v-if="memberSearchKey.trim().length > 0 && memberSearchKey.trim().length < 3" class="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                  <span>⚠️ Ketik minimal 3 karakter untuk mencari ({{ memberSearchKey.trim().length }}/3)</span>
                </p>
                <p v-else-if="isSearchingMember" class="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                  <Loader2 class="w-3 h-3 animate-spin" />
                  <span>Mencari ke database server perpustakaan...</span>
                </p>
                <p v-else class="text-slate-500 dark:text-slate-400">
                  💡 Ketik minimal 3 karakter, sistem akan otomatis mencari ke server setelah jeda 500ms.
                </p>
                <span v-if="memberCandidates.length > 0 && !matchedMember" class="text-blue-600 dark:text-blue-400 font-bold ml-auto">
                  {{ memberCandidates.length }} anggota ditemukan
                </span>
              </div>
            </div>

            <!-- Multiple Candidates Suggestion / Search Result List -->
            <div 
              v-if="memberCandidates.length >= 1 && !matchedMember" 
              class="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in duration-200"
            >
              <div class="flex items-center justify-between text-xs px-1">
                <span class="font-bold text-slate-700 dark:text-slate-300">
                  Ditemukan {{ memberCandidates.length }} Anggota:
                </span>
                <span class="text-[11px] text-slate-500 dark:text-slate-400">Pilih profil Anda:</span>
              </div>
              <div class="max-h-60 overflow-y-auto space-y-1.5 pr-0.5">
                <button 
                  v-for="cand in memberCandidates"
                  :key="cand.id"
                  type="button"
                  @click="selectMemberCandidate(cand)"
                  class="w-full p-2.5 rounded-xl border text-left flex items-center justify-between gap-3 transition cursor-pointer active:scale-98 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/80 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/40"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <img 
                      :src="cand.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'" 
                      alt="Avatar"
                      class="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="font-extrabold text-xs text-slate-900 dark:text-white truncate">{{ cand.name }}</span>
                        <span 
                          class="px-1.5 py-0.2 rounded-full text-[9px] font-bold"
                          :class="cand.memberType === 'guru' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'"
                        >
                          {{ cand.memberType === 'guru' ? 'Guru' : 'Siswa' }}
                        </span>
                      </div>
                      <div class="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        <span>{{ cand.cardNumber }}</span>
                        <span v-if="cand.nis">• NIS: {{ cand.nis }}</span>
                      </div>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold shrink-0 shadow-xs">
                    Pilih Saya
                  </span>
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- Found Member Confirmation Card -->
        <div 
          v-if="matchedMember" 
          class="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-4 animate-in slide-in-from-top-2 duration-200"
        >
          <div class="flex items-center justify-between pb-1 border-b border-emerald-200/80 dark:border-emerald-800/60">
            <span class="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 class="w-3.5 h-3.5" /> Konfirmasi Anggota
            </span>
            <button 
              v-if="!isLoggedInMember"
              type="button" 
              @click="matchedMember = null; memberSearchKey = ''" 
              class="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:underline cursor-pointer"
            >
              Ganti Anggota
            </button>
            <span v-else class="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck class="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Akun Terverifikasi</span>
            </span>
          </div>

          <div class="flex items-center gap-3">
            <img 
              :src="matchedMember.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'" 
              alt="Avatar Member"
              class="w-12 h-12 rounded-xl object-cover border-2 border-white dark:border-slate-800 shadow-xs shrink-0"
            />
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                  {{ matchedMember.cardNumber }}
                </span>
                <span 
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  :class="matchedMember.memberType === 'guru' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'"
                >
                  {{ matchedMember.memberType === 'guru' ? 'Guru' : 'Siswa' }}
                </span>
                <span v-if="matchedMember.nis" class="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  NIS: {{ matchedMember.nis }}
                </span>
              </div>
              <h3 class="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                {{ matchedMember.name }}
              </h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {{ matchedMember.email || 'SDN Pengasinan VII' }}
              </p>
            </div>
          </div>

          <!-- Tujuan Kunjungan Member Selection -->
          <div class="space-y-1.5 pt-1 border-t border-emerald-200/80 dark:border-emerald-800/60">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Pilih Tujuan Kunjungan Anda:
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button 
                type="button"
                v-for="p in ['Membaca Buku', 'Meminjam Buku', 'Observasi', 'Lainnya']"
                :key="p"
                @click="memberVisitPurpose = p as any"
                class="py-2 px-2.5 rounded-xl text-xs font-semibold border transition text-center cursor-pointer active:scale-95"
                :class="memberVisitPurpose === p 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'"
              >
                {{ p }}
              </button>
            </div>

            <div v-if="memberVisitPurpose === 'Lainnya'" class="pt-1.5">
              <input 
                v-model="memberPurposeDetails"
                type="text"
                placeholder="Sebutkan tujuan lainnya..."
                class="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs"
              />
            </div>
          </div>

          <!-- Confirm Member Check-in Button -->
          <button 
            type="button"
            @click="submitMemberVisit"
            :disabled="isSubmitting"
            class="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
          >
            <UserCheck class="w-4 h-4" />
            <span>Konfirmasi Akses dan Sirkulasi (Check-in {{ matchedMember.name }})</span>
          </button>
        </div>

        <!-- Search Error Notice -->
        <div v-if="memberSearchError" class="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle class="w-4 h-4 shrink-0 text-rose-500" />
          <span>{{ memberSearchError }}</span>
        </div>
      </div>
    </div>

    <!-- Footer Help & Back link -->
    <div class="mt-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
      <p>Perpustakaan SDN Pengasinan VII • Kota Bekasi</p>
      <div class="flex items-center justify-center gap-4">
        <router-link to="/" class="hover:text-blue-600 dark:hover:text-blue-400 transition">
          Katalog Buku
        </router-link>
        <span>•</span>
        <router-link to="/member-portal" class="hover:text-blue-600 dark:hover:text-blue-400 transition">
          Portal Anggota
        </router-link>
        <span>•</span>
        <router-link to="/admin" class="hover:text-blue-600 dark:hover:text-blue-400 transition">
          Admin Console
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watchEffect, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useLibraryStore } from '../stores/library.js';
import type { Member, LibraryVisit, VisitPurpose } from '../types.js';
import { isTodayVisit } from '../utils/dateUtils.js';
import MemberCardScanner from '../components/MemberCardScanner.vue';
import { 
  Sparkles, 
  User, 
  QrCode, 
  Building2, 
  BookOpen, 
  Eye, 
  MoreHorizontal, 
  Phone, 
  MessageSquare, 
  UserCheck, 
  Camera, 
  CreditCard, 
  CheckCircle2, 
  UserPlus, 
  AlertCircle,
  KeyRound,
  Search,
  X,
  Loader2,
  ShieldCheck,
  Clock
} from 'lucide-vue-next';

const store = useLibraryStore();
const route = useRoute();

const activeTab = ref<'non_member' | 'member'>('non_member');
const isSubmitting = ref(false);
const submittedVisit = ref<LibraryVisit | null>(null);

// Status apakah yang membuka adalah member yang sudah login
const isLoggedInMember = computed(() => {
  return Boolean(store.currentUser && store.currentUser.role === 'member');
});

const quickOriginChips = [
  'Wali Murid SDN Pengasinan VII',
  'Sekolah Lain / Tamu',
  'Dinas Pendidikan',
  'Masyarakat Umum / Warga',
  'Alumni SDN Pengasinan VII',
  'Mahasiswa / Peneliti'
];

// Guest Form
const guestForm = ref({
  name: '',
  origin: '',
  token: '',
  purpose: 'Membaca Buku' as VisitPurpose,
  purposeDetails: '',
  phone: '',
  notes: ''
});
const tokenError = ref('');

// Member Form
const memberScanMode = ref<'manual' | 'camera'>('manual');
const memberSearchKey = ref('');
const memberSearchError = ref('');
const matchedMember = ref<Member | null>(null);
const memberCandidates = ref<Member[]>([]);
const memberVisitPurpose = ref<VisitPurpose>('Membaca Buku');
const memberPurposeDetails = ref('');
const isSearchingMember = ref(false);
let memberSearchDebounceTimer: any = null;

// Mengunci akun jika member sedang login agar tidak dapat memilih anggota lain
watchEffect(() => {
  if (isLoggedInMember.value && store.currentUser) {
    matchedMember.value = store.currentUser;
  }
});

// Pantau update status kunjungan secara real-time (ketika admin menekan "Setujui" di antrian masuk)
watch(
  () => store.visits,
  (allVisits) => {
    if (submittedVisit.value && submittedVisit.value.status === 'pending') {
      const live = allVisits.find(v => v.id === submittedVisit.value?.id);
      if (live && live.status && live.status !== submittedVisit.value.status) {
        submittedVisit.value = { ...live };
        if (live.status === 'approved') {
          store.showToast('Persetujuan diterima: Anda sudah diperbolehkan masuk!');
        } else if (live.status === 'rejected') {
          store.showToast('Permintaan check-in belum disetujui admin.');
        }
      }
    }
  },
  { deep: true }
);

const formattedCurrentDate = computed(() => {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());
});

const formattedTime = (isoString?: string) => {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return `${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
  } catch {
    return isoString;
  }
};

onMounted(() => {
  // If token query is in URL, auto-fill token
  if (route.query.token && typeof route.query.token === 'string') {
    guestForm.value.token = route.query.token.toUpperCase().trim();
  }

  // If currentUser is already logged in, automatically pre-select their member profile and tab
  if (isLoggedInMember.value && store.currentUser) {
    activeTab.value = 'member';
    matchedMember.value = store.currentUser;

    const pendingToday = store.visits.find(v => 
      v.visitorType === 'member' && 
      (v.memberId === store.currentUser?.id || v.memberCardNumber === store.currentUser?.cardNumber) &&
      isTodayVisit(v) &&
      v.status === 'pending'
    );
    if (pendingToday) {
      submittedVisit.value = pendingToday;
    }
  }
});

const searchMembers = (query: string): Member[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return store.members.filter(m => {
    const nameMatch = m.name && m.name.toLowerCase().includes(q);
    const cardMatch = m.cardNumber && m.cardNumber.toLowerCase().includes(q);
    const idMatch = m.id && m.id.toLowerCase().includes(q);
    const emailMatch = m.email && m.email.toLowerCase().includes(q);
    const phoneMatch = m.phone && m.phone.toLowerCase().includes(q);
    const nisMatch = m.nis && m.nis.toLowerCase().includes(q);
    const nisnMatch = m.nisn && m.nisn.toLowerCase().includes(q);
    return nameMatch || cardMatch || idMatch || emailMatch || phoneMatch || nisMatch || nisnMatch;
  });
};

const performMemberSearch = async (query: string) => {
  isSearchingMember.value = true;
  try {
    // Cari dan perbarui dari server Firestore jika online
    if (!store.isOfflineMode && !store.isQuotaExhausted) {
      try {
        const { db } = await import('../lib/firebase.js');
        const { collection, getDocs } = await import('firebase/firestore');
        const snap = await getDocs(collection(db, 'members'));
        if (!snap.empty) {
          const serverMembers: Member[] = [];
          snap.forEach(docSnap => serverMembers.push(docSnap.data() as Member));
          if (serverMembers.length > 0) {
            store.members = serverMembers;
          }
        }
      } catch (err) {
        console.warn('Server member lookup fallback to local store:', err);
      }
    }

    const matches = searchMembers(query);
    memberCandidates.value = matches;
    if (matches.length === 1 && (matches[0].cardNumber.toLowerCase() === query.toLowerCase() || matches[0].name.toLowerCase() === query.toLowerCase())) {
      matchedMember.value = matches[0];
    } else if (matches.length === 0) {
      matchedMember.value = null;
      memberCandidates.value = [];
      memberSearchError.value = `Anggota dengan nama atau ID "${query}" tidak ditemukan di server perpustakaan.`;
    }
  } finally {
    isSearchingMember.value = false;
  }
};

const lookupMember = async () => {
  if (memberSearchDebounceTimer) {
    clearTimeout(memberSearchDebounceTimer);
    memberSearchDebounceTimer = null;
  }
  memberSearchError.value = '';
  memberCandidates.value = [];
  const rawKey = (memberSearchKey.value || '').trim();
  if (!rawKey) {
    memberSearchError.value = 'Masukkan Nama Lengkap atau Nomor Kartu Anggota.';
    return;
  }

  // Wajib minimal 3 karakter untuk mencari nama
  if (rawKey.length < 3) {
    memberSearchError.value = 'Ketik minimal 3 karakter untuk mencari nama member.';
    return;
  }

  const key = rawKey.toLowerCase();

  // 1. Check exact card number or ID match first
  const exactCardOrId = store.members.find(m => 
    (m.cardNumber && m.cardNumber.toLowerCase() === key) ||
    (m.id && m.id.toLowerCase() === key) ||
    (m.email && m.email.toLowerCase() === key)
  );

  if (exactCardOrId) {
    matchedMember.value = exactCardOrId;
    memberCandidates.value = [exactCardOrId];
    return;
  }

  // 2. Search by name, card number, or NIS on server
  await performMemberSearch(rawKey);
};

const onMemberSearchInput = () => {
  memberSearchError.value = '';
  if (memberSearchDebounceTimer) {
    clearTimeout(memberSearchDebounceTimer);
    memberSearchDebounceTimer = null;
  }

  const q = (memberSearchKey.value || '').trim();
  if (!q) {
    memberCandidates.value = [];
    matchedMember.value = null;
    isSearchingMember.value = false;
    return;
  }
  // If the user starts modifying the search input while a member was selected, reset selected
  if (matchedMember.value && 
      matchedMember.value.name.toLowerCase() !== q.toLowerCase() && 
      matchedMember.value.cardNumber.toLowerCase() !== q.toLowerCase()) {
    matchedMember.value = null;
  }

  // Ketik dulu minimal 3 karakter sebelum mencari
  if (q.length < 3) {
    memberCandidates.value = [];
    isSearchingMember.value = false;
    return;
  }

  // Beri delay sekitar 500ms barulah mencari ke server
  isSearchingMember.value = true;
  memberSearchDebounceTimer = setTimeout(async () => {
    await performMemberSearch(q);
  }, 500);
};

const selectMemberCandidate = (member: Member) => {
  matchedMember.value = member;
  memberSearchKey.value = member.name;
  memberCandidates.value = [];
  memberSearchError.value = '';
};

const clearMemberSearch = () => {
  memberSearchKey.value = '';
  matchedMember.value = null;
  memberCandidates.value = [];
  memberSearchError.value = '';
};

const handleMemberScannerSelected = (member: Member) => {
  if (!member) return;
  matchedMember.value = member;
  memberSearchKey.value = member.name;
  memberCandidates.value = [];
  memberSearchError.value = '';
  memberScanMode.value = 'manual';
  store.showToast(`Anggota "${member.name}" berhasil dipilih. Silakan konfirmasi akses & sirkulasi.`);
};

const handleMemberCodeScanned = (scannedCode: string) => {
  if (!scannedCode) return;
  memberSearchKey.value = scannedCode;
  memberScanMode.value = 'manual';
  lookupMember();
};

const submitNonMemberVisit = async () => {
  tokenError.value = '';
  if (!guestForm.value.name.trim() || !guestForm.value.origin.trim()) return;

  const rawToken = (guestForm.value.token || '').trim();
  if (!rawToken) {
    tokenError.value = 'Kode token kunjungan wajib diisi. Silakan minta kode token kepada petugas perpustakaan.';
    return;
  }

  // Validasi token terlebih dahulu
  const validation = store.validateVisitToken(rawToken);
  if (!validation.valid) {
    tokenError.value = validation.message || 'Kode token tidak valid atau sudah kedaluwarsa.';
    return;
  }

  isSubmitting.value = true;
  try {
    // Gunakan/konsumsi token
    const consumeRes = await store.consumeVisitToken(rawToken);
    if (!consumeRes.success) {
      tokenError.value = consumeRes.message || 'Gagal memproses token kunjungan.';
      return;
    }

    const res = await store.recordVisit({
      visitorType: 'non_member',
      name: guestForm.value.name,
      origin: guestForm.value.origin,
      purpose: guestForm.value.purpose,
      purposeDetails: guestForm.value.purpose === 'Lainnya' ? guestForm.value.purposeDetails : undefined,
      phone: guestForm.value.phone,
      notes: guestForm.value.notes,
      source: 'public_form',
      tokenUsed: rawToken
    });

    if (res.success && res.visit) {
      submittedVisit.value = res.visit;
      store.showToast(`Selamat datang di perpustakaan, ${guestForm.value.name}!`);
    }
  } finally {
    isSubmitting.value = false;
  }
};

const cancelPendingVisit = async () => {
  if (submittedVisit.value && submittedVisit.value.status === 'pending') {
    const id = submittedVisit.value.id;
    await store.deleteVisit(id);
    submittedVisit.value = null;
    store.showToast('Permintaan check-in telah dibatalkan.');
  }
};

const submitMemberVisit = async () => {
  // Pastikan jika member sedang login, profil kunjungan selalu terkunci ke akun dirinya sendiri
  if (isLoggedInMember.value && store.currentUser) {
    matchedMember.value = store.currentUser;
  }
  if (!matchedMember.value) return;

  isSubmitting.value = true;
  try {
    const origin = matchedMember.value.memberType === 'guru'
      ? 'Dewan Guru SDN Pengasinan VII'
      : (matchedMember.value.memberType === 'siswa' ? 'Siswa SDN Pengasinan VII' : 'SDN Pengasinan VII');

    // Check-in member kunjungan: langsung berstatus approved (akses & sirkulasi aktif)
    const res = await store.recordVisit({
      visitorType: 'member',
      status: 'approved',
      memberId: matchedMember.value.id,
      memberCardNumber: matchedMember.value.cardNumber,
      memberType: matchedMember.value.memberType || 'siswa',
      name: matchedMember.value.name,
      origin: origin,
      purpose: memberVisitPurpose.value,
      purposeDetails: memberVisitPurpose.value === 'Lainnya' ? memberPurposeDetails.value : undefined,
      phone: matchedMember.value.phone,
      email: matchedMember.value.email,
      source: 'public_form'
    });

    if (res.success && res.visit) {
      submittedVisit.value = res.visit;
      memberCandidates.value = [];
      store.showToast(`✅ Konfirmasi Akses & Sirkulasi berhasil, selamat datang ${matchedMember.value.name}!`);
    }
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  submittedVisit.value = null;
  guestForm.value = {
    name: '',
    origin: '',
    token: '',
    purpose: 'Membaca Buku',
    purposeDetails: '',
    phone: '',
    notes: ''
  };
  tokenError.value = '';

  // Jika member sedang login, pertahankan profil dirinya sendiri agar tidak dapat diubah
  if (isLoggedInMember.value && store.currentUser) {
    matchedMember.value = store.currentUser;
  } else {
    matchedMember.value = null;
  }

  memberSearchKey.value = '';
  memberSearchError.value = '';
  memberCandidates.value = [];
  memberVisitPurpose.value = 'Membaca Buku';
  memberPurposeDetails.value = '';
};
</script>

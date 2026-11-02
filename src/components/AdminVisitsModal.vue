<template>
  <teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs"
        @click.self="handleClose"
      >
        <div 
          class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-full sm:max-w-4xl max-h-[calc(100dvh-1rem)] sm:max-h-[92vh] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 my-auto"
        >
          <!-- Modal Header -->
          <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/90 dark:bg-slate-900/90 shrink-0">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/60 shrink-0">
                <UserCheck class="w-5 h-5" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h2 class="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight truncate">
                    Buku Tamu & Kunjungan Perpustakaan
                  </h2>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {{ store.todayVisitsCount }} Hari Ini
                  </span>
                </div>
                <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                  Rekap presensi pengunjung fisik, check-in kartu member, dan pendaftaran tamu umum
                </p>
              </div>
            </div>

            <button 
              @click="handleClose"
              class="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer shrink-0 active:scale-95"
              aria-label="Tutup Modal"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Quick Navigation Tabs -->
          <div class="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id as any"
              type="button"
              class="px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
              :class="activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300'"
            >
              <component :is="tab.icon" class="w-3.5 h-3.5" />
              <span>{{ tab.label }}</span>
              <span 
                v-if="tab.badge !== undefined" 
                class="px-1.5 py-0.2 rounded-full text-[10px] font-bold"
                :class="activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'"
              >
                {{ tab.badge }}
              </span>
            </button>
          </div>

          <!-- Modal Body Content -->
          <div class="p-3.5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-5">
            
            <!-- TAB 1: DAFTAR PRESENSI (REKAP DATA) -->
            <div v-if="activeTab === 'list'" class="space-y-4">
              
              <!-- Quick Stats Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <div class="p-3 sm:p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60">
                  <span class="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">
                    Kunjungan Hari Ini
                  </span>
                  <div class="text-xl sm:text-2xl font-black text-blue-950 dark:text-blue-100 mt-1">
                    {{ store.todayVisitsCount }}
                  </div>
                  <span class="text-[10px] text-blue-600/80 dark:text-blue-400 mt-0.5 block truncate">
                    Presensi aktif
                  </span>
                </div>

                <div class="p-3 sm:p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60">
                  <span class="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
                    Member Hari Ini
                  </span>
                  <div class="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100 mt-1">
                    {{ store.todayMemberVisitsCount }}
                  </div>
                  <span class="text-[10px] text-emerald-600/80 dark:text-emerald-400 mt-0.5 block truncate">
                    Siswa & Guru
                  </span>
                </div>

                <div class="p-3 sm:p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/60">
                  <span class="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
                    Tamu Non-Member
                  </span>
                  <div class="text-xl sm:text-2xl font-black text-purple-950 dark:text-purple-100 mt-1">
                    {{ store.todayGuestVisitsCount }}
                  </div>
                  <span class="text-[10px] text-purple-600/80 dark:text-purple-400 mt-0.5 block truncate">
                    Tamu umum & wali murid
                  </span>
                </div>

                <div class="p-3 sm:p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60">
                  <span class="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
                    Total Kunjungan
                  </span>
                  <div class="text-xl sm:text-2xl font-black text-amber-950 dark:text-amber-100 mt-1">
                    {{ store.visits.length }}
                  </div>
                  <span class="text-[10px] text-amber-600/80 dark:text-amber-400 mt-0.5 block truncate">
                    Akumulasi database
                  </span>
                </div>
              </div>

              <!-- Search and Filters Bar -->
              <div class="bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
                <div class="flex flex-col sm:flex-row sm:items-center gap-2.5">
                  <!-- Search Input -->
                  <div class="relative flex-1">
                    <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      v-model="searchQuery"
                      type="text"
                      placeholder="Cari nama, kartu member, asal institusi..."
                      class="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <!-- Date Filter -->
                  <div class="flex items-center gap-2">
                    <div class="flex items-center gap-1 bg-white dark:bg-slate-850 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                      <button 
                        v-for="dFilter in [
                          { id: 'today', label: 'Hari Ini' },
                          { id: 'all', label: 'Semua' },
                          { id: 'custom', label: 'Pilih Tgl' }
                        ]"
                        :key="dFilter.id"
                        @click="dateFilter = dFilter.id as any"
                        type="button"
                        class="px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer"
                        :class="dateFilter === dFilter.id ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'"
                      >
                        {{ dFilter.label }}
                      </button>
                    </div>

                    <!-- Custom Date Picker if selected -->
                    <input 
                      v-if="dateFilter === 'custom'"
                      v-model="customDate"
                      type="date"
                      class="px-2 py-1 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <!-- Secondary Filter Row: Visitor Type & Purpose -->
                <div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span class="text-[11px] text-slate-400 font-medium">Tipe:</span>
                    <button 
                      v-for="t in [
                        { id: 'all', label: 'Semua' },
                        { id: 'member', label: 'Member' },
                        { id: 'non_member', label: 'Non-Member' }
                      ]"
                      :key="t.id"
                      @click="typeFilter = t.id as any"
                      type="button"
                      class="px-2 py-0.5 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                      :class="typeFilter === t.id ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'"
                    >
                      {{ t.label }}
                    </button>
                  </div>

                  <div class="flex flex-wrap items-center gap-1.5">
                    <span class="text-[11px] text-slate-400 font-medium">Tujuan:</span>
                    <button 
                      v-for="p in ['all', 'Membaca Buku', 'Meminjam Buku', 'Observasi', 'Lainnya']"
                      :key="p"
                      @click="purposeFilter = p"
                      type="button"
                      class="px-2 py-0.5 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                      :class="purposeFilter === p ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'"
                    >
                      {{ p === 'all' ? 'Semua' : p }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Visitor Table / Cards List -->
              <div v-if="filteredVisits.length > 0" class="space-y-2.5">
                <div 
                  v-for="visit in filteredVisits" 
                  :key="visit.id"
                  class="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div class="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div 
                      class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs"
                      :class="visit.visitorType === 'member' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800'"
                    >
                      <User v-if="visit.visitorType === 'member'" class="w-5 h-5" />
                      <Users v-else class="w-5 h-5" />
                    </div>

                    <div class="min-w-0 flex-1">
                      <div class="flex flex-wrap items-center gap-1.5">
                        <h4 class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {{ visit.name }}
                        </h4>
                        
                        <span 
                          class="px-2 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider"
                          :class="visit.visitorType === 'member' 
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                            : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'"
                        >
                          {{ visit.visitorType === 'member' ? (visit.memberCardNumber || 'Member') : 'Tamu Umum' }}
                        </span>

                        <span 
                          v-if="visit.source === 'auto_borrow'" 
                          class="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          title="Tercatat otomatis saat meminjam buku fisik"
                        >
                          Auto Pinjam Fisik
                        </span>
                      </div>

                      <div class="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        <span class="flex items-center gap-1 truncate max-w-xs">
                          <Building2 class="w-3 h-3 shrink-0 text-slate-400" />
                          <span>{{ visit.origin }}</span>
                        </span>
                        <span>•</span>
                        <span class="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                          <BookOpen class="w-3 h-3 shrink-0" />
                          <span>{{ visit.purpose }}</span>
                          <span v-if="visit.purposeDetails" class="text-slate-400 font-normal">({{ visit.purposeDetails }})</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Date Time and Delete Action -->
                  <div class="flex items-center justify-between sm:justify-end gap-3 text-xs pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700/60 shrink-0">
                    <div class="text-left sm:text-right">
                      <span class="font-medium text-slate-700 dark:text-slate-300 block text-[11px]">
                        {{ formatVisitDate(visit.visitDate) }}
                      </span>
                      <span class="text-[10px] text-slate-400 block font-mono">
                        {{ formatTime(visit.timestamp) }}
                      </span>
                    </div>

                    <button 
                      @click="confirmDeleteVisit(visit)"
                      class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-700 dark:hover:bg-rose-950/60 text-slate-500 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 flex items-center justify-center transition cursor-pointer active:scale-95"
                      title="Hapus data kunjungan"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="text-center py-12 px-4 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
                <div class="w-12 h-12 rounded-2xl bg-slate-200/60 dark:bg-slate-700/60 text-slate-400 flex items-center justify-center mx-auto">
                  <UserCheck class="w-6 h-6" />
                </div>
                <div class="space-y-1">
                  <p class="font-bold text-sm text-slate-700 dark:text-slate-300">Belum Ada Presensi Kunjungan</p>
                  <p class="text-xs text-slate-400 max-w-sm mx-auto">
                    Data presensi kunjungan yang sesuai dengan filter pencarian tidak ditemukan.
                  </p>
                </div>
                <button 
                  @click="activeTab = 'manual_guest'"
                  class="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer active:scale-95"
                >
                  + Input Tamu Manual
                </button>
              </div>
            </div>

            <!-- TAB 2: INPUT MANUAL NON-MEMBER (PETUGAS INPUT TAMU) -->
            <div v-else-if="activeTab === 'manual_guest'" class="space-y-4 max-w-xl mx-auto">
              <div class="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div class="font-bold flex items-center gap-1.5">
                  <UserPlus class="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Input Manual Tamu Perpustakaan</span>
                </div>
                <p class="text-[11px] text-amber-700 dark:text-amber-300">
                  Gunakan form ini untuk mencatat pengunjung non-member yang tidak membawa smartphone atau kesulitan mengisi form online.
                </p>
              </div>

              <form @submit.prevent="submitManualGuest" class="space-y-4">
                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nama Lengkap Tamu <span class="text-rose-500">*</span>
                  </label>
                  <input 
                    v-model="manualForm.name"
                    type="text"
                    required
                    placeholder="Contoh: Dra. Hj. Siti Rahmawati, M.Pd"
                    class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Asal (Instansi, Sekolah, Organisasi, atau Kota Asal) <span class="text-rose-500">*</span>
                  </label>
                  <input 
                    v-model="manualForm.origin"
                    type="text"
                    required
                    placeholder="Contoh: Wali Murid Kelas 5, SDN Rawalumbu 1, Bekasi..."
                    class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />

                  <!-- Quick Chips -->
                  <div class="flex flex-wrap gap-1.5 pt-1">
                    <button 
                      v-for="chip in quickChips" 
                      :key="chip"
                      type="button"
                      @click="manualForm.origin = chip"
                      class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                    >
                      {{ chip }}
                    </button>
                  </div>
                </div>

                <!-- Tujuan Kunjungan -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tujuan Kunjungan <span class="text-rose-500">*</span>
                  </label>
                  <div class="grid grid-cols-3 gap-2">
                    <button 
                      v-for="p in ['Membaca Buku', 'Observasi', 'Lainnya']"
                      :key="p"
                      type="button"
                      @click="manualForm.purpose = p as any"
                      class="py-2.5 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer active:scale-95"
                      :class="manualForm.purpose === p 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'"
                    >
                      {{ p }}
                    </button>
                  </div>

                  <div v-if="manualForm.purpose === 'Lainnya'" class="pt-1.5">
                    <input 
                      v-model="manualForm.purposeDetails"
                      type="text"
                      required
                      placeholder="Sebutkan rincian tujuan kunjungan..."
                      class="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div class="space-y-1">
                    <label class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      No. WhatsApp / HP (Opsional)
                    </label>
                    <input 
                      v-model="manualForm.phone"
                      type="tel"
                      placeholder="0812xxxxxxx"
                      class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
                    />
                  </div>

                  <div class="space-y-1">
                    <label class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Tanggal Kunjungan
                    </label>
                    <input 
                      v-model="manualForm.visitDate"
                      type="date"
                      class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Catatan / Pesan Tambahan (Opsional)
                  </label>
                  <input 
                    v-model="manualForm.notes"
                    type="text"
                    placeholder="Keperluan rapat, wawancara, dsb..."
                    class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
                  />
                </div>

                <div class="pt-2">
                  <button 
                    type="submit"
                    :disabled="isSubmitting"
                    class="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                  >
                    <CheckCircle class="w-4 h-4" />
                    <span>{{ isSubmitting ? 'Menyimpan Presensi...' : 'Simpan Presensi Tamu Non-Member' }}</span>
                  </button>
                </div>
              </form>
            </div>

            <!-- TAB 3: CHECK-IN CEPAT MEMBER (PETUGAS INPUT/SCAN MEMBER) -->
            <div v-else-if="activeTab === 'member_checkin'" class="space-y-4 max-w-xl mx-auto">
              <div class="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                <div class="font-bold flex items-center gap-1.5">
                  <QrCode class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Check-in Cepat Anggota Perpustakaan</span>
                </div>
                <p class="text-[11px] text-blue-700 dark:text-blue-300">
                  Scan QR code pada kartu anggota fisik/digital siswa & guru, atau ketik Nomor Kartu / ID Member yang disebutkan anggota.
                </p>
              </div>

              <!-- Scanner or Search Mode Toggle -->
              <div class="flex items-center justify-center gap-2">
                <button 
                  type="button"
                  @click="adminMemberScanMode = 'manual'"
                  class="px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer active:scale-95"
                  :class="adminMemberScanMode === 'manual' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'"
                >
                  Ketik ID / No. Kartu
                </button>
                <button 
                  type="button"
                  @click="adminMemberScanMode = 'camera'"
                  class="px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer active:scale-95 flex items-center gap-1.5"
                  :class="adminMemberScanMode === 'camera' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'"
                >
                  <Camera class="w-3.5 h-3.5" />
                  <span>Scan Kamera</span>
                </button>
              </div>

              <div v-if="adminMemberScanMode === 'camera'">
                <MemberCardScanner @scan-success="handleAdminMemberScanned" />
              </div>

              <div v-else class="space-y-2">
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nomor Kartu Anggota / ID Member
                </label>
                <div class="flex gap-2">
                  <input 
                    v-model="adminMemberSearchKey"
                    type="text"
                    placeholder="Contoh: LIB-001, LIB-ADMIN-001..."
                    @keydown.enter.prevent="lookupAdminMember"
                    class="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-white uppercase tracking-wider"
                  />
                  <button 
                    type="button"
                    @click="lookupAdminMember"
                    class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-xs transition cursor-pointer active:scale-95"
                  >
                    Cari
                  </button>
                </div>
              </div>

              <!-- Matched Member Confirmation Box -->
              <div 
                v-if="adminMatchedMember" 
                class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-4 animate-in slide-in-from-top-2 duration-200"
              >
                <div class="flex items-center gap-3">
                  <img 
                    :src="adminMatchedMember.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'" 
                    alt="Avatar"
                    class="w-12 h-12 rounded-xl object-cover border-2 border-white dark:border-slate-800 shadow-xs"
                  />
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        {{ adminMatchedMember.cardNumber }}
                      </span>
                      <span class="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                        {{ adminMatchedMember.memberType === 'guru' ? 'Guru' : 'Siswa' }}
                      </span>
                    </div>
                    <h3 class="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                      {{ adminMatchedMember.name }}
                    </h3>
                  </div>
                </div>

                <div class="space-y-1.5 pt-1 border-t border-emerald-200/80 dark:border-emerald-800/80">
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tujuan Kunjungan:
                  </label>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button 
                      v-for="p in ['Membaca Buku', 'Meminjam Buku', 'Observasi', 'Lainnya']"
                      :key="p"
                      type="button"
                      @click="adminMemberPurpose = p as any"
                      class="py-2 px-2.5 rounded-xl text-xs font-bold border transition text-center cursor-pointer active:scale-95"
                      :class="adminMemberPurpose === p 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'"
                    >
                      {{ p }}
                    </button>
                  </div>
                </div>

                <button 
                  type="button"
                  @click="submitAdminMemberVisit"
                  :disabled="isSubmitting"
                  class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                >
                  <UserCheck class="w-4 h-4" />
                  <span>Konfirmasi Check-in Member</span>
                </button>
              </div>

              <div v-if="adminMemberError" class="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                {{ adminMemberError }}
              </div>
            </div>

            <!-- TAB 4: QR MEJA RESEPSIONIS (STAND DESK / CETAK QR) -->
            <div v-else-if="activeTab === 'desk_qr'" class="space-y-5 max-w-lg mx-auto text-center">
              <div class="space-y-1">
                <h3 class="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  QR Code Buku Tamu Meja Piket
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Tampilkan layar ini pada tablet resepsionis atau cetak standee agar pengunjung dapat langsung scan dan mengisi presensi secara mandiri.
                </p>
              </div>

              <!-- Printable Stand Card Preview -->
              <div class="p-6 sm:p-8 rounded-3xl bg-linear-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-850 border-2 border-blue-200 dark:border-blue-900 shadow-xl space-y-4 max-w-sm mx-auto">
                <div class="space-y-1">
                  <div class="text-[11px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    Perpustakaan SDN Pengasinan VII
                  </div>
                  <h4 class="font-black text-lg text-slate-900 dark:text-white">
                    Scan Buku Tamu Digital
                  </h4>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">
                    Arahkan kamera smartphone Anda ke QR code berikut:
                  </p>
                </div>

                <!-- Canvas QR Container -->
                <div class="p-4 bg-white rounded-2xl shadow-inner inline-block mx-auto border border-slate-100">
                  <canvas ref="qrCanvas" class="w-48 h-48 mx-auto"></canvas>
                </div>

                <div class="space-y-1 text-xs">
                  <span class="font-mono text-[11px] text-slate-600 dark:text-slate-300 break-all select-all">
                    {{ publicVisitUrl }}
                  </span>
                  <p class="text-[10px] text-slate-400">
                    Mendukung presensi tamu umum & check-in kartu anggota
                  </p>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex flex-wrap items-center justify-center gap-2.5">
                <button 
                  @click="copyPublicUrl"
                  class="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Copy class="w-3.5 h-3.5" />
                  <span>Salin Link Publik</span>
                </button>

                <button 
                  @click="openPublicFormInNewTab"
                  class="px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                >
                  <ExternalLink class="w-3.5 h-3.5" />
                  <span>Buka Form Presensi</span>
                </button>
              </div>
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3 shrink-0 text-xs text-slate-500 dark:text-slate-400">
            <span>SDN Pengasinan VII • Kota Bekasi</span>
            <button 
              @click="handleClose"
              class="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer active:scale-95"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useLibraryStore } from '../stores/library.js';
import type { LibraryVisit, VisitPurpose, Member } from '../types.js';
import MemberCardScanner from './MemberCardScanner.vue';
import QRCode from 'qrcode';
import { 
  UserCheck, 
  X, 
  ListFilter, 
  UserPlus, 
  QrCode, 
  Building2, 
  BookOpen, 
  Search, 
  Trash2, 
  Users, 
  User, 
  Camera, 
  CheckCircle, 
  Copy, 
  ExternalLink 
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useLibraryStore();
const router = useRouter();

const activeTab = ref<'list' | 'manual_guest' | 'member_checkin' | 'desk_qr'>('list');
const isSubmitting = ref(false);

const tabs = computed(() => [
  { id: 'list', label: 'Daftar Presensi', icon: ListFilter, badge: store.todayVisitsCount },
  { id: 'manual_guest', label: 'Input Manual Non-Member', icon: UserPlus },
  { id: 'member_checkin', label: 'Check-in Member', icon: UserCheck },
  { id: 'desk_qr', label: 'QR Meja Resepsionis', icon: QrCode }
]);

// Filters for List Tab
const searchQuery = ref('');
const dateFilter = ref<'today' | 'all' | 'custom'>('today');
const customDate = ref(new Date().toISOString().slice(0, 10));
const typeFilter = ref<'all' | 'member' | 'non_member'>('all');
const purposeFilter = ref<string>('all');

const quickChips = [
  'Wali Murid SDN Pengasinan VII',
  'Sekolah Lain / Tamu',
  'Dinas Pendidikan',
  'Masyarakat Umum / Warga',
  'Alumni SDN Pengasinan VII',
  'Mahasiswa / Peneliti'
];

// Manual Guest Form
const manualForm = ref({
  name: '',
  origin: '',
  purpose: 'Membaca Buku' as VisitPurpose,
  purposeDetails: '',
  phone: '',
  visitDate: new Date().toISOString().slice(0, 10),
  notes: ''
});

// Admin Member Check-in
const adminMemberScanMode = ref<'manual' | 'camera'>('manual');
const adminMemberSearchKey = ref('');
const adminMemberError = ref('');
const adminMatchedMember = ref<Member | null>(null);
const adminMemberPurpose = ref<VisitPurpose>('Membaca Buku');

// QR Desk Canvas
const qrCanvas = ref<HTMLCanvasElement | null>(null);

const publicVisitUrl = computed(() => {
  if (typeof window === 'undefined') return '/kunjungan';
  return `${window.location.origin}/kunjungan`;
});

const renderQrCode = async () => {
  await nextTick();
  if (qrCanvas.value) {
    try {
      await QRCode.toCanvas(qrCanvas.value, publicVisitUrl.value, {
        width: 192,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
    } catch (e) {
      console.warn('Gagal merender QR Code meja resepsionis:', e);
    }
  }
};

watch(() => activeTab.value, (newTab) => {
  if (newTab === 'desk_qr') {
    setTimeout(renderQrCode, 100);
  }
});

watch(() => props.isOpen, (open) => {
  if (open && activeTab.value === 'desk_qr') {
    setTimeout(renderQrCode, 150);
  }
});

const filteredVisits = computed(() => {
  const query = (searchQuery.value || '').trim().toLowerCase();
  const todayStr = new Date().toISOString().slice(0, 10);

  return store.visits.filter(v => {
    // Date filter
    if (dateFilter.value === 'today') {
      if (v.visitDate !== todayStr) return false;
    } else if (dateFilter.value === 'custom') {
      if (v.visitDate !== customDate.value) return false;
    }

    // Type filter
    if (typeFilter.value !== 'all' && v.visitorType !== typeFilter.value) {
      return false;
    }

    // Purpose filter
    if (purposeFilter.value !== 'all' && v.purpose !== purposeFilter.value) {
      return false;
    }

    // Query filter
    if (query) {
      const matchName = v.name?.toLowerCase().includes(query);
      const matchOrigin = v.origin?.toLowerCase().includes(query);
      const matchCard = v.memberCardNumber?.toLowerCase().includes(query);
      const matchId = v.id?.toLowerCase().includes(query);
      if (!matchName && !matchOrigin && !matchCard && !matchId) return false;
    }

    return true;
  });
});

const formatVisitDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

const formatTime = (isoString?: string) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return `${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
  } catch {
    return '';
  }
};

const handleClose = () => {
  emit('close');
};

const confirmDeleteVisit = async (visit: LibraryVisit) => {
  if (confirm(`Hapus catatan kunjungan dari "${visit.name}"?`)) {
    await store.deleteVisit(visit.id);
  }
};

const submitManualGuest = async () => {
  if (!manualForm.value.name.trim() || !manualForm.value.origin.trim()) return;

  isSubmitting.value = true;
  try {
    const res = await store.recordVisit({
      visitorType: 'non_member',
      name: manualForm.value.name,
      origin: manualForm.value.origin,
      purpose: manualForm.value.purpose,
      purposeDetails: manualForm.value.purpose === 'Lainnya' ? manualForm.value.purposeDetails : undefined,
      phone: manualForm.value.phone,
      visitDate: manualForm.value.visitDate,
      notes: manualForm.value.notes,
      source: 'manual_admin'
    });

    if (res.success) {
      store.showToast(`Kunjungan untuk "${manualForm.value.name}" berhasil dicatat!`);
      // Reset
      manualForm.value = {
        name: '',
        origin: '',
        purpose: 'Membaca Buku',
        purposeDetails: '',
        phone: '',
        visitDate: new Date().toISOString().slice(0, 10),
        notes: ''
      };
      activeTab.value = 'list';
    }
  } finally {
    isSubmitting.value = false;
  }
};

const lookupAdminMember = () => {
  adminMemberError.value = '';
  const key = (adminMemberSearchKey.value || '').trim().toLowerCase();
  if (!key) {
    adminMemberError.value = 'Ketik Nomor Kartu atau ID Member.';
    return;
  }

  const found = store.members.find(m => 
    (m.cardNumber && m.cardNumber.toLowerCase() === key) ||
    (m.id && m.id.toLowerCase() === key) ||
    (m.email && m.email.toLowerCase() === key)
  );

  if (found) {
    adminMatchedMember.value = found;
  } else {
    adminMatchedMember.value = null;
    adminMemberError.value = `Anggota "${adminMemberSearchKey.value}" tidak ditemukan.`;
  }
};

const handleAdminMemberScanned = (scannedCode: string) => {
  adminMemberSearchKey.value = scannedCode;
  adminMemberScanMode.value = 'manual';
  lookupAdminMember();
};

const submitAdminMemberVisit = async () => {
  if (!adminMatchedMember.value) return;

  isSubmitting.value = true;
  try {
    const origin = adminMatchedMember.value.memberType === 'guru'
      ? 'Dewan Guru SDN Pengasinan VII'
      : (adminMatchedMember.value.memberType === 'siswa' ? 'Siswa SDN Pengasinan VII' : 'SDN Pengasinan VII');

    const res = await store.recordVisit({
      visitorType: 'member',
      memberId: adminMatchedMember.value.id,
      memberCardNumber: adminMatchedMember.value.cardNumber,
      memberType: adminMatchedMember.value.memberType || 'siswa',
      name: adminMatchedMember.value.name,
      origin: origin,
      purpose: adminMemberPurpose.value,
      source: adminMemberScanMode.value === 'camera' ? 'qr_scan' : 'manual_admin'
    });

    if (res.success) {
      store.showToast(`Check-in member ${adminMatchedMember.value.name} berhasil!`);
      adminMatchedMember.value = null;
      adminMemberSearchKey.value = '';
      activeTab.value = 'list';
    }
  } finally {
    isSubmitting.value = false;
  }
};

const copyPublicUrl = async () => {
  try {
    await navigator.clipboard.writeText(publicVisitUrl.value);
    store.showToast('✅ Tautan Buku Tamu berhasil disalin ke clipboard!');
  } catch {
    store.showToast(`Link: ${publicVisitUrl.value}`);
  }
};

const openPublicFormInNewTab = () => {
  router.push('/kunjungan');
  emit('close');
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>

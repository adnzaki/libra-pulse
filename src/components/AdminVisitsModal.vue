<template>
  <teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-4 bg-slate-950/75 backdrop-blur-xs"
        @click.self="handleClose"
      >
        <div 
          class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-[95%] sm:w-full sm:max-w-4xl max-h-[calc(100dvh-1rem)] sm:max-h-[92vh] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 my-auto mx-auto"
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
                :class="tab.isAlert 
                  ? 'bg-rose-500 text-white animate-pulse font-black shadow-xs' 
                  : (activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300')"
              >
                {{ tab.badge }}
              </span>
            </button>
          </div>

          <!-- Modal Body Content -->
          <div class="p-3.5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-5">
            
            <!-- TAB 1: DAFTAR PRESENSI (REKAP DATA) -->
            <div v-if="activeTab === 'list'" class="space-y-4">
              
              <!-- Pending Entrance Queue Alert Banner -->
              <div v-if="pendingMemberVisits.length > 0" class="p-3.5 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-in slide-in-from-top-1 duration-200">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                    <Clock class="w-5 h-5" />
                  </div>
                  <div>
                    <h4 class="font-extrabold text-amber-950 dark:text-amber-200 text-xs sm:text-sm">
                      Ada {{ pendingMemberVisits.length }} Anggota Menunggu di Antrian Masuk
                    </h4>
                    <p class="text-[11px] text-amber-700 dark:text-amber-300">
                      Anggota yang melakukan check-in mandiri menunggu persetujuan admin untuk diperbolehkan masuk.
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  @click="activeTab = 'member_checkin'; memberCheckinSubTab = 'queue'"
                  class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition cursor-pointer active:scale-95 shrink-0 flex items-center justify-center gap-1.5 self-start sm:self-center"
                >
                  <Clock class="w-3.5 h-3.5" />
                  <span>Buka Antrian ({{ pendingMemberVisits.length }})</span>
                </button>
              </div>

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

                        <span 
                          v-if="visit.status === 'pending'" 
                          class="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse flex items-center gap-1"
                        >
                          <Clock class="w-2.5 h-2.5" /> Antrian Masuk
                        </span>

                        <span 
                          v-if="visit.tokenUsed" 
                          class="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          title="Token kunjungan yang digunakan"
                        >
                          Token: {{ visit.tokenUsed }}
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

                  <!-- Date Time, Quick Approve and Delete Action -->
                  <div class="flex items-center justify-between sm:justify-end gap-2.5 text-xs pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700/60 shrink-0">
                    <div class="text-left sm:text-right">
                      <span class="font-medium text-slate-700 dark:text-slate-300 block text-[11px]">
                        {{ formatVisitDate(visit.visitDate) }}
                      </span>
                      <span class="text-[10px] text-slate-400 block font-mono">
                        {{ formatTime(visit.timestamp) }}
                      </span>
                    </div>

                    <button 
                      v-if="visit.status === 'pending'"
                      @click="approvePendingVisit(visit.id)"
                      type="button"
                      class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer active:scale-95 flex items-center gap-1"
                      title="Setujui Masuk Anggota"
                    >
                      <CheckCircle class="w-3.5 h-3.5" />
                      <span>Setujui</span>
                    </button>

                    <button 
                      @click="confirmDeleteVisit(visit)"
                      class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-700 dark:hover:bg-rose-950/60 text-slate-500 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 flex items-center justify-center transition cursor-pointer active:scale-95"
                      title="Hapus data kunjungan"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <!-- Server Loading Indicator Bar -->
                <div v-if="isServerLoading" class="py-3 px-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                  <Loader2 class="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                  <span>Memuat data presensi dari server (25 data/halaman)...</span>
                </div>

                <!-- Server-Side Pagination Identik Model Master Data Buku -->
                <AdminPagination 
                  v-if="dateFilter === 'all' && totalVisitsCount > 0"
                  v-model:currentPage="currentPage"
                  v-model:itemsPerPage="pageSize"
                  :totalPages="totalPages"
                  :totalItems="totalVisitsCount"
                  itemName="presensi kunjungan"
                  class="mt-4"
                />
              </div>

              <!-- Loading State saat belum ada data server -->
              <div v-else-if="isServerLoading" class="text-center py-12 px-4 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-3">
                <Loader2 class="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
                <p class="font-bold text-sm text-slate-700 dark:text-slate-300">Memuat Presensi dari Server...</p>
                <p class="text-xs text-slate-400">Sedang mengambil 25 data presensi kunjungan per halaman</p>
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

            <!-- TAB 2: KELOLA TOKEN KUNJUNGAN NON-MEMBER -->
            <div v-else-if="activeTab === 'tokens'" class="space-y-5">
              
              <!-- Active Token Spotlight -->
              <div class="p-4 sm:p-6 rounded-3xl bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-300 dark:border-amber-700/70 shadow-sm space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                      <KeyRound class="w-4 h-4" />
                    </div>
                    <div>
                      <h3 class="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                        Token Kunjungan Tamu Non-Member
                      </h3>
                      <p class="text-[11px] text-slate-500 dark:text-slate-400">
                        Kode token resmi yang wajib diisi oleh pengunjung non-member pada form presensi
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <button 
                      v-if="store.activeVisitToken"
                      @click="revokeActiveToken"
                      type="button"
                      class="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800 transition cursor-pointer active:scale-95"
                    >
                      Nonaktifkan
                    </button>
                    <button 
                      @click="showTokenGenModal = !showTokenGenModal"
                      type="button"
                      class="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition cursor-pointer active:scale-95 flex items-center gap-1.5"
                    >
                      <Plus class="w-3.5 h-3.5" />
                      <span>Buat Token Baru</span>
                    </button>
                  </div>
                </div>

                <!-- Active Token Big Display -->
                <div v-if="store.activeVisitToken" class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div class="space-y-1">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                      Kode Token Aktif Saat Ini
                    </span>
                    <div class="flex items-center gap-2.5">
                      <span class="font-mono text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 tracking-widest select-all">
                        {{ store.activeVisitToken.token }}
                      </span>
                      <button 
                        @click="copyCode(store.activeVisitToken.token)"
                        type="button"
                        class="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 dark:hover:bg-amber-800/60 text-amber-800 dark:text-amber-200 transition cursor-pointer active:scale-95"
                        title="Salin Kode Token"
                      >
                        <Copy class="w-4 h-4" />
                      </button>
                    </div>
                    <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                        {{ store.activeVisitToken.type === 'daily' ? 'Token Harian Reusable' : 'Token Sekali Pakai' }}
                      </span>
                      <span>•</span>
                      <span>Digunakan: <strong class="text-slate-800 dark:text-white">{{ store.activeVisitToken.usageCount || 0 }}x</strong>{{ store.activeVisitToken.maxUsage ? ` / ${store.activeVisitToken.maxUsage}` : '' }}</span>
                      <span>•</span>
                      <span>Kedaluwarsa: {{ formatTokenExpiry(store.activeVisitToken.expiresAt) }}</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 w-full sm:w-auto">
                    <button 
                      @click="generateQuickDailyToken"
                      type="button"
                      class="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw class="w-3.5 h-3.5" />
                      <span>Acak Token Baru</span>
                    </button>
                  </div>
                </div>

                <!-- If no active token -->
                <div v-else class="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-amber-200/80 dark:border-amber-700/60 text-center space-y-3">
                  <div class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
                    <KeyRound class="w-5 h-5" />
                  </div>
                  <div>
                    <h4 class="font-bold text-sm text-slate-800 dark:text-white">Belum Ada Token Kunjungan Aktif</h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-0.5">
                      Pengunjung non-member memerlukan token ini untuk mengisi presensi digital. Klik tombol di bawah untuk membuat token harian baru.
                    </p>
                  </div>
                  <button 
                    @click="generateQuickDailyToken"
                    type="button"
                    class="px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/25 transition cursor-pointer active:scale-95 inline-flex items-center gap-2"
                  >
                    <KeyRound class="w-4 h-4" />
                    <span>Buat Token Harian Sekarang</span>
                  </button>
                </div>
              </div>

              <!-- Create Token Inline Form -->
              <div v-if="showTokenGenModal" class="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <h4 class="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <KeyRound class="w-4 h-4 text-amber-500" />
                    <span>Buat / Kustomisasi Token Kunjungan</span>
                  </h4>
                  <button @click="showTokenGenModal = false" type="button" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X class="w-4 h-4" />
                  </button>
                </div>

                <form @submit.prevent="submitGenerateToken" class="space-y-3">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="space-y-1">
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">Tipe Token</label>
                      <div class="grid grid-cols-2 gap-2">
                        <button 
                          type="button" 
                          @click="tokenGenForm.type = 'daily'"
                          class="py-2 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer"
                          :class="tokenGenForm.type === 'daily' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'"
                        >
                          Harian Reusable
                        </button>
                        <button 
                          type="button" 
                          @click="tokenGenForm.type = 'single_use'"
                          class="py-2 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer"
                          :class="tokenGenForm.type === 'single_use' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'"
                        >
                          Sekali Pakai
                        </button>
                      </div>
                    </div>

                    <div class="space-y-1">
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Kode Kustom <span class="text-[10px] text-slate-400 font-normal">(Kosongkan untuk otomatis LIB-XXXX)</span>
                      </label>
                      <input 
                        v-model="tokenGenForm.customCode"
                        type="text"
                        placeholder="Contoh: LIB-TAMU-01"
                        class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="space-y-1">
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">Catatan / Keterangan</label>
                      <input 
                        v-model="tokenGenForm.notes"
                        type="text"
                        placeholder="Misal: Token Buku Tamu Tanggal 20 Okt"
                        class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
                      />
                    </div>

                    <div v-if="tokenGenForm.type === 'single_use'" class="space-y-1">
                      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">Maksimal Pemakaian (Kuota)</label>
                      <input 
                        v-model.number="tokenGenForm.maxUsage"
                        type="number"
                        min="1"
                        max="100"
                        class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div class="flex items-center justify-end gap-2 pt-1">
                    <button 
                      type="button" 
                      @click="showTokenGenModal = false"
                      class="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit"
                      class="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95"
                    >
                      Simpan & Aktifkan
                    </button>
                  </div>
                </form>
              </div>

              <!-- Riwayat Semua Token -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                    Daftar & Riwayat Token Kunjungan
                  </h4>
                  <span class="text-xs text-slate-400">Total: {{ store.visitTokens.length }} Token</span>
                </div>

                <div v-if="store.visitTokens.length > 0" class="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                  <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                      <thead class="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                        <tr>
                          <th class="py-2.5 px-3.5">Kode Token</th>
                          <th class="py-2.5 px-3">Tipe</th>
                          <th class="py-2.5 px-3">Status</th>
                          <th class="py-2.5 px-3">Pemakaian</th>
                          <th class="py-2.5 px-3">Kedaluwarsa</th>
                          <th class="py-2.5 px-3">Catatan / Pembuat</th>
                          <th class="py-2.5 px-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                        <tr v-for="t in store.visitTokens" :key="t.id" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                          <td class="py-2.5 px-3.5">
                            <div class="flex items-center gap-2">
                              <span class="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{{ t.token }}</span>
                              <button @click="copyCode(t.token)" type="button" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer" title="Salin">
                                <Copy class="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td class="py-2.5 px-3">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize" :class="t.type === 'daily' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'">
                              {{ t.type === 'daily' ? 'Harian' : 'Sekali Pakai' }}
                            </span>
                          </td>
                          <td class="py-2.5 px-3">
                            <span 
                              class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                              :class="isTokenLive(t) ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'"
                            >
                              {{ isTokenLive(t) ? 'Aktif' : (!t.isActive ? 'Nonaktif' : 'Kedaluwarsa') }}
                            </span>
                          </td>
                          <td class="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                            {{ t.usageCount || 0 }}x {{ t.maxUsage ? `/ ${t.maxUsage}` : '' }}
                          </td>
                          <td class="py-2.5 px-3 text-slate-500 dark:text-slate-400">
                            {{ formatTokenExpiry(t.expiresAt) }}
                          </td>
                          <td class="py-2.5 px-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                            {{ t.notes || t.generatedBy || '-' }}
                          </td>
                          <td class="py-2.5 px-3 text-right">
                            <div class="flex items-center justify-end gap-1.5">
                              <button 
                                v-if="t.isActive"
                                @click="store.revokeVisitToken(t.id)"
                                type="button"
                                class="px-2 py-1 rounded-lg text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition cursor-pointer"
                                title="Nonaktifkan"
                              >
                                Nonaktifkan
                              </button>
                              <button 
                                @click="deleteToken(t.id)"
                                type="button"
                                class="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                                title="Hapus Token"
                              >
                                <Trash2 class="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div v-else class="text-center py-8 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  Belum ada token kunjungan yang dibuat.
                </div>
              </div>

            </div>

            <!-- TAB 3: INPUT MANUAL NON-MEMBER (PETUGAS INPUT TAMU) -->
            <div v-else-if="activeTab === 'manual_guest'" class="space-y-4 w-full sm:max-w-xl mx-auto">
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

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                  <div class="space-y-1">
                    <div class="flex items-center justify-between">
                      <label class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Kode Token Kunjungan
                      </label>
                      <button 
                        v-if="store.activeVisitToken" 
                        type="button" 
                        @click="manualForm.tokenUsed = store.activeVisitToken.token"
                        class="text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                      >
                        Pakai Token Aktif
                      </button>
                    </div>
                    <input 
                      v-model="manualForm.tokenUsed"
                      type="text"
                      placeholder="Default: ADMIN-VERIFIED"
                      class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold uppercase text-slate-800 dark:text-white"
                    />
                  </div>
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

            <!-- TAB 3: CHECK-IN MEMBER & ANTRIAN MASUK -->
            <div v-else-if="activeTab === 'member_checkin'" class="space-y-4 w-full sm:max-w-xl mx-auto">
              
              <!-- Sub-tab Selector: Antrian Masuk vs Check-in Meja -->
              <div class="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  @click="memberCheckinSubTab = 'queue'"
                  class="flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 relative"
                  :class="memberCheckinSubTab === 'queue' 
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
                >
                  <Clock class="w-4 h-4 shrink-0" />
                  <span>Antrian Masuk</span>
                  <span 
                    v-if="pendingMemberVisits.length > 0"
                    class="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
                    :class="memberCheckinSubTab === 'queue' ? 'bg-amber-500 text-white animate-pulse' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold'"
                  >
                    {{ pendingMemberVisits.length }}
                  </span>
                </button>
                <button
                  type="button"
                  @click="memberCheckinSubTab = 'direct'"
                  class="flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
                  :class="memberCheckinSubTab === 'direct' 
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
                >
                  <UserCheck class="w-4 h-4 shrink-0" />
                  <span>Input / Scan di Meja</span>
                </button>
              </div>

              <!-- SUB-TAB 1: ANTRIAN MASUK MEMBER (MENUNGGU KONFIRMASI ADMIN) -->
              <div v-if="memberCheckinSubTab === 'queue'" class="space-y-3.5">
                <!-- Queue Header / Summary -->
                <div class="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs" :class="pendingMemberVisits.length > 0 ? 'animate-pulse' : ''">
                      <Clock class="w-4 h-4" />
                    </div>
                    <div>
                      <div class="font-extrabold text-amber-950 dark:text-amber-200 text-xs sm:text-sm">
                        Antrian Konfirmasi Masuk
                      </div>
                      <p class="text-[11px] text-amber-700 dark:text-amber-300">
                        {{ pendingMemberVisits.length > 0 
                          ? `${pendingMemberVisits.length} anggota sedang menunggu persetujuan Anda`
                          : 'Tidak ada antrian anggota yang menunggu saat ini' }}
                      </p>
                    </div>
                  </div>
                  <button 
                    v-if="pendingMemberVisits.length > 1"
                    type="button"
                    @click="approveAllPendingVisits"
                    class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer active:scale-95 shrink-0 flex items-center gap-1"
                  >
                    <CheckCircle class="w-3.5 h-3.5" />
                    <span>Setujui Semua</span>
                  </button>
                </div>

                <!-- Empty State -->
                <div 
                  v-if="pendingMemberVisits.length === 0" 
                  class="py-12 px-4 text-center rounded-3xl bg-slate-50 dark:bg-slate-800/40 border-2 border-dashed border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div class="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle class="w-7 h-7" />
                  </div>
                  <div class="space-y-1">
                    <h4 class="font-black text-sm sm:text-base text-slate-800 dark:text-slate-200">
                      Antrian Masuk Kosong
                    </h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      Semua anggota yang melakukan check-in sudah disetujui, atau belum ada anggota yang meminta izin masuk.
                    </p>
                  </div>
                  <button 
                    type="button"
                    @click="memberCheckinSubTab = 'direct'"
                    class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer active:scale-95 mt-2"
                  >
                    <UserCheck class="w-3.5 h-3.5" />
                    <span>Input / Scan Anggota di Meja</span>
                  </button>
                </div>

                <!-- Pending Queue List -->
                <div v-else class="space-y-2.5 max-h-[460px] overflow-y-auto pr-0.5">
                  <div 
                    v-for="v in pendingMemberVisits"
                    :key="v.id"
                    class="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-amber-400 dark:hover:border-amber-600 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in-50 duration-200"
                  >
                    <div class="flex items-center gap-3 min-w-0">
                      <img 
                        :src="getMemberAvatar(v.memberId, v.memberCardNumber)" 
                        alt="Foto Anggota" 
                        class="w-12 h-12 rounded-xl object-cover border-2 border-amber-300 dark:border-amber-600 shadow-xs shrink-0"
                      />
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-1.5 flex-wrap">
                          <h4 class="font-black text-sm text-slate-900 dark:text-white truncate">
                            {{ v.name }}
                          </h4>
                          <span 
                            class="px-2 py-0.2 rounded-full text-[10px] font-bold"
                            :class="v.memberType === 'guru' 
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' 
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'"
                          >
                            {{ v.memberType === 'guru' ? 'Guru' : 'Siswa' }}
                          </span>
                        </div>
                        <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          <span class="font-bold text-amber-700 dark:text-amber-400">{{ v.memberCardNumber || 'Member' }}</span>
                          <span>•</span>
                          <span class="text-[11px] font-sans font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            🎯 {{ v.purpose }}
                          </span>
                        </div>
                        <div class="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                          <Clock class="w-3 h-3" />
                          <span>Menunggu sejak {{ formatTime(v.createdAt) }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button 
                        type="button"
                        @click="rejectPendingVisit(v.id)"
                        class="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs transition cursor-pointer active:scale-95 flex items-center gap-1"
                        title="Tolak izin masuk"
                      >
                        <X class="w-3.5 h-3.5" />
                        <span>Tolak</span>
                      </button>
                      <button 
                        type="button"
                        @click="approvePendingVisit(v.id)"
                        class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer active:scale-95 flex items-center gap-1.5"
                      >
                        <CheckCircle class="w-4 h-4" />
                        <span>Setujui</span>
                      </button>
                    </div>
                  </div>

                  <div class="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <span class="text-base shrink-0">💡</span>
                    <span>Setelah Anda mengklik <strong>Setujui</strong>, layar HP/perangkat anggota akan otomatis menampilkan notifikasi <strong>"Anda sudah diperbolehkan masuk"</strong> secara seketika.</span>
                  </div>
                </div>
              </div>

              <!-- SUB-TAB 2: INPUT / SCAN DI MEJA (DIRECT ADMIN CHECK-IN) -->
              <div v-else class="space-y-4">
                <div class="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                  <div class="font-bold flex items-center gap-1.5">
                    <QrCode class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Check-in Cepat Anggota di Meja Petugas</span>
                  </div>
                  <p class="text-[11px] text-blue-700 dark:text-blue-300">
                    Scan QR code pada kartu anggota fisik/digital siswa & guru, atau ketik Nama / Nomor Kartu / ID Member yang disebutkan anggota.
                  </p>
                </div>

                <!-- Scanner or Search Mode Toggle (Full Width on Mobile) -->
                <div class="flex items-center justify-center gap-2 w-full">
                  <button 
                    type="button"
                    @click="adminMemberScanMode = 'manual'"
                    class="flex-1 py-2 px-3 rounded-full text-xs font-bold transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                    :class="adminMemberScanMode === 'manual' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'"
                  >
                    <Search class="w-3.5 h-3.5 shrink-0" />
                    <span>Ketik Nama / ID Member</span>
                  </button>
                  <button 
                    type="button"
                    @click="adminMemberScanMode = 'camera'"
                    class="flex-1 py-2 px-3 rounded-full text-xs font-bold transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                    :class="adminMemberScanMode === 'camera' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'"
                  >
                    <Camera class="w-3.5 h-3.5 shrink-0" />
                    <span>Scan Kamera</span>
                  </button>
                </div>

              <div v-if="adminMemberScanMode === 'camera'">
                <MemberCardScanner 
                  @scan-success="handleAdminMemberScanned" 
                  @selected="handleAdminScannerSelected"
                />
              </div>

              <div v-else class="space-y-3">
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Nama Member / Nomor Kartu / ID
                    </label>
                    <span v-if="adminMatchedMember" class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle class="w-3.5 h-3.5" /> Terpilih
                    </span>
                  </div>

                  <div class="flex gap-2 relative">
                    <div class="relative flex-1">
                      <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        v-model="adminMemberSearchKey"
                        type="text"
                        placeholder="Ketik minimal 3 karakter nama siswa/guru, atau nomor kartu (LIB-001)..."
                        @keydown.enter.prevent="lookupAdminMember"
                        @input="onAdminSearchInput"
                        class="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                      />
                      <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        <Loader2 v-if="isAdminSearchingMember" class="w-4 h-4 text-blue-500 animate-spin" />
                        <button 
                          v-else-if="adminMemberSearchKey"
                          type="button"
                          @click="clearAdminSearch"
                          class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full cursor-pointer"
                          title="Hapus pencarian"
                        >
                          <X class="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <button 
                      type="button"
                      @click="lookupAdminMember"
                      :disabled="isAdminSearchingMember"
                      class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-xs transition cursor-pointer active:scale-95 shrink-0 flex items-center gap-1.5 disabled:opacity-75"
                    >
                      <Loader2 v-if="isAdminSearchingMember" class="w-3.5 h-3.5 animate-spin" />
                      <Search v-else class="w-3.5 h-3.5" />
                      <span>{{ isAdminSearchingMember ? 'Mencari...' : 'Cari' }}</span>
                    </button>
                  </div>
                  <div class="flex flex-wrap items-center justify-between text-[11px] gap-1 pt-0.5">
                    <p v-if="adminMemberSearchKey.trim().length > 0 && adminMemberSearchKey.trim().length < 3" class="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                      <span>⚠️ Ketik minimal 3 karakter untuk mencari ({{ adminMemberSearchKey.trim().length }}/3)</span>
                    </p>
                    <p v-else-if="isAdminSearchingMember" class="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                      <Loader2 class="w-3 h-3 animate-spin" />
                      <span>Mencari ke database server perpustakaan...</span>
                    </p>
                    <p v-else class="text-slate-500 dark:text-slate-400">
                      💡 Ketik minimal 3 karakter, sistem otomatis mencari ke server setelah jeda 500ms.
                    </p>
                    <span v-if="adminMemberCandidates.length > 0 && !adminMatchedMember" class="text-blue-600 dark:text-blue-400 font-bold ml-auto">
                      {{ adminMemberCandidates.length }} anggota ditemukan
                    </span>
                  </div>
                </div>

                <!-- Multiple Candidates Suggestion / Search Result List -->
                <div 
                  v-if="adminMemberCandidates.length >= 1 && !adminMatchedMember" 
                  class="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in duration-200"
                >
                  <div class="flex items-center justify-between text-xs px-1">
                    <span class="font-bold text-slate-700 dark:text-slate-300">
                      Ditemukan {{ adminMemberCandidates.length }} Anggota:
                    </span>
                    <span class="text-[11px] text-slate-500 dark:text-slate-400">Klik anggota untuk memilih</span>
                  </div>
                  <div class="max-h-60 overflow-y-auto space-y-1.5 pr-0.5">
                    <button 
                      v-for="cand in adminMemberCandidates"
                      :key="cand.id"
                      type="button"
                      @click="selectAdminCandidate(cand)"
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
                        Pilih
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Matched Member Confirmation Box -->
              <div 
                v-if="adminMatchedMember" 
                class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-4 animate-in slide-in-from-top-2 duration-200"
              >
                <div class="flex items-center justify-between pb-1 border-b border-emerald-200/80 dark:border-emerald-800/80">
                  <span class="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle class="w-3.5 h-3.5" /> Data Anggota Ditemukan
                  </span>
                  <button 
                    type="button" 
                    @click="adminMatchedMember = null; adminMemberSearchKey = ''" 
                    class="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:underline cursor-pointer"
                  >
                    Ganti Anggota
                  </button>
                </div>

                <div class="flex items-center gap-3">
                  <img 
                    :src="adminMatchedMember.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'" 
                    alt="Avatar"
                    class="w-12 h-12 rounded-xl object-cover border-2 border-white dark:border-slate-800 shadow-xs shrink-0"
                  />
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        {{ adminMatchedMember.cardNumber }}
                      </span>
                      <span class="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                        {{ adminMatchedMember.memberType === 'guru' ? 'Guru' : 'Siswa' }}
                      </span>
                      <span v-if="adminMatchedMember.nis" class="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        NIS: {{ adminMatchedMember.nis }}
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
                  class="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                >
                  <UserCheck class="w-4 h-4" />
                  <span>Konfirmasi Akses dan Sirkulasi ({{ adminMatchedMember.name }})</span>
                </button>
              </div>

              <div v-if="adminMemberError" class="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle class="w-4 h-4 shrink-0" />
                <span>{{ adminMemberError }}</span>
              </div>
            </div>
          </div>

            <!-- TAB 4: QR MEJA RESEPSIONIS (STAND DESK / CETAK QR) -->
            <div v-else-if="activeTab === 'desk_qr'" class="space-y-5 max-w-lg mx-auto text-center">
              <div class="space-y-1">
                <h3 class="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  QR Code Buku Tamu
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Tampilkan layar ini pada tablet resepsionis atau cetak standee agar pengunjung dapat langsung scan dan mengisi presensi secara mandiri.
                </p>
              </div>

              <!-- Printable Stand Card Preview -->
              <div 
                class="qr-stand-card p-6 sm:p-8 rounded-3xl border-2 shadow-xl space-y-4 max-w-sm mx-auto transition-all duration-200"
                :class="qrCardStyle === 'paper' 
                  ? 'bg-white text-slate-900 border-slate-200 shadow-lg' 
                  : 'bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 border-blue-200 dark:border-slate-700 text-slate-900 dark:text-white'"
              >
                <div class="space-y-1">
                  <div 
                    class="text-[11px] font-extrabold uppercase tracking-widest"
                    :class="qrCardStyle === 'paper' ? 'text-blue-600' : 'text-blue-600 dark:text-blue-400'"
                  >
                    Perpustakaan SDN Pengasinan VII
                  </div>
                  <h4 
                    class="font-black text-lg"
                    :class="qrCardStyle === 'paper' ? 'text-slate-900' : 'text-slate-900 dark:text-white'"
                  >
                    Scan Buku Tamu Digital
                  </h4>
                  <p 
                    class="text-[11px]"
                    :class="qrCardStyle === 'paper' ? 'text-slate-500' : 'text-slate-500 dark:text-slate-400'"
                  >
                    Arahkan kamera smartphone Anda ke QR code berikut:
                  </p>
                </div>

                <!-- Canvas QR Container -->
                <div 
                  class="qr-canvas-wrapper p-3.5 sm:p-4 rounded-2xl shadow-inner inline-block mx-auto border transition-colors duration-200"
                  :class="qrCardStyle === 'paper' 
                    ? 'bg-white border-slate-200' 
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800'"
                >
                  <canvas ref="qrCanvas" class="w-48 h-48 mx-auto block rounded-lg"></canvas>
                </div>

                <!-- Active Token Banner on Standee -->
                <div 
                  v-if="store.activeVisitToken" 
                  class="p-3 border rounded-2xl flex items-center justify-between text-left transition-colors duration-200"
                  :class="qrCardStyle === 'paper' 
                    ? 'bg-amber-50 border-amber-300 text-amber-900' 
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200'"
                >
                  <div>
                    <span 
                      class="text-[10px] uppercase font-bold block tracking-wider"
                      :class="qrCardStyle === 'paper' ? 'text-amber-700' : 'text-amber-700 dark:text-amber-400'"
                    >
                      Kode Token Tamu Hari Ini
                    </span>
                    <span 
                      class="font-mono text-base font-black tracking-wider"
                      :class="qrCardStyle === 'paper' ? 'text-amber-900' : 'text-amber-900 dark:text-amber-300'"
                    >
                      {{ store.activeVisitToken.token }}
                    </span>
                  </div>
                  <button 
                    @click="copyCode(store.activeVisitToken.token)" 
                    type="button"
                    class="px-2.5 py-1 text-xs rounded-lg font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
                    :class="qrCardStyle === 'paper' 
                      ? 'bg-amber-200 hover:bg-amber-300 text-amber-900' 
                      : 'bg-amber-200 hover:bg-amber-300 dark:bg-amber-900/60 dark:hover:bg-amber-800/80 text-amber-900 dark:text-amber-200'"
                  >
                    <Copy class="w-3 h-3" />
                    <span>Salin</span>
                  </button>
                </div>

                <div class="space-y-1 text-xs">
                  <span 
                    class="font-mono text-[11px] break-all select-all block font-medium"
                    :class="qrCardStyle === 'paper' ? 'text-blue-700' : 'text-blue-700 dark:text-blue-300'"
                  >
                    {{ publicVisitUrl }}
                  </span>
                  <p 
                    class="text-[10px]"
                    :class="qrCardStyle === 'paper' ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500'"
                  >
                    Mendukung presensi tamu umum & check-in kartu anggota
                  </p>
                </div>
              </div>

              <!-- Appearance Mode & Token Toggle -->
              <div class="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                <div class="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span class="text-[10px] font-semibold text-slate-400 px-1.5">Tampilan:</span>
                  <button 
                    type="button" 
                    @click="setQrCardStyle('auto')"
                    class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer"
                    :class="qrCardStyle === 'auto' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'"
                  >
                    Sesuai Tema
                  </button>
                  <button 
                    type="button" 
                    @click="setQrCardStyle('paper')"
                    class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer"
                    :class="qrCardStyle === 'paper' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'"
                  >
                    Kertas Putih (Cetak)
                  </button>
                </div>

                <!-- Option: Include Token in QR -->
                <div v-if="store.activeVisitToken" class="flex items-center gap-2">
                  <label class="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      v-model="includeTokenInQr" 
                      @change="renderQrCode"
                      class="rounded text-blue-600 focus:ring-blue-500 cursor-pointer" 
                    />
                    <span>Sertakan token otomatis</span>
                  </label>
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
import type { LibraryVisit, VisitPurpose, Member, VisitToken } from '../types.js';
import { isTodayVisit, getTodayDateString, formatToJakartaDateString } from '../utils/dateUtils.js';
import MemberCardScanner from './MemberCardScanner.vue';
import AdminPagination from './AdminPagination.vue';
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
  ExternalLink,
  KeyRound,
  Plus,
  RefreshCw,
  AlertCircle,
  Loader2,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useLibraryStore();
const router = useRouter();

const activeTab = ref<'list' | 'tokens' | 'manual_guest' | 'member_checkin' | 'desk_qr'>('list');
const isSubmitting = ref(false);

// Antrian Member Masuk yang Menunggu Persetujuan Admin
const pendingMemberVisits = computed(() => {
  return store.visits.filter(v => v.visitorType === 'member' && v.status === 'pending');
});

// Sub-Tab di dalam Check-in Member: 'direct' (Check-in Meja Sirkulasi) vs 'queue' (Antrian Masuk)
const memberCheckinSubTab = ref<'queue' | 'direct'>('direct');

const tabs = computed(() => [
  { 
    id: 'list', 
    label: 'Daftar Presensi', 
    icon: ListFilter, 
    badge: dateFilter.value === 'all' 
      ? (totalVisitsCount.value > 0 ? `${totalVisitsCount.value} Total` : '0') 
      : store.todayVisitsCount 
  },
  { id: 'tokens', label: 'Kelola Token', icon: KeyRound, badge: store.activeVisitToken ? store.activeVisitToken.token : 'Belum Ada' },
  { id: 'manual_guest', label: 'Input Manual Non-Member', icon: UserPlus },
  { 
    id: 'member_checkin', 
    label: 'Check-in Member', 
    icon: UserCheck, 
    badge: pendingMemberVisits.value.length > 0 ? `${pendingMemberVisits.value.length} Antrian` : undefined,
    isAlert: pendingMemberVisits.value.length > 0 
  },
  { id: 'desk_qr', label: 'QR Code', icon: QrCode }
]);

const approvePendingVisit = async (visitId: string) => {
  await store.approveVisit(visitId, store.currentUser?.name);
  if (dateFilter.value === 'all') {
    fetchServerVisits();
  }
};

const rejectPendingVisit = async (visitId: string) => {
  await store.rejectVisit(visitId);
  if (dateFilter.value === 'all') {
    fetchServerVisits();
  }
};

const approveAllPendingVisits = async () => {
  const list = [...pendingMemberVisits.value];
  for (const v of list) {
    await store.approveVisit(v.id, store.currentUser?.name);
  }
  store.showToast(`Semua ${list.length} antrian anggota berhasil disetujui.`);
  if (dateFilter.value === 'all') {
    fetchServerVisits();
  }
};

const getMemberAvatar = (memberId?: string, cardNumber?: string): string => {
  const member = store.members.find(m => (memberId && m.id === memberId) || (cardNumber && m.cardNumber === cardNumber));
  return member?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
};

// Filters for List Tab
const searchQuery = ref('');
const dateFilter = ref<'today' | 'all' | 'custom'>('today');
const customDate = ref(getTodayDateString());
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

// Token Management State
const showTokenGenModal = ref(false);
const tokenGenForm = ref({
  type: 'daily' as 'daily' | 'single_use',
  customCode: '',
  notes: '',
  maxUsage: 1
});
const includeTokenInQr = ref(true);

// Manual Guest Form
const manualForm = ref({
  name: '',
  origin: '',
  purpose: 'Membaca Buku' as VisitPurpose,
  purposeDetails: '',
  phone: '',
  visitDate: getTodayDateString(),
  notes: '',
  tokenUsed: ''
});

// Admin Member Check-in
const adminMemberScanMode = ref<'manual' | 'camera'>('manual');
const adminMemberSearchKey = ref('');
const adminMemberCandidates = ref<Member[]>([]);
const adminMemberError = ref('');
const adminMatchedMember = ref<Member | null>(null);
const adminMemberPurpose = ref<VisitPurpose>('Membaca Buku');
const isAdminSearchingMember = ref(false);
let adminMemberSearchDebounceTimer: any = null;

// QR Desk Canvas & Appearance
const qrCanvas = ref<HTMLCanvasElement | null>(null);
const qrCardStyle = ref<'auto' | 'paper'>('auto');

const setQrCardStyle = (style: 'auto' | 'paper') => {
  qrCardStyle.value = style;
  setTimeout(renderQrCode, 50);
};

const isDarkTheme = computed(() => {
  if (qrCardStyle.value === 'paper') return false;
  return store.currentTheme === 'dark' || 
         store.currentTheme === 'elegant' || 
         (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
});

const publicVisitUrl = computed(() => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const base = `${origin}/kunjungan`;
  if (includeTokenInQr.value && store.activeVisitToken) {
    return `${base}?token=${encodeURIComponent(store.activeVisitToken.token)}`;
  }
  return base;
});

const renderQrCode = async () => {
  await nextTick();
  if (qrCanvas.value) {
    try {
      const dark = isDarkTheme.value;
      await QRCode.toCanvas(qrCanvas.value, publicVisitUrl.value, {
        width: 192,
        margin: 1,
        color: {
          dark: dark ? '#f8fafc' : '#0f172a',
          light: dark ? '#0b1120' : '#ffffff'
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

watch(() => store.activeVisitToken?.token, () => {
  if (activeTab.value === 'desk_qr') {
    setTimeout(renderQrCode, 100);
  }
});

watch(() => store.currentTheme, () => {
  if (activeTab.value === 'desk_qr') {
    setTimeout(renderQrCode, 80);
  }
});

const isTokenLive = (t: VisitToken): boolean => {
  if (!t.isActive) return false;
  if (t.expiresAt && new Date(t.expiresAt).getTime() < Date.now()) return false;
  if (t.maxUsage !== undefined && t.usageCount >= t.maxUsage) return false;
  return true;
};

const formatTokenExpiry = (isoString?: string) => {
  if (!isoString) return 'Tidak Terbatas';
  try {
    const d = new Date(isoString);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return `Hari ini, ${timeStr} WIB`;
    }
    return `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}, ${timeStr} WIB`;
  } catch {
    return isoString;
  }
};

const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code);
    store.showToast(`✅ Kode token ${code} berhasil disalin!`);
  } catch {
    store.showToast(`Token: ${code}`);
  }
};

const generateQuickDailyToken = async () => {
  await store.generateVisitToken({ type: 'daily' });
};

const submitGenerateToken = async () => {
  const res = await store.generateVisitToken({
    type: tokenGenForm.value.type,
    customCode: tokenGenForm.value.customCode,
    notes: tokenGenForm.value.notes,
    maxUsage: tokenGenForm.value.type === 'single_use' ? (tokenGenForm.value.maxUsage || 1) : undefined
  });

  if (res.success) {
    showTokenGenModal.value = false;
    tokenGenForm.value = {
      type: 'daily',
      customCode: '',
      notes: '',
      maxUsage: 1
    };
  }
};

const revokeActiveToken = async () => {
  if (store.activeVisitToken) {
    await store.revokeVisitToken(store.activeVisitToken.id);
  }
};

const deleteToken = async (tokenId: string) => {
  if (confirm('Hapus token kunjungan ini?')) {
    await store.deleteVisitToken(tokenId);
  }
};

// Server-Side Pagination (Default 25 data per halaman gaya Master Data Buku untuk 'Semua' / Semua Hari)
const currentPage = ref(1);
const pageSize = ref(25);
const totalServerVisits = ref(0);
const totalServerPages = ref(1);
const serverVisitsList = ref<LibraryVisit[]>([]);
const isServerLoading = ref(false);
let serverFetchDebounceTimer: any = null;

const fetchServerVisits = async () => {
  if (!props.isOpen || activeTab.value !== 'list' || dateFilter.value !== 'all') {
    return;
  }

  isServerLoading.value = true;
  try {
    const params = new URLSearchParams({
      page: String(currentPage.value),
      limit: String(pageSize.value),
      dateFilter: 'all',
      type: typeFilter.value,
      purpose: purposeFilter.value,
      search: (searchQuery.value || '').trim()
    });

    const res = await fetch(`/api/visits?${params.toString()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        serverVisitsList.value = json.data;
        totalServerVisits.value = json.pagination?.total ?? json.data.length;
        totalServerPages.value = json.pagination?.totalPages ?? 1;
        return;
      }
    }
  } catch (err) {
    console.warn('[Visits] Server-side pagination fetch error, fallback ke lokal:', err);
  } finally {
    isServerLoading.value = false;
  }
};

const triggerDebouncedServerFetch = () => {
  if (serverFetchDebounceTimer) clearTimeout(serverFetchDebounceTimer);
  serverFetchDebounceTimer = setTimeout(() => {
    fetchServerVisits();
  }, 300);
};

// Filter lokal (digunakan untuk 'today', 'custom', atau fallback offline jika server belum merespon)
const localFilteredVisits = computed(() => {
  const query = (searchQuery.value || '').trim().toLowerCase();

  return store.visits.filter(v => {
    // Date filter
    if (dateFilter.value === 'today') {
      if (!isTodayVisit(v)) return false;
    } else if (dateFilter.value === 'custom') {
      const vDate = formatToJakartaDateString(v.timestamp || v.visitDate);
      if (vDate !== customDate.value) return false;
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
      const matchToken = v.tokenUsed?.toLowerCase().includes(query);
      if (!matchName && !matchOrigin && !matchCard && !matchId && !matchToken) return false;
    }

    return true;
  });
});

const filteredVisits = computed(() => {
  if (dateFilter.value === 'all') {
    // Jika data server tersedia atau sedang loading, tampilkan data server paginated
    if (serverVisitsList.value.length > 0 || isServerLoading.value) {
      return serverVisitsList.value;
    }
    // Fallback: client pagination 25 data per halaman jika offline
    const startIndex = (currentPage.value - 1) * pageSize.value;
    return localFilteredVisits.value.slice(startIndex, startIndex + pageSize.value);
  }

  // Untuk 'today' dan 'custom', tampilkan data tanggal yang difilter
  return localFilteredVisits.value;
});

const totalVisitsCount = computed(() => {
  if (dateFilter.value === 'all') {
    return totalServerVisits.value || localFilteredVisits.value.length;
  }
  return localFilteredVisits.value.length;
});

const totalPages = computed(() => {
  if (dateFilter.value === 'all') {
    return totalServerPages.value || Math.max(1, Math.ceil(localFilteredVisits.value.length / pageSize.value));
  }
  return 1;
});

// Watchers untuk sinkronisasi server-side pagination gaya Master Data Buku
watch(() => props.isOpen, (open) => {
  if (open && dateFilter.value === 'all') {
    currentPage.value = 1;
    fetchServerVisits();
  }
});

watch(dateFilter, (newVal) => {
  currentPage.value = 1;
  if (newVal === 'all') {
    fetchServerVisits();
  }
});

watch(pageSize, () => {
  currentPage.value = 1;
  if (dateFilter.value === 'all') {
    fetchServerVisits();
  }
});

watch(currentPage, () => {
  if (dateFilter.value === 'all') {
    fetchServerVisits();
  }
});

watch([typeFilter, purposeFilter], () => {
  currentPage.value = 1;
  if (dateFilter.value === 'all') {
    fetchServerVisits();
  }
});

watch(searchQuery, () => {
  currentPage.value = 1;
  if (dateFilter.value === 'all') {
    triggerDebouncedServerFetch();
  }
});

watch(
  () => store.visits.length,
  () => {
    if (props.isOpen && dateFilter.value === 'all') {
      fetchServerVisits();
    }
  }
);

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
    if (dateFilter.value === 'all') {
      fetchServerVisits();
    }
  }
};

const submitManualGuest = async () => {
  if (!manualForm.value.name.trim() || !manualForm.value.origin.trim()) return;

  isSubmitting.value = true;
  try {
    const tokenUsed = (manualForm.value.tokenUsed || '').trim() || 
      (store.activeVisitToken ? store.activeVisitToken.token : 'ADMIN-VERIFIED');

    const res = await store.recordVisit({
      visitorType: 'non_member',
      name: manualForm.value.name,
      origin: manualForm.value.origin,
      purpose: manualForm.value.purpose,
      purposeDetails: manualForm.value.purpose === 'Lainnya' ? manualForm.value.purposeDetails : undefined,
      phone: manualForm.value.phone,
      visitDate: manualForm.value.visitDate,
      notes: manualForm.value.notes,
      source: 'manual_admin',
      tokenUsed
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
        visitDate: getTodayDateString(),
        notes: '',
        tokenUsed: ''
      };
      activeTab.value = 'list';
    }
  } finally {
    isSubmitting.value = false;
  }
};

const searchAdminMembers = (query: string): Member[] => {
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

const performAdminMemberSearch = async (query: string) => {
  isAdminSearchingMember.value = true;
  try {
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

    const matches = searchAdminMembers(query);
    adminMemberCandidates.value = matches;
    if (matches.length === 1 && (matches[0].cardNumber.toLowerCase() === query.toLowerCase() || matches[0].name.toLowerCase() === query.toLowerCase())) {
      adminMatchedMember.value = matches[0];
    } else if (matches.length === 0) {
      adminMatchedMember.value = null;
      adminMemberCandidates.value = [];
      adminMemberError.value = `Anggota dengan nama atau ID "${query}" tidak ditemukan di server perpustakaan.`;
    }
  } finally {
    isAdminSearchingMember.value = false;
  }
};

const lookupAdminMember = async () => {
  if (adminMemberSearchDebounceTimer) {
    clearTimeout(adminMemberSearchDebounceTimer);
    adminMemberSearchDebounceTimer = null;
  }
  adminMemberError.value = '';
  adminMemberCandidates.value = [];
  const rawKey = (adminMemberSearchKey.value || '').trim();
  if (!rawKey) {
    adminMemberError.value = 'Ketik nama anggota atau nomor kartu.';
    return;
  }

  // Wajib minimal 3 karakter untuk mencari
  if (rawKey.length < 3) {
    adminMemberError.value = 'Ketik minimal 3 karakter untuk mencari nama member.';
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
    adminMatchedMember.value = exactCardOrId;
    adminMemberCandidates.value = [exactCardOrId];
    return;
  }

  // 2. Search by name, card number, or NIS on server
  await performAdminMemberSearch(rawKey);
};

const onAdminSearchInput = () => {
  adminMemberError.value = '';
  if (adminMemberSearchDebounceTimer) {
    clearTimeout(adminMemberSearchDebounceTimer);
    adminMemberSearchDebounceTimer = null;
  }

  const q = (adminMemberSearchKey.value || '').trim();
  if (!q) {
    adminMemberCandidates.value = [];
    adminMatchedMember.value = null;
    isAdminSearchingMember.value = false;
    return;
  }
  // If the user starts modifying the search input while a member was selected, reset selected
  if (adminMatchedMember.value && 
      adminMatchedMember.value.name.toLowerCase() !== q.toLowerCase() && 
      adminMatchedMember.value.cardNumber.toLowerCase() !== q.toLowerCase()) {
    adminMatchedMember.value = null;
  }

  // Ketik dulu minimal 3 karakter sebelum mencari
  if (q.length < 3) {
    adminMemberCandidates.value = [];
    isAdminSearchingMember.value = false;
    return;
  }

  // Beri delay sekitar 500ms barulah mencari ke server
  isAdminSearchingMember.value = true;
  adminMemberSearchDebounceTimer = setTimeout(async () => {
    await performAdminMemberSearch(q);
  }, 500);
};

const selectAdminCandidate = (member: Member) => {
  adminMatchedMember.value = member;
  adminMemberSearchKey.value = member.name;
  adminMemberCandidates.value = [];
  adminMemberError.value = '';
};

const clearAdminSearch = () => {
  adminMemberSearchKey.value = '';
  adminMatchedMember.value = null;
  adminMemberCandidates.value = [];
  adminMemberError.value = '';
};

const handleAdminScannerSelected = (member: Member) => {
  if (!member) return;
  adminMatchedMember.value = member;
  adminMemberSearchKey.value = member.name;
  adminMemberCandidates.value = [];
  adminMemberError.value = '';
  adminMemberScanMode.value = 'manual';
  store.showToast(`Anggota "${member.name}" berhasil dipilih. Silakan konfirmasi akses & sirkulasi.`);
};

const handleAdminMemberScanned = (scannedCode: string) => {
  if (!scannedCode) return;
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

    const memberName = adminMatchedMember.value.name;
    const res = await store.recordVisit({
      visitorType: 'member',
      status: 'approved',
      memberId: adminMatchedMember.value.id,
      memberCardNumber: adminMatchedMember.value.cardNumber,
      memberType: adminMatchedMember.value.memberType || 'siswa',
      name: memberName,
      origin: origin,
      purpose: adminMemberPurpose.value,
      source: adminMemberScanMode.value === 'camera' ? 'qr_scan' : 'manual_admin'
    });

    if (res.success) {
      store.showToast(`✅ Konfirmasi Akses & Sirkulasi untuk "${memberName}" berhasil dicatat!`);
      adminMatchedMember.value = null;
      adminMemberCandidates.value = [];
      adminMemberSearchKey.value = '';
      activeTab.value = 'list';
      dateFilter.value = 'today';
      searchQuery.value = '';
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

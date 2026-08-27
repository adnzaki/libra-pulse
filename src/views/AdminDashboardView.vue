<template>
  <div>
    <!-- Access Denied Gate if not logged in as Admin -->
    <div v-if="!store.isAdmin" class="max-w-md mx-auto py-12 px-4 text-center space-y-5 animate-in fade-in duration-300">
      <div class="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
        <ShieldCheck class="w-8 h-8" />
      </div>
      <div>
        <h2 class="text-xl font-extrabold text-slate-900">Akses Pengelola Terbatas</h2>
        <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Halaman Admin Library Console hanya dapat diakses oleh Administrator / Petugas Perpustakaan yang sah.
        </p>
      </div>
      
      <div class="pt-2 flex flex-col gap-2.5">
        <router-link 
          to="/login?mode=admin"
          class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition"
        >
          <LogIn class="w-4 h-4" />
          <span>Masuk Sebagai Administrator</span>
        </router-link>
        <router-link 
          to="/"
          class="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition"
        >
          Kembali ke Katalog Publik
        </router-link>
      </div>
    </div>

    <!-- Authorized Admin Console -->
    <div v-else class="space-y-4 sm:space-y-6">
    
    <!-- Top Bento Header & Action Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full bg-blue-100 text-blue-700 border border-blue-200">
            Control Hub
          </span>
          <span class="text-[11px] sm:text-xs text-slate-400 font-medium">Real-time Sirkulasi & Pelaporan</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Admin Library Console</h1>
      </div>

      <!-- Quick Action Buttons (Wrapped cleanly on mobile) -->
      <div class="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
        <button 
          @click="openDirectLoanModal"
          class="px-3.5 sm:px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-full shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <BookPlus class="w-4 h-4 shrink-0" />
          <span class="truncate">Scan Pinjam</span>
        </button>

        <button 
          @click="openReturnModal(null)"
          class="px-3.5 sm:px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-full shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <CheckCircle2 class="w-4 h-4 shrink-0" />
          <span class="truncate">Pengembalian</span>
        </button>

        <button 
          @click="openNotifyModal(null)"
          class="px-3.5 sm:px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-full shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Send class="w-4 h-4 text-amber-500 shrink-0" />
          <span class="truncate">Notifikasi</span>
        </button>

        <button 
          @click="openAddBookModal"
          class="px-3.5 sm:px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-full shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Plus class="w-4 h-4 text-slate-500 shrink-0" />
          <span class="truncate">Tambah Buku</span>
        </button>

        <button 
          @click="handleDownloadOffline"
          :disabled="isDownloadingOffline"
          class="px-3.5 sm:px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold text-xs rounded-full shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
          title="Unduh seluruh data untuk diakses secara offline"
        >
          <Download class="w-4 h-4 text-indigo-600 shrink-0" :class="{ 'animate-bounce': isDownloadingOffline }" />
          <span class="truncate">{{ isDownloadingOffline ? 'Mengunduh...' : 'Unduh ke Lokal' }}</span>
        </button>

        <button 
          @click="isChangeAdminPasswordOpen = true"
          class="px-3.5 sm:px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-full shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <KeyRound class="w-4 h-4 text-blue-400 shrink-0" />
          <span class="truncate">Ganti Sandi Admin</span>
        </button>
      </div>
    </div>

    <!-- MAIN BENTO GRID (2 Columns on mobile, 4 Columns on desktop) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      
      <!-- Bento Card 1: Total Koleksi Buku -->
      <div class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <span class="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Total Fisik</span>
          <span class="px-2 py-0.5 bg-green-100 text-green-700 text-[9px] sm:text-[10px] font-bold rounded-full uppercase">Katalog</span>
        </div>
        <div class="my-2.5 sm:my-4">
          <div class="text-2xl sm:text-4xl font-extrabold font-sans text-slate-900">{{ store.stats?.totalBooks || 0 }}</div>
          <p class="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">{{ store.stats?.totalTitles || 0 }} Judul Koleksi</p>
        </div>
        <div class="w-full bg-slate-100 h-1.5 sm:h-2 rounded-full overflow-hidden">
          <div 
            class="bg-blue-600 h-full rounded-full transition-all duration-500" 
            :style="{ width: `${Math.min(100, ((store.stats?.availableBooks || 1) / (store.stats?.totalBooks || 1)) * 100)}%` }"
          ></div>
        </div>
      </div>

      <!-- Bento Card 2: Sedang Dipinjam -->
      <div class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <span class="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Dipinjam</span>
          <span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] sm:text-[10px] font-bold rounded-full uppercase">Sirkulasi</span>
        </div>
        <div class="my-2.5 sm:my-4">
          <div class="text-2xl sm:text-4xl font-extrabold font-sans text-slate-900">{{ store.stats?.borrowedBooks || 0 }}</div>
          <p class="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">{{ store.activeLoans.length }} Pinjaman Aktif</p>
        </div>
        <div class="w-full bg-slate-100 h-1.5 sm:h-2 rounded-full overflow-hidden">
          <div class="bg-indigo-500 h-full rounded-full" style="width: 72%"></div>
        </div>
      </div>

      <!-- Bento Card 3: Overdue / Terlambat -->
      <div class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <span class="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Telat</span>
          <span 
            class="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-full uppercase"
            :class="store.overdueLoans.length ? 'bg-rose-100 text-rose-700' : 'bg-green-100 text-green-700'"
          >
            {{ store.overdueLoans.length ? 'Perlu Aksi' : 'Aman' }}
          </span>
        </div>
        <div class="my-2.5 sm:my-4">
          <div class="text-2xl sm:text-4xl font-extrabold font-sans" :class="store.overdueLoans.length ? 'text-rose-600' : 'text-slate-900'">
            {{ store.overdueLoans.length }}
          </div>
          <p class="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">{{ store.suspendedMembers.length }} Disuspend</p>
        </div>
        <button 
          v-if="store.overdueLoans.length"
          @click="openNotifyModal(null)"
          class="text-[11px] sm:text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 pt-0.5 cursor-pointer truncate"
        >
          <Send class="w-3 h-3 shrink-0" />
          Kirim Notif →
        </button>
        <div v-else class="text-[10px] sm:text-[11px] text-emerald-600 font-medium flex items-center gap-1">
          <CheckCircle class="w-3 h-3 shrink-0" />
          Tepat waktu
        </div>
      </div>

      <!-- Bento Card 4: Dark Accent Bento Card (Hold 24h & System Status) -->
      <div class="bg-slate-900 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
        <div class="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute -left-8 -bottom-8 w-32 h-32 bg-amber-400/15 rounded-full blur-2xl pointer-events-none"></div>

        <div class="relative z-10 flex items-center justify-between">
          <span class="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Hold 24h</span>
          <span class="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] sm:text-[10px] font-bold rounded-full uppercase">
            Auto
          </span>
        </div>

        <div class="relative z-10 my-2 sm:my-3">
          <div class="flex items-baseline gap-1.5">
            <span class="text-2xl sm:text-4xl font-extrabold text-white">{{ store.stats?.activeBookings || 0 }}</span>
            <span class="text-[11px] sm:text-xs text-slate-300">Booking</span>
          </div>
          <p class="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Buku otomatis dilepas setelah 24 jam.</p>
        </div>

        <div class="relative z-10 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-300">
          <span class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            Cron Aktif
          </span>
          <span class="font-mono text-slate-400">{{ store.members.length }} Member</span>
        </div>
      </div>

    </div>

    <!-- OVERDUE WARNING BENTO BOX (If overdue loans exist) -->
    <div 
      v-if="store.overdueLoans.length > 0"
      class="bg-rose-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-rose-100 text-rose-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shrink-0">
          <AlertTriangle class="w-5 h-5" />
        </div>
        <div>
          <h3 class="font-bold text-sm sm:text-base text-rose-900">Perhatian: {{ store.overdueLoans.length }} Peminjaman Melewati Batas Waktu!</h3>
          <p class="text-xs text-rose-700 mt-0.5">Sanksi penangguhan (suspend) kartu anggota berlaku otomatis hingga buku dikembalikan.</p>
        </div>
      </div>
      <button 
        @click="openNotifyModal(null)"
        class="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-full shadow-sm transition whitespace-nowrap cursor-pointer shrink-0 text-center active:scale-95"
      >
        Kirim Broadcast Peringatan
      </button>
    </div>

    <!-- MAIN INTERACTIVE BENTO CARD: Tabs & Circulation Tables -->
    <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      
      <!-- Bento Tab Bar (Responsive flex-wrap layout, prevents clipping and overflow) -->
      <div class="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3.5 bg-slate-50/60">
        
        <!-- Tab Navigation (Flex-wrap with clean gap, ensuring all menu pills are visible) -->
        <div class="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          <button 
            v-for="tab in adminTabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 whitespace-nowrap"
            :class="activeTab === tab.id 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
          >
            <component :is="tab.icon" class="w-3.5 h-3.5" />
            <span>{{ tab.label }}</span>
            <span 
              v-if="tab.badge" 
              class="px-2 py-0.5 rounded-full text-[10px] font-bold"
              :class="activeTab === tab.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700'"
            >
              {{ tab.badge }}
            </span>
          </button>
        </div>

        <!-- Real-time Search Input -->
        <div class="relative w-full xl:w-72 shrink-0">
          <input 
            v-model="loanSearch"
            type="text" 
            placeholder="Cari transaksi / nama..."
            class="w-full pl-4 pr-3 py-2 bg-white border border-slate-200 rounded-full text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>

      </div>

      <!-- Tab Content Body -->
      <div class="p-3.5 sm:p-6">
        
        <!-- Tab 1: Peminjaman & Sirkulasi Aktif -->
        <div v-if="activeTab === 'loans'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xs sm:text-sm font-bold text-slate-900">Daftar Peminjaman Aktif & Overdue</h3>
            <span class="text-[11px] sm:text-xs text-slate-400 font-mono">{{ filteredLoans.length }} Transaksi</span>
          </div>

          <!-- Mobile Card View (Zero horizontal scroll on phones) -->
          <div class="grid grid-cols-1 gap-3 md:hidden">
            <div 
              v-for="l in filteredLoans" 
              :key="l.id"
              class="p-4 rounded-2xl border space-y-3"
              :class="l.status === 'overdue' ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50/60 border-slate-200'"
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <span class="text-[10px] font-mono font-bold text-blue-600">{{ l.id }}</span>
                  <h4 class="font-bold text-sm text-slate-900 leading-snug">{{ l.bookTitle }}</h4>
                  <div class="text-xs text-slate-500 mt-0.5">Lokasi Rak: <strong class="font-mono text-slate-800">{{ l.shelfCode }}</strong></div>
                </div>
                <span 
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0"
                  :class="l.status === 'overdue' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'"
                >
                  {{ l.status === 'overdue' ? `⚠️ Telat ${l.daysOverdue}h` : 'Aktif' }}
                </span>
              </div>

              <div class="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                <div class="flex justify-between">
                  <span class="text-slate-500">Peminjam:</span>
                  <strong class="text-slate-800 font-semibold">{{ l.memberName }} ({{ l.memberCardNumber }})</strong>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Tgl Pinjam:</span>
                  <span class="text-slate-700">{{ new Date(l.borrowDate).toLocaleDateString('id-ID') }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Jatuh Tempo:</span>
                  <strong :class="l.status === 'overdue' ? 'text-rose-600' : 'text-slate-800'">
                    {{ new Date(l.dueDate).toLocaleDateString('id-ID') }}
                  </strong>
                </div>
              </div>

              <div class="flex items-center gap-2 pt-1">
                <button 
                  v-if="l.status === 'overdue'"
                  @click="openNotifyModal(l)"
                  class="flex-1 py-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs transition cursor-pointer text-center active:scale-95"
                >
                  Peringatan
                </button>
                <button 
                  @click="openReturnModal(l)"
                  class="flex-1 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer text-center active:scale-95"
                >
                  Terima Kembali
                </button>
              </div>
            </div>
          </div>

          <!-- Desktop Table View -->
          <div class="hidden md:block overflow-x-auto rounded-2xl border border-slate-100">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100 font-bold">
                <tr>
                  <th class="py-3.5 px-4">ID Transaksi</th>
                  <th class="py-3.5 px-4">Buku & Lokasi Rak</th>
                  <th class="py-3.5 px-4">Peminjam (Kartu Member)</th>
                  <th class="py-3.5 px-4">Tanggal Pinjam</th>
                  <th class="py-3.5 px-4">Jatuh Tempo</th>
                  <th class="py-3.5 px-4">Status</th>
                  <th class="py-3.5 px-4 text-right">Aksi Sirkulasi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr 
                  v-for="l in filteredLoans" 
                  :key="l.id"
                  class="hover:bg-slate-50/80 transition"
                  :class="l.status === 'overdue' ? 'bg-rose-50/30' : ''"
                >
                  <td class="py-3 px-4 font-mono font-bold text-blue-600">{{ l.id }}</td>
                  <td class="py-3 px-4">
                    <div class="font-bold text-slate-900 truncate max-w-xs">{{ l.bookTitle }}</div>
                    <div class="text-[10px] text-slate-400 font-mono">{{ l.shelfCode }}</div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="font-semibold text-slate-900">{{ l.memberName }}</div>
                    <div class="text-[10px] font-mono text-slate-400">{{ l.memberCardNumber }}</div>
                  </td>
                  <td class="py-3 px-4 text-slate-600">{{ new Date(l.borrowDate).toLocaleDateString('id-ID') }}</td>
                  <td class="py-3 px-4">
                    <span :class="l.status === 'overdue' ? 'text-rose-600 font-bold' : 'text-slate-700 font-medium'">
                      {{ new Date(l.dueDate).toLocaleDateString('id-ID') }}
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <div v-if="l.status === 'overdue'" class="space-y-0.5">
                      <span class="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] inline-flex items-center gap-1">
                        ⚠️ Telat {{ l.daysOverdue }} Hari
                      </span>
                    </div>
                    <span v-else class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                      Aktif (Tepat Waktu)
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right space-x-2">
                    <button 
                      v-if="l.status === 'overdue'"
                      @click="openNotifyModal(l)"
                      class="px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold text-xs transition cursor-pointer"
                      title="Kirim Notifikasi Keterlambatan"
                    >
                      Peringatan
                    </button>
                    <button 
                      @click="openReturnModal(l)"
                      class="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                    >
                      Terima Pengembalian
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 2: Manajemen Booking 24 Jam (Auto Hold & Auto-Cancel) -->
        <div v-if="activeTab === 'bookings'" class="space-y-4">
          <div class="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <Clock class="w-4 h-4" />
              </div>
              <div class="text-xs text-amber-900">
                <strong class="font-bold">Otomatisasi Hold 24 Jam:</strong>
                Sistem otomatis menahan buku selama 24 jam. Jika tidak diambil di sirkulasi, sistem membatalkannya agar anggota lain dapat meminjam.
              </div>
            </div>
            <span class="text-xs text-amber-800 font-bold font-mono px-3 py-1 bg-amber-200/60 rounded-full">
              {{ store.activeHoldBookings.length }} Booking Aktif
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="b in store.activeHoldBookings"
              :key="b.id"
              class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4"
            >
              <div class="flex gap-3.5">
                <img :src="b.bookCover" class="w-16 h-22 object-cover rounded-xl shadow-sm" alt="Cover" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-mono font-bold text-blue-600 px-2 py-0.5 rounded bg-blue-50">{{ b.id }}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">{{ b.shelfCode }}</span>
                  </div>
                  <h4 class="font-bold text-slate-900 text-sm mt-1 truncate">{{ b.bookTitle }}</h4>
                  <p class="text-xs text-slate-700 mt-0.5">Pemesan: <strong>{{ b.memberName }}</strong> ({{ b.memberCardNumber }})</p>
                  <div class="text-[11px] text-slate-500">HP: {{ b.memberPhone }} • {{ b.memberEmail }}</div>
                  
                  <!-- Countdown Timer -->
                  <div class="mt-2 p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span class="text-slate-500">Sisa Waktu Hold:</span>
                    <span class="font-mono font-bold text-amber-600">{{ formatCountdown(b.expiresAt) }}</span>
                  </div>
                </div>
              </div>

              <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button 
                  @click="handleCancelBooking(b.id)"
                  class="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-xs font-semibold transition cursor-pointer"
                >
                  Batalkan Booking
                </button>
                <button 
                  @click="handleCollectBooking(b.id)"
                  class="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle class="w-4 h-4" />
                  Serahkan Buku ke Anggota
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 3: Kelola Anggota & Member Perpustakaan -->
        <div v-if="activeTab === 'members'" class="space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <div>
              <h3 class="font-bold text-base text-slate-900">Manajemen Anggota & Kartu Digital</h3>
              <p class="text-xs text-slate-500">Kelola direktori anggota publik, hak akses, suspend manual, dan cetak kartu QR.</p>
            </div>
            <div class="flex items-center gap-2">
              <button 
                @click="openAddMemberModal"
                class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <UserPlus class="w-4 h-4" />
                <span>+ Daftarkan Anggota Baru</span>
              </button>
            </div>
          </div>

          <!-- Member Filter & Search Bar -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-1.5 py-0.5">
              <button 
                v-for="filter in ['all', 'active', 'suspended', 'admin']" 
                :key="filter"
                @click="memberFilter = filter"
                class="px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition cursor-pointer"
                :class="memberFilter === filter ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/60'"
              >
                {{ filter === 'all' ? 'Semua Anggota' : filter === 'active' ? 'Aktif' : filter === 'suspended' ? 'Disuspend' : 'Admin' }}
              </button>
            </div>
            <div class="text-xs text-slate-500 font-mono">
              Menampilkan {{ filteredMembers.length }} dari {{ store.members.length }} Akun
            </div>
          </div>

          <!-- Mobile Cards for Members -->
          <div class="grid grid-cols-1 gap-3 md:hidden">
            <div 
              v-for="m in filteredMembers" 
              :key="m.id"
              class="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-3 min-w-0">
                  <img :src="m.avatar" class="w-11 h-11 rounded-2xl object-cover border border-slate-200 shrink-0" alt="Avatar" />
                  <div class="min-w-0">
                    <h4 class="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5">
                      {{ m.name }}
                      <span v-if="m.role === 'admin'" class="px-1.5 py-0.2 bg-blue-100 text-blue-700 text-[9px] font-bold rounded-full">ADMIN</span>
                    </h4>
                    <div class="text-[11px] text-slate-500 truncate">{{ m.email }} • {{ m.phone }}</div>
                    <div class="text-[10px] font-mono text-blue-600 font-bold mt-0.5">{{ m.cardNumber }}</div>
                  </div>
                </div>
                <span 
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                  :class="m.isSuspended ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'"
                >
                  {{ m.isSuspended ? 'Disuspend' : 'Aktif' }}
                </span>
              </div>

              <!-- Suspend Reason if suspended -->
              <div v-if="m.isSuspended" class="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-[11px] text-rose-700">
                <strong>Alasan:</strong> {{ m.suspendReason || 'Penangguhan sanksi peminjaman' }}
                <div v-if="m.suspendedUntil" class="text-[10px] text-rose-600 mt-0.5 font-mono">
                  Berlaku hingga: {{ new Date(m.suspendedUntil).toLocaleDateString('id-ID') }}
                </div>
              </div>

              <!-- Member Stats & Actions -->
              <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div class="text-[11px] text-slate-500">
                  Total Pinjam: <strong class="text-slate-800">{{ m.totalBorrowed || 0 }}x</strong>
                </div>
                <div class="flex items-center gap-1.5">
                  <button 
                    @click="openEditMemberModal(m)"
                    class="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                  >
                    Edit
                  </button>
                  <button 
                    @click="openAdminResetMemberPassword(m)"
                    class="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition flex items-center gap-1"
                    title="Reset Sandi Anggota"
                  >
                    <KeyRound class="w-3 h-3" />
                    Reset Sandi
                  </button>
                  <button 
                    v-if="m.isSuspended"
                    @click="handleUnsuspend(m.id)"
                    class="px-2.5 py-1 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-semibold transition"
                  >
                    Buka Suspend
                  </button>
                  <button 
                    v-else-if="m.role !== 'admin'"
                    @click="promptQuickSuspend(m)"
                    class="px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition"
                  >
                    Suspend
                  </button>
                  <button 
                    v-if="m.role !== 'admin' && m.email !== 'azzackey@gmail.com'"
                    @click="handleDeleteMember(m.id, m.name)"
                    class="p-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                    title="Hapus Anggota"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop Table for Members -->
          <div class="hidden md:block overflow-x-auto rounded-2xl border border-slate-100">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100 font-bold">
                <tr>
                  <th class="py-3.5 px-4">Nama & Email</th>
                  <th class="py-3.5 px-4">No. Kartu</th>
                  <th class="py-3.5 px-4">Kontak / HP</th>
                  <th class="py-3.5 px-4">Peran</th>
                  <th class="py-3.5 px-4">Status</th>
                  <th class="py-3.5 px-4 text-center">Pinjaman</th>
                  <th class="py-3.5 px-4 text-right">Aksi Kelola</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="m in filteredMembers" :key="m.id" class="hover:bg-slate-50/80">
                  <td class="py-3 px-4 flex items-center gap-3">
                    <img :src="m.avatar" class="w-9 h-9 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0" alt="Avatar" />
                    <div>
                      <div class="font-bold text-slate-900 flex items-center gap-1.5">
                        {{ m.name }}
                        <span v-if="m.email === 'azzackey@gmail.com'" class="px-1.5 py-0.2 bg-blue-600 text-white text-[9px] font-bold rounded-full">SUPER ADMIN</span>
                      </div>
                      <div class="text-[11px] text-slate-400 font-sans">{{ m.email }}</div>
                    </div>
                  </td>
                  <td class="py-3 px-4 font-mono font-bold text-blue-600">{{ m.cardNumber }}</td>
                  <td class="py-3 px-4 font-mono text-slate-700">{{ m.phone }}</td>
                  <td class="py-3 px-4">
                    <span 
                      class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      :class="m.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'"
                    >
                      {{ m.role }}
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <span 
                      class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                      :class="m.isSuspended ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'"
                    >
                      {{ m.isSuspended ? 'Disuspend' : 'Aktif' }}
                    </span>
                    <div v-if="m.isSuspended" class="text-[10px] text-rose-600 max-w-xs truncate mt-0.5" :title="m.suspendReason">
                      {{ m.suspendReason }}
                    </div>
                  </td>
                  <td class="py-3 px-4 text-center font-bold text-slate-800">
                    {{ m.totalBorrowed || 0 }}x
                  </td>
                  <td class="py-3 px-4 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <button 
                        @click="openEditMemberModal(m)"
                        class="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
                      >
                        Edit
                      </button>
                      <button 
                        @click="openAdminResetMemberPassword(m)"
                        class="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition cursor-pointer flex items-center gap-1"
                        title="Reset Sandi Anggota"
                      >
                        <KeyRound class="w-3 h-3" />
                        Reset Sandi
                      </button>
                      <button 
                        v-if="m.isSuspended"
                        @click="handleUnsuspend(m.id)"
                        class="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer"
                      >
                        Aktifkan
                      </button>
                      <button 
                        v-else-if="m.role !== 'admin'"
                        @click="promptQuickSuspend(m)"
                        class="px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition cursor-pointer"
                      >
                        Suspend
                      </button>
                      <button 
                        v-if="m.role !== 'admin' && m.email !== 'azzackey@gmail.com'"
                        @click="handleDeleteMember(m.id, m.name)"
                        class="p-1.5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition cursor-pointer"
                        title="Hapus Anggota"
                      >
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredMembers.length === 0">
                  <td colspan="7" class="py-8 text-center text-slate-400 italic">
                    Tidak ada data anggota yang cocok dengan filter atau pencarian.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 4: Sistem Suspend Anggota (Customizable 1-30 Days) -->
        <div v-if="activeTab === 'suspends'" class="space-y-6">
          
          <!-- Custom Suspend Configuration Card (Admin Rules) -->
          <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Sliders class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-bold text-base text-slate-900">Kustomisasi Aturan Sanksi Suspend</h3>
                  <p class="text-xs text-slate-500">Atur durasi sanksi penangguhan (1 s/d 30 hari) kartu anggota saat terlambat.</p>
                </div>
              </div>
              <button 
                @click="saveSuspendConfig"
                class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs shadow-sm transition cursor-pointer"
              >
                Simpan Perubahan Aturan
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              <!-- Slider 1-30 Hari -->
              <div class="space-y-2 bg-white p-4 rounded-2xl border border-slate-200">
                <div class="flex justify-between text-xs">
                  <span class="font-semibold text-slate-700">Durasi Suspend Default</span>
                  <strong class="text-blue-600 font-mono text-sm">{{ suspendForm.defaultSuspendDays }} Hari</strong>
                </div>
                <input 
                  v-model.number="suspendForm.defaultSuspendDays" 
                  type="range" 
                  min="1" 
                  max="30" 
                  class="w-full accent-blue-600 cursor-pointer" 
                />
                <div class="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1 Hari</span>
                  <span>15 Hari</span>
                  <span>30 Hari</span>
                </div>
                <p class="text-[11px] text-slate-500">Anggota yang terlambat akan dikenakan suspend selama {{ suspendForm.defaultSuspendDays }} hari.</p>
              </div>

              <!-- Auto-Suspend Toggle -->
              <div class="space-y-2 bg-white p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <label class="block font-semibold text-slate-700 text-xs">Terapkan Auto-Suspend</label>
                  <p class="text-[11px] text-slate-500 mt-1">Otomatis suspend akun member saat terlambat mengembalikan buku.</p>
                </div>
                <label class="inline-flex items-center gap-2 cursor-pointer pt-2">
                  <input 
                    v-model="suspendForm.autoSuspendOnOverdue" 
                    type="checkbox" 
                    class="w-4 h-4 text-blue-600 rounded" 
                  />
                  <span class="text-xs font-semibold text-slate-800">Aktifkan Sanksi Otomatis</span>
                </label>
              </div>

            </div>
          </div>

          <!-- Suspended Members Management Table -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-sm text-slate-900">Daftar Anggota yang Sedang Disuspend</h4>
              <span class="text-xs text-rose-600 font-bold">{{ store.suspendedMembers.length }} Anggota Terkena Sanksi</span>
            </div>

            <div class="overflow-x-auto rounded-2xl border border-slate-100">
              <table class="w-full text-left text-xs text-slate-600">
                <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100 font-bold">
                  <tr>
                    <th class="py-3.5 px-4">Nama Anggota</th>
                    <th class="py-3.5 px-4">No. Kartu Member</th>
                    <th class="py-3.5 px-4">Alasan Suspend</th>
                    <th class="py-3.5 px-4">Berlaku Sampai</th>
                    <th class="py-3.5 px-4 text-right">Tindakan Admin</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="m in store.suspendedMembers" :key="m.id" class="hover:bg-slate-50/80">
                    <td class="py-3 px-4 flex items-center gap-2.5">
                      <img :src="m.avatar" class="w-8 h-8 rounded-full object-cover border border-rose-300" alt="Avatar" />
                      <div>
                        <span class="font-bold text-slate-900">{{ m.name }}</span>
                        <div class="text-[10px] text-slate-400">{{ m.email }}</div>
                      </div>
                    </td>
                    <td class="py-3 px-4 font-mono font-semibold text-slate-800">{{ m.cardNumber }}</td>
                    <td class="py-3 px-4 text-rose-600 font-medium max-w-xs">{{ m.suspendReason }}</td>
                    <td class="py-3 px-4 font-semibold text-slate-800">
                      {{ new Date(m.suspendedUntil || '').toLocaleDateString('id-ID') }}
                    </td>
                    <td class="py-3 px-4 text-right">
                      <button 
                        @click="handleUnsuspend(m.id)"
                        class="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
                      >
                        Cabut Suspend (Aktifkan)
                      </button>
                    </td>
                  </tr>
                  <tr v-if="store.suspendedMembers.length === 0">
                    <td colspan="5" class="py-6 text-center text-slate-400 italic">
                      Tidak ada anggota yang sedang dalam masa penangguhan (suspend).
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- Tab 4: Pusat Notifikasi Keterlambatan (Email/SMS Logs & Dispatch) -->
        <div v-if="activeTab === 'notifications'" class="space-y-6">
          
          <!-- Top Action Bar -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
            <div>
              <h3 class="font-bold text-base text-slate-900">Log & Pengiriman Notifikasi Keterlambatan</h3>
              <p class="text-xs text-slate-500">Pengingat otomatis dan manual melalui email dan SMS/WhatsApp.</p>
            </div>
            <button 
              @click="openNotifyModal(null)"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send class="w-3.5 h-3.5" />
              Kirim Notifikasi Manual
            </button>
          </div>

          <!-- Overdue borrowers waiting for notification -->
          <div v-if="store.overdueLoans.length > 0" class="p-4 rounded-2xl bg-rose-50 border border-rose-100 space-y-3">
            <div class="flex items-center justify-between text-xs text-rose-800 font-bold">
              <span class="flex items-center gap-1.5">
                <AlertTriangle class="w-4 h-4 text-rose-600" />
                {{ store.overdueLoans.length }} Anggota Menunggu Pengingat Keterlambatan
              </span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div 
                v-for="l in store.overdueLoans" 
                :key="l.id"
                class="p-3 bg-white rounded-xl border border-rose-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div class="font-bold text-slate-900">{{ l.memberName }}</div>
                  <div class="text-[10px] text-slate-500">Buku: "{{ l.bookTitle }}" (Telat {{ l.daysOverdue }}h)</div>
                </div>
                <button 
                  @click="openNotifyModal(l)"
                  class="px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shadow-sm"
                >
                  Kirim Notif
                </button>
              </div>
            </div>
          </div>

          <!-- Notification History (Mobile Cards & Desktop Table) -->
          <div class="space-y-2 md:hidden">
            <div 
              v-for="n in store.notifications" 
              :key="n.id"
              class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-900">{{ n.memberName }}</span>
                <span 
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" 
                  :class="n.type === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'"
                >
                  {{ n.type }}
                </span>
              </div>
              <p class="text-slate-600 leading-relaxed">{{ n.message }}</p>
              <div class="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200/60">
                <span>{{ new Date(n.sentAt).toLocaleString('id-ID') }}</span>
                <span class="text-emerald-700 font-bold font-sans">Terkirim</span>
              </div>
            </div>
          </div>

          <div class="hidden md:block overflow-x-auto rounded-2xl border border-slate-100">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100 font-bold">
                <tr>
                  <th class="py-3.5 px-4">Waktu</th>
                  <th class="py-3.5 px-4">Penerima</th>
                  <th class="py-3.5 px-4">Saluran</th>
                  <th class="py-3.5 px-4">Pesan</th>
                  <th class="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="n in store.notifications" :key="n.id" class="hover:bg-slate-50/80">
                  <td class="py-3 px-4 font-mono text-[10px] text-slate-500">
                    {{ new Date(n.sentAt).toLocaleString('id-ID') }}
                  </td>
                  <td class="py-3 px-4">
                    <div class="font-bold text-slate-900">{{ n.memberName }}</div>
                    <div class="text-[10px] text-slate-500 font-mono">{{ n.recipient }}</div>
                  </td>
                  <td class="py-3 px-4">
                    <span 
                      class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase" 
                      :class="n.type === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'"
                    >
                      {{ n.type }}
                    </span>
                  </td>
                  <td class="py-3 px-4 max-w-sm truncate text-slate-700" :title="n.message">
                    {{ n.message }}
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                      {{ n.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

        <!-- Tab 5: Master Data Buku -->
        <div v-if="activeTab === 'books'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xs sm:text-sm font-bold text-slate-900">Katalog Master Buku & Penempatan Rak</h3>
            <button 
              @click="openAddBookModal"
              class="px-3.5 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus class="w-4 h-4" />
              <span class="truncate">Tambah Buku</span>
            </button>
          </div>

          <!-- Mobile Cards for Master Books -->
          <div class="grid grid-cols-1 gap-3 md:hidden">
            <div 
              v-for="b in store.books" 
              :key="b.id"
              class="p-4 rounded-2xl bg-slate-50/60 border border-slate-200 space-y-3"
            >
              <div class="flex gap-3">
                <img :src="b.cover" class="w-14 h-20 object-cover rounded-xl shadow-sm shrink-0" alt="Cover" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-1">
                    <span 
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold truncate max-w-[120px]"
                      :style="{ backgroundColor: `${getCategoryColor(b.category)}18`, color: getCategoryColor(b.category) }"
                    >
                      {{ b.category }}
                    </span>
                    <span class="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono text-[10px] font-bold shrink-0">
                      {{ b.shelfCode }}
                    </span>
                  </div>
                  <h4 class="font-bold text-slate-900 text-sm mt-1 truncate">{{ b.title }}</h4>
                  <div class="text-[11px] text-slate-500 truncate">{{ b.author }} ({{ b.year }})</div>
                  <div class="text-xs font-semibold text-slate-700 mt-1">
                    Stok: <span class="text-emerald-600 font-bold">{{ b.availableCopies }}</span> / {{ b.totalCopies }} Buku
                  </div>
                </div>
              </div>

              <div class="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span class="font-mono text-[10px] text-slate-400">{{ b.barcode }}</span>
                <div class="flex items-center gap-1.5">
                  <button 
                    @click="openEditBookModal(b)"
                    class="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold transition active:scale-95"
                  >
                    Edit
                  </button>
                  <button 
                    @click="handleDeleteBook(b.id)"
                    class="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold transition active:scale-95"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop Table for Master Books -->
          <div class="hidden md:block overflow-x-auto rounded-2xl border border-slate-100">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100 font-bold">
                <tr>
                  <th class="py-3.5 px-4">Cover & Judul</th>
                  <th class="py-3.5 px-4">Kategori</th>
                  <th class="py-3.5 px-4">Lokasi Rak</th>
                  <th class="py-3.5 px-4">Stok (Tersedia / Total)</th>
                  <th class="py-3.5 px-4">Barcode</th>
                  <th class="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="b in store.books" :key="b.id" class="hover:bg-slate-50/80">
                  <td class="py-3 px-4 flex items-center gap-3">
                    <img :src="b.cover" class="w-10 h-14 object-cover rounded-lg shadow-sm" alt="Cover" />
                    <div>
                      <div class="font-bold text-slate-900">{{ b.title }}</div>
                      <div class="text-[10px] text-slate-400">{{ b.author }} • {{ b.publisher }} ({{ b.year }})</div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <span 
                      class="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                      :style="{ 
                        backgroundColor: `${getCategoryColor(b.category)}18`, 
                        color: getCategoryColor(b.category) 
                      }"
                    >
                      {{ b.category }}
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                      {{ b.shelfCode }}
                    </span>
                  </td>
                  <td class="py-3 px-4 font-semibold text-slate-700">
                    <span class="text-emerald-600 font-bold">{{ b.availableCopies }}</span> / {{ b.totalCopies }} Buku
                  </td>
                  <td class="py-3 px-4 font-mono text-slate-500 text-[11px]">{{ b.barcode }}</td>
                  <td class="py-3 px-4 text-right space-x-1">
                    <button 
                      @click="openEditBookModal(b)"
                      class="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition cursor-pointer"
                    >
                      <Pencil class="w-3.5 h-3.5" />
                    </button>
                    <button 
                      @click="handleDeleteBook(b.id)"
                      class="p-2 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-xs transition cursor-pointer"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 6: Pengelolaan Kategori Buku -->
        <div v-if="activeTab === 'categories'" class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="text-sm font-bold text-slate-900">Pengelolaan Taksonomi & Kategori Buku</h3>
              <p class="text-xs text-slate-500 mt-0.5">Tambah, ubah nama, deskripsi, serta palet warna kategori untuk pengelompokan buku.</p>
            </div>
            <button 
              @click="openAddCategoryModal"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus class="w-4 h-4" />
              Tambah Kategori Baru
            </button>
          </div>

          <!-- Categories Bento Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="cat in store.categories" 
              :key="cat.id"
              class="bg-white p-5 rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2.5">
                    <div 
                      class="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold shadow-sm shrink-0"
                      :style="{ backgroundColor: cat.color || '#3b82f6' }"
                    >
                      <Tag class="w-4 h-4" />
                    </div>
                    <h4 class="font-bold text-sm text-slate-900 line-clamp-1">{{ cat.name }}</h4>
                  </div>

                  <span 
                    class="text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
                    :style="{ backgroundColor: `${cat.color || '#3b82f6'}15`, color: cat.color || '#3b82f6' }"
                  >
                    {{ getBooksCountByCategory(cat.name) }} Buku
                  </span>
                </div>

                <p class="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                  {{ cat.description || 'Belum ada deskripsi untuk kategori ini.' }}
                </p>
              </div>

              <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span class="text-[10px] font-mono text-slate-400 font-bold uppercase">{{ cat.id }}</span>
                <div class="flex items-center gap-1">
                  <button 
                    @click="openEditCategoryModal(cat)"
                    class="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    title="Edit Kategori"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                  <button 
                    @click="handleDeleteCategory(cat.id, cat.name)"
                    class="p-1.5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition cursor-pointer"
                    title="Hapus Kategori"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- Modals -->
    <DirectLoanModal 
      :is-open="isDirectLoanOpen"
      @close="isDirectLoanOpen = false"
    />

    <ReturnBookModal 
      :is-open="isReturnOpen"
      :selected-loan="selectedLoanForReturn"
      @close="isReturnOpen = false"
    />

    <NotificationModal 
      :is-open="isNotifyOpen"
      :preselected-loan="selectedLoanForNotify"
      @close="isNotifyOpen = false"
    />

    <BookFormModal 
      :is-open="isBookFormOpen"
      :book="selectedBookForEdit"
      @close="isBookFormOpen = false"
    />

    <CategoryFormModal 
      :is-open="isCategoryModalOpen"
      :category="selectedCategoryForEdit"
      @close="isCategoryModalOpen = false"
    />

    <MemberFormModal 
      :is-open="isMemberFormOpen"
      :member="selectedMemberForEdit"
      @close="isMemberFormOpen = false"
    />

    <!-- Admin Self Change Password Modal -->
    <ChangePasswordModal 
      :is-open="isChangeAdminPasswordOpen"
      @close="isChangeAdminPasswordOpen = false"
    />

    <!-- Admin Direct Reset Member Password Modal -->
    <div v-if="isResetMemberPasswordOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div class="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
              <KeyRound class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-extrabold text-sm sm:text-base">Reset Kata Sandi Anggota</h3>
              <p class="text-[11px] text-slate-400">Tetapkan kata sandi baru untuk akun anggota</p>
            </div>
          </div>
          <button 
            @click="isResetMemberPasswordOpen = false"
            class="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleAdminResetPasswordSubmit" class="p-6 space-y-4 text-xs">
          <div v-if="selectedMemberForPasswordReset" class="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <img :src="selectedMemberForPasswordReset.avatar" class="w-10 h-10 rounded-full object-cover border border-slate-200" alt="Avatar" />
            <div>
              <div class="font-bold text-slate-900">{{ selectedMemberForPasswordReset.name }}</div>
              <div class="text-[11px] font-mono text-blue-600 font-bold">{{ selectedMemberForPasswordReset.cardNumber }}</div>
              <div class="text-[10px] text-slate-400">{{ selectedMemberForPasswordReset.email }}</div>
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Kata Sandi Baru *</label>
            <div class="relative">
              <input 
                v-model="adminResetPasswordInput"
                :type="showResetPass ? 'text' : 'password'"
                required
                minlength="4"
                placeholder="Minimal 4 karakter (Contoh: 123456 atau member123)"
                class="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs"
              />
              <KeyRound class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button 
                type="button" 
                @click="showResetPass = !showResetPass"
                class="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <Eye v-if="!showResetPass" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
            <div class="text-[10px] text-slate-400 mt-1">Kata sandi baru akan langsung berlaku untuk login anggota ini.</div>
          </div>

          <div class="pt-2 flex gap-2.5">
            <button 
              type="button"
              @click="isResetMemberPasswordOpen = false"
              class="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit"
              :disabled="isResettingPassword"
              class="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md shadow-blue-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Check class="w-4 h-4" />
              <span>{{ isResettingPassword ? 'Menyimpan...' : 'Perbarui Kata Sandi' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useLibraryStore } from '../stores/library.js';
import type { Loan, Book, BookCategory, Member } from '../types.js';
import DirectLoanModal from '../components/DirectLoanModal.vue';
import ReturnBookModal from '../components/ReturnBookModal.vue';
import NotificationModal from '../components/NotificationModal.vue';
import BookFormModal from '../components/BookFormModal.vue';
import CategoryFormModal from '../components/CategoryFormModal.vue';
import MemberFormModal from '../components/MemberFormModal.vue';
import ChangePasswordModal from '../components/ChangePasswordModal.vue';
import { 
  ShieldCheck, BookPlus, CheckCircle2, BookOpen, CheckCircle, 
  BookMarked, Clock, AlertTriangle, UserX, Sliders, Send, 
  Plus, Pencil, Trash2, Tag, Users, UserPlus, LogIn, KeyRound, X, Eye, EyeOff, Check, RefreshCw 
} from 'lucide-vue-next';

const store = useLibraryStore();
const activeTab = ref('loans');
const loanSearch = ref('');
const memberFilter = ref('all');
const now = ref(Date.now());
let timerInterval: any = null;

// Modals state
const isSyncingFirestore = ref(false);
const isDirectLoanOpen = ref(false);
const isReturnOpen = ref(false);
const selectedLoanForReturn = ref<Loan | null>(null);

const isNotifyOpen = ref(false);
const selectedLoanForNotify = ref<Loan | null>(null);

const isBookFormOpen = ref(false);
const selectedBookForEdit = ref<Book | null>(null);

const isCategoryModalOpen = ref(false);
const selectedCategoryForEdit = ref<BookCategory | null>(null);

const isMemberFormOpen = ref(false);
const selectedMemberForEdit = ref<Member | null>(null);

// Password Management State
const isChangeAdminPasswordOpen = ref(false);
const isResetMemberPasswordOpen = ref(false);
const selectedMemberForPasswordReset = ref<Member | null>(null);
const adminResetPasswordInput = ref('');
const showResetPass = ref(false);
const isResettingPassword = ref(false);

// Suspend Configuration Form State
const suspendForm = ref({
  defaultSuspendDays: 7,
  autoSuspendOnOverdue: true
});

onMounted(() => {
  if (store.suspendConfig) {
    suspendForm.value = {
      defaultSuspendDays: store.suspendConfig.defaultSuspendDays,
      autoSuspendOnOverdue: store.suspendConfig.autoSuspendOnOverdue
    };
  }

  timerInterval = setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval);
});

const adminTabs = computed(() => [
  { id: 'loans', label: 'Sirkulasi & Peminjaman Aktif', icon: BookMarked, badge: store.activeLoans.length },
  { id: 'bookings', label: 'Booking 24h (Hold)', icon: Clock, badge: store.activeHoldBookings.length },
  { id: 'members', label: 'Kelola Anggota', icon: Users, badge: store.members.length },
  { id: 'suspends', label: 'Sistem Suspend (1-30 Hari)', icon: Sliders, badge: store.suspendedMembers.length },
  { id: 'notifications', label: 'Notifikasi Keterlambatan', icon: Send, badge: store.overdueLoans.length },
  { id: 'books', label: 'Master Data Buku', icon: BookOpen, badge: store.books.length },
  { id: 'categories', label: 'Pengelolaan Kategori', icon: Tag, badge: store.categories.length }
]);

const getCategoryColor = (categoryName: string) => {
  const cat = store.categories.find(c => c.name === categoryName);
  return cat?.color || '#3b82f6';
};

const getBooksCountByCategory = (categoryName: string) => {
  return store.books.filter(b => b.category === categoryName).length;
};

const openAddCategoryModal = () => {
  selectedCategoryForEdit.value = null;
  isCategoryModalOpen.value = true;
};

const openEditCategoryModal = (cat: BookCategory) => {
  selectedCategoryForEdit.value = cat;
  isCategoryModalOpen.value = true;
};

const handleDeleteCategory = async (catId: string, catName: string) => {
  if (confirm(`Apakah Anda yakin ingin menghapus kategori "${catName}"? Buku terkait akan otomatis dialihkan ke kategori default.`)) {
    await store.deleteCategory(catId);
  }
};

const filteredMembers = computed(() => {
  let list = store.members;
  if (memberFilter.value === 'active') {
    list = list.filter(m => !m.isSuspended);
  } else if (memberFilter.value === 'suspended') {
    list = list.filter(m => m.isSuspended);
  } else if (memberFilter.value === 'admin') {
    list = list.filter(m => m.role === 'admin');
  }

  if (loanSearch.value.trim() && activeTab.value === 'members') {
    const q = loanSearch.value.toLowerCase().trim();
    list = list.filter(m => 
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.cardNumber.toLowerCase().includes(q) ||
      m.phone.includes(q)
    );
  }
  return list;
});

const openAddMemberModal = () => {
  selectedMemberForEdit.value = null;
  isMemberFormOpen.value = true;
};

const openEditMemberModal = (member: Member) => {
  selectedMemberForEdit.value = member;
  isMemberFormOpen.value = true;
};

const handleDeleteMember = async (memberId: string, memberName: string) => {
  if (confirm(`Apakah Anda yakin ingin menghapus anggota "${memberName}" dari database perpustakaan?`)) {
    await store.deleteMember(memberId);
  }
};

const promptQuickSuspend = async (member: Member) => {
  const reason = prompt(`Masukkan alasan penangguhan sanksi (suspend) untuk ${member.name}:`, 'Pelanggaran aturan / telat peminjaman');
  if (reason) {
    await store.toggleMemberSuspend(member.id, true, reason, store.suspendConfig?.defaultSuspendDays || 7);
  }
};

const filteredLoans = computed(() => {
  let list = store.loans.filter(l => l.status === 'active' || l.status === 'overdue');
  if (loanSearch.value.trim() && activeTab.value === 'loans') {
    const q = loanSearch.value.toLowerCase().trim();
    list = list.filter(l => 
      l.id.toLowerCase().includes(q) ||
      l.bookTitle.toLowerCase().includes(q) ||
      l.memberName.toLowerCase().includes(q) ||
      l.memberCardNumber.toLowerCase().includes(q)
    );
  }
  return list;
});

const formatCountdown = (expiresAtStr: string) => {
  const expiry = new Date(expiresAtStr).getTime();
  const diff = expiry - now.value;

  if (diff <= 0) return '00:00:00 (Kadaluarsa)';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const openDirectLoanModal = () => {
  isDirectLoanOpen.value = true;
};

const openReturnModal = (loan: Loan | null) => {
  selectedLoanForReturn.value = loan;
  isReturnOpen.value = true;
};

const openNotifyModal = (loan: Loan | null) => {
  selectedLoanForNotify.value = loan;
  isNotifyOpen.value = true;
};

const openAddBookModal = () => {
  selectedBookForEdit.value = null;
  isBookFormOpen.value = true;
};

const openEditBookModal = (book: Book) => {
  selectedBookForEdit.value = book;
  isBookFormOpen.value = true;
};

const handleDeleteBook = async (bookId: string) => {
  if (confirm('Apakah Anda yakin ingin menghapus buku ini dari sistem perpustakaan?')) {
    await store.deleteBook(bookId);
  }
};

const handleCancelBooking = async (bookingId: string) => {
  if (confirm('Batalkan booking ini dan kembalikan stok buku ke rak?')) {
    await store.cancelBooking(bookingId);
  }
};

const handleCollectBooking = async (bookingId: string) => {
  await store.collectBooking(bookingId, 'Admin Sirkulasi');
};

const saveSuspendConfig = async () => {
  await store.updateSuspendConfig(suspendForm.value);
};

const handleUnsuspend = async (memberId: string) => {
  if (confirm('Cabut sanksi suspend dan aktifkan kembali kartu member ini?')) {
    await store.toggleMemberSuspend(memberId, false);
  }
};

const isDownloadingOffline = ref(false);

const handleDownloadOffline = async () => {
  isDownloadingOffline.value = true;
  try {
    await store.downloadForOffline();
  } finally {
    isDownloadingOffline.value = false;
  }
};

const openAdminResetMemberPassword = (member: Member) => {
  selectedMemberForPasswordReset.value = member;
  adminResetPasswordInput.value = '';
  showResetPass.value = false;
  isResetMemberPasswordOpen.value = true;
};

const handleAdminResetPasswordSubmit = async () => {
  if (!selectedMemberForPasswordReset.value || !adminResetPasswordInput.value) return;

  if (adminResetPasswordInput.value.length < 4) {
    store.setError('Kata sandi baru minimal 4 karakter');
    return;
  }

  isResettingPassword.value = true;
  try {
    const res = await store.adminResetMemberPassword(
      selectedMemberForPasswordReset.value.id,
      adminResetPasswordInput.value
    );
    if (res.success) {
      isResetMemberPasswordOpen.value = false;
      selectedMemberForPasswordReset.value = null;
      adminResetPasswordInput.value = '';
    }
  } finally {
    isResettingPassword.value = false;
  }
};
</script>


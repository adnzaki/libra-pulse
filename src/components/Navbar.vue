<template>
  <header 
    ref="navHeaderRef"
    class="sticky top-0 z-50 transition-colors duration-200"
  >
    <!-- Background layer with Backdrop Blur (Only for the 64px navbar, does not wrap floating dropdowns) -->
    <div 
      class="nav-header-bg absolute inset-0 h-16 pointer-events-none transition-all duration-200"
      :class="{
        'bg-white/95 border-b border-slate-200/90 shadow-xs backdrop-blur-md': store.currentTheme === 'light',
        'bg-[#0e1422]/95 border-b border-slate-800 shadow-md backdrop-blur-md': store.currentTheme === 'dark',
        'bg-[#070d1e]/85 border-b border-blue-500/25 shadow-lg backdrop-blur-xl': store.currentTheme === 'elegant'
      }"
    ></div>

    <div class="relative z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        
        <!-- Brand / Logo -->
        <div class="flex items-center gap-3">
          <router-link to="/" class="flex items-center gap-2.5 group">
            <div class="w-9 h-9 rounded-xl overflow-hidden group-hover:scale-105 transition duration-200 flex items-center justify-center" :class="store.currentTheme === 'light' ? 'bg-blue-50' : 'bg-slate-900'">
              <img :src="'/pwa-192x192.png'" alt="Libra Logo" class="w-full h-full object-cover" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-xl tracking-tight transition" :class="store.currentTheme === 'light' ? 'text-slate-900 group-hover:text-blue-600' : 'text-white group-hover:text-blue-400'">Libra</span>
              </div>
            </div>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-1.5">
          <router-link 
            to="/" 
            class="px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2"
            :class="$route.name === 'catalog' 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' 
              : (store.currentTheme === 'light' ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-slate-800/80')"
          >
            <BookMarked class="w-4 h-4" />
            Katalog
          </router-link>

          <router-link 
            to="/shelves" 
            class="px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2"
            :class="$route.name === 'shelves' 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' 
              : (store.currentTheme === 'light' ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-slate-800/80')"
          >
            <Layers class="w-4 h-4" />
            Rak
          </router-link>

          <router-link 
            to="/member-card" 
            class="px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2"
            :class="$route.name === 'member-card' 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' 
              : (store.currentTheme === 'light' ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-slate-800/80')"
          >
            <QrCode class="w-4 h-4" />
            Kartu Member
          </router-link>

          <router-link 
            v-if="store.currentUser"
            to="/member-portal" 
            class="px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 relative"
            :class="$route.name === 'member-portal' 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' 
              : (store.currentTheme === 'light' ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-slate-800/80')"
          >
            <UserCheck class="w-4 h-4" />
            Portal Saya
            <span v-if="store.myActiveLoans.length" class="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-400 text-slate-950 font-bold">
              {{ store.myActiveLoans.length }}
            </span>
            <span v-if="store.currentUser.isSuspended" class="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute -top-0.5 -right-0.5"></span>
          </router-link>

          <router-link 
            v-if="store.isAdmin"
            to="/admin" 
            class="px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 relative"
            :class="$route.name === 'admin' 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' 
              : (store.currentTheme === 'light' ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-slate-800/80')"
          >
            <ShieldCheck class="w-4 h-4 text-blue-400" />
            Admin Panel
            <span v-if="store.pendingStudentVerificationsCount > 0" class="px-1.5 py-0.2 text-[10px] rounded-full bg-blue-500 text-white font-bold animate-pulse flex items-center gap-0.5" title="Permohonan Verifikasi Siswa Menunggu Konfirmasi">
              <span>🎒</span> {{ store.pendingStudentVerificationsCount }}
            </span>
            <span v-else-if="store.pendingTeacherRequestsCount > 0" class="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-500 text-white font-bold animate-pulse flex items-center gap-0.5" title="Permintaan Verifikasi Guru Menunggu Konfirmasi">
              <span>👨‍🏫</span> {{ store.pendingTeacherRequestsCount }}
            </span>
            <span v-else-if="store.overdueLoans.length" class="px-1.5 py-0.2 text-[10px] rounded-full bg-rose-500 text-white font-bold animate-pulse">
              {{ store.overdueLoans.length }} Telat
            </span>
          </router-link>
        </nav>

        <!-- Right Side: Scanner Ready Pill & Role Switcher -->
        <div class="flex items-center gap-3">
          
          <!-- Scanner Status Pill Indicator -->
          <!-- <router-link 
            to="/member-card"
            class="hidden sm:flex items-center gap-2.5 bg-slate-800/80 hover:bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-700/80 transition"
          >
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-300">Scanner Ready</span>
            <div class="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
          </router-link> -->

            <!-- User Auth Dropdown -->
            <div class="relative" ref="userDropdownRef">
              <button 
                type="button"
                @click.stop="toggleUserMenu"
                class="flex items-center gap-2.5 px-3 py-1.5 min-h-[40px] rounded-xl border text-xs transition cursor-pointer select-none touch-manipulation active:scale-95"
                :class="store.currentTheme === 'light' 
                  ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700' 
                  : (store.currentTheme === 'elegant' 
                    ? 'bg-blue-950/60 hover:bg-blue-900/70 border-blue-400/40 text-white backdrop-blur-md shadow-xs ring-1 ring-blue-400/20' 
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200')"
                aria-label="Menu akun pengguna"
              >
                <template v-if="store.currentUser">
                  <img 
                    :src="store.currentUser.avatar" 
                    @error="(e) => (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(store.currentUser?.cardNumber || 'user')"
                    class="w-6 h-6 rounded-full object-cover border border-blue-400 shrink-0" 
                    alt="" 
                  />
                  <div class="text-left hidden lg:block">
                    <div class="font-semibold flex items-center gap-1.5" :class="store.currentTheme === 'light' ? 'text-slate-900' : 'text-white'">
                      {{ store.currentUser.name }}
                      <span v-if="store.currentUser.role === 'admin'" class="text-[9px] px-1.5 py-0.2 bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30 rounded-full font-bold">ADMIN</span>
                      <span v-else-if="store.currentUser.isSuspended" class="text-[9px] px-1.5 py-0.2 bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 rounded-full font-bold">SUSPEND</span>
                    </div>
                    <div class="text-[10px] text-blue-500 font-mono font-medium">{{ store.currentUser.cardNumber }}</div>
                  </div>
                </template>
                <template v-else>
                  <User class="w-4 h-4" :class="store.currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'" />
                  <span class="font-medium hidden lg:inline" :class="store.currentTheme === 'light' ? 'text-slate-700' : 'text-slate-300'">Masuk / Akun</span>
                </template>
                <ChevronDown class="w-3.5 h-3.5" :class="store.currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'" />
              </button>

              <!-- Dropdown Options -->
              <div 
                v-if="isUserMenuOpen" 
                class="account-dropdown-menu absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl py-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150 border transition-all"
                :class="{
                  'bg-white text-slate-800 border-slate-200 shadow-xl': store.currentTheme === 'light',
                  'bg-[#0e1422] text-slate-200 border-slate-800 shadow-2xl': store.currentTheme === 'dark',
                  'bg-[#0b142c]/80 text-slate-100 border-blue-400/40 shadow-2xl backdrop-blur-2xl ring-1 ring-blue-400/25': store.currentTheme === 'elegant'
                }"
                @click="isUserMenuOpen = false"
              >
                <!-- If Logged In -->
                <div 
                  v-if="store.currentUser" 
                  class="dropdown-subpanel px-3.5 py-2.5 rounded-t-xl transition-colors border-0"
                  :class="{
                    'bg-slate-50 text-slate-800': store.currentTheme === 'light',
                    'bg-slate-800/40 text-white': store.currentTheme === 'dark',
                    'bg-blue-950/45 text-white backdrop-blur-md': store.currentTheme === 'elegant'
                  }"
                >
                  <div class="flex items-center gap-2.5">
                    <img 
                      :src="store.currentUser.avatar" 
                      @error="(e) => (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(store.currentUser?.cardNumber || 'user')"
                      class="w-9 h-9 rounded-full object-cover border-2 border-blue-500 shrink-0" 
                      alt="" 
                    />
                    <div class="overflow-hidden">
                      <div class="font-bold text-xs truncate" :class="store.currentTheme === 'light' ? 'text-slate-900' : 'text-white'">{{ store.currentUser.name }}</div>
                      <div class="text-[10px] truncate" :class="store.currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'">{{ store.currentUser.email || store.currentUser.phone }}</div>
                      <div class="text-[10px] text-blue-500 font-mono font-semibold">{{ store.currentUser.cardNumber }}</div>
                    </div>
                  </div>
                </div>

                <!-- Admin Controls if Admin -->
                <div v-if="store.isAdmin" class="p-1 space-y-1">
                  <router-link 
                    to="/admin" 
                    class="w-full text-left px-3.5 py-2 rounded-xl flex items-center gap-2.5 font-semibold transition"
                    :class="store.currentTheme === 'light' ? 'text-blue-700 hover:bg-blue-50' : 'text-blue-300 hover:bg-slate-800'"
                  >
                    <ShieldCheck class="w-4 h-4 text-blue-500" />
                    Admin Console Hub
                  </router-link>
                  <router-link 
                    to="/shelves" 
                    class="w-full text-left px-3.5 py-2 rounded-xl flex items-center gap-2.5 transition"
                    :class="store.currentTheme === 'light' ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800'"
                  >
                    <Layers class="w-4 h-4" :class="store.currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'" />
                    Kelola Rak & Koleksi
                  </router-link>
                  <router-link 
                    v-if="store.isSuperAdmin"
                    to="/settings" 
                    class="w-full text-left px-3.5 py-2 rounded-xl flex items-center gap-2.5 transition"
                    :class="store.currentTheme === 'light' ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800'"
                  >
                    <Settings class="w-4 h-4" :class="store.currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'" />
                    Pengaturan & Database
                  </router-link>
                </div>

                <!-- Member Controls if Member -->
                <div v-else-if="store.currentUser" class="p-1 space-y-1">
                  <router-link 
                    to="/member-portal" 
                    class="w-full text-left px-3.5 py-2 rounded-xl flex items-center gap-2.5 transition"
                    :class="store.currentTheme === 'light' ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800'"
                  >
                    <UserCheck class="w-4 h-4 text-emerald-500" />
                    Portal Pinjaman Saya
                  </router-link>
                  <router-link 
                    to="/member-card" 
                    class="w-full text-left px-3.5 py-2 rounded-xl flex items-center gap-2.5 transition"
                    :class="store.currentTheme === 'light' ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800'"
                  >
                    <QrCode class="w-4 h-4 text-blue-500" />
                    Kartu Digital Member QR
                  </router-link>
                </div>

                <!-- Device Session Management for all logged in users -->
                <div v-if="store.currentUser" class="p-1 border-0">
                  <button 
                    type="button"
                    @click="isUserMenuOpen = false; isDeviceModalOpen = true"
                    class="seamless-menu-item w-full text-left px-3.5 py-2 rounded-xl flex items-center justify-between transition text-xs font-semibold cursor-pointer border-0 shadow-none focus:outline-hidden"
                    :class="store.currentTheme === 'light' ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800'"
                  >
                    <div class="flex items-center gap-2.5">
                      <Laptop class="w-4 h-4 text-cyan-500" />
                      <span>Manajemen Sesi & Perangkat</span>
                    </div>
                    <span v-if="store.isCurrentDeviceMain" class="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[10px] font-bold">
                      👑 Utama
                    </span>
                  </button>
                </div>

                <!-- PWA Install Guide Item -->
                <div class="p-1 border-0">
                  <button 
                    type="button"
                    @click="triggerPwaInstall"
                    class="seamless-menu-item w-full text-left px-3.5 py-2 rounded-xl flex items-center justify-between transition text-xs font-semibold cursor-pointer border-0 shadow-none focus:outline-hidden"
                    :class="store.currentTheme === 'light' ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800'"
                  >
                    <div class="flex items-center gap-2.5">
                      <Smartphone class="w-4 h-4 text-emerald-500" />
                      <span>Pasang Aplikasi (PWA)</span>
                    </div>
                    <span class="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[10px] font-bold">
                      App
                    </span>
                  </button>
                </div>

                <!-- Changelog Menu Item for All Users -->
                <div class="p-1 border-0">
                  <button 
                    type="button"
                    @click="isUserMenuOpen = false; store.openChangelog()"
                    class="seamless-menu-item w-full text-left px-3.5 py-2 rounded-xl flex items-center justify-between transition text-xs font-semibold cursor-pointer border-0 shadow-none focus:outline-hidden"
                    :class="store.currentTheme === 'light' ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800'"
                  >
                    <div class="flex items-center gap-2.5">
                      <Sparkles class="w-4 h-4 text-amber-500" />
                      <span>Catatan Rilis</span>
                    </div>
                    <span class="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 text-[10px] font-mono font-bold">
                      v{{ store.currentAppVersion }}
                    </span>
                  </button>
                </div>

                <!-- Theme Mode Selector Section -->
                <div class="p-2 border-0" @click.stop>
                  <div class="px-1.5 pb-2 flex items-center justify-between text-[11px] font-medium" :class="store.currentTheme === 'light' ? 'text-slate-600' : 'text-slate-300'">
                    <div class="flex items-center gap-1.5">
                      <Palette class="w-3.5 h-3.5 text-blue-500" />
                      <span>Warna Tema</span>
                    </div>
                    <span class="text-[10px] font-bold text-blue-500 uppercase tracking-wide">
                      {{ store.currentTheme === 'light' ? 'Terang' : (store.currentTheme === 'dark' ? 'Gelap' : 'Elegan') }}
                    </span>
                  </div>

                  <div 
                    class="theme-selector-box grid grid-cols-3 gap-1 p-1 rounded-xl border transition-colors"
                    :class="{
                      'bg-slate-100 border-slate-200': store.currentTheme === 'light',
                      'bg-slate-950/80 border-slate-800': store.currentTheme === 'dark',
                      'bg-slate-950/60 border-blue-500/20 backdrop-blur-md': store.currentTheme === 'elegant'
                    }"
                  >
                    <!-- Light Option -->
                    <button
                      type="button"
                      @click="store.setTheme('light')"
                      class="flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer select-none"
                      :class="store.currentTheme === 'light' 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : (store.currentTheme === 'light' ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60')"
                      title="Light: Tema terang default"
                    >
                      <Sun class="w-3.5 h-3.5" :class="store.currentTheme === 'light' ? 'text-amber-300' : 'text-slate-400'" />
                      <span>Light</span>
                    </button>

                    <!-- Dark Option -->
                    <button
                      type="button"
                      @click="store.setTheme('dark')"
                      class="flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer select-none"
                      :class="store.currentTheme === 'dark' 
                        ? 'bg-slate-800 text-white shadow-xs ring-1 ring-slate-600' 
                        : (store.currentTheme === 'light' ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60')"
                      title="Dark: Tema gelap untuk kondisi minim cahaya"
                    >
                      <Moon class="w-3.5 h-3.5" :class="store.currentTheme === 'dark' ? 'text-blue-300' : 'text-slate-400'" />
                      <span>Dark</span>
                    </button>

                    <!-- Elegant Option -->
                    <button
                      type="button"
                      @click="store.setTheme('elegant')"
                      class="flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer relative overflow-hidden select-none"
                      :class="store.currentTheme === 'elegant' 
                        ? 'bg-gradient-to-br from-blue-700 via-indigo-600 to-cyan-600 text-white shadow-xs ring-1 ring-cyan-400/50' 
                        : (store.currentTheme === 'light' ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60')"
                      title="Elegant: Semi gelap dengan efek blur transparan ala Windows 11"
                    >
                      <Sparkles class="w-3.5 h-3.5" :class="store.currentTheme === 'elegant' ? 'text-cyan-200 animate-pulse' : 'text-slate-400'" />
                      <span>Elegant</span>
                    </button>
                  </div>
                </div>

                <!-- If Guest / Not Logged In -->
                <div 
                  v-if="!store.currentUser" 
                  class="p-2 space-y-1.5 border-0"
                >
                  <div class="px-2 py-1 text-[10px] uppercase font-bold tracking-wider" :class="store.currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'">
                    Akses Masuk Autentikasi
                  </div>

                  <!-- Standard Login Link -->
                  <router-link 
                    to="/login"
                    class="w-full text-left px-3 py-2.5 hover:bg-blue-600 bg-blue-600/90 text-white rounded-xl flex items-center gap-2.5 transition font-bold"
                  >
                    <LogIn class="w-4 h-4" />
                    <span>Masuk / Login Akun</span>
                  </router-link>

                  <!-- Admin Login Link -->
                  <router-link 
                    to="/login?mode=admin"
                    class="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 transition font-medium border"
                    :class="store.currentTheme === 'light' 
                      ? 'border-slate-200 hover:bg-slate-100 text-slate-700' 
                      : 'border-slate-700/60 hover:bg-slate-800 text-slate-300'"
                  >
                    <ShieldCheck class="w-4 h-4 text-blue-500" />
                    <span>Login Administrator</span>
                  </router-link>

                  <!-- Register Link -->
                  <router-link 
                    to="/login?mode=register"
                    class="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 transition text-[11px]"
                    :class="store.currentTheme === 'light' 
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'"
                  >
                    <UserPlus class="w-4 h-4" :class="store.currentTheme === 'light' ? 'text-slate-500' : 'text-slate-400'" />
                    <span>Daftar Anggota Baru</span>
                  </router-link>
                </div>

                <!-- Logout / Switch to Public Mode Button -->
                <div 
                  v-if="store.currentUser" 
                  class="pt-1 px-1 border-0"
                >
                  <button 
                    type="button"
                    @click="handleLogoutClick"
                    class="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 transition cursor-pointer font-semibold"
                    :class="store.currentTheme === 'light' ? 'hover:bg-rose-50 text-rose-600' : 'hover:bg-rose-950/40 text-rose-300'"
                  >
                    <LogOut class="w-4 h-4 text-rose-500" />
                    Keluar / Logout
                  </button>
                </div>

              </div>
            </div>

          <!-- Mobile Hamburger Toggle (Immediate responsiveness on touch) -->
          <button 
            ref="mobileMenuBtnRef"
            type="button"
            @click.stop="toggleMobileMenu"
            class="md:hidden w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl transition cursor-pointer select-none touch-manipulation active:scale-90 flex items-center justify-center shrink-0 border"
            :class="store.currentTheme === 'light' 
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' 
              : (store.currentTheme === 'elegant' 
                ? 'bg-blue-950/40 hover:bg-blue-900/50 border-blue-400/30 text-white backdrop-blur-md shadow-xs' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700')"
            aria-label="Menu navigasi mobile"
          >
            <Menu v-if="!isMobileMenuOpen" class="w-5 h-5 pointer-events-none shrink-0" />
            <X v-else class="w-5 h-5 pointer-events-none shrink-0" />
          </button>
        </div>

      </div>
    </div>



    <!-- Backdrop for Mobile Drawer -->
    <div 
      v-if="isMobileMenuOpen" 
      class="md:hidden fixed inset-0 top-16 bg-slate-950/40 backdrop-blur-xs z-30 transition-opacity"
      @click="isMobileMenuOpen = false"
    ></div>

    <!-- Mobile Nav Drawer -->
    <div 
      v-if="isMobileMenuOpen" 
      ref="mobileDrawerRef"
      class="mobile-nav-drawer md:hidden relative z-40 px-4 pt-2 pb-4 space-y-2 border-b transition-colors shadow-xl"
      :class="{
        'bg-white border-slate-200 text-slate-800': store.currentTheme === 'light',
        'bg-[#0e1422] border-slate-800 text-slate-200': store.currentTheme === 'dark',
        'bg-[#070d1e]/95 border-blue-500/25 text-slate-200 backdrop-blur-2xl': store.currentTheme === 'elegant'
      }"
    >
      <router-link 
        to="/" 
        @click="isMobileMenuOpen = false"
        class="block px-3.5 py-2.5 rounded-xl text-xs transition font-semibold"
        :class="$route.name === 'catalog' 
          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25' 
          : (store.currentTheme === 'light' ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800')"
      >
        📖 Katalog Publik
      </router-link>
      <router-link 
        to="/shelves" 
        @click="isMobileMenuOpen = false"
        class="block px-3.5 py-2.5 rounded-xl text-xs transition font-semibold"
        :class="$route.name === 'shelves' 
          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25' 
          : (store.currentTheme === 'light' ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800')"
      >
        🗄️ Peta Rak
      </router-link>
      <router-link 
        to="/member-card" 
        @click="isMobileMenuOpen = false"
        class="block px-3.5 py-2.5 rounded-xl text-xs transition font-semibold"
        :class="$route.name === 'member-card' 
          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25' 
          : (store.currentTheme === 'light' ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800')"
      >
        💳 Kartu Member QR
      </router-link>
      <router-link 
        v-if="store.currentUser" 
        to="/member-portal" 
        @click="isMobileMenuOpen = false"
        class="block px-3.5 py-2.5 rounded-xl text-xs transition font-semibold"
        :class="$route.name === 'member-portal' 
          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25' 
          : (store.currentTheme === 'light' ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800')"
      >
        👤 Portal Pinjaman Saya
      </router-link>
      <router-link 
        v-if="store.isAdmin"
        to="/admin" 
        @click="isMobileMenuOpen = false"
        class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition font-semibold"
        :class="$route.name === 'admin' 
          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25' 
          : (store.currentTheme === 'light' ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800')"
      >
        <span>⚡ Admin Dashboard Console</span>
        <span v-if="store.pendingStudentVerificationsCount > 0" class="px-2 py-0.5 rounded-full bg-blue-500 text-white font-bold text-[10px] animate-pulse">
          🎒 {{ store.pendingStudentVerificationsCount }} Siswa
        </span>
        <span v-else-if="store.pendingTeacherRequestsCount > 0" class="px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px] animate-pulse">
          👨‍🏫 {{ store.pendingTeacherRequestsCount }} Guru
        </span>
      </router-link>
      <button 
        v-if="store.currentUser"
        type="button"
        @click="isMobileMenuOpen = false; isDeviceModalOpen = true"
        class="seamless-menu-item w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer border-0 shadow-none focus:outline-hidden"
        :class="store.currentTheme === 'light' ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800'"
      >
        <span class="flex items-center gap-2">
          <Laptop class="w-4 h-4 text-cyan-500" />
          <span>Manajemen Sesi & Perangkat</span>
        </span>
        <span v-if="store.isCurrentDeviceMain" class="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[10px] font-bold">
          👑 Utama
        </span>
      </button>

      <!-- Changelog button for mobile drawer -->
      <button 
        type="button"
        @click="isMobileMenuOpen = false; store.openChangelog()"
        class="seamless-menu-item w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer border-0 shadow-none focus:outline-hidden"
        :class="store.currentTheme === 'light' ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800'"
      >
        <span class="flex items-center gap-2">
          <Sparkles class="w-4 h-4 text-amber-500" />
          <span>Catatan Rilis</span>
        </span>
        <span class="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 text-[10px] font-mono font-bold">
          v{{ store.currentAppVersion }}
        </span>
      </button>

      <!-- PWA Install button for mobile drawer -->
      <button 
        type="button"
        @click="triggerPwaInstall"
        class="seamless-menu-item w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer border-0 shadow-none focus:outline-hidden"
        :class="store.currentTheme === 'light' ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800'"
      >
        <span class="flex items-center gap-2">
          <Smartphone class="w-4 h-4 text-emerald-500" />
          <span>Pasang Aplikasi Libra (PWA)</span>
        </span>
        <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[10px] font-bold">
          Homescreen
        </span>
      </button>

      <!-- Theme Mode Selector for Mobile Drawer -->
      <div 
        class="px-3 py-2.5 rounded-xl border space-y-1.5 transition-colors"
        :class="{
          'bg-slate-100 border-slate-200': store.currentTheme === 'light',
          'bg-slate-800/70 border-slate-700/60': store.currentTheme === 'dark',
          'bg-slate-900/70 border-blue-500/25 backdrop-blur-md': store.currentTheme === 'elegant'
        }"
      >
        <div class="flex items-center justify-between text-[11px] font-medium" :class="store.currentTheme === 'light' ? 'text-slate-700' : 'text-slate-300'">
          <div class="flex items-center gap-1.5">
            <Palette class="w-3.5 h-3.5 text-blue-500" />
            <span>Warna Tema</span>
          </div>
          <span class="text-[10px] font-bold text-blue-500 uppercase tracking-wide">
            {{ store.currentTheme === 'light' ? 'Terang' : (store.currentTheme === 'dark' ? 'Gelap' : 'Elegan') }}
          </span>
        </div>
        <div 
          class="grid grid-cols-3 gap-1 p-1 rounded-lg border"
          :class="{
            'bg-white border-slate-200': store.currentTheme === 'light',
            'bg-slate-900 border-slate-700/60': store.currentTheme === 'dark',
            'bg-slate-950/70 border-blue-500/20': store.currentTheme === 'elegant'
          }"
        >
          <button
            type="button"
            @click="store.setTheme('light')"
            class="flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-bold transition cursor-pointer"
            :class="store.currentTheme === 'light' ? 'bg-blue-600 text-white shadow-xs' : (store.currentTheme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200')"
          >
            <Sun class="w-3.5 h-3.5" :class="store.currentTheme === 'light' ? 'text-amber-300' : 'text-slate-400'" />
            <span>Light</span>
          </button>
          <button
            type="button"
            @click="store.setTheme('dark')"
            class="flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-bold transition cursor-pointer"
            :class="store.currentTheme === 'dark' ? 'bg-slate-700 text-white shadow-xs ring-1 ring-slate-500' : (store.currentTheme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200')"
          >
            <Moon class="w-3.5 h-3.5" :class="store.currentTheme === 'dark' ? 'text-blue-300' : 'text-slate-400'" />
            <span>Dark</span>
          </button>
          <button
            type="button"
            @click="store.setTheme('elegant')"
            class="flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-bold transition cursor-pointer"
            :class="store.currentTheme === 'elegant' ? 'bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600 text-white shadow-xs ring-1 ring-cyan-400/50' : (store.currentTheme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200')"
          >
            <Sparkles class="w-3.5 h-3.5" :class="store.currentTheme === 'elegant' ? 'text-cyan-200' : 'text-slate-400'" />
            <span>Elegant</span>
          </button>
        </div>
      </div>

      <router-link 
        v-if="!store.currentUser"
        to="/login" 
        @click="isMobileMenuOpen = false"
        class="block px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 text-center"
      >
        🔑 Masuk / Daftar Akun
      </router-link>
    </div>

    <!-- Device Sessions Modal -->
    <DeviceSessionsModal 
      :isOpen="isDeviceModalOpen" 
      @close="isDeviceModalOpen = false" 
    />
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLibraryStore } from '../stores/library.js';
import { 
  BookMarked, Layers, QrCode, UserCheck, 
  ShieldCheck, User, ChevronDown, Menu, X, LogIn, UserPlus, LogOut, Settings, Laptop, Sparkles, Smartphone,
  Palette, Sun, Moon
} from 'lucide-vue-next';
import { logoutUser } from '../lib/firebase.js';
import DeviceSessionsModal from './DeviceSessionsModal.vue';

const store = useLibraryStore();
const route = useRoute();
const router = useRouter();
const isUserMenuOpen = ref(false);
const isMobileMenuOpen = ref(false);
const isScrolled = ref(false);
const isDeviceModalOpen = ref(false);

const userDropdownRef = ref<HTMLElement | null>(null);
const navHeaderRef = ref<HTMLElement | null>(null);
const mobileMenuBtnRef = ref<HTMLElement | null>(null);
const mobileDrawerRef = ref<HTMLElement | null>(null);

const toggleUserMenu = (e?: Event) => {
  e?.stopPropagation();
  isUserMenuOpen.value = !isUserMenuOpen.value;
  if (isUserMenuOpen.value) {
    isMobileMenuOpen.value = false;
  }
};

const toggleMobileMenu = (e?: Event) => {
  e?.stopPropagation();
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  if (isMobileMenuOpen.value) {
    isUserMenuOpen.value = false;
  }
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node | null;
  if (!target) return;

  if (isUserMenuOpen.value && userDropdownRef.value && !userDropdownRef.value.contains(target)) {
    isUserMenuOpen.value = false;
  }

  if (isMobileMenuOpen.value) {
    const isClickOnToggle = mobileMenuBtnRef.value && mobileMenuBtnRef.value.contains(target);
    const isClickInsideDrawer = mobileDrawerRef.value && mobileDrawerRef.value.contains(target);
    if (!isClickOnToggle && !isClickInsideDrawer) {
      isMobileMenuOpen.value = false;
    }
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (isUserMenuOpen.value) isUserMenuOpen.value = false;
    if (isMobileMenuOpen.value) isMobileMenuOpen.value = false;
  }
};

const triggerPwaInstall = () => {
  isUserMenuOpen.value = false;
  isMobileMenuOpen.value = false;
  window.dispatchEvent(new CustomEvent('open-pwa-install-modal'));
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 8;
};

// Tutup menu saat berpindah rute
watch(() => route.path, () => {
  isUserMenuOpen.value = false;
  isMobileMenuOpen.value = false;
});

onMounted(() => {
  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('click', handleClickOutside);
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('click', handleClickOutside);
  window.removeEventListener('keydown', handleKeyDown);
});

const handleLogoutClick = async () => {
  try {
    await logoutUser().catch(() => {});
  } finally {
    await store.logout();
    isUserMenuOpen.value = false;
    isMobileMenuOpen.value = false;
    if (route.meta.requiresAdmin || route.meta.requiresSuperAdmin || route.path.startsWith('/admin') || route.path.startsWith('/settings') || route.path.startsWith('/member-portal')) {
      router.push('/login');
    }
  }
};
</script>

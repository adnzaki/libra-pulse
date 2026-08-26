<template>
  <div class="max-w-md mx-auto py-4 sm:py-8 px-2 animate-in fade-in duration-300">
    
    <!-- If user is already logged in -->
    <div v-if="store.currentUser" class="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center space-y-5">
      <div class="relative w-20 h-20 mx-auto">
        <img :src="store.currentUser.avatar" class="w-20 h-20 rounded-full object-cover border-4 border-blue-500 shadow-md" alt="Avatar" />
        <span 
          v-if="store.isAdmin"
          class="absolute -bottom-1 -right-1 px-2 py-0.5 bg-blue-600 text-white text-[9px] font-extrabold uppercase rounded-full shadow-sm"
        >
          ADMIN
        </span>
      </div>

      <div>
        <h2 class="text-xl font-extrabold text-slate-900">{{ store.currentUser.name }}</h2>
        <p class="text-xs text-slate-500 mt-0.5">{{ store.currentUser.email }}</p>
        <p class="text-xs font-mono font-bold text-blue-600 mt-1">{{ store.currentUser.cardNumber }}</p>
      </div>

      <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 text-left space-y-1.5">
        <div class="flex justify-between">
          <span class="text-slate-400">Status Akun:</span>
          <span class="font-bold text-emerald-600" v-if="!store.currentUser.isSuspended">Aktif</span>
          <span class="font-bold text-rose-600" v-else>Disuspend</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Peran Sistem:</span>
          <span class="font-bold capitalize text-slate-800">{{ store.currentUser.role === 'admin' ? 'Administrator Pengelola' : 'Anggota Publik' }}</span>
        </div>
      </div>

      <div class="space-y-2.5 pt-2">
        <router-link 
          v-if="store.isAdmin"
          to="/admin" 
          class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-blue-200"
        >
          <ShieldCheck class="w-4 h-4" />
          <span>Buka Admin Library Console</span>
        </router-link>

        <router-link 
          to="/member-portal" 
          class="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition"
        >
          <UserCheck class="w-4 h-4" />
          <span>Buka Portal Pinjaman Saya</span>
        </router-link>

        <!-- Change Password Button -->
        <button 
          @click="isChangePasswordOpen = true"
          class="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
        >
          <KeyRound class="w-4 h-4 text-slate-500" />
          <span>Ganti Kata Sandi Akun</span>
        </button>

        <button 
          @click="handleLogout"
          class="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-2xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut class="w-4 h-4" />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </div>

    <!-- Login & Register Container -->
    <div v-else class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      
      <!-- Top Header -->
      <div class="p-6 sm:p-8 bg-slate-900 text-white text-center relative overflow-hidden">
        <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl"></div>
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/30 text-blue-400 border border-blue-500/30 mb-3 shadow-inner">
          <BookOpen class="w-6 h-6" />
        </div>
        <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight">PustakaModern</h1>
        <p class="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Sistem Informasi & Sirkulasi Perpustakaan Digital Berbasis Web & PWA
        </p>

        <!-- Auth Tabs (Member, Admin, Register, Reset) -->
        <div class="grid grid-cols-4 gap-1 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60 mt-5 text-xs">
          <button 
            @click="authMode = 'member'; resetStep = 1; errorMsg = ''; successMsg = ''"
            class="py-2 rounded-xl font-bold transition text-[10px] sm:text-xs cursor-pointer"
            :class="authMode === 'member' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'"
          >
            Anggota
          </button>
          <button 
            @click="authMode = 'admin'; resetStep = 1; errorMsg = ''; successMsg = ''"
            class="py-2 rounded-xl font-bold transition text-[10px] sm:text-xs cursor-pointer"
            :class="authMode === 'admin' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'"
          >
            Admin
          </button>
          <button 
            @click="authMode = 'register'; resetStep = 1; errorMsg = ''; successMsg = ''"
            class="py-2 rounded-xl font-bold transition text-[10px] sm:text-xs cursor-pointer"
            :class="authMode === 'register' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'"
          >
            Daftar
          </button>
          <button 
            @click="authMode = 'reset'; resetStep = 1; errorMsg = ''; successMsg = ''"
            class="py-2 rounded-xl font-bold transition text-[10px] sm:text-xs cursor-pointer"
            :class="authMode === 'reset' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'"
          >
            Reset Sandi
          </button>
        </div>
      </div>

      <!-- Form Body -->
      <div class="p-6 sm:p-8 space-y-5 text-xs">
        
        <!-- Alert / Error Message -->
        <div v-if="errorMsg" class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5 text-xs animate-in shake duration-200">
          <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
          <div>{{ errorMsg }}</div>
        </div>

        <div v-if="successMsg" class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-start gap-2.5 text-xs">
          <CheckCircle class="w-4 h-4 shrink-0 mt-0.5" />
          <div>{{ successMsg }}</div>
        </div>

        <!-- TAB 1: MEMBER LOGIN -->
        <div v-if="authMode === 'member'" class="space-y-4">
          <!-- Google OAuth via Firebase -->
          <button 
            @click="handleGoogleSignIn"
            :disabled="isLoading"
            class="w-full py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 active:scale-98 shadow-sm"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Masuk dengan Akun Google</span>
          </button>

          <div class="relative flex py-1 items-center">
            <div class="flex-grow border-t border-slate-200"></div>
            <span class="flex-shrink mx-3 text-slate-400 text-[10px] uppercase font-bold tracking-wider">Atau Akun Member</span>
            <div class="flex-grow border-t border-slate-200"></div>
          </div>

          <form @submit.prevent="handleMemberLogin" class="space-y-3.5">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Email / Nomor Kartu Anggota</label>
              <div class="relative">
                <input 
                  v-model="memberForm.identifier" 
                  type="text" 
                  required 
                  placeholder="Contoh: LIB-2026-8801 atau email@anda.com"
                  class="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs transition"
                />
                <User class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="font-bold text-slate-700">Kata Sandi (Opsional)</label>
                <button 
                  type="button" 
                  @click="openResetFor(memberForm.identifier)"
                  class="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  Lupa kata sandi?
                </button>
              </div>
              <div class="relative">
                <input 
                  v-model="memberForm.password" 
                  :type="showPassword ? 'text' : 'password'" 
                  placeholder="Masukkan kata sandi akun"
                  class="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs transition"
                />
                <Lock class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button 
                  type="button" 
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <Eye v-if="!showPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              :disabled="isLoading"
              class="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn class="w-4 h-4" />
              <span>{{ isLoading ? 'Memverifikasi...' : 'Masuk sebagai Anggota' }}</span>
            </button>
          </form>

          <div class="pt-2 text-center text-slate-500 text-xs">
            Belum memiliki nomor kartu anggota? 
            <button @click="authMode = 'register'" class="text-blue-600 font-bold hover:underline ml-1">
              Daftar Sekarang →
            </button>
          </div>
        </div>

        <!-- TAB 2: ADMIN LOGIN -->
        <div v-if="authMode === 'admin'" class="space-y-4">
          <div class="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-800">
            <ShieldCheck class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div class="font-bold">Akses Khusus Administrator Perpustakaan</div>
              <div class="text-[11px] text-blue-700/80 mt-0.5">
                Gunakan kredensial pengelola perpustakaan untuk masuk ke Admin Control Hub.
              </div>
            </div>
          </div>

          <form @submit.prevent="handleAdminLogin" class="space-y-3.5">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Email / Username Administrator</label>
              <div class="relative">
                <input 
                  v-model="adminForm.identifier" 
                  type="text" 
                  required 
                  placeholder="azzackey@gmail.com atau admin"
                  class="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs transition font-mono"
                />
                <Mail class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="font-bold text-slate-700">Kata Sandi Administrator *</label>
                <button 
                  type="button" 
                  @click="openResetFor(adminForm.identifier || 'azzackey@gmail.com')"
                  class="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  Lupa kata sandi?
                </button>
              </div>
              <div class="relative">
                <input 
                  v-model="adminForm.password" 
                  :type="showPassword ? 'text' : 'password'" 
                  required 
                  placeholder="Masukkan kata sandi admin"
                  class="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs transition"
                />
                <Lock class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button 
                  type="button" 
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <Eye v-if="!showPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              :disabled="isLoading"
              class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md shadow-blue-200 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck class="w-4 h-4" />
              <span>{{ isLoading ? 'Memverifikasi Akses...' : 'Masuk ke Admin Console' }}</span>
            </button>
          </form>
        </div>

        <!-- TAB 3: REGISTER NEW MEMBER -->
        <div v-if="authMode === 'register'" class="space-y-4">
          <form @submit.prevent="handleRegister" class="space-y-3.5">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
              <input 
                v-model="registerForm.name" 
                type="text" 
                required 
                placeholder="Nama lengkap Anda"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Email Aktif *</label>
                <input 
                  v-model="registerForm.email" 
                  type="email" 
                  required 
                  placeholder="email@anda.com"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">No. WhatsApp / HP *</label>
                <input 
                  v-model="registerForm.phone" 
                  type="tel" 
                  required 
                  placeholder="+628123456789"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs"
                />
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Kata Sandi (Untuk Login) *</label>
              <input 
                v-model="registerForm.password" 
                type="password" 
                required 
                placeholder="Buat kata sandi minimal 4 karakter"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Alamat Domisili / Instansi</label>
              <textarea 
                v-model="registerForm.address" 
                rows="2" 
                placeholder="Alamat tempat tinggal / instansi"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs"
              ></textarea>
            </div>

            <div class="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-2 text-[11px] text-blue-800">
              <QrCode class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>Setelah mendaftar, Nomor Kartu Digital & Kode QR Anggota akan langsung terbit secara otomatis.</span>
            </div>

            <button 
              type="submit" 
              :disabled="isLoading"
              class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md shadow-blue-200 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle class="w-4 h-4" />
              <span>{{ isLoading ? 'Mendaftarkan...' : 'Daftar Sebagai Anggota' }}</span>
            </button>
          </form>

          <div class="text-center text-slate-500 text-xs">
            Sudah terdaftar? 
            <button @click="authMode = 'member'" class="text-blue-600 font-bold hover:underline ml-1">
              Masuk di sini
            </button>
          </div>
        </div>

        <!-- TAB 4: RESET PASSWORD (FOR ALL USERS) -->
        <div v-if="authMode === 'reset'" class="space-y-4">
          <div class="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <KeyRound class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div class="font-bold">Layanan Reset Kata Sandi Pengguna</div>
              <div class="text-[11px] text-amber-800/90 mt-0.5">
                Masukkan email terdaftar atau nomor kartu anggota Anda untuk menerima kode verifikasi pemulihan sandi.
              </div>
            </div>
          </div>

          <!-- Step 1: Request Code -->
          <form v-if="resetStep === 1" @submit.prevent="handleRequestReset" class="space-y-3.5">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Email / Nomor Kartu Anggota</label>
              <div class="relative">
                <input 
                  v-model="resetForm.identifier" 
                  type="text" 
                  required 
                  placeholder="Contoh: email@anda.com / LIB-2026-... / azzackey@gmail.com"
                  class="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs transition"
                />
                <Mail class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button 
              type="submit" 
              :disabled="isLoading || !resetForm.identifier"
              class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md shadow-blue-200 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send class="w-4 h-4" />
              <span>{{ isLoading ? 'Memproses...' : 'Dapatkan Kode Verifikasi Reset' }}</span>
            </button>
          </form>

          <!-- Step 2: Input Code & New Password -->
          <form v-else @submit.prevent="handleConfirmReset" class="space-y-3.5 animate-in fade-in duration-200">
            <div class="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[11px] text-blue-900 space-y-1">
              <div class="font-bold flex items-center gap-1.5">
                <CheckCircle class="w-3.5 h-3.5 text-blue-600" />
                Kode Verifikasi Dihasilkan untuk {{ resetForm.identifier }}
              </div>
              <div v-if="generatedCode" class="font-mono font-extrabold text-sm text-blue-700 bg-white/80 px-2 py-1 rounded-lg border border-blue-200 inline-block">
                Kode Anda: {{ generatedCode }}
              </div>
              <p class="text-slate-500 text-[10px]">Masukkan kode verifikasi di atas bersama kata sandi baru Anda.</p>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Kode Verifikasi (6 Digit) *</label>
              <input 
                v-model="resetForm.code" 
                type="text" 
                required 
                maxlength="6"
                placeholder="Contoh: 123456"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs font-mono tracking-widest text-center text-sm font-bold"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Kata Sandi Baru *</label>
              <div class="relative">
                <input 
                  v-model="resetForm.newPassword" 
                  :type="showPassword ? 'text' : 'password'" 
                  required 
                  minlength="4"
                  placeholder="Minimal 4 karakter"
                  class="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs transition"
                />
                <KeyRound class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button 
                  type="button" 
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <Eye v-if="!showPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Konfirmasi Kata Sandi Baru *</label>
              <div class="relative">
                <input 
                  v-model="resetForm.confirmPassword" 
                  :type="showPassword ? 'text' : 'password'" 
                  required 
                  placeholder="Ulangi kata sandi baru"
                  class="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-xs transition"
                />
                <Lock class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div class="flex gap-2">
              <button 
                type="button"
                @click="resetStep = 1"
                class="py-2.5 px-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Kembali
              </button>
              <button 
                type="submit" 
                :disabled="isLoading"
                class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md shadow-emerald-200 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Check class="w-4 h-4" />
                <span>{{ isLoading ? 'Menyimpan...' : 'Perbarui Kata Sandi' }}</span>
              </button>
            </div>
          </form>

          <div class="pt-2 text-center text-slate-500 text-xs">
            Ingat kata sandi Anda? 
            <button @click="authMode = 'member'" class="text-blue-600 font-bold hover:underline ml-1">
              Kembali ke Login
            </button>
          </div>
        </div>

      </div>

    </div>

    <!-- Modal Ganti Password Mandiri -->
    <ChangePasswordModal 
      :is-open="isChangePasswordOpen"
      @close="isChangePasswordOpen = false"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useLibraryStore } from '../stores/library.js';
import { loginWithGoogle, logoutUser } from '../lib/firebase.js';
import ChangePasswordModal from '../components/ChangePasswordModal.vue';
import { 
  BookOpen, ShieldCheck, UserCheck, LogIn, LogOut, 
  User, Lock, Mail, AlertCircle, Eye, EyeOff, CheckCircle, 
  QrCode, KeyRound, Send, Check 
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const store = useLibraryStore();

const authMode = ref<'member' | 'admin' | 'register' | 'reset'>('member');
const isLoading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');
const showPassword = ref(false);
const isChangePasswordOpen = ref(false);

const resetStep = ref<1 | 2>(1);
const generatedCode = ref('');

const memberForm = ref({
  identifier: '',
  password: ''
});

const adminForm = ref({
  identifier: 'azzackey@gmail.com',
  password: ''
});

const registerForm = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  address: ''
});

const resetForm = ref({
  identifier: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
});

onMounted(() => {
  if (route.query.mode === 'admin') {
    authMode.value = 'admin';
  } else if (route.query.mode === 'register') {
    authMode.value = 'register';
  } else if (route.query.mode === 'reset') {
    authMode.value = 'reset';
  }
});

const openResetFor = (identifier: string) => {
  authMode.value = 'reset';
  resetStep.value = 1;
  resetForm.value.identifier = identifier || '';
  errorMsg.value = '';
  successMsg.value = '';
};

const handleMemberLogin = async () => {
  if (!memberForm.value.identifier) return;
  isLoading.value = true;
  errorMsg.value = '';

  try {
    const res = await store.loginWithCredentials({
      identifier: memberForm.value.identifier,
      password: memberForm.value.password || undefined
    });

    if (res.success) {
      const redirect = (route.query.redirect as string) || '/member-portal';
      router.push(redirect);
    } else {
      errorMsg.value = res.error || 'Gagal masuk. Periksa kembali kredensial Anda.';
    }
  } finally {
    isLoading.value = false;
  }
};

const handleAdminLogin = async () => {
  if (!adminForm.value.identifier || !adminForm.value.password) {
    errorMsg.value = 'Email dan kata sandi admin wajib diisi';
    return;
  }

  isLoading.value = true;
  errorMsg.value = '';

  try {
    const res = await store.loginWithCredentials({
      identifier: adminForm.value.identifier,
      password: adminForm.value.password,
      role: 'admin'
    });

    if (res.success) {
      const redirect = (route.query.redirect as string) || '/admin';
      router.push(redirect);
    } else {
      errorMsg.value = res.error || 'Autentikasi admin gagal. Pastikan email dan password benar.';
    }
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleSignIn = async () => {
  isLoading.value = true;
  errorMsg.value = '';

  try {
    const firebaseUser = await loginWithGoogle();
    if (firebaseUser?.email) {
      const res = await store.loginWithGoogleUser({
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      });

      if (res.success) {
        if (res.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/member-portal');
        }
      }
    }
  } catch (err: any) {
    console.error('Google Sign in error', err);
    errorMsg.value = err.message || 'Gagal masuk dengan akun Google';
  } finally {
    isLoading.value = false;
  }
};

const handleRegister = async () => {
  if (!registerForm.value.name || !registerForm.value.email || !registerForm.value.phone) return;
  isLoading.value = true;
  errorMsg.value = '';

  try {
    const res = await store.registerMember(registerForm.value);
    if (res.success) {
      // Auto login after registration
      await store.loginWithCredentials({
        identifier: registerForm.value.email,
        password: registerForm.value.password
      });
      router.push('/member-card');
    } else {
      errorMsg.value = res.error || 'Pendaftaran gagal';
    }
  } finally {
    isLoading.value = false;
  }
};

const handleRequestReset = async () => {
  if (!resetForm.value.identifier) return;
  isLoading.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    const res = await store.requestPasswordReset(resetForm.value.identifier);
    if (res.success) {
      generatedCode.value = res.verificationCode || '';
      resetForm.value.code = res.verificationCode || '';
      resetStep.value = 2;
      successMsg.value = res.message || 'Kode verifikasi telah dibuat!';
    } else {
      errorMsg.value = res.error || 'Akun tidak ditemukan';
    }
  } finally {
    isLoading.value = false;
  }
};

const handleConfirmReset = async () => {
  if (resetForm.value.newPassword !== resetForm.value.confirmPassword) {
    errorMsg.value = 'Konfirmasi kata sandi baru tidak cocok';
    return;
  }

  if (resetForm.value.newPassword.length < 4) {
    errorMsg.value = 'Kata sandi minimal 4 karakter';
    return;
  }

  isLoading.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    const res = await store.confirmPasswordReset(
      resetForm.value.identifier,
      resetForm.value.code,
      resetForm.value.newPassword
    );

    if (res.success) {
      successMsg.value = res.message || 'Kata sandi berhasil diubah!';
      setTimeout(() => {
        authMode.value = 'member';
        memberForm.value.identifier = resetForm.value.identifier;
        memberForm.value.password = resetForm.value.newPassword;
        resetStep.value = 1;
        resetForm.value = { identifier: '', code: '', newPassword: '', confirmPassword: '' };
      }, 1500);
    } else {
      errorMsg.value = res.error || 'Gagal mereset kata sandi';
    }
  } finally {
    isLoading.value = false;
  }
};

const handleLogout = async () => {
  await logoutUser().catch(() => {});
  store.logout();
};
</script>

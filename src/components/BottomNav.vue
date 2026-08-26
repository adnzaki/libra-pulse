<template>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/90 pb-[env(safe-area-inset-bottom,8px)] pt-1.5 px-2 shadow-2xl transition-transform duration-200">
    <div class="flex items-center justify-around max-w-lg mx-auto">
      
      <!-- Katalog -->
      <router-link 
        to="/" 
        class="flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-90"
        :class="$route.name === 'catalog' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200 font-medium'"
      >
        <div class="relative p-1">
          <BookMarked class="w-5 h-5 transition-transform" :class="$route.name === 'catalog' ? 'scale-110' : ''" />
        </div>
        <span class="text-[10px] tracking-tight mt-0.5">Katalog</span>
      </router-link>

      <!-- Rak -->
      <router-link 
        to="/shelves" 
        class="flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-90"
        :class="$route.name === 'shelves' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200 font-medium'"
      >
        <div class="relative p-1">
          <Layers class="w-5 h-5 transition-transform" :class="$route.name === 'shelves' ? 'scale-110' : ''" />
        </div>
        <span class="text-[10px] tracking-tight mt-0.5">Peta Rak</span>
      </router-link>

      <!-- QR Scanner / Kartu (Elevated Center Button) -->
      <router-link 
        to="/member-card" 
        class="flex flex-col items-center justify-center flex-1 py-1 px-1 -mt-4 transition-all duration-200 active:scale-90"
      >
        <div 
          class="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all border-2"
          :class="$route.name === 'member-card' 
            ? 'bg-blue-600 border-blue-400 shadow-blue-500/40 ring-4 ring-blue-500/20' 
            : 'bg-slate-800 border-slate-700 shadow-slate-900/60'"
        >
          <QrCode class="w-6 h-6" />
        </div>
        <span 
          class="text-[10px] tracking-tight mt-1 font-bold"
          :class="$route.name === 'member-card' ? 'text-blue-400' : 'text-slate-400'"
        >
          Scan QR
        </span>
      </router-link>

      <!-- User / Login / Admin -->
      <router-link 
        v-if="store.isAdmin"
        to="/admin" 
        class="flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-90 relative"
        :class="$route.name === 'admin' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200 font-medium'"
      >
        <div class="relative p-1">
          <ShieldCheck class="w-5 h-5 transition-transform" :class="$route.name === 'admin' ? 'scale-110' : ''" />
          <span 
            v-if="store.overdueLoans.length" 
            class="absolute -top-0.5 -right-1.5 px-1 min-w-[14px] h-[14px] flex items-center justify-center text-[9px] font-extrabold bg-rose-500 text-white rounded-full animate-pulse"
          >
            {{ store.overdueLoans.length }}
          </span>
        </div>
        <span class="text-[10px] tracking-tight mt-0.5">Admin</span>
      </router-link>

      <router-link 
        v-else-if="store.currentUser"
        to="/member-portal" 
        class="flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-90 relative"
        :class="$route.name === 'member-portal' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200 font-medium'"
      >
        <div class="relative p-1">
          <UserCheck class="w-5 h-5 transition-transform" :class="$route.name === 'member-portal' ? 'scale-110' : ''" />
          <span 
            v-if="store.myActiveLoans.length" 
            class="absolute -top-0.5 -right-1 px-1 min-w-[14px] h-[14px] flex items-center justify-center text-[9px] font-extrabold bg-amber-400 text-slate-950 rounded-full"
          >
            {{ store.myActiveLoans.length }}
          </span>
        </div>
        <span class="text-[10px] tracking-tight mt-0.5">Saya</span>
      </router-link>

      <router-link 
        v-else
        to="/login" 
        class="flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-90"
        :class="$route.name === 'login' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200 font-medium'"
      >
        <div class="relative p-1">
          <LogIn class="w-5 h-5 transition-transform" :class="$route.name === 'login' ? 'scale-110' : ''" />
        </div>
        <span class="text-[10px] tracking-tight mt-0.5">Masuk</span>
      </router-link>

    </div>
  </nav>
</template>

<script setup lang="ts">
import { useLibraryStore } from '../stores/library.js';
import { BookMarked, Layers, QrCode, UserCheck, ShieldCheck, LogIn } from 'lucide-vue-next';

const store = useLibraryStore();
</script>

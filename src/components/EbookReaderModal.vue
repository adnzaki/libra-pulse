<template>
  <div 
    v-if="isOpen" 
    ref="readerModalRef"
    class="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md overflow-hidden select-none animate-in fade-in duration-200"
    :class="{ 'is-fullscreen': isFullscreen }"
    @contextmenu.prevent
  >
    <!-- Top Navigation / Reader Toolbar -->
    <header class="h-12 sm:h-14 bg-slate-900/95 border-b border-slate-800 text-white px-3 sm:px-6 flex items-center justify-between shrink-0 z-20 shadow-md transition-all">
      <!-- Left: Book & Status Details -->
      <div class="flex items-center gap-2 sm:gap-3 min-w-0 mr-2">
        <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
          <BookOpen class="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h2 class="font-extrabold text-xs sm:text-sm text-slate-100 truncate max-w-[140px] xs:max-w-[200px] sm:max-w-md" :title="loan?.bookTitle">
              {{ loan?.bookTitle || 'Baca Dokumen e-Book' }}
            </h2>
            <span class="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30 shrink-0 hidden sm:inline-block">
              In-App Reader
            </span>
          </div>
          <div class="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
            <span v-if="!isExpired" class="text-emerald-400 flex items-center gap-1 font-semibold truncate">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span class="hidden sm:inline">Akses Aktif • Jatuh Tempo: {{ formatDate(loan?.dueDate) }}</span>
              <span class="sm:hidden">s/d {{ formatShortDate(loan?.dueDate) }}</span>
            </span>
            <span v-else class="text-rose-400 flex items-center gap-1 font-bold">
              <Lock class="w-3 h-3 shrink-0" />
              Masa Akses Berakhir
            </span>
          </div>
        </div>
      </div>

      <!-- Right Toolbar Controls -->
      <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <!-- View Mode Switcher: Mode Baca (Teks Reflow) vs Halaman Asli (Canvas) -->
        <div 
          v-if="!isExpired && pdfDoc && !isEpubMode" 
          class="flex items-center bg-slate-800 p-0.5 rounded-full border border-slate-700/80 shadow-xs mr-0.5 sm:mr-1"
        >
          <button
            @click="setReadingView('reflow')"
            class="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer"
            :class="readingView === 'reflow' 
              ? 'bg-indigo-600 text-white shadow-xs' 
              : 'text-slate-400 hover:text-slate-200'"
            title="Mode Baca Teks: Otomatis menyesuaikan ukuran layar HP tanpa perlu zoom"
          >
            <AlignLeft class="w-3.5 h-3.5" />
            <span class="text-[11px] font-medium hidden xs:inline">Mode Baca</span>
            <span class="text-[11px] font-medium xs:hidden">Baca</span>
          </button>
          <button
            @click="setReadingView('canvas')"
            class="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer"
            :class="readingView === 'canvas' 
              ? 'bg-indigo-600 text-white shadow-xs' 
              : 'text-slate-400 hover:text-slate-200'"
            title="Tampilan Halaman Asli Dokumen"
          >
            <FileText class="w-3.5 h-3.5" />
            <span class="text-[11px] font-medium hidden xs:inline">Halaman Asli</span>
            <span class="text-[11px] font-medium xs:hidden">Asli</span>
          </button>
        </div>

        <!-- Fullscreen Toggle Button -->
        <button
          @click="toggleFullscreen"
          class="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer active:scale-95 shadow-xs"
          :class="isFullscreen 
            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30' 
            : 'bg-slate-800 hover:bg-slate-700 border-slate-700/70 text-slate-300 hover:text-white'"
          :title="isFullscreen ? 'Keluar Layar Penuh (Esc / F)' : 'Layar Penuh / Fullscreen (F)'"
        >
          <Minimize v-if="isFullscreen" class="w-3.5 h-3.5 text-amber-400" />
          <Maximize v-else class="w-3.5 h-3.5 text-indigo-400" />
          <span class="text-[11px] hidden md:inline">
            {{ isFullscreen ? 'Normal' : 'Layar Penuh' }}
          </span>
        </button>

        <!-- Watermark Intensity Control -->
        <button
          v-if="!isExpired && (pdfDoc || isEpubMode)"
          @click="cycleWatermarkMode"
          class="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700/70 text-slate-300 text-xs transition cursor-pointer"
          :title="watermarkTooltip"
        >
          <EyeOff v-if="watermarkMode === 'off'" class="w-3.5 h-3.5 text-rose-400" />
          <Eye v-else-if="watermarkMode === 'subtle'" class="w-3.5 h-3.5 text-emerald-400" />
          <Shield v-else class="w-3.5 h-3.5 text-indigo-400" />
          <span class="text-[11px] font-medium hidden md:inline">
            {{ watermarkLabel }}
          </span>
        </button>

        <!-- Close Button -->
        <button 
          @click="handleClose" 
          class="p-2 sm:p-2.5 rounded-full bg-slate-800/90 hover:bg-rose-600 text-slate-300 hover:text-white transition cursor-pointer shadow-sm active:scale-95"
          title="Tutup Pembaca e-Book"
        >
          <X class="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </header>

    <!-- Main Reader Workspace -->
    <main 
      ref="readerWorkspaceRef"
      class="flex-1 relative overflow-auto flex flex-col items-center justify-start bg-slate-900/90 custom-reader-scroll"
      :class="readingView === 'reflow' ? 'p-0 sm:p-6' : 'p-2 sm:p-6'"
    >
      
      <!-- STATE 1: EXPIRED / OVERDUE LOCK SCREEN -->
      <div 
        v-if="isExpired" 
        class="my-auto max-w-md w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl text-slate-200 animate-in zoom-in-95 duration-200"
      >
        <div class="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-inner">
          <Lock class="w-8 h-8" />
        </div>
        <div>
          <h3 class="font-extrabold text-lg sm:text-xl text-white">Masa Peminjaman e-Book Telah Berakhir</h3>
          <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Akses membaca dokumen digital ini telah dikunci otomatis karena melewati tenggat waktu jatuh tempo ({{ formatDate(loan?.dueDate) }}).
          </p>
        </div>
        <div class="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-left text-xs space-y-1.5 text-slate-300">
          <div class="font-bold text-indigo-300">Ingin membaca kembali?</div>
          <p class="text-[11px] text-slate-400 leading-relaxed">
            Sesuai regulasi perpustakaan, Anda dapat mengajukan <strong>Booking Ulang</strong> di katalog buku untuk mendapatkan masa pinjam e-Book berikutnya.
          </p>
        </div>
        <div class="pt-2 flex gap-2">
          <button 
            @click="handleClose" 
            class="flex-1 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
          <button 
            @click="goToCatalog" 
            class="flex-1 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition cursor-pointer active:scale-95"
          >
            Buka Katalog Buku →
          </button>
        </div>
      </div>

      <!-- STATE 2: LOADING PDF -->
      <div v-else-if="isLoadingDoc" class="my-auto flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 class="w-8 h-8 text-indigo-500 animate-spin" />
        <span class="text-xs font-medium">Menyiapkan e-Book...</span>
      </div>

      <!-- STATE 3: ERROR LOADING PDF -->
      <div v-else-if="errorMessage" class="my-auto max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900 border border-rose-800/50 text-center space-y-4 shadow-2xl">
        <div class="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <AlertTriangle class="w-7 h-7" />
        </div>
        <div class="space-y-1">
          <div class="font-bold text-base text-white">Gagal Membuka File e-Book</div>
          <p class="text-xs text-slate-400 leading-relaxed">
            Dokumen e-Book tidak dapat ditemukan di server penyimpanan.
          </p>
        </div>
        <div class="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-[11px] text-slate-400 text-left space-y-1.5">
          <div class="flex items-center gap-1.5 font-semibold text-slate-300">
            <Sparkles class="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Panduan untuk Pengelola / Admin:</span>
          </div>
          <p class="leading-relaxed">
            Jika server baru saja di-deploy atau di-push, pastikan file PDF telah diunggah melalui menu <b>Katalog Buku &gt; Edit Buku</b> di server ini agar file tersimpan di direktori server produksi.
          </p>
        </div>
        <div class="flex items-center justify-center gap-3 pt-2">
          <button 
            @click="handleClose" 
            class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-full transition cursor-pointer"
          >
            Tutup
          </button>
          <button 
            @click="loadDocument" 
            class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-full transition cursor-pointer shadow-lg shadow-indigo-600/30 active:scale-95"
          >
            Coba Muat Ulang
          </button>
        </div>
      </div>

      <!-- STATE 4: ACTIVE VIEWER (CANVAS FOR PDF OR DEDICATED STAGE FOR EPUB) -->
      <div 
        v-else-if="viewerMode === 'canvas' && (pdfDoc || isEpubMode)"
        class="relative flex flex-col items-center transition-all duration-150 my-auto pb-16 sm:pb-20 w-full"
      >
        <!-- EPUB Container (Clean, Reflowable / Paginated Reader) -->
        <div 
          v-if="isEpubMode"
          class="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden flex flex-col shrink-0 transition-all duration-200"
          :class="isFullscreen ? 'h-[90vh] sm:h-[92vh]' : 'h-[78vh] sm:h-[84vh]'"
        >
          <!-- Stage for ePub rendition -->
          <div 
            ref="epubContainerRef" 
            class="w-full h-full flex-1 overflow-hidden"
          ></div>

          <!-- Dynamic Security Watermark (Ultra-soft, unobtrusive to reading) -->
          <div 
            v-if="watermarkMode !== 'off'"
            class="absolute inset-0 pointer-events-none flex flex-col justify-around p-6 sm:p-14 overflow-hidden select-none transition-opacity duration-200"
            :class="{
              'opacity-[0.045]': watermarkMode === 'subtle',
              'opacity-[0.10]': watermarkMode === 'normal'
            }"
          >
            <div 
              v-for="i in (watermarkMode === 'subtle' ? 2 : 3)" 
              :key="i" 
              class="transform -rotate-25 text-slate-800 font-sans text-[11px] sm:text-xs font-medium tracking-widest uppercase select-none text-center"
            >
              SDN PENGASINAN VII • {{ watermarkMemberInfo }}
            </div>

            <!-- Fine footer edge tag -->
            <div class="absolute bottom-2 right-3 text-[9px] font-mono text-slate-500 select-none opacity-40">
              Perpustakaan Digital • Akses Resmi ePub
            </div>
          </div>
        </div>

        <!-- MODE BACA TEKS (FOR PDF - Responsive Reflow Mode, Fits 100% Screen Width) -->
        <div 
          v-else-if="pdfDoc && readingView === 'reflow'"
          class="w-full max-w-2xl sm:max-w-3xl flex flex-col items-center my-auto transition-all duration-200 shrink-0 relative px-0 sm:px-0"
        >
          <!-- Quick Styling Toolbar (Theme & Typography) -->
          <div class="w-full mb-3 flex flex-wrap items-center justify-between gap-2 px-3 sm:px-1 text-xs pt-2 sm:pt-0">
            <!-- Theme Presets: Sepia, Light, Dark -->
            <div class="flex items-center gap-1 bg-slate-800/95 backdrop-blur-md p-1 rounded-full border border-slate-700/80 shadow-md">
              <button 
                @click="setReaderTheme('sepia')"
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer"
                :class="readerTheme === 'sepia' 
                  ? 'bg-[#FAF4E8] text-[#3D2B1F] shadow-xs' 
                  : 'text-slate-400 hover:text-white'"
                title="Tema Kertas Sepia (Hangat & Nyaman di Mata)"
              >
                <span class="w-2.5 h-2.5 rounded-full bg-[#FAF4E8] border border-amber-300/40 shrink-0"></span>
                <span>Sepia</span>
              </button>
              <button 
                @click="setReaderTheme('light')"
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer"
                :class="readerTheme === 'light' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-400 hover:text-white'"
                title="Tema Terang (Putih Bersih)"
              >
                <span class="w-2.5 h-2.5 rounded-full bg-white border border-slate-300 shrink-0"></span>
                <span>Terang</span>
              </button>
              <button 
                @click="setReaderTheme('dark')"
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer"
                :class="readerTheme === 'dark' 
                  ? 'bg-slate-900 text-slate-100 border border-slate-700 shadow-xs' 
                  : 'text-slate-400 hover:text-white'"
                title="Tema Gelap (Mode Malam)"
              >
                <span class="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-600 shrink-0"></span>
                <span>Gelap</span>
              </button>
            </div>

            <!-- Typography Adjusters (Serif/Sans, Font Size) -->
            <div class="flex items-center gap-1 bg-slate-800/95 backdrop-blur-md p-1 rounded-full border border-slate-700/80 shadow-md">
              <button
                @click="toggleFontFamily"
                class="px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-300 hover:text-white transition cursor-pointer hover:bg-slate-700"
                :title="readerFontFamily === 'serif' ? 'Beralih ke font Modern (Sans)' : 'Beralih ke font Buku Klasik (Serif)'"
              >
                {{ readerFontFamily === 'serif' ? 'Buku (Serif)' : 'Modern (Sans)' }}
              </button>
              <div class="h-3 w-px bg-slate-700"></div>
              <button 
                @click="decreaseFontSize" 
                :disabled="readerFontSize <= 13"
                class="px-2 py-0.5 text-xs text-slate-300 hover:text-indigo-400 disabled:opacity-30 cursor-pointer font-bold"
                title="Perkecil Ukuran Huruf (A-)"
              >
                A-
              </button>
              <span class="text-[11px] font-mono text-indigo-300 font-bold px-1">{{ readerFontSize }}px</span>
              <button 
                @click="increaseFontSize" 
                :disabled="readerFontSize >= 26"
                class="px-2 py-0.5 text-xs text-slate-300 hover:text-indigo-400 disabled:opacity-30 cursor-pointer font-bold"
                title="Perbesar Ukuran Huruf (A+)"
              >
                A+
              </button>
            </div>
          </div>

          <!-- Reflowable Reading Card: Full-width on mobile without side border/gaps, rounded on desktop -->
          <div 
            class="relative w-full rounded-none sm:rounded-3xl border-y sm:border shadow-2xl px-4 sm:px-10 py-5 sm:py-10 transition-colors duration-200 overflow-hidden"
            :class="themeCardClasses"
            :style="{
              fontFamily: readerFontFamily === 'serif' ? 'Georgia, Cambria, &quot;Times New Roman&quot;, serif' : 'system-ui, -apple-system, sans-serif'
            }"
          >
            <!-- Watermark Security Overlay -->
            <div 
              v-if="watermarkMode !== 'off'"
              class="absolute inset-0 pointer-events-none flex flex-col justify-around p-4 sm:p-10 overflow-hidden select-none"
              :class="{
                'opacity-[0.04]': watermarkMode === 'subtle',
                'opacity-[0.08]': watermarkMode === 'normal'
              }"
            >
              <div 
                v-for="i in 3" 
                :key="i" 
                class="transform -rotate-25 font-sans text-[11px] font-medium tracking-widest uppercase text-center"
              >
                SDN PENGASINAN VII • {{ watermarkMemberInfo }}
              </div>
            </div>

            <!-- State A: Loading Text -->
            <div v-if="isLoadingText" class="py-16 text-center space-y-3">
              <Loader2 class="w-7 h-7 animate-spin text-indigo-500 mx-auto" />
              <p class="text-xs font-semibold opacity-70">Menyesuaikan tata letak teks ke ukuran layar...</p>
            </div>

            <!-- State B: Scanned / Cover Fallback -->
            <div 
              v-else-if="currentExtractedText.isScanOnly" 
              class="py-12 px-4 text-center space-y-4 max-w-md mx-auto"
            >
              <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center mx-auto">
                <FileText class="w-6 h-6" />
              </div>
              <div class="space-y-1.5">
                <h4 class="font-bold text-sm sm:text-base">Halaman Gambar / Dokumen Pindaian</h4>
                <p class="text-xs opacity-75 leading-relaxed">
                  Halaman {{ currentPage }} tidak memiliki lapisan teks digital (berupa sampul buku, diagram, atau hasil scan).
                </p>
              </div>
              <button 
                @click="setReadingView('canvas')"
                class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition cursor-pointer shadow-md inline-flex items-center gap-1.5"
              >
                <FileText class="w-4 h-4" />
                <span>Buka Tampilan Halaman Asli</span>
              </button>
            </div>

            <!-- State C: Formatted Reflowable Content -->
            <div v-else class="space-y-4 select-text relative z-10 pb-4" :style="{ fontSize: `${readerFontSize}px` }">
              <!-- Top Page Info -->
              <div class="flex items-center justify-between pb-3 mb-2 border-b text-[11px] opacity-60 font-mono" :class="readerTheme === 'dark' ? 'border-slate-800' : 'border-slate-300/60'">
                <span class="truncate max-w-[200px]">{{ loan?.bookTitle }}</span>
                <span class="shrink-0">Hal {{ currentPage }} / {{ totalPages }}</span>
              </div>

              <!-- Paragraphs -->
              <template v-for="(paragraph, pIdx) in currentExtractedText.paragraphs" :key="pIdx">
                <!-- Chapter / Title Heading -->
                <h3 
                  v-if="isHeadingParagraph(paragraph)"
                  class="font-extrabold text-center tracking-wider uppercase my-4 leading-snug"
                  :class="readerTheme === 'dark' ? 'text-indigo-300' : (readerTheme === 'sepia' ? 'text-[#302013]' : 'text-slate-900')"
                  :style="{ fontSize: `${readerFontSize * 1.25}px` }"
                >
                  {{ paragraph }}
                </h3>

                <!-- Subtitle / Summary block -->
                <div 
                  v-else-if="isSubtitleParagraph(paragraph)"
                  class="font-semibold text-center tracking-wide uppercase opacity-85 my-3 px-2 sm:px-6 leading-relaxed"
                  :style="{ fontSize: `${readerFontSize * 0.88}px` }"
                >
                  {{ paragraph }}
                </div>

                <!-- Body Paragraph: perfectly fits mobile screen, wraps text automatically -->
                <p 
                  v-else 
                  class="leading-[1.8] text-justify sm:text-left indent-4 sm:indent-8 my-3.5 break-words"
                >
                  {{ paragraph }}
                </p>
              </template>
            </div>
          </div>
        </div>

        <!-- Canvas Container with Watermark Security Overlay (FOR PDF ORIGINAL CANVAS) -->
        <div 
          v-else-if="pdfDoc && readingView === 'canvas'"
          class="relative rounded-lg shadow-2xl overflow-hidden bg-white border border-slate-700/50 transition-[width,height] duration-150 shrink-0"
          :style="{
            width: canvasDisplayWidth ? `${canvasDisplayWidth}px` : 'auto',
            height: canvasDisplayHeight ? `${canvasDisplayHeight}px` : 'auto'
          }"
        >
          <!-- Canvas with mathematically locked aspect ratio -->
          <canvas 
            ref="pdfCanvasRef" 
            class="block"
            :style="{
              width: canvasDisplayWidth ? `${canvasDisplayWidth}px` : 'auto',
              height: canvasDisplayHeight ? `${canvasDisplayHeight}px` : 'auto'
            }"
          ></canvas>
          
          <!-- Dynamic Security Watermark (Ultra-soft, unobtrusive to reading) -->
          <div 
            v-if="watermarkMode !== 'off'"
            class="absolute inset-0 pointer-events-none flex flex-col justify-around p-6 sm:p-14 overflow-hidden select-none transition-opacity duration-200"
            :class="{
              'opacity-[0.045]': watermarkMode === 'subtle',
              'opacity-[0.10]': watermarkMode === 'normal'
            }"
          >
            <div 
              v-for="i in (watermarkMode === 'subtle' ? 2 : 3)" 
              :key="i" 
              class="transform -rotate-25 text-slate-800 font-sans text-[11px] sm:text-xs font-medium tracking-widest uppercase select-none text-center"
            >
              SDN PENGASINAN VII • {{ watermarkMemberInfo }}
            </div>

            <!-- Fine footer edge tag -->
            <div class="absolute bottom-2 right-3 text-[9px] font-mono text-slate-500 select-none opacity-40">
              Perpustakaan Digital • Akses Resmi
            </div>
          </div>

          <!-- Loading Page Spinner Overlay -->
          <div 
            v-if="isLoadingPage" 
            class="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px] flex items-center justify-center text-white gap-2 text-xs font-semibold"
          >
            <Loader2 class="w-5 h-5 animate-spin text-indigo-400" />
            <span>Memuat Halaman {{ currentPage }}...</span>
          </div>
        </div>

        <!-- Floating Reading Controller Bar (Thumb-Friendly for Mobile & Desktop) -->
        <div 
          class="fixed bottom-2 sm:bottom-5 z-30 flex items-center transition-all duration-200"
          :class="{ 'opacity-95 hover:opacity-100': isFullscreen }"
        >
          <!-- MINIMIZED DOCK: Ultra compact for landscape / immersive reading -->
          <div 
            v-if="isDockMinimized" 
            class="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/80 text-white text-xs shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <button 
              @click="prevPage" 
              :disabled="currentPage <= 1 || isLoadingPage || isLoadingText"
              class="p-1 hover:text-indigo-400 disabled:opacity-30 cursor-pointer rounded-full"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>

            <span class="font-mono text-[11px] text-slate-300 font-semibold px-1">
              {{ currentPage }} / {{ totalPages || '?' }}
            </span>

            <button 
              @click="nextPage" 
              :disabled="(totalPages > 0 && currentPage >= totalPages) || isLoadingPage || isLoadingText"
              class="p-1 hover:text-indigo-400 disabled:opacity-30 cursor-pointer rounded-full"
              title="Halaman Berikutnya"
            >
              <ChevronRight class="w-4 h-4" />
            </button>

            <div class="h-3 w-px bg-slate-700 mx-0.5"></div>

            <button
              @click="isDockMinimized = false"
              class="p-1 text-slate-400 hover:text-white transition cursor-pointer rounded-full hover:bg-slate-800"
              title="Tampilkan Panel Menu Lengkap"
            >
              <ChevronUp class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- EXPANDED DOCK: Clean tools without redundant top icons -->
          <div 
            v-else 
            class="flex items-center gap-1 sm:gap-2 bg-slate-900/95 backdrop-blur-md px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-slate-700/80 text-white text-xs shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <!-- Prev Button -->
            <button 
              @click="prevPage" 
              :disabled="currentPage <= 1 || isLoadingPage || isLoadingText"
              class="p-1.5 sm:p-2 hover:text-indigo-400 disabled:opacity-30 transition cursor-pointer rounded-full hover:bg-slate-800"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft class="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <!-- Page Jumper -->
            <div class="flex items-center gap-1 font-mono text-[11px] sm:text-xs text-slate-300">
              <input 
                v-model.lazy="pageInput" 
                type="number" 
                min="1" 
                :max="totalPages || 9999"
                @change="handlePageInputChange"
                class="w-9 sm:w-11 bg-slate-800 border border-slate-700 rounded-md text-center py-0.5 text-white font-bold text-xs focus:outline-none focus:border-indigo-500"
              />
              <span class="text-slate-400">/ {{ totalPages || (isEpubMode ? '?' : 1) }}</span>
            </div>

            <!-- Next Button -->
            <button 
              @click="nextPage" 
              :disabled="(totalPages > 0 && currentPage >= totalPages) || isLoadingPage || isLoadingText"
              class="p-1.5 sm:p-2 hover:text-indigo-400 disabled:opacity-30 transition cursor-pointer rounded-full hover:bg-slate-800"
              title="Halaman Berikutnya"
            >
              <ChevronRight class="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div class="h-4 w-px bg-slate-700 mx-0.5"></div>

            <!-- Size / Zoom Decrement -->
            <button 
              @click="decreaseSize" 
              :disabled="canDecreaseSize"
              class="p-1.5 hover:text-indigo-400 disabled:opacity-30 transition cursor-pointer rounded-full hover:bg-slate-800"
              :title="readingView === 'reflow' ? 'Perkecil Ukuran Teks' : 'Perkecil Tampilan'"
            >
              <ZoomOut class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <!-- Size / Zoom Reset Indicator -->
            <button 
              @click="resetSize" 
              class="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold hover:bg-slate-800 text-indigo-300 transition cursor-pointer"
              :title="readingView === 'reflow' ? 'Reset Ukuran Teks (17px)' : 'Reset Ukuran (100%)'"
            >
              {{ sizeLabel }}
            </button>

            <!-- Size / Zoom Increment -->
            <button 
              @click="increaseSize" 
              :disabled="canIncreaseSize"
              class="p-1.5 hover:text-indigo-400 disabled:opacity-30 transition cursor-pointer rounded-full hover:bg-slate-800"
              :title="readingView === 'reflow' ? 'Perbesar Ukuran Teks' : 'Perbesar Tampilan'"
            >
              <ZoomIn class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <div class="h-4 w-px bg-slate-700 mx-0.5"></div>

            <!-- Minimize Dock Button -->
            <button
              @click="isDockMinimized = true"
              class="p-1 sm:p-1.5 text-slate-400 hover:text-white transition cursor-pointer rounded-full hover:bg-slate-800"
              title="Sembunyikan Panel Kontrol (Mode Baca Fokus)"
            >
              <ChevronDown class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- STATE 5: EMBEDDED IFRAME FALLBACK VIEWER (if canvas isn't preferred) -->
      <div 
        v-else-if="viewerMode === 'embed'"
        class="w-full h-full max-w-5xl rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl relative"
      >
        <iframe 
          :src="`${streamUrl}#toolbar=0&navpanes=0&scrollbar=1`"
          class="w-full h-full border-0 bg-slate-800"
          title="e-Book Document Viewer"
        ></iframe>
      </div>

    </main>

    <!-- Bottom Advisory Banner (Desktop Only - Hidden in Mobile Landscape & Fullscreen) -->
    <footer 
      v-if="!isFullscreen" 
      class="bg-slate-950 px-4 py-2 border-t border-slate-850 text-center text-[10px] sm:text-[11px] text-slate-400 shrink-0 hidden lg:flex items-center justify-center gap-2"
    >
      <ShieldCheck class="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      <span>Perpustakaan Digital Resmi SDN Pengasinan VII • Dokumen hanya dapat dibaca in-app tanpa opsi unduh bebas demi kepatuhan lisensi.</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import ePub from 'epubjs';
import type { Loan } from '../types.js';
import { useLibraryStore } from '../stores/library.js';
import { 
  BookOpen, Lock, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  X, Loader2, AlertTriangle, ShieldCheck, Sparkles, Eye, EyeOff, Shield,
  Maximize, Minimize, ChevronDown, ChevronUp, AlignLeft, FileText, Type
} from 'lucide-vue-next';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const props = defineProps<{
  isOpen: boolean;
  loan: Loan | null;
}>();

const emit = defineEmits(['close']);

const router = useRouter();
const store = useLibraryStore();

const readerModalRef = ref<HTMLElement | null>(null);
const readerWorkspaceRef = ref<HTMLElement | null>(null);
const pdfCanvasRef = ref<HTMLCanvasElement | null>(null);
const epubContainerRef = ref<HTMLElement | null>(null);
const isEpubMode = ref(false);
const isLoadingDoc = ref(false);
const isLoadingPage = ref(false);
const errorMessage = ref('');
const currentPage = ref(1);
const totalPages = ref(0);
const pageInput = ref(1);
const viewerMode = ref<'canvas' | 'embed'>('canvas');
const activeWorkingUrl = ref('');

// Reading Mode: 'reflow' (Auto-fit responsive text, like browser reader mode) vs 'canvas' (Original PDF page)
const readingView = ref<'reflow' | 'canvas'>(
  (localStorage.getItem('libra_reader_view') as any) === 'canvas' ? 'canvas' : 'reflow'
);
const readerTheme = ref<'sepia' | 'light' | 'dark'>(
  (localStorage.getItem('libra_reader_theme') as any) || 'sepia'
);
const readerFontSize = ref<number>(
  Number(localStorage.getItem('libra_reader_font_size')) || 17
);
const readerFontFamily = ref<'serif' | 'sans'>(
  (localStorage.getItem('libra_reader_font_family') as any) || 'serif'
);
const isLoadingText = ref(false);
const currentExtractedText = ref<{ paragraphs: string[]; rawText: string; isScanOnly: boolean }>({
  paragraphs: [],
  rawText: '',
  isScanOnly: false
});
const extractedTextCache = new Map<number, { paragraphs: string[]; rawText: string; isScanOnly: boolean }>();

const themeCardClasses = computed(() => {
  if (readerTheme.value === 'sepia') {
    return 'bg-[#FAF4E8] text-[#2C1E14] border-[#EADCC8] shadow-amber-950/20';
  }
  if (readerTheme.value === 'light') {
    return 'bg-white text-slate-900 border-slate-200 shadow-slate-950/20';
  }
  return 'bg-[#0B0F19] text-slate-200 border-slate-800 shadow-black/50';
});

// Fullscreen and immersive reader state
const isFullscreen = ref(false);
const isDockMinimized = ref(false);

const getFullscreenElement = () => {
  return (
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement ||
    null
  );
};

const toggleFullscreen = async () => {
  try {
    const isCurrentlyFs = !!getFullscreenElement();
    if (!isCurrentlyFs) {
      // Prioritaskan reader modal element, fallback ke documentElement
      const elem = readerModalRef.value || document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        await (elem as any).mozRequestFullScreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
    }
  } catch (err: any) {
    console.warn('[EbookReader] Fullscreen toggle error:', err?.message || err);
  }
};

const handleFullscreenChange = () => {
  isFullscreen.value = !!getFullscreenElement();
  setTimeout(() => {
    handleWindowResize();
  }, 100);
  setTimeout(() => {
    handleWindowResize();
  }, 350);
};

// Accurate responsive dimensions (Zero distortion)
const canvasDisplayWidth = ref(0);
const canvasDisplayHeight = ref(0);
const zoomMultiplier = ref(1.0);

// Watermark mode: 'subtle' (Halus 4.5% - default), 'off' (Bersih / Nonaktif), 'normal' (Standar 10%)
const watermarkMode = ref<'subtle' | 'off' | 'normal'>('subtle');

let pdfDoc: any = null;
let renderTask: any = null;
let resizeTimeout: any = null;
let epubBook: any = null;
let epubRendition: any = null;

const watermarkLabel = computed(() => {
  if (watermarkMode.value === 'subtle') return 'Watermark: Halus';
  if (watermarkMode.value === 'off') return 'Watermark: Off';
  return 'Watermark: Standar';
});

const watermarkTooltip = computed(() => {
  if (watermarkMode.value === 'subtle') return 'Watermark Halus (4.5%). Klik untuk menonaktifkan agar lebih nyaman membaca.';
  if (watermarkMode.value === 'off') return 'Watermark Nonaktif. Klik untuk mengaktifkan mode halus.';
  return 'Watermark Standar (10%). Klik untuk beralih ke mode halus.';
});

const isExpired = computed(() => {
  if (!props.loan) return false;
  if (props.loan.status === 'overdue') return true;
  if (!props.loan.dueDate) return false;
  const due = new Date(props.loan.dueDate).getTime();
  const now = new Date().setHours(0, 0, 0, 0);
  return due < now;
});

const watermarkMemberInfo = computed(() => {
  if (store.currentUser) {
    return `${store.currentUser.name} (${store.currentUser.cardNumber})`;
  }
  if (props.loan) {
    return `${props.loan.memberName} (${props.loan.memberCardNumber})`;
  }
  return 'ANGGOTA PERPUSTAKAAN';
});

const streamUrl = computed(() => {
  if (!props.loan) return '';
  if (activeWorkingUrl.value) return activeWorkingUrl.value;

  let ebookUrl = props.loan.ebookUrl || '';
  
  // 1. Fallback jika loan belum memiliki ebookUrl, cari dari buku terkait di store
  if (!ebookUrl) {
    const book = store.books.find(b => 
      (props.loan?.bookId && b.id === props.loan.bookId) ||
      (props.loan?.bookTitle && b.title.trim().toLowerCase() === props.loan.bookTitle.trim().toLowerCase())
    );
    if (book) {
      ebookUrl = book.ebookUrl || (book as any).ebookFile || '';
    }
  }

  const titleParam = encodeURIComponent(props.loan?.bookTitle || '');

  // 2. Jika ebookUrl mengarah ke /uploads/ebooks/
  if (ebookUrl && ebookUrl.startsWith('/uploads/ebooks/')) {
    const filename = ebookUrl.replace('/uploads/ebooks/', '');
    return `/api/ebook-stream/${encodeURIComponent(filename)}?title=${titleParam}`;
  }

  // 3. Jika ada ebookUrl yang valid
  if (ebookUrl) {
    return ebookUrl;
  }

  // 4. Fallback jika masih kosong, streaming langsung berdasarkan judul buku
  if (props.loan?.bookTitle) {
    return `/api/ebook-stream-by-title?title=${titleParam}`;
  }

  return '';
});

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

const formatShortDate = (dateStr?: string | null) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

const cycleWatermarkMode = () => {
  if (watermarkMode.value === 'subtle') {
    watermarkMode.value = 'off';
    store.showToast('Watermark dinonaktifkan (mode membaca bersih)');
  } else if (watermarkMode.value === 'off') {
    watermarkMode.value = 'normal';
    store.showToast('Watermark mode standar diaktifkan');
  } else {
    watermarkMode.value = 'subtle';
    store.showToast('Watermark mode halus diaktifkan (4.5%)');
  }
};

const handleClose = () => {
  if (getFullscreenElement()) {
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    } catch {}
  }
  cleanup();
  emit('close');
};

const goToCatalog = () => {
  handleClose();
  router.push('/');
};

const setReadingView = async (mode: 'reflow' | 'canvas') => {
  readingView.value = mode;
  try {
    localStorage.setItem('libra_reader_view', mode);
  } catch {}
  if (mode === 'reflow') {
    await loadTextForCurrentPage();
  } else {
    await nextTick();
    renderCurrentPage();
  }
};

const setReaderTheme = (theme: 'sepia' | 'light' | 'dark') => {
  readerTheme.value = theme;
  try {
    localStorage.setItem('libra_reader_theme', theme);
  } catch {}
};

const toggleFontFamily = () => {
  readerFontFamily.value = readerFontFamily.value === 'serif' ? 'sans' : 'serif';
  try {
    localStorage.setItem('libra_reader_font_family', readerFontFamily.value);
  } catch {}
};

const decreaseFontSize = () => {
  if (readerFontSize.value > 13) {
    readerFontSize.value--;
    try {
      localStorage.setItem('libra_reader_font_size', String(readerFontSize.value));
    } catch {}
  }
};

const increaseFontSize = () => {
  if (readerFontSize.value < 26) {
    readerFontSize.value++;
    try {
      localStorage.setItem('libra_reader_font_size', String(readerFontSize.value));
    } catch {}
  }
};

const decreaseSize = () => {
  if (readingView.value === 'reflow') {
    decreaseFontSize();
  } else {
    zoomOut();
  }
};

const increaseSize = () => {
  if (readingView.value === 'reflow') {
    increaseFontSize();
  } else {
    zoomIn();
  }
};

const resetSize = () => {
  if (readingView.value === 'reflow') {
    readerFontSize.value = 17;
    try {
      localStorage.setItem('libra_reader_font_size', '17');
    } catch {}
  } else {
    resetZoom();
  }
};

const sizeLabel = computed(() => {
  if (readingView.value === 'reflow') {
    return `${readerFontSize.value}px`;
  }
  return `${Math.round(zoomMultiplier.value * 100)}%`;
});

const canDecreaseSize = computed(() => {
  if (readingView.value === 'reflow') {
    return readerFontSize.value <= 13;
  }
  return zoomMultiplier.value <= 0.6;
});

const canIncreaseSize = computed(() => {
  if (readingView.value === 'reflow') {
    return readerFontSize.value >= 26;
  }
  return zoomMultiplier.value >= 2.5;
});

const cleanTextLine = (text: string): string => {
  return text
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const isHeadingParagraph = (text: string): boolean => {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (/^(BOOK|BAB|CHAPTER|BAGIAN|BAG\.|ACT|SCENE)\b/i.test(trimmed)) return true;
  if (trimmed.length <= 45 && trimmed === trimmed.toUpperCase() && /^[A-Z0-9\s\.\-\—\:\,\'\"]+$/.test(trimmed)) {
    return true;
  }
  return false;
};

const isSubtitleParagraph = (text: string): boolean => {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (trimmed.length > 45 && trimmed.length <= 260 && trimmed === trimmed.toUpperCase()) {
    return true;
  }
  return false;
};

const extractPdfPageText = (textContent: any) => {
  if (!textContent || !textContent.items || textContent.items.length === 0) {
    return { paragraphs: [], rawText: '', isScanOnly: true };
  }

  const items = textContent.items
    .filter((item: any) => item && typeof item.str === 'string' && item.str.trim().length > 0)
    .map((item: any) => {
      const transform = item.transform || [1, 0, 0, 1, 0, 0];
      const x = transform[4] || 0;
      const y = transform[5] || 0;
      const height = item.height || Math.abs(transform[3]) || 12;
      return {
        str: item.str,
        x,
        y,
        height,
        hasEOL: !!item.hasEOL
      };
    });

  if (items.length === 0) {
    return { paragraphs: [], rawText: '', isScanOnly: true };
  }

  // Sort reading order: Top-to-bottom (PDF y is inverted, higher y is higher on the page), then left-to-right (x)
  items.sort((a, b) => {
    const yDiff = b.y - a.y;
    if (Math.abs(yDiff) > 4) {
      return yDiff;
    }
    return a.x - b.x;
  });

  // Group text chunks on the same horizontal line
  const lines: { text: string; y: number; height: number }[] = [];
  let currentLineItems: typeof items = [];
  let currentLineY = items[0].y;

  for (const item of items) {
    if (currentLineItems.length === 0) {
      currentLineItems.push(item);
      currentLineY = item.y;
    } else if (Math.abs(item.y - currentLineY) <= 4.5) {
      currentLineItems.push(item);
    } else {
      currentLineItems.sort((a, b) => a.x - b.x);
      const lineStr = cleanTextLine(currentLineItems.map(i => i.str).join(' '));
      if (lineStr) {
        lines.push({
          text: lineStr,
          y: currentLineY,
          height: currentLineItems[0]?.height || 12
        });
      }
      currentLineItems = [item];
      currentLineY = item.y;
    }
  }

  if (currentLineItems.length > 0) {
    currentLineItems.sort((a, b) => a.x - b.x);
    const lineStr = cleanTextLine(currentLineItems.map(i => i.str).join(' '));
    if (lineStr) {
      lines.push({
        text: lineStr,
        y: currentLineY,
        height: currentLineItems[0]?.height || 12
      });
    }
  }

  if (lines.length === 0) {
    return { paragraphs: [], rawText: '', isScanOnly: true };
  }

  // Group lines into semantic paragraphs
  const paragraphs: string[] = [];
  let currentParagraph = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prevLine = i > 0 ? lines[i - 1] : null;

    const isHeading = isHeadingParagraph(line.text) || isSubtitleParagraph(line.text);
    const isPrevHeading = prevLine ? (isHeadingParagraph(prevLine.text) || isSubtitleParagraph(prevLine.text)) : false;
    const verticalGap = prevLine ? Math.abs(prevLine.y - line.y) : 0;
    const avgHeight = prevLine ? (prevLine.height + line.height) / 2 : line.height;
    const hasBigGap = verticalGap > avgHeight * 1.65;

    const startsNewParagraph = (
      !currentParagraph ||
      isHeading ||
      isPrevHeading ||
      hasBigGap ||
      (prevLine && /[.!?]["']?$/.test(prevLine.text) && prevLine.text.length < 60)
    );

    if (startsNewParagraph) {
      if (currentParagraph) {
        paragraphs.push(currentParagraph.trim());
      }
      currentParagraph = line.text;
    } else {
      if (currentParagraph.endsWith('-')) {
        currentParagraph = currentParagraph.slice(0, -1) + line.text;
      } else {
        currentParagraph += ' ' + line.text;
      }
    }
  }

  if (currentParagraph) {
    paragraphs.push(currentParagraph.trim());
  }

  const rawText = paragraphs.join('\n\n');
  const totalLetters = rawText.replace(/[^a-zA-Z0-9]/g, '').length;

  return {
    paragraphs,
    rawText,
    isScanOnly: totalLetters < 20
  };
};

const loadTextForCurrentPage = async () => {
  if (!pdfDoc || isExpired.value) return;

  const pageNum = currentPage.value;
  if (extractedTextCache.has(pageNum)) {
    currentExtractedText.value = extractedTextCache.get(pageNum)!;
    return;
  }

  isLoadingText.value = true;
  try {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const result = extractPdfPageText(textContent);
    extractedTextCache.set(pageNum, result);
    currentExtractedText.value = result;

    // Prefetch adjacent next page in background for instant reading
    if (pageNum + 1 <= totalPages.value && !extractedTextCache.has(pageNum + 1)) {
      pdfDoc.getPage(pageNum + 1).then(async (p: any) => {
        const tc = await p.getTextContent();
        extractedTextCache.set(pageNum + 1, extractPdfPageText(tc));
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('[EbookReader] Failed extracting page text:', err);
    currentExtractedText.value = {
      paragraphs: [],
      rawText: '',
      isScanOnly: true
    };
  } finally {
    isLoadingText.value = false;
  }
};

const isPdfBuffer = (buffer: ArrayBuffer): boolean => {
  if (buffer.byteLength < 4) return false;
  const bytes = new Uint8Array(buffer.slice(0, 4));
  return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46; // %PDF
};

const isEpubBuffer = (buffer: ArrayBuffer): boolean => {
  if (buffer.byteLength < 4) return false;
  const bytes = new Uint8Array(buffer.slice(0, 4));
  return bytes[0] === 0x50 && bytes[1] === 0x4B; // PK Zip header
};

const applyEpubTheme = () => {
  if (!epubRendition) return;
  const pct = Math.round(zoomMultiplier.value * 100);
  epubRendition.themes.fontSize(`${pct}%`);
  epubRendition.themes.default({
    body: {
      'font-family': 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important',
      'line-height': '1.7 !important',
      'padding': '16px 20px !important',
      'color': '#0f172a !important',
      'background-color': '#ffffff !important'
    },
    'p, div, span, li': {
      'line-height': '1.7 !important'
    }
  });
};

const loadEpubFromBuffer = async (buffer: ArrayBuffer) => {
  if (epubRendition) {
    try { epubRendition.destroy(); } catch {}
    epubRendition = null;
  }
  if (epubBook) {
    try { epubBook.destroy(); } catch {}
    epubBook = null;
  }

  isEpubMode.value = true;
  epubBook = (ePub as any)(buffer);
  await epubBook.ready;

  await nextTick();

  if (epubContainerRef.value) {
    epubContainerRef.value.innerHTML = '';

    epubRendition = epubBook.renderTo(epubContainerRef.value, {
      width: '100%',
      height: '100%',
      flow: 'paginated',
      spread: 'none'
    });

    applyEpubTheme();

    await epubRendition.display();

    epubRendition.on('relocated', (location: any) => {
      if (location && location.start) {
        if (epubBook.locations && epubBook.locations.total > 0) {
          const currentLoc = epubBook.locations.locationFromCfi(location.start.cfi);
          currentPage.value = currentLoc || 1;
          totalPages.value = epubBook.locations.total || 1;
          pageInput.value = currentPage.value;
        }
      }
    });

    epubRendition.on('keyup', (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevPage();
      if (e.key === 'ArrowRight') nextPage();
    });

    // Generate locations for page numbers
    epubBook.locations.generate(1200).then(() => {
      if (epubRendition && epubRendition.location && epubRendition.location.start) {
        const currentLoc = epubBook.locations.locationFromCfi(epubRendition.location.start.cfi);
        currentPage.value = currentLoc || 1;
        totalPages.value = epubBook.locations.total || 1;
        pageInput.value = currentPage.value;
      }
    }).catch((err: any) => {
      console.warn('ePub locations generation:', err);
    });
  }
};

const cleanup = () => {
  if (renderTask) {
    try {
      renderTask.cancel();
    } catch {}
    renderTask = null;
  }
  if (epubRendition) {
    try {
      epubRendition.destroy();
    } catch {}
    epubRendition = null;
  }
  if (epubBook) {
    try {
      epubBook.destroy();
    } catch {}
    epubBook = null;
  }
  isEpubMode.value = false;
  pdfDoc = null;
  currentPage.value = 1;
  totalPages.value = 0;
  errorMessage.value = '';
  zoomMultiplier.value = 1.0;
  viewerMode.value = 'canvas';
  activeWorkingUrl.value = '';
  extractedTextCache.clear();
  currentExtractedText.value = { paragraphs: [], rawText: '', isScanOnly: false };
  isLoadingText.value = false;
};

const loadDocument = async () => {
  if (!props.isOpen || !props.loan || isExpired.value) return;

  let ebookUrl = props.loan.ebookUrl || '';
  if (!ebookUrl) {
    const book = store.books.find(b => 
      (props.loan?.bookId && b.id === props.loan.bookId) ||
      (props.loan?.bookTitle && b.title.trim().toLowerCase() === props.loan.bookTitle.trim().toLowerCase())
    );
    if (book) {
      ebookUrl = book.ebookUrl || (book as any).ebookFile || '';
    }
  }

  const bookTitle = props.loan.bookTitle || '';
  const titleParam = encodeURIComponent(bookTitle);
  const rawFilename = ebookUrl && ebookUrl.startsWith('/uploads/ebooks/') 
    ? ebookUrl.replace('/uploads/ebooks/', '') 
    : '';

  // Bangun daftar kandidat URL fallback (prioritaskan cache-buster agar tidak tertahan oleh cache 404 Cloudflare/Proxy)
  const timestamp = Date.now();
  const rawCandidates: string[] = [];

  // Jika sebelumnya sudah ada activeWorkingUrl, prioritaskan
  if (activeWorkingUrl.value) {
    rawCandidates.push(activeWorkingUrl.value);
  }

  // 1. Streaming by filename dengan query judul (agar backend bisa fuzzy match jika nama file berbeda)
  if (rawFilename) {
    rawCandidates.push(`/api/ebook-stream/${encodeURIComponent(rawFilename)}?title=${titleParam}&_cb=${timestamp}`);
    rawCandidates.push(`/api/ebook-stream/${encodeURIComponent(rawFilename)}`);
  }

  // 2. Streaming cerdas berdasarkan judul buku (sangat ampuh jika nama file di disk berbeda)
  if (bookTitle) {
    rawCandidates.push(`/api/ebook-stream-by-title?title=${titleParam}&_cb=${timestamp}`);
    rawCandidates.push(`/api/ebook-stream-by-title?title=${titleParam}`);
  }

  // 3. Jika ebookUrl eksternal atau path langsung
  if (ebookUrl) {
    if (rawFilename) {
      rawCandidates.push(`/uploads/ebooks/${encodeURIComponent(rawFilename)}?_cb=${timestamp}`);
      rawCandidates.push(`/uploads/ebooks/${encodeURIComponent(rawFilename)}`);
    } else {
      const sep = ebookUrl.includes('?') ? '&' : '?';
      rawCandidates.push(`${ebookUrl}${sep}_cb=${timestamp}`);
      rawCandidates.push(ebookUrl);
    }
  }

  // Hilangkan duplikat
  const candidateUrls = Array.from(new Set(rawCandidates.filter(Boolean)));

  if (candidateUrls.length === 0) {
    errorMessage.value = 'Tautan dokumen e-Book belum tersedia untuk buku ini.';
    return;
  }

  cleanup();
  isLoadingDoc.value = true;
  errorMessage.value = '';

  let loaded = false;
  let lastError: any = null;

  for (const candidate of candidateUrls) {
    try {
      console.log(`[EbookReader] Mencoba memuat e-Book dari: ${candidate}`);
      
      const response = await fetch(candidate);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Gagal mengunduh file e-Book`);
      }

      const buffer = await response.arrayBuffer();

      const isPdf = isPdfBuffer(buffer);
      const isEpub = isEpubBuffer(buffer) || candidate.toLowerCase().includes('.epub') || props.loan?.ebookFormat === 'epub';

      if (isEpub && !isPdf) {
        await loadEpubFromBuffer(buffer);
        activeWorkingUrl.value = candidate;
        isLoadingDoc.value = false;
        loaded = true;
        break;
      } else {
        isEpubMode.value = false;
        const loadingTask = pdfjsLib.getDocument({
          data: buffer
        });

        pdfDoc = await loadingTask.promise;
        totalPages.value = pdfDoc.numPages;
        currentPage.value = 1;
        pageInput.value = 1;
        isLoadingDoc.value = false;
        activeWorkingUrl.value = candidate;
        loaded = true;

        await nextTick();
        if (readingView.value === 'reflow') {
          await loadTextForCurrentPage();
        } else {
          await renderCurrentPage();
        }
        break;
      }
    } catch (err: any) {
      console.warn(`[EbookReader] Gagal memuat dari ${candidate}:`, err?.message || err);
      lastError = err;
    }
  }

  if (!loaded) {
    isLoadingDoc.value = false;
    errorMessage.value = lastError?.message || 'File dokumen e-Book tidak ditemukan di server produksi.';
  }
};

const renderCurrentPage = async () => {
  if (!pdfDoc || !pdfCanvasRef.value || isExpired.value) return;

  if (renderTask) {
    try {
      renderTask.cancel();
    } catch {}
    renderTask = null;
  }

  isLoadingPage.value = true;

  try {
    const page = await pdfDoc.getPage(currentPage.value);
    const canvas = pdfCanvasRef.value;
    const context = canvas.getContext('2d');
    if (!context) return;

    // 1. Get intrinsic unscaled dimensions at 1.0 scale
    const unscaledViewport = page.getViewport({ scale: 1.0 });

    // 2. Calculate available width in the reader workspace
    const container = readerWorkspaceRef.value;
    const containerWidth = container ? container.clientWidth : window.innerWidth;
    const isLandscapeMobile = window.innerHeight < 550;
    const isCompact = window.innerWidth < 640 || isLandscapeMobile || isFullscreen.value;
    
    // Exact padding: 12px when compact/mobile/landscape/fullscreen, 40px on large desktop
    const horizontalPadding = isCompact ? 12 : 40;
    const availableWidth = Math.max(260, containerWidth - horizontalPadding);

    // 3. Compute scale to fit width seamlessly without distortion
    let targetScale = (availableWidth / unscaledViewport.width) * zoomMultiplier.value;
    
    // On large screens, avoid an overly huge page if zoomMultiplier is 1.0
    if (!isCompact && zoomMultiplier.value === 1.0 && unscaledViewport.width * targetScale > 850) {
      targetScale = 850 / unscaledViewport.width;
    }

    const viewport = page.getViewport({ scale: targetScale });
    const outputScale = window.devicePixelRatio || 1;

    // 4. Set canvas pixel resolution for retina rendering
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);

    // 5. Explicit CSS dimensions guarantee 100% accurate aspect ratio
    canvasDisplayWidth.value = Math.floor(viewport.width);
    canvasDisplayHeight.value = Math.floor(viewport.height);

    canvas.style.width = `${canvasDisplayWidth.value}px`;
    canvas.style.height = `${canvasDisplayHeight.value}px`;

    const transform = outputScale !== 1 
      ? [outputScale, 0, 0, outputScale, 0, 0] 
      : undefined;

    const renderContext = {
      canvasContext: context,
      transform,
      viewport
    };

    renderTask = page.render(renderContext);
    await renderTask.promise;
    pageInput.value = currentPage.value;
  } catch (err: any) {
    if (err?.name !== 'RenderingCancelledException') {
      console.error('Error rendering page:', err);
    }
  } finally {
    isLoadingPage.value = false;
  }
};

const prevPage = async () => {
  if (isEpubMode.value && epubRendition) {
    epubRendition.prev();
    return;
  }
  if (currentPage.value > 1) {
    currentPage.value--;
    pageInput.value = currentPage.value;
    if (readingView.value === 'reflow') {
      await loadTextForCurrentPage();
      if (readerWorkspaceRef.value) {
        readerWorkspaceRef.value.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      renderCurrentPage();
    }
  }
};

const nextPage = async () => {
  if (isEpubMode.value && epubRendition) {
    epubRendition.next();
    return;
  }
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    pageInput.value = currentPage.value;
    if (readingView.value === 'reflow') {
      await loadTextForCurrentPage();
      if (readerWorkspaceRef.value) {
        readerWorkspaceRef.value.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      renderCurrentPage();
    }
  }
};

const handlePageInputChange = async () => {
  const target = Number(pageInput.value);
  if (isEpubMode.value && epubBook && epubBook.locations && epubRendition) {
    if (target >= 1 && (!totalPages.value || target <= totalPages.value)) {
      const cfi = epubBook.locations.cfiFromLocation(target);
      if (cfi) {
        epubRendition.display(cfi);
      }
      currentPage.value = target;
      pageInput.value = target;
    } else {
      pageInput.value = currentPage.value;
    }
    return;
  }

  if (target >= 1 && target <= totalPages.value) {
    currentPage.value = target;
    if (readingView.value === 'reflow') {
      await loadTextForCurrentPage();
      if (readerWorkspaceRef.value) {
        readerWorkspaceRef.value.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      renderCurrentPage();
    }
  } else {
    pageInput.value = currentPage.value;
  }
};

const zoomIn = () => {
  if (zoomMultiplier.value < 2.5) {
    zoomMultiplier.value = Number((zoomMultiplier.value + 0.15).toFixed(2));
    if (isEpubMode.value) {
      applyEpubTheme();
    } else {
      renderCurrentPage();
    }
  }
};

const zoomOut = () => {
  if (zoomMultiplier.value > 0.6) {
    zoomMultiplier.value = Number((zoomMultiplier.value - 0.15).toFixed(2));
    if (isEpubMode.value) {
      applyEpubTheme();
    } else {
      renderCurrentPage();
    }
  }
};

const resetZoom = () => {
  zoomMultiplier.value = 1.0;
  if (isEpubMode.value) {
    applyEpubTheme();
  } else {
    renderCurrentPage();
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (!props.isOpen || isExpired.value) return;
  if (e.key === 'ArrowLeft') prevPage();
  if (e.key === 'ArrowRight') nextPage();
  if (e.key === 'f' || e.key === 'F') {
    if ((e.target as HTMLElement)?.tagName !== 'INPUT') {
      e.preventDefault();
      toggleFullscreen();
    }
  }
  if (e.key === 'Escape') {
    if (isFullscreen.value) {
      // Browser secara native menangani Esc untuk keluar dari fullscreen
      return;
    }
    handleClose();
  }
};

const handleWindowResize = () => {
  if (!props.isOpen) return;
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (isEpubMode.value && epubRendition) {
      epubRendition.resize();
    } else if (pdfDoc) {
      renderCurrentPage();
    }
  }, 150);
};

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);
});

// Watcher gabungan untuk menangani pemuatan ulang dokumen
watch(
  [() => props.isOpen, () => props.loan],
  ([newOpen, newLoan], [oldOpen, oldLoan]) => {
    if (newOpen) {
      // Jika loan berubah atau modal baru dibuka, reset state URL aktif
      if (newLoan !== oldLoan) {
        activeWorkingUrl.value = '';
      }
      zoomMultiplier.value = 1.0;
      loadDocument();
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('resize', handleWindowResize);
    } else {
      cleanup();
      activeWorkingUrl.value = ''; // Pastikan dibersihkan saat modal tutup
      if (getFullscreenElement()) {
        try {
          if (document.exitFullscreen) document.exitFullscreen();
          else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
        } catch {}
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleWindowResize);
    }
  },
  { deep: true }
);

watch(
  () => props.loan?.id,
  () => {
    activeWorkingUrl.value = '';
  }
);

onUnmounted(() => {
  cleanup();
  if (getFullscreenElement()) {
    try {
      if (document.exitFullscreen) document.exitFullscreen();
      else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
    } catch {}
  }
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('resize', handleWindowResize);
});
</script>

<style scoped>
:fullscreen,
:-webkit-full-screen {
  background-color: rgb(2, 6, 23);
  width: 100vw;
  height: 100vh;
}

.custom-reader-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-reader-scroll::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.6);
}
.custom-reader-scroll::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.3);
  border-radius: 9999px;
}
.custom-reader-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.6);
}
</style>

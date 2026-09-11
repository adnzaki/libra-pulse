import { watch, onUnmounted, type Ref } from 'vue';

/**
 * Composable untuk menangani tombol Back pada HP/browser saat modal terbuka:
 * - Ketika modal terbuka, push state sementara ke history tanpa mengubah route URL.
 * - Mencatat posisi scroll saat ini agar posisi membaca/menjelajah pengguna tidak terlempar ke atas.
 * - Ketika pengguna menekan tombol Back di smartphone/browser, modal akan ditutup (bukan berpindah halaman).
 * - Ketika pengguna menutup modal lewat tombol X, tombol batal, atau backdrop, state history dibersihkan kembali
 *   dan posisi scroll pengguna dipulihkan secara instan tanpa loncat ke navbar.
 */
export function useModalBack(
  isOpenSource: Ref<boolean> | (() => boolean),
  onClose: () => void,
  modalKey = 'modal'
) {
  let isBackTriggeredByPopState = false;
  let hasPushedState = false;
  let savedScrollY = 0;

  const getIsOpen = () => (typeof isOpenSource === 'function' ? isOpenSource() : isOpenSource.value);

  const restoreScroll = () => {
    if (typeof window === 'undefined') return;
    const targetY = savedScrollY;
    const applyScroll = () => {
      if (typeof window !== 'undefined' && Math.abs(window.scrollY - targetY) > 1) {
        window.scrollTo({ top: targetY, left: 0, behavior: 'instant' as ScrollBehavior });
      }
    };
    applyScroll();
    requestAnimationFrame(applyScroll);
    setTimeout(applyScroll, 20);
    setTimeout(applyScroll, 80);
    setTimeout(applyScroll, 160);
  };

  const handlePopState = () => {
    if (getIsOpen()) {
      isBackTriggeredByPopState = true;
      hasPushedState = false;
      onClose();
      restoreScroll();
    }
  };

  const watchSource = typeof isOpenSource === 'function' ? isOpenSource : () => isOpenSource.value;

  watch(watchSource, (newVal) => {
    if (newVal) {
      isBackTriggeredByPopState = false;
      // Catat posisi scroll sebelum modal muncul
      savedScrollY = typeof window !== 'undefined' ? window.scrollY : 0;

      // Pertahankan state bawaan vue-router dan sertakan informasi scroll
      const currentHistoryState = (typeof window !== 'undefined' && window.history && window.history.state) 
        ? { ...window.history.state } 
        : {};
      
      try {
        window.history.pushState(
          { 
            ...currentHistoryState, 
            [modalKey]: true, 
            activeModal: modalKey, 
            ts: Date.now(),
            scroll: { left: 0, top: savedScrollY }
          },
          '',
          window.location.href
        );
        hasPushedState = true;
      } catch (err) {
        console.warn('Gagal pushState untuk modal back handler:', err);
      }

      window.addEventListener('popstate', handlePopState);
    } else {
      window.removeEventListener('popstate', handlePopState);
      if (hasPushedState && !isBackTriggeredByPopState) {
        hasPushedState = false;
        try {
          window.history.back();
        } catch (err) {
          // ignore
        }
      }
      isBackTriggeredByPopState = false;
      hasPushedState = false;
      restoreScroll();
    }
  });

  onUnmounted(() => {
    window.removeEventListener('popstate', handlePopState);
    if (hasPushedState && !isBackTriggeredByPopState) {
      try {
        window.history.back();
      } catch (err) {
        // ignore
      }
    }
  });
}


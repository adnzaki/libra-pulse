import { watch, onUnmounted, type Ref } from 'vue';

/**
 * Composable untuk menangani tombol Back pada HP/browser saat modal terbuka:
 * - Ketika modal terbuka, push state sementara ke history tanpa mengubah route URL.
 * - Ketika pengguna menekan tombol Back di smartphone/browser, modal akan ditutup (bukan berpindah halaman).
 * - Ketika pengguna menutup modal lewat tombol X, tombol batal, atau backdrop, state history dibersihkan kembali secara rapi.
 */
export function useModalBack(
  isOpenSource: Ref<boolean> | (() => boolean),
  onClose: () => void,
  modalKey = 'modal'
) {
  let isBackTriggeredByPopState = false;
  let hasPushedState = false;

  const getIsOpen = () => (typeof isOpenSource === 'function' ? isOpenSource() : isOpenSource.value);

  const handlePopState = () => {
    if (getIsOpen()) {
      isBackTriggeredByPopState = true;
      hasPushedState = false;
      onClose();
    }
  };

  const watchSource = typeof isOpenSource === 'function' ? isOpenSource : () => isOpenSource.value;

  watch(watchSource, (newVal) => {
    if (newVal) {
      isBackTriggeredByPopState = false;
      // Pertahankan state bawaan vue-router
      const currentHistoryState = (typeof window !== 'undefined' && window.history && window.history.state) 
        ? { ...window.history.state } 
        : {};
      
      try {
        window.history.pushState(
          { ...currentHistoryState, [modalKey]: true, activeModal: modalKey, ts: Date.now() },
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

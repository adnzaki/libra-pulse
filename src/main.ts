import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { registerSW } from 'virtual:pwa-register';
import App from './App.vue';
import router from './router/index.js';
import './index.css';

// Register Service Worker for PWA installability & offline support
if ('serviceWorker' in navigator && !import.meta.env.DEV) {
  try {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('[PWA] Konten versi baru tersedia.');
      },
      onOfflineReady() {
        console.log('[PWA] Libra siap digunakan dalam mode offline.');
      },
    });
  } catch (err) {
    console.warn('[PWA] Service worker skipped:', err);
  }
}

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount('#app');

import type { ChangelogItem, AppVersionConfig } from '../types.js';

/**
 * ============================================================================
 * PUSAT KONFIGURASI BUILD NUMBER & VERSI APLIKASI LIBRA
 * Cukup ubah konstanta APP_BUILD_NUMBER di bawah ini saat ingin merilis build baru!
 * Semua komponen, banner update, modal changelog, dan sinkronisasi Firestore
 * akan secara otomatis mengikuti konstanta ini.
 * ============================================================================
 */
export const APP_BUILD_NUMBER = '10002';
export const CURRENT_APP_VERSION = '1.0.0';
export const APP_RELEASE_DATE = '4 November 2026';
export const APP_RELEASE_CODENAME = `Libra Stabil (Build ${APP_BUILD_NUMBER})`;

export const DEFAULT_APP_VERSION_CONFIG: AppVersionConfig = {
  version: CURRENT_APP_VERSION,
  buildNumber: APP_BUILD_NUMBER,
  releaseDate: APP_RELEASE_DATE,
  forceReload: false,
  minSupportedVersion: '1.0.0',
  updateMessage: `Pembaruan aplikasi Libra v${CURRENT_APP_VERSION} (Build ${APP_BUILD_NUMBER}) telah tersedia dengan penyempurnaan alur muat ulang bebas blank screen dan peningkatan stabilitas sistem.`,
  changelogSummary: `Rilis Stabil v${CURRENT_APP_VERSION} Build ${APP_BUILD_NUMBER}: Konstanta Build Number Terpusat dan Perbaikan Blank Screen saat Muat Ulang Pembaruan.`
};

export const CHANGELOG_LIST: ChangelogItem[] = [
  {
    id: 'fix-blank-screen-reload-10002',
    title: 'Perbaikan Kendala Blank Screen saat Muat Ulang Pembaruan',
    description:
      'Memperbaiki kendala halaman blank putih saat mengklik tombol "Muat Ulang Halaman" pada banner pembaruan. Sistem kini secara otomatis membersihkan cache storage browser, memperbarui service worker di latar belakang, dan melakukan pemuatan ulang dengan cache-busting sehingga versi terbaru langsung aktif dengan mulus.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'fix',
    badge: `Build ${APP_BUILD_NUMBER}`,
    iconName: 'RefreshCw',
  },
  {
    id: 'feature-centralized-build-number',
    title: 'Konfigurasi Nomor Build Terpusat (Single Source of Truth)',
    description:
      `Nomor build aplikasi (${APP_BUILD_NUMBER}) kini dikelola melalui satu konstanta terpusat (APP_BUILD_NUMBER) di src/config/version.ts. Mengubah nilai konstanta ini akan otomatis memperbarui tampilan banner versi, riwayat changelog, footer, serta payload sinkronisasi Firestore tanpa perlu mengedit komponen lain secara manual.`,
    targetAudience: 'admin',
    targetAudienceLabel: 'Khusus Admin',
    category: 'improvement',
    badge: 'Sistem',
    iconName: 'Sparkles',
  },
  {
    id: 'feature-buku-tamu-online',
    title: 'Penambahan Fitur Buku Tamu & Presensi Kunjungan Online',
    description:
      'Sistem presensi kunjungan perpustakaan terintegrasi untuk pengunjung umum dan check-in cepat kartu anggota digital (scan QR kamera, nomor kartu/ID, serta pencarian instan nama anggota dengan jeda server 500ms). Dilengkapi token harian perpustakaan, modal QR scan dark-mode friendly, tombol akses khusus mobile, dan rekapitulasi data kunjungan lengkap.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'feature',
    badge: 'Buku Tamu Online',
    iconName: 'ClipboardCheck',
  },
  {
    id: 'admin-panels-pagination',
    title: 'Penambahan Pagination untuk Seluruh Modul Panel Admin',
    description:
      'Menerapkan pagination terpadu bergaya Master Data Buku dengan default 25 data per halaman serta pemilih fleksibel baris (10, 25, 50 baris) pada seluruh modul: Sirkulasi Pinjaman Aktif, Booking 24 Jam, Riwayat Peminjaman Selesai, Kelola Anggota, Verifikasi Guru, Verifikasi Siswa, Master Data Buku, Pengelolaan Kategori, dan Notifikasi Keterlambatan.',
    targetAudience: 'admin',
    targetAudienceLabel: 'Khusus Admin',
    category: 'improvement',
    badge: 'Panel Admin',
    iconName: 'ListOrdered',
  },
  {
    id: 'fix-deleted-books-reappearing',
    title: 'Perbaikan Bug Koleksi Buku yang Muncul Kembali Setelah Dihapus',
    description:
      'Menyelesaikan kendala buku-buku dummy yang sempat muncul kembali pasca dihapus. Memperkuat sistem penanda nisan (tombstone filter) permanen pada memori lokal dan Cloud Firestore, memastikan setiap buku yang dihapus tidak akan pernah dipulihkan atau dimuat ulang kembali.',
    targetAudience: 'admin',
    targetAudienceLabel: 'Khusus Admin',
    category: 'fix',
    badge: 'Katalog Buku',
    iconName: 'ShieldAlert',
  },
  {
    id: 'calm-elegant-update-banner',
    title: 'Pembaruan Tampilan Pemberitahuan Update Aplikasi yang Tenang & Elegan',
    description:
      'Memperbarui desain notifikasi update aplikasi dengan perpaduan warna yang lebih tenang (calm), gradasi halus (subtle gradient), latar belakang kaca modern (soft glassmorphism), tipografi jernih, dan tata letak tombol yang lebih rapi serta nyaman dipandang.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'improvement',
    badge: 'Antarmuka UI',
    iconName: 'Sparkles',
  },
];

/**
 * Parses semantic version string into numbers and identifiers
 * e.g. "1.0.0" -> { major: 1, minor: 0, patch: 0, prerelease: "" }
 */
function parseSemVer(v: string) {
  const clean = v.trim().replace(/^v/i, '');
  const [core, prerelease] = clean.split('-');
  const parts = core.split('.').map(n => parseInt(n, 10) || 0);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
    prerelease: prerelease || '',
    raw: v
  };
}

/**
 * Returns true if remoteVersion is newer than currentVersion,
 * or if they differ and remote is considered a newer release.
 */
export function isNewerVersion(remoteVersion: string, currentVersion: string = CURRENT_APP_VERSION): boolean {
  if (!remoteVersion || !currentVersion) return false;
  if (remoteVersion.trim() === currentVersion.trim()) return false;

  const r = parseSemVer(remoteVersion);
  const c = parseSemVer(currentVersion);

  if (r.major !== c.major) return r.major > c.major;
  if (r.minor !== c.minor) return r.minor > c.minor;
  if (r.patch !== c.patch) return r.patch > c.patch;

  // If major.minor.patch are equal, compare prerelease
  // e.g. "1.0.0" is newer than "1.0.0-rc.1"
  if (!r.prerelease && c.prerelease) return true;
  if (r.prerelease && !c.prerelease) return false;

  // Compare prerelease identifiers, e.g. "rc.1" vs "beta.5"
  return r.prerelease.localeCompare(c.prerelease, undefined, { numeric: true }) > 0;
}

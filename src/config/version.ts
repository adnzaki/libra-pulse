import type { ChangelogItem, AppVersionConfig } from '../types.js';

export const CURRENT_APP_VERSION = '1.0.0-beta.1';
export const APP_RELEASE_DATE = '13 September 2026';
export const APP_RELEASE_CODENAME = 'Libra Genesis Beta 1';

export const DEFAULT_APP_VERSION_CONFIG: AppVersionConfig = {
  version: CURRENT_APP_VERSION,
  releaseDate: APP_RELEASE_DATE,
  forceReload: false,
  minSupportedVersion: '1.0.0-beta.1',
  updateMessage: 'Pembaruan sistem Libra versi 1.0.0-beta.1 telah dirilis dengan peningkatan stabilitas dan fitur baru.',
  changelogSummary: 'Penambahan pengajuan status guru, manajemen multi-perangkat, optimalisasi kuota Firestore, dan deteksi versi real-time.'
};

export const CHANGELOG_LIST: ChangelogItem[] = [
  {
    id: 'teacher-status-request',
    title: 'Pengajuan Perubahan Status Akun Siswa ke Guru',
    description: 'Siswa atau staf sekolah kini dapat mengajukan permohonan verifikasi untuk meningkatkan jenis akun menjadi Guru secara mandiri dengan melampirkan NIP/Identitas resmi dan berkas pendukung. Admin dapat meninjau, menyetujui, atau menolak permohonan dengan catatan transparan. Setelah disetujui, batas peminjaman bertambah hingga 10 buku secara otomatis.',
    targetAudience: 'member',
    targetAudienceLabel: 'Khusus Siswa & Guru',
    category: 'feature',
    badge: 'Fitur Unggulan',
    iconName: 'GraduationCap'
  },
  {
    id: 'admin-teacher-approval',
    title: 'Panel Verifikasi Permohonan Guru untuk Admin',
    description: 'Panel khusus bagi Administrator untuk mengelola permohonan kenaikan status guru yang masuk secara real-time, lengkap dengan badge indikator jumlah permohonan pending di navigasi bar dan riwayat peninjauan.',
    targetAudience: 'admin',
    targetAudienceLabel: 'Khusus Admin & Pengelola',
    category: 'feature',
    badge: 'Admin Console',
    iconName: 'ShieldCheck'
  },
  {
    id: 'multi-device-management',
    title: 'Manajemen Sesi Login Multi-Perangkat Real-time',
    description: 'Pantau secara transparan seluruh perangkat yang sedang aktif mengakses akun Anda (Ponsel Android/iOS, Tablet, Desktop/Laptop) dengan detail peramban, sistem operasi, dan waktu aktivitas terakhir melalui Cloud Firestore.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna (Siswa, Guru, Admin)',
    category: 'security',
    badge: 'Keamanan Akun',
    iconName: 'Laptop'
  },
  {
    id: 'main-device-otp-verification',
    title: 'Konsep Perangkat Utama (Main Device) & Verifikasi OTP Email',
    description: 'Tetapkan satu perangkat terpercaya sebagai "Perangkat Utama" melalui kode OTP email 6-digit. Hanya Perangkat Utama yang memiliki wewenang penuh untuk mencabut sesi login aktif atau me-logout paksa perangkat lain dari jarak jauh.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'security',
    badge: 'Otorisasi Keamanan',
    iconName: 'Crown'
  },
  {
    id: 'mobile-device-modal-fix',
    title: 'Penyempurnaan Tampilan Mobile Manajemen Sesi & Tombol Tutup',
    description: 'Menyempurnakan tata letak modal Manajemen Sesi dan sub-modal verifikasi di layar ponsel sehingga tombol Tutup dan tombol silang (X) tampil proporsional tanpa terpotong atau mengharuskan pengguna zoom out.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'improvement',
    badge: 'UI/UX Responsif',
    iconName: 'Smartphone'
  },
  {
    id: 'firestore-zero-write-optimization',
    title: 'Optimasi Kuota Cloud Firestore (Zero Background Auto-Write)',
    description: 'Mengeliminasi interval background write yang berpotensi memicu lonjakan kuota 20.000 writes pada Firestore. Pengecekan denda dan status penangguhan (suspend) diubah menjadi in-memory calculation cerdas tanpa membebani kuota, dilengkapi circuit breaker pemulihan otomatis.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'fix',
    badge: 'Stabilitas & Cloud',
    iconName: 'Database'
  },
  {
    id: 'realtime-version-detection',
    title: 'Sistem Deteksi Pembaruan Versi Real-time & Panduan Cache',
    description: 'Aplikasi memantau versi rilis terbaru secara real-time via Firestore. Saat pembaruan terdeteksi, banner interaktif langsung muncul lengkap dengan tombol muat ulang cepat dan panduan langkah pembersihan cache browser.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'feature',
    badge: 'Sistem Otomasi',
    iconName: 'RefreshCw'
  },
  {
    id: 'smart-qr-card-hold-24h',
    title: 'Pembaruan Kartu Anggota Digital QR & Sistem Booking 24 Jam',
    description: 'Peningkatan kecepatan render kartu barcode QR anggota resolusi tinggi untuk scanner meja sirkulasi serta pengamanan hold booking 24 jam dengan penghitungan mundur otomatis.',
    targetAudience: 'member',
    targetAudienceLabel: 'Khusus Siswa & Guru',
    category: 'improvement',
    badge: 'Member Portal',
    iconName: 'QrCode'
  },
  {
    id: 'superadmin-permission-isolation',
    title: 'Pemisahan Otoritas Super Admin & Pengaturan Kritis',
    description: 'Konfigurasi batas suspend, kuota denda, dan pencadangan database kini diisolasi secara ketat untuk Super Admin, menjaga keamanan integritas sistem perpustakaan sekolah.',
    targetAudience: 'admin',
    targetAudienceLabel: 'Khusus Admin & Pengelola',
    category: 'security',
    badge: 'Hak Akses Sistem',
    iconName: 'Lock'
  }
];

/**
 * Parses semantic version string into numbers and identifiers
 * e.g. "1.0.0-beta.1" -> { major: 1, minor: 0, patch: 0, prerelease: "beta.1" }
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
  // e.g. "1.0.0" is newer than "1.0.0-beta.1"
  if (!r.prerelease && c.prerelease) return true;
  if (r.prerelease && !c.prerelease) return false;

  // Compare beta numbers, e.g. "beta.2" vs "beta.1"
  return r.prerelease.localeCompare(c.prerelease, undefined, { numeric: true }) > 0;
}

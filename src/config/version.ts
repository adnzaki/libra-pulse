import type { ChangelogItem, AppVersionConfig } from '../types.js';

export const CURRENT_APP_VERSION = '1.0.0-beta.2';
export const APP_RELEASE_DATE = '16 September 2026';
export const APP_RELEASE_CODENAME = 'Libra Aurora Beta 2';

export const DEFAULT_APP_VERSION_CONFIG: AppVersionConfig = {
  version: CURRENT_APP_VERSION,
  releaseDate: APP_RELEASE_DATE,
  forceReload: false,
  minSupportedVersion: '1.0.0-beta.2',
  updateMessage: 'Pembaruan sistem Libra versi 1.0.0-beta.2 telah dirilis dengan penambahan fitur manajemen sesi multi-perangkat terpusat dan dukungan buku digital (e-Book) interaktif.',
  changelogSummary: 'Menambahkan fitur manajemen sesi multi-perangkat real-time dengan verifikasi OTP, serta dukungan penuh untuk peminjaman dan in-app reader buku digital (e-Book) dengan proteksi lisensi dan kenyamanan tampilan mobile.'
};

export const CHANGELOG_LIST: ChangelogItem[] = [
  {
    id: 'ebook-integration',
    title: 'Dukungan Koleksi Buku Digital (e-Book)',
    description: 'Menambahkan dukungan penuh untuk koleksi buku digital (e-Book) di katalog perpustakaan. Siswa dan Guru kini dapat meminjam dan mengakses bahan bacaan digital secara langsung dengan kuota peminjaman berjangka dan batas waktu jatuh tempo otomatis.',
    targetAudience: 'member',
    targetAudienceLabel: 'Khusus Siswa & Guru',
    category: 'feature',
    badge: 'Fitur Unggulan',
    iconName: 'BookOpen'
  },
  {
    id: 'ebook-inapp-reader',
    title: 'In-App PDF Reader & Proteksi Dokumen Berlisensi',
    description: 'Membaca buku digital kini dapat dilakukan langsung di dalam aplikasi (in-app reader) dengan perenderan beresolusi tinggi, navigasi ramah jempol (lompat halaman dan zoom), proteksi hak cipta watermark halus, serta teknologi streaming byte-range aman yang mencegah unduhan bebas dokumen.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'feature',
    badge: 'E-Book Reader',
    iconName: 'Sparkles'
  },
  {
    id: 'ebook-mobile-aspect-ratio',
    title: 'Optimalisasi Tampilan Layar Ponsel & Kontrol Watermark',
    description: 'Penyempurnaan rasio tampilan e-Book pada perangkat ponsel agar teks tidak terdistorsi/teregang, dilengkapi tombol pengatur intensitas watermark (mode Halus 4.5%, Nonaktif, atau Standar) untuk kenyamanan membaca buku pelajaran secara maksimal.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'improvement',
    badge: 'UI/UX Responsif',
    iconName: 'Smartphone'
  },
  {
    id: 'multi-device-management',
    title: 'Fitur Manajemen Sesi & Multi-Perangkat Real-time',
    description: 'Menambahkan fitur manajemen sesi komprehensif untuk memantau seluruh perangkat aktif (Ponsel Android/iOS, Tablet, Desktop) yang terhubung ke akun Anda, lengkap dengan rincian sistem operasi, peramban, lokasi perangkat, dan waktu aktivitas terakhir.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna (Siswa, Guru, Admin)',
    category: 'security',
    badge: 'Keamanan Akun',
    iconName: 'Laptop'
  },
  {
    id: 'main-device-otp-verification',
    title: 'Perangkat Utama (Main Device) & Verifikasi OTP Email',
    description: 'Tetapkan satu perangkat terpercaya sebagai "Perangkat Utama" melalui kode OTP email 6-digit. Memberikan perlindungan ekstra dengan hak istimewa untuk mencabut sesi login atau me-logout paksa perangkat lain dari jarak jauh (remote logout).',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'security',
    badge: 'Otorisasi Keamanan',
    iconName: 'Crown'
  },
  {
    id: 'mobile-device-modal-fix',
    title: 'Penyempurnaan Tampilan Mobile Modal Sesi & Navigasi',
    description: 'Menyempurnakan tata letak modal Manajemen Sesi di layar ponsel sehingga tombol Tutup dan tombol silang (X) tampil proporsional tanpa terpotong atau mengharuskan pengguna melakukan zoom out.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'improvement',
    badge: 'UI/UX Responsif',
    iconName: 'Smartphone'
  },
  {
    id: 'teacher-status-request',
    title: 'Pengajuan Perubahan Status Akun Siswa ke Guru',
    description: 'Tenaga Pendidik / Kependidikan kini dapat mengajukan perubahan status akun dari Siswa menjadi Guru melalui proses verifikasi foto selfie di menu Portal.',
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
    id: 'realtime-version-detection',
    title: 'Sistem Deteksi Pembaruan Versi Real-time & Panduan Cache',
    description: 'Pemantauan versi rilis terbaru secara real-time untuk mempermudah pengguna ketika terdapat versi terbaru dari aplikasi.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'feature',
    badge: 'Sistem Otomasi',
    iconName: 'RefreshCw'
  },
  {
    id: 'firestore-zero-write-optimization',
    title: 'Optimasi Penyimpanan Data ke Database',
    description: 'Mengoptimalkan proses penyimpanan data ke database dengan mengurangi proses penulisan data yang tidak perlu untuk meningkatkan performa aplikasi.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'fix',
    badge: 'Stabilitas & Cloud',
    iconName: 'Database'
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

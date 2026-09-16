import type { ChangelogItem, AppVersionConfig } from '../types.js';

export const CURRENT_APP_VERSION = '1.0.0-beta.2';
export const APP_RELEASE_DATE = '16 September 2026';
export const APP_RELEASE_CODENAME = 'Libra Aurora Beta 2';

export const DEFAULT_APP_VERSION_CONFIG: AppVersionConfig = {
  version: CURRENT_APP_VERSION,
  releaseDate: APP_RELEASE_DATE,
  forceReload: false,
  minSupportedVersion: '1.0.0-beta.2',
  updateMessage: 'Pembaruan sistem Libra versi 1.0.0-beta.2 telah dirilis dengan penambahan fitur manajemen sesi multi-perangkat terpusat dan dukungan buku digital (e-Book) interaktif PDF & ePub.',
  changelogSummary: 'Menambahkan fitur manajemen sesi multi-perangkat real-time, serta dukungan penuh untuk buku digital (e-Book) dalam format PDF & ePub dengan in-app reader tanpa distorsi mobile, watermark halus ergonomis, pagination data buku, dan pencarian independen per-tab.'
};

export const CHANGELOG_LIST: ChangelogItem[] = [
  {
    id: 'session-management',
    title: 'Manajemen Sesi Multi-Perangkat Terpusat',
    description: 'Menambahkan fitur manajemen sesi terpusat dengan deteksi perangkat aktif, riwayat login, dan kemampuan mengakhiri sesi lain secara jarak jauh (remote logout) secara instan.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'feature',
    badge: 'Fitur Unggulan',
    iconName: 'ShieldCheck'
  },
  {
    id: 'ebook-integration',
    title: 'Dukungan Koleksi Buku Digital (e-Book) PDF & ePub',
    description: 'Menambahkan dukungan penuh untuk koleksi buku digital (e-Book) baik dalam format PDF maupun ePub. Pengguna dapat membaca langsung di peramban dengan penyesuaian font reflowable, rasio aspek presisi bebas distorsi di layar ponsel, serta pilihan intensitas watermark.',
    targetAudience: 'member',
    targetAudienceLabel: 'Khusus Siswa & Guru',
    category: 'feature',
    badge: 'Koleksi Digital',
    iconName: 'BookOpen'
  },
  {
    id: 'search-pagination-improvements',
    title: 'Pencarian Independen Per-Tab & Pagination Data',
    description: 'Memperbaiki kotak pencarian di Master Data Buku admin agar berfungsi maksimal dan memisahkan model pencarian antar-tab (Sirkulasi, Booking, Kelola Anggota, Verifikasi Guru, Master Buku, dan Kategori). Menambahkan sistem pagination untuk katalog buku dan master data buku admin.',
    targetAudience: 'admin',
    targetAudienceLabel: 'Khusus Admin',
    category: 'improvement',
    badge: 'Produktivitas',
    iconName: 'Sparkles'
  },
  {
    id: 'digital-label-form',
    title: 'Label Otomatis Digital & Penyempurnaan Form Buku',
    description: 'Pada form tambah/edit buku digital, isian lokasi rak digantikan secara otomatis dengan label Digital, menyederhanakan proses katalogisasi buku elektronik tanpa memerlukan alokasi rak fisik perpustakaan.',
    targetAudience: 'admin',
    targetAudienceLabel: 'Khusus Admin',
    category: 'improvement',
    badge: 'Manajemen Data',
    iconName: 'Bookmark'
  },
  {
    id: 'mobile-reader-comfort',
    title: 'Kenyamanan Membaca Layar Ponsel & Watermark Halus',
    description: 'Menghilangkan distorsi regangan teks pada tampilan e-Book di layar ponsel dengan rasio aspek matematis yang presisi, serta menurunkan intensitas watermark menjadi sangat halus agar nyaman dibaca dan tidak menghalangi teks buku.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'improvement',
    badge: 'Kenyamanan Baca',
    iconName: 'Smartphone'
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

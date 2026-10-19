import type { ChangelogItem, AppVersionConfig } from '../types.js';

export const CURRENT_APP_VERSION = '1.0.0-rc.2';
export const APP_RELEASE_DATE = '19 Oktober 2026';
export const APP_RELEASE_CODENAME = 'Libra Aurora RC 2';

export const DEFAULT_APP_VERSION_CONFIG: AppVersionConfig = {
  version: CURRENT_APP_VERSION,
  releaseDate: APP_RELEASE_DATE,
  forceReload: false,
  minSupportedVersion: '1.0.0-rc.2',
  updateMessage: 'Pembaruan sistem Libra versi 1.0.0-rc.2 telah dirilis dengan peningkatan tampilan menu pengelolaan data perpustakaan pada panel admin, penyempurnaan seluruh komponen drop-down, perbaikan drop-down pilihan rak pada katalog buku agar tidak melebihi layar mobile, serta pembersihan menu dan opsi yang tidak digunakan.',
  changelogSummary: 'Peningkatan menu pengelolaan admin, penyempurnaan desain drop-down, perbaikan drop-down rak pada layar mobile, dan pembersihan opsi yang tidak digunakan.'
};

export const CHANGELOG_LIST: ChangelogItem[] = [
  {
    id: 'admin-management-menu-enhancement',
    title: 'Peningkatan Tampilan Menu Pengelolaan Data Perpustakaan pada Panel Admin',
    description: 'Menyempurnakan antarmuka modal Menu Pengelolaan Data Perpustakaan dengan tata letak grid bento modern, kategorisasi modul terstruktur (Koleksi & Sirkulasi, Keanggotaan, Master Data), pencarian instan, dan integrasi modul penataan rak.',
    targetAudience: 'admin',
    targetAudienceLabel: 'Khusus Admin',
    category: 'improvement',
    badge: 'Panel Admin',
    iconName: 'LayoutGrid'
  },
  {
    id: 'dropdown-components-redesign',
    title: 'Peningkatan Tampilan & Interaktivitas Seluruh Komponen Drop-down',
    description: 'Memperbarui desain visual dan kenyamanan interaksi semua komponen drop-down (CustomSelect) di seluruh sistem dengan aksen glassmorphism, rotasi panah indikator yang halus, penyorotan status aktif yang lebih tegas, serta dukungan tema yang konsisten.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'improvement',
    badge: 'Antarmuka UI',
    iconName: 'Sliders'
  },
  {
    id: 'fix-shelf-dropdown-mobile-width',
    title: 'Perbaikan Drop-down Pilihan Lokasi Rak pada Tampilan Mobile',
    description: 'Memperbaiki kendala menu drop-down pilihan rak pada halaman katalog buku yang sebelumnya melebihi lebar layar pada tampilan ponsel (mobile), kini tampil proporsional, rapi, dan terkunci sempurna di dalam batas layar.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'fix',
    badge: 'Responsivitas Mobile',
    iconName: 'Layers'
  },
  {
    id: 'clean-unused-menus-and-options',
    title: 'Pembersihan Menu & Opsi yang Tidak Digunakan',
    description: 'Menghapus menu, opsi pemilih, serta elemen antarmuka yang tidak digunakan atau redundan di seluruh aplikasi guna menciptakan navigasi yang lebih ringkas, intuitif, dan efisien.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'improvement',
    badge: 'Penyederhanaan',
    iconName: 'CheckCircle'
  }
];

/**
 * Parses semantic version string into numbers and identifiers
 * e.g. "1.0.0-rc.1" -> { major: 1, minor: 0, patch: 0, prerelease: "rc.1" }
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

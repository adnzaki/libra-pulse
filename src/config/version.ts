import type { ChangelogItem, AppVersionConfig } from '../types.js';

export const CURRENT_APP_VERSION = '1.0.0-beta.4';
export const APP_RELEASE_DATE = '27 September 2026';
export const APP_RELEASE_CODENAME = 'Libra Aurora Beta 4';

export const DEFAULT_APP_VERSION_CONFIG: AppVersionConfig = {
  version: CURRENT_APP_VERSION,
  releaseDate: APP_RELEASE_DATE,
  forceReload: false,
  minSupportedVersion: '1.0.0-beta.4',
  updateMessage: 'Pembaruan sistem Libra versi 1.0.0-beta.4 telah dirilis dengan peningkatan fitur manajemen booking (auto delete expired booking), penyelarasan tampilan antarmuka mobile yang lebih rapi, dan fitur urutan rak khusus admin.',
  changelogSummary: 'Peningkatan manajemen booking dengan auto-delete expired booking, penyelarasan tampilan antarmuka mobile yang lebih rapi, dan penambahan fitur urutan rak khusus admin.'
};

export const CHANGELOG_LIST: ChangelogItem[] = [
  {
    id: 'auto-delete-expired-booking',
    title: 'Peningkatan Fitur Manajemen Booking (Auto-Delete Expired Booking)',
    description: 'Sistem kini otomatis membersihkan data booking yang telah kadaluarsa (melewati batas waktu 24 jam) secara real-time dan langsung mengembalikan stok buku ke rak perpustakaan baik di sisi member maupun admin.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'improvement',
    badge: 'Otomatisasi Sistem',
    iconName: 'Clock'
  },
  {
    id: 'mobile-ui-enhancement',
    title: 'Peningkatan Kualitas Tampilan Antarmuka Versi Mobile',
    description: 'Penyelarasan tata letak menu dan tombol pada layar mobile ke dalam susunan grid 2-kolom yang rapi, seragam, dan proporsional tanpa ada menu yang panjang-pendek tidak seimbang.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'improvement',
    badge: 'Tampilan & UX',
    iconName: 'Smartphone'
  },
  {
    id: 'shelf-ordering-admin',
    title: 'Fitur Urutan & Tata Letak Rak (Khusus Admin)',
    description: 'Menambahkan fitur bagi Administrator untuk mengatur ulang urutan dan posisi penataan rak buku secara fleksibel melalui metode drag-and-drop maupun tombol cepat di halaman tata letak rak.',
    targetAudience: 'admin',
    targetAudienceLabel: 'Khusus Admin',
    category: 'feature',
    badge: 'Fitur Baru',
    iconName: 'Layers'
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

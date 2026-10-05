import type { ChangelogItem, AppVersionConfig } from '../types.js';

export const CURRENT_APP_VERSION = '1.0.0-rc.1';
export const APP_RELEASE_DATE = '5 Oktober 2026';
export const APP_RELEASE_CODENAME = 'Libra Aurora RC 1';

export const DEFAULT_APP_VERSION_CONFIG: AppVersionConfig = {
  version: CURRENT_APP_VERSION,
  releaseDate: APP_RELEASE_DATE,
  forceReload: false,
  minSupportedVersion: '1.0.0-rc.1',
  updateMessage: 'Pembaruan sistem Libra versi 1.0.0-rc.1 telah dirilis dengan peningkatan tampilan navigasi menu modul khusus Admin, penambahan fitur Riwayat Peminjaman pada Panel Admin dan Portal Anggota, serta perbaikan penutupan notifikasi pengembalian e-Book.',
  changelogSummary: 'Peningkatan tampilan tab menu khusus Admin, penambahan fitur Riwayat Peminjaman di Panel Admin & Portal Anggota, serta perbaikan penutupan notifikasi e-Book yang telah dikembalikan.'
};

export const CHANGELOG_LIST: ChangelogItem[] = [
  {
    id: 'admin-menu-tab-modal',
    title: 'Peningkatan Tampilan & Navigasi Menu Modul Khusus Admin',
    description: 'Menata ulang deretan tab menu pada Panel Admin menjadi satu tombol pemilih modul interaktif berbasis modal yang lebih ringkas, rapi, dan mudah dinavigasi di berbagai ukuran layar.',
    targetAudience: 'admin',
    targetAudienceLabel: 'Khusus Admin',
    category: 'improvement',
    badge: 'Tampilan & Navigasi',
    iconName: 'Layout'
  },
  {
    id: 'loan-history-feature',
    title: 'Fitur Riwayat Peminjaman untuk Panel Admin & Portal Anggota',
    description: 'Menambahkan menu serta fitur Riwayat Peminjaman pada Panel Admin dan Portal Anggota untuk melihat daftar peminjaman yang telah berlalu, tidak aktif, atau sudah dikembalikan baik untuk koleksi buku fisik maupun e-Book.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'feature',
    badge: 'Fitur Baru',
    iconName: 'History'
  },
  {
    id: 'fix-ebook-returned-notification-dismiss',
    title: 'Perbaikan Penutupan Pemberitahuan e-Book Telah Dikembalikan',
    description: 'Memperbaiki kendala pada banner pemberitahuan e-Book telah dikembalikan yang sebelumnya tetap muncul kembali meskipun pengguna sudah menekan tombol tutup (X), sehingga kini langsung tertutup secara permanen.',
    targetAudience: 'member',
    targetAudienceLabel: 'Khusus Siswa & Guru',
    category: 'fix',
    badge: 'Perbaikan Bug',
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

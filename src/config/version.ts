import type { ChangelogItem, AppVersionConfig } from '../types.js';

export const CURRENT_APP_VERSION = '1.0.0-beta.3';
export const APP_RELEASE_DATE = '25 September 2026';
export const APP_RELEASE_CODENAME = 'Libra Aurora Beta 3';

export const DEFAULT_APP_VERSION_CONFIG: AppVersionConfig = {
  version: CURRENT_APP_VERSION,
  releaseDate: APP_RELEASE_DATE,
  forceReload: false,
  minSupportedVersion: '1.0.0-beta.3',
  updateMessage: 'Pembaruan sistem Libra versi 1.0.0-beta.3 telah dirilis dengan verifikasi siswa peminjam e-Book, penerapan logo baru ke seluruh sistem, serta perbaikan instalasi PWA ke homescreen / start menu.',
  changelogSummary: 'Menambahkan verifikasi siswa yang hendak meminjam e-Book, menerapkan logo baru aplikasi ke seluruh sistem, dan memperbaiki sistem PWA tidak bisa diinstal ke homescreen / start menu.'
};

export const CHANGELOG_LIST: ChangelogItem[] = [
  {
    id: 'student-verification',
    title: 'Verifikasi Siswa Peminjam e-Book',
    description: 'Menambahkan alur verifikasi data siswa (NIS, NISN, dan foto selfie) sebelum meminjam dan membaca koleksi buku digital (e-Book), lengkap dengan peninjauan dan persetujuan oleh admin perpustakaan.',
    targetAudience: 'member',
    targetAudienceLabel: 'Khusus Siswa & Guru',
    category: 'feature',
    badge: 'Fitur Baru',
    iconName: 'ShieldCheck'
  },
  {
    id: 'new-app-logo',
    title: 'Penerapan Logo Baru ke Seluruh Sistem',
    description: 'Menerapkan identitas visual dan logo baru aplikasi Libra secara menyeluruh di seluruh sistem (navbar, halaman login, profil pengguna, dan kartu anggota).',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'improvement',
    badge: 'Identitas Visual',
    iconName: 'Sparkles'
  },
  {
    id: 'pwa-install-fix',
    title: 'Perbaikan Instalasi PWA ke Homescreen / Start Menu',
    description: 'Memperbaiki kendala sistem PWA yang sebelumnya tidak bisa diinstal ke homescreen perangkat Android/Chrome maupun start menu desktop, kini dapat dipasang langsung dengan icon resmi Libra.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Perangkat',
    category: 'fix',
    badge: 'Perbaikan Sistem',
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

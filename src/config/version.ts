import type { ChangelogItem, AppVersionConfig } from '../types.js';

export const CURRENT_APP_VERSION = '1.0.0-beta.5';
export const APP_RELEASE_DATE = '1 Oktober 2026';
export const APP_RELEASE_CODENAME = 'Libra Aurora Beta 5';

export const DEFAULT_APP_VERSION_CONFIG: AppVersionConfig = {
  version: CURRENT_APP_VERSION,
  releaseDate: APP_RELEASE_DATE,
  forceReload: false,
  minSupportedVersion: '1.0.0-beta.5',
  updateMessage: 'Pembaruan sistem Libra versi 1.0.0-beta.5 telah dirilis dengan fitur pengembalian e-Book secara mandiri oleh pengguna, dukungan tema antarmuka multimode (Light, Dark, dan Elegant), serta penyempurnaan desain navigasi bebas batas (seamless UI).',
  changelogSummary: 'Fitur baru pengembalian e-Book mandiri untuk siswa dan guru, dukungan tema Light, Dark & Elegant, serta penyempurnaan tampilan antarmuka seamless tanpa garis batas.'
};

export const CHANGELOG_LIST: ChangelogItem[] = [
  {
    id: 'self-service-ebook-return',
    title: 'Pengembalian e-Book Mandiri oleh Pengguna',
    description: 'Anggota perpustakaan (Siswa & Guru) kini dapat mengembalikan e-Book pinjaman secara mandiri kapan saja langsung melalui Portal Pinjaman Saya atau reader dokumen internal. Kuota peminjaman aktif pengguna akan langsung bebas kembali seketika tanpa perlu menunggu masa kedaluwarsa habis atau meminta bantuan admin.',
    targetAudience: 'member',
    targetAudienceLabel: 'Khusus Siswa & Guru',
    category: 'feature',
    badge: 'Fitur Baru',
    iconName: 'RotateCcw'
  },
  {
    id: 'multimode-theme-support',
    title: 'Dukungan Tema Antarmuka Multimode: Light, Dark, dan Elegant',
    description: 'Menghadirkan pemilih tema visual 3-mode yang fleksibel di menu akun dan navigasi: Tema Light (Terang) dengan kontras tinggi untuk kenyamanan baca di siang hari, Tema Dark (Gelap) hemat daya yang ramah mata untuk pencahayaan minim, serta Tema Elegant bernuansa semi-gelap dengan efek kaca akrilik transparan (acrylic glassmorphism & mica blur) ala Windows 11 Fluent Design.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'feature',
    badge: 'Kustomisasi Tema',
    iconName: 'Palette'
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

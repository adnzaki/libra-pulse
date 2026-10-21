import type { ChangelogItem, AppVersionConfig } from '../types.js';

export const CURRENT_APP_VERSION = '1.0.0-rc.3';
export const APP_RELEASE_DATE = '21 Oktober 2026';
export const APP_RELEASE_CODENAME = 'Libra Aurora RC 3';

export const DEFAULT_APP_VERSION_CONFIG: AppVersionConfig = {
  version: CURRENT_APP_VERSION,
  releaseDate: APP_RELEASE_DATE,
  forceReload: false,
  minSupportedVersion: '1.0.0-rc.3',
  updateMessage: 'Pembaruan sistem Libra versi 1.0.0-rc.3 telah dirilis dengan perbaikan proporsi foto profil kartu member agar bebas distorsi/gepeng saat dicetak (PDF & PNG), serta peningkatan kontras warna teks dan latar belakang di berbagai komponen antarmuka, khususnya pada tema terang (Light Mode).',
  changelogSummary: 'Perbaikan proporsi foto kartu member saat dicetak/diunduh dan peningkatan kontras teks pada dropdown serta elemen tema terang.'
};

export const CHANGELOG_LIST: ChangelogItem[] = [
  {
    id: 'member-card-photo-aspect-ratio-fix',
    title: 'Perbaikan Proporsi Foto Kartu Anggota Saat Dicetak & Diunduh',
    description:
      'Memperbaiki kendala foto profil anggota yang sebelumnya terdistorsi, melebar, atau gepeng saat kartu dicetak ke PDF maupun diunduh ke format PNG. Kini renderer kartu menerapkan kalkulasi rasio aspek presisi dengan pemotongan cerdas (smart cover crop) dan penghalusan gambar berkualitas tinggi agar foto tetap proporsional dan jernih.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'fix',
    badge: 'Kartu Anggota',
    iconName: 'CreditCard',
  },
  {
    id: 'light-mode-dropdown-contrast-enhancement',
    title: 'Peningkatan Kontras Warna Teks & Latar Belakang Komponen',
    description:
      'Meningkatkan kontras warna antara teks, ikon, dan latar belakang pada beberapa komponen antarmuka—termasuk menu drop-down pilihan ukuran cetak kartu dan jendela popover saat mode terang (Light Mode) aktif—sehingga seluruh teks terbaca dengan jelas, tajam, dan memenuhi standar aksesibilitas visual.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'improvement',
    badge: 'Aksesibilitas UI',
    iconName: 'Sun',
  },
]

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

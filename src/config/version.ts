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
  {
    id: 'admin-management-menu-enhancement',
    title:
      'Peningkatan Tampilan Menu Pengelolaan Data Perpustakaan pada Panel Admin',
    description:
      'Menyempurnakan antarmuka modal Menu Pengelolaan Data Perpustakaan dengan tata letak grid bento modern, kategorisasi modul terstruktur (Koleksi & Sirkulasi, Keanggotaan, Master Data), pencarian instan, dan integrasi modul penataan rak.',
    targetAudience: 'admin',
    targetAudienceLabel: 'Khusus Admin',
    category: 'improvement',
    badge: 'Panel Admin',
    iconName: 'LayoutGrid',
  },
  {
    id: 'dropdown-components-redesign',
    title: 'Peningkatan Tampilan & Interaktivitas Seluruh Komponen Drop-down',
    description:
      'Memperbarui desain visual dan kenyamanan interaksi semua komponen drop-down (CustomSelect) di seluruh sistem dengan aksen glassmorphism, rotasi panah indikator yang halus, penyorotan status aktif yang lebih tegas, serta dukungan tema yang konsisten.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'improvement',
    badge: 'Antarmuka UI',
    iconName: 'Sliders',
  },
  {
    id: 'fix-shelf-dropdown-mobile-width',
    title: 'Perbaikan Drop-down Pilihan Lokasi Rak pada Tampilan Mobile',
    description:
      'Memperbaiki kendala menu drop-down pilihan rak pada halaman katalog buku yang sebelumnya melebihi lebar layar pada tampilan ponsel (mobile), kini tampil proporsional, rapi, dan terkunci sempurna di dalam batas layar.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'fix',
    badge: 'Responsivitas Mobile',
    iconName: 'Layers',
  },
  {
    id: 'clean-unused-menus-and-options',
    title: 'Pembersihan Menu & Opsi yang Tidak Digunakan',
    description:
      'Menghapus menu, opsi pemilih, serta elemen antarmuka yang tidak digunakan atau redundan di seluruh aplikasi guna menciptakan navigasi yang lebih ringkas, intuitif, dan efisien.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'improvement',
    badge: 'Penyederhanaan',
    iconName: 'CheckCircle',
  },
  {
    id: 'public-catalog-pagination-mobile-jump',
    title:
      'Perbaikan Pagination Katalog Publik di Layar Mobile dengan Input Lompat Halaman',
    description:
      'Menyederhanakan navigasi halaman katalog buku pada layar ponsel (mobile) dengan posisi pilihan jumlah baris sejajar full-width di samping teks informasi, menghapus label redundan, serta menggantikan deretan tombol angka pagination dengan satu input lompat halaman (jump-to-page) yang rapi dan responsif.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'fix',
    badge: 'Katalog Publik',
    iconName: 'ArrowRightCircle',
  },
  {
    id: 'book-form-cover-url-unsplash-responsive',
    title:
      'Penyesuaian Komponen Input URL & Tombol Acak Unsplash pada Form Data Buku',
    description:
      'Menyesuaikan komponen input tautan URL cover dan tombol Acak Unsplash pada form data buku agar tidak melebihi lebar layar ponsel, tersusun rapi secara responsif, dan mudah dioperasikan.',
    targetAudience: 'admin',
    targetAudienceLabel: 'Khusus Admin',
    category: 'fix',
    badge: 'Form Data Buku',
    iconName: 'Image',
  },
  {
    id: 'add-transition-to-all-floating-components',
    title: 'Penambahan Transisi pada Semua Komponen Melayang',
    description:
      'Menambahkan efek transisi halus pada semua komponen melayang di aplikasi untuk meningkatkan pengalaman pengguna dan membuat navigasi lebih halus.',
    targetAudience: 'all',
    targetAudienceLabel: 'Semua Pengguna',
    category: 'improvement',
    badge: 'Floating Elements',
    iconName: 'Transition',
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

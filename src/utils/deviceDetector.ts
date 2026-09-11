export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string;
  os: string;
}

const DEVICE_ID_KEY = 'libra_device_id';

/**
 * Mendapatkan atau membuat ID unik permanen untuk perangkat / browser ini
 */
export function getCurrentDeviceId(): string {
  if (typeof window === 'undefined') return 'device_unknown';
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

/**
 * Mendeteksi detail spesifikasi perangkat, sistem operasi, dan peramban (browser)
 */
export function detectCurrentDeviceInfo(): DeviceInfo {
  const deviceId = getCurrentDeviceId();
  if (typeof navigator === 'undefined') {
    return {
      deviceId,
      deviceName: 'Perangkat Web',
      deviceType: 'desktop',
      browser: 'Browser',
      os: 'Unknown OS',
    };
  }

  const ua = navigator.userAgent || '';
  
  // Deteksi Tipe Perangkat
  let deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'desktop';
  if (/iPad|Tablet|(android(?!.*mobile))/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    deviceType = 'mobile';
  }

  // Deteksi Sistem Operasi
  let os = 'Unknown OS';
  if (/Windows NT 10.0/i.test(ua)) os = 'Windows 10/11';
  else if (/Windows NT 6.3/i.test(ua)) os = 'Windows 8.1';
  else if (/Windows NT 6.2/i.test(ua)) os = 'Windows 8';
  else if (/Windows NT 6.1/i.test(ua)) os = 'Windows 7';
  else if (/Mac OS X/i.test(ua)) {
    if (/iPhone/i.test(ua)) os = 'iOS (iPhone)';
    else if (/iPad/i.test(ua)) os = 'iPadOS';
    else os = 'macOS';
  }
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/CrOS/i.test(ua)) os = 'Chrome OS';

  // Deteksi Peramban / Browser
  let browser = 'Web Browser';
  if (/Edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua) && !/OPR\//i.test(ua)) browser = 'Google Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Mozilla Firefox';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Apple Safari';
  else if (/OPR\//i.test(ua) || /Opera\//i.test(ua)) browser = 'Opera';
  else if (/SamsungBrowser\//i.test(ua)) browser = 'Samsung Internet';

  // Nama Deskriptif yang ramah pengguna
  let deviceName = `${browser} di ${os}`;
  if (deviceType === 'mobile' && /iPhone/i.test(ua)) {
    deviceName = `iPhone (${browser})`;
  } else if (deviceType === 'tablet' && /iPad/i.test(ua)) {
    deviceName = `iPad (${browser})`;
  } else if (deviceType === 'mobile' && /Android/i.test(ua)) {
    deviceName = `HP Android (${browser})`;
  }

  return {
    deviceId,
    deviceName,
    deviceType,
    browser,
    os,
  };
}

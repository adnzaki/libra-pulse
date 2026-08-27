// Cryptographic helper for secure client and server side password hashing using SHA-256 + Salt
const GLOBAL_SALT = 'pustaka_modern_pwa_secure_salt_2026';

export async function hashPassword(plainText: string): Promise<string> {
  if (!plainText) return '';
  // If already hashed (starts with $sha256$), return as is
  if (plainText.startsWith('$sha256$')) {
    return plainText;
  }
  
  const textWithSalt = `${GLOBAL_SALT}:${plainText}`;
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(textWithSalt);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `$sha256$${hashHex}`;
  } else {
    // Node.js fallback or basic hex
    try {
      const crypto = await import('crypto');
      const hash = crypto.createHash('sha256').update(textWithSalt).digest('hex');
      return `$sha256$${hash}`;
    } catch {
      return plainText;
    }
  }
}

export async function verifyPassword(plainInput: string, storedHashOrPlain: string): Promise<boolean> {
  if (!plainInput && !storedHashOrPlain) return true;
  if (!storedHashOrPlain) return false;

  // 1. If stored as modern hash
  if (storedHashOrPlain.startsWith('$sha256$')) {
    const computed = await hashPassword(plainInput);
    return computed === storedHashOrPlain;
  }

  // 2. Legacy plaintext support (seamless backward compatibility)
  return plainInput === storedHashOrPlain;
}

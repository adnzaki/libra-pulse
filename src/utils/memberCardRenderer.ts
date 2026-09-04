import type { Member } from '../types.js';

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = setTimeout(() => {
      resolve(null);
    }, 1500);

    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = src;
  });
}

export async function renderMemberCardToCanvas(
  member: Member,
  qrDataUrl: string,
  theme: 'dark' | 'light' = 'dark',
  activeLoansCount: number = 0
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const width = 1050;
  const height = 660;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const isDark = theme === 'dark';

  // 1. Clip Canvas to Rounded Card
  ctx.save();
  drawRoundedRect(ctx, 0, 0, width, height, 44);
  ctx.clip();

  // 2. Card Background
  if (isDark) {
    if (member.isSuspended) {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#4c0519'); // rose-950
      grad.addColorStop(0.5, '#0f172a'); // slate-900
      grad.addColorStop(1, '#881337'); // rose-900
      ctx.fillStyle = grad;
    } else {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0b162c');
      grad.addColorStop(0.5, '#09152e');
      grad.addColorStop(1, '#060e20');
      ctx.fillStyle = grad;
    }
    ctx.fillRect(0, 0, width, height);

    // Subtle Glow Shimmers
    const rad1 = ctx.createRadialGradient(width - 40, 20, 10, width - 40, 20, 260);
    rad1.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
    rad1.addColorStop(1, 'rgba(59, 130, 246, 0)');
    ctx.fillStyle = rad1;
    ctx.fillRect(width - 300, 0, 300, 300);

    const rad2 = ctx.createRadialGradient(20, height - 20, 10, 20, height - 20, 260);
    rad2.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
    rad2.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = rad2;
    ctx.fillRect(0, height - 300, 300, 300);
  } else {
    // Light Theme
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const rad = ctx.createRadialGradient(width - 50, 50, 10, width - 50, 50, 240);
    rad.addColorStop(0, 'rgba(239, 246, 255, 0.9)');
    rad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = rad;
    ctx.fillRect(width - 300, 0, 300, 300);
  }

  // 3. Card Outer Border
  ctx.strokeStyle = isDark
    ? (member.isSuspended ? 'rgba(244, 63, 94, 0.5)' : 'rgba(51, 65, 85, 0.8)')
    : '#cbd5e1';
  ctx.lineWidth = 4;
  drawRoundedRect(ctx, 2, 2, width - 4, height - 4, 42);
  ctx.stroke();

  // 4. Top Header Row: Libra Logo & Status Pill
  // 4a. Libra Icon Squircle
  drawRoundedRect(ctx, 52, 50, 68, 68, 20);
  ctx.fillStyle = '#2563eb';
  ctx.fill();

  // Draw Book Icon inside Squircle
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  // Open book lines
  ctx.moveTo(70, 72);
  ctx.lineTo(86, 64);
  ctx.lineTo(86, 96);
  ctx.lineTo(70, 104);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(102, 72);
  ctx.lineTo(86, 64);
  ctx.lineTo(86, 96);
  ctx.lineTo(102, 104);
  ctx.closePath();
  ctx.stroke();

  // 4b. Brand Text
  ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
  ctx.font = '800 34px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Libra', 136, 72);

  ctx.fillStyle = isDark ? '#93c5fd' : '#2563eb';
  ctx.font = '700 13px monospace';
  ctx.fillText('DIGITAL MEMBER PASS', 136, 102);

  // 4c. Status Pill (Right)
  const isSuspended = Boolean(member.isSuspended);
  const pillW = isSuspended ? 146 : 108;
  const pillH = 38;
  const pillX = width - 52 - pillW;
  const pillY = 62;

  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 19);
  ctx.fillStyle = isSuspended ? '#f43f5e' : '#10b981';
  ctx.fill();

  // Pulsing Dot
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(pillX + 20, pillY + pillH / 2, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Pill Text
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 14px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(isSuspended ? 'DISUSPEND' : 'AKTIF', pillX + 32, pillY + pillH / 2);

  // 5. Middle Row: Avatar, Member Info & QR Code
  // 5a. Avatar Loading & Drawing
  const avatarX = 52;
  const avatarY = 160;
  const avatarSize = 144;
  const avatarRadius = 26;

  const avatarImg = await loadImageSafe(member.avatar);

  ctx.save();
  drawRoundedRect(ctx, avatarX, avatarY, avatarSize, avatarSize, avatarRadius);
  ctx.clip();

  if (avatarImg) {
    ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
  } else {
    // Fallback Initial Avatar
    const grad = ctx.createLinearGradient(avatarX, avatarY, avatarX + avatarSize, avatarY + avatarSize);
    grad.addColorStop(0, '#3b82f6');
    grad.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = grad;
    ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 48px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const initials = member.name ? member.name.substring(0, 2).toUpperCase() : 'MB';
    ctx.fillText(initials, avatarX + avatarSize / 2, avatarY + avatarSize / 2);
  }
  ctx.restore();

  // Avatar Border
  ctx.strokeStyle = isSuspended ? '#fb7185' : (isDark ? '#60a5fa' : '#3b82f6');
  ctx.lineWidth = 3.5;
  drawRoundedRect(ctx, avatarX, avatarY, avatarSize, avatarSize, avatarRadius);
  ctx.stroke();

  // 5b. Member Info Details
  const textX = 224;
  ctx.textAlign = 'left';

  // Member Name
  ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
  ctx.font = '800 32px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textBaseline = 'top';

  // Truncate name if too long
  let displayName = member.name;
  if (ctx.measureText(displayName).width > 520) {
    while (ctx.measureText(displayName + '...').width > 520 && displayName.length > 5) {
      displayName = displayName.substring(0, displayName.length - 1);
    }
    displayName += '...';
  }
  ctx.fillText(displayName, textX, 172);

  // Email
  ctx.fillStyle = isDark ? '#cbd5e1' : '#475569';
  ctx.font = '500 20px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(member.email || '-', textX, 222);

  // Join Date
  ctx.fillStyle = isDark ? '#93c5fd' : '#2563eb';
  ctx.font = '600 17px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(`Bergabung: ${member.joinDate || '-'}`, textX, 264);

  // 5c. QR Code Box (Right Side)
  const qrBoxSize = 176;
  const qrBoxX = width - 52 - qrBoxSize;
  const qrBoxY = 144;

  // White Card for QR Code
  drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 24);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Draw QR Image
  if (qrDataUrl) {
    const qrImg = await loadImageSafe(qrDataUrl);
    if (qrImg) {
      ctx.drawImage(qrImg, qrBoxX + 12, qrBoxY + 12, qrBoxSize - 24, qrBoxSize - 24);
    }
  }

  // 6. Bottom Row: Divider, Card Number & Active Loans
  const divY = 510;
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(52, divY);
  ctx.lineTo(width - 52, divY);
  ctx.stroke();

  // Left: Nomor Kartu Anggota
  ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
  ctx.font = '600 13px monospace';
  ctx.fillText('NOMOR KARTU ANGGOTA', 52, 545);

  ctx.fillStyle = isDark ? '#fcd34d' : '#1d4ed8';
  ctx.font = '900 32px monospace';
  ctx.fillText(member.cardNumber, 52, 595);

  // Right: Pinjaman Aktif
  ctx.textAlign = 'right';
  ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
  ctx.font = '600 13px monospace';
  ctx.fillText('PINJAMAN AKTIF', width - 52, 545);

  ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
  ctx.font = '800 24px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(`${activeLoansCount} Buku`, width - 52, 595);

  ctx.restore();
  return canvas;
}

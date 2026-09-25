import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

function drawLibraLogo(canvas, isMaskable = false) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const center = size / 2;

  // Clear
  ctx.clearRect(0, 0, size, size);

  // Background
  const bgGrad = ctx.createRadialGradient(center, center * 0.8, size * 0.1, center, center, size * 0.7);
  bgGrad.addColorStop(0, '#1e293b');
  bgGrad.addColorStop(0.5, '#0f172a');
  bgGrad.addColorStop(1, '#020617');

  if (isMaskable) {
    // Full bleed for maskable (Android will clip corners/circle)
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);
  } else {
    // Rounded squircle for standalone display
    const cornerRadius = size * 0.22;
    ctx.beginPath();
    ctx.moveTo(cornerRadius, 0);
    ctx.lineTo(size - cornerRadius, 0);
    ctx.quadraticCurveTo(size, 0, size, cornerRadius);
    ctx.lineTo(size, size - cornerRadius);
    ctx.quadraticCurveTo(size, size, size - cornerRadius, size);
    ctx.lineTo(cornerRadius, size);
    ctx.quadraticCurveTo(0, size, 0, size - cornerRadius);
    ctx.lineTo(0, cornerRadius);
    ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
    ctx.closePath();
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // Subtle border
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = size * 0.015;
    ctx.stroke();
  }

  // Scale factor: if maskable, shrink slightly to fit within 75% safe-zone
  const scale = isMaskable ? 0.72 : 0.86;
  ctx.save();
  ctx.translate(center, center);
  ctx.scale(scale, scale);
  ctx.translate(-center, -center);

  // Background glow behind book
  const glow = ctx.createRadialGradient(center, center * 0.85, 5, center, center * 0.85, size * 0.38);
  glow.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
  glow.addColorStop(0.4, 'rgba(37, 99, 235, 0.2)');
  glow.addColorStop(1, 'rgba(37, 99, 235, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(center, center * 0.85, size * 0.38, 0, Math.PI * 2);
  ctx.fill();

  // Draw Stylized Book Wings
  // Center spine is at x = center, y ranges from center * 0.6 to center * 1.15
  const spineTop = center * 0.65;
  const spineBottom = center * 1.08;

  // Left Wing (3 layered pages)
  // Layer 1 (Outer page / back)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(center, spineBottom);
  ctx.bezierCurveTo(center - size * 0.15, spineBottom - size * 0.05, center - size * 0.35, spineBottom - size * 0.15, center - size * 0.36, center * 0.55);
  ctx.bezierCurveTo(center - size * 0.25, center * 0.60, center - size * 0.12, center * 0.62, center, spineTop);
  ctx.closePath();
  const leftGrad1 = ctx.createLinearGradient(center - size * 0.35, center * 0.6, center, spineBottom);
  leftGrad1.addColorStop(0, '#1d4ed8');
  leftGrad1.addColorStop(1, '#0284c7');
  ctx.fillStyle = leftGrad1;
  ctx.shadowColor = 'rgba(2, 132, 199, 0.4)';
  ctx.shadowBlur = size * 0.03;
  ctx.fill();
  ctx.restore();

  // Right Wing (Outer page / back)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(center, spineBottom);
  ctx.bezierCurveTo(center + size * 0.15, spineBottom - size * 0.05, center + size * 0.35, spineBottom - size * 0.15, center + size * 0.36, center * 0.55);
  ctx.bezierCurveTo(center + size * 0.25, center * 0.60, center + size * 0.12, center * 0.62, center, spineTop);
  ctx.closePath();
  const rightGrad1 = ctx.createLinearGradient(center + size * 0.35, center * 0.6, center, spineBottom);
  rightGrad1.addColorStop(0, '#1d4ed8');
  rightGrad1.addColorStop(1, '#0284c7');
  ctx.fillStyle = rightGrad1;
  ctx.shadowColor = 'rgba(2, 132, 199, 0.4)';
  ctx.shadowBlur = size * 0.03;
  ctx.fill();
  ctx.restore();

  // Layer 2 (Middle page)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(center, spineBottom);
  ctx.bezierCurveTo(center - size * 0.12, spineBottom - size * 0.04, center - size * 0.28, spineBottom - size * 0.12, center - size * 0.30, center * 0.62);
  ctx.bezierCurveTo(center - size * 0.20, center * 0.66, center - size * 0.10, center * 0.67, center, spineTop + size * 0.03);
  ctx.closePath();
  const leftGrad2 = ctx.createLinearGradient(center - size * 0.3, center * 0.65, center, spineBottom);
  leftGrad2.addColorStop(0, '#2563eb');
  leftGrad2.addColorStop(1, '#38bdf8');
  ctx.fillStyle = leftGrad2;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(center, spineBottom);
  ctx.bezierCurveTo(center + size * 0.12, spineBottom - size * 0.04, center + size * 0.28, spineBottom - size * 0.12, center + size * 0.30, center * 0.62);
  ctx.bezierCurveTo(center + size * 0.20, center * 0.66, center + size * 0.10, center * 0.67, center, spineTop + size * 0.03);
  ctx.closePath();
  const rightGrad2 = ctx.createLinearGradient(center + size * 0.3, center * 0.65, center, spineBottom);
  rightGrad2.addColorStop(0, '#2563eb');
  rightGrad2.addColorStop(1, '#38bdf8');
  ctx.fillStyle = rightGrad2;
  ctx.fill();
  ctx.restore();

  // Layer 3 (Inner glowing page)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(center, spineBottom);
  ctx.bezierCurveTo(center - size * 0.08, spineBottom - size * 0.03, center - size * 0.20, spineBottom - size * 0.10, center - size * 0.22, center * 0.70);
  ctx.bezierCurveTo(center - size * 0.15, center * 0.73, center - size * 0.07, center * 0.73, center, spineTop + size * 0.06);
  ctx.closePath();
  const leftGrad3 = ctx.createLinearGradient(center - size * 0.22, center * 0.7, center, spineBottom);
  leftGrad3.addColorStop(0, '#67e8f9');
  leftGrad3.addColorStop(1, '#e0f2fe');
  ctx.fillStyle = leftGrad3;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(center, spineBottom);
  ctx.bezierCurveTo(center + size * 0.08, spineBottom - size * 0.03, center + size * 0.20, spineBottom - size * 0.10, center + size * 0.22, center * 0.70);
  ctx.bezierCurveTo(center + size * 0.15, center * 0.73, center + size * 0.07, center * 0.73, center, spineTop + size * 0.06);
  ctx.closePath();
  const rightGrad3 = ctx.createLinearGradient(center + size * 0.22, center * 0.7, center, spineBottom);
  rightGrad3.addColorStop(0, '#67e8f9');
  rightGrad3.addColorStop(1, '#e0f2fe');
  ctx.fillStyle = rightGrad3;
  ctx.fill();
  ctx.restore();

  // Center Bookmark / Luminous Crystal Flame
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(center, spineTop - size * 0.14);
  ctx.quadraticCurveTo(center + size * 0.04, center * 0.65, center + size * 0.02, spineBottom + size * 0.02);
  ctx.lineTo(center, spineBottom + size * 0.05);
  ctx.lineTo(center - size * 0.02, spineBottom + size * 0.02);
  ctx.quadraticCurveTo(center - size * 0.04, center * 0.65, center, spineTop - size * 0.14);
  ctx.closePath();
  const spineGrad = ctx.createLinearGradient(center, spineTop - size * 0.14, center, spineBottom + size * 0.05);
  spineGrad.addColorStop(0, '#ffffff');
  spineGrad.addColorStop(0.3, '#38bdf8');
  spineGrad.addColorStop(0.7, '#2563eb');
  spineGrad.addColorStop(1, '#1e3a8a');
  ctx.fillStyle = spineGrad;
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = size * 0.04;
  ctx.fill();
  ctx.restore();

  // Glowing Star on Top of Center Flame
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#67e8f9';
  ctx.shadowBlur = size * 0.05;
  ctx.beginPath();
  const starY = spineTop - size * 0.15;
  const starR = size * 0.035;
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const nextAngle = angle + Math.PI / 4;
    ctx.lineTo(center + Math.cos(angle) * starR, starY + Math.sin(angle) * starR);
    ctx.lineTo(center + Math.cos(nextAngle) * (starR * 0.35), starY + Math.sin(nextAngle) * (starR * 0.35));
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Typography "LIBRA"
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = Math.round(size * 0.15);
  ctx.font = `bold ${fontSize}px "Plus Jakarta Sans", "Inter", sans-serif`;
  
  // Text glow
  ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
  ctx.shadowBlur = size * 0.03;
  ctx.fillStyle = '#ffffff';
  
  // Custom letter spacing manually
  const text = 'LIBRA';
  const charSpacing = size * 0.045;
  const startX = center - ((text.length - 1) * charSpacing) / 2;
  const textY = center * 1.34;
  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], startX + i * charSpacing, textY);
  }
  ctx.restore();

  // Subtitle "SMART LIBRARY"
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const subFontSize = Math.round(size * 0.042);
  ctx.font = `600 ${subFontSize}px "Plus Jakarta Sans", "Inter", sans-serif`;
  ctx.fillStyle = '#94a3b8';
  
  const subText = 'SDN PENGASINAN VII';
  const subSpacing = size * 0.022;
  const subStartX = center - ((subText.length - 1) * subSpacing) / 2;
  const subY = center * 1.52;
  for (let i = 0; i < subText.length; i++) {
    ctx.fillText(subText[i], subStartX + i * subSpacing, subY);
  }
  ctx.restore();

  ctx.restore(); // restore scale
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. 192x192 Standard
const c192 = createCanvas(192, 192);
drawLibraLogo(c192, false);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), c192.toBuffer('image/png'));
console.log('✓ Created pwa-192x192.png');

// 2. 512x512 Standard
const c512 = createCanvas(512, 512);
drawLibraLogo(c512, false);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), c512.toBuffer('image/png'));
console.log('✓ Created pwa-512x512.png');

// 3. 512x512 Maskable (with 15% safe-zone margin)
const cMaskable = createCanvas(512, 512);
drawLibraLogo(cMaskable, true);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), cMaskable.toBuffer('image/png'));
console.log('✓ Created pwa-maskable-512x512.png');

// 4. Apple Touch Icon 180x180
const cApple = createCanvas(180, 180);
drawLibraLogo(cApple, false);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), cApple.toBuffer('image/png'));
console.log('✓ Created apple-touch-icon.png');

// 5. Favicon 64x64
const cFavicon = createCanvas(64, 64);
drawLibraLogo(cFavicon, false);
fs.writeFileSync(path.join(publicDir, 'favicon.png'), cFavicon.toBuffer('image/png'));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), cFavicon.toBuffer('image/png'));
console.log('✓ Created favicon.png & favicon.ico');

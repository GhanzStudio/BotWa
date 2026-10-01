/**
 * High-Fidelity Canvas Image Rendering Engine
 * Powered by @napi-rs/canvas Native Pixel Graphics Engine & Custom Fonts
 */

import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { BotCommand, CommandContext } from './types.ts';

// Register Custom TTF Fonts
try {
  const fontDir = path.resolve(process.cwd(), 'bot/assets/fonts');
  GlobalFonts.registerFromPath(path.join(fontDir, 'Poppins-Bold.ttf'), 'PoppinsBold');
  GlobalFonts.registerFromPath(path.join(fontDir, 'Poppins-Regular.ttf'), 'Poppins');
  GlobalFonts.registerFromPath(path.join(fontDir, 'Cinzel-Bold.ttf'), 'Cinzel');
  GlobalFonts.registerFromPath(path.join(fontDir, 'PlayfairDisplay-Bold.ttf'), 'Playfair');
  GlobalFonts.registerFromPath(path.join(fontDir, 'PlusJakartaSans-Bold.ttf'), 'PlusJakarta');
} catch (e: any) {
  console.warn('[Canvas Font Registration Notice]:', e.message);
}

// Helper: Draw Rounded Rect Path
function drawRoundRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Helper: Wrap Text to fit canvas width
function wrapCanvasText(ctx: any, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

export const canvasCommands: BotCommand[] = [
  // 1. Quotes Maker Canvas (.buatquotes)
  {
    name: 'buatquotes',
    aliases: ['quotesmaker', 'quote'],
    category: 'CANVAS',
    description: 'Membuat gambar kanvas kutipan estetik dengan nama dan background',
    usage: '.buatquotes <kutipan> | <penulis>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const parts = ctx.text.split('|');
      const quoteText = (parts[0] || 'Tuhan tidak bermain dadu dengan alam semesta.').trim();
      const authorText = (parts[1] || ctx.user.name || 'Han').trim();

      if (ctx.react) await ctx.react('🎨');

      try {
        const width = 1000;
        const height = 560;
        const canvas = createCanvas(width, height);
        const c = canvas.getContext('2d');

        // Dark Mesh Gradient Background
        const grad = c.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.5, '#1e1b4b');
        grad.addColorStop(1, '#311042');
        c.fillStyle = grad;
        c.fillRect(0, 0, width, height);

        // Radial Glowing Aura Orbs
        const aura1 = c.createRadialGradient(200, 150, 20, 200, 150, 300);
        aura1.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
        aura1.addColorStop(1, 'rgba(99, 102, 241, 0)');
        c.fillStyle = aura1;
        c.fillRect(0, 0, width, height);

        const aura2 = c.createRadialGradient(800, 400, 20, 800, 400, 350);
        aura2.addColorStop(0, 'rgba(236, 72, 153, 0.3)');
        aura2.addColorStop(1, 'rgba(236, 72, 153, 0)');
        c.fillStyle = aura2;
        c.fillRect(0, 0, width, height);

        // Glassmorphism Card Container
        drawRoundRect(c, 60, 60, width - 120, height - 120, 32);
        c.fillStyle = 'rgba(255, 255, 255, 0.08)';
        c.fill();

        // Glowing Card Border
        const borderGrad = c.createLinearGradient(60, 60, width - 60, height - 60);
        borderGrad.addColorStop(0, '#38bdf8');
        borderGrad.addColorStop(0.5, '#818cf8');
        borderGrad.addColorStop(1, '#ec4899');
        c.strokeStyle = borderGrad;
        c.lineWidth = 3;
        c.stroke();

        // Quotation Mark Icon
        c.font = 'bold 110px PoppinsBold';
        c.fillStyle = '#38bdf8';
        c.fillText('“', 110, 170);

        // Quote Body Text
        c.font = 'bold 32px PoppinsBold';
        c.fillStyle = '#f8fafc';
        const lines = wrapCanvasText(c, quoteText, width - 260);
        let startY = 190;
        for (const line of lines.slice(0, 5)) {
          c.fillText(line, 140, startY);
          startY += 48;
        }

        // Author Signature Line
        c.font = 'bold 28px Playfair';
        c.fillStyle = '#fbbf24';
        c.textAlign = 'right';
        c.fillText(`— ${authorText}`, width - 140, height - 110);

        // Bottom Watermark Badge
        c.textAlign = 'left';
        c.font = 'bold 13px PlusJakarta';
        c.fillStyle = '#94a3b8';
        c.fillText('GHANZBOT MD CANVAS ENGINE • OFFICIAL QUOTE CARD', 110, height - 85);

        const imageBuffer = canvas.toBuffer('image/png');
        if (ctx.sendImage) {
          if (ctx.react) await ctx.react('✅');
          return await ctx.sendImage(imageBuffer, `🎨 *QUOTES CANVAS GENERATED*\n\n"${quoteText}"\n— *${authorText}*`);
        }
      } catch (err: any) {
        console.error('[Canvas buatquotes Error]:', err.message);
      }

      await ctx.reply(`🎨 *QUOTES CANVAS*\n\n"${quoteText}"\n— *${authorText}*`);
    }
  },

  // 2. Fake Call Canvas (.fakecall)
  {
    name: 'fakecall',
    category: 'CANVAS',
    description: 'Membuat mockup kanvas panggilan video/telepon WhatsApp palsu estetik',
    usage: '.fakecall <nama_panggilan>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const callerName = ctx.text.trim() || 'mymine 💖';
      if (ctx.react) await ctx.react('📞');

      try {
        const width = 540;
        const height = 960;
        const canvas = createCanvas(width, height);
        const c = canvas.getContext('2d');

        // Dark WhatsApp Interface Background
        const bgGrad = c.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#0b141a');
        bgGrad.addColorStop(0.6, '#111b21');
        bgGrad.addColorStop(1, '#080e12');
        c.fillStyle = bgGrad;
        c.fillRect(0, 0, width, height);

        // Top Status Bar Header
        c.font = '14px PlusJakarta';
        c.fillStyle = '#8696a0';
        c.textAlign = 'center';
        c.fillText('🔒 End-to-end encrypted', width / 2, 65);

        c.font = 'bold 32px PlusJakarta';
        c.fillStyle = '#ffffff';
        c.fillText(callerName, width / 2, 120);

        c.font = '18px PlusJakarta';
        c.fillStyle = '#25d366';
        c.fillText('Panggilan Video WhatsApp...', width / 2, 160);

        // Caller Avatar Frame Ring
        const centerX = width / 2;
        const centerY = 370;
        const radius = 110;

        c.save();
        c.beginPath();
        c.arc(centerX, centerY, radius + 12, 0, Math.PI * 2);
        c.fillStyle = 'rgba(37, 211, 102, 0.15)';
        c.fill();

        c.beginPath();
        c.arc(centerX, centerY, radius, 0, Math.PI * 2);
        c.fillStyle = '#1f2c34';
        c.fill();
        c.strokeStyle = '#25d366';
        c.lineWidth = 4;
        c.stroke();

        // Initial Avatar Letter with Gradient Effect
        c.font = 'bold 84px PlusJakarta';
        c.fillStyle = '#25d366';
        c.fillText(callerName.charAt(0).toUpperCase(), centerX, centerY + 28);
        c.restore();

        // Action Control Buttons Row (Mute, Camera, Speaker)
        const btnY = 700;
        const btnRadius = 38;

        // Mute Btn
        c.fillStyle = 'rgba(255,255,255,0.12)';
        c.beginPath();
        c.arc(150, btnY, btnRadius, 0, Math.PI * 2);
        c.fill();
        c.font = 'bold 22px PlusJakarta';
        c.fillStyle = '#ffffff';
        c.fillText('🔇', 150, btnY + 8);

        // Camera Flip Btn
        c.beginPath();
        c.arc(270, btnY, btnRadius, 0, Math.PI * 2);
        c.fill();
        c.fillText('📹', 270, btnY + 8);

        // Speaker Btn
        c.beginPath();
        c.arc(390, btnY, btnRadius, 0, Math.PI * 2);
        c.fill();
        c.fillText('🔊', 390, btnY + 8);

        // Decline (Red) and Answer (Green) Call Bar
        const callY = 820;

        // Red Decline
        c.fillStyle = '#ea4335';
        c.beginPath();
        c.arc(170, callY, 46, 0, Math.PI * 2);
        c.fill();
        c.font = 'bold 30px PlusJakarta';
        c.fillStyle = '#ffffff';
        c.fillText('📵', 170, callY + 10);

        // Green Answer
        c.fillStyle = '#25d366';
        c.beginPath();
        c.arc(370, callY, 46, 0, Math.PI * 2);
        c.fill();
        c.fillText('📞', 370, callY + 10);

        const imageBuffer = canvas.toBuffer('image/png');
        if (ctx.sendImage) {
          if (ctx.react) await ctx.react('✅');
          return await ctx.sendImage(imageBuffer, `📞 *FAKECALL CANVAS GENERATED*\n\nPanggilan masuk dari: *${callerName}*`);
        }
      } catch (err: any) {
        console.error('[Canvas fakecall Error]:', err.message);
      }

      await ctx.reply(`📞 *FAKECALL CANVAS*\nPanggilan masuk dari *${callerName}*`);
    }
  },

  // 3. Instagram Story Canvas (.igstory)
  {
    name: 'igstory',
    category: 'CANVAS',
    description: 'Render kanvas ala Instagram Story (9:16) estetik dengan teks custom',
    usage: '.igstory <teks_story>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const text = ctx.text.trim() || 'Hari ini terasa begitu indah bila disyukuri ✨';
      if (ctx.react) await ctx.react('📸');

      try {
        const width = 540;
        const height = 960;
        const canvas = createCanvas(width, height);
        const c = canvas.getContext('2d');

        // Trendy Instagram Story Gradient
        const grad = c.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#833ab4');
        grad.addColorStop(0.5, '#fd1d1d');
        grad.addColorStop(1, '#fcb045');
        c.fillStyle = grad;
        c.fillRect(0, 0, width, height);

        // Story Top Progress Bars
        c.fillStyle = '#ffffff';
        drawRoundRect(c, 15, 18, width - 30, 4, 2);
        c.fill();

        // User Profile Header
        c.fillStyle = '#ffffff';
        c.beginPath();
        c.arc(42, 58, 20, 0, Math.PI * 2);
        c.fill();

        c.font = 'bold 16px PlusJakarta';
        c.fillStyle = '#ffffff';
        c.textAlign = 'left';
        c.fillText('ghanzbot_official', 72, 62);

        c.font = '13px PlusJakarta';
        c.fillStyle = 'rgba(255,255,255,0.85)';
        c.fillText('2j lalu', 230, 62);

        // Center Story Glassmorphism Box
        drawRoundRect(c, 45, 260, width - 90, 420, 24);
        c.fillStyle = 'rgba(0, 0, 0, 0.45)';
        c.fill();

        c.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        c.lineWidth = 1.5;
        c.stroke();

        c.font = 'bold 30px PoppinsBold';
        c.fillStyle = '#ffffff';
        c.textAlign = 'center';
        const lines = wrapCanvasText(c, text, width - 140);
        let y = 430 - (lines.length * 20);
        for (const line of lines) {
          c.fillText(line, width / 2, y);
          y += 42;
        }

        // Bottom Reply Message Input Bar
        drawRoundRect(c, 25, height - 80, width - 110, 48, 24);
        c.strokeStyle = 'rgba(255,255,255,0.7)';
        c.lineWidth = 1.5;
        c.stroke();

        c.font = '16px PlusJakarta';
        c.fillStyle = 'rgba(255,255,255,0.9)';
        c.textAlign = 'left';
        c.fillText('Kirim pesan...', 55, height - 50);

        c.font = '26px PlusJakarta';
        c.textAlign = 'center';
        c.fillText('❤️', width - 50, height - 48);

        const imageBuffer = canvas.toBuffer('image/png');
        if (ctx.sendImage) {
          if (ctx.react) await ctx.react('✅');
          return await ctx.sendImage(imageBuffer, `📸 *INSTAGRAM STORY CANVAS*\n\n"${text}"`);
        }
      } catch (err: any) {
        console.error('[Canvas igstory Error]:', err.message);
      }

      await ctx.reply(`📸 *INSTAGRAM STORY CANVAS*\nStory berhasil digenerate.`);
    }
  },

  // 4. Kalender Wall Poster Canvas (.kalender)
  {
    name: 'kalender',
    category: 'CANVAS',
    description: 'Membuat gambar kanvas kalender dinding bulan ini',
    usage: '.kalender',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      if (ctx.react) await ctx.react('🗓️');

      try {
        const width = 850;
        const height = 1000;
        const canvas = createCanvas(width, height);
        const c = canvas.getContext('2d');

        // Background
        c.fillStyle = '#f8fafc';
        c.fillRect(0, 0, width, height);

        // Header Banner
        const grad = c.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, '#0284c7');
        grad.addColorStop(1, '#0369a1');
        c.fillStyle = grad;
        c.fillRect(0, 0, width, 200);

        const now = new Date();
        const monthName = now.toLocaleString('id-ID', { month: 'long' }).toUpperCase();
        const year = now.getFullYear();

        c.font = 'bold 46px PlusJakarta';
        c.fillStyle = '#ffffff';
        c.textAlign = 'center';
        c.fillText(`${monthName} ${year}`, width / 2, 100);

        c.font = 'bold 18px PlusJakarta';
        c.fillStyle = 'rgba(255,255,255,0.85)';
        c.fillText('KALENDER DINDING EXCLUSIVE • GHANZBOT MD', width / 2, 150);

        // Days of week header
        const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
        const colWidth = (width - 80) / 7;
        c.font = 'bold 16px PlusJakarta';

        for (let i = 0; i < 7; i++) {
          c.fillStyle = i === 0 ? '#ef4444' : '#334155';
          c.fillText(days[i], 40 + i * colWidth + colWidth / 2, 250);
        }

        // Horizontal Divider Line
        c.strokeStyle = '#cbd5e1';
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(40, 270);
        c.lineTo(width - 40, 270);
        c.stroke();

        // Calculate Days Grid
        const firstDay = new Date(year, now.getMonth(), 1).getDay();
        const totalDays = new Date(year, now.getMonth() + 1, 0).getDate();
        const currentDay = now.getDate();

        let dayCounter = 1;

        for (let week = 0; week < 6; week++) {
          for (let col = 0; col < 7; col++) {
            if ((week === 0 && col < firstDay) || dayCounter > totalDays) {
              continue;
            }

            const x = 40 + col * colWidth + colWidth / 2;
            const y = 330 + week * 100;

            // Highlight Today
            if (dayCounter === currentDay) {
              c.fillStyle = '#0284c7';
              c.beginPath();
              c.arc(x, y - 10, 34, 0, Math.PI * 2);
              c.fill();
              c.fillStyle = '#ffffff';
            } else {
              c.fillStyle = col === 0 ? '#ef4444' : '#1e293b';
            }

            c.font = 'bold 26px PlusJakarta';
            c.fillText(String(dayCounter), x, y);
            dayCounter++;
          }
        }

        // Footer Brand
        c.fillStyle = '#f1f5f9';
        c.fillRect(0, height - 70, width, 70);
        c.font = 'bold 14px PlusJakarta';
        c.fillStyle = '#64748b';
        c.fillText('Official GhanzBot MD Calendar Engine • Designed for WhatsApp', width / 2, height - 30);

        const imageBuffer = canvas.toBuffer('image/png');
        if (ctx.sendImage) {
          if (ctx.react) await ctx.react('✅');
          return await ctx.sendImage(imageBuffer, `🗓️ *KALENDER ${monthName} ${year}*\n\nKalender dinding berhasil digenerate.`);
        }
      } catch (err: any) {
        console.error('[Canvas kalender Error]:', err.message);
      }

      await ctx.reply(`🗓️ *KALENDER MAKER*\nKalender bulan ini berhasil dibuat.`);
    }
  },

  // 5. Blue Archive Logo Canvas (.balogo)
  {
    name: 'balogo',
    category: 'CANVAS',
    description: 'Membuat logo kanvas gaya Blue Archive (BA Logo)',
    usage: '.balogo <teks1> | <teks2>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const parts = ctx.text.split('|');
      const text1 = (parts[0] || 'Anjay').trim();
      const text2 = (parts[1] || 'Gokil').trim();

      if (ctx.react) await ctx.react('🔷');

      try {
        const width = 900;
        const height = 420;
        const canvas = createCanvas(width, height);
        const c = canvas.getContext('2d');

        // White Canvas Background
        c.fillStyle = '#ffffff';
        c.fillRect(0, 0, width, height);

        // Text 1 (BA Blue #1289f5)
        c.font = 'bold italic 96px PlusJakarta';
        c.fillStyle = '#1289f5';
        c.textAlign = 'right';
        c.fillText(text1, width / 2 - 25, height / 2 + 35);

        // Text 2 (Dark Slate #2c3e50)
        c.textAlign = 'left';
        c.fillStyle = '#2c3e50';
        c.fillText(text2, width / 2 + 25, height / 2 + 35);

        // Halo Ring Icon
        c.strokeStyle = '#1289f5';
        c.lineWidth = 7;
        c.beginPath();
        c.arc(width / 2, height / 2 - 75, 38, 0, Math.PI * 2);
        c.stroke();

        // Cross Line Accent
        c.beginPath();
        c.moveTo(width / 2 - 55, height / 2 - 75);
        c.lineTo(width / 2 + 55, height / 2 - 75);
        c.stroke();

        const imageBuffer = canvas.toBuffer('image/png');
        if (ctx.sendImage) {
          if (ctx.react) await ctx.react('✅');
          return await ctx.sendImage(imageBuffer, `🔷 *BLUE ARCHIVE LOGO CANVAS*\n\nLogo: *${text1} ${text2}*`);
        }
      } catch (err: any) {
        console.error('[Canvas balogo Error]:', err.message);
      }

      await ctx.reply(`🔷 *BLUE ARCHIVE LOGO MAKER*\nLogo *${text1} ${text2}* berhasil dibuat.`);
    }
  },

  // 6. Roasting Card Canvas (.sroast)
  {
    name: 'sroast',
    category: 'CANVAS',
    description: 'Roasting akun WhatsApp dengan kanvas sindiran santai & skor unik',
    usage: '.sroast',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const targetName = ctx.user.name || 'GhanzStudio';
      if (ctx.react) await ctx.react('🔥');

      const roasts = [
        "Sering on di grup tapi jarang nimbrung, jangan-jangan cuma mantau status crush ya? 😆",
        "Kalo dichat balesnya secepat kilat, tapi giliran ditagih utang langsung offline ⚡",
        "Hobi gonta-ganti foto profil tiap hari tapi isi chat tetep sepi kaya kuburan 👻",
        "Level keaktifan 99% tapi poin kepekaan 0% wkwkwk 🤣"
      ];
      const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];

      try {
        const width = 850;
        const height = 420;
        const canvas = createCanvas(width, height);
        const c = canvas.getContext('2d');

        // Dark Purple Flame Background
        const grad = c.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#180e29');
        grad.addColorStop(1, '#3b0764');
        c.fillStyle = grad;
        c.fillRect(0, 0, width, height);

        // Card Container
        drawRoundRect(c, 45, 45, width - 90, height - 90, 24);
        c.fillStyle = 'rgba(255,255,255,0.06)';
        c.fill();
        c.strokeStyle = '#a855f7';
        c.lineWidth = 2.5;
        c.stroke();

        c.font = 'bold 30px PlusJakarta';
        c.fillStyle = '#f43f5e';
        c.textAlign = 'left';
        c.fillText('🔥 ROASTING WHATSAPP CARD', 85, 105);

        c.font = 'bold 24px PlusJakarta';
        c.fillStyle = '#ffffff';
        c.fillText(`Target: ${targetName}`, 85, 150);

        c.font = 'bold 22px PoppinsBold';
        c.fillStyle = '#e2e8f0';
        const lines = wrapCanvasText(c, `"${randomRoast}"`, width - 190);
        let y = 205;
        for (const line of lines) {
          c.fillText(line, 85, y);
          y += 36;
        }

        c.font = 'bold 16px PlusJakarta';
        c.fillStyle = '#fbbf24';
        c.fillText('Skor Kezonkan: 98.4% 🔥 Level Super Zonk', 85, height - 75);

        const imageBuffer = canvas.toBuffer('image/png');
        if (ctx.sendImage) {
          if (ctx.react) await ctx.react('✅');
          return await ctx.sendImage(imageBuffer, `🔥 *ROASTING KANVAS: ${targetName}*\n\n"${randomRoast}"`);
        }
      } catch (err: any) {
        console.error('[Canvas sroast Error]:', err.message);
      }

      await ctx.reply(`🔥 *ROASTING KANVAS*\n"${randomRoast}"`);
    }
  },

  // 7. Gamer Rank / Level Card Canvas (.rankcard)
  {
    name: 'rankcard',
    aliases: ['levelcard', 'myrank'],
    category: 'CANVAS',
    description: 'Render kartu profil level gamer estetik lengkap dengan bar EXP & status',
    usage: '.rankcard',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const u = ctx.user;
      if (ctx.react) await ctx.react('🎖️');

      try {
        const width = 900;
        const height = 320;
        const canvas = createCanvas(width, height);
        const c = canvas.getContext('2d');

        // Dark Gamer Slate Gradient
        const grad = c.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#090d16');
        grad.addColorStop(1, '#1e1b4b');
        c.fillStyle = grad;
        c.fillRect(0, 0, width, height);

        // Outer Neon Glow Border
        drawRoundRect(c, 20, 20, width - 40, height - 40, 20);
        c.strokeStyle = '#6366f1';
        c.lineWidth = 3;
        c.stroke();

        // Avatar Frame Ring
        const avatarX = 120;
        const avatarY = 160;

        c.fillStyle = '#312e81';
        c.beginPath();
        c.arc(avatarX, avatarY, 65, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = '#818cf8';
        c.lineWidth = 4;
        c.stroke();

        c.font = 'bold 48px PlusJakarta';
        c.fillStyle = '#818cf8';
        c.textAlign = 'center';
        c.fillText((u.name || 'GhanzStudio').charAt(0).toUpperCase(), avatarX, avatarY + 16);

        // User Name & Rank Title
        c.textAlign = 'left';
        c.font = 'bold 32px PlusJakarta';
        c.fillStyle = '#ffffff';
        c.fillText(u.name || 'GhanzStudio', 220, 105);

        c.font = 'bold 22px PlusJakarta';
        c.fillStyle = '#a855f7';
        c.fillText(`LEVEL ${u.level || 999}`, 220, 142);

        c.font = 'bold 16px PlusJakarta';
        c.fillStyle = '#cbd5e1';
        c.fillText(`EXP: ${u.exp || 101499} / 1000  •  Koin: 🪙 ${(u.koin || 999999999).toLocaleString('id-ID')}`, 220, 180);

        // Progress EXP Bar
        const barX = 220;
        const barY = 205;
        const barWidth = 620;
        const barHeight = 24;

        drawRoundRect(c, barX, barY, barWidth, barHeight, 12);
        c.fillStyle = 'rgba(255,255,255,0.1)';
        c.fill();

        const fillWidth = barWidth * 0.85;
        drawRoundRect(c, barX, barY, fillWidth, barHeight, 12);
        const barGrad = c.createLinearGradient(barX, 0, barX + fillWidth, 0);
        barGrad.addColorStop(0, '#6366f1');
        barGrad.addColorStop(1, '#ec4899');
        c.fillStyle = barGrad;
        c.fill();

        const imageBuffer = canvas.toBuffer('image/png');
        if (ctx.sendImage) {
          if (ctx.react) await ctx.react('✅');
          return await ctx.sendImage(imageBuffer, `🎖️ *GAMER RANK CARD: ${u.name || 'GhanzStudio'}*\n\n• *Level:* ${u.level || 999}\n• *EXP:* ${u.exp || 101499} / 1000\n• *Koin:* 🪙 ${(u.koin || 999999999).toLocaleString('id-ID')}`);
        }
      } catch (err: any) {
        console.error('[Canvas rankcard Error]:', err.message);
      }

      await ctx.reply(`🎖️ *RANK CARD*\nLevel ${u.level || 1} • EXP ${u.exp || 0}/1000`);
    }
  },

  // 8. Welcome Group Banner Canvas (.welcomecard)
  {
    name: 'welcomecard',
    aliases: ['welcomebanner'],
    category: 'CANVAS',
    description: 'Render banner sambutan anggota baru di grup WhatsApp',
    usage: '.welcomecard <nama> | <nama_grup>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const parts = ctx.text.split('|');
      const memberName = (parts[0] || ctx.user.name || 'Han').trim();
      const groupName = (parts[1] || 'BotTes').trim();

      if (ctx.react) await ctx.react('👋');

      try {
        const width = 900;
        const height = 420;
        const canvas = createCanvas(width, height);
        const c = canvas.getContext('2d');

        // Cyberpunk Emerald Gradient
        const grad = c.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#064e3b');
        grad.addColorStop(1, '#022c22');
        c.fillStyle = grad;
        c.fillRect(0, 0, width, height);

        c.fillStyle = 'rgba(16, 185, 129, 0.15)';
        c.beginPath();
        c.arc(750, 100, 200, 0, Math.PI * 2);
        c.fill();

        // Border
        drawRoundRect(c, 30, 30, width - 60, height - 60, 22);
        c.strokeStyle = '#10b981';
        c.lineWidth = 3;
        c.stroke();

        // Left Avatar Ring
        c.fillStyle = '#065f46';
        c.beginPath();
        c.arc(150, 210, 75, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = '#34d399';
        c.lineWidth = 4;
        c.stroke();

        c.font = 'bold 54px PlusJakarta';
        c.fillStyle = '#34d399';
        c.textAlign = 'center';
        c.fillText(memberName.charAt(0).toUpperCase(), 150, 228);

        // Welcome Header & Details
        c.textAlign = 'left';
        c.font = 'bold 36px PlusJakarta';
        c.fillStyle = '#ffffff';
        c.fillText('WELCOME TO THE GROUP!', 260, 155);

        c.font = 'bold 30px PlusJakarta';
        c.fillStyle = '#34d399';
        c.fillText(memberName, 260, 210);

        c.font = '22px PlusJakarta';
        c.fillStyle = '#a7f3d0';
        c.fillText(`Selamat bergabung di: ${groupName}`, 260, 255);

        c.font = '15px PlusJakarta';
        c.fillStyle = '#6ee7b7';
        c.fillText('Jangan lupa baca deskripsi & atur tata tertib grup ya! ✨', 260, 295);

        const imageBuffer = canvas.toBuffer('image/png');
        if (ctx.sendImage) {
          if (ctx.react) await ctx.react('✅');
          return await ctx.sendImage(imageBuffer, `👋 *WELCOME TO ${groupName.toUpperCase()}*\n\nSelamat datang *${memberName}*! Semoga betah dan kompak bersama anggota grup.`);
        }
      } catch (err: any) {
        console.error('[Canvas welcomecard Error]:', err.message);
      }

      await ctx.reply(`👋 *WELCOME CARD*\nSelamat datang *${memberName}* di *${groupName}*!`);
    }
  },

  // 9. Certificate of Achievement Canvas (.sertifikat)
  {
    name: 'sertifikat',
    aliases: ['certificate'],
    category: 'CANVAS',
    description: 'Membuat gambar kanvas sertifikat penghargaan resmi',
    usage: '.sertifikat <nama> | <penghargaan>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const parts = ctx.text.split('|');
      const recipientName = (parts[0] || 'horay han').trim();
      const awardTitle = (parts[1] || 'Anggota Teraktif & Paling Berkontribusi').trim();

      if (ctx.react) await ctx.react('📜');

      try {
        const width = 1200;
        const height = 800;
        const canvas = createCanvas(width, height);
        const c = canvas.getContext('2d');

        // Ivory Certificate Parchment Background
        c.fillStyle = '#fffbeb';
        c.fillRect(0, 0, width, height);

        // Gold Frame Double Border
        c.strokeStyle = '#d97706';
        c.lineWidth = 12;
        c.strokeRect(35, 35, width - 70, height - 70);

        c.strokeStyle = '#fbbf24';
        c.lineWidth = 3;
        c.strokeRect(52, 52, width - 104, height - 104);

        // Title
        c.font = 'bold 54px Cinzel';
        c.fillStyle = '#78350f';
        c.textAlign = 'center';
        c.fillText('SERTIFIKAT PENGHARGAAN', width / 2, 160);

        c.font = 'italic 22px Playfair';
        c.fillStyle = '#92400e';
        c.fillText('CERTIFICATE OF EXCELLENCE & APPRECIATION', width / 2, 205);

        c.font = '20px PlusJakarta';
        c.fillStyle = '#451a03';
        c.fillText('Diberikan secara resmi kepada:', width / 2, 290);

        // Recipient Name
        c.font = 'bold 46px Playfair';
        c.fillStyle = '#b45309';
        c.fillText(recipientName, width / 2, 370);

        // Gold Accent Line
        c.strokeStyle = '#d97706';
        c.lineWidth = 2.5;
        c.beginPath();
        c.moveTo(width / 2 - 250, 395);
        c.lineTo(width / 2 + 250, 395);
        c.stroke();

        // Award Description
        c.font = '24px PlusJakarta';
        c.fillStyle = '#1c1917';
        c.fillText('Atas Pencapaian Terbaik Sebagai:', width / 2, 470);

        c.font = 'bold 28px PlusJakarta';
        c.fillStyle = '#78350f';
        c.fillText(`"${awardTitle}"`, width / 2, 525);

        // Footer Signatures
        const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        c.font = 'bold 18px PlusJakarta';
        c.fillStyle = '#78350f';

        c.fillText(`Diterbitkan: ${todayStr}`, width / 2 - 300, 660);
        c.fillText('ttd, Founder GhanzStudio', width / 2 + 300, 660);

        const imageBuffer = canvas.toBuffer('image/png');
        if (ctx.sendImage) {
          if (ctx.react) await ctx.react('✅');
          return await ctx.sendImage(imageBuffer, `📜 *SERTIFIKAT PENGHARGAAN RESMI*\n\nDiberikan kepada: *${recipientName}*\nAtas: *${awardTitle}*`);
        }
      } catch (err: any) {
        console.error('[Canvas sertifikat Error]:', err.message);
      }

      await ctx.reply(`📜 *SERTIFIKAT PENGHARGAAN*\nDiberikan kepada *${recipientName}*`);
    }
  }
];

/**
 * User Account, Profile, Level & Economy Commands
 */

import { BotCommand, CommandContext } from './types.ts';
import { scanAndVerifyNumber, isConfiguredOwner } from '../database/models/User.ts';

export const userCommands: BotCommand[] = [
  {
    name: 'profile',
    aliases: ['me', 'profil', 'scanprofile', 'scan', 'scannomor', 'cekno', 'cekuser'],
    category: 'USER',
    description: 'Pindai nomor telepon & verifikasi profil secara akurat (Membedakan Owner, VIP, dan User)',
    usage: '.profile [nomor/@tag]',
    execute: async (ctx: CommandContext) => {
      // 1. Ekstrak target nomor yang dipindai (bisa nomor sendiri atau nomor yang di-tag/diinput)
      let targetInput = ctx.args[0] || ctx.senderJid || (ctx.user ? ctx.user.id : '');
      targetInput = String(targetInput).replace(/[@+]/g, '').trim();
      if (!targetInput) {
        targetInput = ctx.senderJid || '';
      }

      // 2. Lakukan proses scan nomor terhadap database
      const scanResult = await scanAndVerifyNumber(targetInput, ctx.user?.name);
      const { cleanNumber, cleanJid, formattedPhone, lid, isLid, matchedType, statusLabel, verificationDetail, synchronizationMessage, user } = scanResult;

      // Keterangan identitas (membedakan Nomor Telepon HP asli dan ID Akun Multi-Device LID)
      const idInfoBlock = lid
        ? `📱 *Nomor HP:* ${formattedPhone}\n🆔 *ID Akun (LID):* ${lid}\n🌐 *JID:* ${cleanJid}\n`
        : `📱 *Nomor:* ${formattedPhone}\n🌐 *JID:* ${cleanJid}\n`;

      // JIKA HASIL SCAN ADALAH OWNER RESMI
      if (matchedType === 'OWNER') {
        return ctx.reply(
          `🔍 *HASIL SCAN & VERIFIKASI NOMOR BOT* 🔍\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `${idInfoBlock}` +
          `🛡️ *Hasil Scan Database:*\n` +
          `   ➥ Status: *${statusLabel}*\n` +
          `   ➥ Verifikasi: ${verificationDetail}\n` +
          `   ➥ Sistem: ${synchronizationMessage}\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `👑 *KARTU PROFIL OWNER & DEVELOPER* 👑\n\n` +
          `• Nama: ${user.name || 'GhanzStudio'} 👑\n` +
          `• Nomor HP: ${formattedPhone}\n` +
          (lid ? `• ID WhatsApp (LID): ${lid}\n` : '') +
          `• Link WhatsApp: https://wa.me/${cleanNumber}\n` +
          `• JID Akun: ${cleanJid}\n` +
          `• Status Akun: 👑 OWNER / FOUNDER (SUPER ADMIN)\n` +
          `• Hak Akses: 🛡️ FULL ROOT ACCESS (ALL PRIVILEGES)\n` +
          `• Limit Energi: ⚡ Unlimited (Bebas Kuota Limit)\n` +
          `• Saldo Koin: 🪙 Unlimited (Sultan Bot)\n` +
          `• Level: 🎖️ Level 999 (Max Developer)\n` +
          `• Terdaftar: Terverifikasi Permanen ✅\n` +
          `• Mode: Bebas Cooldown & Anti-Spam Bypass\n` +
          `• Total Perintah: ${user.totalHit || 0}x dijalankan\n\n` +
          `╭───「 *HAK ISTIMEWA OWNER* 」\n` +
          `│ 👑 Akses semua menu & command rahasia\n` +
          `│ 📢 Siaran pesan massal (${ctx.prefix}bc)\n` +
          `│ 💎 Simpan auto-prem (${ctx.prefix}addprem / ${ctx.prefix}delprem)\n` +
          `│ ⚡ Tambah limit & koin (${ctx.prefix}addlimit / ${ctx.prefix}addkoin)\n` +
          `│ 🚫 Ban & unban pengguna (${ctx.prefix}ban / ${ctx.prefix}unban)\n` +
          `│ 💻 Eksekusi kode dinamis (${ctx.prefix}eval)\n` +
          `│ 🧹 Pembersihan cache & memori (${ctx.prefix}cleartmp)\n` +
          `╰───────────────────────────────`
        );
      }

      // JIKA HASIL SCAN ADALAH AUTO-PREMIUM / VIP
      if (matchedType === 'PREMIUM') {
        return ctx.reply(
          `🔍 *HASIL SCAN & VERIFIKASI NOMOR BOT* 🔍\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `${idInfoBlock}` +
          `💎 *Hasil Scan Database:*\n` +
          `   ➥ Status: *${statusLabel}*\n` +
          `   ➥ Verifikasi: ${verificationDetail}\n` +
          `   ➥ Sistem: ${synchronizationMessage}\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `👑 *KARTU PROFIL USER PREMIUM (VIP)* 👑\n\n` +
          `• Nama: ${user.name || 'VIP Member'}\n` +
          `• Nomor HP: ${formattedPhone}\n` +
          (lid ? `• ID WhatsApp (LID): ${lid}\n` : '') +
          `• Link WhatsApp: https://wa.me/${cleanNumber}\n` +
          `• JID Akun: ${cleanJid}\n` +
          `• Status: 👑 PREMIUM (VIP MEMBER)\n` +
          `• Auto-Prem Chat: *AKTIF ✅* (Otomatis VIP saat chat)\n` +
          `• Limit Energi: ⚡ Unlimited (999.999)\n` +
          `• Saldo Koin: 🪙 ${Number(user.koin || 0).toLocaleString('id-ID')}\n` +
          `• Level: 🎖️ Level ${user.level || 1} (Exp: ${user.exp || 0})\n` +
          `• Masa Aktif: VIP Selamanya / Auto-Prem Permanen ✨\n` +
          `• Terdaftar: Sudah Terverifikasi ✅\n` +
          `• Total Perintah: ${user.totalHit || 0}x digunakan\n\n` +
          `╭───「 *KEUNTUNGAN VIP PREMIUM* 」\n` +
          `│ ⚡ Limit energi tanpa batas (999.999)\n` +
          `│ 🚀 Prioritas antrean downloader & AI\n` +
          `│ 🔓 Akses penuh seluruh menu VIP bot\n` +
          `│ 💎 Auto-Prem aktif setiap kali mengirim chat\n` +
          `╰───────────────────────────────`
        );
      }

      // JIKA HASIL SCAN ADALAH USER REGULER / TERVERIFIKASI DARI SCAN WA
      return ctx.reply(
        `🔍 *HASIL SCAN & VERIFIKASI NOMOR BOT* 🔍\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `${idInfoBlock}` +
        `ℹ️ *Hasil Scan Database:*\n` +
        `   ➥ Status: *${statusLabel}*\n` +
        `   ➥ Verifikasi: ${verificationDetail}\n` +
        `   ➥ Sistem: ${synchronizationMessage}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `👤 *KARTU PROFIL PENGGUNA*\n\n` +
        `• Nama: ${user.name || 'Pengguna'}\n` +
        `• Nomor HP: ${formattedPhone}\n` +
        (lid ? `• ID WhatsApp (LID): ${lid}\n` : '') +
        `• Link WhatsApp: https://wa.me/${cleanNumber}\n` +
        `• JID Akun: ${cleanJid}\n` +
        `• Status: 👤 USER BIASA\n` +
        `• Level: ${user.level || 1} (Exp: ${user.exp || 0})\n` +
        `• Koin: 🪙 ${Number(user.koin || 0).toLocaleString('id-ID')}\n` +
        `• Limit: ⚡ ${user.limit || 0} tersisa\n` +
        `• Terdaftar: ${user.registered ? 'Sudah Terverifikasi ✅' : 'Belum Terdaftar ❌'}\n` +
        `• Ulang Tahun: ${user.birthday || 'Belum diatur'}\n` +
        `• Total Command: ${user.totalHit || 0}x digunakan\n\n` +
        `💡 *Tips:* Hubungi Owner untuk simpan nomormu ke database Auto-Prem agar mendapatkan status *👑 VIP PREMIUM* otomatis setiap kali chat!`
      );
    }
  },
  {
    name: 'daftar',
    aliases: ['register', 'reg'],
    category: 'USER',
    description: 'Mendaftarkan diri ke database bot',
    usage: '.daftar <nama.umur>',
    execute: async (ctx: CommandContext) => {
      const { user } = ctx;
      if (user.registered) return ctx.reply(`⚠️ Kamu sudah terdaftar di database!`);
      const input = ctx.text.trim();
      let name = user.name || 'User';
      let age = 18;
      if (input.includes('.')) {
        const [n, a] = input.split('.');
        if (n) name = n.trim();
        if (a && !isNaN(Number(a))) age = Number(a);
      }
      user.registered = true;
      user.name = name;
      user.age = age;
      user.koin += 2000;
      user.limit += 20;
      await user.save?.();
      await ctx.reply(`🎉 *PENDAFTARAN BERHASIL!*\n\n• Nama: ${name}\n• Umur: ${age} tahun\n• Bonus Registrasi: +2.000 Koin, +20 Limit!\n\n_Ketik ${ctx.prefix}menu untuk mulai menggunakan fitur._`);
    }
  },
  {
    name: 'unreg',
    category: 'USER',
    description: 'Menghapus pendaftaran akun dari database',
    usage: '.unreg',
    execute: async (ctx: CommandContext) => {
      ctx.user.registered = false;
      await ctx.user.save?.();
      await ctx.reply(`🗑️ Pendaftaran akun kamu telah dibatalkan.`);
    }
  },
  {
    name: 'daily',
    aliases: ['klaim'],
    category: 'USER',
    description: 'Klaim hadiah harian koin dan energi gratis',
    usage: '.daily',
    execute: async (ctx: CommandContext) => {
      const { user } = ctx;
      const now = new Date();
      if (user.lastDaily) {
        const diff = now.getTime() - new Date(user.lastDaily).getTime();
        const oneDay = 24 * 60 * 60 * 1000;
        if (diff < oneDay) {
          const waitHour = Math.ceil((oneDay - diff) / (60 * 60 * 1000));
          return ctx.reply(`⏳ Kamu sudah mengambil hadiah harian! Silakan kembali dalam ${waitHour} jam.`);
        }
      }
      user.lastDaily = now;
      user.koin += 1500;
      user.limit += 25;
      user.exp += 200;
      await user.save?.();
      await ctx.reply(`🎁 *HADIAH HARIAN (DAILY CLAIM)*\n\nSelamat! Kamu mendapatkan:\n+ 🪙 1.500 Koin\n+ ⚡ 25 Limit Energi\n+ 🎖️ 200 Exp`);
    }
  },
  {
    name: 'energi',
    aliases: ['limit', 'ceklimit'],
    category: 'USER',
    description: 'Mengecek sisa kuota limit energi hari ini',
    usage: '.energi',
    execute: async (ctx: CommandContext) => {
      const { user, isOwner } = ctx;
      const isRealOwner = isOwner && isConfiguredOwner(ctx.senderJid || user.id);
      if (isRealOwner) {
        return ctx.reply(`⚡ *LIMIT ENERGI*: Unlimited (Owner & Creator Bebas Biaya Kuota 👑)`);
      }
      if (user.premium || user.role === 'premium') {
        return ctx.reply(`⚡ *LIMIT ENERGI*: Unlimited (Akun Premium VIP ✨)`);
      }
      await ctx.reply(`⚡ *SISA ENERGI / LIMIT KAMU*\n\nSisa: *${user.limit} limit*\nReset berkala: Setiap pukul 00:00 WIB\n\n_Ketik ${ctx.prefix}buyenergi untuk membeli tambahan limit dengan koin!_`);
    }
  },
  {
    name: 'koin',
    aliases: ['saldo', 'money'],
    category: 'USER',
    description: 'Cek saldo koin ekonomi kamu',
    usage: '.koin',
    execute: async (ctx: CommandContext) => {
      const { user, isOwner } = ctx;
      const isRealOwner = isOwner && isConfiguredOwner(ctx.senderJid || user.id);
      if (isRealOwner) {
        return ctx.reply(`🪙 Saldo koin kamu: *Unlimited (Sultan Owner Bebas Belanja 👑)*`);
      }
      await ctx.reply(`🪙 Saldo koin kamu: *${ctx.user.koin.toLocaleString('id-ID')} koin*`);
    }
  },
  {
    name: 'exp',
    category: 'USER',
    description: 'Cek jumlah experience (Exp) karaktermu',
    usage: '.exp',
    execute: async (ctx: CommandContext) => {
      const { user, isOwner } = ctx;
      const isRealOwner = isOwner && isConfiguredOwner(ctx.senderJid || user.id);
      if (isRealOwner) {
        return ctx.reply(`🎖️ Exp kamu saat ini: *Max Exp (Owner Status 👑)* (Level 999)`);
      }
      await ctx.reply(`🎖️ Exp kamu saat ini: *${ctx.user.exp} Exp* (Level ${ctx.user.level})`);
    }
  },
  {
    name: 'level',
    category: 'USER',
    description: 'Melihat progres level saat ini',
    usage: '.level',
    execute: async (ctx: CommandContext) => {
      const { user, isOwner } = ctx;
      const isRealOwner = isOwner && isConfiguredOwner(ctx.senderJid || user.id);
      if (isRealOwner) {
        return ctx.reply(`📈 Level kamu: *Level 999 (Max Developer / Creator 👑)*`);
      }
      await ctx.reply(`📈 Level kamu: *Level ${ctx.user.level}*\nDibutuhkan ${(ctx.user.level * 500) - ctx.user.exp} Exp lagi untuk naik level.`);
    }
  },
  {
    name: 'levelup',
    category: 'USER',
    description: 'Menaikkan level jika exp mencukupi',
    usage: '.levelup',
    execute: async (ctx: CommandContext) => {
      const { user } = ctx;
      const needExp = user.level * 300;
      if (user.exp >= needExp) {
        user.level += 1;
        user.exp -= needExp;
        user.koin += 1000;
        await user.save?.();
        return ctx.reply(`🆙 *SELAMAT! NAIK LEVEL!*\nSekarang kamu berada di *Level ${user.level}*!\nBonus: +1.000 Koin!`);
      }
      await ctx.reply(`⚠️ Exp kamu belum mencukupi untuk naik level. Kumpulkan ${needExp - user.exp} Exp lagi dari game/rpg.`);
    }
  },
  {
    name: 'buyenergi',
    aliases: ['buylimit'],
    category: 'USER',
    description: 'Membeli limit energi menggunakan saldo koin (1 Limit = 100 Koin)',
    usage: '.buyenergi <jumlah>',
    execute: async (ctx: CommandContext) => {
      const amount = parseInt(ctx.args[0] || '10', 10);
      if (isNaN(amount) || amount <= 0) return ctx.reply(`Contoh: ${ctx.prefix}buyenergi 10`);
      const cost = amount * 100;
      if (ctx.user.koin < cost) {
        return ctx.reply(`❌ Koin tidak cukup! Butuh ${cost.toLocaleString('id-ID')} koin untuk membeli ${amount} limit.`);
      }
      ctx.user.koin -= cost;
      ctx.user.limit += amount;
      await ctx.user.save?.();
      await ctx.reply(`✅ Berhasil membeli *${amount} limit* seharga ${cost.toLocaleString('id-ID')} koin!\nSisa koin: ${ctx.user.koin.toLocaleString('id-ID')}`);
    }
  },
  {
    name: 'buyfitur',
    category: 'USER',
    description: 'Membeli akses fitur khusus dengan koin',
    usage: '.buyfitur',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🛍️ *TOKO FITUR KHUSUS*\nKoin dapat digunakan untuk membeli item RPG dan boost limit.`);
    }
  },
  {
    name: 'setbirthday',
    category: 'USER',
    description: 'Menyetel tanggal ulang tahun kamu (DD-MM)',
    usage: '.setbirthday 17-08',
    execute: async (ctx: CommandContext) => {
      const date = ctx.text.trim();
      if (!date) return ctx.reply(`Format: ${ctx.prefix}setbirthday DD-MM (Contoh: 25-12)`);
      ctx.user.birthday = date;
      await ctx.user.save?.();
      await ctx.reply(`🎂 Tanggal ulang tahun kamu disetel ke: *${date}*`);
    }
  },
  {
    name: 'birthday',
    category: 'USER',
    description: 'Cek tanggal ulang tahun kamu',
    usage: '.birthday',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎂 Tanggal lahir terdaftar: *${ctx.user.birthday || 'Belum diatur'}*`);
    }
  },
  {
    name: 'birthdaylist',
    category: 'USER',
    description: 'Melihat daftar member yang berulang tahun bulan ini',
    usage: '.birthdaylist',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📅 *DAFTAR ULANG TAHUN BULAN INI*\n• Ahmad - 12 September\n• Salsabila - 28 September`);
    }
  }
];

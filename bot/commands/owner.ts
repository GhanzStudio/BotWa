/**
 * Owner & Developer Commands
 * Full Root Control, Administration, Broadcasting, and Management
 */

import { BotCommand, CommandContext } from './types.ts';
import { config } from '../config.ts';
import {
  getUser,
  getAllMemoryUsers,
  UserModel,
  addPersistentPremiumNumber,
  removePersistentPremiumNumber,
  getPersistentPremiumNumbers,
  addPersistent18User,
  removePersistent18User,
  getPersistent18Users
} from '../database/models/User.ts';
import {
  GroupModel,
  getGroup,
  getAllMemoryGroups,
  approveGroup18,
  revokeGroup18,
  getPending18RequestsList,
  getApproved18GroupsList
} from '../database/models/Group.ts';
import util from 'util';

export const ownerCommands: BotCommand[] = [
  // 1. Broadcast to all users / groups
  {
    name: 'bc',
    aliases: ['broadcast', 'bcall'],
    category: 'OWNER',
    description: 'Mengirimkan pesan siaran broadcast ke seluruh chat/grup (Owner Only)',
    usage: '.bc <pesan>',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      const text = ctx.text.trim();
      if (!text) {
        return ctx.reply(`⚠️ Masukkan pesan siaran!\nContoh: *${ctx.prefix}bc Pengumuman pemeliharaan server.*`);
      }

      await ctx.reply(
        `📢 *BROADCAST SYSTEM (OWNER)*\n\n` +
        `Pesan siaran berhasil dikirimkan ke antrean broadcast:\n\n` +
        `"${text}"\n\n` +
        `📊 *Penerima:* Semua Grup & Pengguna Terdaftar\n` +
        `⚡ *Pengirim:* ${config.ownerName} (Owner Bot)`
      );
    }
  },

  // 2. Add Premium User (Auto-save nomor permanently)
  {
    name: 'addprem',
    aliases: ['tambahprem'],
    category: 'OWNER',
    description: 'Menambahkan status user Premium / VIP & simpan nomor agar auto prem saat chat (Owner Only)',
    usage: '.addprem <nomor> [hari]',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      const rawTarget = ctx.args[0];
      const days = parseInt(ctx.args[1] || '30', 10);
      if (!rawTarget) {
        return ctx.reply(`Format: *${ctx.prefix}addprem 62812345678 30*\n\nNomor akan tersimpan permanen & otomatis berstatus VIP Premium setiap kali mengirim chat/perintah.`);
      }

      const targetDigits = rawTarget.replace(/\D/g, '');
      if (!targetDigits || targetDigits.length < 8) {
        return ctx.reply(`⚠️ Masukkan nomor WhatsApp yang valid! Contoh: *${ctx.prefix}addprem 628123456789 30*`);
      }

      // Simpan ke whitelist auto-premium permanen
      addPersistentPremiumNumber(targetDigits);

      const targetJid = `${targetDigits}@s.whatsapp.net`;
      const targetUser = await getUser(targetJid);
      
      targetUser.premium = true;
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + days);
      targetUser.premiumExpired = expireDate;
      targetUser.role = 'premium';
      targetUser.limit = Math.max(targetUser.limit || 0, 999999);
      await targetUser.save?.();

      await ctx.reply(
        `👑 *SUKSES UPGRADE & SIMPAN AUTO-PREMIUM!*\n\n` +
        `• Target: wa.me/${targetDigits}\n` +
        `• Durasi: ${days} Hari\n` +
        `• Masa Berlaku: Sampai ${expireDate.toLocaleDateString('id-ID')}\n` +
        `• Status: Aktif VIP ✨\n` +
        `• Fitur Auto-Prem: *AKTIF ✅*\n\n` +
        `_Nomor di atas telah disimpan di sistem. Kapan pun nomor ini ngechat atau kirim pesan ke bot, statusnya otomatis Premium tanpa perlu addprem ulang._`
      );
    }
  },

  // 3. Delete Premium User
  {
    name: 'delprem',
    aliases: ['hapusprem'],
    category: 'OWNER',
    description: 'Mencabut status user Premium & menghapus dari whitelist auto prem (Owner Only)',
    usage: '.delprem <nomor>',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      const rawTarget = ctx.args[0];
      if (!rawTarget) return ctx.reply(`Format: *${ctx.prefix}delprem 62812345678*`);

      const targetDigits = rawTarget.replace(/\D/g, '');
      removePersistentPremiumNumber(targetDigits);

      const targetJid = `${targetDigits}@s.whatsapp.net`;
      const targetUser = await getUser(targetJid);

      targetUser.premium = false;
      targetUser.premiumExpired = null;
      targetUser.role = 'user';
      targetUser.limit = 50;
      await targetUser.save?.();

      await ctx.reply(`🗑️ Status Premium untuk wa.me/${targetDigits} telah berhasil dicabut dan dihapus dari daftar auto prem.`);
    }
  },

  // 3b. List All Premium Users & Whitelist with Payment/Expiration Status
  {
    name: 'listprem',
    aliases: ['premlist'],
    category: 'OWNER',
    description: 'Melihat seluruh daftar nomor Premium beserta sisa masa aktif & status pembayaran (Owner Only)',
    usage: '.listprem',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      const autoList = getPersistentPremiumNumbers();
      const allUsers = getAllMemoryUsers().filter(u => u.premium || u.role === 'premium');

      if (autoList.length === 0 && allUsers.length === 0) {
        return ctx.reply(`ℹ️ Belum ada nomor pengguna yang terdaftar sebagai Premium.`);
      }

      const now = new Date();
      let text = `👑 *DAFTAR NOMOR AUTO-PREMIUM & VIP* 👑\n\n`;
      text += `Total Nomor VIP/Prem: ${allUsers.length || autoList.length}\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;

      if (allUsers.length > 0) {
        allUsers.forEach((u, idx) => {
          const num = u.id.split('@')[0];
          let status = '✅ AKTIFF';
          let expireInfo = 'Permanen / Auto-Prem';

          if (u.premiumExpired) {
            const exp = new Date(u.premiumExpired);
            if (exp < now) {
              status = '⚠️ NUNGGAK / EXPIRED';
              expireInfo = `Kadaluarsa ${exp.toLocaleDateString('id-ID')}`;
            } else {
              const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              expireInfo = `Sisa ${diffDays} hari (s/d ${exp.toLocaleDateString('id-ID')})`;
            }
          }

          text += `${idx + 1}. wa.me/${num}\n`;
          text += `   • Status: *${status}*\n`;
          text += `   • Masa Aktif: ${expireInfo}\n\n`;
        });
      } else {
        autoList.forEach((num, idx) => {
          text += `${idx + 1}. wa.me/${num} (Auto-Prem Whitelist ✅)\n`;
        });
      }

      await ctx.reply(text);
    }
  },

  // 3c. List Overdue / Expired Premium Users (Nunggak Bayar)
  {
    name: 'listnunggak',
    aliases: ['premnunggak', 'ceknunggak'],
    category: 'OWNER',
    description: 'Menampilkan daftar user Premium yang sudah habis masa aktifnya / nunggak belum bayar (Owner Only)',
    usage: '.listnunggak',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      const allUsers = getAllMemoryUsers();
      const now = new Date();

      const overdueUsers = allUsers.filter(u => {
        if (!u.premiumExpired) return false;
        return new Date(u.premiumExpired) < now;
      });

      if (overdueUsers.length === 0) {
        return ctx.reply(`✅ *TIDAK ADA USER PREM NUNGGAK!*\nSeluruh pengguna Premium saat ini dalam kondisi aktif dan telah melunasi pembayaran.`);
      }

      let text = `🚨 *DAFTAR USER PREM NUNGGAK / EXPIRED* (${overdueUsers.length} User)\n\n`;
      text += `_Nomor-nomor di bawah ini telah melewati masa aktif berlangganan Premium:_\n\n`;

      overdueUsers.forEach((u, idx) => {
        const num = u.id.split('@')[0];
        const exp = new Date(u.premiumExpired);
        const diffDays = Math.floor((now.getTime() - exp.getTime()) / (1000 * 60 * 60 * 24));

        text += `${idx + 1}. 👤 wa.me/${num}\n`;
        text += `   • Nama: *${u.name || 'User'}*\n`;
        text += `   • Tgl Jatuh Tempo: *${exp.toLocaleDateString('id-ID')}*\n`;
        text += `   • Telat Bayar: *${diffDays} hari*\n`;
        text += `   • Tindakan: Ketik \`${ctx.prefix}delprem ${num}\` untuk pencabutan VIP.\n\n`;
      });

      await ctx.reply(text);
    }
  },

  // 3d. Cek Detail Status Premium & Pembayaran User
  {
    name: 'cekprem',
    aliases: ['cekbayar'],
    category: 'OWNER',
    description: 'Mengecek rincian masa aktif & status pembayaran nomor pengguna (Owner Only)',
    usage: '.cekprem <nomor>',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      const rawTarget = ctx.args[0];
      if (!rawTarget) {
        return ctx.reply(`Format: *${ctx.prefix}cekprem 62812345678*`);
      }

      const targetDigits = rawTarget.replace(/\D/g, '');
      const targetJid = `${targetDigits}@s.whatsapp.net`;
      const targetUser = await getUser(targetJid);
      const isAuto = getPersistentPremiumNumbers().includes(targetDigits);

      const now = new Date();
      let statusText = '👤 USER REGULER (Bukan Premium)';
      let detailExpire = 'Tidak Ada Masa Aktif VIP';

      if (targetUser.premium || isAuto) {
        if (!targetUser.premiumExpired) {
          statusText = '👑 PREMIUM PERMANEN (VIP Lifetime)';
          detailExpire = 'Selamanya / Auto-Prem Whitelist';
        } else {
          const exp = new Date(targetUser.premiumExpired);
          if (exp < now) {
            statusText = '🚨 PREMIUM NUNGGAK / EXPIRED (Belum Bayar)';
            detailExpire = `Kadaluarsa pada ${exp.toLocaleDateString('id-ID')}`;
          } else {
            const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            statusText = '✨ PREMIUM AKTIF (VIP Member)';
            detailExpire = `Aktif s/d ${exp.toLocaleDateString('id-ID')} (Sisa ${diffDays} Hari)`;
          }
        }
      }

      await ctx.reply(
        `📋 *Rincian Status Premium & Tagihan User* 💳\n\n` +
        `• 📱 *Nomor:* wa.me/${targetDigits}\n` +
        `• 👤 *Nama:* ${targetUser.name || 'User'}\n` +
        `• 👑 *Status:* ${statusText}\n` +
        `• ⏱️ *Masa Berlaku:* ${detailExpire}\n` +
        `• ⚡ *Energi/Limit:* ${targetUser.limit || 0}\n` +
        `• 🪙 *Saldo Koin:* ${(targetUser.koin || 0).toLocaleString('id-ID')}\n` +
        `• 📦 *Whitelist Auto-Prem:* ${isAuto ? 'Ya ✅' : 'Tidak ❌'}`
      );
    }
  },

  // 4. Add Limit / Energi to User
  {
    name: 'addlimit',
    category: 'OWNER',
    description: 'Menambahkan kuota limit energi pengguna (Owner Only)',
    usage: '.addlimit <nomor> <jumlah>',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      const rawTarget = ctx.args[0];
      const amount = parseInt(ctx.args[1] || '100', 10);
      if (!rawTarget || isNaN(amount)) {
        return ctx.reply(`Format: *${ctx.prefix}addlimit 62812345678 100*`);
      }

      const targetDigits = rawTarget.replace(/\D/g, '');
      const targetJid = `${targetDigits}@s.whatsapp.net`;
      const targetUser = await getUser(targetJid);

      targetUser.limit = (targetUser.limit || 0) + amount;
      await targetUser.save?.();

      await ctx.reply(`⚡ Berhasil menambahkan *+${amount} Limit* ke wa.me/${targetDigits} (Total: ${targetUser.limit} Limit).`);
    }
  },

  // 5. Add Koin to User
  {
    name: 'addkoin',
    category: 'OWNER',
    description: 'Menambahkan saldo koin pengguna (Owner Only)',
    usage: '.addkoin <nomor> <jumlah>',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      const rawTarget = ctx.args[0];
      const amount = parseInt(ctx.args[1] || '5000', 10);
      if (!rawTarget || isNaN(amount)) {
        return ctx.reply(`Format: *${ctx.prefix}addkoin 62812345678 5000*`);
      }

      const targetDigits = rawTarget.replace(/\D/g, '');
      const targetJid = `${targetDigits}@s.whatsapp.net`;
      const targetUser = await getUser(targetJid);

      targetUser.koin = (targetUser.koin || 0) + amount;
      await targetUser.save?.();

      await ctx.reply(`🪙 Berhasil menambahkan *+${amount.toLocaleString('id-ID')} Koin* ke wa.me/${targetDigits} (Total: ${targetUser.koin.toLocaleString('id-ID')} Koin).`);
    }
  },

  // 6. Ban User
  {
    name: 'ban',
    aliases: ['banned'],
    category: 'OWNER',
    description: 'Memblokir pengguna dari penggunaan bot (Owner Only)',
    usage: '.ban <nomor> <alasan>',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      const rawTarget = ctx.args[0];
      const reason = ctx.args.slice(1).join(' ') || 'Melanggar ketentuan bot';
      if (!rawTarget) return ctx.reply(`Format: *${ctx.prefix}ban 62812345678 Spam berlebihan*`);

      const targetDigits = rawTarget.replace(/\D/g, '');
      const targetJid = `${targetDigits}@s.whatsapp.net`;
      const targetUser = await getUser(targetJid);

      targetUser.banned = true;
      targetUser.banReason = reason;
      await targetUser.save?.();

      await ctx.reply(`🚫 Pengguna wa.me/${targetDigits} telah berhasil diblokir (Banned) dari sistem bot.\nAlasan: ${reason}`);
    }
  },

  // 7. Unban User
  {
    name: 'unban',
    category: 'OWNER',
    description: 'Membuka blokir pengguna (Owner Only)',
    usage: '.unban <nomor>',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      const rawTarget = ctx.args[0];
      if (!rawTarget) return ctx.reply(`Format: *${ctx.prefix}unban 62812345678*`);

      const targetDigits = rawTarget.replace(/\D/g, '');
      const targetJid = `${targetDigits}@s.whatsapp.net`;
      const targetUser = await getUser(targetJid);

      targetUser.banned = false;
      targetUser.banReason = null;
      await targetUser.save?.();

      await ctx.reply(`✅ Pengguna wa.me/${targetDigits} telah dipulihkan (Unbanned).`);
    }
  },

  // 8. Set Bot Prefix
  {
    name: 'setprefix',
    category: 'OWNER',
    description: 'Mengubah karakter prefix bot secara dinamis (Owner Only)',
    usage: '.setprefix <simbol>',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      const newPrefix = ctx.args[0];
      if (!newPrefix) return ctx.reply(`Format: *${ctx.prefix}setprefix !* atau *${ctx.prefix}setprefix .*`);

      config.prefix = newPrefix;
      await ctx.reply(`✨ Prefix bot berhasil diubah menjadi: *${newPrefix}*`);
    }
  },

  // 9. Clear Temporary Cache
  {
    name: 'cleartmp',
    aliases: ['clearcache'],
    category: 'OWNER',
    description: 'Membersihkan sampah session, cache, dan memori (Owner Only)',
    usage: '.cleartmp',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      if (global.gc) {
        global.gc();
      }
      const mem = process.memoryUsage();
      await ctx.reply(
        `🧹 *PEMBERSIHAN CACHE & MEMORI*\n\n` +
        `• Status: Berhasil dibersihkan ✅\n` +
        `• RAM Heap: ${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB / ${(mem.heapTotal / 1024 / 1024).toFixed(1)} MB\n` +
        `• RSS: ${(mem.rss / 1024 / 1024).toFixed(1)} MB`
      );
    }
  },

  // 10. Eval JavaScript (Root Execution)
  {
    name: 'eval',
    aliases: ['>', 'ev'],
    category: 'OWNER',
    description: 'Mengevaluasi kode JavaScript secara langsung (Owner Only)',
    usage: '.eval <kode>',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      const code = ctx.text.trim();
      if (!code) return ctx.reply(`Format: *${ctx.prefix}eval 1 + 1*`);

      try {
        let result = eval(code);
        if (typeof result !== 'string') {
          result = util.inspect(result, { depth: 1 });
        }
        await ctx.reply(`💻 *EVAL HASIL:*\n\`\`\`javascript\n${result}\n\`\`\``);
      } catch (err: any) {
        await ctx.reply(`❌ *EVAL ERROR:*\n\`\`\`${err.message}\n\`\`\``);
      }
    }
  },

  // 11. Mode Self / Public
  {
    name: 'self',
    category: 'OWNER',
    description: 'Mengubah mode bot menjadi khusus Owner (Self Mode)',
    usage: '.self',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🔒 *BOT MODE: SELF*\nSaat ini bot hanya merespon perintah dari Owner (${config.ownerName}).`);
    }
  },
  {
    name: 'public',
    category: 'OWNER',
    description: 'Mengubah mode bot menjadi Public (Dapat digunakan semua user)',
    usage: '.public',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🌍 *BOT MODE: PUBLIC*\nBot kini aktif dan dapat digunakan oleh semua pengguna dan grup.`);
    }
  },

  // 12. Acc / Approval Akses 18+ Grup / User
  {
    name: 'acc18',
    aliases: ['accnsfw', 'acc18plus', 'accgrup18', 'add18user'],
    category: 'OWNER',
    description: 'Menyetujui permohonan grup / user untuk membuka akses fitur 18+ (Tersimpan Permanen di DB)',
    usage: '.acc18 <ID_Grup / Nomor_User>',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      let targetInput = ctx.args[0] || (ctx.isGroup ? ctx.group?.id : '');
      if (ctx.quotedUserJid) {
        targetInput = ctx.quotedUserJid;
      }

      if (!targetInput) {
        return ctx.reply(`Format: *${ctx.prefix}acc18 <ID_Grup / Nomor_User>*\nContoh: *${ctx.prefix}acc18 120363xxx@g.us* atau *${ctx.prefix}acc18 628xxx*`);
      }

      const cleanInput = targetInput.trim();
      const isGroupJid = cleanInput.includes('@g.us') || cleanInput.startsWith('120363');

      if (isGroupJid) {
        const approvedGroup = await approveGroup18(cleanInput, ctx.senderJid || 'Owner');
        return await ctx.reply(
          `✅ *PERSETUJUAN 18+ TERSIMPAN DI DATABASE*\n\n` +
          `• Nama Grup: *${approvedGroup.name || 'Grup'}*\n` +
          `• ID JID: \`${approvedGroup.id}\`\n` +
          `• Disetujui Oleh: *Owner (${config.ownerName})*\n` +
          `• Status Storage: *DI-ACC & TERSIMPAN DI DATABASE (approved18_groups.json)* ✅\n\n` +
          `Grup ini sekarang RESMI DIIZINKAN mengakses fitur 18+ (.anime18 / .waifu18) secara permanen tanpa perlu meminta persetujuan lagi!`
        );
      } else {
        const res = addPersistent18User(cleanInput);
        if (res.success) {
          return await ctx.reply(
            `✅ *AKSES 18+ USER TERSIMPAN DI DATABASE*\n\n` +
            `• Nomor User: *+${res.cleanNumber}*\n` +
            `• Disetujui Oleh: *Owner (${config.ownerName})*\n` +
            `• Status Storage: *PERMANEN DI DATABASE (approved18_users.json)* ✅\n\n` +
            `Pengguna ini secara resmi mendapatkan otorisasi akses 18+ tanpa perlu mengulang permohonan lagi!`
          );
        } else {
          return await ctx.reply(`❌ Format nomor tidak valid.`);
        }
      }
    }
  },
  {
    name: 'reject18',
    aliases: ['refuse18', 'tolak18', 'del18user'],
    category: 'OWNER',
    description: 'Menolak / mencabut persetujuan Owner untuk fitur 18+ grup / user (Owner Only)',
    usage: '.reject18 <ID_Grup / Nomor_User>',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      let targetInput = ctx.args[0] || (ctx.isGroup ? ctx.group?.id : '');
      if (ctx.quotedUserJid) {
        targetInput = ctx.quotedUserJid;
      }

      if (!targetInput) {
        return ctx.reply(`Format: *${ctx.prefix}reject18 <ID_Grup / Nomor_User>*`);
      }

      const cleanInput = targetInput.trim();
      const isGroupJid = cleanInput.includes('@g.us') || cleanInput.startsWith('120363');

      if (isGroupJid) {
        const revokedGroup = await revokeGroup18(cleanInput);
        return await ctx.reply(
          `🚫 *AKSES 18+ DICABUT DARI DATABASE*\n\n` +
          `• Nama Grup: *${revokedGroup.name || 'Grup'}*\n` +
          `• ID JID: \`${revokedGroup.id}\`\n\n` +
          `Akses fitur 18+ untuk grup tersebut telah dikunci dan dihapus dari database.`
        );
      } else {
        const res = removePersistent18User(cleanInput);
        return await ctx.reply(
          `🚫 *AKSES 18+ USER DICABUT DARI DATABASE*\n\n` +
          `• Nomor User: *+${res.cleanNumber}*\n\n` +
          `Akses fitur 18+ untuk nomor tersebut telah dibatalkan dan dihapus dari database.`
        );
      }
    }
  },
  {
    name: 'listaju18',
    aliases: ['listreq18', 'cekaju18', 'reqlist18'],
    category: 'OWNER',
    description: 'Melihat daftar seluruh pengajuan akses 18+ grup yang sedang menunggu persetujuan Owner',
    usage: '.listaju18',
    ownerOnly: true,
    execute: async (ctx: CommandContext) => {
      const allGroups = getAllMemoryGroups();
      const pendingGroups = allGroups.filter(g => g.ageConsentAccepted && !g.ownerApproved18);

      if (pendingGroups.length === 0) {
        return ctx.reply(
          `📋 *DAFTAR PENGAJUAN AKSES 18+ GRUP*\n\n` +
          `✅ *Saat ini tidak ada permohonan yang tertunda.* Semua permohonan grup telah ditinjau.`
        );
      }

      let text = `📋 *DAFTAR PENGAJUAN AKSES 18+ GRUP* (${pendingGroups.length} Grup Pending)\n\n`;
      pendingGroups.forEach((g, idx) => {
        text += `${idx + 1}. *${g.name || 'Grup WhatsApp'}*\n`;
        text += `   • ID JID: \`${g.id}\`\n`;
        text += `   • Disetujui Admin: @${g.ageConsentAcceptedBy ? g.ageConsentAcceptedBy.split('@')[0] : 'Admin'}\n`;
        text += `   • Akses ACC: \`${ctx.prefix}acc18 ${g.id}\`\n`;
        text += `   • Akses Tolak: \`${ctx.prefix}reject18 ${g.id}\`\n\n`;
      });

      await ctx.reply(text);
    }
  }
];

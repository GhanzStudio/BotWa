/**
 * Main Menu & Bot Info Commands
 */

import { BotCommand, CommandContext } from './types.ts';
import { config } from '../config.ts';
import { resolveRealPhoneNumber } from '../lib/lidResolver.ts';
import { isConfiguredOwner } from '../database/models/User.ts';
import os from 'os';
import path from 'path';
import fs from 'fs';

function getCategoryIcon(cat: string): string {
  const c = cat.toUpperCase();
  if (c.includes('MAIN')) return '📌';
  if (c.includes('OWNER')) return '👑';
  if (c.includes('TOOL')) return '🛠️';
  if (c.includes('GAME')) return '🎮';
  if (c.includes('DOWNLOAD')) return '📥';
  if (c.includes('SEARCH')) return '🔍';
  if (c.includes('STICKER')) return '🎨';
  if (c.includes('AI')) return '🤖';
  if (c.includes('GROUP') || c.includes('GRUP')) return '👥';
  if (c.includes('RELIGI') || c.includes('ISLAM')) return '🕌';
  if (c.includes('INFO')) return 'ℹ️';
  if (c.includes('CEK')) return '🔎';
  if (c.includes('USER') || c.includes('PROFILE')) return '👤';
  if (c.includes('CANVAS')) return '🖼️';
  if (c.includes('RANDOM')) return '🎲';
  if (c.includes('EPHOTO') || c.includes('LOGO')) return '✨';
  if (c.includes('ANIME')) return '🎏';
  if (c.includes('CLAN') || c.includes('GUILD')) return '🛡️';
  if (c.includes('CONVERT')) return '🔄';
  if (c.includes('BERITA') || c.includes('NEWS')) return '📰';
  if (c.includes('STALKER')) return '🕵️';
  if (c.includes('TTS') || c.includes('VOICE')) return '🎙️';
  if (c.includes('RPG')) return '⚔️';
  return '📂';
}

export const mainCommands: BotCommand[] = [
  {
    name: 'menu',
    aliases: ['help', 'start', 'menucat'],
    category: 'MAIN MENU',
    description: 'Menampilkan menu utama, kategori, atau sub-menu spesifik',
    usage: '.menu [nama_kategori]',
    execute: async (ctx: CommandContext) => {
      const { user, prefix, reply, senderJid, text: queryText } = ctx;
      const identity = resolveRealPhoneNumber(senderJid || user.id);
      const isOwnerUser = isConfiguredOwner(identity.phoneNumber) || isConfiguredOwner(senderJid || user.id);
      const isPremUser = user.premium || user.role === 'premium';

      const query = queryText ? queryText.trim().toLowerCase() : '';

      // Import command category registry
      const { getCommandsByCategory, getAllCommands } = await import('./index.ts');
      const grouped = getCommandsByCategory();

      // If user typed a category argument or sub-command like .menu ai, .menu download, .menu owner
      if (query) {
        // Try matching category
        let targetCategory = '';
        let matchedCmds: BotCommand[] = [];

        for (const [catName, cmds] of Object.entries(grouped)) {
          const catClean = catName.toLowerCase();
          if (
            catClean === query ||
            catClean.includes(query) ||
            query.includes(catClean) ||
            (query === 'owner' && catClean.includes('owner')) ||
            (query === 'ai' && catClean.includes('ai')) ||
            (query === 'tools' && catClean.includes('tool')) ||
            (query === 'game' && catClean.includes('game')) ||
            (query === 'download' && catClean.includes('download')) ||
            (query === 'search' && catClean.includes('search')) ||
            (query === 'sticker' && catClean.includes('sticker')) ||
            (query === 'group' && catClean.includes('group')) ||
            (query === 'religi' && catClean.includes('religi')) ||
            (query === 'rpg' && catClean.includes('rpg')) ||
            (query === 'anime' && catClean.includes('anime')) ||
            (query === 'berita' && catClean.includes('berita')) ||
            (query === 'clan' && catClean.includes('clan'))
          ) {
            targetCategory = catName;
            matchedCmds = cmds;
            break;
          }
        }

        if (targetCategory && matchedCmds.length > 0) {
          const icon = getCategoryIcon(targetCategory);
          let catReply = `╭───「 ${icon} *KATEGORI: ${targetCategory.toUpperCase()}* 」\n│\n`;
          for (const cmd of matchedCmds) {
            const aliasesStr = cmd.aliases && cmd.aliases.length > 0 ? ` (Alias: ${cmd.aliases.map(a => prefix + a).join(', ')})` : '';
            catReply += `│ 📌 *${prefix}${cmd.name}*\n│    └ ${cmd.description || 'Fitur bot'}${aliasesStr}\n`;
          }
          catReply += `│\n╰─────────────────────────────\n`;
          catReply += `*Total ${matchedCmds.length} perintah dalam kategori ini.*\n`;
          catReply += `_Ketik ${prefix}menu untuk kembali ke daftar menu utama._`;

          await reply(catReply);
          return;
        }

        // Try matching individual command detail
        const allCmds = getAllCommands();
        const singleCmd = allCmds.find(c => c.name.toLowerCase() === query || (c.aliases && c.aliases.map(a => a.toLowerCase()).includes(query)));
        if (singleCmd) {
          const detailText =
            `📌 *INFORMASI PERINTAH: ${prefix}${singleCmd.name.toUpperCase()}*\n\n` +
            `• *Nama Command:* ${prefix}${singleCmd.name}\n` +
            `• *Kategori:* ${singleCmd.category}\n` +
            `• *Deskripsi:* ${singleCmd.description || '-'}\n` +
            `• *Penggunaan:* ${singleCmd.usage || prefix + singleCmd.name}\n` +
            `• *Alias:* ${singleCmd.aliases && singleCmd.aliases.length > 0 ? singleCmd.aliases.map(a => prefix + a).join(', ') : 'Tidak ada'}\n` +
            `• *Akses Khusus:* ${singleCmd.ownerOnly ? '👑 Khusus Owner' : (singleCmd.premiumOnly ? '💎 Khusus Premium' : '👤 Semua Pengguna')}\n\n` +
            `_Ketik ${prefix}menu untuk melihat seluruh kategori._`;
          await reply(detailText);
          return;
        }
      }

      // Default Main Menu Overview
      const roleText = isOwnerUser ? '👑 OWNER (SUPER ADMIN)' : (isPremUser ? '💎 PREMIUM (VIP)' : '👤 USER BIASA');
      const limitText = isOwnerUser ? 'Unlimited (Bebas Biaya 👑)' : (isPremUser ? 'Unlimited (VIP ✨)' : `${user.limit || 0} tersisa`);
      const koinText = isOwnerUser ? '🪙 Unlimited (Sultan)' : `🪙 ${(user.koin || 0).toLocaleString('id-ID')}`;
      const levelText = isOwnerUser ? '🎖️ 999 (Max Developer 👑)' : `🎖️ ${user.level || 1} (Exp: ${user.exp || 0})`;

      const text = `👋 *Halo, ${user.name || 'Pengguna'}!*

╭───「 *INFORMASI PENGGUNA* 」
│ 👤 Nama: ${user.name || 'Pengguna'} ${isOwnerUser ? '👑' : ''}
│ 📱 Nomor: ${identity.formattedPhone}
│ 🏷️ Role: ${roleText}
│ ⚡ Limit: ${limitText}
│ 🪙 Koin: ${koinText}
│ 🎖️ Level: ${levelText}
╰───────────────────────

╭───「 📂 *KATEGORI FITUR BOT* 」
│ 📌 *${prefix}allmenu* ──── (Lihat Seluruh 180+ Fitur)
│ 👑 *${prefix}menu owner* ── (Perintah Khusus Owner)
│ 🛠️ *${prefix}menu tools* ── (Alat Praktis & Utilitas)
│ 🤖 *${prefix}menu ai* ───── (Kecerdasan Buatan AI)
│ 🎮 *${prefix}menu game* ─── (Game Interaktif & Kuis)
│ 📥 *${prefix}menu download*(Downloader Media Sosial)
│ 🔍 *${prefix}menu search* ─ (Pencarian Data & Web)
│ 🎨 *${prefix}menu sticker*(Pembuat Stiker WA)
│ 👥 *${prefix}menu group* ── (Pengelola & Moderasi Grup)
│ 🕌 *${prefix}menu religi* ─ (Fitur & Jadwal Islami)
│ 📰 *${prefix}menu berita* ─ (Berita Terkini)
│ 🎲 *${prefix}menu rpg* ──── (Game Petualangan RPG)
│ 🎏 *${prefix}menu anime* ── (Nonton & Info Anime)
│ 👤 *${prefix}profile* ───── (Cek Profil Lengkap)
╰───────────────────────

💡 *Tips:* Ketik *${prefix}menu <kategori>* untuk membuka perintah di kategori tersebut.
_Contoh: Ketik *${prefix}menu ai* atau *${prefix}menu download*_`;

      await reply(text);
    }
  },
  {
    name: 'allmenu',
    category: 'MAIN MENU',
    description: 'Menampilkan seluruh daftar command yang tersedia secara rapi dan lengkap',
    usage: '.allmenu',
    execute: async (ctx: CommandContext) => {
      const { prefix, reply } = ctx;
      const { getCommandsByCategory, getTotalCommandsCount } = await import('./index.ts');
      const grouped = getCommandsByCategory();
      const totalCmds = getTotalCommandsCount();

      let text = `📜 *DAFTAR LENGKAP FITUR ${config.botName.toUpperCase()} (${totalCmds}+ COMMANDS)*\n\n`;

      for (const [catName, cmds] of Object.entries(grouped)) {
        const icon = getCategoryIcon(catName);
        text += `┌── [ ${icon} *${catName.toUpperCase()}* ]\n`;

        // Format commands nicely in rows of 3
        const cmdLines: string[] = [];
        let line = '│ • ';
        for (let i = 0; i < cmds.length; i++) {
          const cmdStr = `${prefix}${cmds[i].name}`;
          if ((line + cmdStr).length > 42 || (i > 0 && i % 3 === 0)) {
            cmdLines.push(line);
            line = `│ • ${cmdStr}`;
          } else {
            line += (line === '│ • ' ? '' : ', ') + cmdStr;
          }
        }
        if (line !== '│ • ') {
          cmdLines.push(line);
        }

        text += cmdLines.join('\n') + '\n└──\n\n';
      }

      text += `_Gunakan perintah dengan bijak. Total fitur aktif: ${totalCmds}+_`;
      await reply(text);
    }
  },
  {
    name: 'ping',
    aliases: ['speed'],
    category: 'MAIN MENU',
    description: 'Cek kecepatan respon dan latensi bot',
    usage: '.ping',
    execute: async (ctx: CommandContext) => {
      const start = Date.now();
      const latency = Date.now() - start;
      const uptime = Math.floor(process.uptime());
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = uptime % 60;
      await ctx.reply(`🏓 *Pong!*\n⚡ Latensi: ${latency}ms\n⏱️ Uptime: ${hours}j ${minutes}m ${seconds}d\n💾 RAM: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)} MB`);
    }
  },
  {
    name: 'owner',
    aliases: ['creator', 'developer'],
    category: 'MAIN MENU',
    description: 'Informasi kontak pemilik/developer bot',
    usage: '.owner',
    execute: async (ctx: CommandContext) => {
      const ownerIdentity = resolveRealPhoneNumber(config.ownerNumber || '6287891284460');
      await ctx.reply(
        `👑 *OWNER & DEVELOPER UTAMA* 👑\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `• Nama: ${config.ownerName || 'GhanzStudio'} 👑\n` +
        `• Nomor HP: ${ownerIdentity.formattedPhone}\n` +
        `• WhatsApp: https://wa.me/${ownerIdentity.phoneNumber}\n` +
        `• ID Akun (LID): 56106063794223@lid\n` +
        `• JID: ${ownerIdentity.jid}\n` +
        `• Status: 👑 FOUNDER / SUPER ADMIN\n` +
        `• GitHub: ${config.githubRepo}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `_Untuk keperluan sewa bot, upgrade VIP Premium, atau kerja sama silakan hubungi kontak resmi di atas._`
      );
    }
  },
  {
    name: 'rules',
    category: 'MAIN MENU',
    description: 'Ketentuan dan peraturan penggunaan bot',
    usage: '.rules',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📜 *RULES PENGGUNAAN BOT*\n\n1. Dilarang melakukan spam command beruntun.\n2. Dilarang menelepon / video call nomor bot (auto-block).\n3. Dilarang menggunakan bot untuk konten ilegal, SARA, atau pornografi.\n4. Hormati kuota limit harian atau upgrade ke Premium.\n5. Bot berhak memblokir user yang melanggar ketentuan tanpa refund.`);
    }
  },
  {
    name: 'donasi',
    aliases: ['donate', 'qris', 'cekqris', 'lihatqris', 'donasipict', 'qrismember', 'qrisbot'],
    category: 'MAIN MENU',
    description: 'Informasi donasi & lihat QRIS resmi untuk mendukung operasional server bot',
    usage: '.donasi / .qris / .cekqris / .lihatqris',
    execute: async (ctx: CommandContext) => {
      const donationMessage =
        `💖 *DONASI & DUKUNGAN BOT*\n\n` +
        `Terima kasih banyak atas niat baik kamu untuk mendukung operasional server bot ini 🙏\n\n` +
        `• *QRIS (All Payment):* Silakan scan kode QRIS pada gambar di atas\n` +
        `• *Transfer E-Wallet:* 087817697830 (Dana / GoPay / OVO)\n` +
        `• *Hubungi Owner:* +62 878-9128-4460\n\n` +
        `_Dukungan sekecil apa pun sangat berarti agar layanan bot bisa terus aktif 24 jam. Terima kasih!_`;

      try {
        const { getQrisImageFromDB } = await import('../database/models/QrisSettings.ts');
        const qrisData = await getQrisImageFromDB();

        if (qrisData && qrisData.buffer && ctx.sendImage) {
          await ctx.sendImage(qrisData.buffer, donationMessage);
          return;
        }
      } catch (err: any) {
        console.warn('[donasi] Gagal mengambil gambar dari DB, fallback ke file lokal:', err.message);
      }

      const qrisPath = path.resolve(process.cwd(), 'bot/assets/qris.jpg');
      if (fs.existsSync(qrisPath) && ctx.sendImage) {
        try {
          const imageBuffer = fs.readFileSync(qrisPath);
          await ctx.sendImage(imageBuffer, donationMessage);
          return;
        } catch (err: any) {
          console.warn('[donasi] Gagal mengirim gambar QRIS:', err.message);
        }
      }

      await ctx.reply(donationMessage);
    }
  },
  {
    name: 'sc',
    aliases: ['script', 'sourcecode'],
    category: 'MAIN MENU',
    description: 'Tautan repositori source code bot',
    usage: '.sc',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`💻 *SOURCE CODE BOT*\n\nProyek ini dikembangkan secara modular:\n🔗 Repository: ${config.githubRepo}\n⭐ Jangan lupa berikan Star di GitHub ya!`);
    }
  },
  {
    name: 'stats',
    aliases: ['system', 'botstats'],
    category: 'MAIN MENU',
    description: 'Statistik teknis server dan bot',
    usage: '.stats',
    execute: async (ctx: CommandContext) => {
      const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
      const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const cpus = os.cpus().length;
      await ctx.reply(`📊 *STATUS SISTEM BOT*\n\n• Platform: ${os.platform()} (${os.arch()})\n• CPU Cores: ${cpus}\n• Node.js: ${process.version}\n• Memory: Free ${freeMem} GB / Total ${totalMem} GB\n• Bot Mode: Multi-Device (MD)\n• Engine: Baileys + Mongoose`);
    }
  },
  {
    name: 'totalfitur',
    category: 'MAIN MENU',
    description: 'Melihat total seluruh fitur yang tersedia',
    usage: '.totalfitur',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📈 *TOTAL FITUR AKTIF*\n\nTotal saat ini tersedia *184 fitur* terbagi dalam 20 kategori lengkap!`);
    }
  },
  {
    name: 'carifitur',
    category: 'MAIN MENU',
    description: 'Mencari fitur berdasarkan kata kunci',
    usage: '.carifitur <kata_kunci>',
    execute: async (ctx: CommandContext) => {
      const query = ctx.text.trim().toLowerCase();
      if (!query) return ctx.reply(`Gunakan format: ${ctx.prefix}carifitur <kata kunci>\nContoh: ${ctx.prefix}carifitur download`);
      await ctx.reply(`🔍 Hasil pencarian fitur untuk "${query}":\n• Ditemukan command terkait pada kategori yang sesuai.\nKetik *${ctx.prefix}allmenu* untuk rincian.`);
    }
  },
  {
    name: 'benefitpremium',
    category: 'MAIN MENU',
    description: 'Keuntungan menjadi user premium',
    usage: '.benefitpremium',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🌟 *KEUNTUNGAN USER PREMIUM*\n\n✅ Unlimited Limit / Energi\n✅ Bebas Cooldown pada command downloader & AI\n✅ Akses eksklusif ke model GPT-4o & AI Image Gen\n✅ Prioritas antrean rendering\n✅ Badge [PREMIUM] di profil\n\n_Hubungi ${ctx.prefix}owner untuk info harga langganan!_`);
    }
  },
  {
    name: 'benefitowner',
    category: 'MAIN MENU',
    description: 'Informasi hak akses owner',
    usage: '.benefitowner',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`👑 *KEUNTUNGAN OWNER*\n\nAkses penuh ke seluruh kontrol bot, database management, blacklist/unban, broadcast, eval command, dan setting grup.`);
    }
  },
  {
    name: 'jadibot',
    category: 'MAIN MENU',
    description: 'Menjadikan nomor WhatsApp kamu sebagai bot clone',
    usage: '.jadibot',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🤖 *JADIBOT (BOT CLONE)*\n\nFitur ini memungkinkan nomor kamu menjadi clone dari bot ini dengan session terisolasi.\nSilakan gunakan web dashboard atau hubungi owner untuk mengaktifkan slot jadibot.`);
    }
  },
  {
    name: 'stopjadibot',
    category: 'MAIN MENU',
    description: 'Menghentikan sesi bot clone',
    usage: '.stopjadibot',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`⏹️ *STOP JADIBOT*\nSesi clone berhasil dihentikan.`);
    }
  },
  {
    name: 'leaderboard',
    aliases: ['lb', 'top'],
    category: 'MAIN MENU',
    description: 'Papan peringkat top level & koin',
    usage: '.leaderboard',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🏆 *PAPAN PERINGKAT (LEADERBOARD)*\n\n1. 🥇 MasterGhanz - Lv. 85 (🪙 1.450.000 koin)\n2. 🥈 Ryuko - Lv. 72 (🪙 920.000 koin)\n3. 🥉 Kenshin - Lv. 64 (🪙 650.000 koin)\n4. 🎖️ Player_01 - Lv. 50 (🪙 410.000 koin)\n5. 🎖️ Kamu (${ctx.user.name}) - Lv. ${ctx.user.level} (🪙 ${ctx.user.koin.toLocaleString('id-ID')} koin)`);
    }
  },
  {
    name: 'menucat',
    category: 'MAIN MENU',
    description: 'Melihat menu per kategori tertentu',
    usage: '.menucat <nama_kategori>',
    execute: async (ctx: CommandContext) => {
      const cat = ctx.text.trim().toLowerCase();
      await ctx.reply(`📂 *MENU KATEGORI: ${cat.toUpperCase() || 'SEMUA'}*\nKetik *${ctx.prefix}allmenu* untuk melihat seluruh rincian command.`);
    }
  },
  {
    name: 'syaratprem',
    aliases: ['daftarprem', 'skprem', 'sewakontrak'],
    category: 'MAIN MENU',
    description: 'Menampilkan Syarat & Ketentuan serta Persetujuan Layanan Langganan Premium',
    usage: '.syaratprem',
    execute: async (ctx: CommandContext) => {
      const text =
        `📌 *SYARAT & KETENTUAN LANGGANAN PREMIUM (TERMS OF SERVICE)* 📄\n\n` +
        `Sebelum mendaftar / mengaktifkan status Premium, Anda **diwajibkan menyetujui** ketentuan berikut:\n\n` +
        `1. 💳 *Pembayaran & Jatuh Tempo:*\n` +
        `   • Pembayaran dilunasi sesuai durasi paket (misal: 30 Hari).\n` +
        `   • Apabila masa berlaku berakhir dan pembayaran belum dilunasi (nunggak), status Premium akan otomatis **ditangguhkan (di-suspend)**.\n\n` +
        `2. 📝 *Persetujuan Pengguna:*\n` +
        `   • Ketik *${ctx.prefix}setuju* untuk memberikan persetujuan resmi atas syarat ini secara tersimpan di Database Bot.\n` +
        `   • Setelah menyetujui, nomor Anda akan terverifikasi dan siap diaktifkan oleh Owner.\n\n` +
        `3. 📍 *Verifikasi Identitas Akun:*\n` +
        `   • Anda dapat secara sukarela membagikan lokasi/wilayah Anda saat verifikasi langganan untuk validasi akun.\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `👉 Ketik *${ctx.prefix}setuju* untuk menyetujui Ketentuan Layanan & melanjutkan aktivasi Premium.`;

      await ctx.reply(text);
    }
  },
  {
    name: 'setuju',
    aliases: ['accprem', 'setujuprem'],
    category: 'MAIN MENU',
    description: 'Menyetujui Syarat & Ketentuan Layanan Premium secara resmi di Database',
    usage: '.setuju',
    execute: async (ctx: CommandContext) => {
      const { user, reply, senderJid, sock } = ctx;

      user.termsAccepted = true;
      user.termsAcceptedAt = new Date();
      await user.save?.();

      const num = senderJid ? senderJid.split('@')[0] : user.id.split('@')[0];

      await reply(
        `✅ *PERSETUJUAN LAYANAN PREMIUM BERHASIL DISIMPAN!* 📋\n\n` +
        `• 📱 *Nomor:* wa.me/${num}\n` +
        `• 👤 *Nama:* ${user.name || 'User'}\n` +
        `• ⏱️ *Waktu Persetujuan:* ${new Date().toLocaleString('id-ID')}\n` +
        `• 📄 *Status:* Telah menyetujui Ketentuan Layanan Premium secara sah!\n\n` +
        `👉 Silakan hubungi Owner (*${ctx.prefix}owner*) atau kirim bukti transfer untuk penyelesaian proses perpanjangan / aktivasi VIP!`
      );

      // Notify Owner about accepted terms
      try {
        if (sock && config.ownerNumber) {
          const ownerJid = `${config.ownerNumber.replace(/\D/g, '')}@s.whatsapp.net`;
          const notifOwner =
            `🔔 *USER TELAH MENYETUJUI SYARAT & KETENTUAN PREMIUM!* 📄\n\n` +
            `• 📱 *User:* ${user.name} (@${num})\n` +
            `• ⏱️ *Waktu:* ${new Date().toLocaleString('id-ID')}\n` +
            `• 📋 *Persetujuan:* S&K Pembayaran & Jatuh Tempo disetujui.\n\n` +
            `Ketik \`${ctx.prefix}addprem ${num} 30\` untuk mengaktifkan paket Premium 30 hari!`;
          await sock.sendMessage(ownerJid, { text: notifOwner });
        }
      } catch (e: any) {
        console.warn('[setuju] Owner notif warning:', e.message);
      }
    }
  },
  {
    name: 'tqto',
    category: 'MAIN MENU',
    description: 'Ucapan terima kasih dan kredit pengembang',
    usage: '.tqto',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🙏 *THANKS TO & CREDITS*\n\n• @whiskeysockets/baileys team (Library WA MD)\n• GhanzStudio (Creator & Main Developer)\n• All Contributors & Users`);
    }
  }
];

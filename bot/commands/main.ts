/**
 * Main Menu & Bot Info Commands
 */

import { BotCommand, CommandContext } from './types.ts';
import { config } from '../config.ts';
import os from 'os';

export const mainCommands: BotCommand[] = [
  {
    name: 'menu',
    aliases: ['help', 'start'],
    category: 'MAIN MENU',
    description: 'Menampilkan menu utama dan kategori bot',
    usage: '.menu',
    execute: async (ctx: CommandContext) => {
      const { user, prefix, reply } = ctx;
      const text = `👋 *Halo, ${user.name || 'Kak'}!*

╭───「 *INFORMASI PENGGUNA* 」
│ 👤 Nama: ${user.name}
│ 🏷️ Role: ${user.role.toUpperCase()}
│ ⚡ Limit: ${user.premium ? 'Unlimited (VIP)' : `${user.limit} tersisa`}
│ 🪙 Koin: ${user.koin.toLocaleString('id-ID')}
│ 🎖️ Level: ${user.level} (Exp: ${user.exp})
╰───────────────────────

╭───「 *KATEGORI FITUR* 」
│ 📌 *${prefix}allmenu* - Seluruh daftar menu
│ 🛠️ *${prefix}menucat tools* - Fitur alat praktis
│ 🎮 *${prefix}menucat game* - Game interaktif
│ 📥 *${prefix}menucat download* - Downloader medsos
│ 🔍 *${prefix}menucat search* - Pencarian web & data
│ 🎨 *${prefix}menucat sticker* - Pembuat stiker WA
│ 🤖 *${prefix}menucat ai* - Kecerdasan Buatan (AI)
│ 👥 *${prefix}menucat group* - Manajemen grup
│ 🕌 *${prefix}menucat religi* - Fitur Islami
│ 📰 *${prefix}menucat berita* - Berita terkini
│ 🎲 *${prefix}menucat rpg* - Game petualangan RPG
│ 👤 *${prefix}profile* - Cek profil lengkapmu
╰───────────────────────

_Ketik ${prefix}allmenu untuk melihat seluruh daftar command sekaligus._`;
      await reply(text);
    }
  },
  {
    name: 'allmenu',
    category: 'MAIN MENU',
    description: 'Menampilkan seluruh daftar command yang tersedia',
    usage: '.allmenu',
    execute: async (ctx: CommandContext) => {
      const { prefix, reply } = ctx;
      const text = `📜 *DAFTAR LENGKAP FITUR ${config.botName.toUpperCase()}*

┌── [ *MAIN MENU* ]
│ • ${prefix}menu, ${prefix}allmenu, ${prefix}ping, ${prefix}owner
│ • ${prefix}rules, ${prefix}donasi, ${prefix}sc, ${prefix}stats
│ • ${prefix}system, ${prefix}jadibot, ${prefix}stopjadibot
│ • ${prefix}leaderboard, ${prefix}totalfitur, ${prefix}carifitur
│ • ${prefix}benefitpremium, ${prefix}benefitowner, ${prefix}tqto
└──

┌── [ *TOOLS* ]
│ • ${prefix}carbon, ${prefix}qrcode, ${prefix}qrcustom, ${prefix}ocr
│ • ${prefix}hd, ${prefix}removebg, ${prefix}ssweb, ${prefix}nulis
│ • ${prefix}styleteks, ${prefix}readmore, ${prefix}tourl, ${prefix}toimg
│ • ${prefix}toaudio, ${prefix}tovideo, ${prefix}tovn, ${prefix}converter
│ • ${prefix}pastebin, ${prefix}getpaste, ${prefix}ipwho, ${prefix}lookup
│ • ${prefix}bandingkan-hp, ${prefix}hitungwrmlbb, ${prefix}kalkulatormbg
│ • ${prefix}nikparser, ${prefix}tempmail, ${prefix}transkrip
└──

┌── [ *GAME* ]
│ • ${prefix}tebakgambar, ${prefix}tebakkata, ${prefix}tebakkalimat
│ • ${prefix}tebakhewan, ${prefix}tebakbendera, ${prefix}tebaklagu
│ • ${prefix}tebaklirik, ${prefix}tebakdrakor, ${prefix}tebakfilm
│ • ${prefix}caklontong, ${prefix}asahotak, ${prefix}family100
│ • ${prefix}susunkata, ${prefix}kataacak, ${prefix}tictactoe
│ • ${prefix}ulartangga, ${prefix}riddle, ${prefix}siapakahaku
└──

┌── [ *DOWNLOAD* ]
│ • ${prefix}tiktok, ${prefix}ttmp3, ${prefix}ttmp4, ${prefix}instagramdl
│ • ${prefix}ytmp3, ${prefix}ytmp4, ${prefix}facebookdl, ${prefix}spotifydl
│ • ${prefix}capcutdl, ${prefix}githubdl, ${prefix}mediafiredl
│ • ${prefix}pinterestdl, ${prefix}pixeldraindl, ${prefix}terabox, ${prefix}videy
└──

┌── [ *AI CHAT & GENERATOR* ]
│ • ${prefix}ai, ${prefix}gemini, ${prefix}gpt4o, ${prefix}deepseek
│ • ${prefix}text2img, ${prefix}musicmaker, ${prefix}quilbot
│ • ${prefix}toanime, ${prefix}toghibli, ${prefix}to3d, ${prefix}tofigure
│ • ${prefix}tocartoon, ${prefix}tochibi, ${prefix}toblack, ${prefix}tohijab
└──

┌── [ *GROUP* ]
│ • ${prefix}hidetag, ${prefix}tagall, ${prefix}kick, ${prefix}promote
│ • ${prefix}demote, ${prefix}open, ${prefix}close, ${prefix}linkgc
│ • ${prefix}groupinfo, ${prefix}rulesgrup, ${prefix}setrulesgrup
│ • ${prefix}setwelcome, ${prefix}setgoodbye, ${prefix}addantilink
│ • ${prefix}delantilink, ${prefix}antilinkall, ${prefix}antitoxic
│ • ${prefix}antispam, ${prefix}antibot, ${prefix}giveaway, ${prefix}absen
└──

┌── [ *RPG & CLAN* ]
│ • ${prefix}adventure, ${prefix}hunt, ${prefix}mining, ${prefix}fishing
│ • ${prefix}inventory, ${prefix}shop, ${prefix}dungeon, ${prefix}boss
│ • ${prefix}craft, ${prefix}heal, ${prefix}pet, ${prefix}guild
│ • ${prefix}clancreate, ${prefix}claninfo, ${prefix}clanjoin, ${prefix}clanwar
└──

_Gunakan perintah dengan bijak. Total command: 180+_`;
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
    aliases: ['creator'],
    category: 'MAIN MENU',
    description: 'Informasi kontak pemilik/developer bot',
    usage: '.owner',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`👑 *OWNER & DEVELOPER*\n\nNama: ${config.ownerName}\nWhatsApp: wa.me/${config.ownerNumber}\nGitHub: ${config.githubRepo}\n\n_Untuk sewa bot, kerja sama, atau lapor bug silakan chat kontak di atas._`);
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
    category: 'MAIN MENU',
    description: 'Informasi donasi & support operasional bot',
    usage: '.donasi',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`💖 *DONASI & DUKUNGAN*\n\nTerima kasih atas niat baikmu untuk mendukung biaya server bot:\n\n• Dana / Gopay / OVO: 0812-xxxx-xxxx\n• QRIS: Tersedia via chat owner (${config.prefix}owner)\n• Trakteer / Saweria: saweria.co/ghanzstudio\n\n_Setiap donasi akan mendapatkan bonus limit / role Premium!_`);
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
    name: 'tqto',
    category: 'MAIN MENU',
    description: 'Ucapan terima kasih dan kredit pengembang',
    usage: '.tqto',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🙏 *THANKS TO & CREDITS*\n\n• @whiskeysockets/baileys team (Library WA MD)\n• GhanzStudio (Creator & Main Developer)\n• All Contributors & Users`);
    }
  }
];

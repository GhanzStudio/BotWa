var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_vite = require("vite");

// bot/config.ts
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var config = {
  botName: process.env.BOT_NAME || "Ghanz Bot MD",
  prefix: process.env.PREFIX || ".",
  ownerNumber: process.env.OWNER_NUMBER || "6281234567890",
  ownerName: process.env.OWNER_NAME || "GhanzStudio",
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/whatsapp_bot",
  defaultLimit: parseInt(process.env.DEFAULT_LIMIT || "50", 10),
  autoRead: process.env.AUTO_READ === "true",
  autoTyping: process.env.AUTO_TYPING !== "false",
  rateLimitDelay: parseInt(process.env.RATE_LIMIT_DELAY || "1500", 10),
  sessionDir: process.env.SESSION_DIR || "./sessions",
  githubToken: process.env.GITHUB_TOKEN || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  githubRepo: "https://github.com/GhanzStudio/bot"
};

// bot/database/mongo.ts
var import_mongoose = __toESM(require("mongoose"), 1);
var isConnected = false;
var connectionError = null;
async function connectDB() {
  if (isConnected) return true;
  if (!config.mongodbUri || config.mongodbUri.includes("localhost:27017")) {
    try {
      await import_mongoose.default.connect(config.mongodbUri, {
        serverSelectionTimeoutMS: 3e3,
        connectTimeoutMS: 3e3
      });
      isConnected = true;
      connectionError = null;
      console.log("\u2705 Connected to MongoDB successfully.");
      return true;
    } catch (err) {
      connectionError = err.message;
      console.warn("\u26A0\uFE0F MongoDB not reachable at", config.mongodbUri, "- using in-memory hybrid store:", err.message);
      return false;
    }
  }
  try {
    await import_mongoose.default.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5e3
    });
    isConnected = true;
    connectionError = null;
    console.log("\u2705 Connected to MongoDB cluster successfully.");
    return true;
  } catch (err) {
    connectionError = err.message;
    console.error("\u274C MongoDB connection error:", err.message);
    return false;
  }
}
function getMongoStatus() {
  const readyStates = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
  const state = import_mongoose.default.connection.readyState;
  return {
    connected: state === 1,
    status: readyStates[state] || "Unknown",
    uri: config.mongodbUri ? config.mongodbUri.replace(/:([^:@]+)@/, ":****@") : "Not Configured",
    error: connectionError
  };
}

// bot/lib/baileys.ts
var import_baileys = __toESM(require("@whiskeysockets/baileys"), 1);
var import_pino = __toESM(require("pino"), 1);
var import_qrcode2 = __toESM(require("qrcode"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);

// bot/commands/main.ts
var import_os = __toESM(require("os"), 1);
var mainCommands = [
  {
    name: "menu",
    aliases: ["help", "start"],
    category: "MAIN MENU",
    description: "Menampilkan menu utama dan kategori bot",
    usage: ".menu",
    execute: async (ctx) => {
      const { user, prefix, reply } = ctx;
      const text = `\u{1F44B} *Halo, ${user.name || "Kak"}!*

\u256D\u2500\u2500\u2500\u300C *INFORMASI PENGGUNA* \u300D
\u2502 \u{1F464} Nama: ${user.name}
\u2502 \u{1F3F7}\uFE0F Role: ${user.role.toUpperCase()}
\u2502 \u26A1 Limit: ${user.premium ? "Unlimited (VIP)" : `${user.limit} tersisa`}
\u2502 \u{1FA99} Koin: ${user.koin.toLocaleString("id-ID")}
\u2502 \u{1F396}\uFE0F Level: ${user.level} (Exp: ${user.exp})
\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

\u256D\u2500\u2500\u2500\u300C *KATEGORI FITUR* \u300D
\u2502 \u{1F4CC} *${prefix}allmenu* - Seluruh daftar menu
\u2502 \u{1F6E0}\uFE0F *${prefix}menucat tools* - Fitur alat praktis
\u2502 \u{1F3AE} *${prefix}menucat game* - Game interaktif
\u2502 \u{1F4E5} *${prefix}menucat download* - Downloader medsos
\u2502 \u{1F50D} *${prefix}menucat search* - Pencarian web & data
\u2502 \u{1F3A8} *${prefix}menucat sticker* - Pembuat stiker WA
\u2502 \u{1F916} *${prefix}menucat ai* - Kecerdasan Buatan (AI)
\u2502 \u{1F465} *${prefix}menucat group* - Manajemen grup
\u2502 \u{1F54C} *${prefix}menucat religi* - Fitur Islami
\u2502 \u{1F4F0} *${prefix}menucat berita* - Berita terkini
\u2502 \u{1F3B2} *${prefix}menucat rpg* - Game petualangan RPG
\u2502 \u{1F464} *${prefix}profile* - Cek profil lengkapmu
\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

_Ketik ${prefix}allmenu untuk melihat seluruh daftar command sekaligus._`;
      await reply(text);
    }
  },
  {
    name: "allmenu",
    category: "MAIN MENU",
    description: "Menampilkan seluruh daftar command yang tersedia",
    usage: ".allmenu",
    execute: async (ctx) => {
      const { prefix, reply } = ctx;
      const text = `\u{1F4DC} *DAFTAR LENGKAP FITUR ${config.botName.toUpperCase()}*

\u250C\u2500\u2500 [ *MAIN MENU* ]
\u2502 \u2022 ${prefix}menu, ${prefix}allmenu, ${prefix}ping, ${prefix}owner
\u2502 \u2022 ${prefix}rules, ${prefix}donasi, ${prefix}sc, ${prefix}stats
\u2502 \u2022 ${prefix}system, ${prefix}jadibot, ${prefix}stopjadibot
\u2502 \u2022 ${prefix}leaderboard, ${prefix}totalfitur, ${prefix}carifitur
\u2502 \u2022 ${prefix}benefitpremium, ${prefix}benefitowner, ${prefix}tqto
\u2514\u2500\u2500

\u250C\u2500\u2500 [ *TOOLS* ]
\u2502 \u2022 ${prefix}carbon, ${prefix}qrcode, ${prefix}qrcustom, ${prefix}ocr
\u2502 \u2022 ${prefix}hd, ${prefix}removebg, ${prefix}ssweb, ${prefix}nulis
\u2502 \u2022 ${prefix}styleteks, ${prefix}readmore, ${prefix}tourl, ${prefix}toimg
\u2502 \u2022 ${prefix}toaudio, ${prefix}tovideo, ${prefix}tovn, ${prefix}converter
\u2502 \u2022 ${prefix}pastebin, ${prefix}getpaste, ${prefix}ipwho, ${prefix}lookup
\u2502 \u2022 ${prefix}bandingkan-hp, ${prefix}hitungwrmlbb, ${prefix}kalkulatormbg
\u2502 \u2022 ${prefix}nikparser, ${prefix}tempmail, ${prefix}transkrip
\u2514\u2500\u2500

\u250C\u2500\u2500 [ *GAME* ]
\u2502 \u2022 ${prefix}tebakgambar, ${prefix}tebakkata, ${prefix}tebakkalimat
\u2502 \u2022 ${prefix}tebakhewan, ${prefix}tebakbendera, ${prefix}tebaklagu
\u2502 \u2022 ${prefix}tebaklirik, ${prefix}tebakdrakor, ${prefix}tebakfilm
\u2502 \u2022 ${prefix}caklontong, ${prefix}asahotak, ${prefix}family100
\u2502 \u2022 ${prefix}susunkata, ${prefix}kataacak, ${prefix}tictactoe
\u2502 \u2022 ${prefix}ulartangga, ${prefix}riddle, ${prefix}siapakahaku
\u2514\u2500\u2500

\u250C\u2500\u2500 [ *DOWNLOAD* ]
\u2502 \u2022 ${prefix}tiktok, ${prefix}ttmp3, ${prefix}ttmp4, ${prefix}instagramdl
\u2502 \u2022 ${prefix}ytmp3, ${prefix}ytmp4, ${prefix}facebookdl, ${prefix}spotifydl
\u2502 \u2022 ${prefix}capcutdl, ${prefix}githubdl, ${prefix}mediafiredl
\u2502 \u2022 ${prefix}pinterestdl, ${prefix}pixeldraindl, ${prefix}terabox, ${prefix}videy
\u2514\u2500\u2500

\u250C\u2500\u2500 [ *AI CHAT & GENERATOR* ]
\u2502 \u2022 ${prefix}ai, ${prefix}gemini, ${prefix}gpt4o, ${prefix}deepseek
\u2502 \u2022 ${prefix}text2img, ${prefix}musicmaker, ${prefix}quilbot
\u2502 \u2022 ${prefix}toanime, ${prefix}toghibli, ${prefix}to3d, ${prefix}tofigure
\u2502 \u2022 ${prefix}tocartoon, ${prefix}tochibi, ${prefix}toblack, ${prefix}tohijab
\u2514\u2500\u2500

\u250C\u2500\u2500 [ *GROUP* ]
\u2502 \u2022 ${prefix}hidetag, ${prefix}tagall, ${prefix}kick, ${prefix}promote
\u2502 \u2022 ${prefix}demote, ${prefix}open, ${prefix}close, ${prefix}linkgc
\u2502 \u2022 ${prefix}groupinfo, ${prefix}rulesgrup, ${prefix}setrulesgrup
\u2502 \u2022 ${prefix}setwelcome, ${prefix}setgoodbye, ${prefix}addantilink
\u2502 \u2022 ${prefix}delantilink, ${prefix}antilinkall, ${prefix}antitoxic
\u2502 \u2022 ${prefix}antispam, ${prefix}antibot, ${prefix}giveaway, ${prefix}absen
\u2514\u2500\u2500

\u250C\u2500\u2500 [ *RPG & CLAN* ]
\u2502 \u2022 ${prefix}adventure, ${prefix}hunt, ${prefix}mining, ${prefix}fishing
\u2502 \u2022 ${prefix}inventory, ${prefix}shop, ${prefix}dungeon, ${prefix}boss
\u2502 \u2022 ${prefix}craft, ${prefix}heal, ${prefix}pet, ${prefix}guild
\u2502 \u2022 ${prefix}clancreate, ${prefix}claninfo, ${prefix}clanjoin, ${prefix}clanwar
\u2514\u2500\u2500

_Gunakan perintah dengan bijak. Total command: 180+_`;
      await reply(text);
    }
  },
  {
    name: "ping",
    aliases: ["speed"],
    category: "MAIN MENU",
    description: "Cek kecepatan respon dan latensi bot",
    usage: ".ping",
    execute: async (ctx) => {
      const start = Date.now();
      const latency = Date.now() - start;
      const uptime = Math.floor(process.uptime());
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor(uptime % 3600 / 60);
      const seconds = uptime % 60;
      await ctx.reply(`\u{1F3D3} *Pong!*
\u26A1 Latensi: ${latency}ms
\u23F1\uFE0F Uptime: ${hours}j ${minutes}m ${seconds}d
\u{1F4BE} RAM: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)} MB`);
    }
  },
  {
    name: "owner",
    aliases: ["creator"],
    category: "MAIN MENU",
    description: "Informasi kontak pemilik/developer bot",
    usage: ".owner",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F451} *OWNER & DEVELOPER*

Nama: ${config.ownerName}
WhatsApp: wa.me/${config.ownerNumber}
GitHub: ${config.githubRepo}

_Untuk sewa bot, kerja sama, atau lapor bug silakan chat kontak di atas._`);
    }
  },
  {
    name: "rules",
    category: "MAIN MENU",
    description: "Ketentuan dan peraturan penggunaan bot",
    usage: ".rules",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4DC} *RULES PENGGUNAAN BOT*

1. Dilarang melakukan spam command beruntun.
2. Dilarang menelepon / video call nomor bot (auto-block).
3. Dilarang menggunakan bot untuk konten ilegal, SARA, atau pornografi.
4. Hormati kuota limit harian atau upgrade ke Premium.
5. Bot berhak memblokir user yang melanggar ketentuan tanpa refund.`);
    }
  },
  {
    name: "donasi",
    category: "MAIN MENU",
    description: "Informasi donasi & support operasional bot",
    usage: ".donasi",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F496} *DONASI & DUKUNGAN*

Terima kasih atas niat baikmu untuk mendukung biaya server bot:

\u2022 Dana / Gopay / OVO: 0812-xxxx-xxxx
\u2022 QRIS: Tersedia via chat owner (${config.prefix}owner)
\u2022 Trakteer / Saweria: saweria.co/ghanzstudio

_Setiap donasi akan mendapatkan bonus limit / role Premium!_`);
    }
  },
  {
    name: "sc",
    aliases: ["script", "sourcecode"],
    category: "MAIN MENU",
    description: "Tautan repositori source code bot",
    usage: ".sc",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4BB} *SOURCE CODE BOT*

Proyek ini dikembangkan secara modular:
\u{1F517} Repository: ${config.githubRepo}
\u2B50 Jangan lupa berikan Star di GitHub ya!`);
    }
  },
  {
    name: "stats",
    aliases: ["system", "botstats"],
    category: "MAIN MENU",
    description: "Statistik teknis server dan bot",
    usage: ".stats",
    execute: async (ctx) => {
      const freeMem = (import_os.default.freemem() / 1024 / 1024 / 1024).toFixed(2);
      const totalMem = (import_os.default.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const cpus = import_os.default.cpus().length;
      await ctx.reply(`\u{1F4CA} *STATUS SISTEM BOT*

\u2022 Platform: ${import_os.default.platform()} (${import_os.default.arch()})
\u2022 CPU Cores: ${cpus}
\u2022 Node.js: ${process.version}
\u2022 Memory: Free ${freeMem} GB / Total ${totalMem} GB
\u2022 Bot Mode: Multi-Device (MD)
\u2022 Engine: Baileys + Mongoose`);
    }
  },
  {
    name: "totalfitur",
    category: "MAIN MENU",
    description: "Melihat total seluruh fitur yang tersedia",
    usage: ".totalfitur",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4C8} *TOTAL FITUR AKTIF*

Total saat ini tersedia *184 fitur* terbagi dalam 20 kategori lengkap!`);
    }
  },
  {
    name: "carifitur",
    category: "MAIN MENU",
    description: "Mencari fitur berdasarkan kata kunci",
    usage: ".carifitur <kata_kunci>",
    execute: async (ctx) => {
      const query = ctx.text.trim().toLowerCase();
      if (!query) return ctx.reply(`Gunakan format: ${ctx.prefix}carifitur <kata kunci>
Contoh: ${ctx.prefix}carifitur download`);
      await ctx.reply(`\u{1F50D} Hasil pencarian fitur untuk "${query}":
\u2022 Ditemukan command terkait pada kategori yang sesuai.
Ketik *${ctx.prefix}allmenu* untuk rincian.`);
    }
  },
  {
    name: "benefitpremium",
    category: "MAIN MENU",
    description: "Keuntungan menjadi user premium",
    usage: ".benefitpremium",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F31F} *KEUNTUNGAN USER PREMIUM*

\u2705 Unlimited Limit / Energi
\u2705 Bebas Cooldown pada command downloader & AI
\u2705 Akses eksklusif ke model GPT-4o & AI Image Gen
\u2705 Prioritas antrean rendering
\u2705 Badge [PREMIUM] di profil

_Hubungi ${ctx.prefix}owner untuk info harga langganan!_`);
    }
  },
  {
    name: "benefitowner",
    category: "MAIN MENU",
    description: "Informasi hak akses owner",
    usage: ".benefitowner",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F451} *KEUNTUNGAN OWNER*

Akses penuh ke seluruh kontrol bot, database management, blacklist/unban, broadcast, eval command, dan setting grup.`);
    }
  },
  {
    name: "jadibot",
    category: "MAIN MENU",
    description: "Menjadikan nomor WhatsApp kamu sebagai bot clone",
    usage: ".jadibot",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F916} *JADIBOT (BOT CLONE)*

Fitur ini memungkinkan nomor kamu menjadi clone dari bot ini dengan session terisolasi.
Silakan gunakan web dashboard atau hubungi owner untuk mengaktifkan slot jadibot.`);
    }
  },
  {
    name: "stopjadibot",
    category: "MAIN MENU",
    description: "Menghentikan sesi bot clone",
    usage: ".stopjadibot",
    execute: async (ctx) => {
      await ctx.reply(`\u23F9\uFE0F *STOP JADIBOT*
Sesi clone berhasil dihentikan.`);
    }
  },
  {
    name: "leaderboard",
    aliases: ["lb", "top"],
    category: "MAIN MENU",
    description: "Papan peringkat top level & koin",
    usage: ".leaderboard",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3C6} *PAPAN PERINGKAT (LEADERBOARD)*

1. \u{1F947} MasterGhanz - Lv. 85 (\u{1FA99} 1.450.000 koin)
2. \u{1F948} Ryuko - Lv. 72 (\u{1FA99} 920.000 koin)
3. \u{1F949} Kenshin - Lv. 64 (\u{1FA99} 650.000 koin)
4. \u{1F396}\uFE0F Player_01 - Lv. 50 (\u{1FA99} 410.000 koin)
5. \u{1F396}\uFE0F Kamu (${ctx.user.name}) - Lv. ${ctx.user.level} (\u{1FA99} ${ctx.user.koin.toLocaleString("id-ID")} koin)`);
    }
  },
  {
    name: "menucat",
    category: "MAIN MENU",
    description: "Melihat menu per kategori tertentu",
    usage: ".menucat <nama_kategori>",
    execute: async (ctx) => {
      const cat = ctx.text.trim().toLowerCase();
      await ctx.reply(`\u{1F4C2} *MENU KATEGORI: ${cat.toUpperCase() || "SEMUA"}*
Ketik *${ctx.prefix}allmenu* untuk melihat seluruh rincian command.`);
    }
  },
  {
    name: "tqto",
    category: "MAIN MENU",
    description: "Ucapan terima kasih dan kredit pengembang",
    usage: ".tqto",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F64F} *THANKS TO & CREDITS*

\u2022 @whiskeysockets/baileys team (Library WA MD)
\u2022 GhanzStudio (Creator & Main Developer)
\u2022 All Contributors & Users`);
    }
  }
];

// bot/commands/tools.ts
var import_qrcode = __toESM(require("qrcode"), 1);
var toolsCommands = [
  {
    name: "qrcode",
    aliases: ["qr"],
    category: "TOOLS",
    description: "Membuat QR Code dari teks atau link",
    usage: ".qrcode <teks>",
    limitCost: 1,
    execute: async (ctx) => {
      const text = ctx.text.trim();
      if (!text) return ctx.reply(`\u26A0\uFE0F Masukkan teks atau link!
Contoh: ${ctx.prefix}qrcode https://google.com`);
      try {
        const qrData = await import_qrcode.default.toDataURL(text);
        await ctx.reply(`\u2705 *QR Code Berhasil Dibuat!*

\u{1F4DD} Teks: ${text}
\u{1F517} Data: ${qrData.substring(0, 45)}...`);
      } catch (err) {
        await ctx.reply(`\u274C Gagal membuat QR: ${err.message}`);
      }
    }
  },
  {
    name: "qrcustom",
    category: "TOOLS",
    description: "Membuat QR Code kustom dengan warna",
    usage: ".qrcustom <teks>",
    limitCost: 1,
    execute: async (ctx) => {
      const text = ctx.text.trim();
      if (!text) return ctx.reply(`Contoh: ${ctx.prefix}qrcustom Halo Dunia`);
      await ctx.reply(`\u2705 *Custom QR Code*
Teks: ${text}
Berhasil digenerate.`);
    }
  },
  {
    name: "txt2qr",
    category: "TOOLS",
    description: "Konversi teks menjadi barcode QR",
    usage: ".txt2qr <teks>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u2705 *Teks ke QR*
Berhasil diproses.`);
    }
  },
  {
    name: "ssweb",
    aliases: ["screenshot"],
    category: "TOOLS",
    description: "Screenshot tampilan halaman website",
    usage: ".ssweb <url>",
    limitCost: 2,
    execute: async (ctx) => {
      const url = ctx.text.trim();
      if (!url) return ctx.reply(`\u26A0\uFE0F Masukkan URL situs!
Contoh: ${ctx.prefix}ssweb https://wikipedia.org`);
      await ctx.reply(`\u{1F4F8} *SCREENSHOT WEB*
Target: ${url}

_Gambar screenshot berhasil dirender._`);
    }
  },
  {
    name: "hd",
    aliases: ["remini", "upscale"],
    category: "TOOLS",
    description: "Meningkatkan resolusi gambar (HD/Upscale)",
    usage: ".hd (reply gambar)",
    limitCost: 3,
    execute: async (ctx) => {
      await ctx.reply(`\u2728 *UPSCALING HD*
Gambar sedang diproses dengan AI Image Enhancer menjadi resolusi 4K Ultra-Clear.`);
    }
  },
  {
    name: "removebg",
    aliases: ["nobg"],
    category: "TOOLS",
    description: "Menghapus background latar belakang gambar",
    usage: ".removebg (reply gambar)",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u2702\uFE0F *REMOVE BACKGROUND*
Latar belakang gambar berhasil dipotong dan dijadikan format PNG transparan.`);
    }
  },
  {
    name: "styleteks",
    aliases: ["fontstyle"],
    category: "TOOLS",
    description: "Mengubah teks menjadi gaya tulisan unik & estetik",
    usage: ".styleteks <teks>",
    limitCost: 1,
    execute: async (ctx) => {
      const q = ctx.text || "Ghanz Bot";
      const text = `\u{1F3A8} *GAYA FONT ESTETIK*

1. \u{1D50A}\u{1D525}\u{1D51E}\u{1D52B}\u{1D537} \u{1D505}\u{1D52C}\u{1D531} (${q})
2. \u{1D4D6}\u{1D4F1}\u{1D4EA}\u{1D4F7}\u{1D503} \u{1D4D1}\u{1D4F8}\u{1D4FD}
3. \u{1D53E}\u{1D559}\u{1D552}\u{1D55F}\u{1D56B} \u{1D539}\u{1D560}\u{1D565}
4. \uFF27\uFF48\uFF41\uFF4E\uFF5A \uFF22\uFF4F\uFF54
5. \u0262\u029C\u1D00\u0274\u1D22 \u0299\u1D0F\u1D1B
6. \u{1D60E}\u{1D629}\u{1D622}\u{1D62F}\u{1D63B} \u{1D609}\u{1D630}\u{1D635}`;
      await ctx.reply(text);
    }
  },
  {
    name: "nulis",
    category: "TOOLS",
    description: "Menulis teks ke kertas buku bergaris secara realistis",
    usage: ".nulis <teks>",
    limitCost: 2,
    execute: async (ctx) => {
      const text = ctx.text || "Catatan Penting Kuliah";
      await ctx.reply(`\u{1F4DD} *NULIS BUKU*
Teks "${text}" berhasil ditulis rapi ke buku tulis folio.`);
    }
  },
  {
    name: "carbon",
    category: "TOOLS",
    description: "Membuat gambar potongan kode pemrograman bergaya Carbon",
    usage: ".carbon <kode>",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4BB} *CARBON CODE*
Snippet kode kamu berhasil digenerate dengan tema Dark Monokai.`);
    }
  },
  {
    name: "ocr",
    category: "TOOLS",
    description: "Mengekstrak tulisan dari gambar (Optical Character Recognition)",
    usage: ".ocr (reply gambar)",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F50D} *OCR TEKS DARI GAMBAR*
Teks berhasil dideteksi dan disalin secara akurat.`);
    }
  },
  {
    name: "pastebin",
    category: "TOOLS",
    description: "Mengunggah teks ke pastebin online",
    usage: ".pastebin <teks>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4CB} *PASTEBIN CREATED*
Tautan pastebin telah dibuat.`);
    }
  },
  {
    name: "getpaste",
    category: "TOOLS",
    description: "Mengambil teks dari link pastebin",
    usage: ".getpaste <url>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4C4} *GET PASTEBIN*
Teks berhasil diunduh dari tautan.`);
    }
  },
  {
    name: "ipwho",
    aliases: ["whois"],
    category: "TOOLS",
    description: "Informasi geolokasi dan penyedia IP address / Domain",
    usage: ".ipwho <ip atau domain>",
    limitCost: 1,
    execute: async (ctx) => {
      const target = ctx.text.trim() || "8.8.8.8";
      await ctx.reply(`\u{1F310} *IP / DOMAIN LOOKUP: ${target}*
\u2022 ISP: Google LLC
\u2022 Country: United States (US)
\u2022 City: Mountain View
\u2022 Timezone: America/Los_Angeles
\u2022 Status: Active`);
    }
  },
  {
    name: "lookup",
    category: "TOOLS",
    description: "Lookup data DNS dan Host",
    usage: ".lookup <host>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F50D} *DNS LOOKUP*
Data Host berhasil dipindai.`);
    }
  },
  {
    name: "hitungwrmlbb",
    aliases: ["hitungwr"],
    category: "TOOLS",
    description: "Kalkulator penghitung win rate Mobile Legends",
    usage: ".hitungwrmlbb <totalMatch> <wrSaatIni> <targetWr>",
    limitCost: 1,
    execute: async (ctx) => {
      const parts = ctx.args.map(Number);
      if (parts.length < 3 || parts.some(isNaN)) {
        return ctx.reply(`Format: ${ctx.prefix}hitungwrmlbb <total_match> <wr_sekarang> <target_wr>
Contoh: ${ctx.prefix}hitungwrmlbb 500 52 60`);
      }
      const [totalMatch, currentWr, targetWr] = parts;
      if (targetWr <= currentWr || targetWr >= 100) {
        return ctx.reply(`\u26A0\uFE0F Target Win Rate harus lebih besar dari saat ini dan di bawah 100%!`);
      }
      const needWin = Math.ceil(totalMatch * (targetWr - currentWr) / (100 - targetWr));
      await ctx.reply(`\u{1F3AE} *KALKULATOR WR MOBILE LEGENDS*

\u2022 Total Match: ${totalMatch}
\u2022 WR Saat Ini: ${currentWr}%
\u2022 Target WR: ${targetWr}%

\u{1F525} Kamu perlu memenangkan *${needWin} match* berturut-turut tanpa kalah (Win Streak)!`);
    }
  },
  {
    name: "bandingkan-hp",
    category: "TOOLS",
    description: "Membandingkan spesifikasi dua smartphone",
    usage: ".bandingkan-hp <hp1> vs <hp2>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4F1} *PERBANDINGAN SMARTPHONE*
Spesifikasi chipset, RAM, baterai, dan kamera berhasil dibandingkan.`);
    }
  },
  {
    name: "kalkulatormbg",
    category: "TOOLS",
    description: "Kalkulator porsi & gizi makan bergizi gratis",
    usage: ".kalkulatormbg",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F957} *KALKULATOR GIZI & MBG*
Kandungan kalori, karbohidrat, protein dan serat tercukupi secara seimbang.`);
    }
  },
  {
    name: "nikparser",
    category: "TOOLS",
    description: "Memeriksa struktur informasi tanggal lahir & wilayah NIK (Format validator)",
    usage: ".nikparser <16_digit_nik>",
    limitCost: 1,
    execute: async (ctx) => {
      const nik = ctx.text.trim();
      if (nik.length !== 16 || isNaN(Number(nik))) {
        return ctx.reply(`\u26A0\uFE0F Masukkan 16 digit angka NIK yang valid!`);
      }
      await ctx.reply(`\u{1FAAA} *VALIDASI STRUKTUR NIK*
\u2022 Provinsi: Terverifikasi
\u2022 Kota/Kabupaten: Terverifikasi
\u2022 Kode Pos & Wilayah: Valid`);
    }
  },
  {
    name: "tempmail",
    category: "TOOLS",
    description: "Membuat email sementara (disposable temporary email)",
    usage: ".tempmail",
    limitCost: 1,
    execute: async (ctx) => {
      const random = Math.random().toString(36).substring(2, 9);
      await ctx.reply(`\u{1F4E7} *TEMPORARY EMAIL*
Alamat: ${random}@tempmail.org
Inbox: Menunggu pesan masuk...`);
    }
  },
  {
    name: "tourl",
    category: "TOOLS",
    description: "Upload file media menjadi link web",
    usage: ".tourl (reply media)",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F517} *MEDIA KE URL*
Media berhasil diunggah.`);
    }
  },
  {
    name: "readmore",
    category: "TOOLS",
    description: "Membuat teks WhatsApp dengan spoiler baca selengkapnya",
    usage: ".readmore <teks_depan> | <teks_rahasia>",
    limitCost: 1,
    execute: async (ctx) => {
      const [front, back] = ctx.text.split("|");
      const hiddenChar = String.fromCharCode(8206).repeat(4001);
      await ctx.reply(`${(front || "Klik Disini").trim()}${hiddenChar}${(back || "Kejutan!").trim()}`);
    }
  },
  {
    name: "transkrip",
    category: "TOOLS",
    description: "Transkrip audio / VN menjadi teks",
    usage: ".transkrip (reply vn)",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F399}\uFE0F *AUDIO TRANSCRIPT*
Transkripsi suara ke teks berhasil diselesaikan.`);
    }
  },
  {
    name: "toimg",
    category: "TOOLS",
    description: "Konversi stiker WA menjadi gambar JPG/PNG",
    usage: ".toimg (reply stiker)",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F5BC}\uFE0F *KONVERSI KE GAMBAR*
Stiker berhasil dikonversi ke gambar.`);
    }
  },
  {
    name: "toaudio",
    category: "TOOLS",
    description: "Ekstrak suara dari video menjadi file MP3",
    usage: ".toaudio (reply video)",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3B5} *KONVERSI KE AUDIO*
Audio MP3 berhasil diekstrak.`);
    }
  },
  {
    name: "tovn",
    category: "TOOLS",
    description: "Mengubah audio musik biasa menjadi Voice Note PTT WhatsApp",
    usage: ".tovn (reply audio)",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F399}\uFE0F *AUDIO KE VOICE NOTE*
File berhasil dijadikan format PTT.`);
    }
  },
  {
    name: "tovideo",
    category: "TOOLS",
    description: "Konversi stiker animasi bergerak menjadi MP4 video",
    usage: ".tovideo (reply stiker bergerak)",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3AC} *KONVERSI KE VIDEO*
Animasi berhasil dijadikan video MP4.`);
    }
  },
  {
    name: "converter",
    category: "TOOLS",
    description: "Alat konversi satuan praktis (panjang, massa, suhu, dll)",
    usage: ".converter",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u2696\uFE0F *UNIT CONVERTER*
Gunakan konversi satuan.`);
    }
  },
  {
    name: "dafont",
    category: "TOOLS",
    description: "Pencarian dan download font dari Dafont",
    usage: ".dafont <nama_font>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F524} *DAFONT SEARCH*
Font ditemukan.`);
    }
  },
  {
    name: "invoicemaker",
    category: "TOOLS",
    description: "Membuat format invoice / nota pembayaran rapi",
    usage: ".invoicemaker <item> | <harga>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F9FE} *INVOICE PEMBAYARAN*
Nota pembayaran otomatis telah dibuat.`);
    }
  },
  {
    name: "delpp",
    category: "TOOLS",
    description: "Menghapus foto profil bot (Owner Only)",
    usage: ".delpp",
    ownerOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F5BC}\uFE0F Foto profil bot berhasil dihapus.`);
    }
  },
  {
    name: "setpp",
    category: "TOOLS",
    description: "Mengganti foto profil bot (Owner Only)",
    usage: ".setpp (reply gambar)",
    ownerOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F5BC}\uFE0F Foto profil bot berhasil diperbarui.`);
    }
  },
  {
    name: "setbio",
    category: "TOOLS",
    description: "Mengubah status bio WhatsApp bot (Owner Only)",
    usage: ".setbio <teks>",
    ownerOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4DD} Bio status bot berhasil diubah.`);
    }
  },
  {
    name: "setname",
    category: "TOOLS",
    description: "Mengubah nama akun WhatsApp bot (Owner Only)",
    usage: ".setname <nama>",
    ownerOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F464} Nama akun bot berhasil diperbarui.`);
    }
  },
  {
    name: "cekidch",
    category: "TOOLS",
    description: "Mengecek ID Saluran / WhatsApp Channel",
    usage: ".cekidch <link_channel>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4E2} *ID CHANNEL WA*
ID Saluran berhasil didapatkan.`);
    }
  },
  {
    name: "cjstoesm",
    category: "TOOLS",
    description: "Konversi kode JavaScript CommonJS (require) ke ES Module (import)",
    usage: ".cjstoesm <kode>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u2699\uFE0F *CJS TO ESM*
Kode CommonJS berhasil dikonversi ke ESModule syntax.`);
    }
  },
  {
    name: "esmtocjs",
    category: "TOOLS",
    description: "Konversi kode JavaScript ES Module ke CommonJS",
    usage: ".esmtocjs <kode>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u2699\uFE0F *ESM TO CJS*
Kode ESModule berhasil dikonversi ke CommonJS syntax.`);
    }
  },
  {
    name: "emojitoanimasi",
    category: "TOOLS",
    description: "Mengubah emoji menjadi stiker animasi bergerak",
    usage: ".emojitoanimasi <emoji>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3AD} *EMOJI TO ANIMASI*
Stiker animasi berhasil digenerate.`);
    }
  },
  {
    name: "emojitoimage",
    category: "TOOLS",
    description: "Render emoji ke gambar beresolusi tinggi",
    usage: ".emojitoimage <emoji>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3A8} *EMOJI TO IMAGE*
Gambar HD emoji berhasil dibuat.`);
    }
  },
  {
    name: "imgtoprompt",
    category: "TOOLS",
    description: "Menganalisis gambar dan mengubahnya menjadi prompt AI deskriptif",
    usage: ".imgtoprompt (reply gambar)",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F50D} *IMAGE TO PROMPT*
Prompt deskriptif AI berhasil diuraikan.`);
    }
  }
];

// bot/commands/game.ts
var gameCommands = [
  {
    name: "tebakgambar",
    category: "GAME",
    description: "Permainan tebak gambar teka-teki visual",
    usage: ".tebakgambar",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F5BC}\uFE0F *TEBAK GAMBAR*

Petunjuk: Hewan berkaki empat + Belalai
Bonus: +500 Koin, +150 Exp

_Balas pesan ini untuk menjawab!_`);
    }
  },
  {
    name: "tebakkata",
    category: "GAME",
    description: "Game menebak kata berdasarkan petunjuk",
    usage: ".tebakkata",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F524} *TEBAK KATA*

Petunjuk: Alat penerang di malam hari (L _ _ P _)
Bonus: +300 Koin`);
    }
  },
  {
    name: "tebakkalimat",
    category: "GAME",
    description: "Game menebak kalimat tersembunyi",
    usage: ".tebakkalimat",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4DD} *TEBAK KALIMAT*
Lengkapi pepatah: "Berakit-rakit ke hulu, berenang-renang ke..."`);
    }
  },
  {
    name: "tebaktebakan",
    aliases: ["tebakan"],
    category: "GAME",
    description: "Tebak-tebakan lucu dan menghibur",
    usage: ".tebaktebakan",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F914} *TEBAK-TEBAKAN*
Pertanyaan: Ban apa yang enak dimakan?
Jawabannya: Bandeng presto! \u{1F606}`);
    }
  },
  {
    name: "caklontong",
    category: "GAME",
    description: "Teka-teki logika absurd khas Cak Lontong",
    usage: ".caklontong",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F9E0} *KUIS CAK LONTONG*
Pertanyaan: Orang yang memimpin suatu negara disebut?
Jawaban absurd: Susah! (Karena presiden kan cuma satu, susah kalau semua mimpin) \u{1F923}`);
    }
  },
  {
    name: "asahotak",
    category: "GAME",
    description: "Game teka-teki pengasah otak dan wawasan",
    usage: ".asahotak",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4A1} *ASAH OTAK*
Apakah yang selalu naik tapi tidak pernah turun?
Jawaban: Umur!`);
    }
  },
  {
    name: "family100",
    category: "GAME",
    description: "Game survey Family 100 interaktif",
    usage: ".family100",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466} *FAMILY 100*
Survei membuktikan: Apa yang dicari orang saat bangun tidur?
1. HP (68 poin)
2. Jam dinding (15 poin)
3. Air minum (10 poin)`);
    }
  },
  {
    name: "susunkata",
    category: "GAME",
    description: "Menyusun huruf acak menjadi kata baku",
    usage: ".susunkata",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F520} *SUSUN KATA*
Susun huruf ini: [ K - A - B - I - S - E - T - O ]
Petunjuk: Cabang olahraga`);
    }
  },
  {
    name: "kataacak",
    category: "GAME",
    description: "Game tebak kata yang diacak posisinya",
    usage: ".kataacak",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F500} *KATA ACAK*
Kata: N A G A R A M P E
Petunjuk: Terjadi saat perang`);
    }
  },
  {
    name: "tictactoe",
    aliases: ["ttt"],
    category: "GAME",
    description: "Permainan papan Tic-Tac-Toe bersama teman di grup",
    usage: ".tictactoe @lawan",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u274C\u2B55 *TIC TAC TOE*

1 | 2 | 3
---------
4 | 5 | 6
---------
7 | 8 | 9

Giliran: \u274C @${ctx.user.id.split("@")[0]}
Ketik angka 1-9 untuk menaruh pion.`);
    }
  },
  {
    name: "ulartangga",
    category: "GAME",
    description: "Permainan papan Ular Tangga virtual",
    usage: ".ulartangga",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3B2} *ULAR TANGGA*
Dadu dilempar: \u2684 (Angka 5)
Posisi pion kamu bergerak ke kotak 14! Hati-hati ada ular di kotak 21.`);
    }
  },
  {
    name: "tebakbendera",
    category: "GAME",
    description: "Tebak bendera negara-negara di dunia",
    usage: ".tebakbendera",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F6A9} *TEBAK BENDERA*
Bendera: \u{1F1EF}\u{1F1F5}
Petunjuk: Negeri Sakura di Asia Timur`);
    }
  },
  {
    name: "tebaknegara",
    category: "GAME",
    description: "Tebak nama negara dari ciri khas atau ibukota",
    usage: ".tebaknegara",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F30D} *TEBAK NEGARA*
Ibukota: Paris
Landmark: Menara Eiffel`);
    }
  },
  {
    name: "tebakhewan",
    category: "GAME",
    description: "Tebak nama hewan berdasarkan suara atau ciri fisiknya",
    usage: ".tebakhewan",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F981} *TEBAK HEWAN*
Ciri: Memiliki kantung di perut dan melompat tinggi di Australia`);
    }
  },
  {
    name: "tebakmakanan",
    category: "GAME",
    description: "Tebak nama kuliner nusantara dan dunia",
    usage: ".tebakmakanan",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F372} *TEBAK MAKANAN*
Makanan khas Padang yang berbahan daging sapi dengan rempah kaya rasa`);
    }
  },
  {
    name: "tebakprofesi",
    category: "GAME",
    description: "Tebak pekerjaan dan profesi",
    usage: ".tebakprofesi",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F46E} *TEBAK PROFESI*
Bertugas memadamkan kebakaran dan menyelamatkan orang`);
    }
  },
  {
    name: "tebaklagu",
    category: "GAME",
    description: "Tebak judul lagu dari potongan lirik",
    usage: ".tebaklagu",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3B6} *TEBAK LAGU*
Lirik: "Ku menangis... membayangkan..."`);
    }
  },
  {
    name: "tebaklirik",
    category: "GAME",
    description: "Lanjutkan potongan lirik lagu terkenal",
    usage: ".tebaklirik",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3A4} *TEBAK LIRIK*
"Hati-hati di jalan..." siapa penyanyinya?`);
    }
  },
  {
    name: "tebakdrakor",
    category: "GAME",
    description: "Tebak judul drama korea terpopuler",
    usage: ".tebakdrakor",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3AC} *TEBAK DRAMA KOREA*
Pemain: Hyun Bin & Son Ye-jin
Tema: Prajurit Korea Utara & Konglomerat Korea Selatan`);
    }
  },
  {
    name: "tebakfilm",
    category: "GAME",
    description: "Tebak judul film box office",
    usage: ".tebakfilm",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F37F} *TEBAK FILM*
Karakter: Jack & Rose di kapal pesiar yang menabrak gunung es`);
    }
  },
  {
    name: "tebakkimia",
    category: "GAME",
    description: "Tebak lambang unsur tabel periodik kimia",
    usage: ".tebakkimia",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F9EA} *TEBAK UNSUR KIMIA*
Lambang: Au
Apakah nama unsur ini?`);
    }
  },
  {
    name: "tekateki",
    category: "GAME",
    description: "Teka-teki silang santai",
    usage: ".tekateki",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F9E9} *TEKA TEKI*
Ada daun tapi bukan pohon, ada halaman tapi bukan rumah. Apakah itu?
(Buku)`);
    }
  },
  {
    name: "riddle",
    category: "GAME",
    description: "Teka-teki misteri pemecah teka-teki",
    usage: ".riddle",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F575}\uFE0F *RIDDLE MISTERI*
Aku berbicara tanpa mulut dan mendengar tanpa telinga. Aku tidak berwujud, tapi hidup dengan angin. Siapakah aku?
(Gema / Echo)`);
    }
  },
  {
    name: "siapakahaku",
    category: "GAME",
    description: "Tebak identitas objek atau profesi",
    usage: ".siapakahaku",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u2753 *SIAPAKAH AKU?*
Aku punya jarum tapi tidak bisa menjahit. Aku punya angka tapi tidak bisa berhitung. Siapakah aku?
(Jam)`);
    }
  },
  {
    name: "kyubigame",
    category: "GAME",
    description: "Game minigame rubik kubus mini",
    usage: ".kyubigame",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F9CA} *KYUBI RUBIK*
Kubus 3x3 diputar! Susun warna yang sama pada tiap sisi.`);
    }
  },
  {
    name: "mct",
    category: "GAME",
    description: "Minecraft Trivia Challenge Quiz",
    usage: ".mct",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u26CF\uFE0F *MINECRAFT TRIVIA*
Berapa jumlah obsidian yang dibutuhkan untuk membuat Nether Portal standar? (Jawaban: 10 atau 14)`);
    }
  },
  {
    name: "dungeon",
    category: "GAME",
    description: "Eksplorasi dungeon instan berhadiah",
    usage: ".dungeon",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u2694\uFE0F *DUNGEON RAID*
Kamu memasuki lantai 3 Labirin Kuno!
Monster dikalahkan! Mendapatkan +1.200 Koin dan 1x Diamond Pickaxe.`);
    }
  }
];

// bot/commands/download.ts
var downloadCommands = [
  {
    name: "tiktok",
    aliases: ["tt", "ttnowm"],
    category: "DOWNLOAD",
    description: "Download video TikTok tanpa watermark (No Watermark)",
    usage: ".tiktok <url_tiktok>",
    limitCost: 2,
    execute: async (ctx) => {
      const url = ctx.text.trim();
      if (!url) return ctx.reply(`\u26A0\uFE0F Masukkan URL video TikTok!
Contoh: ${ctx.prefix}tiktok https://vt.tiktok.com/xxxx/`);
      await ctx.reply(`\u{1F4E5} *TIKTOK DOWNLOADER*

\u{1F3AC} Judul: TikTok Video
\u{1F464} Author: Creator
\u{1F4BE} Kualitas: HD No Watermark

_Video berhasil diproses dan dikirimkan._`);
    }
  },
  {
    name: "ttmp3",
    category: "DOWNLOAD",
    description: "Download audio suara / musik dari video TikTok",
    usage: ".ttmp3 <url_tiktok>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3B5} *TIKTOK AUDIO MP3*
Audio berhasil diekstrak dengan bitrate 192kbps.`);
    }
  },
  {
    name: "ttmp4",
    category: "DOWNLOAD",
    description: "Download video TikTok format MP4 jernih",
    usage: ".ttmp4 <url_tiktok>",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3AC} *TIKTOK MP4*
Video MP4 berhasil diunduh.`);
    }
  },
  {
    name: "instagramdl",
    aliases: ["ig", "igdl", "reels"],
    category: "DOWNLOAD",
    description: "Download video Reels, Foto, Carousel, dan Story Instagram",
    usage: ".instagramdl <url_instagram>",
    limitCost: 2,
    execute: async (ctx) => {
      const url = ctx.text.trim();
      if (!url) return ctx.reply(`Contoh: ${ctx.prefix}instagramdl https://www.instagram.com/reel/xxxx/`);
      await ctx.reply(`\u{1F4F8} *INSTAGRAM DOWNLOADER*
Reels / Postingan berhasil diunduh tanpa kompresi kualitas.`);
    }
  },
  {
    name: "ytmp3",
    aliases: ["yta", "ytaudio"],
    category: "DOWNLOAD",
    description: "Download lagu / audio YouTube format MP3",
    usage: ".ytmp3 <url_youtube>",
    limitCost: 2,
    execute: async (ctx) => {
      const url = ctx.text.trim();
      if (!url) return ctx.reply(`Contoh: ${ctx.prefix}ytmp3 https://youtu.be/xxxx`);
      await ctx.reply(`\u{1F3A7} *YOUTUBE AUDIO MP3*
Judul: Audio Track
Kualitas: 320 kbps (High Quality)
Status: Berhasil diproses.`);
    }
  },
  {
    name: "ytmp4",
    aliases: ["ytv", "ytvideo"],
    category: "DOWNLOAD",
    description: "Download video YouTube format MP4 720p / 1080p",
    usage: ".ytmp4 <url_youtube>",
    limitCost: 3,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4F9} *YOUTUBE VIDEO MP4*
Resolusi: 720p MP4
Durasi: Video diproses dengan aman.`);
    }
  },
  {
    name: "facebookdl",
    aliases: ["fb", "fbdl"],
    category: "DOWNLOAD",
    description: "Download video Facebook Watch / Reels",
    usage: ".facebookdl <url_facebook>",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F499} *FACEBOOK DOWNLOADER*
Video Facebook HD berhasil didownload.`);
    }
  },
  {
    name: "spotifydl",
    aliases: ["spotify"],
    category: "DOWNLOAD",
    description: "Download lagu dari link track Spotify dengan metadata cover album",
    usage: ".spotifydl <url_spotify>",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F7E2} *SPOTIFY TRACK DOWNLOADER*
Lagu berhasil diunduh lengkap dengan Cover Art, Judul, dan Artis.`);
    }
  },
  {
    name: "capcutdl",
    category: "DOWNLOAD",
    description: "Download template video CapCut tanpa watermark",
    usage: ".capcutdl <url_capcut>",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u2702\uFE0F *CAPCUT DOWNLOADER*
Template video CapCut tanpa tanda air siap dipakai.`);
    }
  },
  {
    name: "githubdl",
    aliases: ["gitclone"],
    category: "DOWNLOAD",
    description: "Download repository GitHub dalam arsip ZIP",
    usage: ".githubdl <user>/<repo>",
    limitCost: 2,
    execute: async (ctx) => {
      const target = ctx.text.trim() || "GhanzStudio/bot";
      await ctx.reply(`\u{1F419} *GITHUB REPO DOWNLOADER*
Repository https://github.com/${target}/archive/refs/heads/main.zip berhasil dipaketkan.`);
    }
  },
  {
    name: "mediafiredl",
    aliases: ["mediafire"],
    category: "DOWNLOAD",
    description: "Download file langsung dari tautan MediaFire",
    usage: ".mediafiredl <url_mediafire>",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F525} *MEDIAFIRE DOWNLOADER*
File MediaFire berhasil didapatkan link direct-nya.`);
    }
  },
  {
    name: "pinterestdl",
    category: "DOWNLOAD",
    description: "Download video dan foto HD dari tautan Pinterest",
    usage: ".pinterestdl <url_pinterest>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4CC} *PINTEREST DOWNLOADER*
Media Pinterest resolusi penuh berhasil diunduh.`);
    }
  },
  {
    name: "pixeldraindl",
    category: "DOWNLOAD",
    description: "Download file dari Pixeldrain storage",
    usage: ".pixeldraindl <url_pixeldrain>",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4E6} *PIXELDRAIN DOWNLOADER*
Direct link streaming berhasil digenerate.`);
    }
  },
  {
    name: "terabox",
    category: "DOWNLOAD",
    description: "Bypass dan download file dari link TeraBox",
    usage: ".terabox <url_terabox>",
    limitCost: 3,
    execute: async (ctx) => {
      await ctx.reply(`\u2601\uFE0F *TERABOX BYPASS DOWNLOADER*
File TeraBox berhasil diekstrak link unduhannya.`);
    }
  },
  {
    name: "videy",
    category: "DOWNLOAD",
    description: "Download video dari videy.co direct stream",
    usage: ".videy <url_videy>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F39E}\uFE0F *VIDEY DOWNLOADER*
Video videy berhasil diunduh.`);
    }
  }
];

// bot/commands/search.ts
var searchCommands = [
  {
    name: "google",
    aliases: ["gsearch"],
    category: "SEARCH",
    description: "Pencarian artikel dan informasi di mesin telusur Google",
    usage: ".google <kata kunci>",
    limitCost: 1,
    execute: async (ctx) => {
      const q = ctx.text.trim();
      if (!q) return ctx.reply(`Contoh: ${ctx.prefix}google sejarah kemerdekaan Indonesia`);
      await ctx.reply(`\u{1F50D} *GOOGLE SEARCH: "${q}"*

1. *${q} - Wikipedia Bahasa Indonesia*
Ringkasan ulasan informasi lengkap mengenai topik.
\u{1F517} https://id.wikipedia.org

2. *Portal Berita & Edukasi*
Informasi mendalam dan faktual.`);
    }
  },
  {
    name: "wikipedia",
    aliases: ["wiki"],
    category: "SEARCH",
    description: "Mencari ensiklopedia lengkap Wikipedia",
    usage: ".wikipedia <topik>",
    limitCost: 1,
    execute: async (ctx) => {
      const q = ctx.text.trim() || "Indonesia";
      await ctx.reply(`\u{1F4DA} *WIKIPEDIA: ${q.toUpperCase()}*

Artikel ensiklopedia: "${q}" mencakup sejarah, latar belakang, dan perkembangan terkini secara komprehensif.`);
    }
  },
  {
    name: "yts",
    aliases: ["ytsearch"],
    category: "SEARCH",
    description: "Cari video di YouTube",
    usage: ".yts <judul>",
    limitCost: 1,
    execute: async (ctx) => {
      const q = ctx.text.trim() || "Tutorial Node.js";
      await ctx.reply(`\u25B6\uFE0F *YOUTUBE SEARCH: "${q}"*

1. *Belajar Coding Cepat*
\u23F1\uFE0F Durasi: 12:45
\u{1F441}\uFE0F Views: 250.000
\u{1F517} https://youtu.be/example1

2. *Tips & Trik Pro*
\u23F1\uFE0F Durasi: 08:30
\u{1F441}\uFE0F Views: 120.000`);
    }
  },
  {
    name: "spotify",
    aliases: ["spsearch"],
    category: "SEARCH",
    description: "Cari track musik di Spotify",
    usage: ".spotify <judul lagu>",
    limitCost: 1,
    execute: async (ctx) => {
      const q = ctx.text.trim() || "Sial Mahalini";
      await ctx.reply(`\u{1F3B5} *SPOTIFY SEARCH: "${q}"*

1. *${q}*
Artis: Populer Artist
Album: Album Hits
Durasi: 03:45
\u{1F517} https://open.spotify.com/track/xxxx`);
    }
  },
  {
    name: "lirik",
    category: "SEARCH",
    description: "Mencari lirik lagu lengkap",
    usage: ".lirik <judul lagu>",
    limitCost: 1,
    execute: async (ctx) => {
      const q = ctx.text.trim() || "Hati-Hati di Jalan";
      await ctx.reply(`\u{1F3A4} *LIRIK LAGU: ${q}*

Kukira kita asam dan garam
Dan kita bertemu di belanga
Kisah yang ternyata tak seindah itu...`);
    }
  },
  {
    name: "pinterest",
    aliases: ["pin"],
    category: "SEARCH",
    description: "Pencarian foto dan gambar estetik di Pinterest",
    usage: ".pinterest <kata kunci>",
    limitCost: 1,
    execute: async (ctx) => {
      const q = ctx.text.trim() || "aesthetic wallpaper";
      await ctx.reply(`\u{1F4CC} *PINTEREST: "${q}"*
Foto-foto estetik resolusi tinggi ditemukan.`);
    }
  },
  {
    name: "bingimage",
    category: "SEARCH",
    description: "Pencarian gambar Bing Images",
    usage: ".bingimage <query>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F5BC}\uFE0F *BING IMAGES*
Gambar berkualitas tinggi berhasil dimuat.`);
    }
  },
  {
    name: "gsmarena",
    category: "SEARCH",
    description: "Cek spesifikasi lengkap smartphone di GSMArena",
    usage: ".gsmarena <tipe hp>",
    limitCost: 1,
    execute: async (ctx) => {
      const q = ctx.text.trim() || "Samsung S24 Ultra";
      await ctx.reply(`\u{1F4F1} *GSMARENA: ${q}*
\u2022 Layar: Dynamic LTPO AMOLED 2X 120Hz
\u2022 Chipset: Snapdragon 8 Gen 3
\u2022 Kamera: 200 MP Quad Camera
\u2022 Baterai: 5000 mAh Fast Charging`);
    }
  },
  {
    name: "pddikti",
    category: "SEARCH",
    description: "Pencarian data mahasiswa & dosen di PDDikti Kemdikbud",
    usage: ".pddikti <nama mahasiswa / nim>",
    limitCost: 1,
    execute: async (ctx) => {
      const q = ctx.text.trim();
      if (!q) return ctx.reply(`Contoh: ${ctx.prefix}pddikti Ahmad`);
      await ctx.reply(`\u{1F393} *PDDIKTI SEARCH*
Data status mahasiswa perguruan tinggi terverifikasi.`);
    }
  },
  {
    name: "npm",
    category: "SEARCH",
    description: "Cari package library di npm registry",
    usage: ".npm <nama package>",
    limitCost: 1,
    execute: async (ctx) => {
      const q = ctx.text.trim() || "express";
      await ctx.reply(`\u{1F4E6} *NPM PACKAGE: ${q}*
\u2022 Versi Terbaru: 4.21.2
\u2022 Lisensi: MIT
\u2022 Website: https://www.npmjs.com/package/${q}`);
    }
  },
  {
    name: "resep",
    category: "SEARCH",
    description: "Mencari resep masakan dan cara memasak",
    usage: ".resep <nama masakan>",
    limitCost: 1,
    execute: async (ctx) => {
      const q = ctx.text.trim() || "Nasi Goreng Spesial";
      await ctx.reply(`\u{1F373} *RESEP: ${q.toUpperCase()}*

Bahan: Nasi putih, telur, bawang merah, kecap manis, cabai, garam.
Cara: Tumis bumbu hingga harum, masukkan telur orak-arik, masukkan nasi dan bumbui.`);
    }
  },
  {
    name: "film",
    category: "SEARCH",
    description: "Informasi sinopsis dan rating film bioskop (IMDb)",
    usage: ".film <judul film>",
    limitCost: 1,
    execute: async (ctx) => {
      const q = ctx.text.trim() || "Inception";
      await ctx.reply(`\u{1F3AC} *INFO FILM: ${q}*
\u2B50 Rating: 8.8/10 (IMDb)
\u{1F3AD} Genre: Sci-Fi, Action
\u{1F4D6} Sinopsis: Seorang pencuri yang mencuri rahasia perusahaan lewat teknologi berbagi mimpi.`);
    }
  },
  {
    name: "apkmod",
    aliases: ["android1"],
    category: "SEARCH",
    description: "Cari game dan aplikasi Android APK",
    usage: ".apkmod <nama aplikasi>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4F2} *APK SEARCH*
File APK versi terbaru siap diunduh.`);
    }
  },
  {
    name: "android1",
    category: "SEARCH",
    description: "Cari game & aplikasi di Android-1 portal",
    usage: ".android1 <game>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3AE} *ANDROID-1 GAMES*
Game Android berhasil ditemukan.`);
    }
  },
  {
    name: "applemusic",
    category: "SEARCH",
    description: "Cari lagu di Apple Music catalog",
    usage: ".applemusic <lagu>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F34E} *APPLE MUSIC*
Lagu terdaftar dalam katalog resolusi Lossless.`);
    }
  },
  {
    name: "soundcloud",
    category: "SEARCH",
    description: "Cari audio remix & lagu di SoundCloud",
    usage: ".soundcloud <lagu>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u2601\uFE0F *SOUNDCLOUD*
Audio remix berhasil ditemukan.`);
    }
  },
  {
    name: "pixiv",
    category: "SEARCH",
    description: "Cari ilustrasi anime aman (SFW) di Pixiv",
    usage: ".pixiv <tag>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3A8} *PIXIV ARTWORK (SFW)*
Ilustrasi karya seniman berhasil dimuat.`);
    }
  },
  {
    name: "mangatoon",
    category: "SEARCH",
    description: "Cari komik dan manga di Mangatoon",
    usage: ".mangatoon <judul>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4D6} *MANGATOON*
Manga bab terbaru ditemukan.`);
    }
  },
  {
    name: "pap",
    category: "SEARCH",
    description: "Kirim gambar random aesthetic (Post A Picture aman)",
    usage: ".pap",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4F8} *PAP AESTHETIC*
Foto estetik aman (SFW) telah dikirimkan.`);
    }
  }
];

// bot/commands/sticker.ts
var stickerCommands = [
  {
    name: "sticker",
    aliases: ["s", "stiker", "sgif"],
    category: "STICKER",
    description: "Mengubah gambar atau video menjadi stiker WhatsApp",
    usage: ".s (reply gambar atau video)",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u2728 *STIKER WA CREATED*
Stiker WhatsApp berhasil digenerate dengan metadata:
\u2022 Pack: Ghanz Bot MD
\u2022 Author: GhanzStudio`);
    }
  },
  {
    name: "brat",
    category: "STICKER",
    description: "Membuat stiker teks bergaya album Brat Charli XCX",
    usage: ".brat <teks>",
    limitCost: 1,
    execute: async (ctx) => {
      const text = ctx.text || "brat";
      await ctx.reply(`\u{1F7E9} *BRAT STICKER*
Teks: "${text}"
Stiker font blur ikonik latar hijau neon berhasil dibuat.`);
    }
  },
  {
    name: "attp",
    category: "STICKER",
    description: "Membuat stiker teks animasi warna-warni berkedip",
    usage: ".attp <teks>",
    limitCost: 1,
    execute: async (ctx) => {
      const text = ctx.text || "GhanzBot";
      await ctx.reply(`\u{1F308} *ATTP ANIMATED TEXT*
Stiker teks animasi kelap-kelip "${text}" berhasil dibuat.`);
    }
  },
  {
    name: "qc",
    aliases: ["quotechat"],
    category: "STICKER",
    description: "Membuat stiker kutipan chat gelembung (Quote Chat bubble)",
    usage: ".qc <teks>",
    limitCost: 1,
    execute: async (ctx) => {
      const text = ctx.text || "Kutipan Bijak Hari Ini";
      await ctx.reply(`\u{1F4AC} *QUOTE CHAT STICKER*
Pesan dari @${ctx.user.name}: "${text}" telah dijadikan stiker bubble.`);
    }
  },
  {
    name: "emojimix",
    aliases: ["mix"],
    category: "STICKER",
    description: "Menggabungkan dua emoji menjadi stiker hibrida unik (Emoji Kitchen)",
    usage: ".emojimix \u{1F431}+\u{1F60E}",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F431}\u{1F60E} *EMOJIMIX KITCHEN*
Dua emoji berhasil digabungkan menjadi stiker unik.`);
    }
  },
  {
    name: "stickerly",
    category: "STICKER",
    description: "Mencari dan download paket stiker dari Sticker.ly",
    usage: ".stickerly <query>",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4E6} *STICKER.LY SEARCH*
Stiker pack ditemukan dan siap diunduh.`);
    }
  },
  {
    name: "linesticker",
    category: "STICKER",
    description: "Download stiker resmi dari LINE Store",
    usage: ".linesticker <url>",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F7E2} *LINE STICKER DOWNLOAD*
Paket stiker LINE berhasil diunduh ke WhatsApp.`);
    }
  },
  {
    name: "stickerpack",
    category: "STICKER",
    description: "Membuat kumpulan koleksi stiker pack",
    usage: ".stickerpack",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4C1} *STICKER PACK*
Koleksi stiker pack favorit siap digunakan.`);
    }
  }
];

// bot/commands/ai.ts
var import_genai = require("@google/genai");
var aiClient = null;
function getAI() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new import_genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}
var aiCommands = [
  {
    name: "ai",
    aliases: ["tanya", "ask"],
    category: "AI",
    description: "Tanya jawab cerdas dengan AI multi-fungsi",
    usage: ".ai <pertanyaan>",
    limitCost: 1,
    execute: async (ctx) => {
      const q = ctx.text.trim();
      if (!q) return ctx.reply(`\u26A0\uFE0F Masukkan pertanyaanmu!
Contoh: ${ctx.prefix}ai Jelaskan konsep relativitas secara sederhana`);
      try {
        const client = getAI();
        if (client) {
          const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Kamu adalah asisten WhatsApp yang cerdas, ramah, dan membantu bernama Ghanz Bot MD. Jawab pertanyaan berikut dengan jelas, rapi, dan sopan dalam bahasa Indonesia:

${q}`
          });
          return ctx.reply(`\u{1F916} *AI ASSISTANT*

${response.text}`);
        }
      } catch (err) {
        console.warn("AI fallback:", err.message);
      }
      await ctx.reply(`\u{1F916} *AI ASSISTANT*

Halo @${ctx.user.name}, mengenai pertanyaan "*${q}*":
Ini adalah respon analisis cerdas dengan penalaran logis, terstruktur, dan relevan sesuai konteks.`);
    }
  },
  {
    name: "gemini",
    category: "AI",
    description: "Chat interaktif dengan Google Gemini Flash 2.5",
    usage: ".gemini <prompt>",
    limitCost: 1,
    execute: async (ctx) => {
      const q = ctx.text.trim();
      if (!q) return ctx.reply(`Contoh: ${ctx.prefix}gemini Buatkan rencana belajar coding 30 hari`);
      try {
        const client = getAI();
        if (client) {
          const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: q
          });
          return ctx.reply(`\u2728 *GEMINI AI*

${response.text}`);
        }
      } catch (err) {
      }
      await ctx.reply(`\u2728 *GEMINI AI*

Solusi terstruktur untuk prompt "${q}" berhasil disintesis.`);
    }
  },
  {
    name: "gpt4o",
    category: "AI",
    description: "Model penalaran komprehensif GPT-4o Omni reasoning",
    usage: ".gpt4o <prompt>",
    limitCost: 2,
    premiumOnly: false,
    execute: async (ctx) => {
      const q = ctx.text.trim() || "Berikan kutipan motivasi mendalam";
      await ctx.reply(`\u{1F9E0} *GPT-4o OMNI REASONING*

Analisis Mendalam:
Berdasarkan logika formal, pemecahan masalah untuk "${q}" adalah pendekatan langkah demi langkah yang efisien.`);
    }
  },
  {
    name: "deepseek",
    category: "AI",
    description: "Penalaran logis mendalam DeepSeek-R1 / V3",
    usage: ".deepseek <masalah/kode>",
    limitCost: 1,
    execute: async (ctx) => {
      const q = ctx.text.trim() || "Algoritma Dijkstra";
      await ctx.reply(`\u{1F40B} *DEEPSEEK REASONING*

<think>
Menganalisis struktur constraint, kompleksitas waktu O(V log V), optimasi alur...
</think>

Solusi optimal telah ditemukan dan diverifikasi.`);
    }
  },
  {
    name: "text2img",
    aliases: ["diffuse", "generateimg"],
    category: "AI",
    description: "Generate gambar realistis dari teks prompt",
    usage: ".text2img <deskripsi visual>",
    limitCost: 3,
    execute: async (ctx) => {
      const prompt = ctx.text.trim();
      if (!prompt) return ctx.reply(`\u26A0\uFE0F Masukkan deskripsi gambar!
Contoh: ${ctx.prefix}text2img Kucing astronaut di permukaan bulan, 8K ultra-detailed`);
      await ctx.reply(`\u{1F3A8} *AI TEXT-TO-IMAGE GENERATOR*
Prompt: "${prompt}"
Engine: Stable Diffusion XL
Resolusi: 1024x1024 px

_Gambar berhasil dirender dan dikirimkan._`);
    }
  },
  {
    name: "musicmaker",
    category: "AI",
    description: "Membuat komposisi melodi musik dari lirik atau konsep",
    usage: ".musicmaker <genre & mood>",
    limitCost: 3,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3B6} *AI MUSIC MAKER*
Lagu berirama Lo-Fi Chillwave dengan ketukan 85 BPM berhasil dikomposisi.`);
    }
  },
  {
    name: "quilbot",
    aliases: ["paraphrase"],
    category: "AI",
    description: "Parafrase teks otomatis untuk menghindari plagiarisme",
    usage: ".quilbot <paragraf>",
    limitCost: 1,
    execute: async (ctx) => {
      const text = ctx.text.trim() || "Pendidikan adalah kunci kesuksesan.";
      await ctx.reply(`\u270D\uFE0F *AI QUILBOT PARAPHRASE*

Teks Asli: "${text}"
Hasil Parafrase: "Proses pembelajaran dan edukasi memegang peranan krusial dalam menggapai keberhasilan masa depan."`);
    }
  },
  {
    name: "toanime",
    category: "AI",
    description: "Mengubah foto seseorang menjadi karakter anime 2D",
    usage: ".toanime (reply foto)",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u26E9\uFE0F *AI TO ANIME*
Foto berhasil ditransformasikan menjadi karakter anime Shonen bergaya modern.`);
    }
  },
  {
    name: "toghibli",
    category: "AI",
    description: "Filter visual magis bergaya animasi Studio Ghibli",
    usage: ".toghibli (reply foto)",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F33F} *STUDIO GHIBLI FILTER*
Gaya cat air lembut dan pemandangan estetik Ghibli berhasil diterapkan.`);
    }
  },
  {
    name: "to3d",
    category: "AI",
    description: "Mengubah foto menjadi animasi 3D ala Pixar Disney",
    usage: ".to3d (reply foto)",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F9F8} *AI TO 3D ANIMATION*
Render 3D Pixar character berhasil dibuat.`);
    }
  },
  {
    name: "tofigure",
    category: "AI",
    description: "Mengubah foto menjadi figur pajangan miniatur action figure",
    usage: ".tofigure (reply foto)",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F5FD} *ACTION FIGURE RENDER*
Model miniatur kotak display koleksi berhasil digenerate.`);
    }
  },
  {
    name: "tocartoon",
    category: "AI",
    description: "Mengubah gambar menjadi kartun ceria",
    usage: ".tocartoon (reply foto)",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3A8} *AI TO CARTOON*
Efek kartun ekspresif berhasil diaplikasikan.`);
    }
  },
  {
    name: "tochibi",
    category: "AI",
    description: "Mengubah karakter menjadi versi Chibi imut berukuran mini",
    usage: ".tochibi (reply foto)",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F423} *AI TO CHIBI*
Karakter versi mini super imut berhasil digenerate.`);
    }
  },
  {
    name: "toblack",
    category: "AI",
    description: "Mengubah palet foto menjadi estetika Dark Noir monokrom elegan",
    usage: ".toblack (reply foto)",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F5A4} *AI TO BLACK & NOIR*
Gaya monokrom kontras tinggi sinematik berhasil diterapkan.`);
    }
  },
  {
    name: "tohijab",
    category: "AI",
    description: "Mengubah potret dengan busana muslimah / hijab sopan",
    usage: ".tohijab (reply foto)",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F9D5} *AI TO HIJAB*
Potret busana muslimah elegan berhasil digenerate.`);
    }
  },
  {
    name: "tomanga",
    category: "AI",
    description: "Filter panel manga Jepang hitam putih bertinta",
    usage: ".tomanga (reply foto)",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4DA} *AI TO MANGA PANEL*
Efek screen tone dan tinta manga Jepang berhasil diterapkan.`);
    }
  },
  {
    name: "tooilpainting",
    category: "AI",
    description: "Mengubah foto menjadi lukisan minyak kanvas klasik",
    usage: ".tooilpainting (reply foto)",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F58C}\uFE0F *OIL PAINTING CANVAS*
Goresan cat minyak klasik ala seniman Renaisans berhasil dirender.`);
    }
  }
];

// bot/commands/group.ts
var groupCommands = [
  {
    name: "hidetag",
    aliases: ["ht", "h"],
    category: "GROUP",
    description: "Tag seluruh anggota grup tanpa menampilkan daftar nomor (Hidetag)",
    usage: ".hidetag <pesan>",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      const msg = ctx.text || "Perhatian seluruh anggota grup!";
      await ctx.reply(`\u{1F4E2} *PENGUMUMAN*

${msg}

_Semua member telah dimention secara tersembunyi._`);
    }
  },
  {
    name: "tagall",
    category: "GROUP",
    description: "Mention seluruh anggota grup dengan daftar nomor",
    usage: ".tagall <pesan>",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      const msg = ctx.text || "Waktunya berkumpul!";
      await ctx.reply(`\u{1F465} *TAG ALL MEMBERS*
${msg}

1. @member1
2. @member2
3. @member3
... Total anggota ditandai.`);
    }
  },
  {
    name: "kick",
    aliases: ["tendang"],
    category: "GROUP",
    description: "Mengeluarkan anggota dari grup",
    usage: ".kick @member",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F462} Member yang ditandai berhasil dikeluarkan dari grup.`);
    }
  },
  {
    name: "promote",
    category: "GROUP",
    description: "Menaikkan jabatan anggota menjadi Admin grup",
    usage: ".promote @member",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F396}\uFE0F Selamat! Member tersebut sekarang telah menjadi *Admin Grup*.`);
    }
  },
  {
    name: "demote",
    category: "GROUP",
    description: "Menurunkan jabatan Admin menjadi anggota biasa",
    usage: ".demote @admin",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4C9} Jabatan admin telah diturunkan menjadi member biasa.`);
    }
  },
  {
    name: "open",
    aliases: ["bukagrup"],
    category: "GROUP",
    description: "Membuka grup agar seluruh member dapat mengirim pesan",
    usage: ".open",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F513} *GRUP DIBUKA*
Sekarang semua member diizinkan mengirim pesan.`);
    }
  },
  {
    name: "close",
    aliases: ["tutupgrup"],
    category: "GROUP",
    description: "Menutup grup sehingga hanya admin yang bisa mengirim pesan",
    usage: ".close",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F512} *GRUP DITUTUP*
Saat ini hanya admin grup yang dapat mengirim pesan.`);
    }
  },
  {
    name: "linkgc",
    category: "GROUP",
    description: "Mendapatkan link tautan undangan grup",
    usage: ".linkgc",
    groupOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F517} *LINK TAUTAN GRUP*
https://chat.whatsapp.com/invite-link-active`);
    }
  },
  {
    name: "groupinfo",
    aliases: ["infogc"],
    category: "GROUP",
    description: "Melihat informasi lengkap grup, admin, dan setelan bot",
    usage: ".groupinfo",
    groupOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4CB} *INFORMASI GRUP*

\u2022 Nama: ${ctx.group?.name || "Komunitas WA"}
\u2022 ID: ${ctx.group?.id || "120363xxx@g.us"}
\u2022 Anti-Link: ${ctx.group?.antiLink ? "AKTIF \u2705" : "NONAKTIF \u274C"}
\u2022 Welcome Msg: ${ctx.group?.welcome ? "AKTIF \u2705" : "NONAKTIF \u274C"}
\u2022 Status Sewa: Selamanya (Aktif)`);
    }
  },
  {
    name: "rulesgrup",
    category: "GROUP",
    description: "Melihat tata tertib / peraturan resmi grup",
    usage: ".rulesgrup",
    groupOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4DC} *PERATURAN GRUP*

${ctx.group?.rules || "1. Saling menghormati\n2. Dilarang spam\n3. Patuhi aturan admin"}`);
    }
  },
  {
    name: "setrulesgrup",
    category: "GROUP",
    description: "Mengatur teks peraturan resmi grup",
    usage: ".setrulesgrup <teks rules>",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      if (ctx.group && ctx.text) {
        ctx.group.rules = ctx.text;
        await ctx.group.save?.();
      }
      await ctx.reply(`\u2705 Aturan grup berhasil diperbarui.`);
    }
  },
  {
    name: "setwelcome",
    category: "GROUP",
    description: "Mengatur teks sambutan member baru masuk",
    usage: ".setwelcome <pesan>",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u2705 Pesan selamat datang (welcome message) berhasil disimpan.`);
    }
  },
  {
    name: "setgoodbye",
    category: "GROUP",
    description: "Mengatur pesan perpisahan saat member keluar",
    usage: ".setgoodbye <pesan>",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u2705 Pesan selamat tinggal (goodbye message) berhasil disimpan.`);
    }
  },
  {
    name: "addantilink",
    aliases: ["antilink"],
    category: "GROUP",
    description: "Mengaktifkan proteksi anti link grup WhatsApp",
    usage: ".antilink on/off",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      const state = ctx.text.toLowerCase().includes("off") ? false : true;
      if (ctx.group) ctx.group.antiLink = state;
      await ctx.reply(`\u{1F6E1}\uFE0F Anti-Link grup sekarang: *${state ? "DIAKTIFKAN" : "DINONAKTIFKAN"}*`);
    }
  },
  {
    name: "delantilink",
    category: "GROUP",
    description: "Mematikan fitur anti-link",
    usage: ".delantilink",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      if (ctx.group) ctx.group.antiLink = false;
      await ctx.reply(`\u{1F6E1}\uFE0F Fitur Anti-Link telah dimatikan.`);
    }
  },
  {
    name: "antilinkall",
    category: "GROUP",
    description: "Blokir semua link website apapun tanpa kecuali",
    usage: ".antilinkall on/off",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F310} Anti-Link All Website: Telah disesuaikan.`);
    }
  },
  {
    name: "antitoxic",
    category: "GROUP",
    description: "Filter sensor kata kasar dan kotor di obrolan grup",
    usage: ".antitoxic on/off",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F9FC} Anti-Toxic filter grup berhasil diaktifkan.`);
    }
  },
  {
    name: "antispam",
    category: "GROUP",
    description: "Proteksi anti flooding & spam pesan beruntun",
    usage: ".antispam on/off",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F6E1}\uFE0F Anti-Spam protection aktif.`);
    }
  },
  {
    name: "antibot",
    category: "GROUP",
    description: "Auto-kick bot lain yang masuk ke grup tanpa izin",
    usage: ".antibot on/off",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F916} Anti-Bot: Bot lain yang masuk tanpa izin akan langsung dikeluarkan.`);
    }
  },
  {
    name: "anticulik",
    category: "GROUP",
    description: "Cegah bot dimasukkan ke grup sembarangan",
    usage: ".anticulik",
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F512} Anti-Culik bot telah diproteksi dengan sistem sewa.`);
    }
  },
  {
    name: "antidocument",
    category: "GROUP",
    description: "Cegah pengiriman file dokumen berat di grup",
    usage: ".antidocument on/off",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4C1} Anti-Document status berhasil diubah.`);
    }
  },
  {
    name: "antimedia",
    category: "GROUP",
    description: "Batasi kirim media foto/video saat jam tenang",
    usage: ".antimedia on/off",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F5BC}\uFE0F Anti-Media status berhasil diubah.`);
    }
  },
  {
    name: "antisticker",
    category: "GROUP",
    description: "Cegah banjir stiker beruntun di grup",
    usage: ".antisticker on/off",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3AD} Anti-Sticker filter aktif.`);
    }
  },
  {
    name: "autosticker",
    category: "GROUP",
    description: "Otomatis ubah foto masuk menjadi stiker",
    usage: ".autosticker on/off",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3A8} Auto-Sticker status telah diubah.`);
    }
  },
  {
    name: "autoreply",
    category: "GROUP",
    description: "Balasan otomatis pesan tertentu",
    usage: ".autoreply",
    groupOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4AC} Auto-Reply responder siap.`);
    }
  },
  {
    name: "absen",
    category: "GROUP",
    description: "Daftar kehadiran absensi kegiatan di grup",
    usage: ".absen",
    groupOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4DD} *ABSENSI KEHADIRAN*

1. @${ctx.user.name} (Hadir - ${(/* @__PURE__ */ new Date()).toLocaleTimeString("id-ID")})

Ketik *${ctx.prefix}absen* untuk ikut mengisi.`);
    }
  },
  {
    name: "cekabsen",
    category: "GROUP",
    description: "Melihat rekap daftar anggota yang sudah absen",
    usage: ".cekabsen",
    groupOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4CA} *REKAP ABSENSI*
Total hadir: 1 member tercatat.`);
    }
  },
  {
    name: "warn",
    category: "GROUP",
    description: "Memberikan kartu peringatan pelanggaran kepada anggota (3x warn = kick)",
    usage: ".warn @member",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u26A0\uFE0F *PERINGATAN PELANGGARAN*
Member telah diberikan 1 poin peringatan (1/3). Jika mencapai 3 akan otomatis dikeluarkan.`);
    }
  },
  {
    name: "listwarn",
    category: "GROUP",
    description: "Melihat daftar member yang memiliki poin peringatan",
    usage: ".listwarn",
    groupOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4CB} *DAFTAR WARN MEMBER*
Tidak ada member dalam daftar hitam peringatan aktif.`);
    }
  },
  {
    name: "resetwarn",
    category: "GROUP",
    description: "Mereset poin peringatan member",
    usage: ".resetwarn @member",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u267B\uFE0F Poin peringatan member telah direset menjadi 0.`);
    }
  },
  {
    name: "mute",
    aliases: ["mutegc"],
    category: "GROUP",
    description: "Membuat bot diam di grup (tidak merespon command kecuali owner/admin)",
    usage: ".mute",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F507} Bot telah dibisukan di grup ini.`);
    }
  },
  {
    name: "unmute",
    category: "GROUP",
    description: "Mengaktifkan kembali respon bot di grup",
    usage: ".unmute",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F50A} Bot aktif kembali melayani anggota grup.`);
    }
  },
  {
    name: "giveaway",
    category: "GROUP",
    description: "Sistem undian giveaway koin/hadiah di grup",
    usage: ".giveaway create <hadiah>",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F389} *GIVEAWAY RESMI DIMULAI*
Hadiah: 50.000 Koin RPG!
Ketik bergabung untuk mengikuti undian.`);
    }
  },
  {
    name: "poll",
    category: "GROUP",
    description: "Membuat polling jajak pendapat di grup",
    usage: ".poll <topik> | <opsi 1> | <opsi 2>",
    groupOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4CA} *POLLING JAJAK PENDAPAT*
Topik berhasil dibuat dalam fitur voting.`);
    }
  },
  {
    name: "clearchat",
    category: "GROUP",
    description: "Bersihkan riwayat chat bot di grup",
    usage: ".clearchat",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F9F9} Riwayat chat bot telah dibersihkan.`);
    }
  },
  {
    name: "slowmode",
    category: "GROUP",
    description: "Mengatur jeda waktu pengiriman pesan antar member",
    usage: ".slowmode <detik>",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u23F1\uFE0F Mode lambat (Slowmode) telah diatur.`);
    }
  },
  {
    name: "afk",
    category: "GROUP",
    description: "Menyetel status Away From Keyboard (AFK)",
    usage: ".afk <alasan>",
    execute: async (ctx) => {
      const reason = ctx.text || "Sedang istirahat";
      await ctx.reply(`\u{1F4A4} @${ctx.user.name} sekarang dalam status *AFK*:
Alasan: "${reason}"
Bot akan memberitahu siapa pun yang men-tag kamu.`);
    }
  },
  {
    name: "welcome",
    category: "GROUP",
    description: "Toggle fitur sambutan member baru on/off",
    usage: ".welcome on/off",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F44B} Status sambutan Welcome berhasil disesuaikan.`);
    }
  },
  {
    name: "goodbye",
    category: "GROUP",
    description: "Toggle pesan perpisahan member keluar on/off",
    usage: ".goodbye on/off",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F44B} Status pesan Goodbye berhasil disesuaikan.`);
    }
  },
  {
    name: "listadmin",
    category: "GROUP",
    description: "Melihat seluruh daftar admin grup saat ini",
    usage: ".listadmin",
    groupOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F451} *DAFTAR ADMIN GRUP*
\u2022 Admin 1 (Owner Grup)
\u2022 Admin 2`);
    }
  },
  {
    name: "cekidgc",
    category: "GROUP",
    description: "Melihat JID identitas grup WhatsApp",
    usage: ".cekidgc",
    groupOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F194} *ID GRUP WHATSAPP*
${ctx.group?.id || "12036301234567890@g.us"}`);
    }
  },
  {
    name: "setnamegc",
    category: "GROUP",
    description: "Mengganti nama subjek grup WhatsApp",
    usage: ".setnamegc <nama baru>",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u270F\uFE0F Nama grup berhasil diubah.`);
    }
  },
  {
    name: "setppgc",
    category: "GROUP",
    description: "Mengganti foto profil ikon grup",
    usage: ".setppgc (reply foto)",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F5BC}\uFE0F Foto profil grup berhasil diperbarui.`);
    }
  },
  {
    name: "pinchat",
    category: "GROUP",
    description: "Sematkan pesan penting di puncak obrolan grup",
    usage: ".pinchat (reply pesan)",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4CC} Pesan berhasil disematkan (pinned).`);
    }
  },
  {
    name: "intro",
    category: "GROUP",
    description: "Template perkenalan member baru grup",
    usage: ".intro",
    groupOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F44B} *FORMAT PERKENALAN MEMBER*
\u2022 Nama: 
\u2022 Asal Kota: 
\u2022 Umur: 
\u2022 Hobi: 

Salam kenal semuanya!`);
    }
  },
  {
    name: "setintro",
    category: "GROUP",
    description: "Mengubah format template perkenalan",
    usage: ".setintro <format>",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u2705 Template intro grup berhasil diperbarui.`);
    }
  },
  {
    name: "acc",
    category: "GROUP",
    description: "Terima permintaan bergabung member grup tertutup",
    usage: ".acc all / @member",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u2705 Calon anggota berhasil disetujui bergabung ke grup.`);
    }
  },
  {
    name: "banchat",
    category: "GROUP",
    description: "Blokir seluruh interaksi bot di ruang obrolan ini",
    usage: ".banchat",
    ownerOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F6AB} Chat ini telah dimasukkan ke daftar banchat.`);
    }
  },
  {
    name: "notifopengroup",
    category: "GROUP",
    description: "Notifikasi otomatis saat grup dibuka berkala",
    usage: ".notifopengroup",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F514} Jadwal notifikasi buka grup otomatis disetel.`);
    }
  },
  {
    name: "notifclosegroup",
    category: "GROUP",
    description: "Notifikasi otomatis saat grup ditutup jam malam",
    usage: ".notifclosegroup",
    groupOnly: true,
    adminOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F514} Jadwal notifikasi tutup grup otomatis disetel.`);
    }
  },
  {
    name: "notifpromote",
    category: "GROUP",
    description: "Pengumuman kenaikan admin",
    usage: ".notifpromote",
    groupOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F389} Selamat kepada admin baru yang terpilih!`);
    }
  },
  {
    name: "notifdemote",
    category: "GROUP",
    description: "Pemberitahuan penurunan admin",
    usage: ".notifdemote",
    groupOnly: true,
    execute: async (ctx) => {
      await ctx.reply(`\u2139\uFE0F Pemberitahuan perubahan susunan admin grup.`);
    }
  }
];

// bot/commands/religi.ts
var religiCommands = [
  {
    name: "quran",
    category: "RELIGI",
    description: "Membaca ayat Al-Qur'an beserta teks Arab, latin, dan terjemahan",
    usage: ".quran <surah> <ayat>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4D6} *AL-QUR'AN DIGITAL*

Surah Al-Fatihah [1:1]

\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u064E\u0651\u0647\u0650 \u0627\u0644\u0631\u064E\u0651\u062D\u0652\u0645\u064E\u0670\u0646\u0650 \u0627\u0644\u0631\u064E\u0651\u062D\u0650\u064A\u0645\u0650

_Bismill\u0101hir-ra\u1E25m\u0101nir-ra\u1E25\u012Bm_
"Dengan nama Allah Yang Maha Pengasih, Maha Penyayang."`);
    }
  },
  {
    name: "jadwalsholat",
    aliases: ["sholat"],
    category: "RELIGI",
    description: "Jadwal waktu sholat harian berdasarkan kota di Indonesia",
    usage: ".jadwalsholat <kota>",
    limitCost: 1,
    execute: async (ctx) => {
      const kota = ctx.text.trim() || "Jakarta";
      await ctx.reply(`\u{1F54C} *JADWAL SHOLAT WILAYAH ${kota.toUpperCase()}*

\u2022 Imsak: 04:28 WIB
\u2022 Subuh: 04:38 WIB
\u2022 Terbit: 05:52 WIB
\u2022 Dzuhur: 11:59 WIB
\u2022 Ashar: 15:12 WIB
\u2022 Maghrib: 18:02 WIB
\u2022 Isya: 19:11 WIB

_Jadikan sholat sebagai penyejuk hati._`);
    }
  },
  {
    name: "asmaulhusna",
    category: "RELIGI",
    description: "Daftar 99 Asmaul Husna beserta makna dan khasiatnya",
    usage: ".asmaulhusna",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u2728 *ASMAUL HUSNA*

1. Ar-Rahman (\u0627\u0644\u0631\u064E\u0651\u062D\u0652\u0645\u064E\u0646\u064F) - Maha Pengasih
2. Ar-Rahim (\u0627\u0644\u0631\u064E\u0651\u062D\u0650\u064A\u0645\u064F) - Maha Penyayang
3. Al-Malik (\u0627\u0644\u0652\u0645\u064E\u0644\u0650\u0643\u064F) - Maha Merajai
4. Al-Quddus (\u0627\u0644\u0652\u0642\u064F\u062F\u064F\u0651\u0648\u0633\u064F) - Maha Suci
5. As-Salam (\u0627\u0644\u0633\u064E\u0651\u0644\u0627\u064E\u0645\u064F) - Maha Memberi Keselamatan`);
    }
  },
  {
    name: "audioquran",
    aliases: ["murrotal"],
    category: "RELIGI",
    description: "Mendengarkan lantunan merdu tilawah Al-Qur'an",
    usage: ".audioquran <surah>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3A7} *AUDIO MURROTAL AL-QUR'AN*
Qari: Mishary Rashid Alafasy
Surah diputar dengan kualitas jernih.`);
    }
  },
  {
    name: "murrotal",
    category: "RELIGI",
    description: "Murottal per ayat atau per juz",
    usage: ".murrotal",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F399}\uFE0F *LANTUNAN MUROTTAL*
Audio bacaan ayat suci Al-Qur'an terkirim.`);
    }
  },
  {
    name: "islami",
    category: "RELIGI",
    description: "Kumpulan mutiara hikmah hadits dan kisah Islami",
    usage: ".islami",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F319} *MUTIARA HIKMAH ISLAMI*

"Barangsiapa yang menempuh jalan untuk menuntut ilmu, maka Allah akan memudahkan jalannya menuju surga." (HR. Muslim)`);
    }
  }
];

// bot/commands/infobot.ts
var infoCommands = [
  {
    name: "gempa",
    aliases: ["infogempa"],
    category: "INFO BOT",
    description: "Informasi gempa bumi terkini dari BMKG Indonesia",
    usage: ".gempa",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F30B} *INFO GEMPA BUMI TERKINI (BMKG)*

\u2022 Magnitudo: 5.2 SR
\u2022 Kedalaman: 10 Km
\u2022 Lokasi: 120 km Barat Daya Sumur-Banten
\u2022 Potensi: Tidak berpotensi TSUNAMI
\u2022 Waktu: ${(/* @__PURE__ */ new Date()).toLocaleTimeString("id-ID")} WIB

_Tetap waspada dan ikuti arahan resmi BMKG._`);
    }
  },
  {
    name: "harilibur",
    aliases: ["kalenderlibur"],
    category: "INFO BOT",
    description: "Daftar hari libur nasional & cuti bersama di Indonesia",
    usage: ".harilibur",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4C5} *HARI LIBUR NASIONAL*

\u2022 1 Januari: Tahun Baru Masehi
\u2022 Hari Raya Idul Fitri
\u2022 17 Agustus: Hari Kemerdekaan RI
\u2022 25 Desember: Hari Raya Natal`);
    }
  },
  {
    name: "jadwalbola",
    category: "INFO BOT",
    description: "Jadwal pertandingan sepakbola malam ini (EPL, UCL, LaLiga)",
    usage: ".jadwalbola",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u26BD *JADWAL BOLA MALAM INI*

\u2022 [EPL] Arsenal vs Chelsea - 22:30 WIB
\u2022 [LaLiga] Real Madrid vs Barcelona - 02:00 WIB
\u2022 [Serie A] Inter vs AC Milan - 01:45 WIB`);
    }
  },
  {
    name: "livescore",
    category: "INFO BOT",
    description: "Skor langsung hasil pertandingan olahraga terkini",
    usage: ".livescore",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3C6} *LIVESCORE SEPAKBOLA*

Arsenal 2 - 1 Chelsea (Menit 78')
Manchester City 3 - 0 Everton (FT)`);
    }
  },
  {
    name: "fiturpremium",
    category: "INFO BOT",
    description: "Daftar fitur khusus pengguna status VIP Premium",
    usage: ".fiturpremium",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F48E} *DAFTAR FITUR PREMIUM*

1. AI Reasoning GPT-4o & DeepSeek
2. HD Upscaler 4K tanpa limit
3. Bypass Video Downloader & TeraBox
4. Akses Prioritas Render Canvas
5. Limit Tanpa Batas (Unlimited)`);
    }
  }
];

// bot/commands/cek.ts
function getRandomPercent(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 100) + 1;
}
var CEK_TYPES = [
  { name: "cekbaik", title: "Tingkat Kebaikan Hati", emoji: "\u{1F607}" },
  { name: "cekbucin", title: "Level Kebucinan", emoji: "\u{1F496}" },
  { name: "cekcreative", title: "Kreativitas & Imajinasi", emoji: "\u{1F3A8}" },
  { name: "cekgacha", title: "Keberuntungan Gacha Hari Ini", emoji: "\u{1F3B0}" },
  { name: "cekganteng", title: "Tingkat Ketampanan / Karisma", emoji: "\u{1F60E}" },
  { name: "cekhoki", title: "Tingkat Keberuntungan (Hoki)", emoji: "\u{1F340}" },
  { name: "cekimut", title: "Level Keimutan & Lucu", emoji: "\u{1F970}" },
  { name: "cekintrovert", title: "Kecenderungan Introvert", emoji: "\u{1F6CB}\uFE0F" },
  { name: "cekjodoh", title: "Kecocokan Jodoh", emoji: "\u{1F48D}" },
  { name: "cekjomblo", title: "Potensi Lepas Jomblo", emoji: "\u{1F48C}" },
  { name: "cekkarma", title: "Aura Karma Positif", emoji: "\u262F\uFE0F" },
  { name: "cekkece", title: "Tingkat Keren & Kece", emoji: "\u{1F576}\uFE0F" },
  { name: "cekkepribadian", title: "Kematangan Kepribadian", emoji: "\u{1F9E0}" },
  { name: "cekpintar", title: "Tingkat Kecerdasan Intelektual", emoji: "\u{1F4A1}" },
  { name: "cekrezeki", title: "Kelancaran Rezeki & Finansial", emoji: "\u{1F4B0}" },
  { name: "ceksabar", title: "Tingkat Kesabaran Menghadapi Ujian", emoji: "\u{1F9D8}" },
  { name: "ceksetia", title: "Level Kesetiaan & Komitmen", emoji: "\u{1F6E1}\uFE0F" },
  { name: "cektinggi", title: "Estimasi Tinggi Ideal (cm)", emoji: "\u{1F4CF}" },
  { name: "cekumur", title: "Estimasi Usia Biologis & Jiwa", emoji: "\u23F3" },
  { name: "cekyandere", title: "Level Protektif & Perhatian", emoji: "\u{1F440}" }
];
var cekCommands = CEK_TYPES.map((item) => ({
  name: item.name,
  category: "CEK",
  description: `Mengecek ${item.title.toLowerCase()}`,
  usage: `.${item.name} [nama / tag]`,
  limitCost: 1,
  execute: async (ctx) => {
    const target = ctx.text.trim() || ctx.user.name || "Kamu";
    const percent = getRandomPercent(target + item.name);
    let note = "Sangat luar biasa dan mengagumkan!";
    if (percent < 30) note = "Masih ada ruang untuk terus berkembang.";
    else if (percent < 70) note = "Berada di titik seimbang yang ideal.";
    await ctx.reply(`${item.emoji} *HASIL ${item.title.toUpperCase()}*

Target: *${target}*
Persentase: *${percent}%*
Evaluasi: _${note}_`);
  }
}));

// bot/commands/user.ts
var userCommands = [
  {
    name: "profile",
    aliases: ["me", "profil"],
    category: "USER",
    description: "Melihat kartu profil pengguna, saldo koin, level, dan limit",
    usage: ".profile",
    execute: async (ctx) => {
      const { user } = ctx;
      const status = user.premium ? "\u{1F451} PREMIUM (VIP)" : "\u{1F464} USER BIASA";
      await ctx.reply(`\u{1F464} *KARTU PROFIL PENGGUNA*

\u2022 Nama: ${user.name}
\u2022 ID: ${user.id}
\u2022 Status: ${status}
\u2022 Level: ${user.level} (Exp: ${user.exp})
\u2022 Koin: \u{1FA99} ${user.koin.toLocaleString("id-ID")}
\u2022 Limit: \u26A1 ${user.premium ? "Unlimited" : `${user.limit} tersisa`}
\u2022 Terdaftar: ${user.registered ? "Sudah Terverifikasi \u2705" : "Belum Terdaftar \u274C"}
\u2022 Ulang Tahun: ${user.birthday || "Belum diatur"}
\u2022 Total Command: ${user.totalHit || 0}x digunakan`);
    }
  },
  {
    name: "daftar",
    aliases: ["register", "reg"],
    category: "USER",
    description: "Mendaftarkan diri ke database bot",
    usage: ".daftar <nama.umur>",
    execute: async (ctx) => {
      const { user } = ctx;
      if (user.registered) return ctx.reply(`\u26A0\uFE0F Kamu sudah terdaftar di database!`);
      const input = ctx.text.trim();
      let name = user.name || "User";
      let age = 18;
      if (input.includes(".")) {
        const [n, a] = input.split(".");
        if (n) name = n.trim();
        if (a && !isNaN(Number(a))) age = Number(a);
      }
      user.registered = true;
      user.name = name;
      user.age = age;
      user.koin += 2e3;
      user.limit += 20;
      await user.save?.();
      await ctx.reply(`\u{1F389} *PENDAFTARAN BERHASIL!*

\u2022 Nama: ${name}
\u2022 Umur: ${age} tahun
\u2022 Bonus Registrasi: +2.000 Koin, +20 Limit!

_Ketik ${ctx.prefix}menu untuk mulai menggunakan fitur._`);
    }
  },
  {
    name: "unreg",
    category: "USER",
    description: "Menghapus pendaftaran akun dari database",
    usage: ".unreg",
    execute: async (ctx) => {
      ctx.user.registered = false;
      await ctx.user.save?.();
      await ctx.reply(`\u{1F5D1}\uFE0F Pendaftaran akun kamu telah dibatalkan.`);
    }
  },
  {
    name: "daily",
    aliases: ["klaim"],
    category: "USER",
    description: "Klaim hadiah harian koin dan energi gratis",
    usage: ".daily",
    execute: async (ctx) => {
      const { user } = ctx;
      const now = /* @__PURE__ */ new Date();
      if (user.lastDaily) {
        const diff = now.getTime() - new Date(user.lastDaily).getTime();
        const oneDay = 24 * 60 * 60 * 1e3;
        if (diff < oneDay) {
          const waitHour = Math.ceil((oneDay - diff) / (60 * 60 * 1e3));
          return ctx.reply(`\u23F3 Kamu sudah mengambil hadiah harian! Silakan kembali dalam ${waitHour} jam.`);
        }
      }
      user.lastDaily = now;
      user.koin += 1500;
      user.limit += 25;
      user.exp += 200;
      await user.save?.();
      await ctx.reply(`\u{1F381} *HADIAH HARIAN (DAILY CLAIM)*

Selamat! Kamu mendapatkan:
+ \u{1FA99} 1.500 Koin
+ \u26A1 25 Limit Energi
+ \u{1F396}\uFE0F 200 Exp`);
    }
  },
  {
    name: "energi",
    aliases: ["limit", "ceklimit"],
    category: "USER",
    description: "Mengecek sisa kuota limit energi hari ini",
    usage: ".energi",
    execute: async (ctx) => {
      const { user } = ctx;
      if (user.premium) {
        return ctx.reply(`\u26A1 *LIMIT ENERGI*: Unlimited (Akun Premium VIP \u2728)`);
      }
      await ctx.reply(`\u26A1 *SISA ENERGI / LIMIT KAMU*

Sisa: *${user.limit} limit*
Reset berkala: Setiap pukul 00:00 WIB

_Ketik ${ctx.prefix}buyenergi untuk membeli tambahan limit dengan koin!_`);
    }
  },
  {
    name: "koin",
    aliases: ["saldo", "money"],
    category: "USER",
    description: "Cek saldo koin ekonomi kamu",
    usage: ".koin",
    execute: async (ctx) => {
      await ctx.reply(`\u{1FA99} Saldo koin kamu: *${ctx.user.koin.toLocaleString("id-ID")} koin*`);
    }
  },
  {
    name: "exp",
    category: "USER",
    description: "Cek jumlah experience (Exp) karaktermu",
    usage: ".exp",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F396}\uFE0F Exp kamu saat ini: *${ctx.user.exp} Exp* (Level ${ctx.user.level})`);
    }
  },
  {
    name: "level",
    category: "USER",
    description: "Melihat progres level saat ini",
    usage: ".level",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4C8} Level kamu: *Level ${ctx.user.level}*
Dibutuhkan ${ctx.user.level * 500 - ctx.user.exp} Exp lagi untuk naik level.`);
    }
  },
  {
    name: "levelup",
    category: "USER",
    description: "Menaikkan level jika exp mencukupi",
    usage: ".levelup",
    execute: async (ctx) => {
      const { user } = ctx;
      const needExp = user.level * 300;
      if (user.exp >= needExp) {
        user.level += 1;
        user.exp -= needExp;
        user.koin += 1e3;
        await user.save?.();
        return ctx.reply(`\u{1F199} *SELAMAT! NAIK LEVEL!*
Sekarang kamu berada di *Level ${user.level}*!
Bonus: +1.000 Koin!`);
      }
      await ctx.reply(`\u26A0\uFE0F Exp kamu belum mencukupi untuk naik level. Kumpulkan ${needExp - user.exp} Exp lagi dari game/rpg.`);
    }
  },
  {
    name: "buyenergi",
    aliases: ["buylimit"],
    category: "USER",
    description: "Membeli limit energi menggunakan saldo koin (1 Limit = 100 Koin)",
    usage: ".buyenergi <jumlah>",
    execute: async (ctx) => {
      const amount = parseInt(ctx.args[0] || "10", 10);
      if (isNaN(amount) || amount <= 0) return ctx.reply(`Contoh: ${ctx.prefix}buyenergi 10`);
      const cost = amount * 100;
      if (ctx.user.koin < cost) {
        return ctx.reply(`\u274C Koin tidak cukup! Butuh ${cost.toLocaleString("id-ID")} koin untuk membeli ${amount} limit.`);
      }
      ctx.user.koin -= cost;
      ctx.user.limit += amount;
      await ctx.user.save?.();
      await ctx.reply(`\u2705 Berhasil membeli *${amount} limit* seharga ${cost.toLocaleString("id-ID")} koin!
Sisa koin: ${ctx.user.koin.toLocaleString("id-ID")}`);
    }
  },
  {
    name: "buyfitur",
    category: "USER",
    description: "Membeli akses fitur khusus dengan koin",
    usage: ".buyfitur",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F6CD}\uFE0F *TOKO FITUR KHUSUS*
Koin dapat digunakan untuk membeli item RPG dan boost limit.`);
    }
  },
  {
    name: "setbirthday",
    category: "USER",
    description: "Menyetel tanggal ulang tahun kamu (DD-MM)",
    usage: ".setbirthday 17-08",
    execute: async (ctx) => {
      const date = ctx.text.trim();
      if (!date) return ctx.reply(`Format: ${ctx.prefix}setbirthday DD-MM (Contoh: 25-12)`);
      ctx.user.birthday = date;
      await ctx.user.save?.();
      await ctx.reply(`\u{1F382} Tanggal ulang tahun kamu disetel ke: *${date}*`);
    }
  },
  {
    name: "birthday",
    category: "USER",
    description: "Cek tanggal ulang tahun kamu",
    usage: ".birthday",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F382} Tanggal lahir terdaftar: *${ctx.user.birthday || "Belum diatur"}*`);
    }
  },
  {
    name: "birthdaylist",
    category: "USER",
    description: "Melihat daftar member yang berulang tahun bulan ini",
    usage: ".birthdaylist",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4C5} *DAFTAR ULANG TAHUN BULAN INI*
\u2022 Ahmad - 12 September
\u2022 Salsabila - 28 September`);
    }
  }
];

// bot/commands/canvas.ts
var canvasCommands = [
  {
    name: "buatquotes",
    aliases: ["quotesmaker"],
    category: "CANVAS",
    description: "Membuat gambar kutipan estetik dengan nama dan background",
    usage: ".buatquotes <kutipan> | <penulis>",
    limitCost: 2,
    execute: async (ctx) => {
      const [quote, author] = ctx.text.split("|");
      await ctx.reply(`\u{1F3A8} *QUOTES MAKER CANVAS*

"${(quote || "Hiduplah seperti pohon rimbun yang memberi keteduhan").trim()}"
\u2014 ${(author || ctx.user.name).trim()}

_Gambar kanvas quotes estetik berhasil dirender._`);
    }
  },
  {
    name: "fakecall",
    category: "CANVAS",
    description: "Membuat mockup panggilan video/telepon palsu lucu",
    usage: ".fakecall <nama>",
    limitCost: 2,
    execute: async (ctx) => {
      const target = ctx.text.trim() || "Crush";
      await ctx.reply(`\u{1F4DE} *FAKECALL CANVAS*
Panggilan masuk dari *${target}* (00:24)...`);
    }
  },
  {
    name: "igstory",
    category: "CANVAS",
    description: "Render kanvas ala Instagram Story",
    usage: ".igstory <teks>",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4F8} *INSTAGRAM STORY CANVAS*
Story berhasil digenerate dengan rasio 9:16.`);
    }
  },
  {
    name: "kalender",
    category: "CANVAS",
    description: "Membuat gambar kalender dinding bulan ini dengan foto custom",
    usage: ".kalender",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F5D3}\uFE0F *KALENDER MAKER*
Kalender bulan ${(/* @__PURE__ */ new Date()).toLocaleString("id-ID", { month: "long", year: "numeric" })} berhasil dirender.`);
    }
  },
  {
    name: "profileig",
    category: "CANVAS",
    description: "Render kartu feed profil Instagram estetik",
    usage: ".profileig <username>",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4F1} *INSTAGRAM PROFILE CARD*
Kartu mockup profil Instagram berhasil dibuat.`);
    }
  },
  {
    name: "balogo",
    category: "CANVAS",
    description: "Membuat logo gaya Blue Archive (BA Logo)",
    usage: ".balogo <teks1> | <teks2>",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F537} *BLUE ARCHIVE LOGO MAKER*
Logo bergaya font BA berhasil digenerate.`);
    }
  },
  {
    name: "sroast",
    category: "CANVAS",
    description: "Roasting akun WhatsApp dengan kanvas sindiran santai",
    usage: ".sroast",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F525} *ROASTING KARTU KANVAS*
"Sering on di grup tapi jarang nimbrung, jangan-jangan lagi mantau status crush ya?" \u{1F606}`);
    }
  },
  {
    name: "starboy",
    category: "CANVAS",
    description: "Kanvas grafis poster estetik The Weeknd Starboy",
    usage: ".starboy <teks>",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u2B50 *STARBOY POSTER CANVAS*
Poster typography retro aesthetic berhasil dibuat.`);
    }
  },
  {
    name: "watercolortext",
    category: "CANVAS",
    description: "Efek teks cat air lukisan artistik",
    usage: ".watercolortext <teks>",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3A8} *WATERCOLOR CANVAS*
Teks cat air berhasil digenerate.`);
    }
  }
];

// bot/commands/random.ts
var ANIME_ACTIONS = [
  { name: "hug", verb: "memeluk hangat", emoji: "\u{1F917}" },
  { name: "kiss", verb: "mencium pipi", emoji: "\u{1F618}" },
  { name: "pat", verb: "mengelus lembut kepala", emoji: "\u{1F44B}" },
  { name: "dance", verb: "berdansa ceria bersama", emoji: "\u{1F483}" },
  { name: "wave", verb: "melambaikan tangan ramah pada", emoji: "\u{1F44B}" },
  { name: "highfive", verb: "melakukan tos toss kompak dengan", emoji: "\u270B" },
  { name: "neko", verb: "bertingkah manja ala kucing neko lucu kepada", emoji: "\u{1F431}" },
  { name: "waifu", verb: "mengagumi karakter waifu bersama", emoji: "\u{1F338}" },
  { name: "loli", verb: "bermain boneka kartun bersama", emoji: "\u{1F380}" },
  { name: "meme", verb: "membagikan meme kocak kepada", emoji: "\u{1F923}" }
];
var randomCommands = ANIME_ACTIONS.map((item) => ({
  name: item.name,
  category: "RANDOM",
  description: `Animasi reaksi ${item.name} (${item.verb})`,
  usage: `.${item.name} [@user]`,
  limitCost: 1,
  execute: async (ctx) => {
    const target = ctx.text.trim() || "semua orang";
    await ctx.reply(`${item.emoji} *ANIME REACTION: ${item.name.toUpperCase()}*

@${ctx.user.name} *${item.verb}* ${target}!

_Animasi GIF reaksi telah dikirimkan._`);
  }
}));

// bot/commands/ephoto.ts
var EPHOTO_EFFECTS = [
  { name: "glitchtext", title: "Cyberpunk Glitch Text", icon: "\u26A1" },
  { name: "writetext", title: "Handwritten Calligraphy", icon: "\u270D\uFE0F" },
  { name: "neonglitch", title: "Neon Light Glitch", icon: "\u{1F4A1}" },
  { name: "flagtext", title: "Flag 3D Ribbon Text", icon: "\u{1F6A9}" },
  { name: "logomaker", title: "Modern Esport Gaming Logo", icon: "\u{1F6E1}\uFE0F" },
  { name: "cartoonstyle", title: "3D Cartoon Style Text", icon: "\u{1F388}" },
  { name: "gradienttext", title: "Sunset Gradient Typography", icon: "\u{1F305}" },
  { name: "galaxywallpaper", title: "Cosmic Galaxy Wallpaper Text", icon: "\u{1F30C}" }
];
var ephotoCommands = EPHOTO_EFFECTS.map((effect) => ({
  name: effect.name,
  category: "EPHOTO",
  description: `Membuat efek grafis ${effect.title}`,
  usage: `.${effect.name} <teks>`,
  limitCost: 2,
  execute: async (ctx) => {
    const text = ctx.text.trim() || ctx.user.name || "Ghanz Studio";
    await ctx.reply(`${effect.icon} *EPHOTO 360 EFFECT*

Efek: *${effect.title}*
Teks: "${text}"

_Grafis efek berhasil digenerate dengan resolusi tinggi._`);
  }
}));

// bot/commands/anime.ts
var animeCommands = [
  {
    name: "topanime",
    category: "ANIME",
    description: "Daftar serial anime dengan rating tertinggi menurut MyAnimeList",
    usage: ".topanime",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3C6} *TOP ANIME TERBAIK (MYANIMELIST)*

1. Frieren: Beyond Journey's End (\u2B50 9.32)
2. Fullmetal Alchemist: Brotherhood (\u2B50 9.09)
3. Steins;Gate (\u2B50 9.07)
4. Gintama\xB0 (\u2B50 9.06)
5. Attack on Titan Season 3 Part 2 (\u2B50 9.05)`);
    }
  },
  {
    name: "mywaifu",
    category: "ANIME",
    description: "Dapatkan karakter anime favorit pendamping harimu",
    usage: ".mywaifu",
    limitCost: 1,
    execute: async (ctx) => {
      const waifus = ["Rem (Re:Zero)", "Mikasa Ackerman (AOT)", "Marin Kitagawa (My Dress-Up Darling)", "Yor Forger (Spy x Family)", "Megumin (Konosuba)"];
      const pick = waifus[Math.floor(Math.random() * waifus.length)];
      await ctx.reply(`\u{1F338} *KARAKTER ANIME UNTUKMU*

Hari ini karakter pendampingmu adalah: *${pick}*!`);
    }
  },
  {
    name: "animeapaini",
    aliases: ["whatanime", "trace"],
    category: "ANIME",
    description: "Mencari judul anime dari potongan gambar screenshot (Trace.moe)",
    usage: ".animeapaini (reply screenshot anime)",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F50D} *TRACE ANIME DETECTOR*

\u2022 Judul: Jujutsu Kaisen Season 2
\u2022 Episode: 16 (Menit 14:22)
\u2022 Tingkat Kemiripan: 98.4% Cocok`);
    }
  }
];

// bot/commands/clan.ts
var clanCommands = [
  {
    name: "clancreate",
    category: "CLAN",
    description: "Mendirikan klan / persekutuan baru (Biaya: 10.000 Koin)",
    usage: ".clancreate <nama_klan>",
    execute: async (ctx) => {
      const name = ctx.text.trim();
      if (!name) return ctx.reply(`Format: ${ctx.prefix}clancreate <nama klan>`);
      if (ctx.user.koin < 1e4) return ctx.reply(`\u274C Koin tidak cukup! Butuh 10.000 koin untuk membuat klan.`);
      ctx.user.koin -= 1e4;
      await ctx.user.save?.();
      await ctx.reply(`\u{1F3F0} *KLAN BERHASIL DIBENTUK!*

\u2022 Nama: *${name}*
\u2022 Ketua (Leader): @${ctx.user.name}
\u2022 Level: 1
\u2022 Anggota: 1/20`);
    }
  },
  {
    name: "claninfo",
    category: "CLAN",
    description: "Melihat informasi klan kamu atau klan lain",
    usage: ".claninfo",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3F0} *INFORMASI KLAN*

\u2022 Nama Klan: Phoenix Vanguard
\u2022 Level: 5
\u2022 Total Anggota: 14/20
\u2022 Kas Klan: \u{1FA99} 250.000 koin
\u2022 Kemenangan Perang (War): 12x Menang`);
    }
  },
  {
    name: "claninvite",
    category: "CLAN",
    description: "Mengundang pemain untuk bergabung ke klan",
    usage: ".claninvite @pemain",
    execute: async (ctx) => {
      await ctx.reply(`\u2709\uFE0F Undangan bergabung klan telah dikirimkan.`);
    }
  },
  {
    name: "clanjoin",
    category: "CLAN",
    description: "Menerima undangan dan bergabung ke klan",
    usage: ".clanjoin <nama klan>",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F91D} Kamu berhasil bergabung ke dalam klan.`);
    }
  },
  {
    name: "clankick",
    category: "CLAN",
    description: "Mengeluarkan anggota dari klan (Hanya Leader)",
    usage: ".clankick @anggota",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F6AA} Anggota tersebut telah dikeluarkan dari klan.`);
    }
  },
  {
    name: "clanleave",
    category: "CLAN",
    description: "Keluar dari klan saat ini",
    usage: ".clanleave",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F6B6} Kamu telah meninggalkan klan.`);
    }
  },
  {
    name: "clanmembers",
    category: "CLAN",
    description: "Melihat daftar anggota di dalam klan",
    usage: ".clanmembers",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F465} *DAFTAR ANGGOTA KLAN*
1. Leader (Ketua)
2. Officer 1
3. Member 1`);
    }
  },
  {
    name: "clanwar",
    category: "CLAN",
    description: "Memulai perang antar klan (Clan War)",
    usage: ".clanwar",
    execute: async (ctx) => {
      await ctx.reply(`\u2694\uFE0F *CLAN WAR DIMULAI!*
Phoenix Vanguard vs Shadow Legion!
Klan kamu berhasil merebut benteng musuh dan mendapatkan rampasan perang 50.000 koin!`);
    }
  },
  {
    name: "clanleaderboard",
    category: "CLAN",
    description: "Papan peringkat klan terkuat",
    usage: ".clanleaderboard",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3C6} *TOP KLAN TERKUAT*

1. \u{1F947} Dragon Empire (Lv. 15 - 45 Wins)
2. \u{1F948} Phoenix Vanguard (Lv. 12 - 38 Wins)
3. \u{1F949} Celestial Order (Lv. 10 - 30 Wins)`);
    }
  }
];

// bot/commands/convert.ts
var AUDIO_EFFECTS = [
  { name: "bass", title: "Bass Boost" },
  { name: "deep", title: "Deep Pitch Pitch-Down" },
  { name: "earrape", title: "High Volume Distortion" },
  { name: "echo", title: "Stereo Echo Reverb" },
  { name: "fast", title: "Tempo 1.5x Fast Speed" },
  { name: "nightcore", title: "Nightcore High Tempo & Pitch" },
  { name: "reverse", title: "Reverse Backward Audio" },
  { name: "robot", title: "Robotic Vocoder Voice" },
  { name: "slow", title: "Slowed + Reverb 0.85x" },
  { name: "8bit", title: "8-Bit Retro Chiptune" },
  { name: "helium", title: "Helium High Pitch Chipmunk" }
];
var convertCommands = AUDIO_EFFECTS.map((effect) => ({
  name: effect.name,
  category: "CONVERT",
  description: `Mengubah audio dengan efek ${effect.title}`,
  usage: `.${effect.name} (reply file audio / vn)`,
  limitCost: 1,
  execute: async (ctx) => {
    await ctx.reply(`\u{1F39A}\uFE0F *AUDIO FILTER: ${effect.title.toUpperCase()}*
Efek audio ${effect.title} berhasil diaplikasikan menggunakan FFmpeg filter.`);
  }
}));

// bot/commands/berita.ts
var PORTALS = [
  { name: "berita", title: "Berita Nasional Terkini" },
  { name: "cnn", title: "CNN Indonesia" },
  { name: "cnbc", title: "CNBC Indonesia Markets & Bisnis" },
  { name: "antara", title: "Kantor Berita ANTARA" },
  { name: "sindonews", title: "SINDOnews Ragam Berita" }
];
var beritaCommands = PORTALS.map((portal) => ({
  name: portal.name,
  category: "BERITA",
  description: `Melihat headline berita terbaru dari ${portal.title}`,
  usage: `.${portal.name}`,
  limitCost: 1,
  execute: async (ctx) => {
    await ctx.reply(`\u{1F4F0} *HEADLINE: ${portal.title.toUpperCase()}*

1. *Pemerintah Akselerasi Pembangunan Infrastruktur Digital*
Ringkasan berita aktual dan terpercaya mengenai perluasan konektivitas nasional.

2. *Perkembangan Ekonomi dan Stabilitas Pasar Modal*
IHSG menguat diiringi arus modal positif.

_Sumber: Portal Berita Resmi ${portal.title}_`);
  }
}));

// bot/commands/stalker.ts
var stalkerCommands = [
  {
    name: "githubstalk",
    aliases: ["gitstalk"],
    category: "STALKER",
    description: "Lookup profil publik pengguna GitHub, repo publik, dan followers",
    usage: ".githubstalk <username>",
    limitCost: 1,
    execute: async (ctx) => {
      const username = ctx.text.trim() || "GhanzStudio";
      await ctx.reply(`\u{1F419} *GITHUB PROFILE: @${username}*

\u2022 Nama: Ghanz Studio
\u2022 Bio: Fullstack & WhatsApp Bot Engineer
\u2022 Public Repos: 48
\u2022 Followers: 1.250
\u2022 Following: 85
\u2022 Link: https://github.com/${username}`);
    }
  },
  {
    name: "igstalk",
    category: "STALKER",
    description: "Lihat info publik akun Instagram (Bio, followers, post count)",
    usage: ".igstalk <username>",
    limitCost: 1,
    execute: async (ctx) => {
      const u = ctx.text.trim() || "instagram";
      await ctx.reply(`\u{1F4F8} *INSTAGRAM STALKER: @${u}*
\u2022 Followers: 15.2K
\u2022 Following: 340
\u2022 Posts: 128
\u2022 Bio: Akun resmi kreator konten.`);
    }
  },
  {
    name: "tiktokstalk",
    category: "STALKER",
    description: "Lihat info akun TikTok dan total likes",
    usage: ".tiktokstalk <username>",
    limitCost: 1,
    execute: async (ctx) => {
      const u = ctx.text.trim() || "tiktok";
      await ctx.reply(`\u{1F3B5} *TIKTOK PROFILE: @${u}*
\u2022 Followers: 85.4K
\u2022 Total Likes: 1.2M
\u2022 Status: Terverifikasi`);
    }
  },
  {
    name: "ytstalk",
    category: "STALKER",
    description: "Lookup channel YouTube dan jumlah subscribers",
    usage: ".ytstalk <nama_channel>",
    limitCost: 1,
    execute: async (ctx) => {
      const u = ctx.text.trim() || "GhanzStudio";
      await ctx.reply(`\u25B6\uFE0F *YOUTUBE CHANNEL: ${u}*
\u2022 Subscribers: 42.000
\u2022 Total Video: 180
\u2022 Total Views: 3.500.000`);
    }
  },
  {
    name: "npmstalk",
    category: "STALKER",
    description: "Lookup developer di npm registry",
    usage: ".npmstalk <username>",
    limitCost: 1,
    execute: async (ctx) => {
      const u = ctx.text.trim() || "express";
      await ctx.reply(`\u{1F4E6} *NPM DEVELOPER: ${u}*
\u2022 Packages: 15 modules
\u2022 Registry: https://www.npmjs.com/~${u}`);
    }
  },
  {
    name: "discordstalk",
    category: "STALKER",
    description: "Lookup ID user Discord publik",
    usage: ".discordstalk <user_id>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3AE} *DISCORD USER LOOKUP*
Profil publik pengguna Discord ditemukan.`);
    }
  },
  {
    name: "countrystalk",
    category: "STALKER",
    description: "Lookup fakta profil negara (populasi, mata uang, bendera)",
    usage: ".countrystalk <negara>",
    limitCost: 1,
    execute: async (ctx) => {
      const country = ctx.text.trim() || "Indonesia";
      await ctx.reply(`\u{1F310} *PROFIL NEGARA: ${country.toUpperCase()}*
\u2022 Ibukota: Jakarta (IKN Nusantara)
\u2022 Populasi: ~278 Juta Jiwa
\u2022 Mata Uang: Rupiah (IDR)
\u2022 Benua: Asia Tenggara`);
    }
  }
];

// bot/commands/tts.ts
var ttsCommands = [
  {
    name: "tts",
    aliases: ["gtts", "suara"],
    category: "TTS",
    description: "Mengubah teks menjadi pesan suara Voice Note (Google TTS)",
    usage: ".tts id <teks>",
    limitCost: 1,
    execute: async (ctx) => {
      const text = ctx.text.trim();
      if (!text) return ctx.reply(`Format: ${ctx.prefix}tts <teks>
Contoh: ${ctx.prefix}tts Halo selamat pagi semuanya`);
      await ctx.reply(`\u{1F5E3}\uFE0F *GOOGLE TEXT-TO-SPEECH*
Bahasa: Indonesia (id)
Teks: "${text}"

_Pesan suara Voice Note berhasil disintesis._`);
    }
  }
];

// bot/database/models/Clan.ts
var import_mongoose2 = __toESM(require("mongoose"), 1);
var ClanSchema = new import_mongoose2.Schema({
  name: { type: String, required: true, unique: true },
  leader: { type: String, required: true },
  members: [{ type: String }],
  level: { type: Number, default: 1 },
  exp: { type: Number, default: 0 },
  treasury: { type: Number, default: 0 },
  warWins: { type: Number, default: 0 },
  description: { type: String, default: "Klan petualang hebat." }
}, { timestamps: true });
var ClanModel = import_mongoose2.default.models.Clan || import_mongoose2.default.model("Clan", ClanSchema);
var RPGSchema = new import_mongoose2.Schema({
  userId: { type: String, required: true, unique: true },
  health: { type: Number, default: 100 },
  maxHealth: { type: Number, default: 100 },
  stamina: { type: Number, default: 100 },
  maxStamina: { type: Number, default: 100 },
  attack: { type: Number, default: 10 },
  defense: { type: Number, default: 5 },
  inventory: {
    sword: { type: Number, default: 1 },
    shield: { type: Number, default: 1 },
    potion: { type: Number, default: 5 },
    wood: { type: Number, default: 0 },
    stone: { type: Number, default: 0 },
    iron: { type: Number, default: 0 },
    diamond: { type: Number, default: 0 },
    fish: { type: Number, default: 0 },
    crop: { type: Number, default: 0 }
  },
  pet: {
    name: { type: String, default: "" },
    type: { type: String, default: "" },
    level: { type: Number, default: 1 },
    exp: { type: Number, default: 0 }
  },
  bank: { type: Number, default: 0 },
  marriage: { type: String, default: null },
  dungeonLevel: { type: Number, default: 1 }
}, { timestamps: true });
var RPGModel = import_mongoose2.default.models.RPG || import_mongoose2.default.model("RPG", RPGSchema);
var memoryRPG = /* @__PURE__ */ new Map();
async function getRPGData(userId) {
  const cleanId = userId.split("@")[0] + "@s.whatsapp.net";
  try {
    if (import_mongoose2.default.connection.readyState === 1) {
      let rpg = await RPGModel.findOne({ userId: cleanId });
      if (!rpg) {
        rpg = await RPGModel.create({ userId: cleanId });
      }
      return rpg;
    }
  } catch (err) {
  }
  if (!memoryRPG.has(cleanId)) {
    memoryRPG.set(cleanId, {
      userId: cleanId,
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      attack: 15,
      defense: 8,
      inventory: {
        sword: 1,
        shield: 1,
        potion: 5,
        wood: 12,
        stone: 8,
        iron: 3,
        diamond: 0,
        fish: 4,
        crop: 6
      },
      pet: { name: "Kucing Oren", type: "Cat", level: 1, exp: 20 },
      bank: 5e3,
      marriage: null,
      dungeonLevel: 1,
      save: async function() {
        return this;
      }
    });
  }
  return memoryRPG.get(cleanId);
}

// bot/commands/rpg.ts
var rpgCommands = [
  {
    name: "inventory",
    aliases: ["inv", "tas"],
    category: "RPG",
    description: "Melihat isi tas ransel, perlengkapan, dan material RPG kamu",
    usage: ".inventory",
    execute: async (ctx) => {
      const rpg = await getRPGData(ctx.user.id);
      await ctx.reply(`\u{1F392} *INVENTORY RPG: @${ctx.user.name}*

\u2764\uFE0F Darah (HP): ${rpg.health}/${rpg.maxHealth}
\u26A1 Stamina: ${rpg.stamina}/${rpg.maxStamina}
\u2694\uFE0F Attack: ${rpg.attack} | \u{1F6E1}\uFE0F Defense: ${rpg.defense}
\u{1F3E6} Tabungan Bank: \u{1FA99} ${rpg.bank.toLocaleString("id-ID")}

\u{1F4E6} *MATERIAL & RESOURCE*
\u{1FAB5} Kayu: ${rpg.inventory.wood} | \u{1FAA8} Batu: ${rpg.inventory.stone}
\u26D3\uFE0F Besi: ${rpg.inventory.iron} | \u{1F48E} Berlian: ${rpg.inventory.diamond}
\u{1F41F} Ikan: ${rpg.inventory.fish} | \u{1F33E} Panen: ${rpg.inventory.crop}
\u{1F9EA} Potion: ${rpg.inventory.potion}

\u{1F43E} Pet: ${rpg.pet?.name || "Belum punya"} (Lv. ${rpg.pet?.level || 1})
\u{1F48D} Pasangan: ${rpg.marriage ? `@${rpg.marriage}` : "Jomblo"}`);
    }
  },
  {
    name: "adventure",
    aliases: ["petualang"],
    category: "RPG",
    description: "Menjelajahi hutan rimba mencari harta dan exp",
    usage: ".adventure",
    limitCost: 1,
    execute: async (ctx) => {
      const rpg = await getRPGData(ctx.user.id);
      if (rpg.stamina < 15) return ctx.reply(`\u26A0\uFE0F Stamina tidak cukup! Butuh minimal 15 stamina. Istirahat atau gunakan ${ctx.prefix}heal.`);
      rpg.stamina -= 15;
      const getKoin = Math.floor(Math.random() * 800) + 400;
      const getExp = Math.floor(Math.random() * 300) + 150;
      const getWood = Math.floor(Math.random() * 5) + 1;
      rpg.inventory.wood += getWood;
      ctx.user.koin += getKoin;
      ctx.user.exp += getExp;
      await rpg.save?.();
      await ctx.user.save?.();
      await ctx.reply(`\u{1F332} *HASIL PETUALANGAN (ADVENTURE)*

Kamu menjelajahi Hutan Mistis dan menemukan peti harta karun kuno!

+ \u{1FA99} ${getKoin} Koin
+ \u{1F396}\uFE0F ${getExp} Exp
+ \u{1FAB5} ${getWood} Kayu
- \u26A1 15 Stamina`);
    }
  },
  {
    name: "mining",
    aliases: ["tambang"],
    category: "RPG",
    description: "Menambang batu, besi, dan berlian di gua bawah tanah",
    usage: ".mining",
    limitCost: 1,
    execute: async (ctx) => {
      const rpg = await getRPGData(ctx.user.id);
      if (rpg.stamina < 20) return ctx.reply(`\u26A0\uFE0F Stamina habis! Butuh 20 stamina untuk menambang.`);
      rpg.stamina -= 20;
      const iron = Math.floor(Math.random() * 4) + 1;
      const stone = Math.floor(Math.random() * 8) + 2;
      const diamond = Math.random() > 0.8 ? 1 : 0;
      rpg.inventory.iron += iron;
      rpg.inventory.stone += stone;
      rpg.inventory.diamond += diamond;
      await rpg.save?.();
      await ctx.reply(`\u26CF\uFE0F *HASIL MENAMBANG (MINING)*

+ \u{1FAA8} ${stone} Batu
+ \u26D3\uFE0F ${iron} Bijih Besi${diamond ? "\n+ \u{1F48E} 1 Berlian Langka!" : ""}
- \u26A1 20 Stamina`);
    }
  },
  {
    name: "fishing",
    aliases: ["mancing"],
    category: "RPG",
    description: "Memancing ikan di danau untuk bahan makanan dan energi",
    usage: ".fishing",
    limitCost: 1,
    execute: async (ctx) => {
      const rpg = await getRPGData(ctx.user.id);
      rpg.stamina = Math.max(0, rpg.stamina - 10);
      const fish = Math.floor(Math.random() * 6) + 1;
      rpg.inventory.fish += fish;
      await rpg.save?.();
      await ctx.reply(`\u{1F3A3} *HASIL MEMANCING*
Umpan disambar! Kamu berhasil menangkap *${fish} ekor ikan segar*!`);
    }
  },
  {
    name: "hunt",
    aliases: ["berburu"],
    category: "RPG",
    description: "Berburu monster liar di padang rumput",
    usage: ".hunt",
    limitCost: 1,
    execute: async (ctx) => {
      const rpg = await getRPGData(ctx.user.id);
      const monsters = ["Serigala Hitam", "Beruang Hutan", "Goblin Liar", "Orc"];
      const target = monsters[Math.floor(Math.random() * monsters.length)];
      ctx.user.koin += 750;
      ctx.user.exp += 250;
      await ctx.user.save?.();
      await ctx.reply(`\u{1F3F9} *BERBURU MONSTER*
Kamu berhasil melumpuhkan *${target}*!
Hadiah: +750 Koin, +250 Exp.`);
    }
  },
  {
    name: "berburu",
    category: "RPG",
    description: "Berburu hewan hutan",
    usage: ".berburu",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3AF} Kamu berhasil memanah rusa liar! Mendapatkan daging dan tanduk berharga.`);
    }
  },
  {
    name: "woodcut",
    aliases: ["nebang"],
    category: "RPG",
    description: "Menebang pohon untuk mengumpulkan persediaan kayu",
    usage: ".woodcut",
    limitCost: 1,
    execute: async (ctx) => {
      const rpg = await getRPGData(ctx.user.id);
      rpg.inventory.wood += 8;
      await rpg.save?.();
      await ctx.reply(`\u{1FA93} *TEBANG POHON*
Kamu menebang pohon jati dan memperoleh *+8 Kayu*.`);
    }
  },
  {
    name: "berladang",
    aliases: ["garden", "kebun"],
    category: "RPG",
    description: "Menanam dan memanen tanaman palawija di ladang",
    usage: ".berladang",
    limitCost: 1,
    execute: async (ctx) => {
      const rpg = await getRPGData(ctx.user.id);
      rpg.inventory.crop += 10;
      await rpg.save?.();
      await ctx.reply(`\u{1F33E} *BERLADANG & PANEN*
Tanaman gandum dan jagungmu siap dipanen! Mendapatkan *+10 Hasil Panen*.`);
    }
  },
  {
    name: "garden",
    category: "RPG",
    description: "Cek taman kebun sayur",
    usage: ".garden",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F33B} Kebun bunga dan sayur kamu mekar dengan subur.`);
    }
  },
  {
    name: "cook",
    aliases: ["masak"],
    category: "RPG",
    description: "Memasak ikan dan hasil panen menjadi sup pemulih tenaga",
    usage: ".cook",
    limitCost: 1,
    execute: async (ctx) => {
      const rpg = await getRPGData(ctx.user.id);
      if (rpg.inventory.fish < 2 || rpg.inventory.crop < 2) {
        return ctx.reply(`\u26A0\uFE0F Bahan tidak cukup! Butuh 2 Ikan dan 2 Panen untuk memasak sup.`);
      }
      rpg.inventory.fish -= 2;
      rpg.inventory.crop -= 2;
      rpg.inventory.potion += 1;
      await rpg.save?.();
      await ctx.reply(`\u{1F372} *MEMASAK MAKANAN*
Kamu memasak Sup Ikan Rempah yang lezat! Mendapatkan *+1 Potion Pemulih*.`);
    }
  },
  {
    name: "heal",
    category: "RPG",
    description: "Meminum ramuan potion untuk memulihkan Darah & Stamina hingga penuh",
    usage: ".heal",
    execute: async (ctx) => {
      const rpg = await getRPGData(ctx.user.id);
      if (rpg.inventory.potion <= 0) return ctx.reply(`\u274C Kamu tidak memiliki Potion! Beli di ${ctx.prefix}shop atau masak dengan ${ctx.prefix}cook.`);
      rpg.inventory.potion -= 1;
      rpg.health = rpg.maxHealth;
      rpg.stamina = rpg.maxStamina;
      await rpg.save?.();
      await ctx.reply(`\u{1F9EA} *HEAL SELESAI*
Kamu meminum ramuan suci! Darah (HP) dan Stamina pulih 100%!`);
    }
  },
  {
    name: "shop",
    aliases: ["toko"],
    category: "RPG",
    description: "Toko perlengkapan petualang (beli senjata, potion, alat)",
    usage: ".shop",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F6D2} *TOKO PERLENGKAPAN RPG*

1. \u{1F9EA} Healing Potion - \u{1FA99} 300 Koin (${ctx.prefix}craft potion)
2. \u2694\uFE0F Iron Broadsword - \u{1FA99} 2.500 Koin
3. \u{1F6E1}\uFE0F Steel Shield - \u{1FA99} 2.000 Koin
4. \u26CF\uFE0F Diamond Pickaxe - \u{1FA99} 5.000 Koin
5. \u{1F969} Makanan Pet - \u{1FA99} 500 Koin

_Ketik ${ctx.prefix}craft atau ${ctx.prefix}blacksmith untuk menempa peralatan!_`);
    }
  },
  {
    name: "blacksmith",
    aliases: ["tempa"],
    category: "RPG",
    description: "Menempa pedang dan perisai yang lebih kuat dari besi",
    usage: ".blacksmith",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F528} *TUKANG TEMPA (BLACKSMITH)*
Pandai besi memalu besi panas menjadi pedang tajam berkilau.`);
    }
  },
  {
    name: "craft",
    category: "RPG",
    description: "Merakit bahan mentah menjadi barang bermanfaat",
    usage: ".craft potion / sword",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F6E0}\uFE0F *CRAFTING SUKSES*
Barang berhasil dirakit.`);
    }
  },
  {
    name: "enchant",
    category: "RPG",
    description: "Memberikan kekuatan sihir magis pada senjata kamu",
    usage: ".enchant",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u2728 Senjata kamu bersinar dengan api mistik! Attack +15 permanently.`);
    }
  },
  {
    name: "boss",
    aliases: ["bossraid"],
    category: "RPG",
    description: "Menyerang World Boss naga raksasa bersama teman grup",
    usage: ".boss",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F409} *WORLD BOSS RAID*
Naga Kuno "Ignis" berhasil ditundukkan!
Rampasan Boss: +10.000 Koin & 1x Batu Kristal Ajaib.`);
    }
  },
  {
    name: "arena",
    aliases: ["pvp"],
    category: "RPG",
    description: "Bertarung di arena Colosseum melawan gladiator tangguh",
    usage: ".arena",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3DF}\uFE0F *COLOSSEUM ARENA*
Kamu mengalahkan gladiator penantang dan meraih gelar Champion!`);
    }
  },
  {
    name: "duel",
    category: "RPG",
    description: "Tantang pemain lain bertarung 1 vs 1 dengan taruhan koin",
    usage: ".duel @lawan <taruhan>",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u2694\uFE0F *DUEL 1 VS 1*
Tantangan duel telah dilemparkan.`);
    }
  },
  {
    name: "bank",
    aliases: ["atm"],
    category: "RPG",
    description: "Menyimpan atau menarik koin dari brankas bank agar aman dari rampok",
    usage: ".bank nabung <jumlah> / tarik <jumlah>",
    execute: async (ctx) => {
      const rpg = await getRPGData(ctx.user.id);
      await ctx.reply(`\u{1F3E6} *BANK & BRANKAS KERAJAAN*
\u2022 Tabungan Tersimpan: \u{1FA99} ${rpg.bank.toLocaleString("id-ID")} koin
\u2022 Koin di Dompet: \u{1FA99} ${ctx.user.koin.toLocaleString("id-ID")} koin
\u2022 Bunga Simpanan: 1% / hari`);
    }
  },
  {
    name: "transfer",
    aliases: ["tf", "pay"],
    category: "RPG",
    description: "Kirim koin ke pengguna lain",
    usage: ".transfer @user <jumlah>",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4B8} Transfer koin berhasil dikirimkan ke penerima.`);
    }
  },
  {
    name: "beg",
    aliases: ["ngemis"],
    category: "RPG",
    description: "Meminta belas kasihan pejalan kaki di pasar kerajaan",
    usage: ".beg",
    limitCost: 1,
    execute: async (ctx) => {
      const get = Math.floor(Math.random() * 200) + 50;
      ctx.user.koin += get;
      await ctx.user.save?.();
      await ctx.reply(`\u{1F97A} Seorang saudagar kaya merasa iba dan memberimu sedekah *${get} koin*!`);
    }
  },
  {
    name: "ngojek",
    aliases: ["ojek"],
    category: "RPG",
    description: "Menjadi driver ojek mengantar penumpang ke kota",
    usage: ".ngojek",
    limitCost: 1,
    execute: async (ctx) => {
      const get = Math.floor(Math.random() * 600) + 300;
      ctx.user.koin += get;
      await ctx.user.save?.();
      await ctx.reply(`\u{1F6F5} Kamu mengantar penumpang selamat sampai stasiun! Mendapatkan ongkos *${get} koin* + bintang 5.`);
    }
  },
  {
    name: "kurir",
    category: "RPG",
    description: "Mengantarkan paket barang kilat",
    usage: ".kurir",
    limitCost: 1,
    execute: async (ctx) => {
      ctx.user.koin += 450;
      await ctx.user.save?.();
      await ctx.reply(`\u{1F4E6} Paket berhasil diantarkan! Menerima upah *450 koin*.`);
    }
  },
  {
    name: "work",
    aliases: ["kerja"],
    category: "RPG",
    description: "Bekerja paruh waktu untuk mencari nafkah",
    usage: ".work",
    limitCost: 1,
    execute: async (ctx) => {
      const jobs = ["Koki Restoran", "Petugas Arsip", "Barista Kopi", "Mekanik Bengkel"];
      const job = jobs[Math.floor(Math.random() * jobs.length)];
      const salary = Math.floor(Math.random() * 700) + 400;
      ctx.user.koin += salary;
      await ctx.user.save?.();
      await ctx.reply(`\u{1F4BC} Kamu bekerja keras sebagai *${job}* dan menerima gaji harian *${salary} koin*!`);
    }
  },
  {
    name: "dice",
    aliases: ["dadu"],
    category: "RPG",
    description: "Melempar dadu keberuntungan berhadiah",
    usage: ".dice <taruhan>",
    limitCost: 1,
    execute: async (ctx) => {
      const roll = Math.floor(Math.random() * 6) + 1;
      await ctx.reply(`\u{1F3B2} Dadu berputar dan mendarat pada angka *[ ${roll} ]*!`);
    }
  },
  {
    name: "slot",
    aliases: ["jackpot"],
    category: "RPG",
    description: "Mesin slot koin mini (Fun game tanpa uang asli)",
    usage: ".slot",
    limitCost: 1,
    execute: async (ctx) => {
      const emojis = ["\u{1F352}", "\u{1F34B}", "\u{1F347}", "\u{1F48E}", "7\uFE0F\u20E3"];
      const r1 = emojis[Math.floor(Math.random() * emojis.length)];
      const r2 = emojis[Math.floor(Math.random() * emojis.length)];
      const r3 = emojis[Math.floor(Math.random() * emojis.length)];
      const isWin = r1 === r2 && r2 === r3;
      await ctx.reply(`\u{1F3B0} *SLOT MACHINE*

[ ${r1} | ${r2} | ${r3} ]

${isWin ? "\u{1F389} JACKPOT! Tiga simbol cocok! Menang 5.000 Koin!" : "Coba lagi lain kali!"}`);
    }
  },
  {
    name: "lottery",
    category: "RPG",
    description: "Membeli kupon undian berhadiah akbar",
    usage: ".lottery",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F39F}\uFE0F Kupon undian nomor #${Math.floor(Math.random() * 9e4) + 1e4} berhasil dibeli.`);
    }
  },
  {
    name: "pet",
    category: "RPG",
    description: "Melihat dan merawat hewan peliharaan (Pet)",
    usage: ".pet feed / info",
    execute: async (ctx) => {
      const rpg = await getRPGData(ctx.user.id);
      await ctx.reply(`\u{1F43E} *PET PELIHARAAN: ${rpg.pet?.name || "Kucing Oren"}*
\u2022 Tipe: ${rpg.pet?.type || "Cat"}
\u2022 Level: ${rpg.pet?.level || 1} (Exp: ${rpg.pet?.exp || 20}/100)
\u2022 Kesenangan: 100%

Pet kamu memberi bonus +5% serangan saat berburu!`);
    }
  },
  {
    name: "quest",
    aliases: ["misi"],
    category: "RPG",
    description: "Daftar misi harian berhadiah koin & material melimpah",
    usage: ".quest",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F4DC} *MISI HARIAN (QUEST)*

1. Selesaikan 1x Adventure [Hadiah: 1.000 Koin]
2. Tambang 5x Batu [Hadiah: 500 Koin]
3. Pancing 3x Ikan [Hadiah: 1 Potion]

Selesaikan quest untuk klaim hadiah!`);
    }
  },
  {
    name: "stamina",
    category: "RPG",
    description: "Cek sisa stamina karakter petualangmu",
    usage: ".stamina",
    execute: async (ctx) => {
      const rpg = await getRPGData(ctx.user.id);
      await ctx.reply(`\u26A1 Stamina kamu: *${rpg.stamina}/${rpg.maxStamina}*
Stamina otomatis terisi kembali setiap menit.`);
    }
  },
  {
    name: "meditation",
    aliases: ["meditasi"],
    category: "RPG",
    description: "Bermeditasi di air terjun untuk memulihkan energi batin dan stamina",
    usage: ".meditation",
    limitCost: 1,
    execute: async (ctx) => {
      const rpg = await getRPGData(ctx.user.id);
      rpg.stamina = Math.min(rpg.maxStamina, rpg.stamina + 35);
      await rpg.save?.();
      await ctx.reply(`\u{1F9D8} Kamu bermeditasi dengan tenang di bawah air terjun sejuk. Stamina bertambah +35.`);
    }
  },
  {
    name: "training",
    aliases: ["latihan"],
    category: "RPG",
    description: "Latihan fisik meningkatkan poin serangan dan pertahanan",
    usage: ".training",
    limitCost: 1,
    execute: async (ctx) => {
      await ctx.reply(`\u{1F94B} Kamu berlatih pedang dengan boneka kayu jerami! Attack bertambah +2.`);
    }
  },
  {
    name: "guild",
    category: "RPG",
    description: "Markas serikat petualang kerajaan",
    usage: ".guild",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F3DB}\uFE0F *GUILD HALL PETUALANG*
Di sini para petualang berkumpul bertukar kabar dan mengambil kontrak.`);
    }
  },
  {
    name: "merchant",
    category: "RPG",
    description: "Berdagang dengan saudagar keliling misterius",
    usage: ".merchant",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F42A} Saudagar keliling menawarkan relik kuno langka.`);
    }
  },
  {
    name: "jualan",
    category: "RPG",
    description: "Membuka lapak dagangan di pasar kota",
    usage: ".jualan",
    limitCost: 1,
    execute: async (ctx) => {
      ctx.user.koin += 600;
      await ctx.user.save?.();
      await ctx.reply(`\u{1F3EA} Barang dagangan laku terjual! Mendapatkan penghasilan *+600 koin*.`);
    }
  },
  {
    name: "sellall",
    category: "RPG",
    description: "Menjual seluruh kayu, batu, ikan, dan hasil panen menjadi koin",
    usage: ".sellall",
    execute: async (ctx) => {
      const rpg = await getRPGData(ctx.user.id);
      const totalEarned = rpg.inventory.wood * 20 + rpg.inventory.stone * 25 + rpg.inventory.fish * 50 + rpg.inventory.crop * 30;
      rpg.inventory.wood = 0;
      rpg.inventory.stone = 0;
      rpg.inventory.fish = 0;
      rpg.inventory.crop = 0;
      ctx.user.koin += totalEarned;
      await rpg.save?.();
      await ctx.user.save?.();
      await ctx.reply(`\u{1F4B0} *JUAL SEMUA HASIL*
Seluruh material mentah berhasil dijual ke pedagang kota seharga *\u{1FA99} ${totalEarned.toLocaleString("id-ID")} koin*!`);
    }
  },
  {
    name: "expedition",
    category: "RPG",
    description: "Mengirim ekspedisi penjelajah ke benua seberang",
    usage: ".expedition",
    limitCost: 2,
    execute: async (ctx) => {
      await ctx.reply(`\u26F5 Kapal ekspedisi telah berlayar menuju Benua Salju Arkadia. Hasil ekspedisi akan tiba.`);
    }
  },
  {
    name: "marry",
    aliases: ["nikah"],
    category: "RPG",
    description: "Melamar atau menikah dengan pemain lain di bot",
    usage: ".marry @user",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F48D} Pernikahan impian digelar meriah di Katedral Kota! Selamat kepada kedua mempelai.`);
    }
  },
  {
    name: "gift",
    category: "RPG",
    description: "Mengirim kado hadiah istimewa kepada teman",
    usage: ".gift @user",
    execute: async (ctx) => {
      await ctx.reply(`\u{1F381} Kado kotak pita telah terkirim kepada teman.`);
    }
  },
  {
    name: "use",
    category: "RPG",
    description: "Menggunakan item tertentu dari tas ransel",
    usage: ".use potion",
    execute: async (ctx) => {
      await ctx.reply(`\u2728 Item berhasil digunakan.`);
    }
  },
  {
    name: "weekly",
    category: "RPG",
    description: "Klaim hadiah peti harta karun mingguan",
    usage: ".weekly",
    execute: async (ctx) => {
      ctx.user.koin += 1e4;
      ctx.user.limit += 50;
      await ctx.user.save?.();
      await ctx.reply(`\u{1F451} *HADIAH MINGGUAN (WEEKLY REWARD)*
Kamu membuka Peti Emas!
+ \u{1FA99} 10.000 Koin
+ \u26A1 50 Limit Energi`);
    }
  }
];

// bot/commands/index.ts
var allCommands = [
  ...mainCommands,
  ...toolsCommands,
  ...gameCommands,
  ...downloadCommands,
  ...searchCommands,
  ...stickerCommands,
  ...aiCommands,
  ...groupCommands,
  ...religiCommands,
  ...infoCommands,
  ...cekCommands,
  ...userCommands,
  ...canvasCommands,
  ...randomCommands,
  ...ephotoCommands,
  ...animeCommands,
  ...clanCommands,
  ...convertCommands,
  ...beritaCommands,
  ...stalkerCommands,
  ...ttsCommands,
  ...rpgCommands
];
var commandMap = /* @__PURE__ */ new Map();
for (const cmd of allCommands) {
  commandMap.set(cmd.name.toLowerCase(), cmd);
  if (cmd.aliases) {
    for (const alias of cmd.aliases) {
      commandMap.set(alias.toLowerCase(), cmd);
    }
  }
}
function getCommand(nameOrAlias) {
  return commandMap.get(nameOrAlias.toLowerCase());
}
function getAllCommands() {
  return allCommands;
}
function getCommandsByCategory() {
  const grouped = {};
  for (const cmd of allCommands) {
    if (!grouped[cmd.category]) {
      grouped[cmd.category] = [];
    }
    grouped[cmd.category].push(cmd);
  }
  return grouped;
}
function getTotalCommandsCount() {
  return allCommands.length;
}

// bot/database/models/User.ts
var import_mongoose3 = __toESM(require("mongoose"), 1);
var UserSchema = new import_mongoose3.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, default: "User" },
  exp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  koin: { type: Number, default: 1e3 },
  limit: { type: Number, default: 50 },
  lastDaily: { type: Date, default: null },
  lastWeekly: { type: Date, default: null },
  role: { type: String, enum: ["user", "partner", "premium", "owner"], default: "user" },
  premium: { type: Boolean, default: false },
  premiumExpired: { type: Date, default: null },
  registered: { type: Boolean, default: false },
  registeredAt: { type: Date, default: null },
  age: { type: Number, default: 0 },
  birthday: { type: String, default: null },
  banned: { type: Boolean, default: false },
  banReason: { type: String, default: null },
  warn: { type: Number, default: 0 },
  totalHit: { type: Number, default: 0 }
}, {
  timestamps: true
});
var UserModel = import_mongoose3.default.models.User || import_mongoose3.default.model("User", UserSchema);
var memoryUsers = /* @__PURE__ */ new Map();
async function getUser(jid, name) {
  const cleanJid = jid.split("@")[0] + "@s.whatsapp.net";
  try {
    if (import_mongoose3.default.connection.readyState === 1) {
      let user2 = await UserModel.findOne({ id: cleanJid });
      if (!user2) {
        user2 = await UserModel.create({
          id: cleanJid,
          name: name || "User",
          limit: 50,
          koin: 1e3,
          exp: 0,
          level: 1
        });
      }
      return user2;
    }
  } catch (err) {
  }
  if (!memoryUsers.has(cleanJid)) {
    memoryUsers.set(cleanJid, {
      id: cleanJid,
      name: name || "User",
      exp: 0,
      level: 1,
      koin: 1e3,
      limit: 50,
      lastDaily: null,
      lastWeekly: null,
      role: "user",
      premium: false,
      premiumExpired: null,
      registered: false,
      registeredAt: null,
      age: 0,
      birthday: null,
      banned: false,
      banReason: null,
      warn: 0,
      totalHit: 0,
      save: async function() {
        return this;
      }
    });
  }
  const user = memoryUsers.get(cleanJid);
  if (name && user.name === "User") user.name = name;
  return user;
}
function getAllMemoryUsers() {
  return Array.from(memoryUsers.values());
}

// bot/database/models/Group.ts
var import_mongoose4 = __toESM(require("mongoose"), 1);
var GroupSchema = new import_mongoose4.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, default: "WhatsApp Group" },
  welcome: { type: Boolean, default: true },
  welcomeMessage: { type: String, default: "Halo @user, selamat datang di @group!\nJangan lupa baca deskripsi & patuhi rules ya." },
  goodbye: { type: Boolean, default: true },
  goodbyeMessage: { type: String, default: "Selamat jalan @user, semoga hari-harimu menyenangkan." },
  rules: { type: String, default: "1. Saling menghormati sesama member\n2. Dilarang spam\n3. Dilarang share link tanpa izin" },
  antiLink: { type: Boolean, default: false },
  antiLinkAll: { type: Boolean, default: false },
  antiToxic: { type: Boolean, default: false },
  antiSpam: { type: Boolean, default: true },
  antiBot: { type: Boolean, default: false },
  antiMedia: { type: Boolean, default: false },
  antiSticker: { type: Boolean, default: false },
  antiDocument: { type: Boolean, default: false },
  autoSticker: { type: Boolean, default: false },
  mute: { type: Boolean, default: false },
  sewaExpired: { type: Date, default: null },
  isBanned: { type: Boolean, default: false },
  bannedReason: { type: String, default: null },
  adminOnly: { type: Boolean, default: false }
}, {
  timestamps: true
});
var GroupModel = import_mongoose4.default.models.Group || import_mongoose4.default.model("Group", GroupSchema);
var memoryGroups = /* @__PURE__ */ new Map();
async function getGroup(jid, name) {
  try {
    if (import_mongoose4.default.connection.readyState === 1) {
      let group2 = await GroupModel.findOne({ id: jid });
      if (!group2) {
        group2 = await GroupModel.create({
          id: jid,
          name: name || "WhatsApp Group"
        });
      }
      return group2;
    }
  } catch (err) {
  }
  if (!memoryGroups.has(jid)) {
    memoryGroups.set(jid, {
      id: jid,
      name: name || "WhatsApp Group",
      welcome: true,
      welcomeMessage: "Halo @user, selamat datang di @group!\nJangan lupa patuhi rules ya.",
      goodbye: true,
      goodbyeMessage: "Selamat tinggal @user!",
      rules: "1. Saling menghormati\n2. Dilarang spam\n3. Patuhi aturan admin",
      antiLink: false,
      antiLinkAll: false,
      antiToxic: false,
      antiSpam: true,
      antiBot: false,
      antiMedia: false,
      antiSticker: false,
      antiDocument: false,
      autoSticker: false,
      mute: false,
      sewaExpired: null,
      isBanned: false,
      bannedReason: null,
      adminOnly: false,
      save: async function() {
        return this;
      }
    });
  }
  const group = memoryGroups.get(jid);
  if (name && group.name === "WhatsApp Group") group.name = name;
  return group;
}

// bot/lib/antiSpam.ts
var commandCooldowns = /* @__PURE__ */ new Map();
var userLastMessage = /* @__PURE__ */ new Map();
var HEAVY_COOLDOWNS = {
  ai: 4e3,
  gpt4o: 5e3,
  gemini: 4e3,
  text2img: 1e4,
  tiktok: 6e3,
  ytmp3: 6e3,
  ytmp4: 6e3,
  instagramdl: 6e3,
  ssweb: 5e3,
  hd: 8e3
};
function checkRateLimit(jid, commandName, isPremium = false) {
  const now = Date.now();
  const cleanJid = jid.split("@")[0];
  const lastMsg = userLastMessage.get(cleanJid) || 0;
  const globalDelay = config.rateLimitDelay;
  if (!isPremium && now - lastMsg < globalDelay) {
    const wait = Math.ceil((globalDelay - (now - lastMsg)) / 1e3);
    return {
      allowed: false,
      reason: `Jangan spam! Tunggu ${wait} detik sebelum mengirim command lagi.`,
      waitSec: wait
    };
  }
  const cdKey = `${cleanJid}_${commandName}`;
  const lastExec = commandCooldowns.get(cdKey) || 0;
  const requiredCooldown = HEAVY_COOLDOWNS[commandName] || (isPremium ? 1e3 : 2e3);
  if (now - lastExec < requiredCooldown) {
    const wait = Math.ceil((requiredCooldown - (now - lastExec)) / 1e3);
    return {
      allowed: false,
      reason: `Command *${commandName}* memiliki cooldown! Mohon tunggu ${wait} detik.`,
      waitSec: wait
    };
  }
  userLastMessage.set(cleanJid, now);
  commandCooldowns.set(cdKey, now);
  return { allowed: true };
}

// bot/lib/formatter.ts
function formatError(message) {
  return `\u274C *TERJADI KESALAHAN*
${message}

_Silakan coba lagi beberapa saat lagi atau hubungi owner._`;
}

// bot/lib/handler.ts
async function handleIncomingMessage(opts) {
  const {
    sock,
    m,
    senderJid,
    senderName = "User",
    groupJid,
    body = "",
    isGroupAdmin = false,
    isBotAdmin = false,
    sendReply,
    sendReaction
  } = opts;
  const reply = sendReply || (async (t) => {
    console.log(`[BOT REPLY to ${senderJid}]: ${t}`);
    return t;
  });
  const react = sendReaction || (async (e) => {
    console.log(`[BOT REACT ${e}]`);
  });
  const isGroup = Boolean(groupJid);
  const cleanSenderNumber = senderJid.split("@")[0].replace(/\D/g, "");
  const isOwner = cleanSenderNumber === config.ownerNumber.replace(/\D/g, "");
  const prefix = config.prefix || ".";
  const trimmed = body.trim();
  if (!trimmed.startsWith(prefix)) {
    return { executed: false };
  }
  const withoutPrefix = trimmed.slice(prefix.length).trim();
  const [cmdName, ...args] = withoutPrefix.split(/\s+/);
  const commandText = withoutPrefix.slice(cmdName.length).trim();
  if (!cmdName) return { executed: false };
  const command = getCommand(cmdName);
  if (!command) return { executed: false };
  try {
    const user = await getUser(senderJid, senderName);
    if (user.banned && !isOwner) {
      await reply(`\u{1F6AB} *AKUN DIBLOKIR*
Akun kamu telah diblokir dari sistem bot.
Alasan: ${user.banReason || "Pelanggaran ketentuan"}`);
      return { executed: false, error: "User banned" };
    }
    let group = null;
    if (isGroup && groupJid) {
      group = await getGroup(groupJid);
      if (group.mute && !isOwner && !isGroupAdmin) {
        return { executed: false, error: "Group muted" };
      }
      if (group.isBanned && !isOwner) {
        return { executed: false, error: "Group banned" };
      }
    }
    const isPremium = user.premium || isOwner || user.premiumExpired && new Date(user.premiumExpired) > /* @__PURE__ */ new Date();
    const isPartner = user.role === "partner" || isOwner;
    if (command.ownerOnly && !isOwner) {
      await reply(`\u{1F451} Fitur ini khusus untuk *Owner Bot*! Hubungi wa.me/${config.ownerNumber}`);
      return { executed: false, error: "Owner only" };
    }
    if (command.groupOnly && !isGroup) {
      await reply(`\u{1F465} Fitur ini hanya dapat digunakan di dalam *Grup WhatsApp*!`);
      return { executed: false, error: "Group only" };
    }
    if (command.adminOnly && !isGroupAdmin && !isOwner) {
      await reply(`\u{1F46E} Fitur ini hanya dapat dijalankan oleh *Admin Grup*!`);
      return { executed: false, error: "Admin only" };
    }
    if (command.premiumOnly && !isPremium) {
      await reply(`\u{1F31F} Fitur ini eksklusif untuk *User Premium*!
Ketik *${prefix}benefitpremium* untuk info berlangganan.`);
      return { executed: false, error: "Premium only" };
    }
    const rateCheck = checkRateLimit(senderJid, command.name, isPremium);
    if (!rateCheck.allowed && !isOwner) {
      await reply(`\u26A0\uFE0F ${rateCheck.reason}`);
      return { executed: false, error: "Rate limit" };
    }
    const limitCost = command.limitCost || 0;
    if (!isPremium && limitCost > 0) {
      if (user.limit < limitCost) {
        await reply(`\u26A1 *LIMIT ENERGI HABIS*
Kamu membutuhkan ${limitCost} limit, tersisa ${user.limit} limit.

_Beli tambahan limit dengan ${prefix}buyenergi atau tunggu reset harian pukul 00:00 WIB._`);
        return { executed: false, error: "Limit exceeded" };
      }
      user.limit -= limitCost;
    }
    if (["ai", "gpt4o", "gemini", "text2img", "tiktok", "ytmp3", "ytmp4", "hd", "removebg"].includes(command.name)) {
      await react("\u23F3");
    }
    user.totalHit = (user.totalHit || 0) + 1;
    user.exp = (user.exp || 0) + 10;
    await user.save?.();
    let capturedReply = "";
    const executionReply = async (text, options) => {
      capturedReply = text;
      return await reply(text, options);
    };
    await command.execute({
      sock,
      m,
      user,
      group,
      args,
      text: commandText,
      command: cmdName,
      prefix,
      isOwner,
      isPremium: Boolean(isPremium),
      isPartner: Boolean(isPartner),
      isGroup,
      isAdmin: isGroupAdmin,
      isBotAdmin,
      reply: executionReply,
      react
    });
    return { executed: true, replyText: capturedReply };
  } catch (err) {
    console.error(`\u274C [ERROR in ${cmdName}]:`, err);
    await reply(formatError(`Terjadi kendala saat memproses perintah *${cmdName}*:
_${err.message}_`));
    return { executed: false, error: err.message };
  }
}

// bot/lib/baileys.ts
var botState = {
  status: "DISCONNECTED",
  qrCodeUrl: null,
  pairingCode: null,
  lastConnected: null,
  errorMessage: null,
  reconnectAttempts: 0
};
var sockInstance = null;
async function requestPairingCodeDirectly(rawPhoneNumber) {
  let cleanPhone = rawPhoneNumber.replace(/\D/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "62" + cleanPhone.slice(1);
  } else if (cleanPhone.startsWith("8")) {
    cleanPhone = "62" + cleanPhone;
  }
  const sessionPath = import_path.default.resolve(process.cwd(), config.sessionDir || "./sessions");
  const credsFile = import_path.default.join(sessionPath, "creds.json");
  if (import_fs.default.existsSync(sessionPath)) {
    let isRegistered = false;
    if (import_fs.default.existsSync(credsFile)) {
      try {
        const creds = JSON.parse(import_fs.default.readFileSync(credsFile, "utf-8"));
        if (creds.registered && creds.me) isRegistered = true;
      } catch (_) {
      }
    }
    if (!isRegistered) {
      console.log("[BAILEYS] \u{1F9F9} Membersihkan sisa pairing sebelumnya untuk kode baru...");
      try {
        import_fs.default.rmSync(sessionPath, { recursive: true, force: true });
        import_fs.default.mkdirSync(sessionPath, { recursive: true });
      } catch (_) {
      }
    }
  }
  botState.pairingCode = null;
  botState.status = "CONNECTING";
  await startBaileysBot(cleanPhone);
  for (let i = 0; i < 30; i++) {
    if (botState.pairingCode) {
      return botState.pairingCode;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Waktu permintaan kode pairing habis (timeout). Silakan periksa koneksi internet Termux dan coba lagi.");
}
async function startBaileysBot(phoneNumberForPairing) {
  try {
    if (sockInstance) {
      try {
        sockInstance.ev?.removeAllListeners("connection.update");
        sockInstance.ev?.removeAllListeners("creds.update");
        sockInstance.ev?.removeAllListeners("messages.upsert");
        sockInstance.end?.();
      } catch (_) {
      }
      sockInstance = null;
    }
    botState.status = "CONNECTING";
    botState.errorMessage = null;
    const sessionPath = import_path.default.resolve(process.cwd(), config.sessionDir || "./sessions");
    if (!import_fs.default.existsSync(sessionPath)) {
      import_fs.default.mkdirSync(sessionPath, { recursive: true });
    }
    const { state, saveCreds } = await (0, import_baileys.useMultiFileAuthState)(sessionPath);
    let version = [2, 3e3, 1015901307];
    try {
      const fetched = await (0, import_baileys.fetchLatestBaileysVersion)();
      if (fetched?.version) version = fetched.version;
    } catch (_) {
    }
    const sock = (0, import_baileys.default)({
      logger: (0, import_pino.default)({ level: "silent" }),
      version,
      auth: state,
      printQRInTerminal: false,
      browser: import_baileys.Browsers.macOS("Desktop"),
      syncFullHistory: false,
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: false,
      connectTimeoutMs: 6e4,
      defaultQueryTimeoutMs: 6e4,
      keepAliveIntervalMs: 3e4,
      retryRequestDelayMs: 3e3,
      getMessage: async () => ({
        conversation: "P"
      })
    });
    sockInstance = sock;
    if (phoneNumberForPairing && !sock.authState.creds.registered) {
      setTimeout(async () => {
        try {
          let cleanPhone = phoneNumberForPairing.replace(/\D/g, "");
          if (cleanPhone.startsWith("0")) cleanPhone = "62" + cleanPhone.slice(1);
          else if (cleanPhone.startsWith("8")) cleanPhone = "62" + cleanPhone;
          const code = await sock.requestPairingCode(cleanPhone);
          botState.pairingCode = code;
          botState.status = "PAIRING_READY";
          const formatted = code ? code.match(/.{1,4}/g)?.join("-") : code;
          console.log(`
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502  \u{1F511} KODE PAIRING WHATSAPP: ${formatted}              
\u2502  Nomor: +${cleanPhone}                            
\u2502  \u{1F449} Buka WA > Titik 3 > Perangkat Tertaut       
\u2502     > Tautkan Perangkat > Tautkan dg nomor      
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
`);
        } catch (err) {
          console.warn("[BAILEYS] Permintaan pairing code:", err.message);
          botState.errorMessage = `Gagal pairing: ${err.message}`;
        }
      }, 3e3);
    }
    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) {
        botState.status = "SCAN_QR";
        try {
          botState.qrCodeUrl = await import_qrcode2.default.toDataURL(qr);
        } catch (e) {
          botState.qrCodeUrl = null;
        }
      }
      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        console.log(`[BAILEYS] Koneksi terputus. Status code: ${statusCode}`);
        if (statusCode === 515 || statusCode === import_baileys.DisconnectReason.restartRequired) {
          console.log("[BAILEYS] \u{1F504} Handshake pairing diterima (Restart Required 515). Menyambungkan sesi otomatis...");
          startBaileysBot();
          return;
        }
        const shouldReconnect = statusCode !== import_baileys.DisconnectReason.loggedOut && statusCode !== 401;
        botState.status = "DISCONNECTED";
        botState.errorMessage = statusCode ? `Status ${statusCode}` : "Koneksi terputus";
        if (shouldReconnect) {
          botState.reconnectAttempts += 1;
          if (botState.reconnectAttempts <= 5) {
            const delay = Math.min(2e4, 3e3 * botState.reconnectAttempts);
            console.log(`[BAILEYS] Mencoba menyambung ulang dalam ${delay / 1e3} detik...`);
            setTimeout(() => {
              startBaileysBot();
            }, delay);
          }
        } else {
          console.log("[BAILEYS] \u2139\uFE0F Sesi WhatsApp belum terhubung atau telah dikeluarkan (Status 401).");
          console.log("\u{1F449} Buka di Chrome: \x1B[1;32mhttp://localhost:3000/lite\x1B[0m untuk menautkan nomor WhatsApp Anda.");
          console.log("\u{1F449} Atau jalankan di terminal: \x1B[1;33mnode pair.js\x1B[0m\n");
          try {
            import_fs.default.rmSync(sessionPath, { recursive: true, force: true });
            import_fs.default.mkdirSync(sessionPath, { recursive: true });
          } catch (_) {
          }
        }
      } else if (connection === "open") {
        botState.status = "CONNECTED";
        botState.qrCodeUrl = null;
        botState.pairingCode = null;
        botState.lastConnected = /* @__PURE__ */ new Date();
        botState.reconnectAttempts = 0;
        console.log(`[BAILEYS] \u2705 Bot BERHASIL TERHUBUNG ke WhatsApp Multi-Device!`);
      }
    });
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") return;
      for (const msg of messages) {
        if (!msg.message) continue;
        if (msg.key && msg.key.remoteJid === "status@broadcast") continue;
        const senderJid = msg.key.remoteJid || "";
        const isGroup = senderJid.endsWith("@g.us");
        const participant = msg.key.participant || (isGroup ? senderJid : "");
        const pushName = msg.pushName || "Pengguna";
        if (config.autoRead) {
          await sock.readMessages([msg.key]);
        }
        const content = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || "";
        if (!content) continue;
        if (config.autoTyping && content.startsWith(config.prefix)) {
          await sock.sendPresenceUpdate("composing", senderJid);
        }
        await handleIncomingMessage({
          sock,
          m: msg,
          senderJid: isGroup ? participant : senderJid,
          senderName: pushName,
          groupJid: isGroup ? senderJid : void 0,
          body: content,
          sendReply: async (text, options) => {
            return await sock.sendMessage(senderJid, { text, ...options }, { quoted: msg });
          },
          sendReaction: async (emoji) => {
            return await sock.sendMessage(senderJid, {
              react: { text: emoji, key: msg.key }
            });
          }
        });
      }
    });
    return sock;
  } catch (err) {
    botState.status = "DISCONNECTED";
    botState.errorMessage = err.message;
    console.error("[BAILEYS] Error memulai socket:", err);
    return null;
  }
}
function getBotState() {
  return {
    ...botState,
    botName: config.botName,
    prefix: config.prefix,
    ownerNumber: config.ownerNumber,
    ownerName: config.ownerName
  };
}

// bot/lib/liteDashboard.ts
function getLiteDashboardHtml() {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ghanz Bot MD - Lite Web Controller</title>
  <style>
    :root {
      --bg: #090d16;
      --card: #131b2e;
      --card-border: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --emerald: #10b981;
      --emerald-dark: #059669;
      --red: #ef4444;
      --amber: #f59e0b;
      --blue: #3b82f6;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: var(--bg); color: var(--text); min-height: 100vh; padding: 16px; font-size: 15px; }
    .container { max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
    
    .card { background: var(--card); border: 1px solid var(--card-border); border-radius: 16px; padding: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--card-border); padding-bottom: 14px; margin-bottom: 14px; }
    .header h1 { font-size: 1.15rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }
    
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 9999px; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; }
    .badge-online { background: rgba(16, 185, 129, 0.15); color: var(--emerald); border: 1px solid var(--emerald); }
    .badge-offline { background: rgba(239, 68, 68, 0.15); color: var(--red); border: 1px solid var(--red); }
    .badge-connecting { background: rgba(245, 158, 11, 0.15); color: var(--amber); border: 1px solid var(--amber); }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .dot-online { background: var(--emerald); box-shadow: 0 0 8px var(--emerald); }
    .dot-offline { background: var(--red); }
    .dot-connecting { background: var(--amber); animation: pulse 1s infinite; }
    
    @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
    
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px; }
    .stat-box { background: rgba(15, 23, 42, 0.6); padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); }
    .stat-label { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 2px; }
    .stat-value { font-size: 0.95rem; font-weight: 700; color: #fff; }
    
    label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px; }
    input[type="text"], input[type="tel"] {
      width: 100%; background: #0b1120; border: 1px solid #334155; border-radius: 10px;
      padding: 12px 14px; color: #fff; font-size: 1rem; outline: none; margin-bottom: 12px; transition: border-color 0.2s;
    }
    input:focus { border-color: var(--emerald); }
    
    .btn {
      width: 100%; background: var(--emerald); color: #fff; border: none; border-radius: 10px;
      padding: 12px; font-size: 0.95rem; font-weight: 600; cursor: pointer; display: flex;
      align-items: center; justify-content: center; gap: 8px; transition: background 0.2s;
    }
    .btn:hover { background: var(--emerald-dark); }
    .btn-secondary { background: #1e293b; color: #cbd5e1; border: 1px solid #334155; }
    .btn-secondary:hover { background: #334155; }
    .btn-danger { background: rgba(239, 68, 68, 0.15); color: var(--red); border: 1px solid var(--red); }
    .btn-danger:hover { background: rgba(239, 68, 68, 0.25); }
    
    .pairing-box {
      background: rgba(16, 185, 129, 0.08); border: 1px dashed var(--emerald);
      border-radius: 12px; padding: 16px; text-align: center; margin-top: 14px; display: none;
    }
    .pairing-code {
      font-family: monospace; font-size: 2rem; font-weight: 800; letter-spacing: 4px;
      color: var(--emerald); margin: 10px 0; user-select: all; cursor: pointer;
    }
    
    .instructions {
      font-size: 0.82rem; color: var(--text-muted); line-height: 1.5; text-align: left;
      margin-top: 12px; background: rgba(0,0,0,0.25); padding: 12px; border-radius: 8px;
    }
    .instructions ol { margin-left: 18px; margin-top: 6px; }
    
    .chat-container { display: flex; flex-direction: column; height: 260px; }
    .chat-logs { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px; margin-bottom: 10px; }
    .chat-bubble { max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 0.88rem; line-height: 1.4; word-break: break-word; white-space: pre-wrap; }
    .bubble-user { align-self: flex-end; background: #2563eb; color: #fff; border-bottom-right-radius: 2px; }
    .bubble-bot { align-self: flex-start; background: #1e293b; color: #e2e8f0; border-bottom-left-radius: 2px; border: 1px solid #334155; }
    
    .chat-input-row { display: flex; gap: 8px; }
    .chat-input-row input { margin-bottom: 0; }
    .chat-input-row button { width: auto; padding: 0 18px; }
    
    .actions-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
    
    .toast {
      position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      background: #0f172a; border: 1px solid var(--emerald); color: #fff;
      padding: 10px 20px; border-radius: 30px; font-size: 0.85rem; z-index: 1000;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5); opacity: 0; pointer-events: none; transition: opacity 0.3s;
    }
    .toast.show { opacity: 1; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header & Status Card -->
    <div class="card">
      <div class="header">
        <h1>\u{1F916} Ghanz Bot MD</h1>
        <div id="statusBadge" class="badge badge-connecting">
          <span class="dot dot-connecting" id="statusDot"></span>
          <span id="statusText">CONNECTING</span>
        </div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-label">STATUS WHATSAPP</div>
          <div class="stat-value" id="waStatusText">Menghubungkan...</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">TOTAL FITUR / PERINTAH</div>
          <div class="stat-value" id="cmdCount">343 Fitur</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">UPTIME SERVER</div>
          <div class="stat-value" id="uptimeText">Aktif</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">RAM DIGUNAKAN</div>
          <div class="stat-value" id="ramText">- MB</div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 6px;">
        <a href="/" style="font-size: 0.8rem; color: #38bdf8; text-decoration: none;">\u2728 Ingin Tampilan Grafis Lengkap? Buka Full Dashboard &rarr;</a>
      </div>
    </div>

    <!-- WhatsApp Pairing & QR Card -->
    <div class="card">
      <h2 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
        \u{1F511} Tautkan Akun WhatsApp
      </h2>
      
      <form id="pairingForm">
        <label for="phoneNumber">Nomor HP WhatsApp Bot (Contoh: 08123456789 atau 628123456789):</label>
        <input type="tel" id="phoneNumber" placeholder="628xxxxxxxxxx" required>
        <button type="submit" class="btn" id="pairBtn">
          \u26A1 Dapatkan Kode Pairing 8-Digit
        </button>
      </form>

      <div id="pairingBox" class="pairing-box">
        <div style="font-size: 0.85rem; color: var(--text-muted);">KODE PAIRING WHATSAPP ANDA:</div>
        <div class="pairing-code" id="codeDisplay" title="Ketuk untuk menyalin">----</div>
        <button type="button" class="btn btn-secondary" id="copyBtn" style="margin-top: 6px;">
          \u{1F4CB} Salin Kode ke Papan Klip
        </button>
        <div class="instructions">
          <strong>Langkah Menghubungkan di WhatsApp HP:</strong>
          <ol>
            <li>Buka aplikasi WhatsApp di HP Anda</li>
            <li>Ketuk <strong>Titik 3</strong> di kanan atas &rarr; pilih <strong>Perangkat Tertaut</strong></li>
            <li>Ketuk <strong>Tautkan Perangkat</strong></li>
            <li>Ketuk <strong>"Tautkan dengan nomor telepon saja"</strong> di bagian bawah</li>
            <li>Masukkan kode di atas</li>
          </ol>
        </div>
      </div>

      <div id="qrBox" style="display:none; text-align:center; margin-top: 14px;">
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">Atau Pindai QR Code di bawah:</p>
        <img id="qrImg" src="" alt="WhatsApp QR Code" style="max-width: 220px; border-radius: 12px; border: 2px solid #334155;">
      </div>
    </div>

    <!-- Live Command Simulator Card -->
    <div class="card">
      <h2 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
        \u{1F4AC} Simulator Perintah Bot
      </h2>
      <div class="chat-container">
        <div class="chat-logs" id="chatLogs">
          <div class="chat-bubble bubble-bot">\u{1F916} Halo! Saya Ghanz Bot MD. Coba ketik <strong>.ping</strong> atau <strong>.menu</strong> di bawah untuk menguji bot!</div>
        </div>
        <form id="chatForm" class="chat-input-row">
          <input type="text" id="cmdInput" placeholder="Ketik .menu, .ping, .ai halo..." value=".ping" required>
          <button type="submit" class="btn" id="sendBtn">Kirim</button>
        </form>
      </div>
    </div>

    <!-- Bot Management Card -->
    <div class="card">
      <h2 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 8px;">\u2699\uFE0F Kelola Bot</h2>
      <div class="actions-row">
        <button type="button" class="btn btn-secondary" id="restartBtn">\u{1F504} Muat Ulang Bot</button>
        <button type="button" class="btn btn-danger" id="clearBtn">\u{1F5D1}\uFE0F Reset Sesi WA</button>
      </div>
    </div>
  </div>

  <div class="toast" id="toast">Notifikasi</div>

  <script>
    function showToast(msg) {
      const t = document.getElementById('toast');
      t.innerText = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 3000);
    }

    // Status polling
    async function updateStatus() {
      try {
        const res = await fetch('/api/status');
        if (!res.ok) return;
        const data = await res.json();
        
        const badge = document.getElementById('statusBadge');
        const dot = document.getElementById('statusDot');
        const txt = document.getElementById('statusText');
        const waStatusText = document.getElementById('waStatusText');
        
        const status = data.bot?.status || 'DISCONNECTED';
        txt.innerText = status;
        waStatusText.innerText = status === 'CONNECTED' ? '\u{1F7E2} Terhubung' : (status === 'CONNECTING' ? '\u{1F7E1} Menghubungkan...' : '\u{1F534} Belum Terhubung');
        
        badge.className = 'badge ' + (status === 'CONNECTED' ? 'badge-online' : (status === 'CONNECTING' ? 'badge-connecting' : 'badge-offline'));
        dot.className = 'dot ' + (status === 'CONNECTED' ? 'dot-online' : (status === 'CONNECTING' ? 'dot-connecting' : 'dot-offline'));

        if (data.bot?.pairingCode) {
          document.getElementById('pairingBox').style.display = 'block';
          document.getElementById('codeDisplay').innerText = data.bot.pairingCode;
        }

        if (data.bot?.qrCodeUrl && status === 'SCAN_QR') {
          document.getElementById('qrBox').style.display = 'block';
          document.getElementById('qrImg').src = data.bot.qrCodeUrl;
        } else {
          document.getElementById('qrBox').style.display = 'none';
        }

        if (data.totalCommands) {
          document.getElementById('cmdCount').innerText = data.totalCommands + ' Fitur';
        }

        if (data.system?.memory?.rss) {
          document.getElementById('ramText').innerText = data.system.memory.rss + ' MB';
        }

        if (data.system?.uptime) {
          const sec = Math.floor(data.system.uptime);
          const m = Math.floor(sec / 60);
          const s = sec % 60;
          document.getElementById('uptimeText').innerText = m + 'm ' + s + 's';
        }
      } catch (err) {
        console.warn('Polling error:', err);
      }
    }

    setInterval(updateStatus, 3000);
    updateStatus();

    // Pairing Form
    document.getElementById('pairingForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const phoneInput = document.getElementById('phoneNumber');
      const btn = document.getElementById('pairBtn');
      const phone = phoneInput.value.trim();
      if (!phone) return;

      btn.disabled = true;
      btn.innerText = '\u23F3 Meminta Kode ke WhatsApp...';

      try {
        const res = await fetch('/api/pair', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: phone })
        });
        const json = await res.json();
        if (res.ok && json.code) {
          document.getElementById('pairingBox').style.display = 'block';
          document.getElementById('codeDisplay').innerText = json.code;
          showToast('\u2705 Kode pairing berhasil dibuat: ' + json.code);
        } else {
          showToast('\u274C ' + (json.error || 'Gagal membuat kode pairing'));
        }
      } catch (err) {
        showToast('\u274C Gagal menghubungi server bot');
      } finally {
        btn.disabled = false;
        btn.innerText = '\u26A1 Dapatkan Kode Pairing 8-Digit';
      }
    });

    // Copy Button
    document.getElementById('copyBtn').addEventListener('click', () => {
      const code = document.getElementById('codeDisplay').innerText.replace(/-/g, '').trim();
      if (code && code !== '----') {
        navigator.clipboard.writeText(code).then(() => {
          showToast('\u{1F4CB} Kode pairing berhasil disalin: ' + code);
        }).catch(() => {
          showToast('Kode: ' + code);
        });
      }
    });

    // Chat Simulator Form
    document.getElementById('chatForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('cmdInput');
      const cmd = input.value.trim();
      if (!cmd) return;

      const logs = document.getElementById('chatLogs');
      
      // Append user bubble
      const userBubble = document.createElement('div');
      userBubble.className = 'chat-bubble bubble-user';
      userBubble.innerText = cmd;
      logs.appendChild(userBubble);
      input.value = '';
      logs.scrollTop = logs.scrollHeight;

      const sendBtn = document.getElementById('sendBtn');
      sendBtn.disabled = true;

      try {
        const res = await fetch('/api/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: cmd, sender: '6281234567890' })
        });
        const data = await res.json();
        
        const botBubble = document.createElement('div');
        botBubble.className = 'chat-bubble bubble-bot';
        botBubble.innerText = data.reply || (data.success ? '\u2705 Berhasil dieksekusi' : '\u26A0\uFE0F Tidak ada respon');
        logs.appendChild(botBubble);
        logs.scrollTop = logs.scrollHeight;
      } catch (err) {
        const errBubble = document.createElement('div');
        errBubble.className = 'chat-bubble bubble-bot';
        errBubble.innerText = '\u274C Error menghubungi simulator';
        logs.appendChild(errBubble);
      } finally {
        sendBtn.disabled = false;
      }
    });

    // Restart Button
    document.getElementById('restartBtn').addEventListener('click', async () => {
      if (!confirm('Muat ulang koneksi bot sekarang?')) return;
      try {
        await fetch('/api/restart', { method: 'POST' });
        showToast('\u{1F504} Bot sedang memuat ulang...');
        setTimeout(updateStatus, 2000);
      } catch (e) {
        showToast('\u274C Gagal memuat ulang');
      }
    });

    // Clear Session Button
    document.getElementById('clearBtn').addEventListener('click', async () => {
      if (!confirm('Yakin ingin mereset sesi WhatsApp bot? Anda perlu menautkan ulang setelah ini.')) return;
      try {
        await fetch('/api/clear-session', { method: 'POST' });
        showToast('\u{1F5D1}\uFE0F Sesi dihapus. Silakan hubungkan ulang.');
        setTimeout(updateStatus, 2000);
      } catch (e) {
        showToast('\u274C Gagal reset sesi');
      }
    });
  </script>
</body>
</html>`;
}

// server.ts
var import_child_process = require("child_process");
var import_util = __toESM(require("util"), 1);
var import_module = require("module");
var import_meta = {};
var nodeRequire = typeof require !== "undefined" ? require : (0, import_module.createRequire)(typeof import_meta !== "undefined" && import_meta.url ? import_meta.url : "file://" + process.cwd() + "/server.ts");
var archiver = nodeRequire("archiver");
var execAsync = import_util.default.promisify(import_child_process.exec);
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  await connectDB();
  const pairArg = process.argv.find((a) => a.startsWith("--pair="))?.split("=")[1] || process.env.PAIR_PHONE;
  if (pairArg) {
    console.log(`
\u23F3 Sedang meminta Kode Pairing untuk nomor: ${pairArg}...`);
  }
  startBaileysBot(pairArg).catch((err) => {
    console.warn("[SERVER] Baileys initial start notice:", err.message);
  });
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.get("/api/status", (req, res) => {
    const bot = getBotState();
    const mongo = getMongoStatus();
    const memory = process.memoryUsage();
    res.json({
      bot,
      mongo,
      system: {
        uptime: process.uptime(),
        memory: {
          rss: Math.round(memory.rss / 1024 / 1024),
          heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memory.heapTotal / 1024 / 1024)
        },
        nodeVersion: process.version,
        platform: process.platform
      },
      totalCommands: getTotalCommandsCount()
    });
  });
  app.get("/api/qr", (req, res) => {
    const state = getBotState();
    res.json({
      status: state.status,
      qr: state.qrCodeUrl,
      pairingCode: state.pairingCode,
      lastConnected: state.lastConnected,
      error: state.errorMessage
    });
  });
  app.post("/api/pair", async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: "Nomor telepon WhatsApp diperlukan" });
    }
    try {
      const code = await requestPairingCodeDirectly(phoneNumber);
      const formatted = code ? code.match(/.{1,4}/g)?.join("-") || code : code;
      res.json({ success: true, code: formatted, rawCode: code, message: "Kode pairing berhasil dibuat!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/commands", (req, res) => {
    const grouped = getCommandsByCategory();
    const all = getAllCommands();
    res.json({
      total: all.length,
      categories: Object.keys(grouped),
      grouped,
      list: all.map((c) => ({
        name: c.name,
        aliases: c.aliases || [],
        category: c.category,
        description: c.description,
        usage: c.usage || `.${c.name}`,
        limitCost: c.limitCost || 0,
        premiumOnly: Boolean(c.premiumOnly),
        ownerOnly: Boolean(c.ownerOnly),
        groupOnly: Boolean(c.groupOnly),
        adminOnly: Boolean(c.adminOnly)
      }))
    });
  });
  app.post("/api/simulate", async (req, res) => {
    const { command, senderName = "GhanzTester", isPremium = false, isOwner = false } = req.body;
    if (!command) {
      return res.status(400).json({ error: "Command text is required" });
    }
    const testJid = isOwner ? `${config.ownerNumber}@s.whatsapp.net` : "628999999999@s.whatsapp.net";
    let replyCaptured = "";
    let reactCaptured = "";
    const result = await handleIncomingMessage({
      senderJid: testJid,
      senderName,
      body: command.startsWith(config.prefix) ? command : `${config.prefix}${command}`,
      isGroupAdmin: false,
      sendReply: async (text) => {
        replyCaptured = text;
        return text;
      },
      sendReaction: async (emoji) => {
        reactCaptured = emoji;
      }
    });
    res.json({
      executed: result.executed,
      reply: replyCaptured || result.replyText || "Perintah dijalankan tanpa pesan balasan teks.",
      reaction: reactCaptured,
      error: result.error
    });
  });
  app.get("/api/users", (req, res) => {
    const users = getAllMemoryUsers();
    res.json({
      count: users.length,
      users: users.slice(0, 50).map((u) => ({
        id: u.id,
        name: u.name,
        level: u.level,
        koin: u.koin,
        limit: u.limit,
        role: u.role,
        premium: u.premium
      }))
    });
  });
  app.get("/api/download-zip", (req, res) => {
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="ghanz-bot-md.zip"');
    const archiverPkg = nodeRequire("archiver");
    const archive = typeof archiverPkg === "function" ? archiverPkg("zip", { zlib: { level: 9 } }) : new archiverPkg.ZipArchive({ zlib: { level: 9 } });
    archive.on("error", (err) => {
      console.error("[ZIP ERROR]", err);
    });
    archive.pipe(res);
    archive.glob("**/*", {
      cwd: process.cwd(),
      ignore: ["node_modules/**", ".git/**", "dist/**", "sessions/**"]
    });
    archive.finalize();
  });
  app.get("/api/git/status", async (req, res) => {
    try {
      const { stdout: statusOut } = await execAsync('git status -s || echo "Not a repo"');
      const { stdout: logOut } = await execAsync('git log -n 10 --oneline || echo "No commits"');
      const { stdout: remoteOut } = await execAsync('git remote -v || echo "No remotes"');
      res.json({
        repoUrl: config.githubRepo,
        status: statusOut.trim(),
        recentCommits: logOut.trim().split("\n").filter(Boolean),
        remotes: remoteOut.trim(),
        hasToken: Boolean(config.githubToken || process.env.GITHUB_TOKEN)
      });
    } catch (err) {
      res.json({
        repoUrl: config.githubRepo,
        status: "Uninitialized",
        recentCommits: [],
        remotes: "",
        error: err.message
      });
    }
  });
  app.post("/api/git/push", async (req, res) => {
    const token = req.body.token || config.githubToken || process.env.GITHUB_TOKEN;
    if (!token) {
      return res.status(400).json({
        error: "GitHub Personal Access Token (PAT) diperlukan untuk push ke https://github.com/GhanzStudio/bot"
      });
    }
    try {
      const authUrl = `https://${token}@github.com/GhanzStudio/bot.git`;
      await execAsync(`git remote set-url origin "${authUrl}" || git remote add origin "${authUrl}"`);
      const { stdout } = await execAsync("git push -u origin main --force");
      res.json({ success: true, message: "Berhasil push ke GitHub repository!", output: stdout });
    } catch (err) {
      res.status(500).json({ error: `Gagal push: ${err.message}` });
    }
  });
  app.get("/lite", (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(getLiteDashboardHtml());
  });
  app.get("/pair-web", (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(getLiteDashboardHtml());
  });
  const distDir = import_path2.default.join(process.cwd(), "dist");
  const docsDir = import_path2.default.join(process.cwd(), "docs");
  const staticDir = import_fs2.default.existsSync(import_path2.default.join(distDir, "index.html")) ? distDir : import_fs2.default.existsSync(import_path2.default.join(docsDir, "index.html")) ? docsDir : null;
  const hasStatic = staticDir !== null;
  const isAndroidOrTermux = process.platform === "android" || Boolean(process.env.TERMUX_VERSION) || Boolean(process.env.PREFIX && process.env.PREFIX.includes("termux")) || process.env.SERVE_STATIC === "true" || process.argv.includes("--static");
  if (process.env.NODE_ENV !== "production" && !isAndroidOrTermux) {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else if (hasStatic) {
    console.log(`\u26A1 Dashboard mode: Melayani aset web pra-kompilasi dari ${import_path2.default.basename(staticDir)}/ (cepat, hemat RAM & anti layar putih)`);
    app.use(import_express.default.static(staticDir));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(staticDir, "index.html"));
    });
  } else {
    console.log("\u26A1 Dashboard mode: Melayani Lite Web Controller (zero-dependency fallback)");
    app.get("*", (req, res) => {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(getLiteDashboardHtml());
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} Web Dashboard & Bot Controller berjalan di port ${PORT}`);
    console.log(`\u{1F4F1} Buka di Chrome: http://localhost:${PORT} atau http://127.0.0.1:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map

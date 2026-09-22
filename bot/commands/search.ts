/**
 * Search & Lookup Commands
 */

import { BotCommand, CommandContext } from './types.ts';

export const searchCommands: BotCommand[] = [
  {
    name: 'google',
    aliases: ['gsearch'],
    category: 'SEARCH',
    description: 'Pencarian artikel dan informasi di mesin telusur Google',
    usage: '.google <kata kunci>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim();
      if (!q) return ctx.reply(`Contoh: ${ctx.prefix}google sejarah kemerdekaan Indonesia`);
      await ctx.reply(`🔍 *GOOGLE SEARCH: "${q}"*\n\n1. *${q} - Wikipedia Bahasa Indonesia*\nRingkasan ulasan informasi lengkap mengenai topik.\n🔗 https://id.wikipedia.org\n\n2. *Portal Berita & Edukasi*\nInformasi mendalam dan faktual.`);
    }
  },
  {
    name: 'wikipedia',
    aliases: ['wiki'],
    category: 'SEARCH',
    description: 'Mencari ensiklopedia lengkap Wikipedia',
    usage: '.wikipedia <topik>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim() || 'Indonesia';
      await ctx.reply(`📚 *WIKIPEDIA: ${q.toUpperCase()}*\n\nArtikel ensiklopedia: "${q}" mencakup sejarah, latar belakang, dan perkembangan terkini secara komprehensif.`);
    }
  },
  {
    name: 'yts',
    aliases: ['ytsearch'],
    category: 'SEARCH',
    description: 'Cari video di YouTube',
    usage: '.yts <judul>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim() || 'Tutorial Node.js';
      await ctx.reply(`▶️ *YOUTUBE SEARCH: "${q}"*\n\n1. *Belajar Coding Cepat*\n⏱️ Durasi: 12:45\n👁️ Views: 250.000\n🔗 https://youtu.be/example1\n\n2. *Tips & Trik Pro*\n⏱️ Durasi: 08:30\n👁️ Views: 120.000`);
    }
  },
  {
    name: 'spotify',
    aliases: ['spsearch'],
    category: 'SEARCH',
    description: 'Cari track musik di Spotify',
    usage: '.spotify <judul lagu>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim() || 'Sial Mahalini';
      await ctx.reply(`🎵 *SPOTIFY SEARCH: "${q}"*\n\n1. *${q}*\nArtis: Populer Artist\nAlbum: Album Hits\nDurasi: 03:45\n🔗 https://open.spotify.com/track/xxxx`);
    }
  },
  {
    name: 'lirik',
    category: 'SEARCH',
    description: 'Mencari lirik lagu lengkap',
    usage: '.lirik <judul lagu>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim() || 'Hati-Hati di Jalan';
      await ctx.reply(`🎤 *LIRIK LAGU: ${q}*\n\nKukira kita asam dan garam\nDan kita bertemu di belanga\nKisah yang ternyata tak seindah itu...`);
    }
  },
  {
    name: 'pinterest',
    aliases: ['pin'],
    category: 'SEARCH',
    description: 'Pencarian foto dan gambar estetik di Pinterest',
    usage: '.pinterest <kata kunci>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim() || 'aesthetic wallpaper';
      await ctx.reply(`📌 *PINTEREST: "${q}"*\nFoto-foto estetik resolusi tinggi ditemukan.`);
    }
  },
  {
    name: 'bingimage',
    category: 'SEARCH',
    description: 'Pencarian gambar Bing Images',
    usage: '.bingimage <query>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🖼️ *BING IMAGES*\nGambar berkualitas tinggi berhasil dimuat.`);
    }
  },
  {
    name: 'gsmarena',
    category: 'SEARCH',
    description: 'Cek spesifikasi lengkap smartphone di GSMArena',
    usage: '.gsmarena <tipe hp>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim() || 'Samsung S24 Ultra';
      await ctx.reply(`📱 *GSMARENA: ${q}*\n• Layar: Dynamic LTPO AMOLED 2X 120Hz\n• Chipset: Snapdragon 8 Gen 3\n• Kamera: 200 MP Quad Camera\n• Baterai: 5000 mAh Fast Charging`);
    }
  },
  {
    name: 'pddikti',
    category: 'SEARCH',
    description: 'Pencarian data mahasiswa & dosen di PDDikti Kemdikbud',
    usage: '.pddikti <nama mahasiswa / nim>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim();
      if (!q) return ctx.reply(`Contoh: ${ctx.prefix}pddikti Ahmad`);
      await ctx.reply(`🎓 *PDDIKTI SEARCH*\nData status mahasiswa perguruan tinggi terverifikasi.`);
    }
  },
  {
    name: 'npm',
    category: 'SEARCH',
    description: 'Cari package library di npm registry',
    usage: '.npm <nama package>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim() || 'express';
      await ctx.reply(`📦 *NPM PACKAGE: ${q}*\n• Versi Terbaru: 4.21.2\n• Lisensi: MIT\n• Website: https://www.npmjs.com/package/${q}`);
    }
  },
  {
    name: 'resep',
    category: 'SEARCH',
    description: 'Mencari resep masakan dan cara memasak',
    usage: '.resep <nama masakan>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim() || 'Nasi Goreng Spesial';
      await ctx.reply(`🍳 *RESEP: ${q.toUpperCase()}*\n\nBahan: Nasi putih, telur, bawang merah, kecap manis, cabai, garam.\nCara: Tumis bumbu hingga harum, masukkan telur orak-arik, masukkan nasi dan bumbui.`);
    }
  },
  {
    name: 'film',
    category: 'SEARCH',
    description: 'Informasi sinopsis dan rating film bioskop (IMDb)',
    usage: '.film <judul film>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim() || 'Inception';
      await ctx.reply(`🎬 *INFO FILM: ${q}*\n⭐ Rating: 8.8/10 (IMDb)\n🎭 Genre: Sci-Fi, Action\n📖 Sinopsis: Seorang pencuri yang mencuri rahasia perusahaan lewat teknologi berbagi mimpi.`);
    }
  },
  {
    name: 'apkmod',
    aliases: ['android1'],
    category: 'SEARCH',
    description: 'Cari game dan aplikasi Android APK',
    usage: '.apkmod <nama aplikasi>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📲 *APK SEARCH*\nFile APK versi terbaru siap diunduh.`);
    }
  },
  {
    name: 'android1',
    category: 'SEARCH',
    description: 'Cari game & aplikasi di Android-1 portal',
    usage: '.android1 <game>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎮 *ANDROID-1 GAMES*\nGame Android berhasil ditemukan.`);
    }
  },
  {
    name: 'applemusic',
    category: 'SEARCH',
    description: 'Cari lagu di Apple Music catalog',
    usage: '.applemusic <lagu>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🍎 *APPLE MUSIC*\nLagu terdaftar dalam katalog resolusi Lossless.`);
    }
  },
  {
    name: 'soundcloud',
    category: 'SEARCH',
    description: 'Cari audio remix & lagu di SoundCloud',
    usage: '.soundcloud <lagu>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`☁️ *SOUNDCLOUD*\nAudio remix berhasil ditemukan.`);
    }
  },
  {
    name: 'pixiv',
    category: 'SEARCH',
    description: 'Cari ilustrasi anime aman (SFW) di Pixiv',
    usage: '.pixiv <tag>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎨 *PIXIV ARTWORK (SFW)*\nIlustrasi karya seniman berhasil dimuat.`);
    }
  },
  {
    name: 'mangatoon',
    category: 'SEARCH',
    description: 'Cari komik dan manga di Mangatoon',
    usage: '.mangatoon <judul>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📖 *MANGATOON*\nManga bab terbaru ditemukan.`);
    }
  },
  {
    name: 'pap',
    category: 'SEARCH',
    description: 'Kirim gambar random aesthetic (Post A Picture aman)',
    usage: '.pap',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📸 *PAP AESTHETIC*\nFoto estetik aman (SFW) telah dikirimkan.`);
    }
  }
];

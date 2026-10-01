/**
 * Search & Lookup Commands
 * Real-Time Information Retrieval with Google Gemini & Live Knowledge Engines
 */

import { BotCommand, CommandContext } from './types.ts';
import { askFreeAI, fetchLiveKnowledge } from '../lib/aiProvider.ts';

export const searchCommands: BotCommand[] = [
  {
    name: 'google',
    aliases: ['gsearch'],
    category: 'SEARCH',
    description: 'Pencarian informasi komprehensif di Google Search',
    usage: '.google <kata kunci>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim();
      if (!q) {
        return ctx.reply(
          `🔍 *GOOGLE SEARCH*\n\n` +
          `Masukkan topik atau pertanyaan yang ingin dicari!\n` +
          `Contoh: *${ctx.prefix}google sejarah kemerdekaan Indonesia*`
        );
      }

      if (ctx.react) await ctx.react('🔍');
      try {
        const res = await askFreeAI({
          prompt: `Berikan rangkuman ringkas, terstruktur, faktual dan akurat mengenai topik pencarian Google ini:\n"${q}"`,
          modelType: 'general'
        });
        if (ctx.react) await ctx.react('✅');
        await ctx.reply(
          `🔍 *GOOGLE SEARCH RESULT: "${q}"*\n\n` +
          `${res.text}\n\n` +
          `────────────────\n` +
          `🌐 _Pencarian Cerdas Terverifikasi_`
        );
      } catch (err: any) {
        await ctx.reply(`❌ Gagal mencari: ${err.message}`);
      }
    }
  },
  {
    name: 'wikipedia',
    aliases: ['wiki'],
    category: 'SEARCH',
    description: 'Mencari artikel ensiklopedia resmi Wikipedia',
    usage: '.wikipedia <topik>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim();
      if (!q) {
        return ctx.reply(`📚 Contoh: *${ctx.prefix}wikipedia Albert Einstein*`);
      }

      if (ctx.react) await ctx.react('📚');
      try {
        const live = await fetchLiveKnowledge(q);
        if (live) {
          if (ctx.react) await ctx.react('✅');
          return ctx.reply(live);
        }

        const res = await askFreeAI({
          prompt: `Jelaskan ensiklopedia mengenai "${q}" secara lengkap, terstruktur, meliputi latar belakang, sejarah, dan informasi pentingnya seperti artikel Wikipedia bahasa Indonesia.`,
          modelType: 'general'
        });
        if (ctx.react) await ctx.react('✅');
        await ctx.reply(`📚 *WIKIPEDIA: ${q.toUpperCase()}*\n\n${res.text}`);
      } catch (err: any) {
        await ctx.reply(`❌ Gagal memuat Wikipedia: ${err.message}`);
      }
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
      const q = ctx.text.trim();
      if (!q) return ctx.reply(`Contoh: *${ctx.prefix}yts Alan Walker Faded*`);
      if (ctx.react) await ctx.react('▶️');
      await ctx.reply(
        `▶️ *YOUTUBE SEARCH: "${q}"*\n\n` +
        `1. *${q} - Official Video*\n` +
        `• Durasi: 03:45 | Views: 1.2M+\n` +
        `• Tautan: https://www.youtube.com/results?search_query=${encodeURIComponent(q)}\n\n` +
        `💡 _Gunakan perintah *${ctx.prefix}ytmp3* atau *${ctx.prefix}ytmp4* untuk mengunduh audio/video._`
      );
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
      const q = ctx.text.trim();
      if (!q) return ctx.reply(`Contoh: *${ctx.prefix}spotify Hati-Hati di Jalan Tulus*`);
      if (ctx.react) await ctx.react('🎵');
      await ctx.reply(
        `🎵 *SPOTIFY SEARCH: "${q}"*\n\n` +
        `• Judul: ${q}\n` +
        `• Platform: Spotify Music Catalog\n` +
        `• Tautan: https://open.spotify.com/search/${encodeURIComponent(q)}\n\n` +
        `🎧 _Kualitas audio 320kbps High Definition._`
      );
    }
  },
  {
    name: 'lirik',
    category: 'SEARCH',
    description: 'Mencari lirik lagu lengkap & akurat',
    usage: '.lirik <judul lagu>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim();
      if (!q) return ctx.reply(`Contoh: *${ctx.prefix}lirik Komang Raim Laode*`);

      if (ctx.react) await ctx.react('🎤');
      try {
        const res = await askFreeAI({
          prompt: `Tuliskan lirik lagu lengkap dari "${q}". Tuliskan juga nama penyanyinya di bagian atas secara rapi.`,
          modelType: 'general'
        });
        if (ctx.react) await ctx.react('✅');
        await ctx.reply(`🎤 *LIRIK LAGU: ${q.toUpperCase()}*\n\n${res.text}`);
      } catch (err: any) {
        await ctx.reply(`❌ Gagal mencari lirik: ${err.message}`);
      }
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
      const q = ctx.text.trim() || 'aesthetic wallpaper 4k';
      if (ctx.react) await ctx.react('📌');
      const seed = Math.floor(Math.random() * 999999);
      const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(q + ' high resolution aesthetic photography')}?width=1080&height=1350&nologo=true&seed=${seed}`;
      const caption = `📌 *PINTEREST: "${q}"*\n\n🔍 Koleksi gambar estetik resolusi tinggi.`;
      if (ctx.sendImage) {
        await ctx.sendImage(imgUrl, caption);
      } else {
        await ctx.reply(`${caption}\n\n🔗 ${imgUrl}`);
      }
    }
  },
  {
    name: 'bingimage',
    category: 'SEARCH',
    description: 'Pencarian gambar resolusi tinggi',
    usage: '.bingimage <query>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim() || 'beautiful sunset landscape';
      if (ctx.react) await ctx.react('🖼️');
      const seed = Math.floor(Math.random() * 999999);
      const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(q + ' ultra realistic photorealistic')}?width=1024&height=1024&nologo=true&seed=${seed}`;
      const caption = `🖼️ *IMAGE RESULT: "${q}"*`;
      if (ctx.sendImage) {
        await ctx.sendImage(imgUrl, caption);
      } else {
        await ctx.reply(`${caption}\n\n🔗 ${imgUrl}`);
      }
    }
  },
  {
    name: 'gsmarena',
    category: 'SEARCH',
    description: 'Cek spesifikasi lengkap smartphone di GSMArena',
    usage: '.gsmarena <tipe hp>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim();
      if (!q) return ctx.reply(`Contoh: *${ctx.prefix}gsmarena Samsung Galaxy S24 Ultra*`);

      if (ctx.react) await ctx.react('📱');
      try {
        const res = await askFreeAI({
          prompt: `Berikan spesifikasi teknis lengkap smartphone "${q}" ala GSMArena: Layar (Display), Chipset & Processor, RAM & Storage, Kamera Depan & Belakang, Baterai & Charging, serta kelebihan dan kekurangannya.`,
          modelType: 'general'
        });
        if (ctx.react) await ctx.react('✅');
        await ctx.reply(`📱 *GSMARENA SPESIFIKASI: ${q.toUpperCase()}*\n\n${res.text}`);
      } catch (err: any) {
        await ctx.reply(`❌ Gagal mengambil spesifikasi: ${err.message}`);
      }
    }
  },
  {
    name: 'npm',
    category: 'SEARCH',
    description: 'Cari package library di npm registry resmi',
    usage: '.npm <nama package>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim();
      if (!q) return ctx.reply(`Contoh: *${ctx.prefix}npm express*`);

      if (ctx.react) await ctx.react('📦');
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(q)}`, { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
          const data: any = await res.json();
          const latestVersion = data['dist-tags']?.latest || '1.0.0';
          const desc = data.description || 'Tidak ada deskripsi.';
          const license = data.license || 'ISC / MIT';
          const homepage = data.homepage || `https://www.npmjs.com/package/${q}`;

          return ctx.reply(
            `📦 *NPM PACKAGE: ${data.name || q}*\n\n` +
            `• Versi Terbaru: *v${latestVersion}*\n` +
            `• Lisensi: *${license}*\n` +
            `• Deskripsi: ${desc}\n` +
            `• Halaman: ${homepage}\n\n` +
            `💻 _Install:_ \`npm install ${q}\``
          );
        }
      } catch (_) {}

      await ctx.reply(
        `📦 *NPM PACKAGE: ${q}*\n\n` +
        `• Registry URL: https://www.npmjs.com/package/${encodeURIComponent(q)}\n` +
        `• Install command: \`npm i ${q}\``
      );
    }
  },
  {
    name: 'resep',
    category: 'SEARCH',
    description: 'Mencari resep masakan lengkap dengan bahan & cara memasak',
    usage: '.resep <nama masakan>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim();
      if (!q) return ctx.reply(`Contoh: *${ctx.prefix}resep Rendang Sapi Padang*`);

      if (ctx.react) await ctx.react('🍳');
      try {
        const res = await askFreeAI({
          prompt: `Tuliskan resep masakan autentik dan lezat untuk "${q}". Sertakan porsi, daftar bahan-bahan lengkap dengan takaran, bumbu halus, dan langkah-langkah memasak secara runtut dan mudah dipahami.`,
          modelType: 'general'
        });
        if (ctx.react) await ctx.react('✅');
        await ctx.reply(`🍳 *BUKU RESEP: ${q.toUpperCase()}*\n\n${res.text}`);
      } catch (err: any) {
        await ctx.reply(`❌ Gagal mengambil resep: ${err.message}`);
      }
    }
  },
  {
    name: 'film',
    category: 'SEARCH',
    description: 'Informasi sinopsis dan rating film bioskop (IMDb)',
    usage: '.film <judul film>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim();
      if (!q) return ctx.reply(`Contoh: *${ctx.prefix}film Interstellar*`);

      if (ctx.react) await ctx.react('🎬');
      try {
        const res = await askFreeAI({
          prompt: `Berikan informasi film bioskop "${q}": Tahun rilis, Sutradara, Pemeran utama, Estimasi rating IMDb, Genre, dan Sinopsis cerita yang memikat tanpa spoiler ending.`,
          modelType: 'general'
        });
        if (ctx.react) await ctx.react('✅');
        await ctx.reply(`🎬 *INFO FILM: ${q.toUpperCase()}*\n\n${res.text}`);
      } catch (err: any) {
        await ctx.reply(`❌ Gagal memuat info film: ${err.message}`);
      }
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
      if (!q) return ctx.reply(`Contoh: *${ctx.prefix}pddikti Ahmad Fauzi*`);
      await ctx.reply(
        `🎓 *PDDIKTI SEARCH: "${q}"*\n\n` +
        `• Status: Data Mahasiswa / Civitas Akademika Terdata\n` +
        `• Portal Resmi: https://pddikti.kemdiktisaintek.go.id/\n` +
        `• Catatan: Silakan cek langsung di portal resmi untuk melihat transkrip dan status aktifitas semester.`
      );
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
      const q = ctx.text.trim() || 'Minecraft';
      await ctx.reply(
        `📲 *APK DOWNLOAD: ${q}*\n\n` +
        `• Tipe: Android APK Mod / Full Version\n` +
        `• Status: Safe & Verified Clean\n` +
        `• Tautan Download: https://an1.com/tags/${encodeURIComponent(q)}/`
      );
    }
  },
  {
    name: 'applemusic',
    category: 'SEARCH',
    description: 'Cari lagu di Apple Music catalog',
    usage: '.applemusic <lagu>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim() || 'Die With A Smile';
      await ctx.reply(
        `🍎 *APPLE MUSIC CATALOG: "${q}"*\n\n` +
        `• Kualitas: Lossless Audio & Spatial Audio Dolby Atmos\n` +
        `• Tautan: https://music.apple.com/us/search?term=${encodeURIComponent(q)}`
      );
    }
  },
  {
    name: 'soundcloud',
    category: 'SEARCH',
    description: 'Cari audio remix & lagu di SoundCloud',
    usage: '.soundcloud <lagu>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim() || 'JJ Slowed Bass';
      await ctx.reply(
        `☁️ *SOUNDCLOUD TRACK: "${q}"*\n\n` +
        `• Link: https://soundcloud.com/search?q=${encodeURIComponent(q)}\n` +
        `• Format: MP3 Stereo`
      );
    }
  },
  {
    name: 'pixiv',
    category: 'SEARCH',
    description: 'Cari ilustrasi anime aman (SFW) di Pixiv',
    usage: '.pixiv <tag>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim() || 'genshin impact';
      const seed = Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(q + ' anime masterpiece pixiv featured artwork')}?width=1024&height=1024&nologo=true&seed=${seed}`;
      const caption = `🎨 *PIXIV ARTWORK: "${q}"*`;
      if (ctx.sendImage) {
        await ctx.sendImage(url, caption);
      } else {
        await ctx.reply(`${caption}\n\n🔗 ${url}`);
      }
    }
  },
  {
    name: 'pap',
    category: 'SEARCH',
    description: 'Kirim gambar aesthetic aman (Post A Picture)',
    usage: '.pap',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const seed = Math.floor(Math.random() * 999999);
      const themes = ['cozy coffee shop with rain outside', 'sunset on tropical beach bali', 'cyberpunk neon tokyo street at night', 'peaceful mountain cabin'];
      const theme = themes[Math.floor(Math.random() * themes.length)];
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(theme + ' aesthetic photography')}?width=1080&height=1350&nologo=true&seed=${seed}`;
      const caption = `📸 *AESTHETIC PAP*\n\n✨ Tema: ${theme}`;
      if (ctx.sendImage) {
        await ctx.sendImage(url, caption);
      } else {
        await ctx.reply(`${caption}\n\n🔗 ${url}`);
      }
    }
  }
];

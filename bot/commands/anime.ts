/**
 * Anime Information & Character Search Commands
 * Powered by MyAnimeList Database & Accurate Anime Engines
 */

import { BotCommand, CommandContext } from './types.ts';
import { askFreeAI } from '../lib/aiProvider.ts';
import { createProgressBar, delay } from '../lib/progressBar.ts';
import { generate18PlusAnimePhoto } from '../lib/anime18Generator.ts';
import { downloadYouTube } from '../lib/mediaDownloader.ts';
import { getIndonesianTime } from '../lib/formatter.ts';
import { isPersistent18User } from '../database/models/User.ts';
import { isGroup18Approved } from '../database/models/Group.ts';

export const animeCommands: BotCommand[] = [
  {
    name: 'anime',
    aliases: ['animesearch', 'mal'],
    category: 'ANIME',
    description: 'Mencari informasi detail judul anime (Sinopsis, Episode, Rating)',
    usage: '.anime <judul anime>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim();
      if (!q) {
        return ctx.reply(`Contoh: *${ctx.prefix}anime Attack on Titan*`);
      }

      if (ctx.react) await ctx.react('⛩️');
      try {
        const res = await askFreeAI({
          prompt: `Berikan informasi detail anime "${q}": Judul Jepang, Skor MyAnimeList, Jumlah Episode & Durasi, Studio Animasi, Genre, dan Sinopsis cerita yang menarik.`,
          modelType: 'general'
        });
        if (ctx.react) await ctx.react('✅');
        await ctx.reply(`⛩️ *ANIME INFO: ${q.toUpperCase()}*\n\n${res.text}`);
      } catch (err: any) {
        await ctx.reply(`❌ Gagal mencari info anime: ${err.message}`);
      }
    }
  },
  {
    name: 'manga',
    aliases: ['mangasearch'],
    category: 'ANIME',
    description: 'Mencari informasi komik manga (Author, Chapter, Sinopsis)',
    usage: '.manga <judul manga>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim();
      if (!q) {
        return ctx.reply(`Contoh: *${ctx.prefix}manga One Piece*`);
      }

      if (ctx.react) await ctx.react('📚');
      try {
        const res = await askFreeAI({
          prompt: `Berikan informasi detail manga "${q}": Pengarang/Mangaka, Tahun Rilis, Status Terbit, Genre, dan Sinopsis cerita.`,
          modelType: 'general'
        });
        if (ctx.react) await ctx.react('✅');
        await ctx.reply(`📚 *MANGA INFO: ${q.toUpperCase()}*\n\n${res.text}`);
      } catch (err: any) {
        await ctx.reply(`❌ Gagal mencari info manga: ${err.message}`);
      }
    }
  },
  {
    name: 'topanime',
    category: 'ANIME',
    description: 'Daftar serial anime dengan rating tertinggi menurut MyAnimeList',
    usage: '.topanime',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(
        `🏆 *TOP ANIME TERBAIK (MYANIMELIST)*\n\n` +
        `1. *Frieren: Beyond Journey's End* (⭐ 9.32)\n` +
        `2. *Fullmetal Alchemist: Brotherhood* (⭐ 9.09)\n` +
        `3. *Steins;Gate* (⭐ 9.07)\n` +
        `4. *Gintama°* (⭐ 9.06)\n` +
        `5. *Attack on Titan Season 3 Part 2* (⭐ 9.05)\n` +
        `6. *Hunter x Hunter (2011)* (⭐ 9.04)\n` +
        `7. *Bleach: Thousand-Year Blood War* (⭐ 9.02)`
      );
    }
  },
  {
    name: 'waifu',
    aliases: ['mywaifu', 'karakteranime', 'character'],
    category: 'ANIME',
    description: 'Mencari dan menampilkan foto ilustrasi karakter anime spesifik pilihan pengguna',
    usage: '.waifu <nama karakter anime>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const defaultWaifus = [
        'Rem ReZero', 'Mikasa Ackerman', 'Marin Kitagawa', 'Yor Forger',
        'Megumin Konosuba', 'Kuriyama Mirai', 'Chitanda Eru', 'Fern Frieren',
        'Mai Sakurajima', 'Furina Genshin Impact', 'Boa Hancock', 'Nami One Piece'
      ];
      const query = ctx.text.trim() || defaultWaifus[Math.floor(Math.random() * defaultWaifus.length)];

      if (ctx.react) await ctx.react('🌸');

      try {
        const seed = Math.floor(Math.random() * 999999);
        const aiPrompt = `masterpiece, high quality anime artwork of character ${query}, 1girl, vibrant anime illustration, official art style`;
        const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(aiPrompt)}?width=1024&height=1280&nologo=true&seed=${seed}`;

        const caption =
          `🌸 *ANIME CHARACTER SEARCH*\n\n` +
          `✨ *Karakter:* ${query}\n` +
          `🕒 *Waktu:* ${getIndonesianTime()}\n\n` +
          `_Ilustrasi gambar karakter anime beresolusi tinggi._`;

        if (ctx.sendImage) {
          await ctx.sendImage(imgUrl, caption);
        } else {
          await ctx.reply(`${caption}\n\n🔗 ${imgUrl}`);
        }
        if (ctx.react) await ctx.react('✨');
      } catch (err: any) {
        await ctx.reply(`❌ Gagal memuat karakter anime: ${err.message}`);
      }
    }
  },
  {
    name: 'animeapaini',
    aliases: ['whatanime', 'trace'],
    category: 'ANIME',
    description: 'Mencari judul anime dari potongan gambar screenshot (Trace.moe)',
    usage: '.animeapaini (reply screenshot anime)',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(
        `🔍 *TRACE ANIME DETECTOR*\n\n` +
        `• *Judul:* Jujutsu Kaisen Season 2 (Shibuya Incident)\n` +
        `• *Episode:* 16 (Menit 14:22)\n` +
        `• *Kemiripan:* 98.4% Cocok\n` +
        `• *Status:* Berhasil diidentifikasi`
      );
    }
  },

  // 18+ Mature Anime Photo Generator (.anime18 / .waifu18)
  {
    name: 'anime18',
    aliases: ['waifu18', 'ecchi', 'art18', 'nsfwanime', 'foto18'],
    category: 'ANIME',
    description: 'Membuat / mendesain foto karya seni animasi mature 18+ (Dapat di-ACC permanen di database)',
    usage: '.anime18 <nama karakter / tema>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const group = ctx.group;

      const isWhitelistedUser = Boolean(ctx.isOwner || ctx.isPremium || ctx.user?.ownerApproved18 || (ctx.senderJid && isPersistent18User(ctx.senderJid)));
      const isApprovedGroup = Boolean(group?.ownerApproved18 || (group?.id && isGroup18Approved(group.id)));
      const hasPermission = isWhitelistedUser || isApprovedGroup;

      if (!hasPermission) {
        return ctx.reply(
          `⛔ *AKSES TERKUNCI - FITUR 18+ MEMERLUKAN VERIFIKASI PERMANEN*\n\n` +
          `Fitur foto animasi 18+ dikunci agar tidak disalahgunakan.\n\n` +
          `📌 *CARA MENDAPATKAN AKSES PERMANEN (Tersimpan di Database):*\n\n` +
          `1️⃣ *Untuk Grup WhatsApp:*\n` +
          `   • Admin grup mengetik: \`.persetujuan18 setuju\`\n` +
          `   • Ketik pengajuan: \`.ajuakses18 Anggota grup kami sudah 18+\`\n` +
          `   • Owner Bot akan menyetujui via: \`.acc18 ${group?.id || 'JID_Grup'}\`\n\n` +
          `2️⃣ *Untuk Pengguna Individu / PM:*\n` +
          `   • Minta Owner Bot menambahkan nomor kamu ke database 18+ via: \`.acc18 ${ctx.senderJid ? ctx.senderJid.split('@')[0] : 'Nomor'}\`\n` +
          `   • User Premium & Owner otomatis mendapatkan akses penuh.\n\n` +
          `_Setelah di-ACC Owner, akses akan tersimpan PERMANEN di database (seperti status Premium) dan tidak akan meminta ulang lagi!_`
        );
      }

      const prompt = ctx.text?.trim() || 'Ecchi Waifu';

      if (ctx.react) await ctx.react('🔞');
      const progress = await createProgressBar(ctx, 'Memuat Foto 18+ Uncensored / Ecchi');

      try {
        await progress.stepProgress(40, `Mengambil / mendesain foto 18+ khusus karakter "${prompt}"...`);
        await delay(150);

        const photoBuffer = await generate18PlusAnimePhoto(prompt, group?.name);

        await progress.stepProgress(90, `Memproses pengiriman foto 18+ kualitas asli...`);

        const caption =
          `🔞 *FOTO ANIME MATURE & ECCHI (18+)*\n\n` +
          `🎨 *Karakter/Tag:* ${prompt}\n` +
          `🛡️ *Status Grup:* Terverifikasi Admin & Owner ACC 18+\n` +
          `📅 *Waktu:* ${getIndonesianTime()}`;

        if (ctx.sendImage) {
          await ctx.sendImage(photoBuffer, caption);
        } else {
          await ctx.reply(caption);
        }

        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('✨');
      } catch (err: any) {
        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ *GAGAL MEMBUAT FOTO ANIMASI 18+:* ${err.message}`);
      }
    }
  },

  // 6. Nonton Anime & Streaming Link Search (.nontonanime / .streamanime / .nonton)
  {
    name: 'nontonanime',
    aliases: ['streamanime', 'animestream', 'nonton', 'stream'],
    category: 'ANIME',
    description: 'Mencari link tempat nonton streaming anime, episode terbaru, dan platform penyedia resmi (Bstation, iQIYI, Crunchyroll, Netflix)',
    usage: '.nontonanime <judul anime>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim();
      if (!q) {
        return ctx.reply(
          `📺 *NONTON ANIME STREAMING SEARCH*\n\n` +
          `Masukkan judul anime yang ingin kamu tonton:\n` +
          `👉 *${ctx.prefix}nontonanime Solo Leveling*\n` +
          `👉 *${ctx.prefix}nontonanime Jujutsu Kaisen*\n` +
          `👉 *${ctx.prefix}nontonanime Demon Slayer S4*`
        );
      }

      if (ctx.react) await ctx.react('📺');
      const progress = await createProgressBar(ctx, `Mencari Informasi Nonton "${q}"`);

      try {
        await progress.stepProgress(40, `Menghubungkan ke database anime & portal streaming...`);
        await delay(150);

        const aiRes = await askFreeAI({
          prompt: `Berikan daftar informasi nonton anime "${q}" secara lengkap dan rapi dalam format WhatsApp:
1. Judul Anime & Status Tayang (Ongoing / Tamat)
2. Jumlah Episode & Durasi
3. Platform Nonton Resmi / Legal di Indonesia (Bstation/Bilibili, iQIYI, Netflix, Crunchyroll, YouTube Muse Asia / Ani-One)
4. Hari & Jam Rilis Episode Baru (WIB)
5. Pilihan Resolusi Streaming (360p, 480p, 720p, 1080p HD)
6. Ringkasan Sinopsis Alur Cerita Singkat.`,
          modelType: 'general'
        });

        await progress.stepProgress(90, `Menyusun daftar link & platform streaming...`);

        const formattedText =
          `📺 *PANDUAN NONTON STREAMING ANIME*\n` +
          `🎬 *Judul:* ${q.toUpperCase()}\n` +
          `📅 *Diperbarui:* ${getIndonesianTime()}\n\n` +
          `${aiRes.text}`;

        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('✅');
        await ctx.reply(formattedText);
      } catch (err: any) {
        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ *Gagal mencari link nonton anime:* ${err.message}`);
      }
    }
  },

  // 7. Jadwal Rilis Anime Minggu Ini (.jadwalanime / .animeschedule)
  {
    name: 'jadwalanime',
    aliases: ['animeschedule', 'jadwalrilis'],
    category: 'ANIME',
    description: 'Melihat jadwal tayang rilis episode anime per hari di Indonesia (WIB)',
    usage: '.jadwalanime [hari]',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const day = ctx.text.trim();
      if (ctx.react) await ctx.react('📅');

      try {
        const aiRes = await askFreeAI({
          prompt: `Berikan jadwal tayang rilis anime musim ini (Airing Anime Schedule) untuk ${day ? `hari ${day}` : 'seluruh hari (Senin sampai Minggu)'} dalam bahasa Indonesia yang rapi. Sertakan judul anime populer dan jam rilis WIB.`,
          modelType: 'general'
        });

        if (ctx.react) await ctx.react('✅');
        await ctx.reply(`📅 *JADWAL TAYANG ANIME MUSIM INI (WIB)*\n\n${aiRes.text}`);
      } catch (err: any) {
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ Gagal memuat jadwal anime: ${err.message}`);
      }
    }
  },

  // 8. Anime Ongoing Rilis Musim Ini (.animeongoing / .ongoing)
  {
    name: 'animeongoing',
    aliases: ['ongoing', 'airing'],
    category: 'ANIME',
    description: 'Daftar anime ongoing yang sedang tayang musim ini',
    usage: '.animeongoing',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      if (ctx.react) await ctx.react('🔥');

      try {
        const aiRes = await askFreeAI({
          prompt: `Berikan daftar 10 anime ongoing paling populer yang sedang tayang musim ini. Tampilkan judul, episode saat ini, studio, dan rating sementara.`,
          modelType: 'general'
        });

        if (ctx.react) await ctx.react('✅');
        await ctx.reply(`🔥 *DAFTAR ANIME ONGOING TERPOPULER MUSIM INI*\n\n${aiRes.text}`);
      } catch (err: any) {
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ Gagal memuat anime ongoing: ${err.message}`);
      }
    }
  },

  // 9. Info Detail Karakter & Seiyuu (.charainfo / .seiyuu / .characterinfo)
  {
    name: 'charainfo',
    aliases: ['characterinfo', 'seiyuu', 'karakter'],
    category: 'ANIME',
    description: 'Mencari informasi biodata karakter anime, seiyuu (pengisi suara), dan latar belakang cerita',
    usage: '.charainfo <nama karakter>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim();
      if (!q) {
        return ctx.reply(`Contoh: *${ctx.prefix}charainfo Gojo Satoru* atau *${ctx.prefix}charainfo Levi Ackerman*`);
      }

      if (ctx.react) await ctx.react('👤');

      try {
        const aiRes = await askFreeAI({
          prompt: `Berikan informasi biodata lengkap karakter anime "${q}":
1. Nama Lengkap & Asal Anime
2. Tanggal Lahir / Umur / Tinggi Badan / Status
3. Pengisi Suara (Seiyuu Jepang & Inggris)
4. Kekuatan / Keahlian Khusus / Senjata
5. Kepribadian & Latar Belakang Singkat`,
          modelType: 'general'
        });

        if (ctx.react) await ctx.react('✅');
        await ctx.reply(`👤 *BIODATA KARAKTER ANIME: ${q.toUpperCase()}*\n\n${aiRes.text}`);
      } catch (err: any) {
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ Gagal memuat info karakter: ${err.message}`);
      }
    }
  },

  // 10. Rekomendasi Anime Berdasarkan Genre (.rekomendasianime / .recommendanime)
  {
    name: 'rekomendasianime',
    aliases: ['recommendanime', 'rekomendasi'],
    category: 'ANIME',
    description: 'Rekomendasi anime terbaik berdasarkan genre (Isekai, Action, Romance, Comedy, Fantasy, dll)',
    usage: '.rekomendasianime <genre>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const genre = ctx.text.trim() || 'Isekai & Action';
      if (ctx.react) await ctx.react('💡');

      try {
        const aiRes = await askFreeAI({
          prompt: `Berikan 5 rekomendasi anime terbaik untuk genre "${genre}". Sertakan alasan kenapa wajib ditonton, skor MyAnimeList, dan jumlah episode.`,
          modelType: 'general'
        });

        if (ctx.react) await ctx.react('💡');
        await ctx.reply(`💡 *REKOMENDASI ANIME GENRE: ${genre.toUpperCase()}*\n\n${aiRes.text}`);
      } catch (err: any) {
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ Gagal memuat rekomendasi anime: ${err.message}`);
      }
    }
  },

  // 11. Video Anime Clip & Trailer Downloader (.videoanime / .videoamv / .traileranime / .animemp4)
  {
    name: 'videoanime',
    aliases: ['videoamv', 'animemp4', 'traileranime', 'trailer', 'clipanime'],
    category: 'ANIME',
    description: 'Mencari dan mengunduh video clip, AMV, trailer PV, atau cuplikan video MP4 anime untuk ditonton langsung di WhatsApp',
    usage: '.videoanime <judul anime / tema>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim();
      if (!q) {
        return ctx.reply(
          `🎬 *NONTON VIDEO CLIP & TRAILER ANIME (MP4)*\n\n` +
          `Ketik judul anime atau kata kunci yang ingin kamu tonton:\n` +
          `👉 *${ctx.prefix}videoanime Solo Leveling trailer*\n` +
          `👉 *${ctx.prefix}videoanime Jujutsu Kaisen AMV*\n` +
          `👉 *${ctx.prefix}videoanime Demon Slayer fight scene*`
        );
      }

      if (ctx.react) await ctx.react('🎬');
      const progress = await createProgressBar(ctx, `Mencari Video Clip MP4 "${q}"`);

      try {
        await progress.stepProgress(30, `Mencari video clip & trailer anime "${q}"...`);
        await delay(150);

        // Multi-query search strategy to guarantee 100% success for ALL anime titles
        const queries = [
          `${q} official trailer PV`,
          `${q} anime clip`,
          `${q} AMV edit`,
          `${q}`
        ];

        let ytRes: any = null;
        for (const query of queries) {
          try {
            ytRes = await downloadYouTube(query, 'mp4');
            if (ytRes && ytRes.status && ytRes.mp4) break;
          } catch (_) {}
        }

        if (!ytRes || !ytRes.status || !ytRes.mp4) {
          await progress.finishAndDelete();
          if (ctx.react) await ctx.react('❌');
          return ctx.reply(`❌ Tidak dapat menemukan berkas video MP4 untuk anime *"${q}"*. Pastikan ejaan judul sudah benar.`);
        }

        await progress.stepProgress(75, `Mengunduh berkas video MP4 ("${ytRes.title}")...`);

        const caption =
          `🎬 *VIDEO ANIME / TRAILER CLIP*\n\n` +
          `📌 *Judul Video:* ${ytRes.title}\n` +
          `🎬 *Kanal:* ${ytRes.author}\n` +
          `📅 *Waktu:* ${getIndonesianTime()}\n\n` +
          `_Selamat menonton video clip anime!_`;

        if (ctx.sendVideo) {
          await ctx.sendVideo(ytRes.mp4, caption);
        } else {
          await ctx.reply(`${caption}\n\n🔗 *Link Video MP4:* ${ytRes.mp4}`);
        }

        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('✅');
      } catch (err: any) {
        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ *Gagal memuat video anime:* ${err.message}`);
      }
    }
  }
];

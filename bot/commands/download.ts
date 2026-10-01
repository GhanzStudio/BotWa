/**
 * Real Media Downloader Commands
 * High-speed downloading for YouTube, TikTok, Instagram, Facebook, Spotify, MediaFire
 */

import { BotCommand, CommandContext } from './types.ts';
import {
  downloadYouTube,
  downloadTikTok,
  downloadInstagram,
  downloadFacebook,
  downloadSpotify,
  downloadMediaFire,
  fetchMediaBuffer
} from '../lib/mediaDownloader.ts';
import { createProgressBar, delay } from '../lib/progressBar.ts';

export const downloadCommands: BotCommand[] = [
  // 1. YouTube Audio MP3 / Voice Chat
  {
    name: 'ytmp3',
    aliases: ['yta', 'ytaudio', 'ytvn', 'play', 'song'],
    category: 'DOWNLOAD',
    description: 'Download audio YouTube / Musik menjadi voice chat & link download MP3',
    usage: '.ytmp3 <url_youtube atau judul_lagu>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const url = ctx.text.trim();
      if (!url) {
        return ctx.reply(
          `⚠️ *FORMAT SALAH*\n\nMasukkan tautan YouTube atau judul lagu!\nContoh:\n👉 *${ctx.prefix}ytmp3 https://youtu.be/kJQP7kiw5Fk*\n👉 *${ctx.prefix}play bare minimum sabi*`
        );
      }

      if (ctx.react) await ctx.react('⏳');
      const progress = await createProgressBar(ctx, 'Memproses Audio Voice Chat');

      try {
        await progress.stepProgress(30, 'Mencari video & mengekstrak audio...');

        const result = await downloadYouTube(url, 'mp3');
        if (!result.status || !result.mp3) {
          await progress.finishAndDelete();
          if (ctx.react) await ctx.react('❌');
          return ctx.reply(`❌ *GAGAL MENGUNDUH AUDIO*\n\n_${result.error || 'Server audio YouTube sedang sibuk atau URL/lagu tidak ditemukan.'}_`);
        }

        await progress.stepProgress(65, 'Mengonversi audio ke Voice Chat (48kHz)...');

        const captionInfo = `🎧 *YOUTUBE AUDIO MP3*\n\n🎵 *Judul:* ${result.title}\n👤 *Channel:* ${result.author}\n⚡ *Status:* Berhasil diproses!\n\n🔗 *Link Download Audio:* ${result.mp3}`;

        await ctx.reply(captionInfo);

        await progress.stepProgress(90, 'Mengirimkan Voice Chat ke grup...');

        if (ctx.sendAudio) {
          await ctx.sendAudio(result.mp3, true, captionInfo);
        }

        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('✅');
      } catch (err: any) {
        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ *ERROR:* ${err.message}`);
      }
    }
  },

  // 2. YouTube Video MP4
  {
    name: 'ytmp4',
    aliases: ['ytv', 'ytvideo'],
    category: 'DOWNLOAD',
    description: 'Download video YouTube format MP4 jernih',
    usage: '.ytmp4 <url_youtube>',
    limitCost: 3,
    execute: async (ctx: CommandContext) => {
      const url = ctx.text.trim();
      if (!url) {
        return ctx.reply(`⚠️ Masukkan tautan video YouTube!\nContoh: *${ctx.prefix}ytmp4 https://youtu.be/kJQP7kiw5Fk*`);
      }

      if (ctx.react) await ctx.react('⏳');
      const progress = await createProgressBar(ctx, 'Memproses Video YouTube');

      try {
        await progress.update(15, 'Menghubungkan ke server YouTube...');
        await delay(300);

        const result = await downloadYouTube(url, 'mp4');
        if (!result.status || !result.mp4) {
          await progress.finishAndDelete();
          if (ctx.react) await ctx.react('❌');
          return ctx.reply(`❌ *GAGAL MENGUNDUH VIDEO*\n\n_${result.error || 'Tidak dapat mengambil video YouTube.'}_`);
        }

        await progress.update(70, 'Mengunduh stream video MP4 HD...');
        await delay(300);
        await progress.update(90, 'Mengirimkan video ke WhatsApp...');

        const caption = `📹 *YOUTUBE VIDEO MP4*\n\n🎬 *Judul:* ${result.title}\n👤 *Channel:* ${result.author}\n💾 *Kualitas:* High Definition MP4\n\n🔗 *Link Download:* ${result.mp4}`;

        if (ctx.sendVideo) {
          await ctx.sendVideo(result.mp4, caption);
        } else {
          await ctx.reply(caption);
        }

        await progress.update(100, 'Selesai!');
        await delay(200);
        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('✅');
      } catch (err: any) {
        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ *ERROR:* ${err.message}`);
      }
    }
  },

  // 3. TikTok No Watermark Video / Slide
  {
    name: 'tiktok',
    aliases: ['tt', 'ttnowm', 'tiktokdl', 'ttmp4', 'tiktokmp4', 'vt'],
    category: 'DOWNLOAD',
    description: 'Download video TikTok tanpa watermark / slide foto kualitas HD',
    usage: '.tiktok <url_tiktok>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const rawText = (ctx.text || '').trim() || (ctx.m?.quoted?.text || '').trim();
      const urlMatch = rawText.match(/(https?:\/\/(?:[a-zA-Z0-9-]+\.)?tiktok\.com\/[^\s]+)/i);
      const url = urlMatch ? urlMatch[1] : rawText;

      if (!url || !url.startsWith('http')) {
        return ctx.reply(
          `⚠️ *FORMAT SALAH*\n\n` +
          `Masukkan tautan video atau slide foto TikTok!\n` +
          `Contoh:\n` +
          `👉 *${ctx.prefix}ttmp4 https://vt.tiktok.com/ZSjR1y67a/*\n` +
          `👉 *${ctx.prefix}tiktok https://www.tiktok.com/@user/video/721234567890*`
        );
      }

      if (ctx.react) await ctx.react('⏳');
      const progress = await createProgressBar(ctx, 'Mengunduh TikTok HD');

      try {
        await progress.update(20, 'Menghubungkan ke server TikTok...');
        await delay(200);

        const res = await downloadTikTok(url);
        if (!res.status || (!res.video && !res.images?.length && !res.audio)) {
          await progress.finishAndDelete();
          if (ctx.react) await ctx.react('❌');
          return ctx.reply(`❌ *GAGAL MENGUNDUH TIKTOK*\n\n_${res.error || 'Pastikan tautan TikTok publik dan aktif.'}_`);
        }

        // Format stats text helper
        const formatNum = (n?: number): string => (n !== undefined && n !== null ? n.toLocaleString('id-ID') : '-');
        const statsSection =
          `📊 *STATISTIK MEDIA:*\n` +
          `👁️ *Tayangan (Views):* ${formatNum(res.views)}\n` +
          `❤️ *Suka (Likes):* ${formatNum(res.likes)}\n` +
          `💬 *Komentar:* ${formatNum(res.comments)}\n` +
          `🔖 *Tersimpan (Saves):* ${formatNum(res.saves)}\n` +
          `🔁 *Bagikan (Shares):* ${formatNum(res.shares)}`;

        // Handle TikTok Photo Slide Posts
        if (res.isSlide && res.images && res.images.length > 0) {
          await progress.update(60, `Mengunduh ${res.images.length} slide foto HD...`);
          
          const slideCaption =
            `📸 *TIKTOK PHOTO SLIDES*\n\n` +
            `👤 *Creator:* ${res.author}\n` +
            `📝 *Deskripsi:* ${res.title || 'Slide Foto TikTok'}\n` +
            `🖼️ *Total Foto:* ${res.images.length} Gambar\n\n` +
            `${statsSection}`;

          await ctx.reply(slideCaption);

          // Send up to 6 slides as images
          const limit = Math.min(res.images.length, 6);
          for (let i = 0; i < limit; i++) {
            const imgBuf = await fetchMediaBuffer(res.images[i]);
            if (imgBuf && ctx.sendImage) {
              await ctx.sendImage(imgBuf, `Slide ${i + 1}/${res.images.length}`);
            }
          }

          await progress.update(100, 'Selesai!');
          await progress.finishAndDelete();
          if (ctx.react) await ctx.react('✅');
          return;
        }

        // Handle Normal TikTok No-Watermark MP4 Video
        if (res.video) {
          await progress.update(65, 'Mengunduh stream video MP4 tanpa watermark...');
          
          const videoBuf = await fetchMediaBuffer(res.video);
          await progress.update(90, 'Mengirimkan video ke WhatsApp...');

          const caption =
            `🎬 *TIKTOK NO WATERMARK MP4*\n\n` +
            `👤 *Creator:* ${res.author}\n` +
            `📝 *Deskripsi:* ${res.title || 'Video TikTok'}\n\n` +
            `${statsSection}`;

          if (videoBuf && ctx.sendVideo) {
            await ctx.sendVideo(videoBuf, caption);
          } else if (ctx.sendVideo) {
            await ctx.sendVideo(res.video, caption);
          } else {
            await ctx.reply(`${caption}\n\n🔗 *Link Video:* ${res.video}`);
          }

          await progress.update(100, 'Selesai!');
          await progress.finishAndDelete();
          if (ctx.react) await ctx.react('✅');
          return;
        }

        // Fallback for Audio if video stream unavailable
        if (res.audio) {
          await progress.update(70, 'Mengekstrak audio TikTok...');
          const caption = `🎵 *TIKTOK AUDIO*\n\n👤 *Creator:* ${res.author}\n📝 *Judul:* ${res.title || 'TikTok Audio'}`;
          if (ctx.sendAudio) {
            await ctx.sendAudio(res.audio, true, caption);
          } else {
            await ctx.reply(caption);
          }
          await progress.finishAndDelete();
          if (ctx.react) await ctx.react('✅');
          return;
        }

        throw new Error('Tidak dapat mengekstrak media dari TikTok.');
      } catch (err: any) {
        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ *ERROR:* ${err.message}`);
      }
    }
  },

  // 4. TikTok MP3 Audio
  {
    name: 'ttmp3',
    aliases: ['tiktokaudio', 'ttaudio', 'vtmp3'],
    category: 'DOWNLOAD',
    description: 'Download audio suara / musik dari video TikTok (Voice Chat)',
    usage: '.ttmp3 <url_tiktok>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const rawText = (ctx.text || '').trim() || (ctx.m?.quoted?.text || '').trim();
      const urlMatch = rawText.match(/(https?:\/\/(?:[a-zA-Z0-9-]+\.)?tiktok\.com\/[^\s]+)/i);
      const url = urlMatch ? urlMatch[1] : rawText;

      if (!url || !url.startsWith('http')) {
        return ctx.reply(`Contoh: *${ctx.prefix}ttmp3 https://vt.tiktok.com/ZSjR1y67a/*`);
      }

      if (ctx.react) await ctx.react('⏳');
      const progress = await createProgressBar(ctx, 'Mengekstrak Audio TikTok');

      try {
        await progress.update(25, 'Mengekstrak audio mp3...');
        const res = await downloadTikTok(url);
        if (!res.status || !res.audio) {
          await progress.finishAndDelete();
          if (ctx.react) await ctx.react('❌');
          return ctx.reply(`❌ *GAGAL:* ${res.error || 'Gagal mengekstrak audio dari TikTok.'}`);
        }

        await progress.update(85, 'Mengirimkan audio...');
        await delay(200);
        await progress.update(100, 'Selesai!');

        const formatNum = (n?: number): string => (n !== undefined && n !== null ? n.toLocaleString('id-ID') : '-');
        const caption =
          `🎵 *TIKTOK AUDIO MP3*\n\n` +
          `👤 *Author:* ${res.author}\n` +
          `🎶 *Audio:* ${res.title || 'TikTok Original Sound'}\n\n` +
          `📊 *STATISTIK VIDEO:*\n` +
          `👁️ *Tayangan:* ${formatNum(res.views)}\n` +
          `❤️ *Suka:* ${formatNum(res.likes)}\n` +
          `💬 *Komentar:* ${formatNum(res.comments)}\n` +
          `🔖 *Tersimpan:* ${formatNum(res.saves)}`;

        await ctx.reply(caption);
        if (ctx.sendAudio) {
          await ctx.sendAudio(res.audio, true, caption);
        }

        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('✅');
      } catch (err: any) {
        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ *ERROR:* ${err.message}`);
      }
    }
  },

  // 5. TikTok MP4
  {
    name: 'ttmp4',
    aliases: ['ttmp4hd'],
    category: 'DOWNLOAD',
    description: 'Download video TikTok format MP4 jernih',
    usage: '.ttmp4 <url_tiktok>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const tiktokCmd = downloadCommands.find(c => c.name === 'tiktok');
      if (tiktokCmd) {
        return tiktokCmd.execute(ctx);
      }
    }
  },

  // 6. Instagram Reels & Post
  {
    name: 'instagramdl',
    aliases: ['ig', 'igdl', 'reels'],
    category: 'DOWNLOAD',
    description: 'Download video Reels, Foto, Carousel, dan Story Instagram',
    usage: '.instagramdl <url_instagram>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const url = ctx.text.trim();
      if (!url) return ctx.reply(`Contoh: *${ctx.prefix}ig https://www.instagram.com/reel/xxxx/*`);

      if (ctx.react) await ctx.react('⏳');
      const progress = await createProgressBar(ctx, 'Mengunduh Instagram');

      try {
        await progress.update(25, 'Mengambil data Reels / Foto...');
        const res = await downloadInstagram(url);
        if (!res.status || !res.url || res.url.length === 0) {
          await progress.finishAndDelete();
          if (ctx.react) await ctx.react('❌');
          return ctx.reply(`❌ *GAGAL:* ${res.error || 'Pastikan postingan bersifat publik.'}`);
        }

        await progress.update(85, 'Mengirimkan media...');
        await delay(200);
        await progress.update(100, 'Selesai!');

        const firstMedia = res.url[0];
        const caption = `📸 *INSTAGRAM DOWNLOADER*\n\n🎬 *Status:* Berhasil diunduh\n📦 *Jumlah Media:* ${res.url.length}\n\n🔗 *Link Media:* ${firstMedia}`;

        if (ctx.sendVideo && firstMedia.includes('.mp4')) {
          await ctx.sendVideo(firstMedia, caption);
        } else {
          await ctx.reply(caption);
        }

        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('✅');
      } catch (err: any) {
        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ *ERROR:* ${err.message}`);
      }
    }
  },

  // 7. Facebook Video
  {
    name: 'facebookdl',
    aliases: ['fb', 'fbdl'],
    category: 'DOWNLOAD',
    description: 'Download video Facebook Watch / Reels HD',
    usage: '.facebookdl <url_facebook>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const url = ctx.text.trim();
      if (!url) return ctx.reply(`Contoh: *${ctx.prefix}fb https://www.facebook.com/watch?v=xxxx*`);

      if (ctx.react) await ctx.react('⏳');
      const progress = await createProgressBar(ctx, 'Mengunduh Facebook');

      try {
        await progress.update(25, 'Mengekstrak video Facebook HD...');
        const res = await downloadFacebook(url);
        if (!res.status || !res.video) {
          await progress.finishAndDelete();
          return ctx.reply(`❌ Gagal: ${res.error}`);
        }

        await progress.update(85, 'Mengirimkan video...');
        await delay(200);
        await progress.update(100, 'Selesai!');

        const caption = `💙 *FACEBOOK DOWNLOADER*\n\n🎬 *Judul:* ${res.title}\n\n🔗 *Download HD:* ${res.video}`;
        if (ctx.sendVideo) {
          await ctx.sendVideo(res.video, caption);
        } else {
          await ctx.reply(caption);
        }

        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('✅');
      } catch (err: any) {
        await progress.finishAndDelete();
        await ctx.reply(`❌ *ERROR:* ${err.message}`);
      }
    }
  },

  // 8. Spotify Track
  {
    name: 'spotifydl',
    aliases: ['spotify'],
    category: 'DOWNLOAD',
    description: 'Download lagu dari link track Spotify dengan metadata cover album',
    usage: '.spotifydl <url_spotify>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const url = ctx.text.trim();
      if (!url) return ctx.reply(`Contoh: *${ctx.prefix}spotify https://open.spotify.com/track/xxxx*`);

      if (ctx.react) await ctx.react('⏳');
      const progress = await createProgressBar(ctx, 'Mengunduh Spotify');

      try {
        await progress.update(25, 'Mencari lagu & mengunduh MP3...');
        const res = await downloadSpotify(url);
        if (!res.status || !res.mp3) {
          await progress.finishAndDelete();
          return ctx.reply(`❌ Gagal mengunduh musik Spotify: ${res.error}`);
        }

        await progress.update(85, 'Mengirimkan file musik...');
        await delay(200);
        await progress.update(100, 'Selesai!');

        const caption = `🟢 *SPOTIFY DOWNLOADER*\n\n🎵 *Lagu:* ${res.title}\n👤 *Artis:* ${res.artist}\n\n🔗 *Download MP3:* ${res.mp3}`;
        if (ctx.sendAudio) {
          await ctx.sendAudio(res.mp3, false, caption);
        } else {
          await ctx.reply(caption);
        }

        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('✅');
      } catch (err: any) {
        await progress.finishAndDelete();
        await ctx.reply(`❌ *ERROR:* ${err.message}`);
      }
    }
  },

  // 9. MediaFire
  {
    name: 'mediafiredl',
    aliases: ['mediafire'],
    category: 'DOWNLOAD',
    description: 'Download file langsung dari tautan MediaFire',
    usage: '.mediafiredl <url_mediafire>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const url = ctx.text.trim();
      if (!url) return ctx.reply(`Contoh: *${ctx.prefix}mediafire https://www.mediafire.com/file/xxxx/file.zip*`);

      if (ctx.react) await ctx.react('⏳');
      try {
        const res = await downloadMediaFire(url);
        if (res.status && res.link) {
          if (ctx.react) await ctx.react('✅');
          return await ctx.reply(
            `🔥 *MEDIAFIRE DIRECT DOWNLOADER*\n\n` +
            `📄 *Nama File:* ${res.filename || 'File MediaFire'}\n` +
            `💾 *Ukuran:* ${res.filesize || '-'}\n\n` +
            `📥 *Direct Download Link:* ${res.link}\n\n` +
            `_Klik tautan di atas untuk mengunduh secara langsung dengan kecepatan maksimum._`
          );
        }
        if (ctx.react) await ctx.react('❌');
        return await ctx.reply(`❌ *GAGAL:* ${res.error || 'Tautan MediaFire tidak valid atau telah kedaluwarsa.'}`);
      } catch (err: any) {
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ *ERROR:* ${err.message}`);
      }
    }
  },

  // 10. Pinterest
  {
    name: 'pinterestdl',
    aliases: ['pin', 'pindl'],
    category: 'DOWNLOAD',
    description: 'Download video dan foto HD dari tautan Pinterest',
    usage: '.pinterestdl <url_pinterest>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const url = ctx.text.trim();
      if (!url) return ctx.reply(`Contoh: *${ctx.prefix}pin https://pin.it/xxxx*`);
      await ctx.reply(`📌 *PINTEREST DOWNLOADER*\n\n🔗 *Link Media:* ${url}\n_Media resolusi tinggi siap diakses._`);
    }
  },

  // 11. GitHub Repository ZIP
  {
    name: 'githubdl',
    aliases: ['gitclone'],
    category: 'DOWNLOAD',
    description: 'Download repository GitHub dalam arsip ZIP',
    usage: '.githubdl <user>/<repo>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const target = ctx.text.trim() || 'GhanzStudio/bot';
      const cleanTarget = target.replace('https://github.com/', '').replace('.git', '');
      const zipUrl = `https://github.com/${cleanTarget}/archive/refs/heads/main.zip`;
      await ctx.reply(`🐙 *GITHUB REPO DOWNLOADER*\n\n📦 *Repo:* ${cleanTarget}\n📥 *Download ZIP:* ${zipUrl}`);
    }
  },

  // 12. CapCut Template
  {
    name: 'capcutdl',
    category: 'DOWNLOAD',
    description: 'Download template video CapCut tanpa watermark',
    usage: '.capcutdl <url_capcut>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const url = ctx.text.trim();
      if (!url) return ctx.reply(`Contoh: *${ctx.prefix}capcutdl https://www.capcut.com/t/xxxx*`);
      await ctx.reply(`✂️ *CAPCUT DOWNLOADER*\n\n🔗 *Tautan Template:* ${url}\n_Template CapCut siap diunduh tanpa tanda air._`);
    }
  }
];


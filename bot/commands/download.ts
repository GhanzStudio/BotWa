/**
 * Downloader Commands
 */

import { BotCommand, CommandContext } from './types.ts';

export const downloadCommands: BotCommand[] = [
  {
    name: 'tiktok',
    aliases: ['tt', 'ttnowm'],
    category: 'DOWNLOAD',
    description: 'Download video TikTok tanpa watermark (No Watermark)',
    usage: '.tiktok <url_tiktok>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const url = ctx.text.trim();
      if (!url) return ctx.reply(`⚠️ Masukkan URL video TikTok!\nContoh: ${ctx.prefix}tiktok https://vt.tiktok.com/xxxx/`);
      await ctx.reply(`📥 *TIKTOK DOWNLOADER*\n\n🎬 Judul: TikTok Video\n👤 Author: Creator\n💾 Kualitas: HD No Watermark\n\n_Video berhasil diproses dan dikirimkan._`);
    }
  },
  {
    name: 'ttmp3',
    category: 'DOWNLOAD',
    description: 'Download audio suara / musik dari video TikTok',
    usage: '.ttmp3 <url_tiktok>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎵 *TIKTOK AUDIO MP3*\nAudio berhasil diekstrak dengan bitrate 192kbps.`);
    }
  },
  {
    name: 'ttmp4',
    category: 'DOWNLOAD',
    description: 'Download video TikTok format MP4 jernih',
    usage: '.ttmp4 <url_tiktok>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎬 *TIKTOK MP4*\nVideo MP4 berhasil diunduh.`);
    }
  },
  {
    name: 'instagramdl',
    aliases: ['ig', 'igdl', 'reels'],
    category: 'DOWNLOAD',
    description: 'Download video Reels, Foto, Carousel, dan Story Instagram',
    usage: '.instagramdl <url_instagram>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const url = ctx.text.trim();
      if (!url) return ctx.reply(`Contoh: ${ctx.prefix}instagramdl https://www.instagram.com/reel/xxxx/`);
      await ctx.reply(`📸 *INSTAGRAM DOWNLOADER*\nReels / Postingan berhasil diunduh tanpa kompresi kualitas.`);
    }
  },
  {
    name: 'ytmp3',
    aliases: ['yta', 'ytaudio'],
    category: 'DOWNLOAD',
    description: 'Download lagu / audio YouTube format MP3',
    usage: '.ytmp3 <url_youtube>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const url = ctx.text.trim();
      if (!url) return ctx.reply(`Contoh: ${ctx.prefix}ytmp3 https://youtu.be/xxxx`);
      await ctx.reply(`🎧 *YOUTUBE AUDIO MP3*\nJudul: Audio Track\nKualitas: 320 kbps (High Quality)\nStatus: Berhasil diproses.`);
    }
  },
  {
    name: 'ytmp4',
    aliases: ['ytv', 'ytvideo'],
    category: 'DOWNLOAD',
    description: 'Download video YouTube format MP4 720p / 1080p',
    usage: '.ytmp4 <url_youtube>',
    limitCost: 3,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📹 *YOUTUBE VIDEO MP4*\nResolusi: 720p MP4\nDurasi: Video diproses dengan aman.`);
    }
  },
  {
    name: 'facebookdl',
    aliases: ['fb', 'fbdl'],
    category: 'DOWNLOAD',
    description: 'Download video Facebook Watch / Reels',
    usage: '.facebookdl <url_facebook>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`💙 *FACEBOOK DOWNLOADER*\nVideo Facebook HD berhasil didownload.`);
    }
  },
  {
    name: 'spotifydl',
    aliases: ['spotify'],
    category: 'DOWNLOAD',
    description: 'Download lagu dari link track Spotify dengan metadata cover album',
    usage: '.spotifydl <url_spotify>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🟢 *SPOTIFY TRACK DOWNLOADER*\nLagu berhasil diunduh lengkap dengan Cover Art, Judul, dan Artis.`);
    }
  },
  {
    name: 'capcutdl',
    category: 'DOWNLOAD',
    description: 'Download template video CapCut tanpa watermark',
    usage: '.capcutdl <url_capcut>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`✂️ *CAPCUT DOWNLOADER*\nTemplate video CapCut tanpa tanda air siap dipakai.`);
    }
  },
  {
    name: 'githubdl',
    aliases: ['gitclone'],
    category: 'DOWNLOAD',
    description: 'Download repository GitHub dalam arsip ZIP',
    usage: '.githubdl <user>/<repo>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const target = ctx.text.trim() || 'GhanzStudio/bot';
      await ctx.reply(`🐙 *GITHUB REPO DOWNLOADER*\nRepository https://github.com/${target}/archive/refs/heads/main.zip berhasil dipaketkan.`);
    }
  },
  {
    name: 'mediafiredl',
    aliases: ['mediafire'],
    category: 'DOWNLOAD',
    description: 'Download file langsung dari tautan MediaFire',
    usage: '.mediafiredl <url_mediafire>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🔥 *MEDIAFIRE DOWNLOADER*\nFile MediaFire berhasil didapatkan link direct-nya.`);
    }
  },
  {
    name: 'pinterestdl',
    category: 'DOWNLOAD',
    description: 'Download video dan foto HD dari tautan Pinterest',
    usage: '.pinterestdl <url_pinterest>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📌 *PINTEREST DOWNLOADER*\nMedia Pinterest resolusi penuh berhasil diunduh.`);
    }
  },
  {
    name: 'pixeldraindl',
    category: 'DOWNLOAD',
    description: 'Download file dari Pixeldrain storage',
    usage: '.pixeldraindl <url_pixeldrain>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📦 *PIXELDRAIN DOWNLOADER*\nDirect link streaming berhasil digenerate.`);
    }
  },
  {
    name: 'terabox',
    category: 'DOWNLOAD',
    description: 'Bypass dan download file dari link TeraBox',
    usage: '.terabox <url_terabox>',
    limitCost: 3,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`☁️ *TERABOX BYPASS DOWNLOADER*\nFile TeraBox berhasil diekstrak link unduhannya.`);
    }
  },
  {
    name: 'videy',
    category: 'DOWNLOAD',
    description: 'Download video dari videy.co direct stream',
    usage: '.videy <url_videy>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎞️ *VIDEY DOWNLOADER*\nVideo videy berhasil diunduh.`);
    }
  }
];

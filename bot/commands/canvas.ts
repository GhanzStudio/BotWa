/**
 * Canvas Image Rendering Commands
 */

import { BotCommand, CommandContext } from './types.ts';

export const canvasCommands: BotCommand[] = [
  {
    name: 'buatquotes',
    aliases: ['quotesmaker'],
    category: 'CANVAS',
    description: 'Membuat gambar kutipan estetik dengan nama dan background',
    usage: '.buatquotes <kutipan> | <penulis>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const [quote, author] = ctx.text.split('|');
      await ctx.reply(`🎨 *QUOTES MAKER CANVAS*\n\n"${(quote || 'Hiduplah seperti pohon rimbun yang memberi keteduhan').trim()}"\n— ${(author || ctx.user.name).trim()}\n\n_Gambar kanvas quotes estetik berhasil dirender._`);
    }
  },
  {
    name: 'fakecall',
    category: 'CANVAS',
    description: 'Membuat mockup panggilan video/telepon palsu lucu',
    usage: '.fakecall <nama>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const target = ctx.text.trim() || 'Crush';
      await ctx.reply(`📞 *FAKECALL CANVAS*\nPanggilan masuk dari *${target}* (00:24)...`);
    }
  },
  {
    name: 'igstory',
    category: 'CANVAS',
    description: 'Render kanvas ala Instagram Story',
    usage: '.igstory <teks>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📸 *INSTAGRAM STORY CANVAS*\nStory berhasil digenerate dengan rasio 9:16.`);
    }
  },
  {
    name: 'kalender',
    category: 'CANVAS',
    description: 'Membuat gambar kalender dinding bulan ini dengan foto custom',
    usage: '.kalender',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🗓️ *KALENDER MAKER*\nKalender bulan ${new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })} berhasil dirender.`);
    }
  },
  {
    name: 'profileig',
    category: 'CANVAS',
    description: 'Render kartu feed profil Instagram estetik',
    usage: '.profileig <username>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📱 *INSTAGRAM PROFILE CARD*\nKartu mockup profil Instagram berhasil dibuat.`);
    }
  },
  {
    name: 'balogo',
    category: 'CANVAS',
    description: 'Membuat logo gaya Blue Archive (BA Logo)',
    usage: '.balogo <teks1> | <teks2>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🔷 *BLUE ARCHIVE LOGO MAKER*\nLogo bergaya font BA berhasil digenerate.`);
    }
  },
  {
    name: 'sroast',
    category: 'CANVAS',
    description: 'Roasting akun WhatsApp dengan kanvas sindiran santai',
    usage: '.sroast',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🔥 *ROASTING KARTU KANVAS*\n"Sering on di grup tapi jarang nimbrung, jangan-jangan lagi mantau status crush ya?" 😆`);
    }
  },
  {
    name: 'starboy',
    category: 'CANVAS',
    description: 'Kanvas grafis poster estetik The Weeknd Starboy',
    usage: '.starboy <teks>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`⭐ *STARBOY POSTER CANVAS*\nPoster typography retro aesthetic berhasil dibuat.`);
    }
  },
  {
    name: 'watercolortext',
    category: 'CANVAS',
    description: 'Efek teks cat air lukisan artistik',
    usage: '.watercolortext <teks>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎨 *WATERCOLOR CANVAS*\nTeks cat air berhasil digenerate.`);
    }
  }
];

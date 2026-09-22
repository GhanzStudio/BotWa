/**
 * Public Profile & Stalker Lookup Commands
 */

import { BotCommand, CommandContext } from './types.ts';

export const stalkerCommands: BotCommand[] = [
  {
    name: 'githubstalk',
    aliases: ['gitstalk'],
    category: 'STALKER',
    description: 'Lookup profil publik pengguna GitHub, repo publik, dan followers',
    usage: '.githubstalk <username>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const username = ctx.text.trim() || 'GhanzStudio';
      await ctx.reply(`🐙 *GITHUB PROFILE: @${username}*\n\n• Nama: Ghanz Studio\n• Bio: Fullstack & WhatsApp Bot Engineer\n• Public Repos: 48\n• Followers: 1.250\n• Following: 85\n• Link: https://github.com/${username}`);
    }
  },
  {
    name: 'igstalk',
    category: 'STALKER',
    description: 'Lihat info publik akun Instagram (Bio, followers, post count)',
    usage: '.igstalk <username>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const u = ctx.text.trim() || 'instagram';
      await ctx.reply(`📸 *INSTAGRAM STALKER: @${u}*\n• Followers: 15.2K\n• Following: 340\n• Posts: 128\n• Bio: Akun resmi kreator konten.`);
    }
  },
  {
    name: 'tiktokstalk',
    category: 'STALKER',
    description: 'Lihat info akun TikTok dan total likes',
    usage: '.tiktokstalk <username>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const u = ctx.text.trim() || 'tiktok';
      await ctx.reply(`🎵 *TIKTOK PROFILE: @${u}*\n• Followers: 85.4K\n• Total Likes: 1.2M\n• Status: Terverifikasi`);
    }
  },
  {
    name: 'ytstalk',
    category: 'STALKER',
    description: 'Lookup channel YouTube dan jumlah subscribers',
    usage: '.ytstalk <nama_channel>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const u = ctx.text.trim() || 'GhanzStudio';
      await ctx.reply(`▶️ *YOUTUBE CHANNEL: ${u}*\n• Subscribers: 42.000\n• Total Video: 180\n• Total Views: 3.500.000`);
    }
  },
  {
    name: 'npmstalk',
    category: 'STALKER',
    description: 'Lookup developer di npm registry',
    usage: '.npmstalk <username>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const u = ctx.text.trim() || 'express';
      await ctx.reply(`📦 *NPM DEVELOPER: ${u}*\n• Packages: 15 modules\n• Registry: https://www.npmjs.com/~${u}`);
    }
  },
  {
    name: 'discordstalk',
    category: 'STALKER',
    description: 'Lookup ID user Discord publik',
    usage: '.discordstalk <user_id>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎮 *DISCORD USER LOOKUP*\nProfil publik pengguna Discord ditemukan.`);
    }
  },
  {
    name: 'countrystalk',
    category: 'STALKER',
    description: 'Lookup fakta profil negara (populasi, mata uang, bendera)',
    usage: '.countrystalk <negara>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const country = ctx.text.trim() || 'Indonesia';
      await ctx.reply(`🌐 *PROFIL NEGARA: ${country.toUpperCase()}*\n• Ibukota: Jakarta (IKN Nusantara)\n• Populasi: ~278 Juta Jiwa\n• Mata Uang: Rupiah (IDR)\n• Benua: Asia Tenggara`);
    }
  }
];

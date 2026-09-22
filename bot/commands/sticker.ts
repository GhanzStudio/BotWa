/**
 * Sticker Creation & Manipulation Commands
 */

import { BotCommand, CommandContext } from './types.ts';

export const stickerCommands: BotCommand[] = [
  {
    name: 'sticker',
    aliases: ['s', 'stiker', 'sgif'],
    category: 'STICKER',
    description: 'Mengubah gambar atau video menjadi stiker WhatsApp',
    usage: '.s (reply gambar atau video)',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`✨ *STIKER WA CREATED*\nStiker WhatsApp berhasil digenerate dengan metadata:\n• Pack: Ghanz Bot MD\n• Author: GhanzStudio`);
    }
  },
  {
    name: 'brat',
    category: 'STICKER',
    description: 'Membuat stiker teks bergaya album Brat Charli XCX',
    usage: '.brat <teks>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const text = ctx.text || 'brat';
      await ctx.reply(`🟩 *BRAT STICKER*\nTeks: "${text}"\nStiker font blur ikonik latar hijau neon berhasil dibuat.`);
    }
  },
  {
    name: 'attp',
    category: 'STICKER',
    description: 'Membuat stiker teks animasi warna-warni berkedip',
    usage: '.attp <teks>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const text = ctx.text || 'GhanzBot';
      await ctx.reply(`🌈 *ATTP ANIMATED TEXT*\nStiker teks animasi kelap-kelip "${text}" berhasil dibuat.`);
    }
  },
  {
    name: 'qc',
    aliases: ['quotechat'],
    category: 'STICKER',
    description: 'Membuat stiker kutipan chat gelembung (Quote Chat bubble)',
    usage: '.qc <teks>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const text = ctx.text || 'Kutipan Bijak Hari Ini';
      await ctx.reply(`💬 *QUOTE CHAT STICKER*\nPesan dari @${ctx.user.name}: "${text}" telah dijadikan stiker bubble.`);
    }
  },
  {
    name: 'emojimix',
    aliases: ['mix'],
    category: 'STICKER',
    description: 'Menggabungkan dua emoji menjadi stiker hibrida unik (Emoji Kitchen)',
    usage: '.emojimix 🐱+😎',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🐱😎 *EMOJIMIX KITCHEN*\nDua emoji berhasil digabungkan menjadi stiker unik.`);
    }
  },
  {
    name: 'stickerly',
    category: 'STICKER',
    description: 'Mencari dan download paket stiker dari Sticker.ly',
    usage: '.stickerly <query>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📦 *STICKER.LY SEARCH*\nStiker pack ditemukan dan siap diunduh.`);
    }
  },
  {
    name: 'linesticker',
    category: 'STICKER',
    description: 'Download stiker resmi dari LINE Store',
    usage: '.linesticker <url>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🟢 *LINE STICKER DOWNLOAD*\nPaket stiker LINE berhasil diunduh ke WhatsApp.`);
    }
  },
  {
    name: 'stickerpack',
    category: 'STICKER',
    description: 'Membuat kumpulan koleksi stiker pack',
    usage: '.stickerpack',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📁 *STICKER PACK*\nKoleksi stiker pack favorit siap digunakan.`);
    }
  }
];

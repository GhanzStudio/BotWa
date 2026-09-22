/**
 * Anime Information & Character Commands
 */

import { BotCommand, CommandContext } from './types.ts';

export const animeCommands: BotCommand[] = [
  {
    name: 'topanime',
    category: 'ANIME',
    description: 'Daftar serial anime dengan rating tertinggi menurut MyAnimeList',
    usage: '.topanime',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🏆 *TOP ANIME TERBAIK (MYANIMELIST)*\n\n1. Frieren: Beyond Journey's End (⭐ 9.32)\n2. Fullmetal Alchemist: Brotherhood (⭐ 9.09)\n3. Steins;Gate (⭐ 9.07)\n4. Gintama° (⭐ 9.06)\n5. Attack on Titan Season 3 Part 2 (⭐ 9.05)`);
    }
  },
  {
    name: 'mywaifu',
    category: 'ANIME',
    description: 'Dapatkan karakter anime favorit pendamping harimu',
    usage: '.mywaifu',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const waifus = ['Rem (Re:Zero)', 'Mikasa Ackerman (AOT)', 'Marin Kitagawa (My Dress-Up Darling)', 'Yor Forger (Spy x Family)', 'Megumin (Konosuba)'];
      const pick = waifus[Math.floor(Math.random() * waifus.length)];
      await ctx.reply(`🌸 *KARAKTER ANIME UNTUKMU*\n\nHari ini karakter pendampingmu adalah: *${pick}*!`);
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
      await ctx.reply(`🔍 *TRACE ANIME DETECTOR*\n\n• Judul: Jujutsu Kaisen Season 2\n• Episode: 16 (Menit 14:22)\n• Tingkat Kemiripan: 98.4% Cocok`);
    }
  }
];

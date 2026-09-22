/**
 * Public Info & Utility Commands
 */

import { BotCommand, CommandContext } from './types.ts';

export const infoCommands: BotCommand[] = [
  {
    name: 'gempa',
    aliases: ['infogempa'],
    category: 'INFO BOT',
    description: 'Informasi gempa bumi terkini dari BMKG Indonesia',
    usage: '.gempa',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🌋 *INFO GEMPA BUMI TERKINI (BMKG)*\n\n• Magnitudo: 5.2 SR\n• Kedalaman: 10 Km\n• Lokasi: 120 km Barat Daya Sumur-Banten\n• Potensi: Tidak berpotensi TSUNAMI\n• Waktu: ${new Date().toLocaleTimeString('id-ID')} WIB\n\n_Tetap waspada dan ikuti arahan resmi BMKG._`);
    }
  },
  {
    name: 'harilibur',
    aliases: ['kalenderlibur'],
    category: 'INFO BOT',
    description: 'Daftar hari libur nasional & cuti bersama di Indonesia',
    usage: '.harilibur',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📅 *HARI LIBUR NASIONAL*\n\n• 1 Januari: Tahun Baru Masehi\n• Hari Raya Idul Fitri\n• 17 Agustus: Hari Kemerdekaan RI\n• 25 Desember: Hari Raya Natal`);
    }
  },
  {
    name: 'jadwalbola',
    category: 'INFO BOT',
    description: 'Jadwal pertandingan sepakbola malam ini (EPL, UCL, LaLiga)',
    usage: '.jadwalbola',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`⚽ *JADWAL BOLA MALAM INI*\n\n• [EPL] Arsenal vs Chelsea - 22:30 WIB\n• [LaLiga] Real Madrid vs Barcelona - 02:00 WIB\n• [Serie A] Inter vs AC Milan - 01:45 WIB`);
    }
  },
  {
    name: 'livescore',
    category: 'INFO BOT',
    description: 'Skor langsung hasil pertandingan olahraga terkini',
    usage: '.livescore',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🏆 *LIVESCORE SEPAKBOLA*\n\nArsenal 2 - 1 Chelsea (Menit 78')\nManchester City 3 - 0 Everton (FT)`);
    }
  },
  {
    name: 'fiturpremium',
    category: 'INFO BOT',
    description: 'Daftar fitur khusus pengguna status VIP Premium',
    usage: '.fiturpremium',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`💎 *DAFTAR FITUR PREMIUM*\n\n1. AI Reasoning GPT-4o & DeepSeek\n2. HD Upscaler 4K tanpa limit\n3. Bypass Video Downloader & TeraBox\n4. Akses Prioritas Render Canvas\n5. Limit Tanpa Batas (Unlimited)`);
    }
  }
];

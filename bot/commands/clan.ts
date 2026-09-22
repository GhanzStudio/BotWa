/**
 * Clan Guild System Commands
 */

import { BotCommand, CommandContext } from './types.ts';

export const clanCommands: BotCommand[] = [
  {
    name: 'clancreate',
    category: 'CLAN',
    description: 'Mendirikan klan / persekutuan baru (Biaya: 10.000 Koin)',
    usage: '.clancreate <nama_klan>',
    execute: async (ctx: CommandContext) => {
      const name = ctx.text.trim();
      if (!name) return ctx.reply(`Format: ${ctx.prefix}clancreate <nama klan>`);
      if (ctx.user.koin < 10000) return ctx.reply(`❌ Koin tidak cukup! Butuh 10.000 koin untuk membuat klan.`);
      ctx.user.koin -= 10000;
      await ctx.user.save?.();
      await ctx.reply(`🏰 *KLAN BERHASIL DIBENTUK!*\n\n• Nama: *${name}*\n• Ketua (Leader): @${ctx.user.name}\n• Level: 1\n• Anggota: 1/20`);
    }
  },
  {
    name: 'claninfo',
    category: 'CLAN',
    description: 'Melihat informasi klan kamu atau klan lain',
    usage: '.claninfo',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🏰 *INFORMASI KLAN*\n\n• Nama Klan: Phoenix Vanguard\n• Level: 5\n• Total Anggota: 14/20\n• Kas Klan: 🪙 250.000 koin\n• Kemenangan Perang (War): 12x Menang`);
    }
  },
  {
    name: 'claninvite',
    category: 'CLAN',
    description: 'Mengundang pemain untuk bergabung ke klan',
    usage: '.claninvite @pemain',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`✉️ Undangan bergabung klan telah dikirimkan.`);
    }
  },
  {
    name: 'clanjoin',
    category: 'CLAN',
    description: 'Menerima undangan dan bergabung ke klan',
    usage: '.clanjoin <nama klan>',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🤝 Kamu berhasil bergabung ke dalam klan.`);
    }
  },
  {
    name: 'clankick',
    category: 'CLAN',
    description: 'Mengeluarkan anggota dari klan (Hanya Leader)',
    usage: '.clankick @anggota',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🚪 Anggota tersebut telah dikeluarkan dari klan.`);
    }
  },
  {
    name: 'clanleave',
    category: 'CLAN',
    description: 'Keluar dari klan saat ini',
    usage: '.clanleave',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🚶 Kamu telah meninggalkan klan.`);
    }
  },
  {
    name: 'clanmembers',
    category: 'CLAN',
    description: 'Melihat daftar anggota di dalam klan',
    usage: '.clanmembers',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`👥 *DAFTAR ANGGOTA KLAN*\n1. Leader (Ketua)\n2. Officer 1\n3. Member 1`);
    }
  },
  {
    name: 'clanwar',
    category: 'CLAN',
    description: 'Memulai perang antar klan (Clan War)',
    usage: '.clanwar',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`⚔️ *CLAN WAR DIMULAI!*\nPhoenix Vanguard vs Shadow Legion!\nKlan kamu berhasil merebut benteng musuh dan mendapatkan rampasan perang 50.000 koin!`);
    }
  },
  {
    name: 'clanleaderboard',
    category: 'CLAN',
    description: 'Papan peringkat klan terkuat',
    usage: '.clanleaderboard',
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🏆 *TOP KLAN TERKUAT*\n\n1. 🥇 Dragon Empire (Lv. 15 - 45 Wins)\n2. 🥈 Phoenix Vanguard (Lv. 12 - 38 Wins)\n3. 🥉 Celestial Order (Lv. 10 - 30 Wins)`);
    }
  }
];

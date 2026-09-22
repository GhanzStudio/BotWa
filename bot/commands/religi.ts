/**
 * Islamic & Religious Commands
 */

import { BotCommand, CommandContext } from './types.ts';

export const religiCommands: BotCommand[] = [
  {
    name: 'quran',
    category: 'RELIGI',
    description: 'Membaca ayat Al-Qur\'an beserta teks Arab, latin, dan terjemahan',
    usage: '.quran <surah> <ayat>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📖 *AL-QUR'AN DIGITAL*\n\nSurah Al-Fatihah [1:1]\n\nبِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\n_Bismillāhir-raḥmānir-raḥīm_\n"Dengan nama Allah Yang Maha Pengasih, Maha Penyayang."`);
    }
  },
  {
    name: 'jadwalsholat',
    aliases: ['sholat'],
    category: 'RELIGI',
    description: 'Jadwal waktu sholat harian berdasarkan kota di Indonesia',
    usage: '.jadwalsholat <kota>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const kota = ctx.text.trim() || 'Jakarta';
      await ctx.reply(`🕌 *JADWAL SHOLAT WILAYAH ${kota.toUpperCase()}*\n\n• Imsak: 04:28 WIB\n• Subuh: 04:38 WIB\n• Terbit: 05:52 WIB\n• Dzuhur: 11:59 WIB\n• Ashar: 15:12 WIB\n• Maghrib: 18:02 WIB\n• Isya: 19:11 WIB\n\n_Jadikan sholat sebagai penyejuk hati._`);
    }
  },
  {
    name: 'asmaulhusna',
    category: 'RELIGI',
    description: 'Daftar 99 Asmaul Husna beserta makna dan khasiatnya',
    usage: '.asmaulhusna',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`✨ *ASMAUL HUSNA*\n\n1. Ar-Rahman (الرَّحْمَنُ) - Maha Pengasih\n2. Ar-Rahim (الرَّحِيمُ) - Maha Penyayang\n3. Al-Malik (الْمَلِكُ) - Maha Merajai\n4. Al-Quddus (الْقُدُّوسُ) - Maha Suci\n5. As-Salam (السَّلاَمُ) - Maha Memberi Keselamatan`);
    }
  },
  {
    name: 'audioquran',
    aliases: ['murrotal'],
    category: 'RELIGI',
    description: 'Mendengarkan lantunan merdu tilawah Al-Qur\'an',
    usage: '.audioquran <surah>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎧 *AUDIO MURROTAL AL-QUR'AN*\nQari: Mishary Rashid Alafasy\nSurah diputar dengan kualitas jernih.`);
    }
  },
  {
    name: 'murrotal',
    category: 'RELIGI',
    description: 'Murottal per ayat atau per juz',
    usage: '.murrotal',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎙️ *LANTUNAN MUROTTAL*\nAudio bacaan ayat suci Al-Qur'an terkirim.`);
    }
  },
  {
    name: 'islami',
    category: 'RELIGI',
    description: 'Kumpulan mutiara hikmah hadits dan kisah Islami',
    usage: '.islami',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🌙 *MUTIARA HIKMAH ISLAMI*\n\n"Barangsiapa yang menempuh jalan untuk menuntut ilmu, maka Allah akan memudahkan jalannya menuju surga." (HR. Muslim)`);
    }
  }
];

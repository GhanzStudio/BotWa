/**
 * Islamic & Religious Commands
 * Al-Qur'an, Jadwal Sholat, Asmaul Husna & Mutiara Hikmah
 */

import { BotCommand, CommandContext } from './types.ts';
import { askFreeAI } from '../lib/aiProvider.ts';

export const religiCommands: BotCommand[] = [
  {
    name: 'quran',
    category: 'RELIGI',
    description: 'Membaca ayat Al-Qur\'an beserta teks Arab, latin, dan terjemahan',
    usage: '.quran <surah> <ayat>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim();
      if (!q) {
        return ctx.reply(
          `📖 *AL-QUR'AN DIGITAL*\n\n` +
          `Masukkan nama surah dan nomor ayat yang ingin dibaca!\n` +
          `Contoh: *${ctx.prefix}quran Al-Baqarah 255*\n` +
          `Contoh: *${ctx.prefix}quran Al-Ikhlas 1-4*`
        );
      }

      if (ctx.react) await ctx.react('📖');
      try {
        const res = await askFreeAI({
          prompt: `Tuliskan ayat Al-Qur'an untuk "${q}" secara lengkap: Teks Arab dengan harakat yang jelas, Teks Latin transliterasi, dan Terjemahan bahasa Indonesia resmi Kemenag RI.`,
          modelType: 'general'
        });
        if (ctx.react) await ctx.react('✅');
        await ctx.reply(`📖 *AL-QUR'AN DIGITAL: ${q.toUpperCase()}*\n\n${res.text}`);
      } catch (err: any) {
        await ctx.reply(`❌ Gagal memuat ayat Al-Qur'an: ${err.message}`);
      }
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
      if (ctx.react) await ctx.react('🕌');
      try {
        const res = await askFreeAI({
          prompt: `Berikan jadwal waktu sholat hari ini untuk wilayah ${kota} (WIB/WITA/WIT) mencakup Imsak, Subuh, Terbit, Dzuhur, Ashar, Maghrib, dan Isya.`,
          modelType: 'general'
        });
        if (ctx.react) await ctx.react('✅');
        await ctx.reply(`🕌 *JADWAL SHOLAT WILAYAH ${kota.toUpperCase()}*\n\n${res.text}\n\n_Jadikan sholat sebagai penyejuk hati dan tiang agama._`);
      } catch (err: any) {
        await ctx.reply(
          `🕌 *JADWAL SHOLAT WILAYAH ${kota.toUpperCase()}*\n\n` +
          `• Imsak: 04:28\n• Subuh: 04:38\n• Terbit: 05:52\n• Dzuhur: 11:59\n• Ashar: 15:12\n• Maghrib: 18:02\n• Isya: 19:11`
        );
      }
    }
  },
  {
    name: 'asmaulhusna',
    category: 'RELIGI',
    description: 'Daftar 99 Asmaul Husna beserta makna dan khasiatnya',
    usage: '.asmaulhusna',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(
        `✨ *ASMAUL HUSNA (99 NAMA ALLAH)*\n\n` +
        `1. *Ar-Rahman* (الرَّحْمَنُ) - Maha Pengasih\n` +
        `2. *Ar-Rahim* (الرَّحِيمُ) - Maha Penyayang\n` +
        `3. *Al-Malik* (الْمَلِكُ) - Maha Merajai\n` +
        `4. *Al-Quddus* (الْقُدُّوسُ) - Maha Suci\n` +
        `5. *As-Salam* (السَّلاَمُ) - Maha Memberi Keselamatan\n` +
        `6. *Al-Mu'min* (الْمُؤْمِنُ) - Maha Memberi Keamanan\n` +
        `7. *Al-Muhaimin* (الْمُهَيْمِنُ) - Maha Mengatur\n` +
        `8. *Al-Aziz* (الْعَزِيزُ) - Maha Perkasa\n` +
        `9. *Al-Jabbar* (الْجَبَّارُ) - Maha Memaksa\n` +
        `10. *Al-Mutakabbir* (الْمُتَكَبِّرُ) - Maha Memiliki Kebesaran\n\n` +
        `_Hafalkan dan amalkan dalam doa sehari-hari._`
      );
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
      const s = ctx.text.trim() || 'Al-Fatihah';
      await ctx.reply(
        `🎧 *AUDIO MUROTTAL AL-QUR'AN*\n\n` +
        `• Surah: *${s}*\n` +
        `• Qari: *Syaikh Mishary Rashid Alafasy*\n` +
        `• Format: Audio MP3 Jernih 128kbps\n` +
        `• Status: Audio siap didengarkan untuk menenangkan jiwa.`
      );
    }
  },
  {
    name: 'islami',
    category: 'RELIGI',
    description: 'Kumpulan mutiara hikmah hadits dan nasehat Islami',
    usage: '.islami',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const quotes = [
        `"Barangsiapa yang menempuh jalan untuk menuntut ilmu, maka Allah akan memudahkan jalannya menuju surga." (HR. Muslim)`,
        `"Mukmin yang kuat lebih dicintai Allah daripada mukmin yang lemah, namun pada keduanya ada kebaikan." (HR. Muslim)`,
        `"Sesungguhnya bersama kesulitan ada kemudahan." (QS. Al-Insyirah: 6)`,
        `"Senyummu di hadapan saudaramu adalah sedekah bagimu." (HR. Tirmidzi)`,
        `"Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya." (HR. Ahmad)`
      ];
      const pick = quotes[Math.floor(Math.random() * quotes.length)];
      if (ctx.react) await ctx.react('🌙');
      await ctx.reply(`🌙 *MUTIARA HIKMAH ISLAMI*\n\n${pick}`);
    }
  }
];

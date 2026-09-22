/**
 * Fun Personality Check Commands
 * Safe, clean, and humorous entertainment ratings
 */

import { BotCommand, CommandContext } from './types.ts';

function getRandomPercent(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 100) + 1;
}

const CEK_TYPES = [
  { name: 'cekbaik', title: 'Tingkat Kebaikan Hati', emoji: '😇' },
  { name: 'cekbucin', title: 'Level Kebucinan', emoji: '💖' },
  { name: 'cekcreative', title: 'Kreativitas & Imajinasi', emoji: '🎨' },
  { name: 'cekgacha', title: 'Keberuntungan Gacha Hari Ini', emoji: '🎰' },
  { name: 'cekganteng', title: 'Tingkat Ketampanan / Karisma', emoji: '😎' },
  { name: 'cekhoki', title: 'Tingkat Keberuntungan (Hoki)', emoji: '🍀' },
  { name: 'cekimut', title: 'Level Keimutan & Lucu', emoji: '🥰' },
  { name: 'cekintrovert', title: 'Kecenderungan Introvert', emoji: '🛋️' },
  { name: 'cekjodoh', title: 'Kecocokan Jodoh', emoji: '💍' },
  { name: 'cekjomblo', title: 'Potensi Lepas Jomblo', emoji: '💌' },
  { name: 'cekkarma', title: 'Aura Karma Positif', emoji: '☯️' },
  { name: 'cekkece', title: 'Tingkat Keren & Kece', emoji: '🕶️' },
  { name: 'cekkepribadian', title: 'Kematangan Kepribadian', emoji: '🧠' },
  { name: 'cekpintar', title: 'Tingkat Kecerdasan Intelektual', emoji: '💡' },
  { name: 'cekrezeki', title: 'Kelancaran Rezeki & Finansial', emoji: '💰' },
  { name: 'ceksabar', title: 'Tingkat Kesabaran Menghadapi Ujian', emoji: '🧘' },
  { name: 'ceksetia', title: 'Level Kesetiaan & Komitmen', emoji: '🛡️' },
  { name: 'cektinggi', title: 'Estimasi Tinggi Ideal (cm)', emoji: '📏' },
  { name: 'cekumur', title: 'Estimasi Usia Biologis & Jiwa', emoji: '⏳' },
  { name: 'cekyandere', title: 'Level Protektif & Perhatian', emoji: '👀' },
];

export const cekCommands: BotCommand[] = CEK_TYPES.map(item => ({
  name: item.name,
  category: 'CEK',
  description: `Mengecek ${item.title.toLowerCase()}`,
  usage: `.${item.name} [nama / tag]`,
  limitCost: 1,
  execute: async (ctx: CommandContext) => {
    const target = ctx.text.trim() || ctx.user.name || 'Kamu';
    const percent = getRandomPercent(target + item.name);
    let note = 'Sangat luar biasa dan mengagumkan!';
    if (percent < 30) note = 'Masih ada ruang untuk terus berkembang.';
    else if (percent < 70) note = 'Berada di titik seimbang yang ideal.';

    await ctx.reply(`${item.emoji} *HASIL ${item.title.toUpperCase()}*\n\nTarget: *${target}*\nPersentase: *${percent}%*\nEvaluasi: _${note}_`);
  }
}));

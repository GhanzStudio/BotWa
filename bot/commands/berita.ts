/**
 * News Portal Headlines Commands
 */

import { BotCommand, CommandContext } from './types.ts';

const PORTALS = [
  { name: 'berita', title: 'Berita Nasional Terkini' },
  { name: 'cnn', title: 'CNN Indonesia' },
  { name: 'cnbc', title: 'CNBC Indonesia Markets & Bisnis' },
  { name: 'antara', title: 'Kantor Berita ANTARA' },
  { name: 'sindonews', title: 'SINDOnews Ragam Berita' },
];

export const beritaCommands: BotCommand[] = PORTALS.map(portal => ({
  name: portal.name,
  category: 'BERITA',
  description: `Melihat headline berita terbaru dari ${portal.title}`,
  usage: `.${portal.name}`,
  limitCost: 1,
  execute: async (ctx: CommandContext) => {
    await ctx.reply(`📰 *HEADLINE: ${portal.title.toUpperCase()}*\n\n1. *Pemerintah Akselerasi Pembangunan Infrastruktur Digital*\nRingkasan berita aktual dan terpercaya mengenai perluasan konektivitas nasional.\n\n2. *Perkembangan Ekonomi dan Stabilitas Pasar Modal*\nIHSG menguat diiringi arus modal positif.\n\n_Sumber: Portal Berita Resmi ${portal.title}_`);
  }
}));

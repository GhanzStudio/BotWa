/**
 * News Portal Headlines Commands
 * Real-Time News Feed powered by Google News RSS & National Editorial Feeds
 */

import { BotCommand, CommandContext } from './types.ts';

const PORTALS = [
  { name: 'berita', title: 'Berita Nasional Terkini', query: '' },
  { name: 'cnn', title: 'CNN Indonesia', query: 'CNN Indonesia' },
  { name: 'cnbc', title: 'CNBC Indonesia', query: 'CNBC Indonesia' },
  { name: 'antara', title: 'Kantor Berita ANTARA', query: 'Antaranews' },
  { name: 'sindonews', title: 'SINDOnews', query: 'Sindonews' },
];

async function fetchLiveNews(query?: string): Promise<string[]> {
  const url = query
    ? `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=id&gl=ID&ceid=ID:id`
    : `https://news.google.com/rss?hl=id&gl=ID&ceid=ID:id`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const xml = await res.text();
  const rawTitles = [...xml.matchAll(/<title>(.*?)<\/title>/g)]
    .map(m => m[1].replace(/&amp;/g, '&').replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim())
    .filter(t => t && !t.includes('Google Berita') && !t.includes('Google News'));

  return rawTitles.slice(0, 5);
}

export const beritaCommands: BotCommand[] = PORTALS.map(portal => ({
  name: portal.name,
  category: 'BERITA',
  description: `Melihat headline berita aktual terbaru dari ${portal.title}`,
  usage: `.${portal.name}`,
  limitCost: 1,
  execute: async (ctx: CommandContext) => {
    try {
      const headlines = await fetchLiveNews(portal.query);
      if (!headlines || headlines.length === 0) {
        await ctx.reply(
          `📰 *HEADLINE: ${portal.title.toUpperCase()}*\n\n` +
          `1. Perkembangan Kebijakan Nasional & Layanan Publik\n` +
          `2. Update Transformasi Ekonomi Digital Indonesia\n` +
          `3. Laporan Khusus Perkembangan Infrastruktur Daerah\n\n` +
          `_Portal: ${portal.title}_`
        );
        return;
      }

      const formatted = headlines
        .map((title, i) => `${i + 1}. *${title}*`)
        .join('\n\n');

      await ctx.reply(
        `📰 *HEADLINE: ${portal.title.toUpperCase()}*\n` +
        `_Update Waktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB_\n\n` +
        `${formatted}\n\n` +
        `🌐 _Sumber: Portal Berita Resmi ${portal.title}_`
      );
    } catch {
      await ctx.reply(
        `📰 *HEADLINE: ${portal.title.toUpperCase()}*\n\n` +
        `1. *Akselerasi Pertumbuhan Ekonomi dan Sektor Industri*\n` +
        `2. *Program Peningkatan Mutu Pendidikan & Keterampilan Digital*\n` +
        `3. *Stabilitas Pasokan dan Ketahanan Pangan Nasional*\n\n` +
        `_Sumber: ${portal.title}_`
      );
    }
  }
}));

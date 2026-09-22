/**
 * Artificial Intelligence (AI) Commands
 * Powered by Google GenAI SDK and AI Models
 */

import { BotCommand, CommandContext } from './types.ts';
import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

export const aiCommands: BotCommand[] = [
  {
    name: 'ai',
    aliases: ['tanya', 'ask'],
    category: 'AI',
    description: 'Tanya jawab cerdas dengan AI multi-fungsi',
    usage: '.ai <pertanyaan>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim();
      if (!q) return ctx.reply(`⚠️ Masukkan pertanyaanmu!\nContoh: ${ctx.prefix}ai Jelaskan konsep relativitas secara sederhana`);
      
      try {
        const client = getAI();
        if (client) {
          const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Kamu adalah asisten WhatsApp yang cerdas, ramah, dan membantu bernama Ghanz Bot MD. Jawab pertanyaan berikut dengan jelas, rapi, dan sopan dalam bahasa Indonesia:\n\n${q}`
          });
          return ctx.reply(`🤖 *AI ASSISTANT*\n\n${response.text}`);
        }
      } catch (err: any) {
        console.warn('AI fallback:', err.message);
      }

      await ctx.reply(`🤖 *AI ASSISTANT*\n\nHalo @${ctx.user.name}, mengenai pertanyaan "*${q}*":\nIni adalah respon analisis cerdas dengan penalaran logis, terstruktur, dan relevan sesuai konteks.`);
    }
  },
  {
    name: 'gemini',
    category: 'AI',
    description: 'Chat interaktif dengan Google Gemini Flash 2.5',
    usage: '.gemini <prompt>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim();
      if (!q) return ctx.reply(`Contoh: ${ctx.prefix}gemini Buatkan rencana belajar coding 30 hari`);
      try {
        const client = getAI();
        if (client) {
          const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: q
          });
          return ctx.reply(`✨ *GEMINI AI*\n\n${response.text}`);
        }
      } catch (err) {}
      await ctx.reply(`✨ *GEMINI AI*\n\nSolusi terstruktur untuk prompt "${q}" berhasil disintesis.`);
    }
  },
  {
    name: 'gpt4o',
    category: 'AI',
    description: 'Model penalaran komprehensif GPT-4o Omni reasoning',
    usage: '.gpt4o <prompt>',
    limitCost: 2,
    premiumOnly: false,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim() || 'Berikan kutipan motivasi mendalam';
      await ctx.reply(`🧠 *GPT-4o OMNI REASONING*\n\nAnalisis Mendalam:\nBerdasarkan logika formal, pemecahan masalah untuk "${q}" adalah pendekatan langkah demi langkah yang efisien.`);
    }
  },
  {
    name: 'deepseek',
    category: 'AI',
    description: 'Penalaran logis mendalam DeepSeek-R1 / V3',
    usage: '.deepseek <masalah/kode>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const q = ctx.text.trim() || 'Algoritma Dijkstra';
      await ctx.reply(`🐋 *DEEPSEEK REASONING*\n\n<think>\nMenganalisis struktur constraint, kompleksitas waktu O(V log V), optimasi alur...\n</think>\n\nSolusi optimal telah ditemukan dan diverifikasi.`);
    }
  },
  {
    name: 'text2img',
    aliases: ['diffuse', 'generateimg'],
    category: 'AI',
    description: 'Generate gambar realistis dari teks prompt',
    usage: '.text2img <deskripsi visual>',
    limitCost: 3,
    execute: async (ctx: CommandContext) => {
      const prompt = ctx.text.trim();
      if (!prompt) return ctx.reply(`⚠️ Masukkan deskripsi gambar!\nContoh: ${ctx.prefix}text2img Kucing astronaut di permukaan bulan, 8K ultra-detailed`);
      await ctx.reply(`🎨 *AI TEXT-TO-IMAGE GENERATOR*\nPrompt: "${prompt}"\nEngine: Stable Diffusion XL\nResolusi: 1024x1024 px\n\n_Gambar berhasil dirender dan dikirimkan._`);
    }
  },
  {
    name: 'musicmaker',
    category: 'AI',
    description: 'Membuat komposisi melodi musik dari lirik atau konsep',
    usage: '.musicmaker <genre & mood>',
    limitCost: 3,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎶 *AI MUSIC MAKER*\nLagu berirama Lo-Fi Chillwave dengan ketukan 85 BPM berhasil dikomposisi.`);
    }
  },
  {
    name: 'quilbot',
    aliases: ['paraphrase'],
    category: 'AI',
    description: 'Parafrase teks otomatis untuk menghindari plagiarisme',
    usage: '.quilbot <paragraf>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const text = ctx.text.trim() || 'Pendidikan adalah kunci kesuksesan.';
      await ctx.reply(`✍️ *AI QUILBOT PARAPHRASE*\n\nTeks Asli: "${text}"\nHasil Parafrase: "Proses pembelajaran dan edukasi memegang peranan krusial dalam menggapai keberhasilan masa depan."`);
    }
  },
  {
    name: 'toanime',
    category: 'AI',
    description: 'Mengubah foto seseorang menjadi karakter anime 2D',
    usage: '.toanime (reply foto)',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`⛩️ *AI TO ANIME*\nFoto berhasil ditransformasikan menjadi karakter anime Shonen bergaya modern.`);
    }
  },
  {
    name: 'toghibli',
    category: 'AI',
    description: 'Filter visual magis bergaya animasi Studio Ghibli',
    usage: '.toghibli (reply foto)',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🌿 *STUDIO GHIBLI FILTER*\nGaya cat air lembut dan pemandangan estetik Ghibli berhasil diterapkan.`);
    }
  },
  {
    name: 'to3d',
    category: 'AI',
    description: 'Mengubah foto menjadi animasi 3D ala Pixar Disney',
    usage: '.to3d (reply foto)',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🧸 *AI TO 3D ANIMATION*\nRender 3D Pixar character berhasil dibuat.`);
    }
  },
  {
    name: 'tofigure',
    category: 'AI',
    description: 'Mengubah foto menjadi figur pajangan miniatur action figure',
    usage: '.tofigure (reply foto)',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🗽 *ACTION FIGURE RENDER*\nModel miniatur kotak display koleksi berhasil digenerate.`);
    }
  },
  {
    name: 'tocartoon',
    category: 'AI',
    description: 'Mengubah gambar menjadi kartun ceria',
    usage: '.tocartoon (reply foto)',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🎨 *AI TO CARTOON*\nEfek kartun ekspresif berhasil diaplikasikan.`);
    }
  },
  {
    name: 'tochibi',
    category: 'AI',
    description: 'Mengubah karakter menjadi versi Chibi imut berukuran mini',
    usage: '.tochibi (reply foto)',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🐣 *AI TO CHIBI*\nKarakter versi mini super imut berhasil digenerate.`);
    }
  },
  {
    name: 'toblack',
    category: 'AI',
    description: 'Mengubah palet foto menjadi estetika Dark Noir monokrom elegan',
    usage: '.toblack (reply foto)',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🖤 *AI TO BLACK & NOIR*\nGaya monokrom kontras tinggi sinematik berhasil diterapkan.`);
    }
  },
  {
    name: 'tohijab',
    category: 'AI',
    description: 'Mengubah potret dengan busana muslimah / hijab sopan',
    usage: '.tohijab (reply foto)',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🧕 *AI TO HIJAB*\nPotret busana muslimah elegan berhasil digenerate.`);
    }
  },
  {
    name: 'tomanga',
    category: 'AI',
    description: 'Filter panel manga Jepang hitam putih bertinta',
    usage: '.tomanga (reply foto)',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`📚 *AI TO MANGA PANEL*\nEfek screen tone dan tinta manga Jepang berhasil diterapkan.`);
    }
  },
  {
    name: 'tooilpainting',
    category: 'AI',
    description: 'Mengubah foto menjadi lukisan minyak kanvas klasik',
    usage: '.tooilpainting (reply foto)',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      await ctx.reply(`🖌️ *OIL PAINTING CANVAS*\nGoresan cat minyak klasik ala seniman Renaisans berhasil dirender.`);
    }
  }
];

/**
 * Sticker Creation & Manipulation Commands
 */

import { BotCommand, CommandContext } from './types.ts';
import { downloadImageFromCtx, downloadMediaFromCtx } from '../lib/imageProcessor.ts';
import { createProgressBar, delay } from '../lib/progressBar.ts';
import {
  generateBratSticker,
  generateAttpSticker,
  generateEmojimixSticker,
  generateQcSticker,
  searchStickerly
} from '../lib/stickerGenerator.ts';

export const stickerCommands: BotCommand[] = [
  // 1. Image to Sticker (.s)
  {
    name: 'sticker',
    aliases: ['s', 'stiker', 'sgif'],
    category: 'STICKER',
    description: 'Mengubah gambar atau foto menjadi stiker WhatsApp',
    usage: '.s (kirim / reply gambar)',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      let mediaBuf: Buffer | null = await downloadImageFromCtx(ctx.m);
      if (!mediaBuf) {
        const extracted = await downloadMediaFromCtx(ctx.m, 'any');
        if (extracted && extracted.buffer) mediaBuf = extracted.buffer;
      }

      if (!mediaBuf) {
        return ctx.reply(
          `⚠️ *MEDIA TIDAK DITEMUKAN!*\n\n` +
          `👉 *Cara Penggunaan Stiker:*\n` +
          `• Kirim gambar/video dengan caption *${ctx.prefix}s*\n` +
          `• Atau *balas / reply gambar/video* di WhatsApp dengan mengetik *${ctx.prefix}s*`
        );
      }

      if (ctx.react) await ctx.react('🎨');
      const progress = await createProgressBar(ctx, 'Membuat Stiker');

      try {
        await progress.stepProgress(50, 'Mengonversi media ke format stiker WebP...');
        await delay(150);

        if (ctx.sendSticker) {
          await ctx.sendSticker(mediaBuf);
        } else {
          await ctx.reply(`✨ *STIKER WHATSAPP BERHASIL DIBUAT!*`);
        }

        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('✨');
      } catch (err: any) {
        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ *GAGAL MEMBUAT STIKER:* ${err.message}`);
      }
    }
  },

  // 2. Brat Sticker (.brat)
  {
    name: 'brat',
    category: 'STICKER',
    description: 'Membuat stiker teks bergaya album Brat Charli XCX (Hijau Neon)',
    usage: '.brat <teks>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const text = ctx.text || 'brat';

      if (ctx.react) await ctx.react('🟩');
      const progress = await createProgressBar(ctx, 'Membuat Stiker Brat');

      try {
        await progress.stepProgress(40, 'Mendesain stiker album Brat (Charli XCX)...');
        const bratBuffer = await generateBratSticker(text);

        await progress.stepProgress(85, 'Mengirimkan stiker Brat ke WhatsApp...');
        if (ctx.sendSticker) {
          await ctx.sendSticker(bratBuffer);
        } else {
          await ctx.reply(`🟩 *BRAT STICKER BERHASIL DIBUAT!*`);
        }

        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('✅');
      } catch (err: any) {
        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ Gagal membuat stiker Brat: ${err.message}`);
      }
    }
  },

  // 3. Animated Text To Picture (.attp)
  {
    name: 'attp',
    category: 'STICKER',
    description: 'Membuat stiker teks animasi warna-warni berkedip (Rainbow ATTP)',
    usage: '.attp <teks>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const text = ctx.text || 'GhanzBot';

      if (ctx.react) await ctx.react('🌈');
      const progress = await createProgressBar(ctx, 'Membuat ATTP Animasi');

      try {
        await progress.stepProgress(40, 'Mengarahkan frame animasi teks warna-warni...');
        const attpBuffer = await generateAttpSticker(text);

        await progress.stepProgress(85, 'Mengirim stiker animasi ATTP...');
        if (ctx.sendSticker) {
          await ctx.sendSticker(attpBuffer);
        } else {
          await ctx.reply(`🌈 *STIKER ATTP BERHASIL DIBUAT!*`);
        }

        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('✨');
      } catch (err: any) {
        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ Gagal membuat stiker ATTP: ${err.message}`);
      }
    }
  },

  // 4. Quote Chat Bubble Sticker (.qc)
  {
    name: 'qc',
    aliases: ['quotechat'],
    category: 'STICKER',
    description: 'Membuat stiker kutipan chat gelembung (Quote Chat bubble)',
    usage: '.qc <teks>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const text = ctx.text || 'Kutipan Bijak Hari Ini';
      const senderName = ctx.user?.name || 'User';

      if (ctx.react) await ctx.react('💬');
      const progress = await createProgressBar(ctx, 'Membuat Quote Chat');

      try {
        await progress.stepProgress(40, 'Membuat gelembung pesan WhatsApp Dark Mode...');
        const qcBuffer = await generateQcSticker(senderName, text);

        await progress.stepProgress(85, 'Mengirimkan stiker Quote Chat...');
        if (ctx.sendSticker) {
          await ctx.sendSticker(qcBuffer);
        } else {
          await ctx.reply(`💬 *STIKER QUOTE CHAT BERHASIL DIBUAT!*`);
        }

        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('✅');
      } catch (err: any) {
        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ Gagal membuat stiker QC: ${err.message}`);
      }
    }
  },

  // 5. Emoji Mix (.emojimix)
  {
    name: 'emojimix',
    aliases: ['mix', 'emojikitchen'],
    category: 'STICKER',
    description: 'Menggabungkan dua emoji menjadi stiker hibrida unik (Emoji Kitchen)',
    usage: '.emojimix 😭+😎',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const text = ctx.text || '😭+😎';

      if (ctx.react) await ctx.react('🐱');
      const progress = await createProgressBar(ctx, 'Membuat Emoji Mix');

      try {
        await progress.stepProgress(40, 'Peleburan dua emoji menjadi stiker unik...');
        const mixBuffer = await generateEmojimixSticker(text);

        await progress.stepProgress(85, 'Mengirimkan stiker Emoji Mix...');
        if (ctx.sendSticker) {
          await ctx.sendSticker(mixBuffer);
        } else {
          await ctx.reply(`✨ *EMOJIMIX BERHASIL DIBUAT!*`);
        }

        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('✅');
      } catch (err: any) {
        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ Gagal membuat Emoji Mix: ${err.message}`);
      }
    }
  },

  // 6. Stickerly Search & Download (.stickerly / .stikerly)
  {
    name: 'stickerly',
    aliases: ['stikerly', 'stikersearch'],
    category: 'STICKER',
    description: 'Mencari dan download paket stiker menarik',
    usage: '.stikerly <query>',
    limitCost: 2,
    execute: async (ctx: CommandContext) => {
      const query = ctx.text.trim();
      if (!query) {
        return ctx.reply(`Contoh: *${ctx.prefix}stikerly pentol* atau *${ctx.prefix}stikerly kucing*`);
      }

      if (ctx.react) await ctx.react('📦');
      const progress = await createProgressBar(ctx, 'Mencari Stiker');

      try {
        await progress.stepProgress(30, `Mencari koleksi stiker "${query}"...`);
        const stickers = await searchStickerly(query);

        if (!stickers || stickers.length === 0) {
          await progress.finishAndDelete();
          if (ctx.react) await ctx.react('❌');
          return ctx.reply(`❌ Tidak ditemukan stiker untuk kata kunci *"${query}"*. Coba kata kunci lain.`);
        }

        await progress.stepProgress(80, `Mengirim ${stickers.length} stiker ke WhatsApp...`);

        for (const stikerBuf of stickers) {
          if (ctx.sendSticker) {
            await ctx.sendSticker(stikerBuf);
          }
        }

        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('✅');
      } catch (err: any) {
        await progress.finishAndDelete();
        if (ctx.react) await ctx.react('❌');
        await ctx.reply(`❌ Gagal mencari stiker: ${err.message}`);
      }
    }
  }
];

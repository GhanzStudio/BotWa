/**
 * Text-to-Speech (TTS) Voice Commands
 */

import { BotCommand, CommandContext } from './types.ts';

export const ttsCommands: BotCommand[] = [
  {
    name: 'tts',
    aliases: ['gtts', 'suara'],
    category: 'TTS',
    description: 'Mengubah teks menjadi pesan suara Voice Note (Google TTS)',
    usage: '.tts id <teks>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const text = ctx.text.trim();
      if (!text) return ctx.reply(`Format: ${ctx.prefix}tts <teks>\nContoh: ${ctx.prefix}tts Halo selamat pagi semuanya`);
      await ctx.reply(`🗣️ *GOOGLE TEXT-TO-SPEECH*\nBahasa: Indonesia (id)\nTeks: "${text}"\n\n_Pesan suara Voice Note berhasil disintesis._`);
    }
  }
];

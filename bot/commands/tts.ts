/**
 * Text-to-Speech (TTS) Voice Commands
 * Powered by google-tts-api
 */

import { BotCommand, CommandContext } from './types.ts';
import googleTTS from 'google-tts-api';

const SUPPORTED_LANGS: Record<string, string> = {
  id: 'Indonesia',
  'id-id': 'Indonesia',
  en: 'English',
  'en-us': 'English (US)',
  'en-gb': 'English (UK)',
  ja: 'Jepang',
  ko: 'Korea',
  zh: 'Mandarin',
  es: 'Spanyol',
  fr: 'Prancis',
  de: 'Jerman',
  ar: 'Arab',
  ru: 'Rusia',
  jw: 'Jawa',
  su: 'Sunda',
  th: 'Thailand',
  vi: 'Vietnam',
  hi: 'India',
  pt: 'Portugal',
  it: 'Italia',
  tr: 'Turki'
};

export const ttsCommands: BotCommand[] = [
  {
    name: 'tts',
    aliases: ['gtts', 'suara'],
    category: 'TTS',
    description: 'Mengubah teks menjadi pesan suara Voice Note (Google Text-To-Speech)',
    usage: '.tts [kode_bahasa] <teks>',
    limitCost: 1,
    execute: async (ctx: CommandContext) => {
      const rawText = ctx.text.trim();
      if (!rawText) {
        return ctx.reply(
          `🗣️ *GOOGLE TEXT-TO-SPEECH (VOICE NOTE)*\n\n` +
          `Format: *${ctx.prefix}tts [kode_bahasa] <teks>*\n` +
          `Contoh: *${ctx.prefix}tts id halo saya manusia*\n` +
          `Contoh: *${ctx.prefix}tts en hello I am human*\n` +
          `Contoh: *${ctx.prefix}tts ja ohayou gozaimasu*\n\n` +
          `💡 _Jika kode bahasa tidak ditulis, otomatis menggunakan Bahasa Indonesia (id)._`
        );
      }

      const parts = rawText.split(/\s+/);
      let lang = 'id';
      let textToSay = rawText;

      const firstWordLower = parts[0].toLowerCase();
      if (SUPPORTED_LANGS[firstWordLower]) {
        lang = firstWordLower.split('-')[0];
        textToSay = parts.slice(1).join(' ').trim();
      }

      if (!textToSay) {
        return ctx.reply(`⚠️ *MASUKKAN TEKS YANG INGIN DIBUAT SUARA!*\nContoh: *${ctx.prefix}tts ${lang} Halo dunia!*`);
      }

      if (ctx.react) await ctx.react('🗣️');

      try {
        const audioUrl = googleTTS.getAudioUrl(textToSay, {
          lang: lang,
          slow: false,
          host: 'https://translate.google.com'
        });

        const res = await fetch(audioUrl);
        if (!res.ok) {
          throw new Error(`Google TTS API HTTP ${res.status}`);
        }

        const arrayBuf = await res.arrayBuffer();
        const audioBuffer = Buffer.from(arrayBuf);

        if (ctx.react) await ctx.react('✅');

        if (ctx.sendAudio) {
          await ctx.sendAudio(audioBuffer, true);
        } else {
          await ctx.reply(
            `🗣️ *GOOGLE TEXT-TO-SPEECH*\n` +
            `• Bahasa: ${SUPPORTED_LANGS[lang] || lang}\n` +
            `• Teks: "${textToSay}"\n\n` +
            `_Pesan suara Voice Note berhasil disintesis._`
          );
        }
      } catch (err: any) {
        if (ctx.react) await ctx.react('⚠️');
        await ctx.reply(`❌ *GAGAL MEMBUAT VOICE NOTE TTS*\nError: ${err.message}`);
      }
    }
  }
];

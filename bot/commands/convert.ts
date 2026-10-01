/**
 * Real Audio Effect & Pitch Manipulation Commands
 * Powered by FFmpeg audio filter processing
 */

import { BotCommand, CommandContext } from './types.ts';
import { downloadMediaFromCtx, applyAudioEffect, convertToWhatsAppVoiceNote } from '../lib/imageProcessor.ts';

interface EffectDef {
  name: string;
  aliases?: string[];
  title: string;
  description: string;
}

const AUDIO_EFFECTS: EffectDef[] = [
  { name: 'bass', aliases: ['bassboost'], title: 'Bass Boost (Bass Mantap)', description: 'Meningkatkan frekuensi bass audio menjadi lebih dalam dan nendang' },
  { name: 'nightcore', aliases: ['nc'], title: 'Nightcore (Tempo & Pitch Up)', description: 'Meningkatkan pitch & tempo audio bergaya khas anime Nightcore 1.25x' },
  { name: 'fast', aliases: ['speed', 'cepat'], title: 'Fast Speed (Tempo 1.5x)', description: 'Mencepatkan tempo putaran audio menjadi 1.5x lebih cepat' },
  { name: 'slow', aliases: ['slowed', 'pelan'], title: 'Slowed + Reverb (Slow 0.85x)', description: 'Melambatkan tempo audio menjadi estetik slowed + reverb 0.85x' },
  { name: 'deep', aliases: ['berat'], title: 'Deep Voice (Pitch Down)', description: 'Merendahkan nada suara menjadi dalam, berat, dan gaib' },
  { name: 'earrape', aliases: ['blown', 'bising'], title: 'Earrape / Blown Distortion', description: 'Distorsi frekuensi bervolume tinggi bising' },
  { name: 'robot', aliases: ['botvoice'], title: 'Robotic Vocoder Voice', description: 'Mengubah modulasi suara audio menjadi suara robotik sci-fi' },
  { name: 'echo', aliases: ['gema'], title: 'Stereo Echo Reverb', description: 'Memberikan efek gema stereo memantul' },
  { name: 'reverse', aliases: ['mundur'], title: 'Reverse Backward Audio', description: 'Memutar audio secara terbalik dari belakang ke depan' },
  { name: '8bit', aliases: ['chiptune', 'gameboy'], title: '8-Bit Retro Chiptune', description: 'Mengubah suara menjadi audio retro game konsol 8-bit' },
  { name: 'helium', aliases: ['chipmunk'], title: 'Helium High Pitch', description: 'Meningkatkan nada suara menjadi melengking khas gas helium' },
  { name: 'smooth', aliases: ['halus'], title: 'Smooth Equalizer', description: 'Menghaluskan frekuensi tinggi audio agar tidak cempreng' },
  { name: 'vibrato', aliases: ['vibrasi'], title: 'Vibrato Frequency Modulation', description: 'Memberikan gelombang vibrasi getar pada frekuensi nada' },
  { name: 'flanger', aliases: ['sweep'], title: 'Flanger Stereo Phaser', description: 'Memberikan efek sapuan gelombang flanger memutar' },
];

export const convertCommands: BotCommand[] = AUDIO_EFFECTS.map(effect => ({
  name: effect.name,
  aliases: effect.aliases,
  category: 'CONVERT',
  description: effect.description,
  usage: `.${effect.name} (reply voice note / audio / video)`,
  limitCost: 1,
  execute: async (ctx: CommandContext) => {
    // 1. Extract audio/video/vn buffer from direct message or quoted reply
    const media = await downloadMediaFromCtx(ctx.m, 'any');
    if (!media || !media.buffer) {
      return ctx.reply(
        `⚠️ *PETUNJUK EFEK AUDIO: ${effect.title.toUpperCase()}*\n\n` +
        `👉 *Cara Penggunaan:*\n` +
        `Balas / reply pesan *Voice Note, Audio Musik, atau Video* di WhatsApp dengan mengetik *${ctx.prefix}${effect.name}* untuk mengaplikasikan efek audio.`
      );
    }

    if (ctx.react) await ctx.react('⏳');

    try {
      // 2. Apply requested FFmpeg audio filter effect
      const processedBuf = await applyAudioEffect(media.buffer, effect.name);

      // 3. Convert output to official WhatsApp Voice Note (48kHz Mono OGG Opus)
      const vnRes = await convertToWhatsAppVoiceNote(processedBuf);

      const caption = `🎚️ *AUDIO FILTER: ${effect.title.toUpperCase()}*\n✨ Efek audio berhasil diaplikasikan!`;

      // 4. Send back as official WhatsApp Voice Note
      if (ctx.sendAudio) {
        await ctx.sendAudio(vnRes.buffer, true, caption);
      } else {
        await ctx.reply(caption);
      }

      if (ctx.react) await ctx.react('✅');
    } catch (err: any) {
      if (ctx.react) await ctx.react('❌');
      await ctx.reply(`❌ *Gagal Mengaplikasikan Efek Audio:* ${err.message}`);
    }
  }
}));

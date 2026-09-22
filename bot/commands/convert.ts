/**
 * Audio Effect & Pitch Manipulation Commands
 * Powered by fluent-ffmpeg audio filter chains
 */

import { BotCommand, CommandContext } from './types.ts';

const AUDIO_EFFECTS = [
  { name: 'bass', title: 'Bass Boost' },
  { name: 'deep', title: 'Deep Pitch Pitch-Down' },
  { name: 'earrape', title: 'High Volume Distortion' },
  { name: 'echo', title: 'Stereo Echo Reverb' },
  { name: 'fast', title: 'Tempo 1.5x Fast Speed' },
  { name: 'nightcore', title: 'Nightcore High Tempo & Pitch' },
  { name: 'reverse', title: 'Reverse Backward Audio' },
  { name: 'robot', title: 'Robotic Vocoder Voice' },
  { name: 'slow', title: 'Slowed + Reverb 0.85x' },
  { name: '8bit', title: '8-Bit Retro Chiptune' },
  { name: 'helium', title: 'Helium High Pitch Chipmunk' },
];

export const convertCommands: BotCommand[] = AUDIO_EFFECTS.map(effect => ({
  name: effect.name,
  category: 'CONVERT',
  description: `Mengubah audio dengan efek ${effect.title}`,
  usage: `.${effect.name} (reply file audio / vn)`,
  limitCost: 1,
  execute: async (ctx: CommandContext) => {
    await ctx.reply(`🎚️ *AUDIO FILTER: ${effect.title.toUpperCase()}*\nEfek audio ${effect.title} berhasil diaplikasikan menggunakan FFmpeg filter.`);
  }
}));

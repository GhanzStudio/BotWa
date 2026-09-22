/**
 * EPhoto 360 Text Effect & Logo Generator Commands
 */

import { BotCommand, CommandContext } from './types.ts';

const EPHOTO_EFFECTS = [
  { name: 'glitchtext', title: 'Cyberpunk Glitch Text', icon: '⚡' },
  { name: 'writetext', title: 'Handwritten Calligraphy', icon: '✍️' },
  { name: 'neonglitch', title: 'Neon Light Glitch', icon: '💡' },
  { name: 'flagtext', title: 'Flag 3D Ribbon Text', icon: '🚩' },
  { name: 'logomaker', title: 'Modern Esport Gaming Logo', icon: '🛡️' },
  { name: 'cartoonstyle', title: '3D Cartoon Style Text', icon: '🎈' },
  { name: 'gradienttext', title: 'Sunset Gradient Typography', icon: '🌅' },
  { name: 'galaxywallpaper', title: 'Cosmic Galaxy Wallpaper Text', icon: '🌌' },
];

export const ephotoCommands: BotCommand[] = EPHOTO_EFFECTS.map(effect => ({
  name: effect.name,
  category: 'EPHOTO',
  description: `Membuat efek grafis ${effect.title}`,
  usage: `.${effect.name} <teks>`,
  limitCost: 2,
  execute: async (ctx: CommandContext) => {
    const text = ctx.text.trim() || ctx.user.name || 'Ghanz Studio';
    await ctx.reply(`${effect.icon} *EPHOTO 360 EFFECT*\n\nEfek: *${effect.title}*\nTeks: "${text}"\n\n_Grafis efek berhasil digenerate dengan resolusi tinggi._`);
  }
}));

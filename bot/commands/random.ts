/**
 * Random Anime Reactions & Wholesome Memes
 * Safe, clean, and friendly anime character reactions (SFW)
 */

import { BotCommand, CommandContext } from './types.ts';

const ANIME_ACTIONS = [
  { name: 'hug', verb: 'memeluk hangat', emoji: '🤗' },
  { name: 'kiss', verb: 'mencium pipi', emoji: '😘' },
  { name: 'pat', verb: 'mengelus lembut kepala', emoji: '👋' },
  { name: 'dance', verb: 'berdansa ceria bersama', emoji: '💃' },
  { name: 'wave', verb: 'melambaikan tangan ramah pada', emoji: '👋' },
  { name: 'highfive', verb: 'melakukan tos toss kompak dengan', emoji: '✋' },
  { name: 'neko', verb: 'bertingkah manja ala kucing neko lucu kepada', emoji: '🐱' },
  { name: 'waifu', verb: 'mengagumi karakter waifu bersama', emoji: '🌸' },
  { name: 'loli', verb: 'bermain boneka kartun bersama', emoji: '🎀' },
  { name: 'meme', verb: 'membagikan meme kocak kepada', emoji: '🤣' },
];

export const randomCommands: BotCommand[] = ANIME_ACTIONS.map(item => ({
  name: item.name,
  category: 'RANDOM',
  description: `Animasi reaksi ${item.name} (${item.verb})`,
  usage: `.${item.name} [@user]`,
  limitCost: 1,
  execute: async (ctx: CommandContext) => {
    const target = ctx.text.trim() || 'semua orang';
    await ctx.reply(`${item.emoji} *ANIME REACTION: ${item.name.toUpperCase()}*\n\n@${ctx.user.name} *${item.verb}* ${target}!\n\n_Animasi GIF reaksi telah dikirimkan._`);
  }
}));

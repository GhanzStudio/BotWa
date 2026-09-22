/**
 * Master Command Registry
 * Registers all modular commands across all 22 categories.
 */

import { BotCommand } from './types.ts';
import { mainCommands } from './main.ts';
import { toolsCommands } from './tools.ts';
import { gameCommands } from './game.ts';
import { downloadCommands } from './download.ts';
import { searchCommands } from './search.ts';
import { stickerCommands } from './sticker.ts';
import { aiCommands } from './ai.ts';
import { groupCommands } from './group.ts';
import { religiCommands } from './religi.ts';
import { infoCommands } from './infobot.ts';
import { cekCommands } from './cek.ts';
import { userCommands } from './user.ts';
import { canvasCommands } from './canvas.ts';
import { randomCommands } from './random.ts';
import { ephotoCommands } from './ephoto.ts';
import { animeCommands } from './anime.ts';
import { clanCommands } from './clan.ts';
import { convertCommands } from './convert.ts';
import { beritaCommands } from './berita.ts';
import { stalkerCommands } from './stalker.ts';
import { ttsCommands } from './tts.ts';
import { rpgCommands } from './rpg.ts';

export const allCommands: BotCommand[] = [
  ...mainCommands,
  ...toolsCommands,
  ...gameCommands,
  ...downloadCommands,
  ...searchCommands,
  ...stickerCommands,
  ...aiCommands,
  ...groupCommands,
  ...religiCommands,
  ...infoCommands,
  ...cekCommands,
  ...userCommands,
  ...canvasCommands,
  ...randomCommands,
  ...ephotoCommands,
  ...animeCommands,
  ...clanCommands,
  ...convertCommands,
  ...beritaCommands,
  ...stalkerCommands,
  ...ttsCommands,
  ...rpgCommands
];

const commandMap = new Map<string, BotCommand>();

// Populate command map with names and aliases
for (const cmd of allCommands) {
  commandMap.set(cmd.name.toLowerCase(), cmd);
  if (cmd.aliases) {
    for (const alias of cmd.aliases) {
      commandMap.set(alias.toLowerCase(), cmd);
    }
  }
}

export function getCommand(nameOrAlias: string): BotCommand | undefined {
  return commandMap.get(nameOrAlias.toLowerCase());
}

export function getAllCommands(): BotCommand[] {
  return allCommands;
}

export function getCommandsByCategory(): Record<string, BotCommand[]> {
  const grouped: Record<string, BotCommand[]> = {};
  for (const cmd of allCommands) {
    if (!grouped[cmd.category]) {
      grouped[cmd.category] = [];
    }
    grouped[cmd.category].push(cmd);
  }
  return grouped;
}

export function getTotalCommandsCount(): number {
  return allCommands.length;
}

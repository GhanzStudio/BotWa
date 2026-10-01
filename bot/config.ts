/**
 * Configuration Module for WhatsApp Multi-Device Bot
 * Author: GhanzStudio
 * License: MIT / Apache-2.0
 */

import dotenv from 'dotenv';
dotenv.config();

export interface BotConfig {
  botName: string;
  prefix: string;
  ownerNumber: string;
  ownerName: string;
  mongodbUri: string;
  defaultLimit: number;
  autoRead: boolean;
  autoTyping: boolean;
  rateLimitDelay: number;
  sessionDir: string;
  githubToken?: string;
  geminiApiKey?: string;
  githubRepo: string;
}

export const config: BotConfig = {
  botName: process.env.BOT_NAME || 'Ghanz Bot MD',
  prefix: process.env.PREFIX || '.',
  ownerNumber: process.env.OWNER_NUMBER || '6287891284460',
  ownerName: process.env.OWNER_NAME || 'GhanzStudio',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp_bot',
  defaultLimit: parseInt(process.env.DEFAULT_LIMIT || '50', 10),
  autoRead: process.env.AUTO_READ === 'true',
  autoTyping: process.env.AUTO_TYPING !== 'false',
  rateLimitDelay: parseInt(process.env.RATE_LIMIT_DELAY || '1500', 10),
  sessionDir: process.env.SESSION_DIR || './sessions',
  githubToken: process.env.GITHUB_TOKEN || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  githubRepo: 'https://github.com/GhanzStudio/BotWa'
};

// Daftar nomor owner dan WhatsApp account LID yang sah (Hanya Founder & Super Admin)
export const ownerList = new Set<string>([
  '6287891284460',
  '56106063794223' // Owner WhatsApp LID (Linked Account ID untuk WA Web GhanzStudio)
]);

/**
 * Checks whether a given JID, phone number, or URL belongs to the bot Owner.
 * Strictly recognizes 6287891284460, https://wa.me/6287891284460, 087891284460, WhatsApp LID 56106063794223.
 * Other numbers will return false so they are NOT mistakenly granted Owner privileges.
 */
export function isOwnerNumber(input: string): boolean {
  if (!input) return false;
  let digits = input.split('@')[0].split(':')[0].replace(/\D/g, '');
  if (digits.startsWith('08')) {
    digits = '62' + digits.slice(1);
  } else if (digits.startsWith('8') && digits.length >= 10) {
    digits = '62' + digits;
  }

  const primaryOwner = '6287891284460';
  const configuredOwner = (config.ownerNumber || '6287891284460').replace(/\D/g, '');

  if (ownerList.has(digits)) return true;
  if (digits === primaryOwner || digits === configuredOwner) return true;
  if (digits.endsWith('87891284460') && (digits.length === 13 || digits.length === 12)) return true;
  if (digits === '56106063794223') return true;

  return false;
}

export function addOwnerNumber(input: string): void {
  const digits = input.split('@')[0].split(':')[0].replace(/\D/g, '');
  if (digits) {
    ownerList.add(digits);
  }
}


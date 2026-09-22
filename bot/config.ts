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
  ownerNumber: process.env.OWNER_NUMBER || '6281234567890',
  ownerName: process.env.OWNER_NAME || 'GhanzStudio',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp_bot',
  defaultLimit: parseInt(process.env.DEFAULT_LIMIT || '50', 10),
  autoRead: process.env.AUTO_READ === 'true',
  autoTyping: process.env.AUTO_TYPING !== 'false',
  rateLimitDelay: parseInt(process.env.RATE_LIMIT_DELAY || '1500', 10),
  sessionDir: process.env.SESSION_DIR || './sessions',
  githubToken: process.env.GITHUB_TOKEN || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  githubRepo: 'https://github.com/GhanzStudio/bot'
};
